/**
 * Single Source of Truth für Spektrogramm-Defaults.
 * Build-seitige STFT-Parameter liegen separat in scripts/spectrogram/precompute-spectrograms.mjs.
 */
import type { ColormapName } from "../../types/spectrogram";

export const DEFAULT_MIN_FREQUENCY = 0;
export const DEFAULT_MAX_FREQUENCY = 20000;
export const DEFAULT_COLORMAP: ColormapName = "magma";
export const DEFAULT_HEIGHT = 160;

/** Datei-Modus: festes Zeit-Raster und Halteposition des Strichs. */
export const DEFAULT_PIXELS_PER_SECOND = 120;
export const DEFAULT_FOLLOW_THRESHOLD = 2 / 3;

/** Live-Modus: sichtbares Zeitfenster. */
export const DEFAULT_WINDOW_SECONDS = 5;

/** Auswahlliste für den globalen Farb-Picker (Zahnrad). */
export const COLORMAPS: ColormapName[] = ["magma", "viridis", "inferno", "grey", "heat"];

/** localStorage-Schlüssel der globalen Palette (versioniert, Projektkonvention). */
export const COLORMAP_STORAGE_KEY = "schlaumeise:spectrogram-colormap:v1";

/** DOM-Event, mit dem ein Palettenwechsel global verteilt wird. */
export const COLORMAP_CHANGE_EVENT = "schlaumeise:spectrogram-colormap-change";
