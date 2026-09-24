import type { Content } from "./types";
import { PROFILE } from "@/lib/site";

// Written in Spanish rather than translated from the English: neutral Latin
// American register, first person, same claims.
export const es: Content = {
  meta: {
    title: "Santiago Cajal — Tech Lead e Ingeniero Full-Stack",
    description:
      "Tech Lead e ingeniero full-stack en Montevideo. Diez años construyendo plataformas fintech y cripto con Laravel, React y TypeScript.",
  },
  nav: {
    skipToContent: "Saltar al contenido",
    themeToggle: "Cambiar tema",
  },
  hero: {
    headline: [
      "Construyo las plataformas",
      "por las que circulan",
      "el dinero y los datos",
    ],
    headlineAccent: ".",
    subhead:
      "Tech Lead e ingeniero full-stack en Montevideo. Diez años entre fintech, cripto y telemetría — casi siempre en sistemas que no se pueden caer.",
    currentlyLabel: "Actualmente",
    currently: [
      { org: "Contamos", role: "Fundador · proyecto personal" },
      { org: "Criptala", role: "Líder de Desarrollo" },
      { org: "rabbit | iot", role: "Co-Fundador y CTO" },
    ],
  },
  work: {
    eyebrow: "Trabajo",
    title: "Cuatro sistemas que vale la pena explicar",
    intro: "Cada uno resolvió un problema que no se podía comprar hecho.",
    items: [
      {
        slug: "contamos",
        name: "Contamos",
        years: "2026 — presente",
        summary:
          "Mi propio producto, construido en solitario: un libro compartido para dinero guardado en varias monedas, fiat y cripto, donde cada movimiento conserva el tipo de cambio de su día. Claude o ChatGPT se pueden conectar, responder con las cifras reales y registrar movimientos.",
        tags: ["Laravel", "React", "Inertia", "MCP", "Paddle"],
        result: { count: 4, display: "4 semanas", label: "del primer commit a producción" },
      },
      {
        slug: "criptala",
        name: "Criptala",
        years: "2021 — presente",
        summary:
          "Una plataforma de trading y pagos en cripto llevada desde un repositorio vacío hasta producción, con pasarelas fiat y cripto detrás de una sola API. Tengo a cargo la arquitectura, el esquema de datos y la hoja de ruta técnica.",
        tags: ["Laravel", "React", "Inertia", "API REST", "Docker"],
        result: { count: 6000, display: "6.000+", label: "usuarios activos" },
      },
      {
        slug: "rabbit-iot",
        name: "rabbit | iot",
        years: "2025 — presente",
        summary:
          "Ingesta de telemetría LoRaWAN, decodificación de payloads y alertas para campos y plantas industriales. Multi-tenant desde el primer commit, con tableros en tiempo real encima.",
        tags: ["LoRaWAN", "Laravel", "React", "Multi-tenant", "Telemetría"],
        result: { display: "Co-fundé", label: "y construí la plataforma" },
      },
      {
        slug: "hexa-rfid",
        name: "Sistema de inventario RFID",
        years: "2016 — 2020",
        summary:
          "Un inventario anual que ocupaba a cinco personas durante veinte horas cada una. Reconstruido sobre RFID y una pasada de conciliación, ahora lo hace una sola persona en una tarde.",
        tags: ["RFID", "GeneXus", "Operaciones"],
        result: { display: "100 → 3", label: "horas-persona por inventario" },
      },
    ],
  },
  ai: {
    eyebrow: "Cómo trabajo",
    title: "La IA va dentro del proceso, no al costado",
    body: [
      "La mayoría de los equipos le enchufan la IA al final del flujo: una ventana de chat en otra pestaña, usada para lo que ese día resultó tedioso. Los últimos dos años los pasé empujando en el sentido contrario, hacia la especificación, la implementación y la revisión, que es donde viven las restricciones y donde una respuesta equivocada todavía sale barata.",
      "Lo que cambia es la forma del trabajo más que su volumen. Escribir código deja de ser el cuello de botella, y el cuello de botella pasa a ser decidir qué vale la pena construir y juzgar si lo que volvió es correcto. Ninguna de las dos cosas se automatiza, y las dos son la parte que igual querría estar haciendo. La aceleración aparece al acortar la distancia entre ambas.",
      "La lección práctica fue que el contexto le gana a las herramientas. Especificaciones claras, interfaces tipadas y decisiones documentadas pesan mucho más que qué modelo está respondiendo, porque un código legible para alguien que recién entra al equipo es legible para un modelo por las mismas razones. Buena parte del trabajo es lograr que el sistema se explique solo, algo que conviene hacer lo lea un modelo o no.",
    ],
    stack: [
      { label: "En el ciclo", items: "Claude Code, MCP, Cursor, Codex" },
      {
        label: "Aplicado a",
        items: "Especificación, implementación, revisión de código",
      },
      {
        label: "Fuera del editor",
        items: "n8n, integraciones con Slack, flujos internos",
      },
    ],
  },
  past: {
    eyebrow: "Antes",
    title: "El resto",
    roles: [
      {
        org: "BlueBoot",
        role: "Desarrollador de Software",
        period: "2020 — 2024",
        detail:
          "Software empresarial sobre SAP BTP, con JavaScript del lado del cliente.",
      },
      {
        org: "Dvelop Software",
        role: "Desarrollador de Software",
        period: "2020",
        detail:
          "Backend y frontend para Midinero, incluido el sistema de recarga de tarjetas prepagas y la plataforma Empresas.",
      },
      {
        org: "heXa Sistemas",
        role: "Desarrollador de Software",
        period: "2016 — 2020",
        detail:
          "Sistemas internos para clientes de fintech y salud en GeneXus y Laravel. De acá salió el rediseño con RFID.",
      },
    ],
    education:
      "Licenciatura en Informática, Universidad de la Empresa, Montevideo (2017 — 2022).",
  },
  contact: {
    eyebrow: "Contacto",
    title: "Hablemos",
    body: "Montevideo, UTC−3.",
    emailLabel: "Correo",
    links: [
      { label: "Correo", href: `mailto:${PROFILE.email}`, note: PROFILE.email },
      { label: "LinkedIn", href: PROFILE.linkedin, note: "in/scajal" },
      { label: "GitHub", href: PROFILE.github, note: "@scajal" },
    ],
  },
  footer: {
    built: "Hecho con Next.js. Compuesto en Switzer y Geist Mono.",
  },
  cases: {
    backToWork: "Todo el trabajo",
    nextLabel: "Siguiente proyecto",
    studies: {
      contamos: {
        name: "Contamos",
        role: "Fundador e ingeniero único",
        years: "2026 — presente",
        lede: "Un proyecto personal: un libro compartido y multimoneda que un asistente de IA puede leer y escribir, construido en solitario del primer commit a producción en cuatro semanas.",
        facts: [
          { label: "Rol", value: "Fundador e ingeniero único (proyecto personal)" },
          { label: "Stack", value: "Laravel 13, Inertia, React 19, Filament" },
          { label: "Servicios", value: "WorkOS AuthKit, Paddle, Laravel Cloud" },
          { label: "Estado", value: "En producción en contamos.xyz" },
        ],
        sections: [
          {
            heading: "Contexto",
            body: [
              "En Uruguay es normal tener dinero en pesos, en dólares y, cada vez más, en cripto, y compartir una parte con la pareja o con quienes compartes casa. Todas las herramientas que probé lo resolvían mal: las planillas y las apps de presupuesto convierten todo a un solo número con el tipo de cambio de hoy, así que las cifras del año pasado cambian en silencio cada vez que cambia el tipo de cambio.",
              "Contamos es mi respuesta, y es solo mía: un proyecto personal, no un trabajo. Es un libro compartido donde cada cuenta guarda varias monedas lado a lado, cada movimiento conserva el tipo de cambio del día en que ocurrió y todo el grupo escribe en los mismos libros.",
            ],
          },
          {
            heading: "Restricción",
            body: [
              "Una sola persona lo construye, lo opera y lo soporta, así que cada decisión tenía que dejar la operación cerca de cero. El hosting, el inicio de sesión y la facturación son servicios gestionados —Laravel Cloud, WorkOS AuthKit y Paddle como merchant of record, para que los impuestos no sean mi problema— y el código tiene que seguir siendo lo bastante pequeño como para tenerlo entero en la cabeza.",
              "Sigue siendo dinero, así que valen las reglas de siempre: los montos son decimales exactos, nunca floats; borrar un movimiento deja el saldo exactamente donde estaba; y el plan gratuito tiene que ser útil de verdad sin que el pago deje de valer la pena.",
            ],
          },
          {
            heading: "Enfoque",
            body: [
              "Un monolito modular en Laravel —identidad, finanzas, catálogo, facturación— con Inertia y React encima y Filament para la administración. Los límites de cada plan son feature flags declarados una sola vez, así que la app web, la página de precios y la API aplican exactamente las mismas reglas.",
              "La parte que más me importa es la IA. Contamos corre un servidor MCP remoto: Claude o ChatGPT se conectan con el propio inicio de sesión del usuario, actúan con exactamente los permisos que ese usuario tiene y cuentan con 37 herramientas para leer saldos e informes, registrar y editar movimientos, e importar un estado de cuenta después de una prueba en seco que el usuario revisa. Cada cambio que hacen queda en el registro de actividad marcado como obra del asistente, y el acceso se puede revocar al instante.",
              "También se construyó con la IA dentro del proceso, como describe el resto de esta página: reglas del proyecto que los agentes deben seguir, interfaces tipadas y cerca de 1.500 tests como el contrato que decide si un cambio es correcto.",
            ],
          },
          {
            heading: "Resultado",
            body: [
              "Del primer commit, el 29 de agosto de 2026, a producción en contamos.xyz pasaron unas cuatro semanas: bilingüe, con un plan gratuito, uno pago y asistentes de IA disponibles en ambos.",
              "Es temprano, y esta página se va a volver más concreta a medida que la gente lo use.",
            ],
          },
        ],
        meta: {
          title: "Contamos — un libro compartido que tu asistente de IA puede usar",
          description:
            "Un proyecto personal construido en solitario en cuatro semanas: un libro compartido multimoneda con un servidor MCP remoto para que Claude o ChatGPT lo lean y escriban.",
        },
      },
      criptala: {
        name: "Criptala",
        role: "Líder de Desarrollo",
        years: "2021 — presente",
        lede: "Una plataforma de trading y pagos en cripto llevada desde un repositorio vacío hasta producción, y el equipo que hoy la sostiene.",
        facts: [
          { label: "Rol", value: "Ingeniero Sr. → Líder de Desarrollo" },
          { label: "Stack", value: "Laravel, MySQL, React, Inertia, Docker" },
          { label: "Equipo", value: "Dos ingenieros y un QA, a mi cargo" },
          { label: "Estado", value: "En producción" },
        ],
        sections: [
          {
            heading: "Contexto",
            body: [
              "Entré a Criptala en 2021 como ingeniero senior, con un producto que existía como plan de negocio y poco más. La idea era una plataforma donde se pudiera comprar, vender y mantener criptomonedas, y liquidar en moneda local: dos mundos financieros distintos que tienen que encontrarse dentro de un mismo sistema.",
              "Construí la primera versión y, en los dos años siguientes, pasé de escribir la mayor parte del código a hacerme cargo de la arquitectura, el diseño de la API y la hoja de ruta técnica como Líder de Desarrollo.",
            ],
          },
          {
            heading: "Restricción",
            body: [
              "Todo lo que toca la plataforma es dinero, y eso elimina las salidas de emergencia habituales. Una orden que se ejecuta a medias no es un bug que se arregla en la próxima iteración. Los rieles fiat y los rieles cripto fallan de maneras distintas y en tiempos distintos: una transferencia bancaria puede revertirse días después, una transacción en cadena no se revierte nunca, y el sistema tiene que ser correcto en los dos casos.",
              "La segunda restricción es el tamaño. Un equipo chico no puede permitirse un diseño que necesite un especialista por subsistema, así que la arquitectura tenía que seguir siendo comprensible para todos los que la tocan.",
            ],
          },
          {
            heading: "Enfoque",
            body: [
              "Un backend en Laravel dueño del dominio y del esquema de datos, con una única API REST como forma de entrada. Las pasarelas de pago —fiat y cripto— viven detrás de una abstracción interna, así que agregar o reemplazar un proveedor es un cambio acotado y no una excavación arqueológica.",
              "El frontend es React vía Inertia, lo que permite que el cliente sea una capa fina sobre el estado del servidor en vez de una segunda aplicación manteniendo su propia copia de la verdad. Desarrollo y despliegue corren en Docker con pipelines de CI/CD, de modo que lo que anda en una laptop es lo mismo que anda en producción.",
              "Como líder, buena parte del trabajo no es código: levantar requerimientos con producto y negocio, y convertir lo que necesitan en especificaciones que un equipo chico pueda efectivamente planificar.",
            ],
          },
          {
            heading: "Resultado",
            body: [
              "La plataforma atiende a más de 6.000 usuarios activos y procesa alrededor de 1.500 órdenes completadas por mes. Está en producción de forma continua desde el lanzamiento, y el equipo creció alrededor de ella y no alrededor de una reescritura.",
            ],
          },
        ],
        meta: {
          title: "Criptala — plataforma de trading y pagos en cripto",
          description:
            "Construir una plataforma de trading y pagos en cripto desde un repositorio vacío hasta más de 6.000 usuarios activos, primero como ingeniero y después como Líder de Desarrollo.",
        },
      },
      "rabbit-iot": {
        name: "rabbit | iot",
        role: "Co-Fundador y CTO",
        years: "2025 — presente",
        lede: "Una plataforma de telemetría LoRaWAN para campos y plantas industriales, multi-tenant desde el primer commit.",
        facts: [
          { label: "Rol", value: "Co-Fundador y CTO" },
          { label: "Stack", value: "Laravel, React, LoRaWAN" },
          { label: "Arquitectura", value: "Multi-tenant" },
          { label: "Estado", value: "Temprano, en desarrollo activo" },
        ],
        sections: [
          {
            heading: "Contexto",
            body: [
              "rabbit | iot es una empresa que co-fundé para llevar telemetría a donde normalmente no llega: campos y establecimientos rurales, donde no hay energía confiable, no hay red confiable y no hay ninguna paciencia para equipos que exigen atención.",
              "LoRaWAN es la respuesta a esas restricciones. Cambia ancho de banda por alcance y duración de batería, que es exactamente el intercambio que se quiere cuando un sensor tiene que quedarse en un potrero reportando durante años.",
            ],
          },
          {
            heading: "Restricción",
            body: [
              "Los dispositivos de bajo consumo son intermitentes por diseño. Duermen, pierden transmisiones y llegan desordenados: la plataforma no puede tratar un hueco en los datos como una falla, ni asumir que el orden de llegada es el orden de los eventos.",
              "Los payloads son binarios y específicos de cada fabricante: cada modelo de sensor codifica sus lecturas distinto, y la decodificación tiene que vivir en algún lugar que no obligue a desplegar cada vez que aparece un modelo nuevo.",
              "Y como el producto atiende a varios clientes con varios establecimientos, la multi-tenencia no podía agregarse después. Tenía que ser una propiedad del modelo de datos desde el principio.",
            ],
          },
          {
            heading: "Enfoque",
            body: [
              "Un backend en Laravel se encarga de la ingesta, la decodificación y la persistencia. Los payloads se decodifican por tipo de sensor hacia una lectura normalizada —un valor, una unidad, un dispositivo, una marca de tiempo— para que todo lo que viene después trabaje contra una sola forma, sin importar qué fabricante la produjo.",
              "Encima de eso están las alertas y las métricas, y un frontend en React con tableros en tiempo real. La multi-tenencia atraviesa el modelo de datos en vez de aplicarse en los bordes, así una consulta no puede cruzar accidentalmente el límite entre clientes.",
            ],
          },
          {
            heading: "Resultado",
            body: [
              "La plataforma está funcionando y en desarrollo activo. Esta página va a volverse más concreta —con tableros reales— a medida que el producto madure.",
            ],
          },
        ],
        meta: {
          title: "rabbit | iot — plataforma de telemetría LoRaWAN",
          description:
            "Co-fundar y construir una plataforma de telemetría LoRaWAN multi-tenant para monitoreo rural, agrícola e industrial.",
        },
      },
      "hexa-rfid": {
        name: "Sistema de inventario RFID",
        role: "Desarrollador de Software, heXa Sistemas",
        years: "2016 — 2020",
        lede: "Un inventario anual que ocupaba a cinco personas durante veinte horas cada una. Hoy lo hace una sola persona en una tarde.",
        facts: [
          { label: "Rol", value: "Desarrollador de Software" },
          { label: "Stack", value: "RFID, GeneXus" },
          { label: "Antes", value: "≈100 horas-persona por inventario" },
          { label: "Después", value: "≈3 horas-persona por inventario" },
        ],
        sections: [
          {
            heading: "Contexto",
            body: [
              "Un cliente contaba su stock una vez al año como lo hace la mayoría: cerraba, ponía cinco personas en el piso con lectores de código de barras y planillas impresas, y gastaba veinte horas conciliando lo encontrado contra lo que el sistema creía tener.",
              "Era caro, era disruptivo y —justamente porque era agotador— tampoco era demasiado preciso.",
            ],
          },
          {
            heading: "Restricción",
            body: [
              "El código de barras es la raíz del problema. Necesita línea de vista y un escaneo por artículo, lo que hace que el conteo sea lineal en la cantidad de cosas a contar y pone a una persona delante de cada una.",
              "Lo que lo reemplazara tenía que sobrevivir a un depósito y no a una demo: artículos apilados detrás de otros, etiquetas que se dañan, y gente que iba a usar el sistema unas pocas veces al año y no podía recordar un procedimiento.",
            ],
          },
          {
            heading: "Enfoque",
            body: [
              "RFID elimina el requisito de línea de vista: un lector toma muchas etiquetas a la vez, a distancia y a través del empaque. El conteo deja de ser una secuencia de escaneos y pasa a ser un barrido del espacio.",
              "El software alrededor hace la parte que realmente importa: tomar las lecturas crudas, resolver duplicados de etiquetas vistas más de una vez, conciliar el resultado contra el stock esperado y producir un reporte de excepciones con lo que falta, lo que sobra y lo que está en el lugar equivocado. Nadie lee una lista de todo lo que se encontró. Se lee la lista de lo que no coincide.",
            ],
          },
          {
            heading: "Resultado",
            body: [
              "El inventario pasó de cinco personas por veinte horas a una persona por unas tres —cerca de un 97% menos de esfuerzo— y de ser una odisea anual a algo que se puede correr cuando resulte útil.",
              "Sigue siendo el ejemplo más claro que tengo de un resultado que salió de cambiarle la forma al problema en vez de optimizar la solución existente.",
            ],
          },
        ],
        meta: {
          title: "Sistema de inventario RFID — de 100 horas-persona a 3",
          description:
            "Reemplazar un inventario anual basado en código de barras por RFID y una pasada de conciliación, bajándolo de unas 100 horas-persona a tres.",
        },
      },
    },
  },
};
