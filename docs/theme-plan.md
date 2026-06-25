# Theme-Plan: High-Contrast-Themes

> Status: **umgesetzt (2026-06-23)** — vier Themes funktionieren orthogonal, im Browser
> verifiziert. Offen nur: finale Markenfarbwerte (im CSS `/* unsicher */`) + Kontrast-Messung (#9).
> Bezug: `todo.md` #6b (High-Contrast) + #9 (A11y).
> Betrifft: `src/styles/global.css`, `src/layouts/MainLayout.astro` (Head-Skript),
> `src/components/ui-elements/ThemeController.astro`, `src/components/ui-elements/SidebarItems.astro`.

---

## 0. Erledigt — Token-Vereinheitlichung (Grundlage)

Die ursprünglich hier geplante Vereinheitlichung (saubere Token-Architektur, rohe
Farben raus aus Komponenten) ist **umgesetzt** — siehe `architecture.md` „Styling"
und `changelog.md` (2026-06-23). Kurzer Ist-Stand als Basis für High-Contrast:

- **Palette** `--palette-n-0…900` — neutrale Rampe, einzige Quelle der Roh-Hex.
- **daisyUI-Themes** `light`/`dark` (`@plugin "daisyui/theme"`), Werte über Palette/Marken-Hex.
- **Eigene Rollen-Tokens** mit `--color-`-Präfix (Block B, theme-abhängig): `--color-text*`,
  `--color-border-*`, `--color-accent-*` (Tints), `--color-state-*`, `--color-highlight-*`, Schatten.
- **`@theme`** (kanonisch): `--color-surface-*` (Flächen) + `--spacing-*` (Skala) → zugleich Utilities.
- **Block C** (theme-invariant): `--color-fixed-*`, `--color-scrim-*`, `--color-spec-*`, `--docs-terminal-*`.
- **Guard** `npm run lint:colors` (Pre-Commit + CI) verbietet Roh-Farben in Komponenten.

> Überholte Alt-Entscheidungen: **D4** (`--color-white/black` → `-ink/-surface`) wurde
> stattdessen durch Entfernen zugunsten `--color-text` / `--color-surface-*` gelöst;
> **D5** (accent-Kollision) erledigt — `--accent`-Alias entfernt, daisyUI `--color-accent`
> ist einzige Quelle; **D6** (`--color-gray-1…7`) ersetzt durch `--palette-n-*`.

---

## 1. Entscheidungen (festgelegt)

| # | Thema | Beschluss |
|---|---|---|
| D1 | Kontrast-Schema | Orthogonal: `data-mode="light\|dark"` + `data-contrast="normal\|high"` für eigene Selektoren; `data-theme` trägt den **zusammengesetzten** Namen (`light`/`dark`/`light-contrast`/`dark-contrast`) für daisyUI. |
| 1a | daisyUI-Registrierung | **Vier volle daisyUI-Themes** registrieren (`light`, `dark`, `light-contrast`, `dark-contrast`) — so bekommen auch daisyUI-Utilities (`btn-primary`, `bg-base-200`, Feedback) Kontrast. |
| D2 | Auto + manuell | `prefers-contrast: more` aktiviert High-Contrast als Default (solange nichts gespeichert); **zusätzlich zweiter Toggle** im ThemeController. |
| K1 | Kontrast-Ziele | Text/Hintergrund **≥ 7:1** (WCAG AAA), Ränder/UI-Grenzen **≥ 3:1**. |
| K2 | Schatten | In High-Contrast **Schatten aus** (`--depth: 0`, `--global-shadow*` → `none`); Abgrenzung über sichtbare Ränder — `--border-sm-transparent` wird sichtbar gesetzt. |
| K3 | Auflösungs-Präzedenz | 1. gespeichert (`{mode, contrast}`), 2. sonst `prefers-contrast: more` → `contrast:"high"`, 3. sonst `prefers-color-scheme` → mode, `contrast:"normal"`. |
| D3 | Canvas | Folgt dem Theme (`--color-spec-*` via `getComputedStyle`). |
| K4 | Spektrogramm-Kontrast | Verstärkung von Overlay-Saum/Progress bei `high` → **später** (eigenes Folge-Issue). |

---

## 2. Umsetzung

### 2.1 Vier daisyUI-Themes (1a)
In `global.css` neben `light`/`dark` zwei weitere `@plugin "daisyui/theme"`-Blöcke:

```css
@plugin "daisyui/theme" { name: "light-contrast"; color-scheme: light; /* … --depth: 0 … */ }
@plugin "daisyui/theme" { name: "dark-contrast";  color-scheme: dark;  /* … --depth: 0 … */ }
```

Basis = Werte des jeweiligen Normal-Themes; nur kontrastkritische Tokens verschärfen
(Tabelle 2.3). `--border` bleibt `1px`; `--depth: 0` nimmt die daisyUI-Tiefe raus (K2).

### 2.2 Eigene Rollen-Tokens je Contrast-Theme überschreiben
Pro Theme nur die abweichenden Tokens, via `:root[data-theme="light-contrast"] { … }`
bzw. `"dark-contrast"`. Surface-Tokens liegen im `@theme`, werden in diesen Selektoren
aber wie normale Custom-Properties überschrieben (`--color-surface-panel: …`).

### 2.3 Konkrete Farbwerte (Startwerte — ≥ 7:1 / ≥ 3:1)
Neutrale (Text/Fläche/Rand) sind sicher gewählt. **Markenfarben sind mit
`/* unsicher */` markiert — bitte final festlegen / Kontrast nachmessen.**

**`light-contrast`** (daisyUI-Block + Override):
```css
--color-base-100: #ffffff;          /* Fläche */
--color-base-200: #f4f6fa;
--color-base-300: #e6ebf3;
--color-base-content: #000000;      /* Text, 21:1 auf base-100 */
--color-primary: #0b3a78;           /* unsicher: dunkler als #2558a0 für ≥7:1 auf Weiß */
--color-primary-content: #ffffff;
--color-accent: #2f1aa0;            /* unsicher: für ≥7:1 auf Weiß */
--color-accent-content: #ffffff;
--color-secondary: #f9d15b;         /* unsicher: Gelb erreicht auf Weiß nie 7:1 → nur als Fläche mit dunklem -content */
--color-secondary-content: #1a1500;
--color-info: #0a4a86;              /* unsicher */
--color-success: #0e5a2e;           /* unsicher */
--color-warning: #8a5300;           /* unsicher */
--color-error: #8e1414;             /* unsicher */
--depth: 0;
```
Override-Selektor `:root[data-theme="light-contrast"]`:
```css
--color-text: #000000;
--color-text-strong: #000000;
--color-text-muted: #262b33;        /* unsicher: muss ≥7:1 auf base-100/200 bleiben */
--color-border-base: #4a515d;       /* ≥3:1 auf base-100 — nachmessen */
--color-border-subtle: #6b7280;
--color-accent-subtle: #c9ccff;     /* unsicher */
--color-accent-strong: #2f1aa0;     /* unsicher */
--global-shadow: none;              /* K2 */
--global-shadow-inset: none;        /* K2 */
--border-sm-transparent: 1px solid var(--color-border-base);  /* K2: sichtbar */
```

**`dark-contrast`** (analog, helle Werte):
```css
--color-base-100: #000000;
--color-base-200: #0b0d12;
--color-base-300: #161a22;
--color-base-content: #ffffff;      /* 21:1 */
--color-primary: #a9ccff;           /* unsicher */
--color-accent: #c3b8ff;            /* unsicher */
--color-secondary: #ffd95e; --color-secondary-content: #1a1500;  /* unsicher */
/* info/success/warning/error: helle, ≥7:1-Varianten — unsicher */
--depth: 0;
```
Override-Selektor `:root[data-theme="dark-contrast"]`:
```css
--color-text: #ffffff;
--color-text-strong: #ffffff;
--color-text-muted: #d4d8df;        /* unsicher */
--color-border-base: #aeb4be;       /* ≥3:1 — nachmessen */
--color-border-subtle: #8b919b;
--color-accent-subtle: #2b2750;     /* unsicher */
--color-accent-strong: #c3b8ff;     /* unsicher */
--global-shadow: none;
--global-shadow-inset: none;
--border-sm-transparent: 1px solid var(--color-border-base);
```

> `--color-highlight-*` (Callout-Flächen) ggf. ebenfalls anheben, damit Text darauf
> ≥7:1 bleibt — **unsicher**, beim Messen prüfen. `--color-scrim-*`/`--color-fixed-*`
> sind theme-invariant und bleiben i. d. R. unverändert.

### 2.4 Head-Skript (K3) — drei Attribute vor dem ersten Paint
`MainLayout` setzt künftig **alle drei** Attribute am `<html>`:
`data-mode`, `data-contrast` und `data-theme = mode + (contrast === "high" ? "-contrast" : "")`.
Auflösung exakt nach K3 (gespeichert → `prefers-contrast: more` → `prefers-color-scheme`).
Speicherformat `schlaumeise:theme:v1 = { mode, contrast }` existiert bereits.

### 2.5 Eigene Selektoren entkoppeln (D1)
`SidebarItems.astro`: `:root[data-theme="light"]` / `[data-theme="dark"]` →
`[data-mode="light"]` / `[data-mode="dark"]`, damit die aktiven Nav-Regeln
kontrast-unabhängig greifen (~2 Regeln).

### 2.6 ThemeController — zweiter Toggle (D2)
Zweites Bedienelement (Kontrast an/aus, eigenes a11y-Label) ergänzen; schreibt
`contrast` in `schlaumeise:theme:v1` und aktualisiert `data-mode`/`data-contrast`/`data-theme` live.

> **Wichtig (Umsetzungs-Erkenntnis):** Der Mode-Toggle darf **nicht** die daisyUI-Klasse
> `theme-controller` tragen. daisyUI erzeugt daraus `:root:has(input.theme-controller[value="dark"]:checked)`
> und erzwingt damit anhand des `value`-Attributs das schlichte `dark`-Theme — das kann die
> zusammengesetzten Contrast-Namen nicht ausdrücken und überstimmt das per Skript gesetzte
> `data-theme` (sichtbar in Dark-OS: `dark-contrast` zeigte Normal-Dark-Farben). Lösung: Klasse
> entfernen, die Checkbox treibt nur das JS, `data-theme` ist alleinige Theme-Quelle.

### 2.7 Spektrogramm-Kontrast → später (K4)
Bei `data-contrast="high"` Overlay-Saum (`shadowBlur`/`strokeStyle`, volle Deckkraft)
und Zeitachsen-`globalAlpha` (0.75 → 1.0) verstärken. Als Folge-Issue, nicht in diesem Schritt.

---

## 3. Verifikation
- `npm run build` grün; `npm run lint:colors` clean.
- Kontrast-Messung der **vier** Themes (axe / Lighthouse / Rechner) gegen ≥7:1 / ≥3:1;
  Befunde + finale Markenfarbwerte in `todo.md` #9 dokumentieren.
- `prefers-contrast`- und Tastatur-/Fokus-Test im Browser. Light/Dark dürfen sich
  **nicht** verändern (reine Ergänzung).
- Doku nachziehen: `todo.md` #6b → erledigt, `changelog.md`, ggf. `architecture.md`.
