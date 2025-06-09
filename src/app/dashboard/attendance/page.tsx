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

              {/* VISTA EN CARDS PARA REGISTRO - DISEÑO MEJORADO */}
              {totalEmployees > 0 && (
                <div className="space-y-8">
                  {/* Header de registro mejorado */}
                  <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                          <Users className="text-white" size={28} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white">Registro de Empleados</h3>
                          <p className="text-white/90">Configura la asistencia individual de cada empleado</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right text-white">
                          <div className="text-3xl font-bold">{allEmployees.length}</div>
                          <div className="text-white/80">Empleados</div>
                        </div>
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="text"
                            placeholder="Buscar empleado, cédula, área..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-4 py-3 w-80 border-0 rounded-xl bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-800 placeholder-gray-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cards de empleados organizados por área */}
                  {employeesByArea.map((areaData) => {
                    const filteredEmployees = areaData.employees.filter(emp => 
                      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      emp.identification.includes(searchTerm) ||
                      areaData.area.name.toLowerCase().includes(searchTerm.toLowerCase())
                    );

                    if (filteredEmployees.length === 0) return null;

                    return (
                      <div key={areaData.area.id} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        {/* Header del área mejorado */}
                        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                                <MapPin className="text-white" size={24} />
                              </div>
                              <div>
                                <h3 className="text-2xl font-bold text-white">{areaData.area.name}</h3>
                                <p className="text-gray-300">{filteredEmployees.length} de {areaData.employees.length} empleados</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-white/80 text-sm">Horario estándar</div>
                              <div className="text-white font-bold text-lg">{areaData.area.defaultEntryTime} - {areaData.area.defaultExitTime}</div>
                            </div>
                          </div>
                        </div>

                        {/* Grid de cards de empleados mejorado */}
                        <div className="p-8">
                          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                            {filteredEmployees.map((employee) => {
                              const record = attendanceRecords[employee.id];
                              if (!record) return null;

                              return (
                                <div key={employee.id} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-100 p-6 hover:shadow-2xl hover:border-indigo-200 transition-all duration-300 transform hover:-translate-y-1">
                                  {/* Header del empleado mejorado */}
                                  <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-gray-200">
                                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                      <span className="text-white font-bold text-lg">
                                        {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                                      </span>
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-bold text-gray-900 text-lg">{employee.fullName}</h4>
                                      <p className="text-sm text-gray-600 font-medium">{employee.identification}</p>
                                      <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block mt-1">{employee.position}</p>
                                    </div>
                                  </div>

                                  {/* Estado de vacaciones mejorado */}
                                  <div className="mb-6">
                                    <label className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-100 cursor-pointer hover:border-orange-200 transition-colors">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                          <Coffee className="text-orange-600" size={16} />
                                        </div>
                                        <span className="font-semibold text-gray-800">Estado de Vacaciones</span>
                                      </div>
                                      <div className="flex items-center space-x-3">
                                        <input
                                          type="checkbox"
                                          checked={record.isVacation}
                                          onChange={(e) => updateEmployeeRecord(employee.id, 'isVacation', e.target.checked)}
                                          className="sr-only"
                                        />
                                        <div className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors shadow-inner ${
                                          record.isVacation ? 'bg-orange-500 shadow-orange-200' : 'bg-gray-300 shadow-gray-200'
                                        }`}>
                                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md ${
                                            record.isVacation ? 'translate-x-6' : 'translate-x-1'
                                         }`} />
                                       </div>
                                       <span className={`text-sm font-bold ${
                                         record.isVacation ? 'text-orange-600' : 'text-gray-600'
                                       }`}>
                                         {record.isVacation ? 'Vacaciones' : 'Normal'}
                                       </span>
                                     </div>
                                   </label>
                                 </div>

                                 {/* Horarios mejorados */}
                                 <div className="grid grid-cols-2 gap-4 mb-6">
                                   <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                     <label className="flex items-center space-x-2 mb-2">
                                       <Clock className="text-blue-600" size={16} />
                                       <span className="text-sm font-semibold text-blue-800">Entrada</span>
                                     </label>
                                     <input
                                       type="time"
                                       value={record.entryTime}
                                       onChange={(e) => updateEmployeeRecord(employee.id, 'entryTime', e.target.value)}
                                       disabled={record.isVacation}
                                       className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 font-bold text-center text-blue-800"
                                     />
                                   </div>
                                   <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                     <label className="flex items-center space-x-2 mb-2">
                                       <Clock className="text-red-600" size={16} />
                                       <span className="text-sm font-semibold text-red-800">Salida</span>
                                     </label>
                                     <input
                                       type="time"
                                       value={record.exitTime}
                                       onChange={(e) => updateEmployeeRecord(employee.id, 'exitTime', e.target.value)}
                                       disabled={record.isVacation}
                                       className="w-full px-4 py-3 border-2 border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 font-bold text-center text-red-800"
                                     />
                                   </div>
                                 </div>

                                 {/* Alimentación completa mejorada */}
                                 <div className="mb-6">
                                   <h5 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                                     <Utensils className="text-green-600" size={20} />
                                     <span>Alimentación Completa</span>
                                   </h5>
                                   <div className="grid grid-cols-2 gap-3">
                                     {/* Desayuno */}
                                     <div className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200 hover:border-yellow-300 transition-colors">
                                       <div className="flex items-center justify-between mb-3">
                                         <span className="text-sm font-bold text-yellow-800">Desayuno</span>
                                         <Coffee className="text-yellow-600" size={16} />
                                       </div>
                                       <div className="flex items-center justify-center space-x-2">
                                         <button
                                           onClick={() => updateFoodAllowance(employee.id, 'breakfast', record.foodAllowance.breakfast - 1)}
                                           className="w-10 h-10 rounded-xl bg-white border-2 border-yellow-300 flex items-center justify-center hover:bg-yellow-100 hover:border-yellow-400 transition-all shadow-sm disabled:opacity-50"
                                           disabled={record.foodAllowance.breakfast <= 0}
                                         >
                                           <Minus size={16} className="text-yellow-700" />
                                         </button>
                                         <span className="w-12 text-center font-black text-xl text-yellow-800 bg-white rounded-lg py-2 border-2 border-yellow-200">{record.foodAllowance.breakfast}</span>
                                         <button
                                           onClick={() => updateFoodAllowance(employee.id, 'breakfast', record.foodAllowance.breakfast + 1)}
                                           className="w-10 h-10 rounded-xl bg-white border-2 border-yellow-300 flex items-center justify-center hover:bg-yellow-100 hover:border-yellow-400 transition-all shadow-sm disabled:opacity-50"
                                           disabled={record.foodAllowance.breakfast >= 10}
                                         >
                                           <Plus size={16} className="text-yellow-700" />
                                         </button>
                                       </div>
                                     </div>

                                     {/* Desayuno Reforzado */}
                                     <div className="bg-amber-50 p-4 rounded-xl border-2 border-amber-200 hover:border-amber-300 transition-colors">
                                       <div className="flex items-center justify-between mb-3">
                                         <span className="text-sm font-bold text-amber-800">D. Reforzado</span>
                                         <Coffee className="text-amber-600" size={16} />
                                       </div>
                                       <div className="flex items-center justify-center space-x-2">
                                         <button
                                           onClick={() => updateFoodAllowance(employee.id, 'reinforcedBreakfast', record.foodAllowance.reinforcedBreakfast - 1)}
                                           className="w-10 h-10 rounded-xl bg-white border-2 border-amber-300 flex items-center justify-center hover:bg-amber-100 hover:border-amber-400 transition-all shadow-sm disabled:opacity-50"
                                           disabled={record.foodAllowance.reinforcedBreakfast <= 0}
                                         >
                                           <Minus size={16} className="text-amber-700" />
                                         </button>
                                         <span className="w-12 text-center font-black text-xl text-amber-800 bg-white rounded-lg py-2 border-2 border-amber-200">{record.foodAllowance.reinforcedBreakfast}</span>
                                         <button
                                           onClick={() => updateFoodAllowance(employee.id, 'reinforcedBreakfast', record.foodAllowance.reinforcedBreakfast + 1)}
                                           className="w-10 h-10 rounded-xl bg-white border-2 border-amber-300 flex items-center justify-center hover:bg-amber-100 hover:border-amber-400 transition-all shadow-sm disabled:opacity-50"
                                           disabled={record.foodAllowance.reinforcedBreakfast >= 10}
                                         >
                                           <Plus size={16} className="text-amber-700" />
                                         </button>
                                       </div>
                                     </div>

                                     {/* Refrigerio */}
                                     <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200 hover:border-green-300 transition-colors">
                                       <div className="flex items-center justify-between mb-3">
                                         <span className="text-sm font-bold text-green-800">Refrigerio</span>
                                         <Coffee className="text-green-600" size={16} />
                                       </div>
                                       <div className="flex items-center justify-center space-x-2">
                                         <button
                                           onClick={() => updateFoodAllowance(employee.id, 'snack1', record.foodAllowance.snack1 - 1)}
                                           className="w-10 h-10 rounded-xl bg-white border-2 border-green-300 flex items-center justify-center hover:bg-green-100 hover:border-green-400 transition-all shadow-sm disabled:opacity-50"
                                           disabled={record.foodAllowance.snack1 <= 0}
                                         >
                                           <Minus size={16} className="text-green-700" />
                                         </button>
                                         <span className="w-12 text-center font-black text-xl text-green-800 bg-white rounded-lg py-2 border-2 border-green-200">{record.foodAllowance.snack1}</span>
                                         <button
                                           onClick={() => updateFoodAllowance(employee.id, 'snack1', record.foodAllowance.snack1 + 1)}
                                           className="w-10 h-10 rounded-xl bg-white border-2 border-green-300 flex items-center justify-center hover:bg-green-100 hover:border-green-400 transition-all shadow-sm disabled:opacity-50"
                                           disabled={record.foodAllowance.snack1 >= 10}
                                         >
                                           <Plus size={16} className="text-green-700" />
                                         </button>
                                       </div>
                                     </div>

                                     {/* Merienda */}
                                     <div className="bg-emerald-50 p-4 rounded-xl border-2 border-emerald-200 hover:border-emerald-300 transition-colors">
                                       <div className="flex items-center justify-between mb-3">
                                         <span className="text-sm font-bold text-emerald-800">Merienda</span>
                                         <Coffee className="text-emerald-600" size={16} />
                                       </div>
                                       <div className="flex items-center justify-center space-x-2">
                                         <button
                                           onClick={() => updateFoodAllowance(employee.id, 'afternoonSnack', record.foodAllowance.afternoonSnack - 1)}
                                           className="w-10 h-10 rounded-xl bg-white border-2 border-emerald-300 flex items-center justify-center hover:bg-emerald-100 hover:border-emerald-400 transition-all shadow-sm disabled:opacity-50"
                                           disabled={record.foodAllowance.afternoonSnack <= 0}
                                         >
                                           <Minus size={16} className="text-emerald-700" />
                                         </button>
                                         <span className="w-12 text-center font-black text-xl text-emerald-800 bg-white rounded-lg py-2 border-2 border-emerald-200">{record.foodAllowance.afternoonSnack}</span>
                                         <button
                                           onClick={() => updateFoodAllowance(employee.id, 'afternoonSnack', record.foodAllowance.afternoonSnack + 1)}
                                           className="w-10 h-10 rounded-xl bg-white border-2 border-emerald-300 flex items-center justify-center hover:bg-emerald-100 hover:border-emerald-400 transition-all shadow-sm disabled:opacity-50"
                                           disabled={record.foodAllowance.afternoonSnack >= 10}
                                         >
                                           <Plus size={16} className="text-emerald-700" />
                                         </button>
                                       </div>
                                     </div>

                                     {/* Ración Seca */}
                                     <div className="bg-orange-50 p-4 rounded-xl border-2 border-orange-200 hover:border-orange-300 transition-colors">
                                       <div className="flex items-center justify-between mb-3">
                                         <span className="text-sm font-bold text-orange-800">Ración Seca</span>
                                         <Utensils className="text-orange-600" size={16} />
                                       </div>
                                       <div className="flex items-center justify-center space-x-2">
                                         <button
                                           onClick={() => updateFoodAllowance(employee.id, 'dryMeal', record.foodAllowance.dryMeal - 1)}
                                           className="w-10 h-10 rounded-xl bg-white border-2 border-orange-300 flex items-center justify-center hover:bg-orange-100 hover:border-orange-400 transition-all shadow-sm disabled:opacity-50"
                                           disabled={record.foodAllowance.dryMeal <= 0}
                                         >
                                           <Minus size={16} className="text-orange-700" />
                                         </button>
                                         <span className="w-12 text-center font-black text-xl text-orange-800 bg-white rounded-lg py-2 border-2 border-orange-200">{record.foodAllowance.dryMeal}</span>
                                         <button
                                           onClick={() => updateFoodAllowance(employee.id, 'dryMeal', record.foodAllowance.dryMeal + 1)}
                                           className="w-10 h-10 rounded-xl bg-white border-2 border-orange-300 flex items-center justify-center hover:bg-orange-100 hover:border-orange-400 transition-all shadow-sm disabled:opacity-50"
                                           disabled={record.foodAllowance.dryMeal >= 10}
                                         >
                                           <Plus size={16} className="text-orange-700" />
                                         </button>
                                       </div>
                                     </div>

                                     {/* Almuerzo */}
                                     <div className="bg-teal-50 p-4 rounded-xl border-2 border-teal-200 hover:border-teal-300 transition-colors">
                                       <div className="flex items-center justify-between mb-3">
                                         <span className="text-sm font-bold text-teal-800">Almuerzo</span>
                                         <Utensils className="text-teal-600" size={16} />
                                       </div>
                                       <div className="flex items-center justify-center space-x-2">
                                         <button
                                           onClick={() => updateFoodAllowance(employee.id, 'lunch', record.foodAllowance.lunch - 1)}
                                           className="w-10 h-10 rounded-xl bg-white border-2 border-teal-300 flex items-center justify-center hover:bg-teal-100 hover:border-teal-400 transition-all shadow-sm disabled:opacity-50"
                                           disabled={record.foodAllowance.lunch <= 0}
                                         >
                                           <Minus size={16} className="text-teal-700" />
                                         </button>
                                         <span className="w-12 text-center font-black text-xl text-teal-800 bg-white rounded-lg py-2 border-2 border-teal-200">{record.foodAllowance.lunch}</span>
                                         <button
                                           onClick={() => updateFoodAllowance(employee.id, 'lunch', record.foodAllowance.lunch + 1)}
                                           className="w-10 h-10 rounded-xl bg-white border-2 border-teal-300 flex items-center justify-center hover:bg-teal-100 hover:border-teal-400 transition-all shadow-sm disabled:opacity-50"
                                           disabled={record.foodAllowance.lunch >= 10}
                                         >
                                           <Plus size={16} className="text-teal-700" />
                                         </button>
                                       </div>
                                     </div>
                                   </div>
                                 </div>

                                 {/* Transporte */}
                                 <div className="mb-6">
                                   <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-colors">
                                     <div className="flex items-center justify-between mb-3">
                                       <span className="text-lg font-bold text-blue-800 flex items-center space-x-2">
                                         <Car className="text-blue-600" size={20} />
                                         <span>Transporte</span>
                                       </span>
                                       <div className="bg-blue-100 px-3 py-1 rounded-full">
                                         <span className="text-xs font-bold text-blue-700">USD</span>
                                       </div>
                                     </div>
                                     <div className="flex items-center justify-center space-x-3">
                                       <DollarSign className="text-blue-600" size={24} />
                                       <input
                                         type="number"
                                         value={record.foodAllowance.transport}
                                         onChange={(e) => updateFoodAllowance(employee.id, 'transport', parseFloat(e.target.value) || 0)}
                                         min="0"
                                         max="50"
                                         step="0.25"
                                         className="w-24 text-center text-xl font-bold border-2 border-blue-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-blue-800"
                                         placeholder="0.00"
                                       />
                                       <div className="flex flex-col space-y-1">
                                         <button
                                           onClick={() => updateFoodAllowance(employee.id, 'transport', record.foodAllowance.transport + 0.25)}
                                           className="w-8 h-8 rounded-lg bg-white border-2 border-blue-300 flex items-center justify-center hover:bg-blue-100 hover:border-blue-400 transition-all shadow-sm"
                                         >
                                           <Plus size={14} className="text-blue-700" />
                                         </button>
                                         <button
                                           onClick={() => updateFoodAllowance(employee.id, 'transport', Math.max(0, record.foodAllowance.transport - 0.25))}
                                           className="w-8 h-8 rounded-lg bg-white border-2 border-blue-300 flex items-center justify-center hover:bg-blue-100 hover:border-blue-400 transition-all shadow-sm"
                                         >
                                           <Minus size={14} className="text-blue-700" />
                                         </button>
                                       </div>
                                     </div>
                                   </div>
                                 </div>

                                 {/* Permisos mejorados */}
                                 <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200 hover:border-purple-300 transition-colors">
                                   <h5 className="text-lg font-bold text-purple-800 mb-4 flex items-center space-x-2">
                                     <Clock className="text-purple-600" size={20} />
                                     <span>Permisos</span>
                                   </h5>
                                   <div className="space-y-4">
                                     <div>
                                       <label className="block text-sm font-semibold text-purple-700 mb-2">Horas de permiso</label>
                                       <div className="flex items-center space-x-3">
                                         <input
                                           type="number"
                                           value={record.permissionHours}
                                           onChange={(e) => updateEmployeeRecord(employee.id, 'permissionHours', parseFloat(e.target.value) || 0)}
                                           min="0"
                                           max="8"
                                           step="0.5"
                                           className="w-20 text-center text-lg font-bold border-2 border-purple-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-purple-800"
                                         />
                                         <span className="text-sm font-medium text-purple-700">horas</span>
                                         <div className="flex space-x-1">
                                           <button
                                             onClick={() => updateEmployeeRecord(employee.id, 'permissionHours', record.permissionHours + 0.5)}
                                             className="w-8 h-8 rounded-lg bg-white border-2 border-purple-300 flex items-center justify-center hover:bg-purple-100 hover:border-purple-400 transition-all shadow-sm"
                                           >
                                             <Plus size={14} className="text-purple-700" />
                                           </button>
                                           <button
                                             onClick={() => updateEmployeeRecord(employee.id, 'permissionHours', Math.max(0, record.permissionHours - 0.5))}
                                             className="w-8 h-8 rounded-lg bg-white border-2 border-purple-300 flex items-center justify-center hover:bg-purple-100 hover:border-purple-400 transition-all shadow-sm"
                                           >
                                             <Minus size={14} className="text-purple-700" />
                                           </button>
                                         </div>
                                       </div>
                                     </div>
                                     {record.permissionHours > 0 && (
                                       <div className="bg-white p-3 rounded-lg border border-purple-200">
                                         <label className="block text-sm font-semibold text-purple-700 mb-2">Razón del permiso</label>
                                         <input
                                           type="text"
                                           value={record.permissionReason}
                                           onChange={(e) => updateEmployeeRecord(employee.id, 'permissionReason', e.target.value)}
                                           placeholder="Describe la razón del permiso..."
                                           className="w-full text-sm border-2 border-purple-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                                         />
                                       </div>
                                     )}
                                   </div>
                                 </div>

                                 {/* Botones de acción mejorados */}
                                 <div className="grid grid-cols-2 gap-3 mt-6">
                                   <button
                                     onClick={() => {
                                       // Aplicar valores por defecto
                                       updateEmployeeRecord(employee.id, 'entryTime', defaultSettings.standardEntry);
                                       updateEmployeeRecord(employee.id, 'exitTime', defaultSettings.standardExit);
                                       updateEmployeeRecord(employee.id, 'isVacation', false);
                                       updateEmployeeRecord(employee.id, 'permissionHours', 0);
                                       updateEmployeeRecord(employee.id, 'permissionReason', '');
                                       Object.keys(defaultSettings.foodAllowance).forEach(key => {
                                         updateFoodAllowance(employee.id, key, defaultSettings.foodAllowance[key as keyof typeof defaultSettings.foodAllowance]);
                                       });
                                     }}
                                     className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all transform hover:scale-105 shadow-lg"
                                   >
                                     <RefreshCw size={16} />
                                     <span>Resetear</span>
                                   </button>
                                   <button
                                     onClick={() => {
                                       // Aplicar valores comunes
                                       updateFoodAllowance(employee.id, 'breakfast', 1);
                                       updateFoodAllowance(employee.id, 'lunch', 1);
                                       updateFoodAllowance(employee.id, 'transport', 2.5);
                                     }}
                                     className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all transform hover:scale-105 shadow-lg"
                                   >
                                     <CheckCircle size={16} />
                                     <span>Estándar</span>
                                   </button>
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

             {/* TABLA DE VERIFICACIÓN SIEMPRE VISIBLE */}
             {totalEmployees > 0 && (
               <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                 {/* Header de verificación */}
                 <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-4">
                       <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                         <CheckCircle className="text-white" size={24} />
                       </div>
                       <div>
                         <h3 className="text-2xl font-bold text-white">Tabla de Verificación</h3>
                         <p className="text-emerald-100">Revisa todos los datos antes de guardar ({allEmployees.length} empleados)</p>
                       </div>
                     </div>
                     <div className="flex items-center space-x-4">
                       <div className="relative">
                         <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                         <input
                           type="text"
                           placeholder="Buscar en tabla..."
                           value={summarySearchTerm}
                           onChange={(e) => setSummarySearchTerm(e.target.value)}
                           className="pl-12 pr-4 py-3 w-80 border-0 rounded-xl bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-800 placeholder-gray-500"
                         />
                       </div>
                       {selectedRows.size > 0 && (
                         <div className="flex items-center space-x-2 bg-white/20 rounded-xl px-4 py-3">
                           <Target className="text-white" size={20} />
                           <span className="text-white font-bold">{selectedRows.size} seleccionados</span>
                         </div>
                       )}
                     </div>
                   </div>
                 </div>

                 {/* Barra de acciones masivas mejorada */}
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

                 {/* Tabla Excel siempre visible para verificación */}
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
                             className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                           />
                         </th>
                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-12 bg-gray-50 z-30 border-r border-gray-200 min-w-[200px]">
                           Empleado
                         </th>
                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100 min-w-[100px]">
                           Área
                         </th>
                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100 min-w-[80px]">
                           Entrada
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
                               isSelected ? 'bg-emerald-50 border-l-4 border-emerald-500' : ''
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
                                 className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
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
                               <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${
                                 record.isVacation ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-800'
                               }`}>
                                 {record.isVacation ? 'N/A' : record.entryTime}
                               </span>
                             </td>
                             
                             <td className="px-4 py-3 whitespace-nowrap">
                               <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${
                                 record.isVacation ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-800'
                               }`}>
                                 {record.isVacation ? 'N/A' : record.exitTime}
                               </span>
                             </td>
                             
                             {/* Estado */}
                             <td className="px-4 py-3 whitespace-nowrap">
                               <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                 record.isVacation 
                                   ? 'bg-orange-100 text-orange-800' 
                                   : 'bg-green-100 text-green-800'
                               }`}>
                                 {record.isVacation ? '🏖️ Vacaciones' : '✅ Normal'}
                               </span>
                             </td>
                             
                             {/* Controles de alimentación - Solo lectura en tabla */}
                             <td className="px-4 py-4 bg-yellow-50 text-center">
                               <div className="inline-flex items-center justify-center w-8 h-8 bg-yellow-200 rounded-full">
                                 <span className="text-sm font-bold text-yellow-800">{record.foodAllowance.breakfast}</span>
                               </div>
                             </td>
                             
                             <td className="px-4 py-4 bg-yellow-50 text-center">
                               <div className="inline-flex items-center justify-center w-8 h-8 bg-amber-200 rounded-full">
                                 <span className="text-sm font-bold text-amber-800">{record.foodAllowance.reinforcedBreakfast}</span>
                               </div>
                             </td>
                             
                             <td className="px-4 py-4 bg-green-50 text-center">
                               <div className="inline-flex items-center justify-center w-8 h-8 bg-green-200 rounded-full">
                                 <span className="text-sm font-bold text-green-800">{record.foodAllowance.snack1}</span>
                               </div>
                             </td>
                             
                             <td className="px-4 py-4 bg-green-50 text-center">
                               <div className="inline-flex items-center justify-center w-8 h-8 bg-emerald-200 rounded-full">
                                 <span className="text-sm font-bold text-emerald-800">{record.foodAllowance.afternoonSnack}</span>
                               </div>
                             </td>
                             
                             <td className="px-4 py-4 bg-orange-50 text-center">
                               <div className="inline-flex items-center justify-center w-8 h-8 bg-orange-200 rounded-full">
                                 <span className="text-sm font-bold text-orange-800">{record.foodAllowance.dryMeal}</span>
                               </div>
                             </td>
                             
                             <td className="px-4 py-4 bg-green-50 text-center">
                               <div className="inline-flex items-center justify-center w-8 h-8 bg-teal-200 rounded-full">
                                 <span className="text-sm font-bold text-teal-800">{record.foodAllowance.lunch}</span>
                               </div>
                             </td>
                             
                             {/* Transporte */}
                             <td className="px-4 py-3 whitespace-nowrap bg-blue-50 text-center">
                               <div className="inline-flex items-center space-x-1 bg-blue-100 px-2 py-1 rounded-full">
                                 <DollarSign className="text-blue-600" size={12} />
                                 <span className="text-sm font-bold text-blue-800">{record.foodAllowance.transport.toFixed(2)}</span>
                               </div>
                             </td>
                             
                             {/* Permisos */}
                             <td className="px-4 py-3 whitespace-nowrap bg-purple-50 text-center">
                               <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                                 record.permissionHours > 0 ? 'bg-purple-200 text-purple-800' : 'bg-gray-100 text-gray-500'
                               }`}>
                                 {record.permissionHours > 0 ? `${record.permissionHours}h` : '0h'}
                               </span>
                             </td>
                             
                             {/* Razón Permiso */}
                             <td className="px-4 py-3 bg-purple-50">
                               <span className="text-xs text-purple-700 font-medium">
                                 {record.permissionReason || (record.permissionHours > 0 ? 'Sin especificar' : '-')}
                               </span>
                             </td>
                           </tr>
                         );
                       })}
                       
                       {/* Fila de totales mejorada */}
                       <tr className="bg-gradient-to-r from-gray-800 to-gray-900 text-white font-bold border-t-4 border-gray-600 sticky bottom-0">
                         <td className="px-3 py-4 sticky left-0 bg-gray-800 z-20 border-r border-gray-600">
                           <Calculator size={16} className="text-gray-300" />
                         </td>
                         <td className="px-4 py-4 sticky left-12 bg-gray-800 z-20 border-r border-gray-600">
                           <div className="flex items-center space-x-2">
                             <Calculator size={16} className="text-gray-300" />
                             <span className="text-sm font-bold text-white">TOTALES FINALES</span>
                           </div>
                         </td>
                         <td className="px-4 py-4 text-sm text-gray-300 text-center">
                           {selectedAreaIds.length} área(s)
                         </td>
                         <td className="px-4 py-4 text-sm text-gray-300 text-center">-</td>
                         <td className="px-4 py-4 text-sm text-gray-300 text-center">-</td>
                         <td className="px-4 py-4 text-sm text-gray-300 text-center">
                           {totals.totalEmployees} emp.
                         </td>
                         <td className="px-4 py-4 bg-yellow-600 text-center">
                           <div className="text-lg font-black text-white">{totals.totalBreakfast}</div>
                           <div className="text-xs text-yellow-100">unidades</div>
                         </td>
                         <td className="px-4 py-4 bg-amber-600 text-center">
                           <div className="text-lg font-black text-white">{totals.totalReinforcedBreakfast}</div>
                           <div className="text-xs text-amber-100">unidades</div>
                         </td>
                         <td className="px-4 py-4 bg-green-600 text-center">
                           <div className="text-lg font-black text-white">{totals.totalSnack1}</div>
                           <div className="text-xs text-green-100">unidades</div>
                         </td>
                         <td className="px-4 py-4 bg-emerald-600 text-center">
                           <div className="text-lg font-black text-white">{totals.totalAfternoonSnack}</div>
                           <div className="text-xs text-emerald-100">unidades</div>
                         </td>
                         <td className="px-4 py-4 bg-orange-600 text-center">
                           <div className="text-lg font-black text-white">{totals.totalDryMeal}</div>
                           <div className="text-xs text-orange-100">unidades</div>
                         </td>
                         <td className="px-4 py-4 bg-teal-600 text-center">
                           <div className="text-lg font-black text-white">{totals.totalLunch}</div>
                           <div className="text-xs text-teal-100">unidades</div>
                         </td>
                         <td className="px-4 py-4 bg-blue-600 text-center">
                           <div className="text-lg font-black text-white">${totals.totalTransport.toFixed(2)}</div>
                           <div className="text-xs text-blue-100">total</div>
                         </td>
                         <td className="px-4 py-4 bg-purple-600 text-center">
                           <div className="text-lg font-black text-white">{totals.permissionCount}</div>
                           <div className="text-xs text-purple-100">con permisos</div>
                         </td>
                         <td className="px-4 py-4 bg-purple-600 text-center text-sm text-purple-100">-</td>
                       </tr>
                     </tbody>
                   </table>
                 </div>

                 {/* Resumen de totales mejorado */}
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
           </>
         )}

         {/* TABLA RESUMEN MEJORADA ESTILO EXCEL - Solo cuando se solicita específicamente */}
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
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100 min-w-[100px]">
                       Área
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100 min-w-[80px]">
                       Entrada
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
                       <span className="text-blue-700"><strong>Registra en cards</strong> individuales</span>
                     </div>
                     <div className="flex items-center space-x-3">
                       <span className="w-8 h-8 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center font-bold">3</span>
                       <span className="text-blue-700"><strong>Verifica en tabla</strong> automática</span>
                     </div>
                   </div>
                   <div className="space-y-3">
                     <div className="flex items-center space-x-3">
                       <span className="w-8 h-8 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center font-bold">4</span>
                       <span className="text-blue-700"><strong>Edición masiva</strong> si necesitas</span>
                     </div>
                     <div className="flex items-center space-x-3">
                       <span className="w-8 h-8 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center font-bold">5</span>
                       <span className="text-blue-700"><strong>Guarda todo</strong> en un solo click</span>
                     </div>
                   </div>
                 </div>
                 
                 <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="p-4 bg-blue-100 rounded-xl">
                     <h4 className="font-bold text-blue-800 mb-2">🎯 Cards Premium</h4>
                     <ul className="text-sm text-blue-700 space-y-1">
                       <li>• Diseño moderno con gradientes</li>
                       <li>• Controles +/- grandes</li>
                       <li>• Todos los datos completos</li>
                       <li>• Botones de acción rápidos</li>
                       <li>• Búsqueda en tiempo real</li>
                     </ul>
                     </div>
                   
                   <div className="p-4 bg-green-100 rounded-xl">
                     <h4 className="font-bold text-green-800 mb-2">⚡ Tabla Automática</h4>
                     <ul className="text-sm text-green-700 space-y-1">
                       <li>• Siempre visible para verificación</li>
                       <li>• Selección múltiple avanzada</li>
                       <li>• Acciones masivas inteligentes</li>
                       <li>• Totales automáticos</li>
                       <li>• Vista de solo lectura</li>
                     </ul>
                   </div>
                 </div>

                 <div className="mt-6 p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl border border-blue-200">
                   <p className="text-sm text-blue-800">
                     <strong>✨ Nuevo Diseño:</strong> Cards premium para registro individual + Tabla de verificación siempre visible. 
                     La experiencia más completa para manejar hasta 615 empleados con estilo y eficiencia.
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