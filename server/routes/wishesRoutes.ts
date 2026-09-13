import { Router } from 'express';
import crypto from 'crypto';
import { getDatabase, queryAll, queryOne, saveDatabase } from '../db/database';
import { realtimeHub } from '../realtime';

const router = Router();

// GET /api/wishes
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const rows = queryAll(db, 'SELECT * FROM wishes ORDER BY datetime(created_at) DESC');
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Wishes fetch error:', err);
    return res.status(500).json({ success: false, error: 'Gagal memuat ucapan & doa restu.' });
  }
});

// POST /api/wishes
router.post('/', async (req, res) => {
  const { name, relation, message, attendance } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: 'Nama pengirim wajib diisi.' });
  }

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, error: 'Pesan ucapan doa tidak boleh kosong.' });
  }

  try {
    const db = await getDatabase();
    const id = 'wish_' + crypto.randomUUID().slice(0, 8);
    const now = new Date().toISOString();
    const cleanRelation = relation && relation.trim() ? relation.trim() : 'Tamu Undangan';
    const cleanAttendance = attendance || 'Hadir';

    db.run(
      'INSERT INTO wishes (id, name, relation, message, attendance, likes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name.trim(), cleanRelation, message.trim(), cleanAttendance, 0, now]
    );
    saveDatabase();

    const newWish = {
      id,
      name: name.trim(),
      relation: cleanRelation,
      message: message.trim(),
      attendance: cleanAttendance,
      likes: 0,
      created_at: now
    };

    realtimeHub.broadcast('wish_added', newWish);

    return res.json({
      success: true,
      message: 'Ucapan dan doa restu Anda berhasil dikirimkan.',
      data: newWish
    });
  } catch (err) {
    console.error('Wish submit error:', err);
    return res.status(500).json({ success: false, error: 'Gagal mengirim ucapan.' });
  }
});

// POST /api/wishes/:id/like
router.post('/:id/like', async (req, res) => {
  const { id } = req.params;

  try {
    const db = await getDatabase();
    const existing = queryOne(db, 'SELECT * FROM wishes WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Ucapan tidak ditemukan.' });
    }

    db.run('UPDATE wishes SET likes = likes + 1 WHERE id = ?', [id]);
    saveDatabase();

    const updated = queryOne(db, 'SELECT * FROM wishes WHERE id = ?', [id]);
    realtimeHub.broadcast('wish_liked', { id, likes: updated.likes });

    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Wish like error:', err);
    return res.status(500).json({ success: false, error: 'Gagal menyukai ucapan.' });
  }
});

export default router;
