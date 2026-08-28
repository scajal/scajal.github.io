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
      { org: "Criptala", role: "Líder de Desarrollo" },
      { org: "rabbit | iot", role: "Co-Fundador y CTO" },
    ],
  },
  work: {
    eyebrow: "Trabajo",
    title: "Tres sistemas que vale la pena explicar",
    intro: "Cada uno resolvió un problema que no se podía comprar hecho.",
    items: [
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
        tags: ["RFID", "GeneXus", "Laravel", "Operaciones"],
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
};
