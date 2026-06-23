// Guard gegen hardcodierte Farben (siehe docs/semantic-tokens-plan.md, Abschnitt 6).
//
// Scannt Komponenten + docs.css auf nicht-semantische Farbquellen und schlaegt an,
// damit sich keine rohen Farben zurueck in den Code schleichen. Quelle der Tokens
// (src/styles/global.css) ist bewusst ausgenommen — dort *duerfen* Hex/rgb/Palette stehen.
//
// Ausnahme pro Zeile: Kommentar `color-guard-ignore` in der Zeile -> wird uebersprungen.
//
// Aufruf: `node scripts/check-hardcoded-colors.mjs` (npm run lint:colors).
// Exit-Code 1 bei Verstoessen, sonst 0.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(import.meta.url), "..", "..");
const SCAN_DIRS = ["src/components", "src/layouts", "src/pages"];
const EXTRA_FILES = ["src/styles/docs.css"];
const SCAN_EXT = new Set([".astro", ".css"]);
// Quell-Definitionen der Tokens — hier sind Rohwerte erlaubt:
const IGNORE_FILES = new Set(["src/styles/global.css"].map((p) => p.split("/").join(sep)));
const IGNORE_MARKER = "color-guard-ignore";

const RULES = [
  { name: "Hex-Literal", re: /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b/ },
  { name: "rgb/hsl-Literal", re: /\b(?:rgba?|hsla?)\(/ },
  { name: "rohe Palette", re: /var\(\s*--palette-/ },
  { name: "rohes daisyUI base-*", re: /var\(\s*--color-base-/ },
];

function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (SCAN_EXT.has(entry.slice(entry.lastIndexOf(".")))) out.push(full);
  }
  return out;
}

const files = [
  ...SCAN_DIRS.flatMap((d) => walk(join(root, d))),
  ...EXTRA_FILES.map((f) => join(root, f.split("/").join(sep))),
];

const violations = [];
for (const file of files) {
  const rel = relative(root, file);
  if (IGNORE_FILES.has(rel)) continue;
  let lines;
  try {
    lines = readFileSync(file, "utf8").split(/\r?\n/);
  } catch {
    continue;
  }
  lines.forEach((line, i) => {
    if (line.includes(IGNORE_MARKER)) return;
    for (const rule of RULES) {
      if (rule.re.test(line)) {
        violations.push({ rel, line: i + 1, rule: rule.name, text: line.trim() });
        break;
      }
    }
  });
}

if (violations.length > 0) {
  console.error(`\n✗ Hardcodierte Farben gefunden (${violations.length}):\n`);
  for (const v of violations) {
    console.error(`  ${v.rel}:${v.line}  [${v.rule}]\n      ${v.text}`);
  }
  console.error(
    `\nNutze semantische Tokens aus src/styles/global.css ` +
      `(--surface-*, --text-*, --accent-*, --border-*, --scrim-* …).\n` +
      `Begruendete Ausnahme: Kommentar "${IGNORE_MARKER}" in die Zeile setzen.\n`,
  );
  process.exit(1);
}

console.log(`✓ Keine hardcodierten Farben in ${files.length} Dateien.`);
