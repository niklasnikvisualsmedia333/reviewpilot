import type { AppData, BusinessType, Customer, LocalAccount } from '../types';
import { createDemoData } from '../data/demoData';
import { nowISO } from './dates';

const LEGACY_STORAGE_KEY = 'reviewpilot:v0.1:data';
const ACTIVE_ACCOUNT_KEY = 'reviewpilot:v0.2:active-account';
const ACCOUNTS_KEY = 'reviewpilot:v0.2:accounts';

const dataKey = (accountId: string) => `reviewpilot:v0.2:data:${accountId}`;

const defaultCustomerFields = (customer: Customer): Customer => ({
  ...customer,
  customerType: customer.customerType ?? 'business_client',
  acquisitionSource: customer.acquisitionSource ?? 'Referral',
  projectValue: Number(customer.projectValue ?? 0),
});

export const normalizeData = (data: AppData): AppData => ({
  ...data,
  onboardingCompleted: Boolean(data.onboardingCompleted),
  customers: data.customers.map(defaultCustomerFields),
});

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

export const getAccounts = (): LocalAccount[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const getActiveAccountId = () => localStorage.getItem(ACTIVE_ACCOUNT_KEY) ?? '';

export const saveAccounts = (accounts: LocalAccount[]) => {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
};

export const setActiveAccountId = (accountId: string) => {
  localStorage.setItem(ACTIVE_ACCOUNT_KEY, accountId);
};

export const createAccount = (name: string, email: string, businessType: BusinessType): LocalAccount => {
  const account: LocalAccount = {
    id: `acct-${crypto.randomUUID()}`,
    name,
    email,
    businessType,
    createdAt: nowISO(),
    lastActiveAt: nowISO(),
  };
  const accounts = [...getAccounts(), account];
  saveAccounts(accounts);
  setActiveAccountId(account.id);
  saveData(createDemoData({ onboardingCompleted: false }), account.id);
  return account;
};

export const updateAccount = (account: LocalAccount) => {
  saveAccounts(getAccounts().map((item) => (item.id === account.id ? { ...account, lastActiveAt: nowISO() } : item)));
};

export const loadData = (accountId: string): AppData => {
  try {
    const raw = localStorage.getItem(dataKey(accountId)) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) {
      const demo = createDemoData();
      saveData(demo, accountId);
      return demo;
    }
    const parsed = JSON.parse(raw);
    if (isAppData(parsed)) {
      const normalized = normalizeData(parsed);
      saveData(normalized, accountId);
      return normalized;
    }
  } catch {
    // Corrupted storage should not break the app.
  }
  const demo = createDemoData();
  saveData(demo, accountId);
  return demo;
};

export const saveData = (data: AppData, accountId = getActiveAccountId()) => {
  if (!accountId) return;
  localStorage.setItem(dataKey(accountId), JSON.stringify(normalizeData(data)));
};

export const resetDemoData = (accountId = getActiveAccountId()) => {
  const demo = createDemoData();
  saveData(demo, accountId);
  return demo;
};

export const importData = (json: string, accountId = getActiveAccountId()): AppData => {
  const parsed = JSON.parse(json);
  if (!isAppData(parsed)) {
    throw new Error('The file does not look like a ReviewPilot backup.');
  }
  const normalized = normalizeData(parsed);
  saveData(normalized, accountId);
  return normalized;
};
