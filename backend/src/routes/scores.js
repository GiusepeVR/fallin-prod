import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', requireAuth, async (req, res) => {
  const { points, level, timeMs } = req.body || {};
  if (!Number.isFinite(points) || !Number.isFinite(level) || !Number.isFinite(timeMs)) {
    return res.status(400).json({ error: 'invalid_body' });
  }
  if (points < 0 || level < 1 || timeMs < 0) {
    return res.status(400).json({ error: 'invalid_range' });
  }
  const score = await prisma.score.create({
    data: {
      userId: req.userId,
      points: Math.floor(points),
      level: Math.floor(level),
      timeMs: Math.floor(timeMs)
    }
  });
  res.json({ id: score.id });
});

router.get('/global', async (_req, res) => {
  const rows = await prisma.score.findMany({
    orderBy: { points: 'desc' },
    take: 20,
    include: { user: { select: { username: true } } }
  });
  res.json(
    rows.map((r, i) => ({
      rank: i + 1,
      username: r.user.username,
      points: r.points,
      level: r.level,
      timeMs: r.timeMs,
      createdAt: r.createdAt
    }))
  );
});

export default router;
