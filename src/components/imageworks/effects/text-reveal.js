// Canonical implementation supplied by the user; lifecycle is owned by React.

/** @param {Document | Element} scope */
export function textReveal06(scope = document) {
  const config = {
    threshold: 0.5,
    duration: 1.2,
    delay: 0.1,
  };

  const root = scope === document ? document.documentElement : scope;
  const elements = [...scope.querySelectorAll("[data-reveal-06]")];

  const settings = new Map(
    elements.map((element) => {
      const thresholdValue = Number.parseFloat(element.dataset.threshold);
      const durationValue = Number.parseFloat(element.dataset.duration);
      const delayValue = Number.parseFloat(element.dataset.delay);
      const threshold = Number.isNaN(thresholdValue)
        ? config.threshold
        : Math.min(Math.max(thresholdValue, 0), 1);
      const duration = Number.isNaN(durationValue)
        ? config.duration
        : Math.max(durationValue, 0);
      const delay = Number.isNaN(delayValue)
        ? config.delay
        : Math.max(delayValue, 0);

      element.style.setProperty("--reveal-duration", `${duration}s`);
      element.style.setProperty("--reveal-delay", `${delay}s`);

      if (element.dataset.restingColor) {
        element.style.setProperty(
          "--reveal-resting-color",
          element.dataset.restingColor,
        );
      }

      return [element, { threshold }];
    }),
  );

  const thresholds = [
    ...new Set([...settings.values()].map(({ threshold }) => threshold)),
  ];

  root.textReveal06Destroy?.();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const { threshold } = settings.get(entry.target);
        if (!entry.isIntersecting || entry.intersectionRatio < threshold) {
          return;
        }

        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    },
    { threshold: thresholds },
  );

  elements.forEach((element) => {
    if (!element.classList.contains("is-revealed")) {
      observer.observe(element);
    }
  });

  const destroy = () => {
    observer.disconnect();
    if (root.textReveal06Destroy === destroy) {
      delete root.textReveal06Destroy;
    }
  };

  root.textReveal06Destroy = destroy;
  return destroy;
}
