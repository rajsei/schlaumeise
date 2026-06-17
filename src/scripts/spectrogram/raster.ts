/**
 * Liest das vorberechnete .spec-Rasterformat im Browser.
 * Format identisch zu scripts/spectrogram/spectrogram-core.mjs (writeRasterBuffer).
 */
import type { RasterHeader, SpectrogramRaster } from "../../types/spectrogram";

const MAGIC = "SPEC";

/** Parst einen geladenen .spec-ArrayBuffer in Header + Uint8-Daten. */
export function parseRaster(buffer: ArrayBuffer): SpectrogramRaster {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  const magic = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  if (magic !== MAGIC) {
    throw new Error(`Ungültiges Spektrogramm-Raster (Magic: ${magic}).`);
  }

  const headerLen = view.getUint32(4, true);
  const headerJson = new TextDecoder().decode(bytes.subarray(8, 8 + headerLen));
  const header = JSON.parse(headerJson) as RasterHeader;

  const data = bytes.subarray(8 + headerLen);
  return { header, data };
}

/** Lädt und parst ein Raster von einer URL. */
export async function fetchRaster(url: string): Promise<SpectrogramRaster> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Raster konnte nicht geladen werden: ${res.status}`);
  }
  return parseRaster(await res.arrayBuffer());
}
