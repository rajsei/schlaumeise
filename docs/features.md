# Features

Vollständige Funktionsübersicht. Status: ✅ umgesetzt · 🟡 teilweise umgesetzt · 📋 geplant.
Pflicht: Nach jeder Feature-Änderung diese Datei aktualisieren (siehe AGENTS.md).

## Dokumentations-/Lernseiten

**Beschreibung:** Markdown/MDX-Inhalte aus der `docs`-Collection, gerendert über `DocsLayout` mit Sidebar, Inhalts-TOC und Prev/Next-Pagination. Themenbereiche: Anleitungen (BirdNET Live), Projekte, Wissenssammlung, Begriffsverzeichnis.
**Status:** ✅ umgesetzt
**Betroffene Bereiche:** `src/content/docs/`, `src/pages/[...slug].astro`, `src/pages/[locale]/[...slug].astro`, `src/layouts/DocsLayout.astro`, `src/lib/docs-content.ts`
**Erweiterungsmöglichkeiten:** Verschlagwortung über `tags`/`category` sichtbar machen (Filter-/Übersichtsseiten). Workshop-Materialien sind seit 2026-06-13 als Topic „Workshops“ eingehängt.

## Projektseiten

**Beschreibung:** Schritt-für-Schritt-Bauanleitungen (z. B. „Das lauschende Vogelhaus“: Komponenten, Zusammenbau, Pi-/SD-/Hotspot-Setup) mit Steps, Terminals, Codeblöcken und Bildergalerien.
**Status:** ✅ umgesetzt
**Betroffene Bereiche:** `src/content/docs/de/projects/project01/`, MDX-Bausteine in `src/components/docs/`
**Erweiterungsmöglichkeiten:** Weitere Projekte als `project02/` …; Materiallisten als strukturierte Daten statt Markdown-Tabellen.

## Navigation (Sidebar mit Topics)

**Beschreibung:** Konfigurationsgetriebene Sidebar (`docs-navigation.ts` → Resolver → `Sidebar`/`SidebarItems`/`TopicIcon`), Topics mit Icons, Gruppen mit Übersichts-Links, automatische Sortierung über `sidebar.order`, aktive-Pfad-Erkennung.
**Status:** ✅ umgesetzt
**Betroffene Bereiche:** `src/config/docs-navigation.ts`, `src/lib/docs-navigation.ts`, `src/components/ui-elements/Sidebar*.astro`
**Erweiterungsmöglichkeiten:** Topbar-Themen-Dropdown mit echten Zielen (Komponente `DropdownNavItem` liegt dafür reserviert bereit); `aria-current` für aktive Links.

## Mobile Darstellung

**Beschreibung:** Drawer-Pattern: Sidebar als Off-Canvas mobil, fest ab `lg`; MenuDrawer stellt die Themen-Navigation auch auf Nicht-Docs-Seiten bereit; TOC mobil als ausklappbares `<details>`; Hamburger-Button mit animiertem Icon.
**Status:** ✅ umgesetzt
**Betroffene Bereiche:** `src/scripts/docs-drawer.ts`, `src/components/MenuDrawer.astro`, `src/components/Header.astro`, `src/styles/docs.css`
**Erweiterungsmöglichkeiten:** Fokus-Falle im offenen Drawer; Wischgesten.

## Zweisprachigkeit (de/en)

**Beschreibung:** Deutsch ohne Präfix (Marke „Schlaumeise“), Englisch unter `/en/` (Marke „Smartfinch“) mit eigenem Logo; Dictionary-System mit aus `de` abgeleitetem Typ; Sprachumschalter im Header.
**Status:** 🟡 teilweise umgesetzt — Infrastruktur vollständig, englische Inhalte fehlen fast komplett (nur Impressum); Umschalter führt daher meist auf 404.
**Betroffene Bereiche:** `src/i18n/`, `src/config/site.config.ts`, `src/content/docs/en/`
**Erweiterungsmöglichkeiten:** Fallback auf deutsche Inhalte oder Umschalter nur bei vorhandener Übersetzung anzeigen; weitere Sprachen über `locales`-Array.

## Theme-Umschaltung (hell/dunkel)

**Beschreibung:** Zwei Custom-daisyUI-Themes („light" Standard / „dark") mit Markenfarben (Meisen-Blau `#2558a0`/`#499bff`, Meisen-Gelb `#f9d15b`, Violett-Akzent). Theme-Auflösung per Inline-Skript im `<head>` vor dem ersten Paint (kein Aufblitzen); Persistenz im versionierten Format `schlaumeise:theme:v1` (`{mode, contrast}`), Migration vom alten `theme`-Key; `prefers-color-scheme`-Fallback; `color-scheme` pro Theme (Scrollbars/Formulare wechseln mit). Der `ThemeController` ist nur noch Toggle-UI.
**Status:** ✅ umgesetzt
**Betroffene Bereiche:** `src/styles/global.css` (Theme-Definitionen), `src/layouts/MainLayout.astro` (Head-Skript), `src/components/ui-elements/ThemeController.astro`, `src/config/site.config.ts`
**Erweiterungsmöglichkeiten:** High-Contrast-Varianten `light-contrast`/`dark-contrast` (Vorlage am Ende von `global.css`, Speicherformat bereits vorbereitet, `prefers-contrast: more` als Default beachten) — todo #6b.

## Codeblöcke

**Beschreibung:** Shiki-Highlighting (zwei Themes), Titelzeile mit Sprach-Badge, Copy-Button mit Statuswechsel, Zeilennummern, Zeilen-Highlighting (`highlight`/`mark`/`ins`), Umbruchmodus; `Terminal`-Variante für Konsolen-Sessions; nutzbar in Markdown (Fences) und MDX (`Code`, `CodeBlock`, `Terminal`).
**Status:** ✅ umgesetzt
**Betroffene Bereiche:** `src/plugins/` (alle vier), `src/components/docs/Code*.astro`, `Terminal.astro`, `src/scripts/docs-code-copy.ts`
**Erweiterungsmöglichkeiten:** Diff-Ansicht; Dateinamen-Tabs für Mehrdatei-Beispiele.

## Tastaturdarstellung

**Beschreibung:** Tastenkombinationen als daisyUI-`kbd`-Elemente in Inhalten (z. B. Glossar „Shortcuts“).
**Status:** ✅ umgesetzt
**Betroffene Bereiche:** `src/content/docs/de/glossary/shortcuts.md`
**Erweiterungsmöglichkeiten:** Eigene `Kbd`-MDX-Komponente, um `class="kbd"`-Wiederholung zu vermeiden und OS-Varianten (Strg/⌘) zentral zu lösen.

## Bild-Features

**Beschreibung:** Zoombare Inhaltsbilder (`ZoomableDocsImages`), Bildkarussell (`ImageCarousel`), Aufdeck-Bilder (`RevealImage`), Hervorhebungs-Sektionen mit Pfeil-Grafiken (`HighlightSection`). Alle Inhaltsbilder liegen in `src/assets/images/` und laufen durch die `astro:assets`-Optimierung (WebP, Größenanpassung); `ImageCarousel`, `LinkCard` und `RevealImage` akzeptieren importierte Bilder (`ImageMetadata`) wie auch URL-Strings.
**Status:** ✅ umgesetzt
**Betroffene Bereiche:** `src/components/docs/`, `src/assets/images/`, `src/assets/arrows/`
**Erweiterungsmöglichkeiten:** Responsive `srcset` über `widths`/`sizes`; AVIF-Format.

## Spektrogramm-Visualisierung (Audio)

**Beschreibung:** Spektrogramm-Darstellung zu Audioinhalten in zwei Modi — Live (Mikrofon, scrollendes 5-s-Fenster, Start/Stop) und Datei (zur Build-Zeit vorberechnetes dB-Raster pro MP3, scrollend mit Fortschrittsstrich in 3 Phasen: 0→2/3, Halt bei 2/3, 2/3→Ende). Lineare Frequenzachse (0–20 kHz, anpassbar), beschriftete x/y-Achsen, globaler Farb-Picker (Zahnrad). Gemeinsamer TS-Kern in `src/scripts/spectrogram/`, zwei dünne Komponenten.
**Status:** 🟡 umgesetzt — Build-Verifikation auf dem Zielsystem ausstehend (im Agent-Sandbox kein `astro build`: Windows-`node_modules` ohne Linux-Rollup-Binary, npm-Registry gesperrt). Vollständiger Plan: [spectrogram-plan.md](./spectrogram-plan.md).
**Betroffene Bereiche:** `src/components/docs/AudioSpectrogram.astro`, `MicSpectrogram.astro`, `SpectrogramColorPicker.astro`; `src/scripts/spectrogram/`; `scripts/spectrogram/` (Build-Vorberechnung); `src/types/spectrogram.ts`; `src/i18n/locales/de.ts`+`en.ts` (Section `spectrogram`); `src/assets/audio/spectrograms/` (generiert, gitignored); `audiosample.mdx`; `package.json` (devDependency `mpg123-decoder`, pre-scripts)
**Erweiterungsmöglichkeiten:** logarithmische/Mel-Frequenzachse; variables Live-Zeitfenster; Zoom; EN-Übersetzung.

## Suchfunktion

**Beschreibung:** Volltextsuche über alle Lerninhalte.
**Status:** 📋 geplant
**Betroffene Bereiche:** Header (Suchfeld), Build-Pipeline
**Erweiterungsmöglichkeiten:** Pagefind als statische Suche (kein Server nötig, i18n-fähig) — empfohlen.

## Quizsystem

**Beschreibung:** Interaktive Quizze zu Lerninhalten. Fragetypen: Single/Multiple Choice, Wahr/Falsch, Bild- und Audiofragen, Reihenfolgen, Zuordnungen.
**Status:** 🟡 teilweise umgesetzt — Datenmodell (Zod-Schema), Loader mit Build-Validierung und Beispiel-Quiz vorhanden; UI-Komponenten und Routen geplant (siehe quiz-handbook.md).
**Betroffene Bereiche:** `src/lib/quiz-schema.ts`, `src/lib/quizzes.ts`, `src/data/quizzes/`
**Erweiterungsmöglichkeiten:** Neue Fragetypen über diskriminierte Union; Lückentext; Quiz-Empfehlung am Ende jeder Lernseite (`relatedDoc`).

## Lernfortschritt

**Beschreibung:** Speicherung absolvierter Quizze/Module im Browser.
**Status:** 📋 geplant
**Betroffene Bereiche:** künftig `src/scripts/quiz-progress.ts`, `localStorage` (`schlaumeise:quiz-progress:v1`)
**Erweiterungsmöglichkeiten:** Export/Import für Workshops; langfristig Server-Sync.

## Lernmodule / Lernpfade

**Beschreibung:** Kuratierte Abfolgen aus Lernseiten + Quiz („Lies X, dann teste dich“).
**Status:** 📋 geplant
**Betroffene Bereiche:** Navigation, Quizsystem, ggf. eigene Collection
**Erweiterungsmöglichkeiten:** Gamification (Abzeichen), Workshop-Modus für Gruppen.

## Footer mit Impressum & Förderhinweis

**Beschreibung:** Footer mit Marke, Impressum-Link und EU-Förderlogo (EFRE/ESF, Freistaat Sachsen).
**Status:** ✅ umgesetzt
**Betroffene Bereiche:** `src/components/Footer.astro`, `src/i18n/locales/*`
**Erweiterungsmöglichkeiten:** Datenschutz-Seite, Kontakt.

## Reservierte Komponenten

`DropdownNavItem.astro` (`src/components/ui-elements/`): generisches, framework-freies Navbar-Dropdown mit Tastatursteuerung — derzeit ohne Verwendung, reserviert für ein künftiges Themen-Dropdown im Header. Nicht löschen, ohne diese Zeile zu aktualisieren.
