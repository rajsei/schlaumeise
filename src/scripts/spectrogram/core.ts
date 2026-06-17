/**
 * Gemeinsamer Zeichen-Kern für beide Modi: Canvas-Setup (devicePixelRatio),
 * Layout (Plotbereich + Achsenstege), Einfärben von Rastern/Spalten.
 */
import type { ColormapName, SpectrogramRaster } from "../../types/spectrogram";
import { getLut } from "./colormap";

export interface CanvasSetup {
  ctx: CanvasRenderingContext2D;
  dpr: number;
  /** Breite/Höhe in CSS-Pixeln. */
  cssWidth: number;
  cssHeight: number;
}

/** Setzt die Canvas-Backing-Store-Größe nach devicePixelRatio und gibt einen skalierten Context zurück. */
export function setupCanvas(canvas: HTMLCanvasElement): CanvasSetup {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cssWidth = Math.max(1, canvas.clientWidth);
  const cssHeight = Math.max(1, canvas.clientHeight);
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D-Context nicht verfügbar");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
  return { ctx, dpr, cssWidth, cssHeight };
}

export interface PlotLayout {
  /** Innerer Plotbereich (CSS-px). */
  x: number;
  y: number;
  w: number;
  h: number;
  gutterLeft: number;
  gutterBottom: number;
}

export const GUTTER_LEFT = 40;
export const GUTTER_BOTTOM = 18;

/** Berechnet den Plotbereich und die Achsenstege. */
export function computeLayout(cssWidth: number, cssHeight: number, showAxes: boolean): PlotLayout {
  const gutterLeft = showAxes ? GUTTER_LEFT : 0;
  const gutterBottom = showAxes ? GUTTER_BOTTOM : 0;
  return {
    gutterLeft,
    gutterBottom,
    x: gutterLeft,
    y: 0,
    w: Math.max(1, cssWidth - gutterLeft),
    h: Math.max(1, cssHeight - gutterBottom),
  };
}

/** Erzeugt eine Offscreen-Canvas. */
export function createOffscreen(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);
  return canvas;
}

/**
 * Rendert ein komplettes Raster in eine Offscreen-Canvas (Breite=frames, Höhe=bins).
 * y wird gespiegelt: hohe Frequenzen oben.
 */
export function renderRasterToOffscreen(
  raster: SpectrogramRaster,
  colormap: ColormapName,
): HTMLCanvasElement {
  const { frames, bins } = raster.header;
  const data = raster.data;
  const lut = getLut(colormap);
  const canvas = createOffscreen(frames, bins);
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(frames, bins);
  const px = img.data;
  for (let x = 0; x < frames; x++) {
    for (let y = 0; y < bins; y++) {
      const bin = bins - 1 - y; // hohe Frequenz oben
      const v = data[x * bins + bin];
      const o = (y * frames + x) * 4;
      px[o] = lut[v * 3];
      px[o + 1] = lut[v * 3 + 1];
      px[o + 2] = lut[v * 3 + 2];
      px[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/**
 * Schreibt eine einzelne Frequenzspalte (Höhe = bins) in eine 1×bins-Offscreen-Canvas.
 * `mags` sind Werte 0..255, mags[0] = tiefste Frequenz.
 */
export function writeColumn(
  columnCanvas: HTMLCanvasElement,
  mags: Uint8Array,
  colormap: ColormapName,
): void {
  const bins = columnCanvas.height;
  const lut = getLut(colormap);
  const ctx = columnCanvas.getContext("2d")!;
  const img = ctx.createImageData(1, bins);
  const px = img.data;
  for (let y = 0; y < bins; y++) {
    const bin = bins - 1 - y; // hohe Frequenz oben
    const v = mags[bin] ?? 0;
    const o = y * 4;
    px[o] = lut[v * 3];
    px[o + 1] = lut[v * 3 + 1];
    px[o + 2] = lut[v * 3 + 2];
    px[o + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}
