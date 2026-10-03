import { Router } from 'express';
import { db } from '../db';
import { cocurricularModules, insertCocurricularModuleSchema } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.get('/', authenticateUser, async (req, res, next) => {
  try {
    const modules = await db.query.cocurricularModules.findMany({
      where: eq(cocurricularModules.teacher_id, req.user!.id),
      with: { program: true },
      orderBy: [desc(cocurricularModules.created_at)],
    });
    res.json(modules);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticateUser, async (req, res, next) => {
  try {
    const module = await db.query.cocurricularModules.findFirst({
      where: and(eq(cocurricularModules.id, req.params.id), eq(cocurricularModules.teacher_id, req.user!.id)),
      with: { program: true },
    });
    if (!module) {
      return res.status(404).json({ error: 'Not Found', message: 'Module not found' });
    }
    res.json(module);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertCocurricularModuleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    if (!parsed.data.judul) {
      return res.status(400).json({ error: 'Bad Request', message: 'judul is required' });
    }
    const [newModule] = await db.insert(cocurricularModules)
      .values({ ...parsed.data, teacher_id: req.user!.id })
      .returning();
    res.status(201).json(newModule);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertCocurricularModuleSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    const [updated] = await db.update(cocurricularModules)
      .set({ ...parsed.data, updated_at: new Date() })
      .where(and(eq(cocurricularModules.id, req.params.id), eq(cocurricularModules.teacher_id, req.user!.id)))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: 'Not Found', message: 'Module not found' });
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticateUser, async (req, res, next) => {
  try {
    const [deleted] = await db.delete(cocurricularModules)
      .where(and(eq(cocurricularModules.id, req.params.id), eq(cocurricularModules.teacher_id, req.user!.id)))
      .returning();
    if (!deleted) {
      return res.status(404).json({ error: 'Not Found', message: 'Module not found' });
    }
    res.json({ message: 'Module deleted successfully', id: deleted.id });
  } catch (error) {
    next(error);
  }
});

export default router;
