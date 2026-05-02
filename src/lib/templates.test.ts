import { describe, expect, it } from 'vitest';
import { renderTemplate } from './templates';
import { createDemoData } from '../data/demoData';

describe('renderTemplate', () => {
  it('replaces supported variables with customer and business values', () => {
    const data = createDemoData();
    const customer = data.customers[0];

    expect(renderTemplate('Hi {{customer_name}} from {{business_name}} about {{project_name}}', customer, data)).toContain(
      `Hi ${customer.name} from ${data.businessProfile.businessName} about ${customer.projectName}`,
    );
  });

  it('uses safe fallbacks for missing values', () => {
    const data = createDemoData();

    expect(renderTemplate('{{customer_name}} {{google_review_link}}', undefined, data)).toContain('there');
  });
});
