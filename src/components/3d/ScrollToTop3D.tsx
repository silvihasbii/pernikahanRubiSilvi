import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const ScrollToTop3D: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkScroll = () => {
      if (window.scrollY > 350) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener('scroll', checkScroll, { passive: true });
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = 52;
    const height = 52;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 4);

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

    // Glowing Golden Diamond Gem
    const gemGeo = new THREE.OctahedronGeometry(1.1, 0);
    const gemMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xaa7700,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
    });
    const gem = new THREE.Mesh(gemGeo, gemMat);
    scene.add(gem);

    // Mini orbiting gold ring
    const ringGeo = new THREE.TorusGeometry(1.4, 0.06, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffe680 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;
    scene.add(ring);

    const light = new THREE.PointLight(0xffffff, 2.5, 10);
    light.position.set(2, 2, 3);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));

    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      gem.rotation.y = t * 1.5;
      gem.rotation.x = Math.sin(t * 1.2) * 0.4;
      ring.rotation.z = -t * 1.8;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [visible]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      id="btn-scroll-to-top"
      onClick={scrollToTop}
      aria-label="Kembali ke atas"
      className="fixed bottom-6 right-6 z-40 group flex flex-col items-center justify-center p-1 rounded-full bg-black/80 border border-amber-400/40 shadow-[0_0_20px_rgba(212,175,55,0.4)] backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
    >
      <div ref={mountRef} className="w-[52px] h-[52px] pointer-events-none" />
      <span className="absolute -top-7 text-[10px] uppercase font-semibold tracking-wider text-amber-200 bg-black/90 px-2 py-0.5 rounded border border-amber-500/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        Ke Atas
      </span>
    </button>
  );
};
