// @ts-check
/**
 * Build-seitiger Spektrogramm-Kern (läuft in Node, NICHT im Client-Bundle).
 *
 * Enthält:
 *  - Radix-2-FFT (iterativ, in-place) + STFT
 *  - computeSpectrogram(): PCM (mono Float32) -> dB-Raster (Uint8) + Header
 *  - writeRasterBuffer()/readRasterBuffer(): .spec-Binärformat
 *
 * Das .spec-Format:
 *   bytes 0..3   : Magic "SPEC"
 *   bytes 4..7   : uint32 LE  headerLen
 *   bytes 8..    : JSON-Header (UTF-8), Länge headerLen
 *   danach       : frames*bins Uint8, FRAME-major (Frame f, Bin b -> f*bins + b)
 *
 * Der Client liest exakt dieses Format in src/scripts/spectrogram/raster.ts.
 */

const MAGIC = "SPEC";

/**
 * In-place iterative Radix-2 FFT.
 * @param {Float64Array} re Realteil (Länge n = Zweierpotenz)
 * @param {Float64Array} im Imaginärteil (Länge n)
 */
export function fftInPlace(re, im) {
  const n = re.length;
  if (n <= 1) return;
  if ((n & (n - 1)) !== 0) {
    throw new Error(`FFT-Länge muss Zweierpotenz sein, war ${n}`);
  }

  // Bit-Reversal-Permutation
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) {
      j ^= bit;
    }
    j ^= bit;
    if (i < j) {
      const tr = re[i];
      re[i] = re[j];
      re[j] = tr;
      const ti = im[i];
      im[i] = im[j];
      im[j] = ti;
    }
  }

  // Butterflies
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wRe = Math.cos(ang);
    const wIm = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let curRe = 1;
      let curIm = 0;
      for (let k = 0; k < len / 2; k++) {
        const aRe = re[i + k];
        const aIm = im[i + k];
        const bRe = re[i + k + len / 2];
        const bIm = im[i + k + len / 2];
        const tRe = bRe * curRe - bIm * curIm;
        const tIm = bRe * curIm + bIm * curRe;
        re[i + k] = aRe + tRe;
        im[i + k] = aIm + tIm;
        re[i + k + len / 2] = aRe - tRe;
        im[i + k + len / 2] = aIm - tIm;
        const nextRe = curRe * wRe - curIm * wIm;
        curIm = curRe * wIm + curIm * wRe;
        curRe = nextRe;
      }
    }
  }
}

/** Hann-Fensterkoeffizienten (gecacht). @type {Map<number, Float64Array>} */
const hannCache = new Map();
function hannWindow(size) {
  let w = hannCache.get(size);
  if (!w) {
    w = new Float64Array(size);
    for (let i = 0; i < size; i++) {
      w[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (size - 1));
    }
    hannCache.set(size, w);
  }
  return w;
}

/**
 * Berechnet ein dB-Raster aus mono-PCM.
 * @param {Float32Array} pcm
 * @param {number} sampleRate
 * @param {object} [opts]
 * @param {number} [opts.fftSize=2048]
 * @param {number} [opts.hopSize=1024]
 * @param {number} [opts.maxFrequency=20000]
 * @param {number} [opts.maxBins=512]   // Frequenzauflösung deckeln (Payload)
 * @param {number} [opts.dynamicRangeDb=80]
 * @returns {{ header: object, data: Uint8Array }}
 */
export function computeSpectrogram(pcm, sampleRate, opts = {}) {
  const fftSize = opts.fftSize ?? 2048;
  const hopSize = opts.hopSize ?? 1024;
  const maxFrequency = opts.maxFrequency ?? 20000;
  const maxBins = opts.maxBins ?? 512;
  const dynamicRangeDb = opts.dynamicRangeDb ?? 80;

  const win = hannWindow(fftSize);
  const nyquistBins = fftSize / 2;
  // Bins bis maxFrequency
  const freqPerBin = sampleRate / fftSize;
  const usableBins = Math.min(nyquistBins, Math.ceil(maxFrequency / freqPerBin));
  // Auf maxBins herunterskalieren (Mittelung von je `group` Quellbins)
  const group = Math.max(1, Math.ceil(usableBins / maxBins));
  const bins = Math.ceil(usableBins / group);
  const effectiveMaxFreq = usableBins * freqPerBin;

  const frames = pcm.length >= fftSize
    ? 1 + Math.floor((pcm.length - fftSize) / hopSize)
    : 0;

  // dB pro Frame/Bin in Float, danach quantisieren
  const dbData = new Float32Array(frames * bins);
  const re = new Float64Array(fftSize);
  const im = new Float64Array(fftSize);
  let globalMaxDb = -Infinity;

  for (let f = 0; f < frames; f++) {
    const start = f * hopSize;
    for (let i = 0; i < fftSize; i++) {
      re[i] = pcm[start + i] * win[i];
      im[i] = 0;
    }
    fftInPlace(re, im);

    for (let b = 0; b < bins; b++) {
      const srcStart = b * group;
      const srcEnd = Math.min(usableBins, srcStart + group);
      let mag = 0;
      for (let s = srcStart; s < srcEnd; s++) {
        mag += Math.hypot(re[s], im[s]);
      }
      mag /= srcEnd - srcStart || 1;
      // Normierung auf fftSize
      const db = 20 * Math.log10(mag / (fftSize / 2) + 1e-9);
      dbData[f * bins + b] = db;
      if (db > globalMaxDb) globalMaxDb = db;
    }
  }

  const dbMax = Number.isFinite(globalMaxDb) ? globalMaxDb : 0;
  const dbMin = dbMax - dynamicRangeDb;
  const span = dbMax - dbMin || 1;

  const data = new Uint8Array(frames * bins);
  for (let i = 0; i < dbData.length; i++) {
    const norm = (dbData[i] - dbMin) / span;
    data[i] = Math.max(0, Math.min(255, Math.round(norm * 255)));
  }

  const header = {
    version: 1,
    sampleRate,
    fftSize,
    hopSize,
    frames,
    bins,
    minFreq: 0,
    maxFreq: effectiveMaxFreq,
    dbMin,
    dbMax,
    duration: pcm.length / sampleRate,
  };

  return { header, data };
}

/**
 * Serialisiert Header + Raster ins .spec-Binärformat.
 * @param {object} header
 * @param {Uint8Array} data
 * @returns {Buffer}
 */
export function writeRasterBuffer(header, data) {
  const json = Buffer.from(JSON.stringify(header), "utf-8");
  const out = Buffer.alloc(4 + 4 + json.length + data.length);
  out.write(MAGIC, 0, "ascii");
  out.writeUInt32LE(json.length, 4);
  json.copy(out, 8);
  Buffer.from(data.buffer, data.byteOffset, data.byteLength).copy(out, 8 + json.length);
  return out;
}

/**
 * Liest das .spec-Format (für Tests / Verifikation in Node).
 * @param {Buffer} buf
 * @returns {{ header: any, data: Uint8Array }}
 */
export function readRasterBuffer(buf) {
  const magic = buf.toString("ascii", 0, 4);
  if (magic !== MAGIC) throw new Error(`Ungültiges Magic: ${magic}`);
  const headerLen = buf.readUInt32LE(4);
  const header = JSON.parse(buf.toString("utf-8", 8, 8 + headerLen));
  const data = new Uint8Array(buf.subarray(8 + headerLen));
  return { header, data };
}
