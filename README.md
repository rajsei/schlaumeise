# Schlaumeise / Smartfinch

Interaktive Lernplattform, die Kindern und Jugendlichen mit KI-Projekten rund um heimische Vögel Natur, Umwelt, Informatik und (Bio-)Akustik näherbringt. Gefördert durch EFRE/ESF und den Freistaat Sachsen.

Zweisprachig: Deutsch (Standard, ohne Präfix) und Englisch (`/en/`-Präfix, Marke „Smartfinch“).

## Tech-Stack

- [Astro 5](https://astro.build) (statischer Build, MDX, Sitemap)
- Tailwind CSS 4 + daisyUI 5 (Theme: hell/dunkel mit `localStorage`-Persistenz)
- Inhalte als Markdown/MDX in Content Collections (`src/content/docs/`)
- Eigene Shiki-/Rehype-Plugins für Codeblöcke mit Copy-Button

## Schnellstart

```sh
npm install
npm run dev       # http://localhost:4321/schlaumeise/
npm run build     # Produktions-Build nach ./dist/
npm run preview   # Build lokal testen
```

Hinweis: Die Seite läuft unter dem Basis-Pfad `/schlaumeise` (siehe `astro.config.mjs`).

## Projektstruktur (Kurzfassung)

```text
src/
├── assets/          # Logos, Vogelbilder, Audiodateien (vom Build verarbeitet)
├── components/
│   ├── docs/        # Komponenten für Doku-/Lernseiten (Steps, Terminal, CodeBlock …)
│   ├── pages/       # Seiten-spezifische Bausteine (HomeContent)
│   └── ui-elements/ # Allgemeine UI (Sidebar, ThemeController …)
├── config/          # site.config.ts, docs-navigation.ts (Sidebar-Struktur)
├── content/docs/    # Inhalte: de/ und en/, gegliedert nach Themenbereichen
├── data/            # Strukturierte Daten (z. B. Quiz-JSON)
├── i18n/            # Locales, Dictionaries, Routing-Helfer
├── layouts/         # MainLayout (Rahmen), DocsLayout (Doku-Shell)
├── lib/             # Logik: docs-content, docs-navigation, Schemas
├── pages/           # Routen: index, [...slug], [locale]/[...slug]
├── plugins/         # Markdown-/Shiki-Plugins
├── scripts/         # Client-Skripte (Drawer, Copy-Button)
└── styles/          # global.css, docs.css
```

Ausführliche Dokumentation: siehe [`docs/`](./docs/) — insbesondere
[Architektur](./docs/architecture.md), [Conventions](./docs/conventions.md),
[Content-Handbuch](./docs/content-handbook.md), [Quiz-Handbuch](./docs/quiz-handbook.md),
[Features](./docs/features.md), [Roadmap](./docs/roadmap.md) und [TODO](./docs/todo.md).

Regeln für KI-Agenten: [`AGENTS.md`](./AGENTS.md).

## Inhalte pflegen

Neue Lerninhalte sind Markdown/MDX-Dateien unter `src/content/docs/de/<themenbereich>/`.
Pflicht-Frontmatter: `title`. Sidebar-Reihenfolge über `sidebar.order`.
Details: [Content-Handbuch](./docs/content-handbook.md).
