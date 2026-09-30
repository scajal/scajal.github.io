---
title: "How to store money in a database: never as a float"
description: "DECIMAL or integer minor units, how many decimal places each currency needs, where to round, and how to keep amounts exact in PHP and Laravel."
published: "2026-10-08"
translations: {"es": "guardar-dinero-en-una-base-de-datos"}
---

To store money in a database, use an exact type: a `DECIMAL` column with enough decimal places for the currencies you handle, or an integer that counts the currency's smallest unit. Never use `FLOAT` or `DOUBLE`. Then keep the amount exact on the way out as well, because most of the damage in a PHP application happens after the value has left the database, not in the column itself.

That is the short answer. The rest of this post is what I have learned applying it to two systems that hold real money: Criptala, a crypto trading and payments platform, and Contamos, a shared ledger for money kept in several currencies.

## Why floats are wrong for money

A float stores a binary fraction. Most decimal fractions, including `0.1`, have no exact binary representation, so the machine stores the nearest value it can and every operation carries the error forward.

```php
var_dump(0.1 + 0.2);              // float(0.30000000000000004)
var_dump(0.1 + 0.2 == 0.3);       // bool(false)
var_dump(json_encode(0.1 + 0.2)); // string(19) "0.30000000000000004"
```

For a single price shown on a page, the error hides behind formatting. For a balance that is the sum of thousands of movements, or a comparison such as "is this order fully paid", it does not. A ledger has to agree with itself to the last unit, and a type that cannot represent `0.10` exactly cannot promise that.

The fix is not "round more often". It is to never let the amount become a float at any point.

## DECIMAL vs integer minor units

There are two exact ways to store an amount, and both are sound.

| | `DECIMAL(p, s)` | Integer minor units |
|---|---|---|
| What is stored | `12.50` | `1250` (cents) |
| Exact | Yes | Yes |
| Readable in SQL | Yes | Needs the exponent to read |
| Aggregates in SQL | Exact `SUM()` | Exact `SUM()` |
| Mixed currencies | One scale fits all, if it is wide enough | Each row needs its currency's exponent to be read |
| Very small units | Fine up to 30 decimal places in MySQL | Overflows `BIGINT` quickly |

Integer minor units are what many payment APIs use. [Stripe](https://docs.stripe.com/currencies#zero-decimal), for example, takes amounts as integers in the currency's smallest unit, so `1000` means 10.00 USD but 1,000 JPY. That works well when you only handle fiat currencies with zero, two or three decimal places.

It breaks down with crypto. Ether has 18 decimal places. A signed `BIGINT` tops out at about 9.22 × 10¹⁸, which in wei is roughly 9.22 ETH. A column that cannot hold ten ether is not a money column.

This is why both of my systems use `DECIMAL`:

- **Criptala** stores amounts, subtotals and exchange rates as `DECIMAL(19, 8)` or `DECIMAL(20, 8)`. Eight decimal places covers bitcoin's smallest unit, the satoshi, and every fiat currency the platform settles in.
- **Contamos** stores every amount and every exchange rate as `DECIMAL(36, 18)`, and each balance as `DECIMAL(38, 18)`. Eighteen decimal places covers any token a user might hold, and the balance gets two extra integer digits because it is a running sum.

In MySQL, `DECIMAL` allows up to 65 digits in total and up to 30 after the point, and the storage cost grows with the digits you declare, not the value you store. Pick the scale from the smallest unit you will ever need, and the precision from the largest total you will ever sum.

## How many decimal places each currency needs

A wide column does not mean every amount should use all of it. Each currency has its own number of decimal places, and the application should enforce it.

| Currency | Decimal places | Smallest unit |
|---|---|---|
| JPY | 0 | 1 yen |
| USD, EUR, UYU | 2 | 1 cent |
| KWD, BHD | 3 | 1 fils |
| USDT (on most chains) | 6 | 0.000001 |
| BTC | 8 | 1 satoshi |
| ETH | 18 | 1 wei |

The fiat values come from [ISO 4217](https://www.iso.org/iso-4217-currency-codes.html). Crypto has no such standard; the number of decimals is set by each chain or token contract, so it belongs in your data, not in your code.

In Contamos, the `currencies` table has a `decimal_places` column, and each transaction copies it when it is written. The request that records a transaction validates the amount against its currency:

```php
'amount' => [
    'required',
    "decimal:0,{$currency->decimal_places}",
    'gt:0',
],
```

So a peso amount with three decimals is rejected before it ever reaches the database, while a token amount with eighteen is accepted. The column stays wide; the rules stay per currency.

## Where to round, and which rounding mode

Storing exact values does not remove rounding. Division still produces digits you cannot keep: a third of 100.00 is 33.333…, and splitting a bill three ways has to leave one cent somewhere.

Three rules have held up for me:

1. **Round once, at a boundary.** Keep full precision through a calculation and round when the value is stored, paid or shown. Rounding intermediate results compounds the error.
2. **Choose the rounding mode on purpose.** Half-up is what most people expect on a receipt. Half-even, also called banker's rounding, sends ties to the even neighbour, so ties do not drift in one direction across many operations. Most of Criptala's arithmetic uses half-even.
3. **Account for the remainder.** When one amount is split into parts, the parts have to add back up to the original. Give the leftover units to one of the parts rather than letting them disappear.

## Money in PHP: the pitfalls

PDO returns MySQL `DECIMAL` columns as strings, which is the right starting point. Most bugs come from turning that string into a float without noticing.

- **Arithmetic operators.** `'0.1' + '0.2'` is a float in PHP. Numeric strings are converted silently the moment you use `+`, `-`, `*` or `/` on them.
- **Casts.** `(float) $amount` or a `float` parameter type on a method quietly throws the exactness away.
- **`round()` and `number_format()`.** Both take floats. Use them for display, at the very end, never on a value you intend to store.
- **`json_encode()`.** A float is encoded with all its binary noise, as shown above. A string is encoded as written.

The rule that follows is simple: an amount is a string or an arbitrary-precision object, never a PHP number.

For the arithmetic itself there are two good options.

**bcmath** ships with PHP and works on strings. It truncates to the scale you pass rather than rounding, so pass a scale at least as wide as your column. Contamos' monthly report computes its net figures this way:

```php
$net = bcsub($income, $expenses, 18);
```

PHP 8.4 also added `bcround()` and an object API, `BcMath\Number`, if you prefer operators to function calls.

**[brick/math](https://github.com/brick/math)** gives you an immutable `BigDecimal` with explicit rounding modes. Criptala uses it throughout:

```php
use Brick\Math\BigDecimal;
use Brick\Math\RoundingMode;

$total = BigDecimal::of('19.99')->multipliedBy(3);                    // 59.97
$share = BigDecimal::of('100.00')->dividedBy(3, 2, RoundingMode::HalfEven); // 33.33
```

If you want amounts tied to their currency, [brick/money](https://github.com/brick/money) builds on it with a `Money` type that knows each currency's decimal places and can split an amount into parts that add back up to the whole.

## Storing money in Laravel

Laravel gets most of this right if you let it.

The migration declares an exact column:

```php
Schema::create('transactions', function (Blueprint $table): void {
    $table->ulid('id')->primary();
    $table->decimal('amount', 36, 18);
    $table->foreignIdFor(Currency::class)->constrained();
    $table->unsignedTinyInteger('decimal_places')->default(2);
    $table->decimal('quote', 36, 18);
    $table->timestamps();
});
```

The model casts it with the `decimal` cast, which returns a string, not a float:

```php
protected function casts(): array
{
    return [
        'amount' => 'decimal:18',
        'quote' => 'decimal:18',
    ];
}
```

Internally, that cast runs the value through brick/math and rounds half-up to the scale you give it. Avoid the `float` and `double` casts on anything that is money.

Where you can, let the database do the arithmetic. `SUM()` over a `DECIMAL` column is exact in MySQL, and so is an update that adds to a balance in place. Contamos moves a balance with an expression like `balance + amount` inside the same database transaction that writes the movement, so the sum never passes through PHP at all. The same goes for reports: aggregate in SQL and hand the string result to bcmath if anything else needs to happen to it.

## Send amounts as strings across APIs

The last boundary is the API. JavaScript numbers are doubles, just like PHP floats, so a JSON number that is exact on the server may not be exact once a client parses it.

Send amounts as decimal strings: `"amount": "1250.50"`, not `"amount": 1250.5`. Laravel does this for you when the model uses the `decimal` cast, since the attribute is already a string. Accept strings on the way in and validate them with the `decimal` rule, so a client cannot hand you a float either.

Contamos' AI tools follow the same rule: amounts go in and out as exact decimal strings in major units, and the assistants are told never to send floats.

## Summary

- Use `DECIMAL`, or integer minor units if you only handle fiat currencies with small exponents. Never `FLOAT` or `DOUBLE`.
- Size the scale for the smallest unit you will ever store. If crypto is in scope, that means 8 decimal places at least, and 18 to be safe.
- Store each currency's decimal places as data and validate every amount against them.
- Keep amounts as strings or `BigDecimal` objects in PHP. Never let an arithmetic operator, a cast or `json_encode()` turn them into floats.
- Round once, at a boundary, with a rounding mode you chose.
- Sum in SQL, and send amounts across APIs as strings.

The next step, once amounts are exact, is keeping several currencies apart without blending them into one misleading total. I wrote about that in [how to design a multi-currency ledger](/en/blog/multi-currency-ledger-design/). The system behind most of these examples is described in the [Contamos case study](/en/work/contamos/).
