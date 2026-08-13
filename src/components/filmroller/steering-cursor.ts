/**
 * The film-registration steering cursor — ported from karthi-98/filmroller
 * (`src/steeringCursor.js`).
 *
 * A ring that trails the pointer over the canvas, with a needle that points
 * along the steering direction and a label that flips to HOLD inside the
 * dead zone. Mouse-and-trackpad only (`hover: hover` + `pointer: fine`);
 * on touch there is no cursor to dress up.
 *
 * WHAT CHANGED IN THE PORT
 *  - Upstream positioned it `fixed` and styled it from a stylesheet of
 *    classes and custom properties. Neither survives: `fixed` breaks the
 *    moment an ancestor carries a transform (every giga section enters
 *    through `BlurRise`, which is exactly that), so the cursor is absolute
 *    inside the section and pointer coordinates are converted to local
 *    space. And the element is BUILT here, styles written directly, so the
 *    engine has no CSS file to ship — the caller passes a positioned host
 *    and gets a working cursor, nothing to keep in sync.
 *  - Colours are hairline-on-charcoal, label set in the mono the marketing
 *    surface already uses for eyebrows.
 *  - Reduced motion is not this module's concern: under it the whole engine
 *    runs still and the caller never creates a cursor.
 */

export type SteeringCursor = ReturnType<typeof createSteeringCursor>;

export function createSteeringCursor({
  element,
  host,
  pointerDirectionThreshold,
}: {
  /** The canvas the pointer is read against. */
  element: HTMLElement;
  /** A `position: relative/absolute` ancestor the cursor is appended to. */
  host: HTMLElement;
  pointerDirectionThreshold: number;
}) {
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  const root = document.createElement('div');
  root.setAttribute('aria-hidden', 'true');
  Object.assign(root.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '58px',
    height: '58px',
    pointerEvents: 'none',
    opacity: '0',
    zIndex: '4',
    transition: 'opacity 140ms ease',
    willChange: 'transform, opacity',
  } satisfies Partial<CSSStyleDeclaration>);

  const ring = document.createElement('span');
  Object.assign(ring.style, {
    position: 'absolute',
    inset: '0',
    borderRadius: '9999px',
    border: '1px solid rgba(255,255,255,0.38)',
  } satisfies Partial<CSSStyleDeclaration>);

  const needle = document.createElement('span');
  Object.assign(needle.style, {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '20px',
    height: '1px',
    background: '#ffffff',
    transformOrigin: '0 50%',
  } satisfies Partial<CSSStyleDeclaration>);

  const core = document.createElement('span');
  Object.assign(core.style, {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '3px',
    height: '3px',
    marginLeft: '-1.5px',
    marginTop: '-1.5px',
    borderRadius: '9999px',
    background: '#ffffff',
  } satisfies Partial<CSSStyleDeclaration>);

  const label = document.createElement('span');
  Object.assign(label.style, {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: '50%',
    transform: 'translateX(-50%)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: '9px',
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.58)',
    whiteSpace: 'nowrap',
  } satisfies Partial<CSSStyleDeclaration>);
  label.textContent = 'steer';

  root.append(ring, needle, core, label);
  host.appendChild(root);

  let enabled = finePointer.matches;
  let visible = false;
  let neutral = false;
  let positioned = false;
  let targetX = -100;
  let targetY = -100;
  let displayX = targetX;
  let displayY = targetY;
  let angleDegrees = 0;
  let animationFrame = 0;
  let previousFrameTime = performance.now();

  const paint = () => {
    root.style.transform = `translate3d(${(displayX - 29).toFixed(2)}px, ${(displayY - 29).toFixed(2)}px, 0)`;
    needle.style.transform = `rotate(${angleDegrees.toFixed(2)}deg)`;
    needle.style.opacity = neutral ? '0' : '1';
    root.style.opacity = enabled && visible ? '1' : '0';
    label.textContent = neutral ? 'hold' : 'steer';
  };

  const animate = (now: number) => {
    animationFrame = 0;
    const deltaTime = Math.min(0.05, Math.max(0, (now - previousFrameTime) / 1000));
    previousFrameTime = now;
    const response = 1 - Math.exp(-28 * deltaTime);
    displayX += (targetX - displayX) * response;
    displayY += (targetY - displayY) * response;
    paint();

    if (
      visible &&
      (Math.abs(targetX - displayX) > 0.05 || Math.abs(targetY - displayY) > 0.05)
    ) {
      animationFrame = requestAnimationFrame(animate);
    }
  };

  const schedulePaint = () => {
    if (animationFrame) return;
    previousFrameTime = performance.now();
    animationFrame = requestAnimationFrame(animate);
  };

  const updatePosition = (event: PointerEvent) => {
    if (!enabled || event.pointerType !== 'mouse') return;
    const rect = element.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const hostRect = host.getBoundingClientRect();

    targetX = event.clientX - hostRect.left;
    targetY = event.clientY - hostRect.top;
    if (!positioned) {
      displayX = targetX;
      displayY = targetY;
      positioned = true;
    }

    const deltaX = event.clientX - (rect.left + rect.width * 0.5);
    const deltaY = event.clientY - (rect.top + rect.height * 0.5);
    const magnitude = Math.hypot(deltaX, deltaY);
    const deadzonePixels =
      pointerDirectionThreshold * Math.min(rect.width, rect.height) * 0.5;
    neutral = magnitude <= deadzonePixels;
    if (!neutral) angleDegrees = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;
    visible = true;
    paint();
    schedulePaint();
  };

  const onPointerLeave = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    visible = false;
    paint();
  };
  const onWindowBlur = () => {
    visible = false;
    paint();
  };
  const onPointerCapabilityChange = () => {
    enabled = finePointer.matches;
    if (!enabled) visible = false;
    // The native crosshair only yields where the drawn cursor exists.
    element.style.cursor = enabled ? 'none' : 'crosshair';
    paint();
  };

  element.addEventListener('pointerenter', updatePosition);
  element.addEventListener('pointermove', updatePosition);
  element.addEventListener('pointerleave', onPointerLeave);
  window.addEventListener('blur', onWindowBlur);
  finePointer.addEventListener?.('change', onPointerCapabilityChange);
  onPointerCapabilityChange();

  return {
    setEnabled(nextEnabled: boolean) {
      enabled = Boolean(nextEnabled) && finePointer.matches;
      if (!enabled) visible = false;
      paint();
    },
    dispose() {
      cancelAnimationFrame(animationFrame);
      element.removeEventListener('pointerenter', updatePosition);
      element.removeEventListener('pointermove', updatePosition);
      element.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('blur', onWindowBlur);
      finePointer.removeEventListener?.('change', onPointerCapabilityChange);
      element.style.cursor = '';
      root.remove();
    },
  };
}
