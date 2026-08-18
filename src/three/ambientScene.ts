import * as THREE from "three";
import { blockMaterials, grassTopTexture, grassSideTexture, dirtTexture, stoneTexture, glowTexture } from "./textures";

const BLOCK_GEO = new THREE.BoxGeometry(1, 1, 1);
const NEON = [0x38f2ff, 0xa855ff, 0xff3ec9, 0x2bffa8, 0xff8a3d, 0xb96bff];

function block(mats, x, y, z, s = 1) {
  const m = new THREE.Mesh(BLOCK_GEO, mats);
  m.position.set(x, y, z);
  m.scale.setScalar(s);
  return m;
}

// A tiny drifting voxel chunk — a few grass/stone/dirt blocks plus a glowing
// crystal, used as one "layer" of a parallax skybox of floating islands.
function buildChunk(colorIndex) {
  const g = new THREE.Group();
  const color = NEON[colorIndex % NEON.length];
  const grassMats = blockMaterials({ top: grassTopTexture("#4fbf6a"), side: grassSideTexture("#4fbf6a"), bottom: dirtTexture() });
  const stoneMats = blockMaterials({ side: stoneTexture() });
  const w = 2 + Math.floor(Math.random() * 2);
  const d = 2 + Math.floor(Math.random() * 2);
  for (let x = 0; x < w; x++) {
    for (let z = 0; z < d; z++) {
      g.add(block(grassMats, x - w / 2, 0, z - d / 2));
      if (Math.random() < 0.6) g.add(block(stoneMats, x - w / 2, -1, z - d / 2));
    }
  }
  const crystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.28, 0),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 2.2, roughness: 0.2 })
  );
  crystal.position.set(0, 1, 0);
  g.add(crystal);
  g.userData.crystal = crystal;
  return g;
}

export function createAmbientScene(mount) {
  let width = window.innerWidth;
  let height = window.innerHeight;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050505, 0.028);

  const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 120);
  camera.position.set(0, 0, 18);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.3));
  mount.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0x2a2440, 1.4);
  scene.add(ambient);
  const lightA = new THREE.PointLight(0xa855ff, 3, 60);
  lightA.position.set(-10, 6, -6);
  scene.add(lightA);
  const lightB = new THREE.PointLight(0x38f2ff, 2.4, 60);
  lightB.position.set(10, -4, -10);
  scene.add(lightB);

  // deep starfield
  const STAR_COUNT = 500;
  const starPositions = new Float32Array(STAR_COUNT * 3);
  for (let i = 0; i < STAR_COUNT; i++) {
    starPositions[i * 3] = (Math.random() - 0.5) * 90;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 60;
    starPositions[i * 3 + 2] = -20 - Math.random() * 40;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.55 })
  );
  scene.add(stars);

  // three parallax layers of drifting floating islands — far/slow to near/fast
  const layers = [
    { count: 4, z: -34, speed: 0.12, scale: 0.7, y: 6 },
    { count: 4, z: -22, speed: 0.22, scale: 0.95, y: -5 },
    { count: 3, z: -12, speed: 0.34, scale: 1.15, y: 2 },
  ];
  const chunks = [];
  layers.forEach((layer, li) => {
    for (let i = 0; i < layer.count; i++) {
      const chunk = buildChunk(li * 3 + i);
      const x = (i / layer.count) * 70 - 35 + Math.random() * 8;
      chunk.position.set(x, layer.y + (Math.random() - 0.5) * 6, layer.z);
      chunk.scale.setScalar(layer.scale);
      chunk.userData.speed = layer.speed;
      chunk.userData.bobOffset = Math.random() * Math.PI * 2;
      chunk.userData.bobSpeed = 0.2 + Math.random() * 0.3;
      scene.add(chunk);
      chunks.push(chunk);
    }
  });

  // rising soul particles — small glowing motes drifting upward and wrapping
  const SOULS = 90;
  const soulGeo = new THREE.BufferGeometry();
  const soulPositions = new Float32Array(SOULS * 3);
  const soulData = [];
  for (let i = 0; i < SOULS; i++) {
    const x = (Math.random() - 0.5) * 50;
    const y = (Math.random() - 0.5) * 40;
    const z = -5 - Math.random() * 25;
    soulPositions[i * 3] = x;
    soulPositions[i * 3 + 1] = y;
    soulPositions[i * 3 + 2] = z;
    soulData.push({ x, speed: 0.4 + Math.random() * 0.6, sway: 0.5 + Math.random() * 1.5, offset: Math.random() * Math.PI * 2 });
  }
  soulGeo.setAttribute("position", new THREE.BufferAttribute(soulPositions, 3));
  const soulMat = new THREE.PointsMaterial({
    color: 0x9be8ff,
    size: 0.14,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    map: glowTexture("#9be8ff"),
  });
  const souls = new THREE.Points(soulGeo, soulMat);
  scene.add(souls);

  // a single falling "item drop" block that recycles from the top
  const dropMats = blockMaterials({ top: grassTopTexture("#4fbf6a"), side: grassSideTexture("#4fbf6a"), bottom: dirtTexture() });
  const drop = block(dropMats, 8, 20, -8, 0.6);
  scene.add(drop);
  function resetDrop() {
    drop.position.set((Math.random() - 0.5) * 40, 22 + Math.random() * 8, -6 - Math.random() * 14);
  }

  // weather particles — hidden until real weather data arrives, then
  // reconfigured live as rain, snow, or left off for clear/cloudy skies
  const WEATHER_COUNT = 500;
  const weatherGeo = new THREE.BufferGeometry();
  const weatherPositions = new Float32Array(WEATHER_COUNT * 3);
  const weatherData = [];
  for (let i = 0; i < WEATHER_COUNT; i++) {
    weatherPositions[i * 3] = (Math.random() - 0.5) * 60;
    weatherPositions[i * 3 + 1] = (Math.random() - 0.5) * 40;
    weatherPositions[i * 3 + 2] = -2 - Math.random() * 30;
    weatherData.push({ fall: 1, sway: 0, offset: Math.random() * Math.PI * 2 });
  }
  weatherGeo.setAttribute("position", new THREE.BufferAttribute(weatherPositions, 3));
  const weatherMat = new THREE.PointsMaterial({
    color: 0xbfe8ff,
    size: 0.12,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const weatherPoints = new THREE.Points(weatherGeo, weatherMat);
  weatherPoints.visible = false;
  scene.add(weatherPoints);

  const lightning = new THREE.PointLight(0xffffff, 0, 80);
  lightning.position.set(0, 10, -5);
  scene.add(lightning);
  let stormTimer = 0;
  let stormActive = false;

  let nightMode = true;
  let weatherKind = "clear";

  function setWeather(kind, isDay) {
    weatherKind = kind;
    nightMode = !isDay;
    stormActive = kind === "storm";

    if (kind === "rain" || kind === "storm") {
      weatherMat.color.set(0x9be8ff);
      weatherMat.size = 0.1;
      weatherMat.opacity = 0.55;
      weatherData.forEach((d) => {
        d.fall = 9 + Math.random() * 4;
        d.sway = 0.3;
      });
      weatherPoints.visible = true;
    } else if (kind === "snow") {
      weatherMat.color.set(0xffffff);
      weatherMat.size = 0.16;
      weatherMat.opacity = 0.85;
      weatherData.forEach((d) => {
        d.fall = 0.8 + Math.random() * 0.6;
        d.sway = 1.4 + Math.random() * 1.2;
      });
      weatherPoints.visible = true;
    } else {
      weatherPoints.visible = false;
    }

    // subtle day/night mood shift — this stays a night-sky palette either way,
    // daytime just lifts the fog and ambient a touch so it reads as "live"
    scene.fog.color.set(nightMode ? 0x050505 : 0x0b0b16);
    ambient.intensity = nightMode ? 1.4 : 1.9;
  }

  const mouse = { x: 0, y: 0 };
  const targetMouse = { x: 0, y: 0 };
  const onMouseMove = (e) => {
    targetMouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  window.addEventListener("mousemove", onMouseMove);

  let paused = document.hidden;
  const onVisibility = () => {
    paused = document.hidden;
  };
  document.addEventListener("visibilitychange", onVisibility);

  const timer = new THREE.Timer();
  let raf = 0;
  function animate() {
    raf = requestAnimationFrame(animate);
    if (paused) return;
    timer.update();
    const t = timer.getElapsed();
    const dt = Math.min(timer.getDelta(), 0.05);

    mouse.x += (targetMouse.x - mouse.x) * 0.02;
    mouse.y += (targetMouse.y - mouse.y) * 0.02;
    camera.position.x = mouse.x * 1.5;
    camera.position.y = -mouse.y * 1;
    camera.lookAt(0, 0, -10);

    // slow neon hue-cycle on the two key lights
    const hueA = (t * 0.02) % 1;
    const hueB = (hueA + 0.5) % 1;
    lightA.color.setHSL(hueA, 0.9, 0.6);
    lightB.color.setHSL(hueB, 0.9, 0.6);

    chunks.forEach((chunk) => {
      chunk.position.x += chunk.userData.speed * dt;
      if (chunk.position.x > 40) chunk.position.x = -40;
      chunk.rotation.y = t * 0.04;
      chunk.position.y += Math.sin(t * chunk.userData.bobSpeed + chunk.userData.bobOffset) * 0.001;
      const crystal = chunk.userData.crystal;
      if (crystal) {
        crystal.rotation.y = t * 0.9;
        crystal.rotation.x = t * 0.5;
      }
    });

    const soulPos = soulGeo.getAttribute("position");
    for (let i = 0; i < SOULS; i++) {
      const d = soulData[i];
      let y = soulPos.array[i * 3 + 1] + d.speed * dt;
      if (y > 22) y = -22;
      soulPos.array[i * 3 + 1] = y;
      soulPos.array[i * 3] = d.x + Math.sin(t * 0.6 + d.offset) * d.sway;
    }
    soulPos.needsUpdate = true;

    drop.position.y -= dt * 1.6;
    drop.rotation.y = t * 1.4;
    drop.rotation.x = t * 0.7;
    if (drop.position.y < -20) resetDrop();

    if (weatherPoints.visible) {
      const wPos = weatherGeo.getAttribute("position");
      for (let i = 0; i < WEATHER_COUNT; i++) {
        const d = weatherData[i];
        let y = wPos.array[i * 3 + 1] - d.fall * dt;
        if (y < -22) y = 22;
        wPos.array[i * 3 + 1] = y;
        wPos.array[i * 3] += Math.sin(t * 0.7 + d.offset) * d.sway * dt;
      }
      wPos.needsUpdate = true;
    }

    if (stormActive) {
      stormTimer -= dt;
      if (stormTimer <= 0 && lightning.intensity <= 0.01) {
        stormTimer = 3 + Math.random() * 6;
      }
      if (stormTimer < 0.15 && lightning.intensity <= 0.01) {
        lightning.intensity = 12;
      }
      lightning.intensity = Math.max(0, lightning.intensity - dt * 20);
    } else {
      lightning.intensity = 0;
    }

    stars.rotation.y = t * 0.004;

    renderer.render(scene, camera);
  }
  animate();

  const onResize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
  window.addEventListener("resize", onResize);

  function dispose() {
    cancelAnimationFrame(raf);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("resize", onResize);
    document.removeEventListener("visibilitychange", onVisibility);
    renderer.dispose();
    if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
  }

  return { dispose, setWeather };
}
