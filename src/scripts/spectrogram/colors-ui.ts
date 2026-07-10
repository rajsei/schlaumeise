/**
 * Verdrahtet die Zahnrad-Farbauswahl: Klick -> globale Palette setzen,
 * aktive Auswahl spiegeln. Wirkt global auf alle Instanzen (über settings.ts).
 */
import type { ColormapName } from "@types/spectrogram";
import { getColormap, onColormapChange, setColormap } from "./settings";

let initialized = false;

export function initColorPickers(): void {
  if (initialized) return;
  initialized = true;

  const run = () => {
    const options = document.querySelectorAll<HTMLButtonElement>("[data-colormap-option]");
    if (options.length === 0) return;

    const reflect = (current: ColormapName) => {
      options.forEach((btn) => {
        const active = btn.dataset.colormapOption === current;
        btn.setAttribute("aria-checked", String(active));
        btn.classList.toggle("is-active", active);
      });
    };

    options.forEach((btn) => {
      btn.addEventListener("click", () => {
        const value = btn.dataset.colormapOption as ColormapName | undefined;
        if (value) setColormap(value);
        // DaisyUI-Dropdown schließen
        (document.activeElement as HTMLElement | null)?.blur();
      });
    });

    onColormapChange(reflect);
    reflect(getColormap());
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
}
