/**
 * Datei-Modus: 3-Phasen-Logik für Fortschrittsstrich + scrollendes Sichtfenster.
 * Reine Funktion — unabhängig vom DOM testbar.
 *
 *  Phase 1 (Anfang):  Strich wandert 0 → Halteposition, Bild steht.
 *  Phase 2 (Mitte):   Strich fix an Halteposition, Bild scrollt darunter.
 *  Phase 3 (Ende):    Bild steht (letztes Fenster), Strich wandert → rechtes Ende.
 */

export interface FileViewInput {
  currentTime: number;
  duration: number;
  /** festes Zeit-Raster (px pro Sekunde). */
  pxPerSecond: number;
  /** Breite des Plotbereichs in CSS-px. */
  plotWidthPx: number;
  /** Halteposition des Strichs (0..1). */
  followThreshold: number;
}

export interface FileView {
  /** linke Kante des sichtbaren Fensters (Sekunden in der Quelle). */
  sourceStartSec: number;
  /** sichtbare Fensterdauer in Sekunden. */
  visibleSec: number;
  /** Position des Fortschrittsstrichs im Plot (px ab Plot-links). */
  playheadPx: number;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export function computeFileView(input: FileViewInput): FileView {
  const { currentTime, duration, pxPerSecond, plotWidthPx, followThreshold } = input;
  const visibleSec = plotWidthPx / pxPerSecond;

  // Datei passt komplett ins Fenster -> kein Scrollen.
  if (duration <= visibleSec || !Number.isFinite(duration) || duration <= 0) {
    return {
      sourceStartSec: 0,
      visibleSec,
      playheadPx: clamp(currentTime * pxPerSecond, 0, plotWidthPx),
    };
  }

  const haltSec = followThreshold * visibleSec;
  const tEnterPhase3 = duration - (1 - followThreshold) * visibleSec;

  let sourceStartSec: number;
  let playheadPx: number;

  if (currentTime < haltSec) {
    // Phase 1
    sourceStartSec = 0;
    playheadPx = currentTime * pxPerSecond;
  } else if (currentTime <= tEnterPhase3) {
    // Phase 2
    sourceStartSec = currentTime - haltSec;
    playheadPx = followThreshold * plotWidthPx;
  } else {
    // Phase 3
    sourceStartSec = duration - visibleSec;
    playheadPx = (currentTime - sourceStartSec) * pxPerSecond;
  }

  return {
    sourceStartSec,
    visibleSec,
    playheadPx: clamp(playheadPx, 0, plotWidthPx),
  };
}
