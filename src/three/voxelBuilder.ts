import * as THREE from "three";
import {
  blockMaterials,
  grassTopTexture,
  grassSideTexture,
  dirtTexture,
  stoneTexture,
  snowTexture,
  sandTexture,
  obsidianTexture,
  netherrackTexture,
  endStoneTexture,
  crystalBaseTexture,
  planksTexture,
  logTexture,
  leavesTexture,
  glowTexture,
  bookshelfTexture,
} from "./textures";

const BLOCK_GEO = new THREE.BoxGeometry(1, 1, 1);

function block(materials, x, y, z, scale = 1) {
  const mesh = new THREE.Mesh(BLOCK_GEO, materials);
  mesh.position.set(x, y, z);
  mesh.scale.setScalar(scale);
  return mesh;
}

function glowMaterial(color) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 2.2,
    map: glowTexture(color),
    roughness: 0.4,
  });
}

function crystalMesh(color, size = 0.4) {
  const geo = new THREE.OctahedronGeometry(size, 0);
  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 2.4,
    transparent: true,
    opacity: 0.92,
    roughness: 0.15,
    metalness: 0.2,
  });
  return new THREE.Mesh(geo, mat);
}

// A small obsidian portal frame with a glowing plane "portal" inside, tinted to the biome color.
export function buildPortalFrame(color, width = 3, height = 4) {
  const group = new THREE.Group();
  const obsidianMat = blockMaterials({ side: obsidianTexture() });
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const isFrame = x === 0 || x === width - 1 || y === 0 || y === height - 1;
      if (isFrame) {
        group.add(block(obsidianMat, x - width / 2 + 0.5, y, 0));
      }
    }
  }
  const portalGeo = new THREE.PlaneGeometry(width - 2, height - 2);
  const portalMat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
  });
  const portal = new THREE.Mesh(portalGeo, portalMat);
  portal.position.set(0, height / 2 - 0.5, 0.05);
  group.add(portal);
  group.userData.portal = portal;
  return group;
}

function basePlatform({ topTex, sideTex, size = 5, height = 1 }) {
  const group = new THREE.Group();
  const mats = blockMaterials({ top: topTex, side: sideTex });
  for (let x = 0; x < size; x++) {
    for (let z = 0; z < size; z++) {
      for (let y = 0; y < height; y++) {
        group.add(block(mats, x - size / 2 + 0.5, -y, z - size / 2 + 0.5));
      }
    }
  }
  return group;
}

function scatterCrystals(group, color, count, radius, yBase) {
  const crystals = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const r = radius * (0.5 + Math.random() * 0.5);
    const c = crystalMesh(color, 0.18 + Math.random() * 0.22);
    c.position.set(Math.cos(angle) * r, yBase + Math.random() * 0.6, Math.sin(angle) * r);
    group.add(c);
    crystals.push(c);
  }
  return crystals;
}

const BUILDERS = {
  cyber(color) {
    const group = new THREE.Group();
    group.add(basePlatform({ topTex: stoneTexture("#2b2f3a"), sideTex: stoneTexture("#1a1d24"), size: 5 }));
    const tower = new THREE.Group();
    const stoneMats = blockMaterials({ side: stoneTexture("#33384a") });
    for (let y = 0; y < 3; y++) tower.add(block(stoneMats, 0, y + 1, 0));
    tower.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), glowMaterial(color)));
    tower.children[tower.children.length - 1].position.y = 4;
    group.add(tower);
    const portal = buildPortalFrame(color, 2.2, 3);
    portal.position.set(-1.6, 1, -1.4);
    portal.rotation.y = 0.5;
    group.add(portal);
    group.userData.portal = portal.userData.portal;
    group.userData.floaters = scatterCrystals(group, color, 6, 2.4, 1.5);
    return group;
  },
  library(color) {
    const group = new THREE.Group();
    group.add(basePlatform({ topTex: planksTexture("#8a5a2b"), sideTex: planksTexture("#6b4420"), size: 5 }));
    const shelfMats = blockMaterials({ side: bookshelfTexture() });
    for (let x = -1; x <= 1; x++) {
      for (let y = 0; y < 2; y++) {
        group.add(block(shelfMats, x, y + 1, -1.5));
      }
    }
    const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), glowMaterial(color));
    lantern.position.set(0, 3, 0);
    group.add(lantern);
    group.userData.floaters = [lantern];
    return group;
  },
  nether(color) {
    const group = new THREE.Group();
    group.add(basePlatform({ topTex: netherrackTexture(), sideTex: netherrackTexture(), size: 5 }));
    const lavaGeo = new THREE.CircleGeometry(1.1, 24);
    const lavaMat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 1.6,
      roughness: 0.3,
    });
    const lava = new THREE.Mesh(lavaGeo, lavaMat);
    lava.rotation.x = -Math.PI / 2;
    lava.position.y = 0.51;
    group.add(lava);
    const pillarMats = blockMaterials({ side: netherrackTexture() });
    [-1.8, 1.8].forEach((x) => {
      for (let y = 0; y < 3; y++) group.add(block(pillarMats, x, y + 1, -1.5));
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.5, 6), glowMaterial(color));
      flame.position.set(x, 4, -1.5);
      group.add(flame);
    });
    group.userData.floaters = [lava];
    return group;
  },
  cherry(color) {
    const group = new THREE.Group();
    group.add(basePlatform({ topTex: grassTopTexture("#8fd18f"), sideTex: grassSideTexture("#8fd18f"), size: 5 }));
    const logMats = blockMaterials({ side: logTexture() });
    for (let y = 0; y < 2; y++) group.add(block(logMats, 0, y + 1, 0));
    const leafMats = blockMaterials({ side: leavesTexture(color) });
    const positions = [
      [0, 3, 0],
      [1, 3, 0],
      [-1, 3, 0],
      [0, 3, 1],
      [0, 3, -1],
      [0, 3.8, 0],
    ];
    positions.forEach(([x, y, z]) => group.add(block(leafMats, x, y, z, 0.9)));
    const petals = [];
    for (let i = 0; i < 14; i++) {
      const petal = new THREE.Mesh(
        new THREE.PlaneGeometry(0.08, 0.08),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
      );
      petal.position.set((Math.random() - 0.5) * 3, Math.random() * 3.5, (Math.random() - 0.5) * 3);
      petal.userData.speed = 0.2 + Math.random() * 0.3;
      petal.userData.offset = Math.random() * Math.PI * 2;
      petal.userData.baseY = petal.position.y;
      group.add(petal);
      petals.push(petal);
    }
    group.userData.floaters = petals;
    return group;
  },
  end(color) {
    const group = new THREE.Group();
    group.add(basePlatform({ topTex: endStoneTexture(), sideTex: endStoneTexture(), size: 5 }));
    const pillarMats = blockMaterials({ side: obsidianTexture() });
    for (let y = 0; y < 4; y++) group.add(block(pillarMats, 1.6, y + 1, -1.2));
    const crystal = crystalMesh(color, 0.55);
    crystal.position.set(1.6, 5.4, -1.2);
    group.add(crystal);
    group.userData.floaters = [crystal, ...scatterCrystals(group, color, 5, 2.2, 1.2)];
    return group;
  },
  mountain(color) {
    const group = new THREE.Group();
    group.add(basePlatform({ topTex: grassTopTexture("#5fb85f"), sideTex: grassSideTexture("#5fb85f"), size: 5 }));
    const stoneMats = blockMaterials({ side: stoneTexture() });
    const snowMats = blockMaterials({ top: snowTexture(), side: stoneTexture() });
    const layers = [
      { y: 1, size: 3 },
      { y: 2, size: 2 },
      { y: 3, size: 1 },
    ];
    layers.forEach(({ y, size }, i) => {
      const mats = i === layers.length - 1 ? snowMats : stoneMats;
      for (let x = 0; x < size; x++) {
        for (let z = 0; z < size; z++) {
          group.add(block(mats, x - size / 2 + 0.5, y, z - size / 2 + 0.5));
        }
      }
    });
    const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), glowMaterial(color));
    beacon.position.set(0, 4.2, 0);
    group.add(beacon);
    group.userData.floaters = [beacon];
    return group;
  },
  crystal(color) {
    const group = new THREE.Group();
    group.add(basePlatform({ topTex: crystalBaseTexture(), sideTex: crystalBaseTexture(), size: 5 }));
    group.userData.floaters = [
      ...scatterCrystals(group, color, 9, 1.8, 1.4),
      (() => {
        const c = crystalMesh(color, 0.6);
        c.position.set(0, 2.2, 0);
        group.add(c);
        return c;
      })(),
    ];
    return group;
  },
};

export function buildBiomeDiorama(biome, color) {
  const builder = BUILDERS[biome] || BUILDERS.cyber;
  const group = builder(color);
  group.rotation.y = Math.random() * Math.PI * 2;
  return group;
}

export function animateDiorama(group, t, speedMul = 1) {
  group.rotation.y += 0.0032 * speedMul;
  const floaters = group.userData.floaters || [];
  floaters.forEach((f, i) => {
    if (f.userData.baseY !== undefined) {
      f.position.y = f.userData.baseY + Math.sin(t * f.userData.speed + f.userData.offset) * 0.5;
      f.rotation.z = t * 0.6 + i;
    } else {
      f.position.y += Math.sin(t * 1.4 + i) * 0.0025;
      f.rotation.y = t * 0.8 + i;
      f.rotation.x = t * 0.5;
    }
  });
  if (group.userData.portal) {
    group.userData.portal.material.opacity = 0.65 + Math.sin(t * 3) * 0.2;
  }
}
