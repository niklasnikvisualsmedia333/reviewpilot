import type { AppData, Channel, Customer, Language, Template, TemplateContext, Tone } from '../types';

export const templateVariables = [
  'customer_name',
  'business_name',
  'project_name',
  'service_type',
  'google_review_link',
  'owner_name',
] as const;

export const renderTemplate = (
  templateText: string,
  customer: Partial<Customer> | undefined,
  data: Pick<AppData, 'businessProfile'>,
) => {
  const values: Record<(typeof templateVariables)[number], string> = {
    customer_name: customer?.name || 'there',
    business_name: data.businessProfile.businessName || 'our business',
    project_name: customer?.projectName || 'the recent project',
    service_type: customer?.serviceType || 'the work',
    google_review_link: data.businessProfile.googleReviewLink || '[your Google review link]',
    owner_name: data.businessProfile.ownerName || 'the team',
  };

  return templateText.replace(/\{\{(customer_name|business_name|project_name|service_type|google_review_link|owner_name)\}\}/g, (_, key) => values[key as keyof typeof values]);
};

export const findBestTemplate = (
  templates: Template[],
  language: Language,
  tone: Tone,
  channel: Channel,
  context: TemplateContext,
) =>
  templates.find((template) => template.language === language && template.tone === tone && template.channel === channel && template.context === context) ??
  templates.find((template) => template.language === language && template.channel === channel && template.context === context) ??
  templates.find((template) => template.language === language && template.context === context) ??
  templates.find((template) => template.context === context);

export const createMessageVariants = (
  data: AppData,
  customer: Customer,
  channel: Channel,
  language: Language,
  tone: Tone,
  context: TemplateContext,
) => {
  const variants: Array<{ label: string; tone: Tone; context: TemplateContext }> = [
    { label: 'Selected version', tone, context },
    { label: 'Short version', tone: 'short', context },
    { label: 'Friendly version', tone: 'friendly', context },
    { label: 'Professional version', tone: 'professional', context },
    { label: 'Follow-up version', tone, context: 'follow_up' },
  ];

  return variants.map((variant) => {
    const template = findBestTemplate(data.templates, language, variant.tone, channel, variant.context);
    return {
      label: variant.label,
      text: renderTemplate(template?.templateText ?? '', customer, data),
    };
  });
};

export const createWaMeLink = (phone: string, text: string) => {
  const normalized = phone.replace(/[^\d+]/g, '').replace(/^00/, '+');
  if (!/^\+?\d{10,15}$/.test(normalized)) return '';
  return `https://wa.me/${normalized.replace('+', '')}?text=${encodeURIComponent(text)}`;
};

export const createMailtoLink = (email: string, subject: string, body: string) => {
  if (!email.includes('@')) return '';
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};
