import React from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Sparkles } from 'lucide-react';
import { Hero3DCanvas } from './3d/Hero3DCanvas';
import { WeddingConfig } from '../types';

interface HeroSectionProps {
  config: WeddingConfig | null;
  guestName: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ config, guestName }) => {
  const groom = config?.groom_name || 'Dimas';
  const bride = config?.bride_name || 'Althea';

  const weddingDateStr = config?.wedding_date
    ? new Date(config.wedding_date).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Minggu, 18 Oktober 2026';

  const addToCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `The Wedding of ${groom} & ${bride}`
  )}&dates=20261018T010000Z/20261018T080000Z&details=${encodeURIComponent(
    `Pernikahan Suci ${groom} & ${bride}. Lokasi: ${config?.resepsi_location || 'The Heritage Ballroom'}`
  )}&location=${encodeURIComponent(config?.resepsi_address || 'Jakarta')}`;

  return (
    <section
      id="hero"
      className="relative min-h-screen pt-24 pb-16 px-4 flex flex-col items-center justify-center text-center overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-3xl mx-auto flex flex-col items-center"
      >
        {/* Monogram / Header Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-gold text-amber-300 text-xs font-medium tracking-[0.25em] uppercase mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{config?.cover_title || 'The Royal Wedding'}</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </div>

        {/* Personalized Welcome if guestName is provided */}
        {guestName && (
          <p className="text-xs sm:text-sm text-zinc-400 font-light mb-2">
            Selamat Datang,{' '}
            <span className="text-amber-200 font-medium">{guestName}</span>
          </p>
        )}

        {/* Names */}
        <h1 className="font-serif-cormorant text-5xl sm:text-7xl md:text-8xl font-light tracking-tight gold-text-gradient leading-none mb-4">
          {groom} <span className="font-calligraphy text-4xl sm:text-6xl md:text-7xl text-amber-300/80">&</span> {bride}
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-zinc-400 font-light max-w-md mb-6">
          Kami Mengundang Anda Merayakan Awal Cerita Abadi Kami
        </p>

        {/* 3D WebGL Interactive Double Rings Component */}
        <div className="w-full max-w-lg mb-6">
          <Hero3DCanvas />
        </div>

        {/* Event Quick Snapshot Card */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 glass-gold px-6 py-4 rounded-2xl mb-8 border border-amber-500/20">
          <div className="flex items-center gap-2.5 text-sm text-zinc-300">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span className="font-medium text-amber-100">{weddingDateStr}</span>
          </div>
          <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-amber-500/40" />
          <div className="flex items-center gap-2.5 text-sm text-zinc-300">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span className="font-medium text-amber-100">
              {config?.resepsi_location ? config.resepsi_location.split(',')[0] : 'The Heritage Grand Ballroom'}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-wrap justify-center gap-4">
          <a
            id="btn-add-calendar"
            href={addToCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-full glass-gold text-amber-200 text-xs sm:text-sm font-semibold tracking-wider uppercase flex items-center gap-2 border border-amber-400/40 hover:bg-amber-400/10 hover:border-amber-400 transition-all duration-300 shadow-md"
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            Simpan ke Kalender
          </a>
        </div>
      </motion.div>
    </section>
  );
};
