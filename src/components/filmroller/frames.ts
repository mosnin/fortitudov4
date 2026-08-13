/**
 * The four blank frames — this port's replacement for the upstream
 * `portraits.js` + `assets.js` pair.
 *
 * Upstream shipped four WebP portraits (a botanist, an astronaut, a
 * ceramicist, a dancer) and loaded them over the network with a canvas
 * fallback. None of that survives: the people in those photographs are not
 * Fortitudo clients, and nothing on the logged-out site is invented — a
 * placeholder here is a VISIBLY blank frame, not somebody else's photograph
 * standing in for work we have not done. So the loader, the progress bar and
 * the fallback path are all gone, and every frame is drawn synchronously on a
 * canvas: paper, a hairline keyline, and a small corner index. When there is
 * client work we are allowed to show, it replaces these frames; until then
 * they are empty on purpose, and the page copy says so.
 *
 * Same texture contract as upstream: four 3:4 cells, one `CanvasTexture`
 * each for the floor imprints, plus a single repeating atlas for the drum
 * band with the same edge-gutter trick (each cell's first and last column
 * smeared a few pixels so mipmapped sampling at the seam does not bleed the
 * neighbouring frame in).
 */

import * as THREE from 'three';
import type { FilmRollerPalette } from './palette';

export const FRAME_COUNT = 4;

const CELL_WIDTH = 768;
const CELL_HEIGHT = 1024;

function drawBlankFrame(
  context: CanvasRenderingContext2D,
  index: number,
  palette: FilmRollerPalette,
): void {
  context.fillStyle = palette.paper;
  context.fillRect(0, 0, CELL_WIDTH, CELL_HEIGHT);

  // A whisper of vertical shading so the paper reads as lit, not as a flat
  // fill — the same trick upstream's fallback card used, much quieter.
  const shade = context.createLinearGradient(0, 0, 0, CELL_HEIGHT);
  shade.addColorStop(0, 'rgba(0,0,0,0)');
  shade.addColorStop(1, 'rgba(0,0,0,0.05)');
  context.fillStyle = shade;
  context.fillRect(0, 0, CELL_WIDTH, CELL_HEIGHT);

  // The keyline that says "frame, awaiting its print".
  context.strokeStyle = palette.ink;
  context.globalAlpha = 0.22;
  context.lineWidth = 3;
  context.strokeRect(54, 54, CELL_WIDTH - 108, CELL_HEIGHT - 108);

  // Corner index, small and structural — an empty archive still numbers its
  // sleeves. Not a caption, not content.
  context.globalAlpha = 0.38;
  context.fillStyle = palette.ink;
  context.font = '500 34px ui-monospace, SFMono-Regular, Menlo, monospace';
  context.textAlign = 'right';
  context.textBaseline = 'alphabetic';
  context.fillText(
    `${String(index + 1).padStart(2, '0')} / ${String(FRAME_COUNT).padStart(2, '0')}`,
    CELL_WIDTH - 84,
    CELL_HEIGHT - 88,
  );
  context.globalAlpha = 1;
}

function configureTexture(texture: THREE.Texture, renderer: THREE.WebGLRenderer): THREE.Texture {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

/** One texture per frame, for the floor imprints. */
export function createFrameTextures(
  renderer: THREE.WebGLRenderer,
  palette: FilmRollerPalette,
): THREE.Texture[] {
  return Array.from({ length: FRAME_COUNT }, (_, index) => {
    const canvas = document.createElement('canvas');
    canvas.width = CELL_WIDTH;
    canvas.height = CELL_HEIGHT;
    const context = canvas.getContext('2d');
    if (context) drawBlankFrame(context, index, palette);
    return configureTexture(new THREE.CanvasTexture(canvas), renderer);
  });
}

/**
 * The drum band's repeating atlas: all four frames side by side.
 *
 * Each cell is drawn MIRRORED. The band geometry samples the atlas
 * x-reversed within a cell (`(frameIndex + (1 - widthT)) / frameCount` in
 * `roller.ts`) — physically right for a stamp unrolling onto the floor, and
 * invisible on upstream's photographs, but on OUR frames the corner index is
 * text, and text sampled backwards reads backwards on the drum. Pre-flipping
 * the cell cancels the reversed sampling, so the glyphs read correctly both
 * on the drum and in the floor prints (which use the unflipped per-frame
 * textures).
 */
export function createFrameAtlas(
  frameTextures: THREE.Texture[],
  renderer: THREE.WebGLRenderer,
): THREE.Texture {
  const gutter = 8;
  const canvas = document.createElement('canvas');
  canvas.width = CELL_WIDTH * frameTextures.length;
  canvas.height = CELL_HEIGHT;
  const context = canvas.getContext('2d');

  if (context) {
    for (let index = 0; index < frameTextures.length; index += 1) {
      const image = frameTextures[index].image as HTMLCanvasElement;
      const x = index * CELL_WIDTH;
      context.save();
      context.translate(x + CELL_WIDTH, 0);
      context.scale(-1, 1);
      context.drawImage(image, 0, 0, CELL_WIDTH, CELL_HEIGHT);
      context.restore();
      // Edge smear against mipmap seam bleed, as upstream — sampled from the
      // columns that now sit at each edge of the flipped cell.
      context.drawImage(image, image.width - 1, 0, 1, image.height, x, 0, gutter, CELL_HEIGHT);
      context.drawImage(image, 0, 0, 1, image.height, x + CELL_WIDTH - gutter, 0, gutter, CELL_HEIGHT);
    }
  }

  const atlas = new THREE.CanvasTexture(canvas);
  atlas.colorSpace = THREE.SRGBColorSpace;
  atlas.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  atlas.wrapS = THREE.RepeatWrapping;
  atlas.wrapT = THREE.ClampToEdgeWrapping;
  atlas.needsUpdate = true;
  return atlas;
}
