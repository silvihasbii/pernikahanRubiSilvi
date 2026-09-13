import { Router } from 'express';
import { getDatabase, queryAll, queryOne, saveDatabase } from '../db/database';
import { requireAdminAuth } from '../middleware/auth';
import { realtimeHub } from '../realtime';

const router = Router();

// Apply admin auth to all admin routes
router.use(requireAdminAuth);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const db = await getDatabase();
    const rsvps = queryAll(db, 'SELECT * FROM rsvp');
    const wishes = queryAll(db, 'SELECT * FROM wishes');
    const gallery = queryAll(db, 'SELECT * FROM gallery');

    const totalAttending = rsvps
      .filter((r: any) => r.attendance === 'attending')
      .reduce((sum: number, r: any) => sum + (Number(r.guests_count) || 1), 0);

    const totalNotAttending = rsvps
      .filter((r: any) => r.attendance === 'not_attending')
      .length;

    const totalTentative = rsvps
      .filter((r: any) => r.attendance === 'tentative')
      .length;

    return res.json({
      success: true,
      stats: {
        totalRsvps: rsvps.length,
        totalGuestsAttending: totalAttending,
        totalNotAttending,
        totalTentative,
        totalWishes: wishes.length,
        totalPhotos: gallery.length,
        activeStreams: realtimeHub.getSubscriberCount()
      }
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return res.status(500).json({ success: false, error: 'Gagal memuat statistik.' });
  }
});

// DELETE /api/admin/wishes/:id
router.delete('/wishes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDatabase();
    db.run('DELETE FROM wishes WHERE id = ?', [id]);
    saveDatabase();

    const wishes = queryAll(db, 'SELECT * FROM wishes ORDER BY datetime(created_at) DESC');
    realtimeHub.broadcast('wishes_refreshed', wishes);

    return res.json({ success: true, message: 'Ucapan berhasil dihapus.' });
  } catch (err) {
    console.error('Delete wish error:', err);
    return res.status(500).json({ success: false, error: 'Gagal menghapus ucapan.' });
  }
});

// DELETE /api/admin/rsvp/:id
router.delete('/rsvp/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDatabase();
    db.run('DELETE FROM rsvp WHERE id = ?', [id]);
    saveDatabase();

    const all = queryAll(db, 'SELECT * FROM rsvp');
    const totalAttending = all
      .filter((r: any) => r.attendance === 'attending')
      .reduce((sum: number, r: any) => sum + (Number(r.guests_count) || 1), 0);
    const totalNotAttending = all.filter((r: any) => r.attendance === 'not_attending').length;

    realtimeHub.broadcast('rsvp_updated', {
      totalResponses: all.length,
      totalAttending,
      totalNotAttending
    });

    return res.json({ success: true, message: 'Data RSVP berhasil dihapus.' });
  } catch (err) {
    console.error('Delete rsvp error:', err);
    return res.status(500).json({ success: false, error: 'Gagal menghapus RSVP.' });
  }
});

// GET /api/admin/rsvp/export (Download CSV)
router.get('/rsvp/export', async (req, res) => {
  try {
    const db = await getDatabase();
    const rows = queryAll(db, 'SELECT * FROM rsvp ORDER BY datetime(created_at) DESC');

    let csvContent = 'ID,Nama Tamu,Jumlah Tamu,Status Kehadiran,Pesan Doa,Tanggal Konfirmasi\n';
    for (const r of rows) {
      const cleanName = `"${(r.name || '').replace(/"/g, '""')}"`;
      const cleanMsg = `"${(r.message || '').replace(/"/g, '""')}"`;
      const status = r.attendance === 'attending' ? 'Hadir' : r.attendance === 'not_attending' ? 'Tidak Hadir' : 'Ragu-ragu';
      csvContent += `${r.id},${cleanName},${r.guests_count},${status},${cleanMsg},${r.created_at}\n`;
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="wedding_rsvp_export.csv"');
    return res.send(csvContent);
  } catch (err) {
    console.error('Export CSV error:', err);
    return res.status(500).json({ success: false, error: 'Gagal mengekspor data RSVP.' });
  }
});

export default router;
