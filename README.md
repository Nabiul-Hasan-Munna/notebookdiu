# UniverseDIU — Academic Resource Sharing & Community Platform

A full-stack, university-exclusive web application built for **Daffodil International University (DIU)** students, faculty, and administrators. Built with React 19, TypeScript, Vite, Tailwind CSS, Express.js REST API, and persistent SQLite database.

---

## 🌟 What Was Built (All 12 Screens & Full-Stack System)

### 1. User & Student Views
- **Screen 1: Landing & Login Page** (`/login`)
  - Cosmic night campus backdrop with illuminated Daffodil International University Ashulia campus.
  - Planet Orbit brand logo & *"Your Knowledge Our Universe"* typography.
  - Student login form with `@diu.edu.bd` validation, password visibility toggle, and registration flow.
- **Screen 2: Home Feed** (`/feed`)
  - Dark navy top navigation bar with live search (`⌘K`) and notifications.
  - Left navigation sidebar + active courses list (`SE-322`, `SE-213`, `CSE-311`, `MAT-111`).
  - Contribution quick-composer (*Knowledge, Resource, Question, Project*).
  - Main resource cards with helpful upvoting, bookmarking, and PDF download attachments.
- **Screen 3: Post Composer** (`/compose`)
  - 6 contribution type selector pills (*Knowledge, Resource, Question, Project, Link, Media*).
  - Rich text formatting toolbar (Bold, Italic, Code, Bullet/Numbered lists, Link).
  - Department and Course dropdown selectors.
  - Interactive tag chip builder (`#React`, `#Express`, `#MySQL`, `#CRUD`).
- **Screen 4: Post Detail View** (`/post/:id`)
  - Author meta (Sara Tasnim, Batch 43).
  - Dark visual tech banner card (*React + Express + MySQL CRUD Tutorial*).
  - PDF attachment download widget (`React_CRUD_Tutorial.pdf 2.4 MB`).
  - Live threaded comments and real-time reply submission.
- **Screen 5: Search & Explore** (`/explore`)
  - Instant keyword filtering across titles, contents, and tags.
  - Media type filter pills (*All, PDF, Video, Link, Question, Notes*).
  - Filtered results list with semantic type badges.
- **Screen 6: Course Page** (`/courses/:code`)
  - Breadcrumb navigation (`Courses > SE-322`).
  - Terminal code badge `< / >` and course overview.
  - Tabs: *Overview, Resources, Discussions, Members*.
  - Course instructor profile (*Dr. Sheikh Mohammad, Associate Professor*).
- **Screen 7: Student Profile** (`/profile/:id`)
  - DIU campus cover banner and student avatar (*Nabiul Hasan Munna, SWE Batch 43*).
  - Knowledge Points badge (⭐ *1,245 points*).
  - Stat counters: *38 Posts | 27 Resources | 64 Answers | 154 Helpful*.
  - Activity tabs: *Posts, Resources, Saved, Answers*.
- **Screen 8: Saved Resources** (`/saved`)
  - Bookmarked notes and tutorials manager.
  - Filter pills (*All, PDF, Video, Link, Notes*).
  - Direct download/open buttons and remove bookmark action.
- **Screen 9: Ask a Question** (`/ask`)
  - Q&A form (*"How does JWT authentication actually work in Express?"*).
  - Monospace code details textarea, department & course tags.
- **Screen 10: Discussions & Comments** (`/discussions`)
  - Threaded comment hierarchy with author-tagged replies (*Rafiul Islam - Author*).
  - Nested peer responses and reply input bar.
- **Screen 12: Dual Responsive Mobile Viewports** (`/mobile`)
  - Side-by-side iPhone 15 frame simulator rendering the mobile feed experience and student profile with sticky top bars and custom 5-tab bottom navigation bars.

### 2. Dedicated Administrative Suite (`/admin`)
- **Screen 11: Admin Dashboard** (`/admin`)
  - 5 real-time KPI metrics: *Total Students (8,421+)*, *Total Resources (14,392+)*, *Total Discussions (28,421+)*, *Total Courses (184+)*, *Reported Content (32)*.
  - **Chart.js** resource upload statistics monthly bar graph.
  - Quick moderation queue review list.
- **User Management** (`/admin/users`)
  - Student & faculty directory with real-time search and role filtering.
  - Role management: promote/demote between `STUDENT`, `MODERATOR`, `ADMIN`, `SUPER_ADMIN`.
  - Account suspension and activation toggle.
- **Content Moderation** (`/admin/moderation`)
  - Flagged reports review queue (*Spam, Inappropriate content, Fake resource, Harassment*).
  - Actions: *Dismiss Flag*, *Keep Post & Resolve*, or *Delete Reported Post*.
- **Security Audit Logs** (`/admin/audit`)
  - Immutable server-recorded audit trail of administrative role changes, account suspensions, and content moderation.

---

## 🚀 How to Run the Project

### Prerequisites
- Node.js (v18+ or v22+)
- NPM

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed the Database
```bash
npm run seed
```
*Seeds DIU departments, courses (`SE-322`, `SE-213`, `CSE-311`, `MAT-111`), default student accounts (`student@diu.edu.bd`), and admin accounts (`admin@diu.edu.bd`).*

### 3. Run Automated Tests
```bash
npm test
```
*Runs the 11 integration test assertions covering authentication, feed retrieval, comment replies, like toggling, and role-based access control (RBAC).*

### 4. Start the Application
- **Unified Full-Stack Production Mode**:
  ```bash
  npm start
  ```
  *Serves both the Express REST API and the React frontend on `http://localhost:5000`.*

- **Development Mode**:
  - Terminal 1 (API Server): `npm run dev:server` (Port `5000`)
  - Terminal 2 (Vite Frontend): `npm run dev` (Port `3000`)

---

## 🔐 Demo Credentials

| Role | Email / Student ID | Password | Access Level |
|---|---|---|---|
| **Student** | `student@diu.edu.bd` or `201-15-14231` | `password123` | Full student feed, Q&A, bookmarks, profile |
| **Faculty Admin** | `admin@diu.edu.bd` or `FAC-SWE-01` | `admin123` | Student access + `/admin` Dashboard, Users & Moderation |
| **Super Admin** | `superadmin@diu.edu.bd` | `super123` | Unrestricted access + Role management |

---

## ⌨️ Quick-Switch Keyboard Shortcuts

While using the application, you can press these keys at any time to jump directly to any screen:
- `1` → 1. Landing / Login Page (`/login`)
- `2` → 2. Home Feed (`/feed`)
- `3` → 3. Post Composer (`/compose`)
- `4` → 4. Post Detail View (`/post/1`)
- `5` → 5. Search / Explore (`/explore`)
- `6` → 6. Course Page (`/courses/SE-322`)
- `7` → 7. Student Profile (`/profile/me`)
- `8` → 8. Saved Resources (`/saved`)
- `9` → 9. Ask a Question (`/ask`)
- `0` → 10. Discussions (`/discussions`)
- `-` → 11. Admin Dashboard (`/admin`)
- `=` → 12. Mobile Views (`/mobile`)

## MySQL 8 setup (SQLite migration)

The backend now uses MySQL 8 through an asynchronous `mysql2` connection pool. It no longer initializes or seeds SQLite when the server starts.

1. Create a MySQL database named `universediu` (or choose another name and use it in `.env`).
2. Copy `.env.example` to `.env` and enter your local MySQL credentials and a private JWT secret.
3. Keep `server/db/database.sqlite` unchanged as the migration source and backup.
4. Run `npm run migrate:mysql` once. This creates the MySQL tables and copies the existing SQLite rows in dependency order while preserving explicit IDs. It stops if the target already contains users.
5. Run `npm run dev:server` and verify `http://127.0.0.1:5000/api/health` reports `database: mysql`.
6. In another terminal, run `npm run dev` for the React frontend.

Do not run the old SQLite seed script. `npm run seed` is intentionally disabled to prevent replacing real data with demo records.
