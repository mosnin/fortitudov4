/**
 * The floor archive — ported from karthi-98/filmroller (`src/floorHistory.js`).
 *
 * The mechanism, which the port does not touch: every imprint is a pooled
 * pair of dynamic curved ribbons (photo + film carrier) whose sections are
 * appended at the drum's contact point as it travels, so a half-rolled frame
 * is exactly half visible on the floor — the reveal is contact-driven, never
 * a fade or a stretch. The photo ribbon's UVs are CLIPPED at the contact edge
 * (`clipSectionsByPhase`); the film carrier runs the full pitch, with real
 * transparent sprocket holes punched by a canvas alpha mask, so paper and
 * film unroll as one physical strip. The newest strip always renders on top
 * (`syncLayerOrder`), which is what lets a revisited patch of floor take a
 * fresh strip without z-fighting the one below. `maxActive` imprints stay
 * live; when one more begins, the oldest fades out and its meshes go back to
 * the pool.
 *
 * The port: colours from the palette (the carrier is the site's raised
 * charcoal, a step above the ground so the strip stays legible on a dark
 * floor), textures are the blank frames from `frames.ts`, and the upstream
 * debug surface (`snapshot()`, the event log) is gone — `activeCount()` is
 * all the caller reads.
 */

import * as THREE from 'three';
import { CONFIG, FLOOR_PITCH } from './config';
import { easeOutCubic } from './roll-math';
import type { FilmRollerPalette } from './palette';

const PHOTO_GAP_PHASE = (FLOOR_PITCH - CONFIG.floor.imageLength) / FLOOR_PITCH;
const PHOTO_PHASE_START = PHOTO_GAP_PHASE * 0.5;
const PHOTO_PHASE_END = 1 - PHOTO_PHASE_START;
const PHASE_EPSILON = 1e-6;
const POSITION_EPSILON = 1e-5;

type Section = {
  x: number;
  z: number;
  sideX: number;
  sideZ: number;
  phase: number;
};

type ImprintPoint = {
  x: number;
  z: number;
  heading: number;
  phase: number;
};

type PooledItem = {
  root: THREE.Group;
  photoMesh: THREE.Mesh;
  photoGeometry: THREE.BufferGeometry;
  photoMaterial: THREE.MeshStandardMaterial;
  filmMesh: THREE.Mesh;
  filmGeometry: THREE.BufferGeometry;
  filmMaterial: THREE.MeshStandardMaterial;
  ordinal: number;
  frameIndex: number;
  direction: number;
  worldX: number;
  worldZ: number;
  fadeElapsed: number;
  state: 'pooled' | 'active' | 'fading';
  sections: Section[];
  startPhase: number;
  endPhase: number;
  revealProgress: number;
  laidLength: number;
  completed: boolean;
};

function createRibbonGeometry(capacity: number) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(capacity * 2 * 3);
  const normals = new Float32Array(capacity * 2 * 3);
  const uvs = new Float32Array(capacity * 2 * 2);
  const indices = new Uint16Array((capacity - 1) * 6);

  for (let section = 0; section < capacity; section += 1) {
    for (let side = 0; side < 2; side += 1) {
      const offset = (section * 2 + side) * 3;
      normals[offset + 1] = 1;
    }
  }

  for (let section = 0; section < capacity - 1; section += 1) {
    const vertex = section * 2;
    const offset = section * 6;
    indices.set(
      [vertex, vertex + 1, vertex + 2, vertex + 2, vertex + 1, vertex + 3],
      offset,
    );
  }

  const positionAttribute = new THREE.BufferAttribute(positions, 3);
  const uvAttribute = new THREE.BufferAttribute(uvs, 2);
  positionAttribute.setUsage(THREE.DynamicDrawUsage);
  uvAttribute.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute('position', positionAttribute);
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute('uv', uvAttribute);
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.setDrawRange(0, 0);
  geometry.userData.capacity = capacity;
  return geometry;
}

/** White where film exists, transparent where a sprocket hole is punched. */
function createFilmPatternTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 1024;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.globalCompositeOperation = 'destination-out';

    const holeCount = 8;
    const holeWidth = (0.095 / CONFIG.floor.filmWidth) * canvas.width;
    const holeHeight = 0.058 * canvas.height;
    const railCenter =
      ((CONFIG.floor.filmWidth * 0.5 - 0.135) / CONFIG.floor.filmWidth) * canvas.width;
    const radius = Math.min(holeWidth, holeHeight) * 0.32;

    for (const side of [-1, 1]) {
      const centerX = canvas.width * 0.5 + side * railCenter;
      for (let index = 0; index < holeCount; index += 1) {
        const centerY = ((index + 0.5) / holeCount) * canvas.height;
        context.beginPath();
        context.roundRect(
          centerX - holeWidth * 0.5,
          centerY - holeHeight * 0.5,
          holeWidth,
          holeHeight,
          radius,
        );
        context.fill();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.name = 'film-sprocket-alpha';
  texture.colorSpace = THREE.NoColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  return texture;
}

function interpolateSection(first: Section, second: Section, amount: number): Section {
  const sideX = first.sideX + (second.sideX - first.sideX) * amount;
  const sideZ = first.sideZ + (second.sideZ - first.sideZ) * amount;
  const sideLength = Math.hypot(sideX, sideZ) || 1;
  return {
    x: first.x + (second.x - first.x) * amount,
    z: first.z + (second.z - first.z) * amount,
    sideX: sideX / sideLength,
    sideZ: sideZ / sideLength,
    phase: first.phase + (second.phase - first.phase) * amount,
  };
}

function pushUnique(sections: Section[], section: Section) {
  const previous = sections.at(-1);
  if (
    previous &&
    Math.hypot(previous.x - section.x, previous.z - section.z) < POSITION_EPSILON &&
    Math.abs(previous.phase - section.phase) < PHASE_EPSILON
  ) {
    sections[sections.length - 1] = section;
  } else {
    sections.push(section);
  }
}

function clipSectionsByPhase(sections: Section[], minimum: number, maximum: number) {
  if (sections.length < 2) return [];
  const clipped: Section[] = [];

  for (let index = 0; index < sections.length - 1; index += 1) {
    const first = sections[index];
    const second = sections[index + 1];
    const phaseDelta = second.phase - first.phase;

    if (Math.abs(phaseDelta) < PHASE_EPSILON) {
      if (first.phase >= minimum && first.phase <= maximum) {
        pushUnique(clipped, first);
        pushUnique(clipped, second);
      }
      continue;
    }

    const boundaryA = (minimum - first.phase) / phaseDelta;
    const boundaryB = (maximum - first.phase) / phaseDelta;
    const enter = Math.max(0, Math.min(boundaryA, boundaryB));
    const exit = Math.min(1, Math.max(boundaryA, boundaryB));
    if (exit < enter - PHASE_EPSILON) continue;

    pushUnique(clipped, interpolateSection(first, second, enter));
    pushUnique(clipped, interpolateSection(first, second, exit));
  }

  return clipped;
}

function downsampleSections(sections: Section[], capacity: number) {
  if (sections.length <= capacity) return sections;
  return Array.from({ length: capacity }, (_, index) => {
    const sourceIndex = Math.round((index / (capacity - 1)) * (sections.length - 1));
    return sections[sourceIndex];
  });
}

function writeRibbonGeometry(
  geometry: THREE.BufferGeometry,
  sections: Section[],
  width: number,
  originX: number,
  originZ: number,
  phaseStart: number,
  phaseEnd: number,
) {
  const capacity = geometry.userData.capacity as number;
  const visibleSections = downsampleSections(sections, capacity);
  const positions = geometry.getAttribute('position') as THREE.BufferAttribute;
  const uvs = geometry.getAttribute('uv') as THREE.BufferAttribute;
  const phaseSpan = phaseEnd - phaseStart || 1;

  for (let index = 0; index < visibleSections.length; index += 1) {
    const section = visibleSections[index];
    const halfWidth = width * 0.5;
    const leftX = section.x - section.sideX * halfWidth - originX;
    const leftZ = section.z - section.sideZ * halfWidth - originZ;
    const rightX = section.x + section.sideX * halfWidth - originX;
    const rightZ = section.z + section.sideZ * halfWidth - originZ;
    const vertex = index * 2;
    const textureV = 1 - (section.phase - phaseStart) / phaseSpan;

    positions.setXYZ(vertex, leftX, 0, leftZ);
    positions.setXYZ(vertex + 1, rightX, 0, rightZ);
    uvs.setXY(vertex, 0, textureV);
    uvs.setXY(vertex + 1, 1, textureV);
  }

  positions.needsUpdate = true;
  uvs.needsUpdate = true;
  geometry.setDrawRange(0, Math.max(0, visibleSections.length - 1) * 6);
}

function sectionForPoint(point: { x: number; z: number; heading: number }, phase: number): Section {
  const sideX = -Math.sin(point.heading);
  const sideZ = Math.cos(point.heading);
  return { x: point.x, z: point.z, sideX, sideZ, phase };
}

export class FloorHistory {
  private group: THREE.Group;
  private textures: THREE.Texture[];
  private filmPatternTexture: THREE.Texture;
  private filmColor: THREE.Color;
  private active: PooledItem[] = [];
  private fading: PooledItem | null = null;
  private pool: PooledItem[] = [];
  private currentImprint: PooledItem | null = null;

  constructor({
    scene,
    textures,
    palette,
  }: {
    scene: THREE.Scene;
    textures: THREE.Texture[];
    palette: FilmRollerPalette;
  }) {
    this.group = new THREE.Group();
    this.group.name = 'floor-frames';
    scene.add(this.group);

    this.textures = textures;
    this.filmColor = new THREE.Color(palette.raised);
    this.filmPatternTexture = createFilmPatternTexture();

    for (let index = 0; index < CONFIG.floor.maxActive + 1; index += 1) {
      this.pool.push(this.createPooledItem());
    }
  }

  activeCount(): number {
    return this.active.length + (this.fading ? 1 : 0);
  }

  private createPooledItem(): PooledItem {
    const root = new THREE.Group();
    root.name = 'floor-film-frame';

    const photoGeometry = createRibbonGeometry(CONFIG.floor.ribbonMaxSections);
    const photoMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.72,
      metalness: 0,
      transparent: true,
      depthWrite: false,
      opacity: 1,
      side: THREE.FrontSide,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const photoMesh = new THREE.Mesh(photoGeometry, photoMaterial);
    photoMesh.name = 'floor-frame-progressive';
    photoMesh.position.y = CONFIG.floor.imageY;
    photoMesh.receiveShadow = true;
    photoMesh.frustumCulled = false;
    root.add(photoMesh);

    const filmGeometry = createRibbonGeometry(CONFIG.floor.ribbonMaxSections);
    const filmMaterial = new THREE.MeshStandardMaterial({
      map: this.filmPatternTexture,
      color: this.filmColor,
      roughness: 0.88,
      metalness: 0,
      transparent: true,
      depthWrite: false,
      alphaTest: 0.04,
      opacity: 0.92,
      side: THREE.FrontSide,
      polygonOffset: true,
      polygonOffsetFactor: -0.5,
      polygonOffsetUnits: -0.5,
    });
    const filmMesh = new THREE.Mesh(filmGeometry, filmMaterial);
    filmMesh.name = 'floor-film-progressive';
    filmMesh.position.y = CONFIG.floor.filmY;
    filmMesh.receiveShadow = true;
    filmMesh.frustumCulled = false;
    root.add(filmMesh);

    root.visible = false;
    return {
      root,
      photoMesh,
      photoGeometry,
      photoMaterial,
      filmMesh,
      filmGeometry,
      filmMaterial,
      ordinal: 0,
      frameIndex: 0,
      direction: 1,
      worldX: 0,
      worldZ: 0,
      fadeElapsed: 0,
      state: 'pooled',
      sections: [],
      startPhase: 0,
      endPhase: 0,
      revealProgress: 0,
      laidLength: 0,
      completed: false,
    };
  }

  private acquire(): PooledItem {
    if (this.pool.length === 0 && this.fading) this.finishFade();
    return this.pool.pop() ?? this.createPooledItem();
  }

  /** Chronological render order: the newest strip always prints on top. */
  private syncLayerOrder() {
    const ordered = this.fading ? [this.fading, ...this.active] : this.active;
    for (let index = 0; index < ordered.length; index += 1) {
      const item = ordered[index];
      const distanceFromNewest = ordered.length - index;
      item.filmMesh.renderOrder = -distanceFromNewest * 2;
      item.photoMesh.renderOrder = item.filmMesh.renderOrder + 1;
    }
  }

  private isSameTraversal(ordinal: number, direction: number) {
    return (
      this.currentImprint?.ordinal === ordinal &&
      this.currentImprint?.direction === direction
    );
  }

  private beginImprint({
    ordinal,
    frameIndex,
    direction,
    start,
  }: {
    ordinal: number;
    frameIndex: number;
    direction: number;
    start: ImprintPoint;
  }): PooledItem {
    const item = this.acquire();
    const firstSection = sectionForPoint(start, start.phase);
    item.ordinal = ordinal;
    item.frameIndex = frameIndex;
    item.direction = direction;
    item.worldX = start.x;
    item.worldZ = start.z;
    item.fadeElapsed = 0;
    item.state = 'active';
    item.sections = [firstSection];
    item.startPhase = start.phase;
    item.endPhase = start.phase;
    item.revealProgress = 0;
    item.laidLength = 0;
    item.completed = false;
    item.photoMaterial.map = this.textures[frameIndex];
    item.photoMaterial.opacity = 1;
    item.photoMaterial.needsUpdate = true;
    item.filmMaterial.opacity = 0.92;
    item.root.position.set(item.worldX, 0, item.worldZ);
    item.root.rotation.set(0, 0, 0);
    item.root.visible = false;
    this.group.add(item.root);
    this.active.push(item);
    this.currentImprint = item;

    if (this.active.length > CONFIG.floor.maxActive) {
      if (this.fading) this.finishFade();
      const oldest = this.active.shift();
      if (oldest) this.startFade(oldest);
    }
    this.syncLayerOrder();

    return item;
  }

  private rebuildGeometry(item: PooledItem) {
    const photoSections = clipSectionsByPhase(
      item.sections,
      PHOTO_PHASE_START,
      PHOTO_PHASE_END,
    );
    writeRibbonGeometry(
      item.filmGeometry,
      item.sections,
      CONFIG.floor.filmWidth,
      item.worldX,
      item.worldZ,
      0,
      1,
    );
    writeRibbonGeometry(
      item.photoGeometry,
      photoSections,
      CONFIG.floor.imageWidth,
      item.worldX,
      item.worldZ,
      PHOTO_PHASE_START,
      PHOTO_PHASE_END,
    );
    item.root.visible = item.sections.length >= 2;
  }

  layChunk({
    ordinal,
    frameIndex,
    direction,
    start,
    end,
  }: {
    ordinal: number;
    frameIndex: number;
    direction: number;
    start: ImprintPoint;
    end: ImprintPoint;
  }) {
    if (!this.isSameTraversal(ordinal, direction) && this.currentImprint) {
      this.completeCurrent();
    }

    const item = this.isSameTraversal(ordinal, direction)
      ? (this.currentImprint as PooledItem)
      : this.beginImprint({ ordinal, frameIndex, direction, start });

    const endSection = sectionForPoint(end, end.phase);
    const previous = item.sections.at(-1) as Section;
    const segmentLength = Math.hypot(
      endSection.x - previous.x,
      endSection.z - previous.z,
    );
    if (segmentLength >= POSITION_EPSILON) {
      item.sections.push(endSection);
      item.laidLength += segmentLength;
    } else {
      item.sections[item.sections.length - 1] = endSection;
    }
    item.endPhase = end.phase;
    item.revealProgress = Math.min(1, Math.abs(item.endPhase - item.startPhase));
    this.rebuildGeometry(item);

    if (item.revealProgress >= 1 - PHASE_EPSILON) {
      this.completeCurrent();
    }
  }

  /** The opening state: frame 01 already half-laid behind the contact point. */
  seedInitialHalf({
    contact,
    heading,
  }: {
    contact: { x: number; z: number };
    heading: number;
  }) {
    const directionX = Math.cos(heading);
    const directionZ = Math.sin(heading);
    const laidDistance = FLOOR_PITCH * CONFIG.floor.initialReveal;
    this.layChunk({
      ordinal: 0,
      frameIndex: 0,
      direction: 1,
      start: {
        x: contact.x - directionX * laidDistance,
        z: contact.z - directionZ * laidDistance,
        heading,
        phase: 0,
      },
      end: {
        x: contact.x,
        z: contact.z,
        heading,
        phase: CONFIG.floor.initialReveal,
      },
    });
  }

  private completeCurrent() {
    if (!this.currentImprint) return;
    const item = this.currentImprint;
    item.completed = item.revealProgress >= 1 - PHASE_EPSILON;
    this.currentImprint = null;
  }

  private startFade(item: PooledItem) {
    item.state = 'fading';
    item.fadeElapsed = 0;
    this.fading = item;
    this.syncLayerOrder();
  }

  private finishFade() {
    if (!this.fading) return;
    const item = this.fading;
    item.photoMaterial.opacity = 0;
    item.filmMaterial.opacity = 0;
    item.root.visible = false;
    this.group.remove(item.root);
    item.photoMaterial.map = null;
    item.photoGeometry.setDrawRange(0, 0);
    item.filmGeometry.setDrawRange(0, 0);
    item.sections = [];
    item.state = 'pooled';
    item.completed = false;
    this.pool.push(item);
    this.fading = null;
    this.syncLayerOrder();
  }

  update(deltaTime: number, renderOrigin: { x: number; z: number }) {
    this.syncLayerOrder();
    for (const item of this.active) {
      item.root.position.x = item.worldX - renderOrigin.x;
      item.root.position.z = item.worldZ - renderOrigin.z;
    }

    if (!this.fading) return;
    this.fading.root.position.x = this.fading.worldX - renderOrigin.x;
    this.fading.root.position.z = this.fading.worldZ - renderOrigin.z;
    this.fading.fadeElapsed += Math.max(0, deltaTime);
    const progress = Math.min(1, this.fading.fadeElapsed / CONFIG.floor.fadeDuration);
    const opacity = 1 - easeOutCubic(progress);
    this.fading.photoMaterial.opacity = opacity;
    this.fading.filmMaterial.opacity = opacity * 0.92;
    if (progress >= 1) this.finishFade();
  }

  dispose() {
    this.group.removeFromParent();
    this.filmPatternTexture.dispose();
    const items = new Set([
      ...this.active,
      ...this.pool,
      ...(this.fading ? [this.fading] : []),
    ]);
    for (const item of items) {
      item.photoGeometry.dispose();
      item.filmGeometry.dispose();
      item.photoMaterial.dispose();
      item.filmMaterial.dispose();
    }
    this.active.length = 0;
    this.pool.length = 0;
    this.fading = null;
    this.currentImprint = null;
  }
}
