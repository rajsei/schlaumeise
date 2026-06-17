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

function niceStep(rough: number, candidates: number[]): number {
  for (const c of candidates) {
    if (rough <= c) return c;
  }
  return candidates[candidates.length - 1];
}

function clearGutters(ctx: CanvasRenderingContext2D, layout: PlotLayout, cssWidth: number, cssHeight: number): void {
  ctx.clearRect(0, 0, layout.gutterLeft, cssHeight); // linker Steg
  ctx.clearRect(0, layout.y + layout.h, cssWidth, layout.gutterBottom); // unterer Steg
}

/** Zeichnet die statische Frequenzachse (links). */
export function drawFrequencyAxis(
  ctx: CanvasRenderingContext2D,
  layout: PlotLayout,
  minFreq: number,
  maxFreq: number,
  color: string,
  labels: AxisLabels,
): void {
  if (layout.gutterLeft === 0) return;
  const range = maxFreq - minFreq;
  if (range <= 0) return;
  const step = niceStep(range / 4, [1000, 2000, 5000, 10000, 20000]);

  ctx.font = FONT;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.globalAlpha = 0.75;

  // Layout oben: [Zahl maxFreq] bei y=5, [kHz] bei y=14, übrige Zahlen ab y=26.
  const topNumberY = 5;
  const unitY = 14;
  const unitReserve = 26;

  // Oberste Zahl (maxFreq) separat ganz oben
  const topKhz = maxFreq / 1000;
  ctx.textBaseline = "middle";
  ctx.fillText(
    `${Number.isInteger(topKhz) ? topKhz : topKhz.toFixed(1)}`,
    layout.gutterLeft - 5,
    topNumberY,
  );

  // Einheit "kHz" direkt darunter
  ctx.textBaseline = "top";
  ctx.fillText(labels.frequency, layout.gutterLeft - 5, unitY);

  ctx.textBaseline = "middle";
  for (let f = minFreq; f <= maxFreq + 1; f += step) {
    const y = layout.y + layout.h * (1 - (f - minFreq) / range);
    ctx.beginPath();
    ctx.moveTo(layout.gutterLeft - 3, y);
    ctx.lineTo(layout.gutterLeft, y);
    ctx.stroke();
    // Obersten Tick überspringen — Zahl bereits separat oben gezeichnet.
    if (f >= maxFreq) continue;
    const khz = f / 1000;
    const text = `${Number.isInteger(khz) ? khz : khz.toFixed(1)}`;
    const labelY = Math.min(layout.y + layout.h - 5, Math.max(unitReserve, y));
    ctx.fillText(text, layout.gutterLeft - 5, labelY);
  }
  ctx.globalAlpha = 1;
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
