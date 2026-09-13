import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Gallery3DCanvas } from './3d/Gallery3DCanvas';
import { GalleryPhoto } from '../types';

interface GallerySectionProps {
  photos: GalleryPhoto[];
}

export const GallerySection: React.FC<GallerySectionProps> = ({ photos }) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const photoUrls = photos.map((p) => p.url);

  const filteredPhotos = photos.filter((p) => {
    if (activeFilter === 'all') return true;
    return p.category === activeFilter;
  });

  const openLightbox = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const closeLightbox = () => {
    setSelectedPhotoIndex(null);
  };

  const nextPhoto = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((selectedPhotoIndex + 1) % filteredPhotos.length);
  };

  const prevPhoto = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex(
      (selectedPhotoIndex - 1 + filteredPhotos.length) % filteredPhotos.length
    );
  };

  return (
    <section id="gallery" className="relative py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto text-center"
      >
        <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.25em] text-amber-300 font-medium mb-3">
          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
          <span>Momen Bahagia Kami</span>
          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
        </div>

        <h2 className="font-serif-cormorant text-4xl sm:text-6xl font-light gold-text-gradient mb-4">
          Galeri Kenangan
        </h2>

        <p className="text-sm text-zinc-400 max-w-lg mx-auto mb-6 font-light">
          Setiap potret mengabadikan sejuta cerita cinta dan langkah perjalanan kami menuju keabadian.
        </p>

        {/* 3D WebGL Interactive Photo Carousel Canvas */}
        <div className="w-full max-w-lg mx-auto mb-10">
          <Gallery3DCanvas photoUrls={photoUrls} onSelectPhoto={openLightbox} />
        </div>

        {/* Filter Badges */}
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {[
            { id: 'all', label: 'Semua Momen' },
            { id: 'prewedding', label: 'Prewedding' },
            { id: 'ceremony', label: 'Prosesi' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-amber-400 text-black font-semibold shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                  : 'glass-gold text-zinc-400 hover:text-amber-200 border-amber-500/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Responsive Grid Gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: (index % 3) * 0.1, duration: 0.5 }}
              onClick={() => openLightbox(index)}
              className="group relative h-72 sm:h-80 rounded-2xl overflow-hidden glass-gold border border-amber-500/20 cursor-pointer shadow-lg hover:border-amber-400/60 transition-all duration-300"
            >
              <img
                src={photo.url}
                alt={photo.caption || 'Foto Pernikahan'}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
                loading="lazy"
              />

              {/* Hover overlay with zoom icon and caption */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-left">
                <div className="mb-auto self-end p-2 rounded-full bg-black/60 text-amber-300 backdrop-blur-sm border border-amber-500/30">
                  <ZoomIn className="w-4 h-4" />
                </div>
                {photo.caption && (
                  <p className="font-serif-cormorant text-lg text-amber-100 font-medium leading-snug mb-1">
                    {photo.caption}
                  </p>
                )}
                <span className="text-[10px] text-amber-300/80 uppercase tracking-widest font-semibold">
                  {photo.category}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredPhotos.length === 0 && (
          <p className="text-zinc-500 text-sm py-12">Belum ada foto dalam kategori ini.</p>
        )}
      </motion.div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && filteredPhotos[selectedPhotoIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                prevPhoto();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-amber-300 hover:bg-amber-400 hover:text-black border border-amber-500/30 transition-all z-50 cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextPhoto();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-amber-300 hover:bg-amber-400 hover:text-black border border-amber-500/30 transition-all z-50 cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div
              className="relative max-w-4xl max-h-[85vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={filteredPhotos[selectedPhotoIndex].url}
                alt={filteredPhotos[selectedPhotoIndex].caption || 'Foto'}
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl border border-amber-500/30"
                referrerPolicy="no-referrer"
              />
              {filteredPhotos[selectedPhotoIndex].caption && (
                <p className="mt-4 font-serif-cormorant text-xl text-amber-100 text-center font-medium">
                  {filteredPhotos[selectedPhotoIndex].caption}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
