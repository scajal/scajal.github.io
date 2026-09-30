---
title: "Cómo usar Claude Code en un proyecto real"
description: "Cómo configuro Claude Code en una app Laravel en producción: CLAUDE.md corto, reglas por ruta, skills, tipos estrictos y tests como contrato de cada cambio."
published: "2026-10-22"
translations: {"en": "claude-code-on-a-real-codebase"}
---

Usar Claude Code en un proyecto real depende menos de los prompts que del repositorio. El modelo lee lo que el proyecto le da: el archivo de reglas, las convenciones de los archivos vecinos, los tipos, los tests. Cuando eso está claro, el agente escribe código que encaja. Cuando falta, ningún prompt ingenioso lo compensa.

Esa es la versión corta de cómo construí [Contamos](/es/work/contamos/), un libro compartido multimoneda, solo y [en unas cuatro semanas desde el primer commit hasta producción](/es/blog/lanzar-un-saas-solo-en-cuatro-semanas/). Claude Code estuvo en el circuito desde el primer commit, que ya incluía las instrucciones para los agentes. Lo que hizo que eso fuera seguro no fue el modelo, sino el contexto a su alrededor. Este artículo recorre esa configuración, pieza por pieza, con ejemplos reales de ese repositorio.

## Qué va en CLAUDE.md y qué queda afuera

`CLAUDE.md` es el archivo que Claude Code carga al inicio de cada sesión. La mayoría de los ejemplos que circulan lo usan como depósito de todo lo que el agente podría necesitar. Eso lo vuelve largo, y un archivo de reglas largo es un archivo que el modelo lee por encima.

En Contamos, `CLAUDE.md` y `AGENTS.md` son el mismo archivo, así que todos los agentes leen las mismas instrucciones. Casi todo lo genera Laravel Boost, y contiene solo lo que aplica en todas partes:

- **Contexto base.** La versión de PHP, y la instrucción de verificar la versión instalada de cada paquete antes de apoyarse en su API, en lugar de suponerla.
- **Convenciones.** Seguir la estructura y los nombres de los archivos vecinos. Reutilizar componentes antes de escribir uno nuevo.
- **Límites.** No cambiar las dependencias sin aprobación. No crear carpetas base nuevas sin aprobación.
- **Tests obligatorios.** Agregar o actualizar tests cuando cambia el comportamiento, correr los afectados, y no agregar tests más allá de eso.

Todo lo que es específico de una parte del código vive en otro lado.

Una prueba útil para cada línea de `CLAUDE.md`: ¿es cierta para todos los archivos del repositorio? Si no, va más cerca del código que gobierna.

## Las decisiones, al lado del código que gobiernan

La segunda capa es un directorio de reglas por ruta, `.ai/rules`, con un índice que asocia patrones de archivos a archivos de reglas. Antes de editar un archivo, el agente lee las filas cuyos patrones coinciden con su ruta. En Contamos hay unos cincuenta, y cada uno es corto.

Una regla se ve así, en la que aplica a las herramientas MCP:

```markdown
---
paths:
  - 'app/Modules/Mcp/Tools/**'
---

# Tools

## Money is bcmath on strings
Carry amounts as decimal strings and compute or compare them with
bcadd/bcsub/bcmul/bcdiv/bccomp at an explicit SCALE of 18. Never use
floats, round() or number_format for money.
```

Es decir: los montos viajan como strings decimales y se calculan con bcmath, nunca con floats. Y esta, para las Actions del dominio:

```markdown
## Name write Actions Create or Update
Name transactional write Actions `Create{Resource}` or `Update{Resource}`.
Do not use `Store`, `Save`, or `Handle` prefixes for those writes.
```

Hay tres cosas que hacen que esta capa funcione.

**Las reglas son decisiones tomadas, no deseos.** Cada una registra una elección que ya se hizo y que no es obvia leyendo el código: una trampa, una convención de nombres, una restricción. "Escribir código limpio" no es una regla.

**Las reglas tienen alcance.** Una regla sobre paneles de Filament nunca se carga cuando el agente está editando una migración. El contexto es finito, y lo que no tiene que ver con la tarea es ruido.

**Las reglas se registran a propósito.** Las instrucciones del proyecto lo dicen explícitamente: las indicaciones para el trabajo en curso no son reglas, por más enfáticas que sean. Si le digo al agente "usa X aquí", eso es trabajo. Una regla se escribe solo cuando la pido. Sin esa línea, el agente convierte cada corrección en una regla permanente y el directorio se llena de contradicciones.

## Skills: procedimientos, no hechos

Las reglas dicen qué es cierto. Las skills dicen cómo hacer algo. Claude Code carga una skill cuando su descripción coincide con la tarea, así que no ocupa contexto hasta que se necesita.

Contamos tiene unas cuarenta en `.agents/skills`, donde las lee cualquier agente, enlazadas en `.claude/skills` para Claude Code. Alrededor de una docena vienen con Laravel Boost y cubren los paquetes que usa la app: Cashier Paddle, Pennant, Inertia, MCP, testing. El resto son de proceso, como `code-review` y `to-spec`, se instalan con la CLI `skills` y quedan fijadas en `skills-lock.json` con un hash de cada archivo. Así, una actualización es un cambio visible en un diff y no algo que pasa en silencio.

La distinción importa porque mantiene chicas las dos capas. Una regla que empieza a parecer un tutorial probablemente sea una skill.

## Tipos estrictos: que el código incorrecto falle temprano

Un agente produce código plausible muy rápido. El código plausible pero sutilmente incorrecto es el caro. El lugar más barato para atraparlo es antes de que corra un test.

Contamos corre PHPStan en `level: max` sobre `app/`, con Larastan. Los payloads en arrays llevan anotaciones de forma, así que un handler de webhook declara exactamente qué lee:

```php
/**
 * @param  array{data: array{id: string, status: string, canceled_at: string}}  $payload
 */
protected function handleSubscriptionCanceled(array $payload): void
```

En el frontend, los tipos de TypeScript reflejan el JSON que manda el servidor. Pint y Rector vuelven mecánicos el formato y la modernización del código, así la revisión no gasta atención en estilo. Un solo script de Composer, `ci:check`, corre los chequeos del frontend, el chequeo de tipos y la suite de tests, y el mismo comando corre en CI.

Nada de esto es específico de la IA. Un código legible para un ingeniero nuevo es legible para un modelo por las mismas razones. La diferencia es el volumen: un agente escribe más código por hora que una persona, así que los chequeos corren mucho más seguido y se pagan antes.

## Los tests son el contrato

La suite de tests es cómo decido si un cambio es correcto, no si parece correcto. Contamos tiene más de 1.500 tests en Pest, y CI los corre en paralelo en cada push a main y en cada pull request.

Dos hábitos hacen que los tests sirvan como contrato con un agente:

- **Testear el comportamiento y sus modos de falla.** Para una transferencia entre cuentas: los saldos de ambos lados, el tipo de cambio registrado, qué pasa si el origen no tiene fondos, qué pasa si el usuario no tiene permiso. No el método privado que formatea el monto.
- **No dejar que el agente se corrija a sí mismo.** Cuando un cambio toca dinero, permisos o la forma de los datos, leo primero los tests. Si los tests están mal, que la implementación los pase no significa nada.

Un test que falla también es el mejor prompt que existe. "Haz que pase sin cambiar el test" es más preciso que un párrafo de descripción.

## Escribir la especificación antes del prompt

Para cualquier cosa más grande que un arreglo chico, escribo qué tiene que hacer el cambio antes de que exista código: el comportamiento, los casos borde, lo que queda afuera. A veces son unos pocos puntos. Para funcionalidades más grandes, la skill `to-spec` convierte la conversación en un issue.

La especificación cumple dos funciones. Obliga a decidir qué vale la pena construir, que es la parte que ningún agente puede hacer por mí. Y le da a la revisión algo contra qué comparar. Sin especificación, revisar un diff se vuelve una cuestión de gusto.

## Dónde la revisión sigue siendo humana

La IA mueve el cuello de botella de escribir código a juzgarlo. Hay cosas que reviso siempre línea por línea, venga de donde venga el código:

- **Dinero.** Todo lo que calcula, guarda o convierte un monto.
- **Permisos y multi-tenancy.** Quién puede ver o cambiar qué, y si una consulta puede cruzar de un equipo a otro.
- **Migraciones.** Los cambios de esquema son lo más difícil de deshacer en producción.
- **Las reglas mismas.** Una regla mala es peor que una función mala, porque se repite.

Todo lo demás también se lee, pero con los tests y el chequeo de tipos habiendo hecho la primera pasada.

## Una configuración mínima para empezar

Si vas a empezar con Claude Code en un proyecto existente, este orden da el mayor resultado con el menor esfuerzo:

1. Un `CLAUDE.md` corto: versiones, convenciones, límites, cómo correr los tests. Solo lo que es cierto en todas partes.
2. El chequeo de tipos más estricto que el código pueda pasar hoy, y subirlo con el tiempo.
3. Un solo comando que corra todo lo que corre CI.
4. Reglas por ruta para las trampas que se terminan corrigiendo a mano una y otra vez.
5. Skills para los procedimientos repetidos, fijadas a una versión.
6. Una especificación, aunque sea corta, antes de cualquier cosa no trivial.

Casi todo ese trabajo consiste en que el sistema se explique a sí mismo. Vale la pena hacerlo lo lea un modelo o no, y es la razón por la que el modelo ayuda.

Para ver cómo resultó esto en un producto entero, está el [caso de Contamos](/es/work/contamos/).
