import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import scoresRoutes from './routes/scores.js';

const app = express();
app.use(express.json({ limit: '32kb' }));
app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: false
}));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/auth', authRoutes);
app.use('/scores', scoresRoutes);

app.use((err, _req, res, _next) => {
  console.error('unhandled error', err);
  res.status(500).json({ error: 'server_error' });
});

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`fallin backend listening on ${port}`);
});
