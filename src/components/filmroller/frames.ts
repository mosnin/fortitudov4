/**
 * The four film frames — this port's replacement for the upstream
 * `portraits.js` + `assets.js` pair.
 *
 * WHAT IS IN THE FRAMES, AND WHY IT IS ALLOWED TO BE. Upstream shipped four
 * portraits of people who are nobody's clients here, which is exactly the
 * kind of invented content this site bans. The frames now carry STOCK
 * photography, by explicit request — but chosen so it cannot be mistaken for
 * client work: monochrome landscapes and structures, no people, no products,
 * no screens. Atmosphere, visibly, not portfolio. The caption under the
 * section says so in words. The four files live in `public/filmroller/`
 * (Unsplash, whose license permits commercial use without attribution;
 * sources listed below), served same-origin so the textures never taint.
 *
 *   frame-01  photo-1502691876148-a84978e59af8  timber corridor
 *   frame-02  photo-1481026469463-66327c86e544  glass facade
 *   frame-03  photo-1449034446853-66c86144b0ad  suspension bridge
 *   frame-04  photo-1519681393784-d120267933ba  mountain night sky
 *
 * All four are requested desaturated (`sat=-100`) and stay monochrome ON
 * PURPOSE: the piece sits on a racing-yellow ground, and this surface's rule
 * is that no third hue joins yellow and ink — black-and-white film is the
 * only photography that obeys it.
 *
 * LOADING. The engine builds synchronously, so every frame starts as drawn
 * paper (keyline + corner index) and the photographs stream in over it:
 * each arrival repaints that frame's canvas, flags its floor texture, and
 * rebuilds the drum atlas. A failed load simply leaves that frame as paper —
 * the mechanism cannot break for missing art.
 *
 * Texture contract as upstream: four 3:4 cells, one `CanvasTexture` each for
 * the floor imprints, plus one repeating atlas for the drum whose cells are
 * drawn MIRRORED — the band samples x-reversed within a cell (physically
 * right for a stamp), and pre-flipping cancels that so the corner indices
 * read correctly both on the drum and on the floor. The edge-gutter smear
 * against mipmap seam bleed also survives.
 */

import * as THREE from 'three';
import type { FilmRollerPalette } from './palette';

export const FRAME_COUNT = 4;

const CELL_WIDTH = 768;
const CELL_HEIGHT = 1024;

function drawIndex(context: CanvasRenderingContext2D, index: number, onPhoto: boolean) {
  const label = `${String(index + 1).padStart(2, '0')} / ${String(FRAME_COUNT).padStart(2, '0')}`;
  context.font = '500 34px ui-monospace, SFMono-Regular, Menlo, monospace';
  context.textAlign = 'right';
  context.textBaseline = 'alphabetic';
  if (onPhoto) {
    // On a photograph the index needs its own contrast, whatever the corner
    // holds: white text over a soft dark pad.
    context.globalAlpha = 0.55;
    context.fillStyle = '#000000';
    const w = context.measureText(label).width;
    context.fillRect(CELL_WIDTH - 84 - w - 18, CELL_HEIGHT - 88 - 34, w + 36, 52);
    context.globalAlpha = 0.92;
    context.fillStyle = '#ffffff';
  } else {
    context.globalAlpha = 0.38;
  }
  context.fillText(label, CELL_WIDTH - 84, CELL_HEIGHT - 88);
  context.globalAlpha = 1;
}

function drawPaperFrame(
  context: CanvasRenderingContext2D,
  index: number,
  palette: FilmRollerPalette,
): void {
  context.fillStyle = palette.paper;
  context.fillRect(0, 0, CELL_WIDTH, CELL_HEIGHT);

  const shade = context.createLinearGradient(0, 0, 0, CELL_HEIGHT);
  shade.addColorStop(0, 'rgba(0,0,0,0)');
  shade.addColorStop(1, 'rgba(0,0,0,0.05)');
  context.fillStyle = shade;
  context.fillRect(0, 0, CELL_WIDTH, CELL_HEIGHT);

  context.strokeStyle = palette.ink;
  context.globalAlpha = 0.22;
  context.lineWidth = 3;
  context.strokeRect(54, 54, CELL_WIDTH - 108, CELL_HEIGHT - 108);
  context.globalAlpha = 1;
  context.fillStyle = palette.ink;
  drawIndex(context, index, false);
}

/** Draw `image` to fill the cell, centre-cropped, then the index over it. */
function drawPhotoFrame(
  context: CanvasRenderingContext2D,
  index: number,
  image: HTMLImageElement,
) {
  const scale = Math.max(CELL_WIDTH / image.width, CELL_HEIGHT / image.height);
  const w = image.width * scale;
  const h = image.height * scale;
  context.drawImage(image, (CELL_WIDTH - w) / 2, (CELL_HEIGHT - h) / 2, w, h);
  drawIndex(context, index, true);
}

function configureTexture(texture: THREE.Texture, renderer: THREE.WebGLRenderer): THREE.Texture {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

/** One texture per frame, for the floor imprints. Starts as paper. */
export function createFrameTextures(
  renderer: THREE.WebGLRenderer,
  palette: FilmRollerPalette,
): THREE.Texture[] {
  return Array.from({ length: FRAME_COUNT }, (_, index) => {
    const canvas = document.createElement('canvas');
    canvas.width = CELL_WIDTH;
    canvas.height = CELL_HEIGHT;
    const context = canvas.getContext('2d');
    if (context) drawPaperFrame(context, index, palette);
    return configureTexture(new THREE.CanvasTexture(canvas), renderer);
  });
}

/** Redraw the atlas canvas from the frame canvases (cells pre-flipped). */
function paintAtlas(atlasCanvas: HTMLCanvasElement, frameTextures: THREE.Texture[]) {
  const gutter = 8;
  const context = atlasCanvas.getContext('2d');
  if (!context) return;
  for (let index = 0; index < frameTextures.length; index += 1) {
    const image = frameTextures[index].image as HTMLCanvasElement;
    const x = index * CELL_WIDTH;
    context.save();
    context.translate(x + CELL_WIDTH, 0);
    context.scale(-1, 1);
    context.drawImage(image, 0, 0, CELL_WIDTH, CELL_HEIGHT);
    context.restore();
    context.drawImage(image, image.width - 1, 0, 1, image.height, x, 0, gutter, CELL_HEIGHT);
    context.drawImage(image, 0, 0, 1, image.height, x + CELL_WIDTH - gutter, 0, gutter, CELL_HEIGHT);
  }
}

/** The drum band's repeating atlas: all four frames side by side. */
export function createFrameAtlas(
  frameTextures: THREE.Texture[],
  renderer: THREE.WebGLRenderer,
): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = CELL_WIDTH * frameTextures.length;
  canvas.height = CELL_HEIGHT;
  paintAtlas(canvas, frameTextures);

  const atlas = new THREE.CanvasTexture(canvas);
  atlas.colorSpace = THREE.SRGBColorSpace;
  atlas.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  atlas.wrapS = THREE.RepeatWrapping;
  atlas.wrapT = THREE.ClampToEdgeWrapping;
  atlas.needsUpdate = true;
  return atlas;
}

/**
 * Stream the photographs in over the paper frames. Each arrival repaints one
 * frame canvas and rebuilds the atlas; `onFrameLoaded` lets a still renderer
 * paint the update. Failures are silent by design — paper is a complete
 * fallback, not an error state.
 */
export function loadFrameArt({
  frameTextures,
  atlas,
  urls,
  onFrameLoaded = () => {},
}: {
  frameTextures: THREE.Texture[];
  atlas: THREE.Texture;
  urls: readonly string[];
  onFrameLoaded?: () => void;
}): () => void {
  let cancelled = false;

  urls.slice(0, frameTextures.length).forEach((url, index) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      if (cancelled) return;
      const canvas = frameTextures[index].image as HTMLCanvasElement;
      const context = canvas.getContext('2d');
      if (!context) return;
      drawPhotoFrame(context, index, image);
      frameTextures[index].needsUpdate = true;
      paintAtlas(atlas.image as HTMLCanvasElement, frameTextures);
      atlas.needsUpdate = true;
      onFrameLoaded();
    };
    image.src = url;
  });

  return () => {
    cancelled = true;
  };
}
