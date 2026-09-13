import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Location3DCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 320;
    let height = container.clientHeight || 260;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2.5, 6.5);
    camera.lookAt(0, 0, 0);

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

    const venueGroup = new THREE.Group();
    scene.add(venueGroup);

    // Golden Pedestal Base
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1f1f28,
      roughness: 0.4,
      metalness: 0.8,
    });
    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.2,
    });

    const baseMesh = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.6, 0.2, 32), baseMat);
    baseMesh.position.y = -1.2;
    venueGroup.add(baseMesh);

    const ringMesh = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.05, 16, 64), goldTrimMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = -1.1;
    venueGroup.add(ringMesh);

    // 6 Pillars of the Pavilion
    const pillarCount = 6;
    const pillarRadius = 1.6;
    for (let i = 0; i < pillarCount; i++) {
      const angle = (i / pillarCount) * Math.PI * 2;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 1.6, 16), goldTrimMat);
      col.position.set(Math.cos(angle) * pillarRadius, -0.3, Math.sin(angle) * pillarRadius);
      venueGroup.add(col);
    }

    // Dome / Roof
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0xe5c158,
      metalness: 0.8,
      roughness: 0.3,
      wireframe: true,
    });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1.7, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.45), domeMat);
    dome.position.y = 0.5;
    venueGroup.add(dome);

    // Floating Map Pin Marker in Center
    const pinGroup = new THREE.Group();
    venueGroup.add(pinGroup);

    const pinMat = new THREE.MeshStandardMaterial({
      color: 0xff3366,
      emissive: 0xaa1133,
      emissiveIntensity: 0.4,
      metalness: 0.3,
      roughness: 0.2,
    });

    const pinHead = new THREE.Mesh(new THREE.SphereGeometry(0.35, 32, 32), pinMat);
    pinHead.position.y = 0.4;
    pinGroup.add(pinHead);

    const pinPoint = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.7, 32), pinMat);
    pinPoint.rotation.x = Math.PI;
    pinPoint.position.y = 0.05;
    pinGroup.add(pinPoint);

    // Inner White Dot on Pin
    const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), dotMat);
    dot.position.set(0, 0.4, 0.25);
    pinGroup.add(dot);

    // Pulse Rings on the Ground
    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });
    const pulseRing = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.25, 32), pulseMat);
    pulseRing.rotation.x = Math.PI / 2;
    pulseRing.position.y = -1.05;
    venueGroup.add(pulseRing);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffecc4, 3, 20);
    pointLight.position.set(3, 5, 4);
    scene.add(pointLight);

    // Interactive Drag
    let isDragging = false;
    let prevX = 0;
    let targetRotY = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      prevX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const curX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      targetRotY += (curX - prevX) * 0.01;
      prevX = curX;
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
      const elapsed = clock.getElapsedTime();

      if (!isDragging) {
        targetRotY += 0.006;
      }
      venueGroup.rotation.y += (targetRotY - venueGroup.rotation.y) * 0.08;

      // Floating pin bobbing
      pinGroup.position.y = Math.sin(elapsed * 2) * 0.15;

      // Pulse ring scaling
      const pulseScale = (elapsed % 1.5) / 1.5;
      pulseRing.scale.set(1 + pulseScale * 4, 1 + pulseScale * 4, 1);
      pulseMat.opacity = Math.max(0, 0.8 * (1 - pulseScale));

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
