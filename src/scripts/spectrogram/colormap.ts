/**
 * Farbpaletten als 256×RGB-LUT. Aus wenigen Stützfarben linear interpoliert.
 * Eine LUT bildet einen normierten Wert 0..255 auf RGB ab.
 */
import type { ColormapName } from "../../types/spectrogram";

type Stop = [number, number, number]; // r,g,b 0..255

const STOPS: Record<ColormapName, Stop[]> = {
  // Annäherungen der echten Matplotlib-Paletten über Stützstellen.
  // Magma: schwarze → blau-lila → pink-rose → lachs → creme
  magma: [
    [0, 0, 4],
    [40, 11, 84],
    [81, 18, 123],
    [129, 37, 129],
    [183, 55, 121],
    [229, 105, 130],
    [251, 164, 174],
    [252, 220, 195],
    [252, 253, 191],
  ],
  // Inferno: schwarz → lila → dunkelrot → orange → gelb
  inferno: [
    [0, 0, 4],
    [31, 12, 72],
    [87, 16, 109],
    [139, 34, 82],
    [187, 55, 84],
    [249, 142, 9],
    [253, 212, 50],
    [252, 255, 164],
  ],
  viridis: [
    [68, 1, 84],
    [72, 40, 120],
    [62, 74, 137],
    [49, 104, 142],
    [38, 130, 142],
    [31, 158, 137],
    [53, 183, 121],
    [109, 205, 89],
    [180, 222, 44],
    [253, 231, 37],
  ],
  grey: [
    [0, 0, 0],
    [255, 255, 255],
  ],
  heat: [
    [0, 0, 0],
    [128, 0, 0],
    [255, 0, 0],
    [255, 165, 0],
    [255, 255, 0],
    [255, 255, 255],
  ],
};

const lutCache = new Map<ColormapName, Uint8Array>();

/** Liefert die 256*3-LUT einer Palette (gecacht). */
export function getLut(name: ColormapName): Uint8Array {
  let lut = lutCache.get(name);
  if (lut) return lut;

  const stops = STOPS[name] ?? STOPS.magma;
  lut = new Uint8Array(256 * 3);
  const segments = stops.length - 1;
  for (let i = 0; i < 256; i++) {
    const t = (i / 255) * segments;
    const idx = Math.min(segments - 1, Math.floor(t));
    const frac = t - idx;
    const a = stops[idx];
    const b = stops[idx + 1];
    lut[i * 3] = Math.round(a[0] + (b[0] - a[0]) * frac);
    lut[i * 3 + 1] = Math.round(a[1] + (b[1] - a[1]) * frac);
    lut[i * 3 + 2] = Math.round(a[2] + (b[2] - a[2]) * frac);
  }
  lutCache.set(name, lut);
  return lut;
}
