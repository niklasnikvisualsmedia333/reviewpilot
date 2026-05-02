export const todayISO = () => new Date().toISOString().slice(0, 10);

export const addDaysISO = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export const isDueOrOverdue = (date: string, now = todayISO()) => Boolean(date) && date <= now;

export const isOverdue = (date: string, now = todayISO()) => Boolean(date) && date < now;

export const formatDate = (date: string) => {
  if (!date) return 'Not set';
  return new Intl.DateTimeFormat('en-DE', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(date));
};

export const nowISO = () => new Date().toISOString();
