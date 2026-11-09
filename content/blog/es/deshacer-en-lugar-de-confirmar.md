---
title: "Deshacer en lugar de “¿Estás seguro?”: cómo construirlo en el servidor con Laravel e Inertia"
description: "Por qué los diálogos de confirmación se aceptan sin leer y cómo construir el deshacer en el servidor con Laravel e Inertia: toast, reversión exacta y tests."
published: "2026-11-10"
translations: {"en": "undo-instead-of-confirm-dialogs"}
---

Un diálogo de confirmación pide cuidado antes de actuar. Deshacer permite corregir después. Para las acciones que se repiten todo el día, deshacer es la mejor red de seguridad: se ofrece en el mismo mensaje que informa la escritura, el servidor decide qué se puede deshacer y cómo, y la escritura se revierte de forma exacta, saldos incluidos. La confirmación queda para las pocas cosas que de verdad no tienen vuelta atrás, y esos diálogos tienen que ser concretos.

Este artículo cuenta cómo lo resuelve [Contamos](/es/work/contamos/), un libro compartido multimoneda que construí con Laravel, Inertia y React. El [código es abierto](https://github.com/scajal/contamos), y los fragmentos que siguen salen de ahí, recortados.

## Por qué “¿Estás seguro?” deja de funcionar

Un diálogo que aparece siempre termina siendo parte del gesto. La gente aprende dónde está el botón, no lo que dice la pregunta. Después del “¿Estás seguro?” número cien, el clic en Continuar es tan automático como el que abrió el diálogo, así que la única vez que debería frenar a alguien, no lo frena. Eso es habituación, y ningún texto lo arregla, porque el problema es la repetición.

Además pregunta en el momento equivocado. La mayoría de los errores en un libro contable son un monto, una cuenta o un día equivocados, y se notan al ver el resultado, no antes. Un diálogo que aparece antes de la escritura no puede atrapar un error que la persona todavía no vio.

Deshacer invierte eso. El camino correcto no cuesta nada extra, el equivocado cuesta un solo toque, y la oferta aparece justo cuando la persona está mirando lo que acaba de pasar.

## Dónde va el deshacer

La escritura más común en Contamos es registrar un movimiento, muchas veces desde el teléfono, justo después de pagar algo. Después de registrar un ingreso, un gasto, una transferencia o un movimiento que se repite, el toast de “Guardado” trae un botón de Deshacer. El comentario del controlador explica el intercambio: un toque equivocado cuesta un toque, y no un recorrido por el menú de la fila más una confirmación.

Es decir, el deshacer está en la escritura, no en el borrado. Borrar una fila sigue pidiendo confirmación, porque en Contamos un borrado es definitivo.

## El servidor decide qué se puede deshacer

El toast es un objeto pequeño del lado del servidor. Además del mensaje, puede llevar una acción: una etiqueta, una URL y un método HTTP.

```php
/**
 * Offer a single action alongside the message. A write the user
 * can take back says so here rather than behind a confirmation
 * they would have had to read before acting.
 */
public function action(string $label, string $url, string $method = 'delete'): self
{
    $this->action = ['label' => $label, 'method' => $method, 'url' => $url];

    return $this;
}
```

`flash()` le pasa el toast a `Inertia::flash()`. El controlador que registra el movimiento decide si agrega la acción y adónde apunta:

```php
$toast = Toast::make(trans('Saved'));

if ($rule instanceof RecurringRule) {
    $toast->action(trans('Undo'), route('finance.teams.recurring-rules.undo', [
        'team' => $team->getRouteKey(),
        'recurringRule' => $rule->getRouteKey(),
    ]));
} elseif ($transaction instanceof Transaction && $this->isVisible($team, $transaction)) {
    $toast->action(trans('Undo'), route('finance.teams.transactions.destroy', [
        'team' => $team->getRouteKey(),
        'transaction' => $transaction->getRouteKey(),
    ]));
}

$toast->flash();

return back();
```

`TransferController::store` hace lo mismo con `finance.teams.transfers.destroy`, que se lleva la transferencia con sus dos patas.

Para movimientos y transferencias, la URL de deshacer es la ruta de borrado de siempre. No hay un endpoint de deshacer ni un token, así que el deshacer pasa por los mismos chequeos que cualquier borrado: pertenencia al equipo, bindings de ruta con scope y, en el caso de un movimiento, la ventana de historial del plan. Solo el movimiento que se repite tiene su propia ruta `undo`, porque en una regla recurrente deshacer y borrar no significan lo mismo.

## El cliente solo lo muestra

Del lado de React, un único listener convierte cualquier toast que llegue como flash en una notificación. No sabe qué es un movimiento.

```tsx
router.on("flash", (event) => {
    const flashed = event.detail.flash.toast;

    if (!flashed) {
        return;
    }

    const action = flashed.action;

    const id: string = toast.add({
        actionProps: action
            ? {
                  children: action.label,
                  onClick: () => {
                      router.visit(action.url, { method: action.method, preserveScroll: true });

                      // The offer is spent, and the write it undid
                      // announces itself with a toast of its own.
                      toast.close(id);
                  },
              }
            : undefined,
        description: flashed.message,
    });
});
```

El flash viaja con la redirección que responde a la escritura, así que el cliente nunca pregunta si algo se puede deshacer: la respuesta llega en la misma respuesta. Sumar deshacer a otra escritura es un cambio solo en el servidor. Mencioné este canal en [Laravel Inertia o una SPA con API](/es/blog/laravel-inertia-o-spa-con-api/); esto es lo que hay detrás.

## Revertir la escritura de forma exacta

En un libro contable, deshacer una escritura es más que borrar una fila. Contamos guarda en caché un saldo por cuenta y moneda, y el deshacer tiene que dejarlo exactamente como estaba. Borrar un movimiento aplica el signo inverso de su tipo con el mismo monto, en SQL, dentro de la misma transacción de base de datos que el borrado:

```php
DB::transaction(function () use ($transaction): void {
    $this->team
        ?->accounts()
        ->whereKey($transaction->account_id)
        ->firstOrFail()
        ->currencies()
        ->updateExistingPivot($transaction->currency_id, [
            'balance' => DB::raw("balance {$transaction->type->inverseSign()} {$transaction->amount}"),
        ]);

    $transaction->delete();
});
```

Un gasto se revierte con `+` y un ingreso con `-`. Borrar una transferencia hace lo mismo con cada movimiento que le pertenece: las dos patas y cualquier comisión. El razonamiento detrás de estas reglas está en [cómo diseñar un libro contable multimoneda](/es/blog/disenar-un-libro-contable-multimoneda/).

El caso interesante es el movimiento que se repite. Registrarlo crea una regla recurrente y, si ya corresponde, su primera ocurrencia. Borrar una regla desde la página de reglas conserva lo que generó como movimientos comunes, porque eso es historia. Deshacer un movimiento recién registrado no debería dejar nada. Los dos casos usan la misma acción, y la ruta `undo` agrega un flag:

```php
$deleteRecurringRule->for($team)->withGeneratedTransactions()->using($recurringRule);
```

Con el flag activo, la acción borra cada movimiento generado a través de `DeleteTransaction`, revirtiendo cada saldo, y después borra la regla. Todo corre dentro de `TeamActivity::within`, así que el deshacer completo queda como una sola entrada en el registro de actividad del equipo. Tampoco borra la historia: el registro conserva la creación y el borrado.

## Cuánto tiempo se ofrece

Lo que dura el toast en pantalla. Contamos no define un timeout, así que se aplica el valor por defecto del toast de Base UI: cinco segundos, en pausa mientras el puntero está sobre los avisos o la ventana pierde el foco. Al hacer clic, el botón cierra el toast, así que la oferta no se puede usar dos veces.

El servidor no lleva la cuenta del tiempo. Como el deshacer es la ruta de borrado de siempre, el servidor no guarda deshaceres pendientes, no corre un job para vencerlos y no necesita una columna de soft delete. La ventana es una decisión de interfaz; qué se puede deshacer, y cómo, es una decisión del servidor. Cuando el toast desaparece, el camino de vuelta es el borrado normal, con su confirmación.

Hay un caso en el que el servidor no ofrece nada. En el plan gratuito, la lista muestra los últimos seis meses, y un movimiento más viejo no es accesible por URL: su ruta de borrado responde 404. Registrarlo sigue estando permitido, así que el controlador consulta `isVisible` y muestra “Guardado” sin botón, en lugar de ofrecer un deshacer que fallaría.

## Lo que no se puede deshacer, y por qué

- **Los borrados.** Contamos borra las filas de verdad; no hay soft deletes. Por eso borrar un movimiento sigue abriendo una confirmación, y ese diálogo está pensado para leerse: muestra el monto, la cuenta y la fecha de la fila. El comentario del componente lo explica: nombrar la fila es el sentido del diálogo, porque un movimiento no se puede recuperar y quien lee tiene que reconocer cuál está por perder.
- **Las ediciones.** Guardar una edición muestra “Guardado” sin acción. Deshacerla exigiría restaurar los valores anteriores y volver a mover los saldos. El registro de actividad guarda los valores viejos, pero nada restaura a partir de él.
- **Borrar un equipo o una cuenta de usuario.** Las acciones raras y definitivas tienen la mayor fricción. Borrar tu cuenta pide escribir tu correo. Borrar un equipo pide escribir su identificador, y el diálogo dice la consecuencia: “Esto no se puede deshacer. Todos los miembros pierden acceso a las cuentas y movimientos del equipo.”

La división queda simple. Lo frecuente y reversible lleva deshacer. Lo raro y definitivo lleva una confirmación, lo bastante concreta como para que se lea.

## Deshacer para un cliente de IA

Contamos también tiene un [servidor MCP remoto](/es/blog/servidor-mcp-remoto-laravel/), así que Claude o ChatGPT pueden registrar movimientos en nombre de un usuario, incluso extractos bancarios enteros con `import_transactions`. Una importación exitosa devuelve un `import_id`, y `delete_import` deshace la importación completa de una vez.

El `import_id` no es un concepto nuevo. La importación corre dentro de `TeamActivity::within`, que abre un lote de actividad, y cada movimiento que crea registra una entrada `created` con el UUID de ese lote. Deshacer la importación es encontrar esas entradas y comprobar que nadie tocó las filas desde entonces:

```php
$created = $team->activities()
    ->where('batch_uuid', $importId)
    ->where('subject_type', new Transaction()->getMorphClass())
    ->where('event', 'created')
    ->get();

// A transaction changed after the import was edited by
// somebody, and deleting it would wipe that work.
$edited = $team->activities()
    ->where('subject_type', new Transaction()->getMorphClass())
    ->whereIn('subject_id', $ids)
    ->where('event', 'updated')
    ->where(new Activity()->getKeyName(), '>', $created->max(new Activity()->getKeyName()))
    ->pluck('subject_id')
    // ...
```

Si alguna fila fue editada, no se borra nada y el error lista los IDs editados. Si no, la herramienta borra los movimientos con la misma acción `DeleteTransaction`, en una sola transacción de base de datos, revirtiendo cada saldo.

El deshacer web puede saltarse ese chequeo; este no. El toast dura segundos, pero `delete_import` no tiene un límite de tiempo propio, así que un asistente puede llamarlo días después, cuando una persona ya corrigió una categoría a mano. En lugar de un temporizador, el servidor consulta el registro de actividad y se niega antes que borrar una corrección.

Del lado del asistente se sigue confirmando. Las instrucciones del servidor le indican al modelo que confirme con el usuario antes de cualquier herramienta destructiva, y `delete_import` está marcada como destructiva. Aquí la confirmación cumple otra función: no es la persona quien presiona el botón, así que preguntar es la forma de que se entere de lo que el asistente está por hacer.

## Testear el deshacer

Los tests tratan la oferta y su efecto como cosas separadas. Un helper en `tests/Pest.php`, `flashedToastAction()`, lee la acción de los datos flash de Inertia en la sesión. Un test verifica la forma exacta de la oferta: la etiqueta, el método `delete` y la URL del movimiento recién creado. Otro sigue la URL que mandó el servidor, en lugar de armar la ruta por su cuenta, y comprueba que el movimiento ya no está:

```php
it('removes the entry when the undo the toast offers is taken', function (): void {
    // ... a member with an account in one currency

    $this->post(route('finance.teams.transactions.store', ['team' => $team->getRouteKey()]), transactionPayload([
        // ...
    ]));

    $undo = flashedToastAction();

    $this->delete($undo['url'])->assertRedirect();

    expect(Transaction::query()->count())->toBe(0);
});
```

El resto cubre los bordes. Un movimiento con fecha de hace dos años se guarda sin ninguna acción. Deshacer un movimiento que se repite elimina la regla y su movimiento, y el saldo vuelve a cero. La ruta `undo` de la regla recurrente lleva una cuenta de 125 a 100 al quitar un ingreso generado de 25. Del lado de MCP, `delete_import` borra exactamente las filas importadas y deja en su lugar una que no tiene relación, se niega cuando una de ellas fue editada y responde “Import not found.” ante la importación de otro equipo.

## Resumen

- Los diálogos de confirmación se aceptan por costumbre, y preguntan antes de que la persona pueda ver el error.
- Pon el deshacer en la escritura frecuente, en el toast que la informa, y deja que el servidor lo agregue; el cliente muestra lo que recibe.
- Apunta el deshacer a la ruta de borrado que ya existe, para que pase los mismos chequeos y no necesite tokens ni jobs de vencimiento.
- Revierte la escritura de forma exacta: el efecto inverso sobre el saldo, en SQL y en la misma transacción de base de datos.
- No ofrezcas el deshacer cuando fallaría, y guarda las confirmaciones concretas para lo que es de verdad definitivo.
- Cuando el deshacer no tiene límite de tiempo, como con un cliente de IA, comprueba antes que nadie haya cambiado las filas.
- Testea la oferta y el efecto por separado, y sigue la URL que mandó el servidor.

El resto del contexto está en el [caso de Contamos](/es/work/contamos/).
