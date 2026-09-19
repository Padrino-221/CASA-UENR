import { useState, useEffect } from 'react';
import { useNotification } from '@/context/NotificationContext';
import { Chapter, ChaptersResponse } from '@/types/models';
import Papa from 'papaparse';

export function useChapters() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [cutoffDate, setCutoffDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const notification = useNotification();

  const fetchChapters = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/chapters');
      const data = await res.json();
      if (data && typeof data === 'object' && 'chapters' in data) {
        const parsed = data as ChaptersResponse;
        setChapters(parsed.chapters);
        setCutoffDate(parsed.cutoffDate);
      } else {
        setChapters(Array.isArray(data) ? data : []);
        setCutoffDate(null);
      }
    } catch (error) {
      console.error('Failed to fetch chapters:', error);
      notification.error('Failed to load chapters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChapters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createChapter = async (payload: Record<string, unknown>) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        notification.success('Chapter added.');
        fetchChapters();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to create chapter:', error);
      notification.error('Could not register chapter.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateChapter = async (id: string, payload: Record<string, unknown>) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/chapters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        notification.success('Chapter updated.');
        fetchChapters();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update chapter:', error);
      notification.error('Failed to update chapter.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteChapter = (id: string) => {
    notification.confirm({
      title: 'Delete Chapter?',
      message: 'Are you sure you want to delete this chapter? All spiritual and financial records will be permanently removed.',
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/chapters/${id}`, { method: 'DELETE' });
          if (res.ok) {
            notification.success('Chapter deleted.');
            fetchChapters();
          } else {
            const err = await res.json();
            notification.error(err.error || 'Failed to delete chapter');
          }
        } catch (error) {
          console.error('Delete error:', error);
           notification.error('Could not delete chapter.');
        }
      }
    });
  };

  const bulkUploadChapters = async (file: File, targetRegionId: string) => {
    setIsSubmitting(true);
    return new Promise<boolean>((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results: Papa.ParseResult<Record<string, unknown>>) => {
          try {
            const res = await fetch('/api/chapters/bulk', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                chapters: results.data,
                targetRegionId: targetRegionId 
              })
            });
            
            if (res.ok) {
              const data = await res.json();
              notification.success(data.message);
              fetchChapters();
              resolve(true);
            } else {
              const error = await res.json();
              notification.error(error.error || 'Failed to process chapter import');
              resolve(false);
            }
          } catch (error) {
            console.error('Bulk upload failed:', error);
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
    chapters,
    cutoffDate,
    loading,
    isSubmitting,
    fetchChapters,
    createChapter,
    updateChapter,
    deleteChapter,
    bulkUploadChapters
  };
}
