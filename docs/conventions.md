# Conventions — Benennung & Code-Richtlinien

Verbindliche Regeln. Bestehender Code, der abweicht, wird bei Gelegenheit migriert (URL-relevante Umbenennungen nur mit Redirect, siehe roadmap.md).

## Dateien

| Art | Konvention | Beispiel |
| --- | --- | --- |
| Astro-Komponenten | `PascalCase.astro` | `CodeBlock.astro` |
| TS/JS-Module | `kebab-case.ts` / `.mjs` | `docs-navigation.ts` |
| Konfiguration | `kebab-case.config.ts` bzw. `kebab-case.ts` in `src/config/` | `site.config.ts` |
| Inhalte | `kebab-case.md` / `.mdx`, klein, **englisch**, keine Sonderzeichen (`+`, Umlaute, Leerzeichen verboten — wird URL!) | `ai-and-bioacoustic.md` |
| Quiz-/Datendateien | `kebab-case.json`, Dateiname = `id`-Feld | `voegel-basiswissen.json` |
| Bilder | `kebab-case`, nummeriert in Schrittfolgen | `pi-setup/01.png` |
| Audio | `kebab-case.mp3`/`.opus` (keine unkomprimierten WAV) | `blauhaeher.mp3` |

Content-Ordner: kebab-case, durchgängig (snake_case-Bestand am 2026-07-11 migriert: `knowledge_collection` → `knowledge`, `workshop_materials` → `workshops`, `birdnet_live` → `birdnet-live`; alte URLs per Redirect abgedeckt).

**Content-Dateinamen sind englisch und in allen Sprachversionen identisch:** `de/<bereich>/birds.md` und `en/<bereich>/birds.md` — nur der Inhalt ist übersetzt, nie der Dateiname. So bleiben Übersetzungspaare trivial zuzuordnen und URLs sprachneutral. (Einzige Bestandsausnahme: `impressum.mdx`.)

## Komponenten

- PascalCase, beschreibender Name nach Verantwortlichkeit — niemals `Card2`, `SectionNew`, `Test…`.
- Eine Verantwortlichkeit pro Komponente; ab ~250 Zeilen Aufteilung prüfen.
- Props immer über ein `interface Props` typisieren; optionale Props mit Default.
- Docs-spezifische Komponenten nach `components/docs/`, generische nach `components/ui-elements/`, seitenspezifische nach `components/pages/`.
- Jede Komponente mit nicht offensichtlichem Verhalten bekommt einen Kommentarkopf (Zweck, Props, Beispiel — siehe `DropdownNavItem.astro` als Vorbild).

## Variablen & Funktionen

- Variablen: `camelCase`, sprechend (`docsEntries`, nicht `de` oder `arr`). Konstanten auf Modulebene: `camelCase`; echte Konstanten/Events `SCREAMING_SNAKE_CASE` (`DOCS_TOGGLE_EVENT`).
- Funktionen: verbbasiert (`resolveSidebarNavigation`, `getDocPath`, `buildLocalizedUrl`); Prädikate mit `is`/`has` (`isActivePath`, `topicHasItems`).
- Typen/Interfaces: PascalCase (`ResolvedNavItem`, `QuizQuestion`); keine `I`-Präfixe.

## Importe & Aliase

- **Verzeichnisübergreifende Importe innerhalb von `src/` immer über die `@`-Aliase**, nie über `../`-Ketten. Definiert in `tsconfig.json` (`baseUrl` + `paths`); Astro löst sie nativ auf — auch in `.mdx`-Inhalten und `<script>`-Blöcken von `.astro`-Dateien.
- Verfügbar: `@assets/*`, `@components/*`, `@config/*`, `@content/*`, `@data/*`, `@i18n` (Barrel `src/i18n/index.ts`), `@i18n/*`, `@layouts/*`, `@lib/*`, `@plugins/*`, `@scripts/*`, `@styles/*`, `@types/*` — jeweils 1:1 auf `src/<ordner>/`.
- Importe **innerhalb desselben Teilbaums** bleiben relativ mit `./` (z. B. `./ui-elements/ThemeController.astro` aus `Header.astro`).
- **Nicht anwendbar außerhalb der Vite-Pipeline:** Root-`scripts/` (plain Node) und `astro.config.mjs` importieren weiterhin relativ (`./src/…`). Relative Bild-Referenzen in reinem Markdown (`![](./bild.jpg)`) bleiben relativ — nur MDX-`import`-Statements nutzen Aliase.
- Hinweis: `@types/*` überdeckt als Alias den gleichnamigen npm-Scope — Pakete aus `node_modules/@types/` werden nie direkt importiert, daher unkritisch; direkte Importe wie `from "@types/node"` sind tabu.

## Collections & Daten

- Collection-Namen: englisch, Plural, camelCase: `docs`, künftig `quizzes`.
- Frontmatter-Felder: camelCase (`topicId`), dokumentiert in [content-handbook.md](./content-handbook.md). Neue Felder **immer zuerst** ins Zod-Schema (`src/content.config.ts`) und in `src/types/docs.ts` — sonst werden sie stillschweigend verworfen.
- JSON-Quizdaten: Pflichtfelder und Fragetypen in [quiz-handbook.md](./quiz-handbook.md); IDs innerhalb einer Datei eindeutig, kebab-case.

## i18n

- Dictionary-Keys: `bereich.camelCase` (`docs.toggleNav`). `de.ts` ist die Referenz (der `Dictionary`-Typ wird daraus abgeleitet) — jede Änderung muss in **allen** Locale-Dateien erfolgen, sonst Typfehler.
- Keine sichtbaren Strings hart in Komponenten — immer über das Dictionary (Ausnahme: Inhalte in `src/content/`).
- URLs nie hart bauen: `buildLocalizedUrl`, `withBase`, `resolveAssetUrl` verwenden — niemals `/schlaumeise/…` hartkodieren.
- **Locale-Routing nie selbst nachbauen** — schon gar nicht in (Inline-)Skripten. Immer die Helfer aus `src/i18n/routing.ts` (`stripLocaleFromPathname`, `localizedPath`, `switchLocalePath`, `getLocaleFromPathname`). Naives String-Basteln wie `"/en" + pfad` ignoriert, dass das Default-Locale `de` **prefixlos** ist (`prefixDefaultLocale: false`), und erzeugt Doppel-Locales wie `/en/de/…`.
- **Sprachvarianten als echte Seiten pro Locale rendern, nicht eine HTML clientseitig umbauen.** Header, Footer, Logo und Markenname kommen server-seitig aus `MainLayout`/`getBrandConfig` je `locale`. Einzelne Knoten per JS „patchen" ist fehleranfällig — vergessene Elemente (z. B. das Navbar-Logo) bleiben dann in der falschen Sprache. Wenn pro Sprache eine eigene Route existieren kann, ist das immer der saubere Weg.
- **Spezialfall 404** (GitHub Pages liefert nur EINE `404.html` für alle unbekannten Routen, auch unter `/en/`): DE = [`src/pages/404.astro`](../src/pages/404.astro) (server-gerendert, die ausgelieferte `404.html`), EN = [`src/pages/en/404.astro`](../src/pages/en/404.astro). Die Root-404 leitet `/en/`-Besucher per Head-Skript auf `/en/404/` um — **nur Locale-Erkennung, fester Redirect via `buildLocalizedUrl("en", "/404/")`**, kein Pfad-Umbau. Gemeinsames Markup in [`NotFoundCard.astro`](../src/components/NotFoundCard.astro). Beide Seiten tragen `noindex` (die EN-Seite hat 200-Status). Seiten­spezifische `<head>`-Einträge laufen über den `name="head"`-Slot von `MainLayout`.

## CSS

- Scoped `<style>` in der Komponente zuerst; globale Selektoren nur in `styles/*.css` oder begründet via `:global()`/`is:global`.
- Klassennamen: Block-Element-Stil mit Komponenten-Präfix (`docs-code-block__copy`), Zustände als `is-*`/`data-*`.
- **Farben nur über semantische Rollen-Tokens.** Komponenten nutzen ausschließlich eigene Rollen-Tokens (alle Farben mit `--color-`-Präfix, daisyUI-Konvention) — `--color-surface-*`, `--color-text-*`, `--color-accent-*` (+ daisyUI `--color-accent`), `--color-border-*`, `--color-state-*`, `--color-scrim-*`/`--shadow-*` (definiert in `src/styles/global.css`) oder daisyUI-Utilities (`bg-base-200`, `text-primary`). Surface-Rollen gibt es zusätzlich als Utilities (`bg-surface-panel`, `bg-surface-inset` …). **Kein** rohes `--palette-*`, **kein** `--color-base-*` und **kein** Hex/`rgb()`/benannte Farbe direkt in Komponenten — neue Farbrollen zuerst als Token in `global.css` anlegen.
- Quelle aller Design-Werte ist `src/styles/global.css` (Palette + Rohwerte leben nur dort). Der Guard `npm run lint:colors` (Pre-Commit-Hook `.githooks/` + CI) erzwingt das für **Farben, Abstände, Radien, Schrift und line-height**; begründete Ausnahme via Zeilen-Kommentar `color-guard-ignore` oder `bespoke`.

## Commits & Pull Requests

- Kleine, thematisch geschlossene Commits; Nachricht im Imperativ, das „Warum“ in den Body.
- Vor jedem PR: `npm run build` fehlerfrei; bei Content-Änderungen betroffene Seiten im Dev-Server geprüft; `docs/features.md` + `docs/changelog.md` aktualisiert (siehe AGENTS.md).
