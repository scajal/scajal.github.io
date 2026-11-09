---
title: "Syncing official BCU exchange rates daily in Laravel"
description: "How to sync Banco Central del Uruguay exchange rates in Laravel: parse the daily TXT, keep a rate history, schedule it, handle weekends and bad data."
published: "2026-11-17"
translations: {"es": "cotizaciones-oficiales-del-bcu-en-laravel"}
---

To sync official exchange rates in Laravel, download the central bank's file for a date, parse it into one rate per currency against a single reference currency, and append those rates to a history table with the date they apply to. Run it from the scheduler, make a second run harmless, and when a day has no rates, store nothing. The code that reads rates should fall back to the latest one at or before the moment it needs, and refuse only when there is no rate at all.

This post walks through that with the Banco Central del Uruguay (BCU) as the source, using the code from Contamos, a shared ledger for money held in several currencies. Contamos is [open source on GitHub](https://github.com/scajal/contamos) under the MIT licence, so every snippet below can be read in full there.

## What the BCU publishes

The BCU's [Cotizaciones page](https://www.bcu.gub.uy/Estadisticas-e-Indicadores/Paginas/Cotizaciones.aspx) lets you pick a date and download that day's rates as a TXT file. For a business day it looks like this (trimmed):

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

The international section lists about thirty currencies by ISO code, each with an *arbitraje* against the dollar. The local section has the day's average interbank rates in Uruguayan pesos, plus the indexed units UI, UP and UR.

Four details matter for a parser:

- **The asterisks are the convention.** One means units of the currency per dollar; two mean dollars per unit. The euro row is dollars per euro.
- **The same currency can appear twice, in different units.** The Argentine peso is 1,510.59 per dollar in the international section, and its *billete* is 0.027 Uruguayan pesos in the local one.
- **The file comes as UTF-8 with Windows line endings.**
- **Days without a market still return a file.** I requested Saturday 7 November 2026, Monday 2 November 2026 (Día de los Difuntos) and a date that had not happened yet. All three came back as HTTP 200 with the same headers, an empty international section, and only UI, UP and UR in the local one, since those have a value every calendar day.

That last point shapes the design. "No rates today" is a normal answer, and it looks the same whether the reason is a holiday or a day not yet published.

## Fetching the file

The download lives in `BcuTxtQuoteProvider`. It calls a handler on the BCU's site with the date as `dd/mm/yyyy` inside a JSON parameter (trimmed):

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

It retries up to three times, and only on connection errors, server errors and 429s; a 4xx will not fix itself. The last check is there because, as the code's own notes record, a BCU outage can arrive as HTTP 200 with the text "Servicio no disponible". Without it, the outage would look like a format change.

About `withoutVerifying()`: the server does not send the intermediate of its Abitab certificate, so many clients fail with "unable to verify the first certificate". Contamos turns verification off for this one request, with a comment saying why. The stricter option is to ship the issuing chain as a CA bundle and pass it to Guzzle's `verify` option.

## Parsing into one convention

Contamos stores every rate as "1 USD = X units of the currency", for the reasons in [how to design a multi-currency ledger](/en/blog/multi-currency-ledger-design/). The parser's job is to turn the BCU's conventions into that one.

`BcuTxtQuoteParser` cuts the file into sections by their spaced-out titles and throws a `QuoteProviderException` if a marker is missing. In the international section it keeps only lines shaped like a currency row:

```php
foreach (Str::of($section)->explode("\n") as $line) {
    $line = Str::trim($line);

    if (! preg_match('/^([A-Z]{3})\s+.+\s+(\d{4})\s+(\*{1,2})\s+([\d.]+)\s*$/', $line, $matches)) {
        continue;
    }

    $quotes[$matches[1]] = $matches[3] === '**' ? bcdiv('1', $matches[4], 18) : $matches[4];
}
```

Single-asterisk rows are already units per dollar. Double-asterisk rows are inverted with bcmath at 18 decimal places, so the euro's `1.158600` becomes `0.863110650785430692`. The rate stays a string the whole way, as in [how to store money in a database](/en/blog/store-money-in-a-database/). Trimming each line also strips the carriage return, and headers and blank lines simply do not match.

The local section uses BCU numeric codes, so it needs a map. Code `2225`, the dollar *billete*, maps to `UYU`: pesos per dollar, already "1 USD = X". Local rows only fill gaps, so the Argentine peso keeps its 1,510.59 per dollar instead of being overwritten by 0.027.

Check the unit of every row you map. The indexed units in the local section are quoted in pesos per unit, not per dollar, so they need converting before they go into a table with a single convention.

## Storing a history

Rates are appended, never updated. Each row in `quotes` has the currency, a `DECIMAL(36, 18)` rate, an `observed_at` for when it starts to apply, a `source`, and a nullable `recorded_by` for rates a person typed. The ledger post explains why it is a history: every movement stores the rate of its own day.

`CreateScheduledQuotes` writes them inside a database transaction. It loads the currencies marked for scheduled quotes, asks the provider for the date, and skips any currency that already has a quote for that day:

```php
$alreadyRecorded = $currency->quotes()
    ->whereDate('observed_at', $date->toDateString())
    ->where('source', QuoteSource::ManualOrScheduled)
    ->exists();
```

A second run for the same date creates nothing. Manual and scheduled quotes share that source value, so a rate an administrator typed for the day is not joined by a second one from the BCU. It is the same rule as in [idempotent payment webhooks](/en/blog/idempotent-payment-webhooks/): a job that may run again has to be harmless the second time.

## Scheduling the daily sync

The command is `catalog:sync-scheduled-quotes`, with an optional `--date` for backfills. The catalog module registers it in its own `Routes/console.php`:

```php
Schedule::command(SyncScheduledQuotesCommand::class)
    ->withoutOverlapping()
    ->dailyAt('06:00');
```

`withoutOverlapping()` keeps a slow run from racing the next one. When anything throws, the command reports the exception and exits with a failure code, so the error tracker hears about it. A missed day is filled with `--date=2026-09-02`.

The hour is what I would change first. The application runs in UTC, so 06:00 is 03:00 in Montevideo, and without `--date` the command asks for the current date. A day's average interbank rate cannot exist before that day's trading, so the request gets the empty shape described above and nothing is recorded for the dollar, the peso or the euro. That fails safe, but the scheduled run on its own does not capture the day.

The fix is to ask for a date that has closed: run in the morning for the previous business day, or ask the BCU's SOAP web service for the date of the last closing (the `awsultimocierre` operation at `cotizaciones.bcu.gub.uy`) and sync that. If you would rather run in the evening, set `->timezone('America/Montevideo')` on the schedule so the hour means what you think it means.

## Weekends, holidays, late publication and bad data

Most failure modes have the same answer: write nothing.

| Situation | What the sync does |
|---|---|
| Weekend or holiday | Nothing for USD, UYU or EUR in the file, so nothing is created for them. |
| Late or missing publication | Same shape as a holiday. Backfill with `--date` once it is out. |
| BCU outage | "Servicio no disponible" throws; the command fails and reports it. |
| Server errors | Retried three times, then thrown. |
| Format change | A missing section marker throws; the transaction leaves nothing half-written. |

Do not copy Friday's rate into Saturday's row. The history would claim the BCU published something it did not, and you could no longer tell a real rate from filler. Leave the gap and let the read side handle it:

```php
public function quoteAsOf(CarbonImmutable $at): ?Quote
{
    return $this->quotes()
        ->where('observed_at', '<=', $at)
        ->orderByDesc('observed_at')
        ->first();
}
```

A Saturday expense gets Friday's rate because it is the latest one at or before that moment, not because a row was invented.

This is where falling back and refusing meet. A transaction without a rate gets `quoteAsOf()` at its date and time; the form shows "Rate of" and that rate's date, and the user can type the rate they actually got. With no rate at all, the form says so and the server refuses the save, because `quote` is required. Fall back when the gap has an explanation and the result is a visible default. If a stale rate could silently drive something hard to undo, refuse, or put a maximum age on the lookup.

What Contamos does not check is the values themselves. The regular expression guarantees a number, not a sensible one. Cheap guards worth adding: reject anything not greater than zero, hold for review any rate that moved more than a few percent from the previous one, and compare the date in the file's header with the date you asked for. As written, the parser trusts the request.

## Adding other sources with a provider interface

All of this sits behind one interface:

```php
#[Bind(AggregateQuoteProvider::class)]
interface QuoteProvider
{
    /** @return Collection<int, array{code: string, observed_at: CarbonImmutable, rate: string}> */
    public function quotesOn(CarbonImmutable $date, Collection $currencies): Collection;
}
```

Each implementation quotes only the currencies it handles. `#[Bind]` points the container at `AggregateQuoteProvider`, which merges a list of providers in order of precedence; the first to return a code wins:

```php
return collect($this->providers)
    ->flatMap(fn (QuoteProvider $provider): Collection => $provider->quotesOn($date, $currencies))
    ->unique('code')
    ->values();
```

The list has one entry, the BCU. Another source is a class that implements `quotesOn()` and a line in that list; the action, the command and the schedule do not change. One caveat: as written, an exception from any provider fails the whole sync. With several sources you probably want to catch per provider, report it, and let the others through.

## Testing the parser against real files

The parser is tested against `tests/Fixtures/bcu-cotizaciones-2026-09-02.txt`, the BCU's file for 2 September 2026. I downloaded that date again while writing this, and it matches what the BCU serves except for the line endings, which the parser handles because it trims each line.

The tests assert real values, so a wrong regular expression shows up as a wrong number:

```php
it('inverts double-asterisk international rates so one USD equals the currency', function (): void {
    $quotes = (new BcuTxtQuoteParser)->parse(bcuCotizacionesFixture());

    expect($quotes->get('EUR'))->toBe(bcdiv('1', '1.158600', 18));
});
```

Others cover the local dollar rate (`40.233`), the Argentine peso not being overwritten, and missing sections. Feature tests run the command against `Http::fake()` with the fixture, an HTTP 500 and a "Servicio no disponible" body, and check that a second run adds nothing.

The fixture I would add next is a Saturday file, so the empty case is tested against what the BCU really sends.

## Summary

- Download the official file for a date, convert every row to one convention, and keep rates as strings.
- Know the unit of each row. The BCU uses two conventions in one section and pesos in the other.
- Append rates to a history with the date they apply from. Never overwrite, and never invent rows for days without a publication.
- Make the sync safe to run twice, keep a `--date` option for backfills, and schedule it for a date that has closed.
- Treat an empty day as normal and an outage or format change as a failure that writes nothing.
- Read with "latest at or before", offer it as a visible default, and refuse when there is no rate at all.
- Put each source behind a provider interface, and test parsers against files the source really sent.

The schema these rates feed is in [how to design a multi-currency ledger](/en/blog/multi-currency-ledger-design/), and the product they were built for is in the [Contamos case study](/en/work/contamos/).
