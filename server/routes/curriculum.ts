import { Router } from 'express';
import { db } from '../db';
import { curriculumDocuments, insertCurriculumDocumentSchema } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.get('/', authenticateUser, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || undefined;
    const offset = parseInt(req.query.offset as string) || undefined;
    const documents = await db.query.curriculumDocuments.findMany({
      where: eq(curriculumDocuments.user_id, req.user!.id),
      orderBy: [desc(curriculumDocuments.created_at)],
      limit,
      offset,
    });
    res.json(documents);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticateUser, async (req, res, next) => {
  try {
    const document = await db.query.curriculumDocuments.findFirst({
      where: and(eq(curriculumDocuments.id, req.params.id), eq(curriculumDocuments.user_id, req.user!.id)),
    });
    if (!document) {
      return res.status(404).json({ error: 'Not Found', message: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertCurriculumDocumentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    const { title, document_type, file_url, description } = parsed.data;
    if (!title || !document_type) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing required fields' });
    }

    const [newDocument] = await db.insert(curriculumDocuments)
      .values({ user_id: req.user!.id, title, document_type, file_url, description })
      .returning();
    res.status(201).json(newDocument);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertCurriculumDocumentSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    const { title, document_type, file_url, description } = parsed.data;
    const [updated] = await db.update(curriculumDocuments)
      .set({ title, document_type, file_url, description, updated_at: new Date() })
      .where(and(eq(curriculumDocuments.id, req.params.id), eq(curriculumDocuments.user_id, req.user!.id)))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: 'Not Found', message: 'Document not found' });
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticateUser, async (req, res, next) => {
  try {
    const [deleted] = await db.delete(curriculumDocuments)
      .where(and(eq(curriculumDocuments.id, req.params.id), eq(curriculumDocuments.user_id, req.user!.id)))
      .returning();
    if (!deleted) {
      return res.status(404).json({ error: 'Not Found', message: 'Document not found' });
    }
    res.json({ message: 'Document deleted successfully', id: deleted.id });
  } catch (error) {
    next(error);
  }
});

export default router;
