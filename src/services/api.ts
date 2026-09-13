import { WeddingConfig, RsvpItem, RsvpStats, WishItem, GalleryPhoto, AdminStats, AdminUser } from '../types';

const ADMIN_TOKEN_KEY = 'royal_wedding_admin_jwt';

export function getAdminToken(): string | null {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string) {
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function removeAdminToken() {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}

function getAuthHeaders(): HeadersInit {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Config
export async function fetchWeddingConfig(): Promise<WeddingConfig> {
  const res = await fetch('/api/config');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Gagal memuat konfigurasi');
  return json.data;
}

export async function updateWeddingConfig(data: Partial<WeddingConfig>): Promise<WeddingConfig> {
  const res = await fetch('/api/config', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Gagal memperbarui konfigurasi');
  return json.data;
}

// RSVP
export async function fetchRsvps(): Promise<{ data: RsvpItem[]; stats: RsvpStats }> {
  const res = await fetch('/api/rsvp');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Gagal memuat RSVP');
  return { data: json.data, stats: json.stats };
}

export async function submitRsvp(payload: {
  name: string;
  guests_count: number;
  attendance: string;
  message?: string;
}): Promise<any> {
  const res = await fetch('/api/rsvp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Gagal menyimpan RSVP');
  return json;
}

// Wishes
export async function fetchWishes(): Promise<WishItem[]> {
  const res = await fetch('/api/wishes');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Gagal memuat ucapan');
  return json.data;
}

export async function submitWish(payload: {
  name: string;
  relation: string;
  message: string;
  attendance: string;
}): Promise<WishItem> {
  const res = await fetch('/api/wishes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Gagal mengirim ucapan');
  return json.data;
}

export async function likeWish(id: string): Promise<{ id: string; likes: number }> {
  const res = await fetch(`/api/wishes/${id}/like`, { method: 'POST' });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Gagal menyukai ucapan');
  return json.data;
}

// Gallery
export async function fetchGallery(): Promise<GalleryPhoto[]> {
  const res = await fetch('/api/gallery');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Gagal memuat galeri');
  return json.data;
}

// Gallery Upload (Admin Only)
export async function uploadGalleryPhoto(file: File, caption: string, category: string): Promise<GalleryPhoto> {
  const formData = new FormData();
  formData.append('photo', file);
  formData.append('caption', caption);
  formData.append('category', category);

  const res = await fetch('/api/gallery/upload', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Gagal mengunggah foto');
  return json.data;
}

export async function deleteGalleryPhoto(id: string): Promise<void> {
  const res = await fetch(`/api/gallery/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Gagal menghapus foto');
}

// Admin Auth
export async function adminLogin(username: string, password: string): Promise<{ token: string; admin: AdminUser }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Login gagal');
  setAdminToken(json.token);
  return json;
}

export async function adminVerifyToken(): Promise<AdminUser> {
  const res = await fetch('/api/auth/verify', {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!json.success) throw new Error('Token tidak valid');
  return json.admin;
}

// Admin Operations
export async function fetchAdminStats(): Promise<AdminStats> {
  const res = await fetch('/api/admin/stats', {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Gagal memuat statistik');
  return json.stats;
}

export async function deleteAdminWish(id: string): Promise<void> {
  const res = await fetch(`/api/admin/wishes/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Gagal menghapus ucapan');
}

export async function deleteAdminRsvp(id: string): Promise<void> {
  const res = await fetch(`/api/admin/rsvp/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Gagal menghapus RSVP');
}

// Realtime SSE Listener
export interface RealtimeCallbacks {
  onWishAdded?: (wish: WishItem) => void;
  onWishLiked?: (data: { id: string; likes: number }) => void;
  onRsvpUpdated?: (stats: RsvpStats) => void;
  onGalleryUpdated?: (photos: GalleryPhoto[]) => void;
  onConfigUpdated?: (config: WeddingConfig) => void;
  onWishesRefreshed?: (wishes: WishItem[]) => void;
}

export function initRealtime(callbacks: RealtimeCallbacks): () => void {
  if (typeof window === 'undefined' || !('EventSource' in window)) {
    return () => {};
  }

  const es = new EventSource('/api/stream');

  es.addEventListener('wish_added', (e) => {
    try {
      callbacks.onWishAdded?.(JSON.parse(e.data));
    } catch (err) {
      console.error(err);
    }
  });

  es.addEventListener('wish_liked', (e) => {
    try {
      callbacks.onWishLiked?.(JSON.parse(e.data));
    } catch (err) {
      console.error(err);
    }
  });

  es.addEventListener('rsvp_updated', (e) => {
    try {
      callbacks.onRsvpUpdated?.(JSON.parse(e.data));
    } catch (err) {
      console.error(err);
    }
  });

  es.addEventListener('gallery_updated', (e) => {
    try {
      callbacks.onGalleryUpdated?.(JSON.parse(e.data));
    } catch (err) {
      console.error(err);
    }
  });

  es.addEventListener('config_updated', (e) => {
    try {
      callbacks.onConfigUpdated?.(JSON.parse(e.data));
    } catch (err) {
      console.error(err);
    }
  });

  es.addEventListener('wishes_refreshed', (e) => {
    try {
      callbacks.onWishesRefreshed?.(JSON.parse(e.data));
    } catch (err) {
      console.error(err);
    }
  });

  return () => {
    es.close();
  };
}
