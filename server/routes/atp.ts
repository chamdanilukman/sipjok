import { Router } from 'express';
import { db } from '../db';
import { atpIntracurricular, insertAtpIntracurricularSchema } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.get('/', authenticateUser, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || undefined;
    const offset = parseInt(req.query.offset as string) || undefined;
    const atps = await db.query.atpIntracurricular.findMany({
      where: eq(atpIntracurricular.teacher_id, req.user!.id),
      orderBy: [desc(atpIntracurricular.created_at)],
      limit,
      offset,
    });
    res.json(atps);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticateUser, async (req, res, next) => {
  try {
    const atp = await db.query.atpIntracurricular.findFirst({
      where: and(eq(atpIntracurricular.id, req.params.id), eq(atpIntracurricular.teacher_id, req.user!.id)),
    });
    if (!atp) {
      return res.status(404).json({ error: 'Not Found', message: 'ATP not found' });
    }
    res.json(atp);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertAtpIntracurricularSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    const { judul, mata_pelajaran, fase, kelas, elemen, capaian_pembelajaran, tujuan_pembelajaran, alokasi_waktu } = parsed.data;
    if (!judul) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing required field: judul' });
    }

    const [newAtp] = await db.insert(atpIntracurricular)
      .values({ teacher_id: req.user!.id, judul, mata_pelajaran, fase, kelas, elemen, capaian_pembelajaran, tujuan_pembelajaran, alokasi_waktu })
      .returning();
    res.status(201).json(newAtp);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertAtpIntracurricularSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    const { judul, mata_pelajaran, fase, kelas, elemen, capaian_pembelajaran, tujuan_pembelajaran, alokasi_waktu } = parsed.data;
    const [updated] = await db.update(atpIntracurricular)
      .set({ judul, mata_pelajaran, fase, kelas, elemen, capaian_pembelajaran, tujuan_pembelajaran, alokasi_waktu, updated_at: new Date() })
      .where(and(eq(atpIntracurricular.id, req.params.id), eq(atpIntracurricular.teacher_id, req.user!.id)))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: 'Not Found', message: 'ATP not found' });
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticateUser, async (req, res, next) => {
  try {
    const [deleted] = await db.delete(atpIntracurricular)
      .where(and(eq(atpIntracurricular.id, req.params.id), eq(atpIntracurricular.teacher_id, req.user!.id)))
      .returning();
    if (!deleted) {
      return res.status(404).json({ error: 'Not Found', message: 'ATP not found' });
    }
    res.json({ message: 'ATP deleted successfully', id: deleted.id });
  } catch (error) {
    next(error);
  }
});

export default router;
