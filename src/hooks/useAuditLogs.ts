import { useState, useEffect } from 'react';
import { useNotification } from '@/context/NotificationContext';
import { AuditLog } from '@/types/models';

export function useAuditLogs(take: number = 15) {
  const notification = useNotification();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/audit-logs?skip=${skip}&take=${take}`);
      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs);
        setTotal(data.total);
      } else {
        notification.error('Failed to retrieve security logs.');
      }
    } catch {
      notification.error('System synchronization error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip]);

  return {
    logs,
    total,
    loading,
    skip,
    setSkip,
    fetchLogs
  };
}
