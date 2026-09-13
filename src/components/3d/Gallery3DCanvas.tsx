import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Gallery3DCanvasProps {
  photoUrls: string[];
  onSelectPhoto?: (index: number) => void;
}

export const Gallery3DCanvas: React.FC<Gallery3DCanvasProps> = ({ photoUrls }) => {
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
    let width = container.clientWidth || 360;
    let height = container.clientHeight || 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.5);

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

    const carouselGroup = new THREE.Group();
    scene.add(carouselGroup);

    const frameGeo = new THREE.BoxGeometry(1.6, 2.1, 0.08);
    const borderMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.85,
      roughness: 0.2,
    });

    const textureLoader = new THREE.TextureLoader();
    const count = Math.min(photoUrls.length || 6, 6);
    const radius = 3.2;

    const loadedTextures: THREE.Texture[] = [];
    const planeGeo = new THREE.PlaneGeometry(1.45, 1.95);

    for (let i = 0; i < count; i++) {
      const card = new THREE.Group();
      const angle = (i / count) * Math.PI * 2;

      const frame = new THREE.Mesh(frameGeo, borderMat);
      card.add(frame);

      const url = photoUrls[i] || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80';
      const texture = textureLoader.load(url);
      texture.colorSpace = THREE.SRGBColorSpace;
      loadedTextures.push(texture);

      const photoMat = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
      });

      const photoMesh = new THREE.Mesh(planeGeo, photoMat);
      photoMesh.position.z = 0.05;
      card.add(photoMesh);

      card.position.x = Math.sin(angle) * radius;
      card.position.z = Math.cos(angle) * radius;
      card.rotation.y = angle;

      carouselGroup.add(card);
    }

    const particleCount = 60;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfde68a,
      size: 0.06,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffecc4, 2, 20);
    pointLight.position.set(0, 3, 6);
    scene.add(pointLight);

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
      const delta = curX - prevX;
      targetRotY += delta * 0.008;
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
        targetRotY += 0.003;
      }
      carouselGroup.rotation.y += (targetRotY - carouselGroup.rotation.y) * 0.08;
      carouselGroup.position.y = Math.sin(elapsed * 1.2) * 0.1;

      particles.rotation.y = elapsed * 0.05;

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

      for (const t of loadedTextures) {
        t.dispose();
      }
      frameGeo.dispose();
      planeGeo.dispose();
      borderMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [isInView, photoUrls]);

  return (
    <div className="relative w-full h-[320px] sm:h-[360px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none bg-transparent">
      <div ref={mountRef} className="w-full h-full bg-transparent overflow-hidden" />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none text-xs text-amber-200/60 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-amber-500/20">
        📸 Carousel 3D: Sentuh atau geser untuk memutar foto
      </div>
    </div>
  );
};
