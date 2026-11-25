# UniverseDIU — REST API Documentation (API.md)

Base URL: `http://localhost:5000/api`

## 1. Authentication Endpoints

### `POST /auth/register`
- **Body**: `{ name, email, studentId, password, department, batch }`
- **Response `201`**: `{ token, user: { id, name, email, role, studentId, department, batch, knowledgePoints } }`

### `POST /auth/login`
- **Body**: `{ emailOrStudentId, password }`
- **Response `200`**: `{ token, user: { id, name, email, role, ... } }`
- **Response `401`**: `{ error: "Invalid student credentials or password" }`

### `GET /auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response `200`**: `{ user: { id, name, email, role, ... } }`

---

## 2. Feed & Posts Endpoints

### `GET /posts`
- **Query**: `?course=SE-322&type=Resource&search=React&limit=20`
- **Response `200`**: `[ { id, title, content, type, tags, author, attachment, helpfulCount, commentsCount, hasLiked, isSaved, createdAt } ]`

### `POST /posts`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ title, content, type, courseCode, tags, attachment?: { name, size, type, url } }`
- **Response `201`**: `{ post }`

### `POST /posts/:id/helpful`
- **Headers**: `Authorization: Bearer <token>`
- **Response `200`**: `{ hasLiked: boolean, helpfulCount: number }`

### `POST /posts/:id/save`
- **Headers**: `Authorization: Bearer <token>`
- **Response `200`**: `{ isSaved: boolean }`

---

## 3. Comments & Discussions

### `GET /posts/:id/comments`
- **Response `200`**: `[ { id, author, content, createdAt, replies: [ ... ] } ]`

### `POST /posts/:id/comments`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ content, parentCommentId?: number }`
- **Response `201`**: `{ comment }`

---

## 4. Courses & Departments

### `GET /courses`
- **Response `200`**: `[ { id, code, name, department, semester, description, instructor } ]`

### `GET /courses/:code`
- **Response `200`**: `{ course: { ... }, resources: [ ... ], discussions: [ ... ] }`

---

## 5. Admin & Moderation Endpoints (Requires `role: ADMIN` or `SUPER_ADMIN`)

### `GET /admin/stats`
- **Headers**: `Authorization: Bearer <token>`
- **Response `200`**:
  ```json
  {
    "totalStudents": 8421,
    "totalResources": 14392,
    "totalDiscussions": 28421,
    "totalCourses": 184,
    "reportedContent": 32,
    "resourceUploadsChart": [
      { "month": "Jan", "uploads": 180 },
      { "month": "Feb", "uploads": 240 },
      { "month": "Mar", "uploads": 210 },
      { "month": "Apr", "uploads": 390 },
      { "month": "May", "uploads": 480 },
      { "month": "Jun", "uploads": 320 }
    ]
  }
  ```

### `GET /admin/reports`
- **Headers**: `Authorization: Bearer <token>`
- **Response `200`**: `[ { id, reason, postTitle, reportedBy, status, createdAt } ]`

### `PATCH /admin/reports/:id`
- **Body**: `{ status: "RESOLVED" | "DISMISSED" }`
- **Response `200`**: `{ success: true }`

### `GET /admin/users`
- **Query**: `?search=munna&role=STUDENT`
- **Response `200`**: `[ { id, name, email, studentId, role, status, knowledgePoints } ]`

### `PATCH /admin/users/:id/role`
- **Body**: `{ role: "STUDENT" | "MODERATOR" | "ADMIN" }`
- **Response `200`**: `{ success: true, user }`

### `GET /admin/audit-logs`
- **Response `200`**: `[ { id, actorName, action, targetType, targetId, details, createdAt } ]`
