// src/app/dashboard/attendance/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { withAuth } from '../../../contexts/AuthContext';
import { areasAPI, employeesAPI, attendanceAPI } from '../../../lib/api';
import DashboardLayout from '../../../components/DashboardLayout';
import { 
  Calendar, 
  Users, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Settings,
  MapPin,
  Coffee,
  Utensils,
  Car,
  Plus,
  Minus,
  RefreshCw,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Zap,
  FileSpreadsheet,
  Calculator,
  DollarSign,
  Target
} from 'lucide-react';

// Tipos de datos
interface Area {
  id: string;
  name: string;
  defaultEntryTime: string;
  defaultExitTime: string;
  defaultLunchDuration: number;
  defaultWorkingHours: number;
}

interface Employee {
  id: string;
  identification: string;
  firstName: string;
  lastName: string;
  fullName: string;
  position: string;
  defaultValues: {
    entryTime: string;
    exitTime: string;
    lunchDuration: number;
    isVacation: boolean;
    permissionHours: number;
    foodAllowance: {
      breakfast: number;
      lunch: number;
      transport: number;
    };
  };
}

interface AreaWithEmployees {
  area: Area;
  employees: Employee[];
  employeesCount: number;
}

interface AttendanceRecord {
  employeeId: string;
  entryTime: string;
  exitTime: string;
  lunchDuration: number;
  isVacation: boolean;
  status: string;
  vacationStartDate: string;
  vacationEndDate: string;
  permissionHours: number;
  permissionReason: string;
  observations: string;
  foodAllowance: {
    breakfast: number;
    reinforcedBreakfast: number;
    snack1: number;
    afternoonSnack: number;
    dryMeal: number;
    lunch: number;
    transport: number;
  };
}

interface DefaultSettings {
  standardEntry: string;
  standardExit: string;
  lunchDuration: number;
  foodAllowance: {
    breakfast: number;
    reinforcedBreakfast: number;
    snack1: number;
    afternoonSnack: number;
    dryMeal: number;
    lunch: number;
    transport: number;
  };
}

function AttendancePage() {
  // Estados principales
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([]);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [employeesByArea, setEmployeesByArea] = useState<AreaWithEmployees[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceRecord>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Configuración personalizable
  const [defaultSettings, setDefaultSettings] = useState<DefaultSettings>({
    standardEntry: '06:30',
    standardExit: '16:00',
    lunchDuration: 30,
    foodAllowance: {
      breakfast: 0,
      reinforcedBreakfast: 0,
      snack1: 0,
      afternoonSnack: 0,
      dryMeal: 0,
      lunch: 0,
      transport: 0,
    }
  });

  // Estados de control
  const [isLoadingAreas, setIsLoadingAreas] = useState(true);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Funciones principales
  useEffect(() => {
    loadAreas();
  }, []);

  useEffect(() => {
    if (selectedAreaIds.length > 0) {
      loadEmployeesByAreas();
    } else {
      setEmployeesByArea([]);
      setAttendanceRecords({});
    }
  }, [selectedAreaIds, defaultSettings]);

  const loadAreas = async () => {
    try {
      setIsLoadingAreas(true);
      const response = await areasAPI.getAll();
      setAreas(response.data || []);
    } catch (error) {
      console.error('Error cargando áreas:', error);
      setMessage({ type: 'error', text: 'Error al cargar las áreas' });
    } finally {
      setIsLoadingAreas(false);
    }
  };

  const loadEmployeesByAreas = async () => {
    try {
      setIsLoadingEmployees(true);
      const response = await employeesAPI.getByMultipleAreas(selectedAreaIds);
      setEmployeesByArea(response.data || []);
      
      const initialRecords: Record<string, AttendanceRecord> = {};
      response.data?.forEach((areaData: AreaWithEmployees) => {
        areaData.employees.forEach((employee: Employee) => {
          initialRecords[employee.id] = {
            employeeId: employee.id,
            entryTime: defaultSettings.standardEntry,
            exitTime: defaultSettings.standardExit,
            lunchDuration: defaultSettings.lunchDuration,
            isVacation: false,
            status: 'Normal',
            vacationStartDate: '',
            vacationEndDate: '',
            permissionHours: 0,
            permissionReason: '',
            observations: '',
            foodAllowance: { ...defaultSettings.foodAllowance },
          };
        });
      });
      setAttendanceRecords(initialRecords);
      
      setMessage({ 
        type: 'success', 
        text: `✅ Cargados ${response.meta?.totalEmployees || 0} empleados con valores personalizados` 
      });
    } catch (error) {
      console.error('Error cargando empleados:', error);
      setMessage({ type: 'error', text: 'Error al cargar empleados' });
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const handleAreaSelection = (areaId: string, checked: boolean) => {
    if (checked) {
      setSelectedAreaIds(prev => [...prev, areaId]);
    } else {
      setSelectedAreaIds(prev => prev.filter(id => id !== areaId));
    }
  };

  const updateEmployeeRecord = (employeeId: string, field: string, value: any) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [field]: value,
      },
    }));
  };

  const updateFoodAllowance = (employeeId: string, field: string, value: number) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        foodAllowance: {
          ...prev[employeeId].foodAllowance,
          [field]: Math.max(0, Math.min(10, value)),
        },
      },
    }));
  };

  const applyBulkUpdate = (field: string, value: any) => {
    if (selectedRows.size === 0) return;
    
    const updatedRecords = { ...attendanceRecords };
    selectedRows.forEach(employeeId => {
      if (field.startsWith('foodAllowance.')) {
        const foodField = field.replace('foodAllowance.', '');
        updatedRecords[employeeId] = {
          ...updatedRecords[employeeId],
          foodAllowance: {
            ...updatedRecords[employeeId].foodAllowance,
            [foodField]: value,
          },
        };
      } else {
        updatedRecords[employeeId] = {
          ...updatedRecords[employeeId],
          [field]: value,
        };
      }
    });
    setAttendanceRecords(updatedRecords);
    setSelectedRows(new Set());
    setMessage({ type: 'info', text: `✨ Actualizado ${selectedRows.size} empleados seleccionados` });
  };

  const handleBulkSave = async () => {
    try {
      setSaving(true);
      setSaveProgress(0);
      
      const records = Object.values(attendanceRecords);
      
      const progressSteps = [
        { progress: 20, message: 'Validando datos...' },
        { progress: 40, message: 'Preparando registros...' },
        { progress: 60, message: 'Enviando al servidor...' },
        { progress: 80, message: 'Guardando en base de datos...' },
        { progress: 95, message: 'Finalizando proceso...' },
      ];

      for (const step of progressSteps) {
        setSaveProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      const response = await attendanceAPI.bulkCreate({
        date,
        records,
      });
      
      setSaveProgress(100);
      setMessage({
        type: 'success',
        text: `🚀 ¡Guardado exitoso! ${response.data.processed} empleados registrados en ${response.data.timeElapsed}`,
      });
      
    } catch (error: any) {
      console.error('Error guardando asistencia:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al guardar la asistencia',
      });
    } finally {
      setSaving(false);
      setSaveProgress(0);
    }
  };

  // Obtener todos los empleados para la tabla
  const allEmployees = employeesByArea.flatMap(areaData => 
    areaData.employees.map(emp => ({ ...emp, areaName: areaData.area.name }))
  );

  // Filtrar empleados
  const filteredEmployees = allEmployees.filter(emp => 
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.identification.includes(searchTerm) ||
    emp.areaName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular totales
  const calculateTotals = () => {
    const records = Object.values(attendanceRecords);
    return {
      totalBreakfast: records.reduce((sum, r) => sum + r.foodAllowance.breakfast, 0),
      totalReinforcedBreakfast: records.reduce((sum, r) => sum + r.foodAllowance.reinforcedBreakfast, 0),
      totalSnack1: records.reduce((sum, r) => sum + r.foodAllowance.snack1, 0),
      totalAfternoonSnack: records.reduce((sum, r) => sum + r.foodAllowance.afternoonSnack, 0),
      totalDryMeal: records.reduce((sum, r) => sum + r.foodAllowance.dryMeal, 0),
      totalLunch: records.reduce((sum, r) => sum + r.foodAllowance.lunch, 0),
      totalTransport: records.reduce((sum, r) => sum + r.foodAllowance.transport, 0),
      totalEmployees: records.length,
      vacationCount: records.filter(r => r.isVacation).length,
      permissionCount: records.filter(r => r.permissionHours > 0).length,
    };
  };

  // Obtener empleados de vacaciones
  const getVacationEmployees = () => {
    return allEmployees.filter(emp => {
      const record = attendanceRecords[emp.id];
      return record && record.isVacation;
    });
  };

  const totals = calculateTotals();
  const totalEmployees = employeesByArea.reduce((sum, area) => sum + area.employeesCount, 0);
  const vacationEmployees = getVacationEmployees();

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FileSpreadsheet className="text-white" size={24} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Registro de Asistencia - Vista Excel</h1>
                    <p className="text-gray-600">Sistema optimizado tipo hoja de cálculo</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Fecha seleccionada</div>
                <div className="font-semibold text-gray-900">
                  {new Date(date + 'T00:00:00').toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Mensaje de estado */}
          {message && (
            <div className={`rounded-xl p-4 shadow-lg border-l-4 ${
              message.type === 'success' ? 'bg-green-50 border-green-400 text-green-800' :
              message.type === 'error' ? 'bg-red-50 border-red-400 text-red-800' :
              'bg-blue-50 border-blue-400 text-blue-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {message.type === 'success' ? <CheckCircle size={20} /> : 
                   message.type === 'error' ? <AlertCircle size={20} /> : 
                   <AlertCircle size={20} />}
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

          {/* Panel de configuración */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Fecha */}
            <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
              <div className="flex items-center space-x-2 mb-3">
                <Calendar className="text-blue-600" size={18} />
                <h3 className="font-semibold text-gray-900">Fecha</h3>
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Configuración */}
            <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Settings className="text-purple-600" size={18} />
                  <h3 className="font-semibold text-gray-900">Configuración</h3>
                </div>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  {showSettings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
              
              {showSettings && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="time"
                      value={defaultSettings.standardEntry}
                      onChange={(e) => setDefaultSettings(prev => ({ ...prev, standardEntry: e.target.value }))}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    />
                    <input
                      type="time"
                      value={defaultSettings.standardExit}
                      onChange={(e) => setDefaultSettings(prev => ({ ...prev, standardExit: e.target.value }))}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Estadísticas */}
            <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
              <div className="flex items-center space-x-2 mb-3">
                <Users className="text-green-600" size={18} />
                <h3 className="font-semibold text-gray-900">Empleados</h3>
              </div>
              <div className="text-2xl font-bold text-green-600">{totalEmployees}</div>
              <div className="text-xs text-gray-600">Total cargados</div>
            </div>

            {/* Búsqueda */}
            <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
              <div className="flex items-center space-x-2 mb-3">
                <Search className="text-indigo-600" size={18} />
                <h3 className="font-semibold text-gray-900">Búsqueda</h3>
              </div>
              <input
                type="text"
                placeholder="Buscar empleado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Selección de áreas */}
          <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <MapPin className="text-indigo-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">Seleccionar Áreas</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {areas.map((area) => (
                <label 
                  key={area.id} 
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedAreaIds.includes(area.id) 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedAreaIds.includes(area.id)}
                    onChange={(e) => handleAreaSelection(area.id, e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border-2 mr-2 flex items-center justify-center ${
                    selectedAreaIds.includes(area.id) 
                      ? 'border-indigo-500 bg-indigo-500' 
                      : 'border-gray-300'
                  }`}>
                    {selectedAreaIds.includes(area.id) && (
                      <CheckCircle className="text-white" size={10} />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{area.name}</div>
                    <div className="text-xs text-gray-600">
                      {area.defaultEntryTime} - {area.defaultExitTime}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* TABLA EXCEL PRINCIPAL */}
          {totalEmployees > 0 && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Header de la tabla */}
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <FileSpreadsheet className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Tabla de Registro - Vista Excel</h3>
                      <p className="text-indigo-100">Edita directamente en la tabla ({filteredEmployees.length} empleados)</p>
                    </div>
                  </div>
                  {selectedRows.size > 0 && (
                    <div className="flex items-center space-x-2 bg-white/20 rounded-xl px-4 py-3">
                      <Target className="text-white" size={20} />
                      <span className="text-white font-bold">{selectedRows.size} seleccionados</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Barra de acciones masivas */}
              {selectedRows.size > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b-2 border-amber-200 px-8 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <span className="text-lg font-bold text-amber-800">
                        Acciones masivas para {selectedRows.size} empleados:
                      </span>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => applyBulkUpdate('foodAllowance.breakfast', 1)}
                          className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-xl text-sm font-bold transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2"
                        >
                          <Coffee size={16} />
                          <span>Desayuno = 1</span>
                        </button>
                        <button
                          onClick={() => applyBulkUpdate('foodAllowance.lunch', 1)}
                          className="px-4 py-2 bg-green-400 hover:bg-green-500 text-green-900 rounded-xl text-sm font-bold transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2"
                        >
                          <Utensils size={16} />
                          <span>Almuerzo = 1</span>
                        </button>
                        <button
                          onClick={() => applyBulkUpdate('foodAllowance.transport', 2.5)}
                          className="px-4 py-2 bg-blue-400 hover:bg-blue-500 text-blue-900 rounded-xl text-sm font-bold transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2"
                        >
                          <Car size={16} />
                          <span>Transporte = $2.50</span>
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedRows(new Set())}
                      className="text-amber-700 hover:text-amber-900 font-bold bg-white px-4 py-2 rounded-xl border-2 border-amber-300 hover:border-amber-400 transition-all"
                    >
                      Limpiar selección
                    </button>
                  </div>
                </div>
              )}

              {/* Tabla Excel */}
              <div className="overflow-y-auto max-h-96">
                <table className="w-full table-fixed divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-20">
                    <tr>
                      <th className="w-12 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-30 border-r border-gray-200">
                        <input
                          type="checkbox"
                          checked={selectedRows.size === filteredEmployees.length && filteredEmployees.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRows(new Set(filteredEmployees.map(emp => emp.id)));
                            } else {
                              setSelectedRows(new Set());
                            }
                          }}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </th>
                      <th className="w-56 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-12 bg-gray-50 z-30 border-r border-gray-200">
                        Empleado
                      </th>
                      <th className="w-20 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100">
                        Área
                      </th>
                      <th className="w-20 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100">
                        Entrada
                      </th>
                      <th className="w-20 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100">
                        Salida
                      </th>
                      <th className="w-20 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100">
                        Estado
                      </th>
                      <th className="w-16 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-yellow-100">
                        <div className="flex items-center justify-center space-x-1">
                          <Coffee size={14} className="text-yellow-600" />
                          <span>Des.</span>
                        </div>
                      </th>
                      <th className="w-16 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-yellow-100">
                        <div className="flex items-center justify-center space-x-1">
                          <Coffee size={14} className="text-yellow-600" />
                          <span>D.R.</span>
                        </div>
                      </th>
                      <th className="w-16 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-100">
                        <div className="flex items-center justify-center space-x-1">
                          <Coffee size={14} className="text-green-600" />
                          <span>Ref.</span>
                        </div>
                      </th>
                      <th className="w-16 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-100">
                        <div className="flex items-center justify-center space-x-1">
                          <Coffee size={14} className="text-green-600" />
                          <span>Mer.</span>
                        </div>
                      </th>
                      <th className="w-16 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-orange-100">
                        <div className="flex items-center justify-center space-x-1">
                          <Utensils size={14} className="text-orange-600" />
                          <span>R.S.</span>
                        </div>
                      </th>
                      <th className="w-16 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-100">
                        <div className="flex items-center justify-center space-x-1">
                          <Utensils size={14} className="text-green-600" />
                          <span>Alm.</span>
                        </div>
                      </th>
                      <th className="w-20 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-100">
                        <div className="flex items-center justify-center space-x-1">
                          <Car size={14} className="text-blue-600" />
                          <span>Trans.</span>
                        </div>
                      </th>
                      <th className="w-20 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-purple-100">
                        Permisos (h)
                      </th>
                      <th className="w-28 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-purple-100">
                        Razón
                      </th>
                      <th className="w-28 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100">
                       Observaciones
                     </th>
                   </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                   {filteredEmployees.map((employee, index) => {
                     const record = attendanceRecords[employee.id];
                     if (!record) return null;
                     
                     const isSelected = selectedRows.has(employee.id);
                     
                     return (
                       <tr 
                         key={employee.id} 
                         className={`hover:bg-gray-50 transition-colors ${
                           isSelected ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                         } ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                       >
                         {/* Checkbox de selección */}
                         <td className="px-3 py-3 whitespace-nowrap sticky left-0 bg-white z-20 border-r border-gray-200">
                           <input
                             type="checkbox"
                             checked={isSelected}
                             onChange={(e) => {
                               const newSelected = new Set(selectedRows);
                               if (e.target.checked) {
                                 newSelected.add(employee.id);
                               } else {
                                 newSelected.delete(employee.id);
                               }
                               setSelectedRows(newSelected);
                             }}
                             className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                           />
                         </td>
                         
                         {/* Información del empleado (sticky) - MEJORADO */}
                         <td className="px-4 py-3 whitespace-nowrap sticky left-12 bg-white z-20 border-r border-gray-200">
                           <div className="flex flex-col">
                             <div className="text-sm font-medium text-gray-900">
                               {employee.firstName}
                             </div>
                             <div className="text-sm font-medium text-gray-900">
                               {employee.lastName}
                             </div>
                             <div className="text-xs text-gray-500 mt-1">
                               {employee.identification}
                             </div>
                           </div>
                         </td>
                         
                         {/* Área */}
                         <td className="px-2 py-3 whitespace-nowrap">
                           <span className="inline-flex items-center px-1 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800 truncate">
                             {employee.areaName}
                           </span>
                         </td>
                         
                         {/* Horarios */}
                         <td className="px-2 py-3 whitespace-nowrap">
                           <input
                             type="time"
                             value={record.entryTime}
                             onChange={(e) => updateEmployeeRecord(employee.id, 'entryTime', e.target.value)}
                             disabled={record.isVacation}
                             className="w-full text-xs border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                           />
                         </td>
                         
                         <td className="px-2 py-3 whitespace-nowrap">
                           <input
                             type="time"
                             value={record.exitTime}
                             onChange={(e) => updateEmployeeRecord(employee.id, 'exitTime', e.target.value)}
                             disabled={record.isVacation}
                             className="w-full text-xs border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                           />
                         </td>
                         
                         {/* Estado */}
                         <td className="px-2 py-3 whitespace-nowrap">
                           <input
                             type="text"
                             value={record.status}
                             onChange={(e) => {
                               const newStatus = e.target.value;
                               updateEmployeeRecord(employee.id, 'status', newStatus);
                               // Detectar si es vacaciones para actualizar isVacation
                               const isVacationStatus = newStatus.toLowerCase().includes('vacacion');
                               updateEmployeeRecord(employee.id, 'isVacation', isVacationStatus);
                             }}
                             placeholder="Estado..."
                             className="w-full text-xs border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                           />
                         </td>
                         
                         {/* Controles de alimentación simplificados */}
                         <td className="px-2 py-3 whitespace-nowrap bg-yellow-50">
                           <input
                             type="number"
                             value={record.foodAllowance.breakfast}
                             onChange={(e) => updateFoodAllowance(employee.id, 'breakfast', parseInt(e.target.value) || 0)}
                             min="0"
                             max="10"
                             className="w-full text-xs border border-yellow-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-yellow-500 bg-white text-center"
                           />
                         </td>
                         
                         <td className="px-2 py-3 whitespace-nowrap bg-yellow-50">
                           <input
                             type="number"
                             value={record.foodAllowance.reinforcedBreakfast}
                             onChange={(e) => updateFoodAllowance(employee.id, 'reinforcedBreakfast', parseInt(e.target.value) || 0)}
                             min="0"
                             max="10"
                             className="w-full text-xs border border-yellow-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-yellow-500 bg-white text-center"
                           />
                         </td>
                         
                         <td className="px-2 py-3 whitespace-nowrap bg-green-50">
                           <input
                             type="number"
                             value={record.foodAllowance.snack1}
                             onChange={(e) => updateFoodAllowance(employee.id, 'snack1', parseInt(e.target.value) || 0)}
                             min="0"
                             max="10"
                             className="w-full text-xs border border-green-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-green-500 bg-white text-center"
                           />
                         </td>
                         
                         <td className="px-2 py-3 whitespace-nowrap bg-green-50">
                           <input
                             type="number"
                             value={record.foodAllowance.afternoonSnack}
                             onChange={(e) => updateFoodAllowance(employee.id, 'afternoonSnack', parseInt(e.target.value) || 0)}
                             min="0"
                             max="10"
                             className="w-full text-xs border border-green-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-green-500 bg-white text-center"
                           />
                         </td>
                         
                         <td className="px-2 py-3 whitespace-nowrap bg-orange-50">
                           <input
                             type="number"
                             value={record.foodAllowance.dryMeal}
                             onChange={(e) => updateFoodAllowance(employee.id, 'dryMeal', parseInt(e.target.value) || 0)}
                             min="0"
                             max="10"
                             className="w-full text-xs border border-orange-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white text-center"
                           />
                         </td>
                         
                         <td className="px-2 py-3 whitespace-nowrap bg-green-50">
                           <input
                             type="number"
                             value={record.foodAllowance.lunch}
                             onChange={(e) => updateFoodAllowance(employee.id, 'lunch', parseInt(e.target.value) || 0)}
                             min="0"
                             max="10"
                             className="w-full text-xs border border-green-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-green-500 bg-white text-center"
                           />
                         </td>
                         
                         {/* Transporte */}
                         <td className="px-2 py-3 whitespace-nowrap bg-blue-50">
                           <input
                             type="number"
                             value={record.foodAllowance.transport}
                             onChange={(e) => updateFoodAllowance(employee.id, 'transport', parseFloat(e.target.value) || 0)}
                             min="0"
                             max="50"
                             step="0.25"
                             className="w-full text-xs border border-blue-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-center"
                             placeholder="0.00"
                           />
                         </td>
                         
                         {/* Permisos */}
                         <td className="px-2 py-3 whitespace-nowrap bg-purple-50">
                           <input
                             type="number"
                             value={record.permissionHours}
                             onChange={(e) => updateEmployeeRecord(employee.id, 'permissionHours', parseFloat(e.target.value) || 0)}
                             min="0"
                             max="8"
                             step="0.5"
                             className="w-full text-xs border border-purple-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white text-center"
                           />
                         </td>
                         
                         {/* Razón Permiso */}
                         <td className="px-2 py-3 bg-purple-50">
                           <input
                             type="text"
                             value={record.permissionReason}
                             onChange={(e) => updateEmployeeRecord(employee.id, 'permissionReason', e.target.value)}
                             placeholder="Razón..."
                             className="w-full text-xs border border-purple-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white"
                           />
                         </td>

                         {/* Observaciones */}
                         <td className="px-2 py-3 bg-gray-50">
                           <input
                             type="text"
                             value={record.observations}
                             onChange={(e) => updateEmployeeRecord(employee.id, 'observations', e.target.value)}
                             placeholder="Observaciones..."
                             className="w-full text-xs border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-gray-500 bg-white"
                           />
                         </td>
                       </tr>
                     );
                   })}
                   
                   {/* Fila de totales */}
                   <tr className="bg-gradient-to-r from-gray-800 to-gray-900 text-white font-bold border-t-4 border-gray-600 sticky bottom-0">
                     <td className="px-3 py-4 sticky left-0 bg-gray-800 z-20 border-r border-gray-600">
                       <Calculator size={16} className="text-gray-300" />
                     </td>
                     <td className="px-4 py-4 sticky left-12 bg-gray-800 z-20 border-r border-gray-600">
                       <div className="flex items-center space-x-2">
                         <Calculator size={16} className="text-gray-300" />
                         <span className="text-sm font-bold text-white">TOTALES</span>
                       </div>
                     </td>
                     <td className="px-2 py-4 text-xs text-gray-300 text-center">
                       {selectedAreaIds.length}
                     </td>
                     <td className="px-2 py-4 text-xs text-gray-300 text-center">-</td>
                     <td className="px-2 py-4 text-xs text-gray-300 text-center">-</td>
                     <td className="px-2 py-4 text-xs text-gray-300 text-center">
                       {totals.totalEmployees}
                     </td>
                     <td className="px-2 py-4 bg-yellow-600 text-center">
                       <div className="text-sm font-black text-white">{totals.totalBreakfast}</div>
                     </td>
                     <td className="px-2 py-4 bg-amber-600 text-center">
                       <div className="text-sm font-black text-white">{totals.totalReinforcedBreakfast}</div>
                     </td>
                     <td className="px-2 py-4 bg-green-600 text-center">
                       <div className="text-sm font-black text-white">{totals.totalSnack1}</div>
                     </td>
                     <td className="px-2 py-4 bg-emerald-600 text-center">
                       <div className="text-sm font-black text-white">{totals.totalAfternoonSnack}</div>
                     </td>
                     <td className="px-2 py-4 bg-orange-600 text-center">
                       <div className="text-sm font-black text-white">{totals.totalDryMeal}</div>
                     </td>
                     <td className="px-2 py-4 bg-teal-600 text-center">
                       <div className="text-sm font-black text-white">{totals.totalLunch}</div>
                     </td>
                     <td className="px-2 py-4 bg-blue-600 text-center">
                       <div className="text-sm font-black text-white">${totals.totalTransport.toFixed(2)}</div>
                     </td>
                     <td className="px-2 py-4 bg-purple-600 text-center">
                       <div className="text-sm font-black text-white">{totals.permissionCount}</div>
                     </td>
                     <td className="px-2 py-4 bg-purple-600 text-center text-xs text-purple-100">-</td>
                     <td className="px-2 py-4 bg-gray-600 text-center text-xs text-gray-100">-</td>
                   </tr>
                 </tbody>
               </table>
             </div>

             {/* Resumen de totales */}
             <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-t-2 border-gray-200">
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                 <div className="text-center bg-white rounded-xl p-4 shadow-lg border-2 border-yellow-200 hover:border-yellow-300 transition-colors">
                   <div className="text-3xl font-black text-yellow-600">{totals.totalBreakfast}</div>
                   <div className="text-xs text-gray-600 font-medium">Desayunos</div>
                   <Coffee className="mx-auto mt-2 text-yellow-500" size={20} />
                 </div>
                 <div className="text-center bg-white rounded-xl p-4 shadow-lg border-2 border-amber-200 hover:border-amber-300 transition-colors">
                   <div className="text-3xl font-black text-amber-600">{totals.totalReinforcedBreakfast}</div>
                   <div className="text-xs text-gray-600 font-medium">D. Reforzados</div>
                   <Coffee className="mx-auto mt-2 text-amber-500" size={20} />
                 </div>
                 <div className="text-center bg-white rounded-xl p-4 shadow-lg border-2 border-green-200 hover:border-green-300 transition-colors">
                   <div className="text-3xl font-black text-green-600">{totals.totalSnack1}</div>
                   <div className="text-xs text-gray-600 font-medium">Refrigerios</div>
                   <Coffee className="mx-auto mt-2 text-green-500" size={20} />
                 </div>
                 <div className="text-center bg-white rounded-xl p-4 shadow-lg border-2 border-emerald-200 hover:border-emerald-300 transition-colors">
                   <div className="text-3xl font-black text-emerald-600">{totals.totalAfternoonSnack}</div>
                   <div className="text-xs text-gray-600 font-medium">Meriendas</div>
                   <Coffee className="mx-auto mt-2 text-emerald-500" size={20} />
                 </div>
                 <div className="text-center bg-white rounded-xl p-4 shadow-lg border-2 border-orange-200 hover:border-orange-300 transition-colors">
                   <div className="text-3xl font-black text-orange-600">{totals.totalDryMeal}</div>
                   <div className="text-xs text-gray-600 font-medium">Raciones Secas</div>
                   <Utensils className="mx-auto mt-2 text-orange-500" size={20} />
                 </div>
                 <div className="text-center bg-white rounded-xl p-4 shadow-lg border-2 border-teal-200 hover:border-teal-300 transition-colors">
                   <div className="text-3xl font-black text-teal-600">{totals.totalLunch}</div>
                   <div className="text-xs text-gray-600 font-medium">Almuerzos</div>
                   <Utensils className="mx-auto mt-2 text-teal-500" size={20} />
                 </div>
                 <div className="text-center bg-white rounded-xl p-4 shadow-lg border-2 border-blue-200 hover:border-blue-300 transition-colors">
                   <div className="text-3xl font-black text-blue-600">${totals.totalTransport.toFixed(2)}</div>
                   <div className="text-xs text-gray-600 font-medium">Transporte Total</div>
                   <Car className="mx-auto mt-2 text-blue-500" size={20} />
                 </div>
                 <div className="text-center bg-white rounded-xl p-4 shadow-lg border-2 border-indigo-200 hover:border-indigo-300 transition-colors">
                   <div className="text-3xl font-black text-indigo-600">{totals.totalEmployees}</div>
                   <div className="text-xs text-gray-600 font-medium">Total Empleados</div>
                   <Users className="mx-auto mt-2 text-indigo-500" size={20} />
                 </div>
               </div>
             </div>
           </div>
         )}

         {/* Panel de empleados de vacaciones */}
         {vacationEmployees.length > 0 && (
           <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 shadow-lg">
             <div className="flex items-center space-x-3 mb-4">
               <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                 <Calendar className="text-white" size={20} />
               </div>
               <div>
                 <h3 className="text-lg font-bold text-orange-800">Empleados de Vacaciones</h3>
                 <p className="text-orange-700">Configura el rango de fechas para {vacationEmployees.length} empleado(s)</p>
               </div>
             </div>

             <div className="space-y-4">
               {vacationEmployees.map((employee) => {
                 const record = attendanceRecords[employee.id];
                 return (
                   <div key={employee.id} className="bg-white rounded-xl p-4 border border-orange-200 shadow-sm">
                     <div className="flex items-center justify-between mb-3">
                       <div className="flex items-center space-x-3">
                         <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                           <span className="text-orange-600 font-bold text-sm">
                             {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                           </span>
                         </div>
                         <div>
                           <div className="font-semibold text-gray-900">{employee.fullName}</div>
                           <div className="text-sm text-gray-600">{employee.identification} - {employee.areaName}</div>
                         </div>
                       </div>
                       <div className="text-sm font-medium text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                         {record.status}
                       </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">
                           Fecha de inicio
                         </label>
                         <input
                           type="date"
                           value={record.vacationStartDate}
                           onChange={(e) => updateEmployeeRecord(employee.id, 'vacationStartDate', e.target.value)}
                           className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                         />
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">
                           Fecha de fin
                         </label>
                         <input
                           type="date"
                           value={record.vacationEndDate}
                           onChange={(e) => updateEmployeeRecord(employee.id, 'vacationEndDate', e.target.value)}
                           className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                         />
                       </div>
                     </div>

                     {record.vacationStartDate && record.vacationEndDate && (
                       <div className="mt-3 p-3 bg-orange-100 rounded-lg">
                         <div className="text-sm text-orange-700">
                           <strong>Duración:</strong> {
                             Math.ceil((new Date(record.vacationEndDate).getTime() - new Date(record.vacationStartDate).getTime()) / (1000 * 60 * 60 * 24) + 1)
                           } días
                         </div>
                       </div>
                     )}
                   </div>
                 );
               })}
             </div>
           </div>
         )}

         {/* Panel de guardado final */}
         {totalEmployees > 0 && (
           <div className="bg-gradient-to-r from-indigo-50 via-white to-indigo-50 border-2 border-indigo-200 rounded-2xl p-8 shadow-xl">
             <div className="flex items-center justify-between mb-6">
               <div className="flex items-center space-x-4">
                 <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                   <CheckCircle className="text-white" size={24} />
                 </div>
                 <div>
                   <h3 className="text-xl font-bold text-indigo-800">
                     Sistema Listo para Guardar
                   </h3>
                   <p className="text-indigo-700">
                     {totalEmployees} empleados configurados para el {new Date(date + 'T00:00:00').toLocaleDateString('es-ES')}
                   </p>
                 </div>
               </div>
               
               <div className="text-right">
                 <div className="text-3xl font-bold text-indigo-600">~10s</div>
                 <div className="text-sm text-indigo-600">Tiempo estimado</div>
               </div>
             </div>
             
             {/* Estadísticas del resumen */}
             <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
               <div className="bg-white rounded-xl p-4 text-center shadow-lg border border-indigo-100">
                 <div className="text-2xl font-bold text-indigo-600">{totalEmployees}</div>
                 <div className="text-sm text-gray-600">Total empleados</div>
               </div>
               <div className="bg-white rounded-xl p-4 text-center shadow-lg border border-blue-100">
                 <div className="text-2xl font-bold text-blue-600">{selectedAreaIds.length}</div>
                 <div className="text-sm text-gray-600">Áreas activas</div>
               </div>
               <div className="bg-white rounded-xl p-4 text-center shadow-lg border border-orange-100">
                 <div className="text-2xl font-bold text-orange-600">{totals.vacationCount}</div>
                 <div className="text-sm text-gray-600">De vacaciones</div>
               </div>
               <div className="bg-white rounded-xl p-4 text-center shadow-lg border border-green-100">
                 <div className="text-2xl font-bold text-green-600">{totals.totalLunch}</div>
                 <div className="text-sm text-gray-600">Almuerzos</div>
               </div>
               <div className="bg-white rounded-xl p-4 text-center shadow-lg border border-blue-100">
                 <div className="text-2xl font-bold text-blue-600">${totals.totalTransport.toFixed(2)}</div>
                 <div className="text-sm text-gray-600">Transporte Total</div>
               </div>
             </div>

             {/* Características y botón de guardado */}
             <div className="flex items-center justify-between">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 mr-8">
                 <div className="flex items-center space-x-2 text-indigo-700">
                   <CheckCircle size={16} />
                   <span className="text-sm">Valores por defecto aplicados automáticamente</span>
                 </div>
                 <div className="flex items-center space-x-2 text-indigo-700">
                   <CheckCircle size={16} />
                   <span className="text-sm">Edición masiva disponible</span>
                 </div>
                 <div className="flex items-center space-x-2 text-indigo-700">
                   <CheckCircle size={16} />
                   <span className="text-sm">Validación automática antes del guardado</span>
                 </div>
                 <div className="flex items-center space-x-2 text-indigo-700">
                   <CheckCircle size={16} />
                   <span className="text-sm">Vista tipo Excel para edición directa</span>
                 </div>
               </div>

               <button
                 onClick={handleBulkSave}
                 disabled={isSaving}
                 className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-12 py-4 rounded-xl font-bold text-lg flex items-center space-x-3 transition-all transform hover:scale-105 disabled:transform-none shadow-xl"
               >
                 {isSaving ? (
                   <>
                     <RefreshCw className="animate-spin" size={24} />
                     <span>Procesando {saveProgress}%...</span>
                   </>
                 ) : (
                   <>
                     <Zap size={24} />
                     <span>🚀 Guardar {totalEmployees} Registros</span>
                   </>
                 )}
               </button>
             </div>

             {/* Barra de progreso */}
             {isSaving && (
               <div className="mt-6">
                 <div className="bg-white rounded-xl p-4 shadow-lg border border-indigo-200">
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-medium text-gray-700">Progreso del guardado masivo</span>
                     <span className="text-sm text-gray-600">{saveProgress}%</span>
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-4">
                     <div 
                       className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-4 rounded-full transition-all duration-500 ease-out shadow-sm" 
                       style={{ width: `${saveProgress}%` }}
                     ></div>
                   </div>
                   <div className="text-xs text-gray-600 mt-2 flex items-center space-x-2">
                     <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                     <span>
                       {saveProgress < 30 ? 'Validando datos y preparando registros...' : 
                        saveProgress < 60 ? 'Enviando información al servidor...' : 
                        saveProgress < 90 ? 'Guardando en base de datos...' : 
                        'Finalizando proceso y verificando...'}
                     </span>
                   </div>
                 </div>
               </div>
             )}
           </div>
         )}

         {/* Instrucciones cuando no hay áreas seleccionadas */}
         {selectedAreaIds.length === 0 && (
           <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 shadow-lg">
             <div className="flex items-start space-x-4">
               <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                 <span className="text-white text-xl">📊</span>
               </div>
               <div className="flex-1">
                 <h3 className="text-xl font-bold text-blue-800 mb-4">
                   Sistema Excel - Registro Masivo de Asistencia
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                   <div className="space-y-3">
                     <div className="flex items-center space-x-3">
                       <span className="w-8 h-8 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center font-bold">1</span>
                       <span className="text-blue-700"><strong>Selecciona las áreas</strong> que necesitas procesar</span>
                     </div>
                     <div className="flex items-center space-x-3">
                       <span className="w-8 h-8 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center font-bold">2</span>
                       <span className="text-blue-700"><strong>Edita directamente</strong> en la tabla tipo Excel</span>
                     </div>
                     <div className="flex items-center space-x-3">
                       <span className="w-8 h-8 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center font-bold">3</span>
                       <span className="text-blue-700"><strong>Usa acciones masivas</strong> para eficiencia</span>
                     </div>
                   </div>
                   <div className="space-y-3">
                     <div className="flex items-center space-x-3">
                       <span className="w-8 h-8 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center font-bold">4</span>
                       <span className="text-blue-700"><strong>Revisa los totales</strong> automáticos</span>
                     </div>
                     <div className="flex items-center space-x-3">
                       <span className="w-8 h-8 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center font-bold">5</span>
                       <span className="text-blue-700"><strong>Guarda todo</strong> en un solo click</span>
                     </div>
                   </div>
                 </div>
                 
                 <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="p-4 bg-blue-100 rounded-xl">
                     <h4 className="font-bold text-blue-800 mb-2">📊 Vista Excel Optimizada</h4>
                     <ul className="text-sm text-blue-700 space-y-1">
                       <li>• Tabla tipo hoja de cálculo</li>
                       <li>• Controles de input simples</li>
                       <li>• Edición directa en celdas</li>
                       <li>• Columnas fijas para navegación</li>
                       <li>• Totales automáticos en tiempo real</li>
                     </ul>
                   </div>
                   
                   <div className="p-4 bg-green-100 rounded-xl">
                     <h4 className="font-bold text-green-800 mb-2">⚡ Funciones Avanzadas</h4>
                     <ul className="text-sm text-green-700 space-y-1">
                       <li>• Selección múltiple con checkboxes</li>
                       <li>• Acciones masivas inteligentes</li>
                       <li>• Búsqueda en tiempo real</li>
                       <li>• Estados personalizables</li>
                       <li>• Gestión de vacaciones con fechas</li>
                     </ul>
                   </div>
                 </div>

                 <div className="mt-6 p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl border border-blue-200">
                   <p className="text-sm text-blue-800">
                     <strong>🎯 Diseño Optimizado:</strong> Vista única tipo Excel para máxima eficiencia. 
                     Diseñado para procesar hasta 615 empleados con nombres completos y gestión de vacaciones.
                   </p>
                 </div>
               </div>
             </div>
           </div>
         )}
       </div>
     </div>
   </DashboardLayout>
 );
}

export default withAuth(AttendancePage);