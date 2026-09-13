import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Heart, Send, CheckCircle2, Sparkles, Filter } from 'lucide-react';
import { WishItem } from '../types';
import { submitWish, likeWish } from '../services/api';

interface WishesSectionProps {
  wishes: WishItem[];
  guestName: string;
  onWishAdded?: (wish: WishItem) => void;
  onWishLiked?: (id: string, likes: number) => void;
}

export const WishesSection: React.FC<WishesSectionProps> = ({
  wishes,
  guestName,
  onWishAdded,
  onWishLiked,
}) => {
  const [name, setName] = useState(guestName || '');
  const [relation, setRelation] = useState('Sahabat');
  const [attendance, setAttendance] = useState('Hadir');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeFilter, setActiveFilter] = useState('Semua');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setErrorMsg('Nama dan pesan ucapan wajib diisi.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const newWish = await submitWish({
        name: name.trim(),
        relation,
        attendance,
        message: message.trim(),
      });

      setMessage('');
      onWishAdded?.(newWish);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengirim ucapan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (id: string) => {
    try {
      const res = await likeWish(id);
      onWishLiked?.(id, res.likes);
    } catch (err) {
      console.error(err);
    }
  };

  const relations = ['Sahabat', 'Keluarga', 'Rekan Kerja', 'Tamu Undangan'];

  const filteredWishes = wishes.filter((w) => {
    if (activeFilter === 'Semua') return true;
    return w.relation === activeFilter;
  });

  return (
    <section id="wishes" className="relative py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto text-center"
      >
        <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.25em] text-amber-300 font-medium mb-3">
          <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
          <span>Buku Tamu & Doa Restu</span>
          <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
        </div>

        <h2 className="font-serif-cormorant text-4xl sm:text-6xl font-light gold-text-gradient mb-4">
          Untaian Doa & Harapan
        </h2>

        <p className="text-sm text-zinc-400 max-w-lg mx-auto mb-6 font-light">
          Setiap doa dan harapan baik Anda adalah anugerah terindah yang mengiringi langkah baru kami.
        </p>

        {/* Live sync pulse badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 mb-10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Live Synchronized: Pesan langsung muncul di semua perangkat</span>
        </div>

        {/* Wish Submission Form Card */}
        <div className="glass-gold rounded-3xl p-6 sm:p-8 border border-amber-500/30 text-left mb-12 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-900/30 border border-red-500/40 text-red-200 text-xs">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Name */}
              <div className="sm:col-span-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-200/80 mb-1.5">
                  Nama Pengirim
                </label>
                <input
                  id="wish-input-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Anda"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-amber-500/30 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  required
                />
              </div>

              {/* Relation */}
              <div className="sm:col-span-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-200/80 mb-1.5">
                  Hubungan
                </label>
                <select
                  id="wish-select-relation"
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-amber-500/30 text-white text-sm focus:outline-none focus:border-amber-400"
                >
                  {relations.map((r) => (
                    <option key={r} value={r} className="bg-zinc-900 text-white">
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Attendance */}
              <div className="sm:col-span-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-200/80 mb-1.5">
                  Status
                </label>
                <select
                  id="wish-select-attendance"
                  value={attendance}
                  onChange={(e) => setAttendance(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-amber-500/30 text-white text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="Hadir" className="bg-zinc-900 text-white">Hadir</option>
                  <option value="Tidak Hadir" className="bg-zinc-900 text-white">Tidak Hadir</option>
                  <option value="Belum Pasti" className="bg-zinc-900 text-white">Belum Pasti</option>
                </select>
              </div>
            </div>

            {/* Message Area */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-200/80 mb-1.5">
                Pesan Ucapan & Doa Restu
              </label>
              <textarea
                id="wish-input-message"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tuliskan ucapan dan doa terbaik untuk kedua mempelai..."
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-amber-500/30 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 resize-none"
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                id="btn-send-wish"
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Ucapan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>Filter Kategori:</span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {['Semua', ...relations].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${
                  activeFilter === filter
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Wishes Live Stream List */}
        <div className="space-y-4 text-left max-h-[560px] overflow-y-auto pr-2">
          <AnimatePresence initial={false}>
            {filteredWishes.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35 }}
                className="glass-gold rounded-2xl p-5 border border-amber-500/20 hover:border-amber-500/40 transition-all shadow-md"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-amber-100 font-serif-cormorant">
                      {item.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-medium">
                      {item.relation}
                    </span>
                    {item.attendance && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          item.attendance === 'Hadir'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-zinc-700/40 text-zinc-400 border border-zinc-600/30'
                        }`}
                      >
                        {item.attendance}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                    {new Date(item.created_at).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed mb-3 whitespace-pre-line">
                  {item.message}
                </p>

                {/* Like Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => handleLike(item.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs text-zinc-400 hover:text-amber-300 hover:bg-amber-400/10 transition-colors border border-transparent hover:border-amber-500/30 cursor-pointer"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        item.likes > 0 ? 'fill-red-500 text-red-500' : 'text-zinc-500'
                      }`}
                    />
                    <span className="text-[11px] font-medium">{item.likes || 0}</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredWishes.length === 0 && (
            <div className="py-12 text-center text-zinc-500 text-xs">
              Belum ada ucapan dalam kategori ini. Jadilah yang pertama mengirim doa restu!
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
};
