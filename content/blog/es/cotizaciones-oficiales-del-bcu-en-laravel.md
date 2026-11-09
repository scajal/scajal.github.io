---
title: "Cotizaciones del BCU en Laravel: sincronizar el tipo de cambio oficial cada día"
description: "Cómo sincronizar a diario las cotizaciones del BCU en Laravel: leer el TXT, guardar un historial, programar la tarea y manejar feriados y datos malos."
published: "2026-11-17"
translations: {"en": "official-exchange-rates-bcu-laravel"}
---

Para sincronizar cotizaciones oficiales en Laravel hay que descargar el archivo del banco central para una fecha, convertirlo en una cotización por moneda contra una sola moneda de referencia y agregar esas cotizaciones a una tabla de historial, con la fecha desde la que rigen. La tarea corre desde el scheduler, una segunda ejecución no debe cambiar nada, y si un día no tiene cotizaciones, no se guarda nada. El código que lee las cotizaciones debe tomar la última vigente a la fecha que necesita, y negarse solo cuando no existe ninguna.

Este artículo lo recorre con el Banco Central del Uruguay (BCU) como fuente, usando el código de Contamos, un libro compartido para dinero guardado en varias monedas. Contamos es [código abierto en GitHub](https://github.com/scajal/contamos), con licencia MIT, así que cada fragmento de abajo se puede leer completo ahí.

## Qué publica el BCU

La [página de Cotizaciones del BCU](https://www.bcu.gub.uy/Estadisticas-e-Indicadores/Paginas/Cotizaciones.aspx) permite elegir una fecha y descargar las cotizaciones de ese día en un archivo TXT. Para un día hábil se ve así (recortado):

```text
CAMBIOS Y ARBITRAJES DEL DÍA  2 DE SEPTIEMBRE DE 2026

M E R C A D O    D E    C A M B I O S    I N T E R N A C I O N A L
CÓDIGO EMISOR              DENOMINACIÓN           CÓDIGO         ARBITRAJE
ARS       ARGENTINA              PESO ARGENTINO         0500 *            1510.590100
USD       ESTADOS UNIDOS         DOLAR USA              2222 *               1.000000
EUR       UNION MONET.EUROPEA    EURO                   1111 **              1.158600
C O T I Z A C I O N E S    I N T E R B A N C A R I A S   (M E R C A D O    L O C A L)
EMISOR                 DENOMINACIÓN           CÓDIGO       PROMEDIO
ARGENTINA              PESO ARG.BILLETE       0501  UYU       0.027
ESTADOS UNIDOS         DLS. USA BILLETE       2225  UYU      40.233
URUGUAY                UNIDAD INDEXADA        9800  UI        6.63740
...
*  CONVENCIÓN: UNIDAD DE MONEDA POR DÓLARES DE EE.UU.
** CONVENCIÓN: DÓLARES EE.UU. POR UNIDAD DE MONEDA
```

La sección internacional trae una treintena de monedas por código ISO, cada una con su arbitraje contra el dólar. La sección local trae los promedios interbancarios del día en pesos uruguayos, más las unidades indexadas UI, UP y UR.

Para un parser importan cuatro detalles:

- **Los asteriscos son la convención.** Uno significa unidades de la moneda por dólar; dos, dólares por unidad. La fila del euro está en dólares por euro.
- **La misma moneda puede aparecer dos veces, en unidades distintas.** El peso argentino figura a 1.510,59 por dólar en la sección internacional, y su billete a 0,027 pesos uruguayos en la local.
- **El archivo llega en UTF-8 con saltos de línea de Windows.**
- **Los días sin mercado también devuelven un archivo.** Pedí el sábado 7 de noviembre de 2026, el lunes 2 de noviembre (Día de los Difuntos) y una fecha que todavía no había llegado. Las tres respuestas fueron HTTP 200 con los mismos encabezados, la sección internacional vacía y solo UI, UP y UR en la local, porque esas tienen valor todos los días del año.

Ese último punto define el diseño. "Hoy no hay cotizaciones" es una respuesta normal, y se ve igual si el motivo es un feriado o un día que todavía no se publicó.

## Descargar el archivo

La descarga está en `BcuTxtQuoteProvider`. Llama a un handler del sitio del BCU con la fecha en formato `dd/mm/yyyy` dentro de un parámetro JSON (recortado):

```php
$body = Http::connectTimeout(3)
    ->timeout(15)
    ->withoutVerifying()
    ->retry([100, 500, 1000], 0, fn (Throwable $e): bool => $e instanceof ConnectionException
        || ($e instanceof RequestException
            && ($e->response->serverError() || $e->response->status() === 429)))
    ->get(self::URL, [
        'op' => 'downloadcotizacionestxt',
        'KeyValuePairs' => $payload, // {"KeyValuePairs":{"Fecha":"02/09/2026"}}
    ])
    ->throw()
    ->body();

if (Str::contains($body, 'Servicio no disponible', ignoreCase: true)) {
    throw new QuoteProviderException('The BCU cotizaciones service is unavailable.');
}
```

Reintenta hasta tres veces, y solo ante errores de conexión, errores del servidor y 429; un 4xx no se arregla solo. El último chequeo existe porque, como dejan anotado las reglas del propio proyecto, una caída del BCU puede llegar como HTTP 200 con el texto "Servicio no disponible". Sin él, la caída parecería un cambio de formato.

Sobre `withoutVerifying()`: el servidor no envía el certificado intermedio de su certificado de Abitab, así que muchos clientes fallan con "unable to verify the first certificate". Contamos desactiva la verificación solo para este pedido, con un comentario que explica por qué. La opción más estricta es incluir la cadena del emisor como bundle de CA y pasarla a la opción `verify` de Guzzle.

## Llevar todo a una sola convención

Contamos guarda cada cotización como "1 USD = X unidades de la moneda", por los motivos que explico en [cómo diseñar un libro contable multimoneda](/es/blog/disenar-un-libro-contable-multimoneda/). El trabajo del parser es llevar las convenciones del BCU a esa.

`BcuTxtQuoteParser` corta el archivo en secciones por sus títulos espaciados y lanza una `QuoteProviderException` si falta alguno. En la sección internacional se queda solo con las líneas que tienen forma de fila de moneda:

```php
foreach (Str::of($section)->explode("\n") as $line) {
    $line = Str::trim($line);

    if (! preg_match('/^([A-Z]{3})\s+.+\s+(\d{4})\s+(\*{1,2})\s+([\d.]+)\s*$/', $line, $matches)) {
        continue;
    }

    $quotes[$matches[1]] = $matches[3] === '**' ? bcdiv('1', $matches[4], 18) : $matches[4];
}
```

Las filas con un asterisco ya están en unidades por dólar. Las de dos se invierten con bcmath a 18 decimales, así que el `1.158600` del euro pasa a `0.863110650785430692`. La cotización es un string de punta a punta, como explico en [cómo guardar dinero en una base de datos](/es/blog/guardar-dinero-en-una-base-de-datos/). Recortar cada línea también elimina el retorno de carro, y los encabezados y las líneas vacías simplemente no coinciden.

La sección local usa códigos numéricos del BCU, así que necesita un mapa. El código `2225`, el dólar billete, se mapea a `UYU`: pesos por dólar, que ya es "1 USD = X". Las filas locales solo completan lo que falta, por eso el peso argentino conserva sus 1.510,59 por dólar en lugar de quedar sobrescrito por 0,027.

Conviene revisar la unidad de cada fila que se mapea. Las unidades indexadas de la sección local están en pesos por unidad, no por dólar, así que hay que convertirlas antes de guardarlas en una tabla con una sola convención.

## Guardar un historial

Las cotizaciones se agregan, nunca se actualizan. Cada fila de `quotes` tiene la moneda, una cotización `DECIMAL(36, 18)`, un `observed_at` que indica desde cuándo rige, un `source` y un `recorded_by` opcional para las que cargó una persona. El artículo del libro contable explica por qué es un historial: cada movimiento guarda la cotización de su propio día.

`CreateScheduledQuotes` las escribe dentro de una transacción de base de datos. Carga las monedas marcadas para cotizaciones programadas, le pide al proveedor las de la fecha y omite cualquier moneda que ya tenga una cotización ese día:

```php
$alreadyRecorded = $currency->quotes()
    ->whereDate('observed_at', $date->toDateString())
    ->where('source', QuoteSource::ManualOrScheduled)
    ->exists();
```

Una segunda ejecución para la misma fecha no crea nada. Las cotizaciones manuales y las programadas comparten ese valor de origen, así que si un administrador cargó a mano la cotización del día, el BCU no agrega otra. Es la misma regla que en [webhooks de pago idempotentes](/es/blog/webhooks-de-pago-idempotentes/): una tarea que puede volver a ejecutarse tiene que ser inofensiva la segunda vez.

## Programar la sincronización diaria

El comando es `catalog:sync-scheduled-quotes`, con una opción `--date` para completar días pasados. El módulo de catálogo lo registra en su propio `Routes/console.php`:

```php
Schedule::command(SyncScheduledQuotesCommand::class)
    ->withoutOverlapping()
    ->dailyAt('06:00');
```

`withoutOverlapping()` evita que una ejecución lenta se superponga con la siguiente. Si algo lanza una excepción, el comando la reporta y termina con código de error, así que el sistema de monitoreo de errores se entera. Un día que faltó se completa con `--date=2026-09-02`.

La hora es lo primero que cambiaría. La aplicación corre en UTC, así que las 06:00 son las 03:00 en Montevideo, y sin `--date` el comando pide la fecha actual. El promedio interbancario de un día no puede existir antes de que ese día se opere, así que el pedido recibe la forma vacía que describí arriba y no se registra nada para el dólar, el peso ni el euro. Falla del lado seguro, pero la ejecución programada por sí sola no captura el día.

La solución es pedir una fecha que ya cerró: correr de mañana por el día hábil anterior, o pedirle al web service SOAP del BCU la fecha del último cierre (la operación `awsultimocierre` en `cotizaciones.bcu.gub.uy`) y sincronizar esa. Si se prefiere correr de noche, conviene agregar `->timezone('America/Montevideo')` al schedule para que la hora signifique lo que uno cree.

## Fines de semana, feriados, publicación tardía y datos malos

La mayoría de los casos tiene la misma respuesta: no escribir nada.

| Situación | Qué hace la sincronización |
|---|---|
| Fin de semana o feriado | El archivo no trae USD, UYU ni EUR, así que no se crea nada para ellos. |
| Publicación tardía o ausente | Misma forma que un feriado. Se completa con `--date` cuando aparece. |
| Caída del BCU | "Servicio no disponible" lanza una excepción; el comando falla y lo reporta. |
| Errores del servidor | Se reintenta tres veces y después se lanza la excepción. |
| Cambio de formato | Falta un título de sección y se lanza una excepción; la transacción no deja nada a medias. |

No hay que copiar la cotización del viernes en una fila del sábado. El historial diría que el BCU publicó algo que no publicó, y ya no se podría distinguir una cotización real de un relleno. Se deja el hueco y se resuelve al leer:

```php
public function quoteAsOf(CarbonImmutable $at): ?Quote
{
    return $this->quotes()
        ->where('observed_at', '<=', $at)
        ->orderByDesc('observed_at')
        ->first();
}
```

Un gasto del sábado toma la cotización del viernes porque es la última vigente en ese momento, no porque se haya inventado una fila.

Aquí se encuentran las dos opciones: usar la última conocida o negarse. Una transacción sin cotización recibe `quoteAsOf()` a su fecha y hora; el formulario muestra la cotización y de qué día es, y el usuario puede escribir la que realmente obtuvo. Si no hay ninguna, el formulario lo avisa y el servidor rechaza el guardado, porque `quote` es obligatorio. Usar la última conocida está bien cuando el hueco tiene explicación y el resultado es un valor por defecto visible. Si una cotización vieja puede decidir en silencio algo difícil de deshacer, hay que negarse, o ponerle una antigüedad máxima a la búsqueda.

Lo que Contamos no revisa son los valores en sí. La expresión regular garantiza un número, no uno razonable. Algunos controles baratos que vale la pena agregar: rechazar todo lo que no sea mayor que cero, retener para revisión cualquier cotización que se haya movido más de unos pocos puntos porcentuales respecto de la anterior, y comparar la fecha del encabezado del archivo con la fecha pedida. Tal como está escrito, el parser confía en el pedido.

## Sumar otras fuentes con una interfaz de proveedor

Todo esto está detrás de una sola interfaz:

```php
#[Bind(AggregateQuoteProvider::class)]
interface QuoteProvider
{
    /** @return Collection<int, array{code: string, observed_at: CarbonImmutable, rate: string}> */
    public function quotesOn(CarbonImmutable $date, Collection $currencies): Collection;
}
```

Cada implementación cotiza solo las monedas que maneja. `#[Bind]` le indica al contenedor que use `AggregateQuoteProvider`, que combina una lista de proveedores en orden de precedencia; gana el primero que devuelve un código:

```php
return collect($this->providers)
    ->flatMap(fn (QuoteProvider $provider): Collection => $provider->quotesOn($date, $currencies))
    ->unique('code')
    ->values();
```

La lista tiene una sola entrada, el BCU. Otra fuente es una clase que implementa `quotesOn()` y una línea en esa lista; la acción, el comando y el schedule no cambian. Una advertencia: tal como está, una excepción de cualquier proveedor hace fallar toda la sincronización. Con varias fuentes, probablemente convenga capturarla por proveedor, reportarla y dejar pasar al resto.

## Probar el parser con archivos reales

El parser se prueba contra `tests/Fixtures/bcu-cotizaciones-2026-09-02.txt`, el archivo del BCU del 2 de septiembre de 2026. Volví a descargar esa fecha mientras escribía esto y coincide con lo que sirve el BCU, salvo por los saltos de línea, que el parser maneja porque recorta cada línea.

Los tests verifican valores reales, así que una expresión regular mal escrita aparece como un número equivocado:

```php
it('inverts double-asterisk international rates so one USD equals the currency', function (): void {
    $quotes = (new BcuTxtQuoteParser)->parse(bcuCotizacionesFixture());

    expect($quotes->get('EUR'))->toBe(bcdiv('1', '1.158600', 18));
});
```

Otros cubren el dólar local (`40.233`), que el peso argentino no quede sobrescrito y qué pasa si falta una sección. Los tests de feature corren el comando contra `Http::fake()` con el mismo fixture, un HTTP 500 y una respuesta "Servicio no disponible", y verifican que una segunda ejecución no agregue nada.

El próximo fixture que agregaría es el archivo de un sábado, para que el caso vacío se pruebe contra lo que el BCU manda de verdad.

## Resumen

- Descargar el archivo oficial de una fecha, llevar cada fila a una sola convención y mantener las cotizaciones como strings.
- Conocer la unidad de cada fila. El BCU usa dos convenciones en una sección y pesos en la otra.
- Agregar las cotizaciones a un historial con la fecha desde la que rigen. Nunca sobrescribir, y nunca inventar filas para días sin publicación.
- Hacer que la sincronización se pueda correr dos veces, tener una opción `--date` para completar días y programarla para una fecha que ya cerró.
- Tratar un día vacío como normal, y una caída o un cambio de formato como un error que no escribe nada.
- Leer con "la última vigente a esa fecha", ofrecerla como valor por defecto visible y negarse cuando no hay ninguna.
- Poner cada fuente detrás de una interfaz de proveedor y probar los parsers con archivos que la fuente mandó de verdad.

El esquema al que alimentan estas cotizaciones está en [cómo diseñar un libro contable multimoneda](/es/blog/disenar-un-libro-contable-multimoneda/), y el producto para el que se construyeron, en el [caso de Contamos](/es/work/contamos/).
