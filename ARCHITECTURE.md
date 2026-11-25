# UniverseDIU — Architecture Specification (ARCHITECTURE.md)

## 1. System Architecture Overview

UniverseDIU is architected as a full-stack, type-safe web application combining a React SPA frontend with a robust Node.js/Express REST API and persistent database.

```
+-------------------------------------------------------------------------+
|                           CLIENT LAYER (REACT)                          |
|  - React 19 + TypeScript + Vite                                         |
|  - Tailwind CSS + Lucide Icons                                          |
|  - React Router (Client routing for all 12 views + Admin routes)        |
|  - AuthContext (JWT token storage, user session, RBAC guards)           |
+------------------------------------+------------------------------------+
                                     | HTTP/REST (JSON + Bearer JWT)
                                     v
+-------------------------------------------------------------------------+
|                        BACKEND API (EXPRESS.JS)                         |
|  - Express REST Controllers & Router                                    |
|  - Auth & RBAC Middleware (verifyToken, requireRole)                    |
|  - Validation Middleware (Request payload sanity checks)                |
|  - Security Middleware (Helmet, CORS, Rate-Limiting, Error Handler)     |
+------------------------------------+------------------------------------+
                                     | SQL Queries & Transactions
                                     v
+-------------------------------------------------------------------------+
|                        PERSISTENCE LAYER (SQLITE)                       |
|  - Persistent SQLite Database (better-sqlite3 / sqlite3 engine)         |
|  - Relational Schema: Users, Roles, Courses, Posts, Comments,           |
|    Likes, Bookmarks, Reports, AuditLogs                                 |
+-------------------------------------------------------------------------+
```

---

## 2. Directory Structure

```
universe-diu/
├── server/
│   ├── db/
│   │   ├── schema.sql         # SQL Table schemas & default seeds
│   │   ├── database.sqlite    # Persistent SQLite database file
│   │   └── index.ts           # SQLite connection & query helper methods
│   ├── middleware/
│   │   ├── auth.ts            # JWT validation & role verification
│   │   ├── errorHandler.ts    # Centralized HTTP error handling
│   │   └── audit.ts           # Audit log recorder for admin actions
│   ├── routes/
│   │   ├── auth.ts            # /api/auth (login, register, me)
│   │   ├── posts.ts           # /api/posts (feed, create, helpful, save)
│   │   ├── comments.ts        # /api/comments (create comment, replies)
│   │   ├── courses.ts         # /api/courses (courses & departments)
│   │   ├── users.ts           # /api/users (user profile & stats)
│   │   └── admin.ts           # /api/admin (KPIs, moderation, user roles, audit)
│   └── server.ts              # Express application bootstrap & API mounting
├── src/
│   ├── types/                 # Shared TypeScript interfaces
│   ├── context/               # AuthContext & UI state
│   ├── services/              # API Client functions (fetch API wrappers)
│   ├── components/            # Reusable components (Navbar, Sidebar, PostCard, etc.)
│   └── pages/                 # Full-page components matching all 12 designs + Admin
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 3. Security & Access Control Model

1. **Authentication**:
   - Passwords hashed using `bcrypt` (10 salt rounds).
   - JWT tokens signed with `JWT_SECRET` containing `{ id, email, role, studentId }`.
   - Client sends token in `Authorization: Bearer <token>` header.
2. **Role-Based Access Control (RBAC)**:
   - Route guards verify user permission on both frontend (`<ProtectedRoute role="...">`) and backend (`requireRole(['ADMIN', 'SUPER_ADMIN'])`).
3. **Audit Logging**:
   - All state-altering administrative actions (e.g. changing a student's role, banning an account, or dismissing a reported post) are logged into the `audit_logs` table with actor ID, IP address, target entity, action, and timestamp.
