import { DatabaseSync } from 'node:sqlite';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import mysql from 'mysql2/promise';

const here = dirname(fileURLToPath(import.meta.url));
const sqlitePath = resolve(process.env.SQLITE_SOURCE || join(here, 'database.sqlite'));
if (!existsSync(sqlitePath)) throw new Error(`SQLite source not found: ${sqlitePath}`);
const required = ['DB_HOST','DB_USER','DB_NAME'];
const missing = required.filter(k => !process.env[k]);
if (missing.length) throw new Error(`Missing .env values: ${missing.join(', ')}`);

const sqlite = new DatabaseSync(sqlitePath, { readOnly: true });
const mysqlConn = await mysql.createConnection({
  host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER, password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME, multipleStatements: false,
});
const order = ['users','departments','courses','posts','attachments','comments','post_likes','saved_posts','reports','audit_logs'];
try {
  const schema = readFileSync(join(here, 'schema.mysql.sql'), 'utf8').replace(/^\uFEFF/, '');
  for (const statement of schema.split(';').map(s => s.trim()).filter(Boolean)) {
    const clean = statement.split('\n').filter(line => !line.trim().startsWith('--')).join('\n').trim();
    if (clean) await mysqlConn.query(clean);
  }
  const marks = order.map(() => '?').join(',');
  const [[existing]] = await mysqlConn.execute(`SELECT COUNT(*) AS total FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN (${marks})`, order);
  if (Number(existing.total) !== order.length) throw new Error('Not all target tables were created. Check schema.mysql.sql.');
  const [[targetCount]] = await mysqlConn.query('SELECT COUNT(*) AS total FROM users');
  if (Number(targetCount.total) > 0 && process.env.MYSQL_OVERWRITE !== '1') {
    throw new Error('Target MySQL database already contains users. Migration stopped to avoid overwriting data. Back up/empty the target DB or set MYSQL_OVERWRITE=1 only if you intend to replace existing rows.');
  }
  await mysqlConn.query('SET FOREIGN_KEY_CHECKS = 0');
  await mysqlConn.beginTransaction();
  for (const table of [...order].reverse()) await mysqlConn.query(`DELETE FROM \`${table}\``);
  for (const table of order) {
    const rows = sqlite.prepare(`SELECT * FROM \`${table}\``).all();
    if (!rows.length) { console.log(`${table}: 0 rows`); continue; }
    const columns = Object.keys(rows[0]);
    const colSql = columns.map(c => `\`${c}\``).join(',');
    const valuesSql = `(${columns.map(() => '?').join(',')})`;
    for (const row of rows) await mysqlConn.execute(`INSERT INTO \`${table}\` (${colSql}) VALUES ${valuesSql}`, columns.map(c => row[c]));
    console.log(`${table}: migrated ${rows.length} rows`);
    const maxId = rows.reduce((m, r) => Math.max(m, Number(r.id || 0)), 0);
    if (columns.includes('id') && maxId) await mysqlConn.query(`ALTER TABLE \`${table}\` AUTO_INCREMENT = ${maxId + 1}`);
  }
  await mysqlConn.commit();
  await mysqlConn.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('Migration complete. Original primary keys were preserved.');
} catch (err) {
  try { await mysqlConn.rollback(); } catch {}
  try { await mysqlConn.query('SET FOREIGN_KEY_CHECKS = 1'); } catch {}
  throw err;
} finally { sqlite.close(); await mysqlConn.end(); }
