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
    const { elemen, tujuan_pembelajaran, kriteria_ketuntasan, class_id } = parsed.data;
    if (!elemen || !tujuan_pembelajaran || !kriteria_ketuntasan) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing required fields' });
    }

    const [newKktp] = await db.insert(kktp)
      .values({ teacher_id: req.user!.id, elemen, tujuan_pembelajaran, kriteria_ketuntasan, class_id })
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
    const fields = { elemen: parsed.data.elemen, tujuan_pembelajaran: parsed.data.tujuan_pembelajaran, kriteria_ketuntasan: parsed.data.kriteria_ketuntasan, class_id: parsed.data.class_id };
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
