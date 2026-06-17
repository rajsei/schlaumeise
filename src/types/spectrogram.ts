/**
 * Gemeinsame Typen für die Spektrogramm-Komponenten (Live- & Datei-Modus).
 * Siehe docs/spectrogram-plan.md.
 */

/** Verfügbare Farbpaletten (SSOT-Liste in config.ts: COLORMAPS). */
export type ColormapName = "magma" | "viridis" | "inferno" | "grey" | "heat";

/** Header des vorberechneten .spec-Rasters (siehe scripts/spectrogram/spectrogram-core.mjs). */
export interface RasterHeader {
  version: number;
  sampleRate: number;
  fftSize: number;
  hopSize: number;
  /** Anzahl Zeit-Spalten. */
  frames: number;
  /** Anzahl Frequenz-Zeilen. */
  bins: number;
  /** untere Frequenz des Rasters (Hz), i. d. R. 0. */
  minFreq: number;
  /** obere Frequenz des Rasters (Hz). */
  maxFreq: number;
  dbMin: number;
  dbMax: number;
  /** Dauer der Audiodatei in Sekunden. */
  duration: number;
}

/** Geparstes Raster: Header + Uint8-Magnituden (frame-major: f*bins + b). */
export interface SpectrogramRaster {
  header: RasterHeader;
  data: Uint8Array;
}

/** Props der Datei-Modus-Komponente (AudioSpectrogram.astro). */
export interface AudioSpectrogramProps {
  /** Importierte MP3 (URL-String nach Import). */
  src: string;
  /** Optionale eindeutige id; fehlt -> wird generiert. */
  id?: string;
  /** Sichtbarer/aria-Titel. */
  label?: string;
  /** Anzeige-Palette (Start); globaler Picker überschreibt. */
  colormap?: ColormapName;
  /** Canvas-Höhe in px. */
  height?: number;
  /** Festes Zeit-Raster (px pro Sekunde). */
  pixelsPerSecond?: number;
  /** Halteposition des Fortschrittsstrichs (0..1), Default 2/3. */
  followThreshold?: number;
  /** Untere Anzeigefrequenz (Hz). */
  minFrequency?: number;
  /** Obere Anzeigefrequenz (Hz). */
  maxFrequency?: number;
  /** x/y-Achsen beschriften. */
  showAxes?: boolean;
}

/** Props der Live-Modus-Komponente (MicSpectrogram.astro). */
export interface MicSpectrogramProps {
  id?: string;
  label?: string;
  colormap?: ColormapName;
  height?: number;
  /** Sichtbares Zeitfenster in Sekunden (Default 5). */
  windowSeconds?: number;
  minFrequency?: number;
  maxFrequency?: number;
  showAxes?: boolean;
}
