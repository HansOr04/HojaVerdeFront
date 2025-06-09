// src/app/dashboard/areas/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { withAuth, useRole } from '@/contexts/AuthContext';
import { areasAPI } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Building,
  Plus,
  Edit,
  Trash2,
  Clock,
  Users,
  Search,
  X,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Settings,
  MapPin,
  Calendar,
  Timer,
  Target,
  Coffee,
  Utensils,
  TrendingUp,
  BarChart3,Calculator
} from 'lucide-react';

// Interfaces
interface Area {
  id: string;
  name: string;
  defaultEntryTime: string;
  defaultExitTime: string;
  defaultLunchDuration: number;
  defaultWorkingHours: number;
  employeesCount: number;
  employees?: Array<{
    id: string;
    identification: string;
    fullName: string;
    firstName: string;
    lastName: string;
    position: string;
    baseSalary: number;
    isActive: boolean;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

function AreasPage() {
  const { isAdmin } = useRole();
  
  // Estados principales
  const [areas, setAreas] = useState<Area[]>([]);
  const [filteredAreas, setFilteredAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados de modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEmployeesModal, setShowEmployeesModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);

  // Estados de formulario
  const [formData, setFormData] = useState({
    name: '',
    defaultEntryTime: '06:30',
    defaultExitTime: '16:00',
    defaultLunchDuration: 30,
    defaultWorkingHours: 8,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados de UI
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [expandedArea, setExpandedArea] = useState<string | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    loadAreas();
  }, []);

  // Filtrar áreas
  useEffect(() => {
    const filtered = areas.filter(area => 
      area.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAreas(filtered);
  }, [areas, searchTerm]);

  const loadAreas = async () => {
    try {
      setLoading(true);
      const response = await areasAPI.getAll({ includeEmployees: true });
      setAreas(response.data || []);
    } catch (error) {
      console.error('Error cargando áreas:', error);
      setMessage({ type: 'error', text: 'Error al cargar áreas' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'El nombre del área es requerido';
    }
    
    if (!formData.defaultEntryTime) {
      errors.defaultEntryTime = 'La hora de entrada es requerida';
    }
    
    if (!formData.defaultExitTime) {
      errors.defaultExitTime = 'La hora de salida es requerida';
    }
    
    if (formData.defaultEntryTime >= formData.defaultExitTime) {
      errors.defaultExitTime = 'La hora de salida debe ser posterior a la de entrada';
    }
    
    if (formData.defaultLunchDuration < 0 || formData.defaultLunchDuration > 180) {
      errors.defaultLunchDuration = 'La duración del almuerzo debe estar entre 0 y 180 minutos';
    }
    
    if (formData.defaultWorkingHours < 1 || formData.defaultWorkingHours > 12) {
      errors.defaultWorkingHours = 'Las horas de trabajo deben estar entre 1 y 12';
    }

    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      const submitData = {
        ...formData,
        name: formData.name.toUpperCase().trim(),
      };

      if (selectedArea) {
        await areasAPI.update(selectedArea.id, submitData);
        setMessage({ type: 'success', text: 'Área actualizada exitosamente' });
        setShowEditModal(false);
      } else {
        await areasAPI.create(submitData);
        setMessage({ type: 'success', text: 'Área creada exitosamente' });
        setShowCreateModal(false);
      }
      
      resetForm();
      loadAreas();
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error al guardar área' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (area: Area) => {
    setSelectedArea(area);
    setFormData({
      name: area.name,
      defaultEntryTime: area.defaultEntryTime,
      defaultExitTime: area.defaultExitTime,
      defaultLunchDuration: area.defaultLunchDuration,
      defaultWorkingHours: area.defaultWorkingHours,
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    if (!selectedArea) return;

    try {
      setIsSubmitting(true);
      await areasAPI.delete(selectedArea.id);
      setMessage({ type: 'success', text: 'Área eliminada exitosamente' });
      setShowDeleteConfirm(false);
      setSelectedArea(null);
      loadAreas();
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error al eliminar área' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      defaultEntryTime: '06:30',
      defaultExitTime: '16:00',
      defaultLunchDuration: 30,
      defaultWorkingHours: 8,
    });
    setFormErrors({});
    setSelectedArea(null);
  };

  const calculateWorkingTime = (entryTime: string, exitTime: string, lunchDuration: number) => {
    const entry = new Date(`1970-01-01T${entryTime}:00`);
    const exit = new Date(`1970-01-01T${exitTime}:00`);
    const diffMs = exit.getTime() - entry.getTime();
    const totalHours = diffMs / (1000 * 60 * 60);
    const workingHours = totalHours - (lunchDuration / 60);
    return workingHours.toFixed(1);
  };

  // Estadísticas
  const stats = {
    totalAreas: areas.length,
    totalEmployees: areas.reduce((sum, area) => sum + area.employeesCount, 0),
    avgEmployeesPerArea: areas.length > 0 ? (areas.reduce((sum, area) => sum + area.employeesCount, 0) / areas.length).toFixed(1) : '0',
    areasWithoutEmployees: areas.filter(area => area.employeesCount === 0).length,
  };

  const FormModal = ({ show, onClose, title }: { show: boolean; onClose: () => void; title: string }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Información básica */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Área *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  formErrors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: CULTIVO 1, POSTCOSECHA"
                disabled={isSubmitting}
              />
              {formErrors.name && (
                <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
              )}
            </div>

            {/* Horarios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de Entrada *
                </label>
                <input
                  type="time"
                  value={formData.defaultEntryTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, defaultEntryTime: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    formErrors.defaultEntryTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                {formErrors.defaultEntryTime && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.defaultEntryTime}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de Salida *
                </label>
                <input
                  type="time"
                  value={formData.defaultExitTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, defaultExitTime: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    formErrors.defaultExitTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                {formErrors.defaultExitTime && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.defaultExitTime}</p>
                )}
              </div>
            </div>

            {/* Configuración adicional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración del Almuerzo (minutos)
                </label>
                <input
                  type="number"
                  value={formData.defaultLunchDuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, defaultLunchDuration: parseInt(e.target.value) || 0 }))}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    formErrors.defaultLunchDuration ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="0"
                  max="180"
                  disabled={isSubmitting}
                />
                {formErrors.defaultLunchDuration && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.defaultLunchDuration}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horas de Trabajo por Día
                </label>
                <input
                  type="number"
                  value={formData.defaultWorkingHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, defaultWorkingHours: parseInt(e.target.value) || 8 }))}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    formErrors.defaultWorkingHours ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="1"
                  max="12"
                  disabled={isSubmitting}
                />
                {formErrors.defaultWorkingHours && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.defaultWorkingHours}</p>
                )}
              </div>
            </div>

            {/* Vista previa de cálculos */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center space-x-2">
                <Calculator className="text-blue-600" size={16} />
                <span>Vista Previa de Horario</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-blue-600 font-medium">Jornada Total</p>
                  <p className="text-xl font-bold text-blue-800">
                    {calculateWorkingTime(formData.defaultEntryTime, formData.defaultExitTime, 0)}h
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-blue-600 font-medium">Almuerzo</p>
                  <p className="text-xl font-bold text-blue-800">{(formData.defaultLunchDuration / 60).toFixed(1)}h</p>
                </div>
                <div className="text-center">
                  <p className="text-blue-600 font-medium">Trabajo Efectivo</p>
                  <p className="text-xl font-bold text-blue-800">
                    {calculateWorkingTime(formData.defaultEntryTime, formData.defaultExitTime, formData.defaultLunchDuration)}h
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-blue-600 font-medium">Meta Diaria</p>
                  <p className="text-xl font-bold text-blue-800">{formData.defaultWorkingHours}h</p>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>{selectedArea ? 'Actualizar' : 'Crear'} Área</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Building className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Gestión de Áreas</h1>
                  <p className="text-gray-600">Administra las áreas de trabajo y sus configuraciones</p>
                </div>
              </div>
              
              {isAdmin && (
                <button
                  onClick={() => {
                    resetForm();
                    setShowCreateModal(true);
                  }}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all transform hover:scale-105 shadow-lg"
                >
                  <Plus size={20} />
                  <span>Nueva Área</span>
                </button>
              )}
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
                  <X size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Áreas</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalAreas}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Building className="text-purple-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Empleados</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalEmployees}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="text-blue-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Promedio por Área</p>
                  <p className="text-3xl font-bold text-green-600">{stats.avgEmployeesPerArea}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sin Empleados</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.areasWithoutEmployees}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="text-orange-600" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar área por nombre..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                onClick={loadAreas}
                className="ml-4 px-4 py-3 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl transition-colors flex items-center space-x-2"
              >
                <RefreshCw size={16} />
                <span>Actualizar</span>
              </button>
            </div>
          </div>

          {/* Lista de áreas */}
          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <RefreshCw className="animate-spin mx-auto mb-4 text-purple-600" size={48} />
              <p className="text-gray-600">Cargando áreas...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredAreas.map((area) => (
                <div key={area.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                  {/* Header del área */}
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <Building size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{area.name}</h3>
                          <p className="text-purple-100">
                            {area.employeesCount} empleado{area.employeesCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      
                      {isAdmin && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(area)}
                            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                            title="Editar área"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedArea(area);
                              setShowDeleteConfirm(true);
                            }}
                            className="p-2 text-white/80 hover:text-white hover:bg-red-500/30 rounded-lg transition-colors"
                            title="Eliminar área"
                            disabled={area.employeesCount > 0}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Información de horarios */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="text-blue-600" size={16} />
                          <span className="text-sm font-medium text-blue-800">Horario</span>
                        </div>
                        <p className="text-lg font-bold text-blue-900">
                          {area.defaultEntryTime} - {area.defaultExitTime}
                        </p>
                      </div>

                      <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <Timer className="text-green-600" size={16} />
                          <span className="text-sm font-medium text-green-800">Horas Trabajo</span>
                        </div>
                        <p className="text-lg font-bold text-green-900">
                          {area.defaultWorkingHours}h / día
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <Utensils className="text-orange-600" size={16} />
                          <span className="text-sm font-medium text-orange-800">Almuerzo</span>
                        </div>
                        <p className="text-lg font-bold text-orange-900">
                          {area.defaultLunchDuration} min
                        </p>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <BarChart3 className="text-purple-600" size={16} />
                          <span className="text-sm font-medium text-purple-800">Tiempo Real</span>
                        </div>
                        <p className="text-lg font-bold text-purple-900">
                          {calculateWorkingTime(area.defaultEntryTime, area.defaultExitTime, area.defaultLunchDuration)}h
                        </p>
                      </div>
                    </div>

                    {/* Botón para ver empleados */}
                    {area.employeesCount > 0 && (
                      <button
                        onClick={() => {
                          setSelectedArea(area);
                          setShowEmployeesModal(true);
                        }}
                        className="w-full bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 border-2 border-gray-200 hover:border-gray-300 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center space-x-2"
                      >
                        <Users size={16} />
                        <span>Ver {area.employeesCount} Empleado{area.employeesCount !== 1 ? 's' : ''}</span>
                      </button>
                    )}

                    {area.employeesCount === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <Users className="mx-auto mb-2 text-gray-400" size={24} />
                        <p className="text-sm">No hay empleados asignados</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sin resultados */}
          {!loading && filteredAreas.length === 0 && (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Building className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron áreas</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Intenta ajustar los filtros de búsqueda.'
                  : 'Comienza creando tu primera área de trabajo.'
                }
              </p>
              {isAdmin && !searchTerm && (
                <button
                  onClick={() => {
                    resetForm();
                    setShowCreateModal(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 mx-auto transition-colors"
                >
                  <Plus size={20} />
                  <span>Crear Primera Área</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal de creación/edición */}
        <FormModal 
          show={showCreateModal || showEditModal}
          onClose={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            resetForm();
          }}
          title={selectedArea ? 'Editar Área' : 'Nueva Área'}
        />

        {/* Modal de empleados */}
        {showEmployeesModal && selectedArea && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Empleados en {selectedArea.name}
                  </h3>
                  <p className="text-gray-600">{selectedArea.employeesCount} empleado{selectedArea.employeesCount !== 1 ? 's' : ''} asignado{selectedArea.employeesCount !== 1 ? 's' : ''}</p>
                </div>
                <button
                  onClick={() => setShowEmployeesModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedArea.employees?.map((employee) => (
                    <div key={employee.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{employee.fullName}</h4>
                          <p className="text-sm text-gray-500">{employee.identification}</p>
                          {employee.position && (
                            <p className="text-xs text-gray-600 mt-1">{employee.position}</p>
                          )}
                        </div>
                        <div className="text-right">
                          {employee.baseSalary && (
                            <p className="text-sm font-medium text-gray-900">
                              ${employee.baseSalary.toFixed(2)}
                            </p>
                          )}
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            employee.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {employee.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación de eliminación */}
        {showDeleteConfirm && selectedArea && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Confirmar Eliminación</h3>
                  <p className="text-gray-600">Esta acción no se puede deshacer</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <Building className="text-gray-600" size={20} />
                  <div>
                    <p className="font-medium text-gray-900">{selectedArea.name}</p>
                    <p className="text-sm text-gray-500">
                      {selectedArea.employeesCount} empleado{selectedArea.employeesCount !== 1 ? 's' : ''} asignado{selectedArea.employeesCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {selectedArea.employeesCount > 0 ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="text-red-600" size={16} />
                    <p className="text-red-800 text-sm font-medium">
                      No se puede eliminar un área que tiene empleados asignados.
                    </p>
                  </div>
                  <p className="text-red-700 text-sm mt-2">
                    Primero reasigna o desactiva a todos los empleados de esta área.
                  </p>
                </div>
              ) : (
                <p className="text-gray-600 mb-6">
                  ¿Estás seguro de que quieres eliminar esta área? Esta acción es permanente 
                  y no se puede deshacer.
                </p>
              )}

              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedArea(null);
                  }}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                {selectedArea.employeesCount === 0 && (
                  <button
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="animate-spin" size={16} />
                        <span>Eliminando...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        <span>Eliminar Área</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default withAuth(AreasPage);