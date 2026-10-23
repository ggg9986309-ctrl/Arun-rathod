'use strict';
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const ROOT = __dirname;
const DATA_FILE = path.join(ROOT, 'data.json');
const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || '';
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(express.json({ limit: '30kb' }));
app.use('/api/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many attempts. Please wait 15 minutes.' } }));

function getAdmins() {
  return [1, 2].map(n => ({ username: process.env[`ADMIN${n}_USERNAME`], password: process.env[`ADMIN${n}_PASSWORD`] }))
    .filter(a => a.username && a.password);
}
function readData() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return { name: 'Arun Rathod', headline: 'Walking with confidence.', bio: '', location: '', education: '', instagram: 'https://www.instagram.com/arunofficial.07/', tagline: '' }; }
}
function writeData(data) { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + '\n', 'utf8'); }
function requireAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token || !JWT_SECRET) return res.status(401).json({ error: 'Please sign in again.' });
  try { req.admin = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: 'Session expired. Please sign in again.' }); }
}
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'Arun Rathod Portfolio' }));
app.get('/api/content', (_req, res) => res.set('Cache-Control', 'no-store').json(readData()));
app.post('/api/login', async (req, res) => {
  if (!JWT_SECRET || JWT_SECRET.length < 32) return res.status(503).json({ error: 'Admin is not configured. Add a JWT_SECRET of at least 32 characters in hosting environment variables.' });
  const { username = '', password = '' } = req.body || {};
  const admins = getAdmins();
  if (!admins.length) return res.status(503).json({ error: 'Set ADMIN1_USERNAME/PASSWORD and ADMIN2_USERNAME/PASSWORD in hosting environment variables.' });
  let matched = null;
  for (const admin of admins) {
    const sameUser = String(username) === admin.username;
    // bcrypt compare also keeps the password check asynchronous; env passwords are never returned.
    const samePass = sameUser && String(password).length <= 256 && await bcrypt.compare(String(password), await bcrypt.hash(admin.password, 10));
    if (sameUser && samePass) matched = admin;
  }
  if (!matched) return res.status(401).json({ error: 'Username or password is incorrect.' });
  const token = jwt.sign({ sub: matched.username }, JWT_SECRET, { expiresIn: '6h' });
  res.json({ token, username: matched.username, expiresIn: 21600 });
});
app.put('/api/content', requireAuth, (req, res) => {
  const allowed = ['name', 'eyebrow', 'headline', 'bio', 'location', 'education', 'instagram', 'tagline'];
  const current = readData();
  for (const key of allowed) {
    if (typeof req.body?.[key] === 'string') current[key] = req.body[key].trim().slice(0, key === 'bio' ? 1200 : 240);
  }
  if (!/^https:\/\/www\.instagram\.com\//i.test(current.instagram)) return res.status(400).json({ error: 'Instagram link must be an https://www.instagram.com/ link.' });
  current.updatedAt = new Date().toISOString();
  try { writeData(current); res.set('Cache-Control', 'no-store').json({ ok: true, content: current }); }
  catch { res.status(500).json({ error: 'Could not save changes. Check that the hosting disk is writable and persistent.' }); }
});
app.use(express.static(ROOT, { index: 'index.html', etag: true, maxAge: '1h', setHeaders(res, filePath) { if (filePath.endsWith('data.json')) res.setHeader('Cache-Control', 'no-store'); } }));
app.get('*', (req, res) => res.sendFile(path.join(ROOT, 'index.html')));
app.listen(PORT, () => {
  console.log(`Arun Rathod website running on port ${PORT}`);
  if (!JWT_SECRET || JWT_SECRET.length < 32) console.warn('ADMIN WARNING: set JWT_SECRET (32+ characters) in environment variables.');
  if (getAdmins().length < 2) console.warn('ADMIN WARNING: configure both admin accounts using ADMIN1_* and ADMIN2_* variables.');
});
