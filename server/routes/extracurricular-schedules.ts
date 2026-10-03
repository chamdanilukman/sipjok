import { Router } from 'express';
import { db } from '../db';
import { extracurricularSchedules, insertExtracurricularScheduleSchema } from '../../shared/schema';
import { eq, and, asc } from 'drizzle-orm';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.get('/', authenticateUser, async (req, res, next) => {
  try {
    const schedules = await db.query.extracurricularSchedules.findMany({
      where: eq(extracurricularSchedules.teacher_id, req.user!.id),
      with: { program: true },
      orderBy: [asc(extracurricularSchedules.day_of_week), asc(extracurricularSchedules.jam_mulai)],
    });
    res.json(schedules);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticateUser, async (req, res, next) => {
  try {
    const schedule = await db.query.extracurricularSchedules.findFirst({
      where: and(eq(extracurricularSchedules.id, req.params.id), eq(extracurricularSchedules.teacher_id, req.user!.id)),
      with: { program: true },
    });
    if (!schedule) {
      return res.status(404).json({ error: 'Not Found', message: 'Schedule not found' });
    }
    res.json(schedule);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertExtracurricularScheduleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    if (!parsed.data.kegiatan || parsed.data.day_of_week === undefined || parsed.data.day_of_week === null) {
      return res.status(400).json({ error: 'Bad Request', message: 'kegiatan and day_of_week are required' });
    }
    const [newSchedule] = await db.insert(extracurricularSchedules)
      .values({ ...parsed.data, teacher_id: req.user!.id })
      .returning();
    res.status(201).json(newSchedule);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertExtracurricularScheduleSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    const [updated] = await db.update(extracurricularSchedules)
      .set({ ...parsed.data, updated_at: new Date() })
      .where(and(eq(extracurricularSchedules.id, req.params.id), eq(extracurricularSchedules.teacher_id, req.user!.id)))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: 'Not Found', message: 'Schedule not found' });
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticateUser, async (req, res, next) => {
  try {
    const [deleted] = await db.delete(extracurricularSchedules)
      .where(and(eq(extracurricularSchedules.id, req.params.id), eq(extracurricularSchedules.teacher_id, req.user!.id)))
      .returning();
    if (!deleted) {
      return res.status(404).json({ error: 'Not Found', message: 'Schedule not found' });
    }
    res.json({ message: 'Schedule deleted successfully', id: deleted.id });
  } catch (error) {
    next(error);
  }
});

export default router;
