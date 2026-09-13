import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { getDatabase, queryAll, queryOne, saveDatabase } from '../db/database';
import { requireAdminAuth } from '../middleware/auth';
import { realtimeHub } from '../realtime';

const router = Router();

// Ensure upload directory exists
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const uniqueName = `wedding_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const mime = file.mimetype.toLowerCase();

    if (allowed.test(ext) || allowed.test(mime)) {
      cb(null, true);
    } else {
      cb(new Error('Format file tidak didukung. Harap unggah file gambar (JPG, PNG, WebP).'));
    }
  }
});

// GET /api/gallery (Public - View gallery)
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const rows = queryAll(db, 'SELECT * FROM gallery ORDER BY display_order ASC, datetime(created_at) DESC');
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Gallery fetch error:', err);
    return res.status(500).json({ success: false, error: 'Gagal memuat galeri foto.' });
  }
});

// POST /api/gallery/upload (ADMIN ONLY: Foto hanya bisa yang ganti admin)
router.post('/upload', requireAdminAuth, upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'File foto wajib disertakan.' });
  }

  const { caption, category } = req.body;

  try {
    const db = await getDatabase();
    const id = 'gal_' + crypto.randomUUID().slice(0, 8);
    const photoUrl = `/uploads/${req.file.filename}`;
    const now = new Date().toISOString();

    const maxOrderRes = queryOne(db, 'SELECT MAX(display_order) as max_ord FROM gallery');
    const nextOrder = (maxOrderRes?.max_ord || 0) + 1;

    db.run(
      'INSERT INTO gallery (id, url, caption, category, display_order, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, photoUrl, (caption || '').trim(), category || 'prewedding', nextOrder, now]
    );
    saveDatabase();

    const newPhoto = {
      id,
      url: photoUrl,
      caption: (caption || '').trim(),
      category: category || 'prewedding',
      display_order: nextOrder,
      created_at: now
    };

    const allPhotos = queryAll(db, 'SELECT * FROM gallery ORDER BY display_order ASC, datetime(created_at) DESC');
    realtimeHub.broadcast('gallery_updated', allPhotos);

    return res.json({
      success: true,
      message: 'Foto berhasil diunggah ke galeri.',
      data: newPhoto
    });
  } catch (err) {
    console.error('Photo upload error:', err);
    return res.status(500).json({ success: false, error: 'Gagal menyimpan foto ke database.' });
  }
});

// DELETE /api/gallery/:id (ADMIN ONLY)
router.delete('/:id', requireAdminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const db = await getDatabase();
    const photo = queryOne(db, 'SELECT * FROM gallery WHERE id = ?', [id]);
    if (!photo) {
      return res.status(404).json({ success: false, error: 'Foto tidak ditemukan.' });
    }

    // Try deleting physical file if local
    if (photo.url && photo.url.startsWith('/uploads/')) {
      const fileName = path.basename(photo.url);
      const filePath = path.join(UPLOAD_DIR, fileName);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn('Failed to delete physical file:', e);
        }
      }
    }

    db.run('DELETE FROM gallery WHERE id = ?', [id]);
    saveDatabase();

    const allPhotos = queryAll(db, 'SELECT * FROM gallery ORDER BY display_order ASC, datetime(created_at) DESC');
    realtimeHub.broadcast('gallery_updated', allPhotos);

    return res.json({ success: true, message: 'Foto berhasil dihapus.' });
  } catch (err) {
    console.error('Delete photo error:', err);
    return res.status(500).json({ success: false, error: 'Gagal menghapus foto.' });
  }
});

export default router;
