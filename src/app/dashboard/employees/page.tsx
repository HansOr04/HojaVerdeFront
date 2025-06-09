// src/app/dashboard/employees/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { withAuth, useRole } from '@/contexts/AuthContext';
import { employeesAPI, areasAPI } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Eye,
  Building,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  X,
  Save,
  RefreshCw,
  Download,
  Upload,
  MoreHorizontal,
  UserPlus,
  Settings,
  Target
} from 'lucide-react';

// Interfaces
interface Employee {
  id: string;
  identification: string;
  firstName: string;
  lastName: string;
  fullName: string;
  areaId?: string;
  area?: {
    id: string;
    name: string;
    defaultEntryTime: string;
    defaultExitTime: string;
  };
  position?: string;
  baseSalary?: number | string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Area {
  id: string;
  name: string;
  defaultEntryTime: string;
  defaultExitTime: string;
  defaultLunchDuration: number;
  defaultWorkingHours: number;
  employeesCount: number;
}

function EmployeesPage() {
  const { isAdmin, isEditor } = useRole();
  
  // Estados principales
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [showInactive, setShowInactive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  // Estados de modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Estados de formulario
  const [formData, setFormData] = useState({
    identification: '',
    firstName: '',
    lastName: '',
    areaId: '',
    position: '',
    baseSalary: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados de UI
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Función helper para formatear salarios de forma segura
  const formatSalary = (salary: any): string => {
    if (salary === null || salary === undefined || salary === '' || salary === 0) return '-';
    
    // Convertir a número si es string
    const numSalary = typeof salary === 'string' ? parseFloat(salary) : salary;
    
    // Verificar que sea un número válido
    if (isNaN(numSalary)) return '-';
    
    return `$${numSalary.toFixed(2)}`;
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadEmployees();
    loadAreas();
  }, []);

  // Filtrar empleados
  useEffect(() => {
    let filtered = employees;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(emp => 
        emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.identification.includes(searchTerm) ||
        emp.area?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por área
    if (selectedArea) {
      filtered = filtered.filter(emp => emp.areaId === selectedArea);
    }

    // Filtro por estado activo
    if (!showInactive) {
      filtered = filtered.filter(emp => emp.isActive);
    }

    setFilteredEmployees(filtered);
    setCurrentPage(1);
  }, [employees, searchTerm, selectedArea, showInactive]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeesAPI.getAll({ 
        limit: 1000, 
        activeOnly: false 
      });
      
      // Asegurar que baseSalary sea número o null
      const safeEmployees = (response.data || []).map((emp: any) => ({
        ...emp,
        baseSalary: emp.baseSalary ? Number(emp.baseSalary) : null
      }));
      
      setEmployees(safeEmployees);
    } catch (error) {
      console.error('Error cargando empleados:', error);
      setMessage({ type: 'error', text: 'Error al cargar empleados' });
    } finally {
      setLoading(false);
    }
  };

  const loadAreas = async () => {
    try {
      const response = await areasAPI.getAll();
      setAreas(response.data || []);
    } catch (error) {
      console.error('Error cargando áreas:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    const errors: Record<string, string> = {};
    
    if (!formData.identification.trim()) {
      errors.identification = 'La identificación es requerida';
    } else if (!/^\d{8,20}$/.test(formData.identification)) {
      errors.identification = 'La identificación debe tener entre 8 y 20 dígitos';
    }
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'El nombre es requerido';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'El apellido es requerido';
    }
    
    if (formData.baseSalary && (isNaN(Number(formData.baseSalary)) || Number(formData.baseSalary) <= 0)) {
      errors.baseSalary = 'El salario debe ser un número positivo';
    }

    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      const submitData = {
        ...formData,
        firstName: formData.firstName.toUpperCase().trim(),
        lastName: formData.lastName.toUpperCase().trim(),
        baseSalary: formData.baseSalary ? Number(formData.baseSalary) : undefined,
        areaId: formData.areaId || undefined,
      };

      if (selectedEmployee) {
        await employeesAPI.update(selectedEmployee.id, submitData);
        setMessage({ type: 'success', text: 'Empleado actualizado exitosamente' });
        setShowEditModal(false);
      } else {
        await employeesAPI.create(submitData);
        setMessage({ type: 'success', text: 'Empleado creado exitosamente' });
        setShowCreateModal(false);
      }
      
      resetForm();
      loadEmployees();
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error al guardar empleado' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      identification: employee.identification,
      firstName: employee.firstName,
      lastName: employee.lastName,
      areaId: employee.areaId || '',
      position: employee.position || '',
      baseSalary: employee.baseSalary ? employee.baseSalary.toString() : '',
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    if (!selectedEmployee) return;

    try {
      setIsSubmitting(true);
      await employeesAPI.delete(selectedEmployee.id);
      setMessage({ type: 'success', text: 'Empleado desactivado exitosamente' });
      setShowDeleteConfirm(false);
      setSelectedEmployee(null);
      loadEmployees();
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error al desactivar empleado' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivate = async (employee: Employee) => {
    try {
      await employeesAPI.activate(employee.id);
      setMessage({ type: 'success', text: 'Empleado reactivado exitosamente' });
      loadEmployees();
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error al reactivar empleado' 
      });
    }
  };

  const resetForm = () => {
    setFormData({
      identification: '',
      firstName: '',
      lastName: '',
      areaId: '',
      position: '',
      baseSalary: '',
    });
    setFormErrors({});
    setSelectedEmployee(null);
  };

  // Paginación
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);

  // Estadísticas
  const stats = {
    total: employees.length,
    active: employees.filter(e => e.isActive).length,
    inactive: employees.filter(e => !e.isActive).length,
    withArea: employees.filter(e => e.areaId).length,
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Identificación *
                </label>
                <input
                  type="text"
                  value={formData.identification}
                  onChange={(e) => setFormData(prev => ({ ...prev, identification: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    formErrors.identification ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: 1234567890"
                  disabled={isSubmitting}
                />
                {formErrors.identification && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.identification}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Área de Trabajo
                </label>
                <select
                  value={formData.areaId}
                  onChange={(e) => setFormData(prev => ({ ...prev, areaId: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={isSubmitting}
                >
                  <option value="">Sin área asignada</option>
                  {areas.map(area => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombres *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Juan Carlos"
                  disabled={isSubmitting}
                />
                {formErrors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellidos *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Pérez García"
                  disabled={isSubmitting}
                />
                {formErrors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cargo/Posición
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ej: Trabajador Agrícola"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salario Base (USD)
                </label>
                <input
                  type="number"
                  value={formData.baseSalary}
                  onChange={(e) => setFormData(prev => ({ ...prev, baseSalary: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    formErrors.baseSalary ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: 450.00"
                  min="0"
                  step="0.01"
                  disabled={isSubmitting}
                />
                {formErrors.baseSalary && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.baseSalary}</p>
                )}
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
                    <span>{selectedEmployee ? 'Actualizar' : 'Crear'} Empleado</span>
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
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Gestión de Empleados</h1>
                  <p className="text-gray-600">Administra la información de los empleados del sistema</p>
                </div>
              </div>
              
              {(isAdmin || isEditor) && (
                <button
                  onClick={() => {
                    resetForm();
                    setShowCreateModal(true);
                  }}
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all transform hover:scale-105 shadow-lg"
                >
                  <Plus size={20} />
                  <span>Nuevo Empleado</span>
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
                  <p className="text-sm font-medium text-gray-600">Total Empleados</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="text-blue-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Empleados Activos</p>
                  <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <UserCheck className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Empleados Inactivos</p>
                  <p className="text-3xl font-bold text-red-600">{stats.inactive}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <UserX className="text-red-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Con Área Asignada</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.withArea}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Building className="text-purple-600" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar empleado
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nombre, cédula, área..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por área
                </label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Todas las áreas</option>
                  {areas.map(area => (
                    <option key={area.id} value={area.id}>
                      {area.name} ({area.employeesCount})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showInactive}
                    onChange={(e) => setShowInactive(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Mostrar inactivos
                  </span>
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors flex items-center space-x-2"
                >
                  <Eye size={16} />
                  <span>{viewMode === 'table' ? 'Vista Grilla' : 'Vista Tabla'}</span>
                </button>
                <button
                  onClick={loadEmployees}
                  className="px-4 py-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl transition-colors"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Lista de empleados */}
          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <RefreshCw className="animate-spin mx-auto mb-4 text-indigo-600" size={48} />
              <p className="text-gray-600">Cargando empleados...</p>
            </div>
          ) : viewMode === 'table' ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Empleado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Área
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cargo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Salario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedEmployees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {employee.fullName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {employee.identification}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {employee.area ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              {employee.area.name}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">Sin área</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.position || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                         {formatSalary(employee.baseSalary)}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                           employee.isActive 
                             ? 'bg-green-100 text-green-800' 
                             : 'bg-red-100 text-red-800'
                         }`}>
                           {employee.isActive ? 'Activo' : 'Inactivo'}
                         </span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                         <div className="flex items-center justify-end space-x-2">
                           {(isAdmin || isEditor) && (
                             <>
                               <button
                                 onClick={() => handleEdit(employee)}
                                 className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                                 title="Editar empleado"
                               >
                                 <Edit size={16} />
                               </button>
                               
                               {employee.isActive ? (
                                 <button
                                   onClick={() => {
                                     setSelectedEmployee(employee);
                                     setShowDeleteConfirm(true);
                                   }}
                                   className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                   title="Desactivar empleado"
                                 >
                                   <UserX size={16} />
                                 </button>
                               ) : (
                                 <button
                                   onClick={() => handleActivate(employee)}
                                   className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-colors"
                                   title="Reactivar empleado"
                                 >
                                   <UserCheck size={16} />
                                 </button>
                               )}
                             </>
                           )}
                         </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>

             {/* Paginación */}
             {totalPages > 1 && (
               <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                 <div className="flex-1 flex justify-between sm:hidden">
                   <button
                     onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                     disabled={currentPage === 1}
                     className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                   >
                     Anterior
                   </button>
                   <button
                     onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                     disabled={currentPage === totalPages}
                     className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                   >
                     Siguiente
                   </button>
                 </div>
                 <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                   <div>
                     <p className="text-sm text-gray-700">
                       Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                       <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredEmployees.length)}</span> de{' '}
                       <span className="font-medium">{filteredEmployees.length}</span> empleados
                     </p>
                   </div>
                   <div>
                     <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                       <button
                         onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                         disabled={currentPage === 1}
                         className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                       >
                         Anterior
                       </button>
                       {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                         const page = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4 + i));
                         return (
                           <button
                             key={page}
                             onClick={() => setCurrentPage(page)}
                             className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                               currentPage === page
                                 ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                 : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                             }`}
                           >
                             {page}
                           </button>
                         );
                       })}
                       <button
                         onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                         disabled={currentPage === totalPages}
                         className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                       >
                         Siguiente
                       </button>
                     </nav>
                   </div>
                 </div>
               </div>
             )}
           </div>
         ) : (
           /* Vista de grilla */
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {paginatedEmployees.map((employee) => (
               <div key={employee.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                 <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center space-x-3">
                     <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center">
                       <span className="text-white font-bold text-lg">
                         {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                       </span>
                     </div>
                     <div>
                       <h3 className="font-semibold text-gray-900">{employee.fullName}</h3>
                       <p className="text-sm text-gray-500">{employee.identification}</p>
                     </div>
                   </div>
                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                     employee.isActive 
                       ? 'bg-green-100 text-green-800' 
                       : 'bg-red-100 text-red-800'
                   }`}>
                     {employee.isActive ? 'Activo' : 'Inactivo'}
                   </span>
                 </div>

                 <div className="space-y-3">
                   <div className="flex items-center space-x-2">
                     <Building className="text-gray-400" size={16} />
                     <span className="text-sm text-gray-600">
                       {employee.area?.name || 'Sin área asignada'}
                     </span>
                   </div>
                   
                   {employee.position && (
                     <div className="flex items-center space-x-2">
                       <Target className="text-gray-400" size={16} />
                       <span className="text-sm text-gray-600">{employee.position}</span>
                     </div>
                   )}
                   
                   {employee.baseSalary && (
                     <div className="flex items-center space-x-2">
                       <DollarSign className="text-gray-400" size={16} />
                       <span className="text-sm text-gray-600">{formatSalary(employee.baseSalary)}</span>
                     </div>
                   )}
                 </div>

                 {(isAdmin || isEditor) && (
                   <div className="flex items-center justify-end space-x-2 mt-6 pt-4 border-t border-gray-200">
                     <button
                       onClick={() => handleEdit(employee)}
                       className="flex items-center space-x-1 px-3 py-2 text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                     >
                       <Edit size={14} />
                       <span>Editar</span>
                     </button>
                     
                     {employee.isActive ? (
                       <button
                         onClick={() => {
                           setSelectedEmployee(employee);
                           setShowDeleteConfirm(true);
                         }}
                         className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                       >
                         <UserX size={14} />
                         <span>Desactivar</span>
                       </button>
                     ) : (
                       <button
                         onClick={() => handleActivate(employee)}
                         className="flex items-center space-x-1 px-3 py-2 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                       >
                         <UserCheck size={14} />
                         <span>Activar</span>
                       </button>
                     )}
                   </div>
                 )}
               </div>
             ))}
           </div>
         )}

         {/* Sin resultados */}
         {!loading && filteredEmployees.length === 0 && (
           <div className="bg-white rounded-xl shadow-lg p-12 text-center">
             <Users className="mx-auto mb-4 text-gray-400" size={48} />
             <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron empleados</h3>
             <p className="text-gray-600 mb-6">
               {searchTerm || selectedArea || showInactive 
                 ? 'Intenta ajustar los filtros de búsqueda.'
                 : 'Comienza agregando tu primer empleado al sistema.'
               }
             </p>
             {(isAdmin || isEditor) && (
               <button
                 onClick={() => {
                   resetForm();
                   setShowCreateModal(true);
                 }}
                 className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 mx-auto transition-colors"
               >
                 <Plus size={20} />
                 <span>Agregar Empleado</span>
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
         title={selectedEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
       />

       {/* Modal de confirmación de eliminación */}
       {showDeleteConfirm && selectedEmployee && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
           <div className="bg-white rounded-2xl max-w-md w-full p-6">
             <div className="flex items-center space-x-4 mb-6">
               <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                 <AlertCircle className="text-red-600" size={24} />
               </div>
               <div>
                 <h3 className="text-lg font-bold text-gray-900">Confirmar Desactivación</h3>
                 <p className="text-gray-600">Esta acción desactivará al empleado</p>
               </div>
             </div>

             <div className="bg-gray-50 rounded-xl p-4 mb-6">
               <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center">
                   <span className="text-white font-medium text-sm">
                     {selectedEmployee.firstName.charAt(0)}{selectedEmployee.lastName.charAt(0)}
                   </span>
                 </div>
                 <div>
                   <p className="font-medium text-gray-900">{selectedEmployee.fullName}</p>
                   <p className="text-sm text-gray-500">{selectedEmployee.identification}</p>
                 </div>
               </div>
             </div>

             <p className="text-gray-600 mb-6">
               El empleado será marcado como inactivo y no aparecerá en los registros de asistencia. 
               Podrás reactivarlo más tarde si es necesario.
             </p>

             <div className="flex items-center justify-end space-x-4">
               <button
                 onClick={() => {
                   setShowDeleteConfirm(false);
                   setSelectedEmployee(null);
                 }}
                 className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                 disabled={isSubmitting}
               >
                 Cancelar
               </button>
               <button
                 onClick={handleDelete}
                 disabled={isSubmitting}
                 className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors flex items-center space-x-2 disabled:opacity-50"
               >
                 {isSubmitting ? (
                   <>
                     <RefreshCw className="animate-spin" size={16} />
                     <span>Desactivando...</span>
                   </>
                 ) : (
                   <>
                     <UserX size={16} />
                     <span>Desactivar Empleado</span>
                   </>
                 )}
               </button>
             </div>
           </div>
         </div>
       )}
     </div>
   </DashboardLayout>
 );
}

export default withAuth(EmployeesPage);