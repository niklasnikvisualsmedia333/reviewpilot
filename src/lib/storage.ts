import type { AppData } from '../types';
import { createDemoData } from '../data/demoData';

const STORAGE_KEY = 'reviewpilot:v0.1:data';

export const isAppData = (value: unknown): value is AppData => {
  const data = value as AppData;
  return Boolean(
    data &&
      typeof data === 'object' &&
      data.businessProfile &&
      Array.isArray(data.customers) &&
      Array.isArray(data.reviewRequests) &&
      Array.isArray(data.feedback) &&
      Array.isArray(data.templates),
  );
};

export const loadData = (): AppData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const demo = createDemoData();
      saveData(demo);
      return demo;
    }
    const parsed = JSON.parse(raw);
    if (isAppData(parsed)) return parsed;
  } catch {
    // Corrupted storage should not break the app.
  }
  const demo = createDemoData();
  saveData(demo);
  return demo;
};

export const saveData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const resetDemoData = () => {
  const demo = createDemoData();
  saveData(demo);
  return demo;
};

export const importData = (json: string): AppData => {
  const parsed = JSON.parse(json);
  if (!isAppData(parsed)) {
    throw new Error('The file does not look like a ReviewPilot backup.');
  }
  saveData(parsed);
  return parsed;
};
