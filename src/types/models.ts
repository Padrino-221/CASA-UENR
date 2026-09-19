export interface Chapter {
  id: string;
  name: string;
  university: string;
  regionId: string;
  createdAt: string;
  region: {
    name: string;
  };
  _count: {
    students: number;
    collections: number;
  };
  admins?: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
  }>;
}

export interface ChaptersResponse {
  chapters: Chapter[];
  cutoffDate: string | null;
}

export interface Region {
  id: string;
  name: string;
  _count?: {
    chapters: number;
    students: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  regionId?: string;
  chapterId?: string;
}

export interface Semester {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  academicYearId: string;
}

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  chapterId: string;
  chapter?: {
    name: string;
  };
  semesters: Semester[];
}

export interface Transaction {
  id: string;
  amount: number;
  type: string; // INCOME or EXPENSE
  category: string;
  date: string;
  description?: string;
  chapterId: string;
  studentId?: string | null;
  chapter: {
    name: string;
  };
  student?: {
    name: string;
    studentId?: string | null;
  };
}

export interface Student {
  id: string;
  studentId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  department?: string | null;
  levelYear?: string | null;
  maxLevel?: string | null;
  status: string;
  enrollmentDate: string;
  chapter: {
    name: string;
    region: {
      name: string;
    }
  };
  isLeader: boolean;
  position?: string | null;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: string | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
    role: string;
  };
}
