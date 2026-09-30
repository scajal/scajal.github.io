---
title: "Webhooks de pago idempotentes en Laravel"
description: "Cómo procesar webhooks de pago de forma idempotente en Laravel: verificar la firma, guardar cada evento una vez, procesarlo en un job y que decida la base."
published: "2026-10-27"
translations: {"en": "idempotent-payment-webhooks"}
---

Un webhook de pago va a llegar más de una vez. Los proveedores reintentan cuando el endpoint tarda, cuando devuelve un error y, a veces, cuando no pasó ninguna de las dos cosas. Procesar webhooks de pago de forma idempotente significa que la segunda, tercera o décima entrega del mismo evento no cambia nada: ni un segundo crédito, ni un segundo correo, ni una segunda fila.

La respuesta corta para Laravel: verificar la firma, guardar cada evento con el id único que le da el proveedor y una restricción única en la base de datos, responder rápido, y hacer el trabajo en un job en cola que verifique y cambie el estado en un solo paso atómico. El resto del artículo explica por qué está cada paso, con código y con ejemplos de dos sistemas en los que trabajo: Contamos, que cobra a través de Paddle, y Criptala, una plataforma de trading y pagos en cripto.

## Por qué un webhook llega dos veces

La entrega de webhooks es "al menos una vez" por diseño. El proveedor no puede saber si el servidor procesó el evento, solo si respondió con un 2xx a tiempo. Entonces reintenta:

- El handler tardó más que el timeout del proveedor, aunque haya terminado.
- El handler tiró una excepción después de hacer la mitad del trabajo.
- La red perdió la respuesta.
- Dos entregas del mismo evento se superpusieron porque la primera seguía corriendo.

Los eventos también llegan desordenados. Un `subscription.updated` puede llegar antes que el `subscription.created` al que sigue. El código que asume una sola entrega, en orden, funciona en las pruebas y falla en producción.

## Paso 1: Verificar la firma antes que nada

Cualquiera puede hacer un POST a una URL pública. Antes de leer el payload, hay que comprobar que vino del proveedor. Paddle manda un header `Paddle-Signature` con un timestamp y un HMAC-SHA256 de `timestamp:cuerpo_crudo`, firmado con el secreto del webhook.

```php
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

function verifyPaddleSignature(Request $request, string $secret): void
{
    $parts = [];

    foreach (explode(';', (string) $request->header('Paddle-Signature')) as $part) {
        [$key, $value] = array_pad(explode('=', $part, 2), 2, '');
        $parts[$key] = $value;
    }

    $timestamp = (int) ($parts['ts'] ?? 0);
    $expected = hash_hmac('sha256', $timestamp.':'.$request->getContent(), $secret);

    // Rechazar firmas viejas, para que un request capturado no se pueda reenviar después.
    if (time() - $timestamp > 5 || ! hash_equals($expected, $parts['h1'] ?? '')) {
        throw new AccessDeniedHttpException('Invalid webhook signature.');
    }
}
```

Hay tres detalles que importan. Firmar el cuerpo crudo con `getContent()`, no el JSON re-codificado, o los bytes no van a coincidir. Comparar con `hash_equals` para no filtrar información por tiempos. Y rechazar timestamps viejos: cinco segundos es lo que usa Laravel Cashier para Paddle.

Con [Laravel Cashier para Paddle](https://laravel.com/docs/cashier-paddle) esto ya está resuelto una vez que se configura `PADDLE_WEBHOOK_SECRET`. Es lo que hace Contamos: la ruta del webhook está exenta de CSRF y el middleware de Cashier verifica la firma.

## Paso 2: Guardar cada evento una sola vez, por su id

Todo proveedor le da a cada evento un id único. En Paddle Billing es `event_id`. Hay que guardar el evento crudo con ese id y dejar que un índice único garantice el "una sola vez":

```php
Schema::create('webhook_events', function (Blueprint $table): void {
    $table->id();
    $table->string('provider');
    $table->string('event_id');
    $table->string('type');
    $table->json('payload');
    $table->timestamp('processed_at')->nullable();
    $table->timestamps();

    $table->unique(['provider', 'event_id']);
});
```

Guardar el payload crudo vale lo que ocupa. Cuando algo sale mal, se puede ver exactamente qué mandó el proveedor y reprocesarlo después de corregir el error.

Lo importante es el índice único. Un chequeo del tipo "¿existe este evento?" seguido de un insert tiene una condición de carrera: dos entregas pueden chequear a la vez, no ver nada, e insertar las dos. La base de datos es el único lugar que puede rechazar la segunda de forma atómica.

## Paso 3: Responder rápido y procesar en un job

El controlador hace lo mínimo: verificar, guardar, despachar, responder.

```php
class PaymentWebhookController
{
    public function __invoke(Request $request): Response
    {
        verifyPaddleSignature($request, config('services.paddle.webhook_secret'));

        $event = WebhookEvent::query()->createOrFirst(
            ['provider' => 'paddle', 'event_id' => $request->input('event_id')],
            ['type' => $request->input('event_type'), 'payload' => $request->all()],
        );

        if ($event->wasRecentlyCreated) {
            ProcessWebhookEvent::dispatch($event);
        }

        return response()->noContent();
    }
}
```

`createOrFirst` intenta el insert y, si el índice único lo rechaza, devuelve la fila existente en vez de tirar una excepción. Una entrega duplicada recibe un 204 y nada más.

Pasar el trabajo a un job en cola mantiene la respuesta bien dentro del timeout del proveedor, que es la causa más común de reintentos. Además, da los reintentos con backoff de Laravel cuando falla una llamada externa.

Este paso es un compromiso, no una regla. En Contamos, cada handler de Paddle son un par de escrituras en la base de datos, así que corre en línea dentro del controlador de Cashier y sigue siendo rápido. Cuando un handler llama a otras APIs, manda correos o toca varias tablas, un job es el lugar más seguro.

## Paso 4: Que el handler también sea idempotente

Deduplicar entregas no alcanza. El propio job puede correr dos veces: un worker puede caerse después de hacer commit pero antes de confirmar el job. El handler tiene que verificar y cambiar el estado en un solo paso atómico.

Bloquear la fila del evento, verificar si ya se procesó, hacer el trabajo y marcarlo, todo en una transacción:

```php
class ProcessWebhookEvent implements ShouldQueue
{
    use Queueable;

    public int $tries = 5;

    public function __construct(public WebhookEvent $event) {}

    public function handle(): void
    {
        DB::transaction(function (): void {
            $event = WebhookEvent::query()->lockForUpdate()->findOrFail($this->event->id);

            if ($event->processed_at !== null) {
                return;
            }

            $this->apply($event->payload);

            $event->update(['processed_at' => now()]);
        });
    }
}
```

La misma idea funciona sin una tabla de eventos aparte: un update condicional que reclama el cambio de estado. Contamos lo usa para el fin de una suscripción, así el dueño del equipo se entera una sola vez de que el equipo pasó al plan gratuito, por más veces que Paddle entregue el evento:

```php
$claimed = Subscription::query()
    ->where('paddle_id', $payload['data']['id'])
    ->whereNull('end_handled_at')
    ->update(['end_handled_at' => CarbonImmutable::now()]);

if ($claimed === 0) {
    return;
}
```

Solo un request puede pasar `end_handled_at` de null a una fecha. Todos los demás ven cero filas afectadas y se detienen. Las transacciones de facturación funcionan igual: cada fila guarda el id de transacción de Paddle bajo un índice único, y el handler sale antes si ya existe.

### Los efectos secundarios, fuera del camino del reintento

Los correos, los eventos de analítica y las llamadas a otros servicios no se deshacen con la transacción. Hay que enviarlos después del commit (`DB::afterCommit()` o un job despachado con `afterCommit()`) y decidir qué significa que fallen. En Contamos, reportar una compra a Google Analytics está envuelto en `rescue()`: si falla se registra, pero nunca se propaga, así Paddle no reintenta un webhook cuyo trabajo real ya se hizo.

## Paso 5: Eventos que llegan desordenados

La idempotencia evita que el mismo evento se aplique dos veces. No evita que un evento viejo pise un estado más nuevo. Paddle incluye `occurred_at` en cada evento; hay que guardarlo en la entidad y aplicar solo las actualizaciones más recientes:

```php
Subscription::query()
    ->where('paddle_id', $data['id'])
    ->where(fn ($query) => $query
        ->whereNull('provider_updated_at')
        ->orWhere('provider_updated_at', '<', $occurredAt))
    ->update([
        'status' => $data['status'],
        'provider_updated_at' => $occurredAt,
    ]);
```

Cuando un evento hace referencia a algo que todavía no se vio, conviene hacer fallar el job y dejar que reintente más tarde, en lugar de crear un registro a medias.

## Paso 6: Conciliar contra la API del proveedor

Los webhooks son una notificación, no la fuente de verdad. Los endpoints se caen, los secretos se rotan mal y los eventos se pierden. Un job programado que le pida al proveedor las transacciones recientes y las compare con los registros propios atrapa lo que los webhooks no trajeron. Una diferencia se reporta; no se corrige en silencio.

## Reversos en fiat y pagos on-chain

En Criptala, los rieles fiat y cripto conviven detrás de una sola API, y fallan de maneras distintas. Una transferencia bancaria o un pago con tarjeta se pueden revertir días después. Una transacción on-chain confirmada no se puede revertir nunca. Eso cambia cómo tiene que pensar un handler de webhooks:

- **Fiat:** un evento "completado" no es definitivo. El modelo necesita un estado posterior para reversos y contracargos, y el dinero liberado al "completado" tiene que poder recuperarse, algo mucho más fácil en un libro contable donde [cada movimiento se puede revertir con exactitud](/es/blog/disenar-un-libro-contable-multimoneda/).
- **Cripto:** la confirmación es definitiva, así que el riesgo es el opuesto: acreditar dos veces, o acreditar la orden equivocada. Un crédito que sale dos veces no se puede traer de vuelta.

Dos patrones de ese código, a nivel de arquitectura. Primero, un webhook cuyo pago ya está en el estado final responde éxito de inmediato. Una versión anterior respondía ese caso con un error de validación, lo que solo hacía que el proveedor reintentara. Segundo, cada referencia del proveedor queda asociada a exactamente un pago. Si llega un webhook con una referencia que ya pertenece a otro pago, eso se levanta como alerta, nunca se aplica como un segundo crédito.

## Checklist para webhooks de pago

- Verificar la firma contra el cuerpo crudo, con tolerancia de timestamp.
- Guardar cada evento con el id del proveedor, bajo un índice único.
- Responder 2xx rápido; el trabajo pesado va en un job en cola.
- En el handler, verificar y cambiar el estado en un solo paso atómico: un lock de fila o un update condicional.
- Enviar los efectos secundarios después del commit, sin que su falla dispare un reintento.
- Comparar `occurred_at` para que un evento viejo no pise un estado nuevo.
- Conciliar contra la API del proveedor de forma programada.
- Modelar reversos en fiat; proteger contra el doble crédito en cripto.

El hilo común es que decide la base de datos, no el código que la precede. Para ver cómo encaja esto en una plataforma completa, está el [caso de Criptala](/es/work/criptala/).
