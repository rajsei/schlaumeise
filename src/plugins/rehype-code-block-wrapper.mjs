import { visit } from "unist-util-visit";

function toClassList(value) {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  if (typeof value === "string") {
    return value.split(/\s+/).filter(Boolean);
  }

  return [];
}

function hasClass(node, className) {
  const classes = toClassList(node?.properties?.class || node?.properties?.className);
  return classes.includes(className);
}

function addClass(node, className) {
  const current = toClassList(node?.properties?.class || node?.properties?.className);
  const next = [...new Set([...current, className])];

  if (!node.properties) {
    node.properties = {};
  }

  node.properties.class = next;
}

function createElement(tagName, properties = {}, children = []) {
  return {
    type: "element",
    tagName,
    properties,
    children,
  };
}

function createText(value) {
  return {
    type: "text",
    value,
  };
}

function extractText(node) {
  if (!node) {
    return "";
  }

  if (node.type === "text") {
    return node.value ?? "";
  }

  if (!Array.isArray(node.children)) {
    return "";
  }

  return node.children.map((child) => extractText(child)).join("");
}

function normalizeValue(value) {
  if (Array.isArray(value)) {
    return value.join(" ").trim();
  }

  if (typeof value === "string") {
    return value.trim();
  }

  return "";
}

function extractLanguage(preNode) {
  const explicit = normalizeValue(preNode?.properties?.["data-code-lang"]);
  if (explicit) {
    return explicit;
  }

  const classes = toClassList(preNode?.properties?.class || preNode?.properties?.className);
  const langClass = classes.find((entry) => entry.startsWith("language-"));
  if (!langClass) {
    return "";
  }

  return langClass.slice("language-".length);
}

function formatLanguage(language) {
  if (!language) {
    return "";
  }

  const aliases = {
    js: "JavaScript",
    ts: "TypeScript",
    sh: "Shell",
    bash: "Bash",
    yml: "YAML",
    md: "Markdown",
    html: "HTML",
    css: "CSS",
    json: "JSON",
    py: "Python",
    plaintext: "Text",
    text: "Text",
  };

  const key = language.toLowerCase();
  if (aliases[key]) {
    return aliases[key];
  }

  return language.toUpperCase() === language
    ? language
    : language.charAt(0).toUpperCase() + language.slice(1);
}

function shouldShowHeader(title, language) {
  if (title) {
    return true;
  }

  if (!language) {
    return false;
  }

  const neutral = new Set(["text", "plaintext", "txt", "console"]);
  return !neutral.has(language.toLowerCase());
}

export function rehypeCodeBlockWrapper() {
  return (tree) => {
    visit(tree, "element", (node, index, parent) => {
      if (!parent || typeof index !== "number") {
        return;
      }

      if (node.tagName !== "pre") {
        return;
      }

      if (!hasClass(node, "astro-code") && !hasClass(node, "shiki") && !hasClass(node, "docs-code-pre")) {
        return;
      }

      if (parent.tagName === "figure" && hasClass(parent, "docs-code-block")) {
        return;
      }

      const title = normalizeValue(node.properties?.["data-code-title"]);
      const language = extractLanguage(node);
      const showHeader = shouldShowHeader(title, language);
      const copyEnabled = normalizeValue(node.properties?.["data-code-copy"]) !== "false";
      const wrapEnabled = normalizeValue(node.properties?.["data-code-wrap"]) === "true";
      const lineNumbersEnabled = normalizeValue(node.properties?.["data-code-line-numbers"]) === "true";

      addClass(node, "docs-code-block__pre");

      const figure = createElement(
        "figure",
        {
          class: [
            "docs-code-block",
            wrapEnabled ? "is-wrap" : "",
            lineNumbersEnabled ? "has-line-numbers" : "",
          ].filter(Boolean),
        },
        [],
      );

      if (showHeader) {
        const headerChildren = [];

        if (title) {
          headerChildren.push(createElement("span", { class: ["docs-code-block__title"] }, [createText(title)]));
        }

        const languageLabel = formatLanguage(language);
        if (languageLabel && !title) {
          headerChildren.push(
            createElement("span", { class: ["docs-code-block__language"] }, [createText(languageLabel)]),
          );
        }

        if (languageLabel && title) {
          headerChildren.push(
            createElement("span", { class: ["docs-code-block__language", "is-secondary"] }, [createText(languageLabel)]),
          );
        }

        figure.children.push(
          createElement("figcaption", { class: ["docs-code-block__header"] }, headerChildren),
        );
      }

      const bodyProperties = { class: ["docs-code-block__body"] };
      if (copyEnabled) {
        bodyProperties["data-docs-copy-surface"] = "true";
        bodyProperties["data-copy-source"] = extractText(node).replace(/\r\n/g, "\n");
      }

      const body = createElement("div", bodyProperties, [node]);

      if (copyEnabled) {
        body.children.push(
          createElement(
            "button",
            {
              type: "button",
              class: ["docs-code-block__copy"],
              "data-docs-copy-button": "true",
              "data-copy-label": "Copy",
              "data-copied-label": "Copied",
              "aria-label": "Copy code to clipboard",
            },
            [createElement("span", { class: ["sr-only"] }, [createText("Copy")])],
          ),
        );
      }

      figure.children.push(body);
      parent.children[index] = figure;
    });
  };
}
