# AGENTS.md — Verbindliche Regeln für KI-Agenten

Diese Regeln gelten für jede automatisierte Änderung am Schlaumeise-Projekt. Bei Konflikt zwischen Aufgabenstellung und diesen Regeln: nachfragen statt Regeln brechen.

## Pflichtlektüre vor der ersten Änderung

1. `docs/architecture.md` — wie das Projekt aufgebaut ist und warum
2. `docs/conventions.md` — Benennung und Code-Richtlinien
3. `docs/features.md` — was existiert, was geplant ist
4. Bei Content-Arbeit: `docs/content-handbook.md` · bei Quiz-Arbeit: `docs/quiz-handbook.md`

## Commit-Regeln

- Conventional Commits nach `docs/COMMITS.md`, Vorlage: `.gitmessage`.
- **Alle Commit-Messages auf Englisch** (Betreff und Body) — Imperativ, klein, kein Punkt am Ende.

## Architekturregeln

- **Bestehende Patterns verwenden.** Navigation wird in `src/config/docs-navigation.ts` deklariert und vom Resolver aufgelöst — niemals Navigations-HTML hartkodieren. URLs ausschließlich über `buildLocalizedUrl`/`withBase`/`resolveAssetUrl` bauen, niemals `/schlaumeise/…` hartkodieren. Sichtbare UI-Strings über das i18n-Dictionary, nie inline.
- **Keine Duplikate erzeugen.** Vor jeder neuen Komponente/Funktion prüfen, ob etwas Bestehendes erweitert werden kann (`components/docs/`, `components/ui-elements/`, `src/lib/`). `DropdownNavItem` ist reserviert, nicht neu erfinden.
- **Komponenten wiederverwenden.** Codeblöcke immer über `Code`/`CodeBlock`/`Terminal`; Markdown-Typografie über `MdxInterpreter`; keine Parallel-Implementierungen.
- **Kein Client-JavaScript ohne Not.** Erst statisches HTML/CSS, dann kleine gezielte Skripte (Muster: `src/scripts/`), Framework-Islands nur mit ausdrücklicher Begründung.
- **Keine neuen Dependencies** ohne explizite Freigabe des Menschen.
- **Datenvalidierung beim Build:** Neue strukturierte Daten bekommen ein Zod-Schema (Muster: `src/lib/quiz-schema.ts` + Loader mit `safeParse`).

## Markdown-/Content-Regeln

- Frontmatter exakt nach Schema (`src/content.config.ts`); `title` ist Pflicht. Neue Felder zuerst in Schema **und** `src/types/docs.ts`, dann erst in Inhalten verwenden.
- Dateinamen kebab-case, klein, **englisch**, keine Sonderzeichen/Umlaute (werden URL). Der Dateiname ist in allen Sprachversionen identisch (`de/…/birds.md` ↔ `en/…/birds.md`) — nur Inhalte werden übersetzt. Bestehende URLs nie ohne Redirect ändern (`redirects` in `astro.config.mjs`).
- Bilder nach `src/assets/images/<themenbereich>/<seite>/` und per relativem Pfad (Markdown) bzw. Import (MDX/Komponenten) einbinden — läuft durch `astro:assets`. Niemals absolute `/schlaumeise/…`-Pfade. Jedes Bild mit Alt-Text (dekorativ: `alt=""`). `public/` nur für unveränderlich auszuliefernde Dateien (favicon).
- Neue Inhaltsverzeichnisse in `src/config/docs-navigation.ts` registrieren — sonst sind sie verwaist.
- Deutsche Inhalte sind führend; englische Übersetzung wenn möglich gleich mitliefern (`src/content/docs/en/`, gleiche Pfadstruktur).

## Komponentenregeln

- Eine Verantwortlichkeit pro Komponente; PascalCase-Name, der die Verantwortlichkeit beschreibt (verboten: `Card2`, `SectionNew`, `Temp…`).
- Props über `interface Props` typisieren. Ab ~250 Zeilen: Aufteilung prüfen.
- Neue Komponenten mit nicht offensichtlichem Verhalten: Kommentarkopf mit Zweck, Props, Verwendungsbeispiel.
- Keine toten Komponenten hinterlassen: Wird eine Komponente unbenutzt, entweder löschen oder in `docs/features.md` unter „Reservierte Komponenten“ begründen.

## Styling- & Token-Regeln

- **Nur semantische Tokens, keine hartkodierten Design-Werte.** In Komponenten-`<style>`-Blöcken und `src/styles/docs.css` ausschließlich Tokens aus `src/styles/global.css` (oder daisyUI-Utilities) verwenden — **keine** rohen Werte für:
  - **Farben** → `--color-*` (alle Farb-Rollen tragen das `--color-`-Präfix; nie Hex/`rgb()`/benannte Farben, nie `--palette-*` oder `--color-base-*` direkt)
  - **Abstände** → `--spacing-*` (auch als Utilities `p-md`, `gap-sm`, `m-lg`)
  - **Schriftgrößen/-gewichte** → `--font-size-*` / `--font-weight-*`
  - **Radien** → `--radius-*`
  - **Ränder/Schatten** → `--border-sm`/`--border-m`, `--global-shadow*`, `--shadow-dropdown`
- **`global.css` ist die einzige Quelle der Wahrheit.** Neue Design-Werte zuerst dort als Token anlegen — in der richtigen Schicht: Palette (`--palette-n-*`) → daisyUI-Theme-Block → Block B (theme-abhängige Rollen-Tokens) / `@theme` (Surface + Spacing) / Block C (theme-invariant). Theme-abhängige Werte gehören in die Theme-Blöcke, nie in die Komponente.
- **Guard:** `npm run lint:colors` (Pre-Commit-Hook `.githooks/` + CI) erzwingt das automatisch — **Farben, Abstände, Radien, Schriftgrößen/-gewichte und line-height**. Begründete Ausnahme pro Zeile: Kommentar `color-guard-ignore` oder `bespoke`.
- Architektur und Details: `docs/architecture.md` „Styling", `docs/conventions.md`, `docs/theme-plan.md`.

## Dokumentationspflicht

Nach **jeder** Feature-Änderung, vor Abschluss der Aufgabe:

1. `docs/features.md` — Eintrag ergänzen/aktualisieren (inkl. Status)
2. `docs/changelog.md` — datierter Eintrag (Hinzugefügt/Geändert/Entfernt)
3. Betroffene Handbücher (`content-handbook.md`, `quiz-handbook.md`, `architecture.md`, `conventions.md`) aktualisieren, falls sich dort beschriebenes Verhalten geändert hat
4. Bei erledigten Punkten: `docs/todo.md` und `docs/roadmap.md` pflegen

Eine Aufgabe ohne aktualisierte Doku gilt als **nicht abgeschlossen**.

## Codequalität — Abschluss-Checkliste

Vor dem Abschluss jeder Aufgabe prüfen:

- [ ] `npm run build` läuft fehlerfrei (lokal/CI; falls in der Umgebung nicht möglich: ausdrücklich an den Menschen übergeben)
- [ ] Naming entspricht `docs/conventions.md`
- [ ] Accessibility: Alt-Texte, `aria-*` wo nötig, Tastatur-Bedienbarkeit, keine Links ohne Ziel
- [ ] Responsivität: Änderung mobil (Drawer) und Desktop gedacht/geprüft
- [ ] Performance: keine unnötigen Client-Skripte, Bilder mit `loading="lazy"` (außer above-the-fold), keine unkomprimierten Medien
- [ ] Kein toter/auskommentierter Code, keine Debug-Ausgaben, keine Temp-Dateien
- [ ] i18n: `de.ts` und `en.ts` haben identische Key-Struktur (Typfehler sonst)

## Tabu-Zonen

- `package-lock.json` nicht manuell editieren.
- Keine Änderungen an URLs/Slugs veröffentlichter Inhalte ohne Redirect-Eintrag.
- `src/plugins/*` nur ändern, wenn die Auswirkung auf **alle** Codeblöcke/Inhalte verstanden und geprüft ist.
- Förderlogo (EFRE/ESF) im Footer darf nicht entfernt werden (Förderauflage).
