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
      return res.status(401).json({ success: false, error: 'Username atau password yang Anda masukkan salah. Silakan coba lagi.' });
    }

    const isValid = bcrypt.compareSync(password, admin.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Username atau password yang Anda masukkan salah. Silakan coba lagi.' });
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
  const { oldPassword, newPassword, newUsername } = req.body;
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
      return res.status(400).json({ success: false, error: 'Password lama tidak sesuai.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(newPassword, salt);

    let finalUsername = admin.username;
    if (newUsername && newUsername.trim() && newUsername.trim() !== admin.username) {
      const existingOther = queryOne(db, 'SELECT id FROM admins WHERE username = ? AND id != ?', [
        newUsername.trim(),
        admin.id,
      ]);
      if (existingOther) {
        return res.status(400).json({ success: false, error: 'Username tersebut sudah digunakan.' });
      }
      finalUsername = newUsername.trim();
      db.run('UPDATE admins SET username = ?, password_hash = ? WHERE id = ?', [
        finalUsername,
        newHash,
        req.admin?.id,
      ]);
    } else {
      db.run('UPDATE admins SET password_hash = ? WHERE id = ?', [newHash, req.admin?.id]);
    }
    saveDatabase();

    const newToken = jwt.sign(
      { id: admin.id, username: finalUsername },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Password dan kredensial admin berhasil diperbarui di database.',
      token: newToken,
      admin: {
        id: admin.id,
        username: finalUsername,
      },
    });
  } catch (err: any) {
    console.error('Change password error:', err);
    return res.status(500).json({ success: false, error: 'Gagal memperbarui password di database.' });
  }
});

export default router;
