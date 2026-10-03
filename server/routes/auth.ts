import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Stricter limiter for credential endpoints (brute-force slowdown)
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Terlalu banyak percobaan. Coba lagi dalam satu menit.',
  },
});

const TOKEN_TTL = process.env.JWT_TTL || '7d';

function signToken(user: { id: string; username: string }): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.sign({ sub: user.id, username: user.username }, secret, {
    expiresIn: TOKEN_TTL,
  } as jwt.SignOptions);
}

/**
 * POST /api/auth/login
 * Internal authentication: username/email + password (bcrypt) → JWT
 */
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const parsed = z
      .object({ email: z.string().min(1), password: z.string().min(1) })
      .safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email dan password wajib diisi',
      });
    }

    const identity = parsed.data.email.trim().toLowerCase();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, identity))
      .limit(1);

    // Constant-ish response regardless of which half failed
    if (!user || !(await bcrypt.compare(parsed.data.password, user.password))) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Email atau password salah',
      });
    }

    res.json({
      token: signToken(user),
      user: { id: user.id, email: user.username },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Identity of the authenticated user
 */
router.get('/me', authenticateUser, async (req, res) => {
  res.json({
    id: req.user!.id,
    email: req.user!.email || null,
  });
});

/**
 * POST /api/auth/change-password
 * Change the authenticated user's password
 */
router.post('/change-password', authLimiter, authenticateUser, async (req, res, next) => {
  try {
    const parsed = z
      .object({
        current_password: z.string().min(1),
        new_password: z.string().min(8, 'Password baru minimal 8 karakter'),
      })
      .safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation Error',
        message: parsed.error.issues[0]?.message || 'Data tidak valid',
      });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user!.id))
      .limit(1);

    if (!user || !(await bcrypt.compare(parsed.data.current_password, user.password))) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Password saat ini salah',
      });
    }

    const hash = await bcrypt.hash(parsed.data.new_password, 10);
    await db
      .update(users)
      .set({ password: hash, updated_at: new Date() })
      .where(eq(users.id, user.id));

    res.json({ message: 'Password berhasil diubah' });
  } catch (error) {
    next(error);
  }
});

export default router;
