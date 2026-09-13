import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Rsvp3DCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 300;
    let height = container.clientHeight || 240;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 6.2);

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

    const rsvpGroup = new THREE.Group();
    scene.add(rsvpGroup);

    // 3D Envelope Body
    const envelopeMat = new THREE.MeshStandardMaterial({
      color: 0x22222c,
      roughness: 0.3,
      metalness: 0.6,
    });
    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x3d2800,
      emissiveIntensity: 0.2,
    });

    const bodyGeo = new THREE.BoxGeometry(2.4, 1.6, 0.15);
    const bodyMesh = new THREE.Mesh(bodyGeo, envelopeMat);
    rsvpGroup.add(bodyMesh);

    // Gold borders around envelope
    const borderEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(bodyGeo),
      new THREE.LineBasicMaterial({ color: 0xd4af37, linewidth: 2 })
    );
    rsvpGroup.add(borderEdges);

    // Envelope Flap
    const flapShape = new THREE.Shape();
    flapShape.moveTo(-1.2, 0.8);
    flapShape.lineTo(1.2, 0.8);
    flapShape.lineTo(0, -0.2);
    flapShape.closePath();

    const flapGeo = new THREE.ShapeGeometry(flapShape);
    const flapMesh = new THREE.Mesh(flapGeo, envelopeMat);
    flapMesh.position.z = 0.08;
    rsvpGroup.add(flapMesh);

    // Wax Seal Stamp (Ruby Red with Gold Heart)
    const sealMat = new THREE.MeshStandardMaterial({
      color: 0x991122,
      roughness: 0.4,
      metalness: 0.3,
    });
    const seal = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.08, 32), sealMat);
    seal.rotation.x = Math.PI / 2;
    seal.position.set(0, -0.2, 0.12);
    rsvpGroup.add(seal);

    const heartMat = new THREE.MeshBasicMaterial({ color: 0xf3e5ab });
    const heart = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), heartMat);
    heart.position.set(0, -0.2, 0.17);
    rsvpGroup.add(heart);

    // Floating Wishing Lanterns in Background
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xffd97d,
      emissive: 0xffa200,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.85,
    });

    const lanterns: { mesh: THREE.Mesh; x: number; baseY: number; speed: number; phase: number }[] = [];
    for (let i = 0; i < 4; i++) {
      const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.4, 8), lanternMat);
      const x = (i - 1.5) * 1.5;
      const baseY = -1.2 + Math.random() * 0.8;
      lantern.position.set(x, baseY, -1.5);
      scene.add(lantern);
      lanterns.push({
        mesh: lantern,
        x,
        baseY,
        speed: 0.8 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffd700, 3, 15);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);

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
        targetRotY = Math.sin(elapsed * 0.6) * 0.35;
        targetRotX = Math.cos(elapsed * 0.5) * 0.15;
      }
      rsvpGroup.rotation.y += (targetRotY - rsvpGroup.rotation.y) * 0.08;
      rsvpGroup.rotation.x += (targetRotX - rsvpGroup.rotation.x) * 0.08;
      rsvpGroup.position.y = Math.sin(elapsed * 1.5) * 0.1;

      // Float lanterns upward slowly and loop
      for (const l of lanterns) {
        l.mesh.position.y = l.baseY + Math.sin(elapsed * l.speed + l.phase) * 0.3;
        l.mesh.rotation.y = elapsed * 0.5;
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
    <div className="relative w-full h-[220px] sm:h-[260px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none">
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};
