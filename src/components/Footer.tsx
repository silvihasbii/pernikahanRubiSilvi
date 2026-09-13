import React from 'react';
import { Heart } from 'lucide-react';
import { WeddingConfig } from '../types';

interface FooterProps {
  config: WeddingConfig | null;
}

export const Footer: React.FC<FooterProps> = ({ config }) => {
  const groom = config?.groom_name || 'Dimas';
  const bride = config?.bride_name || 'Althea';

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

        <p className="text-[10px] text-zinc-600 mt-8 tracking-wider">
          © 2026 {groom} & {bride} Wedding Invitation. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
