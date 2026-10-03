import { Router } from 'express';
import { db } from '../db';
import { calendarEvents, insertCalendarEventSchema } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.get('/', authenticateUser, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || undefined;
    const offset = parseInt(req.query.offset as string) || undefined;
    const events = await db.query.calendarEvents.findMany({
      where: eq(calendarEvents.user_id, req.user!.id),
      orderBy: [desc(calendarEvents.start_date)],
      limit,
      offset,
    });
    res.json(events);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticateUser, async (req, res, next) => {
  try {
    const event = await db.query.calendarEvents.findFirst({
      where: and(eq(calendarEvents.id, req.params.id), eq(calendarEvents.user_id, req.user!.id)),
    });
    if (!event) {
      return res.status(404).json({ error: 'Not Found', message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertCalendarEventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    const { title, event_type, start_date, end_date, description } = parsed.data;
    if (!title || !start_date) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing required fields' });
    }

    const [newEvent] = await db.insert(calendarEvents)
      .values({ user_id: req.user!.id, title, event_type, start_date, end_date, description })
      .returning();
    res.status(201).json(newEvent);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertCalendarEventSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    const { title, event_type, start_date, end_date, description } = parsed.data;
    const [updated] = await db.update(calendarEvents)
      .set({ title, event_type, start_date, end_date, description, updated_at: new Date() })
      .where(and(eq(calendarEvents.id, req.params.id), eq(calendarEvents.user_id, req.user!.id)))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: 'Not Found', message: 'Event not found' });
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticateUser, async (req, res, next) => {
  try {
    const [deleted] = await db.delete(calendarEvents)
      .where(and(eq(calendarEvents.id, req.params.id), eq(calendarEvents.user_id, req.user!.id)))
      .returning();
    if (!deleted) {
      return res.status(404).json({ error: 'Not Found', message: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully', id: deleted.id });
  } catch (error) {
    next(error);
  }
});

export default router;
