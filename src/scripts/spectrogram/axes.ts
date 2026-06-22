/**
 * Achsen + Beschriftung. Frequenz (y) linear/statisch, Zeit (x) je Modus.
 * Farbe kommt aus dem Elementkontext (Theme), Einheiten aus dem Dictionary (i18n).
 */
import type { PlotLayout } from "./core";

export interface AxisLabels {
  /** Einheit der Frequenzachse, z. B. "kHz". */
  frequency: string;
  /** Einheit der Zeitachse, z. B. "s". */
  seconds: string;
}

const FONT = "10px system-ui, sans-serif";

/* Overlay-Farben der Beschriftung kommen aus theme-invarianten CSS-Tokens
 * (--spec-label-*, siehe global.css BLOCK C). Einmal gelesen + gecacht, da konstant. */
let specColorsCache: { fill: string; stroke: string; shadow: string } | null = null;
function getSpecColors(canvas: HTMLCanvasElement) {
  if (specColorsCache) return specColorsCache;
  const cs = getComputedStyle(canvas);
  const read = (name: string, fb: string) => cs.getPropertyValue(name).trim() || fb;
  specColorsCache = {
    fill: read("--spec-label-fill", "rgba(255, 255, 255, 0.96)"),
    stroke: read("--spec-label-stroke", "rgba(255, 255, 255, 0.85)"),
    shadow: read("--spec-label-shadow", "rgba(0, 0, 0, 0.9)"),
  };
  return specColorsCache;
}

function niceStep(rough: number, candidates: number[]): number {
  for (const c of candidates) {
    if (rough <= c) return c;
  }
  return candidates[candidates.length - 1];
}

function clearGutters(ctx: CanvasRenderingContext2D, layout: PlotLayout, cssWidth: number, cssHeight: number): void {
  ctx.clearRect(0, layout.y + layout.h, cssWidth, layout.gutterBottom); // unterer Steg (Zeitachse)
}

/**
 * Zeichnet die Frequenzachse als Overlay am linken Bildrand.
 * Weißer Text mit dunklem Saum (Schatten) bleibt auf jeder Farbpalette lesbar,
 * unabhängig vom Light-/Dark-Theme.
 */
export function drawFrequencyAxis(
  ctx: CanvasRenderingContext2D,
  layout: PlotLayout,
  minFreq: number,
  maxFreq: number,
  labels: AxisLabels,
): void {
  const range = maxFreq - minFreq;
  if (range <= 0) return;
  const step = niceStep(range / 4, [1000, 2000, 5000, 10000, 20000]);

  const tickLen = 4; // Länge der Tick-Striche am linken Rand
  const padX = 5; // Abstand des Texts vom Tick
  const padY = 7; // hält oberste/unterste Beschriftung im sichtbaren Bereich

  ctx.save();
  ctx.font = FONT;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  const spec = getSpecColors(ctx.canvas);
  ctx.shadowColor = spec.shadow;
  ctx.shadowBlur = 3;
  ctx.fillStyle = spec.fill;
  ctx.strokeStyle = spec.stroke;
  ctx.lineWidth = 1;

  for (let f = minFreq; f <= maxFreq + 1; f += step) {
    const y = layout.y + layout.h * (1 - (f - minFreq) / range);
    const labelY = Math.min(layout.y + layout.h - padY, Math.max(layout.y + padY, y));

    // Tick am linken Bildrand
    ctx.beginPath();
    ctx.moveTo(layout.x, y);
    ctx.lineTo(layout.x + tickLen, y);
    ctx.stroke();

    // Einheit nur an der obersten Beschriftung, damit die Achse selbsterklärend bleibt.
    const khz = f / 1000;
    const num = Number.isInteger(khz) ? `${khz}` : khz.toFixed(1);
    const text = f >= maxFreq ? `${num} ${labels.frequency}` : num;
    ctx.fillText(text, layout.x + tickLen + padX, labelY);
  }
  ctx.restore();
}

function formatTime(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

/** Zeichnet die Zeitachse für den Datei-Modus (mitlaufendes sichtbares Fenster). */
export function drawTimeAxisFile(
  ctx: CanvasRenderingContext2D,
  layout: PlotLayout,
  startSec: number,
  endSec: number,
  pxPerSecond: number,
  color: string,
): void {
  if (layout.gutterBottom === 0) return;
  const span = endSec - startSec;
  if (span <= 0) return;
  const step = niceStep(span / 4, [1, 2, 5, 10, 15, 30, 60, 120, 300]);

  ctx.font = FONT;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.globalAlpha = 0.75;

  const first = Math.ceil(startSec / step) * step;
  for (let t = first; t <= endSec + 1e-6; t += step) {
    // x direkt aus pxPerSecond — identisch zur Bildpositionierung in drawFrame.
    const x = layout.x + (t - startSec) * pxPerSecond;
    if (x > layout.x + layout.w + 1) continue;
    ctx.beginPath();
    ctx.moveTo(x, layout.y + layout.h);
    ctx.lineTo(x, layout.y + layout.h + 3);
    ctx.stroke();
    ctx.fillText(formatTime(t), Math.min(layout.x + layout.w - 12, Math.max(layout.x + 12, x)), layout.y + layout.h + 4);
  }
  ctx.globalAlpha = 1;
}

/** Zeichnet die statische Zeitachse für den Live-Modus (−windowSeconds … 0). */
export function drawTimeAxisLive(
  ctx: CanvasRenderingContext2D,
  layout: PlotLayout,
  windowSeconds: number,
  color: string,
  labels: AxisLabels,
): void {
  if (layout.gutterBottom === 0) return;
  const step = niceStep(windowSeconds / 5, [1, 2, 5, 10, 15, 30]);

  ctx.font = FONT;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.globalAlpha = 0.75;

  for (let ago = 0; ago <= windowSeconds + 1e-6; ago += step) {
    const x = layout.x + layout.w * (1 - ago / windowSeconds);
    ctx.beginPath();
    ctx.moveTo(x, layout.y + layout.h);
    ctx.lineTo(x, layout.y + layout.h + 3);
    ctx.stroke();
    const text = ago === 0 ? `0${labels.seconds}` : `-${ago}`;
    ctx.fillText(text, Math.min(layout.x + layout.w - 10, Math.max(layout.x + 10, x)), layout.y + layout.h + 4);
  }
  ctx.globalAlpha = 1;
}

export { clearGutters };
