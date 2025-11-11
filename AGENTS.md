# Codex – Arbeitsanweisungen & Guidelines

Dieses Dokument beschreibt, wie der Codex‑Agent in diesem Repository arbeiten soll. Ziel ist konsistente, zugängliche und wartbare Ergebnisse für die Starlight‑Docs „Schlaumeise“ zu liefern.

## Ziel & Scope

- Fokus: Astro + Starlight Doku unter `src/content/docs`, Komponenten unter `src/components`, Styles unter `src/styles`, Starlight‑Konfig in `astro.config.mjs`.
- Änderungen sollen minimal-invasiv sein und bestehende Seiten nicht brechen.
- Standard‑Sprache für Nutzeroberfläche und Inhalte: Deutsch.
- Standard‑Sprache für Codebase ist: Englisch.

## Agent‑Qualitäten

- Präzise, knapp, freundlich: kurze, klare Sätze; keine unnötige Ausschweifung.
- Actionable: konkrete nächste Schritte, Annahmen nennen, Risiken kurz bewerten.
- Sorgfältig & sicher: niemals raten; bei Unklarheit nachfragen; respektiert Sandbox/Approvals.
- Deterministisch & reproduzierbar: Änderungen klein bündeln, eindeutig beschreiben, Pfade nennen.
- Kontextsensitiv: Starlight‑Konventionen nutzen (Komponenten‑Overrides, Sidebar, CSS‑Variablen).
- Preambles & Plan: vor Tool‑Calls kurz ankündigen; mehrschrittige Arbeit mit Plan verfolgen.

## Prioritäten (absteigend)

1. Korrektheit & Stabilität (Build/Navigation darf nicht brechen)
2. Barrierefreiheit (WCAG 2.2 AA) und semantische HTML‑Struktur
3. Responsiv Design (alle Bildschirmgrößen unterstützen)
4. Konsistenz (Benennungen, Struktur, Design, Tonalität)
5. Performance & DX (kein unnötiger Overhead, klare Anleitungen)
6. Minimaler Scope (nur das ändern, was zur Aufgabe gehört)

## Accessibility (A11y) – Grundregeln

- Semantik: korrekte Überschriften‑Hierarchie (h1→h2→h3), Listen, Tabellen‑Header (`<th scope>`), Landmarken (`<header>`, `<main>`, `<nav>`, `<footer>`).
- Tastatur: alle interaktiven Elemente fokussierbar; sichtbare Focus‑Styles; keine „tab‑traps“.
- Kontraste: Text/Icons mindestens 4.5:1; große Texte 3:1; Zustände (Hover/Focus) ebenfalls prüfen.
- Namen/Labels: sinnvolle Linktexte („Weiter zu Akustik“ statt „hier“), `aria-label` nur ergänzend.
- Medien: Alternativtexte für Bilder; dekorative Bilder als `alt=""`; Videos mit Untertiteln.
- Bewegung: Respektiere `prefers-reduced-motion`; keine unkontrollierten Animationen.
- Fehler & Hinweise: verständliche Meldungen, programmatisch erkennbar (ARIA‑Live wo nötig).
- Referenzen: WCAG 2.2 (https://www.w3.org/TR/WCAG22/), WAI‑ARIA (https://www.w3.org/TR/wai-aria-1.2/).

## Benennungen & Struktur

- Komponenten (Astro): PascalCase, Suffix `.astro`, z. B. `HighlightSection.astro`, `CustomFooter.astro`.
- Styles: Kebab‑Case Dateien (`global.css`, `project.css`); CSS‑Klassen semantisch, `kebab-case`.
- Inhalte: Slugs/Ordner in `src/content/docs` in `kebab-case` (z. B. `knowledge_collection/acoustics.mdx`).
- Assets: `src/assets/` mit sprechenden Namen; SVG/PNG bevorzugen; optimierte Größen.
- Konfiguration: Starlight‑Overrides unter `components` in `astro.config.mjs` pflegen.

## Designprinzipien

- Trenne Struktur/Logik/Präsentation: Markup in `.astro`, Gestaltung in CSS, Logik sparsam.
- Wiederverwendung vor Duplikation: vorhandene Starlight‑Komponenten über `components.Footer` etc. erweitern statt neu erfinden.
- Progressive Enhancement: Basis ohne JS funktionsfähig; Interaktivität optional und zugänglich.
- i18n‑Bereitschaft: Texte nicht hart in Logik einbacken; spätere Übersetzbarkeit bedenken.

## Starlight‑Spezifika (Repo)

- Seitenlayout/Overrides: in `astro.config.mjs` via `starlight({ components: { … } })` registrieren.
- Sidebar: über `sidebar`‑Konfiguration pflegen; Autogenerate nutzt Verzeichnisstruktur korrekt.
- Styles: nutze Starlight‑CSS‑Variablen (`--sl-*`) und Layer (`@layer starlight.core/components`).
- Footer: kann global via `components.Footer` ersetzt/erweitert werden (siehe `src/components/CustomFooter.astro`).

## Arbeitsweise & Patches

- Kleine, fokussierte Änderungen; nur betroffene Dateien anfassen.
- Pfade & Zeilen angeben, kurz begründen, Risiken nennen.
- Keine Lizenz‑Header hinzufügen; keine Ein‑Buchstaben‑Variablennamen.
- Keine ungebetenen Refactorings; verbundene Dokumentation knapp aktualisieren.

## Checklisten

- A11y‑Kurzcheck
  - [ ] Überschriftenfolge korrekt, eine `<h1>` pro Seite
  - [ ] Fokus sichtbar und per Tastatur bedienbar
  - [ ] Alt‑Texte vorhanden/sinnvoll
  - [ ] Kontrast erfüllt (4.5:1)
  - [ ] Interaktive Elemente mit Namen/Role/State nachvollziehbar
- Inhalt/Struktur
  - [ ] Einfache, aktive Sprache (Deutsch)
  - [ ] Sprechende Dateinamen/Slugs
  - [ ] Konsistente Komponenten‑ und Klassenbezeichnungen
- Technik
  - [ ] Build‑relevante Configs korrekt (`astro.config.mjs`)
  - [ ] Keine toten Imports/Assets
  - [ ] Keine unnötigen Dependencies

## Do & Don’t

- Do: erst prüfen, dann ändern; knapp erklären; Beispiele geben; Repo‑Konventionen respektieren.
- Don’t: raten; destruktive Befehle; irrelevante Umstellungen; UI ohne A11y bauen.

## Nützliche Links

- Astro Docs: https://docs.astro.build
- Starlight Docs: https://starlight.astro.build
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- WAI‑ARIA: https://www.w3.org/TR/wai-aria-1.2/

---

Stand: automatisch gepflegt. Änderungen bitte kurz begründen und im PR auf diese Guidelines verweisen.
