# Features

Vollständige Funktionsübersicht. Status: ✅ umgesetzt · 🟡 teilweise umgesetzt · 📋 geplant.
Pflicht: Nach jeder Feature-Änderung diese Datei aktualisieren (siehe AGENTS.md).

## Dokumentations-/Lernseiten

**Beschreibung:** Markdown/MDX-Inhalte aus der `docs`-Collection, gerendert über `DocsLayout` mit Sidebar, Inhalts-TOC und Prev/Next-Pagination. Themenbereiche: Anleitungen (BirdNET Live, Schlaumeise/Smartfinch-App), Projekte, Wissenssammlung, Begriffsverzeichnis.
**Status:** ✅ umgesetzt
**Betroffene Bereiche:** `src/content/docs/`, `src/pages/[...slug].astro`, `src/pages/[locale]/[...slug].astro`, `src/layouts/DocsLayout.astro`, `src/lib/docs-content.ts`
**Erweiterungsmöglichkeiten:** Verschlagwortung über `tags`/`category` sichtbar machen (Filter-/Übersichtsseiten). Workshop-Materialien sind seit 2026-06-13 als Topic „Workshops“ eingehängt.

## App-Anleitungen

**Beschreibung:** Anleitungen zu Smartphone-Apps unter dem Topic „Anleitungen“, je Sprache gleich aufgebaut (Übersicht mit Hero, Bereichs-/Modus-Seiten, Einstellungen und Tipps). `guides/birdnet-live` „BirdNET Live“ — die wissenschaftliche App (Live, Survey, Point Count, ARU, Einstellungen). `guides/smartfinch-app` „Schlaumeise App“ (EN: „Smartfinch App“) — das gamifizierte Sammelspiel für Kinder von 8 bis 13 Jahren, parallel zum BirdNET-Live-Guide aufgebaut: `index` (Vorstellung, Spielprinzip, Bereiche, Kindersicherheit, Hintergrund, Download-Status, FAQ), `comparison` (Abgrenzung zu BirdNET Live: Vergleichstabelle, „Warum zwei Apps?“, Entscheidungshilfe, Hinweis für Lehrkräfte), `listening` (Lauschen/Live), `stars` (Punkteregeln: Stufen, einmal pro Tag, Boni, Extra-Sterne, Jahreslauf), `collection` (Sammlung und Erkunden), `journal` (Tagebuch, „Falsch erkannt?“, Tag teilen), `progress` (Punkte, Auszeichnungen, Errungenschaften, Level, Sticker), `settings` (Tipps, Einstellungen, Sicherung, Hinweise für Eltern und Lehrkräfte). Die BirdNET-Live-Übersicht verlinkt auf den Vergleich.
**Status:** ✅ umgesetzt (DE + EN) — Schlaumeise-Guide noch ohne App-Screenshots; Store-Links folgen, sobald die App veröffentlicht ist. Sidebar-Badge „Bald“ an der Gruppe, bis die App erschienen ist.
**Betroffene Bereiche:** `src/content/docs/<locale>/guides/birdnet-live/`, `src/content/docs/<locale>/guides/smartfinch-app/`, `src/config/docs-navigation.ts`
**Erweiterungsmöglichkeiten:** Screenshots der Schlaumeise-App; Store-Links nach Veröffentlichung; Header-Menü und Startseiten-CTA (derzeit nur BirdNET Live) um die Schlaumeise-App ergänzen; Unterrichtsmaterial für Lehrkräfte auf Basis des Vergleichs.

## Projektseiten

**Beschreibung:** Schritt-für-Schritt-Bauanleitungen mit Steps, Terminals, Codeblöcken und Bildergalerien: `project01` „Das lauschende Vogelhaus“ (BirdNET-Pi: Komponenten, SD-/Pi-/Hotspot-Setup per Konsole, Zusammenbau) und `project02` „Smartfinch Pi“ (neutrale Grundanleitung: Materialien, SD-Image mit dem Raspberry Pi Imager, alternativ Einzeiler per SSH, Ersteinrichtung über den Hotspot-Assistenten, Aufstellen, Weboberfläche, Fehlerbehebung; eigene Anleitungen für Lehrkräfte und Schüler:innen sollen darauf aufbauen).
**Status:** ✅ umgesetzt
**Betroffene Bereiche:** `src/content/docs/<locale>/projects/project01/`, `src/content/docs/<locale>/projects/project02/`, MDX-Bausteine in `src/components/docs/`
**Erweiterungsmöglichkeiten:** Weitere Projekte als `project03/` …; Smartfinch-Pi-Anleitungen für Lehrkräfte und Schüler:innen; Screenshots der Smartfinch-Weboberfläche und Fotos eines Smartfinch-Aufbaus für `project02`; Materiallisten als strukturierte Daten statt Markdown-Tabellen.

## Navigation (Sidebar mit Topics)

**Beschreibung:** Konfigurationsgetriebene Sidebar (`docs-navigation.ts` → Resolver → `Sidebar`/`SidebarItems`/`TopicIcon`), Topics mit Icons, Gruppen mit Übersichts-Links, automatische Sortierung über `sidebar.order`, aktive-Pfad-Erkennung. Thema-Buttons bewusst ohne Tooltips (2026-07-14 erprobt und wieder entfernt — sichtbare Labels reichen). Hinweis-Badges („Neu“, „Bald“, „Archiv“) rechtsbündig hinter Topics, Gruppen und Links — gesetzt per `badge` in der Navigations-Config oder per Frontmatter `sidebar.badge` an einer Seite; Labels aus dem i18n-Dictionary (`navBadge`), Darstellung über `NavBadge` (daisyUI-`badge`). Derzeit gesetzt: Gruppen „Schlaumeise App“ (Anleitungen) und „Smartfinch Pi“ (Projekte) → „Bald“ / „Coming soon“, weil beide noch nicht veröffentlicht sind.
**Status:** ✅ umgesetzt (Badges seit 2026-11-04)
**Betroffene Bereiche:** `src/config/docs-navigation.ts`, `src/lib/docs-navigation.ts`, `src/components/ui-elements/Sidebar*.astro`, `src/components/ui-elements/NavBadge.astro`, `src/content.config.ts`, `src/types/docs.ts`, `src/i18n/locales/*` (`navBadge`)
**Erweiterungsmöglichkeiten:** Topbar-Themen-Dropdown mit echten Zielen (Komponente `DropdownNavItem` liegt dafür reserviert bereit); `aria-current` für aktive Links; weitere Badge-Varianten (z. B. „Aktualisiert“); „Neu“-Badge mit Ablaufdatum (wirkt bei statischem Build erst beim nächsten Build).

## Mobile Darstellung

**Beschreibung:** Drawer-Pattern: Sidebar als Off-Canvas mobil, fest ab `lg`; MenuDrawer stellt die Themen-Navigation auch auf Nicht-Docs-Seiten bereit; TOC mobil als ausklappbares `<details>`; Hamburger-Button mit animiertem Icon und Tooltip (`docs.toggleNavTooltip`).
**Status:** ✅ umgesetzt
**Betroffene Bereiche:** `src/scripts/docs-drawer.ts`, `src/components/MenuDrawer.astro`, `src/components/Header.astro`, `src/styles/docs.css`
**Erweiterungsmöglichkeiten:** Fokus-Falle im offenen Drawer; Wischgesten.

## Startseite (Hero + Fließtext)

**Beschreibung:** Gemeinsame Komponente `HomeContent.astro` für beide Locales: Hero mit Überschrift, Tagline, zwei CTA-Buttons (erstes Projekt, BirdNET-Live-Guide) und Wort-Bild-Marke (`BrandConfig.logoFull`), darunter sprachspezifischer MDX-Fließtext (`src/content/home/<locale>.mdx`) als Slot via `MdxInterpreter`. Alle sichtbaren Strings aus der Dictionary-Sektion `home`, alle Links via `buildLocalizedUrl`.
**Status:** ✅ umgesetzt (2026-07-10 vereinheitlicht, vorher DE/EN dupliziert mit Inline-Strings)
**Betroffene Bereiche:** `src/components/pages/HomeContent.astro`, `src/pages/index.astro`, `src/pages/en/index.astro`, `src/content/home/`, `src/i18n/locales/`, `src/config/site.config.ts`
**Erweiterungsmöglichkeiten:** CTA-Ziele konfigurierbar machen (z. B. aus `docs-navigation.ts`), sobald weitere Projekte existieren.

## Zweisprachigkeit (de/en)

**Beschreibung:** Deutsch ohne Präfix (Marke „Schlaumeise“), Englisch unter `/en/` (Marke „Smartfinch“) mit eigenem Logo; Dictionary-System mit aus `de` abgeleitetem Typ; Sprachumschalter im Header. Der Umschalter wird nur gerendert, wenn die Zielseite existiert: `MainLayout` prüft via `findDocEntryBySlug`, ob im Alternativ-Locale ein Docs-Eintrag mit gleichem Doc-Pfad vorhanden ist (Nicht-Docs-Seiten wie Home/404 gelten als beidsprachig); fehlt die Übersetzung, erhält `Header` `languageSwitchHref: null` und lässt den Button weg — kein 404 mehr über den Umschalter.
**Status:** 🟡 teilweise umgesetzt — Infrastruktur vollständig inkl. 404-sicherem Umschalter; englische Inhalte teilweise vorhanden.
**Betroffene Bereiche:** `src/i18n/`, `src/config/site.config.ts`, `src/content/docs/en/`, `src/layouts/MainLayout.astro`, `src/components/Header.astro`
**Erweiterungsmöglichkeiten:** Fallback auf deutsche Inhalte statt Ausblenden; weitere Sprachen über `locales`-Array.

## Theme-Umschaltung (hell/dunkel)

**Beschreibung:** Zwei Custom-daisyUI-Themes („light" Standard / „dark") mit Markenfarben (Meisen-Blau `#2558a0`/`#499bff`, Meisen-Gelb `#f9d15b`, Violett-Akzent). Theme-Auflösung per Inline-Skript im `<head>` vor dem ersten Paint (kein Aufblitzen); Persistenz im versionierten Format `schlaumeise:theme:v1` (`{mode, contrast}`), Migration vom alten `theme`-Key; `prefers-color-scheme`-Fallback; `color-scheme` pro Theme (Scrollbars/Formulare wechseln mit). Der `ThemeController` ist nur noch Toggle-UI; beide Toggles haben Tooltips + aria-Labels aus dem i18n-Dictionary (`a11y.themeToggle`/`a11y.contrastToggle`, Props aus `Header.astro`).
**Status:** ✅ umgesetzt
**Betroffene Bereiche:** `src/styles/global.css` (Theme-Definitionen), `src/layouts/MainLayout.astro` (Head-Skript), `src/components/ui-elements/ThemeController.astro`, `src/config/site.config.ts`
**Erweiterungsmöglichkeiten:** High-Contrast-Varianten `light-contrast`/`dark-contrast` (Vorlage am Ende von `global.css`, Speicherformat bereits vorbereitet, `prefers-contrast: more` als Default beachten) — todo #6b.

## Codeblöcke

**Beschreibung:** Shiki-Highlighting (zwei Themes), Titelzeile mit Sprach-Badge, Copy-Button mit Statuswechsel und lokalisierten Labels (i18n-Keys `docs.copyCode`/`docs.copiedCode` als aria-Label; in Markdown-Fences via Locale-Erkennung aus dem Content-Pfad im rehype-Plugin), Zeilennummern, Zeilen-Highlighting (`highlight`/`mark`/`ins`), Umbruchmodus; `Terminal`-Variante für Konsolen-Sessions; nutzbar in Markdown (Fences) und MDX (`Code`, `CodeBlock`, `Terminal`).
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
**Status:** 🟡 teilweise umgesetzt — **UI noch ausstehend.** Vorhanden sind nur Datenmodell (Zod-Schema), Loader mit Build-Validierung und ein Beispiel-Quiz; es gibt **keine spielbare Oberfläche und keine Route** — das Quizsystem ist für Nutzer:innen derzeit unsichtbar. `QuizPlayer`, Fragetyp-Komponenten und `quiz/[id]`-Routen sind geplant (siehe quiz-handbook.md, todo #12, roadmap „Mittelfristig").
**Betroffene Bereiche:** `src/lib/quiz-schema.ts`, `src/lib/quizzes.ts`, `src/data/quizzes/`
**Erweiterungsmöglichkeiten:** Neue Fragetypen über diskriminierte Union; Lückentext; Quiz-Empfehlung am Ende jeder Lernseite (`relatedDoc`).

## Projekt-Steckbrief & Projektübersicht

**Beschreibung:** Kompakte Einordnung jedes Projekts als Kachel-Karte am Seitenanfang: Schwierigkeit und Computerkenntnisse als Ampel-Punkteskala (1–3, grün/gelb/rot), Dauer, Kosten, Alter, Ort, Betreuungsgrad-Badge (Kinder allein / mit Erwachsenen / nur betreut), optionale Werkzeug-/Lernziel-Chips und Sicherheitshinweis; zusätzlich (noch offen) eine sortier-/filterbare Übersichtsseite über alle Projekte.
**Status:** 🟡 teilweise umgesetzt (2026-07-10) — **Steckbrief fertig:** Frontmatter-Objekt `project` (`difficulty`, `skillLevel`, `duration`, `cost`, `supervision`, `ageMin`, `indoorOutdoor`, `tools`, `learningGoals`, `safetyNotes`) mit Zod-Schema; `ProjectMeta.astro` wird von `DocsLayout` automatisch gerendert, sobald `project` gesetzt ist; Labels vollständig im i18n-Dictionary (`projectMeta`, de/en); eingesetzt auf `projects/project01` (DE + EN). **Übersichts-/Vergleichsseite noch ausstehend.**
**Betroffene Bereiche:** `src/content.config.ts`, `src/types/docs.ts`, `src/components/docs/ProjectMeta.astro`, `src/layouts/DocsLayout.astro`, `src/i18n/locales/*`, Projekt-`index.mdx`
**Erweiterungsmöglichkeiten:** Projekt-Übersichtsseite (sortier-/filterbar, skaliert ab `project02`), Legende, druckfreundliche Ansicht für Lehrkräfte — todo #26, roadmap „Mittelfristig".

## Wissenssammlung — Quellen & weiterführende Links

**Beschreibung:** Einheitlicher Block „Quellen & weiterführende Links" am Fuß jeder Wissensseite.
**Status:** 📋 geplant — datengetrieben (Frontmatter `sources`/`links` + Zod + eine Komponente, Wiederverwendung `LinkCard`), damit kein rohes HTML im Content nötig ist.
**Betroffene Bereiche:** künftig `src/content.config.ts`, `src/types/docs.ts`, eine Komponente, `src/content/docs/*/knowledge/*`
**Erweiterungsmöglichkeiten:** Zitierstil/Autor+Jahr; „zuletzt geprüft"-Datum — todo #27.

## Inline-Glossar

**Beschreibung:** Fachbegriffe im Fließtext per MDX-Komponente `Term` mit Tooltip (Kurzdefinition) und Link auf den Glossareintrag.
**Status:** ✅ umgesetzt (2026-07-10) — `Term.astro` (CSS-Tooltip, kein Client-JS; `aria-describedby`/`role="tooltip"`, sichtbar bei Hover **und** Tastaturfokus; Touch: Tap folgt dem Link). Kurzdefinition aus neuem Frontmatter-Feld `definition` (Fallback `description`), Zod-Schema + `types/docs.ts` erweitert; unbekannte `id` bricht den Build ab, fehlende Übersetzung fällt auf DE zurück. Ohne Import in MDX verfügbar (Catch-all-Routen); alle 4 Glossareinträge (DE+EN) haben `definition`; eingesetzt in `pi-setup`, `sd-setup`, `hotspot-setup` (DE+EN) und Springschool-`pi-setup` (EN).
**Betroffene Bereiche:** `src/components/docs/Term.astro`, `src/content.config.ts`, `src/types/docs.ts`, `src/i18n/locales/*` (`docs.glossaryTermHint`), `src/pages/[...slug].astro`, `src/pages/[locale]/[...slug].astro`, `src/content/docs/*/glossary/*`, diverse MDX-Inhalte
**Erweiterungsmöglichkeiten:** automatische Verlinkung bekannter Begriffe beim Build; weitere Glossareinträge (z. B. Bioindikator, Ökosystem) für die Wissenssammlung — todo #31.

## MDX-Bausteine: Listen & Layout

**Beschreibung:** Vier MDX-Komponenten für strukturierte Inhalte, ohne Import nutzbar (Catch-all-Routen). `Checklist` — abhakbare Liste mit gespeicherten Zuständen (`localStorage`), fetter Titel + eingerückte Unterpunkte, nur der Titel wird beim Abhaken durchgestrichen. `NumberedList` — schlichte nummerierte Aufzählung (CSS-Counter, kein JS), Beschreibung als Fließtext **oder** Unterpunkte. `MediaSection` — Text und Bild nebeneinander (zwei benannte Slots), stapelt per Container-Query auf schmalen Containern; Props `side`, `ratio`, `caption`. `Columns` — legt Kinder per CSS-Grid (`auto-fit`) nebeneinander und bricht bei Platzmangel um (Props `min`, `align`); mit `MediaSection` verschachtelt ergibt sich automatisch das richtige Verhalten (schmale Spalte → intern gestapelt, breite Einzelspalte → nebeneinander).
**Status:** ✅ umgesetzt (2026-07-27) — nur semantische Tokens (`lint:colors` grün), Build grün. `Checklist` eingesetzt in `project01/components` (DE+EN); `NumberedList` in den vier BirdNET-Live-Guides (`aru`, `point-count`, `survey`, `live`, DE+EN) und im Schlaumeise-Guide (`guides/smartfinch-app`). `MediaSection` in den BirdNET-Live-Guides `live` und `survey`; `Columns` in den Übersichten `guides/birdnet-live` und `guides/smartfinch-app` sowie in `guides/smartfinch-app/comparison`. Demo-Seiten unter `src/pages/dev/`.
**Betroffene Bereiche:** `src/components/docs/{Checklist,NumberedList,MediaSection,Columns}.astro`, beide Catch-all-Routen, `src/content/docs/*/projects/project01/components.mdx`, `src/content/docs/*/guides/birdnet-live/*.mdx`, `src/content/docs/*/guides/smartfinch-app/*.mdx`, `src/pages/dev/*`
**Erweiterungsmöglichkeiten:** aria-Labels von `Checklist` lokalisieren (derzeit fest deutsch, wie `Steps`); `MediaSection` optional „Bild beim Stapeln oben“; `Columns` optionaler Karten-Stil.

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

              