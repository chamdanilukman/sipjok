import { Router } from 'express';
import { db } from '../db';
import { examQuestions, insertExamQuestionSchema } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.get('/', authenticateUser, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || undefined;
    const offset = parseInt(req.query.offset as string) || undefined;
    const questions = await db.query.examQuestions.findMany({
      where: eq(examQuestions.teacher_id, req.user!.id),
      orderBy: [desc(examQuestions.created_at)],
      limit,
      offset,
    });
    res.json(questions);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticateUser, async (req, res, next) => {
  try {
    const question = await db.query.examQuestions.findFirst({
      where: and(eq(examQuestions.id, req.params.id), eq(examQuestions.teacher_id, req.user!.id)),
    });
    if (!question) {
      return res.status(404).json({ error: 'Not Found', message: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertExamQuestionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    const { question_text, question_type, options, correct_answer, difficulty, topic } = parsed.data;
    if (!question_text || !question_type) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing required fields' });
    }

    const [newQuestion] = await db.insert(examQuestions)
      .values({ teacher_id: req.user!.id, question_text, question_type, options, correct_answer, difficulty, topic })
      .returning();
    res.status(201).json(newQuestion);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticateUser, async (req, res, next) => {
  try {
    const parsed = insertExamQuestionSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.flatten() });
    }
    const { question_text, question_type, options, correct_answer, difficulty, topic } = parsed.data;
    const [updated] = await db.update(examQuestions)
      .set({ question_text, question_type, options, correct_answer, difficulty, topic, updated_at: new Date() })
      .where(and(eq(examQuestions.id, req.params.id), eq(examQuestions.teacher_id, req.user!.id)))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: 'Not Found', message: 'Question not found' });
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticateUser, async (req, res, next) => {
  try {
    const [deleted] = await db.delete(examQuestions)
      .where(and(eq(examQuestions.id, req.params.id), eq(examQuestions.teacher_id, req.user!.id)))
      .returning();
    if (!deleted) {
      return res.status(404).json({ error: 'Not Found', message: 'Question not found' });
    }
    res.json({ message: 'Question deleted successfully', id: deleted.id });
  } catch (error) {
    next(error);
  }
});

export default router;
