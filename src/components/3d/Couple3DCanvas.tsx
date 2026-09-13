import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Couple3DCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 300;
    let height = container.clientHeight || 240;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 6.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const coupleGroup = new THREE.Group();
    scene.add(coupleGroup);

    // Knot / Heart Curves
    const knotMat = new THREE.MeshStandardMaterial({
      color: 0xdfb758,
      metalness: 0.85,
      roughness: 0.15,
      emissive: 0x3d2800,
      emissiveIntensity: 0.15,
    });

    const knotGeo = new THREE.TorusKnotGeometry(1.2, 0.28, 128, 32, 2, 3);
    const knotMesh = new THREE.Mesh(knotGeo, knotMat);
    coupleGroup.add(knotMesh);

    // Floating micro hearts / stars
    const starCount = 35;
    const starsGroup = new THREE.Group();
    coupleGroup.add(starsGroup);

    const octaGeo = new THREE.OctahedronGeometry(0.1, 0);
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xffd6e0,
      emissive: 0xff758f,
      emissiveIntensity: 0.6,
      roughness: 0.2,
    });

    const stars: { mesh: THREE.Mesh; angle: number; r: number; speed: number; yBase: number }[] = [];
    for (let i = 0; i < starCount; i++) {
      const star = new THREE.Mesh(octaGeo, starMat);
      const r = 1.8 + Math.random() * 1.2;
      const angle = Math.random() * Math.PI * 2;
      const yBase = (Math.random() - 0.5) * 2;
      star.position.set(Math.cos(angle) * r, yBase, Math.sin(angle) * r);
      starsGroup.add(star);
      stars.push({ mesh: star, angle, r, speed: (Math.random() * 0.4 + 0.2) * (Math.random() > 0.5 ? 1 : -1), yBase });
    }

    // Lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambLight);

    const light1 = new THREE.PointLight(0xffd700, 3, 20);
    light1.position.set(3, 4, 5);
    scene.add(light1);

    const light2 = new THREE.PointLight(0xff99bb, 2, 20);
    light2.position.set(-3, -3, 4);
    scene.add(light2);

    // Interactive Drag
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let targetRotY = 0;
    let targetRotX = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      prevX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      prevY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const curX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const curY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      targetRotY += (curX - prevX) * 0.012;
      targetRotX += (curY - prevY) * 0.012;
      prevX = curX;
      prevY = curY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    container.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const delta = clock.getDelta();

      if (!isDragging) {
        targetRotY += 0.007;
        targetRotX = Math.cos(elapsed * 0.7) * 0.2;
      }

      coupleGroup.rotation.y += (targetRotY - coupleGroup.rotation.y) * 0.1;
      coupleGroup.rotation.x += (targetRotX - coupleGroup.rotation.x) * 0.1;

      for (const s of stars) {
        s.angle += s.speed * 0.03;
        s.mesh.position.x = Math.cos(s.angle) * s.r;
        s.mesh.position.z = Math.sin(s.angle) * s.r;
        s.mesh.position.y = s.yBase + Math.sin(elapsed * 2 + s.angle) * 0.2;
        s.mesh.rotation.y += 0.02;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      container.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      container.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[220px] sm:h-[260px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none">
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};
