import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const Rsvp3DCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin: '200px 0px', threshold: 0.01 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || !isInView) return;

    let isDisposed = false;
    let width = container.clientWidth || 300;
    let height = container.clientHeight || 240;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 6.2);

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.domElement.style.background = 'transparent';
      renderer.domElement.style.backgroundColor = 'transparent';
      renderer.domElement.style.display = 'block';

      container.innerHTML = '';
      container.appendChild(renderer.domElement);
    } catch {
      return;
    }

    let isContextLost = false;
    const onContextLost = (e: Event) => {
      e.preventDefault();
      isContextLost = true;
      if (renderer?.domElement) renderer.domElement.style.opacity = '0';
    };
    const onContextRestored = () => {
      isContextLost = false;
      if (renderer?.domElement) renderer.domElement.style.opacity = '1';
    };

    const canvas = renderer.domElement;
    canvas.addEventListener('webglcontextlost', onContextLost, false);
    canvas.addEventListener('webglcontextrestored', onContextRestored, false);

    const rsvpGroup = new THREE.Group();
    scene.add(rsvpGroup);

    const envelopeMat = new THREE.MeshStandardMaterial({
      color: 0x22222c,
      roughness: 0.3,
      metalness: 0.6,
    });
    const bodyGeo = new THREE.BoxGeometry(2.4, 1.6, 0.15);
    const bodyMesh = new THREE.Mesh(bodyGeo, envelopeMat);
    rsvpGroup.add(bodyMesh);

    const borderEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(bodyGeo),
      new THREE.LineBasicMaterial({ color: 0xd4af37, linewidth: 2 })
    );
    rsvpGroup.add(borderEdges);

    const flapShape = new THREE.Shape();
    flapShape.moveTo(-1.2, 0.8);
    flapShape.lineTo(1.2, 0.8);
    flapShape.lineTo(0, -0.2);
    flapShape.closePath();

    const flapGeo = new THREE.ShapeGeometry(flapShape);
    const flapMesh = new THREE.Mesh(flapGeo, envelopeMat);
    flapMesh.position.z = 0.08;
    rsvpGroup.add(flapMesh);

    const sealMat = new THREE.MeshStandardMaterial({
      color: 0x991122,
      roughness: 0.4,
      metalness: 0.3,
    });
    const sealGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.08, 32);
    const seal = new THREE.Mesh(sealGeo, sealMat);
    seal.rotation.x = Math.PI / 2;
    seal.position.set(0, -0.2, 0.12);
    rsvpGroup.add(seal);

    const heartMat = new THREE.MeshBasicMaterial({ color: 0xf3e5ab });
    const heartGeo = new THREE.OctahedronGeometry(0.12, 0);
    const heart = new THREE.Mesh(heartGeo, heartMat);
    heart.position.set(0, -0.2, 0.17);
    rsvpGroup.add(heart);

    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xffd97d,
      emissive: 0xffa200,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.85,
    });

    const lanternGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.4, 8);
    const lanterns: { mesh: THREE.Mesh; x: number; baseY: number; speed: number; phase: number }[] = [];
    for (let i = 0; i < 4; i++) {
      const lantern = new THREE.Mesh(lanternGeo, lanternMat);
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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffd700, 3, 15);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);

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
        if (newW > 0 && newH > 0 && renderer) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      if (isDisposed) return;
      animId = requestAnimationFrame(animate);

      if (isContextLost || !renderer) return;
      const elapsed = clock.getElapsedTime();

      if (!isDragging) {
        targetRotY = Math.sin(elapsed * 0.6) * 0.35;
        targetRotX = Math.cos(elapsed * 0.5) * 0.15;
      }
      rsvpGroup.rotation.y += (targetRotY - rsvpGroup.rotation.y) * 0.08;
      rsvpGroup.rotation.x += (targetRotX - rsvpGroup.rotation.x) * 0.08;
      rsvpGroup.position.y = Math.sin(elapsed * 1.5) * 0.1;

      for (const l of lanterns) {
        l.mesh.position.y = l.baseY + Math.sin(elapsed * l.speed + l.phase) * 0.3;
        l.mesh.rotation.y = elapsed * 0.5;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();

      container.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      container.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);

      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);

      if (renderer) {
        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
        renderer.forceContextLoss();
        renderer = null;
      }

      bodyGeo.dispose();
      envelopeMat.dispose();
      flapGeo.dispose();
      sealGeo.dispose();
      sealMat.dispose();
      heartGeo.dispose();
      heartMat.dispose();
      lanternGeo.dispose();
      lanternMat.dispose();
    };
  }, [isInView]);

  return (
    <div className="relative w-full h-[220px] sm:h-[260px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none bg-transparent">
      <div ref={mountRef} className="w-full h-full bg-transparent overflow-hidden" />
    </div>
  );
};
