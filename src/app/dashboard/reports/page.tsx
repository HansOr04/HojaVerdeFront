// src/app/dashboard/reports/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { withAuth } from '../../../contexts/AuthContext';
import { attendanceAPI, areasAPI } from '../../../lib/api';
import DashboardLayout from '../../../components/DashboardLayout';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  FileSpreadsheet,
  Users,
  Clock,
  DollarSign,
  Coffee,
  Utensils,
  Car,
  Building,
  TrendingUp,
  Search,
  Filter,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface DailySummary {
  date: string;
  summary: {
    totalEmployees: number;
    registeredEmployees: number;
    pendingEmployees: number;
    completionRate: string;
    vacationCount: number;
    totalWorkedHours: number;
    totalFoodItems: number;
    averageWorkedHours: number;
  };
  areaStats: Array<{
    areaId: string;
    areaName: string;
    totalEmployees: number;
    registeredEmployees: number;
    pendingEmployees: number;
    completionRate: string;
    vacationCount: number;
    totalWorkedHours: number;
    totalFoodItems: number;
    averageWorkedHours: number;
  }>;
}

interface Area {
  id: string;
  name: string;
}

function ReportsPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadAreas();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadDailySummary();
    }
  }, [selectedDate]);

  const loadAreas = async () => {
    try {
      const response = await areasAPI.getAll();
      setAreas(response.data || []);
    } catch (error) {
      console.error('Error cargando áreas:', error);
    }
  };

  const loadDailySummary = async () => {
    try {
      setIsLoading(true);
      const response = await attendanceAPI.getDailySummary(selectedDate);
      setDailySummary(response.data);
    } catch (error: any) {
      console.error('Error cargando resumen diario:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error al cargar el resumen diario' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAreaStats = dailySummary?.areaStats.filter(area => 
    !selectedAreaId || area.areaId === selectedAreaId
  ) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    color = 'blue',
    trend
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: any;
    color?: string;
    trend?: 'up' | 'down' | 'stable';
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      orange: 'bg-orange-50 text-orange-700 border-orange-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
      indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      red: 'bg-red-50 text-red-700 border-red-200'
    };

    return (
      <div className={`p-6 rounded-xl border-2 ${colorClasses[color as keyof typeof colorClasses]} hover:shadow-lg transition-shadow`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-75">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-sm opacity-75 mt-1">{subtitle}</p>
            )}
          </div>
          <div className="p-3 rounded-full bg-white/50">
            <Icon size={24} />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center">
            <TrendingUp size={16} className="mr-1" />
            <span className="text-sm">
              {trend === 'up' ? 'Incremento' : trend === 'down' ? 'Disminución' : 'Sin cambios'}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Reportes y Estadísticas
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Análisis detallado de asistencia y productividad diaria
              </p>
            </div>
            <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <Download className="mr-2 h-4 w-4" />
                Exportar Excel
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Generar Reporte
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Área
              </label>
              <select
                value={selectedAreaId}
                onChange={(e) => setSelectedAreaId(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Todas las áreas</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={loadDailySummary}
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Actualizar
              </button>
            </div>
          </div>

          {/* Mensaje de estado */}
          {message && (
            <div className={`rounded-md p-4 mb-6 ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              <div className="flex items-center">
                {message.type === 'success' ? 
                  <CheckCircle className="h-5 w-5 mr-2" /> : 
                  <AlertCircle className="h-5 w-5 mr-2" />
                }
                <span>{message.text}</span>
              </div>
            </div>
          )}

          {/* Resumen del día seleccionado */}
          {selectedDate && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Resumen para {formatDate(selectedDate)}
              </h2>
              
              {dailySummary ? (
                <>
                  {/* Estadísticas principales */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                      title="Total Empleados"
                      value={dailySummary.summary.totalEmployees}
                      subtitle="En el sistema"
                      icon={Users}
                      color="blue"
                    />
                    <StatCard
                      title="Registrados"
                      value={dailySummary.summary.registeredEmployees}
                      subtitle={`${dailySummary.summary.completionRate} completado`}
                      icon={CheckCircle}
                      color="green"
                    />
                    <StatCard
                      title="Horas Trabajadas"
                      value={dailySummary.summary.totalWorkedHours.toFixed(1)}
                      subtitle={`Promedio: ${dailySummary.summary.averageWorkedHours.toFixed(1)}h`}
                      icon={Clock}
                      color="orange"
                    />
                    <StatCard
                      title="De Vacaciones"
                      value={dailySummary.summary.vacationCount}
                      subtitle="Empleados ausentes"
                      icon={Coffee}
                      color="purple"
                    />
                  </div>

                  {/* Estadísticas por área */}
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Building className="mr-2 h-5 w-5" />
                        Estadísticas por Área
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Área
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Empleados
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Registrados
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Completado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Horas Totales
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Promedio/Empleado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Vacaciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredAreaStats.map((area, index) => (
                            <tr key={area.areaId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-8 w-8">
                                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                      <Building className="h-4 w-4 text-indigo-600" />
                                    </div>
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">
                                      {area.areaName}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {area.totalWorkedHours.toFixed(1)}h
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {area.averageWorkedHours.toFixed(1)}h
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {area.vacationCount}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    {isLoading ? 'Cargando resumen...' : 'No hay datos para esta fecha'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {isLoading ? 'Por favor espera...' : 'Selecciona una fecha diferente o verifica que existan registros de asistencia.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Gráficos y análisis adicionales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Resumen de alimentación */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Utensils className="mr-2 h-5 w-5 text-green-600" />
                Resumen de Alimentación
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <Coffee className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="text-sm font-medium text-yellow-800">Desayunos</span>
                  </div>
                  <span className="text-lg font-bold text-yellow-800">
                    {dailySummary ? Math.round(dailySummary.summary.totalFoodItems * 0.3) : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <Utensils className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">Almuerzos</span>
                  </div>
                  <span className="text-lg font-bold text-green-800">
                    {dailySummary ? Math.round(dailySummary.summary.totalFoodItems * 0.4) : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Car className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">Subsidio Transporte</span>
                  </div>
                  <span className="text-lg font-bold text-blue-800">
                    ${dailySummary ? (dailySummary.summary.registeredEmployees * 2.5).toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tendencias */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-indigo-600" />
                Indicadores Clave
              </h3>
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="text-sm font-medium text-gray-900">Tasa de Asistencia</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {dailySummary?.summary.completionRate || '0%'}
                  </p>
                  <p className="text-xs text-gray-500">del total de empleados</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="text-sm font-medium text-gray-900">Promedio de Horas</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {dailySummary?.summary.averageWorkedHours.toFixed(1) || '0.0'}h
                  </p>
                  <p className="text-xs text-gray-500">por empleado registrado</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="text-sm font-medium text-gray-900">Eficiencia Operativa</h4>
                  <p className="text-2xl font-bold text-orange-600">
                    {dailySummary ? Math.round((dailySummary.summary.registeredEmployees / dailySummary.summary.totalEmployees) * 100) : 0}%
                  </p>
                  <p className="text-xs text-gray-500">empleados activos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="mt-8 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center justify-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
                <FileSpreadsheet className="h-6 w-6 text-green-600 mr-3" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Exportar a Excel</p>
                  <p className="text-xs text-gray-500">Descargar datos del día</p>
                </div>
              </button>
              <button className="flex items-center justify-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
                <Calendar className="h-6 w-6 text-blue-600 mr-3" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Reporte Semanal</p>
                  <p className="text-xs text-gray-500">Últimos 7 días</p>
                </div>
              </button>
              <button className="flex items-center justify-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
                <BarChart3 className="h-6 w-6 text-purple-600 mr-3" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Análisis Mensual</p>
                  <p className="text-xs text-gray-500">Tendencias del mes</p>
                </div>
              </button>
            </div>
          </div>

          {/* Próximamente */}
          <div className="mt-8 text-center py-8 bg-gray-50 rounded-xl">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Más Reportes Próximamente</h3>
            <p className="text-gray-500 mb-4">
              Estamos trabajando en reportes adicionales como análisis de productividad, 
              comparativas históricas y dashboards interactivos.
            </p>
            <div className="flex justify-center space-x-4 text-sm text-gray-500">
              <span>📊 Gráficos Interactivos</span>
              <span>📈 Análisis Predictivo</span>
              <span>📋 Reportes Personalizados</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default withAuth(ReportsPage);