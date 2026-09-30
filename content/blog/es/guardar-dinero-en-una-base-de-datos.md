---
title: "Cómo guardar dinero en una base de datos: nunca como float"
description: "DECIMAL o enteros en unidades mínimas, cuántos decimales necesita cada moneda, dónde redondear y cómo mantener los montos exactos en PHP y Laravel."
published: "2026-10-08"
translations: {"en": "store-money-in-a-database"}
---

Para guardar dinero en una base de datos hay que usar un tipo exacto: una columna `DECIMAL` con los decimales suficientes para las monedas que se manejan, o un entero que cuente la unidad mínima de cada moneda. Nunca `FLOAT` ni `DOUBLE`. Y después hay que mantener el monto exacto a la salida, porque en una aplicación PHP la mayor parte del daño ocurre cuando el valor ya salió de la base, no en la columna.

Esa es la respuesta corta. El resto del artículo es lo que aprendí aplicándola en dos sistemas que manejan dinero real: Criptala, una plataforma de trading y pagos en cripto, y Contamos, un libro compartido para dinero guardado en varias monedas.

## Por qué no usar float para dinero

Un float guarda una fracción binaria. La mayoría de las fracciones decimales, incluida `0.1`, no tienen una representación binaria exacta, así que la máquina guarda el valor más cercano posible y cada operación arrastra el error.

```php
var_dump(0.1 + 0.2);              // float(0.30000000000000004)
var_dump(0.1 + 0.2 == 0.3);       // bool(false)
var_dump(json_encode(0.1 + 0.2)); // string(19) "0.30000000000000004"
```

En un precio que se muestra en pantalla, el formato esconde el error. En un saldo que es la suma de miles de movimientos, o en una comparación del tipo "¿esta orden está totalmente pagada?", no. Un libro contable tiene que cerrar hasta la última unidad, y un tipo que no puede representar `0.10` de forma exacta no lo puede garantizar.

La solución no es "redondear más seguido". Es que el monto nunca pase a ser un float en ningún momento.

## DECIMAL o enteros en unidades mínimas

Hay dos formas exactas de guardar un monto, y las dos son correctas.

| | `DECIMAL(p, s)` | Entero en unidades mínimas |
|---|---|---|
| Qué se guarda | `12.50` | `1250` (centavos) |
| Exacto | Sí | Sí |
| Legible en SQL | Sí | Hace falta el exponente para leerlo |
| Agregados en SQL | `SUM()` exacto | `SUM()` exacto |
| Monedas mezcladas | Una sola escala sirve para todas, si es lo bastante ancha | Cada fila necesita el exponente de su moneda para leerse |
| Unidades muy pequeñas | Sin problema hasta 30 decimales en MySQL | Desborda un `BIGINT` enseguida |

Los enteros en unidades mínimas son lo que usan muchas APIs de pago. [Stripe](https://docs.stripe.com/currencies#zero-decimal), por ejemplo, recibe los montos como enteros en la unidad más pequeña de la moneda, así que `1000` son 10,00 USD pero 1.000 JPY. Funciona bien mientras solo se manejen monedas fiat con cero, dos o tres decimales.

Con cripto deja de funcionar. Ether tiene 18 decimales. Un `BIGINT` con signo llega a unos 9,22 × 10¹⁸, que en wei son apenas 9,22 ETH. Una columna que no puede guardar diez ether no sirve para dinero.

Por eso mis dos sistemas usan `DECIMAL`:

- **Criptala** guarda montos, subtotales y tipos de cambio como `DECIMAL(19, 8)` o `DECIMAL(20, 8)`. Ocho decimales cubren el satoshi, la unidad mínima de bitcoin, y todas las monedas fiat con las que liquida la plataforma.
- **Contamos** guarda cada monto y cada tipo de cambio como `DECIMAL(36, 18)`, y cada saldo como `DECIMAL(38, 18)`. Dieciocho decimales cubren cualquier token que alguien pueda tener, y el saldo tiene dos dígitos enteros más porque es una suma acumulada.

En MySQL, `DECIMAL` admite hasta 65 dígitos en total y hasta 30 después de la coma, y lo que ocupa depende de los dígitos declarados, no del valor guardado. La escala se elige según la unidad más pequeña que se vaya a necesitar, y la precisión según el total más grande que se vaya a sumar.

## Cuántos decimales tiene cada moneda

Que la columna sea ancha no significa que cada monto tenga que usarla entera. Cada moneda tiene su propia cantidad de decimales, y la aplicación tiene que hacerla cumplir.

| Moneda | Decimales | Unidad mínima |
|---|---|---|
| JPY | 0 | 1 yen |
| USD, EUR, UYU | 2 | 1 centavo |
| KWD, BHD | 3 | 1 fils |
| USDT (en la mayoría de las redes) | 6 | 0,000001 |
| BTC | 8 | 1 satoshi |
| ETH | 18 | 1 wei |

Los valores de las monedas fiat salen de [ISO 4217](https://www.iso.org/iso-4217-currency-codes.html). Para cripto no hay un estándar equivalente: los decimales los define cada red o cada contrato de token, así que tienen que vivir en los datos y no en el código.

En Contamos, la tabla `currencies` tiene una columna `decimal_places`, y cada transacción la copia al guardarse. La request que registra una transacción valida el monto contra su moneda:

```php
'amount' => [
    'required',
    "decimal:0,{$currency->decimal_places}",
    'gt:0',
],
```

Así, un monto en pesos con tres decimales se rechaza antes de llegar a la base, y uno en un token con dieciocho se acepta. La columna sigue siendo ancha; las reglas son por moneda.

## Dónde redondear y con qué modo de redondeo

Guardar valores exactos no elimina el redondeo. Dividir sigue produciendo dígitos que no se pueden conservar: un tercio de 100,00 es 33,333…, y dividir una cuenta entre tres deja un centavo en algún lado.

Hay tres reglas que me funcionaron:

1. **Redondear una sola vez, en un borde.** Mantener la precisión completa durante el cálculo y redondear cuando el valor se guarda, se paga o se muestra. Redondear resultados intermedios acumula el error.
2. **Elegir el modo de redondeo a propósito.** Hacia arriba desde la mitad (*half-up*) es lo que la mayoría espera ver en un recibo. El redondeo al par (*half-even*, o redondeo bancario) manda los empates al vecino par, así que no se desvían siempre hacia el mismo lado a lo largo de muchas operaciones. La mayor parte de la aritmética de Criptala usa *half-even*.
3. **No perder el resto.** Cuando un monto se reparte en partes, las partes tienen que volver a sumar el original. Las unidades que sobran se asignan a alguna de las partes en lugar de dejar que desaparezcan.

## Dinero en PHP: los errores más comunes

PDO devuelve las columnas `DECIMAL` de MySQL como strings, que es el punto de partida correcto. La mayoría de los errores aparecen al convertir ese string en float sin darse cuenta.

- **Operadores aritméticos.** En PHP, `'0.1' + '0.2'` da un float. Los strings numéricos se convierten en silencio en cuanto se les aplica `+`, `-`, `*` o `/`.
- **Casts.** `(float) $amount`, o un parámetro de tipo `float` en un método, tiran la exactitud sin avisar.
- **`round()` y `number_format()`.** Las dos reciben floats. Sirven para mostrar, al final de todo, nunca para un valor que se va a guardar.
- **`json_encode()`.** Un float se codifica con todo su ruido binario, como en el ejemplo de arriba. Un string se codifica tal como está.

La regla que se desprende es simple: un monto es un string o un objeto de precisión arbitraria, nunca un número de PHP.

Para la aritmética hay dos buenas opciones.

**bcmath** viene con PHP y trabaja sobre strings. Trunca a la escala que se le pasa en lugar de redondear, así que conviene pasarle una escala al menos tan ancha como la de la columna. El reporte mensual de Contamos calcula sus netos así:

```php
$net = bcsub($income, $expenses, 18);
```

PHP 8.4 agregó además `bcround()` y una API de objetos, `BcMath\Number`, para quien prefiera operadores a llamadas a funciones.

**[brick/math](https://github.com/brick/math)** ofrece un `BigDecimal` inmutable con modos de redondeo explícitos. Criptala lo usa en todos lados:

```php
use Brick\Math\BigDecimal;
use Brick\Math\RoundingMode;

$total = BigDecimal::of('19.99')->multipliedBy(3);                    // 59.97
$share = BigDecimal::of('100.00')->dividedBy(3, 2, RoundingMode::HalfEven); // 33.33
```

Si se quiere que el monto venga atado a su moneda, [brick/money](https://github.com/brick/money) se apoya en la anterior con un tipo `Money` que conoce los decimales de cada moneda y puede repartir un monto en partes que vuelven a sumar el total.

## Cómo guardar dinero en Laravel

Laravel resuelve casi todo esto si se lo deja.

La migración declara una columna exacta:

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

El modelo la castea con el cast `decimal`, que devuelve un string, no un float:

```php
protected function casts(): array
{
    return [
        'amount' => 'decimal:18',
        'quote' => 'decimal:18',
    ];
}
```

Por dentro, ese cast pasa el valor por brick/math y redondea *half-up* a la escala indicada. Los casts `float` y `double` no deberían usarse en nada que sea dinero.

Siempre que se pueda, conviene que la aritmética la haga la base. En MySQL, `SUM()` sobre una columna `DECIMAL` es exacto, y también lo es un update que suma sobre un saldo. Contamos mueve un saldo con una expresión como `balance + amount` dentro de la misma transacción de base de datos que escribe el movimiento, así que la suma nunca pasa por PHP. Lo mismo con los reportes: agregar en SQL y, si hay que hacer algo más con el resultado, pasárselo a bcmath como string.

## Montos como strings en las APIs

El último borde es la API. Los números de JavaScript son doubles, igual que los floats de PHP, así que un número JSON que es exacto en el servidor puede dejar de serlo cuando lo parsea el cliente.

Los montos se mandan como strings decimales: `"amount": "1250.50"`, no `"amount": 1250.5`. Laravel lo hace solo cuando el modelo usa el cast `decimal`, porque el atributo ya es un string. A la entrada, aceptar strings y validarlos con la regla `decimal`, para que un cliente tampoco pueda mandar un float.

Las herramientas de IA de Contamos siguen la misma regla: los montos entran y salen como strings decimales exactos en unidades mayores, y a los asistentes se les indica que nunca manden floats.

## Resumen

- Usar `DECIMAL`, o enteros en unidades mínimas si solo se manejan monedas fiat con pocos decimales. Nunca `FLOAT` ni `DOUBLE`.
- Dimensionar la escala para la unidad más pequeña que se vaya a guardar. Si hay cripto de por medio, eso son al menos 8 decimales, y 18 para ir sobre seguro.
- Guardar los decimales de cada moneda como dato y validar cada monto contra ellos.
- En PHP, mantener los montos como strings u objetos `BigDecimal`. Que ningún operador, cast o `json_encode()` los convierta en floats.
- Redondear una sola vez, en un borde, con un modo de redondeo elegido.
- Sumar en SQL y mandar los montos como strings en las APIs.

Una vez que los montos son exactos, el paso siguiente es mantener varias monedas separadas sin mezclarlas en un total engañoso. Sobre eso escribí en [cómo diseñar un libro contable multimoneda](/es/blog/disenar-un-libro-contable-multimoneda/). El sistema detrás de la mayoría de estos ejemplos está descrito en el [caso de Contamos](/es/work/contamos/).
