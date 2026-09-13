import React, { useState, useEffect } from 'react';
import { CoverOpening } from './components/CoverOpening';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CountdownSection } from './components/CountdownSection';
import { CoupleSection } from './components/CoupleSection';
import { StorySection } from './components/StorySection';
import { EventSection } from './components/EventSection';
import { GallerySection } from './components/GallerySection';
import { RsvpSection } from './components/RsvpSection';
import { WishesSection } from './components/WishesSection';
import { GiftSection } from './components/GiftSection';
import { Footer } from './components/Footer';
import { ScrollToTop3D } from './components/3d/ScrollToTop3D';
import { AdminPortal } from './components/admin/AdminPortal';
import {
  fetchWeddingConfig,
  fetchGallery,
  fetchWishes,
  fetchRsvps,
  initRealtime,
} from './services/api';
import { WeddingConfig, GalleryPhoto, WishItem, RsvpStats } from './types';
import { weddingAudio } from './utils/audioPlayer';

export default function App() {
  // Check if current route is admin portal (/admin or #admin)
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      return path.includes('/admin') || hash.includes('#admin');
    }
    return false;
  });

  // Invitation state
  const [isOpened, setIsOpened] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [activeSection, setActiveSection] = useState('hero');

  // Backend Data
  const [config, setConfig] = useState<WeddingConfig | null>(null);
  const [gallery, setGallery] = useState<GalleryPhoto[]>([]);
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [rsvpStats, setRsvpStats] = useState<RsvpStats>({
    totalAttending: 0,
    totalGuestsAttending: 0,
    totalResponses: 0,
  });

  // Parse guest name from URL parameter (?to=..., ?guest=..., ?u=...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const toParam = params.get('to') || params.get('guest') || params.get('u');
      if (toParam) {
        setGuestName(decodeURIComponent(toParam));
      }

      // Listen to popstate / hashchange for admin route toggle
      const handleLocationChange = () => {
        const path = window.location.pathname.toLowerCase();
        const hash = window.location.hash.toLowerCase();
        setIsAdminRoute(path.includes('/admin') || hash.includes('#admin'));
      };

      window.addEventListener('popstate', handleLocationChange);
      window.addEventListener('hashchange', handleLocationChange);
      return () => {
        window.removeEventListener('popstate', handleLocationChange);
        window.removeEventListener('hashchange', handleLocationChange);
      };
    }
  }, []);

  // Fetch initial data from backend
  useEffect(() => {
    fetchWeddingConfig()
      .then((cfg) => {
        setConfig(cfg);
        if (cfg.audio_url) {
          weddingAudio.setAudioUrl(cfg.audio_url);
        }
      })
      .catch((err) => console.error('Error fetching config:', err));

    fetchGallery()
      .then((photos) => setGallery(photos))
      .catch((err) => console.error('Error fetching gallery:', err));

    fetchWishes()
      .then((w) => setWishes(w))
      .catch((err) => console.error('Error fetching wishes:', err));

    fetchRsvps()
      .then((res) => setRsvpStats(res.stats))
      .catch((err) => console.error('Error fetching RSVPs:', err));
  }, []);

  // Connect Server-Sent Events (SSE) for Real-Time Cross-Device Sync
  useEffect(() => {
    const unsub = initRealtime({
      onWishAdded: (newWish) => {
        setWishes((prev) => {
          if (prev.some((item) => item.id === newWish.id)) return prev;
          return [newWish, ...prev];
        });
      },
      onWishLiked: (data) => {
        setWishes((prev) =>
          prev.map((item) =>
            item.id === data.id ? { ...item, likes: data.likes } : item
          )
        );
      },
      onRsvpUpdated: (stats) => {
        setRsvpStats(stats);
      },
      onGalleryUpdated: (photos) => {
        setGallery(photos);
      },
      onConfigUpdated: (newConfig) => {
        setConfig(newConfig);
      },
      onWishesRefreshed: (allWishes) => {
        setWishes(allWishes);
      },
    });

    return () => unsub();
  }, []);

  // Active section observer for sticky navbar highlighting
  useEffect(() => {
    if (!isOpened) return;

    const sections = ['hero', 'couple', 'event', 'gallery', 'rsvp'];
    const handleScroll = () => {
      const scrollPos = window.scrollY + 250;
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpened]);

  // Handle invitation opening
  const handleOpenInvitation = () => {
    setIsOpened(true);
    weddingAudio.play().catch(() => {});
    // Scroll to hero section smoothly
    setTimeout(() => {
      const hero = document.getElementById('hero');
      if (hero) {
        hero.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  // Exit Admin back to invitation
  const handleExitAdmin = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
      setIsAdminRoute(false);
    }
  };

  // RENDER ISOLATED ADMIN PORTAL IF ROUTE IS /admin
  if (isAdminRoute) {
    return (
      <AdminPortal
        config={config}
        onConfigChange={(newCfg) => setConfig(newCfg)}
        onExitAdmin={handleExitAdmin}
      />
    );
  }

  // RENDER PUBLIC WEDDING INVITATION
  return (
    <div className="relative min-h-screen bg-[#07080b] text-zinc-100 selection:bg-amber-400 selection:text-black font-sans">
      {/* Cover Gate Opening Modal */}
      <CoverOpening
        isOpen={isOpened}
        onOpen={handleOpenInvitation}
        guestName={guestName}
        config={config}
      />

      {/* Main Wedding Content (revealed once opened) */}
      {isOpened && (
        <>
          {/* Sticky Non-Disappearing Navbar */}
          <Navbar activeSection={activeSection} />

          {/* 3D Wedding Hero Section */}
          <HeroSection config={config} guestName={guestName} />

          {/* 3D Countdown & Holy Quote Section */}
          <CountdownSection config={config} />

          {/* 3D Knot & Happy Couple Section */}
          <CoupleSection config={config} />

          {/* Love Story Timeline Section */}
          <StorySection />

          {/* 3D Pavilion & Event Schedule Section */}
          <EventSection config={config} />

          {/* 3D Carousel & Photo Gallery Section */}
          <GallerySection photos={gallery} />

          {/* 3D Envelope & Real-time RSVP Section */}
          <RsvpSection
            guestName={guestName}
            stats={rsvpStats}
            onRsvpSuccess={() => {
              fetchRsvps().then((res) => setRsvpStats(res.stats));
            }}
          />

          {/* Real-time Live Wishes & Guestbook Section */}
          <WishesSection
            wishes={wishes}
            guestName={guestName}
            onWishAdded={(newWish) => {
              setWishes((prev) => [newWish, ...prev]);
            }}
            onWishLiked={(id, likes) => {
              setWishes((prev) =>
                prev.map((w) => (w.id === id ? { ...w, likes } : w))
              );
            }}
          />

          {/* Digital Gift & Amplop Digital Section */}
          <GiftSection bankAccounts={config?.bank_accounts || []} />

          {/* Closing Footer */}
          <Footer config={config} />

          {/* 3D Floating Gem Scroll-To-Top Button */}
          <ScrollToTop3D />
        </>
      )}
    </div>
  );
}
