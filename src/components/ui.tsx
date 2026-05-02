import type { ReactNode } from 'react';
import { badgeClass } from '../lib/status';
import type { CustomerStatus, PermissionStatus } from '../types';

export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <section className={`panel p-5 ${className}`}>{children}</section>
);

export const StatCard = ({ label, value, hint }: { label: string; value: string | number; hint?: string }) => (
  <Card>
    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
    <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    {hint ? <p className="mt-1 text-sm text-slate-400">{hint}</p> : null}
  </Card>
);

export const Badge = ({ value, label }: { value: CustomerStatus | PermissionStatus; label: string }) => (
  <span className={`badge ${badgeClass(value)}`}>{label}</span>
);

export const EmptyState = ({ title, body, action }: { title: string; body: string; action?: ReactNode }) => (
  <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
    <h3 className="text-lg font-semibold text-white">{title}</h3>
    <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">{body}</p>
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
);

export const FieldLabel = ({ children }: { children: ReactNode }) => (
  <label className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{children}</label>
);
