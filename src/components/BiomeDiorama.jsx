import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { buildBiomeDiorama, animateDiorama } from "../three/voxelBuilder";

export default function BiomeDiorama({ biome, color, hovered }) {
  const mountRef = useRef(null);
  const speedRef = useRef(1);
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    speedRef.current = hovered ? 3.2 : 1;
  }, [hovered]);

  // Defer WebGL context creation until the card is about to scroll into
  // view — with a dozen+ event cards each holding their own renderer,
  // creating all of them upfront blows past the browser's concurrent
  // WebGL context limit and older cards go blank.
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setNearViewport(true);
    }, { rootMargin: "200px" });
    io.observe(mount);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !nearViewport) return;

    let width = mount.clientWidth || 300;
    let height = mount.clientHeight || 260;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(4.2, 3.2, 5.2);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x40405a, 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(4, 6, 3);
    scene.add(key);
    const rim = new THREE.PointLight(color, 3, 12);
    rim.position.set(-2, 2, -2);
    scene.add(rim);

    const diorama = buildBiomeDiorama(biome, color);
    diorama.position.y = -1;
    scene.add(diorama);

    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    io.observe(mount);

    const clock = new THREE.Clock();
    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (!visible) return;
      const t = clock.getElapsedTime();
      animateDiorama(diorama, t, speedRef.current);
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      width = mount.clientWidth || width;
      height = mount.clientHeight || height;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj.geometry && obj.geometry !== undefined && obj.userData.__shared !== true) {
          // geometries are shared box geo; skip disposing shared ones is fine to leave to GC
        }
      });
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [biome, color, nearViewport]);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />;
}
