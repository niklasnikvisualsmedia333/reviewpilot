import type { AppData, CustomerStatus } from '../types';
import { isDueOrOverdue, isOverdue, todayISO } from './dates';
import { statusOrder } from './status';

export const calculateMetrics = (data: AppData, today = todayISO()) => {
  const totalCustomers = data.customers.length;
  const feedbackReceived = data.feedback.length;
  const testimonialsApproved = data.feedback.filter((item) => item.permissionStatus === 'granted').length;
  const requestsPrepared = data.reviewRequests.filter((request) => request.status === 'prepared' || request.status === 'sent').length;
  const requestsSent = data.reviewRequests.filter((request) => request.status === 'sent' || request.manuallyMarkedAsSentAt).length;
  const followUpsDue = data.customers.filter((customer) => isDueOrOverdue(customer.followUpDate, today) && customer.status !== 'archived').length;
  const overdueFollowUps = data.customers.filter((customer) => isOverdue(customer.followUpDate, today) && customer.status !== 'archived').length;

  return {
    totalCustomers,
    projectsCompleted: data.customers.filter((customer) => customer.status !== 'new_customer' && customer.status !== 'archived').length,
    requestsPrepared,
    requestsSent,
    followUpsDue,
    overdueFollowUps,
    feedbackReceived,
    testimonialsApproved,
    googleReviewsReceived: data.customers.filter((customer) => customer.googleReviewStatus === 'received').length,
    requestToFeedbackRate: requestsSent ? Math.round((feedbackReceived / requestsSent) * 100) : 0,
    testimonialApprovalRate: feedbackReceived ? Math.round((testimonialsApproved / feedbackReceived) * 100) : 0,
    averageRating: feedbackReceived
      ? Number((data.feedback.reduce((sum, item) => sum + item.satisfactionRating, 0) / feedbackReceived).toFixed(1))
      : 0,
  };
};

export const funnelData = (data: AppData) =>
  statusOrder.map((status) => ({
    status,
    label: status.replace(/_/g, ' '),
    count: data.customers.filter((customer) => customer.status === status).length,
  }));

export const customersByStatus = (data: AppData) =>
  data.customers.reduce<Record<CustomerStatus, number>>((result, customer) => {
    result[customer.status] = (result[customer.status] ?? 0) + 1;
    return result;
  }, {} as Record<CustomerStatus, number>);

export const countByServiceType = (data: AppData) =>
  data.feedback.reduce<Record<string, number>>((result, feedback) => {
    const customer = data.customers.find((item) => item.id === feedback.customerId);
    const key = customer?.serviceType || 'Other';
    result[key] = (result[key] ?? 0) + 1;
    return result;
  }, {});
