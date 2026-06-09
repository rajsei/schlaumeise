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

const COPY_ICON_PATH =
  "M8 8H7.2C6.0799 8 5.51984 8 5.09202 8.21799C4.71569 8.40973 4.40973 8.71569 4.21799 9.09202C4 9.51984 4 10.0799 4 11.2V16.8C4 17.9201 4 18.4802 4.21799 18.908C4.40973 19.2843 4.71569 19.5903 5.09202 19.782C5.51984 20 6.0799 20 7.2 20H12.8C13.9201 20 14.4802 20 14.908 19.782C15.2843 19.5903 15.5903 19.2843 15.782 18.908C16 18.4802 16 17.9201 16 16.8V16M11.2 16H16.8C17.9201 16 18.4802 16 18.908 15.782C19.2843 15.5903 19.5903 15.2843 19.782 14.908C20 14.4802 20 13.9201 20 12.8V7.2C20 6.0799 20 5.51984 19.782 5.09202C19.5903 4.71569 19.2843 4.40973 18.908 4.21799C18.4802 4 17.9201 4 16.8 4H11.2C10.0799 4 9.51984 4 9.09202 4.21799C8.71569 4.40973 8.40973 4.71569 8.21799 5.09202C8 5.51984 8 6.07989 8 7.2V12.8C8 13.9201 8 14.4802 8.21799 14.908C8.40973 15.2843 8.71569 15.5903 9.09202 15.782C9.51984 16 10.0799 16 11.2 16Z";
const COPIED_ICON_PATH = "M4 12.6111L8.92308 17.5L20 6.5";

function createCopyIcon() {
  return createElement(
    "svg",
    {
      class: ["docs-code-block__copy-icon"],
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      "aria-hidden": "true",
    },
    [
      createElement("path", {
        d: COPY_ICON_PATH,
        stroke: "currentColor",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      }),
    ],
  );
}

function createCopiedIcon() {
  return createElement(
    "svg",
    {
      class: ["docs-code-block__copied-icon"],
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      "aria-hidden": "true",
    },
    [
      createElement("path", {
        d: COPIED_ICON_PATH,
        stroke: "currentColor",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      }),
    ],
  );
}

function createCopyButton() {
  return createElement(
    "button",
    {
      type: "button",
      class: ["docs-code-block__copy"],
      "data-docs-copy-button": "true",
      "data-copy-label": "Copy",
      "data-copied-label": "Copied",
      "aria-label": "Copy code to clipboard",
    },
    [
      createElement("span", { class: ["docs-code-block__copy-icon-wrap"] }, [createCopyIcon(), createCopiedIcon()]),
      createElement("span", { class: ["sr-only"] }, [createText("Copy")]),
    ],
  );
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
        body.children.push(createCopyButton());
      }

      figure.children.push(body);
      parent.children[index] = figure;
    });
  };
}
