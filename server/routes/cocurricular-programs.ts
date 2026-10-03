import { Router } from 'express';
import { db } from '../db';
import { cocurricularPrograms, insertCocurricularProgramSchema } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.get('/', authenticateUser, async (req, res, next) => {
  try {
    const programs = await db.query.cocurricularPrograms.findMany({
      where: eq(cocurricularPrograms.teacher_id, req.user!.id),
      orderBy: [desc(cocurricularPrograms.created_at)],
    });
    res.json(programs);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticateUser, async (req, res, next) => {
  try {
    const program = await db.query.cocurricularPrograms.findFirst({
      where: and(eq(cocurricularPrograms.id, req.params.id), eq(cocurricularPrograms.teacher_id, req.user!.id)),
    });
    if (!program) {
      return res.status(404).json({ error: 'Not Found', message: 'Program not found' });
    }
    res.json(program);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertCocurricularProgramSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    if (!parsed.data.judul) {
      return res.status(400).json({ error: 'Bad Request', message: 'judul is required' });
    }
    const [newProgram] = await db.insert(cocurricularPrograms)
      .values({ ...parsed.data, teacher_id: req.user!.id })
      .returning();
    res.status(201).json(newProgram);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertCocurricularProgramSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    const [updated] = await db.update(cocurricularPrograms)
      .set({ ...parsed.data, updated_at: new Date() })
      .where(and(eq(cocurricularPrograms.id, req.params.id), eq(cocurricularPrograms.teacher_id, req.user!.id)))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: 'Not Found', message: 'Program not found' });
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticateUser, async (req, res, next) => {
  try {
    const [deleted] = await db.delete(cocurricularPrograms)
      .where(and(eq(cocurricularPrograms.id, req.params.id), eq(cocurricularPrograms.teacher_id, req.user!.id)))
      .returning();
    if (!deleted) {
      return res.status(404).json({ error: 'Not Found', message: 'Program not found' });
    }
    res.json({ message: 'Program deleted successfully', id: deleted.id });
  } catch (error) {
    next(error);
  }
});

export default router;
