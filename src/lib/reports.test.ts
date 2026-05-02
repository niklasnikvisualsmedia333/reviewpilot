import { describe, expect, it } from 'vitest';
import { createDemoData } from '../data/demoData';
import { calculateMetrics } from './reports';

describe('calculateMetrics', () => {
  it('calculates dashboard metrics from real records', () => {
    const data = createDemoData();
    const metrics = calculateMetrics(data);

    expect(metrics.totalCustomers).toBe(9);
    expect(metrics.feedbackReceived).toBe(3);
    expect(metrics.testimonialsApproved).toBe(2);
    expect(metrics.googleReviewsReceived).toBe(3);
    expect(metrics.requestToFeedbackRate).toBeGreaterThan(0);
  });
});
