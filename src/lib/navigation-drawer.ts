/* eslint-disable @typescript-eslint/ban-ts-comment --
   vendored per-spec: the drawer resource's initializer must keep its
   behavior (toggle, close buttons, Escape, ARIA, focusability, scroll lock,
   safe re-init); its imperative DOM handling is untyped by nature. */
// @ts-nocheck

/**
 * Navigation Drawer — the responsive drawer resource's single named
 * initializer, vendored near-verbatim. The clip-path panel, staggered item
 * reveals, CSS-only services submenu and pill CTA are all CSS (globals.css);
 * this handles open/close, ARIA state, focusability, Escape, scroll locking
 * and safe re-init by aborting a root's previous listeners.
 *
 * LOCAL ADAPTATIONS (marked inline):
 *  - EVERY drawer link click closes the drawer, not only same-page links:
 *    the demo's cross-page clicks reloaded the document, but under the App
 *    Router the page swaps client-side with the drawer still mounted.
 *  - The function returns a `destroy()` for the React host's unmount, and
 *    exposes `root.__navigationDrawer = { close }` so the host can close it
 *    after programmatic navigations.
 */

export function navigationDrawer(scope: Document | Element = document) {
  const roots = scope.querySelectorAll("[data-drawer]");
  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");

  roots.forEach((root) => {
    const toggle = root.querySelector("[data-drawer-toggle]");
    const panel = root.querySelector("[data-drawer-panel]");
    const closeButtons = root.querySelectorAll("[data-drawer-close]");

    if (!toggle || !panel) return;

    if (root.drawerController) {
      root.drawerController.abort();
    }

    const controller = new AbortController();
    root.drawerController = controller;

    let previousOverflow = "";
    let previousFocus = null;

    function getPanelFocusables() {
      return Array.from(panel.querySelectorAll(focusableSelector)).filter(
        (element) =>
          element.offsetParent !== null || element === document.activeElement,
      );
    }

    function setPanelFocusability(isOpen) {
      getPanelFocusables().forEach((element) => {
        if (isOpen) {
          if (element.dataset.drawerTabindex) {
            element.setAttribute("tabindex", element.dataset.drawerTabindex);
            delete element.dataset.drawerTabindex;
          } else {
            element.removeAttribute("tabindex");
          }
          return;
        }

        const tabindex = element.getAttribute("tabindex");
        if (tabindex !== null) {
          element.dataset.drawerTabindex = tabindex;
        } else {
          delete element.dataset.drawerTabindex;
        }
        element.setAttribute("tabindex", "-1");
      });
    }

    function isOpen() {
      return root.getAttribute("data-open") === "true";
    }

    function setOpen(nextOpen, options = {}) {
      if (root.hasAttribute("data-open") && nextOpen === isOpen()) return;

      root.setAttribute("data-open", nextOpen ? "true" : "false");
      toggle.setAttribute("aria-expanded", String(nextOpen));
      panel.setAttribute("aria-hidden", String(!nextOpen));

      if ("inert" in panel) {
        panel.inert = !nextOpen;
      }

      setPanelFocusability(nextOpen);

      if (nextOpen) {
        previousFocus = document.activeElement;
        previousOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = "hidden";
        return;
      }

      document.documentElement.style.overflow = previousOverflow;

      if (options.restoreFocus === false) return;

      const focusTarget =
        previousFocus && document.contains(previousFocus) ? previousFocus : toggle;
      focusTarget.focus({ preventScroll: true });
    }

    function closeDrawer(options = {}) {
      setOpen(false, options);
    }

    setOpen(false, { restoreFocus: false });

    toggle.addEventListener(
      "click",
      () => {
        setOpen(!isOpen());
      },
      { signal: controller.signal },
    );

    closeButtons.forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          closeDrawer();
        },
        { signal: controller.signal },
      );
    });

    panel.querySelectorAll("a[href]").forEach((link) => {
      link.addEventListener(
        "click",
        () => {
          // LOCAL: the demo closed only same-page links because cross-page
          // clicks reloaded the document. Under a client router every
          // navigation keeps the drawer mounted, so every link closes it.
          closeDrawer({ restoreFocus: false });
        },
        { signal: controller.signal },
      );
    });

    scope.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape" && isOpen()) {
          closeDrawer();
        }
      },
      { signal: controller.signal },
    );

    // LOCAL: host-facing handle for programmatic closes (route changes).
    root.__navigationDrawer = { close: () => closeDrawer({ restoreFocus: false }) };
  });

  // LOCAL: unmount teardown for the React host.
  return () => {
    roots.forEach((root) => {
      root.drawerController?.abort();
      delete root.__navigationDrawer;
      delete root.drawerController;
    });
    document.documentElement.style.overflow = "";
  };
}
