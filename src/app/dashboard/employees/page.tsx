// src/app/dashboard/employees/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { withAuth } from '@/contexts/AuthContext';
import { employeesAPI, areasAPI } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  X,
  UserCheck,
  UserX,
  Building,
  IdCard,
  DollarSign,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

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
  };
  position?: string;
  baseSalary?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Area {
  id: string;
  name: string;
}

function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [activeOnly, setActiveOnly] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Estados del formulario
  const [formData, setFormData] = useState({
    identification: '',
    firstName: '',
    lastName: '',
    areaId: '',
    position: '',
    baseSalary: ''
  });

  useEffect(() => {
    loadAreas();
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [currentPage, searchTerm, selectedAreaId, activeOnly]);

  const loadAreas = async () => {
    try {
      const response = await areasAPI.getAll();
      setAreas(response.data || []);
    } catch (error) {
      console.error('Error cargando áreas:', error);
    }
  };

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: currentPage,
        limit,
        activeOnly,
      };

      if (searchTerm) params.search = searchTerm;
      if (selectedAreaId) params.areaId = selectedAreaId;

      const response = await employeesAPI.getAll(params);
      setEmployees(response.data || []);
      setTotal(response.meta?.total || 0);
      setTotalPages(response.meta?.totalPages || 1);
    } catch (error) {
      console.error('Error cargando empleados:', error);
      setMessage({ type: 'error', text: 'Error al cargar los empleados' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        baseSalary: formData.baseSalary ? parseFloat(formData.baseSalary) : undefined
      };

      if (editingEmployee) {
        await employeesAPI.update(editingEmployee.id, submitData);
        setMessage({ type: 'success', text: 'Empleado actualizado exitosamente' });
      } else {
        await employeesAPI.create(submitData);
        setMessage({ type: 'success', text: 'Empleado creado exitosamente' });
      }
      
      resetForm();
      loadEmployees();
    } catch (error: any) {
      console.error('Error guardando empleado:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error al guardar el empleado' 
      });
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      identification: employee.identification,
      firstName: employee.firstName,
      lastName: employee.lastName,
      areaId: employee.areaId || '',
      position: employee.position || '',
      baseSalary: employee.baseSalary?.toString() || ''
    });
    setShowCreateForm(true);
  };

  const handleToggleActive = async (employee: Employee) => {
    try {
      if (employee.isActive) {
        await employeesAPI.delete(employee.id);
        setMessage({ type: 'success', text: 'Empleado desactivado exitosamente' });
      } else {
        await employeesAPI.activate(employee.id);
        setMessage({ type: 'success', text: 'Empleado reactivado exitosamente' });
      }
      loadEmployees();
    } catch (error: any) {
      console.error('Error cambiando estado del empleado:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error al cambiar el estado del empleado' 
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
      baseSalary: ''
    });
    setEditingEmployee(null);
    setShowCreateForm(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Gestión de Empleados
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Administra la información de los {total} empleados del sistema
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                onClick={() => setShowCreateForm(true)}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Empleado
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
                <button 
                  onClick={() => setMessage(null)}
                  className="ml-auto text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, apellido o cédula..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <select
                value={selectedAreaId}
                onChange={(e) => {
                  setSelectedAreaId(e.target.value);
                  setCurrentPage(1);
                }}
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

            <div>
              <select
                value={activeOnly ? 'true' : 'false'}
                onChange={(e) => {
                  setActiveOnly(e.target.value === 'true');
                  setCurrentPage(1);
                }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="true">Solo activos</option>
                <option value="false">Todos</option>
              </select>
            </div>

            <div className="text-sm text-gray-500 flex items-center">
              <Filter className="h-4 w-4 mr-1" />
              Mostrando {employees.length} de {total} empleados
            </div>
          </div>

          {/* Lista de empleados */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-500">Cargando empleados...</p>
            </div>
          ) : (
            <>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <li key={employee.id}>
                      <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                              employee.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              <span className="text-sm font-medium">
                                {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {employee.fullName}
                                </p>
                                {!employee.isActive && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Inactivo
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-4 mt-1">
                                <div className="flex items-center text-sm text-gray-500">
                                  <IdCard className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                  <span>{employee.identification}</span>
                                </div>
                                {employee.area && (
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Building className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                    <span>{employee.area.name}</span>
                                  </div>
                                )}
                                {employee.position && (
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Users className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                    <span>{employee.position}</span>
                                  </div>
                                )}
                                {employee.baseSalary && (
                                  <div className="flex items-center text-sm text-gray-500">
                                    <DollarSign className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                    <span>${employee.baseSalary.toFixed(2)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(employee)}
                              className="p-2 text-gray-400 hover:text-indigo-600"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleActive(employee)}
                              className={`p-2 ${
                                employee.isActive 
                                  ? 'text-gray-400 hover:text-red-600' 
                                  : 'text-gray-400 hover:text-green-600'
                              }`}
                            >
                              {employee.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Mostrando{' '}
                        <span className="font-medium">{(currentPage - 1) * limit + 1}</span>
                        {' '}a{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * limit, total)}
                        </span>
                        {' '}de{' '}
                        <span className="font-medium">{total}</span>
                        {' '}resultados
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        
                        {[...Array(totalPages)].map((_, i) => {
                          const page = i + 1;
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  page === currentPage
                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            );
                          } else if (page === currentPage - 2 || page === currentPage + 2) {
                            return (
                              <span key={page} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}
                        
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {employees.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay empleados</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedAreaId || !activeOnly ? 
                  'No se encontraron empleados que coincidan con los filtros.' : 
                  'Comienza creando un nuevo empleado.'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de formulario */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Cédula / Identificación
                  </label>
                  <input
                    type="text"
                    value={formData.identification}
                    onChange={(e) => setFormData({ ...formData, identification: e.target.value })}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="1234567890"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nombres
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Juan Carlos"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Apellidos
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Pérez García"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Área de Trabajo
                  </label>
                  <select
                    value={formData.areaId}
                    onChange={(e) => setFormData({ ...formData, areaId: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Seleccionar área</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Cargo / Posición
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Trabajador Agrícola"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Salario Base (USD)
                  </label>
                  <input
                    type="number"
                    value={formData.baseSalary}
                    onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="450.00"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {editingEmployee ? 'Actualizar' : 'Crear'} Empleado
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default withAuth(EmployeesPage);