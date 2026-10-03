import { Router } from 'express';
import { db } from '../db';
import { visitationLogs, insertVisitationLogSchema } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.get('/', authenticateUser, async (req, res, next) => {
  try {
    const logs = await db.query.visitationLogs.findMany({
      where: eq(visitationLogs.teacher_id, req.user!.id),
      with: { class: true },
      orderBy: [desc(visitationLogs.tanggal)],
    });
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticateUser, async (req, res, next) => {
  try {
    const log = await db.query.visitationLogs.findFirst({
      where: and(eq(visitationLogs.id, req.params.id), eq(visitationLogs.teacher_id, req.user!.id)),
      with: { class: true },
    });
    if (!log) {
      return res.status(404).json({ error: 'Not Found', message: 'Visitation log not found' });
    }
    res.json(log);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertVisitationLogSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    if (!parsed.data.tanggal || !parsed.data.pengunjung) {
      return res.status(400).json({ error: 'Bad Request', message: 'tanggal and pengunjung are required' });
    }
    const [newLog] = await db.insert(visitationLogs)
      .values({ ...parsed.data, teacher_id: req.user!.id })
      .returning();
    res.status(201).json(newLog);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertVisitationLogSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    const [updated] = await db.update(visitationLogs)
      .set({ ...parsed.data, updated_at: new Date() })
      .where(and(eq(visitationLogs.id, req.params.id), eq(visitationLogs.teacher_id, req.user!.id)))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: 'Not Found', message: 'Visitation log not found' });
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticateUser, async (req, res, next) => {
  try {
    const [deleted] = await db.delete(visitationLogs)
      .where(and(eq(visitationLogs.id, req.params.id), eq(visitationLogs.teacher_id, req.user!.id)))
      .returning();
    if (!deleted) {
      return res.status(404).json({ error: 'Not Found', message: 'Visitation log not found' });
    }
    res.json({ message: 'Visitation log deleted successfully', id: deleted.id });
  } catch (error) {
    next(error);
  }
});

export default router;
