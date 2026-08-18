import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { buildDragon, animateDragon } from "../three/dragon";

gsap.registerPlugin(ScrollTrigger);

// Flight path in world units, expressed as a function of scroll progress (0 -> 1).
// The dragon swoops in from the bottom-left, arcs across the sky, and is fully
// off-screen top-right well before the pass ends, so it never sits over content.
function flightPosition(p) {
  const q = Math.min(p / 0.7, 1);
  const x = THREE.MathUtils.lerp(-16, 18, q);
  const arc = Math.sin(q * Math.PI) * 5;
  const y = THREE.MathUtils.lerp(-8, 11, q) + arc;
  const z = -3 + Math.sin(q * Math.PI * 1.6) * 2;
  return { x, y, z };
}

export default function ScrollDragon() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 16);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x6a5a8a, 2.4));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(4, 6, 8);
    scene.add(key);
    const purpleGlow = new THREE.PointLight(0xb96bff, 8, 40);
    scene.add(purpleGlow);
    const cyanGlow = new THREE.PointLight(0x38f2ff, 6, 40);
    scene.add(cyanGlow);

    const dragon = buildDragon();
    dragon.scale.setScalar(0.85);
    scene.add(dragon);

    // trailing spark particles
    const TRAIL = 60;
    const trailGeo = new THREE.BufferGeometry();
    const trailPositions = new Float32Array(TRAIL * 3).fill(9999);
    trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPositions, 3));
    const trailMat = new THREE.PointsMaterial({
      color: 0x38f2ff,
      size: 0.26,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const trail = new THREE.Points(trailGeo, trailMat);
    scene.add(trail);
    const trailBuffer = [];

    const progressRef = { current: 0 };

    // Tied only to the hero -> events handoff: the dragon swoops through while
    // the events heading is arriving and is fully gone before the event cards
    // (and the register buttons on them) come into view.
    const trigger = ScrollTrigger.create({
      trigger: "#events",
      start: "top 100%",
      end: "top 35%",
      scrub: 0.5,
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
    });

    let raf = 0;
    const timer = new THREE.Timer();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      timer.update();
      const t = timer.getElapsed();
      const p = progressRef.current;

      // The pass is front-loaded: the dragon is fully gone by p = 0.7 so it
      // never lingers over the event cards or blocks the register buttons.
      const active = p > 0.01 && p < 0.7;
      dragon.visible = active;
      trail.visible = active;
      if (active) {
        const pos = flightPosition(p);
        dragon.position.set(pos.x, pos.y, pos.z);
        purpleGlow.position.copy(dragon.position);
        cyanGlow.position.set(pos.x - 2, pos.y, pos.z);

        // bank into the arc based on where the flight path is heading
        const ahead = flightPosition(Math.min(p + 0.01, 1));
        const dx = ahead.x - pos.x;
        const dy = ahead.y - pos.y;
        dragon.rotation.z = Math.atan2(dy, dx) * -1;

        // fade in fast, then fade/fly out well before the events content settles
        const edgeIn = Math.min(p / 0.06, 1);
        const edgeOut = Math.min((0.7 - p) / 0.18, 1);
        const edge = Math.max(0, Math.min(edgeIn, edgeOut));
        dragon.scale.setScalar(0.85 * edge);

        animateDragon(dragon, t);

        trailBuffer.unshift({ x: pos.x - 1.5, y: pos.y, z: pos.z });
        if (trailBuffer.length > TRAIL) trailBuffer.pop();
        const arr = trailGeo.getAttribute("position").array;
        for (let i = 0; i < TRAIL; i++) {
          const pt = trailBuffer[i];
          if (pt) {
            arr[i * 3] = pt.x;
            arr[i * 3 + 1] = pt.y;
            arr[i * 3 + 2] = pt.z;
          } else {
            arr[i * 3 + 1] = 9999;
          }
        }
        trailGeo.getAttribute("position").needsUpdate = true;
      } else {
        trailBuffer.length = 0;
      }

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      trigger.kill();
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="pointer-events-none fixed inset-0 z-30"
      aria-hidden="true"
    />
  );
}
