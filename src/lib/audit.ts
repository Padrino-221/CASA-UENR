import { db } from './prisma';

export async function createAuditLog({
  userId,
  action,
  entity,
  entityId,
  metadata
}: {
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'EXPORT';
  entity: string;
  entityId?: string;
  metadata?: unknown;
}) {
  try {
    return await db.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      }
    });
  } catch (err) {
    console.error('Audit Logging failed:', err);
    // Silent fail to prevent blocking original operation, but in production we'd use a robust logger
  }
}
