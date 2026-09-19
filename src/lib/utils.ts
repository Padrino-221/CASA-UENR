import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRoleLabel(role?: string) {
  if (!role) return 'Admin';
  switch (role) {
    case 'NATIONAL_ADMIN':
      return 'National Admin';
    case 'REGIONAL_ADMIN':
      return 'Regional Admin';
    case 'LOCAL_ADMIN':
      return 'Local Admin';
    case 'CONTENT_MANAGER':
      return 'Content Manager';
    default:
      return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
