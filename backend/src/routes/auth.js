import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

const router = Router();
const TOKEN_TTL = '30d';

function signToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_TTL }
  );
}

function validateCredentials(body) {
  const username = typeof body?.username === 'string' ? body.username.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  if (username.length < 3 || username.length > 30) return { error: 'invalid_username' };
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) return { error: 'invalid_username' };
  if (password.length < 6 || password.length > 200) return { error: 'invalid_password' };
  return { username, password };
}

router.post('/register', async (req, res) => {
  const v = validateCredentials(req.body);
  if (v.error) return res.status(400).json({ error: v.error });
  try {
    const passwordHash = await bcrypt.hash(v.password, 10);
    const user = await prisma.user.create({
      data: { username: v.username, passwordHash }
    });
    const token = signToken(user);
    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (e) {
    if (e?.code === 'P2002') return res.status(409).json({ error: 'username_taken' });
    console.error('register failed', e);
    res.status(500).json({ error: 'server_error' });
  }
});

router.post('/login', async (req, res) => {
  const v = validateCredentials(req.body);
  if (v.error) return res.status(400).json({ error: v.error });
  const user = await prisma.user.findUnique({ where: { username: v.username } });
  if (!user) return res.status(401).json({ error: 'invalid_credentials' });
  const ok = await bcrypt.compare(v.password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid_credentials' });
  const token = signToken(user);
  res.json({ token, user: { id: user.id, username: user.username } });
});

export default router;
