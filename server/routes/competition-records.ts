import { Router } from 'express';
import { db } from '../db';
import { competitionRecords, insertCompetitionRecordSchema } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.get('/', authenticateUser, async (req, res, next) => {
  try {
    const records = await db.query.competitionRecords.findMany({
      where: eq(competitionRecords.teacher_id, req.user!.id),
      with: { student: true },
      orderBy: [desc(competitionRecords.tanggal_lomba)],
    });
    res.json(records);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticateUser, async (req, res, next) => {
  try {
    const record = await db.query.competitionRecords.findFirst({
      where: and(eq(competitionRecords.id, req.params.id), eq(competitionRecords.teacher_id, req.user!.id)),
      with: { student: true },
    });
    if (!record) {
      return res.status(404).json({ error: 'Not Found', message: 'Competition record not found' });
    }
    res.json(record);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertCompetitionRecordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    if (!parsed.data.nama_peserta || !parsed.data.nama_lomba || !parsed.data.tingkat) {
      return res.status(400).json({ error: 'Bad Request', message: 'nama_peserta, nama_lomba, and tingkat are required' });
    }
    const [newRecord] = await db.insert(competitionRecords)
      .values({ ...parsed.data, teacher_id: req.user!.id })
      .returning();
    res.status(201).json(newRecord);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertCompetitionRecordSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    const [updated] = await db.update(competitionRecords)
      .set({ ...parsed.data, updated_at: new Date() })
      .where(and(eq(competitionRecords.id, req.params.id), eq(competitionRecords.teacher_id, req.user!.id)))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: 'Not Found', message: 'Competition record not found' });
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticateUser, async (req, res, next) => {
  try {
    const [deleted] = await db.delete(competitionRecords)
      .where(and(eq(competitionRecords.id, req.params.id), eq(competitionRecords.teacher_id, req.user!.id)))
      .returning();
    if (!deleted) {
      return res.status(404).json({ error: 'Not Found', message: 'Competition record not found' });
    }
    res.json({ message: 'Competition record deleted successfully', id: deleted.id });
  } catch (error) {
    next(error);
  }
});

export default router;
