---
title: "Inertia o SPA con API en Laravel: cuándo usar cada uno"
description: "Cuándo Laravel con Inertia y React conviene más que una SPA con API separada, cuándo no, y cómo dos apps en producción usan ambos sin duplicar lógica."
published: "2026-09-30"
translations: {"en": "laravel-inertia-vs-spa-api"}
---

Elegir entre Inertia o una SPA con API separada en Laravel depende, sobre todo, de quiénes son tus clientes. Si el único cliente es tu propia aplicación web, Laravel con Inertia y React te da una single-page app sin construir, versionar ni asegurar una API para ella. Si además tienes una app móvil, integraciones de terceros o un asistente de IA que se conecta, vas a necesitar una API de todos modos, y la pregunta útil pasa a ser qué partes del sistema deben quedar detrás de ella.

Tomé esa decisión dos veces en producción. [Criptala](/es/work/criptala/), una plataforma de trading y pagos en cripto, tiene su web en Inertia y React y además expone APIs JSON versionadas para una app móvil y para integraciones públicas. [Contamos](/es/work/contamos/), un libro contable compartido multimoneda, es solo Inertia y React, con un servidor MCP como segundo cliente. Los dos mantienen una sola copia de la lógica de negocio. Este artículo explica cómo.

## Qué es Inertia, en concreto

Inertia no es un framework. Es un protocolo entre un router del lado del servidor y un renderizador del lado del cliente. Un controlador de Laravel devuelve `Inertia::render('page/name', $props)` en lugar de una vista Blade. En la primera petición el navegador recibe HTML; después, los enlaces y formularios hacen peticiones XHR, y el servidor responde con JSON que indica el componente de página y sus props. React cambia la página sin recargar.

Lo que dejas de tener es la capa de API entre el frontend y el backend, y justamente de eso se trata:

- **El routing se queda en Laravel.** No hay un router en el cliente que mantener sincronizado con las rutas del servidor.
- **La autenticación es la sesión.** Nada de tokens en local storage, ni flujo de refresh, ni CORS. Los middleware, las policies y `auth()` funcionan como en cualquier app de Laravel.
- **Los errores de validación vuelven solos.** Un form request que falla redirige atrás, e Inertia pone los errores en las props de la página. El formulario los muestra sin una capa que traduzca errores.
- **El estado vive en el servidor.** Las props de una página son lo que el controlador decidió que el usuario debe ver, calculado con las mismas consultas y policies que todo lo demás.

## Por qué uso Inertia por defecto para la web

Lo caro de una SPA separada rara vez es el código de React. Es la segunda aplicación que terminas manteniendo: una copia en el cliente de tus rutas, tus reglas de permisos, tu validación, y una caché del estado del servidor que hay que invalidar bien. Cada una de esas piezas es un lugar donde el frontend y el backend pueden no estar de acuerdo, y en un sistema que mueve dinero, ese desacuerdo es un bug que un usuario va a encontrar antes que tú.

Con Inertia, el servidor sigue siendo la única fuente de verdad, y React es una capa de presentación encima. Esa es la propiedad que más me importa, y se cumple en los dos proyectos.

### Las shared props llevan lo que toda página necesita

Contamos comparte un conjunto pequeño de props con todas las páginas desde un solo middleware: el usuario autenticado, el idioma, el esquema de color, el avance del onboarding y lo que el usuario puede hacer en el equipo actual.

```php
public function share(Request $request): array
{
    return [
        ...parent::share($request),

        'locale' => fn (): string => App::currentLocale(),

        // What the user may do on their current team, so the
        // layout and the pages gate actions the same way the
        // server does.
        'permissions' => fn (): array => $this->permissions($request),

        'user' => Inertia::always($user),
    ];
}
```

La prop de permisos es lo que más extrañaría en una SPA. El servidor la calcula con las mismas reglas que aplica, así que un botón que el usuario no puede usar se oculta, y una petición que no puede hacer igual se rechaza. No pueden desincronizarse porque hay una sola definición.

### Rutas tipadas con Wayfinder

Una objeción común a Inertia es que el frontend arma URLs a partir de strings. Los dos proyectos usan [Laravel Wayfinder](https://github.com/laravel/wayfinder), que genera funciones de TypeScript a partir de tus rutas y controladores. Un formulario en Contamos se ve así:

```tsx
import teams from "@/routes/identity/teams";

<Form {...teams.store.form()} disableWhileProcessing>
    {({ errors, processing }) => (
        // campos, con errors.name junto al input
    )}
</Form>
```

`teams.store.form()` le da al formulario su método y su URL. Si renombras la ruta o cambias sus parámetros, el build de TypeScript falla. Es el contrato tipado que una SPA obtiene de una especificación OpenAPI, sin escribir ni mantener la especificación.

### Mensajes flash como canal del servidor al cliente

Los datos flash de Inertia resultan ser una forma limpia de que el servidor le avise al cliente que algo pasó. En Contamos, una escritura que se puede deshacer muestra un toast con la acción de deshacer, y el cliente solo lo dibuja. El servidor decide qué se puede deshacer y cómo; el código de React no lo sabe.

### SSR cuando importa el primer render

Contamos renderiza las páginas en el servidor con el SSR de Inertia, así que las páginas públicas llegan como HTML completo para los buscadores y para el primer render. Criptala tiene el SSR detrás de una variable de entorno, apagado por defecto. Con Inertia el SSR es opcional, y se puede activar después sin reescribir las páginas.

## Cuándo conviene una SPA con API separada

Inertia es la herramienta equivocada cuando la web es un cliente entre varios, y los demás también los tienes que mantener tú:

- **Una app móvil nativa.** No puede usar un protocolo basado en cookies de sesión pensado para el navegador, y necesita versionado, porque las versiones viejas de la app siguen instaladas durante meses.
- **Terceros.** Quien se integra contigo necesita un contrato documentado y estable que sobreviva a tus rediseños.
- **Un equipo de frontend separado** que publica con su propio ciclo y quiere ser dueño del cliente de punta a punta.
- **Mucho estado en el cliente**, como edición offline-first o una pantalla de trading en tiempo real, donde la mayor parte del estado realmente pertenece al cliente.

Nada de eso obliga a poner tu propia web detrás de la misma API. Esa es la decisión que sigo tomando.

## Inertia y una API en la misma app de Laravel

Criptala tiene las dos cosas. La web es Inertia y React. Al lado, la misma aplicación de Laravel sirve una API móvil versionada para la app en React Native, una API pública versionada y los endpoints de webhooks. Son archivos de rutas separados, cada uno con sus middleware. La API móvil, por ejemplo, tiene su propia autenticación y su propio manejo de peticiones, y nada de eso corresponde al flujo de sesión de la web.

Lo que evita que esto se convierta en dos backends es que los controladores son delgados y el dominio es compartido. El cálculo de cotización de una operación es una sola clase de acción. El checkout web, el endpoint de cotización móvil y la API pública la llaman, y cada uno envuelve el resultado en su propio formato: props de Inertia para la web, JSON para las APIs móvil y pública.

```
Controlador Inertia    ─┐
Controlador Mobile v1  ├──▶  CalculateRatesAction  ──▶  modelos, reglas, base de datos
Controlador Public v1  ─┘
```

La capa de API es entonces lo que debería ser: una traducción del dominio a un contrato externo estable, versionado para clientes que no controlas, y no un canal privado del que depende tu propia interfaz.

## Un segundo cliente sin API: MCP

Contamos no tiene API REST, pero sí un segundo cliente. Su [servidor MCP remoto](/es/blog/servidor-mcp-remoto-laravel/) permite que Claude o ChatGPT lean y escriban el libro contable de un usuario, y sigue la misma regla. La herramienta MCP que borra un movimiento llama a la misma acción que el controlador web:

```php
// Web: TransactionController::destroy
$deleteTransaction->for($team)->using($transaction);
Toast::make(trans('Deleted'))->flash();
return back();

// MCP: herramienta DeleteTransaction
$deleteTransaction->for($team)->using($transaction);
return Response::structured(['deleted' => true, 'id' => $transaction->getKey()]);
```

La acción revierte el saldo, registra la actividad y aplica las reglas. El controlador responde con una redirección y un toast; la herramienta responde con datos estructurados. Ninguno reimplementa nada. Si algún día Contamos tiene una app móvil, recibirá un tercer grupo de controladores delgados sobre las mismas acciones, no una reescritura de la web.

## Inertia o SPA: una guía corta para decidir

| Tu situación | Lo que yo construiría |
|---|---|
| Una web, un equipo, backend en Laravel | Inertia + React |
| Web más una app móvil nativa | Inertia para la web, API versionada para el móvil, acciones compartidas |
| Integraciones de terceros o públicas | Inertia para la web, API pública con su propio versionado |
| Asistentes de IA que actúan por el usuario | Inertia para la web, servidor MCP sobre las mismas acciones |
| Equipo de frontend separado, releases independientes | SPA + API |
| Offline-first o estado mayormente en el cliente | SPA + API, posiblemente con sincronización |

## Los costos de Inertia que conviene conocer

No es gratis. El frontend queda acoplado a Laravel: llevar la interfaz a otro backend después implica reescribir la capa de datos. Las props se piden en cada visita, así que una página que consulta periódicamente o recibe datos en streaming necesita sus propios endpoints, o usar con cuidado las recargas parciales de Inertia. Cada prop que envías es visible en el código de la página, así que las props deben armarse pensando en el usuario, nunca como un volcado de un modelo. Y un equipo móvil no puede reutilizar nada de eso; recibe la API que construyas para él.

Nada de esto afectó a ninguno de los dos proyectos, porque la decisión nunca fue "Inertia en lugar de una API". Fue Inertia para la web, una API o un servidor MCP donde existe un cliente externo real, y un solo conjunto de acciones debajo de todos.

## Conclusión

Para una app de Laravel cuyo cliente principal es su propia interfaz web, Inertia y React te dan una single-page app con el estado en el servidor, autenticación por sesión, errores de validación automáticos y rutas tipadas, sin una API privada que mantener. Agrega una API cuando aparezca un cliente que no pueda usar la sesión: una app móvil, un tercero, un asistente. Mantén la lógica de negocio en acciones que llame cada punto de entrada, y la elección entre Inertia y una API deja de ser todo o nada.
