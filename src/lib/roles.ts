export type AppRole =
  | 'NATIONAL_ADMIN'
  | 'REGIONAL_ADMIN'
  | 'LOCAL_ADMIN'
  | 'CONTENT_MANAGER'
  | 'FINANCE'
  | 'SECRETARY';

/** Sub-accounts created by a LOCAL_ADMIN, scoped to their chapter. */
export const SUB_ACCOUNT_ROLES = ['FINANCE', 'SECRETARY'] as const;
export type SubAccountRole = (typeof SUB_ACCOUNT_ROLES)[number];

export function isSubAccount(role?: string | null): role is SubAccountRole {
  return role === 'FINANCE' || role === 'SECRETARY';
}

/** Roles whose data is scoped to a single chapter. */
export function isLocalScope(role?: string | null): boolean {
  return role === 'LOCAL_ADMIN' || role === 'FINANCE' || role === 'SECRETARY';
}

export function canManageFinance(role?: string | null): boolean {
  return (
    role === 'NATIONAL_ADMIN' ||
    role === 'REGIONAL_ADMIN' ||
    role === 'LOCAL_ADMIN' ||
    role === 'FINANCE'
  );
}

export function canManageMembers(role?: string | null): boolean {
  return role === 'LOCAL_ADMIN' || role === 'SECRETARY';
}

export function canManageAttendance(role?: string | null): boolean {
  return role === 'LOCAL_ADMIN' || role === 'SECRETARY';
}

export function canManageEvents(role?: string | null): boolean {
  return role === 'LOCAL_ADMIN' || role === 'SECRETARY';
}

export function canManageCalendar(role?: string | null): boolean {
  return role === 'LOCAL_ADMIN' || role === 'SECRETARY';
}

export function canViewAuditLogs(role?: string | null): boolean {
  return role === 'NATIONAL_ADMIN' || role === 'REGIONAL_ADMIN' || role === 'LOCAL_ADMIN';
}
