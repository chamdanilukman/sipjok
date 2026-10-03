import { Router } from 'express';
import { db } from '../db';
import { teachingJournal, classes, insertTeachingJournalSchema } from '../../shared/schema';
import { eq, and, desc, gte, lte, between } from 'drizzle-orm';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.get('/', authenticateUser, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || undefined;
    const offset = parseInt(req.query.offset as string) || undefined;
    const journals = await db.query.teachingJournal.findMany({
      where: eq(teachingJournal.teacher_id, req.user!.id),
      with: { class: true },
      orderBy: [desc(teachingJournal.tanggal)],
      limit,
      offset,
    });
    res.json(journals);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticateUser, async (req, res, next) => {
  try {
    const journal = await db.query.teachingJournal.findFirst({
      where: and(
        eq(teachingJournal.id, req.params.id),
        eq(teachingJournal.teacher_id, req.user!.id)
      ),
      with: { class: true },
    });
    if (!journal) {
      return res.status(404).json({ error: 'Not Found', message: 'Journal not found' });
    }
    res.json(journal);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertTeachingJournalSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    const { class_id, tanggal, materi, kegiatan, catatan } = parsed.data;
    if (!class_id || !tanggal || !materi) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing required fields' });
    }
    
    const classData = await db.query.classes.findFirst({
      where: and(eq(classes.id, class_id), eq(classes.teacher_id, req.user!.id)),
    });
    if (!classData) {
      return res.status(404).json({ error: 'Not Found', message: 'Class not found' });
    }

    const [newJournal] = await db.insert(teachingJournal)
      .values({ teacher_id: req.user!.id, class_id, tanggal, materi, kegiatan, catatan })
      .returning();
    res.status(201).json(newJournal);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertTeachingJournalSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    const { tanggal, materi, kegiatan, catatan } = parsed.data;
    const [updated] = await db.update(teachingJournal)
      .set({ tanggal, materi, kegiatan, catatan, updated_at: new Date() })
      .where(and(eq(teachingJournal.id, req.params.id), eq(teachingJournal.teacher_id, req.user!.id)))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: 'Not Found', message: 'Journal not found' });
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticateUser, async (req, res, next) => {
  try {
    const [deleted] = await db.delete(teachingJournal)
      .where(and(eq(teachingJournal.id, req.params.id), eq(teachingJournal.teacher_id, req.user!.id)))
      .returning();
    if (!deleted) {
      return res.status(404).json({ error: 'Not Found', message: 'Journal not found' });
    }
    res.json({ message: 'Journal deleted successfully', id: deleted.id });
  } catch (error) {
    next(error);
  }
});

export default router;
