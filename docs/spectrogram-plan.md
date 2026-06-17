# Plan: Spektrogramm-Komponente (Live- & Datei-Modus) für Schlaumeise

**Status:** 🟡 umgesetzt (Build-Verifikation auf dem Zielsystem ausstehend) · **Stand:** 2026-06-16 · Verwandt: [features.md](./features.md), [roadmap.md](./roadmap.md), [todo.md](./todo.md)

> Architektur- und Strukturplan, kein fertiger Code. Abgestimmt auf die bestehenden
> Projektregeln (`AGENTS.md`): kein Client-JS ohne Not, keine neuen Dependencies ohne
> Freigabe, Skript-Logik in `src/scripts/` mit `init…()`-Hooks, Komponenten in
> `src/components/docs/`, Asset-URLs über `withBase`/`resolveAssetUrl`, i18n de/en,
> Doku-Pflicht (`features.md`, `changelog.md`).

---

## 1. Technischer Unterbau (Web-APIs)

### Gemeinsam
- **`AudioContext`** als zentrales Objekt. Wegen der Autoplay-Policy darf er erst nach
  einer Nutzergeste erzeugt/`resume()`-t werden (Klick auf „Start" bzw. erster Play).
- **`AnalyserNode`** liefert pro Frame ein Frequenzspektrum (`getByteFrequencyData`).
  Parameter: `fftSize` (1024–4096), `smoothingTimeConstant` (für Spektrogramm eher
  niedrig, z. B. 0), `minDecibels`/`maxDecibels` für den Farb-Kontrast.
- **Canvas 2D** als Zeichenfläche (kein WebGL nötig). Eine Spektrogramm-Spalte = 1px
  Frequenz-Säule; Farbe = dB-Wert über eine Farb-LUT (magma/viridis).

### Live-Modus (Mikrofon)
- **`navigator.mediaDevices.getUserMedia({ audio: true })`** → `MediaStream`.
- **`AudioContext.createMediaStreamSource(stream)`** → `AnalyserNode`.
- **Festes 5-Sekunden-Fenster (gegen Verzerrung):** Die Canvas-Breite bildet **immer
  exakt `windowSeconds` (Default 5 s)** ab → `pxProSekunde = canvasBreite / windowSeconds`.
  Gezeigt werden stets die **letzten 5 s**.
  - **Zeitbasiertes Scrollen statt framebasiertes:** pro Frame um
    `delta_in_s * pxProSekunde` verschieben (nicht „1px pro Frame"). So bleibt das Bild
    bei schwankender Framerate **unverzerrt** (Zeitachse linear, geräteunabhängig).
  - Sauberste Umsetzung: **Ringpuffer** aus FFT-Spalten **mit Zeitstempel**; pro Frame
    wird das Fenster `[jetzt-5s, jetzt]` neu in die Canvas gemappt. `windowSeconds` ist
    so später trivial variabel (Prop), ohne dass sich die Mathematik ändert.
- **Start/Stop-Navigation:** Aufnahme wird per Button gestartet **und** gestoppt; beim
  Stop friert das Spektrogramm ein (rAF aus, letztes Fenster bleibt sichtbar), Tracks
  und Context werden freigegeben. Erneutes Start beginnt eine neue Aufnahme.
- **Permissions/Kompatibilität:** Mikrofon braucht einen *secure context* (https oder
  localhost) — GitHub Pages ist https, passt. Zugriff nur nach Nutzergeste (Start-Klick)
  anfragen, `NotAllowedError`/`NotFoundError` sauber abfangen und als UI-Hinweis anzeigen.
- **Wichtig:** Mikrofon-Quelle **nicht** mit `destination` verbinden (sonst Rückkopplung).

### Datei-Modus (MP3) — **festgelegt: A2 (dB-Raster zur Build-Zeit vorberechnen)**

Die STFT läuft **zur Build-Zeit in Node** (nicht im Browser). Gespeichert wird ein
kompaktes, **farbneutrales dB-Magnituden-Raster** (quantisiert auf `Uint8`), das der
Client beim Anzeigen nur noch **einfärbt** und scrollt. Kein `decodeAudioData`, keine
FFT im Browser für Dateien.

- **Build (Node):** MP3 dekodieren (**JS-MP3-Decoder als npm-`devDependency`**, s. Punkt 4) → PCM → **eigene
  STFT** (gefensterte FFT-Frames mit Overlap, `fft.ts` läuft auch in Node) → dB-Raster
  mit festem `pxProSekunde` (Spalten = Zeit, Zeilen = Frequenz-Bins im Bereich
  0–20 kHz). Header (sampleRate, hop, fftSize, frames, bins, min/max-Freq, dB-Range) +
  `Uint8`-Raster, per Datei-Hash gecacht.
- **Client:** Raster lazy laden → **einmal einfärben** in den breiten Offscreen-Puffer
  (ein Durchlauf, ~10–80 ms je nach Gerät) → Sichtfenster blitten + Fortschrittsstrich.
  Palettenwechsel = nur **neu einfärben** aus demselben Raster (kein Neuladen/Neurechnen).
- **Gegen Verzerrung:** Festes Zeit-Raster (`pxProSekunde`) → kurze und lange Clips haben
  dieselbe Achsen-Skala; die Canvas ist nur ein **scrollendes Sichtfenster** über den
  breiten Puffer (nicht in Canvas-Breite gequetscht).
- **Canvas-Größenlimit beachten:** sehr lange Dateien → Puffer kann die Browser-Grenze
  (~16k–32k px) sprengen → ggf. in **Kacheln** (mehrere Offscreen-Canvases) rendern.

### FFT ↔ Canvas-Kopplung
- **Live:** `requestAnimationFrame`-Schleife, ein `AnalyserNode`-Read pro Frame, Spalte
  ins Ringpuffer-Raster, zeitbasiert scrollen. ~60 fps; bei Bedarf drosseln.
- **Datei:** STFT schon zur Build-Zeit erledigt → der Client lädt nur das fertige Raster,
  färbt es einmal ein und blittet pro Frame das Sichtfenster + setzt den Strich. **Keine
  FFT im Browser.**
- **Gemeinsamer Kern:** Beide Modi füttern **dasselbe** dB-Raster in **dieselbe**
  Einfärbe-/Zeichen-Pipeline (`core.ts`/`colormap.ts`/`axes.ts`/`progress.ts`) — Live aus
  dem `AnalyserNode` in Echtzeit, Datei aus der gespeicherten Datei.
- **Kein Dependency-Zwang im Client:** Die Radix-2-FFT (`fft.ts`) wird nur **im Build**
  (Node) gebraucht; der ausgelieferte Client-Code enthält keine FFT.

---

## 2. Architektur der Komponente(n)

**Empfehlung: zwei dünne Komponenten + ein gemeinsamer TS-Kern.**

Begründung (deckt sich mit AGENTS „eine Verantwortlichkeit pro Komponente",
„wiederverwenden statt duplizieren", „Logik in `src/scripts/`"):

- Live- und Datei-Modus teilen **Einfärben, Canvas-Setup, Achsen, Fortschrittsstrich** →
  in `src/scripts/spectrogram/` als gemeinsamer Kern (beide arbeiten auf demselben
  dB-Raster-Format).
- Sie unterscheiden sich in **Quelle, DOM und Lifecycle** deutlich (Mikrofon-Echtzeit +
  Start/Stop + Permission vs. vorhandenes `<audio>` + vorberechnetes Raster) → daher zwei
  Komponenten statt einer `mode`-Prop-Komponente mit vielen Verzweigungen.
  - `AudioSpectrogram.astro` — Datei-Modus, umschließt das bestehende `<audio>`-Muster.
  - `MicSpectrogram.astro` — Live-Modus, mit Start/Stop und Permission-Handling.

*Alternative (dokumentiert, aber nicht empfohlen):* eine `Spectrogram.astro` mit
`mode="mic" | "file"`. Spart eine Datei, erzeugt aber Prop-/DOM-Verzweigungen, die der
„eine Verantwortlichkeit"-Regel widersprechen.

### Idiomatische Einbindung in Astro (ohne Framework-Islands)
Astro bündelt `<script>`-Tags (als `type="module"`) über Vite und **dedupliziert
identische Skripte** über mehrere Instanzen hinweg. Muster wie bei `docs-drawer.ts`:

```astro
---
// AudioSpectrogram.astro
interface Props { /* … */ }
const { src, id, label } = Astro.props as Props;
---
<figure class="spectrogram" data-spectrogram data-src={src} data-id={id}>
  <canvas class="spectrogram-canvas"></canvas>
  <div class="spectrogram-progress" aria-hidden="true"></div>
  <audio class="audio" controls preload="metadata" src={src}>…</audio>
</figure>

<script>
  import { initFileSpectrograms } from "../../scripts/spectrogram/file";
  initFileSpectrograms(); // scannt ALLE [data-spectrogram] auf der Seite
</script>
```

- Das Skript **selbst-initialisiert** über `data-*`-Attribute/IDs und findet alle
  Instanzen — wichtig für `audiosample.mdx` mit 12+ Audios. Dank Astro-Dedup läuft das
  Init-Skript pro Seite nur einmal, scannt aber alle Vorkommen.
- Pro-Instanz-Konfiguration ausschließlich über `data-*` (kein Inline-JS in MDX).

---

## 3. Ordnerstruktur

```
src/components/docs/
  AudioSpectrogram.astro     # Datei-Modus (Drop-in für bisheriges <audio>)
  MicSpectrogram.astro       # Live-Modus

src/scripts/spectrogram/
  config.ts        # SSOT: Default min/max-Frequenz (0–20 kHz), Default-Palette, COLORMAPS
  core.ts          # Canvas-Setup, devicePixelRatio, Raster einfärben, blitten, Recolor
  colormap.ts      # dB → RGB-LUT pro Palette (magma/viridis/inferno/grey/heat)
  settings.ts      # globale Palette: localStorage + Pub/Sub, benachrichtigt alle Instanzen
  axes.ts          # x/y-Achsen + Ticks (Frequenz linear/statisch, Zeit live/datei)
  raster.ts        # dB-Raster-Format (Header + Uint8): Schreiben (Build) & Lesen (Client)
  file.ts          # initFileSpectrograms(): Raster lazy laden → einfärben → progress
  mic.ts           # initMicSpectrograms(): getUserMedia → AnalyserNode → rAF (Echtzeit-FFT)
  progress.ts      # Fortschrittsstrich (play/pause/seek/loop, rAF)

src/types/
  spectrogram.ts   # SpectrogramProps, ColormapName, RasterHeader (Typen lt. AGENTS)

scripts/spectrogram/          # Build-seitig (Node), NICHT im Client-Bundle:
  fft.ts                      # kompakte Radix-2-FFT + STFT — kein Runtime-Dependency
  precompute-spectrograms.mjs # MP3 → (JS-MP3-Decoder, npm devDep) PCM → STFT → .spec + Manifest

# Build-Integration: entweder src/plugins/<integration>.mjs (Astro-Hook `astro:build:*`)
# oder ein npm-Script vor `astro build`. Ausgabe-Raster in src/assets/audio/spectrograms/
# (laufen durch astro:assets), Zuordnung Audio→Raster über generiertes Manifest.
```

**Worker entfällt im Client:** Da die STFT in den Build wandert, braucht der Datei-Modus
**keinen** Web Worker mehr (nur Laden + ein Einfärbe-Durchlauf). Der Live-Modus nutzt die
native FFT des `AnalyserNode` — ebenfalls kein Worker nötig.

**Raster-Zuordnung in MDX:** Damit MDX nur `src={…mp3}` braucht, erzeugt das Build-Skript
ein **Manifest** (Audio-Dateiname/Hash → Raster-Asset-URL); `file.ts` schlägt das Raster
darüber nach (z. B. via `import.meta.glob` der `spectrograms/`-Assets). Alternativ kann
das Raster explizit als zweite Prop importiert werden — Manifest ist aber MDX-freundlicher.

---

## 4. Pre-Rendering — **Entscheidung: A2 (dB-Raster zur Build-Zeit)**

Drei Wege wurden abgewogen; **A2 ist gewählt**:

| Kriterium | A1 (Bild WebP/PNG) | **A2 (dB-Raster, gewählt)** | B (voll client-seitig) |
|---|---|---|---|
| Client-CPU | ~0 | ~0 (ein Einfärbe-Durchlauf) | Decode + FFT je Datei |
| Erste Anzeige | sofort | ~10–80 ms (Einfärben) | nach Rechenzeit (Skeleton) |
| FFT im Browser | nein | nein | ja (teuer, gerätevariabel) |
| Farb-Zahnrad (global) | nur mit Bild pro Palette | **ja, billiges Recolor** | ja |
| Gemeinsamer Kern mit Live | nein (Bild-Pfad) | **ja (gleiches Raster)** | ja |
| Payload je Datei | klein (~50–150 KB) | mittel (~200–500 KB, brotli) | nur MP3 |
| Build-Zeit | Decoder nötig | Decoder nötig | 0 |
| Low-End-Geräte | ideal | ideal | kritisch |

**Warum A2 statt A1:** Das **globale Farb-Zahnrad** braucht ein farbneutrales Raster, um
clientseitig billig umzufärben — bei A1 wäre die Farbe ins Bild gebrannt (sonst N Bilder
pro Palette). Zudem teilt A2 **dieselbe Einfärbe-/Zeichen-Pipeline** mit dem Live-Modus
(weniger Code-Divergenz). Den einzigen Nachteil (etwas größere Payload als ein Bild)
fangen wir über Auflösungs-Cap auf 0–20 kHz + Brotli ab.

**Warum nicht B:** Die FFT über die ganze Datei skaliert stark mit der Geräteleistung
(auf günstigen Tablets/Chromebooks 10–30× langsamer als auf einem aktuellen Laptop) — für
eine Kinder-Bildungsseite mit unkontrolliertem, eher schwachem Gerätemix nicht tragbar.

**Decode im Build — festgelegt: JS-MP3-Decoder (npm `devDependency`, z. B. WASM wie
`mpg123-decoder`).** Node hat kein `decodeAudioData`; der JS-Decoder macht `npm install`
zur einzigen Voraussetzung — kein Systemtool, reproduzierbar auf jedem Rechner (inkl.
Windows-Dev) und in CI. Er läuft **nur im Build**, landet **nicht** im Client-Bundle. Die
eigene `fft.ts` läuft in Node und braucht keine Freigabe. **AGENTS-Freigabe** ist nur noch
für diese **eine devDependency** einzuholen (Auswahl des konkreten Pakets beim Menschen).

**Live-Modus:** zwingend clientseitig/Echtzeit (keine Wahl).

---

## 5. Skalierbarkeit (12+ MP3s auf einer Seite)

- **Seite/Client:** Pro Audio wird nur ein kleines Raster **lazy** geladen
  (`IntersectionObserver`) und **einmal eingefärbt** — kein FFT, kein Decode im Browser.
  13 Spektrogramme bleiben damit auch auf schwachen Geräten flüssig.
- **Einfärben verteilen:** erst beim Sichtbarwerden bzw. ersten Play einfärben; vorher
  Skelett/Placeholder. Recolor (Zahnrad) betrifft nur sichtbare Instanzen.
- **Build:** STFT je Datei **per Datei-Hash cachen** → nur geänderte MP3s neu rechnen;
  13 kurze Clips ≈ wenige Sekunden Gesamt-Build, danach inkrementell.
- **Payload zähmen:** Frequenz-Bins auf den 0–20-kHz-Bereich begrenzen, lange Dateien in
  der Zeitauflösung maßvoll, Brotli-Kompression der `.spec`-Dateien.
- **Live-Modus:** immer nur **eine** aktive Instanz; bei „Stop" Tracks/Context freigeben.
- **Generell:** Canvas-Auflösung deckeln, `devicePixelRatio` maßvoll, rAF offscreen pausieren.

---

## 6. API / Props-Design + konkretes MDX-Beispiel

### Props

```ts
// src/types/spectrogram.ts
// Verfügbare Paletten zentral (SSOT) — Picker UND Defaults lesen aus dieser Liste.
export type ColormapName = "magma" | "viridis" | "inferno" | "grey" | "heat";

// src/scripts/spectrogram/config.ts — Single Source of Truth
//   DEFAULT_MIN_FREQUENCY = 0
//   DEFAULT_MAX_FREQUENCY = 20000   // 0–20 kHz; per Prop überschreibbar
//   DEFAULT_COLORMAP      = "magma"
//   COLORMAPS: ColormapName[]       // speist Achsenkappung + Farb-Picker

export interface AudioSpectrogramProps {
  src: string;              // importierte MP3 (URL-String nach Import)
  id?: string;              // optional; fehlt → Komponente erzeugt EINDEUTIGE id (s. u.)
  label?: string;           // sichtbarer/aria-Titel (i18n: Wert kommt aus MDX/Dictionary)
  fftSize?: 1024 | 2048 | 4096;   // default 2048
  colormap?: ColormapName;        // Start-Palette; globaler Picker überschreibt (s. u.)
  height?: number;                // Canvas-Höhe in px, default z. B. 160
  pixelsPerSecond?: number;       // festes Zeit-Raster → unverzerrt, default z. B. 120
  followThreshold?: number;       // Strich-Haltepunkt 0..1, default 2/3
  minFrequency?: number;          // y-Achse unten (Hz), default 0 — pro Datei anpassbar
  maxFrequency?: number;          // y-Achse oben (Hz), default 20000 — pro Datei anpassbar
  showAxes?: boolean;             // x/y beschriften, default true
}

export interface MicSpectrogramProps {
  label?: string;
  fftSize?: 1024 | 2048 | 4096;
  colormap?: ColormapName;  // Start-Palette; globaler Picker überschreibt
  height?: number;
  windowSeconds?: number;   // sichtbares Zeitfenster, default 5 (variabel)
  minFrequency?: number;    // default 0
  maxFrequency?: number;    // default 20000 (0–20 kHz)
  showAxes?: boolean;       // x/y beschriften, default true
}
```

**Eindeutige IDs (Bugfix):** In `audiosample.mdx` teilen sich heute mehrere `<audio>`
dieselbe `id` (`Specht-audio` 4×, `weidengelbkehlchen-audio`/`weißkehlammer-audio`/
`Dachsammer-audio`/`Leierschwanz-audio` je 2×). Doppelte IDs sind ungültiges HTML und
würden ID-basierte Hooks kollidieren lassen. Die Komponente generiert daher **intern eine
eindeutige id** (z. B. aus Dateiname + Astro-`crypto.randomUUID()`/Instanzindex); die
`id`-Prop ist nur ein optionales Override.

**Globaler Farb-Picker (Zahnrad oben rechts):** Ein kleines Zahnrad-Icon am Spektrogramm
öffnet ein DaisyUI-Dropdown mit Paletten-Auswahl. Die Wahl ist **global** (alle
Spektrogramme der Seite) und wird in `localStorage` persistiert. Umsetzung über ein
winziges Pub/Sub-Modul `settings.ts`: bei Änderung benachrichtigt es alle Instanzen, die
sich **nur neu einfärben** — dazu hält jede Instanz ihr **dB-Magnituden-Raster** im
Speicher, sodass Recoloring **ohne erneute FFT/STFT** möglich ist (billig).

Die Datei-Komponente ist ein **Drop-in-Ersatz** für das heutige `<audio>`: gleicher
`src`, gleiche `controls`-Wiedergabe — plus Canvas + Strich darüber.

### Konkreter Einbau in `audiosample.mdx` (Weidengelbkehlchen-Lied)

**Vorher (heute):**
```mdx
<HighlightSection title="Wie hört sich das Lied eines Weidengelbkehlchens an?" color="blue">
  <div slot="body">
    <p>Das Weidengelbkehlchen …</p>
  </div>
  <audio class="audio" id="weidengelbkehlchen-audio" controls preload="metadata" src={weidengelbkehlchenLied}>
    Your browser does not support the audio element.
  </audio>
</HighlightSection>
```

**Nachher (mit Spektrogramm + Fortschrittsstrich):**
```mdx
---
import HighlightSection from "../../../../components/docs/HighlightSection.astro";
import AudioSpectrogram from "../../../../components/docs/AudioSpectrogram.astro";
import weidengelbkehlchenLied from "../../../../assets/audio/weidengelbkehlchen-lied.mp3";
---

<HighlightSection title="Wie hört sich das Lied eines Weidengelbkehlchens an?" color="blue">
  <div slot="body">
    <p>Das Weidengelbkehlchen (*Geothlypis trichas*) ist ein Singvogel …</p>
  </div>

  <AudioSpectrogram
    src={weidengelbkehlchenLied}
    id="weidengelbkehlchen-lied"
    label="Lied des Weidengelbkehlchens"
    colormap="magma"
    height={160}
  />
</HighlightSection>
```

Das `<audio controls>` lebt **innerhalb** von `AudioSpectrogram` — die MDX-Autorin
schreibt kein `<audio>` mehr selbst, nur noch die Komponente. Live-Modus analog:

```mdx
import MicSpectrogram from "../../../../components/docs/MicSpectrogram.astro";

<MicSpectrogram label="Sprich ins Mikrofon" colormap="viridis" height={160} />
```

---

## 7. Verhalten des Fortschrittsstrichs (Datei-Modus, 3 Phasen)

Da das Bild mit festem `pxProSekunde` gerendert wird (Punkt 1b), gilt:
`spielkopf_px = audio.currentTime * pxProSekunde`, `halt_px = canvasBreite * followThreshold`
(Default 2/3). Drei Phasen:

1. **Anfang (Strich wandert):** Solange `spielkopf_px < halt_px`, steht das Spektrogramm
   still (Anfang sichtbar), der **Strich bewegt sich von 0 → 2/3**. Sichtfenster-Offset = 0.
2. **Mitte (Bild scrollt):** Sobald `spielkopf_px >= halt_px` und noch genug Rest folgt,
   bleibt der **Strich fix bei 2/3** stehen, und das **Spektrogramm scrollt darunter**
   nach links (Offset = `spielkopf_px - halt_px`). Aktuelle Zeit liegt immer bei 2/3.
3. **Ende (Strich wandert wieder):** Wenn das letzte Fenster erreicht ist (kein Rest mehr
   zum Scrollen), friert der Offset ein und der **Strich läuft von 2/3 → rechtes Ende**,
   bis `currentTime == duration`.

- **Antrieb:** `requestAnimationFrame` **nur während `play`** — nicht über `timeupdate`
  allein (feuert nur ~4×/s → ruckelt). Auf `play` rAF starten, auf `pause`/`ended`
  `cancelAnimationFrame`. Strich-Bewegung über **`transform: translateX`** (Compositor);
  das Bild-Scrollen über `drawImage`-Offset bzw. ebenfalls `transform`.
- **Seek:** Jeder Frame leitet Phase + Offset aus `currentTime` ab → Strich/Bild folgen
  automatisch in die korrekte Phase. Für Seeks im pausierten Zustand einmalig auf
  `seeked`/`timeupdate` neu zeichnen.
- **Loop:** `currentTime` springt auf 0 → zurück in Phase 1 (durch Auslesen pro Frame
  korrekt abgebildet).
- **Pause:** rAF stoppen, Strich + Offset bleiben stehen.
- **Mehrere Instanzen:** jede verwaltet ihre eigene Schleife, nur *spielende* Instanzen
  rechnen → kein Dauer-rAF für 12 Audios.
- **Offscreen pausieren:** rAF auch während der Wiedergabe stoppen, wenn die Komponente
  per `IntersectionObserver` aus dem Viewport scrollt → spart Akku/CPU auf langer Seite.
- **A11y/Motion:** `prefers-reduced-motion` respektieren; `will-change` sparsam. Canvas
  selbst `aria-hidden="true"` (rein visuell, ergänzt nur das Audio); aussagekräftiges
  `aria-label` an der `<figure>`.

### Live-Modus
Hier gibt es keinen frei wandernden Strich: das **5-s-Fenster scrollt zeitbasiert**, der
„aktuelle Zeitpunkt" ist immer die **rechte Kante**. Optional eine feste „Jetzt"-Markierung
am rechten Rand. Beim Stop friert das Fenster ein.

---

## 8. Achsenbeschriftung (x & y, beide Modi)

- **Layout:** Zeichenfläche bekommt einen **linken Steg** (y-Beschriftung) und einen
  **unteren Steg** (x-Beschriftung); das Spektrogramm wird in den inneren Bereich gezeichnet
  (Insets). So überlappt nichts mit dem scrollenden Bild.
- **Y-Achse = Frequenz (Hz/kHz):** **linear** (festgelegt), statisch (bewegt sich nie).
  Standardbereich **0–20 kHz** (`minFrequency`/`maxFrequency` aus `config.ts`, pro
  Instanz/Datei überschreibbar — falls relevante Frequenzen außerhalb liegen). Ticks z. B.
  alle 2–5 kHz. Bin→Hz: `f = bin * sampleRate / fftSize`.
- **X-Achse = Zeit (s):**
  - **Live:** feste Fenster-Skala, z. B. `-5 s … 0` (statische Ticks, da das Bild scrollt,
    nicht die Skala).
  - **Datei:** Ticks in **mm:ss**. In Phase 1/3 statisch, in der Scroll-Phase **mit dem
    Bild mitlaufend** → Ticks pro Frame dynamisch aus dem sichtbaren Zeitfenster zeichnen
    (oder direkt in den Offscreen-Puffer rendern, dann scrollen sie automatisch mit).
- **Umsetzung:** Achsen/Ticks als **eigene, statische Canvas-/SVG-Ebene** über bzw. neben
  dem Spektrogramm-Canvas — nicht ins scrollende Bild mischen (außer den mitlaufenden
  Datei-Zeit-Ticks). Beschriftungstexte i18n-fähig halten (Einheiten „s", „kHz" via
  Dictionary). `devicePixelRatio` für scharfe Schrift berücksichtigen.

## Implementierungsplan in Schritten

1. **devDependency freigeben (Mensch):** konkretes JS-MP3-Decoder-Paket (z. B.
   `mpg123-decoder`) als `devDependency` absegnen (AGENTS: keine neuen Dependencies ohne
   Freigabe). Architektur (A2, JS-Decoder) steht.
2. **Pflichtlektüre & Doku-Stub:** `docs/architecture.md`, `docs/conventions.md`,
   `docs/features.md` lesen; geplantes Feature in `features.md` als „geplant" eintragen.
3. **Typen + SSOT anlegen:** `src/types/spectrogram.ts` (Props, `ColormapName`,
   `RasterHeader`) und `src/scripts/spectrogram/config.ts` (Default min/max-Frequenz
   0–20 kHz, Default-Palette, `COLORMAPS`).
4. **Raster-Format + FFT:** `scripts/spectrogram/fft.ts` (Radix-2-FFT/STFT, Node-tauglich)
   und `raster.ts` (Header + `Uint8`-Schreiben/Lesen) — Single Source für das Format.
5. **FFT verifizieren:** Mini-Test — Sinus bekannter Frequenz rein → Peak im erwarteten
   Bin. Fängt FFT-Fehler früh, passt zur „`npm run build` fehlerfrei"-Abschlussregel.
6. **Build-Pipeline:** `precompute-spectrograms.mjs` — MP3 → (JS-MP3-Decoder, devDep) PCM →
   STFT → `.spec`-Raster in `src/assets/audio/spectrograms/` + Manifest; **per Datei-Hash
   gecacht**. Als Astro-Integration (`astro:build:*`) oder npm-Pre-Build-Script.
7. **Kern (Client, gemeinsam):** `core.ts` (Canvas-Setup, festes `pxProSekunde`,
   `devicePixelRatio`, **Raster einfärben** + blitten + Recolor), `colormap.ts` (alle
   Paletten als LUT), lineares Frequenz-Mapping. Kern hält das dB-Raster für Recolor vor.
8. **Achsen-Ebene:** `axes.ts` — y=Frequenz (linear, statisch, `min/maxFrequency`-Bereich),
   x=Zeit (Live: `-5..0`; Datei: mm:ss, mitlaufend); Insets/Stege, i18n-Einheiten, scharf.
9. **Globaler Farb-Picker:** `settings.ts` (localStorage + Pub/Sub) + Zahnrad-Dropdown
   (DaisyUI) oben rechts; Änderung → alle sichtbaren Instanzen färben ihr Raster neu ein.
10. **Fortschritts-/Scroll-Logik:** `progress.ts` — die 3 Phasen aus Punkt 7
    (0→2/3 → Halt bei 2/3 + Bild-Scroll → 2/3→Ende), play/pause/seek/loop über rAF +
    `transform`.
11. **Datei-Modus:** `AudioSpectrogram.astro` + `file.ts` (inkl. eindeutiger ID-Erzeugung):
    Raster über Manifest auflösen, **lazy** laden (`IntersectionObserver`/erstes Play),
    einfärben (ggf. gekachelt), Sichtfenster + Strich anbinden. Skelett während des Ladens.
12. **Live-Modus:** `MicSpectrogram.astro` + `mic.ts` — Start/Stop-Navigation,
    `getUserMedia`, `AnalyserNode`-Echtzeit-FFT, 5-s-Fenster mit zeitbasiertem
    Ringpuffer-Scroll, Permission-/Fehler-UI, Cleanup (`track.stop()`, `context.close()`),
    Einfrieren bei Stop.
13. **Skalierung absichern:** lazy einfärben, Recolor nur sichtbarer Instanzen, rAF
    offscreen pausieren, Auflösungs-/Kachel-Deckel, Build-Hash-Cache; Test mit allen 12
    Audios in `audiosample.mdx`.
14. **A11y & Responsiv:** Tastatur (Start/Stop + Zahnrad fokussierbar), Canvas
    `aria-hidden`, `aria-label` an der `<figure>`, `prefers-reduced-motion`, mobiles Layout
    (Canvas + Stege skalieren), `loading="lazy"`.
15. **MDX umstellen:** `audiosample.mdx` (de **und** en, gleiche Pfadstruktur) auf
    `AudioSpectrogram` umstellen; Live-Beispiel mit `MicSpectrogram`; Strings i18n-konform.
16. **Doku & Build:** `docs/features.md` (Status), `docs/changelog.md` (datiert),
    ggf. `architecture.md`/`content-handbook.md`; `npm run build` muss fehlerfrei laufen.
