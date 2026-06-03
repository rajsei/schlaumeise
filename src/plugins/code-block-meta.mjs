export function splitMetaTokens(rawMeta = "") {
  const tokens = [];
  let current = "";
  let quote = "";
  let braceDepth = 0;

  for (const char of rawMeta) {
    if (quote) {
      current += char;
      if (char === quote) {
        quote = "";
      }
      continue;
    }

    if (char === '"' || char === "'") {
      current += char;
      quote = char;
      continue;
    }

    if (char === "{") {
      current += char;
      braceDepth += 1;
      continue;
    }

    if (char === "}" && braceDepth > 0) {
      current += char;
      braceDepth -= 1;
      continue;
    }

    if (/\s/.test(char) && braceDepth === 0) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    current += char;
  }

  if (current) {
    tokens.push(current);
  }

  return tokens;
}

function stripWrapping(value = "") {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith("{") && trimmed.endsWith("}"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

export function parseMetaString(rawMeta = "") {
  const tokens = splitMetaTokens(rawMeta);
  const flags = new Set();
  const values = new Map();
  const bareRanges = [];

  for (const token of tokens) {
    if (!token) {
      continue;
    }

    if (token.startsWith("{") && token.endsWith("}")) {
      const range = stripWrapping(token);
      if (range) {
        bareRanges.push(range);
      }
      continue;
    }

    const separator = token.indexOf("=");
    if (separator > 0) {
      const key = token.slice(0, separator).trim();
      const rawValue = token.slice(separator + 1);
      if (!key) {
        continue;
      }
      values.set(key, stripWrapping(rawValue));
      continue;
    }

    flags.add(token.trim());
  }

  return {
    raw: rawMeta,
    tokens,
    flags,
    values,
    bareRanges,
  };
}

function firstValue(meta, keys) {
  for (const key of keys) {
    if (meta.values.has(key)) {
      return meta.values.get(key);
    }
  }
  return undefined;
}

function toBoolean(value) {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on") {
    return true;
  }

  if (normalized === "false" || normalized === "0" || normalized === "no" || normalized === "off") {
    return false;
  }

  return undefined;
}

export function parseLineSelection(input) {
  if (typeof input !== "string") {
    return [];
  }

  const selected = new Set();

  for (const piece of input.split(",")) {
    const fragment = piece.trim();
    if (!fragment) {
      continue;
    }

    if (fragment.includes("-")) {
      const [startRaw, endRaw] = fragment.split("-", 2);
      const start = Number.parseInt(startRaw, 10);
      const end = Number.parseInt(endRaw, 10);

      if (Number.isNaN(start) || Number.isNaN(end)) {
        continue;
      }

      const from = Math.max(1, Math.min(start, end));
      const to = Math.max(1, Math.max(start, end));

      for (let line = from; line <= to; line += 1) {
        selected.add(line);
      }

      continue;
    }

    const value = Number.parseInt(fragment, 10);
    if (!Number.isNaN(value) && value > 0) {
      selected.add(value);
    }
  }

  return [...selected].sort((left, right) => left - right);
}

export function parseCodeMeta(rawMeta = "") {
  const meta = parseMetaString(rawMeta);

  const title = firstValue(meta, ["title", "file", "filename"]);

  const copyToggle = toBoolean(firstValue(meta, ["copy"]));
  const wrapToggle = toBoolean(firstValue(meta, ["wrap"]));
  const lineToggle = toBoolean(firstValue(meta, ["showLineNumbers", "lineNumbers"]));

  const copy = meta.flags.has("nocopy")
    ? false
    : meta.flags.has("copy")
      ? true
      : copyToggle ?? true;

  const wrap = meta.flags.has("nowrap")
    ? false
    : meta.flags.has("wrap")
      ? true
      : wrapToggle ?? false;

  const showLineNumbers = meta.flags.has("showLineNumbers") || meta.flags.has("lineNumbers")
    ? true
    : meta.flags.has("noLineNumbers")
      ? false
      : lineToggle ?? false;

  const highlightSource = firstValue(meta, ["highlight", "mark", "lines"])
    ?? meta.bareRanges[0]
    ?? "";

  return {
    raw: rawMeta,
    title,
    copy,
    wrap,
    showLineNumbers,
    highlightLines: parseLineSelection(highlightSource),
    options: meta,
  };
}
