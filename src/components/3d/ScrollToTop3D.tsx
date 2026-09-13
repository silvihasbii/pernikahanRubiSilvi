import React, { useEffect, useState } from 'react';
import { ChevronUp, Sparkles } from 'lucide-react';

export const ScrollToTop3D: React.FC = () => {
  const [visible, setVisible] = useState(false);

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      id="btn-scroll-to-top"
      onClick={scrollToTop}
      aria-label="Kembali ke atas"
      className="fixed bottom-6 right-6 z-40 group flex flex-col items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-[#1a150a] via-[#241c0e] to-[#0e0f14] border border-amber-400/50 shadow-[0_0_20px_rgba(212,175,55,0.45)] backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer overflow-hidden"
    >
      {/* Animated glowing golden orbiting ring effect */}
      <span className="absolute inset-0 rounded-full border border-amber-400/30 animate-ping opacity-25 pointer-events-none" />
      <span className="absolute inset-0 rounded-full border-t border-amber-300/80 animate-spin pointer-events-none" style={{ animationDuration: '3s' }} />

      <div className="relative flex flex-col items-center justify-center">
        <ChevronUp className="w-5 h-5 text-amber-300 group-hover:-translate-y-0.5 transition-transform duration-200" />
        <Sparkles className="w-2.5 h-2.5 text-amber-400/80 -mt-1" />
      </div>
    </button>
  );
};
