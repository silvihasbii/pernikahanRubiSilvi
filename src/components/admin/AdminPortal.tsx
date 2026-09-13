import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  LogOut,
  Upload,
  Trash2,
  Download,
  Users,
  MessageSquare,
  Image as ImageIcon,
  Settings,
  Link,
  Copy,
  Check,
  Share2,
  RefreshCw,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Plus,
  Calendar,
  MapPin,
  CreditCard,
  Package,
  Heart,
  Sparkles,
} from 'lucide-react';
import {
  adminLogin,
  adminVerifyToken,
  removeAdminToken,
  changeAdminPassword,
  fetchAdminStats,
  fetchRsvps,
  fetchWishes,
  fetchGallery,
  uploadGalleryPhoto,
  deleteGalleryPhoto,
  deleteAdminWish,
  deleteAdminRsvp,
  updateWeddingConfig,
} from '../../services/api';
import { AdminStats, AdminUser, GalleryPhoto, RsvpItem, WeddingConfig, WishItem, BankAccount, LoveStoryMilestone } from '../../types';

interface AdminPortalProps {
  config: WeddingConfig | null;
  onConfigChange: (newConfig: WeddingConfig) => void;
  onExitAdmin: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  config,
  onConfigChange,
  onExitAdmin,
}) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Login form state
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard state
  const [activeTab, setActiveTab] = useState<'overview' | 'photos' | 'rsvps' | 'wishes' | 'config' | 'invite' | 'security'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [rsvps, setRsvps] = useState<RsvpItem[]>([]);
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [gallery, setGallery] = useState<GalleryPhoto[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Photo upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('prewedding');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');

  // Config form state
  const [configForm, setConfigForm] = useState<Partial<WeddingConfig>>({});
  const [configSaving, setConfigSaving] = useState(false);
  const [configSuccess, setConfigSuccess] = useState('');

  // Security change password state
  const [newUsernameInput, setNewUsernameInput] = useState('');
  const [oldPasswordInput, setOldPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Invite link generator state
  const [guestNameInput, setGuestNameInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Check existing token
  useEffect(() => {
    adminVerifyToken()
      .then((user) => {
        setAdminUser(user);
        loadAdminData();
      })
      .catch(() => {
        setAdminUser(null);
      })
      .finally(() => {
        setCheckingAuth(false);
      });
  }, []);

  useEffect(() => {
    if (config) {
      setConfigForm(config);
    }
  }, [config]);

  const loadAdminData = async () => {
    setLoadingData(true);
    try {
      const [s, r, w, g] = await Promise.all([
        fetchAdminStats(),
        fetchRsvps(),
        fetchWishes(),
        fetchGallery(),
      ]);
      setStats(s);
      setRsvps(r.data);
      setWishes(w);
      setGallery(g);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await adminLogin(username, password);
      setAdminUser(res.admin);
      await loadAdminData();
    } catch (err: any) {
      setLoginError(err.message || 'Kredensial tidak valid');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    removeAdminToken();
    setAdminUser(null);
  };

  // Photo Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setUploadError('');
    }
  };

  // Photo Upload
  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Pilih file gambar dari galeri HP atau laptop terlebih dahulu.');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const newPhoto = await uploadGalleryPhoto(selectedFile, caption, category);
      setGallery([newPhoto, ...gallery]);
      setSelectedFile(null);
      setPhotoPreview(null);
      setCaption('');
      setUploadSuccess('Foto berhasil diunggah dan disimpan ke server!');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setUploadSuccess(''), 3500);
    } catch (err: any) {
      setUploadError(err.message || 'Gagal mengunggah foto');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (!window.confirm('Hapus foto ini dari galeri pernikahan?')) return;
    try {
      await deleteGalleryPhoto(id);
      setGallery(gallery.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus foto');
    }
  };

  const handleDeleteWish = async (id: string) => {
    if (!window.confirm('Hapus ucapan ini?')) return;
    try {
      await deleteAdminWish(id);
      setWishes(wishes.filter((w) => w.id !== id));
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus ucapan');
    }
  };

  const handleDeleteRsvp = async (id: string) => {
    if (!window.confirm('Hapus respon RSVP ini?')) return;
    try {
      await deleteAdminRsvp(id);
      setRsvps(rsvps.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus RSVP');
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSaving(true);
    setConfigSuccess('');

    try {
      const updated = await updateWeddingConfig(configForm);
      onConfigChange(updated);
      setConfigSuccess('Informasi pernikahan berhasil disimpan dan disinkronkan!');
      setTimeout(() => setConfigSuccess(''), 3500);
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui konfigurasi');
    } finally {
      setConfigSaving(false);
    }
  };

  // Change Admin Password / Username Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!oldPasswordInput) {
      setPasswordError('Silakan masukkan password lama Anda.');
      return;
    }

    if (!newPasswordInput || newPasswordInput.length < 6) {
      setPasswordError('Password baru minimal harus 6 karakter.');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordError('Konfirmasi password baru tidak cocok. Periksa kembali.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await changeAdminPassword(
        oldPasswordInput,
        newPasswordInput,
        newUsernameInput.trim() || undefined
      );
      setPasswordSuccess(res.message || 'Kredensial admin berhasil diperbarui di database!');
      setOldPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      if (res.admin) {
        setAdminUser(res.admin);
      }
      setTimeout(() => setPasswordSuccess(''), 5000);
    } catch (err: any) {
      setPasswordError(err.message || 'Gagal mengubah password');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Dynamic Bank Accounts Helpers
  const handleAddBankAccount = () => {
    const current = configForm.bank_accounts || [];
    setConfigForm({
      ...configForm,
      bank_accounts: [...current, { bank: 'BCA', accountNumber: '', accountName: '' }],
    });
  };

  const handleUpdateBankAccount = (index: number, field: keyof BankAccount, value: string) => {
    const current = [...(configForm.bank_accounts || [])];
    if (current[index]) {
      current[index] = { ...current[index], [field]: value };
      setConfigForm({ ...configForm, bank_accounts: current });
    }
  };

  const handleRemoveBankAccount = (index: number) => {
    const current = [...(configForm.bank_accounts || [])];
    current.splice(index, 1);
    setConfigForm({ ...configForm, bank_accounts: current });
  };

  // Dynamic Love Story Milestones Helpers
  const handleAddMilestone = () => {
    const current = configForm.love_story || [];
    setConfigForm({
      ...configForm,
      love_story: [...current, { year: `${new Date().getFullYear()}`, title: '', description: '' }],
    });
  };

  const handleUpdateMilestone = (index: number, field: keyof LoveStoryMilestone, value: string) => {
    const current = [...(configForm.love_story || [])];
    if (current[index]) {
      current[index] = { ...current[index], [field]: value };
      setConfigForm({ ...configForm, love_story: current });
    }
  };

  const handleRemoveMilestone = (index: number) => {
    const current = [...(configForm.love_story || [])];
    current.splice(index, 1);
    setConfigForm({ ...configForm, love_story: current });
  };

  // Invitation Link generator
  const currentBaseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const generatedLink = guestNameInput.trim()
    ? `${currentBaseUrl}/?to=${encodeURIComponent(guestNameInput.trim())}`
    : currentBaseUrl;

  const copyGeneratedLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareViaWhatsApp = () => {
    const groom = config?.groom_name || 'Dimas';
    const bride = config?.bride_name || 'Althea';
    const guest = guestNameInput.trim() || 'Bapak/Ibu/Saudara/i';
    const text = `Kepada Yth. ${guest},\n\nTanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:\n\n*${groom} & ${bride}*\n\nInformasi lengkap dan konfirmasi kehadiran dapat diakses melalui tautan undangan digital 3D berikut:\n${generatedLink}\n\nMerupakan suatu kehormatan bagi kami apabila Anda berkenan hadir dan memberikan doa restu.\n\nTerima kasih.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleExportCsv = () => {
    if (rsvps.length === 0) {
      alert('Belum ada data konfirmasi tamu untuk diekspor.');
      return;
    }
    const headers = ['ID', 'Nama Tamu', 'Jumlah Tamu', 'Status Kehadiran', 'Pesan Doa Restu', 'Waktu Masuk'];
    const rows = rsvps.map((r) => [
      `"${r.id}"`,
      `"${(r.name || '').replace(/"/g, '""')}"`,
      r.guests_count,
      `"${r.attendance}"`,
      `"${(r.message || '').replace(/"/g, '""')}"`,
      `"${r.created_at}"`,
    ]);
    const csvString = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rekap-rsvp-tamu-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex items-center justify-center p-6 text-amber-200">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
          <span>Memeriksa Otorisasi Backend...</span>
        </div>
      </div>
    );
  }

  // If not logged in, show isolated Login Form
  if (!adminUser) {
    return (
      <div className="min-h-screen bg-[#07080b] flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-gold rounded-3xl p-8 border border-amber-500/30 shadow-2xl relative">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-300 mb-3 shadow-[0_0_20px_rgba(212,175,55,0.25)]">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="font-serif-cormorant text-2xl font-semibold text-amber-100 mb-1">
              Portal Admin Terisolasi
            </h2>
            <p className="text-xs text-zinc-400">
              Sistem backend aman & terproteksi token JWT
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-200/80 mb-1.5">
                Username Admin
              </label>
              <input
                id="admin-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-200/80 mb-1.5">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <button
              id="btn-admin-login"
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-black font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all cursor-pointer disabled:opacity-50"
            >
              {loginLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Masuk ke Panel Admin</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-amber-500/20 flex justify-between items-center text-xs">
            <button
              onClick={onExitAdmin}
              className="text-zinc-400 hover:text-amber-200 flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Kembali ke Undangan</span>
            </button>
            <span className="text-[10px] text-zinc-600 font-mono">
              Secured Backend v2.0
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Logged-in Admin Dashboard
  return (
    <div className="min-h-screen bg-[#07080b] text-zinc-200 pb-20">
      {/* Top Admin Header */}
      <header className="border-b border-amber-500/20 bg-black/70 backdrop-blur-lg sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-sm text-amber-100 flex items-center gap-2">
              <span>Admin Management</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-normal">
                Online
              </span>
            </h1>
            <p className="text-[11px] text-zinc-400">
              Masuk sebagai: <span className="text-amber-300 font-medium">{adminUser.username}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onExitAdmin}
            className="px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-xs text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lihat Undangan</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg bg-red-900/30 hover:bg-red-900/50 border border-red-500/30 text-xs text-red-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-6 border-b border-zinc-800">
          {[
            { id: 'overview', label: 'Ringkasan', icon: ShieldCheck },
            { id: 'photos', label: 'Kelola Galeri & Upload', icon: ImageIcon },
            { id: 'rsvps', label: 'Daftar Tamu RSVP', icon: Users },
            { id: 'wishes', label: 'Moderasi Doa Restu', icon: MessageSquare },
            { id: 'config', label: 'Kelola Konten & Acara', icon: Settings },
            { id: 'invite', label: 'Buat Link Tamu', icon: Link },
            { id: 'security', label: 'Ganti Password & Akun', icon: KeyRound },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-amber-200 hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="glass-gold rounded-2xl p-5 border border-amber-500/20">
                <span className="text-xs text-zinc-400 block mb-1">Tamu Hadir</span>
                <span className="text-3xl font-bold font-serif-cormorant gold-text-gradient">
                  {stats.totalGuestsAttending} Orang
                </span>
                <span className="text-[11px] text-emerald-400 block mt-1">Terkonfirmasi</span>
              </div>

              <div className="glass-gold rounded-2xl p-5 border border-amber-500/20">
                <span className="text-xs text-zinc-400 block mb-1">Total RSVP</span>
                <span className="text-3xl font-bold font-serif-cormorant text-amber-100">
                  {stats.totalRsvps} Respon
                </span>
                <span className="text-[11px] text-zinc-500 block mt-1">Masuk ke database</span>
              </div>

              <div className="glass-gold rounded-2xl p-5 border border-amber-500/20">
                <span className="text-xs text-zinc-400 block mb-1">Ucapan & Doa</span>
                <span className="text-3xl font-bold font-serif-cormorant text-amber-100">
                  {stats.totalWishes} Pesan
                </span>
                <span className="text-[11px] text-zinc-500 block mt-1">Buku tamu digital</span>
              </div>

              <div className="glass-gold rounded-2xl p-5 border border-amber-500/20">
                <span className="text-xs text-zinc-400 block mb-1">Foto Galeri</span>
                <span className="text-3xl font-bold font-serif-cormorant text-amber-100">
                  {stats.totalPhotos} Foto
                </span>
                <span className="text-[11px] text-amber-300 block mt-1">Hanya admin</span>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="glass-gold rounded-3xl p-6 border border-amber-500/20 flex flex-wrap gap-4 items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-amber-200">Eksportir & Sinkronisasi</h3>
                <p className="text-xs text-zinc-400">Unduh data daftar tamu atau muat ulang data database terbaru</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleExportCsv}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-black font-semibold text-xs flex items-center gap-2 hover:bg-amber-300 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Rekap CSV</span>
                </button>
                <button
                  onClick={loadAdminData}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-200 text-xs flex items-center gap-2 hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
                  <span>Refresh Data</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PHOTOS & UPLOAD */}
        {activeTab === 'photos' && (
          <div className="space-y-8">
            {/* Direct Multi-device Uploader Box */}
            <div className="glass-gold rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif-cormorant text-xl font-semibold text-amber-100">
                  Upload Foto Langsung (Dari Galeri HP / Laptop)
                </h3>
              </div>

              <p className="text-xs text-zinc-400 mb-6">
                Pilih foto langsung dari galeri kamera ponsel atau file laptop. Foto akan tersimpan permanen di server dan langsung disinkronkan ke galeri 3D tamu undangan.
              </p>

              {uploadSuccess && (
                <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              {uploadError && (
                <div className="mb-4 p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{uploadError}</span>
                </div>
              )}

              <form onSubmit={handleUploadPhoto} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* File selector input */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-amber-200/80 mb-2">
                      Pilih Berkas Foto
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-xs text-zinc-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-400 file:text-black hover:file:bg-amber-300 cursor-pointer"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-amber-200/80 mb-2">
                      Kategori Album
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-amber-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
                    >
                      <option value="prewedding">Prewedding</option>
                      <option value="ceremony">Prosesi / Akad</option>
                      <option value="reception">Resepsi</option>
                    </select>
                  </div>
                </div>

                {/* Caption */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-amber-200/80 mb-1.5">
                    Judul / Keterangan Foto
                  </label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Contoh: Momen Romantis di Bawah Senja"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-amber-500/30 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Preview Thumbnail if chosen */}
                {photoPreview && (
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-black/40 border border-amber-500/20">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-xl border border-amber-400/40"
                    />
                    <div>
                      <p className="text-xs text-amber-200 font-medium">Foto Terpilih</p>
                      <p className="text-[11px] text-zinc-400">{selectedFile?.name}</p>
                      <p className="text-[10px] text-zinc-500">
                        {((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={uploading || !selectedFile}
                    className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {uploading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>Unggah ke Galeri Server</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Existing Photos Grid with Delete options */}
            <div className="glass-gold rounded-3xl p-6 sm:p-8 border border-amber-500/20">
              <h3 className="font-serif-cormorant text-xl font-semibold text-amber-100 mb-6">
                Daftar Foto Galeri ({gallery.length})
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {gallery.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative group rounded-xl overflow-hidden border border-amber-500/20 bg-black/40 shadow-md"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || 'Foto'}
                      className="w-full h-40 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="p-2.5 bg-black/80">
                      <p className="text-xs text-amber-100 font-medium truncate">
                        {photo.caption || 'Tanpa keterangan'}
                      </p>
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                        {photo.category}
                      </span>
                    </div>

                    {/* Delete button overlay */}
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white transition-colors cursor-pointer shadow-md"
                      title="Hapus Foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RSVPS */}
        {activeTab === 'rsvps' && (
          <div className="glass-gold rounded-3xl p-6 sm:p-8 border border-amber-500/20 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-serif-cormorant text-2xl font-semibold text-amber-100">
                  Daftar Konfirmasi Tamu (RSVP)
                </h3>
                <p className="text-xs text-zinc-400">
                  Data konfirmasi kehadiran yang terkirim dari seluruh tamu undangan
                </p>
              </div>
              <button
                onClick={handleExportCsv}
                className="px-4 py-2 rounded-xl bg-amber-400 text-black font-semibold text-xs flex items-center gap-2 hover:bg-amber-300 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh CSV Lengkap</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-black/50 text-amber-200 uppercase tracking-wider text-[11px] border-b border-amber-500/20">
                  <tr>
                    <th className="py-3 px-4">Nama Tamu</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Jumlah</th>
                    <th className="py-3 px-4">Pesan Doa</th>
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {rsvps.map((r) => (
                    <tr key={r.id} className="hover:bg-white/5">
                      <td className="py-3 px-4 font-medium text-amber-100">{r.name}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            r.attendance === 'attending'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : r.attendance === 'not_attending'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {r.attendance === 'attending'
                            ? 'Hadir'
                            : r.attendance === 'not_attending'
                            ? 'Tidak Hadir'
                            : 'Belum Pasti'}
                        </span>
                      </td>
                      <td className="py-3 px-4">{r.guests_count} Orang</td>
                      <td className="py-3 px-4 max-w-xs truncate text-zinc-400">
                        {r.message || '-'}
                      </td>
                      <td className="py-3 px-4 text-[10px] text-zinc-500 whitespace-nowrap">
                        {new Date(r.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteRsvp(r.id)}
                          className="p-1.5 rounded-lg bg-red-900/30 hover:bg-red-900/60 text-red-300 transition-colors cursor-pointer"
                          title="Hapus RSVP"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {rsvps.length === 0 && (
                <p className="text-center text-zinc-500 py-8 text-xs">Belum ada respon RSVP.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: WISHES MODERATION */}
        {activeTab === 'wishes' && (
          <div className="glass-gold rounded-3xl p-6 sm:p-8 border border-amber-500/20 space-y-4">
            <h3 className="font-serif-cormorant text-2xl font-semibold text-amber-100 mb-2">
              Moderasi Pesan & Doa Restu ({wishes.length})
            </h3>
            <p className="text-xs text-zinc-400 mb-6">
              Hapus pesan yang tidak sesuai atau spam dari buku tamu digital publik
            </p>

            <div className="space-y-3">
              {wishes.map((w) => (
                <div
                  key={w.id}
                  className="p-4 rounded-2xl bg-black/40 border border-amber-500/15 flex items-start justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-sm text-amber-200">{w.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                        {w.relation}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(w.created_at).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300">{w.message}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteWish(w.id)}
                    className="p-2 rounded-xl bg-red-900/30 hover:bg-red-900/60 text-red-300 transition-colors cursor-pointer shrink-0"
                    title="Hapus Ucapan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: WEDDING CONFIG */}
        {activeTab === 'config' && (
          <div className="glass-gold rounded-3xl p-6 sm:p-8 border border-amber-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-serif-cormorant text-2xl font-semibold text-amber-100 mb-1">
                  Kelola Konten & Informasi Undangan (Full CMS)
                </h3>
                <p className="text-xs text-zinc-400">
                  Ubah semua teks, foto mempelai, jadwal, rekening, kado, dan kisah cinta langsung ke database SQLite backend
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={configSaving}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 shadow-md"
              >
                {configSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Simpan Perubahan</span>
              </button>
            </div>

            {configSuccess && (
              <div className="mb-6 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{configSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="space-y-6">
              {/* Cover Title & Main Wedding Date */}
              <div className="p-5 rounded-2xl bg-black/30 border border-amber-500/20 space-y-4">
                <div className="flex items-center gap-2 text-amber-300">
                  <Sparkles className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Judul Undangan & Tanggal Acara Utama
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      Judul Header / Sampul (Cover Title)
                    </label>
                    <input
                      type="text"
                      value={configForm.cover_title || ''}
                      onChange={(e) => setConfigForm({ ...configForm, cover_title: e.target.value })}
                      placeholder="Contoh: The Wedding Of / The Royal Wedding"
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      Tanggal & Jam Acara (Untuk Countdown 3D)
                    </label>
                    <input
                      type="datetime-local"
                      value={configForm.wedding_date ? configForm.wedding_date.substring(0, 16) : ''}
                      onChange={(e) => setConfigForm({ ...configForm, wedding_date: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Groom & Bride Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Groom Info */}
                <div className="space-y-4 p-5 rounded-2xl bg-black/30 border border-amber-500/20">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Informasi Mempelai Pria
                  </h4>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Nama Panggilan</label>
                    <input
                      type="text"
                      value={configForm.groom_name || ''}
                      onChange={(e) => setConfigForm({ ...configForm, groom_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Nama Lengkap & Gelar</label>
                    <input
                      type="text"
                      value={configForm.groom_full_name || ''}
                      onChange={(e) => setConfigForm({ ...configForm, groom_full_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Keterangan Orang Tua</label>
                    <input
                      type="text"
                      value={configForm.groom_parents || ''}
                      onChange={(e) => setConfigForm({ ...configForm, groom_parents: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Akun Instagram (Contoh: @dimas_aryap)</label>
                    <input
                      type="text"
                      value={configForm.groom_instagram || ''}
                      onChange={(e) => setConfigForm({ ...configForm, groom_instagram: e.target.value })}
                      placeholder="@username"
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">URL Foto Mempelai Pria</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="url"
                        value={configForm.groom_photo || ''}
                        onChange={(e) => setConfigForm({ ...configForm, groom_photo: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                      {configForm.groom_photo && (
                        <img
                          src={configForm.groom_photo}
                          alt="Preview Pria"
                          className="w-9 h-9 rounded-full object-cover border border-amber-400/50 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Bride Info */}
                <div className="space-y-4 p-5 rounded-2xl bg-black/30 border border-amber-500/20">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Informasi Mempelai Wanita
                  </h4>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Nama Panggilan</label>
                    <input
                      type="text"
                      value={configForm.bride_name || ''}
                      onChange={(e) => setConfigForm({ ...configForm, bride_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Nama Lengkap & Gelar</label>
                    <input
                      type="text"
                      value={configForm.bride_full_name || ''}
                      onChange={(e) => setConfigForm({ ...configForm, bride_full_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Keterangan Orang Tua</label>
                    <input
                      type="text"
                      value={configForm.bride_parents || ''}
                      onChange={(e) => setConfigForm({ ...configForm, bride_parents: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Akun Instagram (Contoh: @altheamhrn)</label>
                    <input
                      type="text"
                      value={configForm.bride_instagram || ''}
                      onChange={(e) => setConfigForm({ ...configForm, bride_instagram: e.target.value })}
                      placeholder="@username"
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">URL Foto Mempelai Wanita</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="url"
                        value={configForm.bride_photo || ''}
                        onChange={(e) => setConfigForm({ ...configForm, bride_photo: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                      {configForm.bride_photo && (
                        <img
                          src={configForm.bride_photo}
                          alt="Preview Wanita"
                          className="w-9 h-9 rounded-full object-cover border border-amber-400/50 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Times & Venue */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 p-5 rounded-2xl bg-black/30 border border-amber-500/20">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Akad Nikah
                  </h4>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Waktu Pelaksanaan</label>
                    <input
                      type="text"
                      value={configForm.akad_time || ''}
                      onChange={(e) => setConfigForm({ ...configForm, akad_time: e.target.value })}
                      placeholder="08:00 - 10:00 WIB"
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Lokasi Gedung / Tempat</label>
                    <input
                      type="text"
                      value={configForm.akad_location || ''}
                      onChange={(e) => setConfigForm({ ...configForm, akad_location: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Alamat Lengkap</label>
                    <input
                      type="text"
                      value={configForm.akad_address || ''}
                      onChange={(e) => setConfigForm({ ...configForm, akad_address: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Tautan Google Maps</label>
                    <input
                      type="url"
                      value={configForm.akad_map_url || ''}
                      onChange={(e) => setConfigForm({ ...configForm, akad_map_url: e.target.value })}
                      placeholder="https://maps.google.com/?q=..."
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="space-y-4 p-5 rounded-2xl bg-black/30 border border-amber-500/20">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Resepsi Pernikahan
                  </h4>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Waktu Pelaksanaan</label>
                    <input
                      type="text"
                      value={configForm.resepsi_time || ''}
                      onChange={(e) => setConfigForm({ ...configForm, resepsi_time: e.target.value })}
                      placeholder="11:00 - 15:00 WIB"
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Lokasi Gedung / Tempat</label>
                    <input
                      type="text"
                      value={configForm.resepsi_location || ''}
                      onChange={(e) => setConfigForm({ ...configForm, resepsi_location: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Alamat Lengkap</label>
                    <input
                      type="text"
                      value={configForm.resepsi_address || ''}
                      onChange={(e) => setConfigForm({ ...configForm, resepsi_address: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Tautan Google Maps</label>
                    <input
                      type="url"
                      value={configForm.resepsi_map_url || ''}
                      onChange={(e) => setConfigForm({ ...configForm, resepsi_map_url: e.target.value })}
                      placeholder="https://maps.google.com/?q=..."
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Quotes */}
              <div className="p-5 rounded-2xl bg-black/30 border border-amber-500/20 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Kutipan Doa / Ayat Suci
                </h4>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Teks Kutipan</label>
                  <textarea
                    rows={2}
                    value={configForm.quote || ''}
                    onChange={(e) => setConfigForm({ ...configForm, quote: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Sumber (Contoh: QS. Ar-Rum: 21)</label>
                  <input
                    type="text"
                    value={configForm.quote_source || ''}
                    onChange={(e) => setConfigForm({ ...configForm, quote_source: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Amplop Digital & Bank Accounts */}
              <div className="p-5 rounded-2xl bg-black/30 border border-amber-500/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-300">
                    <CreditCard className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      Amplop Digital & Rekening Transfer
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddBankAccount}
                    className="px-3 py-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Rekening</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(configForm.bank_accounts || []).map((acc, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 rounded-xl bg-black/50 border border-zinc-800 items-center"
                    >
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] text-zinc-500 mb-0.5">Nama Bank / Dompet</label>
                        <input
                          type="text"
                          value={acc.bank}
                          onChange={(e) => handleUpdateBankAccount(idx, 'bank', e.target.value)}
                          placeholder="BCA / Mandiri / Gopay"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-zinc-700 text-xs text-white"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <label className="block text-[10px] text-zinc-500 mb-0.5">Nomor Rekening</label>
                        <input
                          type="text"
                          value={acc.accountNumber}
                          onChange={(e) => handleUpdateBankAccount(idx, 'accountNumber', e.target.value)}
                          placeholder="8830-192-881"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-zinc-700 text-xs text-white font-mono"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <label className="block text-[10px] text-zinc-500 mb-0.5">Atas Nama</label>
                        <input
                          type="text"
                          value={acc.accountName}
                          onChange={(e) => handleUpdateBankAccount(idx, 'accountName', e.target.value)}
                          placeholder="Nama Pemilik"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-zinc-700 text-xs text-white"
                        />
                      </div>
                      <div className="sm:col-span-1 flex justify-end pt-3 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveBankAccount(idx)}
                          className="p-1.5 rounded-lg bg-red-900/30 hover:bg-red-900/60 text-red-300 transition-colors cursor-pointer"
                          title="Hapus Rekening"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!configForm.bank_accounts || configForm.bank_accounts.length === 0) && (
                    <p className="text-xs text-zinc-500 italic">Belum ada data rekening. Klik "+ Tambah Rekening" untuk menambahkan.</p>
                  )}
                </div>
              </div>

              {/* Physical Gift Info */}
              <div className="p-5 rounded-2xl bg-black/30 border border-amber-500/20 space-y-4">
                <div className="flex items-center gap-2 text-amber-300">
                  <Package className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Alamat Pengiriman Kado Fisik
                  </h4>
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Alamat Lengkap Pengiriman Kado</label>
                  <textarea
                    rows={2}
                    value={configForm.gift_address || ''}
                    onChange={(e) => setConfigForm({ ...configForm, gift_address: e.target.value })}
                    placeholder="Jl. Sunset Boulevard No. 88, Menteng, Jakarta Pusat 10310"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Nama Penerima Kado</label>
                    <input
                      type="text"
                      value={configForm.gift_receiver || ''}
                      onChange={(e) => setConfigForm({ ...configForm, gift_receiver: e.target.value })}
                      placeholder="Dimas & Althea"
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">No. Telp / WhatsApp Penerima</label>
                    <input
                      type="text"
                      value={configForm.gift_phone || ''}
                      onChange={(e) => setConfigForm({ ...configForm, gift_phone: e.target.value })}
                      placeholder="0812-3456-7890"
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Love Story Milestones */}
              <div className="p-5 rounded-2xl bg-black/30 border border-amber-500/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-300">
                    <Heart className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      Kisah Perjalanan Cinta (Love Story Milestones)
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMilestone}
                    className="px-3 py-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Momen Kisah</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {(configForm.love_story || []).map((ms, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-black/50 border border-zinc-800 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-amber-200">
                          Momen #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMilestone(idx)}
                          className="p-1 rounded-lg bg-red-900/30 hover:bg-red-900/60 text-red-300 transition-colors cursor-pointer"
                          title="Hapus Momen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-1">
                          <label className="block text-[10px] text-zinc-500 mb-0.5">Tahun</label>
                          <input
                            type="text"
                            value={ms.year}
                            onChange={(e) => handleUpdateMilestone(idx, 'year', e.target.value)}
                            placeholder="2021"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-zinc-700 text-xs text-white font-mono"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] text-zinc-500 mb-0.5">Judul Momen</label>
                          <input
                            type="text"
                            value={ms.title}
                            onChange={(e) => handleUpdateMilestone(idx, 'title', e.target.value)}
                            placeholder="Awal Pertemuan / The Proposal"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-zinc-700 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-zinc-500 mb-0.5">Deskripsi Kisah Cerita</label>
                        <textarea
                          rows={2}
                          value={ms.description}
                          onChange={(e) => handleUpdateMilestone(idx, 'description', e.target.value)}
                          placeholder="Ceritakan momen indah Anda berdua di sini..."
                          className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-zinc-700 text-xs text-white"
                        />
                      </div>
                    </div>
                  ))}
                  {(!configForm.love_story || configForm.love_story.length === 0) && (
                    <p className="text-xs text-zinc-500 italic">Belum ada momen kisah cinta yang dibuat. Klik "+ Tambah Momen Kisah" untuk mulai membuat.</p>
                  )}
                </div>
              </div>

              {/* Bottom Action Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={configSaving}
                  className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                >
                  {configSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Simpan Perubahan ke Database Backend</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 6: INVITATION LINK GENERATOR */}
        {activeTab === 'invite' && (
          <div className="glass-gold rounded-3xl p-6 sm:p-8 border border-amber-500/20 max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-2">
              <Link className="w-5 h-5 text-amber-400" />
              <h3 className="font-serif-cormorant text-2xl font-semibold text-amber-100">
                Pembuat Tautan Undangan Kustom Tamu
              </h3>
            </div>
            <p className="text-xs text-zinc-400">
              Ketikkan nama tamu atau keluarga untuk membuat tautan undangan personal yang ramah WhatsApp:
            </p>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-200/80 mb-2">
                Nama Tamu Undangan
              </label>
              <input
                type="text"
                value={guestNameInput}
                onChange={(e) => setGuestNameInput(e.target.value)}
                placeholder="Contoh: Bpk. Bambang & Keluarga"
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-amber-500/30 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Generated Link Box */}
            <div className="p-4 rounded-2xl bg-black/50 border border-amber-500/20">
              <span className="text-[11px] text-zinc-400 block mb-1">Tautan Personal:</span>
              <p className="font-mono text-xs text-amber-300 break-all select-all mb-4">
                {generatedLink}
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={copyGeneratedLink}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-black font-semibold text-xs flex items-center gap-2 hover:bg-amber-300 transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Berhasil Disalin!' : 'Salin Tautan'}</span>
                </button>

                <button
                  onClick={shareViaWhatsApp}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Kirim via WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: SECURITY & PASSWORD CHANGE */}
        {activeTab === 'security' && (
          <div className="glass-gold rounded-3xl p-6 sm:p-8 border border-amber-500/20 max-w-xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif-cormorant text-2xl font-semibold text-amber-100">
                  Keamanan & Ganti Password Admin
                </h3>
                <p className="text-xs text-zinc-400">
                  Perbarui username atau password login admin ke dalam database terenkripsi (Bcrypt)
                </p>
              </div>
            </div>

            {passwordSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-amber-200/80 mb-1.5">
                  Username Admin Baru (Opsional)
                </label>
                <input
                  type="text"
                  value={newUsernameInput}
                  onChange={(e) => setNewUsernameInput(e.target.value)}
                  placeholder={adminUser.username}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-amber-400"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Biarkan kosong jika tidak ingin mengubah username (username saat ini: <strong>{adminUser.username}</strong>)
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-amber-200/80 mb-1.5">
                  Password Lama
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    value={oldPasswordInput}
                    onChange={(e) => setOldPasswordInput(e.target.value)}
                    placeholder="Masukkan password saat ini"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-amber-400 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-amber-200 cursor-pointer"
                  >
                    {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-amber-200/80 mb-1.5">
                  Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-amber-400 pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-amber-200 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-amber-200/80 mb-1.5">
                  Ulangi Password Baru
                </label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="Ketik ulang password baru"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/80 space-y-1">
                <p className="font-semibold text-amber-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Keamanan Kredensial Database</span>
                </p>
                <p>
                  Password disimpan menggunakan algoritma Bcrypt (salted hash) di database backend. Password Anda tidak akan pernah bocor ke publik atau ditampilkan saat terjadi kesalahan login.
                </p>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-black font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all cursor-pointer disabled:opacity-50"
              >
                {passwordLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Simpan Kredensial Baru ke Database</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
