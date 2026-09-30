---
title: "Cómo construí un SaaS solo en cuatro semanas"
description: "El stack detrás de Contamos, un SaaS hecho por una sola persona: Laravel, login, cobros y hosting gestionados, límites de plan centralizados y tests."
published: "2026-10-06"
translations: {"en": "shipping-a-saas-alone-in-four-weeks"}
---

Construí [Contamos](/es/work/contamos/), un libro compartido para dinero en varias monedas, en solitario. El primer commit tiene fecha del 29 de agosto de 2026; unas cuatro semanas después estaba en producción en contamos.xyz, en dos idiomas, con un plan gratuito, uno pago, cobros y un servidor MCP remoto para que Claude o ChatGPT lean y registren movimientos.

Si estás pensando en crear un SaaS solo, la pregunta importante no es qué framework se escribe más rápido. Es qué decisiones puedes evitar tener que operar. Cada sistema que corres tú mismo es un sistema por el que te pueden despertar. Lo que sigue es el stack que elegí y, sobre todo, por qué.

## La única regla: nada que tenga que operar yo

Una persona construye, mantiene y da soporte a Contamos. Esa restricción decidió casi todo. No me pregunté "¿cuál es la mejor herramienta de autenticación?", sino "¿cuál es la versión de la autenticación en la que nunca tengo que pensar a las tres de la mañana?".

De esa regla salieron tres compras:

| Tema | Servicio | Qué me saca de encima |
| --- | --- | --- |
| Hosting | Laravel Cloud | Servidores, scripts de deploy, escalado, TLS |
| Login | WorkOS AuthKit | Guardar contraseñas, recuperaciones, login social, sesiones, OAuth para el servidor MCP |
| Cobros | Paddle | Pagos, facturas e impuestos, como merchant of record |

Cada uno cuesta dinero o margen. Cada uno sale más barato que las horas que reemplaza y, sobre todo, ninguno me manda alertas a mí.

### Hosting: un deploy hook y nada más

Producción corre en Laravel Cloud. El workflow de deploy del repositorio es corto: rechaza cualquier rama que no sea `main`, rechaza cualquier commit cuyos tests no hayan pasado y después llama al deploy hook del entorno. No hay ningún servidor al que tenga que entrar por SSH.

### Login: que las contraseñas las guarde otro

El inicio de sesión lo resuelve WorkOS AuthKit. La aplicación nunca guarda una contraseña. Esto se pagó solo una segunda vez cuando armé el servidor MCP: los asistentes de IA necesitan OAuth para conectarse en nombre de un usuario, y AuthKit también es el servidor de autorización para eso. Contamos solo tiene que verificar los tokens que emite. Lo cuento en detalle en [cómo armar un servidor MCP remoto en Laravel](/es/blog/servidor-mcp-remoto-laravel/).

### Cobros: un merchant of record, no una pasarela de pagos

La diferencia pesa más de lo que parece. Una pasarela de pagos mueve el dinero y te deja a ti el cumplimiento fiscal. Un merchant of record vende el producto en tu nombre, así que cobrar y declarar el IVA y los impuestos a las ventas de cada país pasa a ser problema suyo. Para alguien que vende solo, desde Uruguay, a cualquier país, es la única opción razonable. Paddle es el merchant of record, y Laravel Cashier para Paddle conecta el estado de la suscripción con la app.

## Un monolito modular, no microservicios

El código es una sola aplicación Laravel dividida en módulos dentro de `app/Modules`: `Core` (con `Identity`, `Finance` y `Catalog` adentro), `Billing`, `Authentication`, `Administration`, `Marketing`, `Mcp` y `Support`. Cada módulo tiene sus rutas, modelos, acciones y providers.

Un monolito es la forma correcta para una sola persona porque todo el sistema entra en una cabeza y en un deploy. Los módulos dan casi todo lo que la gente busca en los microservicios, que son límites visibles, sin la red en el medio. Cuando el servidor MCP llegó al final del desarrollo, fue un módulo nuevo que llama a las mismas acciones que ya usan los controladores web. Borrar un movimiento desde Claude ejecuta la misma acción `DeleteTransaction` que borrarlo desde el navegador.

El frontend es React con Inertia, así que no hay una API aparte que diseñar y versionar para la web. Filament me da el panel de administración gratis. El stack completo: Laravel 13, Inertia, React 19, Filament y Tailwind CSS.

## Los límites de cada plan, declarados una sola vez

La lógica de precios es donde los SaaS de una sola persona se pudren en silencio. El límite vive en un controlador, una copia en la página de precios, otra en un email, y en algún momento dejan de coincidir.

En Contamos cada funcionalidad limitada por plan es una clase de [Laravel Pennant](https://laravel.com/docs/pennant) que conoce su propio límite y sabe medir el uso:

```php
#[Name('accounts:create')]
class AddAccounts
{
    public function resolve(Team $team): bool
    {
        return ($limit = $this->limitOn($team->plan())) === null
            || $this->usage($team) < $limit;
    }

    public function limitOn(Plan $plan): ?int
    {
        return match ($plan) {
            Plan::Free => 3,
            Plan::Pro => null,
        };
    }

    public function usage(Team $team): int
    {
        return $team->accounts()->isActive()->count();
    }
}
```

Un enum `Feature` las enumera todas. Las rutas web se protegen con el middleware `EnsureFeaturesAreActive` de Pennant, las herramientas MCP llaman al mismo chequeo y la página de precios lee sus números del mismo enum. Cambiar el límite de cuentas del plan gratuito es cambiar una línea, y la app, la API y la página de marketing se mueven juntas.

No me salió bien la primera vez. El historial de git muestra la primera versión del módulo de cobros escrita y arrancada el mismo día. Salió barato, porque era el día nueve y nadie estaba pagando todavía.

## Los tests son el contrato

Trabajando solo, no hay quien revise. Trabajando con agentes de IA que escriben buena parte del código, hay un revisor seguro de sí mismo y a veces equivocado. En los dos casos, lo que decide si un cambio es correcto son los tests.

Contamos tiene más de 1.500 tests escritos con Pest. La integración continua los corre en paralelo junto con Rector, Pint y PHPStan en nivel `max`, y el workflow de deploy no publica un commit cuyos tests no pasaron. También hay scripts para exigir 100 % de cobertura de código y 100 % de cobertura de tipos.

Parece burocracia. En la práctica es lo que me dejó avanzar rápido sin romper nada que tocara dinero. Sigue siendo un libro contable: los montos son decimales exactos, nunca floats, y borrar un movimiento tiene que devolver el saldo exactamente adonde estaba. Son propiedades que no puedo verificar a ojo a lo largo de cientos de cambios, pero un test sí las verifica en cada commit.

## IA dentro del proceso, con reglas

Buena parte de Contamos se escribió con agentes de IA. Lo que hizo que funcionara no fue el modelo sino el contexto alrededor. El repositorio tiene un `AGENTS.md` con las reglas del proyecto, Laravel Boost le da a los agentes documentación de la versión exacta de cada paquete instalado, y el código se apoya en interfaces tipadas y tipos estrictos para que una suposición equivocada falle de forma visible.

El efecto práctico es que escribir código dejó de ser el cuello de botella. El trabajo pasó a ser decidir qué construir y juzgar si lo que volvió está bien. Lo desarrollo en [Claude Code en un proyecto real](/es/blog/claude-code-en-un-proyecto-real/).

## Lo que le diría a otra persona que va a construir un SaaS sola

- **Compra todo lo que pueda despertarte.** Hosting, login y cobros son problemas resueltos. Tu producto no.
- **Usa un merchant of record** si vendes al exterior desde un país pequeño. El cumplimiento fiscal no es un proyecto de fin de semana.
- **Quédate en un monolito.** Usa módulos para marcar límites. Un salto de red no es un límite que necesites todavía.
- **Pon los límites de los planes en un solo lugar** y haz que todo lea de ahí.
- **Escribe los tests antes de necesitarlos.** Trabajando solo, son el único revisor que nunca se cansa.
- **Construye lo más pequeño que sea honesto.** El plan gratuito tenía que ser útil de verdad y el pago tenía que valer lo que cuesta, y eso mantuvo el alcance acotado desde el principio.

## Cuatro semanas son una consecuencia, no un objetivo

Nunca me puse cuatro semanas como meta. Es lo que pasa cuando la mayoría de los problemas difíciles y aburridos se compran en vez de construirse, el código entra en una sola cabeza y los tests atrapan lo que a mí se me escaparía. El contexto completo, las restricciones y el resultado están en el [caso de Contamos](/es/work/contamos/).
