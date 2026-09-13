import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Gift, Copy, Check, CreditCard, Heart } from 'lucide-react';
import { BankAccount } from '../types';

interface GiftSectionProps {
  bankAccounts: BankAccount[];
}

export const GiftSection: React.FC<GiftSectionProps> = ({ bankAccounts }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const defaultAccounts: BankAccount[] = bankAccounts?.length
    ? bankAccounts
    : [
        { bank: 'BCA', accountNumber: '8830-192-881', accountName: 'Dimas Pratama' },
        { bank: 'Mandiri', accountNumber: '137-00-198231-9', accountName: 'Althea Maharani' },
      ];

  return (
    <section id="gift" className="relative py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl mx-auto text-center"
      >
        <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.25em] text-amber-300 font-medium mb-3">
          <Gift className="w-3.5 h-3.5 text-amber-400" />
          <span>Tanda Kasih</span>
          <Gift className="w-3.5 h-3.5 text-amber-400" />
        </div>

        <h2 className="font-serif-cormorant text-4xl sm:text-6xl font-light gold-text-gradient mb-4">
          Amplop Digital & Kado
        </h2>

        <p className="text-sm text-zinc-400 max-w-md mx-auto mb-10 font-light leading-relaxed">
          Doa restu Anda merupakan karunia terindah bagi kami. Namun jika ingin memberikan tanda kasih secara digital, Anda dapat melalui rekening berikut:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {defaultAccounts.map((acc, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0.95, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.5 }}
              className="glass-gold rounded-3xl p-6 sm:p-7 border border-amber-500/25 relative text-left group hover:border-amber-400/50 transition-all shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold tracking-wider uppercase border border-amber-500/30">
                  {acc.bank}
                </span>
                <CreditCard className="w-5 h-5 text-amber-400/70" />
              </div>

              <p className="text-[11px] text-zinc-400 uppercase tracking-wider mb-1">
                Nomor Rekening
              </p>
              <p className="font-mono text-xl sm:text-2xl font-bold text-amber-100 tracking-wider mb-2">
                {acc.accountNumber}
              </p>
              <p className="text-xs text-zinc-300 mb-6 font-medium">
                a.n. {acc.accountName}
              </p>

              <button
                id={`btn-copy-account-${idx}`}
                onClick={() => copyToClipboard(acc.accountNumber.replace(/[^0-9]/g, ''), idx)}
                className="w-full py-2.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copiedIndex === idx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Nomor Berhasil Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Nomor Rekening</span>
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};
