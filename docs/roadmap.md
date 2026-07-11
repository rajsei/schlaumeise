# Roadmap

Abgeleitet aus [analysis.md](./analysis.md). Konkrete Aufgaben mit Aufwand und Abhängigkeiten: [todo.md](./todo.md).

## Sofort umsetzen (kritisch)

- ~~Build auf Windows verifizieren~~ **erledigt (2026-06-12)** — Build fehlerfrei, Bildoptimierung aktiv (~93 % kleinere Bilder).
- ~~`site` in `astro.config.mjs` setzen~~ **erledigt (2026-06-12)** — `https://rajsei.github.io` (GitHub Pages).
- ~~Hartkodierte `/schlaumeise/…`-Pfade entfernen~~ **vollständig erledigt (2026-06-13)** — Bilder via `astro:assets`, letzter Link gefixt, obsoletes `rehype-base-path-assets.mjs` gelöscht.
- ~~`ai+bioacoustic.md` umbenennen~~ **erledigt (2026-06-12)** — jetzt `ai-and-bioacoustic.md`, Redirect in `astro.config.mjs`; Konvention: Content-Dateinamen englisch und sprachübergreifend identisch.

## Vor dem nächsten Release (Qualität)

- ~~EN-404-Strategie~~ **erledigt (2026-07-10)** — Sprachumschalter wird nur gerendert, wenn die Übersetzung existiert (todo #5); i18n-Fallback bleibt als spätere Option.
- ~~Theme-Konsistenz~~ **erledigt (2026-06-12)** — Custom-daisyUI-Themes mit Markenfarben, Head-Skript gegen Aufblitzen, versioniertes Speicherformat. Folgeaufgabe: High-Contrast-Themes (todo #6b).
- ~~Bilder zu `astro:assets` migrieren~~ **erledigt (2026-06-12)** — alle 64 Inhaltsbilder nach `src/assets/images/` migriert, Komponenten akzeptieren `ImageMetadata`.
- ~~Audio komprimieren~~ **erledigt (2026-06-13)** — 10 WAV → MP3, 8,1 → 3,7 MB, Dateinamen kebab-case.
- **A11y-Audit:** Kontraste beider Themes, Tastaturnavigation des Drawers, `aria-current` auf aktiven Links.
- ~~`workshop_materials` einhängen~~ **erledigt (2026-06-13)** — Topic „Workshops“ in der Navigation.
- ~~Startseiten vereinheitlichen~~ **erledigt (2026-07-10)** — `HomeContent.astro` als gemeinsame, dictionary-getriebene Startseiten-Komponente (Hero + MDX-Slot); beide `index.astro` nur noch dünne Wrapper; volles Logo als `logoFull` in der Brand-Config (todo #11).
- ~~„Nie inline"-Prinzip auf der Startseite durchsetzen~~ **erledigt (2026-07-10)** — Tagline, Button-Texte und Alt-Text aus `src/pages/index.astro` in die Dictionary-Sektion `home` gezogen (todo #32). **Offen:** „nie inline" als Regel im A11y-/Review-Check verankern.
- ~~Import-Alias `@components/*` einführen~~ **erledigt (2026-07-10)** — 13 Aliase in `tsconfig.json`, alle bestehenden `../`-Importe (206 in 54 Dateien, inkl. MDX) umgestellt; Konvention in `conventions.md` „Importe & Aliase" (todo #30).
- **Heimische Vögel einbinden (DE):** Die Kernbeispiele sind aktuell überwiegend nicht-heimisch (Blauhäher, Spottdrossel, Dachsammer, Haar-/Dunenspecht, Weißkehlammer, Leierschwanz). Für „heimische Vögel" durch europäische Arten ersetzen — Audio (Xeno-Canto, CC), Bilder, Fließtext und Quiz. Vorschlag zur Zuordnung nach didaktischer Rolle: auffälliges Gefieder/Haube → **Eichelhäher** (statt Blauhäher); Stimmen-Imitator → **Star** (statt Spottdrossel; deckt zugleich die „technische Geräusche"-Rolle des Leierschwanzes ab); Gesangs-**Dialekte** → **Buchfink** (statt Dachsammer); Größenkontrast Spechte → **Buntspecht** + **Kleinspecht** (statt Haar-/Dunenspecht); Lied-Lernen/„Übungslied" → **Buchfink** oder **Amsel** (statt Weißkehlammer). Exotische Extrembeispiele (Leierschwanz) optional als klar gekennzeichneter „weltweit"-Exkurs behalten. Empfohlenes heimisches Starter-Set: Kohlmeise, Blaumeise, Amsel, Rotkehlchen, Buchfink, Haussperling, Star, Kleiber, Buntspecht, Eichelhäher.
- **Wissenssammlung — Quellen & weiterführende Links:** je Seite unten ein einheitlicher Block „Quellen & weiterführende Links". Datengetrieben lösen (Frontmatter-Feld `sources`/`links` + Zod-Schema + eine Komponente), damit Redakteur:innen kein HTML schreiben; Wiederverwendung von `LinkCard`.

## Mittelfristig (hoher Mehrwert)

- **Projekt-Steckbrief & Projektübersicht (Einordnung):** **Steckbrief umgesetzt (2026-07-10)** — Frontmatter-Objekt `project` (`difficulty`, `skillLevel`, `duration`, `cost`, `supervision`, `ageMin`, `indoorOutdoor`, `tools`, `learningGoals`, `safetyNotes`) → Zod-Schema (`content.config.ts` + `types/docs.ts`) → `ProjectMeta.astro` (Kachel-Karte mit Ampel-Punkteskala 1–3, Betreuungs-Badge, Werkzeug-/Lernziel-Chips, Sicherheitshinweis), automatisch von `DocsLayout` am Seitenanfang gerendert; Labels via i18n (`projectMeta`, de/en). **Offen:** Vergleichs-/Übersichtsseite, die alle Projekte in einer sortier-/filterbaren Tabelle zeigt (skaliert ab `project02`); Legende; druckfreundliche Ansicht (Lehrkräfte drucken den Steckbrief).
- **Quiz-UI bauen (noch ausstehend):** `QuizPlayer` + Fragetyp-Komponenten + Routen `quiz/[id]` (Datenmodell und Validierung stehen bereits — siehe quiz-handbook.md). **Aktuell existiert ausschließlich das Datenmodell + ein Beispiel-Quiz, keine spielbare Oberfläche** — bis dahin bleibt das Quizsystem für Nutzer:innen unsichtbar.
- ~~**Inline-Glossar**~~ **umgesetzt (2026-07-10)** — `Term.astro` verlinkt Fachbegriffe im Fließtext mit Tooltip (Frontmatter `definition`) und Glossar-Link; eingesetzt in den Setup-Seiten (DE+EN). Offen: weitere Glossareinträge für die Wissenssammlung (z. B. „Bioindikator", „Ökosystem"), damit auch dort Begriffe erklärt werden können.
- **Lernfortschritt in `localStorage`** (versioniertes Format `schlaumeise:quiz-progress:v1`).
- **Suche mit Pagefind** — statisch, kein Server, i18n-fähig.
- ~~**Spektrogramm-Visualisierung**~~ **umgesetzt (2026-06-16)** — Live-Mikrofon + Datei-Modus (zur Build-Zeit vorberechnetes dB-Raster), Fortschrittsstrich, Achsen, Farb-Picker. Plan: [spectrogram-plan.md](./spectrogram-plan.md). Offen: `npm run build` auf dem Zielsystem verifizieren.
- ~~**Content-Verzeichnisse auf kebab-case migrieren**~~ **umgesetzt (2026-07-11)** — `knowledge_collection` → `knowledge`, `workshop_materials` → `workshops`, `birdnet_live` → `birdnet-live` (de+en); alte URLs per expliziter Redirect-Liste in `astro.config.mjs` abgedeckt.
- ~~**Collections auf Astro-Loader-API migrieren**~~ **umgesetzt (2026-07-11)** — `docs`/`home` auf `glob()`-Loader, `getCollectionUnsafe`-Cast entfernt, Typen aus dem Zod-Schema abgeleitet; Quizze als eigene `quizzes`-Collection (`glob()` über die JSON-Dateien, Integritätsprüfung via `superRefine`).

## Langfristig (Vision)

- **Lernpfade/Lernmodule:** kuratierte Abfolgen aus Inhalt + Quiz, Abzeichen/Gamification.
- **Workshop-Modus:** Fortschritts-Export/-Import ohne Accounts; später optionaler Server-Sync.
- **Weitere Sprachen** über das bestehende `locales`-Array.
- **Redaktions-Workflow:** ggf. Git-basiertes CMS (z. B. Keystatic/Decap) auf die bestehenden Collections aufsetzen — Datenformate sind darauf vorbereitet.
