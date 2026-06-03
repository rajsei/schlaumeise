const COPY_INIT_FLAG = "__docsCodeCopyInit";

function fallbackCopy(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.append(textarea);
  textarea.select();

  let success = false;
  try {
    success = document.execCommand("copy");
  } catch {
    success = false;
  }

  textarea.remove();
  return success;
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return fallbackCopy(text);
    }
  }

  return fallbackCopy(text);
}

function setButtonState(button: HTMLButtonElement, copied: boolean) {
  const defaultLabel = button.dataset.copyLabel ?? "Copy";
  const copiedLabel = button.dataset.copiedLabel ?? "Copied";

  button.setAttribute("aria-label", copied ? copiedLabel : defaultLabel);
  button.dataset.copied = copied ? "true" : "false";
}

function resolveSource(container: HTMLElement | null, fallback?: string) {
  if (!container) {
    return fallback ?? "";
  }

  return (
    container.dataset.copySource ??
    fallback ??
    container.querySelector("pre code")?.textContent ??
    ""
  );
}

async function copyFromSurface(surface: HTMLElement, button?: HTMLButtonElement) {
  const sourceCode = resolveSource(surface, button?.dataset.copySource);

  if (!sourceCode) {
    return;
  }

  const didCopy = await copyText(sourceCode);
  if (!didCopy) {
    return;
  }

  const visualButton = button ?? surface.querySelector<HTMLButtonElement>("[data-docs-copy-button]");
  if (visualButton) {
    setButtonState(visualButton, true);
    window.setTimeout(() => setButtonState(visualButton, false), 1600);
  }
}

async function onCopyClick(event: Event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const button = target.closest<HTMLButtonElement>("[data-docs-copy-button]");
  if (button) {
    const surface = button.closest<HTMLElement>("[data-docs-copy-surface]")
      ?? button.closest<HTMLElement>(".docs-code-block__body, .docs-terminal__body");
    if (!surface) {
      return;
    }
    await copyFromSurface(surface, button);
    return;
  }

  const surface = target.closest<HTMLElement>("[data-docs-copy-surface], .docs-code-block__body, .docs-terminal__body");
  if (!surface) {
    return;
  }

  const selection = window.getSelection();
  if (
    selection &&
    !selection.isCollapsed &&
    surface.contains(selection.anchorNode) &&
    surface.contains(selection.focusNode)
  ) {
    return;
  }

  if (!surface.querySelector("[data-docs-copy-button]")) {
    return;
  }

  if (target.closest("a, input, textarea, select, summary, label")) {
    return;
  }

  await copyFromSurface(surface);
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  if (!(window as Record<string, unknown>)[COPY_INIT_FLAG]) {
    (window as Record<string, unknown>)[COPY_INIT_FLAG] = true;
    document.addEventListener("click", (event) => {
      void onCopyClick(event);
    });
  }
}
