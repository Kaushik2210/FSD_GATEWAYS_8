import * as THREE from "three";
import {
  blockMaterials,
  grassTopTexture,
  grassSideTexture,
  stoneTexture,
  dirtTexture,
} from "./textures";
import { buildPortalFrame } from "./voxelBuilder";

export function createHeroScene(mount) {
  const width = mount.clientWidth;
  const height = mount.clientHeight;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x08080a, 0.042);

  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
  camera.position.set(0, 0, 12);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  mount.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0x332244, 1.4));
  const key = new THREE.PointLight(0xa855ff, 4, 30);
  key.position.set(-5, 3, 4);
  scene.add(key);
  const rim = new THREE.PointLight(0x38f2ff, 3, 30);
  rim.position.set(6, -2, 2);
  scene.add(rim);

  // starfield
  const STAR_COUNT = 900;
  const starPositions = new Float32Array(STAR_COUNT * 3);
  for (let i = 0; i < STAR_COUNT; i++) {
    starPositions[i * 3] = (Math.random() - 0.5) * 60;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 40;
    starPositions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.045, transparent: true, opacity: 0.7 });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // floating Minecraft voxel islands
  const islandGroup = new THREE.Group();
  scene.add(islandGroup);

  const glowColors = [0x38f2ff, 0xa855ff, 0xff3ec9, 0x2bffa8, 0xff8a3d];
  const grassMats = blockMaterials({ top: grassTopTexture("#57d97a"), side: grassSideTexture("#57d97a"), bottom: dirtTexture() });
  const stoneMats = blockMaterials({ side: stoneTexture() });

  function buildIsland(x, y, z, scale, colorIndex) {
    const group = new THREE.Group();
    const color = glowColors[colorIndex % glowColors.length];
    const blockGeo = new THREE.BoxGeometry(1, 1, 1);
    const blockCountX = 3 + Math.floor(Math.random() * 2);
    const blockCountZ = 3 + Math.floor(Math.random() * 2);
    for (let bx = 0; bx < blockCountX; bx++) {
      for (let bz = 0; bz < blockCountZ; bz++) {
        const h = 1 + Math.floor(Math.random() * 2);
        for (let by = 0; by < h; by++) {
          const mats = by === h - 1 ? grassMats : stoneMats;
          const mesh = new THREE.Mesh(blockGeo, mats);
          mesh.position.set(bx - blockCountX / 2, -by, bz - blockCountZ / 2);
          group.add(mesh);
        }
      }
    }
    const crystalGeo = new THREE.OctahedronGeometry(0.4, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 2,
      transparent: true,
      opacity: 0.9,
    });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.position.set(0, 1.2, 0);
    group.add(crystal);

    group.position.set(x, y, z);
    group.scale.setScalar(scale);
    group.userData.baseY = y;
    group.userData.floatSpeed = 0.3 + Math.random() * 0.4;
    group.userData.floatOffset = Math.random() * Math.PI * 2;
    group.userData.crystal = crystal;
    islandGroup.add(group);
    return group;
  }

  const islands = [
    buildIsland(-6, 1, -4, 0.9, 0),
    buildIsland(5, -1.5, -6, 1.1, 1),
    buildIsland(-3, -3, -8, 0.7, 2),
    buildIsland(7, 2.5, -10, 0.8, 3),
    buildIsland(0, 4, -12, 1, 4),
  ];

  // central obsidian portal frame behind the hero title
  const portal = buildPortalFrame(0xa855ff, 5, 6.5);
  portal.position.set(0, -0.5, -9);
  scene.add(portal);

  // ambient floating pixels
  const PIXELS = 120;
  const pixelGeo = new THREE.BoxGeometry(0.06, 0.06, 0.06);
  const pixelMat = new THREE.MeshBasicMaterial({ color: 0x38f2ff, transparent: true, opacity: 0.6 });
  const pixelMesh = new THREE.InstancedMesh(pixelGeo, pixelMat, PIXELS);
  const dummy = new THREE.Object3D();
  const pixelData = [];
  for (let i = 0; i < PIXELS; i++) {
    const x = (Math.random() - 0.5) * 16;
    const y = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 14 - 4;
    dummy.position.set(x, y, z);
    dummy.updateMatrix();
    pixelMesh.setMatrixAt(i, dummy.matrix);
    pixelData.push({ speed: 0.1 + Math.random() * 0.3, offset: Math.random() * Math.PI * 2, baseY: y, x, z });
  }
  scene.add(pixelMesh);

  const mouse = { x: 0, y: 0 };
  const targetMouse = { x: 0, y: 0 };
  const onMouseMove = (e) => {
    targetMouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  window.addEventListener("mousemove", onMouseMove);

  let scrollY = 0;
  const onScroll = () => {
    scrollY = window.scrollY;
  };
  window.addEventListener("scroll", onScroll);

  const timer = new THREE.Timer();
  let raf = 0;
  function animate() {
    raf = requestAnimationFrame(animate);
    timer.update();
    const t = timer.getElapsed();

    mouse.x += (targetMouse.x - mouse.x) * 0.04;
    mouse.y += (targetMouse.y - mouse.y) * 0.04;

    camera.position.x = mouse.x * 1.2;
    camera.position.y = -mouse.y * 0.8 - scrollY * 0.0025;
    camera.lookAt(0, -scrollY * 0.0025, -5);

    islands.forEach((isl) => {
      isl.position.y = isl.userData.baseY + Math.sin(t * isl.userData.floatSpeed + isl.userData.floatOffset) * 0.3;
      isl.rotation.y = t * 0.05;
      const crystal = isl.userData.crystal;
      crystal.rotation.y = t * 0.8;
      crystal.rotation.x = t * 0.4;
    });

    portal.userData.portal.material.opacity = 0.55 + Math.sin(t * 1.4) * 0.2;
    portal.rotation.z = Math.sin(t * 0.15) * 0.02;

    for (let i = 0; i < PIXELS; i++) {
      const d = pixelData[i];
      dummy.position.set(d.x + Math.sin(t * d.speed + d.offset) * 0.4, d.baseY + Math.cos(t * d.speed + d.offset) * 0.6, d.z);
      dummy.updateMatrix();
      pixelMesh.setMatrixAt(i, dummy.matrix);
    }
    pixelMesh.instanceMatrix.needsUpdate = true;

    stars.rotation.y = t * 0.008;

    renderer.render(scene, camera);
  }
  animate();

  const onResize = () => {
    const w = mount.clientWidth;
    const h = mount.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener("resize", onResize);

  function dispose() {
    cancelAnimationFrame(raf);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    renderer.dispose();
    if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
  }

  return { dispose };
}
