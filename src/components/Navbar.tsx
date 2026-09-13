import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Heart, Calendar, Image as ImageIcon, MessageSquareHeart, Home, Film } from 'lucide-react';
import { weddingAudio } from '../utils/audioPlayer';

interface NavbarProps {
  activeSection: string;
  hasVideo?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeSection, hasVideo }) => {
  const [isPlaying, setIsPlaying] = useState(weddingAudio.getIsPlaying());

  useEffect(() => {
    const unsub = weddingAudio.subscribe((state) => setIsPlaying(state));
    return () => unsub();
  }, []);

  const navItems = [
    { id: 'hero', label: 'Beranda', icon: Home },
    { id: 'couple', label: 'Mempelai', icon: Heart },
    ...(hasVideo ? [{ id: 'video', label: 'Video', icon: Film }] : []),
    { id: 'event', label: 'Acara', icon: Calendar },
    { id: 'gallery', label: 'Galeri', icon: ImageIcon },
    { id: 'rsvp', label: 'RSVP', icon: MessageSquareHeart },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      id="main-navbar"
      aria-label="Navigasi Utama"
      className="fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-lg transition-all duration-300 pointer-events-auto"
    >
      <div className="glass-gold rounded-full px-3 sm:px-4 py-2 shadow-[0_10px_35px_rgba(0,0,0,0.7)] flex items-center justify-between border border-amber-500/25 backdrop-blur-xl">
        {/* Navigation Links */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => scrollTo(item.id)}
                className={`relative px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-black font-semibold shadow-[0_0_15px_rgba(212,175,55,0.5)]'
                    : 'text-zinc-300 hover:text-amber-200 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-amber-400/80'}`} />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Music Player Toggle */}
        <div className="flex items-center pl-2 border-l border-amber-500/20">
          <button
            id="btn-toggle-music"
            onClick={() => weddingAudio.toggle()}
            aria-label={isPlaying ? 'Jeda Musik' : 'Putar Musik'}
            className={`relative p-2 rounded-full border transition-all duration-300 cursor-pointer ${
              isPlaying
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 animate-gold-pulse'
                : 'bg-black/40 border-zinc-700 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {isPlaying ? (
              <div className="flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                <span className="flex gap-0.5 items-end h-3">
                  <span className="w-0.5 h-2 bg-amber-400 animate-pulse" />
                  <span className="w-0.5 h-3 bg-amber-300 animate-pulse delay-75" />
                  <span className="w-0.5 h-1.5 bg-amber-400 animate-pulse delay-150" />
                </span>
              </div>
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};
