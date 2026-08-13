/**
 * The drum — ported from karthi-98/filmroller (`src/roller.js`).
 *
 * Geometry is untouched: a custom band whose UVs walk the four-frame atlas
 * BACKWARDS around the circumference, so the image rolling into ground
 * contact is the image being laid on the floor — the no-slip illusion is in
 * these UVs plus `rotationForDistance`, nothing else.
 *
 * Materials are the port: upstream's porcelain-and-brass gallery hardware
 * becomes this site's vocabulary. Paper band (it wraps the blank frames),
 * near-black metal for the rings and hubs, and the single racing-yellow
 * accent on each end cap's index mark — the dot that lets you SEE the drum
 * turn. Yellow spends exactly one dot per face here, nothing more.
 */

import * as THREE from 'three';
import { CONFIG, ROLLER_RADIUS } from './config';
import type { FilmRollerPalette } from './palette';

function createFrameBandGeometry({
  radius,
  width,
  frameCount,
  radialSegments,
}: {
  radius: number;
  width: number;
  frameCount: number;
  radialSegments: number;
}) {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const segmentAngle = (Math.PI * 2) / frameCount;
  const subdivisions = Math.max(4, Math.floor(radialSegments / frameCount));

  for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
    const startAngle = (frameIndex - 0.5) * segmentAngle;

    for (let slice = 0; slice < subdivisions; slice += 1) {
      const t0 = slice / subdivisions;
      const t1 = (slice + 1) / subdivisions;
      const angle0 = startAngle + t0 * segmentAngle;
      const angle1 = startAngle + t1 * segmentAngle;
      const baseIndex = positions.length / 3;

      const appendVertex = (
        angle: number,
        z: number,
        widthT: number,
        verticalT: number,
      ) => {
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);
        positions.push(radius * sin, -radius * cos, z);
        normals.push(sin, -cos, 0);
        uvs.push((frameIndex + (1 - widthT)) / frameCount, 1 - verticalT);
      };

      appendVertex(angle0, -width * 0.5, 0, t0);
      appendVertex(angle0, width * 0.5, 1, t0);
      appendVertex(angle1, -width * 0.5, 0, t1);
      appendVertex(angle1, width * 0.5, 1, t1);

      indices.push(
        baseIndex,
        baseIndex + 2,
        baseIndex + 1,
        baseIndex + 2,
        baseIndex + 3,
        baseIndex + 1,
      );
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}

function createEndAssembly(
  radius: number,
  z: number,
  isFront: boolean,
  palette: FilmRollerPalette,
) {
  const assembly = new THREE.Group();
  assembly.position.z = z;
  if (!isFront) assembly.rotation.y = Math.PI;

  const paper = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(palette.paper),
    roughness: 0.55,
    metalness: 0.02,
    clearcoat: 0.18,
    clearcoatRoughness: 0.72,
  });
  const darkMetal = new THREE.MeshStandardMaterial({
    color: new THREE.Color(palette.raised),
    roughness: 0.34,
    metalness: 0.6,
  });
  const accent = new THREE.MeshStandardMaterial({
    color: new THREE.Color(palette.yellow),
    roughness: 0.4,
    metalness: 0.1,
  });

  const cap = new THREE.Mesh(new THREE.CircleGeometry(radius * 0.82, 96), paper);
  cap.castShadow = true;
  cap.receiveShadow = true;
  assembly.add(cap);

  const outerRing = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 0.845, radius * 0.055, 16, 96),
    darkMetal,
  );
  outerRing.position.z = 0.018;
  outerRing.castShadow = true;
  assembly.add(outerRing);

  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.22, radius * 0.25, 0.15, 64),
    darkMetal,
  );
  hub.rotation.x = Math.PI * 0.5;
  hub.position.z = 0.07;
  hub.castShadow = true;
  assembly.add(hub);

  const hubInset = new THREE.Mesh(new THREE.CircleGeometry(radius * 0.105, 48), darkMetal);
  hubInset.position.z = 0.152;
  assembly.add(hubInset);

  // The one yellow thing on the piece: the index mark that makes the
  // rotation legible. Upstream made it brass; here it is the accent token.
  const indexMark = new THREE.Mesh(new THREE.CircleGeometry(radius * 0.026, 24), accent);
  indexMark.position.set(radius * 0.52, 0, 0.025);
  assembly.add(indexMark);

  return assembly;
}

export type RollerHandle = ReturnType<typeof createRoller>;

export function createRoller(
  atlasTexture: THREE.Texture,
  frameCount: number,
  palette: FilmRollerPalette,
) {
  const root = new THREE.Group();
  root.name = 'film-roller';
  root.position.y = ROLLER_RADIUS + 0.015;

  const spin = new THREE.Group();
  spin.name = 'roller-spin';
  root.add(spin);

  const bandGeometry = createFrameBandGeometry({
    radius: ROLLER_RADIUS,
    width: CONFIG.roller.width,
    frameCount,
    radialSegments: CONFIG.roller.radialSegments,
  });
  const bandMaterial = new THREE.MeshStandardMaterial({
    map: atlasTexture,
    color: 0xffffff,
    roughness: 0.66,
    metalness: 0,
  });
  const band = new THREE.Mesh(bandGeometry, bandMaterial);
  band.name = 'frame-band';
  band.castShadow = true;
  band.receiveShadow = true;
  spin.add(band);

  const edgeMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(palette.raised),
    roughness: 0.55,
    metalness: 0.2,
  });
  for (const z of [-CONFIG.roller.width * 0.5, CONFIG.roller.width * 0.5]) {
    const edge = new THREE.Mesh(
      new THREE.TorusGeometry(ROLLER_RADIUS * 0.975, ROLLER_RADIUS * 0.025, 12, 96),
      edgeMaterial,
    );
    edge.position.z = z;
    edge.castShadow = true;
    spin.add(edge);
  }

  const back = createEndAssembly(
    ROLLER_RADIUS,
    -CONFIG.roller.width * 0.5 - 0.018,
    false,
    palette,
  );
  const front = createEndAssembly(
    ROLLER_RADIUS,
    CONFIG.roller.width * 0.5 + 0.018,
    true,
    palette,
  );
  spin.add(back, front);

  // A soft painted contact shadow under the drum — on a dark floor it is
  // nearly subliminal, but it is what keeps the drum ON the ground rather
  // than hovering a pixel above it.
  const contactShadowMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
  });
  const contactShadow = new THREE.Mesh(
    new THREE.CircleGeometry(1, 64),
    contactShadowMaterial,
  );
  contactShadow.rotation.x = -Math.PI * 0.5;
  contactShadow.scale.set(1.85, 0.48, 1);
  contactShadow.position.y = -ROLLER_RADIUS - 0.004;
  contactShadow.renderOrder = 1;
  root.add(contactShadow);

  return {
    root,
    radius: ROLLER_RADIUS,
    setPose(localX: number, localZ: number, rotation: number, yaw = 0) {
      root.position.x = localX;
      root.position.z = localZ;
      root.rotation.y = yaw;
      spin.rotation.z =
        THREE.MathUtils.euclideanModulo(rotation + Math.PI, Math.PI * 2) - Math.PI;
    },
    dispose() {
      root.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry?.dispose();
        const material = object.material as THREE.Material | THREE.Material[];
        if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
        else material?.dispose();
      });
    },
  };
}
