import type { CustomerStatus, PermissionStatus } from '../types';

export const statusLabels: Record<CustomerStatus, string> = {
  new_customer: 'New customer',
  project_completed: 'Project completed',
  request_prepared: 'Request prepared',
  review_requested: 'Review requested',
  follow_up_needed: 'Follow-up needed',
  feedback_received: 'Feedback received',
  testimonial_approved: 'Testimonial approved',
  archived: 'Archived',
};

export const statusOrder: CustomerStatus[] = [
  'new_customer',
  'project_completed',
  'request_prepared',
  'review_requested',
  'follow_up_needed',
  'feedback_received',
  'testimonial_approved',
];

export const permissionLabels: Record<PermissionStatus, string> = {
  not_requested: 'Not requested',
  requested: 'Requested',
  granted: 'Granted',
  declined: 'Declined',
};

export const badgeClass = (status: CustomerStatus | PermissionStatus) => {
  const styles: Record<string, string> = {
    new_customer: 'border-sky-400/30 bg-sky-400/10 text-sky-200',
    project_completed: 'border-indigo-400/30 bg-indigo-400/10 text-indigo-200',
    request_prepared: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100',
    review_requested: 'border-teal-400/30 bg-teal-400/10 text-teal-100',
    follow_up_needed: 'border-amber-400/30 bg-amber-400/10 text-amber-100',
    feedback_received: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100',
    testimonial_approved: 'border-lime-400/30 bg-lime-400/10 text-lime-100',
    archived: 'border-slate-400/25 bg-slate-400/10 text-slate-300',
    not_requested: 'border-slate-400/25 bg-slate-400/10 text-slate-300',
    requested: 'border-amber-400/30 bg-amber-400/10 text-amber-100',
    granted: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100',
    declined: 'border-rose-400/30 bg-rose-400/10 text-rose-100',
  };
  return styles[status] ?? styles.archived;
};
