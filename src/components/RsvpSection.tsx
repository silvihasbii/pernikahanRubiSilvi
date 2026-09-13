import React, { useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, HelpCircle, Send, Users, Check, Heart } from 'lucide-react';
import { Rsvp3DCanvas } from './3d/Rsvp3DCanvas';
import { submitRsvp } from '../services/api';
import { RsvpStats } from '../types';

interface RsvpSectionProps {
  guestName: string;
  stats: RsvpStats;
  onRsvpSuccess?: () => void;
}

export const RsvpSection: React.FC<RsvpSectionProps> = ({ guestName, stats, onRsvpSuccess }) => {
  const [name, setName] = useState(guestName || '');
  const [guestsCount, setGuestsCount] = useState(1);
  const [attendance, setAttendance] = useState<'attending' | 'not_attending' | 'tentative'>('attending');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama lengkap wajib diisi');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      await submitRsvp({
        name: name.trim(),
        guests_count: attendance === 'attending' ? guestsCount : 1,
        attendance,
        message: message.trim(),
      });

      setSubmitted(true);
      onRsvpSuccess?.();

      // Confetti burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#f7e09e', '#ffffff', '#e0a96d'],
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengirim konfirmasi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="rsvp" className="relative py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl mx-auto text-center"
      >
        <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.25em] text-amber-300 font-medium mb-3">
          <Heart className="w-3.5 h-3.5 text-amber-400" />
          <span>Konfirmasi Kehadiran</span>
          <Heart className="w-3.5 h-3.5 text-amber-400" />
        </div>

        <h2 className="font-serif-cormorant text-4xl sm:text-6xl font-light gold-text-gradient mb-4">
          Reservasi & RSVP
        </h2>

        <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6 font-light">
          Bantu kami mempersiapkan jamuan terbaik dengan mengonfirmasi kehadiran Anda sebelum hari bahagia.
        </p>

        {/* Real-time RSVP Stats Badge */}
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass-gold border border-amber-500/30 text-xs text-amber-200 mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-medium">
            <strong className="text-amber-300">{stats.totalAttending}</strong> Tamu Terkonfirmasi Hadir
          </span>
          <span className="text-zinc-500">•</span>
          <span className="text-zinc-400">{stats.totalResponses} Total Respon</span>
        </div>

        {/* 3D WebGL Interactive Envelope & Lantern Canvas */}
        <div className="w-full max-w-xs mx-auto mb-6">
          <Rsvp3DCanvas />
        </div>

        {/* Form Container */}
        <div className="glass-gold rounded-3xl p-6 sm:p-10 border border-amber-500/30 shadow-2xl relative text-left">
          {submitted ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-10 text-center flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="font-serif-cormorant text-3xl font-semibold text-amber-100 mb-2">
                Terima Kasih!
              </h3>
              <p className="text-sm text-zinc-300 max-w-sm font-light mb-6">
                Konfirmasi kehadiran dan untaian doa Anda telah tersimpan dan tersinkronisasi secara real-time.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs text-amber-300 underline underline-offset-4 hover:text-amber-200 cursor-pointer"
              >
                Kirim tanggapan lain
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-900/30 border border-red-500/40 text-red-200 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Name Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-amber-200/80 mb-2">
                  Nama Lengkap
                </label>
                <input
                  id="rsvp-input-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Bpk. Hendra & Keluarga"
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-amber-500/30 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                  required
                />
              </div>

              {/* Attendance Toggle */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-amber-200/80 mb-2">
                  Konfirmasi Kehadiran
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setAttendance('attending')}
                    className={`py-3 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      attendance === 'attending'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : 'bg-black/40 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Hadir</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAttendance('not_attending')}
                    className={`py-3 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      attendance === 'not_attending'
                        ? 'bg-red-500/20 border-red-400 text-red-200 font-semibold shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                        : 'bg-black/40 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span>Tidak Hadir</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAttendance('tentative')}
                    className={`py-3 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      attendance === 'tentative'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-semibold shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                        : 'bg-black/40 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <span>Belum Pasti</span>
                  </button>
                </div>
              </div>

              {/* Guest Count (only if attending) */}
              {attendance === 'attending' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-xs font-semibold uppercase tracking-wider text-amber-200/80 mb-2">
                    Jumlah Tamu
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-amber-500/30 rounded-xl overflow-hidden bg-black/50">
                      <button
                        type="button"
                        onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                        className="w-10 h-10 flex items-center justify-center text-amber-200 hover:bg-amber-500/20 text-base font-bold transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-12 text-center text-sm font-semibold text-white">
                        {guestsCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setGuestsCount(Math.min(8, guestsCount + 1))}
                        className="w-10 h-10 flex items-center justify-center text-amber-200 hover:bg-amber-500/20 text-base font-bold transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-amber-400" />
                      <span>{guestsCount} Orang Tamu</span>
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Message / Wish Field */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-amber-200/80 mb-2">
                  Pesan & Doa Restu (Otomatis Tampil di Live Chat)
                </label>
                <textarea
                  id="rsvp-input-message"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tuliskan ucapan selamat atau doa restu untuk kedua mempelai..."
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-amber-500/30 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                id="btn-submit-rsvp"
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-black font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kirim Konfirmasi Kehadiran</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </section>
  );
};
