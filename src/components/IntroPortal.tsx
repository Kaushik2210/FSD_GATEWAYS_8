import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { blockMaterials, grassTopTexture, grassSideTexture, dirtTexture } from "../three/textures";

export default function IntroPortal({ onComplete }) {
  const mountRef = useRef(null);
  const [skippable, setSkippable] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mount = mountRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      onComplete();
    };

    if (reduceMotion) {
      const t = setTimeout(finish, 400);
      return () => clearTimeout(t);
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x442266, 1.2));
    const point = new THREE.PointLight(0xa855ff, 6, 20);
    point.position.set(0, 0, 3);
    scene.add(point);
    const rim = new THREE.PointLight(0x38f2ff, 4, 20);
    rim.position.set(-2, 1, 2);
    scene.add(rim);

    // Minecraft grass block as the seed of the portal
    const cubeGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const cubeMats = blockMaterials({
      top: grassTopTexture("#5fe08a"),
      side: grassSideTexture("#5fe08a"),
      bottom: dirtTexture(),
    });
    cubeMats.forEach((m) => {
      m.emissive = new THREE.Color(0x0f3d24);
      m.emissiveIntensity = 0.6;
    });
    const cube = new THREE.Mesh(cubeGeo, cubeMats);
    scene.add(cube);

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(cubeGeo),
      new THREE.LineBasicMaterial({ color: 0x38f2ff, transparent: true })
    );
    cube.add(edges);

    // particle burst
    const PARTICLES = 700;
    const positions = new Float32Array(PARTICLES * 3);
    const velocities = [];
    for (let i = 0; i < PARTICLES; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      const dir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
        .normalize()
        .multiplyScalar(0.02 + Math.random() * 0.05);
      velocities.push(dir);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x6bff8a,
      size: 0.05,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // portal ring
    const ringGeo = new THREE.RingGeometry(1, 1.06, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xa855ff, side: THREE.DoubleSide, transparent: true, opacity: 0 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.scale.setScalar(0.01);
    scene.add(ring);

    const portalFillGeo = new THREE.CircleGeometry(1, 64);
    const portalFillMat = new THREE.MeshBasicMaterial({ color: 0x38f2ff, transparent: true, opacity: 0 });
    const portalFill = new THREE.Mesh(portalFillGeo, portalFillMat);
    portalFill.position.z = -0.01;
    ring.add(portalFill);

    let raf = 0;
    const timer = new THREE.Timer();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      timer.update();
      const dt = timer.getDelta();
      const posAttr = particleGeo.getAttribute("position");
      for (let i = 0; i < PARTICLES; i++) {
        posAttr.array[i * 3] += velocities[i].x * dt * 60;
        posAttr.array[i * 3 + 1] += velocities[i].y * dt * 60;
        posAttr.array[i * 3 + 2] += velocities[i].z * dt * 60;
      }
      posAttr.needsUpdate = true;
      portalFillMat.opacity *= 1;
      renderer.render(scene, camera);
    };
    animate();

    const tl = gsap.timeline({ onComplete: finish });
    tl.to(cube.rotation, { y: Math.PI * 2, x: Math.PI * 0.6, duration: 1.6, ease: "power1.inOut" }, 0);
    tl.to(cube.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 1.6, ease: "sine.inOut" }, 0);
    tl.to(cube.scale, { x: 1.4, y: 1.4, z: 1.4, duration: 0.25, ease: "power2.in" }, 1.6);
    tl.to(cubeMats.map((m) => m), { opacity: 0, duration: 0.2 }, 1.8);
    cubeMats.forEach((m) => (m.transparent = true));
    tl.to(edges.material, { opacity: 0, duration: 0.2 }, 1.8);
    tl.set(cube, { visible: false }, 1.85);
    tl.to(particleMat, { opacity: 1, duration: 0.1 }, 1.75);
    tl.to(particleMat, { opacity: 0, duration: 0.8 }, 2.6);
    tl.to(ring.scale, { x: 2.6, y: 2.6, z: 2.6, duration: 1.1, ease: "back.out(1.4)" }, 1.9);
    tl.to(ringMat, { opacity: 1, duration: 0.5 }, 1.9);
    tl.to(portalFillMat, { opacity: 0.9, duration: 0.6 }, 2.1);
    tl.to(camera.position, { z: -2, duration: 1.1, ease: "power3.in" }, 2.8);
    tl.to(camera, { fov: 100, duration: 1.1, onUpdate: () => camera.updateProjectionMatrix() }, 2.8);

    setTimeout(() => setSkippable(true), 500);

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      tl.kill();
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
    };
  }, [onComplete]);

  return (
    <div ref={mountRef} className="fixed inset-0 z-[10000]" style={{ background: "#050505" }}>
      {skippable && (
        <button
          onClick={() => {
            if (!doneRef.current) {
              doneRef.current = true;
              onComplete();
            }
          }}
          className="glass text-glow-cyan absolute right-6 bottom-6 rounded-full px-5 py-2 font-display text-xs tracking-widest text-cyan uppercase"
        >
          Skip
        </button>
      )}
    </div>
  );
}
