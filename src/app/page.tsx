'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from './login/page';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  // Marcar que estamos en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isLoading && isAuthenticated) {
      // Solo redirigir si estamos en el cliente y ya autenticado
      router.push('/dashboard');
    }
  }, [isClient, isLoading, isAuthenticated, router]);

  // Mostrar loading hasta que estemos en el cliente
  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-2xl animate-pulse">
            <span className="text-white text-3xl">🌱</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">HojaVerde</h1>
          <p className="text-gray-300 animate-pulse">Iniciando sistema...</p>
        </div>
      </div>
    );
  }

  // Si ya estamos en el cliente y autenticado, mostrar loading mientras redirige
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-2xl animate-pulse">
            <span className="text-white text-3xl">🌱</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">HojaVerde</h1>
          <p className="text-gray-300 animate-pulse">Accediendo al dashboard...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar el login
  return <LoginPage />;
}