# Changelog

Format: Datum — Änderungen (Wer: Mensch/Agent). Bei jeder Feature-Änderung ergänzen (Pflicht, siehe AGENTS.md).

## 2026-07-06 — Roadmap-/Doku-Planung erweitert (Agent)

### Geändert
- **Nur Planungsdoku, kein Code.** Neue Vorhaben aus einer kritischen Review aufgenommen.
- `roadmap.md`: „Nie inline"-Durchsetzung, Import-Alias `@components/*`, **Heimische Vögel einbinden** (mit Artenvorschlägen: Eichelhäher, Star, Buchfink, Bunt-/Kleinspecht statt der nicht-heimischen Beispiele) und „Quellen & weiterführende Links" unter „Vor dem nächsten Release"; **Projekt-Steckbrief/Projektübersicht** und **Inline-Glossar** unter „Mittelfristig"; Quiz-UI als **noch ausstehend** markiert.
- `todo.md`: neue Aufgaben #26–#32 (ProjectMeta-Steckbrief, Quellen-Sektion, Heimische Vögel, Roh-HTML→`Callout`, Import-Alias, Inline-Glossar, „nie inline" auf DE-Startseite).
- `features.md`: Quizsystem-Status auf „UI noch ausstehend" präzisiert; neue geplante Einträge „Projekt-Steckbrief & Projektübersicht", „Wissenssammlung — Quellen & weiterführende Links", „Inline-Glossar".

## 2026-06-30 — Custom 404-Seite (zweisprachig, sauber) (Agent)

### Hinzugefügt
- `src/pages/404.astro` (DE, die ausgelieferte `404.html`) + `src/pages/en/404.astro` (EN) als **echte, server-gerenderte Seiten pro Locale** — Header, Logo, Footer, Wegweiser-Links automatisch korrekt lokalisiert
- `NotFoundCard.astro`: gemeinsames Karten-Markup beider 404-Seiten (Logo, Text, Wegweiser via `buildLocalizedUrl`)
- `MainLayout`: `name="head"`-Slot für seitenspezifische `<head>`-Einträge (noindex, Redirect-Skript)
- Dictionary-Sektion `notFound` (de/en)
- `conventions.md` → i18n: neue Regeln gegen selbstgebautes Locale-Routing und clientseitiges Sprach-„Patchen"

### Geändert
- **Fix:** vorheriger Ansatz (eine `404.html`, Inhalt clientseitig auf EN umgebaut) war fehlerhaft — Navbar-Logo blieb deutsch, und naives `"/en"+pfad` erzeugte Doppel-Locales wie `/en/de/…`. Ersetzt durch: Root-404 leitet `/en/`-Besucher per Head-Skript (nur Locale-Erkennung, fester Redirect via `buildLocalizedUrl`) auf die echte `/en/404/` um

### Hinweis
- GitHub Pages liefert nur EINE `404.html`; die EN-Seite (`/en/404/`, 200-Status) ist deren Redirect-Ziel, beide tragen `noindex`. `npm run build` grün (35 Seiten), Guard clean; DE/EN, Redirect, Sprachumschalter (beide Richtungen) und Menu-Drawer im Build geprüft

## 2026-06-23 — Spacing/Radius/Line-Height vollständig tokenisiert + AGENTS-Regel (Agent)

### Hinzugefügt
- Tokens: `--spacing-3xs` (0.125rem), `--radius-xs` (0.25rem) / `--radius-sm` (0.375rem), `--line-height-tight/-snug/-normal` (1.25 / 1.4 / 1.5)
- `AGENTS.md`: neue Sektion „Styling- & Token-Regeln" — Komponenten nutzen **ausschließlich** Tokens (Farben/Abstände/Schrift/Radien/Ränder), `global.css` ist einzige Quelle

### Geändert
- Restliche hardkodierte Werte in Komponenten + `docs.css` auf Tokens **gesnappt** (≤ ~2 px Verschiebung): ~50 Spacing-Werte (Einzel + Shorthand), 7 Radien, 6 line-heights
- 10 bewusste Ausnahmen als `/* bespoke: … */` begründet (asymmetrische Callout-Paddings, Icon-Freiräume, Zeilennummern-Gutter, TOC-Einrückung, großer Abschnittsabstand); `line-height: 1/0` bleiben Resets; `border: 1px solid color-mix(currentColor…)` bewusst komponenten-relativ

### Hinweis
- Wertneutral bis auf die bewussten Snaps (alle ≤ ~2 px); Layout im Browser geprüft, `npm run build` grün, Guard clean
- Guard (`check-hardcoded-colors.mjs`) auf Spacing/Radien/Schrift/line-height erweitert — erzwingt jetzt alle Design-Tokens (Ausnahme-Marker `color-guard-ignore`/`bespoke`)

## 2026-06-23 — High-Contrast-Themes umgesetzt (Agent)

### Hinzugefügt
- Zwei daisyUI-Themes `light-contrast`/`dark-contrast` (Ziel Text/BG ≥ 7:1, Ränder ≥ 3:1, `--depth: 0`) + Rollen-Token-Deltas (`:root[data-theme="…-contrast"]`); `dark-contrast` erbt Dark über kombinierten Selektor. Schatten in High-Contrast aus, `--border-sm-transparent` sichtbar
- Head-Skript (`MainLayout`) setzt `data-mode` + `data-contrast` + zusammengesetztes `data-theme` vor dem Paint; Präzedenz: gespeichert → `prefers-contrast: more` → `prefers-color-scheme`
- `ThemeController`: **zweiter Toggle** (Kontrast), gemeinsame `apply()`-Logik, Speicherung `{mode, contrast}`

### Geändert
- `SidebarItems` aktive-Nav-Selektoren von `data-theme` auf `data-mode` (kontrast-unabhängig)
- **Fix (wichtig):** `class="theme-controller"` vom Mode-Toggle entfernt — daisyUIs `:root:has(input.theme-controller[value="dark"]:checked)` erzwang sonst das schlichte `dark`-Theme und überstimmte die zusammengesetzten Contrast-Themes (`dark-contrast` zeigte Normal-Dark-Farben). `data-theme` (Skript) ist jetzt alleinige Theme-Quelle

### Hinweis
- Im Browser verifiziert: alle vier Themes schalten korrekt **und orthogonal** (Mode × Kontrast), Persistenz ok, `npm run build` grün, Guard clean
- **Offen:** finale Markenfarbwerte (im CSS `/* unsicher */`) — neutrale Werte (Text/Fläche/Rand) sind belastbar; Kontrast von primary/accent/secondary/Feedback noch messen/justieren → #9
- Spektrogramm-Kontrast-Verstärkung bewusst separat (K4)

## 2026-06-23 — High-Contrast-Plan aktualisiert + Entscheidungen festgelegt (Agent)

### Geändert
- `docs/theme-plan.md` auf den aktuellen Token-Stand umgeschrieben (war veraltet: beschrieb die längst erledigte Vereinheitlichung + entfernte Tokens `--color-white/black`, `--color-gray-1…7`). Jetzt fokussierter High-Contrast-Umsetzungsplan auf Basis der `--color-*`-Architektur
- **Entscheidungen für #6b festgelegt:** (1a) vier volle daisyUI-Themes `light/dark/light-contrast/dark-contrast`; Ziele ≥ 7:1 Text/BG, ≥ 3:1 Ränder; `prefers-contrast: more` als Default + zweiter Toggle; Schatten aus (`--depth:0`, `--global-shadow*`→none, sichtbares `--border-sm-transparent`); Auflösungs-Präzedenz gespeichert → prefers-contrast → prefers-color-scheme; Spektrogramm-Kontrast separat
- Konkreter Farbwert-Entwurf im Plan (neutrale Werte gesetzt, Markenfarben als `/* unsicher */` zur finalen Festlegung markiert)
- `todo.md` #6b + `architecture.md` (Styling) nachgezogen

## 2026-06-23 — Farb-Tokens auf `--color-`-Präfix vereinheitlicht (Agent)

### Geändert
- **Konvention (daisyUI):** alle eigenen Farb-Rollen-Tokens tragen jetzt das `--color-`-Präfix. Repo-weiter Rename (60 Dateien): `--text*`→`--color-text*`, `--accent-subtle/-strong`→`--color-accent-*`, `--border-base/-subtle`→`--color-border-*`, `--state-*`→`--color-state-*`, `--scrim-*`→`--color-scrim-*`, `--surface-*`→`--color-surface-*`, `--spec-*`→`--color-spec-*` (inkl. JS-Lesestellen in `scripts/spectrogram/{axes,file,mic}.ts`)
- **`--accent`-Alias entfernt** — Komponenten nutzen direkt daisyUIs `var(--color-accent)`
- **Surface-Merge:** `--color-surface-*` ist jetzt **kanonisch im `@theme`** (vorher doppelt: `--surface-*` in `:root` + Bridge); eine Definition, Utilities `bg-surface-*` bleiben
- Nicht umbenannt (bewusst): Nicht-Farben (`--spacing-*`, `--font-*`, `--radius-*`, `--border-sm/-m`, `--shadow-*`) und der Komponenten-Namespace `--docs-*`
- Guard-Meldung, `conventions.md`, `architecture.md` nachgezogen. Wertneutral, Build grün

## 2026-06-23 — Radius-Tokens (Slice 3) + Token-Cleanup (Agent)

### Hinzugefügt
- `--radius-md: 0.75rem` (mittlerer Radius). `border-radius`-Literale migriert: `999px`→`--radius-pill`, `0.5rem`→`--radius-control`, `0.75rem`→`--radius-md` (wertneutral), `0.65rem`→`--radius-md` (Snap ~1,6 px). Mini-Radien (0.15–0.45 rem, 7px) bewusst bespoke

### Entfernt
- 4 tote Tokens aus `global.css`: `--global-header-bg`, `--global-header-border` (von `--surface-header` abgelöst), `--color-fixed-black`, `--border-strong` (Ex-`--color-border-high`)

## 2026-06-23 — Spacing- & Typografie-Tokens (Slices 6/7) (Agent)

### Hinzugefügt
- **Spacing-Skala** `--spacing-2xs…2xl` (0.25/0.5/0.75/1/1.5/2/3 rem) im `@theme`-Block → nutzbar als `var(--spacing-md)` und als Utilities (`p-md`, `gap-sm`, `m-lg`)
- **Typografie-Tokens** (theme-invariant): `--font-size-xs/sm/base/md/lg/xl` + Heading-`clamp()` `--font-size-h1/h2/h3`; `--font-weight-medium/semibold/bold/extrabold`

### Geändert
- Komponenten-`<style>`-Blöcke + `docs.css`: literale `font-weight` → Tokens (wertneutral); `font-size` → Tokens (Body-Skala konsolidiert vormals 0.72–0.95-Streuung, Snaps ≤ ~0,8 px); einzelne On-Scale-Abstände (`gap`/`padding`/`margin` = 0.25/0.5/0.75/1/1.5/2/3 rem) → `var(--spacing-*)`

### Hinweis
- Bewusst **nicht** tokenisiert: bespoke Einzelwerte (0.65, 1.2, 2.7 rem …) und Shorthand-Magic-Numbers (gehören nicht in eine Skala), `font-size: 0.9em` (relativ für Inline-Code), `font-size: 0` (Reset). `npm run build` grün
- Doku: `architecture.md` (Styling-Schichten), `todo.md` #6b/#9

## 2026-06-23 — Semantische Farb-Tokens vollständig durchgezogen (Agent)

### Geändert
- **Text & Akzent:** alle Komponenten von Alt-Aliassen (`--color-base-content*`, `--color-accent*`) auf semantische Rollen-Tokens (`--text`/`--text-strong`/`--text-muted`/`--text-on-accent`, `--accent`/`--accent-subtle`/`--accent-strong`) umgestellt; tote Aliasse aus `global.css` entfernt
- **Flächen:** verbliebene rohe `--color-base-100/200/300` in Komponenten auf `--surface-panel`/`--surface-page`/`--surface-header` migriert; neue Tokens `--surface-inset` (versenkte Medienflächen) und `--text-inverted` (Schrift auf aktiver Nav)
- **Surface-Utilities:** `@theme`-Bridge in `global.css` spiegelt die Surface-Rollen in den `--color-*`-Namespace → Tailwind-Utilities `bg-surface-page/-panel/-header/-inset` (eine Quelle, theme-aware, auch als `var(--surface-*)` nutzbar)
- **Border:** `--color-border`/`--color-border-low` umbenannt zu `--border-base`/`--border-subtle` (+ `--border-strong`); kollidiert bewusst **nicht** mit daisyUIs Breiten-Token `--border: 1px`
- **Scrims/Schatten:** hardcodierte `rgb()`-Overlays tokenisiert (`--scrim-drawer`, `--scrim-modal`, `--shadow-dropdown`), `docs.css`-Dopplung aufgelöst, toter Fallback im Picker entfernt

### Hinzugefügt
- Guard `scripts/check-hardcoded-colors.mjs` (`npm run lint:colors`): scannt Komponenten + `docs.css` auf Hex/`rgb()`/`--palette-*`/`--color-base-*`; Ausnahme via Zeilen-Kommentar `color-guard-ignore`
- Pre-Commit-Hook `.githooks/pre-commit` (aktiv via `core.hooksPath`) + CI-Workflow `.github/workflows/lint-colors.yml`
- `docs/conventions.md`: CSS-Farbregel auf semantische Tokens präzisiert (+ Guard-Verweis)

### Hinweis
- Rein wertneutral (Tokens zeigen auf dieselben Werte) — kein optischer Diff; `npm run build` grün. `src` enthält außerhalb `global.css` keine hardcodierten Farben mehr (einzige erlaubte Ausnahme: JS-Fallbacks in `scripts/spectrogram/axes.ts`)

## 2026-06-16 — Spektrogramm-Visualisierung umgesetzt (Agent)

### Hinzugefügt
- Datei-Modus `AudioSpectrogram.astro` und Live-Modus `MicSpectrogram.astro` (+ gemeinsamer `SpectrogramColorPicker.astro`) in `src/components/docs/`
- Gemeinsamer Client-Kern `src/scripts/spectrogram/`: `config.ts` (SSOT), `colormap.ts` (5 Paletten), `core.ts`, `axes.ts` (lineare Frequenzachse 0–20 kHz + Zeitachse), `progress.ts` (3-Phasen-Strich 0→2/3→Ende), `settings.ts` (globale Palette via localStorage + Pub/Sub), `raster.ts`, `file.ts`, `mic.ts` (5-s-Fenster, zeitbasiertes Scrollen), `colors-ui.ts`
- Build-Vorberechnung `scripts/spectrogram/`: `spectrogram-core.mjs` (eigene Radix-2-FFT/STFT, .spec-Rasterformat) + `precompute-spectrograms.mjs` (MP3→PCM→Raster, Hash-Cache; Decoder: mpg123-decoder → ffmpeg-Fallback → sauberes Überspringen)
- `src/types/spectrogram.ts`; i18n-Section `spectrogram` in `de.ts`/`en.ts`
- `package.json`: devDependency `mpg123-decoder`, npm pre-scripts (`predev`/`prebuild` → `spectrograms`); `.gitignore`: generiertes `src/assets/audio/spectrograms/`

### Geändert
- `audiosample.mdx` (de): alle 12 `<audio>` durch `<AudioSpectrogram>` ersetzt (behebt zugleich die doppelten `id`s), Rätsel-Vögel bewusst ohne Label; neue Sektion „Sieh deine eigene Stimme“ mit `<MicSpectrogram>`

### Hinweis
- FFT per Sinus-Test verifiziert (Peak im erwarteten Bin); TypeScript der Module typgeprüft. `npm run build` muss auf dem Zielsystem laufen (im Sandbox nicht möglich: Windows-`node_modules` ohne Linux-Rollup-Binary, Registry gesperrt). Zuvor einmal `npm install` (zieht `mpg123-decoder`).

## 2026-06-16 — Planungsdokument Spektrogramm-Visualisierung (Agent)

### Hinzugefügt
- `docs/spectrogram-plan.md`: vollständiger Architektur-/Strukturplan (Live-Mikrofon + Datei-Modus). Festlegungen: zwei Komponenten + gemeinsamer TS-Kern; Datei-Modus als zur Build-Zeit vorberechnetes, farbneutrales dB-Raster (A2); JS-MP3-Decoder als Build-`devDependency`; lineare Frequenzachse 0–20 kHz (anpassbar); beschriftete Achsen; globaler Farb-Picker; Fortschrittsstrich in 3 Phasen
- Einträge in `features.md` (📋 geplant), `roadmap.md`, `todo.md`

## 2026-06-13 — Audio komprimiert, Workshops in Navigation, Pfad-Altlasten beseitigt (Agent)

### Geändert
- Alle 10 WAV-Dateien nach MP3 (160 kbps) konvertiert, alle Audiodateien auf kebab-case-ASCII-Namen (`WeißkehlammerÜbungslied.wav` → `weisskehlammer-uebungslied.mp3`): `src/assets/audio/` von 8,1 MB auf 3,7 MB; bestehende MP3s nur umbenannt (kein erneutes Enkodieren). Referenzen in `audiosample.mdx` und `voegel-basiswissen.json` angepasst
- Neues Navigations-Topic „Workshops“ (Gruppe „Spring School 2026“, `workshop_materials/springschool`) — die Seite war zuvor verwaist
- `workshop_materials/springschool/overview.mdx`: toter `hero:`-Frontmatter-Block (nicht im Schema, wurde verworfen — Seite war faktisch leer) durch echten Seiteninhalt ersetzt; hartkodierter `/schlaumeise/en/…`-Link auf nicht existierende EN-Seite entfernt

### Entfernt
- `src/plugins/rehype-base-path-assets.mjs`: war nie eingebunden; nach der astro:assets-Migration gibt es keine hartkodierten Basis-Pfade mehr, die es korrigieren könnte — damit ist src/ komplett frei von `/schlaumeise/…`-Hardcodes

## 2026-06-13 — Artefakte eines fehlerhaften Merges entfernt (Agent)

### Entfernt
- `src/pages/en/[...slug].astro` und `src/lib/docs/navigation.ts`: Reste einer anderen, inkompatiblen Architektur (anderes `DocsLayout`-Props-Schema, `resolveDocsNavigation`, Loader-API-`render`). Die Route kollidierte mit `[locale]/[...slug].astro` (bedient `/en/…` bereits) und brach den Build bei `/en/impressum/`
- Doppelte `docs`-Blöcke in `de.ts`/`en.ts` (Keys `toggleSidebar`, `closeSidebar` … gehörten zur entfernten Route; JS behält bei doppelten Keys den zweiten — die echten Labels `toggleNav`/`closeNav` wären zur Laufzeit verloren gegangen)
- Weitere unreferenzierte Dateien derselben Fremd-Architektur: `components/docs/PageToc.astro`, `components/docs/Sidebar.astro`, `components/docs/SidebarItems.astro`, `components/docs/TopicIcon.astro`, `config/navigation.ts` (Duplikate zu `ui-elements/Sidebar*`, `DocsTOC`, `config/docs-navigation.ts`)
- Totes Prop `showSidebarToggle` aus `Header.astro`/`MainLayout.astro` (wurde durchgereicht, aber nirgends ausgewertet; einziger Setzer war die entfernte Route)

## 2026-06-12 — Theme-System überarbeitet (Agent)

### Hinzugefügt
- Zwei Custom-daisyUI-Themes „light“ (Standard) und „dark“ mit Markenfarben aus dem Schlaumeise-Logo (Meisen-Blau, Meisen-Gelb, Violett-Akzent) inkl. `color-scheme` pro Theme; eingebaute Themes deaktiviert (`themes: false`)
- Inline-Skript im `<head>` von `MainLayout`: setzt das Theme vor dem ersten Paint — kein Aufblitzen des falschen Themes mehr
- Versioniertes Speicherformat `schlaumeise:theme:v1` (`{mode, contrast}`) mit Migration vom alten `theme`-Key; Kontrast-Feld für die geplanten High-Contrast-Themes vorbereitet (Vorlage am Ende von `global.css`, todo #6b)

### Geändert
- `ThemeController`: nur noch Toggle-UI + Speichern (Auflösung übernimmt das Head-Skript)
- `site.config.ts`: `defaultTheme` von „cupcake“ (war toter Wert, wurde immer überschrieben) auf „light“
- Projekt-Tokens in `global.css` umgedreht: Light liegt jetzt auf `:root` (vorher Dark — dadurch mischten sich beim ersten Paint helle daisyUI- und dunkle Projekt-Farben), Dark via `[data-theme="dark"]`
- `--color-gray-7` auch im Dark-Theme definiert (war nur in Light vorhanden — latenter Bug, betraf u. a. `.audio`)

## 2026-06-12 — Content-Datei umbenannt + Namenskonvention (Agent)

### Geändert
- `knowledge_collection/ai+bioacoustic.md` → `ai-and-bioacoustic.md` (das `+` in der URL war ein Encoding-Risiko); Redirect von der alten URL in `astro.config.mjs`
- Neue Konvention in `docs/conventions.md`: Content-Dateinamen sind englisch und in allen Sprachversionen identisch (nur Inhalte werden übersetzt) — einzige Bestandsausnahme: `impressum.mdx`

## 2026-06-12 — Platzhaltertext in survey.mdx ersetzt (Agent)

### Geändert
- `guides/birdnet_live/survey.mdx`: daisyUI-Template-Platzhalter („Box Office News!“, Lorem ipsum, funktionsloser „Get Started“-Button) durch echten Survey-Beschreibungstext ersetzt; Button → Anker-Link zur Anleitung; `h1` → `h2` (Seite hatte zwei h1, a11y); Hero nicht mehr bildschirmfüllend (`min-h-screen` → `rounded-box`); redundanten Satz unter dem Hero entfernt (identisch mit Overview-Hero); Hero-Bild responsiv gemacht (`w-full h-auto` zusätzlich zu `max-w-sm` — vorher Overflow auf schmalen Screens)

## 2026-06-12 — site-Option gesetzt (Agent)

### Geändert
- `astro.config.mjs`: `site: "https://rajsei.github.io"` ergänzt (GitHub Pages; Base `/schlaumeise` unverändert) — die Sitemap wird damit beim Build erzeugt, absolute URLs sind korrekt

## 2026-06-12 — Bildmigration zu astro:assets (Agent)

### Geändert
- Alle 64 Inhaltsbilder von `public/images/` nach `src/assets/images/` verschoben (Struktur erhalten) — Bilder laufen jetzt durch die Astro-Bildoptimierung (WebP, Größenanpassung, Hashing)
- `ImageCarousel`, `LinkCard`, `RevealImage`: Bild-Props akzeptieren jetzt `string | ImageMetadata`; bei importierten Bildern wird `<Image>` aus `astro:assets` mit Breitenbegrenzung gerendert (Carousel 1024 px, RevealImage 800 px, LinkCard 640 px)
- `sd-setup.mdx` (17 Bilder), `hotspot-setup.mdx` (13 Bilder): Markdown-Bilder von hartkodierten `/schlaumeise//images/…`-Pfaden auf relative Pfade umgestellt (automatische Optimierung)
- `project01/index.mdx`, `assembly.mdx`: Carousel-Bilder und LinkCard-Vorschaubilder auf Imports umgestellt
- `audiosample.mdx`: `RevealImage` erhält importierte Bilder direkt (`ImageMetadata`) statt `.src`-Strings
- `guides/birdnet_live/index.md` und `survey.md` nach `.mdx` konvertiert (URLs unverändert): Hero-Hintergrund bzw. Hero-Bild nutzen jetzt importierte Assets; Survey-Bild hat jetzt einen Alt-Text (war ohne)
- Doku aktualisiert: `content-handbook.md` (neue Bild-Anleitung), `AGENTS.md` (Bildregel), `features.md`, `roadmap.md`, `todo.md`, `analysis.md`

### Verifiziert
- `npm run build` (Windows, 2026-06-12): 23 Seiten gebaut, 44 Bilder optimiert — Gesamtgröße der Inhaltsbilder von ~29,5 MB auf ~2,2 MB reduziert (≈ 93 %), keine Fehler

### Offen
- Platzhalter-Text in `survey.mdx` („Box Office News!“) ersetzen — als TODO #21 erfasst

## 2026-06-12 — Projekt-Audit & Aufräum-Refactoring (Agent)

### Hinzugefügt
- Projektdokumentation unter `docs/`: analysis, architecture, conventions, content-handbook, quiz-handbook, features, roadmap, todo, changelog
- `AGENTS.md` mit verbindlichen Regeln für KI-Agenten
- `.gitignore`
- Quiz-Datenmodell: `src/lib/quiz-schema.ts` (Zod + Typen), `src/lib/quizzes.ts` (Loader mit Build-Validierung), Beispiel `src/data/quizzes/de/voegel-basiswissen.json`
- Footer: Impressum-Link und EU-Förderlogo (EFRE/ESF) inkl. i18n-Keys `footer.*`
- Content-Schema: optionale Felder `category` und `tags` (wurden zuvor stillschweigend verworfen)

### Geändert
- `README.md`: Starter-Template durch echte Projektbeschreibung ersetzt
- `package.json`: Name `schlaumeise` gesetzt
- Header: totes Mobile-Dropdown (Trigger war auskommentiert) entfernt
- Footer: daisyUI-Platzhalter (tote Links ohne `href`) entfernt; `--sl-color-white`-Altlast korrigiert

### Entfernt
- Müll-Dateien im Root: `{console.error(e)`, `clipboard`, `tmp-guides.html`, `astro-dev.*.log`
- Leere, ungenutzte Dateien `src/content/about_us.mdx`, `src/content/index.mdx`
- Tote Navigationslinks `/services` und `/contact` (404) inkl. Dictionary-Keys `nav.parent/services/contact`
- `DropdownNavItem`-Einbindung im Header (Komponente bleibt als reserviert erhalten)

### Offen
- Build-Verifikation auf Windows (`npm run build`) — Sandbox konnte keine nativen Binaries laden
