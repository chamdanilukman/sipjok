import { Router } from 'express';
import { db } from '../db';
import { studentReflections, insertStudentReflectionSchema } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.get('/', authenticateUser, async (req, res, next) => {
  try {
    const reflections = await db.query.studentReflections.findMany({
      where: eq(studentReflections.teacher_id, req.user!.id),
      with: { student: true, class: true },
      orderBy: [desc(studentReflections.tanggal)],
    });
    res.json(reflections);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticateUser, async (req, res, next) => {
  try {
    const reflection = await db.query.studentReflections.findFirst({
      where: and(eq(studentReflections.id, req.params.id), eq(studentReflections.teacher_id, req.user!.id)),
      with: { student: true, class: true },
    });
    if (!reflection) {
      return res.status(404).json({ error: 'Not Found', message: 'Reflection not found' });
    }
    res.json(reflection);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertStudentReflectionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    if (!parsed.data.student_id || !parsed.data.class_id || !parsed.data.tanggal) {
      return res.status(400).json({ error: 'Bad Request', message: 'student_id, class_id, and tanggal are required' });
    }
    const [newReflection] = await db.insert(studentReflections)
      .values({ ...parsed.data, teacher_id: req.user!.id })
      .returning();
    res.status(201).json(newReflection);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertStudentReflectionSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    const [updated] = await db.update(studentReflections)
      .set({ ...parsed.data, updated_at: new Date() })
      .where(and(eq(studentReflections.id, req.params.id), eq(studentReflections.teacher_id, req.user!.id)))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: 'Not Found', message: 'Reflection not found' });
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticateUser, async (req, res, next) => {
  try {
    const [deleted] = await db.delete(studentReflections)
      .where(and(eq(studentReflections.id, req.params.id), eq(studentReflections.teacher_id, req.user!.id)))
      .returning();
    if (!deleted) {
      return res.status(404).json({ error: 'Not Found', message: 'Reflection not found' });
    }
    res.json({ message: 'Reflection deleted successfully', id: deleted.id });
  } catch (error) {
    next(error);
  }
});

export default router;
