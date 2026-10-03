import { Router } from 'express';
import { db } from '../db';
import { studentGrades, classes, insertStudentGradeSchema } from '../../shared/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.get('/', authenticateUser, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || undefined;
    const offset = parseInt(req.query.offset as string) || undefined;
    const userClasses = await db.query.classes.findMany({
      where: eq(classes.teacher_id, req.user!.id),
    });
    const classIds = userClasses.map(c => c.id);
    if (classIds.length === 0) return res.json([]);

    const grades = await db.query.studentGrades.findMany({
      where: inArray(studentGrades.class_id, classIds),
      with: { student: true, class: true },
      orderBy: [desc(studentGrades.created_at)],
      limit,
      offset,
    });
    res.json(grades);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticateUser, async (req, res, next) => {
  try {
    const grade = await db.query.studentGrades.findFirst({
      where: eq(studentGrades.id, req.params.id),
      with: { student: true, class: true },
    });
    if (!grade) {
      return res.status(404).json({ error: 'Not Found', message: 'Grade not found' });
    }
    const classData = await db.query.classes.findFirst({
      where: eq(classes.id, grade.class_id),
    });
    if (classData?.teacher_id !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden', message: 'Access denied' });
    }
    res.json(grade);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertStudentGradeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    const { student_id, class_id, assessment_type, assessment_name, score, max_score, percentage, is_passed, notes } = parsed.data;
    if (!student_id || !class_id || !assessment_type || !assessment_name || score === undefined || max_score === undefined) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing required fields' });
    }

    const classData = await db.query.classes.findFirst({
      where: and(eq(classes.id, class_id), eq(classes.teacher_id, req.user!.id)),
    });
    if (!classData) {
      return res.status(404).json({ error: 'Not Found', message: 'Class not found' });
    }

    const [newGrade] = await db.insert(studentGrades)
      .values({ teacher_id: req.user!.id, student_id, class_id, assessment_type, assessment_name, score, max_score, percentage, is_passed, notes })
      .returning();
    res.status(201).json(newGrade);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticateUser, async (req, res, next) => {
  try {
    const grade = await db.query.studentGrades.findFirst({
      where: eq(studentGrades.id, req.params.id),
      with: { class: true },
    });
    if (!grade || grade.class.teacher_id !== req.user!.id) {
      return res.status(404).json({ error: 'Not Found', message: 'Grade not found' });
    }

    const parsed = insertStudentGradeSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    const { assessment_type, assessment_name, score, max_score, percentage, is_passed, notes } = parsed.data;
    const [updated] = await db.update(studentGrades)
      .set({ assessment_type, assessment_name, score, max_score, percentage, is_passed, notes, updated_at: new Date() })
      .where(eq(studentGrades.id, req.params.id))
      .returning();
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticateUser, async (req, res, next) => {
  try {
    const grade = await db.query.studentGrades.findFirst({
      where: eq(studentGrades.id, req.params.id),
      with: { class: true },
    });
    if (!grade || grade.class.teacher_id !== req.user!.id) {
      return res.status(404).json({ error: 'Not Found', message: 'Grade not found' });
    }

    const [deleted] = await db.delete(studentGrades)
      .where(eq(studentGrades.id, req.params.id))
      .returning();
    res.json({ message: 'Grade deleted successfully', id: deleted.id });
  } catch (error) {
    next(error);
  }
});

export default router;
