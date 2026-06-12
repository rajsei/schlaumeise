# Roadmap

Abgeleitet aus [analysis.md](./analysis.md). Konkrete Aufgaben mit Aufwand und Abhängigkeiten: [todo.md](./todo.md).

## Sofort umsetzen (kritisch)

- ~~Build auf Windows verifizieren~~ **erledigt (2026-06-12)** — Build fehlerfrei, Bildoptimierung aktiv (~93 % kleinere Bilder).
- ~~`site` in `astro.config.mjs` setzen~~ **erledigt (2026-06-12)** — `https://rajsei.github.io` (GitHub Pages).
- ~~Hartkodierte `/schlaumeise/…`-Bildpfade aus Inhalten entfernen~~ **erledigt (2026-06-12)** durch Migration zu `astro:assets` — übrig ist ein einzelner hartkodierter Link in `workshop_materials/springschool/overview.mdx`; `rehype-base-path-assets.mjs` ist damit voraussichtlich obsolet (prüfen und entfernen).
- ~~`ai+bioacoustic.md` umbenennen~~ **erledigt (2026-06-12)** — jetzt `ai-and-bioacoustic.md`, Redirect in `astro.config.mjs`; Konvention: Content-Dateinamen englisch und sprachübergreifend identisch.

## Vor dem nächsten Release (Qualität)

- **EN-404-Strategie:** Sprachumschalter nur anzeigen, wenn die Übersetzung existiert — oder Astro-i18n-Fallback aktivieren.
- ~~Theme-Konsistenz~~ **erledigt (2026-06-12)** — Custom-daisyUI-Themes mit Markenfarben, Head-Skript gegen Aufblitzen, versioniertes Speicherformat. Folgeaufgabe: High-Contrast-Themes (todo #6b).
- ~~Bilder zu `astro:assets` migrieren~~ **erledigt (2026-06-12)** — alle 64 Inhaltsbilder nach `src/assets/images/` migriert, Komponenten akzeptieren `ImageMetadata`.
- **Audio komprimieren:** WAV → Opus/MP3 in `src/assets/audio/`.
- **A11y-Audit:** Kontraste beider Themes, Tastaturnavigation des Drawers, `aria-current` auf aktiven Links.
- **`workshop_materials` einhängen oder ausblenden** — aktuell verwaist (nur per URL erreichbar).
- **Startseiten vereinheitlichen:** DE-Hero (hartkodiert) und EN-`HomeContent` zu einer dictionary-getriebenen Komponente zusammenführen.

## Mittelfristig (hoher Mehrwert)

- **Quiz-UI bauen:** `QuizPlayer` + Fragetyp-Komponenten + Routen `quiz/[id]` (Datenmodell und Validierung stehen bereits — siehe quiz-handbook.md).
- **Lernfortschritt in `localStorage`** (versioniertes Format `schlaumeise:quiz-progress:v1`).
- **Suche mit Pagefind** — statisch, kein Server, i18n-fähig.
- **Content-Verzeichnisse auf kebab-case migrieren** (mit Redirects): `knowledge_collection` → `wissen`, `workshop_materials` → `workshops`, `birdnet_live` → `birdnet-live`.
- **Collections auf Astro-Loader-API migrieren** (`glob()`), dabei `getCollectionUnsafe`-Cast in `docs-content.ts` entfernen; Quizze als `file()`-Collection.

## Langfristig (Vision)

- **Lernpfade/Lernmodule:** kuratierte Abfolgen aus Inhalt + Quiz, Abzeichen/Gamification.
- **Workshop-Modus:** Fortschritts-Export/-Import ohne Accounts; später optionaler Server-Sync.
- **Weitere Sprachen** über das bestehende `locales`-Array.
- **Redaktions-Workflow:** ggf. Git-basiertes CMS (z. B. Keystatic/Decap) auf die bestehenden Collections aufsetzen — Datenformate sind darauf vorbereitet.
