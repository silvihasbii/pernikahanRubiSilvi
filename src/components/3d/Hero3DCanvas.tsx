import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Hero3DCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 450;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Group for the rings
    const ringsGroup = new THREE.Group();
    scene.add(ringsGroup);

    // Materials
    // Gold material
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
      ior: 2.417, // Diamond refractive index
      metalness: 0.1,
    });

    // Groom Ring
    const groomRingGeo = new THREE.TorusGeometry(1.6, 0.22, 32, 100);
    const groomRing = new THREE.Mesh(groomRingGeo, goldMaterial);
    groomRing.rotation.x = Math.PI / 3;
    groomRing.position.set(-0.9, 0, 0);
    ringsGroup.add(groomRing);

    // Bride Ring (slightly smaller, interlinked)
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
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      scales[i] = Math.random();
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xf9e79f,
      size: 0.08,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Floating Petals
    const petalCount = 40;
    const petalsGroup = new THREE.Group();
    scene.add(petalsGroup);

    const petalShape = new THREE.Shape();
    petalShape.moveTo(0, 0);
    petalShape.bezierCurveTo(0.2, 0.3, 0.2, 0.6, 0, 0.8);
    petalShape.bezierCurveTo(-0.2, 0.6, -0.2, 0.3, 0, 0);

    const petalGeo = new THREE.ShapeGeometry(petalShape);
    const petalMat = new THREE.MeshStandardMaterial({
      color: 0xffccd5,
      side: THREE.DoubleSide,
      roughness: 0.6,
      transparent: true,
      opacity: 0.85,
    });

    const petalData: { mesh: THREE.Mesh; speedY: number; rotSpeedX: number; rotSpeedZ: number }[] = [];

    for (let i = 0; i < petalCount; i++) {
      const petal = new THREE.Mesh(petalGeo, petalMat);
      petal.position.set(
        (Math.random() - 0.5) * 14,
        Math.random() * 8 - 4,
        (Math.random() - 0.5) * 8
      );
      petal.scale.setScalar(Math.random() * 0.4 + 0.3);
      petal.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      petalsGroup.add(petal);

      petalData.push({
        mesh: petal,
        speedY: Math.random() * 0.015 + 0.008,
        rotSpeedX: (Math.random() - 0.5) * 0.02,
        rotSpeedZ: (Math.random() - 0.5) * 0.02,
      });
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xffecc4, 3.5, 30);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffd700, 2.5, 20);
    pointLight2.position.set(-5, -4, 4);
    scene.add(pointLight2);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
    rimLight.position.set(0, 8, -5);
    scene.add(rimLight);

    // Interactive pointer drag / touch
    let isDragging = false;
    let previousPointerX = 0;
    let previousPointerY = 0;
    let targetRotationX = 0.2;
    let targetRotationY = 0.3;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      previousPointerX = clientX;
      previousPointerY = clientY;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) {
        // Subtle tilt on hover
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const rect = container.getBoundingClientRect();
        const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
        const normY = -(((clientY - rect.top) / rect.height) * 2 - 1);
        targetRotationY += (normX * 0.4 - targetRotationY) * 0.05;
        targetRotationX += (-normY * 0.3 - targetRotationX) * 0.05;
        return;
      }
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - previousPointerX;
      const deltaY = clientY - previousPointerY;

      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.008;

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
        if (newW > 0 && newH > 0) {
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
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth rotate towards target
      if (!isDragging) {
        targetRotationY += 0.004; // Gentle idle spin
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
      cancelAnimationFrame(animationFrameId);
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
    <div className="relative w-full h-[380px] sm:h-[460px] md:h-[500px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none text-xs text-amber-200/60 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-amber-500/20">
        ✨ Geser atau sentuh cincin 3D untuk memutar
      </div>
    </div>
  );
};
