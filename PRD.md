# UniverseDIU — Product Requirements Document (PRD)

## 1. Executive Summary
**UniverseDIU** (*"Learn • Share • Grow"*) is a specialized academic resource-sharing, peer discussion, and collaboration platform exclusively for students, faculty, and administrators of **Daffodil International University (DIU)**.

The platform provides a centralized, authenticated ecosystem where DIU students can share course notes, lab tutorials, project repositories, and ask academic questions, while administrators maintain academic integrity and monitor platform activity.

---

## 2. Target Audience & Personas
1. **Regular Student User (DIU Student)**:
   - Needs access to lecture materials, past questions, and lab guides for their department (e.g. Software Engineering, CSE, EEE).
   - Wants to ask course-specific questions (e.g. *"How does JWT authentication work in Express?"*).
   - Wants to earn Knowledge Points and peer recognition for sharing helpful notes and tutorials.
2. **Student Moderator**:
   - Senior student or student representative appointed to review reported content, flag spam, and organize course-specific resources.
3. **Administrator / Faculty**:
   - Monitors platform health, manages courses and departments, views system analytics, moderates inappropriate content, and manages user account statuses.

---

## 3. Core Functional Requirements

### 3.1 Authentication & User Management
- **DIU Student Authentication**: Supports login and registration via student ID / DIU email (`@diu.edu.bd`) and secure password.
- **Role-Based Access Control (RBAC)**:
  - `SUPER_ADMIN`: Full access to settings, user management, audit logs, and system data.
  - `ADMIN`: Access to Admin Dashboard, content moderation, course management, and reporting.
  - `MODERATOR`: Access to moderation queue and flagged reports.
  - `STUDENT` (Regular User): Can browse, post, comment, like, bookmark, and ask questions.
- **Account Actions**: Profile editing, session persistence via JWT, password reset flow, and account deactivation/suspension.

### 3.2 Content & Resource Management
- **Contribution Types**:
  - `Knowledge`: Tutorials, conceptual explanations, study guides.
  - `Resource`: Files, PDF lecture slides, code repositories, cheatsheets.
  - `Question`: Academic inquiries tied to a specific department and course code.
  - `Project`: Showcase of academic or capstone projects with demo/GitHub links.
- **Rich Post Creation**: Title, markdown description, department dropdown, course selector (e.g. `SE-322`), tags (e.g. `#React`, `#Express`), and file attachment metadata.
- **Engagement**:
  - `Helpful` (Like / Upvote): Increments helpful counter and awards knowledge points to author.
  - `Save` (Bookmark): Adds resource to student's personal saved library.
  - `Comments & Threaded Replies`: Allows nested peer discussions and question answers.
  - `Share`: Quick URL copy and attribution.

### 3.3 Course Catalog & Navigation
- **Department & Course Hierarchy**: Courses grouped by Department (e.g. Software Engineering → `SE-322 Web Application Lab`, `SE-213 OOP`, `CSE-311 DBMS`, `MAT-111 Calculus`).
- **Course Landing Page**: Description, instructor details, related topics, and filtered stream of resources, discussions, and enrolled members.

### 3.4 Search & Discovery
- **Full-Text & Tag Filtering**: Real-time keyword filtering across titles, descriptions, authors, and tag arrays.
- **Category Filter Tabs**: `All`, `PDF`, `Video`, `Link`, `Question`, `Notes`.

### 3.5 Administration & Moderation
- **Admin Dashboard**: Real-time metrics for Total Students, Total Resources, Total Discussions, Total Courses, and Reported Content.
- **Analytics Visualization**: Monthly resource upload statistics bar chart.
- **Moderation Queue**: Review, approve, or dismiss flagged items (Spam, Inappropriate Content, Fake Resource, Harassment).
- **User Management**: Search, filter, change roles (`STUDENT`, `MODERATOR`, `ADMIN`), and suspend/activate accounts.
- **Audit Logging**: Immutable audit records for sensitive actions (user role change, content deletion, account suspension).

---

## 4. Non-Functional Requirements
- **Performance**: Sub-100ms API response time for feed and resource listings; instantaneous client-side navigation.
- **Security**:
  - Bcrypt password hashing (10 salt rounds).
  - JWT Bearer token authentication with HTTP-only/secure storage.
  - Input validation on both client and server to prevent XSS and SQL injection.
  - Server-side role and ownership verification on all state-mutating endpoints.
- **Accessibility**: Semantic HTML5, WCAG AA color contrast, visible focus rings, screen-reader friendly aria-labels.
- **Responsiveness**: Pixel-perfect usability across mobile (iPhone viewports), tablet, and desktop screens.
