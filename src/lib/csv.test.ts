import { describe, expect, it } from 'vitest';
import { escapeCsvValue, toCsv } from './csv';

describe('CSV export', () => {
  it('escapes commas, quotes and newlines', () => {
    expect(escapeCsvValue('A "quoted", multiline\nvalue')).toBe('"A ""quoted"", multiline\nvalue"');
  });

  it('exports rows with headers', () => {
    const csv = toCsv([{ name: 'Lena', note: 'Great, fast' }], [
      { key: 'name', label: 'Name' },
      { key: 'note', label: 'Note' },
    ]);

    expect(csv).toBe('Name,Note\nLena,"Great, fast"');
  });
});
