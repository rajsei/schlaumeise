# Theme-Plan: Vereinheitlichung + High-Contrast

> Status: Vorschlag · Bezug: `todo.md` #6b (High-Contrast) und #9 (A11y-Audit) ·
> Betrifft: `src/styles/global.css`, `src/styles/docs.css`, `MainLayout.astro`,
> `ThemeController.astro`, `SidebarItems.astro` und Komponenten mit Hex-Werten.

Ziel: Light- und Dark-Theme auf **eine saubere Token-Architektur** bringen,
hartkodierte Farben aus den Komponenten entfernen und darauf aufbauend zwei
**High-Contrast-Themes** (`light-contrast` / `dark-contrast`) ergänzen — ohne das
fixe Speicher- und Selektionsschema zu brechen.

---

## 0. Getroffene Entscheidungen

| # | Entscheidung | Wahl |
|---|---|---|
| D1 | Kontrast-Schema | **Modus & Kontrast getrennt:** `data-mode="light\|dark"` + `data-contrast="normal\|high"` für eigene Selektoren. `data-theme` trägt weiterhin den zusammengesetzten Namen (`light`/`dark`/`light-contrast`/`dark-contrast`), da daisyUI zwingend darüber selektiert. |
| D2 | Auto-Kontrast | **`prefers-contrast: more` aktiviert High-Contrast als Default** (solange nichts gespeichert ist) — **zusätzlich** manueller Schalter im ThemeController. |
| D3 | Spektrogramm-/Canvas-Farben | **Folgen dem Theme** (Farben via `getComputedStyle` aus CSS-Variablen). |
| D4 | `--color-white` / `--color-black` | **Jetzt umbenennen** in `--color-ink` / `--color-surface`. |
| D5 | `--color-accent`-Kollision | Aufgelöst: Projekt-Token entfällt, daisyUI-Variable ist einzige Quelle. |
| D6 | Graustufen | `--color-gray-1…7` bleibt kanonische Skala; daisyUI `base`/`neutral` mappen darauf. |
| D7 | Theme-invariante Farben | Eigene Schicht **BLOCK C** (`--color-fixed-*`, `--spec-*`) für Farben, die in allen Themes gleich bleiben (Logo-Flächen, Spektrogramm-Overlays). Einmal definiert, nie pro Theme überschrieben. Siehe Abschnitt 2b. |

---

## 1. Ist-Zustand (Befund)

Heute existieren **zwei parallele Farb-Systeme** in `global.css`:

1. **daisyUI-Themes** (`@plugin "daisyui/theme"`) — semantische Tokens
   `--color-primary`, `--color-secondary`, `--color-base-100…300`, `--color-info`
   usw., je einmal komplett für `light` und `dark`.
2. **Projekt-Tokens** (`:root` und `:root[data-theme="dark"]`) — eigene Skala
   `--color-gray-1…7`, `--color-white`/`--color-black`, `--color-accent-low/high`,
   `--color-highlight-*`, Schatten und `--docs-*`.

Daraus ergeben sich vier konkrete Probleme:

**a) Irreführende Benennung.** `--color-white` ist im Light-Theme `#15181e`
(also fast schwarz) und `--color-black` ist `#ffffff`. Die Namen meinen
„Vordergrund/Tinte" und „Seitenhintergrund", sagen aber das Gegenteil. Das ist
die größte Stolperfalle beim Anpassen.

**b) Namens-Kollision bei `--color-accent`.** Die Variable wird sowohl im
daisyUI-Theme-Block (`--color-accent: #4a2fc9`) als auch in den Projekt-Tokens
(`:root { --color-accent: #4a2fc9 }`) gesetzt. Zwei Systeme schreiben denselben
Variablennamen — sie stimmen zufällig überein, aber jede künftige Änderung muss
an zwei Stellen erfolgen.

**c) Doppelte Graustufen.** daisyUI `base-100/200/300` + `neutral` und die
Projekt-`gray-1…7` überlappen sich (`#eaeef5`, `#1f2733`, `#f4f6fa` tauchen in
beiden auf). Es ist unklar, welche Skala für neuen Code „die richtige" ist.

**d) Volle Duplikation pro Theme.** Light und Dark definieren jeweils den
*kompletten* Satz an Werten neu. Ein drittes/viertes Theme (Contrast) würde diese
Duplikation vervierfachen.

Zusätzlich verstoßen Komponenten gegen `conventions.md` („keine neuen Hex-Werte
in Komponenten"): **~42 hartkodierte Hex-Werte** außerhalb von `global.css`
(Aufschlüsselung unten; daneben einige `rgba()`/`color-mix()`-Rohwerte).

| Datei | Hartkodierte Farben (ca.) | Anmerkung |
|---|---|---|
| `components/docs/Terminal.astro` | 17 | Eigenes Dark-Farbschema (`#0d1117`, `#2f3a4d`, `#73b7ff` …) |
| `components/docs/CodeBlock.astro` | 14 | Dito, teils identische Werte wie Terminal |
| `components/docs/AudioSpectrogram.astro` | 4 | Canvas-/Spektrogramm-Farben |
| `components/docs/MicSpectrogram.astro` | 3 | Dito |
| `scripts/spectrogram/mic.ts` | 1 | Canvas-Zeichenfarbe (JS) |
| `scripts/spectrogram/file.ts` | 1 | Canvas-Zeichenfarbe (JS) |
| `components/ui-elements/DropdownNavItem.astro` | 1 | `#fff` |
| `components/Footer.astro` | 1 | `#ffffff` |

Terminal und CodeBlock sind bewusst „immer dunkel" (Code-Optik) — das ist legitim,
gehört aber als **dediziertes Token-Set** zentralisiert, nicht als Streuung von
Rohwerten über zwei Dateien.

---

## 2. Zielarchitektur (drei Schichten)

Eine einzige Quelle der Wahrheit, von „roh" zu „semantisch" zu „Theme":

```
Schicht 1 — Palette (rohe Werte, themen-unabhängig, einmal definiert)
   --palette-blue-500, --palette-gray-900, --palette-yellow-300 …

Schicht 2 — Semantische Tokens (Bedeutung, verweisen auf Palette)
   --color-surface, --color-ink, --color-border, --color-accent …
   --docs-code-*, --color-highlight-* …
   + KONSTANTEN (theme-invariant, siehe 2b): --color-fixed-*, --spec-* …

Schicht 3 — Themes (mappen Schicht 2 neu — KONSTANTEN ausgenommen)
   :root / [data-theme="light"]          → Light
   [data-theme="dark"]                   → Dark
   [data-theme="light-contrast"]         → Light, Kontrast ≥ 7:1
   [data-theme="dark-contrast"]          → Dark, Kontrast ≥ 7:1
```

Wichtig: Nicht jeder semantische Token wird in Schicht 3 neu gemappt. Es gibt
Farben, die in **allen** Themes identisch bleiben (Logo-Flächen, Overlay-Labels
über dem Spektrogramm). Diese werden **einmal** definiert und in den Theme-Blöcken
**nicht** überschrieben — siehe Abschnitt 2b.

Die daisyUI-Theme-Blöcke bleiben bestehen (daisyUI braucht sie, um
Utility-Klassen wie `btn-primary` zu erzeugen), beziehen ihre Werte aber aus
Schicht 1. So gibt es keine zwei konkurrierenden Definitionen mehr.

### Konkrete Umbenennungen

| Heute | Neu | Grund |
|---|---|---|
| `--color-white` (= Tinte) | `--color-ink` | sagt, was es ist |
| `--color-black` (= Fläche) | `--color-surface` | sagt, was es ist |
| `--color-gray-1…7` | beibehalten **oder** `--color-ink-{1..4}` / `--color-surface-{1..3}` | optional; siehe Migrationsweg |
| `--color-accent` (Projekt) | nur **eine** Quelle, daisyUI-`accent` referenziert sie | Kollision auflösen |

> Empfehlung: `--color-white`/`--color-black` zuerst umbenennen — das ist der
> Fehler mit dem höchsten Verwirrungspotenzial und betrifft nur eine überschaubare
> Zahl von Fundstellen (per Suche ersetzbar).

---

## 2b. Theme-invariante (konstante) Farben — BLOCK C

Manche Farben dürfen sich **nicht** mit dem Theme ändern, weil sie nicht auf dem
Seitenhintergrund liegen, sondern auf einem festen Bezugsgrund (ein Logo, ein
Heatmap-Bild). Sie aktuell als Rohwerte zu streuen widerspricht `conventions.md`
und macht sie unauffindbar. Lösung: eine **eigene Token-Gruppe**, einmal definiert,
in keinem Theme-Block überschrieben.

```css
/* BLOCK C — THEME-INVARIANTE FARBEN (in keinem Theme-Block ueberschreiben) */
:root {
  /* Logo-/Markenflaechen, die immer weiss sein muessen */
  --color-fixed-white: #ffffff;   /* z. B. Plattenhintergrund hinter Logos */
  --color-fixed-black: #000000;   /* falls fuer Schatten/Saum gebraucht */

  /* Spektrogramm-Overlays — liegen UEBER dem Colormap-Bild, daher
     theme-unabhaengig (weisser Text + dunkler Saum, lesbar auf jeder Palette) */
  --spec-label-fill:   rgba(255, 255, 255, 0.96);
  --spec-label-stroke: rgba(255, 255, 255, 0.85);
  --spec-label-shadow: rgba(0, 0, 0, 0.9);
}
```

**Namenskonvention:** Prefix `--color-fixed-*` bzw. `--spec-*` signalisiert „in
allen Themes gleich" — im Gegensatz zu den theme-abhängigen `--color-*` aus
BLOCK B. So ist beim Lesen sofort klar, dass diese Variablen bewusst nicht
gemappt werden.

**Lesen im Canvas-JS:** Ein `<canvas>` kann eine `rgba`-Konstante nicht über die
geerbte `color`-Eigenschaft transportieren (anders als die einfarbige Zeitachse).
Die `--spec-*`-Werte werden daher in `axes.ts` per
`getComputedStyle(canvas).getPropertyValue("--spec-label-fill").trim()` gelesen
(einmal pro Render gecacht). So bleiben die Werte zentral in `global.css`,
während das Zeichnen sie als Strings übernimmt.

**Aktuelle Fundstellen, die auf BLOCK C umgestellt werden:**

| Datei | Heute | Neu | Anmerkung |
|---|---|---|---|
| `Footer.astro` (`.funding-logo`) | `background: #ffffff` | `var(--color-fixed-white)` | EU/EFRE-ESF-Logo braucht weißen Grund, auch im Dark-Mode |
| `scripts/spectrogram/axes.ts` (`drawFrequencyAxis`) | `rgba(255,255,255,0.96)` / `…0.85` / `rgba(0,0,0,0.9)` | `--spec-label-*` (via `getComputedStyle` gelesen) | Overlay über Heatmap; bei `data-contrast="high"` verstärken (siehe Phase 3) |
| `DropdownNavItem.astro` | `background: #fff` | **prüfen** | Dies ist eine UI-Fläche und sollte vermutlich dem Theme folgen (`var(--color-surface)`), **nicht** konstant sein — Einzelfall klären |

**Abgrenzung — was *nicht* in BLOCK C gehört:**
- Die **Daten-Colormap** (`colormap.ts`: magma/viridis/…) ist ebenfalls
  theme-invariant, lebt aber als JS-LUT (Nutzerwahl übers Zahnrad), nicht als
  CSS-Farbe. Bleibt in `colormap.ts`; konzeptionell Teil der „festen" Farben,
  aber kein CSS-Token.
- Reine UI-Flächen (Dropdown, Karten, Buttons) gehören in BLOCK B und folgen dem
  Theme — nur weil etwas heute hartkodiert `#fff` ist, ist es nicht automatisch
  „konstant".

> Faustregel: Liegt die Farbe auf dem **Seitenhintergrund**? → BLOCK B (theme-
> abhängig). Liegt sie auf einem **festen Bezugsgrund** (Logo, Bild)? → BLOCK C
> (konstant).

---

## 3. Schrittplan

### Phase 0 — Sicherung & Inventar
- Branch `feature/theme-unify`. Screenshots beider Themes (Startseite, Guide-Seite,
  Codeblock, Terminal, Sidebar-aktiv) als visuelle Referenz vor dem Umbau.
- `npm run build` als Baseline (muss durchlaufen).

### Phase 1 — Palette extrahieren (Schicht 1)
- Alle rohen Hex-Werte aus den daisyUI-Blöcken und Projekt-Tokens in einen
  `@theme`-/`:root`-Palettenblock heben (`--palette-*`). Die Frequenz-Liste in
  Abschnitt 5 zeigt, welche Werte mehrfach vorkommen und damit sicher Paletten-
  Einträge werden (`#ffffff` 9×, `#eaeef5` 5×, Markenfarben je 2–3×).
- daisyUI-Theme-Blöcke auf `var(--palette-*)` umstellen statt Rohwerte.
- **BLOCK C anlegen** (theme-invariante Konstanten, siehe 2b): `--color-fixed-*`
  und `--spec-*` einmalig in `:root` definieren — in keinem Theme-Block überschreiben.

### Phase 2 — Semantische Tokens vereinheitlichen (Schicht 2)
- `--color-white`→`--color-ink`, `--color-black`→`--color-surface` umbenennen
  (projektweite Suche/Ersetzen in `.astro`/`.css`).
- `--color-accent`-Kollision auflösen (D5): Projekt-Token `--color-accent`
  entfernen; Verwendungen auf die daisyUI-Variable `--color-accent` umstellen.
  Eine Quelle, ein Name.
- Graustufen konsolidieren (D6): `--color-gray-1…7` bleibt die kanonische Skala;
  daisyUI-`base`/`neutral` mappen darauf (bzw. auf dieselben Palette-Einträge).
  Doppelung beseitigen.
- Schatten (`--global-shadow*`) und `--docs-*` bleiben semantisch, verweisen aber
  nur noch auf Tokens/Palette.

### Phase 3 — Komponenten-Refactor (Hex raus)
- **Terminal + CodeBlock:** gemeinsames Token-Set `--docs-terminal-*`
  (`bg`, `fg`, `border`, `muted`, `accent`, `prompt`) in `global.css` definieren;
  beide Komponenten darauf umstellen. Werte aus den heutigen Rohfarben übernehmen,
  damit sich optisch nichts ändert. (~31 Fundstellen erledigt.)
- **Spektrogramm (D3) — zwei Farb-Domänen trennen:**
  - *Chrome folgt dem Theme* (folgt größtenteils schon): Zeitachse bezieht die
    Farbe bereits aus `getComputedStyle(canvas).color`; Hintergrund/Playhead/
    Status nutzen `var(--color-…)`. Zu tun: Hex-Fallbacks in `var(--token, #hex)`
    entfernen, `canvas { color: var(--color-…) }` explizit setzen, den
    `|| "#888"`-Fallback in `axisColor()` aus einem Token ableiten.
  - *Bewusst theme-unabhängig (→ BLOCK C):* die Frequenzlabels in
    `drawFrequencyAxis` (weißer Text + dunkler Saum) beziehen ihre Farben aus
    `--spec-label-fill` / `--spec-label-stroke` / `--spec-label-shadow` statt aus
    Rohwerten. Die Daten-Colormap (magma/viridis/… — Nutzerwahl übers Zahnrad)
    bleibt als JS-LUT in `colormap.ts` unverändert.
  - *High-Contrast-Behandlung:* bei `data-contrast="high"` den Saum der
    Overlay-Labels verstärken (`shadowBlur`/`strokeStyle`, volle Deckkraft) und
    `globalAlpha` der Zeitachse von `0.75` → `1.0` ziehen (Ziel ≥ 7:1).
  (~9 Fundstellen; Colormap-LUT in `colormap.ts` bleibt unangetastet.)
- **Footer (`.funding-logo`):** `background: #ffffff` → `var(--color-fixed-white)`
  (BLOCK C — Logo-Platte bleibt in jedem Theme weiß).
- **DropdownNavItem:** `#fff` ist eine UI-Fläche → `var(--color-surface)` (BLOCK B,
  folgt dem Theme), **nicht** konstant. Einzelfall vor dem Umstellen prüfen.
- Danach: `grep -rE '#[0-9a-f]{3,8}' src` (außer `global.css`/SVG-Pfade) muss
  praktisch leer sein. Als Lint-Regel in `conventions.md` festhalten.

### Phase 4 — High-Contrast-Themes (todo.md #6b) — gemäß D1/D2
- Zwei neue Theme-Blöcke `light-contrast` / `dark-contrast` (daisyUI) + passende
  `[data-theme="…-contrast"]`-Token-Overrides. Nur die Werte überschreiben,
  die sich vom Basis-Theme unterscheiden — dank Schicht-Architektur wenige Zeilen.
- Kontrast-Zielwerte: Text/Hintergrund **≥ 7:1** (WCAG AAA), UI-Ränder **≥ 3:1**.
  `--depth: 0`, kräftigere `--global-header-border`, sichtbarere Fokus-Ringe.
- **Drei Attribute am `<html>`** (D1): das Head-Skript setzt
  `data-mode` (hell/dunkel), `data-contrast` (normal/high) **und** das daraus
  zusammengesetzte `data-theme` (für daisyUI):
  `data-theme = mode + (contrast === "high" ? "-contrast" : "")`.
- **Default-Logik (D2):** Reihenfolge der Theme-Auflösung —
  1. gespeicherter Wert in `schlaumeise:theme:v1` (`mode` + `contrast`),
  2. sonst `prefers-contrast: more` → `contrast: "high"`,
  3. sonst `prefers-color-scheme` für den Modus, `contrast: "normal"`.
- **Selektoren umstellen (D1):** `SidebarItems.astro` von
  `:root[data-theme="light"]` / `[data-theme="dark"]` auf
  `[data-mode="light"]` / `[data-mode="dark"]` umschreiben — bleiben damit
  kontrast-unabhängig und ohne Doppelung. (Aktuell ~2 logische Regeln betroffen.)
- **ThemeController (D2):** zweites Bedienelement (Kontrast-Toggle/Segmented-
  Control) ergänzen, das `contrast` in `schlaumeise:theme:v1` schreibt und
  `data-mode`/`data-contrast`/`data-theme` live aktualisiert.

### Phase 5 — Verifikation
- `npm run build` grün.
- Visueller Diff gegen Phase-0-Screenshots: Light/Dark dürfen sich **nicht**
  verändert haben (reines Refactoring).
- Kontrast-Messung der vier Themes (z. B. axe / Lighthouse / manueller Rechner)
  gegen die Zielwerte; Befunde in `todo.md` #9 dokumentieren.
- Tastatur-/Fokus-Test, `prefers-contrast`-Test im Browser.
- Doku nachziehen: `architecture.md` (Styling-Abschnitt), `conventions.md`
  (Hex-Verbot als harte Regel), `todo.md` #6b auf erledigt.

---

## 4. Risiken & Entscheidungen

- **Contrast-Schema festgelegt (D1):** orthogonales `data-mode` + `data-contrast`;
  `data-theme` bleibt der zusammengesetzte Name für daisyUI. daisyUI **muss**
  über `data-theme` selektieren — `data-mode`/`data-contrast` sind nur für die
  eigenen Selektoren da. Beim Setzen unbedingt alle drei Attribute synchron halten.
- **Reines Refactoring zuerst:** Phasen 1–3 dürfen das sichtbare Ergebnis nicht
  ändern. Erst danach (Phase 4) kommen neue Themes. So bleibt jeder Schritt
  überprüfbar.
- **Terminal/CodeBlock bleiben dunkel** — das ist Absicht (Code-Lesbarkeit), kein
  Bug; sie bekommen nur saubere Tokens.

---

## 5. Farbnutzung in `global.css` (Übersicht)

Häufigkeit jedes Roh-Farbwerts in der aktuellen `global.css`. Werte mit hoher
Frequenz sind die natürlichen Kandidaten für **Palette-Einträge** (Schicht 1).

### Hex-Werte

| Häufigkeit | Hex | Vermutete Rolle |
|---:|---|---|
| 9 | `#ffffff` | Weiß (Light-Fläche, *-content, Light-`base-100`) |
| 5 | `#eaeef5` | Hellgrau / Dark-Tinte (`base-content`, `gray-6`) |
| 3 | `#f9d15b` | Marken-Gelb (Sekundär, beide Themes) |
| 3 | `#5c4ae2` | Violett-Akzent Dark |
| 3 | `#4a2fc9` | Violett-Akzent Light |
| 3 | `#303945` | Grau (`neutral`/`gray-2` Light, `gray-5` Dark) |
| 3 | `#1f2733` | Dunkelgrau (`base-content` Light, `gray-1`, `gray-6` Dark) |
| 3 | `#15181e` | Fast-Schwarz (`gray-3`-Bereich, `--color-white` Light, `--color-black` Dark) |
| 2 | `#f4f6fa` | Sehr helles Grau (`base-200`, `gray-7`) |
| 2 | `#505966` | Mittelgrau (`gray-3` Light, `gray-4` Dark) |
| 2 | `#499bff` | Marken-Blau Primär Dark |
| 2 | `#3d2a05` | Dunkelbraun (`warning-content`) |
| 2 | `#3b2f04` | Dunkelbraun (`secondary-content`) |
| 2 | `#2558a0` | Marken-Blau Primär Light |
| 2 | `#0c1c33` | Dunkelblau (`primary-content`/`info-content` Dark) |
| 1 | `#fffaef` | Highlight Gelb (Light) |
| 1 | `#ff7a70` | Error (Dark) |
| 1 | `#fce3e2` | Highlight Rot (Light) |
| 1 | `#f6c453` | Warning (Dark) |
| 1 | `#f5a623` | Warning (Light) |
| 1 | `#e9f4fc` | Highlight Blau (Light) |
| 1 | `#e6ebf3` | `base-300` (Light) |
| 1 | `#e5e2f6` | Highlight Violett (Light) |
| 1 | `#e4f6e1` | Highlight Grün (Light) |
| 1 | `#d0d3fb` | `accent-low` (Light) |
| 1 | `#c92a2a` | Error (Light) |
| 1 | `#c3c9d1` | `gray-2` (Dark) |
| 1 | `#bfc4f8` | `accent-high` (Dark) |
| 1 | `#bdc2ca` | `gray-5` (Light) |
| 1 | `#9aa5b4` | `gray-3` (Dark) |
| 1 | `#828c9b` | `gray-4` (Light) |
| 1 | `#6cb6ff` | Info (Dark) |
| 1 | `#582f3a` | Highlight Rot (Dark) |
| 1 | `#57d077` | Success (Dark) |
| 1 | `#413654` | Highlight Violett (Dark) |
| 1 | `#3b372f` | Highlight Gelb (Dark) |
| 1 | `#330a07` | `error-content` (Dark) |
| 1 | `#313b53` | Highlight Blau (Dark) |
| 1 | `#2b2768` | `accent-high` (Light) |
| 1 | `#2a3340` | `neutral` (Dark) |
| 1 | `#294432` | Highlight Grün (Dark) |
| 1 | `#1f1e46` | `accent-low` (Dark) |
| 1 | `#1c222c` | `base-100` (Dark) |
| 1 | `#1a7f37` | Success (Light) |
| 1 | `#1a202b` | `gray-7` (Dark) |
| 1 | `#181d26` | `base-200` (Dark) |
| 1 | `#0f6cbd` | Info (Light) |
| 1 | `#062b14` | `success-content` (Dark) |

**47 verschiedene Hex-Werte**, davon 15 mehrfach verwendet.

### rgb / rgba (Schatten & Overlays)

| Häufigkeit | Wert | Rolle |
|---:|---|---|
| 1 | `rgba(255, 255, 255, 0.438)` | Inset-Highlight Light-Schatten |
| 1 | `rgba(255, 255, 255, 0.1)` | Inset Light |
| 1 | `rgba(255, 255, 255, 0.08)` | Inset Dark |
| 1 | `rgba(105, 105, 105, 0.1)` | Inset Dark |
| 1 | `rgba(0, 0, 0, 0.65)` | Schatten Dark |
| 1 | `rgba(0, 0, 0, 0.4)` | Schatten Dark |
| 1 | `rgba(0, 0, 0, 0.394)` | Inset Dark |
| 1 | `rgba(0, 0, 0, 0.339)` | Inset Light |
| 1 | `rgba(0, 0, 0, 0.137)` | Schatten Light |
| 1 | `rgba(0, 0, 0, 0.051)` | Schatten Light |
| 1 | `rgb(8 8 16 / 0.85)` | Header-Hintergrund Dark |
| 1 | `rgb(244 246 250 / 0.9)` | Header-Hintergrund Light |

Jeweils einmalig — die Schwarz-/Weiß-Alphas eignen sich für eine kleine
`--shadow-*`-/`--overlay-*`-Tokengruppe statt wiederholter Literale.

> Hinweis: Gezählt wurden nur Roh-Werte. Token-Referenzen (`var(--color-…)`) und
> `color-mix(...)` sind nicht enthalten — sie sind bereits „sauber" und das Ziel
> der Migration ist, ihren Anteil zu maximieren.
