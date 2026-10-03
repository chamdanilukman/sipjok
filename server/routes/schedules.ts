import { Router } from 'express';
import { db } from '../db';
import { classSchedules, classes, insertClassScheduleSchema } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authenticateUser } from '../middleware/auth';

const router = Router();

/**
 * GET /api/schedules
 * Get all schedules for authenticated user
 */
router.get('/', authenticateUser, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || undefined;
    const offset = parseInt(req.query.offset as string) || undefined;
    const userSchedules = await db.query.classSchedules.findMany({
      where: eq(classSchedules.teacher_id, req.user!.id),
      with: {
        class: true,
      },
      orderBy: [desc(classSchedules.created_at)],
      limit,
      offset,
    });

    res.json(userSchedules);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/schedules/class/:classId
 * Get schedules for a specific class
 */
router.get('/class/:classId', authenticateUser, async (req, res, next) => {
  try {
    // Verify class belongs to user
    const classData = await db.query.classes.findFirst({
      where: and(
        eq(classes.id, req.params.classId),
        eq(classes.teacher_id, req.user!.id)
      ),
    });

    if (!classData) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Class not found or you do not have permission to access it',
      });
    }

    const schedules = await db.query.classSchedules.findMany({
      where: eq(classSchedules.class_id, req.params.classId),
      with: {
        class: true,
      },
    });

    res.json(schedules);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/schedules/:id
 * Get single schedule by ID
 */
router.get('/:id', authenticateUser, async (req, res, next) => {
  try {
    const schedule = await db.query.classSchedules.findFirst({
      where: and(
        eq(classSchedules.id, req.params.id),
        eq(classSchedules.teacher_id, req.user!.id)
      ),
      with: {
        class: true,
      },
    });

    if (!schedule) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Schedule not found',
      });
    }

    res.json(schedule);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/schedules
 * Create new schedule
 */
router.post('/', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertClassScheduleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    const { class_id, day, start_time, end_time } = parsed.data;

    if (!class_id || !day || !start_time || !end_time) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing required fields' });
    }

    // Verify class belongs to user
    const classData = await db.query.classes.findFirst({
      where: and(
        eq(classes.id, class_id),
        eq(classes.teacher_id, req.user!.id)
      ),
    });

    if (!classData) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Class not found or you do not have permission to add schedules to it',
      });
    }

    const [newSchedule] = await db.insert(classSchedules)
      .values({
        teacher_id: req.user!.id,
        class_id,
        day,
        start_time,
        end_time,
      })
      .returning();

    res.status(201).json(newSchedule);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/schedules/:id
 * Update schedule
 */
router.put('/:id', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertClassScheduleSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    const { class_id, day, start_time, end_time } = parsed.data;

    // Validate required fields
    if (!day || !start_time || !end_time) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required fields: day, start_time, end_time',
      });
    }

    // If changing class, verify new class belongs to user
    if (class_id) {
      const classData = await db.query.classes.findFirst({
        where: and(
          eq(classes.id, class_id),
          eq(classes.teacher_id, req.user!.id)
        ),
      });

      if (!classData) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Class not found or you do not have permission',
        });
      }
    }

    const [updated] = await db.update(classSchedules)
      .set({
        class_id: class_id || undefined,
        day,
        start_time,
        end_time,
        updated_at: new Date(),
      })
      .where(and(
        eq(classSchedules.id, req.params.id),
        eq(classSchedules.teacher_id, req.user!.id)
      ))
      .returning();

    if (!updated) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Schedule not found or you do not have permission to update it',
      });
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/schedules/:id
 * Delete schedule
 */
router.delete('/:id', authenticateUser, async (req, res, next) => {
  try {
    const [deleted] = await db.delete(classSchedules)
      .where(and(
        eq(classSchedules.id, req.params.id),
        eq(classSchedules.teacher_id, req.user!.id)
      ))
      .returning();

    if (!deleted) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Schedule not found or you do not have permission to delete it',
      });
    }

    res.json({
      message: 'Schedule deleted successfully',
      id: deleted.id,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
