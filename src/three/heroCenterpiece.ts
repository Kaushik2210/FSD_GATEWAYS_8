import * as THREE from "three";
import {
  blockMaterials,
  grassTopTexture,
  grassSideTexture,
  dirtTexture,
  stoneTexture,
  logTexture,
  leavesTexture,
  glowTexture,
} from "./textures";
import { buildPortalFrame } from "./voxelBuilder";

const BLOCK_GEO = new THREE.BoxGeometry(1, 1, 1);

function block(mats, x, y, z, scale = 1) {
  const m = new THREE.Mesh(BLOCK_GEO, mats);
  m.position.set(x, y, z);
  m.scale.setScalar(scale);
  return m;
}

function glowPost(color, height = 1.4) {
  const group = new THREE.Group();
  const poleMats = blockMaterials({ side: stoneTexture("#4a4a55") });
  for (let y = 0; y < Math.round(height); y++) group.add(block(poleMats, 0, y, 0, 0.35));
  const head = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.22, 0),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 2.6, map: glowTexture(color) })
  );
  head.position.y = height;
  group.add(head);
  const light = new THREE.PointLight(color, 2.2, 6);
  light.position.y = height;
  group.add(light);
  group.userData.head = head;
  return group;
}

export function buildHeroIsland() {
  const root = new THREE.Group();

  const grassMats = blockMaterials({ top: grassTopTexture("#57d97a"), side: grassSideTexture("#57d97a"), bottom: dirtTexture() });
  const dirtMats = blockMaterials({ side: dirtTexture() });
  const stoneMats = blockMaterials({ side: stoneTexture() });

  // layered floating island, tapering into jagged stone underside
  const layers = [
    { size: 7, y: 0, mats: grassMats },
    { size: 6, y: -1, mats: dirtMats },
    { size: 5, y: -2, mats: stoneMats },
    { size: 3, y: -3, mats: stoneMats },
  ];
  layers.forEach(({ size, y, mats }) => {
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        if (Math.random() < 0.06 && y !== 0) continue; // ragged edges
        root.add(block(mats, x - size / 2 + 0.5, y, z - size / 2 + 0.5));
      }
    }
  });
  // hanging stone spikes
  for (let i = 0; i < 6; i++) {
    const x = (Math.random() - 0.5) * 4;
    const z = (Math.random() - 0.5) * 4;
    const depth = 1 + Math.floor(Math.random() * 3);
    for (let d = 0; d < depth; d++) {
      root.add(block(stoneMats, x, -4 - d, z, 1 - d * 0.15));
    }
  }

  // tree
  const tree = new THREE.Group();
  const logMats = blockMaterials({ side: logTexture() });
  for (let y = 0; y < 3; y++) tree.add(block(logMats, 0, y + 1, 0));
  const leafMats = blockMaterials({ side: leavesTexture("#3fae4f") });
  const leafPositions = [
    [0, 4, 0],
    [1, 4, 0],
    [-1, 4, 0],
    [0, 4, 1],
    [0, 4, -1],
    [0, 5, 0],
  ];
  leafPositions.forEach(([x, y, z]) => tree.add(block(leafMats, x, y, z, 0.95)));
  tree.position.set(-2.2, 0.5, -2);
  root.add(tree);

  // portal frame — the centerpiece
  const portal = buildPortalFrame(0xa855ff, 3, 4.4);
  portal.position.set(1.4, 0.5, -0.5);
  portal.rotation.y = -0.35;
  root.add(portal);

  // generous invisible hit-area so the portal is easy to click/tap
  const portalHit = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 5),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  portalHit.position.copy(portal.position);
  portalHit.position.y += 1.7;
  portalHit.rotation.y = portal.rotation.y;
  root.add(portalHit);
  root.userData.portalHit = portalHit;

  // torches flanking the portal
  const torchL = glowPost(0x38f2ff, 1.6);
  torchL.position.set(-0.3, 0.5, -0.5);
  root.add(torchL);
  const torchR = glowPost(0x38f2ff, 1.6);
  torchR.position.set(3.1, 0.5, -0.5);
  root.add(torchR);

  // floating item drops orbiting the island
  const dropColors = [0x38f2ff, 0xa855ff, 0xff3ec9, 0x2bffa8];
  const drops = [];
  for (let i = 0; i < 5; i++) {
    const color = dropColors[i % dropColors.length];
    const geo = i % 2 === 0 ? new THREE.OctahedronGeometry(0.22, 0) : new THREE.IcosahedronGeometry(0.2, 0);
    const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 2.4, roughness: 0.2 });
    const drop = new THREE.Mesh(geo, mat);
    const angle = (i / 5) * Math.PI * 2;
    drop.userData.angle = angle;
    drop.userData.radius = 3.6 + Math.random() * 0.8;
    drop.userData.ySpeed = 0.6 + Math.random() * 0.4;
    drop.userData.yOffset = Math.random() * Math.PI * 2;
    root.add(drop);
    drops.push(drop);
  }

  // falling pixel particles off the edge (waterfall-style)
  const PARTICLE_COUNT = 140;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
  const particleSpeeds = new Float32Array(PARTICLE_COUNT);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particlePositions[i * 3] = 2.8 + Math.random() * 0.6;
    particlePositions[i * 3 + 1] = Math.random() * -6;
    particlePositions[i * 3 + 2] = -2.5 + Math.random() * 1.5;
    particleSpeeds[i] = 0.6 + Math.random() * 0.8;
  }
  particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x4fd6ff,
    size: 0.05,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  root.add(particles);

  root.userData.portal = portal.userData.portal;
  root.userData.torches = [torchL.userData.head, torchR.userData.head];
  root.userData.drops = drops;
  root.userData.particles = particles;
  root.userData.particleSpeeds = particleSpeeds;

  return root;
}

export function animateHeroIsland(root, t, dt) {
  const drops = root.userData.drops || [];
  drops.forEach((d) => {
    const angle = d.userData.angle + t * 0.25;
    d.position.set(
      Math.cos(angle) * d.userData.radius,
      0.5 + Math.sin(t * d.userData.ySpeed + d.userData.yOffset) * 0.6,
      Math.sin(angle) * d.userData.radius - 0.5
    );
    d.rotation.y = t * 1.2;
    d.rotation.x = t * 0.6;
  });

  root.userData.torches?.forEach((head, i) => {
    head.scale.setScalar(1 + Math.sin(t * 4 + i) * 0.15);
  });

  if (root.userData.portal && !(root.userData.flashUntil > performance.now())) {
    root.userData.portal.material.opacity = 0.6 + Math.sin(t * 2.4) * 0.25;
  }

  const particles = root.userData.particles;
  const speeds = root.userData.particleSpeeds;
  if (particles) {
    const pos = particles.geometry.getAttribute("position");
    for (let i = 0; i < speeds.length; i++) {
      let y = pos.array[i * 3 + 1] - speeds[i] * dt;
      if (y < -7) y = 0;
      pos.array[i * 3 + 1] = y;
    }
    pos.needsUpdate = true;
  }
}
