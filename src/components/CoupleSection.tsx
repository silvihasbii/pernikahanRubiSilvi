import React from 'react';
import { motion } from 'motion/react';
import { Instagram, Heart } from 'lucide-react';
import { Couple3DCanvas } from './3d/Couple3DCanvas';
import { WeddingConfig } from '../types';

interface CoupleSectionProps {
  config: WeddingConfig | null;
}

export const CoupleSection: React.FC<CoupleSectionProps> = ({ config }) => {
  const groomName = config?.groom_name || 'Dimas';
  const groomFullName = config?.groom_full_name || 'Dimas Arya Pratama, S.T.';
  const groomParents = config?.groom_parents || 'Putra pertama dari Bpk. Bambang Sutrisno & Ibu Sri Wahyuni';
  const groomIg = config?.groom_instagram || '@dimas_aryap';

  const brideName = config?.bride_name || 'Althea';
  const brideFullName = config?.bride_full_name || 'Althea Maharani Putri, M.Ds.';
  const brideParents = config?.bride_parents || 'Putri kedua dari Bpk. Hendra Gunawan & Ibu Rina Marlina';
  const brideIg = config?.bride_instagram || '@altheamhrn';

  return (
    <section id="couple" className="relative py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl mx-auto text-center"
      >
        <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.25em] text-amber-300 font-medium mb-3">
          <Heart className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Pasangan Berbahagia</span>
          <Heart className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
        </div>

        <h2 className="font-serif-cormorant text-4xl sm:text-6xl font-light gold-text-gradient mb-4">
          Kedua Mempelai
        </h2>

        <p className="text-sm text-zinc-400 max-w-xl mx-auto mb-10 font-light">
          Dengan memohon rahmat dan ridho Allah Subhanahu Wa Ta&apos;ala, kami bermaksud menyelenggarakan pernikahan suci kami:
        </p>

        {/* 3D Interactive Couple Love Knot Canvas in Center */}
        <div className="w-full max-w-xs mx-auto mb-6">
          <Couple3DCanvas />
        </div>

        {/* Couple Profile Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* Groom Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="glass-gold rounded-3xl p-8 flex flex-col items-center text-center border border-amber-500/25 relative group hover:border-amber-400/50 transition-all shadow-lg"
          >
            {/* Avatar Photo Frame */}
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1.5 bg-gradient-to-tr from-amber-600 to-amber-300 mb-6 shadow-[0_0_20px_rgba(212,175,55,0.3)] group-hover:scale-105 transition-transform duration-300">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80"
                alt={groomFullName}
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>

            <span className="text-xs uppercase tracking-[0.25em] text-amber-400/90 font-semibold mb-1">
              Mempelai Pria
            </span>
            <h3 className="font-serif-cormorant text-2xl sm:text-3xl font-semibold text-amber-100 mb-1">
              {groomFullName}
            </h3>
            <p className="text-xs text-zinc-400 font-light max-w-xs mb-5">
              {groomParents}
            </p>

            {groomIg && (
              <a
                href={`https://instagram.com/${groomIg.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center gap-2 text-xs text-amber-300/80 hover:text-amber-200 glass-gold px-4 py-1.5 rounded-full border border-amber-500/30 transition-colors"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>{groomIg}</span>
              </a>
            )}
          </motion.div>

          {/* Bride Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="glass-gold rounded-3xl p-8 flex flex-col items-center text-center border border-amber-500/25 relative group hover:border-amber-400/50 transition-all shadow-lg"
          >
            {/* Avatar Photo Frame */}
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1.5 bg-gradient-to-tr from-amber-600 to-amber-300 mb-6 shadow-[0_0_20px_rgba(212,175,55,0.3)] group-hover:scale-105 transition-transform duration-300">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80"
                alt={brideFullName}
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>

            <span className="text-xs uppercase tracking-[0.25em] text-amber-400/90 font-semibold mb-1">
              Mempelai Wanita
            </span>
            <h3 className="font-serif-cormorant text-2xl sm:text-3xl font-semibold text-amber-100 mb-1">
              {brideFullName}
            </h3>
            <p className="text-xs text-zinc-400 font-light max-w-xs mb-5">
              {brideParents}
            </p>

            {brideIg && (
              <a
                href={`https://instagram.com/${brideIg.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center gap-2 text-xs text-amber-300/80 hover:text-amber-200 glass-gold px-4 py-1.5 rounded-full border border-amber-500/30 transition-colors"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>{brideIg}</span>
              </a>
            )}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};
