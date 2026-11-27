import { User, Post, Course, Comment, AdminKPIs, AdminReport, AuditLog } from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('universe_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export interface Notification {
  id: number;
  user_id: number;
  actor_id: number | null;
  post_id: number | null;
  comment_id: number | null;
  type: 'COMMENT' | 'REPLY' | 'HELPFUL';
  message: string;
  is_read: number;
  created_at: string;
  actor_name: string | null;
  actor_avatar: string | null;
}




export interface MessageAttachment {
  id: number;
  message_id: number;
  file_name: string;
  file_size: number | null;
  file_type: string | null;
  download_url: string;
}

export interface DirectMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  body: string;
  created_at: string;
  sender_name: string;
  sender_avatar?: string | null;
  edited_at?: string | null;
  deleted_at?: string | null;
  is_read?: number;
  attachments?: MessageAttachment[];
  reply_to_message_id?: number | null;
reply_to_body?: string | null;
reply_to_sender_id?: number | null;
reply_to_sender_name?: string | null;
}


export interface DirectConversation {
  id: number;
  type: 'DIRECT';
  other_user_id: number;
  other_user_name: string;
  other_user_email: string;
  other_student_id: string;
  other_user_department: string;
  other_user_batch: string;
  other_user_avatar?: string | null;
  last_message?: string | null;
  last_message_at?: string | null;
  unread_count: number;
}

export interface MessageStudent {
  id: number;
  name: string;
  email: string;
  student_id: string;
  department: string;
  batch: string;
  avatar_url?: string | null;
}

export interface AdminDepartment {
  id: number;
  code: string;
  name: string;
}

export interface AdminCourse extends Course {
  department_id: number | null;
  department_name: string;
  department_code: string;
  semester: string;
  description: string | null;
  resources_count: number;
}

export interface CoursePayload {
  code: string;
  name: string;
  department_id: number;
  semester: string;
  description: string;
}

export const api = {
    async downloadAttachment(attachment: {
    id?: number;
    name: string;
    url?: string;
  }): Promise<void> {
    if (!attachment.id) {
      throw new Error('This attachment does not have a valid download ID.');
    }

    const token = localStorage.getItem('universe_token');

    if (!token) {
      throw new Error('Please log in to download attachments.');
    }

    const response = await fetch(
      `${API_BASE}/posts/attachments/${attachment.id}/download`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to download attachment.');
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(blobUrl);
  },



  async previewAttachment(attachment: {
    id?: number;
  }): Promise<string> {
    if (!attachment.id) {
      throw new Error('This attachment does not have a valid preview ID.');
    }

    const token = localStorage.getItem('universe_token');

    if (!token) {
      throw new Error('Please log in to preview attachments.');
    }

    const response = await fetch(
      `${API_BASE}/posts/attachments/${attachment.id}/preview`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to preview attachment.');
    }

    const blob = await response.blob();

    const isImage = blob.type.startsWith('image/');
const isPDF = blob.type === 'application/pdf';

if (!isImage && !isPDF) {
  throw new Error('The attachment is not a valid image or PDF.');
}

    return URL.createObjectURL(blob);
  },

  
  // Auth
  async login(
    emailOrStudentId: string,
    password: string
  ): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrStudentId, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async register(payload: {
    name: string;
    email: string;
    studentId: string;
    password: string;
    department?: string;
    batch?: string;
  }): Promise<{ message: string; email: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  async verifyRegistration(
    email: string,
    code: string
  ): Promise<{ token: string; user: User; message: string }> {
    const res = await fetch(`${API_BASE}/auth/verify-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Email verification failed');
    return data;
  },

  async resendVerification(email: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to resend verification code');
    return data;
  },

    // Notifications
  async getNotifications(): Promise<Notification[]> {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch notifications');
    return data.notifications || [];
  },

  async getUnreadNotificationCount(): Promise<number> {
    const res = await fetch(`${API_BASE}/notifications/unread-count`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch unread count');
    return Number(data.count || 0);
  },

  async markNotificationRead(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to mark notification as read');
  },

  async markAllNotificationsRead(): Promise<void> {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to mark all notifications as read');
  },

  async deleteNotification(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/notifications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete notification');
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch current user');
    return data;
  },

  // Posts / Feed
  async getPosts(params?: { course?: string; type?: string; search?: string }): Promise<Post[]> {
    const query = new URLSearchParams();
    if (params?.course) query.set('course', params.course);
    if (params?.type && params.type !== 'all') query.set('type', params.type);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`${API_BASE}/posts?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch posts');
    return data.posts || [];
  },

  async getPostById(id: string | number): Promise<Post> {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch post');
    return data.post;
  },

 
  async createPost(payload: {
    title: string;
    content: string;
    type?: string;
    courseCode?: string;
    tags?: string[];
    files?: File[];
    attachment?: any;
  }): Promise<{ postId: number; attachmentCount?: number }> {
    const formData = new FormData();

    formData.append('title', payload.title);
    formData.append('content', payload.content);
    formData.append('type', payload.type || 'Knowledge');
    if (payload.courseCode) {
  formData.append('courseCode', payload.courseCode);
}
    formData.append('tags', JSON.stringify(payload.tags || []));

    if (payload.attachment) {
      formData.append('attachment', JSON.stringify(payload.attachment));
    }

    (payload.files || []).forEach((file) => {
      formData.append('attachments', file);
    });

    const token = localStorage.getItem('universe_token');

    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers,
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to publish post');
    }

    return data;
  },


  async updatePost(
    postId: number,
    payload: {
      title: string;
      content: string;
      type?: string;
      courseCode?: string;
      tags?: string[];
      files?: File[];
    }
  ): Promise<{ message: string; postId: number; attachmentCount: number }> {
    const formData = new FormData();

    formData.append('title', payload.title);
    formData.append('content', payload.content);
    formData.append('type', payload.type || 'Knowledge');
    formData.append('courseCode', payload.courseCode || '');
    formData.append('tags', JSON.stringify(payload.tags || []));

    (payload.files || []).forEach((file) => {
      formData.append('attachments', file);
    });

    const token = localStorage.getItem('universe_token');

    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/posts/${postId}`, {
      method: 'PUT',
      headers,
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to update post');
    }

    return data;
  },



async deletePost(postId: number): Promise<{ message: string; postId: number }> {
  const res = await fetch(`${API_BASE}/posts/${postId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  const responseText = await res.text();

  let data: any;

  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    throw new Error(
      `Delete API returned non-JSON response (HTTP ${res.status}): ${responseText.slice(0, 200)}`
    );
  }

  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete post');
  }

  return data;
},



  async toggleHelpful(postId: number): Promise<{ hasLiked: boolean; helpfulCount: number }> {
    const res = await fetch(`${API_BASE}/posts/${postId}/helpful`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to toggle like');
    return data;
  },

  async toggleSave(postId: number): Promise<{ isSaved: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/posts/${postId}/save`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to toggle save');
    return data;
  },

  async getSavedResources(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/posts/user/saved`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch saved resources');
    return data.savedItems || [];
  },

  // Comments
  async getComments(postId: number | string): Promise<Comment[]> {
    const res = await fetch(`${API_BASE}/comments/post/${postId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch comments');
    return data.comments || [];
  },

  async addComment(postId: number | string, content: string, parentCommentId?: number): Promise<Comment> {
    const res = await fetch(`${API_BASE}/comments/post/${postId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content, parentCommentId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add comment');
    return data.comment;
  },

  // Courses
  async getCourses(): Promise<Course[]> {
    const res = await fetch(`${API_BASE}/courses`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch courses');
    return data.courses || [];
  },

async getCourseByCode(code: string): Promise<{ course: Course; resources: any[] }> {
  const res = await fetch(`${API_BASE}/courses/${code}`, {
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch course details');
  return data;
},

async getCourseDiscussions(code: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/courses/${code}/discussions`, {
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch discussions');
  return data.discussions || [];
},

async getCourseMembers(code: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/courses/${code}/members`, {
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch members');
  return data.members || [];
},
  async getEnrolledCourses(): Promise<Course[]> {
    const res = await fetch(`${API_BASE}/courses/enrolled`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch enrolled courses');
    return data.courses || [];
  },

  async enrollInCourse(courseId: number): Promise<any> {
    const res = await fetch(`${API_BASE}/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to enroll');
    return data;
  },

  async unenrollFromCourse(courseId: number): Promise<any> {
    const res = await fetch(`${API_BASE}/courses/${courseId}/enroll`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to unenroll');
    return data;
  },
  // User Profile
  async getUserProfile(identifier: string | number): Promise<{ user: User; posts: any[] }> {
    const res = await fetch(`${API_BASE}/users/${identifier}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch user profile');
    return data;
  },

  // Admin Module
  async getAdminStats(): Promise<{ kpis: AdminKPIs; chartData: any[] }> {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch admin stats');
    return data;
  },

  async getAdminReports(): Promise<AdminReport[]> {
    const res = await fetch(`${API_BASE}/admin/reports`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch reports');
    return data.reports || [];
  },

  async resolveReport(reportId: number, status: 'RESOLVED' | 'DISMISSED', action?: 'DELETE_POST'): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/reports/${reportId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, action })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update report');
    return data;
  },

  async getAdminUsers(params?: { search?: string; role?: string }): Promise<User[]> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.role) query.set('role', params.role);

    const res = await fetch(`${API_BASE}/admin/users?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
    return data.users || [];
  },

  async updateUserRole(userId: number, role: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update user role');
    return data;
  },

  async updateUserStatus(userId: number, status: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update user status');
    return data;
  },

    async searchMessageStudents(search: string): Promise<MessageStudent[]> {
    const res = await fetch(
      `${API_BASE}/messages/students?search=${encodeURIComponent(search)}`,
      { headers: getAuthHeaders() }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Student search failed');
    return data.students || [];
  },

  async getConversations(): Promise<DirectConversation[]> {
    const res = await fetch(`${API_BASE}/messages/conversations`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load conversations');
    return data.conversations || [];
  },

  async createConversation(recipientId: number): Promise<number> {
    const res = await fetch(`${API_BASE}/messages/conversations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ recipientId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not start conversation');
    return data.conversation.id;
  },

  async getConversationMessages(conversationId: number): Promise<DirectMessage[]> {
    const res = await fetch(
      `${API_BASE}/messages/conversations/${conversationId}/messages`,
      { headers: getAuthHeaders() }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load messages');
    return data.messages || [];
  },

  async setTypingStatus(conversationId: number, isTyping: boolean): Promise<void> {
  const res = await fetch(
    `${API_BASE}/messages/conversations/${conversationId}/typing`,
    {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ isTyping })
    }
  );

  if (!res.ok) throw new Error('Could not update typing status');
},

async getTypingStatus(conversationId: number): Promise<boolean> {
  const res = await fetch(
    `${API_BASE}/messages/conversations/${conversationId}/typing`,
    { headers: getAuthHeaders() }
  );

  if (!res.ok) return false;

  const data = await res.json();
  return Boolean(data.isTyping);
},


async sendDirectMessage(
  conversationId: number,
  body: string,
  files: File[] = [],
  replyToMessageId?: number | null
): Promise<DirectMessage> {
    const formData = new FormData();

    formData.append('body', body);

    if (replyToMessageId) {
  formData.append('replyToMessageId', String(replyToMessageId));
}

    files.forEach(file => {
      formData.append('attachments', file);
    });

    const token = localStorage.getItem('universe_token');

    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(
      `${API_BASE}/messages/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers,
        body: formData
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Message could not be sent');
    }

    return data.message;
  },

  async deleteDirectMessage(messageId: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/messages/${messageId}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders()
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Could not delete message');
  }
},


  async downloadMessageAttachment(
    attachment: MessageAttachment
  ): Promise<void> {
    const token = localStorage.getItem('universe_token');

    const response = await fetch(
      `${API_BASE}/messages/attachments/${attachment.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Download failed');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = attachment.file_name;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  },

  // ==========================================
  // ADMIN COURSE MANAGEMENT
  // ==========================================

  async getAdminDepartments(): Promise<AdminDepartment[]> {
    const res = await fetch(`${API_BASE}/admin/departments`, {
      headers: getAuthHeaders()
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch departments');
    }

    return data.departments || [];
  },

  async getAdminCourses(): Promise<AdminCourse[]> {
    const res = await fetch(`${API_BASE}/admin/courses`, {
      headers: getAuthHeaders()
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch courses');
    }

    return data.courses || [];
  },

  async createAdminCourse(payload: CoursePayload): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/courses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to create course');
    }

    return data;
  },

  async updateAdminCourse(
    courseId: number,
    payload: CoursePayload
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/courses/${courseId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to update course');
    }

    return data;
  },

  async deleteAdminCourse(courseId: number): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/courses/${courseId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to delete course');
    }

    return data;
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch audit logs');
    return data.logs || [];
  }
};
