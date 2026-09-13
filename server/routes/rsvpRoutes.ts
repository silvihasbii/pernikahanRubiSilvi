import { Router } from 'express';
import crypto from 'crypto';
import { getDatabase, queryAll, saveDatabase } from '../db/database';
import { realtimeHub } from '../realtime';

const router = Router();

// GET /api/rsvp
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const rows = queryAll(db, 'SELECT * FROM rsvp ORDER BY datetime(created_at) DESC');

    const totalAttending = rows
      .filter((r: any) => r.attendance === 'attending')
      .reduce((sum: number, r: any) => sum + (Number(r.guests_count) || 1), 0);

    const totalNotAttending = rows
      .filter((r: any) => r.attendance === 'not_attending')
      .length;

    const totalResponses = rows.length;

    return res.json({
      success: true,
      data: rows,
      stats: {
        totalResponses,
        totalAttending,
        totalNotAttending
      }
    });
  } catch (err) {
    console.error('RSVP fetch error:', err);
    return res.status(500).json({ success: false, error: 'Gagal memuat data RSVP.' });
  }
});

// POST /api/rsvp
router.post('/', async (req, res) => {
  const { name, guests_count, attendance, message } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: 'Nama lengkap wajib diisi.' });
  }

  if (!attendance || !['attending', 'not_attending', 'tentative'].includes(attendance)) {
    return res.status(400).json({ success: false, error: 'Status konfirmasi kehadiran wajib dipilih.' });
  }

  try {
    const db = await getDatabase();
    const id = 'rsvp_' + crypto.randomUUID().slice(0, 8);
    const count = Math.max(1, Math.min(10, parseInt(guests_count) || 1));
    const now = new Date().toISOString();

    db.run(
      'INSERT INTO rsvp (id, name, guests_count, attendance, message, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name.trim(), count, attendance, (message || '').trim(), now]
    );

    // Also auto-add a wish entry if message is provided
    if (message && message.trim().length > 0) {
      const wishId = 'wish_' + crypto.randomUUID().slice(0, 8);
      const attLabel = attendance === 'attending' ? 'Hadir' : attendance === 'not_attending' ? 'Tidak Hadir' : 'Belum Pasti';
      db.run(
        'INSERT INTO wishes (id, name, relation, message, attendance, likes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [wishId, name.trim(), 'Tamu Undangan', message.trim(), attLabel, 0, now]
      );

      const newWish = {
        id: wishId,
        name: name.trim(),
        relation: 'Tamu Undangan',
        message: message.trim(),
        attendance: attLabel,
        likes: 0,
        created_at: now
      };
      realtimeHub.broadcast('wish_added', newWish);
    }

    saveDatabase();

    // Fetch updated stats for broadcast
    const all = queryAll(db, 'SELECT * FROM rsvp');
    const totalAttending = all
      .filter((r: any) => r.attendance === 'attending')
      .reduce((sum: number, r: any) => sum + (Number(r.guests_count) || 1), 0);
    const totalNotAttending = all.filter((r: any) => r.attendance === 'not_attending').length;

    const stats = {
      totalResponses: all.length,
      totalAttending,
      totalNotAttending
    };

    realtimeHub.broadcast('rsvp_updated', stats);

    return res.json({
      success: true,
      message: 'Terima kasih, konfirmasi kehadiran Anda telah tersimpan.',
      data: { id, name, guests_count: count, attendance, message, created_at: now }
    });
  } catch (err) {
    console.error('RSVP submit error:', err);
    return res.status(500).json({ success: false, error: 'Gagal menyimpan konfirmasi kehadiran.' });
  }
});

export default router;
