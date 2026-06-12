import { visit } from "unist-util-visit";

const externalUrlPattern = /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i;

function normalizePath(path) {
  return path.startsWith("/") ? path : `/${path}`;
}

function withBase(path) {
  if (!path || externalUrlPattern.test(path)) {
    return path;
  }

  const base = (process.env.PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
  const normalized = normalizePath(path);

  if (!base || normalized === base || normalized.startsWith(`${base}/`)) {
    return normalized;
  }

  return `${base}${normalized}`;
}

function normalizeAssetPath(path) {
  return path.replace(/^\/schlaumeise\/+/i, "/");
}

function rewriteUrl(value) {
  return withBase(normalizeAssetPath(value));
}

function rewriteStyleUrls(style) {
  if (typeof style !== "string") {
    return style;
  }

  return style.replace(/url\((['"]?)([^'")]+)\1\)/g, (_match, quote, url) => {
    return `url(${quote}${rewriteUrl(url)}${quote})`;
  });
}

export function rehypeBasePathAssets() {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (!node.properties) {
        return;
      }

      if (typeof node.properties.src === "string") {
        node.properties.src = rewriteUrl(node.properties.src);
      }

      if (typeof node.properties.poster === "string") {
        node.properties.poster = rewriteUrl(node.properties.poster);
      }

      if (typeof node.properties.style === "string") {
        node.properties.style = rewriteStyleUrls(node.properties.style);
      }
    });
  };
}
