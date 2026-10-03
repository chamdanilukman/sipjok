import { Router } from 'express';
import { db } from '../db';
import { kktp, insertKktpSchema } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.get('/', authenticateUser, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || undefined;
    const offset = parseInt(req.query.offset as string) || undefined;
    const kktpList = await db.query.kktp.findMany({
      where: eq(kktp.teacher_id, req.user!.id),
      orderBy: [desc(kktp.created_at)],
      limit,
      offset,
    });
    res.json(kktpList);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticateUser, async (req, res, next) => {
  try {
    const kktpData = await db.query.kktp.findFirst({
      where: and(eq(kktp.id, req.params.id), eq(kktp.teacher_id, req.user!.id)),
    });
    if (!kktpData) {
      return res.status(404).json({ error: 'Not Found', message: 'KKTP not found' });
    }
    res.json(kktpData);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertKktpSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    const { class_id, subject, fase, kelas, tujuan_pembelajaran, kktp_percentage, indicators } = parsed.data;
    if (!subject || !tujuan_pembelajaran || kktp_percentage === undefined) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing required fields' });
    }

    const [newKktp] = await db.insert(kktp)
      .values({ teacher_id: req.user!.id, class_id, subject, fase, kelas, tujuan_pembelajaran, kktp_percentage, indicators })
      .returning();
    res.status(201).json(newKktp);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertKktpSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    const { class_id, subject, fase, kelas, tujuan_pembelajaran, kktp_percentage, indicators } = parsed.data;
    const fields = { class_id, subject, fase, kelas, tujuan_pembelajaran, kktp_percentage, indicators };
    const [updated] = await db.update(kktp)
      .set({ ...fields, updated_at: new Date() })
      .where(and(eq(kktp.id, req.params.id), eq(kktp.teacher_id, req.user!.id)))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: 'Not Found', message: 'KKTP not found' });
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticateUser, async (req, res, next) => {
  try {
    const [deleted] = await db.delete(kktp)
      .where(and(eq(kktp.id, req.params.id), eq(kktp.teacher_id, req.user!.id)))
      .returning();
    if (!deleted) {
      return res.status(404).json({ error: 'Not Found', message: 'KKTP not found' });
    }
    res.json({ message: 'KKTP deleted successfully', id: deleted.id });
  } catch (error) {
    next(error);
  }
});

export default router;
