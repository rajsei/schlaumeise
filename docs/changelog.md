# Changelog

Format: Datum — Änderungen (Wer: Mensch/Agent). Bei jeder Feature-Änderung ergänzen (Pflicht, siehe AGENTS.md).

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
