// src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI, User, LoginRequest } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(credentials);
      
      // Guardar token y usuario
      localStorage.setItem('hojaverde_token', response.token);
      localStorage.setItem('hojaverde_user', JSON.stringify(response.user));
      
      setUser(response.user);
    } catch (error: any) {
      console.error('Error en login:', error);
      throw new Error(error.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('hojaverde_token');
    localStorage.removeItem('hojaverde_user');
    setUser(null);
  };

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('hojaverde_token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Verificar token con el servidor
      const userData = await authAPI.me();
      setUser(userData);
    } catch (error) {
      // Token inválido o expirado
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// HOC para proteger rutas
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-400 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
              <span className="text-white text-2xl">🌱</span>
            </div>
            <p className="text-gray-600">Verificando autenticación...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return null;
    }

    return <Component {...props} />;
  };
}

// Hook para verificar roles
export function useRole() {
  const { user } = useAuth();
  
  const hasRole = (requiredRoles: string[]) => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  const isAdmin = hasRole(['ADMIN']);
  const isEditor = hasRole(['ADMIN', 'EDITOR']);
  const isViewer = hasRole(['ADMIN', 'EDITOR', 'VIEWER']);

  return {
    user,
    hasRole,
    isAdmin,
    isEditor,
    isViewer,
  };
}
