import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const Hero3DCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(true);

  // Monitor visibility so we only consume WebGL context when near viewport
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin: '250px 0px', threshold: 0.01 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || !isInView) return;

    let isDisposed = false;
    let width = container.clientWidth || 420;
    let height = container.clientHeight || 450;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8);

    // Renderer
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
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      renderer.domElement.style.background = 'transparent';
      renderer.domElement.style.backgroundColor = 'transparent';
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';

      container.innerHTML = '';
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('Hero WebGL init skipped:', e);
      return;
    }

    // Context Lost Protection
    let isContextLost = false;
    const onContextLost = (e: Event) => {
      e.preventDefault();
      isContextLost = true;
      if (renderer?.domElement) {
        renderer.domElement.style.opacity = '0';
      }
    };
    const onContextRestored = () => {
      isContextLost = false;
      if (renderer?.domElement) {
        renderer.domElement.style.opacity = '1';
      }
    };

    const canvas = renderer.domElement;
    canvas.addEventListener('webglcontextlost', onContextLost, false);
    canvas.addEventListener('webglcontextrestored', onContextRestored, false);

    // Group for the rings
    const ringsGroup = new THREE.Group();
    scene.add(ringsGroup);

    // Materials
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xdfb758,
      metalness: 0.92,
      roughness: 0.18,
      emissive: 0x3d2c00,
      emissiveIntensity: 0.2,
    });

    const platinumMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5fa,
      metalness: 0.95,
      roughness: 0.12,
    });

    const diamondMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      opacity: 1,
      transparent: true,
      roughness: 0.05,
      ior: 2.417,
      metalness: 0.1,
    });

    // Groom Ring
    const groomRingGeo = new THREE.TorusGeometry(1.6, 0.22, 32, 100);
    const groomRing = new THREE.Mesh(groomRingGeo, goldMaterial);
    groomRing.rotation.x = Math.PI / 3;
    groomRing.position.set(-0.9, 0, 0);
    ringsGroup.add(groomRing);

    // Bride Ring
    const brideRingGeo = new THREE.TorusGeometry(1.4, 0.2, 32, 100);
    const brideRing = new THREE.Mesh(brideRingGeo, platinumMaterial);
    brideRing.rotation.x = -Math.PI / 4;
    brideRing.rotation.y = Math.PI / 6;
    brideRing.position.set(0.9, 0, 0);
    ringsGroup.add(brideRing);

    // Diamond Gemstone on Bride Ring
    const diamondGeo = new THREE.OctahedronGeometry(0.42, 2);
    const diamond = new THREE.Mesh(diamondGeo, diamondMaterial);
    diamond.position.set(0.9, 1.45, 0.2);
    diamond.rotation.x = 0.5;
    ringsGroup.add(diamond);

    // Gemstone Prong mount
    const prongGeo = new THREE.CylinderGeometry(0.2, 0.35, 0.3, 8);
    const prong = new THREE.Mesh(prongGeo, goldMaterial);
    prong.position.set(0.9, 1.3, 0.15);
    ringsGroup.add(prong);

    // Floating Stardust Particles
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const goldColor = new THREE.Color(0xd4af37);
    const whiteColor = new THREE.Color(0xffffff);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;

      const mixed = Math.random() > 0.4 ? goldColor : whiteColor;
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Falling Rose Petals
    const petalCount = 16;
    const petalGeo = new THREE.PlaneGeometry(0.2, 0.25);
    const petalMat = new THREE.MeshStandardMaterial({
      color: 0xe68a9c,
      roughness: 0.4,
      metalness: 0.1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });

    const petalData: {
      mesh: THREE.Mesh;
      speedY: number;
      rotSpeedX: number;
      rotSpeedZ: number;
    }[] = [];

    for (let i = 0; i < petalCount; i++) {
      const petal = new THREE.Mesh(petalGeo, petalMat);
      petal.position.set(
        (Math.random() - 0.5) * 10,
        Math.random() * 8 - 4,
        (Math.random() - 0.5) * 6
      );
      petal.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      scene.add(petal);

      petalData.push({
        mesh: petal,
        speedY: 0.008 + Math.random() * 0.015,
        rotSpeedX: 0.01 + Math.random() * 0.02,
        rotSpeedZ: 0.01 + Math.random() * 0.02,
      });
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff1cf, 2.8);
    keyLight.position.set(4, 6, 6);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xb0c4de, 1.2);
    fillLight.position.set(-5, -2, 4);
    scene.add(fillLight);

    const goldSparkleLight = new THREE.PointLight(0xffd700, 3.5, 12);
    goldSparkleLight.position.set(0.9, 2.0, 2);
    scene.add(goldSparkleLight);

    // Interactive Drag Controls
    let isDragging = false;
    let previousPointerX = 0;
    let previousPointerY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      previousPointerX = clientX;
      previousPointerY = clientY;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - previousPointerX;
      const deltaY = clientY - previousPointerY;

      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.008;
      targetRotationX = Math.max(-0.6, Math.min(0.6, targetRotationX));

      previousPointerX = clientX;
      previousPointerY = clientY;
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

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0 && renderer) {
          width = newW;
          height = newH;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        }
      }
    });
    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      if (isDisposed) return;
      animationFrameId = requestAnimationFrame(animate);

      if (isContextLost || !renderer) return;

      const elapsedTime = clock.getElapsedTime();

      // Smooth rotate towards target
      if (!isDragging) {
        targetRotationY += 0.004;
      }
      ringsGroup.rotation.y += (targetRotationY - ringsGroup.rotation.y) * 0.08;
      ringsGroup.rotation.x += (targetRotationX - ringsGroup.rotation.x) * 0.08;

      // Floating bobbing effect
      ringsGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.18;

      // Diamond sparkle rotation
      diamond.rotation.y = elapsedTime * 1.2;

      // Orbiting particles
      particles.rotation.y = elapsedTime * 0.03;
      particles.rotation.x = Math.sin(elapsedTime * 0.02) * 0.1;

      // Fluttering Petals
      for (let i = 0; i < petalData.length; i++) {
        const p = petalData[i];
        p.mesh.position.y -= p.speedY;
        p.mesh.position.x += Math.sin(elapsedTime + i) * 0.005;
        p.mesh.rotation.x += p.rotSpeedX;
        p.mesh.rotation.z += p.rotSpeedZ;

        if (p.mesh.position.y < -5) {
          p.mesh.position.y = 5;
          p.mesh.position.x = (Math.random() - 0.5) * 14;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);
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

      // Dispose geometries & materials
      groomRingGeo.dispose();
      goldMaterial.dispose();
      brideRingGeo.dispose();
      platinumMaterial.dispose();
      diamondGeo.dispose();
      diamondMaterial.dispose();
      prongGeo.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      petalGeo.dispose();
      petalMat.dispose();
    };
  }, [isInView]);

  return (
    <div className="relative w-full h-[380px] sm:h-[460px] md:h-[500px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none bg-transparent">
      <div ref={mountRef} className="w-full h-full bg-transparent overflow-hidden" />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none text-xs text-amber-200/60 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-amber-500/20">
        ✨ Geser atau sentuh cincin 3D untuk memutar
      </div>
    </div>
  );
};
