/**
 * Scroll-Affordanz fuer horizontal scrollbare Code-/Terminal-Bloecke.
 *
 * Setzt data-xscroll = "none" | "more" | "end" am zugehoerigen __body-Container,
 * abhaengig davon, ob und wie weit der Scroll-Container (code bzw. .docs-terminal__pre)
 * horizontal scrollbar ist. Die CSS-Regeln in DocsCodeBlockStyles.astro / Terminal.astro
 * blenden darueber einen Kanten-Schatten ein (nur "more" zeigt den rechten Schatten).
 *
 * Bewusst Overlay-Schatten statt Hintergrund-Cover: der Shiki-Codeblock bringt einen
 * eigenen Hintergrund mit, der nicht zu unseren Tokens passt.
 */
const SELECTOR = ".docs-code-block code, .docs-terminal__pre";

const update = (el: HTMLElement, host: HTMLElement): void => {
  const max = el.scrollWidth - el.clientWidth;
  host.dataset.xscroll = max <= 1 ? "none" : el.scrollLeft >= max - 2 ? "end" : "more";
};

const init = (): void => {
  const pairs: Array<[HTMLElement, HTMLElement]> = [];

  document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
    if (el.dataset.xscrollReady === "true") return;
    const host = el.closest<HTMLElement>(".docs-code-block__body, .docs-terminal__body");
    if (!host) return;

    el.dataset.xscrollReady = "true";
    pairs.push([el, host]);
    el.addEventListener("scroll", () => update(el, host), { passive: true });
    update(el, host);
  });

  if (pairs.length === 0) return;

  let frame = 0;
  window.addEventListener(
    "resize",
    () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        for (const [el, host] of pairs) update(el, host);
      });
    },
    { passive: true },
  );
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
