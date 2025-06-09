// src/lib/api.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Crear instancia de axios
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('hojaverde_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      if (typeof window !== 'undefined') {
        localStorage.removeItem('hojaverde_token');
        localStorage.removeItem('hojaverde_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Tipos
export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    identification: string;
    position?: string;
    area?: {
      id: string;
      name: string;
    };
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// API calls de autenticación
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  me: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  },
};

// API calls de áreas
export const areasAPI = {
  getAll: async (params?: { includeEmployees?: boolean; search?: string }) => {
    const response = await api.get('/areas', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/areas/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/areas', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/areas/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/areas/${id}`);
    return response.data;
  },
};

// API calls de empleados
export const employeesAPI = {
  getAll: async (params?: {
    areaId?: string;
    areaIds?: string[];
    search?: string;
    page?: number;
    limit?: number;
    activeOnly?: boolean;
  }) => {
    const queryParams: any = { ...params };
    if (params?.areaIds) {
      queryParams.areaIds = params.areaIds.join(',');
    }
    const response = await api.get('/employees', { params: queryParams });
    return response.data;
  },

  getByMultipleAreas: async (areaIds: string[]) => {
    const response = await api.get(`/employees/by-areas?areaIds=${areaIds.join(',')}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/employees', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },

  activate: async (id: string) => {
    const response = await api.post(`/employees/${id}/activate`);
    return response.data;
  },
};

// API calls de asistencia (CRÍTICO)
export const attendanceAPI = {
  getTemplate: async (areaIds: string[], date: string) => {
    const response = await api.get(`/attendance/template?areaIds=${areaIds.join(',')}&date=${date}`);
    return response.data;
  },

  bulkCreate: async (data: {
    date: string;
    records: Array<{
      employeeId: string;
      entryTime?: string;
      exitTime?: string;
      lunchDuration?: number;
      isVacation?: boolean;
      permissionHours?: number;
      permissionReason?: string;
      foodAllowance?: {
        breakfast?: number;
        reinforcedBreakfast?: number;
        snack1?: number;
        afternoonSnack?: number;
        dryMeal?: number;
        lunch?: number;
        transport?: number;
      };
    }>;
  }) => {
    const response = await api.post('/attendance/bulk', data);
    return response.data;
  },

  verify: async (date: string, areaIds?: string[]) => {
    const params = areaIds ? `?date=${date}&areaIds=${areaIds.join(',')}` : `?date=${date}`;
    const response = await api.get(`/attendance/verify${params}`);
    return response.data;
  },

  getDailySummary: async (date: string) => {
    const response = await api.get(`/attendance/daily-summary?date=${date}`);
    return response.data;
  },
};
export const reportsAPI = {
  getDailyReport: async (date: string, areaIds?: string[]) => {
    const params = areaIds ? `?date=${date}&areaIds=${areaIds.join(',')}` : `?date=${date}`;
    const response = await api.get(`/reports/daily${params}`);
    return response.data;
  },

  getWeeklyReport: async (startDate: string, endDate: string, areaIds?: string[]) => {
    const params = new URLSearchParams({
      startDate,
      endDate,
      ...(areaIds && { areaIds: areaIds.join(',') })
    });
    const response = await api.get(`/reports/weekly?${params}`);
    return response.data;
  },

  getMonthlyReport: async (year: number, month: number, areaIds?: string[]) => {
    const params = new URLSearchParams({
      year: year.toString(),
      month: month.toString(),
      ...(areaIds && { areaIds: areaIds.join(',') })
    });
    const response = await api.get(`/reports/monthly?${params}`);
    return response.data;
  },

  exportReport: async (type: 'daily' | 'weekly' | 'monthly', params: any) => {
    const response = await api.get(`/reports/export/${type}`, { 
      params,
      responseType: 'blob'
    });
    return response.data;
  }
};

export default api;