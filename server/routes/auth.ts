import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.get('/me', authenticateUser, async (req, res) => {
  res.json({
    id: req.user!.id,
    email: req.user!.email || null,
  });
});

export default router;
