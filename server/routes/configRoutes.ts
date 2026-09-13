import { Router } from 'express';
import { getDatabase, queryOne, saveDatabase } from '../db/database';
import { requireAdminAuth } from '../middleware/auth';
import { realtimeHub } from '../realtime';

const router = Router();

// GET /api/config (Public)
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const config = queryOne(db, 'SELECT * FROM wedding_config LIMIT 1');
    if (!config) {
      return res.status(404).json({ success: false, error: 'Konfigurasi undangan belum tersedia.' });
    }

    // Parse bank accounts and love story JSON
    try {
      config.bank_accounts = JSON.parse(config.bank_accounts_json || '[]');
    } catch {
      config.bank_accounts = [];
    }

    try {
      config.love_story = JSON.parse(config.love_story_json || '[]');
    } catch {
      config.love_story = [];
    }

    return res.json({ success: true, data: config });
  } catch (err) {
    console.error('Config fetch error:', err);
    return res.status(500).json({ success: false, error: 'Gagal memuat konfigurasi undangan.' });
  }
});

// PUT /api/admin/config (Admin only)
router.put('/', requireAdminAuth, async (req, res) => {
  const {
    cover_title,
    groom_name, groom_full_name, groom_parents, groom_instagram, groom_photo,
    bride_name, bride_full_name, bride_parents, bride_instagram, bride_photo,
    wedding_date, akad_time, akad_location, akad_address, akad_map_url,
    resepsi_time, resepsi_location, resepsi_address, resepsi_map_url,
    quote, quote_source, audio_url, bank_accounts,
    gift_address, gift_receiver, gift_phone, love_story,
    wa_template, video_url, video_title, video_description
  } = req.body;

  try {
    const db = await getDatabase();
    const bankAccountsJson = JSON.stringify(bank_accounts || []);
    const loveStoryJson = JSON.stringify(love_story || []);
    const now = new Date().toISOString();

    db.run(`
      UPDATE wedding_config SET
        cover_title = COALESCE(?, cover_title),
        groom_name = COALESCE(?, groom_name),
        groom_full_name = COALESCE(?, groom_full_name),
        groom_parents = COALESCE(?, groom_parents),
        groom_instagram = COALESCE(?, groom_instagram),
        groom_photo = COALESCE(?, groom_photo),
        bride_name = COALESCE(?, bride_name),
        bride_full_name = COALESCE(?, bride_full_name),
        bride_parents = COALESCE(?, bride_parents),
        bride_instagram = COALESCE(?, bride_instagram),
        bride_photo = COALESCE(?, bride_photo),
        wedding_date = COALESCE(?, wedding_date),
        akad_time = COALESCE(?, akad_time),
        akad_location = COALESCE(?, akad_location),
        akad_address = COALESCE(?, akad_address),
        akad_map_url = COALESCE(?, akad_map_url),
        resepsi_time = COALESCE(?, resepsi_time),
        resepsi_location = COALESCE(?, resepsi_location),
        resepsi_address = COALESCE(?, resepsi_address),
        resepsi_map_url = COALESCE(?, resepsi_map_url),
        quote = COALESCE(?, quote),
        quote_source = COALESCE(?, quote_source),
        audio_url = COALESCE(?, audio_url),
        bank_accounts_json = ?,
        gift_address = COALESCE(?, gift_address),
        gift_receiver = COALESCE(?, gift_receiver),
        gift_phone = COALESCE(?, gift_phone),
        love_story_json = ?,
        wa_template = COALESCE(?, wa_template),
        video_url = ?,
        video_title = ?,
        video_description = ?,
        updated_at = ?
      WHERE id = 'default_config'
    `, [
      cover_title,
      groom_name, groom_full_name, groom_parents, groom_instagram, groom_photo,
      bride_name, bride_full_name, bride_parents, bride_instagram, bride_photo,
      wedding_date, akad_time, akad_location, akad_address, akad_map_url,
      resepsi_time, resepsi_location, resepsi_address, resepsi_map_url,
      quote, quote_source, audio_url, bankAccountsJson,
      gift_address, gift_receiver, gift_phone, loveStoryJson,
      wa_template, video_url ?? '', video_title ?? '', video_description ?? '', now
    ]);

    saveDatabase();

    const updated = queryOne(db, 'SELECT * FROM wedding_config LIMIT 1');
    if (updated) {
      try {
        updated.bank_accounts = JSON.parse(updated.bank_accounts_json || '[]');
      } catch {
        updated.bank_accounts = [];
      }
      try {
        updated.love_story = JSON.parse(updated.love_story_json || '[]');
      } catch {
        updated.love_story = [];
      }
    }

    realtimeHub.broadcast('config_updated', updated);

    return res.json({ success: true, message: 'Konfigurasi berhasil diperbarui di database.', data: updated });
  } catch (err) {
    console.error('Config update error:', err);
    return res.status(500).json({ success: false, error: 'Gagal memperbarui konfigurasi di database.' });
  }
});

export default router;
