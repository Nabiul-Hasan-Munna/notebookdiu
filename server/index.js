import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';
import { initDatabase } from './db/index.js';
import { closeDatabase } from './db/index.js';
import notificationsRoutes from "./routes/notifications.js";
import messagesRoutes from './routes/messages.js';

import authRoutes from './routes/auth.js';
import postsRoutes from './routes/posts.js';
import commentsRoutes from './routes/comments.js';
import coursesRoutes from './routes/courses.js';
import usersRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/assets', express.static(join(__dirname, '../assets')));
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'UniverseDIU API', database: 'mysql', timestamp: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use('/api/messages', messagesRoutes);
const distPath = join(__dirname, '../dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => { if (req.path.startsWith('/api')) return next(); res.sendFile(join(distPath, 'index.html')); });
}
app.use((err, req, res, next) => {
  console.error('[UNHANDLED ERROR]', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});
const isDirectRun = process.argv[1] && !process.argv[1].includes('test') && (process.argv[1].endsWith('index.js') || process.argv[1].endsWith('index'));
if (isDirectRun) {
  initDatabase().then(() => {
    const server = app.listen(PORT, '0.0.0.0', () => console.log(`\nUniverseDIU MySQL API running at http://127.0.0.1:${PORT}\nHealth: http://127.0.0.1:${PORT}/api/health\n`));
    const shutdown = async () => { server.close(); await closeDatabase(); process.exit(0); };
    process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown);
  }).catch((err) => { console.error('[DB] MySQL startup failed:', err.message); process.exit(1); });
}
export default app;

