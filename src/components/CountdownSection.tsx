import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock } from 'lucide-react';
import { Countdown3DCanvas } from './3d/Countdown3DCanvas';
import { WeddingConfig } from '../types';

interface CountdownSectionProps {
  config: WeddingConfig | null;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export const CountdownSection: React.FC<CountdownSectionProps> = ({ config }) => {
  const targetDateStr = config?.wedding_date || '2026-10-18T09:00:00+07:00';

  const [timeLeft, setTimeLeft] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(targetDateStr).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr]);

  const units = [
    { label: 'Hari', value: timeLeft.days },
    { label: 'Jam', value: timeLeft.hours },
    { label: 'Menit', value: timeLeft.minutes },
    { label: 'Detik', value: timeLeft.seconds },
  ];

  return (
    <section id="countdown" className="relative py-20 px-4 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl w-full mx-auto text-center flex flex-col items-center"
      >
        {/* Quote Card */}
        {config?.quote && (
          <div className="max-w-2xl mx-auto mb-16 p-6 sm:p-8 rounded-3xl glass-gold border border-amber-500/20 relative">
            <span className="text-4xl text-amber-400/30 font-serif leading-none absolute top-4 left-4">“</span>
            <p className="font-serif-cormorant text-lg sm:text-xl text-amber-100/90 italic leading-relaxed px-4">
              {config.quote}
            </p>
            <p className="text-xs uppercase tracking-widest text-amber-300/80 font-semibold mt-4">
              — {config.quote_source || 'QS. Ar-Rum: 21'}
            </p>
          </div>
        )}

        {/* Section Header */}
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-amber-300/90 font-medium mb-3">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Menghitung Hari Bahagia</span>
        </div>
        <h2 className="font-serif-cormorant text-3xl sm:text-5xl font-light gold-text-gradient mb-8">
          Hitung Mundur Acara
        </h2>

        {/* 3D WebGL Interactive Time Crystal / Gyroscope */}
        <div className="w-full max-w-sm mb-6">
          <Countdown3DCanvas />
        </div>

        {/* Countdown Digit Blocks */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 w-full max-w-xl">
          {units.map((unit, idx) => (
            <motion.div
              key={unit.label}
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="glass-gold rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center border border-amber-500/30 relative overflow-hidden group hover:border-amber-400/60 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="font-serif-cormorant text-3xl sm:text-5xl font-bold gold-text-gradient tracking-tight mb-1">
                {String(unit.value).padStart(2, '0')}
              </span>
              <span className="text-[11px] sm:text-xs uppercase tracking-widest text-zinc-400 font-medium">
                {unit.label}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};
