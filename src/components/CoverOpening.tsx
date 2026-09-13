import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MailOpen, Sparkles, Heart } from 'lucide-react';
import { WeddingConfig } from '../types';

interface CoverOpeningProps {
  isOpen: boolean;
  onOpen: () => void;
  guestName: string;
  config: WeddingConfig | null;
}

export const CoverOpening: React.FC<CoverOpeningProps> = ({
  isOpen,
  onOpen,
  guestName,
  config,
}) => {
  if (isOpen) return null;

  const groom = config?.groom_name || 'Dimas';
  const bride = config?.bride_name || 'Althea';

  return (
    <AnimatePresence>
      <motion.div
        id="cover-opening-overlay"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, y: -100, transition: { duration: 0.9, ease: 'easeInOut' } }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#090a0f] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2a2312]/40 via-[#0d0e14] to-[#06070a] overflow-hidden"
      >
        {/* Subtle background ambient rings */}
        <div className="absolute w-[500px] h-[500px] rounded-full border border-amber-500/10 animate-ping opacity-20 pointer-events-none" />
        <div className="absolute w-[340px] h-[340px] rounded-full border border-amber-400/15 pointer-events-none" />

        {/* Decorative corner borders */}
        <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-amber-400/40 pointer-events-none" />
        <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-amber-400/40 pointer-events-none" />
        <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-amber-400/40 pointer-events-none" />
        <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-amber-400/40 pointer-events-none" />

        {/* Card Content */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative max-w-md w-full text-center flex flex-col items-center z-10 glass-gold rounded-3xl p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-amber-500/30"
        >
          {/* Top Crown / Monogram */}
          <div className="flex items-center gap-2 text-amber-300 text-xs font-medium tracking-[0.3em] uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>The Wedding Of</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>

          {/* Couple Names */}
          <h1 className="font-serif-cormorant text-4xl sm:text-5xl font-normal tracking-wide gold-text-gradient mb-2 leading-tight">
            {groom} <span className="font-calligraphy text-3xl sm:text-4xl text-amber-300/80">&</span> {bride}
          </h1>

          {/* Date */}
          <p className="text-xs uppercase tracking-[0.25em] text-zinc-400 font-light mb-8">
            {config?.wedding_date ? new Date(config.wedding_date).toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }) : 'Minggu, 18 Oktober 2026'}
          </p>

          {/* Guest Recipient Box */}
          <div className="w-full bg-black/40 border border-amber-500/20 rounded-2xl p-5 mb-8 backdrop-blur-md">
            <p className="text-xs text-amber-200/70 font-light mb-1.5">
              Kepada Yth. Bapak/Ibu/Saudara/i:
            </p>
            <p className="text-lg sm:text-xl font-semibold text-amber-100 font-serif-cormorant tracking-wide">
              {guestName || 'Tamu Undangan Istimewa'}
            </p>
            <p className="text-[11px] text-zinc-400 mt-1 font-light italic">
              *Mohon maaf bila ada kesalahan penulisan nama/gelar
            </p>
          </div>

          {/* Open Invitation CTA */}
          <motion.button
            id="btn-buka-undangan"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpen}
            className="group relative px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-black font-semibold text-sm tracking-wider uppercase flex items-center gap-3 shadow-[0_0_25px_rgba(212,175,55,0.45)] hover:shadow-[0_0_35px_rgba(212,175,55,0.7)] transition-all duration-300 cursor-pointer"
          >
            <MailOpen className="w-4 h-4 text-black group-hover:rotate-12 transition-transform" />
            <span>Buka Undangan</span>
            <Heart className="w-3.5 h-3.5 fill-black text-black" />
          </motion.button>

          <p className="text-[11px] text-zinc-500 mt-5 font-light">
            Sentuh tombol di atas untuk membuka undangan & memutar musik
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
