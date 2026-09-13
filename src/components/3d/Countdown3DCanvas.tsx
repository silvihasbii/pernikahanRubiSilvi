import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Countdown3DCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 320;
    let height = container.clientHeight || 280;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.background = 'transparent';
    renderer.domElement.style.display = 'block';

    const onContextLost = (e: Event) => e.preventDefault();
    renderer.domElement.addEventListener('webglcontextlost', onContextLost, false);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const gyroGroup = new THREE.Group();
    scene.add(gyroGroup);

    // Outer Golden Dial Ring
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.2,
      wireframe: false,
    });

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.06, 16, 64), ringMat);
    gyroGroup.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.05, 16, 64), ringMat);
    ring2.rotation.x = Math.PI / 4;
    gyroGroup.add(ring2);

    const ring3 = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.04, 16, 64), ringMat);
    ring3.rotation.y = Math.PI / 3;
    gyroGroup.add(ring3);

    // Central Floating Crystal (Icosahedron)
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: 0xffe8a3,
      emissive: 0x443000,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.7,
      transparent: true,
      opacity: 0.9,
      ior: 2.2,
    });
    const crystal = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 0), crystalMat);
    gyroGroup.add(crystal);

    // 4 Orbiting Time Orbs (Hari, Jam, Menit, Detik)
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0xfff0b3,
      emissive: 0xd4af37,
      emissiveIntensity: 0.8,
      metalness: 0.5,
      roughness: 0.1,
    });

    const orbs: { mesh: THREE.Mesh; radius: number; speed: number; angle: number; yOffset: number }[] = [];
    const orbRadii = [2.2, 1.7, 1.2, 0.8];
    const orbSpeeds = [0.8, 1.3, 1.9, 2.7];

    for (let i = 0; i < 4; i++) {
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), orbMat);
      scene.add(orb);
      orbs.push({
        mesh: orb,
        radius: orbRadii[i],
        speed: orbSpeeds[i],
        angle: (i * Math.PI) / 2,
        yOffset: (i - 1.5) * 0.2,
      });
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffd700, 3, 20);
    pointLight.position.set(4, 4, 6);
    scene.add(pointLight);

    // Touch & Mouse Drag
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
      targetRotY += (curX - prevX) * 0.01;
      targetRotX += (curY - prevY) * 0.01;
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

    // Resize
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

    let isVisible = true;
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry ? entry.isIntersecting : true;
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isVisible) return;
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      if (!isDragging) {
        targetRotY += 0.008;
        targetRotX = Math.sin(elapsed * 0.5) * 0.2;
      }

      gyroGroup.rotation.y += (targetRotY - gyroGroup.rotation.y) * 0.1;
      gyroGroup.rotation.x += (targetRotX - gyroGroup.rotation.x) * 0.1;

      ring1.rotation.z += 0.005;
      ring2.rotation.x += 0.009;
      ring3.rotation.y += 0.012;

      crystal.rotation.x = elapsed * 0.6;
      crystal.rotation.y = elapsed * 0.8;

      // Update orbiting time orbs
      for (const orb of orbs) {
        orb.angle += orb.speed * delta;
        orb.mesh.position.x = Math.cos(orb.angle) * orb.radius;
        orb.mesh.position.z = Math.sin(orb.angle) * orb.radius;
        orb.mesh.position.y = Math.sin(orb.angle * 2) * 0.3 + orb.yOffset;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
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
    <div className="relative w-full h-[240px] sm:h-[280px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none">
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};
