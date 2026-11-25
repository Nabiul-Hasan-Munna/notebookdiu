import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import { NotificationsPage } from './pages/NotificationsPage';
import { LandingLoginPage } from './pages/LandingLoginPage';
import { HomeFeedPage } from './pages/HomeFeedPage';
import { PostComposerPage } from './pages/PostComposerPage';
import { AdminCoursesPage } from './pages/admin/AdminCoursesPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { SearchExplorePage } from './pages/SearchExplorePage';
import { CoursePage } from './pages/CoursePage';
import { StudentProfilePage } from './pages/StudentProfilePage';
import { SavedResourcesPage } from './pages/SavedResourcesPage';
import { MessagesPage } from './pages/MessagesPage';
import { AskQuestionPage } from './pages/AskQuestionPage';
import { DiscussionsPage } from './pages/DiscussionsPage';
import { MobileViewPage } from './pages/MobileViewPage';

import { AdminLayout } from './components/layout/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminModerationPage } from './pages/admin/AdminModerationPage';
import { AdminAuditPage } from './pages/admin/AdminAuditPage';

import { ScreenSwitcher } from './components/layout/ScreenSwitcher';

// Protected Route Guard for Admin portal
const AdminRouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user || !isAdmin) {
    return <Navigate to="/feed" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  const navigate = useNavigate();

  // Keyboard Shortcuts (1-9, 0, -, =) to effortlessly test and navigate all 12 screens
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.key) {
        case '1': navigate('/login'); break;
        case '2': navigate('/feed'); break;
        case '3': navigate('/compose'); break;
        case '4': navigate('/post/1'); break;
        case '5': navigate('/explore'); break;
        case '6': navigate('/courses/SE-322'); break;
        case '7': navigate('/profile/me'); break;
        case '8': navigate('/saved'); break;
        case '9': navigate('/ask'); break;
        case '0': navigate('/discussions'); break;
        case '-': navigate('/admin'); break;
        case '=': navigate('/mobile'); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/feed" replace />} />
        <Route path="/login" element={<LandingLoginPage />} />
        <Route path="/feed" element={<HomeFeedPage />} />
        <Route path="/compose" element={<PostComposerPage />} />
        <Route path="/post/:id" element={<PostDetailPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/explore" element={<SearchExplorePage />} />
        <Route path="/courses/:code" element={<CoursePage />} />
        <Route path="/profile/:id" element={<StudentProfilePage />} />
        <Route path="/saved" element={<SavedResourcesPage />} />
        <Route path="/ask" element={<AskQuestionPage />} />
        <Route path="/discussions" element={<DiscussionsPage />} />
        <Route path="/mobile" element={<MobileViewPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* Admin Portal Protected Subroutes */}
        <Route
          path="/admin"
          element={
            <AdminRouteGuard>
              <AdminLayout />
            </AdminRouteGuard>
          }
        >
          
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="courses" element={<AdminCoursesPage />} />
          <Route path="moderation" element={<AdminModerationPage />} />
          <Route path="audit" element={<AdminAuditPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/feed" replace />} />
      </Routes>

      {/* Floating 12-Screen Preview Switcher Toolbar */}
      <ScreenSwitcher />
    </>
  );
};
