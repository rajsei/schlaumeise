# TODO

Priorität: P1 kritisch · P2 wichtig · P3 mittel · P4 später. Aufwand: S < 1 h · M ≈ ½ Tag · L ≥ 1 Tag.

| # | Aufgabe | Priorität | Aufwand | Abhängigkeiten |
| --- | --- | --- | --- | --- |
| 1 | ~~`npm run build` auf Windows ausführen~~ **erledigt 2026-06-12**: 23 Seiten, 44 optimierte Bilder (~29,5 MB → ~2,2 MB), keine Fehler | — | — | — |
| 2 | ~~`site` in `astro.config.mjs` eintragen~~ **erledigt 2026-06-12**: `https://rajsei.github.io` (GitHub Pages, Base `/schlaumeise`) | — | — | — |
| 3 | ~~Hartkodierte Basis-Pfade beseitigen~~ **vollständig erledigt 2026-06-13**: Link in `overview.mdx` gefixt, obsoletes `rehype-base-path-assets.mjs` entfernt — src/ ist frei von `/schlaumeise/`-Hardcodes | — | — | — |
| 4 | ~~`ai+bioacoustic.md` umbenennen + Redirect~~ **erledigt 2026-06-12**: `ai-and-bioacoustic.md` | — | — | — |
| 5 | Sprachumschalter nur bei existierender Übersetzung anzeigen (oder i18n-Fallback aktivieren) | P2 | M | — |
| 6 | ~~Theme-Fix + Custom-Themes~~ **erledigt 2026-06-12**: Head-Skript (kein FOUC), cupcake entfernt, Custom-daisyUI-Themes light/dark aus Markenfarben, versioniertes Speicherformat | — | — | — |
| 6b | ~~High-Contrast-Themes `light-contrast`/`dark-contrast` + zweiter Kontrast-Toggle~~ **umgesetzt 2026-06-23** (siehe changelog + [theme-plan.md](./theme-plan.md)): vier daisyUI-Themes, orthogonal über `data-mode`+`data-contrast`, Schatten aus, im Browser verifiziert. **Offen:** finale Markenfarbwerte (im CSS `/* unsicher */`) + Kontrast-Messung → #9; Spektrogramm-Kontrast separat (K4) | P3 | S | #6 ✅ |
| 7 | ~~Inhaltsbilder zu `astro:assets`/`<Image>` migrieren~~ **erledigt 2026-06-12** (Build-Verifikation auf Windows ausstehend, siehe #1) | — | — | — |
| 8 | ~~WAV-Audio konvertieren~~ **erledigt 2026-06-13**: 10 WAV → MP3 160 kbps, alle Audio-Dateinamen kebab-case (8,1 → 3,7 MB) | — | — | — |
| 9 | A11y-Audit (Kontrast, Tastatur, `aria-current`) und Befunde beheben. Kontrast-Korrekturen laufen seit 2026-06-23 zentral über die Rollen-Tokens (`--text-*`/`--surface-*`/`--border-*`) statt verstreut in Komponenten | P2 | M | — |
| 10 | ~~`workshop_materials` in Navigation aufnehmen~~ **erledigt 2026-06-13**: Topic „Workshops“ → „Spring School 2026“ | — | — | — |
| 11 | ~~Startseiten DE/EN in eine dictionary-getriebene `HomeContent` zusammenführen~~ **erledigt 2026-07-10**: `HomeContent.astro` rendert Hero + MDX-Fliesstext (Slot) für beide Locales; beide `index.astro` nur noch dünne Wrapper; volles Logo als `logoFull` in der Brand-Config; Links via `buildLocalizedUrl` (EN-Startseite hat jetzt auch den BirdNET-Live-Button) | — | — | — |
| 12 | Quiz-UI: `QuizPlayer`, Fragetyp-Komponenten, Route `quiz/[id]` (+ en) | P3 | L | Datenmodell ✅ |
| 13 | Quiz-Fortschritt in `localStorage` (`schlaumeise:quiz-progress:v1`) | P3 | M | #12 |
| 14 | Pagefind-Suche integrieren | P3 | M | #1 |
| 15 | Content-Ordner auf kebab-case migrieren (mit Redirects) | P3 | M | #2 |
| 16 | Collections auf Loader-API (`glob()`/`file()`) migrieren, `getCollectionUnsafe` entfernen | P3 | L | #1 |
| 17 | `docs-navigation.ts` in `sidebar-resolver.ts` + `pagination.ts` aufteilen | P4 | M | #16 |
| 18 | `MdxInterpreter` → `DocsProse` umbenennen (Name beschreibt Funktion nicht) | P4 | S | — |
| 19 | EN-Inhalte übersetzen (mindestens project01 + birdnet_live) | P4 | L | #5 |
| 20 | Eigene `Kbd`-MDX-Komponente | P4 | S | — |
| 21 | ~~Platzhalter-Inhalte in `survey.mdx` ersetzen~~ **erledigt 2026-06-12**: echter Hero-Text, CTA-Link statt funktionslosem Button, h2 statt zweitem h1, kein Vollbild-Hero mehr | — | — | — |
| 22 | Ungenutzte Bilder prüfen: `src/assets/images/springschool/` (5 Dateien) und `project01/pi-setup-en/` (16 Dateien, für EN-Übersetzung reserviert), `pi-setup/15.png`, `pi-setup2/nmtui07.jpg` | P4 | S | #19 |
| 23 | ~~Build-`devDependency` (JS-MP3-Decoder) freigeben~~ **erledigt 2026-06-16**: `mpg123-decoder` (devDependency) | — | — | — |
| 24 | ~~Spektrogramm-Visualisierung umsetzen (Live + Datei)~~ **umgesetzt 2026-06-16** (siehe changelog). Offen: `npm install` + `npm run build` auf dem Zielsystem verifizieren; Geräte-/A11y-Test im Browser | P2 | S | #23 ✅ |
| 25 | EN-Übersetzung der Sektion „Sieh deine eigene Stimme“ + `AudioSpectrogram`-Umstellung in `en/.../audiosample.mdx` (sobald EN-Inhalte kommen) | P4 | M | #19 |
| 26 | **Projekt-Steckbrief `ProjectMeta`** ~~als Karte auf der Projekt-`index`~~ **erledigt 2026-07-10**: Frontmatter-Objekt `project` + Zod-Schema (`content.config.ts`, `types/docs.ts`), `ProjectMeta.astro` (Kachel-Karte, Ampel-Skala 1–3, Betreuungs-Badge, Werkzeug-/Lernziel-Chips, Sicherheitshinweis), automatisches Rendern via `DocsLayout`, i18n-Sektion `projectMeta` (de/en), eingesetzt auf project01 (DE+EN). **Offen:** sortier-/filterbare **Projekt-Übersichtsseite** über alle Projekte + Legende (relevant ab `project02`) | P2 | M | — |
| 27 | **Wissenssammlung: „Quellen & weiterführende Links"** unten je Seite — datengetrieben (Frontmatter `sources`/`links` + Zod + eine Komponente, Wiederverwendung `LinkCard`), damit kein rohes HTML nötig ist | P2 | M | — |
| 28 | **Heimische Vögel einbinden (DE):** nicht-heimische Beispiele durch europäische Arten ersetzen (Audio CC/Xeno-Canto, Bilder, Fließtext, Quiz) — Eichelhäher↔Blauhäher, Star↔Spottdrossel/Leierschwanz, Buchfink↔Dachsammer, Bunt-/Kleinspecht↔Haar-/Dunenspecht, Buchfink/Amsel↔Weißkehlammer. Betrifft `knowledge_collection/birds.md`, `audiosample.mdx`, `assets/audio/*`, `assets/birds/*`, `data/quizzes/de/voegel-basiswissen.json` | P2 | L | — |
| 29 | **Rohes HTML aus MDX auslagern:** daisyUI-Alert-Block (`<div role="alert" class="alert …">`) in `de/projects/project01/pi-setup.mdx` (und weitere) in eine wiederverwendbare `Callout`/`Alert`-MDX-Komponente überführen — Konvention „Layout-Blöcke gehören in Komponenten" durchsetzen, damit Redakteur:innen kein HTML schreiben | P3 | M | — |
| 30 | **Import-Alias einführen:** `@components/*`, `@lib/*`, `@assets/*`, `@i18n/*` in `tsconfig.json` (+ Astro-Auflösung), bestehende `../../../../../…`-Importe in MDX/Komponenten umstellen | P3 | S | — |
| 31 | **Inline-Glossar:** MDX-Komponente (`Term`/`Gloss`) verlinkt Fachbegriffe im Fließtext per Tooltip/Link auf das Begriffsverzeichnis | P3 | M | — |
| 32 | ~~**„Nie inline" durchsetzen:** hartkodierte UI-Strings in `src/pages/index.astro` (Tagline, Button-Texte, Alt-Text) ins Dictionary; mit #11 (Startseiten vereinheitlichen) zusammenführen~~ **erledigt 2026-07-10** (zusammen mit #11): Dictionary-Sektion `home` neu (heading, tagline, ctaProject, ctaBirdnet, logoAlt), ungenutzte Keys `home.title`/`home.intro` entfernt. **Offen:** „nie inline" als Regel im Review-Check verankern | — | — | #11 ✅ |
