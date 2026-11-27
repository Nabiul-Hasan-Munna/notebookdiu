
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (emailOrStudentId: string, pass: string) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    studentId: string;
    password: string;
    department?: string;
    batch?: string;
  }) => Promise<{ email: string; message: string }>;
  verifyRegistration: (email: string, code: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isModerator: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('universe_token')
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (!localStorage.getItem('universe_token')) {
        setUser(null);
        return;
      }

      const data = await api.getMe();
      setUser(data.user);
    } catch (err) {
      console.warn('[AUTH] Session verification failed, clearing token');
      localStorage.removeItem('universe_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const login = async (emailOrStudentId: string, pass: string) => {
    const data = await api.login(emailOrStudentId, pass);
    localStorage.setItem('universe_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  // Registration only sends a verification code.
  const register = async (payload: {
    name: string;
    email: string;
    studentId: string;
    password: string;
    department?: string;
    batch?: string;
  }) => {
    return await api.register(payload);
  };

  // A verified registration creates the session.
  const verifyRegistration = async (email: string, code: string) => {
    const data = await api.verifyRegistration(email, code);
    localStorage.setItem('universe_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const resendVerification = async (email: string) => {
    await api.resendVerification(email);
  };

  const logout = () => {
    localStorage.removeItem('universe_token');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = Boolean(user && token);
  const isAdmin = Boolean(
    user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')
  );
  const isModerator = Boolean(
    user &&
    (user.role === 'MODERATOR' ||
      user.role === 'ADMIN' ||
      user.role === 'SUPER_ADMIN')
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        verifyRegistration,
        resendVerification,
        logout,
        refreshUser,
        isAuthenticated,
        isAdmin,
        isModerator
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
