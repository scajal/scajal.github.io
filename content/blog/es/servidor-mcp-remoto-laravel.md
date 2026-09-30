---
title: "Cómo armar un servidor MCP remoto en Laravel"
description: "Un servidor MCP en Laravel al que Claude y ChatGPT se conectan con OAuth: actúa como el usuario, prueba antes de escribir, registra todo y se puede revocar."
published: "2026-10-13"
translations: {"en": "remote-mcp-server-laravel"}
---

Un servidor MCP remoto permite que un asistente de IA como Claude o ChatGPT use las funciones de tu aplicación como herramientas, por HTTP, en nombre de un usuario real. Armarlo en Laravel es bastante directo con el paquete oficial `laravel/mcp`. Lo difícil no es el protocolo. Es asegurarse de que el asistente pueda hacer exactamente lo que el usuario podría hacer en la app, nada más, y que todo lo que haga quede a la vista y se pueda cortar.

Así armé el servidor MCP de [Contamos](/es/work/contamos/), un libro compartido en varias monedas. Expone 37 herramientas y trabaja sobre registros de dinero real, así que cada una de las decisiones que siguen tenía que aguantar.

## Qué necesita un servidor MCP remoto

Un servidor MCP local corre en la máquina del usuario y confía en quien lo lanzó. Uno remoto está en internet, así que necesita lo mismo que cualquier API pública, más algunas cosas propias de que lo llame un agente:

1. **Autenticación con OAuth**, para que el asistente actúe como un usuario con sesión iniciada y no con una API key compartida.
2. **Autorización igual a la de la app**: los mismos equipos, roles y límites de plan que en la web.
3. **Herramientas pensadas para un modelo**, con descripciones claras, entradas estrictas y errores que pueda transmitir.
4. **Una válvula de seguridad para escrituras masivas o destructivas**, como una simulación previa y un deshacer.
5. **Un registro de auditoría** que diga qué cambios hizo el asistente.
6. **Revocación** que funcione al instante, no cuando vence el token.

## Registrar el servidor con laravel/mcp

El paquete trae una clase `Server` y una macro de rutas. El servidor declara su nombre, versión e instrucciones, y registra herramientas y prompts:

```php
use Laravel\Mcp\Facades\Mcp;

Mcp::web('mcp', ContamosServer::class)
    ->middleware([AuthenticateMcpToken::class, ThrottleRequests::using('mcp')])
    ->name('mcp.server');
```

Las `instructions` merecen cuidado. Son el prompt de sistema que el asistente lee antes de llamar a cualquier cosa. En Contamos sirven para fijar las reglas en las que un modelo se equivoca con facilidad: los montos son strings decimales y nunca floats, toda herramienta que trabaja sobre un equipo necesita un `team` explícito, los tipos de cambio nunca se inventan y las herramientas destructivas requieren que el usuario confirme antes.

En vez de listar las herramientas a mano, el método `boot()` del servidor descubre cada clase `Tool` concreta en la carpeta `Tools` del módulo, así que agregar una herramienta es agregar un archivo.

Como es un endpoint HTTP al que los clientes mandan JSON-RPC por POST, la ruta también tiene que quedar excluida de la protección CSRF.

## OAuth para MCP: ser servidor de recursos, no proveedor de identidad

La [especificación de autorización de MCP](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization) se apoya en OAuth 2.1. El flujo es:

1. El asistente llama a `/mcp` sin token.
2. El servidor responde `401` con un header `WWW-Authenticate` que apunta a sus metadatos de recurso protegido.
3. El asistente lee esos metadatos, encuentra el servidor de autorización y hace el flujo OAuth con el usuario.
4. Vuelve con un bearer token, y cada llamada lo incluye.

No hace falta construir el servidor de autorización. Contamos ya usaba WorkOS AuthKit para el login, y AuthKit puede actuar como servidor de autorización para clientes MCP. A Contamos le quedan dos tareas: publicar los metadatos y verificar los tokens.

Los metadatos son un JSON pequeño definido en el [RFC 9728](https://www.rfc-editor.org/rfc/rfc9728):

```php
Route::get('.well-known/oauth-protected-resource/{path?}', function () {
    return [
        'resource' => url('/mcp'),
        'authorization_servers' => ['https://'.config('services.workos.authkit_domain')],
        'bearer_methods_supported' => ['header'],
    ];
})->where('path', '.*')->name('mcp.oauth.protected-resource.nested');
```

El nombre de la ruta importa: `laravel/mcp` lo busca cuando agrega el header `WWW-Authenticate` a una solicitud rechazada. Conviene declarar un solo servidor de autorización; por lo que vi, los clientes solo leen el primero.

### Verificar el token

El middleware delante de `/mcp` acepta únicamente un bearer token en el header `Authorization` y lo verifica como corresponde a un servidor de recursos:

- la firma, contra el JSON Web Key Set del servidor de autorización, cacheado y vuelto a pedir una vez cuando un token nombra una clave que la caché no tiene (las claves rotan);
- que el emisor sea el dominio de AuthKit;
- que la audiencia incluya la URL exacta de `/mcp` de este servidor, para rechazar tokens emitidos para otra cosa;
- que el token tenga vencimiento y sujeto;
- que el sujeto corresponda a un usuario activo en la base;
- que el permiso no haya sido revocado (más sobre esto abajo).

Recién entonces llama a `Auth::setUser($user)` para esa solicitud. De ahí en adelante, cada herramienta corre como ese usuario.

El mismo middleware guarda el client ID y la sesión del token en el `Context` oculto de la solicitud. Eso es lo que después usan la auditoría y la revocación.

## Autorización: el asistente es el usuario, no un administrador

La regla que mantuve es que un asistente llega exactamente a lo mismo que su usuario en la app. Sin cuentas de servicio y sin permisos elevados.

Cada herramienta que trabaja sobre un equipo pasa por un mismo helper que:

- resuelve el argumento `team` **solo entre los equipos del propio usuario**, de modo que un slug inexistente y el equipo de otra persona devuelven el mismo "Team not found", y la llamada nunca revela que un equipo existe;
- verifica que el plan del equipo incluya el acceso por MCP y la funcionalidad concreta, con los mismos chequeos de Pennant que usan las rutas web;
- verifica el rol del usuario en ese equipo para todo lo que requiera un permiso;
- convierte cualquier rechazo en un error de herramienta con una frase que el asistente puede repetirle al usuario, con el enlace para pasar de plan cuando el motivo es un límite.

Las herramientas llaman a las mismas clases de acciones que los controladores web. `delete_transaction` ejecuta la misma acción `DeleteTransaction` que el navegador, así que la validación, la actualización de saldos y los efectos secundarios no pueden divergir entre los dos.

## Diseñar herramientas que un modelo use bien

Una herramienta es un endpoint cuyo cliente es un modelo de lenguaje. Eso cambia algunos criterios:

```php
#[Name('delete_transaction')]
#[Description('Delete a transaction of the team and revert its effect on the account balance. A transaction that is part of a transfer cannot be deleted here; delete the transfer instead.')]
#[IsDestructive]
class DeleteTransaction extends Tool
{
    public function schema(JsonSchema $schema): array
    {
        return [
            'team' => $schema->string()->description('The slug of the team, as listed by `list_teams`.')->required(),
            'transaction' => $schema->string()->description('The id of the transaction to delete.')->required(),
        ];
    }

    public function handle(Request $request, DeleteTransactionAction $delete): Response|ResponseFactory
    {
        // resolver el equipo, verificar permisos y ejecutar la acción de la web
    }
}
```

- **Las descripciones dicen qué va a rechazar la herramienta**, no solo qué hace. El modelo las lee para planificar.
- **Las anotaciones son honestas.** Las de lectura llevan `#[IsReadOnly]` y las que borran `#[IsDestructive]`, para que el cliente pueda preguntarle al usuario antes de ejecutarlas.
- **Las entradas son estrictas y sin ambigüedad.** El dinero es un string decimal, [nunca un float](/es/blog/guardar-dinero-en-una-base-de-datos/). Las horas llevan una zona horaria IANA. Una cuenta con varias monedas exige que se indique la moneda en vez de adivinarla.
- **Los errores son frases.** "Team not found. Call `list_teams` to see the slugs of the teams you belong to." es algo con lo que el modelo puede actuar. Un stack trace no.
- **Las salidas son estructuradas.** `Response::structured()` devuelve JSON sobre el que el modelo puede razonar, en lugar de prosa que tiene que interpretar.

## Simulación previa y deshacer para escrituras masivas

La herramienta más útil es también la más riesgosa: `import_transactions`, que recibe hasta 200 filas de un estado de cuenta bancario. Su seguridad viene de tres reglas:

1. **Primero, simulación.** Con `dry_run: true` valida cada fila, calcula los totales y lista los posibles duplicados sin escribir nada. Tanto la descripción de la herramienta como las instrucciones del servidor le piden al asistente que le muestre ese resumen al usuario antes de importar.
2. **Todo o nada.** Si alguna fila no pasa la validación, no se escribe nada, y cada error indica a qué fila corresponde. La importación corre dentro de una sola transacción de base de datos.
3. **Deshacer como herramienta.** Una importación exitosa devuelve un `import_id`, y `delete_import` borra exactamente esas filas. Se niega si alguna fue editada después, para no borrar nunca una corrección hecha por una persona.

La detección de duplicados bloquea la importación salvo que el asistente mande `allow_duplicates: true`, algo que tiene indicado hacer solo después de que el usuario confirme.

## Una auditoría que nombra al asistente

Contamos lleva un registro de actividad por equipo. Cuando una solicitud entra por el servidor MCP, el servidor la marca en el `Context` oculto, y un callback del logger de actividad agrega `via: mcp`, más el ID y el nombre del cliente, a cada entrada escrita durante esa solicitud. El autor sigue siendo el usuario, porque el asistente actuó como él; la entrada solo aclara que se hizo a través de un asistente, y cuál.

El resultado es que cualquiera en el equipo puede abrir el registro de actividad y distinguir lo que una persona hizo en la app de lo que esa persona hizo mediante un asistente de IA, con el nombre del asistente. Un cliente que se registró con un documento de metadatos se identifica por la URL de ese documento, así que su dominio sirve como nombre legible. Por cómo se agrupan las entradas, una importación de 200 filas se lee como una sola entrada, no como 200.

## Una revocación que funciona al instante

Los access tokens duran poco, pero "poco" sigue siendo demasiado cuando alguien quiere desconectar un asistente ya. Contamos tiene su propia tabla de permisos revocados. Cuando un usuario desconecta un asistente desde la app:

1. Se guarda una fila de permiso revocado para ese usuario y ese cliente, con fecha y hora.
2. Se revoca la autorización en WorkOS.

El middleware rechaza cualquier token cuyo cliente haya sido revocado para ese usuario después de que se emitió el token. Si el usuario se vuelve a conectar, recibe tokens nuevos que esa revocación ya no cubre. Si la llamada a WorkOS falla, la fila local igual bloquea al asistente; volver a revocar solo reintenta WorkOS.

## Límite de solicitudes

Un agente que entra en un loop puede mandar muchas solicitudes. El rate limiter `mcp` permite 120 por minuto por usuario, usa la dirección IP cuando todavía no hay usuario, y responde con un error JSON-RPC que el asistente puede leer y transmitir, en lugar de un `429` sin más.

## En resumen

Armar un servidor MCP remoto en Laravel tiene menos que ver con MCP que con tratar a un asistente de IA como lo que es: un cliente nuevo que actúa como uno de tus usuarios. La receta: `laravel/mcp` para el protocolo, un proveedor de identidad existente como servidor de autorización OAuth, las mismas acciones y chequeos que tu app web para todo lo demás, y para el trabajo destructivo, una simulación previa, un deshacer, un registro de auditoría y un botón de apagado. El resto del contexto está en el [caso de Contamos](/es/work/contamos/).
