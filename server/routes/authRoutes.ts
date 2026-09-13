import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase, queryOne, saveDatabase } from '../db/database';
import { requireAdminAuth, AuthenticatedRequest, JWT_SECRET } from '../middleware/auth';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username dan password wajib diisi.' });
  }

  try {
    const db = await getDatabase();
    const admin = queryOne(db, 'SELECT * FROM admins WHERE username = ?', [username.trim()]);
    if (!admin) {
      return res.status(401).json({ success: false, error: 'Kombinasi kredensial admin tidak valid.' });
    }

    const isValid = bcrypt.compareSync(password, admin.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Kombinasi kredensial admin tidak valid.' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: 'Terjadi kesalahan saat otentikasi admin.' });
  }
});

// GET /api/auth/verify
router.get('/verify', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  return res.json({
    success: true,
    admin: req.admin
  });
});

// POST /api/auth/change-password
router.post('/change-password', requireAdminAuth, async (req: AuthenticatedRequest, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, error: 'Password baru minimal 6 karakter.' });
  }

  try {
    const db = await getDatabase();
    const admin = queryOne(db, 'SELECT * FROM admins WHERE id = ?', [req.admin?.id]);
    if (!admin) {
      return res.status(404).json({ success: false, error: 'Admin tidak ditemukan.' });
    }

    const isValid = bcrypt.compareSync(oldPassword, admin.password_hash);
    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Password lama salah.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(newPassword, salt);

    db.run('UPDATE admins SET password_hash = ? WHERE id = ?', [newHash, req.admin?.id]);
    saveDatabase();

    return res.json({ success: true, message: 'Password berhasil diperbarui.' });
  } catch (err: any) {
    console.error('Change password error:', err);
    return res.status(500).json({ success: false, error: 'Gagal memperbarui password.' });
  }
});

export default router;
