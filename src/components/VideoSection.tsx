import React from 'react';
import { motion } from 'motion/react';
import { Film, Play, Sparkles } from 'lucide-react';
import { WeddingConfig } from '../types';

interface VideoSectionProps {
  config: WeddingConfig | null;
}

export const VideoSection: React.FC<VideoSectionProps> = ({ config }) => {
  const videoUrl = (config?.video_url || '').trim();

  // If no video is configured in backend, do not render section
  if (!videoUrl) return null;

  const title = config?.video_title || 'Video Pre-Wedding Kami';
  const description =
    config?.video_description ||
    'Cuplikan momen terindah dan ungkapan kebahagiaan kami dalam menyongsong ikatan suci pernikahan.';

  // Parse YouTube or Vimeo embed URL
  const getEmbedUrl = (rawUrl: string): { type: 'iframe' | 'video'; url: string } => {
    // YouTube
    const ytMatch = rawUrl.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    if (ytMatch && ytMatch[1]) {
      return {
        type: 'iframe',
        url: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=0&rel=0&modestbranding=1`,
      };
    }

    // Vimeo
    const vimeoMatch = rawUrl.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/);
    if (vimeoMatch && vimeoMatch[3]) {
      return {
        type: 'iframe',
        url: `https://player.vimeo.com/video/${vimeoMatch[3]}`,
      };
    }

    // Direct Video (MP4 / WebM / blob)
    return {
      type: 'video',
      url: rawUrl,
    };
  };

  const parsedVideo = getEmbedUrl(videoUrl);

  return (
    <section id="video" className="relative py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto text-center"
      >
        <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.25em] text-amber-300 font-medium mb-3">
          <Film className="w-3.5 h-3.5 text-amber-400" />
          <span>Momen Sinematik Kami</span>
          <Film className="w-3.5 h-3.5 text-amber-400" />
        </div>

        <h2 className="font-serif-cormorant text-4xl sm:text-6xl font-light gold-text-gradient mb-4">
          {title}
        </h2>

        {description && (
          <p className="text-sm text-zinc-400 max-w-lg mx-auto mb-10 font-light">
            {description}
          </p>
        )}

        {/* Video Player Card */}
        <div className="relative glass-gold rounded-3xl p-3 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-amber-500/30 overflow-hidden">
          {/* Decorative Corner Accents */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-400/60 pointer-events-none" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-400/60 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-400/60 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-400/60 pointer-events-none" />

          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/90 shadow-inner flex items-center justify-center">
            {parsedVideo.type === 'iframe' ? (
              <iframe
                src={parsedVideo.url}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <video
                src={parsedVideo.url}
                controls
                playsInline
                preload="metadata"
                className="w-full h-full object-contain"
              >
                Browser Anda tidak mendukung pemutar video HTML5.
              </video>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
};
