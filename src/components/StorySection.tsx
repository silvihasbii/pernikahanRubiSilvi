import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Heart, Compass, Gem } from 'lucide-react';

export const StorySection: React.FC = () => {
  const milestones = [
    {
      year: '2021',
      title: 'Awal Pertemuan',
      description:
        'Takdir mempertemukan kami di sebuah sudut perpustakaan kota tua. Percakapan santai tentang karya seni dan arsitektur menjadi gerbang benih-benih cinta.',
      icon: Compass,
    },
    {
      year: '2023',
      title: 'Menjalin Komitmen',
      description:
        'Dua kepribadian, dua keluarga, bersatu dalam saling pengertian. Kami belajar bertumbuh bersama, saling melengkapi suka dan duka.',
      icon: Heart,
    },
    {
      year: '2025',
      title: 'Untaian Janji / The Proposal',
      description:
        'Di bawah taburan bintang di tepi pantai Bali, cincin tanda kesetiaan disematkan. Dengan mata berbinar bahagia, sebuah kata "Yes" mengunci takdir kami.',
      icon: Sparkles,
    },
    {
      year: '2026',
      title: 'Menuju Hari Abadi',
      description:
        'Kini langkah kami bermuara pada janji suci pernikahan. Dengan ridho keluarga dan doa sahabat, kami memulai babak terindah dalam hidup.',
      icon: Heart,
    },
  ];

  return (
    <section id="story" className="relative py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto text-center"
      >
        <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.25em] text-amber-300 font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Kisah Cinta Kami</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </div>

        <h2 className="font-serif-cormorant text-4xl sm:text-6xl font-light gold-text-gradient mb-4">
          Perjalanan Cinta
        </h2>

        <p className="text-sm text-zinc-400 max-w-lg mx-auto mb-16 font-light">
          Setiap detik waktu yang kami lewati menjadi untaian doa yang menuntun kami ke pelaminan suci.
        </p>

        {/* Timeline */}
        <div className="relative border-l-2 border-amber-500/30 ml-4 sm:ml-32 text-left space-y-12">
          {milestones.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.6 }}
                className="relative pl-8 sm:pl-10 group"
              >
                {/* Timeline Bullet Node */}
                <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-[#0b0c10] border-2 border-amber-400 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)] group-hover:scale-110 group-hover:bg-amber-400/20 transition-all">
                  <Icon className="w-3.5 h-3.5 text-amber-300" />
                </div>

                {/* Year tag for larger screens */}
                <div className="sm:absolute sm:-left-36 sm:top-1 sm:text-right w-24">
                  <span className="font-serif-cormorant text-2xl font-bold gold-text-gradient tracking-wide">
                    {item.year}
                  </span>
                </div>

                {/* Card Content */}
                <div className="glass-gold rounded-2xl p-6 border border-amber-500/20 group-hover:border-amber-400/50 transition-all shadow-md">
                  <h3 className="font-serif-cormorant text-xl font-semibold text-amber-100 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
};
