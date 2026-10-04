import { Router } from 'express';
import { db } from '../db';
import { students, classes, insertStudentSchema } from '../../shared/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Nama siswa selalu disimpan Kapital Huruf Depan: "budi santoso" -> "Budi Santoso",
// "muhammad al-fatih" -> "Muhammad Al-Fatih" (kapital juga setelah tanda hubung/apostrof)
const titleCaseName = (value: string) =>
  String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/(^|[\s\-'])([a-z])/g, (_m, p, c) => p + c.toUpperCase());

/**
 * GET /api/students
 * Get all students for authenticated user's classes
 */
router.get('/', authenticateUser, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || undefined;
    const offset = parseInt(req.query.offset as string) || undefined;
    // Get user's classes first
    const userClasses = await db.query.classes.findMany({
      where: eq(classes.teacher_id, req.user!.id),
    });

    const classIds = userClasses.map(c => c.id);

    if (classIds.length === 0) {
      return res.json([]);
    }

    // Get all students from those classes
    const userStudents = await db.query.students.findMany({
      where: inArray(students.class_id, classIds),
      with: {
        class: true,
      },
      orderBy: [desc(students.created_at)],
      limit,
      offset,
    });

    res.json(userStudents);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/students/class/:classId
 * Get all students in a specific class
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

    // Get students in the class
    const classStudents = await db.query.students.findMany({
      where: eq(students.class_id, req.params.classId),
      orderBy: [desc(students.name)],
    });

    res.json(classStudents);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/students/:id
 * Get single student by ID
 */
router.get('/:id', authenticateUser, async (req, res, next) => {
  try {
    const student = await db.query.students.findFirst({
      where: eq(students.id, req.params.id),
      with: {
        class: true,
      },
    });

    if (!student) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Student not found',
      });
    }

    // Verify class belongs to user
    if (student.class.teacher_id !== req.user!.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to access this student',
      });
    }

    res.json(student);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/students
 * Create new student
 */
router.post('/', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertStudentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    const { class_id, name, gender } = parsed.data;

    // Validate required fields
    if (!class_id || !name || !gender) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing required fields' });
    }

    if (gender !== 'L' && gender !== 'P') {
      return res.status(400).json({ error: 'Bad Request', message: 'Gender must be L or P' });
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
        message: 'Class not found or you do not have permission to add students to it',
      });
    }

    const [newStudent] = await db.insert(students)
      .values({
        ...parsed.data,
        name: titleCaseName(name),
      })
      .returning();

    res.status(201).json(newStudent);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/students/:id
 * Update student
 */
router.put('/:id', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertStudentSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    const { class_id, name, gender } = parsed.data;

    // Validate required fields
    if (!name || !gender) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required fields: name, gender',
      });
    }

    // Validate gender
    if (gender !== 'L' && gender !== 'P') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Gender must be either "L" or "P"',
      });
    }

    // Get student with class info
    const student = await db.query.students.findFirst({
      where: eq(students.id, req.params.id),
      with: {
        class: true,
      },
    });

    if (!student) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Student not found',
      });
    }

    // Verify class belongs to user
    if (student.class.teacher_id !== req.user!.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to update this student',
      });
    }

    // If changing class, verify new class belongs to user
    if (class_id && class_id !== student.class_id) {
      const newClass = await db.query.classes.findFirst({
        where: and(
          eq(classes.id, class_id),
          eq(classes.teacher_id, req.user!.id)
        ),
      });

      if (!newClass) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'New class not found or you do not have permission to move student to it',
        });
      }
    }

    const [updated] = await db.update(students)
      .set({
        ...parsed.data,
        class_id: class_id || student.class_id,
        name: titleCaseName(name),
        updated_at: new Date(),
      })
      .where(eq(students.id, req.params.id))
      .returning();

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/students/:id
 * Delete student
 */
router.delete('/:id', authenticateUser, async (req, res, next) => {
  try {
    // Get student with class info
    const student = await db.query.students.findFirst({
      where: eq(students.id, req.params.id),
      with: {
        class: true,
      },
    });

    if (!student) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Student not found',
      });
    }

    // Verify class belongs to user
    if (student.class.teacher_id !== req.user!.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to delete this student',
      });
    }

    const [deleted] = await db.delete(students)
      .where(eq(students.id, req.params.id))
      .returning();

    res.json({
      message: 'Student deleted successfully',
      id: deleted.id,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
