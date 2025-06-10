'use client';

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 bg-orange-400 rounded-full flex items-center justify-center shadow-lg">
              <div className="text-white text-4xl">🌱</div>
            </div>
          </div>
          <h1 className="text-4xl font-serif text-gray-800 mb-2">
            Hoja Verde
          </h1>
          <p className="text-gray-600 italic text-lg font-serif">
            a remarkable focus that lasts
          </p>
        </header>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Sistema de Control de Asistencia
            </h2>
            <p className="text-gray-600 mb-6">
              Gestión eficiente de asistencia para empleados agrícolas. 
              Diseñado para manejar hasta 615 empleados con registro masivo optimizado.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-green-800 mb-3">
                  🚀 Funcionalidades Principales
                </h3>
                <ul className="text-sm text-green-700 space-y-2">
                  <li>• Registro masivo de asistencia</li>
                  <li>• Gestión de múltiples áreas</li>
                  <li>• Control de horas extras</li>
                  <li>• Manejo de vacaciones y permisos</li>
                  <li>• Reportes y resúmenes</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                <h3 className="text-lg font-semibold text-orange-800 mb-3">
                  📊 Capacidades del Sistema
                </h3>
                <ul className="text-sm text-orange-700 space-y-2">
                  <li>• Hasta 615 empleados</li>
                  <li>• 5 áreas de trabajo</li>
                  <li>• Registro en ~10 segundos</li>
                  <li>• Transacciones atómicas</li>
                  <li>• Valores por defecto automáticos</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link 
                href="/login"
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Acceder al Sistema
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl font-bold text-green-600 mb-1">615</div>
              <div className="text-sm text-gray-600">Empleados</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl font-bold text-orange-500 mb-1">5</div>
              <div className="text-sm text-gray-600">Áreas</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl font-bold text-gray-600 mb-1">~10s</div>
              <div className="text-sm text-gray-600">Registro Masivo</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
