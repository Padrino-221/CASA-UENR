import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/context/NotificationContext';

import Papa from 'papaparse';

export function useCollections() {
  const router = useRouter();
  const notification = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createCollection = async (payload: Record<string, unknown>) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        notification.success('Financial entry recorded in ledger.');
        router.refresh();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to record collection:', error);
      notification.error('Failed to record transaction.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateCollection = async (id: string, payload: Record<string, unknown>) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/collections/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        notification.success('Transaction record corrected.');
        router.refresh();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update collection:', error);
      notification.error('Failed to update transaction.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteCollection = (id: string) => {
    notification.confirm({
      title: 'Void Transaction?',
      message: 'Are you sure you want to void this transaction? This action is permanent and will instantly update all reports.',
      confirmText: 'Void Record',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/collections/${id}`, { method: 'DELETE' });
          if (res.ok) {
            notification.success('Transaction voided successfully.');
            router.refresh();
          } else {
            notification.error('Failed to void transaction.');
          }
        } catch (error) {
          console.error('Delete error:', error);
          notification.error('A system financial synchronization error occurred.');
        }
      }
    });
  };

  const bulkUploadCollections = async (file: File) => {
    setIsSubmitting(true);
    return new Promise<boolean>((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results: Papa.ParseResult<Record<string, unknown>>) => {
          try {
            const res = await fetch('/api/collections/bulk', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ collections: results.data })
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
    isSubmitting,
    createCollection,
    updateCollection,
    deleteCollection,
    bulkUploadCollections
  };
}
