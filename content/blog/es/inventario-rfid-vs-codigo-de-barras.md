---
title: "Inventario con RFID vs código de barras: qué cambia"
description: "Inventario con RFID o con código de barras: por qué la línea de vista define el costo, dónde falla RFID y el software de conciliación que lo hace rentable."
published: "2026-10-02"
translations: {"en": "rfid-vs-barcode-inventory-count"}
---

La diferencia entre hacer un inventario con RFID y con código de barras no es la velocidad de cada lectura. Es que el código de barras necesita a una persona apuntando un lector a cada artículo, y RFID no. Un inventario con código de barras crece en proporción a la cantidad de cosas que tienes. Un inventario con RFID crece con el tamaño del espacio que hay que recorrer. Es un problema con otra forma, y por eso un inventario con RFID puede costar una fracción del esfuerzo.

Trabajé en uno de estos en heXa Sistemas. El inventario anual de un cliente ocupaba a cinco personas durante unas veinte horas cada una. Después de pasar a RFID y sumar una etapa de conciliación, lo hacía una sola persona en unas tres horas. Este artículo explica por qué pasó eso, dónde se complica RFID y por qué las etiquetas fueron solo la mitad del resultado.

## Por qué un inventario con código de barras es lento

El inventario anual típico es así: se cierra, se ponen personas en el piso con lectores de código de barras y planillas impresas, se escanea todo, y después se pasan horas conciliando lo encontrado contra lo que el sistema cree tener. Así lo hacía el cliente del [caso de estudio de RFID](/es/work/hexa-rfid/), y así lo hace la mayoría de las empresas.

Cada parte de ese proceso es cara por el mismo motivo. Un código de barras es un código óptico. Necesita línea de vista, buena luz, un ángulo correcto y un escaneo deliberado por artículo. Entonces:

- **El esfuerzo es lineal en la cantidad de artículos.** El doble de stock es el doble de escaneos, por más organizado que esté el equipo.
- **Los artículos apilados son un problema.** Lo que está detrás de otra cosa hay que moverlo, escanearlo y volver a ponerlo en su lugar.
- **El cansancio baja la precisión.** Después de horas de escaneo repetitivo, la gente se salta artículos o escanea el mismo dos veces. En nuestro caso el inventario era caro, disruptivo y, justamente porque era agotador, tampoco era demasiado preciso.

Nada de esto es un defecto del código de barras. Para escanear un artículo en una caja es casi perfecto. Simplemente no encaja bien con contar todo de una vez.

## Cómo funciona un inventario con RFID

Una etiqueta RFID lleva un identificador que un lector recibe por radio en lugar de por la vista. Para inventario, lo habitual es RFID UHF pasivo, según el estándar EPC Gen2 ([GS1 EPC/RFID](https://www.gs1.org/standards/epc-rfid)). Las etiquetas no tienen batería: toman la energía de la señal del lector y responden con su identificador.

Eso cambia cómo se hace un conteo:

- **Sin línea de vista.** Un lector puede ver una etiqueta dentro de una caja, detrás de otra caja o debajo del empaque.
- **Muchas etiquetas a la vez.** El protocolo está pensado para que un lector reciba una gran cantidad de etiquetas en una sola pasada, sin una acción por cada una.
- **Distancia.** Las etiquetas UHF pasivas se pueden leer a metros de distancia, según el lector, la antena, la etiqueta y lo que la rodea.

El conteo deja de ser una secuencia de escaneos y pasa a ser un barrido del espacio. Una persona recorre los pasillos con un lector de mano, o lectores fijos cubren las zonas por donde pasan los artículos, y las etiquetas responden.

## RFID vs código de barras, comparados

| | Código de barras | RFID UHF pasivo |
|---|---|---|
| Línea de vista | Necesaria | No necesaria |
| Artículos por lectura | Uno | Muchos |
| Distancia de lectura | Corta | Hasta varios metros, según las condiciones |
| Costo por etiqueta | Casi cero | Desde unos centavos, más en etiquetas especiales |
| Identifica | El tipo de producto (en general) | Cada artículo, si cada etiqueta es única |
| Falla con | Etiquetas dañadas u ocultas | Metal, líquidos, apilado denso, etiquetas mal ubicadas |
| Resultado de una lectura | Determinístico | Probabilístico, con duplicados |

La última fila es la que más importa para el software, y es donde la mayoría de los proyectos de RFID salen bien o mal.

## Dónde tiene problemas RFID

RFID no es magia, y un inventario que asume que todas las etiquetas van a responder siempre va a estar mal. Los límites generales son conocidos:

- **Metal y líquidos.** El metal refleja las señales UHF y puede desintonizar una etiqueta pegada directamente sobre él. El agua las absorbe. Los artículos metálicos o que contienen líquido necesitan etiquetas diseñadas para eso, o una ubicación cuidadosa.
- **Las lecturas no están garantizadas.** La orientación de la etiqueta, la distancia, la densidad del apilado y la potencia del lector influyen en si una etiqueta responde en una pasada determinada. Algunas responden muchas veces y otras ninguna.
- **Las etiquetas se dañan.** Una etiqueta en una caja que se arrastra por las estanterías durante un año no siempre sobrevive. Cualquier sistema con etiquetas en un depósito real tiene que esperar que algunas fallen.
- **Quien hace el conteo no es especialista.** Si el procedimiento es complicado, alguien que lo hace pocas veces al año no lo va a seguir bien.

Por eso el caso de estudio describe el requisito como sobrevivir a un depósito y no a una demo. Una demo tiene veinte artículos etiquetados sobre una mesa. Un depósito tiene artículos apilados detrás de otros, etiquetas dañadas y gente que no puede recordar un procedimiento.

## El software es la parte que importa

Un lector produce un flujo de lecturas crudas: identificadores de etiquetas, muchas veces repetidos, sin ninguna idea de cuál debería ser el stock. Eso no se puede usar tal cual. El software alrededor es lo que convierte lecturas en un inventario, y tiene tres tareas.

### Eliminar lecturas duplicadas

La misma etiqueta se ve varias veces, desde distintos ángulos, en distintas pasadas y por más de un lector. El primer paso es reducir las lecturas a un conjunto de etiquetas distintas vistas durante el conteo. Como cada etiqueta pasiva tiene su propio identificador, los duplicados se resuelven por ID y no hace falta adivinar.

### Conciliar contra el stock esperado

El conjunto de etiquetas vistas se compara con lo que el sistema dice que debería haber. Cada artículo cae en uno de pocos grupos:

- **Encontrado donde se esperaba.** La enorme mayoría, que nadie necesita mirar.
- **Faltante.** Se esperaba y no se vio.
- **Sobrante.** Se vio pero no se esperaba, o el sistema no lo conoce.
- **En el lugar equivocado.** Se vio, pero en otra ubicación que la registrada.

### Reportar las excepciones

El resultado es un reporte de excepciones, no una lista. Como dice el caso de estudio: nadie lee una lista de todo lo que se encontró. Se lee la lista de lo que no coincide.

También es así como se manejan en la práctica los límites de RFID. Un artículo faltante puede estar perdido, o puede tener la etiqueta dañada o estar apilado donde la señal no llegó. El reporte de excepciones le dice a una persona exactamente qué artículos revisar a mano, en lugar de pedirle que revise todo. El esfuerzo humano se concentra en los pocos artículos que lo necesitan.

## Qué cambió: de 100 horas-persona a unas 3

Con RFID y la etapa de conciliación, el inventario pasó de cinco personas durante veinte horas a una persona durante unas tres. Es cerca de un 97% menos de esfuerzo.

El cambio más interesante fue en qué se convirtió el inventario. Cuando lleva cien horas-persona y obliga a cerrar, se hace una vez al año y nadie lo quiere hacer. Cuando lo hace una persona en una tarde, se puede correr cada vez que resulte útil: antes de una auditoría, después de una mudanza, cuando los números no cierran.

El resultado salió de cambiarle la forma al problema, no de acelerar el proceso anterior. Lectores de código de barras más rápidos, mejores planillas o más personas habrían dejado el conteo igual de lineal en la cantidad de artículos. RFID eliminó el escaneo por artículo, y el software eliminó la necesidad de mirar todo.

## Cuándo el código de barras sigue siendo la mejor opción

RFID no es la respuesta a todos los problemas de inventario. El código de barras es mejor cuando:

- **El stock es pequeño o los conteos son poco frecuentes**, al punto de que etiquetar cada artículo cuesta más que el conteo que se ahorra.
- **Los artículos son baratos.** Una etiqueta que representa una parte notable del precio del artículo es difícil de justificar.
- **El entorno es hostil para la radio.** Los productos mayormente metálicos o líquidos se pueden etiquetar, pero cuesta más y requiere más pruebas.
- **Igual se escanea de a un artículo**, como en una caja o en la recepción de mercadería, donde el código de barras ya es una acción rápida.

Muchas operaciones usan los dos: código de barras donde los artículos se manipulan de a uno, y RFID donde hay que contar en volumen.

## Resumen

La ventaja de RFID sobre el código de barras en un inventario es estructural. El código de barras necesita línea de vista y un escaneo por artículo, así que el conteo crece con el stock. RFID UHF pasivo lee muchas etiquetas a la vez, a través del empaque y a distancia, así que el conteo pasa a ser un recorrido del espacio. Las lecturas de RFID son imperfectas, así que el valor sale del software que elimina duplicados, concilia contra el stock esperado y le entrega a una persona una lista corta de excepciones para revisar.

El proyecto completo está en el [caso de estudio del sistema de inventario RFID](/es/work/hexa-rfid/).
