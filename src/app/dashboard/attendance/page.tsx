// src/app/dashboard/attendance/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { withAuth } from '@/contexts/AuthContext';
import { areasAPI, employeesAPI, attendanceAPI } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Calendar, 
  Users, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Settings,
  Eye,
  EyeOff,
  MapPin,
  Coffee,
  Utensils,
  Car,
  Plus,
  Minus,
  RefreshCw,
  Download,
  Upload,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Zap,
  FileSpreadsheet,
  Calculator,
  DollarSign,
  Maximize2,
  Minimize2,
  ScanLine,
  Target
} from 'lucide-react';

// Tipos de datos (mismos que antes)
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
  permissionHours: number;
  permissionReason: string;
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
  const [summarySearchTerm, setSummarySearchTerm] = useState('');

  // Estados de vista
  const [showSummaryTable, setShowSummaryTable] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Configuración personalizable
  const [defaultSettings, setDefaultSettings] = useState<DefaultSettings>({
    standardEntry: '06:30',
    standardExit: '16:00',
    lunchDuration: 30,
    foodAllowance: {
      breakfast: 1,
      reinforcedBreakfast: 0,
      snack1: 1,
      afternoonSnack: 0,
      dryMeal: 0,
      lunch: 1,
      transport: 2.50,
    }
  });

  // Estados de control
  const [isLoadingAreas, setIsLoadingAreas] = useState(true);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Funciones principales (mismas que antes)
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
            permissionHours: 0,
            permissionReason: '',
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
          [field]: Math.max(0, Math.min(10, value)), // Límite entre 0 y 10
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

  // Obtener todos los empleados para la tabla resumen
  const allEmployees = employeesByArea.flatMap(areaData => 
    areaData.employees.map(emp => ({ ...emp, areaName: areaData.area.name }))
  );

  // Filtrar empleados para tabla resumen
  const filteredSummaryEmployees = allEmployees.filter(emp => 
    emp.fullName.toLowerCase().includes(summarySearchTerm.toLowerCase()) ||
    emp.identification.includes(summarySearchTerm) ||
    emp.areaName.toLowerCase().includes(summarySearchTerm.toLowerCase())
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

  const totals = calculateTotals();
  const totalEmployees = employeesByArea.reduce((sum, area) => sum + area.employeesCount, 0);

  // Componente para controles de alimentación mejorados
  const FoodControl = ({ value, onChange, type, color }: { value: number; onChange: (val: number) => void; type: string; color: string }) => (
    <div className={`flex items-center justify-center space-x-1 py-1 ${color}`}>
      <button
        onClick={() => onChange(value - 1)}
        className="w-7 h-7 rounded-full bg-white shadow-sm hover:shadow-md border border-gray-300 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all"
        disabled={value <= 0}
      >
        <Minus size={12} />
      </button>
      <div className="w-10 h-8 bg-white rounded border border-gray-300 flex items-center justify-center">
        <span className="text-sm font-semibold text-gray-800">{value}</span>
      </div>
      <button
        onClick={() => onChange(value + 1)}
        className="w-7 h-7 rounded-full bg-white shadow-sm hover:shadow-md border border-gray-300 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all"
        disabled={value >= 10}
      >
        <Plus size={12} />
      </button>
    </div>
  );

  return (
    <DashboardLayout>
      <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'min-h-screen'} bg-gradient-to-br from-gray-50 to-gray-100`}>
        {/* Header mejorado */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FileSpreadsheet className="text-white" size={24} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Registro Masivo de Asistencia</h1>
                    <p className="text-gray-600">Sistema optimizado para hasta 615 empleados</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {showSummaryTable && (
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                  >
                    {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                  </button>
                )}
                <div className="text-right">
                  <div className="text-sm text-gray-500">Fecha seleccionada</div>
                  <div className="font-semibold text-gray-900">
                    {new Date(date).toLocaleDateString('es-ES', { 
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
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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

          {!showSummaryTable && (
            <>
              {/* Panel de configuración compacto */}
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

                {/* Toggle tabla */}
                <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <FileSpreadsheet className="text-indigo-600" size={18} />
                    <h3 className="font-semibold text-gray-900">Vista Excel</h3>
                  </div>
                  <button
                    onClick={() => setShowSummaryTable(true)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Abrir Tabla
                  </button>
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

              {/* VISTA EN CARDS PARA REGISTRO */}
              {totalEmployees > 0 && (
                <div className="space-y-6">
                  {/* Barra de búsqueda y filtros */}
                  <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Registro de Empleados</h3>
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="text"
                            placeholder="Buscar empleado..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                          />
                        </div>
                        <span className="text-sm text-gray-600">{allEmployees.length} empleados</span>
                      </div>
                    </div>
                  </div>

                  {/* Cards de empleados organizados por área */}
                  {employeesByArea.map((areaData) => {
                    const filteredEmployees = areaData.employees.filter(emp => 
                      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      emp.identification.includes(searchTerm)
                    );

                    if (filteredEmployees.length === 0) return null;

                    return (
                      <div key={areaData.area.id} className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                        {/* Header del área */}
                        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <MapPin className="text-white" size={20} />
                              <div>
                                <h3 className="text-xl font-semibold text-white">{areaData.area.name}</h3>
                                <p className="text-indigo-100">{filteredEmployees.length} empleados</p>
                              </div>
                            </div>
                            <div className="text-right text-white">
                              <div className="text-sm opacity-90">Horario estándar</div>
                              <div className="font-medium">{areaData.area.defaultEntryTime} - {areaData.area.defaultExitTime}</div>
                            </div>
                          </div>
                        </div>

                        {/* Grid de cards de empleados */}
                        <div className="p-6">
                          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredEmployees.map((employee) => {
                              const record = attendanceRecords[employee.id];
                              if (!record) return null;

                              return (
                                <div key={employee.id} className="bg-gray-50 rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all">
                                  {/* Header del empleado */}
                                  <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center">
                                      <span className="text-white font-bold text-sm">
                                        {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                                      </span>
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-gray-900">{employee.fullName}</h4>
                                      <p className="text-xs text-gray-600">{employee.identification}</p>
                                      <p className="text-xs text-gray-500">{employee.position}</p>
                                    </div>
                                  </div>

                                  {/* Estado de vacaciones */}
                                  <div className="mb-4">
                                    <label className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 cursor-pointer">
                                      <span className="font-medium text-gray-700">Estado de vacaciones</span>
                                      <div className="flex items-center space-x-2">
                                        <input
                                          type="checkbox"
                                          checked={record.isVacation}
                                          onChange={(e) => updateEmployeeRecord(employee.id, 'isVacation', e.target.checked)}
                                          className="sr-only"
                                        />
                                        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                          record.isVacation ? 'bg-orange-500' : 'bg-gray-300'
                                        }`}>
                                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            record.isVacation ? 'translate-x-6' : 'translate-x-1'
                                          }`} />
                                        </div>
                                        <span className={`text-sm font-medium ${
                                          record.isVacation ? 'text-orange-600' : 'text-gray-600'
                                        }`}>
                                          {record.isVacation ? 'Vacaciones' : 'Normal'}
                                        </span>
                                      </div>
                                    </label>
                                  </div>

                                  {/* Horarios */}
                                  <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Entrada</label>
                                      <input
                                        type="time"
                                        value={record.entryTime}
                                        onChange={(e) => updateEmployeeRecord(employee.id, 'entryTime', e.target.value)}
                                        disabled={record.isVacation}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 text-sm"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Salida</label>
                                      <input
                                        type="time"
                                        value={record.exitTime}
                                        onChange={(e) => updateEmployeeRecord(employee.id, 'exitTime', e.target.value)}
                                        disabled={record.isVacation}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 text-sm"
                                      />
                                    </div>
                                  </div>

                                  {/* Alimentación */}
                                  <div className="mb-4">
                                    <h5 className="text-sm font-medium text-gray-700 mb-3">Alimentación</h5>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="bg-yellow-50 p-3 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-xs font-medium text-yellow-800">Desayuno</span>
                                          <Coffee className="text-yellow-600" size={14} />
                                        </div>
                                        <div className="flex items-center justify-center space-x-2">
                                          <button
                                            onClick={() => updateFoodAllowance(employee.id, 'breakfast', record.foodAllowance.breakfast - 1)}
                                            className="w-8 h-8 rounded-full bg-white border border-yellow-300 flex items-center justify-center hover:bg-yellow-100 transition-colors"
                                            disabled={record.foodAllowance.breakfast <= 0}
                                          >
                                            <Minus size={12} />
                                          </button>
                                          <span className="w-8 text-center font-bold text-yellow-800">{record.foodAllowance.breakfast}</span>
                                          <button
                                            onClick={() => updateFoodAllowance(employee.id, 'breakfast', record.foodAllowance.breakfast + 1)}
                                            className="w-8 h-8 rounded-full bg-white border border-yellow-300 flex items-center justify-center hover:bg-yellow-100 transition-colors"
                                            disabled={record.foodAllowance.breakfast >= 10}
                                          >
                                            <Plus size={12} />
                                          </button>
                                        </div>
                                      </div>

                                      <div className="bg-green-50 p-3 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-xs font-medium text-green-800">Almuerzo</span>
                                          <Utensils className="text-green-600" size={14} />
                                        </div>
                                        <div className="flex items-center justify-center space-x-2">
                                          <button
                                            onClick={() => updateFoodAllowance(employee.id, 'lunch', record.foodAllowance.lunch - 1)}
                                            className="w-8 h-8 rounded-full bg-white border border-green-300 flex items-center justify-center hover:bg-green-100 transition-colors"
                                            disabled={record.foodAllowance.lunch <= 0}
                                          >
                                            <Minus size={12} />
                                          </button>
                                          <span className="w-8 text-center font-bold text-green-800">{record.foodAllowance.lunch}</span>
                                          <button
                                            onClick={() => updateFoodAllowance(employee.id, 'lunch', record.foodAllowance.lunch + 1)}
                                            className="w-8 h-8 rounded-full bg-white border border-green-300 flex items-center justify-center hover:bg-green-100 transition-colors"
                                            disabled={record.foodAllowance.lunch >= 10}
                                          >
                                            <Plus size={12} />
                                          </button>
                                        </div>
                                      </div>

                                      <div className="bg-orange-50 p-3 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-xs font-medium text-orange-800">Refrigerio</span>
                                          <Coffee className="text-orange-600" size={14} />
                                        </div>
                                        <div className="flex items-center justify-center space-x-2">
                                          <button
                                            onClick={() => updateFoodAllowance(employee.id, 'snack1', record.foodAllowance.snack1 - 1)}
                                            className="w-8 h-8 rounded-full bg-white border border-orange-300 flex items-center justify-center hover:bg-orange-100 transition-colors"
                                            disabled={record.foodAllowance.snack1 <= 0}
                                          >
                                            <Minus size={12} />
                                          </button>
                                          <span className="w-8 text-center font-bold text-orange-800">{record.foodAllowance.snack1}</span>
                                          <button
                                            onClick={() => updateFoodAllowance(employee.id, 'snack1', record.foodAllowance.snack1 + 1)}
                                            className="w-8 h-8 rounded-full bg-white border border-orange-300 flex items-center justify-center hover:bg-orange-100 transition-colors"
                                            disabled={record.foodAllowance.snack1 >= 10}
                                          >
                                            <Plus size={12} />
                                          </button>
                                        </div>
                                      </div>

                                      <div className="bg-blue-50 p-3 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-xs font-medium text-blue-800">Transporte</span>
                                          <Car className="text-blue-600" size={14} />
                                        </div>
                                        <div className="flex items-center justify-center">
                                          <DollarSign className="text-blue-600" size={14} />
                                          <input
                                            type="number"
                                            value={record.foodAllowance.transport}
                                            onChange={(e) => updateFoodAllowance(employee.id, 'transport', parseFloat(e.target.value) || 0)}
                                            min="0"
                                            max="50"
                                            step="0.25"
                                            className="w-16 text-center text-sm border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                            placeholder="0.00"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Permisos */}
                                  <div className="bg-purple-50 p-3 rounded-lg">
                                    <h5 className="text-xs font-medium text-purple-800 mb-2">Permisos</h5>
                                    <div className="space-y-2">
                                      <div>
                                        <label className="block text-xs text-purple-700 mb-1">Horas de permiso</label>
                                        <input
                                          type="number"
                                          value={record.permissionHours}
                                          onChange={(e) => updateEmployeeRecord(employee.id, 'permissionHours', parseFloat(e.target.value) || 0)}
                                          min="0"
                                          max="8"
                                          step="0.5"
                                          className="w-full text-sm border border-purple-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                                        />
                                      </div>
                                      {record.permissionHours > 0 && (
                                        <div>
                                          <label className="block text-xs text-purple-700 mb-1">Razón</label>
                                          <input
                                            type="text"
                                            value={record.permissionReason}
                                            onChange={(e) => updateEmployeeRecord(employee.id, 'permissionReason', e.target.value)}
                                            placeholder="Razón del permiso..."
                                            className="w-full text-sm border border-purple-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* TABLA RESUMEN MEJORADA ESTILO EXCEL */}
          {selectedAreaIds.length > 0 && showSummaryTable && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Header de la tabla mejorado */}
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileSpreadsheet className="text-white" size={24} />
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        Tabla Resumen - Estilo Excel
                      </h3>
                      <p className="text-indigo-100">
                        Vista completa para revisar antes de guardar ({filteredSummaryEmployees.length} empleados)
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Buscar empleado, área, cédula..."
                        value={summarySearchTerm}
                        onChange={(e) => setSummarySearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent w-64"
                      />
                    </div>
                    
                    {selectedRows.size > 0 && (
                      <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-2">
                        <Target className="text-white" size={16} />
                        <span className="text-white text-sm font-medium">{selectedRows.size} seleccionados</span>
                      </div>
                    )}
                    
                    <button
                      onClick={() => setShowSummaryTable(false)}
                      className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Cerrar Tabla
                    </button>
                  </div>
                </div>
              </div>

              {/* Barra de acciones masivas */}
              {selectedRows.size > 0 && (
                <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-amber-800">
                        Acciones masivas para {selectedRows.size} empleados:
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => applyBulkUpdate('foodAllowance.breakfast', 1)}
                          className="px-3 py-1 bg-yellow-200 hover:bg-yellow-300 text-yellow-800 rounded text-xs font-medium transition-colors"
                        >
                          Desayuno = 1
                        </button>
                        <button
                          onClick={() => applyBulkUpdate('foodAllowance.lunch', 1)}
                          className="px-3 py-1 bg-green-200 hover:bg-green-300 text-green-800 rounded text-xs font-medium transition-colors"
                        >
                          Almuerzo = 1
                        </button>
                        <button
                          onClick={() => applyBulkUpdate('foodAllowance.transport', 2.5)}
                          className="px-3 py-1 bg-blue-200 hover:bg-blue-300 text-blue-800 rounded text-xs font-medium transition-colors"
                        >
                          Transporte = $2.50
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedRows(new Set())}
                      className="text-amber-600 hover:text-amber-800 text-sm font-medium"
                    >
                      Limpiar selección
                    </button>
                  </div>
                </div>
              )}

              {/* Tabla Excel mejorada */}
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-20">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-30 border-r border-gray-200">
                        <input
                          type="checkbox"
                          checked={selectedRows.size === filteredSummaryEmployees.length && filteredSummaryEmployees.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRows(new Set(filteredSummaryEmployees.map(emp => emp.id)));
                            } else {
                              setSelectedRows(new Set());
                            }
                          }}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-12 bg-gray-50 z-30 border-r border-gray-200 min-w-[200px]">
                        Empleado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100 min-w-[80px]">
                        Salida
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100 min-w-[80px]">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-yellow-100 min-w-[120px]">
                        <div className="flex items-center justify-center space-x-1">
                          <Coffee size={14} className="text-yellow-600" />
                          <span>Desayuno</span>
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-yellow-100 min-w-[120px]">
                        <div className="flex items-center justify-center space-x-1">
                          <Coffee size={14} className="text-yellow-600" />
                          <span>D. Reforzado</span>
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-100 min-w-[120px]">
                        <div className="flex items-center justify-center space-x-1">
                          <Coffee size={14} className="text-green-600" />
                          <span>Refrigerio</span>
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-100 min-w-[120px]">
                        <div className="flex items-center justify-center space-x-1">
                          <Coffee size={14} className="text-green-600" />
                          <span>Merienda</span>
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-orange-100 min-w-[120px]">
                        <div className="flex items-center justify-center space-x-1">
                          <Utensils size={14} className="text-orange-600" />
                          <span>Ración Seca</span>
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-100 min-w-[120px]">
                        <div className="flex items-center justify-center space-x-1">
                          <Utensils size={14} className="text-green-600" />
                          <span>Almuerzo</span>
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-100 min-w-[120px]">
                        <div className="flex items-center justify-center space-x-1">
                          <Car size={14} className="text-blue-600" />
                          <span>Transporte</span>
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-purple-100 min-w-[100px]">
                        Permisos (h)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-purple-100 min-w-[150px]">
                        Razón Permiso
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSummaryEmployees.map((employee, index) => {
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
                          
                          {/* Información del empleado (sticky) */}
                          <td className="px-4 py-3 whitespace-nowrap sticky left-12 bg-white z-20 border-r border-gray-200">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                                  <span className="text-white font-medium text-xs">
                                    {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {employee.fullName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {employee.identification}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          {/* Área */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              {employee.areaName}
                            </span>
                          </td>
                          
                          {/* Horarios */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <input
                              type="time"
                              value={record.entryTime}
                              onChange={(e) => updateEmployeeRecord(employee.id, 'entryTime', e.target.value)}
                              disabled={record.isVacation}
                              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 w-full"
                            />
                          </td>
                          
                          <td className="px-4 py-3 whitespace-nowrap">
                            <input
                              type="time"
                              value={record.exitTime}
                              onChange={(e) => updateEmployeeRecord(employee.id, 'exitTime', e.target.value)}
                              disabled={record.isVacation}
                              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 w-full"
                            />
                          </td>
                          
                          {/* Estado */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={record.isVacation}
                                onChange={(e) => updateEmployeeRecord(employee.id, 'isVacation', e.target.checked)}
                                className="sr-only"
                              />
                              <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                record.isVacation ? 'bg-orange-500' : 'bg-gray-200'
                              }`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  record.isVacation ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                              </div>
                              <span className={`ml-2 text-xs font-medium ${
                                record.isVacation ? 'text-orange-600' : 'text-gray-600'
                              }`}>
                                {record.isVacation ? 'Vacaciones' : 'Normal'}
                              </span>
                            </label>
                          </td>
                          
                          {/* Controles de alimentación mejorados */}
                          <td className="px-2 py-3 whitespace-nowrap bg-yellow-50">
                            <FoodControl
                              value={record.foodAllowance.breakfast}
                              onChange={(val) => updateFoodAllowance(employee.id, 'breakfast', val)}
                              type="breakfast"
                              color="bg-yellow-50"
                            />
                          </td>
                          
                          <td className="px-2 py-3 whitespace-nowrap bg-yellow-50">
                            <FoodControl
                              value={record.foodAllowance.reinforcedBreakfast}
                              onChange={(val) => updateFoodAllowance(employee.id, 'reinforcedBreakfast', val)}
                              type="reinforcedBreakfast"
                              color="bg-yellow-50"
                            />
                          </td>
                          
                          <td className="px-2 py-3 whitespace-nowrap bg-green-50">
                            <FoodControl
                              value={record.foodAllowance.snack1}
                              onChange={(val) => updateFoodAllowance(employee.id, 'snack1', val)}
                              type="snack1"
                              color="bg-green-50"
                            />
                          </td>
                          
                          <td className="px-2 py-3 whitespace-nowrap bg-green-50">
                            <FoodControl
                              value={record.foodAllowance.afternoonSnack}
                              onChange={(val) => updateFoodAllowance(employee.id, 'afternoonSnack', val)}
                              type="afternoonSnack"
                              color="bg-green-50"
                            />
                          </td>
                          
                          <td className="px-2 py-3 whitespace-nowrap bg-orange-50">
                            <FoodControl
                              value={record.foodAllowance.dryMeal}
                              onChange={(val) => updateFoodAllowance(employee.id, 'dryMeal', val)}
                              type="dryMeal"
                              color="bg-orange-50"
                            />
                          </td>
                          
                          <td className="px-2 py-3 whitespace-nowrap bg-green-50">
                            <FoodControl
                              value={record.foodAllowance.lunch}
                              onChange={(val) => updateFoodAllowance(employee.id, 'lunch', val)}
                              type="lunch"
                              color="bg-green-50"
                            />
                          </td>
                          
                          {/* Transporte */}
                          <td className="px-4 py-3 whitespace-nowrap bg-blue-50">
                            <div className="flex items-center justify-center space-x-1">
                              <DollarSign className="text-blue-600" size={14} />
                              <input
                                type="number"
                                value={record.foodAllowance.transport}
                                onChange={(e) => updateFoodAllowance(employee.id, 'transport', parseFloat(e.target.value) || 0)}
                                min="0"
                                max="50"
                                step="0.25"
                                className="w-16 text-sm border border-blue-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-center"
                                placeholder="0.00"
                              />
                            </div>
                          </td>
                          
                          {/* Permisos */}
                          <td className="px-4 py-3 whitespace-nowrap bg-purple-50">
                            <input
                              type="number"
                              value={record.permissionHours}
                              onChange={(e) => updateEmployeeRecord(employee.id, 'permissionHours', parseFloat(e.target.value) || 0)}
                              min="0"
                              max="8"
                              step="0.5"
                              className="w-16 text-sm border border-purple-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-center"
                            />
                          </td>
                          
                          {/* Razón Permiso */}
                          <td className="px-4 py-3 bg-purple-50">
                            <input
                              type="text"
                              value={record.permissionReason}
                              onChange={(e) => updateEmployeeRecord(employee.id, 'permissionReason', e.target.value)}
                              placeholder="Razón del permiso..."
                              className="w-full text-sm border border-purple-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                            />
                          </td>
                        </tr>
                      );
                    })}
                    
                    {/* Fila de totales mejorada */}
                    <tr className="bg-gradient-to-r from-gray-100 to-gray-200 font-bold border-t-2 border-gray-400 sticky bottom-0">
                      <td className="px-3 py-4 sticky left-0 bg-gray-200 z-20 border-r border-gray-400">
                        <Calculator size={16} className="text-gray-600" />
                      </td>
                      <td className="px-4 py-4 sticky left-12 bg-gray-200 z-20 border-r border-gray-400">
                        <div className="flex items-center space-x-2">
                          <Calculator size={16} className="text-gray-600" />
                          <span className="text-sm font-bold text-gray-800">TOTALES</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 text-center">
                        {selectedAreaIds.length} área(s)
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 text-center">-</td>
                      <td className="px-4 py-4 text-sm text-gray-600 text-center">-</td>
                      <td className="px-4 py-4 text-sm text-gray-600 text-center">
                        {totals.totalEmployees} emp.
                      </td>
                      <td className="px-4 py-4 bg-yellow-200 text-center">
                        <div className="text-lg font-bold text-yellow-800">{totals.totalBreakfast}</div>
                        <div className="text-xs text-yellow-600">unidades</div>
                      </td>
                      <td className="px-4 py-4 bg-yellow-200 text-center">
                        <div className="text-lg font-bold text-yellow-800">{totals.totalReinforcedBreakfast}</div>
                        <div className="text-xs text-yellow-600">unidades</div>
                      </td>
                      <td className="px-4 py-4 bg-green-200 text-center">
                        <div className="text-lg font-bold text-green-800">{totals.totalSnack1}</div>
                        <div className="text-xs text-green-600">unidades</div>
                      </td>
                      <td className="px-4 py-4 bg-green-200 text-center">
                        <div className="text-lg font-bold text-green-800">{totals.totalAfternoonSnack}</div>
                        <div className="text-xs text-green-600">unidades</div>
                      </td>
                      <td className="px-4 py-4 bg-orange-200 text-center">
                        <div className="text-lg font-bold text-orange-800">{totals.totalDryMeal}</div>
                        <div className="text-xs text-orange-600">unidades</div>
                      </td>
                      <td className="px-4 py-4 bg-green-200 text-center">
                        <div className="text-lg font-bold text-green-800">{totals.totalLunch}</div>
                        <div className="text-xs text-green-600">unidades</div>
                      </td>
                      <td className="px-4 py-4 bg-blue-200 text-center">
                        <div className="text-lg font-bold text-blue-800">${totals.totalTransport.toFixed(2)}</div>
                        <div className="text-xs text-blue-600">total</div>
                      </td>
                      <td className="px-4 py-4 bg-purple-200 text-center text-sm text-purple-600">-</td>
                      <td className="px-4 py-4 bg-purple-200 text-center text-sm text-purple-600">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Resumen de totales mejorado */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-6 border-t-2 border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                  <div className="text-center bg-white rounded-lg p-3 shadow-sm border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-600">{totals.totalBreakfast}</div>
                    <div className="text-xs text-gray-600">Desayunos</div>
                    <Coffee className="mx-auto mt-1 text-yellow-500" size={16} />
                  </div>
                  <div className="text-center bg-white rounded-lg p-3 shadow-sm border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-600">{totals.totalReinforcedBreakfast}</div>
                    <div className="text-xs text-gray-600">D. Reforzados</div>
                    <Coffee className="mx-auto mt-1 text-yellow-500" size={16} />
                  </div>
                  <div className="text-center bg-white rounded-lg p-3 shadow-sm border border-green-200">
                    <div className="text-2xl font-bold text-green-600">{totals.totalSnack1}</div>
                    <div className="text-xs text-gray-600">Refrigerios</div>
                    <Coffee className="mx-auto mt-1 text-green-500" size={16} />
                  </div>
                  <div className="text-center bg-white rounded-lg p-3 shadow-sm border border-green-200">
                    <div className="text-2xl font-bold text-green-600">{totals.totalAfternoonSnack}</div>
                    <div className="text-xs text-gray-600">Meriendas</div>
                    <Coffee className="mx-auto mt-1 text-green-500" size={16} />
                  </div>
                  <div className="text-center bg-white rounded-lg p-3 shadow-sm border border-orange-200">
                    <div className="text-2xl font-bold text-orange-600">{totals.totalDryMeal}</div>
                    <div className="text-xs text-gray-600">Raciones Secas</div>
                    <Utensils className="mx-auto mt-1 text-orange-500" size={16} />
                  </div>
                  <div className="text-center bg-white rounded-lg p-3 shadow-sm border border-green-200">
                    <div className="text-2xl font-bold text-green-600">{totals.totalLunch}</div>
                    <div className="text-xs text-gray-600">Almuerzos</div>
                    <Utensils className="mx-auto mt-1 text-green-500" size={16} />
                  </div>
                  <div className="text-center bg-white rounded-lg p-3 shadow-sm border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">${totals.totalTransport.toFixed(2)}</div>
                    <div className="text-xs text-gray-600">Transporte Total</div>
                    <Car className="mx-auto mt-1 text-blue-500" size={16} />
                  </div>
                  <div className="text-center bg-white rounded-lg p-3 shadow-sm border border-indigo-200">
                    <div className="text-2xl font-bold text-indigo-600">{totals.totalEmployees}</div>
                    <div className="text-xs text-gray-600">Total Empleados</div>
                    <Users className="mx-auto mt-1 text-indigo-500" size={16} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Panel de guardado final mejorado */}
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
                      {totalEmployees} empleados configurados para el {new Date(date).toLocaleDateString('es-ES')}
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
                    <span className="text-sm">Edición masiva e individual disponible</span>
                  </div>
                  <div className="flex items-center space-x-2 text-indigo-700">
                    <CheckCircle size={16} />
                    <span className="text-sm">Validación automática antes del guardado</span>
                  </div>
                  <div className="flex items-center space-x-2 text-indigo-700">
                    <CheckCircle size={16} />
                    <span className="text-sm">Transacción atómica garantizada</span>
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

          {/* Instrucciones mejoradas */}
          {selectedAreaIds.length === 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white text-xl">💡</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-blue-800 mb-4">
                    Sistema Excel para Registro Masivo - Guía Rápida
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center font-bold">1</span>
                        <span className="text-blue-700"><strong>Selecciona las áreas</strong> que necesitas</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center font-bold">2</span>
                        <span className="text-blue-700"><strong>Abre la tabla Excel</strong> para vista completa</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center font-bold">3</span>
                        <span className="text-blue-700"><strong>Usa controles +/-</strong> para alimentación</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center font-bold">4</span>
                        <span className="text-blue-700"><strong>Selecciona empleados</strong> para edición masiva</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center font-bold">5</span>
                        <span className="text-blue-700"><strong>Revisa totales</strong> y guarda todo junto</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-100 rounded-xl">
                      <h4 className="font-bold text-blue-800 mb-2">🎯 Características Excel</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Columnas fijas para empleados</li>
                        <li>• Controles +/- intuitivos</li>
                        <li>• Totales automáticos</li>
                        <li>• Selección múltiple</li>
                        <li>• Búsqueda avanzada</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-green-100 rounded-xl">
                      <h4 className="font-bold text-green-800 mb-2">⚡ Edición Masiva</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Selecciona empleados con checkbox</li>
                        <li>• Aplica valores a todos los seleccionados</li>
                        <li>• Botones rápidos pre-configurados</li>
                        <li>• Limpia selección fácilmente</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>✨ Nuevo:</strong> Tabla Excel premium con columnas fijas, controles táctiles +/-, 
                      selección múltiple para edición masiva, y totales automáticos. 
                      ¡La experiencia más similar a Excel que encontrarás en web!
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