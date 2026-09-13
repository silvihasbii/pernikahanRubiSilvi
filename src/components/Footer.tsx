import React from 'react';
import { Heart, Settings, ShieldCheck } from 'lucide-react';
import { WeddingConfig } from '../types';

interface FooterProps {
  config: WeddingConfig | null;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ config, onOpenAdmin }) => {
  const groom = config?.groom_name || 'Dimas';
  const bride = config?.bride_name || 'Althea';

  const handleOpenAdmin = () => {
    if (onOpenAdmin) {
      onOpenAdmin();
    } else if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/admin');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <footer className="relative py-16 px-4 text-center border-t border-amber-500/20 bg-black/60 backdrop-blur-md">
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        <h3 className="font-serif-cormorant text-3xl sm:text-4xl gold-text-gradient mb-2">
          {groom} & {bride}
        </h3>
        <p className="text-xs uppercase tracking-[0.25em] text-zinc-400 font-light mb-6">
          The Royal Wedding Celebration
        </p>

        <p className="text-xs sm:text-sm text-zinc-400 max-w-md font-light leading-relaxed mb-8">
          Merupakan suatu kehormatan dan kebahagiaan bagi kami sekeluarga apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
        </p>

        <div className="flex items-center gap-1.5 text-xs text-amber-200/70">
          <span>Kami yang berbahagia, Keluarga Besar Kedua Mempelai</span>
          <Heart className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        </div>

        {/* Admin Portal / Backend Database Management Access Button */}
        <div className="mt-8 pt-6 border-t border-white/5 w-full flex flex-col items-center">
          <button
            id="btn-footer-admin-portal"
            onClick={handleOpenAdmin}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-amber-300/80 hover:text-amber-200 bg-amber-950/30 hover:bg-amber-900/40 border border-amber-500/20 hover:border-amber-400/40 transition-all duration-200 shadow-sm cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Kelola Undangan & Database Backend</span>
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          </button>
          <span className="text-[10px] text-zinc-600 mt-2">
            Akses portal pengaturan untuk mengubah data mempelai, tanggal countdown, video, dan template WhatsApp.
          </span>
        </div>

        <p className="text-[10px] text-zinc-600 mt-6 tracking-wider">
          © 2026 {groom} & {bride} Wedding Invitation. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
