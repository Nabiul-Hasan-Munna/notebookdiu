import mysql from 'mysql2/promise';

const required = ['DB_HOST','DB_USER','DB_NAME'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) console.warn(`[DB] Missing environment values: ${missing.join(', ')}`);

export const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'universediu',
  waitForConnections: true, connectionLimit: Number(process.env.DB_POOL_SIZE || 10),
  queueLimit: 0, charset: 'utf8mb4', timezone: 'local',
  decimalNumbers: true,
});

export const query = {
  async all(sql, ...params) { const [rows] = await pool.execute(sql, params); return rows; },
  async get(sql, ...params) { const [rows] = await pool.execute(sql, params); return rows[0]; },
  async run(sql, ...params) { const [result] = await pool.execute(sql, params); return { ...result, lastInsertRowid: result.insertId }; },
  async exec(sql) { const [result] = await pool.query(sql); return result; },
};

export async function initDatabase() {
  await pool.query("SELECT 1");


  await pool.query(`
    CREATE TABLE IF NOT EXISTS pending_registrations (
      id INT NOT NULL AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      student_id VARCHAR(100) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      department VARCHAR(255) DEFAULT 'Software Engineering',
      batch VARCHAR(50) DEFAULT '43',
      avatar_url TEXT,
      code_hash CHAR(64) NOT NULL,
      expires_at DATETIME NOT NULL,
      attempts INT NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_pending_email (email),
      UNIQUE KEY uq_pending_student_id (student_id),
      KEY idx_pending_expiry (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);


  await pool.query(`
    CREATE TABLE IF NOT EXISTS course_enrollments (
      id INT NOT NULL AUTO_INCREMENT,
      user_id INT NOT NULL,
      course_id INT NOT NULL,
      enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,

      PRIMARY KEY (id),

      UNIQUE KEY uq_course_enrollment (user_id, course_id),

      KEY idx_enrollments_course (course_id),

      CONSTRAINT fk_enrollment_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

      CONSTRAINT fk_enrollment_course
        FOREIGN KEY (course_id) REFERENCES courses(id)
        ON DELETE CASCADE

    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  console.log("[DB] Connected to MySQL successfully.");
  console.log("[DB] Course enrollments table ready.");
}
export async function closeDatabase() { await pool.end(); }
export default pool;

export const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
