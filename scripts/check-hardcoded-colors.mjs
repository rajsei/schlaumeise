// Guard gegen hardcodierte Design-Werte (siehe AGENTS.md "Styling- & Token-Regeln",
// docs/semantic-tokens-plan.md). Scannt Komponenten + docs.css und schlaegt an, wenn
// rohe Werte statt Tokens aus src/styles/global.css verwendet werden — fuer Farben,
// Abstaende, Radien, Schriftgroessen/-gewichte und line-height.
//
// global.css ist die Token-Quelle und bewusst ausgenommen (dort *duerfen* Rohwerte stehen).
// Begruendete Ausnahme pro Zeile: Kommentar `color-guard-ignore` ODER `bespoke` in der Zeile.
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
const IGNORE_MARKERS = ["color-guard-ignore", "bespoke"];

// Lookbehind (?<![\w-]) verhindert Treffer in Custom-Property-Namen (z. B. --toc-level-gap).
const SPACING_PROP =
  "(?:padding|margin|gap|row-gap|column-gap)(?:-(?:top|right|bottom|left|block|inline|block-start|block-end|inline-start|inline-end))?";

const RULES = [
  { name: "Hex-Literal", re: /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b/ },
  { name: "rgb/hsl-Literal", re: /\b(?:rgba?|hsla?)\(/ },
  { name: "rohe Palette", re: /var\(\s*--palette-/ },
  { name: "rohes daisyUI base-*", re: /var\(\s*--color-base-/ },
  { name: "rohes Spacing (rem/px)", re: new RegExp(`(?<![\\w-])${SPACING_PROP}\\s*:\\s*[^;{]*?\\d*\\.?\\d+(?:rem|px|em)`) },
  { name: "roher Radius (rem/px)", re: /(?<![\w-])border-radius\s*:\s*[^;{]*?\d*\.?\d+(?:rem|px)/ },
  { name: "rohe font-size (rem/px)", re: /(?<![\w-])font-size\s*:\s*[^;{]*?\d*\.?\d+(?:rem|px)/ },
  { name: "rohes font-weight (numerisch)", re: /(?<![\w-])font-weight\s*:\s*\d{2,3}\b/ },
  { name: "rohe line-height (dezimal)", re: /(?<![\w-])line-height\s*:\s*\d*\.\d+/ },
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
    if (IGNORE_MARKERS.some((m) => line.includes(m))) return;
    for (const rule of RULES) {
      if (rule.re.test(line)) {
        violations.push({ rel, line: i + 1, rule: rule.name, text: line.trim() });
        break;
      }
    }
  });
}

if (violations.length > 0) {
  console.error(`\n✗ Hardcodierte Design-Werte gefunden (${violations.length}):\n`);
  for (const v of violations) {
    console.error(`  ${v.rel}:${v.line}  [${v.rule}]\n      ${v.text}`);
  }
  console.error(
    `\nNutze Tokens aus src/styles/global.css: Farben --color-*, Abstaende --spacing-*,\n` +
      `Radien --radius-*, Schrift --font-size-*/--font-weight-*/--line-height*.\n` +
      `Begruendete Ausnahme: Kommentar "color-guard-ignore" oder "bespoke" in die Zeile.\n`,
  );
  process.exit(1);
}

console.log(`✓ Keine hardcodierten Design-Werte in ${files.length} Dateien.`);
