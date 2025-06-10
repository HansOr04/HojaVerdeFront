'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const [isClient, setIsClient] = useState(false);

  const isAuthenticated = !!user;

  // Marcar que estamos en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(credentials);
      
      // Guardar token y usuario solo si estamos en el cliente
      if (isClient) {
        localStorage.setItem('hojaverde_token', response.token);
        localStorage.setItem('hojaverde_user', JSON.stringify(response.user));
      }
      
      setUser(response.user);
    } catch (error: any) {
      console.error('Error en login:', error);
      throw new Error(error.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (isClient) {
      localStorage.removeItem('hojaverde_token');
      localStorage.removeItem('hojaverde_user');
    }
    setUser(null);
  };

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      
      // Solo verificar auth si estamos en el cliente
      if (!isClient) {
        setIsLoading(false);
        return;
      }
      
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

  // Solo hacer checkAuth cuando estemos en el cliente
  useEffect(() => {
    if (isClient) {
      checkAuth();
    }
  }, [isClient]);

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

// HOC para proteger rutas - RESTAURADO Y CORREGIDO
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    // TODOS LOS HOOKS DEBEN IR AL INICIO
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    // useEffect para marcar que estamos en cliente
    useEffect(() => {
      setIsClient(true);
    }, []);

    // useEffect para redirigir al login si no está autenticado
    useEffect(() => {
      if (isClient && !isLoading && !isAuthenticated) {
        router.push('/login');
      }
    }, [isClient, isLoading, isAuthenticated, router]);

    // Lógica de renderizado DESPUÉS de todos los hooks
    // Loading mientras verificamos auth
    if (!isClient || isLoading) {
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

    // Si no está autenticado, mostrar loading mientras redirige
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-400 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
              <span className="text-white text-2xl">🌱</span>
            </div>
            <p className="text-gray-600">Redirigiendo al login...</p>
          </div>
        </div>
      );
    }

    // Si está autenticado, mostrar el componente
    return <Component {...props} />;
  };
}

// Hook para verificar roles - RESTAURADO
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