/**
 * Live-Modus: Mikrofon-Spektrogramm in einem festen, zeitbasiert scrollenden
 * Fenster (Default 5 s). Start/Stop per Button; beim Stop friert das Bild ein.
 *
 * Selbst-initialisierend über `[data-spectrogram-mic]`.
 */
import type { ColormapName } from "../../types/spectrogram";
import type { AxisLabels } from "./axes";
import { clearGutters, drawFrequencyAxis, drawTimeAxisLive } from "./axes";
import { computeLayout, createOffscreen, setupCanvas, writeColumn, type PlotLayout } from "./core";
import { DEFAULT_COLORMAP } from "./config";
import { getColormap, onColormapChange } from "./settings";

interface MicLabels extends AxisLabels {
  start: string;
  stop: string;
  error: string;
}

function setupInstance(root: HTMLElement): void {
  const canvas = root.querySelector<HTMLCanvasElement>(".spectrogram-canvas");
  const button = root.querySelector<HTMLButtonElement>(".spectrogram-mic-toggle");
  const status = root.querySelector<HTMLElement>(".spectrogram-mic-status");
  if (!canvas || !button) return;

  const windowSeconds = Number(root.dataset.windowSeconds) || 5;
  const minFrequency = Number(root.dataset.minFrequency) || 0;
  const maxFrequency = Number(root.dataset.maxFrequency) || 20000;
  const showAxes = root.dataset.showAxes !== "false";
  const labels: MicLabels = {
    frequency: root.dataset.labelFrequency || "kHz",
    seconds: root.dataset.labelSeconds || "s",
    start: root.dataset.labelStart || "Aufnahme starten",
    stop: root.dataset.labelStop || "Aufnahme stoppen",
    error: root.dataset.labelError || "Kein Mikrofonzugriff",
  };

  let colormap: ColormapName = getColormap() || (root.dataset.colormap as ColormapName) || DEFAULT_COLORMAP;

  let setup = setupCanvas(canvas);
  let layout: PlotLayout = computeLayout(setup.cssWidth, setup.cssHeight, showAxes);

  let audioCtx: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let stream: MediaStream | null = null;
  let source: MediaStreamAudioSourceNode | null = null;
  let freqData: Uint8Array<ArrayBuffer> | null = null;
  let scrollBuffer: HTMLCanvasElement | null = null;
  let columnCanvas: HTMLCanvasElement | null = null;
  let startBin = 0;
  let bins = 0;
  let rafId = 0;
  let lastTime = 0;
  let scrollAcc = 0;
  let running = false;

  const axisColor = () =>
    getComputedStyle(canvas).color ||
    getComputedStyle(canvas).getPropertyValue("--spec-axis").trim();

  const buildBuffers = (): void => {
    setup = setupCanvas(canvas);
    layout = computeLayout(setup.cssWidth, setup.cssHeight, showAxes);
    if (!analyser || !audioCtx) return;
    const freqPerBin = audioCtx.sampleRate / analyser.fftSize;
    startBin = Math.floor(minFrequency / freqPerBin);
    const endBin = Math.min(analyser.frequencyBinCount, Math.ceil(maxFrequency / freqPerBin));
    bins = Math.max(1, endBin - startBin);
    scrollBuffer = createOffscreen(Math.ceil(layout.w), bins);
    columnCanvas = createOffscreen(1, bins);
    freqData = new Uint8Array(analyser.frequencyBinCount);
  };

  const drawAxes = (): void => {
    if (!showAxes) return;
    const color = axisColor();
    clearGutters(setup.ctx, layout, setup.cssWidth, setup.cssHeight);
    drawFrequencyAxis(setup.ctx, layout, minFrequency, maxFrequency, labels);
    drawTimeAxisLive(setup.ctx, layout, windowSeconds, color, labels);
  };

  const loop = (): void => {
    if (!running || !analyser || !freqData || !scrollBuffer || !columnCanvas) return;
    const now = performance.now();
    const dt = lastTime ? (now - lastTime) / 1000 : 0;
    lastTime = now;

    const pxPerSecond = layout.w / windowSeconds;
    scrollAcc += dt * pxPerSecond;
    const intPx = Math.floor(scrollAcc);

    analyser.getByteFrequencyData(freqData);

    const W = scrollBuffer.width;
    const H = scrollBuffer.height;
    const bctx = scrollBuffer.getContext("2d")!;

    if (intPx > 0) {
      scrollAcc -= intPx;
      const shift = Math.min(intPx, W);
      // bestehenden Inhalt nach links schieben
      bctx.drawImage(scrollBuffer, shift, 0, W - shift, H, 0, 0, W - shift, H);
      // neue Spalte(n) rechts einfügen
      writeColumn(columnCanvas, freqData.subarray(startBin, startBin + bins), colormap);
      bctx.drawImage(columnCanvas, 0, 0, 1, H, W - shift, 0, shift, H);
    }

    // Sichtbar machen (auf Plothöhe skaliert)
    const { ctx } = setup;
    ctx.clearRect(layout.x, layout.y, layout.w, layout.h);
    ctx.drawImage(scrollBuffer, 0, 0, W, H, layout.x, layout.y, layout.w, layout.h);
    drawAxes();

    rafId = requestAnimationFrame(loop);
  };

  const start = async (): Promise<void> => {
    if (running) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      if (status) status.textContent = labels.error;
      return;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      if (status) status.textContent = labels.error;
      root.dataset.state = "error";
      return;
    }
    audioCtx = new AudioContext();
    await audioCtx.resume();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0;
    source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser); // bewusst NICHT mit destination (keine Rückkopplung)

    buildBuffers();
    running = true;
    lastTime = 0;
    scrollAcc = 0;
    root.dataset.state = "running";
    button.textContent = labels.stop;
    button.setAttribute("aria-pressed", "true");
    if (status) status.textContent = "";
    rafId = requestAnimationFrame(loop);
  };

  const stop = (): void => {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    source?.disconnect();
    stream?.getTracks().forEach((track) => track.stop());
    void audioCtx?.close();
    audioCtx = null;
    analyser = null;
    stream = null;
    source = null;
    root.dataset.state = "stopped";
    button.textContent = labels.start;
    button.setAttribute("aria-pressed", "false");
    // letztes Bild bleibt eingefroren stehen
  };

  button.addEventListener("click", () => {
    if (running) stop();
    else void start();
  });

  const resizeObserver = new ResizeObserver(() => {
    if (running) buildBuffers();
    else {
      setup = setupCanvas(canvas);
      layout = computeLayout(setup.cssWidth, setup.cssHeight, showAxes);
      drawAxes();
    }
  });
  resizeObserver.observe(canvas);

  const themeObserver = new MutationObserver(drawAxes);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  onColormapChange((next) => {
    colormap = next;
  });

  // Initialer Achsenrahmen
  drawAxes();
}

let initialized = false;
export function initMicSpectrograms(): void {
  if (initialized) return;
  initialized = true;
  const run = () => {
    document.querySelectorAll<HTMLElement>("[data-spectrogram-mic]").forEach(setupInstance);
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
}
