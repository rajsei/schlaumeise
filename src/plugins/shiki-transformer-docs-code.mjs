import { parseCodeMeta } from "./code-block-meta.mjs";

function normalizeMeta(rawMeta) {
  if (!rawMeta) {
    return "";
  }

  if (typeof rawMeta === "string") {
    return rawMeta;
  }

  if (typeof rawMeta === "object" && typeof rawMeta.__raw === "string") {
    return rawMeta.__raw;
  }

  return "";
}

function toClassList(value) {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  if (typeof value === "string") {
    return value.split(/\s+/).filter(Boolean);
  }

  return [];
}

function setClasses(node, extraClasses) {
  const current = toClassList(node.properties?.class);
  const next = [...new Set([...current, ...extraClasses.filter(Boolean)])];

  if (!node.properties) {
    node.properties = {};
  }

  if (next.length > 0) {
    node.properties.class = next;
  }
}

function setData(node, name, value) {
  if (!node.properties) {
    node.properties = {};
  }

  if (value === undefined || value === null || value === "") {
    return;
  }

  node.properties[name] = String(value);
}

function getLanguage(options) {
  if (!options || typeof options !== "object") {
    return "";
  }

  if (typeof options.lang === "string") {
    return options.lang;
  }

  if (Array.isArray(options.lang) && typeof options.lang[0] === "string") {
    return options.lang[0];
  }

  return "";
}

export function createDocsCodeTransformer() {
  return {
    name: "docs-code-meta-transformer",
    pre(node) {
      const rawMeta = normalizeMeta(this.options?.meta);
      const parsed = parseCodeMeta(rawMeta);
      const language = getLanguage(this.options);

      setClasses(node, ["docs-code-pre"]);
      setData(node, "data-code-lang", language);
      setData(node, "data-code-copy", parsed.copy ? "true" : "false");
      setData(node, "data-code-wrap", parsed.wrap ? "true" : "false");
      setData(node, "data-code-line-numbers", parsed.showLineNumbers ? "true" : "false");
      setData(node, "data-code-meta", parsed.raw);
      setData(node, "data-code-title", parsed.title);

      if (parsed.wrap) {
        setClasses(node, ["is-wrap"]);
      }

      if (parsed.showLineNumbers) {
        setClasses(node, ["has-line-numbers"]);
      }

      if (parsed.highlightLines.length > 0) {
        setData(node, "data-code-highlight", parsed.highlightLines.join(","));
      }
    },
    line(node, lineNumber) {
      const rawMeta = normalizeMeta(this.options?.meta);
      const parsed = parseCodeMeta(rawMeta);

      if (parsed.showLineNumbers) {
        setData(node, "data-line", lineNumber);
      }

      if (parsed.highlightLines.includes(lineNumber)) {
        setClasses(node, ["is-highlighted"]);
      }
    },
  };
}
