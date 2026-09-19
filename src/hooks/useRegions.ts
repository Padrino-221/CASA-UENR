import { useState, useEffect } from 'react';
import { useNotification } from '@/context/NotificationContext';
import { Region } from '@/types/models';
import Papa from 'papaparse';

export function useRegions() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const notification = useNotification();

  const fetchRegions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/regions');
      const data = await res.json();
      setRegions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch regions:', error);
      notification.error('Failed to load regions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createRegion = async (payload: Record<string, unknown>) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/regions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        notification.success('Region and administrator provisioned successfully.');
        fetchRegions();
        return true;
      } else {
        const error = await res.json();
        notification.error(error.error || 'Failed to create region');
        return false;
      }
    } catch (error) {
      console.error('Failed to create region:', error);
      notification.error('Could not create region.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateRegion = async (id: string, payload: Record<string, unknown>) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/regions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        notification.success('Region updated.');
        fetchRegions();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update region:', error);
      notification.error('Failed to update region details.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteRegion = (id: string) => {
    notification.confirm({
      title: 'Delete Region?',
      message: 'Are you certain? This will remove the region. Ensure all dependent chapters are migrated first.',
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/regions/${id}`, { method: 'DELETE' });
          if (res.ok) {
            notification.success('Region decommissioned successfully.');
            fetchRegions();
          } else {
            const err = await res.json();
            notification.warning(err.error || 'Check for dependent records before deleting.');
          }
        } catch (error) {
          console.error('Delete error:', error);
           notification.error('Could not complete action.');
        }
      }
    });
  };

  const bulkUploadRegions = async (file: File) => {
    setIsSubmitting(true);
    return new Promise<boolean>((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results: Papa.ParseResult<Record<string, unknown>>) => {
          try {
            const res = await fetch('/api/regions/bulk', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ regions: results.data })
            });
            
            if (res.ok) {
              const data = await res.json();
              notification.success(data.message);
              fetchRegions();
              resolve(true);
            } else {
              const error = await res.json();
              notification.error(error.error || 'Failed to process regional import');
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
    regions,
    loading,
    isSubmitting,
    fetchRegions,
    createRegion,
    updateRegion,
    deleteRegion,
    bulkUploadRegions
  };
}
