// src/app/dashboard/areas/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { withAuth } from '../../../contexts/AuthContext';
import { areasAPI } from '../../../lib/api';
import DashboardLayout from '../../../components/DashboardLayout';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  MapPin, 
  Users, 
  Clock, 
  Search,
  Building,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

interface Area {
  id: string;
  name: string;
  defaultEntryTime: string;
  defaultExitTime: string;
  defaultLunchDuration: number;
  defaultWorkingHours: number;
  employeesCount: number;
  createdAt: string;
  updatedAt: string;
}

function AreasPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    defaultEntryTime: '06:30',
    defaultExitTime: '16:00',
    defaultLunchDuration: 30,
    defaultWorkingHours: 8
  });

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    try {
      setIsLoading(true);
      const response = await areasAPI.getAll({ includeEmployees: true });
      setAreas(response.data || []);
    } catch (error) {
      console.error('Error cargando áreas:', error);
      setMessage({ type: 'error', text: 'Error al cargar las áreas' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingArea) {
        await areasAPI.update(editingArea.id, formData);
        setMessage({ type: 'success', text: 'Área actualizada exitosamente' });
      } else {
        await areasAPI.create(formData);
        setMessage({ type: 'success', text: 'Área creada exitosamente' });
      }
      
      resetForm();
      loadAreas();
    } catch (error: any) {
      console.error('Error guardando área:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error al guardar el área' 
      });
    }
  };

  const handleEdit = (area: Area) => {
    setEditingArea(area);
    setFormData({
      name: area.name,
      defaultEntryTime: area.defaultEntryTime,
      defaultExitTime: area.defaultExitTime,
      defaultLunchDuration: area.defaultLunchDuration,
      defaultWorkingHours: area.defaultWorkingHours
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (area: Area) => {
    if (!window.confirm(`¿Estás seguro de eliminar el área "${area.name}"?`)) {
      return;
    }

    try {
      await areasAPI.delete(area.id);
      setMessage({ type: 'success', text: 'Área eliminada exitosamente' });
      loadAreas();
    } catch (error: any) {
      console.error('Error eliminando área:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error al eliminar el área' 
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      defaultEntryTime: '06:30',
      defaultExitTime: '16:00',
      defaultLunchDuration: 30,
      defaultWorkingHours: 8
    });
    setEditingArea(null);
    setShowCreateForm(false);
  };

  const filteredAreas = areas.filter(area =>
    area.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Gestión de Áreas
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Administra las áreas de trabajo y sus configuraciones por defecto
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                onClick={() => setShowCreateForm(true)}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nueva Área
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

          {/* Buscador */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar áreas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Lista de áreas */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-500">Cargando áreas...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAreas.map((area) => (
                <div key={area.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Building className="h-8 w-8 text-indigo-600" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-medium text-gray-900">
                            {area.name}
                          </h3>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(area)}
                          className="p-2 text-gray-400 hover:text-indigo-600"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(area)}
                          className="p-2 text-gray-400 hover:text-red-600"
                          disabled={area.employeesCount > 0}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{area.defaultEntryTime} - {area.defaultExitTime}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{area.employeesCount} empleados</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{area.defaultWorkingHours}h laborales, {area.defaultLunchDuration}min almuerzo</span>
                      </div>
                    </div>

                    {area.employeesCount > 0 && (
                      <div className="mt-4 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                        No se puede eliminar porque tiene empleados asignados
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredAreas.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Building className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay áreas</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'No se encontraron áreas que coincidan con tu búsqueda.' : 'Comienza creando una nueva área.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de formulario */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingArea ? 'Editar Área' : 'Nueva Área'}
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
                    Nombre del Área
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ej: CULTIVO 1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Hora de Entrada
                    </label>
                    <input
                      type="time"
                      value={formData.defaultEntryTime}
                      onChange={(e) => setFormData({ ...formData, defaultEntryTime: e.target.value })}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Hora de Salida
                    </label>
                    <input
                      type="time"
                      value={formData.defaultExitTime}
                      onChange={(e) => setFormData({ ...formData, defaultExitTime: e.target.value })}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Almuerzo (minutos)
                    </label>
                    <input
                      type="number"
                      value={formData.defaultLunchDuration}
                      onChange={(e) => setFormData({ ...formData, defaultLunchDuration: parseInt(e.target.value) })}
                      required
                      min="0"
                      max="180"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Horas Laborales
                    </label>
                    <input
                      type="number"
                      value={formData.defaultWorkingHours}
                      onChange={(e) => setFormData({ ...formData, defaultWorkingHours: parseInt(e.target.value) })}
                      required
                      min="1"
                      max="12"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
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
                    {editingArea ? 'Actualizar' : 'Crear'} Área
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

export default withAuth(AreasPage);