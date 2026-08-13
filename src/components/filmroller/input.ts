/**
 * Steering, speed and zoom input — ported from karthi-98/filmroller
 * (`src/input.js`), with one deliberate behavioural change.
 *
 * THE ENGAGEMENT MODEL, AND WHY IT EXISTS. Upstream was a full-page
 * installation with `overflow: hidden`: it could capture the wheel and the
 * keyboard for the whole window, because the page had nowhere to scroll.
 * This canvas is a SECTION of a page that scrolls. A hero that calls
 * `preventDefault()` on every wheel event is a hero the visitor cannot
 * scroll past — the classic scroll-jack — and a `window` keydown listener
 * would eat + and − in the middle of the contact form below.
 *
 * So the controls are split by how much they can break:
 *  - HOVER STEERS, always. Moving the pointer never scrolls a page, so the
 *    delightful part costs nothing and works the moment you arrive.
 *  - WHEEL ZOOM and the KEYS work only while the canvas is ENGAGED — that
 *    is, focused. A click (or tab) engages; Escape or clicking elsewhere
 *    releases, and the wheel goes back to scrolling the page. Engagement is
 *    focus rather than a bespoke flag so the keyboard story is the platform's
 *    own: the canvas is a `tabindex="0"` `role="application"` element, and
 *    keys bind to IT, not to `window`.
 *  - TOUCH DRAG steers via pointer capture, but the canvas asks for
 *    `touch-action: pan-y` (set by the section), so a vertical swipe still
 *    scrolls the page — a touch visitor is never trapped either.
 */

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

const isSpeedUpKey = (event: KeyboardEvent) =>
  event.code === 'NumpadAdd' || event.key === '+' || event.key === '=';

const isSpeedDownKey = (event: KeyboardEvent) =>
  event.code === 'NumpadSubtract' || event.key === '-';

export type InputController = ReturnType<typeof createInputController>;

export function createInputController({
  element,
  pointerDirectionThreshold,
  speedDefault,
  speedMin,
  speedMax,
  speedStep,
  speedLambda,
  onWheelZoom,
  onSpeedChange = () => {},
  onEngagedChange = () => {},
}: {
  element: HTMLElement;
  pointerDirectionThreshold: number;
  speedDefault: number;
  speedMin: number;
  speedMax: number;
  speedStep: number;
  speedLambda: number;
  onWheelZoom: (wheelDelta: number) => void;
  onSpeedChange?: (speed: number) => void;
  onEngagedChange?: (engaged: boolean) => void;
}) {
  let steeringScreenX = 1;
  let steeringScreenY = 0;
  let currentSpeed = speedDefault;
  let targetSpeed = speedDefault;
  let activePointerId: number | null = null;
  let enabled = true;
  let engaged = false;
  // When the visitor last actually steered — pointer over the canvas, a
  // captured touch drag, or an arrow key. The engine wanders on its own once
  // this goes stale, so "no pointer" reads as a living piece rather than a
  // drum rolling dead straight forever. -Infinity: idle from the first frame.
  let lastSteerAt = Number.NEGATIVE_INFINITY;

  const updateSteering = (clientX: number, clientY: number) => {
    const rect = element.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const deltaX = clientX - (rect.left + rect.width * 0.5);
    const deltaY = rect.top + rect.height * 0.5 - clientY;
    const magnitude = Math.hypot(deltaX, deltaY);
    // Inside the dead zone the previous heading is preserved — that is the
    // HOLD state the cursor announces.
    const deadzonePixels =
      pointerDirectionThreshold * Math.min(rect.width, rect.height) * 0.5;
    if (magnitude <= deadzonePixels) return;
    steeringScreenX = deltaX / magnitude;
    steeringScreenY = deltaY / magnitude;
    lastSteerAt = performance.now();
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!enabled) return;
    if (event.pointerType !== 'mouse' && activePointerId !== event.pointerId) return;
    updateSteering(event.clientX, event.clientY);
  };

  const onPointerDown = (event: PointerEvent) => {
    if (!enabled) return;
    element.focus({ preventScroll: true });
    if (event.pointerType !== 'mouse') {
      activePointerId = event.pointerId;
      element.setPointerCapture?.(event.pointerId);
    }
    updateSteering(event.clientX, event.clientY);
  };

  const onPointerUp = (event: PointerEvent) => {
    if (event.pointerId === activePointerId) activePointerId = null;
  };

  const onWheel = (event: WheelEvent) => {
    // Not engaged → the wheel belongs to the page. No preventDefault, no zoom.
    if (!enabled || !engaged) return;
    event.preventDefault();
    const deltaMultiplier =
      event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? 16
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
          ? element.clientHeight
          : 1;
    onWheelZoom(event.deltaY * deltaMultiplier);
  };

  const adjustTargetSpeed = (delta: number) => {
    targetSpeed = clamp(Number((targetSpeed + delta).toFixed(4)), speedMin, speedMax);
    onSpeedChange(targetSpeed);
  };

  // Bound to the ELEMENT: these only fire while the canvas holds focus.
  const onKeyDown = (event: KeyboardEvent) => {
    if (!enabled || event.repeat || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    if (event.key === 'Escape') {
      element.blur();
      return;
    }
    if (isSpeedUpKey(event)) {
      adjustTargetSpeed(speedStep);
      event.preventDefault();
      return;
    }
    if (isSpeedDownKey(event)) {
      adjustTargetSpeed(-speedStep);
      event.preventDefault();
      return;
    }

    const directions: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, 1],
      ArrowDown: [0, -1],
    };
    const direction = directions[event.key];
    if (!direction) return;
    [steeringScreenX, steeringScreenY] = direction;
    lastSteerAt = performance.now();
    event.preventDefault();
  };

  const onFocus = () => {
    engaged = true;
    onEngagedChange(true);
  };
  const onBlur = () => {
    engaged = false;
    activePointerId = null;
    onEngagedChange(false);
  };

  element.addEventListener('pointermove', onPointerMove);
  element.addEventListener('pointerdown', onPointerDown);
  element.addEventListener('pointerup', onPointerUp);
  element.addEventListener('pointercancel', onPointerUp);
  element.addEventListener('wheel', onWheel, { passive: false });
  element.addEventListener('keydown', onKeyDown);
  element.addEventListener('focus', onFocus);
  element.addEventListener('blur', onBlur);

  return {
    update(
      deltaTime: number,
      damp: (c: number, t: number, l: number, dt: number) => number,
      immediate = false,
    ) {
      if (!enabled) {
        return {
          screenDirection: { x: steeringScreenX, y: steeringScreenY },
          speed: 0,
          targetSpeed,
        };
      }

      currentSpeed = immediate
        ? targetSpeed
        : damp(currentSpeed, targetSpeed, speedLambda, deltaTime);
      if (Math.abs(currentSpeed - targetSpeed) < 0.0001) currentSpeed = targetSpeed;

      return {
        screenDirection: { x: steeringScreenX, y: steeringScreenY },
        speed: currentSpeed,
        targetSpeed,
      };
    },
    isEngaged() {
      return engaged;
    },
    /** ms timestamp of the last real steering input; -Infinity if never. */
    lastSteerAt() {
      return lastSteerAt;
    },
    setEnabled(nextEnabled: boolean) {
      enabled = nextEnabled;
      if (!enabled) activePointerId = null;
    },
    dispose() {
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('pointerup', onPointerUp);
      element.removeEventListener('pointercancel', onPointerUp);
      element.removeEventListener('wheel', onWheel);
      element.removeEventListener('keydown', onKeyDown);
      element.removeEventListener('focus', onFocus);
      element.removeEventListener('blur', onBlur);
    },
  };
}
