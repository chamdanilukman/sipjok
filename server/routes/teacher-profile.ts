import { Router } from 'express';
import { db } from '../db';
import { teacherProfile, insertTeacherProfileSchema } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.get('/', authenticateUser, async (req, res, next) => {
  try {
    let profile = await db.query.teacherProfile.findFirst({
      where: eq(teacherProfile.user_id, req.user!.id),
    });
    if (!profile) {
      // First visit of a fresh account — give it an empty profile instead of 404
      const [created] = await db.insert(teacherProfile)
        .values({ user_id: req.user!.id, name: req.user!.email || 'Guru PJOK' })
        .onConflictDoNothing()
        .returning();
      profile = created ?? (await db.query.teacherProfile.findFirst({
        where: eq(teacherProfile.user_id, req.user!.id),
      }));
    }
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertTeacherProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    if (!parsed.data.name) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing required field: name' });
    }

    const [newProfile] = await db.insert(teacherProfile)
      .values({ ...parsed.data, user_id: req.user!.id })
      .returning();
    res.status(201).json(newProfile);
  } catch (error) {
    next(error);
  }
});

router.put('/', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertTeacherProfileSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    const name = parsed.data.name;
    // Spread semua field tervalidasi; key yang tak dikirim (undefined)
    // dilewati drizzle sehingga update foto-only tidak menghapus data lain.
    const [updated] = await db.update(teacherProfile)
      .set({ ...parsed.data, updated_at: new Date() })
      .where(eq(teacherProfile.user_id, req.user!.id))
      .returning();
    if (!updated) {
      // No row yet — upsert so the very first save from a fresh account works
      const [created] = await db.insert(teacherProfile)
        .values({ ...parsed.data, user_id: req.user!.id, name: name || req.user!.email || 'Guru PJOK' })
        .returning();
      return res.json(created);
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

export default router;
