# Architektur

## Projektübersicht

**Ziel:** Interaktive Lernplattform, die Kindern und Jugendlichen über KI-Projekte rund um heimische Vögel (BirdNET, Bioakustik) Natur, Umwelt, Informatik und Akustik näherbringt.

**Zielgruppen:** Kinder/Jugendliche als Lernende; Lehrkräfte und Workshop-Leitende als Multiplikatoren; Entwickler:innen und KI-Agenten als Mitwirkende am Projekt.

**Technologien:** Astro 5 (statischer Build), MDX, Tailwind CSS 4, daisyUI 5, TypeScript (strict), Zod (Schema-Validierung), Shiki (Syntax-Highlighting), eigene Rehype-/Shiki-Plugins.

**Projektphilosophie:** Inhalte gehören in Markdown/MDX bzw. JSON, Struktur in Konfigurationsdateien, Darstellung in Komponenten. So wenig Client-JavaScript wie möglich (statisches HTML + kleine gezielte Skripte statt Framework-Islands). Alles typisiert, Daten beim Build validiert.

## Routing

Basis-Pfad: `/schlaumeise` (in `astro.config.mjs`). i18n: Deutsch ist Standard ohne Präfix, Englisch unter `/en/` (Marke „Smartfinch“).

| Route | Datei | Aufgabe |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | Deutsche Startseite (Hero) |
| `/en/` | `src/pages/en/index.astro` | Englische Startseite (`HomeContent`) |
| `/<slug>/` | `src/pages/[...slug].astro` | Alle deutschen Doku-/Lernseiten |
| `/en/<slug>/` | `src/pages/[locale]/[...slug].astro` | Nicht-Standard-Locales |

Beide Catch-all-Routen laden die `docs`-Collection in `getStaticPaths` und reichen Entry + Gesamtliste als Props weiter (kein doppeltes Laden pro Seite).

## Content-Strategie

Inhalte liegen in der Collection `docs` unter `src/content/docs/<locale>/<themenbereich>/…` als `.md`/`.mdx`. Das Zod-Schema steht in `src/content.config.ts` (Felder: siehe [content-handbook.md](./content-handbook.md)). Der erste Pfadabschnitt der Entry-ID ist die Locale; `src/lib/docs-content.ts` filtert danach.

Die Sidebar-Struktur ist **nicht** im Dateisystem kodiert, sondern in `src/config/docs-navigation.ts` deklariert (Topics → Gruppen → `autogenerate`-Verzeichnisse/Links). `src/lib/docs-navigation.ts` löst diese Deklaration gegen die Collection auf (Labels, Reihenfolge über `sidebar.order`, aktive Pfade, Prev/Next-Pagination).

Strukturierte Daten (Quiz) liegen als JSON unter `src/data/quizzes/<locale>/` und werden über `src/lib/quizzes.ts` geladen und gegen `src/lib/quiz-schema.ts` validiert — Details in [quiz-handbook.md](./quiz-handbook.md).

## Datenfluss

```text
content/docs/*.md(x)            config/docs-navigation.ts
        │                                │
        ▼                                ▼
lib/docs-content.ts  ──entries──▶  lib/docs-navigation.ts
        │                                │ (resolveSidebarNavigation,
        │                                │  resolveDocsPagination)
        ▼                                ▼
pages/[...slug].astro ──────▶ layouts/DocsLayout.astro
                                   │
                ┌──────────────────┼──────────────────┐
                ▼                  ▼                  ▼
        ui-elements/Sidebar   docs/DocsTOC      docs/DocsPagination
```

`MainLayout` umschließt alles (Header, Footer, MenuDrawer für Nicht-Docs-Seiten); `DocsLayout` ergänzt Sidebar-Drawer, TOC-Rail und Pagination.

## Komponenten

| Gruppe | Komponenten | Zweck |
| --- | --- | --- |
| Rahmen | `Header`, `Footer`, `MenuDrawer` | Globale Navigation, Branding, Impressum/Förderlogo |
| Layouts | `MainLayout`, `DocsLayout` | HTML-Grundgerüst bzw. Docs-Shell |
| Docs-Inhalt | `MdxInterpreter`, `DocsTOC`, `DocsPagination`, `ZoomableDocsImages` | Typografie, Inhaltsverzeichnis, Blättern, Bild-Zoom |
| MDX-Bausteine | `Steps`, `LinkCard`, `Code`/`CodeBlock`, `Terminal`, `ImageCarousel`, `RevealImage`, `HighlightSection` | In Inhalten verwendbare Bausteine (in den Catch-all-Routen als `mdxComponents` registriert) |
| UI | `Sidebar`, `SidebarItems`, `ThemeController`, `TopicIcon`, `DropdownNavItem` (reserviert) | Navigation und Bedienelemente |

## Client-JavaScript

Bewusst minimal, keine Framework-Islands:

- `scripts/docs-drawer.ts` — Sidebar-Drawer (mobil/desktop), über Custom Event `docs-sidebar:toggle` vom Header-Button entkoppelt.
- `scripts/docs-code-copy.ts` — Copy-Buttons der Codeblöcke (Event-Delegation).
- Theme-Head-Skript (inline in `MainLayout`) — löst das Theme vor dem ersten Paint auf (`schlaumeise:theme:v1` in `localStorage`, sonst `prefers-color-scheme`); `ThemeController` ist nur Toggle-UI + Speichern.

## Markdown-Pipeline

`astro.config.mjs` registriert Shiki mit zwei Themes (`github-light`/`github-dark`) plus `createDocsCodeTransformer` (Zeilen-Highlighting, Metadaten) und `rehypeCodeBlockWrapper` (Header/Copy-Button-Markup um Codeblöcke). `plugins/code-block-meta.mjs` ist die gemeinsame Parser-Bibliothek.

## Styling

Tailwind 4 + daisyUI; die gesamte Token-Architektur liegt in `global.css` (Aufbau dort im Kopf dokumentiert):

- **Block A** — zwei daisyUI-**Custom-Themes** „light“/„dark“ aus Markenfarben (`@plugin "daisyui/theme"`; Namen sind fix, da Komponenten und `localStorage` darauf referenzieren).
- **Schicht 1** — themen-unabhängige **Palette** `--palette-n-*` (neutrale Rampe, einzige Quelle der Roh-Hex).
- **Block B** — eigene **theme-abhängige Rollen-Tokens** (Light auf `:root`, Dark via `[data-theme="dark"]`): `--color-text-*` (Schrift), `--color-border-*`, `--color-accent-*` (Tints; Basis-Akzent = daisyUI `--color-accent`), `--color-state-*`, Highlights, Schatten. **Konvention: alle Farb-Tokens tragen das `--color-`-Präfix** (wie daisyUI).
- **Block C** — **theme-invariante** Konstanten: `--color-fixed-*`, `--color-scrim-*`/`--shadow-*`, `--color-spec-*`, `--docs-terminal-*` sowie **Typografie** (`--font-size-*`, `--font-weight-*`).

Ein `@theme`-Block ist kanonische Quelle der **Surface-Rollen** (`--color-surface-*`) und der **Spacing-Skala** (`--spacing-*`) → nutzbar als `var(--token)` **und** als Utility (`bg-surface-panel`, `p-md`, `gap-sm`). Komponenten-scoped `<style>`-Blöcke referenzieren **ausschließlich** diese Rollen-Tokens (oder daisyUI-Utilities) — keine rohen `--palette-*`/`--color-base-*`, kein Hex/`rgb()`, keine literalen Abstände/Schriftgrößen; erzwungen durch den Guard `npm run lint:colors` (Pre-Commit-Hook `.githooks/` + CI). Markdown-Typografie zentral in `MdxInterpreter`. High-Contrast-Varianten sind vorbereitet (Vorlage am Ende von `global.css`); dank der Rollen-Ebene genügt dafür das Überschreiben weniger `--color-surface/-text/-border/-accent-*` pro Theme.
