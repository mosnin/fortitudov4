/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-expressions --
   vendored per-spec: the navigation-01 resource's controller must keep its
   behavior, timing and DOM contract; its imperative DOM juggling is untyped
   by nature, and the bare `.offsetHeight` reads are upstream's deliberate
   reflow flushes between transition states. */
// @ts-nocheck

/**
 * Navigation 01 — the animated navbar controller from the resource, vendored
 * near-verbatim: desktop flyout menus with the morphing glass background,
 * directional panel slides, sliding hover/sidebar pills, preview crossfades,
 * keyboard support, and the scroll-aware header resize.
 *
 * LOCAL ADAPTATIONS (each marked inline):
 *  - Global listeners (document click, window scroll/resize, media-query
 *    change) attach through an AbortController, and the function returns a
 *    `destroy()`; the host is a React component that can unmount, and the
 *    resource assumed a page-lifetime header. `nav.__navigation01` exposes
 *    `{ close, destroy }` so the host can shut the flyout after client-side
 *    navigations — the demo's cross-page clicks reloaded the document.
 *  - The mobile accordion/menu-toggle machinery is retained but finds no
 *    markup: on this site "the menu" below the breakpoint is the navigation
 *    drawer resource (user's instruction), so the header renders no
 *    `.nav-menu-toggle` and no accordion slots, and the function's own null
 *    guards make those branches no-ops.
 */

export function navigation01(scope: Document | Element = document) {
  const nav = scope.querySelector(".navigation-01");
  if (!nav) return () => {};
  if (nav.dataset.navigation01Initialized === "true") return () => {};
  nav.dataset.navigation01Initialized = "true";

  // LOCAL: one controller for every listener on a global target.
  const globalAbort = new AbortController();
  const globalSignal = { signal: globalAbort.signal };

  const header = nav.closest("header");
  const menuToggle = header && header.querySelector(".nav-menu-toggle");
  const mobileMq = window.matchMedia("(max-width: 900px)");
  const isMobileNav = () => mobileMq.matches;
  let closeFlyout = () => {};
  let collapseAccordions = () => {};
  let syncNavMode = () => {};

  const closeMobileNav = () => {
    if (!header) return;
    header.classList.remove("is-mobile-nav-open");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
    document.documentElement.style.overflow = "";
    collapseAccordions();
  };

  const openMobileNav = () => {
    if (!header) return;
    header.classList.add("is-mobile-nav-open");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "true");
    document.documentElement.style.overflow = "hidden";
  };

  const getOffsetWithin = (element, ancestor) => {
    let left = 0;
    let top = 0;

    for (let node = element; node && node !== ancestor; node = node.offsetParent) {
      left += node.offsetLeft;
      top += node.offsetTop;
    }

    return { left, top };
  };

  const onIntent = (items, activate) => {
    items.forEach((item) => {
      item.addEventListener("pointerenter", () => activate(item));
      item.addEventListener("focusin", () => activate(item));
    });
  };

  const createPillController = ({ container, pill, items }) => {
    const movePill = (item) => {
      const itemOffset = getOffsetWithin(item, container);

      pill.style.height = `${item.offsetHeight}px`;
      pill.style.transform = `translate3d(0, ${itemOffset.top}px, 0)`;
      pill.classList.add("is-visible");
    };

    const firstOffset = getOffsetWithin(items[0], container);
    pill.style.width = `${items[0].offsetWidth}px`;
    pill.style.left = `${firstOffset.left}px`;

    let canSlide = false;

    const activateItem = (item, instant = false) => {
      if (instant || !canSlide) {
        pill.classList.add("is-instant");
        movePill(item);
        pill.offsetHeight;
        pill.classList.remove("is-instant");
      } else {
        movePill(item);
      }
      canSlide = true;
    };

    return { activateItem, resetSlide: () => { canSlide = false; } };
  };

  const flyout = nav.querySelector(".nav-flyout");
  const flyoutBg = flyout && flyout.querySelector(".nav-flyout__bg");
  const flyoutViewport = flyout && flyout.querySelector(".nav-flyout__viewport");

  if (flyout && flyoutBg && flyoutViewport) {
    const PANEL_CLASSES = [
      "is-active",
      "is-leaving-left",
      "is-leaving-right",
      "is-enter-right",
      "is-enter-left",
    ];
    const FOCUSABLE_SELECTOR =
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const flyoutFrameElements = [flyoutBg, flyoutViewport];

    const registry = new Map();
    let currentTrigger = null;
    let closeTimeout;
    let closeHandler = null;

    const resetPanel = (panel) => panel.classList.remove(...PANEL_CLASSES);

    const setPanelInert = (panel, inert) => {
      panel.inert = inert;
      panel.setAttribute("aria-hidden", inert ? "true" : "false");
    };

    const getPanelFocusables = (panel) => [...panel.querySelectorAll(FOCUSABLE_SELECTOR)];
    const focusFirstInPanel = (panel) => getPanelFocusables(panel)[0]?.focus();

    const clearCloseWatchers = () => {
      clearTimeout(closeTimeout);
      if (closeHandler) {
        flyoutBg.removeEventListener("transitionend", closeHandler);
        closeHandler = null;
      }
    };

    const setBg = (panelRect, x) => {
      const w = `${panelRect.width}px`;
      const h = `${panelRect.height}px`;
      const xOffset = `${x}px`;
      flyoutFrameElements.forEach((element) => {
        element.style.width = w;
        element.style.height = h;
        element.style.setProperty("--flyout-x", xOffset);
      });
    };

    const navItems = [...nav.querySelectorAll(".nav-item")];

    navItems.forEach((trigger, index) => {
      const key = trigger.dataset.flyout;
      if (!key) return;
      const panel = flyout.querySelector(`.nav-flyout__panel[data-panel="${key}"]`);
      if (!panel) return;
      registry.set(trigger, { panel, index });
      setPanelInert(panel, true);
    });

    const enhancePanel = (key, hooks) => {
      const trigger = nav.querySelector(`.nav-item[data-flyout="${key}"]`);
      const entry = trigger && registry.get(trigger);
      if (entry) Object.assign(entry, hooks);
    };

    const open = (trigger, { focusFirst = false } = {}) => {
      const entry = registry.get(trigger);
      if (!entry) return;
      if (trigger === currentTrigger) {
        if (focusFirst) focusFirstInPanel(entry.panel);
        return;
      }

      clearCloseWatchers();
      flyout.hidden = false;

      const prevEntry = currentTrigger ? registry.get(currentTrigger) : null;
      const mobile = isMobileNav();
      const navRect = nav.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();
      const panelRect = {
        width: mobile ? entry.panel.scrollWidth : entry.panel.offsetWidth,
        height: mobile ? entry.panel.scrollHeight : entry.panel.offsetHeight,
      };
      const x = mobile ? 0 : triggerRect.left - navRect.left;

      if (!prevEntry) {
        registry.forEach((e) => {
          resetPanel(e.panel);
          setPanelInert(e.panel, true);
        });

        flyoutBg.classList.add("is-instant");
        flyoutViewport.classList.add("is-instant");
        setBg(panelRect, x);
        flyoutBg.offsetHeight;
        flyoutBg.classList.remove("is-instant");
        flyoutViewport.classList.remove("is-instant");

        resetPanel(entry.panel);
        entry.panel.classList.add("is-active");
        setPanelInert(entry.panel, false);
        flyout.classList.add("is-open");
      } else if (mobile) {
        flyout.classList.add("is-open");
        setBg(panelRect, x);

        prevEntry.panel.classList.remove("is-active");
        setPanelInert(prevEntry.panel, true);
        if (prevEntry.onDeactivate) prevEntry.onDeactivate();

        resetPanel(entry.panel);
        entry.panel.classList.add("is-active");
        setPanelInert(entry.panel, false);
      } else {
        flyout.classList.add("is-open");
        const direction = Math.sign(entry.index - prevEntry.index) || 1;
        setBg(panelRect, x);

        prevEntry.panel.classList.remove("is-active");
        prevEntry.panel.classList.add(
          direction > 0 ? "is-leaving-left" : "is-leaving-right",
        );
        setPanelInert(prevEntry.panel, true);
        if (prevEntry.onDeactivate) prevEntry.onDeactivate();

        resetPanel(entry.panel);
        entry.panel.classList.add(
          direction > 0 ? "is-enter-right" : "is-enter-left",
        );
        entry.panel.offsetHeight;
        entry.panel.classList.remove("is-enter-right", "is-enter-left");
        entry.panel.classList.add("is-active");
        setPanelInert(entry.panel, false);
      }

      if (currentTrigger && currentTrigger !== trigger) {
        currentTrigger.setAttribute("aria-expanded", "false");
      }
      trigger.setAttribute("aria-expanded", "true");
      currentTrigger = trigger;

      if (entry.onActivate) entry.onActivate();
      if (focusFirst) focusFirstInPanel(entry.panel);
    };

    const finalizeClose = () => {
      registry.forEach((entry) => {
        resetPanel(entry.panel);
        setPanelInert(entry.panel, true);
        if (entry.onDeactivate) entry.onDeactivate();
      });
    };

    const close = () => {
      if (currentTrigger === null) return;

      clearCloseWatchers();
      const closingEntry = registry.get(currentTrigger);
      currentTrigger.setAttribute("aria-expanded", "false");
      currentTrigger = null;

      if (closingEntry) {
        resetPanel(closingEntry.panel);
        setPanelInert(closingEntry.panel, true);
        if (closingEntry.onDeactivate) closingEntry.onDeactivate();
      }

      flyout.classList.remove("is-open");

      let closed = false;
      const finalize = () => {
        if (closed) return;
        closed = true;
        flyout.hidden = true;
        finalizeClose();
        clearCloseWatchers();
      };

      closeHandler = (event) => {
        if (event.target !== flyoutBg) return;
        if (
          event.propertyName !== "background-color" &&
          event.propertyName !== "backdrop-filter" &&
          event.propertyName !== "-webkit-backdrop-filter"
        ) {
          return;
        }
        if (flyout.classList.contains("is-open")) return;
        finalize();
      };

      flyoutBg.addEventListener("transitionend", closeHandler);
      closeTimeout = setTimeout(() => {
        if (!flyout.classList.contains("is-open")) finalize();
      }, 220);
    };

    const handlePanelTab = (event) => {
      const trigger = currentTrigger;
      if (!trigger) return;

      const entry = registry.get(trigger);
      if (!entry || !entry.panel.contains(event.target)) return;

      const focusables = getPanelFocusables(entry.panel);
      if (!focusables.length) return;

      if (event.shiftKey) {
        if (event.target !== focusables[0]) return;
        event.preventDefault();
        close();
        trigger.focus();
        return;
      }

      const nextNavItem = navItems[entry.index + 1];
      if (!nextNavItem || event.target !== focusables[focusables.length - 1]) return;

      event.preventDefault();
      close();
      nextNavItem.focus();
    };

    const initMegaPanel = () => {
      const panel = flyout.querySelector('.nav-flyout__panel[data-panel="product"]');
      if (!panel) return;

      const sidebar = panel.querySelector(".nav-dropdown__sidebar");
      const sidebarPill = panel.querySelector(".nav-dropdown__pill");
      const sidebarItems = panel.querySelectorAll(".nav-dropdown__item");
      const previewPanels = panel.querySelectorAll(".nav-dropdown__preview-panel");
      if (!sidebar || !sidebarPill || !sidebarItems.length || !previewPanels.length) {
        return;
      }

      let restingPreviewIndex = null;
      let previewZIndex = 0;
      let pendingPreviewEnter = null;
      let pendingPreviewFinish = null;
      const PREVIEW_CLASSES = ["is-entering", "is-entering-active"];

      const clearPendingPreviewEnter = () => {
        if (pendingPreviewEnter && pendingPreviewFinish) {
          pendingPreviewEnter.removeEventListener("transitionend", pendingPreviewFinish);
        }
        pendingPreviewEnter = null;
        pendingPreviewFinish = null;
      };

      const resetPreviewPanels = (activeIndex, resetZIndex = true) => {
        previewPanels.forEach((p, i) => {
          p.classList.remove(...PREVIEW_CLASSES);
          if (resetZIndex) p.style.zIndex = "";
          p.classList.toggle("is-active", i === activeIndex);
        });
      };

      const setActivePreview = (index, instant = false) => {
        const nextPanel = previewPanels[index];
        if (!nextPanel) return;
        if (index === restingPreviewIndex && !instant) return;

        clearPendingPreviewEnter();

        if (instant) {
          resetPreviewPanels(index);
          restingPreviewIndex = index;
          previewZIndex = 0;
          return;
        }

        previewZIndex += 1;
        nextPanel.style.zIndex = String(previewZIndex);
        nextPanel.classList.remove("is-active");
        nextPanel.classList.add("is-entering");
        nextPanel.offsetHeight;
        nextPanel.classList.add("is-entering-active");

        pendingPreviewEnter = nextPanel;
        pendingPreviewFinish = (event) => {
          if (event.target !== nextPanel) return;
          if (event.propertyName !== "opacity") return;
          clearPendingPreviewEnter();
          resetPreviewPanels(index, false);
          restingPreviewIndex = index;
        };

        nextPanel.addEventListener("transitionend", pendingPreviewFinish);
      };

      const { activateItem, resetSlide } = createPillController({
        container: sidebar,
        pill: sidebarPill,
        items: sidebarItems,
      });

      const activateSidebarItem = (item, instant = false) => {
        activateItem(item, instant);
        setActivePreview(Number(item.dataset.previewIndex), instant);
      };

      onIntent(sidebarItems, activateSidebarItem);

      enhancePanel("product", {
        onActivate: () => {
          resetSlide();
          setActivePreview(0, true);
        },
        onDeactivate: () => {
          resetSlide();
          sidebarPill.classList.remove("is-visible");
          clearPendingPreviewEnter();
          resetPreviewPanels(0);
          restingPreviewIndex = null;
          previewZIndex = 0;
        },
      });
    };

    const initSimplePanel = () => {
      const panel = flyout.querySelector('.nav-flyout__panel[data-panel="solutions"]');
      if (!panel) return;

      const inner = panel.querySelector(".nav-dropdown__inner");
      const pill = panel.querySelector(".nav-dropdown__pill");
      const items = panel.querySelectorAll(".nav-dropdown__item");
      if (!inner || !pill || !items.length) return;

      const { activateItem, resetSlide } = createPillController({
        container: inner,
        pill,
        items,
      });

      onIntent(items, activateItem);

      enhancePanel("solutions", {
        onActivate: () => {
          resetSlide();
        },
        onDeactivate: () => {
          resetSlide();
          pill.classList.remove("is-visible");
        },
      });
    };

    initMegaPanel();
    initSimplePanel();
    closeFlyout = close;

    const accordions = new Map();
    registry.forEach((entry, trigger) => {
      const li = trigger.closest("li");
      const slot = li && li.querySelector(".nav-accordion__inner");
      if (li && slot) accordions.set(trigger, { li, slot, panel: entry.panel });
    });

    let panelsInAccordion = false;
    const homePanels = Array.prototype.slice.call(
      flyoutViewport.querySelectorAll(".nav-flyout__panel"),
    );

    const relocatePanels = (toMobile) => {
      if (toMobile === panelsInAccordion) return;
      if (toMobile) {
        accordions.forEach(({ slot, panel }) => {
          resetPanel(panel);
          panel.classList.add("is-accordion");
          slot.appendChild(panel);
        });
      } else {
        homePanels.forEach((panel) => {
          resetPanel(panel);
          panel.classList.remove("is-accordion");
          flyoutViewport.appendChild(panel);
        });
      }
      panelsInAccordion = toMobile;
    };

    const collapseAllAccordions = () => {
      accordions.forEach(({ li, panel }, trigger) => {
        li.classList.remove("is-expanded");
        trigger.setAttribute("aria-expanded", "false");
        setPanelInert(panel, true);
      });
    };

    const toggleAccordion = (trigger) => {
      const data = accordions.get(trigger);
      if (!data) return;
      const willExpand = !data.li.classList.contains("is-expanded");
      accordions.forEach(({ li, panel }, other) => {
        if (other === trigger) return;
        li.classList.remove("is-expanded");
        other.setAttribute("aria-expanded", "false");
        setPanelInert(panel, true);
      });
      data.li.classList.toggle("is-expanded", willExpand);
      trigger.setAttribute("aria-expanded", willExpand ? "true" : "false");
      setPanelInert(data.panel, !willExpand);
    };

    collapseAccordions = collapseAllAccordions;
    syncNavMode = () => {
      relocatePanels(isMobileNav());
      if (isMobileNav()) collapseAllAccordions();
    };
    syncNavMode();

    nav.addEventListener("click", (event) => {
      if (!isMobileNav()) return;
      const link = event.target.closest("a[href]");
      if (link && nav.contains(link)) closeMobileNav();
    });

    const OPEN_KEYS = ["Enter", " ", "Spacebar", "ArrowDown"];
    registry.forEach((_entry, trigger) => {
      trigger.addEventListener("pointerenter", () => {
        if (isMobileNav()) return;
        open(trigger);
      });
      trigger.addEventListener("keydown", (event) => {
        if (!OPEN_KEYS.includes(event.key)) return;
        event.preventDefault();
        if (isMobileNav()) {
          toggleAccordion(trigger);
          return;
        }
        open(trigger, { focusFirst: true });
      });
      trigger.addEventListener("click", (event) => {
        if (!isMobileNav()) return;
        event.preventDefault();
        toggleAccordion(trigger);
      });
    });

    navItems.forEach((item) => {
      if (registry.has(item)) return;
      item.addEventListener("pointerenter", () => {
        if (isMobileNav()) return;
        close();
      });
      item.addEventListener("click", () => {
        if (!isMobileNav()) return;
        closeMobileNav();
      });
    });

    nav.addEventListener("pointerleave", () => {
      if (isMobileNav()) return;
      close();
    });

    nav.addEventListener("keydown", (event) => {
      if (event.key === "Tab" && !isMobileNav()) {
        handlePanelTab(event);
        return;
      }
      if (event.key !== "Escape") return;
      if (currentTrigger !== null) {
        const trigger = currentTrigger;
        close();
        trigger.focus();
        return;
      }
      if (isMobileNav() && header && header.classList.contains("is-mobile-nav-open")) {
        closeMobileNav();
        if (menuToggle) menuToggle.focus();
      }
    });

    nav.addEventListener("focusout", (event) => {
      if (!nav.contains(event.relatedTarget)) close();
    });
  }

  const list = nav.querySelector(".nav-list");
  const pill = nav.querySelector(".nav-hover-bg");
  const items = nav.querySelectorAll(".nav-item");
  if (!list || !pill || !items.length) {
    // LOCAL: still expose teardown for the host even without the pill rig.
    nav.__navigation01 = {
      close: () => { closeFlyout(); closeMobileNav(); },
      destroy: () => { globalAbort.abort(); delete nav.__navigation01; },
    };
    return nav.__navigation01.destroy;
  }

  const movePill = (item) => {
    const listRect = list.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    pill.style.width = `${itemRect.width}px`;
    pill.style.transform = `translate3d(${itemRect.left - listRect.left}px, ${itemRect.top - listRect.top}px, 0)`;
    pill.classList.add("is-visible");
  };

  const firstRect = items[0].getBoundingClientRect();
  pill.style.height = `${firstRect.height}px`;

  let canSlide = false;

  const resetNavPill = () => {
    canSlide = false;
    pill.classList.remove("is-visible");
  };

  const activateNavItem = (item) => {
    if (!canSlide) {
      pill.classList.add("is-instant");
      movePill(item);
      pill.offsetHeight;
      pill.classList.remove("is-instant");
    } else {
      movePill(item);
    }
    canSlide = true;
  };

  onIntent(items, (item) => {
    if (isMobileNav()) return;
    activateNavItem(item);
  });

  nav.addEventListener("pointerleave", () => {
    if (isMobileNav()) return;
    resetNavPill();
  });

  nav.addEventListener("focusout", (event) => {
    if (!nav.contains(event.relatedTarget)) resetNavPill();
  });

  if (menuToggle && header) {
    menuToggle.addEventListener("click", () => {
      if (!isMobileNav()) return;
      if (header.classList.contains("is-mobile-nav-open")) {
        closeMobileNav();
        closeFlyout();
        return;
      }
      openMobileNav();
    });

    document.addEventListener("click", (event) => {
      if (!isMobileNav()) return;
      if (!header.classList.contains("is-mobile-nav-open")) return;
      if (nav.contains(event.target) || menuToggle.contains(event.target)) return;
      closeMobileNav();
      closeFlyout();
    }, globalSignal); // LOCAL: dies with the host

    mobileMq.addEventListener("change", () => {
      closeFlyout();
      closeMobileNav();
      syncNavMode();
    }, globalSignal); // LOCAL
  }

  if (header) {
    const headerShell = header.querySelector(".header-shell");
    const scrollThreshold = 130;
    let scrollTicking = false;

    const readPxVar = (styles, name, fallback) => {
      const value = Number.parseFloat(styles.getPropertyValue(name));
      return Number.isFinite(value) ? value : fallback;
    };

    const syncHeaderShellMax = () => {
      if (!headerShell || isMobileNav()) {
        headerShell?.style.removeProperty("--header-shell-max");
        headerShell?.style.removeProperty("--header-shell-max-scrolled");
        return;
      }

      const headerShellStyles = window.getComputedStyle(headerShell);
      const available = header.clientWidth;
      const expandedMax = readPxVar(
        headerShellStyles,
        "--header-shell-expanded-max",
        available,
      );
      const scrolledMax = readPxVar(
        headerShellStyles,
        "--header-shell-scrolled-max",
        available,
      );
      headerShell.style.setProperty(
        "--header-shell-max",
        `${Math.min(expandedMax, available)}px`,
      );
      headerShell.style.setProperty(
        "--header-shell-max-scrolled",
        `${Math.min(scrolledMax, available)}px`,
      );
    };

    const updateHeaderScrolled = () => {
      header.classList.toggle("is-scrolled", window.scrollY > scrollThreshold);
      scrollTicking = false;
    };

    const onScroll = () => {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(updateHeaderScrolled);
    };

    syncHeaderShellMax();
    updateHeaderScrolled();
    window.addEventListener("scroll", onScroll, { passive: true, signal: globalAbort.signal }); // LOCAL: signal
    window.addEventListener("resize", syncHeaderShellMax, globalSignal); // LOCAL
    mobileMq.addEventListener("change", syncHeaderShellMax, globalSignal); // LOCAL
  }

  // LOCAL: host-facing handle — close the flyout after a client-side
  // navigation (the demo's cross-page clicks reloaded the page), and tear
  // down every global listener on unmount.
  nav.__navigation01 = {
    close: () => { closeFlyout(); closeMobileNav(); },
    destroy: () => {
      globalAbort.abort();
      document.documentElement.style.overflow = "";
      // LOCAL: clear the guard so a remount (React StrictMode replays
      // effects) re-initializes instead of silently doing nothing.
      delete nav.dataset.navigation01Initialized;
      delete nav.__navigation01;
    },
  };
  return nav.__navigation01.destroy;
}
