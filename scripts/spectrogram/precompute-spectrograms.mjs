// @ts-check
/**
 * Build-Vorberechnung der Datei-Spektrogramme (läuft in Node, vor `astro build`/`astro dev`).
 *
 * MP3 -> PCM (mono) -> STFT -> dB-Raster (.spec) in src/assets/audio/spectrograms/.
 * Pro Datei per Inhalts-Hash gecacht (Manifest), unveränderte Audios werden übersprungen.
 *
 * Decoder (in dieser Reihenfolge):
 *   1) mpg123-decoder (npm devDependency) — Auslieferungsweg
 *   2) ffmpeg-CLI     — Fallback (CI/Dev), falls vorhanden
 *   3) keiner         -> Warnung + sauberes Überspringen (Build bleibt grün; der Client
 *                        zeigt dann nur das <audio> ohne Spektrogramm)
 */

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { computeSpectrogram, writeRasterBuffer } from "./spectrogram-core.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..");
const AUDIO_DIR = join(ROOT, "src", "assets", "audio");
const OUT_DIR = join(AUDIO_DIR, "spectrograms");
const MANIFEST = join(OUT_DIR, ".manifest.json");

// STFT-Optionen — Teil des Cache-Hashes (Änderung invalidiert alle Raster).
const OPTS = {
  fftSize: 2048,
  hopSize: 1024,
  maxFrequency: 20000,
  maxBins: 512,
  dynamicRangeDb: 80,
};
const OPTS_VERSION = createHash("md5").update(JSON.stringify(OPTS)).digest("hex").slice(0, 8);

/** @returns {Promise<((bytes: Uint8Array) => Promise<{pcm: Float32Array, sampleRate: number}>) | null>} */
async function resolveDecoder() {
  // 1) mpg123-decoder
  try {
    const { MPEGDecoder } = await import("mpg123-decoder");
    return async (bytes) => {
      const decoder = new MPEGDecoder();
      await decoder.ready;
      const { channelData, sampleRate } = decoder.decode(bytes);
      decoder.free();
      return { pcm: toMono(channelData), sampleRate };
    };
  } catch {
    /* nicht installiert -> nächster Versuch */
  }

  // 2) ffmpeg-Fallback
  const probe = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
  if (!probe.error && probe.status === 0) {
    const SR = 44100;
    return async (bytes) => {
      const res = spawnSync(
        "ffmpeg",
        ["-v", "quiet", "-i", "pipe:0", "-ac", "1", "-ar", String(SR), "-f", "f32le", "pipe:1"],
        { input: Buffer.from(bytes), maxBuffer: 1024 * 1024 * 512 },
      );
      if (res.status !== 0 || !res.stdout) {
        throw new Error("ffmpeg-Dekodierung fehlgeschlagen");
      }
      const out = res.stdout;
      const pcm = new Float32Array(out.buffer, out.byteOffset, Math.floor(out.byteLength / 4));
      return { pcm: Float32Array.from(pcm), sampleRate: SR };
    };
  }

  return null;
}

/** Mischt Mehrkanal-PCM zu Mono. @param {Float32Array[]} channels */
function toMono(channels) {
  if (channels.length === 1) return channels[0];
  const len = channels[0].length;
  const mono = new Float32Array(len);
  for (let c = 0; c < channels.length; c++) {
    const ch = channels[c];
    for (let i = 0; i < len; i++) mono[i] += ch[i];
  }
  for (let i = 0; i < len; i++) mono[i] /= channels.length;
  return mono;
}

function loadManifest() {
  if (!existsSync(MANIFEST)) return {};
  try {
    return JSON.parse(readFileSync(MANIFEST, "utf-8"));
  } catch {
    return {};
  }
}

async function main() {
  if (!existsSync(AUDIO_DIR)) {
    console.warn("[spectrogram] Kein Audio-Verzeichnis gefunden — übersprungen.");
    return;
  }
  const mp3s = readdirSync(AUDIO_DIR).filter((f) => f.toLowerCase().endsWith(".mp3"));
  if (mp3s.length === 0) return;

  mkdirSync(OUT_DIR, { recursive: true });
  const manifest = loadManifest();

  // Welche Dateien müssen (neu) berechnet werden?
  const pending = [];
  for (const file of mp3s) {
    const name = file.replace(/\.mp3$/i, "");
    const bytes = readFileSync(join(AUDIO_DIR, file));
    const hash = createHash("md5").update(bytes).update(OPTS_VERSION).digest("hex");
    const specPath = join(OUT_DIR, `${name}.spec`);
    if (manifest[name]?.hash === hash && existsSync(specPath)) continue;
    pending.push({ name, bytes, hash, specPath });
  }

  if (pending.length === 0) {
    console.log(`[spectrogram] ${mp3s.length} Raster aktuell — nichts zu tun.`);
    return;
  }

  const decode = await resolveDecoder();
  if (!decode) {
    console.warn(
      "[spectrogram] Kein MP3-Decoder verfügbar (mpg123-decoder nicht installiert, ffmpeg fehlt). " +
        "Datei-Spektrogramme werden NICHT vorberechnet; das <audio> funktioniert weiter. " +
        "Zum Erzeugen: `npm install` (mpg123-decoder) oder ffmpeg installieren.",
    );
    return;
  }

  for (const { name, bytes, hash, specPath } of pending) {
    try {
      const { pcm, sampleRate } = await decode(bytes);
      const { header, data } = computeSpectrogram(pcm, sampleRate, OPTS);
      writeFileSync(specPath, writeRasterBuffer(header, data));
      manifest[name] = { hash, frames: header.frames, bins: header.bins };
      console.log(`[spectrogram] ${name} -> ${header.frames}×${header.bins} (${(data.length / 1024).toFixed(0)} KB)`);
    } catch (err) {
      console.warn(`[spectrogram] ${name} übersprungen: ${err instanceof Error ? err.message : err}`);
    }
  }

  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
  console.log(`[spectrogram] Fertig: ${pending.length} verarbeitet.`);
}

main().catch((err) => {
  // Build niemals wegen Spektrogrammen abbrechen.
  console.warn(`[spectrogram] Unerwarteter Fehler, übersprungen: ${err instanceof Error ? err.message : err}`);
});
