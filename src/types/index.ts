export type UserRole = 'STUDENT' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';

export interface UserStats {
  posts: number;
  resources: number;
  answers: number;
  helpful: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  studentId: string;
  student_id?: string;
  role: UserRole;
  department: string;
  batch: string;
  avatar_url?: string;
  knowledge_points: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  stats?: UserStats;
  created_at?: string;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  department_name?: string;
  department_code?: string;
  semester?: string;
  instructor_name?: string;
  instructor_title?: string;
  description?: string;
  resources_count?: number;
  department_id?: number | null;
}

export interface Attachment {
  id?: number;
  name: string;
  size: string;
  type: string;
  url?: string;
}

export interface Post {
  id: number;
  type: 'Knowledge' | 'Resource' | 'Question' | 'Project' | 'Link' | 'Media';
  title: string;
  content: string;
  tags: string[];
  helpfulCount: number;
  commentsCount: number;
  hasLiked: boolean;
  isSaved: boolean;
  createdAt: string;
  author: {
    id: number;
    name: string;
    meta: string;
    avatar?: string;
  };
  course?: {
    code: string;
    name: string;
  } | null;
   attachment?: Attachment | null;
  attachments?: Attachment[];
}

export interface Comment {
  id: number;
  content: string;
  helpfulCount: number;
  createdAt: string;
  author: {
    id: number;
    name: string;
    meta: string;
    avatar?: string;
    role?: UserRole;
    isAuthor?: boolean;
  };
  replies?: Comment[];
}

export interface AdminKPIs {
  totalStudents: number;
  totalResources: number;
  totalDiscussions: number;
  totalCourses: number;
  reportedContent: number;
}

export interface AdminReport {
  id: number;
  post_id: number;
  post_title: string;
  post_content: string;
  reason: string;
  reporter_name: string;
  reporter_email: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  created_at: string;
}

export interface AuditLog {
  id: number;
  action: string;
  target_type: string;
  target_id: number;
  details: string;
  actor_name: string;
  actor_email: string;
  actor_role: string;
  created_at: string;
}
