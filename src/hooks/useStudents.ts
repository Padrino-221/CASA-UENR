import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useNotification } from '@/context/NotificationContext';

import Papa from 'papaparse';

export function useStudents() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const notification = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = useCallback((query: string) => {
    const params = new URLSearchParams(searchParams);
    if (query) params.set('search', query);
    else params.delete('search');
    router.replace(`/students?${params.toString()}`);
  }, [router, searchParams]);

  const createStudent = async (payload: Record<string, unknown>) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        notification.success('Member record initialized.');
        router.refresh();
        return true;
      } else {
        const err = await res.json();
        notification.error(err.error || 'Failed to initialize record.');
        return false;
      }
    } catch {
      notification.error('A network error occurred.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateStudent = async (id: string, payload: any) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        notification.success('Member profile synchronized.');
        router.refresh();
        return true;
      } else {
        const err = await res.json();
        notification.error(err.error || 'Update failed.');
        return false;
      }
    } catch {
      notification.error('Communication failure with central registry.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteStudent = (id: string) => {
    notification.confirm({
      title: 'Remove Member?',
      message: 'This action cannot be undone. All spiritual progress tracking for this member will be permanently purged. Continue?',
      confirmText: 'Remove Record',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
          if (res.ok) {
            notification.success('Member record removed.');
            router.refresh();
          } else {
            notification.error('Failed to remove member record.');
          }
        } catch {
          notification.error('A system communication error occurred.');
        }
      }
    });
  };

  const bulkUploadStudents = async (file: File) => {
    setIsSubmitting(true);
    return new Promise<boolean>((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results: Papa.ParseResult<Record<string, unknown>>) => {
          try {
            const res = await fetch('/api/students/bulk', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ students: results.data })
            });
            
            if (res.ok) {
              const data = await res.json();
              notification.success(data.message);
              router.refresh();
              resolve(true);
            } else {
              const error = await res.json();
              notification.error(error.error || 'Failed to process bulk upload');
              resolve(false);
            }
          } catch {
            notification.error('A network error occurred during upload.');
            resolve(false);
          } finally {
            setIsSubmitting(false);
          }
        }
      });
    });
  };

  return {
    isSubmitting,
    handleSearch,
    createStudent,
    updateStudent,
    deleteStudent,
    bulkUploadStudents
  };
}
