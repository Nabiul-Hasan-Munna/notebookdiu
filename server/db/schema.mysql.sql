-- UniverseDIU MySQL Database Schema
-- MySQL 8.0+ | InnoDB | utf8mb4

CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  student_id VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('STUDENT','MODERATOR','ADMIN','SUPER_ADMIN') DEFAULT 'STUDENT',
  department VARCHAR(255) DEFAULT 'Software Engineering',
  batch VARCHAR(50) DEFAULT '43',
  avatar_url TEXT,
  knowledge_points INT DEFAULT 0,
  status ENUM('ACTIVE','SUSPENDED','BANNED') DEFAULT 'ACTIVE',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_student_id (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS departments (
  id INT NOT NULL AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_departments_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS courses (
  id INT NOT NULL AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  department_id INT DEFAULT NULL,
  semester VARCHAR(100) DEFAULT 'Spring 2026',
  instructor_name VARCHAR(255) DEFAULT NULL,
  instructor_title VARCHAR(255) DEFAULT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_courses_code (code),
  CONSTRAINT fk_courses_department
    FOREIGN KEY (department_id) REFERENCES departments(id)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS posts (
  id INT NOT NULL AUTO_INCREMENT,
  author_id INT NOT NULL,
  course_id INT DEFAULT NULL,
  type ENUM('Knowledge','Resource','Question','Project','Link','Media','Discussion') DEFAULT 'Knowledge',
  title VARCHAR(500) NOT NULL,
  content LONGTEXT NOT NULL,
  tags LONGTEXT NOT NULL,
  helpful_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  status ENUM('PUBLISHED','HIDDEN','REMOVED') DEFAULT 'PUBLISHED',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_posts_author (author_id),
  KEY idx_posts_course (course_id),
  KEY idx_posts_status_created (status, created_at),
  CONSTRAINT fk_posts_author
    FOREIGN KEY (author_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_posts_course
    FOREIGN KEY (course_id) REFERENCES courses(id)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS attachments (
  id INT NOT NULL AUTO_INCREMENT,
  post_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size VARCHAR(100) DEFAULT NULL,
  file_type VARCHAR(100) DEFAULT NULL,
  file_url TEXT,
  PRIMARY KEY (id),
  KEY idx_attachments_post (post_id),
  CONSTRAINT fk_attachments_post
    FOREIGN KEY (post_id) REFERENCES posts(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comments (
  id INT NOT NULL AUTO_INCREMENT,
  post_id INT NOT NULL,
  author_id INT NOT NULL,
  parent_comment_id INT DEFAULT NULL,
  content TEXT NOT NULL,
  helpful_count INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_comments_post (post_id),
  KEY idx_comments_author (author_id),
  KEY idx_comments_parent (parent_comment_id),
  CONSTRAINT fk_comments_post
    FOREIGN KEY (post_id) REFERENCES posts(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_comments_author
    FOREIGN KEY (author_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_comments_parent
    FOREIGN KEY (parent_comment_id) REFERENCES comments(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS post_likes (
  user_id INT NOT NULL,
  post_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, post_id),
  KEY idx_post_likes_post (post_id),
  CONSTRAINT fk_post_likes_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_post_likes_post
    FOREIGN KEY (post_id) REFERENCES posts(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS saved_posts (
  user_id INT NOT NULL,
  post_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, post_id),
  KEY idx_saved_posts_post (post_id),
  CONSTRAINT fk_saved_posts_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_saved_posts_post
    FOREIGN KEY (post_id) REFERENCES posts(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reports (
  id INT NOT NULL AUTO_INCREMENT,
  post_id INT NOT NULL,
  reporter_id INT NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('PENDING','RESOLVED','DISMISSED') DEFAULT 'PENDING',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_reports_post (post_id),
  KEY idx_reports_reporter (reporter_id),
  KEY idx_reports_status (status),
  CONSTRAINT fk_reports_post
    FOREIGN KEY (post_id) REFERENCES posts(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_reports_reporter
    FOREIGN KEY (reporter_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id INT NOT NULL AUTO_INCREMENT,
  actor_id INT NOT NULL,
  action VARCHAR(255) NOT NULL,
  target_type VARCHAR(100) NOT NULL,
  target_id INT NOT NULL,
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_actor (actor_id),
  KEY idx_audit_created (created_at),
  CONSTRAINT fk_audit_actor
    FOREIGN KEY (actor_id) REFERENCES users(id)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    actor_id INT DEFAULT NULL,
    post_id INT DEFAULT NULL,
    comment_id INT DEFAULT NULL,
    type ENUM('COMMENT', 'REPLY', 'HELPFUL') NOT NULL,
    message VARCHAR(500) NOT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY idx_notifications_user (user_id, is_read, created_at),
    KEY idx_notifications_actor (actor_id),
    KEY idx_notifications_post (post_id),
    KEY idx_notifications_comment (comment_id),

    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notifications_actor
        FOREIGN KEY (actor_id) REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_notifications_post
        FOREIGN KEY (post_id) REFERENCES posts(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_notifications_comment
        FOREIGN KEY (comment_id) REFERENCES comments(id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;