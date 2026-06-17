/**
 * Globale Farbpalette: in localStorage persistiert, Änderungen per Custom-Event
 * an alle Spektrogramm-Instanzen der Seite verteilt (Pub/Sub).
 */
import type { ColormapName } from "../../types/spectrogram";
import {
  COLORMAP_CHANGE_EVENT,
  COLORMAP_STORAGE_KEY,
  COLORMAPS,
  DEFAULT_COLORMAP,
} from "./config";

function isColormap(value: unknown): value is ColormapName {
  return typeof value === "string" && (COLORMAPS as string[]).includes(value);
}

/** Liefert die aktuell gewählte globale Palette (oder den Default). */
export function getColormap(): ColormapName {
  try {
    const stored = localStorage.getItem(COLORMAP_STORAGE_KEY);
    if (isColormap(stored)) return stored;
  } catch {
    /* localStorage nicht verfügbar */
  }
  return DEFAULT_COLORMAP;
}

/** Setzt die globale Palette und benachrichtigt alle Instanzen. */
export function setColormap(name: ColormapName): void {
  try {
    localStorage.setItem(COLORMAP_STORAGE_KEY, name);
  } catch {
    /* ignorieren */
  }
  window.dispatchEvent(new CustomEvent<ColormapName>(COLORMAP_CHANGE_EVENT, { detail: name }));
}

/** Abonniert Palettenwechsel. Gibt eine Abmelde-Funktion zurück. */
export function onColormapChange(callback: (name: ColormapName) => void): () => void {
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<ColormapName>).detail;
    if (isColormap(detail)) callback(detail);
  };
  window.addEventListener(COLORMAP_CHANGE_EVENT, handler);
  return () => window.removeEventListener(COLORMAP_CHANGE_EVENT, handler);
}
