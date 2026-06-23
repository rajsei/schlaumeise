/**
 * Datei-Modus: zeigt ein zur Build-Zeit vorberechnetes Spektrogramm-Raster,
 * synchron zur Wiedergabe des <audio>-Elements, mit 3-Phasen-Fortschrittsstrich.
 *
 * Selbst-initialisierend über `[data-spectrogram-file]`. Mehrere Instanzen pro Seite.
 */
import type { ColormapName, SpectrogramRaster } from "../../types/spectrogram";
import type { AxisLabels } from "./axes";
import {
  clearGutters,
  drawFrequencyAxis,
  drawTimeAxisFile,
} from "./axes";
import {
  computeLayout,
  renderRasterToOffscreen,
  setupCanvas,
  type PlotLayout,
} from "./core";
import { DEFAULT_COLORMAP } from "./config";
import { computeFileView } from "./progress";
import { fetchRaster } from "./raster";
import { getColormap, onColormapChange } from "./settings";

// Alle vorberechneten Raster (Pfad -> URL). Leer, falls noch keine erzeugt wurden.
const RASTER_URLS = import.meta.glob("/src/assets/audio/spectrograms/*.spec", {
  query: "?url",
  import: "default",
  eager: true,
}) as Record<string, string>;

function rasterUrlFor(name: string): string | undefined {
  const key = `/src/assets/audio/spectrograms/${name}.spec`;
  return RASTER_URLS[key];
}

interface InstanceOptions {
  pxPerSecond: number;
  followThreshold: number;
  minFrequency: number;
  maxFrequency: number;
  showAxes: boolean;
  labels: AxisLabels;
}

function readOptions(root: HTMLElement): InstanceOptions {
  return {
    pxPerSecond: Number(root.dataset.pxPerSecond) || 120,
    followThreshold: Number(root.dataset.followThreshold) || 2 / 3,
    minFrequency: Number(root.dataset.minFrequency) || 0,
    maxFrequency: Number(root.dataset.maxFrequency) || 20000,
    showAxes: root.dataset.showAxes !== "false",
    labels: {
      frequency: root.dataset.labelFrequency || "kHz",
      seconds: root.dataset.labelSeconds || "s",
    },
  };
}

function setupInstance(root: HTMLElement): void {
  const canvas = root.querySelector<HTMLCanvasElement>(".spectrogram-canvas");
  const playhead = root.querySelector<HTMLElement>(".spectrogram-progress");
  const viewport = root.querySelector<HTMLElement>(".spectrogram__viewport");
  const audio = root.querySelector<HTMLAudioElement>("audio");
  const name = root.dataset.name ?? "";
  if (!canvas || !playhead || !audio) return;

  const url = rasterUrlFor(name);
  if (!url) {
    // Kein Raster vorhanden -> nur das <audio> nutzen, Canvas ausblenden.
    root.dataset.state = "unavailable";
    canvas.style.display = "none";
    playhead.style.display = "none";
    return;
  }

  const opts = readOptions(root);
  let colormap: ColormapName = ((): ColormapName => {
    const c = root.dataset.colormap;
    return (c as ColormapName) || getColormap() || DEFAULT_COLORMAP;
  })();
  // Globale Auswahl hat Vorrang, falls gesetzt.
  colormap = getColormap() || colormap;

  let raster: SpectrogramRaster | null = null;
  let offscreen: HTMLCanvasElement | null = null;
  let layout: PlotLayout;
  let setup = setupCanvas(canvas);
  layout = computeLayout(setup.cssWidth, setup.cssHeight, opts.showAxes);
  let rafId = 0;
  let visible = true;
  let loading = false;

  const axisColor = () =>
    getComputedStyle(canvas).color ||
    getComputedStyle(canvas).getPropertyValue("--color-spec-axis").trim();

  const rebuildLayout = (): void => {
    setup = setupCanvas(canvas);
    layout = computeLayout(setup.cssWidth, setup.cssHeight, opts.showAxes);
  };

  // Begrenzt die Anzeigebreite auf die tatsächliche Spektrogramm-Breite,
  // damit bei kurzen Clips rechts kein leerer Hintergrund stehen bleibt.
  // Passt das Audio nicht ins Fenster (es scrollt), bleibt die volle Breite.
  const applySize = (): void => {
    const duration = raster?.header.duration || audio.duration || 0;
    const available = root.clientWidth;
    if (viewport && duration > 0 && available > 0) {
      const contentWidth = Math.ceil(duration * opts.pxPerSecond);
      viewport.style.width = contentWidth < available ? `${contentWidth}px` : "";
    }
    rebuildLayout();
    drawFrame();
  };

  const drawFrame = (): void => {
    if (!raster || !offscreen) return;
    const { ctx } = setup;
    const { header } = raster;
    const view = computeFileView({
      currentTime: audio.currentTime,
      duration: header.duration || audio.duration || 0,
      pxPerSecond: opts.pxPerSecond,
      plotWidthPx: layout.w,
      followThreshold: opts.followThreshold,
    });

    const duration = header.duration || audio.duration || 1;
    const drawEndSec = Math.min(view.sourceStartSec + view.visibleSec, duration);
    const startFrac = view.sourceStartSec / duration;
    const endFrac = drawEndSec / duration;
    const sx = startFrac * header.frames;
    const sw = Math.max(1, (endFrac - startFrac) * header.frames);
    const destW = (drawEndSec - view.sourceStartSec) * opts.pxPerSecond;

    // Frequenz-Crop: nur den sichtbaren Bereich [minFrequency, maxFrequency] aus dem
    // Raster ausschneiden. Im Offscreen liegt Zeile 0 bei der höchsten Frequenz.
    const rasterRange = header.maxFreq - header.minFreq;
    const maxBinFrac = Math.min(1, Math.max(0, (opts.maxFrequency - header.minFreq) / rasterRange));
    const minBinFrac = Math.min(1, Math.max(0, (opts.minFrequency - header.minFreq) / rasterRange));
    const sy = (1 - maxBinFrac) * header.bins;
    const sh = Math.max(1, (maxBinFrac - minBinFrac) * header.bins);

    ctx.clearRect(0, 0, setup.cssWidth, setup.cssHeight);
    ctx.drawImage(offscreen, sx, sy, sw, sh, layout.x, layout.y, destW, layout.h);

    if (opts.showAxes) {
      const color = axisColor();
      clearGutters(ctx, layout, setup.cssWidth, setup.cssHeight);
      drawFrequencyAxis(ctx, layout, opts.minFrequency, opts.maxFrequency, opts.labels);
      drawTimeAxisFile(ctx, layout, view.sourceStartSec, drawEndSec, opts.pxPerSecond, color);
    }

    playhead.style.height = `${layout.h}px`;
    playhead.style.transform = `translateX(${layout.x + view.playheadPx}px)`;
  };

  const loop = (): void => {
    drawFrame();
    if (!audio.paused && !audio.ended) {
      rafId = requestAnimationFrame(loop);
    } else {
      rafId = 0;
    }
  };

  const startLoop = (): void => {
    if (rafId === 0 && visible) rafId = requestAnimationFrame(loop);
  };

  const stopLoop = (): void => {
    if (rafId !== 0) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };

  const ensureLoaded = async (): Promise<void> => {
    if (raster || loading || !url) return;
    loading = true;
    root.dataset.state = "loading";
    try {
      raster = await fetchRaster(url);
      offscreen = renderRasterToOffscreen(raster, colormap);
      root.dataset.state = "ready";
      applySize();
    } catch (err) {
      root.dataset.state = "error";
      canvas.style.display = "none";
      playhead.style.display = "none";
      console.warn(`[spectrogram] ${name}:`, err);
    } finally {
      loading = false;
    }
  };

  const recolor = (next: ColormapName): void => {
    colormap = next;
    if (raster) {
      offscreen = renderRasterToOffscreen(raster, colormap);
      drawFrame();
    }
  };

  // Lazy laden: beim Sichtbarwerden bzw. spätestens beim ersten Play.
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        visible = entry.isIntersecting;
        if (visible) {
          void ensureLoaded();
          if (!audio.paused) startLoop();
        } else {
          stopLoop(); // offscreen: rAF auch während Wiedergabe pausieren
        }
      }
    },
    { rootMargin: "100px" },
  );
  io.observe(root);

  audio.addEventListener("play", () => {
    void ensureLoaded().then(startLoop);
    startLoop();
  });
  audio.addEventListener("pause", () => {
    stopLoop();
    drawFrame();
  });
  audio.addEventListener("ended", () => {
    stopLoop();
    drawFrame();
  });
  audio.addEventListener("seeked", drawFrame);
  audio.addEventListener("loadedmetadata", applySize);

  // Auf Container-Breite reagieren (root = Figure in voller Breite). Das Begrenzen
  // der Viewport-Breite ändert die Figure-Breite nicht -> keine Endlosschleife.
  const resizeObserver = new ResizeObserver(applySize);
  resizeObserver.observe(root);

  const themeObserver = new MutationObserver(drawFrame);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  onColormapChange(recolor);
}

let initialized = false;
export function initFileSpectrograms(): void {
  if (initialized) return;
  initialized = true;
  const run = () => {
    document.querySelectorAll<HTMLElement>("[data-spectrogram-file]").forEach(setupInstance);
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
}
