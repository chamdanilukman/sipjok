import { Router } from 'express';
import { db } from '../db';
import { studentAttendance, students, classes, insertStudentAttendanceSchema } from '../../shared/schema';
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

    const attendance = await db.query.studentAttendance.findMany({
      where: inArray(studentAttendance.class_id, classIds),
      with: { student: true, class: true },
      orderBy: [desc(studentAttendance.tanggal)],
      limit,
      offset,
    });
    res.json(attendance);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticateUser, async (req, res, next) => {
  try {
    const record = await db.query.studentAttendance.findFirst({
      where: eq(studentAttendance.id, req.params.id),
      with: { student: true, class: true },
    });
    if (!record) {
      return res.status(404).json({ error: 'Not Found', message: 'Attendance record not found' });
    }
    const classData = await db.query.classes.findFirst({
      where: eq(classes.id, record.class_id),
    });
    if (classData?.teacher_id !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden', message: 'Access denied' });
    }
    res.json(record);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertStudentAttendanceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    const { student_id, class_id, tanggal, status, notes } = parsed.data;
    if (!student_id || !class_id || !tanggal || !status) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing required fields' });
    }

    const classData = await db.query.classes.findFirst({
      where: and(eq(classes.id, class_id), eq(classes.teacher_id, req.user!.id)),
    });
    if (!classData) {
      return res.status(404).json({ error: 'Not Found', message: 'Class not found' });
    }

    const [newRecord] = await db.insert(studentAttendance)
      .values({ student_id, class_id, tanggal, status, notes })
      .returning();
    res.status(201).json(newRecord);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertStudentAttendanceSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    const { status, notes } = parsed.data;
    const record = await db.query.studentAttendance.findFirst({
      where: eq(studentAttendance.id, req.params.id),
      with: { class: true },
    });
    if (!record || record.class.teacher_id !== req.user!.id) {
      return res.status(404).json({ error: 'Not Found', message: 'Attendance record not found' });
    }

    const [updated] = await db.update(studentAttendance)
      .set({ status, notes, updated_at: new Date() })
      .where(eq(studentAttendance.id, req.params.id))
      .returning();
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticateUser, async (req, res, next) => {
  try {
    const record = await db.query.studentAttendance.findFirst({
      where: eq(studentAttendance.id, req.params.id),
      with: { class: true },
    });
    if (!record || record.class.teacher_id !== req.user!.id) {
      return res.status(404).json({ error: 'Not Found', message: 'Attendance record not found' });
    }

    const [deleted] = await db.delete(studentAttendance)
      .where(eq(studentAttendance.id, req.params.id))
      .returning();
    res.json({ message: 'Attendance deleted successfully', id: deleted.id });
  } catch (error) {
    next(error);
  }
});

export default router;
