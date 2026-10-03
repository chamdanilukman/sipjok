import { Router } from 'express';
import { db } from '../db';
import { teacherProfile, insertTeacherProfileSchema } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.get('/', authenticateUser, async (req, res, next) => {
  try {
    const profile = await db.query.teacherProfile.findFirst({
      where: eq(teacherProfile.user_id, req.user!.id),
    });
    if (!profile) {
      return res.status(404).json({ error: 'Not Found', message: 'Profile not found' });
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
    const { name, nip, school_name, school_address, phone, profile_photo_url, profile_photo_path } = parsed.data;
    if (!name) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing required field: name' });
    }

    const [newProfile] = await db.insert(teacherProfile)
      .values({ user_id: req.user!.id, name, nip, school_name, school_address, phone, profile_photo_url, profile_photo_path })
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
    const { name, nip, school_name, school_address, phone, profile_photo_url, profile_photo_path } = parsed.data;
    const [updated] = await db.update(teacherProfile)
      .set({
        name: name || undefined,
        nip,
        school_name,
        school_address,
        phone,
        profile_photo_url,
        profile_photo_path,
        updated_at: new Date(),
      })
      .where(eq(teacherProfile.user_id, req.user!.id))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: 'Not Found', message: 'Profile not found' });
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

export default router;
