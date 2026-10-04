import { Router } from 'express';
import { db } from '../db';
import { classes, insertClassSchema } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authenticateUser } from '../middleware/auth';

const router = Router();

/**
 * GET /api/classes
 * Get all classes for authenticated user
 */
router.get('/', authenticateUser, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || undefined;
    const offset = parseInt(req.query.offset as string) || undefined;
    const userClasses = await db.query.classes.findMany({
      where: eq(classes.teacher_id, req.user!.id),
      orderBy: [desc(classes.created_at)],
      limit,
      offset,
    });

    res.json(userClasses);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/classes/:id
 * Get single class by ID
 */
router.get('/:id', authenticateUser, async (req, res, next) => {
  try {
    const classData = await db.query.classes.findFirst({
      where: and(
        eq(classes.id, req.params.id),
        eq(classes.teacher_id, req.user!.id)
      ),
    });

    if (!classData) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'Class not found' 
      });
    }

    res.json(classData);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/classes
 * Create new class
 */
router.post('/', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertClassSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    const { name, grade, academic_year, wali_kelas, ruang_kelas } = parsed.data;

    const [newClass] = await db.insert(classes)
      .values({
        name,
        grade,
        academic_year,
        wali_kelas,
        ruang_kelas,
        teacher_id: req.user!.id,
      })
      .returning();

    res.status(201).json(newClass);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/classes/:id
 * Update class
 */
router.put('/:id', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertClassSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    const { name, grade, academic_year, wali_kelas, ruang_kelas } = parsed.data;

    if (!name || !grade || !academic_year) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing required fields' });
    }

    const [updated] = await db.update(classes)
      .set({
        name,
        grade,
        academic_year,
        wali_kelas,
        ruang_kelas,
        updated_at: new Date(),
      })
      .where(and(
        eq(classes.id, req.params.id),
        eq(classes.teacher_id, req.user!.id)
      ))
      .returning();

    if (!updated) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Class not found or you do not have permission to update it',
      });
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/classes/:id
 * Delete class
 */
router.delete('/:id', authenticateUser, async (req, res, next) => {
  try {
    const [deleted] = await db.delete(classes)
      .where(and(
        eq(classes.id, req.params.id),
        eq(classes.teacher_id, req.user!.id)
      ))
      .returning();

    if (!deleted) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Class not found or you do not have permission to delete it',
      });
    }

    res.json({ 
      message: 'Class deleted successfully',
      id: deleted.id 
    });
  } catch (error) {
    next(error);
  }
});

export default router;
