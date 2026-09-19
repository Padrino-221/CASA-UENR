import { useState } from 'react';
import { useNotification } from '@/context/NotificationContext';
import { AcademicYear } from '@/types/models';

export function useCalendar() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const notification = useNotification();

  const fetchCalendar = async (chapterId?: string) => {
    try {
      setLoading(true);
      const url = chapterId ? `/api/calendar?chapterId=${chapterId}` : '/api/calendar';
      const res = await fetch(url);
      const data = await res.json();
      if (!data.error) setAcademicYears(data);
    } catch (error) {
      console.error('Failed to fetch calendar:', error);
      notification.error('Failed to load institutional calendar.');
    } finally {
      setLoading(false);
    }
  };

  const createYear = async (payload: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE_YEAR', ...payload })
      });
      if (res.ok) {
        notification.success('New academic cycle initialized.');
        fetchCalendar();
        return true;
      }
      return false;
    } catch {
      notification.error('Failed to initialize academic year.');
      return false;
    }
  };

  const updateYear = async (yearId: string, payload: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE_YEAR', yearId, ...payload })
      });
      if (res.ok) {
        notification.success('Academic year updated.');
        fetchCalendar();
        return true;
      }
      return false;
    } catch {
      notification.error('Failed to update year record.');
      return false;
    }
  };

  const deleteYear = (yearId: string) => {
    notification.confirm({
      title: 'Delete Academic Year?',
      message: 'Warning: Deleting an academic year will remove all associated semesters and historical tracking. This action is irreversible.',
      confirmText: 'Delete Year',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await fetch('/api/calendar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'DELETE_YEAR', yearId })
          });
          notification.success('Academic year record removed.');
          fetchCalendar();
        } catch {
          notification.error('Failed to remove academic year.');
        }
      }
    });
  };

  const createSemester = async (yearId: string, payload: Record<string, unknown>) => {
    try {
      await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE_SEMESTER', yearId, ...payload })
      });
      notification.success('Semester record initialized.');
      fetchCalendar();
      return true;
    } catch {
      notification.error('Failed to create semester.');
      return false;
    }
  };

  const updateSemester = async (semesterId: string, payload: Record<string, unknown>) => {
    try {
      await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE_SEMESTER', semesterId, ...payload })
      });
      notification.success('Semester data corrected.');
      fetchCalendar();
      return true;
    } catch {
      notification.error('Failed to update semester.');
      return false;
    }
  };

  const deleteSemester = (semesterId: string) => {
    notification.confirm({
      title: 'Purge Semester Data?',
      message: 'Are you sure you want to delete this semester? This will remove all associated logs for this period.',
      confirmText: 'Purge Records',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await fetch('/api/calendar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'DELETE_SEMESTER', semesterId })
          });
          notification.success('Semester record purged.');
          fetchCalendar();
        } catch {
          notification.error('Failed to purge semester data.');
        }
      }
    });
  };

  const toggleSemester = async (semesterId: string) => {
    try {
      await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'TOGGLE_STATUS', semesterId })
      });
      notification.success('Semester status synchronized.');
      fetchCalendar();
    } catch {
      notification.error('Failed to toggle semester status.');
    }
  };

  const promoteStudents = () => {
    notification.confirm({
      title: 'Execute Academic Promotion?',
      message: 'This will advance all active students by one level. Finalists will be transitioned to Alumni status.',
      confirmText: 'Execute Promotion',
      variant: 'info',
      onConfirm: async () => {
        try {
          const res = await fetch('/api/students/promote', { method: 'POST' });
          const data = await res.json();
          if (res.ok) notification.success(data.message);
          else notification.error(data.error || 'Cycle conclusion failed.');
        } catch {
          notification.error('Network error during transition.');
        }
      }
    });
  };

  return {
    academicYears,
    loading,
    fetchCalendar,
    createYear,
    updateYear,
    deleteYear,
    createSemester,
    updateSemester,
    deleteSemester,
    toggleSemester,
    promoteStudents
  };
}
