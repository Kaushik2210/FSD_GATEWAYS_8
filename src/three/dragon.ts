import * as THREE from "three";
import { blockMaterials, crystalBaseTexture } from "./textures";

const BLOCK_GEO = new THREE.BoxGeometry(1, 1, 1);

function block(mats, x, y, z, sx = 1, sy = sx, sz = sx) {
  const m = new THREE.Mesh(BLOCK_GEO, mats);
  m.position.set(x, y, z);
  m.scale.set(sx, sy, sz);
  return m;
}

function glowify(mats, color, intensity) {
  mats.forEach((m) => {
    m.emissive = new THREE.Color(color);
    m.emissiveIntensity = intensity;
  });
  return mats;
}

// A procedurally built, low-poly voxel "Ender Dragon" — no copyrighted assets,
// bright neon-purple/magenta scales so it reads clearly against the dark sky.
export function buildDragon() {
  const root = new THREE.Group();

  const scaleMats = glowify(blockMaterials({ side: crystalBaseTexture("#a855ff") }), 0xa855ff, 0.9);
  const darkMats = glowify(blockMaterials({ side: crystalBaseTexture("#ff3ec9") }), 0xff3ec9, 0.6);

  // spine / body — tapering chain of boxes along Z (nose points +Z)
  const spineLengths = [1.5, 1.7, 1.6, 1.3, 1.0, 0.75, 0.55, 0.4, 0.3];
  const spine = new THREE.Group();
  spineLengths.forEach((s, i) => {
    const seg = block(i % 2 === 0 ? scaleMats : darkMats, 0, Math.sin(i * 0.4) * 0.1, i * 1.1, s, s * 0.85, 1.05);
    spine.add(seg);
  });
  root.add(spine);

  // tail tip glow
  const tipGeo = new THREE.OctahedronGeometry(0.3, 0);
  const tipMat = new THREE.MeshStandardMaterial({
    color: 0xb96bff,
    emissive: 0xb96bff,
    emissiveIntensity: 2.2,
    roughness: 0.2,
  });
  const tailTip = new THREE.Mesh(tipGeo, tipMat);
  tailTip.position.set(0, 0, spineLengths.length * 1.1 + 0.4);
  root.add(tailTip);

  // neck + head extend backward (-Z) from the front of the spine chain
  const neck = new THREE.Group();
  const neckLengths = [0.9, 0.75, 0.6];
  neckLengths.forEach((s, i) => {
    neck.add(block(scaleMats, 0, 0.15 + i * 0.12, -1.1 - i * 0.9, s, s, s * 1.1));
  });
  const head = block(darkMats, 0, 0.55, -1.1 - neckLengths.length * 0.9, 0.85, 0.6, 1.2);
  neck.add(head);

  // horns
  const hornMat = new THREE.MeshStandardMaterial({ color: 0xd9d3a8, roughness: 0.5 });
  const hornGeo = new THREE.ConeGeometry(0.1, 0.5, 5);
  [-0.3, 0.3].forEach((x) => {
    const horn = new THREE.Mesh(hornGeo, hornMat);
    horn.position.set(x, 1.1, -1.1 - neckLengths.length * 0.9 + 0.2);
    horn.rotation.x = -0.4;
    neck.add(horn);
  });

  // eyes
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xff3ec9, emissive: 0xff3ec9, emissiveIntensity: 3 });
  const eyeGeo = new THREE.SphereGeometry(0.08, 8, 8);
  [-0.32, 0.32].forEach((x) => {
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(x, 0.65, -1.1 - neckLengths.length * 0.9 - 0.55);
    neck.add(eye);
  });
  root.add(neck);

  // wings — pivot groups at the shoulders so they can flap
  function buildWing(sign) {
    const pivot = new THREE.Group();
    pivot.position.set(sign * 0.7, 0.5, 1.4);

    const boneMats = glowify(blockMaterials({ side: crystalBaseTexture("#38f2ff") }), 0x38f2ff, 1.4);
    const bones = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      bones.add(block(boneMats, sign * (0.9 + i * 0.9), -i * 0.15, 0, 0.9, 0.18, 0.22));
    }
    pivot.add(bones);

    const membraneGeo = new THREE.PlaneGeometry(4.2, 2.4);
    const membraneMat = new THREE.MeshStandardMaterial({
      color: 0x4a1f80,
      emissive: 0xb96bff,
      emissiveIntensity: 1.1,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
      roughness: 0.5,
    });
    const membrane = new THREE.Mesh(membraneGeo, membraneMat);
    membrane.position.set(sign * 2.4, -0.7, 0);
    membrane.rotation.y = sign * 0.15;
    pivot.add(membrane);

    return pivot;
  }
  const wingL = buildWing(-1);
  const wingR = buildWing(1);
  root.add(wingL, wingR);

  root.userData.wingL = wingL;
  root.userData.wingR = wingR;
  root.userData.head = head;
  root.userData.tailTip = tailTip;

  // face the dragon so its head (-Z) leads in the +X travel direction
  root.rotation.y = -Math.PI / 2;

  return root;
}

export function animateDragon(dragon, t) {
  const flap = Math.sin(t * 9);
  dragon.userData.wingL.rotation.z = 0.2 + flap * 0.65;
  dragon.userData.wingR.rotation.z = -0.2 - flap * 0.65;
  dragon.userData.head.rotation.x = Math.sin(t * 2.2) * 0.08;
  dragon.userData.tailTip.rotation.y = t * 3;
  const scalePulse = 1 + Math.sin(t * 9) * 0.03;
  dragon.userData.wingL.scale.setScalar(scalePulse);
  dragon.userData.wingR.scale.setScalar(scalePulse);
}
