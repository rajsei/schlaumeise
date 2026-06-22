# Plan: Vollständige Umstellung auf semantische Tokens

> Status: Vorschlag · Ergänzt `docs/theme-plan.md` · Betrifft `src/styles/global.css`,
> `src/styles/docs.css` und alle Komponenten mit `<style>`-Blöcken.
>
> Entscheidungen:
> - **S1 — Strategie: daisyUI-lean Hybrid.** daisyUI-Semantik (base/primary/…) bleibt
>   die Basis; ein dünner eigener Semantik-Layer ergänzt nur, was daisyUI nicht abbildet.
> - **S2 — Scope: Farben + Rahmen + Radius + Schatten + Spacing + Typografie.**

Ziel: Jede Komponente referenziert nur noch **benannte Rollen-Tokens** (was etwas
*bedeutet*) — nie mehr rohe Palette, rohe `base-*`, literale Hex- oder rem-Werte.

---

## 1. Prinzip — drei Ebenen, einbahnig

```
Ebene 1  PRIMITIVE   --palette-n-* (Farben), Spacing-/Font-Rohwerte
                     reines Rohmaterial, keine Bedeutung
        v
Ebene 2  SEMANTIK    daisyUI-Tokens (base/primary/...) + eigener Layer
                     (--surface-*, --text-*, --border-*, --space-*, --font-*)
                     = "Rolle/Bedeutung", verweist auf Ebene 1
        v
Ebene 3  KOMPONENTEN nutzen AUSSCHLIESSLICH Ebene 2
                     (als var(--…) oder als Utility-Klasse)
```

Regel: Ebene 3 kennt Ebene 1 nicht. Wer in einer Komponente `--palette-*`, einen
Hex-Wert oder `1rem` als Farbe/Abstand schreibt, verletzt die Regel.

---

## 2. Strategie: daisyUI-lean Hybrid (S1)

- **daisyUI-Tokens bleiben die Basis-Semantik** für Farbflächen/Text/Feedback:
  `base-100/200/300`, `base-content`, `primary/secondary/accent`, `info/success/
  warning/error` (+ `-content`). In Komponenten weiter als Utilities (`bg-base-200`,
  `text-primary`) **oder** als `var(--color-…)` erlaubt.
- **Eigener Semantik-Layer nur als Ergänzung**, wo daisyUI nichts hat: Panel-Flächen,
  abgestufter Text, Border, Akzent-Tints, States, Spacing, Typografie.
- **Mechanik:** eigene Tokens in einen Tailwind-`@theme`-Block legen. Dann sind sie
  **gleichzeitig** als `var(--token)` *und* als Utility-Klasse nutzbar
  (`bg-surface-panel`, `p-md`, `text-strong`) — das ist der Kern des Hybrids und
  vermeidet Doppelpflege. (Farb-Tokens, die daisyUI zur Build-Zeit verarbeitet,
  bleiben wie gehabt in den `@plugin`-Blöcken; nur der *ergänzende* Layer geht in
  `@theme`.)

---

## 3. Token-Katalog (Ebene 2)

Vieles existiert bereits — Spalte „heute" zeigt den Ist-Stand. Umbenennungen sind
optional und können per Alias erfolgen (alter Name = `var(--neuer-name)`), um die
Migration in kleinen Schritten zu halten.

### 3.1 Flächen (surface)
| Rolle | Token | heute |
|---|---|---|
| Seitenhintergrund | `--surface-page` | `body { background: base-200 }` |
| Panel/Karte | `--surface-panel` | `--docs-panel-bg` |
| Navbar | `--surface-header` | `bg-base-100` (Header) |
| Code/Terminal | `--surface-code` | `--docs-terminal-bg` |

### 3.2 Text
| Rolle | Token | heute |
|---|---|---|
| betont | `--text-strong` | `--color-base-content-strong` |
| normal | `--text` | `--color-base-content` |
| gedämpft | `--text-muted` | `--color-base-content-low` |
| auf Akzentfläche | `--text-on-accent` | `--color-accent-content` |

### 3.3 Rahmen, Radius
| Rolle | Token | heute |
|---|---|---|
| Standard-Rand | `--border` / `--border-sm` | vorhanden |
| dezent | `--border-subtle` | `--color-border-low` |
| Panel-Radius | `--radius-panel` | `--docs-panel-radius` |
| Control-Radius | `--radius-control` | daisyUI `--radius-field` |

### 3.4 Akzent & Interaktion
| Rolle | Token | heute |
|---|---|---|
| Akzent | `--accent` | daisyUI `--color-accent` |
| Akzent dezent | `--accent-subtle` | `--color-accent-low` |
| Akzent kräftig | `--accent-strong` | `--color-accent-high` |
| Hover-Fläche | `--state-hover-bg` | div. `color-mix(... accent-low ...)` |
| Aktiv-Fläche | `--state-active-bg` | div. `color-mix(... accent ...)` |

### 3.5 Feedback / Highlights / Invariant
`info/success/warning/error` (daisyUI, schon semantisch), `--highlight-*`,
`--global-shadow*`, `--color-fixed-*`, `--spec-*`, `--docs-terminal-*` —
weitgehend fertig, nur Namen vereinheitlichen.

### 3.6 Spacing (neu, S2)
Eine Skala (4 px-Basis) in `@theme`, ersetzt literale rem in `<style>`-Blöcken:
`--space-2xs .. --space-2xl` (z. B. 0.25 / 0.5 / 0.75 / 1 / 1.5 / 2 / 3 rem).
Nutzbar als `var(--space-md)` und als Utility (`p-md`, `gap-sm`).

### 3.7 Typografie (neu, S2)
`--font-size-xs .. -2xl` (inkl. der vorhandenen `clamp()`-Größe für H1),
`--font-weight-normal/medium/bold`, `--line-height` (existiert). Ersetzt literale
`font-size`/`font-weight` in Komponenten.

---

## 4. Audit (Bestandsaufnahme vor der Migration)

Per Skript alle **nicht-semantischen** Vorkommen sammeln (sobald die Sandbox wieder
läuft; sonst lokal):
- rohe `var(--palette-*)` in Komponenten/`docs.css`,
- literale Hex außerhalb `global.css` (bekannt: `TopicIcon` `#000000`, `#888` in
  `mic.ts`/`file.ts`),
- literale `rem`/`px` für Spacing, Radius, Font in `<style>`-Blöcken,
- rohe daisyUI-`base-*` direkt in Komponenten (entscheiden, ob via Utility ok).

Ergebnis: Tabelle Datei → Zeile → Ziel-Token. Dient als Checkliste.

---

## 5. Migration in Slices (jede Slice = Build + Sichtcheck gegen Screenshots)

1. **Flächen** — `--surface-*` einführen/aliasen, Panels/Navbar/Body umstellen.
2. **Text** — `--text-*` durchziehen.
3. **Rahmen & Radius** — `--border-*`, `--radius-*`.
4. **Akzent & States** — `--accent-*`, `--state-*` (die wiederholten `color-mix`-
   Hover/Active-Ausdrücke in einen Token zusammenfassen).
5. **Code/Terminal/Spektrogramm/Fixed** — Namen vereinheitlichen; `TopicIcon` auf
   `currentColor` (eigene Entscheidung, da Renderänderung).
6. **Spacing** — `@theme`-Skala anlegen, literale Abstände in `<style>`-Blöcken ersetzen.
7. **Typografie** — Font-Größen/-Gewichte tokenisieren.

Reihenfolge so, dass rein optische Slices (1–5) zuerst „identisch" bleiben; 6–7
sind die größten Diffs und kommen zum Schluss.

---

## 6. Konventionen & Guard

- `conventions.md` ergänzen: „Komponenten nutzen ausschließlich semantische Tokens
  (eigene `--surface/-text/-border/-accent/-space/-font-*` oder daisyUI-Utilities).
  Kein rohes `--palette-*`, kein Hex, kein literaler Farb-/Abstands-/Font-Wert."
- Optionaler grep-Guard (Pre-Commit/CI): scannt `src/components` + `docs.css` auf
  `#[0-9a-f]{3,8}` und `var(--palette-` und schlägt an (Ausnahmen: SVG-Assets,
  JS-Fallbacks).

---

## 7. Nebeneffekt: High-Contrast (theme-plan.md Phase 4)

Mit vollständiger Semantik-Ebene wird das High-Contrast-Theme trivial: pro Theme nur
die Rollen-Tokens (`--surface-*`, `--text-*`, `--border-*`, `--accent-*`)
überschreiben — die Komponenten bleiben unangetastet.

---

## Risiken / Hinweise

- **daisyUI-Build:** Farb-Tokens in den `@plugin`-Blöcken mit `var(--palette-*)`
  bleiben build-zeit-relevant → nach Änderungen `npm run build` + Sichtprüfung.
- **Aliasing zuerst:** Umbenennungen über Alias (`--docs-panel-bg: var(--surface-panel)`)
  halten jede Slice klein und reversibel; alte Namen erst am Ende entfernen.
- **Sandbox/Build:** Der echte Build läuft lokal (sandbox-`node_modules` ist Windows-nativ).
