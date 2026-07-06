# Roadmap

Abgeleitet aus [analysis.md](./analysis.md). Konkrete Aufgaben mit Aufwand und Abhängigkeiten: [todo.md](./todo.md).

## Sofort umsetzen (kritisch)

- ~~Build auf Windows verifizieren~~ **erledigt (2026-06-12)** — Build fehlerfrei, Bildoptimierung aktiv (~93 % kleinere Bilder).
- ~~`site` in `astro.config.mjs` setzen~~ **erledigt (2026-06-12)** — `https://rajsei.github.io` (GitHub Pages).
- ~~Hartkodierte `/schlaumeise/…`-Pfade entfernen~~ **vollständig erledigt (2026-06-13)** — Bilder via `astro:assets`, letzter Link gefixt, obsoletes `rehype-base-path-assets.mjs` gelöscht.
- ~~`ai+bioacoustic.md` umbenennen~~ **erledigt (2026-06-12)** — jetzt `ai-and-bioacoustic.md`, Redirect in `astro.config.mjs`; Konvention: Content-Dateinamen englisch und sprachübergreifend identisch.

## Vor dem nächsten Release (Qualität)

- **EN-404-Strategie:** Sprachumschalter nur anzeigen, wenn die Übersetzung existiert — oder Astro-i18n-Fallback aktivieren.
- ~~Theme-Konsistenz~~ **erledigt (2026-06-12)** — Custom-daisyUI-Themes mit Markenfarben, Head-Skript gegen Aufblitzen, versioniertes Speicherformat. Folgeaufgabe: High-Contrast-Themes (todo #6b).
- ~~Bilder zu `astro:assets` migrieren~~ **erledigt (2026-06-12)** — alle 64 Inhaltsbilder nach `src/assets/images/` migriert, Komponenten akzeptieren `ImageMetadata`.
- ~~Audio komprimieren~~ **erledigt (2026-06-13)** — 10 WAV → MP3, 8,1 → 3,7 MB, Dateinamen kebab-case.
- **A11y-Audit:** Kontraste beider Themes, Tastaturnavigation des Drawers, `aria-current` auf aktiven Links.
- ~~`workshop_materials` einhängen~~ **erledigt (2026-06-13)** — Topic „Workshops“ in der Navigation.
- **Startseiten vereinheitlichen:** DE-Hero (hartkodiert) und EN-`HomeContent` zu einer dictionary-getriebenen Komponente zusammenführen.
- **„Nie inline"-Prinzip durchsetzen:** sichtbare UI-Strings gehören ins i18n-Dictionary, nie in Templates. Konkreter Verstoß: `src/pages/index.astro` kodiert Tagline, Button-Texte und Alt-Text hart — ins Dictionary ziehen (verzahnt mit „Startseiten vereinheitlichen"). Danach als Regel im A11y-/Review-Check verankern.
- **Import-Alias `@components/*` einführen:** Alias-Pfade in `tsconfig.json` + Astro-Auflösung, damit MDX-/Komponenten-Importe nicht mehr als `../../../../../components/...` geschrieben werden (fragil, für Redakteur:innen unlesbar). Bestehende Importe schrittweise umstellen.
- **Heimische Vögel einbinden (DE):** Die Kernbeispiele sind aktuell überwiegend nicht-heimisch (Blauhäher, Spottdrossel, Dachsammer, Haar-/Dunenspecht, Weißkehlammer, Leierschwanz). Für „heimische Vögel" durch europäische Arten ersetzen — Audio (Xeno-Canto, CC), Bilder, Fließtext und Quiz. Vorschlag zur Zuordnung nach didaktischer Rolle: auffälliges Gefieder/Haube → **Eichelhäher** (statt Blauhäher); Stimmen-Imitator → **Star** (statt Spottdrossel; deckt zugleich die „technische Geräusche"-Rolle des Leierschwanzes ab); Gesangs-**Dialekte** → **Buchfink** (statt Dachsammer); Größenkontrast Spechte → **Buntspecht** + **Kleinspecht** (statt Haar-/Dunenspecht); Lied-Lernen/„Übungslied" → **Buchfink** oder **Amsel** (statt Weißkehlammer). Exotische Extrembeispiele (Leierschwanz) optional als klar gekennzeichneter „weltweit"-Exkurs behalten. Empfohlenes heimisches Starter-Set: Kohlmeise, Blaumeise, Amsel, Rotkehlchen, Buchfink, Haussperling, Star, Kleiber, Buntspecht, Eichelhäher.
- **Wissenssammlung — Quellen & weiterführende Links:** je Seite unten ein einheitlicher Block „Quellen & weiterführende Links". Datengetrieben lösen (Frontmatter-Feld `sources`/`links` + Zod-Schema + eine Komponente), damit Redakteur:innen kein HTML schreiben; Wiederverwendung von `LinkCard`.

## Mittelfristig (hoher Mehrwert)

- **Projekt-Steckbrief & Projektübersicht (Einordnung):** kompakte Einordnungs-Komponente pro Projekt (Tabelle/Karte) mit Aufwand/Dauer, geschätzten Kosten, benötigten Computerkenntnissen und Betreuungsgrad (Kinder allein / mit Erwachsenen / nur betreut). Datengetrieben: neue Frontmatter-Felder auf der Projekt-`index` (`difficulty`, `cost`, `duration`, `skillLevel`, `supervision`, `ageMin`, `tools`, `indoorOutdoor`, `learningGoals`) → Zod-Schema (`content.config.ts` + `types/docs.ts`) → eine Komponente `ProjectMeta`. Daraus zusätzlich eine **Vergleichs-/Übersichtsseite**, die alle Projekte in einer sortier-/filterbaren Tabelle zeigt (skaliert ab `project02`). Weitere Bausteine: Ampel-/Punkte-Skala (1–3) für schnelle Scannbarkeit, Legende, Sicherheitshinweise (Löten/Strom/scharfe Werkzeuge), Werkzeug-/Voraussetzungs-Checkliste, druckfreundlich (Lehrkräfte drucken den Steckbrief).
- **Quiz-UI bauen (noch ausstehend):** `QuizPlayer` + Fragetyp-Komponenten + Routen `quiz/[id]` (Datenmodell und Validierung stehen bereits — siehe quiz-handbook.md). **Aktuell existiert ausschließlich das Datenmodell + ein Beispiel-Quiz, keine spielbare Oberfläche** — bis dahin bleibt das Quizsystem für Nutzer:innen unsichtbar.
- **Inline-Glossar:** Fachbegriffe im Fließtext (z. B. „Bioindikator", „Ökosystem") per MDX-Komponente (`Term`/`Gloss`) mit Tooltip/Link auf das Begriffsverzeichnis verknüpfen. Löst zugleich das Sprachniveau-Problem (Fachwörter bleibt erklärt) und aktiviert das bislang isolierte Glossar.
- **Lernfortschritt in `localStorage`** (versioniertes Format `schlaumeise:quiz-progress:v1`).
- **Suche mit Pagefind** — statisch, kein Server, i18n-fähig.
- ~~**Spektrogramm-Visualisierung**~~ **umgesetzt (2026-06-16)** — Live-Mikrofon + Datei-Modus (zur Build-Zeit vorberechnetes dB-Raster), Fortschrittsstrich, Achsen, Farb-Picker. Plan: [spectrogram-plan.md](./spectrogram-plan.md). Offen: `npm run build` auf dem Zielsystem verifizieren.
- **Content-Verzeichnisse auf kebab-case migrieren** (mit Redirects): `knowledge_collection` → `wissen`, `workshop_materials` → `workshops`, `birdnet_live` → `birdnet-live`.
- **Collections auf Astro-Loader-API migrieren** (`glob()`), dabei `getCollectionUnsafe`-Cast in `docs-content.ts` entfernen; Quizze als `file()`-Collection.

## Langfristig (Vision)

- **Lernpfade/Lernmodule:** kuratierte Abfolgen aus Inhalt + Quiz, Abzeichen/Gamification.
- **Workshop-Modus:** Fortschritts-Export/-Import ohne Accounts; später optionaler Server-Sync.
- **Weitere Sprachen** über das bestehende `locales`-Array.
- **Redaktions-Workflow:** ggf. Git-basiertes CMS (z. B. Keystatic/Decap) auf die bestehenden Collections aufsetzen — Datenformate sind darauf vorbereitet.
