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

Content-Ordner: kebab-case (neu); Bestand in snake_case (`knowledge_collection` …) bleibt bis zur Redirect-Migration.

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

## Collections & Daten

- Collection-Namen: englisch, Plural, camelCase: `docs`, künftig `quizzes`.
- Frontmatter-Felder: camelCase (`topicId`), dokumentiert in [content-handbook.md](./content-handbook.md). Neue Felder **immer zuerst** ins Zod-Schema (`src/content.config.ts`) und in `src/types/docs.ts` — sonst werden sie stillschweigend verworfen.
- JSON-Quizdaten: Pflichtfelder und Fragetypen in [quiz-handbook.md](./quiz-handbook.md); IDs innerhalb einer Datei eindeutig, kebab-case.

## i18n

- Dictionary-Keys: `bereich.camelCase` (`docs.toggleNav`). `de.ts` ist die Referenz (der `Dictionary`-Typ wird daraus abgeleitet) — jede Änderung muss in **allen** Locale-Dateien erfolgen, sonst Typfehler.
- Keine sichtbaren Strings hart in Komponenten — immer über das Dictionary (Ausnahme: Inhalte in `src/content/`).
- URLs nie hart bauen: `buildLocalizedUrl`, `withBase`, `resolveAssetUrl` verwenden — niemals `/schlaumeise/…` hartkodieren.

## CSS

- Scoped `<style>` in der Komponente zuerst; globale Selektoren nur in `styles/*.css` oder begründet via `:global()`/`is:global`.
- Klassennamen: Block-Element-Stil mit Komponenten-Präfix (`docs-code-block__copy`), Zustände als `is-*`/`data-*`.
- **Farben nur über semantische Rollen-Tokens.** Komponenten nutzen ausschließlich eigene Rollen-Tokens (alle Farben mit `--color-`-Präfix, daisyUI-Konvention) — `--color-surface-*`, `--color-text-*`, `--color-accent-*` (+ daisyUI `--color-accent`), `--color-border-*`, `--color-state-*`, `--color-scrim-*`/`--shadow-*` (definiert in `src/styles/global.css`) oder daisyUI-Utilities (`bg-base-200`, `text-primary`). Surface-Rollen gibt es zusätzlich als Utilities (`bg-surface-panel`, `bg-surface-inset` …). **Kein** rohes `--palette-*`, **kein** `--color-base-*` und **kein** Hex/`rgb()`/benannte Farbe direkt in Komponenten — neue Farbrollen zuerst als Token in `global.css` anlegen.
- Quelle aller Farben ist `src/styles/global.css` (Palette + Rohwerte leben nur dort). Der Guard `npm run lint:colors` (Pre-Commit-Hook `.githooks/` + CI) erzwingt das; begründete Ausnahme via Zeilen-Kommentar `color-guard-ignore`.

## Commits & Pull Requests

- Kleine, thematisch geschlossene Commits; Nachricht im Imperativ, das „Warum“ in den Body.
- Vor jedem PR: `npm run build` fehlerfrei; bei Content-Änderungen betroffene Seiten im Dev-Server geprüft; `docs/features.md` + `docs/changelog.md` aktualisiert (siehe AGENTS.md).
