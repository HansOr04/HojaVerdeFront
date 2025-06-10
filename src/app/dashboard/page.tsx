'use client';

import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { ClipboardList, Users, Building, BarChart3, TrendingUp, Clock } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  const quickStats = [
    { label: 'Empleados Totales', value: '615', icon: Users, color: 'text-green-600' },
    { label: 'Áreas de Trabajo', value: '5', icon: Building, color: 'text-blue-600' },
    { label: 'Tiempo Registro', value: '~10s', icon: Clock, color: 'text-orange-600' },
    { label: 'Eficiencia', value: '99%', icon: TrendingUp, color: 'text-purple-600' },
  ];

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">
              Bienvenido, {user?.employee?.firstName || user?.email}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Panel de control del sistema de asistencia HojaVerde
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            {stat.label}
                          </dt>
                          <dd className={`text-lg font-medium ${stat.color}`}>
                            {stat.value}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Acción crítica para María */}
          <div className="bg-gradient-to-r from-green-50 to-orange-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-green-800 mb-2">
                  🚀 Registro Masivo de Asistencia
                </h2>
                <p className="text-green-700 mb-4">
                  Registra la asistencia de los 615 empleados de manera eficiente y rápida.
                  Sistema optimizado para múltiples áreas con valores por defecto automáticos.
                </p>
                <div className="flex items-center gap-4 text-sm text-green-600">
                  <span>✅ Selección múltiple de áreas</span>
                  <span>✅ Valores por defecto automáticos</span>
                  <span>✅ Modificación individual</span>
                  <span>✅ Guardado atómico</span>
                </div>
              </div>
              <Link
                href="/dashboard/attendance"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-lg hover:shadow-xl"
              >
                <ClipboardList size={20} />
                Iniciar Registro
              </Link>
            </div>
          </div>

          {/* Menu de navegación */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/dashboard/attendance"
              className="group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-500 text-white group-hover:bg-green-600 transition-colors">
                  <ClipboardList className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-green-700 transition-colors">
                  Registro de Asistencia
                  <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                    CRÍTICO
                  </span>
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Sistema masivo para registrar hasta 615 empleados simultáneamente
                </p>
              </div>
            </Link>

            <div className="group relative bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-500 text-white">
                  <Users className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Gestión de Empleados
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Ver, crear y gestionar información de empleados
                </p>
              </div>
            </div>

            <div className="group relative bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-500 text-white">
                  <Building className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Gestión de Áreas
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Administrar áreas de trabajo y configuraciones
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}