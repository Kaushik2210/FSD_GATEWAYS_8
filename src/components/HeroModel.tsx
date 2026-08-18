import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { buildHeroIsland, animateHeroIsland } from "../three/heroCenterpiece";

export default function HeroModel() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = mount.clientWidth;
    let height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 60);
    camera.position.set(7.4, 4.2, 10.4);
    camera.lookAt(0, -0.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x3a3050, 1.5));
    const sun = new THREE.DirectionalLight(0xfff2e0, 1.2);
    sun.position.set(5, 8, 4);
    scene.add(sun);
    const fillA = new THREE.PointLight(0xa855ff, 3, 20);
    fillA.position.set(-4, 1, 3);
    scene.add(fillA);
    const fillB = new THREE.PointLight(0x38f2ff, 2.4, 20);
    fillB.position.set(4, -2, -3);
    scene.add(fillB);

    const island = buildHeroIsland();
    const wrapper = new THREE.Group();
    wrapper.add(island);
    scene.add(wrapper);

    const portalHit = island.userData.portalHit;
    const portalMesh = island.userData.portal;
    const raycaster = new THREE.Raycaster();
    const pointerNDC = new THREE.Vector2();

    const setPointerFromEvent = (e) => {
      const rect = mount.getBoundingClientRect();
      pointerNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNDC.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    const hitsPortal = (e) => {
      if (!portalHit) return false;
      const rect = mount.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
        return false;
      }
      setPointerFromEvent(e);
      raycaster.setFromCamera(pointerNDC, camera);
      return raycaster.intersectObject(portalHit, false).length > 0;
    };

    const jumpToEvents = () => {
      const target = document.getElementById("events");
      if (!target) return;
      if (portalMesh) {
        island.userData.flashUntil = performance.now() + 900;
        gsap
          .timeline({ onComplete: () => (island.userData.flashUntil = 0) })
          .to(portalMesh.scale, { x: 1.3, y: 1.3, duration: 0.18, ease: "power2.out" })
          .to(portalMesh.material, { opacity: 1, duration: 0.18 }, "<")
          .to(portalMesh.scale, { x: 1, y: 1, duration: 0.7, ease: "elastic.out(1, 0.5)" })
          .to(portalMesh.material, { opacity: 0.65, duration: 0.5 }, "<");
      }
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    // entrance
    const restScale = 0.82;
    wrapper.scale.setScalar(reduceMotion ? restScale : 0.001);
    wrapper.position.y = reduceMotion ? 0 : -2.5;
    gsap.to(wrapper.scale, {
      x: restScale,
      y: restScale,
      z: restScale,
      duration: 1.4,
      delay: 0.5,
      ease: "elastic.out(1, 0.65)",
    });
    gsap.to(wrapper.position, {
      y: 0,
      duration: 1.4,
      delay: 0.5,
      ease: "power3.out",
    });

    // pointer drag to rotate + autorotate + inertia
    let rotY = 0.3;
    let velocity = 0;
    let dragging = false;
    let lastX = 0;
    let autorotate = true;
    let downX = 0;
    let downY = 0;
    let downTime = 0;
    let hoveringPortal = false;

    const onPointerDown = (e) => {
      dragging = true;
      autorotate = false;
      lastX = e.clientX;
      downX = e.clientX;
      downY = e.clientY;
      downTime = performance.now();
      mount.style.cursor = "grabbing";
    };
    const onPointerMove = (e) => {
      if (dragging) {
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        velocity = dx * 0.005;
        rotY += velocity;
        return;
      }
      const nowHovering = hitsPortal(e);
      if (nowHovering !== hoveringPortal) {
        hoveringPortal = nowHovering;
        mount.style.cursor = hoveringPortal ? "pointer" : "grab";
      }
    };
    const stopDrag = (e) => {
      if (!dragging) return;
      dragging = false;
      const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
      const elapsed = performance.now() - downTime;
      if (moved < 6 && elapsed < 400 && hitsPortal(e)) {
        jumpToEvents();
      }
      mount.style.cursor = hoveringPortal ? "pointer" : "grab";
      setTimeout(() => {
        if (!dragging) autorotate = true;
      }, 1100);
    };
    mount.style.cursor = "grab";
    mount.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", stopDrag);
    mount.addEventListener("pointerleave", () => {});

    // mouse parallax tilt (subtle, desktop only)
    const targetTilt = { x: 0, y: 0 };
    const onMouseMove = (e) => {
      const rect = mount.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      targetTilt.x = py * 0.15;
      targetTilt.y = px * 0.15;
    };
    window.addEventListener("mousemove", onMouseMove);

    let raf = 0;
    const timer = new THREE.Timer();
    let currentTiltX = 0;
    let currentTiltY = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      timer.update();
      const t = timer.getElapsed();
      const dt = Math.min(timer.getDelta(), 0.05);

      if (!dragging) {
        velocity *= 0.94;
        rotY += velocity;
        if (autorotate) rotY += dt * 0.12;
      }
      wrapper.rotation.y = rotY;

      currentTiltX += (targetTilt.x - currentTiltX) * 0.05;
      currentTiltY += (targetTilt.y - currentTiltY) * 0.05;
      wrapper.rotation.x = currentTiltX;
      island.position.y = Math.sin(t * 0.5) * 0.15;

      animateHeroIsland(island, t, dt);
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      width = mount.clientWidth;
      height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mount.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", stopDrag);
      window.removeEventListener("mousemove", onMouseMove);
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="relative h-[240px] w-full touch-none select-none sm:h-[300px] md:h-[400px]"
      data-cursor-hover
    />
  );
}
