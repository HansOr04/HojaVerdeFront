export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    identification: string;
  };
}

export interface Area {
  id: string;
  name: string;
  defaultEntryTime: string;
  defaultExitTime: string;
  defaultLunchDuration: number;
  defaultWorkingHours: number;
  employeesCount?: number;
}

export interface Employee {
  id: string;
  identification: string;
  firstName: string;
  lastName: string;
  fullName: string;
  areaId?: string;
  area?: Area;
  position?: string;
  baseSalary?: number;
  isActive: boolean;
}