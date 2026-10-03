import { Router } from 'express';

const router = Router();

/**
 * GET /api/health
 * Public health check endpoint (no auth) — used by Railway checks and uptime monitoring.
 */
router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

export default router;
