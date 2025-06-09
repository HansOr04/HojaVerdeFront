// src/app/dashboard/reports/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { withAuth } from '@/contexts/AuthContext';
import { attendanceAPI, areasAPI, employeesAPI } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  BarChart3,
  Calendar,
  Download,
  Filter,
  Users,
  Building,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Coffee,
  Utensils,
  Car,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  FileText,
  PieChart,
  Activity,
  Target,
  Award,
  Zap,
  Eye,
  Search,
  ChevronDown,
  ChevronUp,
  Calculator,
  Map,
  Percent
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
  employeesCount: number;
}

function ReportsPage() {
  // Estados principales
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Estados de filtros avanzados
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Estados de UI
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    loadAreas();
    loadDailySummary();
  }, []);

  useEffect(() => {
    if (reportType === 'daily') {
      loadDailySummary();
    }
  }, [selectedDate, selectedAreas]);

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
      setLoading(true);
      const response = await attendanceAPI.getDailySummary(selectedDate);
      setDailySummary(response.data);
      setMessage({ type: 'success', text: `Reporte cargado para ${new Date(selectedDate).toLocaleDateString('es-ES')}` });
    } catch (error: any) {
      console.error('Error cargando resumen diario:', error);
      setMessage({ type: 'error', text: 'Error al cargar el reporte diario' });
      setDailySummary(null);
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (value: number, total: number) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  const getStatusColor = (completionRate: string) => {
    const rate = parseFloat(completionRate);
    if (rate >= 90) return 'text-green-600 bg-green-100';
    if (rate >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const exportReport = () => {
    if (!dailySummary) return;
    
    // Crear CSV simple
    const csvData = [
      ['Reporte de Asistencia', selectedDate],
      [''],
      ['Resumen General'],
      ['Total Empleados', dailySummary.summary.totalEmployees],
      ['Empleados Registrados', dailySummary.summary.registeredEmployees],
      ['Empleados Pendientes', dailySummary.summary.pendingEmployees],
      ['Tasa de Completitud', dailySummary.summary.completionRate],
      ['Empleados de Vacaciones', dailySummary.summary.vacationCount],
      ['Total Horas Trabajadas', dailySummary.summary.totalWorkedHours],
      [''],
      ['Estadísticas por Área'],
      ['Área', 'Total Empleados', 'Registrados', 'Pendientes', 'Completitud', 'Vacaciones', 'Horas Trabajadas'],
      ...dailySummary.areaStats.map(area => [
        area.areaName,
        area.totalEmployees,
        area.registeredEmployees,
        area.pendingEmployees,
        area.completionRate,
        area.vacationCount,
        area.totalWorkedHours
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_asistencia_${selectedDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setMessage({ type: 'success', text: 'Reporte exportado exitosamente' });
  };

  // Datos de ejemplo para gráficos (en una implementación real, estos vendrían de la API)
  const getChartData = () => {
    if (!dailySummary) return null;
    
    return {
      completionRates: dailySummary.areaStats.map(area => ({
        area: area.areaName,
        rate: parseFloat(area.completionRate),
        employees: area.registeredEmployees,
        total: area.totalEmployees
      })),
      workingHours: dailySummary.areaStats.map(area => ({
        area: area.areaName,
        hours: area.totalWorkedHours,
        average: area.averageWorkedHours
      }))
    };
  };

  const chartData = getChartData();

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Reportes y Análisis</h1>
                  <p className="text-gray-600">Dashboard de asistencia y estadísticas detalladas</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-medium flex items-center space-x-2 transition-colors"
                >
                  <Filter size={16} />
                  <span>Filtros</span>
                  {showAdvancedFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                <button
                  onClick={exportReport}
                  disabled={!dailySummary}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all transform hover:scale-105 shadow-lg disabled:transform-none"
                >
                  <Download size={20} />
                  <span>Exportar CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mensaje de estado */}
          {message && (
            <div className={`rounded-xl p-4 mb-6 shadow-lg border-l-4 ${
              message.type === 'success' ? 'bg-green-50 border-green-400 text-green-800' :
              message.type === 'error' ? 'bg-red-50 border-red-400 text-red-800' :
              'bg-blue-50 border-blue-400 text-blue-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                  <span className="font-medium">{message.text}</span>
                </div>
                <button 
                  onClick={() => setMessage(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Filtros avanzados */}
          {showAdvancedFilters && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros Avanzados</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Reporte
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as 'daily' | 'weekly' | 'monthly')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Diario</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha {reportType === 'daily' ? 'Específica' : 'Inicio'}
                  </label>
                  <input
                    type="date"
                    value={reportType === 'daily' ? selectedDate : dateRange.startDate}
                    onChange={(e) => {
                      if (reportType === 'daily') {
                        setSelectedDate(e.target.value);
                      } else {
                        setDateRange(prev => ({ ...prev, startDate: e.target.value }));
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {reportType !== 'daily' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha Fin
                    </label>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Áreas a Incluir
                  </label>
                  <select
                    multiple
                    value={selectedAreas}
                    onChange={(e) => setSelectedAreas(Array.from(e.target.selectedOptions, option => option.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                  >
                    <option value="">Todas las áreas</option>
                    {areas.map(area => (
                      <option key={area.id} value={area.id}>
                        {area.name} ({area.employeesCount})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSelectedAreas([]);
                    setSelectedDate(new Date().toISOString().split('T')[0]);
                    setReportType('daily');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Limpiar Filtros
                </button>
                <button
                  onClick={loadDailySummary}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <RefreshCw size={16} />
                  <span>Aplicar Filtros</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick filters */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <Calendar className="text-blue-600" size={20} />
                <label className="text-sm font-medium text-gray-700">Fecha del Reporte:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                  className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Hoy
                </button>
                <button
                  onClick={() => setSelectedDate(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0])}
                  className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Ayer
                </button>
                <button
                  onClick={loadDailySummary}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors flex items-center space-x-2"
                >
                  {loading ? <RefreshCw className="animate-spin" size={16} /> : <Eye size={16} />}
                  <span>{loading ? 'Cargando...' : 'Ver Reporte'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
              <p className="text-gray-600">Generando reporte...</p>
            </div>
          ) : dailySummary ? (
            <>
              {/* Resumen ejecutivo */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-8 mb-8 text-white">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      Resumen del {new Date(selectedDate).toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h2>
                    <p className="text-blue-100">Dashboard de asistencia y productividad</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{dailySummary.summary.completionRate}</div>
                    <div className="text-blue-100">Tasa de Registro</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">{dailySummary.summary.registeredEmployees}</div>
                    <div className="text-blue-100 text-sm">Empleados Registrados</div>
                    <div className="text-xs text-blue-200 mt-1">
                      de {dailySummary.summary.totalEmployees} total
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">{dailySummary.summary.totalWorkedHours.toFixed(1)}</div>
                    <div className="text-blue-100 text-sm">Horas Trabajadas</div>
                    <div className="text-xs text-blue-200 mt-1">
                      Promedio: {dailySummary.summary.averageWorkedHours.toFixed(1)}h
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">{dailySummary.summary.vacationCount}</div>
                    <div className="text-blue-100 text-sm">En Vacaciones</div>
                    <div className="text-xs text-blue-200 mt-1">
                      {calculatePercentage(dailySummary.summary.vacationCount, dailySummary.summary.totalEmployees)}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">{dailySummary.summary.pendingEmployees}</div>
                    <div className="text-blue-100 text-sm">Pendientes</div>
                    <div className="text-xs text-blue-200 mt-1">
                      Sin registrar
                    </div>
                  </div>
                </div>
              </div>

              {/* Estadísticas por área */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {dailySummary.areaStats.map((area, index) => (
                  <div 
                    key={area.areaId} 
                    className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    {/* Header del área */}
                    <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <Building size={20} />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{area.areaName}</h3>
                            <p className="text-gray-300 text-sm">{area.totalEmployees} empleados</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(area.completionRate)}`}>
                            {area.completionRate}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Métricas */}
                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <CheckCircle className="text-green-600" size={16} />
                            <span className="text-sm font-medium text-green-800">Registrados</span>
                          </div>
                          <p className="text-2xl font-bold text-green-900">{area.registeredEmployees}</p>
                          <p className="text-xs text-green-700">
                            {calculatePercentage(area.registeredEmployees, area.totalEmployees)}
                          </p>
                        </div>

                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <Clock className="text-orange-600" size={16} />
                            <span className="text-sm font-medium text-orange-800">Horas</span>
                          </div>
                          <p className="text-2xl font-bold text-orange-900">{area.totalWorkedHours.toFixed(1)}</p>
                          <p className="text-xs text-orange-700">
                            Prom: {area.averageWorkedHours.toFixed(1)}h
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <Coffee className="text-blue-600" size={16} />
                            <span className="text-sm font-medium text-blue-800">Alimentación</span>
                          </div>
                          <p className="text-2xl font-bold text-blue-900">{area.totalFoodItems}</p>
                          <p className="text-xs text-blue-700">Items servidos</p>
                        </div>

                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <Users className="text-purple-600" size={16} />
                            <span className="text-sm font-medium text-purple-800">Vacaciones</span>
                          </div>
                          <p className="text-2xl font-bold text-purple-900">{area.vacationCount}</p>
                          <p className="text-xs text-purple-700">
                            {calculatePercentage(area.vacationCount, area.totalEmployees)}
                          </p>
                        </div>
                      </div>

                      {/* Barra de progreso */}
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Progreso de Registro</span>
                          <span className="text-sm text-gray-600">{area.registeredEmployees}/{area.totalEmployees}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-500 ${
                              parseFloat(area.completionRate) >= 90 ? 'bg-green-500' :
                              parseFloat(area.completionRate) >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: area.completionRate }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Gráficos y análisis detallado */}
              {chartData && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                  {/* Gráfico de tasas de completitud */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900">Tasas de Completitud por Área</h3>
                      <PieChart className="text-gray-400" size={20} />
                    </div>
                    
                    <div className="space-y-4">
                      {chartData.completionRates.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                            ></div>
                            <span className="text-sm font-medium text-gray-700">{item.area}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-gray-900">{item.rate.toFixed(1)}%</span>
                            <div className="text-xs text-gray-500">{item.employees}/{item.total}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gráfico de horas trabajadas */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900">Horas Trabajadas por Área</h3>
                      <Activity className="text-gray-400" size={20} />
                    </div>
                    
                    <div className="space-y-4">
                      {chartData.workingHours.map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">{item.area}</span>
                            <span className="text-sm font-bold text-gray-900">{item.hours.toFixed(1)}h</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min((item.hours / Math.max(...chartData.workingHours.map(h => h.hours))) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500">
                            Promedio: {item.average.toFixed(1)}h por empleado
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Insights y recomendaciones */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Target className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Insights y Recomendaciones</h3>
                    <p className="text-gray-600">Análisis automático basado en los datos del día</p>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {/* Rendimiento general */}
                 <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6">
                   <div className="flex items-center space-x-3 mb-4">
                     <Award className="text-green-600" size={24} />
                     <h4 className="font-bold text-green-800">Rendimiento General</h4>
                   </div>
                   <div className="space-y-3">
                     <div className="flex items-center justify-between">
                       <span className="text-sm text-green-700">Tasa de Registro:</span>
                       <span className="font-bold text-green-800">{dailySummary.summary.completionRate}</span>
                     </div>
                     <div className="flex items-center justify-between">
                       <span className="text-sm text-green-700">Productividad:</span>
                       <span className="font-bold text-green-800">
                         {dailySummary.summary.averageWorkedHours >= 7.5 ? 'Excelente' : 
                          dailySummary.summary.averageWorkedHours >= 6.5 ? 'Buena' : 'Regular'}
                       </span>
                     </div>
                     <div className="flex items-center justify-between">
                       <span className="text-sm text-green-700">Ausentismo:</span>
                       <span className="font-bold text-green-800">
                         {calculatePercentage(dailySummary.summary.vacationCount, dailySummary.summary.totalEmployees)}
                       </span>
                     </div>
                   </div>
                 </div>

                 {/* Área destacada */}
                 <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6">
                   <div className="flex items-center space-x-3 mb-4">
                     <TrendingUp className="text-blue-600" size={24} />
                     <h4 className="font-bold text-blue-800">Área Destacada</h4>
                   </div>
                   {(() => {
                     const bestArea = dailySummary.areaStats.reduce((best, current) => 
                       parseFloat(current.completionRate) > parseFloat(best.completionRate) ? current : best
                     );
                     return (
                       <div className="space-y-3">
                         <div className="text-lg font-bold text-blue-900">{bestArea.areaName}</div>
                         <div className="flex items-center justify-between">
                           <span className="text-sm text-blue-700">Completitud:</span>
                           <span className="font-bold text-blue-800">{bestArea.completionRate}</span>
                         </div>
                         <div className="flex items-center justify-between">
                           <span className="text-sm text-blue-700">Empleados:</span>
                           <span className="font-bold text-blue-800">{bestArea.registeredEmployees}/{bestArea.totalEmployees}</span>
                         </div>
                         <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded-lg">
                           🏆 Mejor desempeño del día
                         </div>
                       </div>
                     );
                   })()}
                 </div>

                 {/* Acciones recomendadas */}
                 <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-6">
                   <div className="flex items-center space-x-3 mb-4">
                     <Zap className="text-orange-600" size={24} />
                     <h4 className="font-bold text-orange-800">Acciones Recomendadas</h4>
                   </div>
                   <div className="space-y-3">
                     {dailySummary.summary.pendingEmployees > 0 && (
                       <div className="text-sm text-orange-700 bg-orange-50 p-3 rounded-lg border border-orange-200">
                         ⚠️ {dailySummary.summary.pendingEmployees} empleados sin registrar
                       </div>
                     )}
                     
                     {(() => {
                       const lowPerformanceAreas = dailySummary.areaStats.filter(area => 
                         parseFloat(area.completionRate) < 70
                       );
                       return lowPerformanceAreas.length > 0 ? (
                         <div className="text-sm text-orange-700 bg-orange-50 p-3 rounded-lg border border-orange-200">
                           📊 Revisar registro en: {lowPerformanceAreas.map(a => a.areaName).join(', ')}
                         </div>
                       ) : (
                         <div className="text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                           ✅ Todas las áreas con buen rendimiento
                         </div>
                       );
                     })()}
                     
                     {dailySummary.summary.averageWorkedHours < 6.5 && (
                       <div className="text-sm text-orange-700 bg-orange-50 p-3 rounded-lg border border-orange-200">
                         ⏰ Promedio de horas bajo (revisar horarios)
                       </div>
                     )}
                   </div>
                 </div>
               </div>
             </div>
           </>
         ) : (
           /* Sin datos */
           <div className="bg-white rounded-xl shadow-lg p-12 text-center">
             <BarChart3 className="mx-auto mb-4 text-gray-400" size={48} />
             <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos disponibles</h3>
             <p className="text-gray-600 mb-6">
               No se encontraron registros de asistencia para la fecha seleccionada.
             </p>
             <div className="flex items-center justify-center space-x-4">
               <button
                 onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                 className="text-blue-600 hover:text-blue-800 font-medium"
               >
                 Ver datos de hoy
               </button>
               <span className="text-gray-400">|</span>
               <button
                 onClick={() => setSelectedDate(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0])}
                 className="text-blue-600 hover:text-blue-800 font-medium"
               >
                 Ver datos de ayer
               </button>
             </div>
           </div>
         )}
       </div>
     </div>
   </DashboardLayout>
 );
}

export default withAuth(ReportsPage);