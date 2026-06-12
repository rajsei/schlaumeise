# Projektanalyse — Stand 2026-06-12

Analyse des Astro-Projekts „Schlaumeise“ hinsichtlich Struktur, Wartbarkeit, Skalierbarkeit, Performance, Accessibility und Zukunftsfähigkeit. Direkt umgesetzte Maßnahmen sind als **[erledigt]** markiert; alles Offene findet sich priorisiert in [roadmap.md](./roadmap.md) und [todo.md](./todo.md).

## 1. Gesamtbewertung

Das Projekt ist deutlich besser aufgestellt, als der Projektzustand (Starter-README, Müll-Dateien im Root) zunächst vermuten ließ. Der Kern — Content Collections, konfigurationsgetriebene Navigation mit typisiertem Resolver (`src/lib/docs-navigation.ts`), saubere i18n-Schicht, strikte TypeScript-Konfiguration — ist durchdacht und langfristig tragfähig. Die Trennung von Inhalt (Markdown/MDX), Struktur (`src/config/docs-navigation.ts`) und Darstellung (Layouts/Komponenten) ist konsequent umgesetzt. Astro-Best-Practices (statischer Build, kein unnötiges Client-JS, Scoped Styles, `getStaticPaths` mit Props statt erneutem Laden) werden weitgehend eingehalten.

Die Schwächen lagen vor allem an den Rändern: tote Navigationslinks, Platzhalter-Footer, ungenutzte und leere Dateien, fehlende Projektdokumentation, inkonsistente Benennung im Content-Bereich und hartkodierte Basis-Pfade in Inhalten.

## 2. Beantwortung der Leitfragen

**Ist die Ordnerstruktur logisch?** Ja, im Wesentlichen. `components/` ist sinnvoll in `docs/`, `pages/`, `ui-elements/` gegliedert; `lib/` (Logik), `config/` (Konfiguration), `i18n/`, `plugins/`, `scripts/` sind klar getrennt. Schwachpunkt: `ui-elements/Sidebar.astro` und `SidebarItems.astro` sind faktisch Docs-Navigation, keine generischen UI-Elemente (siehe Refactoring-Vorschläge).

**Ist die Struktur erweiterungsfähig?** Ja. Für das Quizsystem wurde `src/data/quizzes/` (JSON) plus `src/lib/quiz-schema.ts`/`quizzes.ts` ergänzt — der Datenpfad ist damit vorbereitet, ohne bestehende Collections anzufassen.

**Gibt es technische Schulden?**

- **[erledigt]** Müll-Dateien im Root (`{console.error(e)`, `clipboard`, `tmp-guides.html`, Dev-Logs) entfernt.
- **[erledigt]** Fehlende `.gitignore` ergänzt (vorher wurden Logs/Temp-Dateien nur zufällig nicht committet).
- **[erledigt]** `package.json` hatte keinen Namen; README war das unveränderte Starter-Template.
- **[erledigt]** Leere, nirgends eingebundene Dateien `src/content/about_us.mdx` und `src/content/index.mdx` entfernt.
- **Offen:** `src/plugins/rehype-base-path-assets.mjs` existiert, ist aber in `astro.config.mjs` nicht eingebunden (tote Datei mit klarem Zweck: Basis-Pfad-Korrektur für Bilder). Entweder einbinden und die hartkodierten `/schlaumeise/…`-Pfade aus 7 Content-Dateien entfernen, oder Plugin löschen. Empfehlung: einbinden (siehe Roadmap „Sofort“).
- **Offen:** Legacy-Collection-API (`type: "content"`); Astro 5 empfiehlt die Loader-API (`glob()`). Migration mittelfristig, zusammen mit Entfernung des `getCollectionUnsafe`-Casts in `src/lib/docs-content.ts`.

**Gibt es redundanten/unnötigen Code?**

- **[erledigt]** Header: Dropdown „Themen“ verlinkte auf nicht existierende Seiten `/services` und `/contact` (404 für Besucher). Zusätzlich war das mobile Dropdown-Markup unerreichbar (Trigger auskommentiert) — komplett entfernt, inkl. der drei zugehörigen toten Dictionary-Keys und CSS-Klassen.
- **[erledigt]** Footer: daisyUI-Platzhalter („Branding“, „Jobs“, „Cookie policy“ — Links ohne `href`) ersetzt durch echten Footer mit Impressum-Link und EU-Förderlogo (das Logo lag ungenutzt in `src/assets/` — bei EFRE/ESF-Förderung ist die Anzeige i. d. R. verpflichtend). Dabei auch den Verweis auf die nicht existierende Variable `--sl-color-white` (Starlight-Altlast) korrigiert.
- `DropdownNavItem.astro` ist nach dem Header-Aufräumen ungenutzt. Bewusst behalten: sauber dokumentierte, generische Komponente, vorgesehen für ein künftiges Themen-Dropdown mit echten Zielen (in features.md als „reserviert“ geführt).

**Komponenten zusammenführen/aufteilen?** `Code.astro` ist ein bewusster, schlanker Alias auf `CodeBlock.astro` (Prop-Mapping `mark`/`ins` → `highlight`) — okay. `CodeBlock` und `Terminal` teilen sich `parseLineSelection` aus `plugins/code-block-meta.mjs` — gute Wiederverwendung. Keine Komponente ist kritisch zu groß; `Steps.astro` (382 Zeilen) und `docs-navigation.ts` (646 Zeilen) sind die größten, aber kohärent. Optional: `docs-navigation.ts` in `sidebar-resolver.ts` + `pagination.ts` teilen.

**Werden Inhalte sinnvoll aus Markdown bezogen?** Ja. Verbesserungswürdig: 7 Content-Dateien enthalten rohes HTML mit hartkodiertem `/schlaumeise/…`-Pfad (bricht bei Änderung des `base`); `survey.md` baut eine komplette Hero-Sektion in HTML — solche Layout-Blöcke gehören in MDX-Komponenten.

**Datengetriebener aufbauen?** Quizfragen (jetzt JSON + Zod), perspektivisch auch wiederkehrende strukturierte Inhalte wie Materiallisten (`components.mdx`) als Daten + Komponente statt Markdown-Tabellen.

## 3. Naming — Befund

Code-Seite weitgehend konsistent (PascalCase-Komponenten, kebab-case-TS-Module, camelCase-Variablen, verbbasierte Funktionen). Inkonsistent ist der Content-Bereich:

- Ordner in snake_case (`knowledge_collection`, `workshop_materials`, `birdnet_live`) — wird Teil der URL; Konvention ist kebab-case.
- `ai+bioacoustic.md`: `+` im Dateinamen landet in der URL (Encoding-Risiko). **[erledigt 2026-06-12]** — umbenannt in `ai-and-bioacoustic.md` (mit Redirect); zugleich Konvention festgelegt: Dateinamen englisch, in allen Sprachen identisch.
- Mischung deutscher/englischer Dateinamen (`birds.md` vs. `impressum.mdx`).

Da Umbenennungen URLs brechen, wurden sie **nicht** sofort umgesetzt, sondern als Aufgabe mit Redirect-Strategie (`astro.config` → `redirects`) in die Roadmap aufgenommen. Verbindliche Regeln: [conventions.md](./conventions.md). **[erledigt]:** Frontmatter-Felder `category`/`tags` waren in Inhalten vorhanden, fehlten aber im Schema und wurden stillschweigend verworfen — Schema erweitert.

## 4. Performance — Priorisierung

1. **Bilder (hoch):** ~60 Screenshots/Fotos lagen in `public/` und umgingen damit die Astro-Bildoptimierung komplett. **[erledigt 2026-06-12]** — alle Bilder nach `src/assets/images/` migriert (siehe changelog).
2. **Audio (hoch, einfach):** Mehrere unkomprimierte `.wav`-Dateien in `src/assets/audio/` (Vogelstimmen) — als komprimiertes Format (Opus/MP3) ein Bruchteil der Größe.
3. **Client-JS (niedrig):** Bereits vorbildlich — nur kleine, gezielte Skripte (Drawer, Copy-Button, Theme), keine Framework-Islands. Nichts zu tun.
4. **`site` in `astro.config` fehlt (mittel):** Sitemap-Integration erzeugt ohne `site` keine korrekten absoluten URLs; auch für Canonical-Links nötig.
5. **Markdown-Pipeline (niedrig):** Shiki mit zwei Themes ist build-seitig, unkritisch.
6. **Abhängigkeiten (niedrig):** Nur 5 Runtime-Dependencies — schlank, keine Altlasten.

## 5. Accessibility & Responsivität — Befund

Solide Basis: Skip-fähige Struktur, `aria-label` auf Navigationselementen, `aria-expanded` am Sidebar-Toggle, sichtbarer Fokus-Stil bei Copy-Buttons, `prefers-color-scheme`-Erkennung. **[erledigt]:** Alt-Texte vereinheitlicht (Brand-Logos dekorativ → `alt=""`, EU-Logo → beschreibender Alt-Text); tote Links entfernt (Screenreader-Falle). Offen: durchgängiger A11y-Audit (Kontraste beider Themes, Tastaturnavigation des Drawers, `aria-current` für aktive Links) — siehe Roadmap. Responsivität: Drawer-Pattern mobil + `lg:drawer-open` Desktop, TOC als `<details>` mobil / Rail ab `xl` — gut gelöst.

## 6. Theme-Inkonsistenz (offen)

`site.config.ts` definiert `defaultTheme: "cupcake"`, der `ThemeController` schreibt aber `light`/`dark`. Das initiale `data-theme="cupcake"` wird beim Laden stets überschrieben; außerdem läuft das Theme-Skript erst im Body (kurzes Aufblitzen des falschen Themes möglich). Empfehlung: Inline-Skript im `<head>` von `MainLayout` + einheitliche Theme-Namen.

## 7. Verwaiste Inhalte (offen)

`workshop_materials/springschool/overview.mdx` ist in keiner Navigation registriert (nur per URL erreichbar). Entweder als Topic in `docs-navigation.ts` einhängen oder mit `sidebar.hidden` bewusst kennzeichnen. Englische Locale enthält nur das Impressum — der Sprachumschalter führt auf den meisten Seiten zu 404 (Strategie nötig: Fallback auf Deutsch oder Umschalter nur zeigen, wenn Übersetzung existiert).
