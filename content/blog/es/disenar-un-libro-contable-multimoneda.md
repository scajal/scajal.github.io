---
title: "Cómo diseñar un libro contable multimoneda: el esquema"
description: "Cómo modelar un libro contable multimoneda: un saldo por moneda, el tipo de cambio del día en cada movimiento, transferencias en dos patas y reversas exactas."
published: "2026-10-15"
translations: {"en": "multi-currency-ledger-design"}
---

Un libro contable multimoneda tiene que llevar un saldo por moneda en lugar de un total convertido, guardar el tipo de cambio del día en cada movimiento, registrar un cambio de moneda como dos movimientos, uno en cada moneda, y hacer que cada edición o borrado deshaga su efecto de forma exacta. Convertir a una sola moneda solo cuando alguien hace una pregunta que lo necesita, con los tipos de cambio guardados, nunca con el de hoy.

Ese es el diseño detrás de Contamos, un libro compartido que construí para dinero guardado en pesos, dólares y cripto al mismo tiempo. Este artículo recorre su esquema de base de datos y el porqué de cada decisión.

## El problema de un total convertido

La mayoría de las herramientas de finanzas personales, y casi todas las planillas, eligen una moneda principal y convierten todo a ella. Queda prolijo, y esconde tres problemas:

- **El total se mueve solo.** Si cambia la cotización, cambia el saldo, aunque nadie haya gastado nada.
- **Se pierde lo que realmente se tiene.** "El equivalente a 2.000 dólares" no dice si alcanza para pagar el alquiler en pesos esta semana.
- **La historia se reescribe.** Una compra convertida al cambio de hoy no es lo que costó cuando se hizo.

El error de fondo es tratar la conversión como almacenamiento. La conversión es una vista. Lo que pasó es que se movió cierto monto de cierta moneda en cierto día, y eso es lo que el libro tiene que registrar.

## El esquema de un vistazo

Contamos guarda el dinero en cinco tablas. Reducidas a las columnas que importan aquí:

```sql
currencies        (id, code, decimal_places, type)
quotes            (id, currency_id, rate DECIMAL(36,18), observed_at, source)
account_currencies(id, account_id, currency_id, balance DECIMAL(38,18))  -- único (account_id, currency_id)
transfers         (id, occurred_at, description)
transactions      (id, account_id, currency_id, amount DECIMAL(36,18), decimal_places,
                   type, quote DECIMAL(36,18), occurred_at, transfer_id NULL)
```

Todos los montos y tipos de cambio son `DECIMAL` exactos. Por qué importa, y cómo mantenerlos exactos en PHP, está en [cómo guardar dinero en una base de datos](/es/blog/guardar-dinero-en-una-base-de-datos/). El resto de este artículo trata sobre la forma.

## Un saldo por moneda

Una cuenta en Contamos no es un solo número. Es un conjunto de filas en `account_currencies`, una por cada moneda que tiene, con una restricción única sobre el par. Una cuenta bancaria con pesos y dólares tiene dos saldos, y el resumen dice "12.400 UYU y 850 USD", que es lo que realmente hay.

Cada fila de `currencies` tiene sus propios `decimal_places`: 2 para el peso y el dólar, 6 para una stablecoin como USDT, y lo que diga la red o el contrato del token para cualquier otra cripto. Los montos se validan contra ese valor al entrar, y cada transacción lo copia al guardarse, así que un movimiento se puede seguir leyendo bien aunque la definición de la moneda cambie después.

El saldo es un valor cacheado. La fuente de verdad es la lista de transacciones, y el saldo de cualquier cuenta en cualquier moneda es la suma con signo de sus movimientos. Vale la pena tener el caché porque todas las pantallas necesitan saldos y nadie quiere sumar un año de transacciones para dibujar uno. El costo es que cada escritura tiene que mantenerlo correcto, y para eso está el resto del diseño.

## Guardar el tipo de cambio del día en cada movimiento

Cada transacción guarda un `quote`: la cotización de su moneda el día en que ocurrió. En Contamos la cotización se expresa contra el dólar estadounidense, como cuánto de esa moneda compra un dólar. Un gasto en pesos un día en que el dólar estaba a 40,12 guarda `40.12`; un gasto en dólares guarda `1`.

Algunas reglas hacen que esto sea útil y no decorativo:

- **La cotización se escribe una vez y no sigue al mercado.** Leer un movimiento un año después da el valor que tenía en su propio día.
- **La cotización que se obtuvo le gana a la publicada.** Si una tarjeta, una casa de cambio o un amigo dieron su propio cambio, ese es el que hay que guardar. Por defecto, Contamos toma la última cotización de su catálogo `quotes` a la fecha y hora de la transacción, y deja que el usuario escriba la suya.
- **Sin cotización no hay movimiento.** Una transacción no se puede guardar sin una. Una cotización que falta y se descubre al armar un reporte es mucho más difícil de arreglar que una que se pide al cargar.

La tabla `quotes` es un historial, no un único valor actual por moneda. Cada fila tiene un `observed_at` y un `source`, así que se puede buscar la cotización de cualquier momento y distinguir una escrita a mano de una obtenida automáticamente.

Anclar todas las cotizaciones a una moneda de referencia tiene una ventaja práctica: convertir entre dos monedas cualesquiera necesita solo dos cotizaciones, no una por cada par. Un monto en pesos vale `amount / quote` dólares, y desde ahí cualquier otra moneda está a una multiplicación.

## El signo lo pone el tipo, no el monto

En Contamos los montos siempre son positivos. Una regla de validación exige `amount > 0`, y la dirección la da el `type` de la transacción:

| Tipo | Efecto en el saldo |
|---|---|
| `income` | + |
| `expense` | − |
| `opening_balance` | + |
| `transfer_in` | + |
| `transfer_out` | − |

Cada tipo conoce su signo y su inverso. Esa decisión pequeña elimina toda una clase de errores, como un gasto negativo que termina funcionando como ingreso, y hace que revertir sea trivial, como se ve más abajo.

## Transferencias y cambios de moneda en dos patas

Mover dinero entre cuentas, o de una moneda a otra, no es un movimiento. Es dinero que sale de un lugar y dinero que llega a otro, posiblemente en otra moneda y a un cambio que no es el del mercado.

Contamos registra una transferencia como una fila padre en `transfers` y dos transacciones que apuntan a ella:

- un `transfer_out` en la cuenta de origen, en la moneda de origen, por el monto enviado;
- un `transfer_in` en la cuenta de destino, en la moneda de destino, por el monto recibido.

Cada pata tiene su propia cotización. Cambiar 100 dólares a pesos en una casa de cambio que pagó 39,50 queda registrado como 100 USD que salen y 3.950 UYU que entran. El cambio efectivo es simplemente el cociente entre los dos montos, y en el medio no se crea ni se pierde nada.

Las comisiones no se meten dentro de ninguna pata. Si el origen o el destino cobran una comisión, se registra como un `expense` aparte de ese lado, en la moneda de ese lado, que pertenece a la misma transferencia. Los dos saldos quedan correctos y la comisión aparece donde se pagó.

Una transacción que pertenece a una transferencia solo se edita o se borra a través de la transferencia. Dejar que alguien borre una pata sola dejaría medio cambio de moneda en los libros.

## Reversas que devuelven el saldo exacto

En un libro con saldos cacheados, la propiedad más importante es que deshacer algo deje cada saldo exactamente donde estaba. Contamos lo logra con tres reglas:

1. **Cada escritura es una transacción de base de datos.** Crear un movimiento inserta la fila y ajusta el saldo juntos, o no pasa ninguna de las dos cosas.
2. **Los saldos se mueven en SQL.** El ajuste es un update del tipo `balance = balance + amount`, que ejecuta la base sobre decimales exactos, nunca un valor leído en PHP, modificado y vuelto a escribir.
3. **Deshacer es aplicar el signo inverso.** Borrar una transacción aplica el inverso del signo de su tipo con el mismo monto. Editarla revierte el efecto viejo en la cuenta y moneda viejas y aplica el nuevo en las nuevas, así que pasar una transacción a otra cuenta u otra moneda se resuelve con los mismos dos pasos. Borrar una transferencia revierte las dos patas y las comisiones.

Como los montos son exactos y los signos simétricos, `+ x` seguido de `- x` siempre da cero. No hay redondeo que se desvíe ni float que deje residuo. Esa propiedad está cubierta por tests en cada camino de alta, edición y borrado, porque un saldo que está mal por un centavo es un saldo en el que nadie vuelve a confiar.

## Reportar en una sola moneda, cuando se pide

Con la cotización guardada en cada movimiento, una pregunta como "¿cuánto gastamos en supermercado este año, en dólares?" pasa a ser una suma de `amount / quote` sobre las transacciones que corresponden. Cada término usa la cotización de su propio día, así que la respuesta no cambia mañana, y volver a correr el reporte del año pasado da el número del año pasado.

Contamos es deliberadamente conservador en esto. Los saldos y los reportes mensuales quedan en sus propias monedas, porque es con eso que la gente toma decisiones, y cada transacción muestra su valor aproximado en dólares junto a su cotización. Un total combinado es una vista que se calcula cuando se pide, marcada claramente como convertida, nunca un número que el libro guarda.

## Cuándo hace falta partida doble

Este diseño no es contabilidad por partida doble completa. No hay plan de cuentas, y los ingresos y gastos son una fila cada uno, no pares de débitos y créditos. Para un libro compartido de un hogar o un grupo, es el equilibrio correcto: el modelo coincide con cómo la gente piensa su dinero, y las transferencias ya tienen el tratamiento de dos lados donde importa.

Si se construye para contadores, para estados financieros auditados o para una plataforma que custodia dinero de terceros, hay que usar partida doble de verdad, donde cada asiento es un conjunto de imputaciones que suman cero por moneda. Las ideas de arriba siguen valiendo: decimales exactos, una cotización guardada por imputación y nunca convertir como forma de guardar.

## Resumen

- Llevar un saldo por cuenta y por moneda. Nunca guardar un total convertido.
- Guardar los decimales de cada moneda como dato y copiarlos en cada movimiento.
- Guardar el tipo de cambio del día en cada transacción, preferir el que realmente se obtuvo y mantener las cotizaciones como historial, no como un único valor actual.
- Mantener los montos positivos y dejar que el tipo defina el signo.
- Registrar una transferencia o un cambio de moneda como dos patas, cada una en su moneda y con su cotización, y las comisiones como gastos aparte.
- Envolver cada escritura en una transacción de base de datos, mover los saldos en SQL y deshacer con el signo inverso.
- Convertir a una sola moneda solo cuando una pregunta lo necesita, con las cotizaciones guardadas.

La historia completa del producto al que pertenece este esquema está en el [caso de Contamos](/es/work/contamos/).
