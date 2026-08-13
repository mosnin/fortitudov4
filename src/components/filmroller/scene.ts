/**
 * Renderer, camera, floor and lights — ported from karthi-98/filmroller
 * (`src/scene.js`).
 *
 * WHAT CHANGED IN THE PORT
 *  - Colour comes from the caller's `FilmRollerPalette` (the `--fx-*` tokens),
 *    not from a config hex. Upstream lit a white gallery; this floor is the
 *    page's own charcoal, so the fog folds the piece into the section behind
 *    it instead of drawing an island.
 *  - Lighting rebalanced for a dark ground: the hemisphere's bounce colour is
 *    the ground itself (white bounce light under a charcoal floor reads as a
 *    render mistake), and the key keeps its warmth so the paper frames stay
 *    paper rather than going grey.
 *  - `resize()` reads the canvas's own CSS box, as upstream did — but the
 *    caller drives it from a ResizeObserver on the section rather than a
 *    window listener, because this canvas is a section, not the viewport.
 *
 * Zoom is a scale on the camera's offset from its look-at point, damped every
 * frame; `adjustZoom` only moves the target, so a wheel flick eases rather
 * than jumps.
 */

import * as THREE from 'three';
import { CONFIG } from './config';
import { damp } from './roll-math';
import type { FilmRollerPalette } from './palette';

export type SceneBundle = ReturnType<typeof createScene>;

export function createScene(canvas: HTMLCanvasElement, palette: FilmRollerPalette) {
  const scene = new THREE.Scene();
  const ground = new THREE.Color(palette.ground);
  scene.background = ground;
  scene.fog = new THREE.Fog(ground, 55, 150);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // NO tone mapping, deliberately — this scene sits INSIDE a page whose
  // ground it must match. ACES lifted the racing-yellow floor to cream
  // (measured: token 248,205,2 rendered as 242,226,118), and no exposure
  // value can undo a curve that desaturates by design. Linear→sRGB with the
  // lights below summing to ≈1 on an upward face renders the floor at the
  // token, and the monochrome frames lose nothing a film still ever had.
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const camera = new THREE.PerspectiveCamera(
    CONFIG.camera.fov,
    1,
    CONFIG.camera.near,
    CONFIG.camera.far,
  );
  const lookAt = new THREE.Vector3(...CONFIG.camera.lookAt);
  const lookAtDesktop = new THREE.Vector3(...CONFIG.camera.lookAt);
  // Narrow canvases aim the camera HIGHER, which pushes the drum into the
  // lower half of the frame — the top half belongs to the overlaid copy on
  // phones, and a drum framed centre-screen rolls straight through the lead.
  const lookAtMobile = new THREE.Vector3(0, 2.7, 0);
  const baseCameraPosition = new THREE.Vector3();
  const groundForward = new THREE.Vector3();
  const groundRight = new THREE.Vector3();
  const cameraDirection = new THREE.Vector3();
  let zoomScale = CONFIG.camera.zoomInitial;
  let targetZoomScale = CONFIG.camera.zoomInitial;

  // UNLIT, deliberately — the floor must be EXACTLY the page's ground, and a
  // lit material can never promise that: even at metalness 0 a standard
  // material keeps a ~4% white specular floor, which measured as a +18 blue
  // shift on the yellow (token 248,205,2 rendering 249,204,20) and read as a
  // pale rectangle inside the section. Basic material = the token, verbatim,
  // on every GPU. The cost is honest: the floor cannot receive the drum's
  // cast shadow, so the painted contact ellipse in roller.ts is now the only
  // grounding — which is enough, it is what reads at a glance.
  const floorMaterial = new THREE.MeshBasicMaterial({ color: ground });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(500, 260), floorMaterial);
  floor.name = 'ground-floor';
  floor.rotation.x = -Math.PI * 0.5;
  floor.position.y = -0.005;
  scene.add(floor);

  // Budgeted, not dramatic: hemisphere ≈0.58 + key ≈0.5×cos(elevation)
  // lands an upward-facing surface at ≈0.95 of its own albedo, so the floor
  // IS the token and white paper stays just off clipping.
  const hemisphere = new THREE.HemisphereLight(0xffffff, ground, 1.85);
  scene.add(hemisphere);

  const key = new THREE.DirectionalLight(0xfff6e8, 1.55);
  key.position.set(-7, 13, 9);
  key.castShadow = true;
  // Full-resolution shadows only where there is screen to spend them on —
  // a phone GPU pays the same fill cost for detail it cannot show.
  const shadowSize = (window.innerWidth || 1024) < 760 ? 1024 : 2048;
  key.shadow.mapSize.set(shadowSize, shadowSize);
  key.shadow.camera.left = -15;
  key.shadow.camera.right = 15;
  key.shadow.camera.top = 14;
  key.shadow.camera.bottom = -10;
  key.shadow.camera.near = 0.1;
  key.shadow.camera.far = 45;
  key.shadow.bias = -0.00025;
  key.shadow.normalBias = 0.025;
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xdce6f2, 0.4);
  rim.position.set(7, 5, -8);
  scene.add(rim);

  const applyCamera = () => {
    camera.position
      .copy(baseCameraPosition)
      .sub(lookAt)
      .multiplyScalar(zoomScale)
      .add(lookAt);
    camera.lookAt(lookAt);
    camera.getWorldDirection(cameraDirection);
    groundForward.set(cameraDirection.x, 0, cameraDirection.z).normalize();
    groundRight.copy(groundForward).cross(camera.up).normalize();
  };

  const resize = () => {
    const cssWidth = Math.max(1, canvas.clientWidth);
    const cssHeight = Math.max(1, canvas.clientHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, CONFIG.render.maxDpr);
    renderer.setPixelRatio(dpr);
    renderer.setSize(cssWidth, cssHeight, false);
    camera.aspect = cssWidth / cssHeight;
    camera.updateProjectionMatrix();

    // Narrow canvases pull the camera up and back so the drum stays framed.
    const mobileMix = THREE.MathUtils.smoothstep(760 - cssWidth, 0, 480);
    const desktop = new THREE.Vector3(...CONFIG.camera.desktopPosition);
    const mobile = new THREE.Vector3(...CONFIG.camera.mobilePosition);
    baseCameraPosition.lerpVectors(desktop, mobile, mobileMix);
    lookAt.lerpVectors(lookAtDesktop, lookAtMobile, mobileMix);
    applyCamera();
  };

  resize();

  return {
    scene,
    renderer,
    camera,
    resize,
    /** Returns true when the wheel delta had to be clamped. */
    adjustZoom(wheelDelta: number): boolean {
      const clampedDelta = THREE.MathUtils.clamp(
        wheelDelta,
        -CONFIG.camera.maxWheelDelta,
        CONFIG.camera.maxWheelDelta,
      );
      targetZoomScale = THREE.MathUtils.clamp(
        targetZoomScale * Math.exp(clampedDelta * CONFIG.camera.zoomSensitivity),
        CONFIG.camera.zoomMin,
        CONFIG.camera.zoomMax,
      );
      return wheelDelta !== clampedDelta;
    },
    updateCamera(deltaTime: number, immediate = false) {
      zoomScale = immediate
        ? targetZoomScale
        : damp(zoomScale, targetZoomScale, CONFIG.camera.zoomLambda, deltaTime);
      if (Math.abs(zoomScale - targetZoomScale) < 0.00001) {
        zoomScale = targetZoomScale;
      }
      applyCamera();
    },
    getCameraDistanceScale() {
      return zoomScale;
    },
    /**
     * Maps a screen-space steering direction (x right, y up) onto the ground
     * plane relative to where the camera is looking — "push up" always means
     * "away from me" whatever the zoom or aspect.
     */
    screenDirectionToWorld(screenX: number, screenY: number) {
      const worldX = groundRight.x * screenX + groundForward.x * screenY;
      const worldZ = groundRight.z * screenX + groundForward.z * screenY;
      const length = Math.hypot(worldX, worldZ) || 1;
      return { x: worldX / length, z: worldZ / length };
    },
    render() {
      renderer.render(scene, camera);
    },
    dispose() {
      floor.geometry.dispose();
      floorMaterial.dispose();
      renderer.dispose();
    },
  };
}
