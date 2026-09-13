import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, MapPin, ExternalLink } from 'lucide-react';
import { Location3DCanvas } from './3d/Location3DCanvas';
import { WeddingConfig } from '../types';

interface EventSectionProps {
  config: WeddingConfig | null;
}

export const EventSection: React.FC<EventSectionProps> = ({ config }) => {
  const akadTime = config?.akad_time || '08:00 - 10:00 WIB';
  const akadLocation = config?.akad_location || 'Glass House Chapel, The Heritage Grand Ballroom';
  const akadAddress = config?.akad_address || 'Jl. Sunset Boulevard No. 88, Menteng, Jakarta Pusat';
  const akadMapUrl = config?.akad_map_url || 'https://maps.google.com/?q=Jakarta';

  const resepsiTime = config?.resepsi_time || '11:00 - 15:00 WIB';
  const resepsiLocation = config?.resepsi_location || 'Grand Ballroom & Royal Garden, The Heritage';
  const resepsiAddress = config?.resepsi_address || 'Jl. Sunset Boulevard No. 88, Menteng, Jakarta Pusat';
  const resepsiMapUrl = config?.resepsi_map_url || 'https://maps.google.com/?q=Jakarta';

  const weddingDateStr = config?.wedding_date
    ? new Date(config.wedding_date).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Minggu, 18 Oktober 2026';

  return (
    <section id="event" className="relative py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl mx-auto text-center"
      >
        <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.25em] text-amber-300 font-medium mb-3">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span>Waktu & Tempat Pelaksanaan</span>
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
        </div>

        <h2 className="font-serif-cormorant text-4xl sm:text-6xl font-light gold-text-gradient mb-4">
          Rangkaian Acara
        </h2>

        <p className="text-sm text-zinc-400 max-w-lg mx-auto mb-10 font-light">
          Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
        </p>

        {/* 3D WebGL Interactive Architectural Pavilion / Map Pin Canvas */}
        <div className="w-full max-w-sm mx-auto mb-10">
          <Location3DCanvas />
        </div>

        {/* Event Schedule Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Akad Nikah Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-gold rounded-3xl p-8 flex flex-col items-center text-center border border-amber-500/25 relative group hover:border-amber-400/50 transition-all shadow-xl"
          >
            <div className="px-4 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold tracking-widest uppercase mb-6">
              Akad Nikah
            </div>

            <div className="flex items-center gap-2 text-sm text-amber-200 font-medium mb-3">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>{weddingDateStr}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-zinc-300 mb-6">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{akadTime}</span>
            </div>

            <div className="h-[1px] w-16 bg-amber-500/30 mb-6" />

            <h3 className="font-serif-cormorant text-2xl font-semibold text-amber-100 mb-2">
              {akadLocation}
            </h3>
            <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-xs mb-8">
              {akadAddress}
            </p>

            <a
              id="btn-map-akad"
              href={akadMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 text-xs font-semibold uppercase tracking-wider border border-amber-500/40 hover:border-amber-400 transition-all duration-200"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Buka Petunjuk Arah</span>
              <ExternalLink className="w-3 h-3 text-amber-400/70" />
            </a>
          </motion.div>

          {/* Resepsi Pernikahan Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="glass-gold rounded-3xl p-8 flex flex-col items-center text-center border border-amber-500/25 relative group hover:border-amber-400/50 transition-all shadow-xl"
          >
            <div className="px-4 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold tracking-widest uppercase mb-6">
              Resepsi Pernikahan
            </div>

            <div className="flex items-center gap-2 text-sm text-amber-200 font-medium mb-3">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>{weddingDateStr}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-zinc-300 mb-6">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{resepsiTime}</span>
            </div>

            <div className="h-[1px] w-16 bg-amber-500/30 mb-6" />

            <h3 className="font-serif-cormorant text-2xl font-semibold text-amber-100 mb-2">
              {resepsiLocation}
            </h3>
            <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-xs mb-8">
              {resepsiAddress}
            </p>

            <a
              id="btn-map-resepsi"
              href={resepsiMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 text-xs font-semibold uppercase tracking-wider border border-amber-500/40 hover:border-amber-400 transition-all duration-200"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Buka Petunjuk Arah</span>
              <ExternalLink className="w-3 h-3 text-amber-400/70" />
            </a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};
