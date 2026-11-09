---
title: "Un registro de actividad para asistentes de IA en Laravel"
description: "Cómo registrar en Laravel lo que un asistente de IA hizo por un usuario: el usuario como autor, el asistente con Context oculto, lotes y nada de prompts."
published: "2026-11-19"
translations: {"en": "audit-log-for-ai-assistants"}
---

Para auditar lo que un asistente de IA hace en nombre de un usuario, el autor del cambio tiene que seguir siendo el usuario, y al lado hay que registrar al asistente: que el cambio llegó a través de un asistente y de cuál. Eso se agrega en la capa del registro, desde el contexto de la solicitud, para que ningún camino de escritura lo olvide. Después, las escrituras masivas se agrupan en una entrada, el nombre del asistente aparece donde sea que se lea el registro, y los prompts quedan afuera.

En [cómo armar un servidor MCP remoto en Laravel](/es/blog/servidor-mcp-remoto-laravel/) esto ocupó una sección corta. Este artículo es la implementación que hay detrás, tomada de [Contamos](/es/work/contamos/), un libro compartido en varias monedas cuyo código es [open source en GitHub](https://github.com/scajal/contamos) con licencia MIT. Usa `spatie/laravel-activitylog`, pero las ideas no dependen de ese paquete.

## Por qué "lo hizo el usuario" ya no alcanza

Un registro de actividad de equipo responde qué cambió, quién lo cambió y cuándo. Contamos ya tenía más de un tipo de "quién": su presentador distingue a un miembro del equipo, al equipo de soporte de la plataforma, a una cuenta que ya no existe y al propio sistema.

Un asistente rompe la versión simple. Si alguien del equipo ve que Ana borró cuarenta transacciones, la pregunta siguiente es si lo hizo Ana o si lo hizo su asistente después de leer mal un extracto. La primera es una conversación sobre una decisión. La segunda es sobre una herramienta que necesita un prompt más preciso, una simulación previa o que la desconecten.

Hacer del asistente el autor sería el error opuesto. No tiene lugar en el equipo ni un rol; actuó con los permisos del usuario, después de que el usuario lo autorizara. Así que el autor sigue siendo el usuario, y la entrada lleva un segundo dato: por qué canal llegó y qué cliente lo hizo.

## Qué lleva cada entrada

Una entrada escrita durante una llamada MCP recibe tres propiedades más. La columna del autor (el `causer`) no cambia.

```php
public static function activityProperties(): array
{
    if (! self::active()) {
        return [];
    }

    return [
        'via' => 'mcp',
        'client_id' => self::clientId(),
        'client_name' => self::clientName(),
    ];
}
```

`client_id` es lo que el token OAuth indica como su cliente. Un cliente que se registró con un documento de metadatos se identifica con la URL de ese documento, por ejemplo `https://claude.ai/oauth/mcp-oauth-client-metadata`, así que su nombre legible es el host sin `www.`: `claude.ai`. Un cliente que solo se conoce por un ID opaco, como `client_01ABC`, se nombra con ese ID. Es menos amable, pero es cierto.

El nombre se guarda cuando se escribe la entrada, no se busca al leerla. La lista de asistentes conectados viene de WorkOS y pierde al asistente cuando se desconecta, así que un nombre resuelto después quedaría vacío justo cuando alguien quiere saber qué hizo.

## Llevarlo por la solicitud con el Context oculto

Hay tres lugares que conocen una parte de esto. El middleware del token conoce al cliente. El servidor MCP sabe que la solicitud es una llamada MCP. El registro de actividad escribe la entrada. En el medio están las clases de acciones, como `CreateTransaction`, que también llaman los controladores web.

Pasar un flag `$viaAssistant` por esas acciones obligaría a cada una a saber de un canal que no le incumbe, y cualquier acción que se olvidara de pasarlo escribiría una entrada sin marcar. El [Context](https://laravel.com/docs/context) de Laravel es la herramienta adecuada: lo que se le agrega vive mientras dura la solicitud y cualquier parte del código puede leerlo. Contamos lo envuelve en un helper pequeño:

```php
class McpContext
{
    protected const string VIA = 'mcp.via';
    protected const string CLIENT_ID = 'mcp.client_id';
    protected const string SESSION_ID = 'mcp.session_id';

    public static function enter(): void
    {
        Context::addHidden(self::VIA, true);
    }

    public static function identify(?string $clientId, ?string $sessionId): void
    {
        Context::addHidden(self::CLIENT_ID, $clientId);
        Context::addHidden(self::SESSION_ID, $sessionId);
    }

    public static function active(): bool
    {
        return Context::getHidden(self::VIA) === true;
    }
}
```

El middleware llama a `identify($claims['client_id'], $claims['sid'])` justo después de `Auth::setUser($user)`, y el `boot()` del servidor llama a `enter()`.

Usa la variante oculta a propósito: Laravel agrega el contexto común a cada línea del log de la aplicación, y el oculto queda fuera, aunque los dos viajan con los jobs que se encolan durante la solicitud. Los identificadores de cliente y de sesión no tienen por qué estar en cada línea del log.

## Marcar cada entrada en un solo callback

Con el contexto en su lugar, un único callback del registro de actividad hace la marca. Se registra en el service provider del módulo de identidad:

```php
LogActivityAction::clearBeforeLoggingCallbacks();

PendingActivityLog::beforeLogging(function (ActivityContract $activity): void {
    if ($activity instanceof Model) {
        $activity->setAttribute('batch_uuid', TeamActivity::uuid());
    }

    // The causer stays the user it acted as.
    if ($activity instanceof Activity && ($properties = McpContext::activityProperties()) !== []) {
        $activity->properties = collect($activity->properties ?? [])->merge($properties);
    }
});
```

Las entradas se escriben de dos maneras: a partir de eventos de modelo, con un trait `LogsTeamActivity` en los modelos del equipo, y de forma explícita para los pocos cambios que un evento de modelo no ve, como un cambio de rol. Las dos pasan por este callback, así que una herramienta que se agregue el mes que viene queda marcada sin hacer nada. Limpiar los callbacks primero evita que se acumulen si la aplicación arranca varias veces, como en los tests. Y los tests cubren los dos lados: una herramienta ejecutada por el servidor MCP escribe `via: mcp` y `client_name: claude.ai`, y una escritura desde la web no tiene la clave `via`.

## Lotes: una cosa que alguien hizo, una entrada

La herramienta `import_transactions` puede crear hasta 200 transacciones a partir de un extracto bancario, cada una con su propia entrada. Doscientas líneas de "creada" taparían todo lo demás, así que las entradas que escribe una misma acción comparten un `batch_uuid`, que el callback de arriba toma de este helper:

```php
public static function start(): void
{
    if (self::$depth === 0) {
        self::$uuid = (string) Str::uuid();
    }

    self::$depth++;
}

public static function within(Closure $callback): mixed
{
    self::start();

    try {
        return $callback();
    } finally {
        self::end();
    }
}
```

El contador de profundidad es lo que lo hace funcionar. La importación abre un lote y crea cada fila con `CreateTransactionEntry`, que abre uno propio. Solo el lote más externo genera un ID, así que toda la importación comparte un mismo UUID, y el `finally` cierra el lote aunque la importación falle.

Cada cambio sigue siendo su propia fila, así que no se pierde detalle. La línea de tiempo junta las filas consecutivas con el mismo `batch_uuid` en una sola entrada con una nota de "+N más", y al abrirla se ven todas.

El ID del lote tiene una segunda función: la importación se lo devuelve al asistente como `import_id`, y `delete_import` lee ese lote para decidir qué deshacer, y se niega si una persona editó alguna de esas filas desde entonces. Lo expliqué en [deshacer en lugar de “¿Estás seguro?”](/es/blog/deshacer-en-lugar-de-confirmar/). Si el registro alcanza para guiar un deshacer, también alcanza como constancia.

## Mostrarlo donde el equipo lee el registro

En la página de actividad, una entrada que llegó por un asistente lleva una etiqueta junto al evento:

```tsx
export const AssistantBadge = ({ assistant }: Props) => {
    const t = useLaravelReactI18n().t;

    if (!assistant) {
        return null;
    }

    return (
        <Badge variant="outline">
            <SparklesIcon data-icon="inline-start" />
            {assistant.name ? t("via :name", { name: assistant.name }) : t("via an AI assistant")}
        </Badge>
    );
};
```

En español dice "vía claude.ai", o "vía un asistente de IA" si no hay nombre. El controlador manda `assistant` como `null` para lo que se hizo en la app y como `{ name }` para lo que se hizo por MCP, así que las propiedades crudas nunca llegan al navegador. La etiqueta aparece en la línea de tiempo y en el detalle de cada entrada.

El registro lo pueden abrir los propietarios y administradores, en el plan Pro. Registrar, en cambio, nunca depende del plan: un equipo Free ve la página bloqueada, pero su historial se sigue escribiendo, y las entradas se guardan 365 días en cualquier caso.

## Devolverle el registro al asistente

El mismo registro se expone a los asistentes con dos herramientas de solo lectura. `list_activity` devuelve la línea de tiempo en páginas de 50 entradas con un cursor, y admite los mismos filtros que la página: tipo de elemento, miembro y fechas. `get_activity` devuelve una entrada junto con el resto de su lote y el valor anterior y nuevo de cada campo.

Las dos pasan por el mismo control que la página, primero el permiso y después el plan, para que a un miembro sin acceso nunca se le ofrezca un plan que no podría pedir. Cada entrada incluye `via`, `client_id` y `client_name`, así que un usuario puede preguntarle a su asistente qué se cambió la semana pasada a través de un asistente y qué se hizo a mano. La página y las herramientas comparten un mismo trait para presentar las entradas, así que sus respuestas no pueden divergir.

## Qué registrar y qué dejar afuera

El registro guarda el evento, el elemento al que se refiere y los campos que cambiaron, con su valor antes y después. Los campos salen solo de una lista explícita en cada modelo. Para una transacción: cuenta, monto, categoría, moneda, descripción, fecha, tipo de cambio y tipo. El contrato del trait dice qué no entra nunca: timestamps, claves, saldos y columnas internas.

Del lado del asistente se registran el canal y el cliente. No el prompt, ni la conversación, ni los argumentos crudos de la herramienta, ni el razonamiento del modelo, ni el token, ni el ID de sesión.

La razón es quién lee el registro. Un prompt es algo que una persona le dijo a su propia herramienta, y puede incluir un extracto pegado entero, nombres de otras personas o notas que nunca fueron para el equipo. Lo leen los administradores del equipo, y lo que tiene que decir es qué cambió en el libro compartido, que de todos modos podrían ver en la app.

Eso no lo deja libre de datos personales: una entrada de invitación guarda el email de la persona invitada, porque el equipo lo ve en la invitación. La regla no es "nada de datos personales". Es que el registro nunca guarde más de lo que el equipo ya podía ver.

## La revocación y el registro

Cuando un usuario desconecta un asistente, Contamos guarda una fila de permiso revocado para ese usuario y ese cliente, y después revoca la autorización en WorkOS. A partir de ahí, el middleware del token rechaza cualquier token de ese cliente emitido antes de la revocación, antes de que corra ninguna herramienta. Ya no se puede escribir nada más a través de ese permiso, así que su rastro en el registro simplemente termina.

El historial queda como estaba. Las entradas no se reescriben ni se borran, y como el nombre se guardó al escribirlas, siguen diciendo "vía claude.ai" cuando el asistente ya no figura en la lista del usuario.

Lo que el registro del equipo no muestra es la desconexión en sí. Un asistente se conecta a la cuenta de una persona, no a un equipo, y desconectarlo lo corta de todos sus equipos a la vez, así que es un evento de la cuenta. Si tus equipos necesitan ver cuándo terminó un acceso, esa es la entrada que falta agregar.

## Resumen

- Mantener al usuario como autor. El asistente actuó con sus permisos, así que la responsabilidad sigue siendo suya.
- Registrar el canal y el cliente en cada entrada, y guardar un nombre legible al escribirla para que sobreviva a la desconexión.
- Llevar eso por la solicitud con el `Context` oculto de Laravel, no con flags que atraviesan acciones compartidas.
- Marcar las entradas en un solo callback del registro, para que ningún camino de escritura pueda omitirlo.
- Agrupar lo que escribió una acción bajo un ID de lote al que se suman las acciones anidadas, y reusar ese ID para deshacer.
- Mostrar al asistente en la interfaz y devolverles el registro a los asistentes como herramientas de solo lectura, detrás de los mismos controles.
- Dejar afuera prompts, conversaciones, tokens e IDs de sesión. El registro tiene que guardar lo que el equipo ya puede ver.

El resto del servidor, del OAuth a las simulaciones previas, está en [el artículo sobre el servidor MCP remoto](/es/blog/servidor-mcp-remoto-laravel/). El producto alrededor está en el [caso de Contamos](/es/work/contamos/).
