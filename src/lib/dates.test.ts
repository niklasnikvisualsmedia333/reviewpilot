import { describe, expect, it } from 'vitest';
import { isDueOrOverdue, isOverdue } from './dates';

describe('follow-up due logic', () => {
  it('treats past and current dates as due', () => {
    expect(isDueOrOverdue('2026-05-01', '2026-05-02')).toBe(true);
    expect(isDueOrOverdue('2026-05-02', '2026-05-02')).toBe(true);
    expect(isDueOrOverdue('2026-05-03', '2026-05-02')).toBe(false);
  });

  it('distinguishes overdue from due today', () => {
    expect(isOverdue('2026-05-01', '2026-05-02')).toBe(true);
    expect(isOverdue('2026-05-02', '2026-05-02')).toBe(false);
  });
});
