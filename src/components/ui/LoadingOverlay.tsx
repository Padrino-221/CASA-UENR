'use client';
import Portal from './Portal';
import './admin-controls.css';
export default function LoadingOverlay() {
  return <Portal><div className="admin-loading-overlay" role="status" aria-live="polite"><div className="admin-loading-card"><span className="admin-loading-spinner" aria-hidden="true"/><p>Loading your workspace…</p></div></div></Portal>;
}
