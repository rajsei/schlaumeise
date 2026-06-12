const FOCUSABLE_SELECTOR =
  'a[href],button:not([disabled]),summary,[tabindex]:not([tabindex="-1"])';

interface DocsDrawerOptions {
  shellSelector: string;
  sidebarSelector: string;
  inputSelector: string;
  toggleSelector: string;
  desktopBreakpoint?: string;
  skipIfSelector?: string;
  missingInputMessage?: string;
}

export function initDocsDrawer({
  shellSelector,
  sidebarSelector,
  inputSelector,
  toggleSelector,
  desktopBreakpoint,
  skipIfSelector,
  missingInputMessage = "Missing docs drawer input",
}: DocsDrawerOptions) {
  const shell = document.querySelector<HTMLElement>(shellSelector);

  if (!shell || (skipIfSelector && document.querySelector(skipIfSelector))) {
    return;
  }

  const sidebar = shell.querySelector<HTMLElement>(sidebarSelector);
  const drawerInput = shell.querySelector<HTMLInputElement>(inputSelector);
  const overlay = shell.querySelector<HTMLElement>(".drawer-overlay");
  const toggleButtons = document.querySelectorAll<HTMLButtonElement>(toggleSelector);
  const desktopQuery = desktopBreakpoint ? window.matchMedia(desktopBreakpoint) : null;

  if (!drawerInput) {
    throw new Error(missingInputMessage);
  }

  let lastFocusedElement: HTMLElement | null = null;

  const isDesktop = () => desktopQuery?.matches === true;

  const focusFirstSidebarElement = () => {
    const focusable = sidebar?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    focusable?.[0]?.focus();
  };

  const setToggleVisual = (open: boolean) => {
    for (const button of toggleButtons) {
      button.setAttribute("aria-expanded", String(open));
      button.classList.toggle("is-open", open);
    }
  };

  const setMobileState = (open: boolean) => {
    shell.dataset.mobileOpen = open ? "true" : "false";
    document.body.style.overflow = !isDesktop() && open ? "hidden" : "";
  };

  const setDesktopState = (open: boolean) => {
    shell.dataset.desktopOpen = open ? "true" : "false";
  };

  const openMobileDrawer = () => {
    lastFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    drawerInput.checked = true;
    setMobileState(true);
    setToggleVisual(true);
    focusFirstSidebarElement();
  };

  const closeMobileDrawer = (restoreFocus = true) => {
    drawerInput.checked = false;
    setMobileState(false);
    setToggleVisual(false);
    if (restoreFocus) {
      lastFocusedElement?.focus();
    }
  };

  const toggleDesktopSidebar = () => {
    const open = shell.dataset.desktopOpen !== "true";
    setDesktopState(open);
    drawerInput.checked = open;
    setToggleVisual(open);
  };

  const toggleSidebar = () => {
    if (isDesktop()) {
      toggleDesktopSidebar();
      return;
    }

    if (shell.dataset.mobileOpen === "true") {
      closeMobileDrawer();
    } else {
      openMobileDrawer();
    }
  };

  drawerInput.addEventListener("change", () => {
    if (isDesktop()) {
      return;
    }

    const open = drawerInput.checked;
    setMobileState(open);
    setToggleVisual(open);
    if (open) {
      lastFocusedElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      focusFirstSidebarElement();
    } else {
      lastFocusedElement?.focus();
    }
  });

  overlay?.addEventListener("click", (event) => {
    event.preventDefault();
    closeMobileDrawer();
  });

  document.addEventListener("docs-sidebar:toggle", toggleSidebar);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && shell.dataset.mobileOpen === "true") {
      closeMobileDrawer();
    }

    if (event.key !== "Tab" || shell.dataset.mobileOpen !== "true" || !sidebar) {
      return;
    }

    const focusable = sidebar.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  });

  desktopQuery?.addEventListener("change", (event) => {
    if (event.matches) {
      closeMobileDrawer(false);
      drawerInput.checked = shell.dataset.desktopOpen === "true";
      setToggleVisual(shell.dataset.desktopOpen === "true");
      return;
    }

    drawerInput.checked = false;
    setMobileState(false);
    setToggleVisual(false);
  });

  if (isDesktop()) {
    drawerInput.checked = shell.dataset.desktopOpen === "true";
    setToggleVisual(shell.dataset.desktopOpen === "true");
  } else {
    drawerInput.checked = false;
    setMobileState(false);
    setToggleVisual(false);
  }
}
