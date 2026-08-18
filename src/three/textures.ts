import * as THREE from "three";

// Procedurally generated, pixelated Minecraft-style block textures.
// Nothing here is a copyrighted asset — every texture is drawn on a canvas at runtime.

const cache = new Map();

function canvasTexture(key, size, draw) {
  if (cache.has(key)) return cache.get(key);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  draw(ctx, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  cache.set(key, tex);
  return tex;
}

function speckle(ctx, size, base, variants, pixel = 2) {
  for (let y = 0; y < size; y += pixel) {
    for (let x = 0; x < size; x += pixel) {
      const c = Math.random() < 0.7 ? base : variants[Math.floor(Math.random() * variants.length)];
      ctx.fillStyle = c;
      ctx.fillRect(x, y, pixel, pixel);
    }
  }
}

export function pixelTexture(key, base, variants, size = 16, pixel = 2) {
  return canvasTexture(key, size, (ctx) => speckle(ctx, size, toHexString(base), variants, pixel));
}

export function grassTopTexture(tint = "#4fbf4f") {
  return pixelTexture(`grass-top-${tint}`, tint, [
    lighten(tint, 18),
    darken(tint, 12),
    lighten(tint, 30),
  ]);
}

export function grassSideTexture(tint = "#4fbf4f") {
  return canvasTexture(`grass-side-${tint}`, 16, (ctx) => {
    speckle(ctx, 16, "#6b4a33", ["#5c3f2b", "#7a5539", "#4d3524"]);
    for (let x = 0; x < 16; x += 2) {
      ctx.fillStyle = Math.random() < 0.8 ? tint : lighten(tint, 20);
      ctx.fillRect(x, 0, 2, 4 + (Math.random() < 0.3 ? 2 : 0));
    }
  });
}

export function dirtTexture() {
  return pixelTexture("dirt", "#6b4a33", ["#5c3f2b", "#7a5539", "#4d3524"]);
}

export function stoneTexture(tint = "#8a8a93") {
  return pixelTexture(`stone-${tint}`, tint, [lighten(tint, 10), darken(tint, 10), darken(tint, 20)]);
}

export function snowTexture() {
  return pixelTexture("snow", "#eef4fb", ["#ffffff", "#dce6f2", "#c9d8ea"]);
}

export function sandTexture() {
  return pixelTexture("sand", "#dfd0a0", ["#e8dcb0", "#cfc090", "#f0e6c0"]);
}

export function obsidianTexture() {
  return pixelTexture("obsidian", "#0c0a16", ["#160e26", "#1c1130", "#241540"]);
}

export function netherrackTexture() {
  return pixelTexture("netherrack", "#5b1f1f", ["#4a1717", "#6b2828", "#3a1010"]);
}

export function endStoneTexture() {
  return pixelTexture("endstone", "#d9d3a8", ["#e6e0b8", "#c9c398", "#efe9c8"]);
}

export function crystalBaseTexture(tint = "#2a1140") {
  return pixelTexture(`crystalbase-${tint}`, tint, [lighten(tint, 15), darken(tint, 10)]);
}

export function planksTexture(tint = "#a5763a") {
  return canvasTexture(`planks-${tint}`, 16, (ctx) => {
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, 16, 16);
    ctx.strokeStyle = darken(tint, 25);
    ctx.lineWidth = 1;
    for (let y = 0; y <= 16; y += 4) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(16, y + 0.5);
      ctx.stroke();
    }
  });
}

export function logTexture(tint = "#5c4326") {
  return canvasTexture(`log-${tint}`, 16, (ctx) => {
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, 16, 16);
    ctx.strokeStyle = darken(tint, 20);
    for (let x = 0; x < 16; x += 3) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 16);
      ctx.stroke();
    }
  });
}

export function leavesTexture(tint = "#3fae4f") {
  return pixelTexture(`leaves-${tint}`, tint, [lighten(tint, 20), darken(tint, 15), lighten(tint, 35)], 16, 2);
}

export function glowTexture(tint = "#ffd76b") {
  return pixelTexture(`glow-${tint}`, tint, [lighten(tint, 25), "#ffffff"], 16, 2);
}

export function bookshelfTexture() {
  return canvasTexture("bookshelf", 16, (ctx) => {
    ctx.fillStyle = "#6b4a33";
    ctx.fillRect(0, 0, 16, 16);
    const colors = ["#c0392b", "#2980b9", "#27ae60", "#f1c40f", "#8e44ad"];
    for (let x = 0; x < 16; x += 2) {
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.fillRect(x, 2, 1, 12);
    }
  });
}

function toHexString(color) {
  if (typeof color === "number") {
    return `#${color.toString(16).padStart(6, "0")}`;
  }
  return color;
}

function lighten(hex, amt) {
  return shade(hex, amt);
}
function darken(hex, amt) {
  return shade(hex, -amt);
}
function shade(hex, amt) {
  const c = toHexString(hex).replace("#", "");
  const num = parseInt(c, 16);
  let r = (num >> 16) + amt;
  let g = ((num >> 8) & 0x00ff) + amt;
  let b = (num & 0x0000ff) + amt;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function blockMaterials({ top, side, bottom }: { top?: THREE.Texture; side: THREE.Texture; bottom?: THREE.Texture }) {
  const sideMat = new THREE.MeshStandardMaterial({ map: side, roughness: 0.9 });
  const topMat = new THREE.MeshStandardMaterial({ map: top || side, roughness: 0.9 });
  const bottomMat = new THREE.MeshStandardMaterial({ map: bottom || side, roughness: 0.9 });
  // BoxGeometry face order: +x -x +y -y +z -z
  return [sideMat, sideMat, topMat, bottomMat, sideMat, sideMat];
}
