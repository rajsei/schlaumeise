# Codex – Arbeitsanweisungen & Guidelines

Dieses Dokument beschreibt, wie der Codex‑Agent in diesem Repository arbeiten soll. Ziel ist konsistente, zugängliche und wartbare Ergebnisse für die Starlight‑Docs „Schlaumeise“ zu liefern.

## Ziel & Scope
- Fokus: Astro + Starlight Doku unter `src/content/docs`, Komponenten unter `src/components`, Styles unter `src/styles`, Starlight‑Konfig in `astro.config.mjs`.
- Änderungen sollen minimal‑invasiv sein und bestehende Seiten nicht brechen.
- Standardsprache für Nutzeroberfläche und Inhalte: Deutsch. Standardsprache in Code/Kommentare: Englisch (kurz und präzise).

## Agent‑Qualitäten
- Präzise, knapp, freundlich; aktive Sprache, keine Ausschweife.
- Actionable: klare nächste Schritte, Annahmen, Risiken.
- Sorgfältig & sicher: nicht raten; bei Unklarheit nachfragen; Sandbox/Approvals respektieren.
- Deterministisch & reproduzierbar: kleine Patches, Pfade nennen, Gründe kurz erklären.
- Kontextsensitiv: Starlight‑Konventionen nutzen (Komponenten‑Overrides, Sidebar, CSS‑Variablen).

## Prioritäten (absteigend)
1. Korrektheit & Stabilität (Build/Navigation darf nicht brechen)
2. Barrierefreiheit (WCAG 2.2 AA) und semantische HTML‑Struktur
3. Responsives Design (alle Bildschirmgrößen)
4. Konsistenz (Benennungen, Struktur, Design, Tonalität)
5. Performance & DX (kein unnötiger Overhead, klare Anleitungen)
6. Minimaler Scope (nur ändern, was zur Aufgabe gehört)

## Accessibility (A11y) – Grundregeln
- Semantik: korrekte Überschriften‑Hierarchie, Listen, Tabellen‑Header (`<th scope>`), Landmarken (`<header>`, `<main>`, `<nav>`, `<footer>`).
- Tastatur: alles fokussierbar; sichtbare Focus‑Styles; keine Tab‑Fallen.
- Kontraste: Text/Icons ≥ 4.5:1; große Texte ≥ 3:1.
- Namen/Labels: sinnvolle Linktexte; `aria-label` nur ergänzend.
- Medien: Alternativtexte; dekorative Bilder `alt=""`; Untertitel für Videos.
- Bewegung: `prefers-reduced-motion` respektieren.
- Hinweise/Fehler: verständlich und programmatisch erkennbar.

## Benennungen & Struktur
- Komponenten (Astro): PascalCase, `.astro`, z. B. `HighlightSection.astro`, `CustomFooter.astro`.
- Styles: Dateien in kebab‑case (`global.css`, `project-grid.css`); CSS‑Klassen semantisch in kebab‑case.
- Inhalte: Slugs/Ordner in `src/content/docs` in kebab‑case.
- Assets: `src/assets/` mit sprechenden Namen; optimierte SVG/PNG.
- Konfiguration: Starlight‑Overrides unter `components` in `astro.config.mjs` pflegen.

## Designprinzipien
- Struktur/Logik/Präsentation trennen: Markup in `.astro`, Styles in CSS, Logik sparsam.
- Wiederverwendung vor Duplikation: Starlight‑Komponenten über Overrides erweitern.
- Progressive Enhancement: Basis ohne JS funktionsfähig; Interaktivität optional.
- i18n‑Bereitschaft: Texte nicht hart in Logik backen.

## Starlight‑Spezifika (Repo)
- Layout‑Overrides via `starlight({ components: { … } })`.
- Sidebar per `sidebar`‑Konfiguration; Autogenerate folgt Verzeichnissen.
- Styles: Starlight‑Variablen (`--sl-*`) und Layer (`@layer starlight.components`) nutzen.
- Footer global via `components.Footer` ersetz/erweiterbar (vgl. `src/components/CustomFooter.astro`).

## Arbeitsweise & Patches
- Kleine, fokussierte Änderungen; nur betroffene Dateien anfassen.
- Pfade & Zeilen angeben, kurz begründen, Risiken nennen.
- Keine Lizenz‑Header hinzufügen; keine Ein‑Buchstaben‑Variablen.
- Keine ungebetenen Refactorings; verbundene Doku knapp aktualisieren.

## Checklisten
- A11y‑Kurzcheck: eine `<h1>` pro Seite; Fokus sichtbar; Alt‑Texte; Kontrast; Rollen/Zustände erkennbar.
- Inhalt/Struktur: aktive Sprache; sprechende Dateinamen; konsistente Komponenten‑/Klassenbezeichnungen.
- Technik: `astro.config.mjs` korrekt; keine toten Imports/Assets; keine unnötigen Dependencies.

## Do & Don’t
- Do: erst prüfen, dann ändern; knapp erklären; Beispiele; Repo‑Konventionen respektieren.
- Don’t: raten; destruktive Befehle; irrelevante Umstellungen; UI ohne A11y bauen.

## Komponenten & Importe
- Komponenten in PascalCase mit `.astro` (z. B. `ProjectList.astro`).
- Importe exakt case‑sensitiv pflegen (CI auf Linux).
- Keine Selbst‑Imports: In `X.astro` nie `import X from './X.astro'`.

### Renames (Case‑Sensitivity)
- Case‑only Renames zweistufig ausführen:
  - `git mv ProjectList.astro projectlist.tmp`
  - `git mv projectlist.tmp ProjectList.astro`
- Danach alle Importpfade aktualisieren. Keine dauerhaften Wrapper behalten.

### Lösch-/Move‑Policy
- Vor Löschen/Verschieben Referenzen anpassen:
  - Importe finden: `rg -n "from ['\"](\.\./|\./).*ProjectList\.astro" src`
  - Nutzung finden: `rg -n "<ProjectList\b" src`
- Erst wenn alle Referenzen passen, alte Datei löschen/verschieben.

### Build‑ und CI‑Checks
- Vor Merge: `pnpm build` (keine „Could not resolve …“).
- Optional: `astro check`.
- Linux‑CI nicht überspringen — deckt Case‑Fehler auf.

### Script‑Blöcke in `.astro`
- In Client‑Scripts ohne TS‑Assertions arbeiten oder `lang="ts"` setzen.
- DOM‑Selektoren an tatsächliches Markup anpassen (z. B. `#project-list .card`).

### Checkliste vor PR
- [ ] Keine Selbst‑Imports/Zyklen.
- [ ] Einheitliche Schreibweise von Datei und Import.
- [ ] Renames via zweistufigem `git mv`, Importe aktualisiert.
- [ ] Build lokal fehlerfrei; CI grün.
- [ ] Temporäre Wrapper entfernt oder mit TODO markiert.

## Astro‑Komponenten: Aufbau
- Frontmatter (zwischen `---` und `---`)
  - Nur serverseitiges Setup: `import`, Props/Interfaces, Datenabrufe, Konstanten/Derived Values.
  - Keine Datei‑Header/TODOs im Frontmatter. Kommentare erst NACH dem zweiten `---`.
- Markup
  - Semantisches HTML direkt nach dem Frontmatter; sinnvolle Landmarken/Alt‑Texte.
- Client‑Script (optional)
  - `<script type="module">` nur für echte Interaktion; TS nur mit `lang="ts"`.
- Styles am Ende
  - `<style>`; nutze `@layer starlight.components` und Starlight‑Variablen.

Beispiel
```
---
import { getCollection } from "astro:content";
import "../styles/example.css";

const docs = await getCollection("docs");
const items = docs.filter((d) => d.id.endsWith("overview"));
const base = import.meta.env.BASE_URL;
---
<!-- Kommentare und TODOs erst ab hier -->

<div class="example">
  {items.map((it) => (
    <a href={`${base}${it.id}/`} class="card">{it.data.title}</a>
  ))}

  <script type="module">
    // Optional: Client‑Interaktion nur wenn nötig
  </script>
</div>

<style>
  @layer starlight.components {
    .example { /* … */ }
    .card { /* … */ }
  }
</style>
```

---

Stand: automatisch gepflegt. Änderungen bitte kurz begründen und im PR auf diese Guidelines verweisen.
