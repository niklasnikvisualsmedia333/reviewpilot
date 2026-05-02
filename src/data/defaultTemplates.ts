import type { Template } from '../types';
import { nowISO } from '../lib/dates';

const stamp = nowISO();

export const defaultTemplates: Template[] = [
  {
    id: 'tpl-de-whatsapp-friendly',
    name: 'DE WhatsApp friendly',
    language: 'de',
    tone: 'friendly',
    channel: 'whatsapp',
    context: 'project_completed',
    templateText:
      'Hallo {{customer_name}}, vielen Dank nochmal für die Zusammenarbeit bei {{project_name}}. Wenn du mit {{service_type}} zufrieden warst, würde ich mich sehr über eine ehrliche Google-Bewertung freuen: {{google_review_link}}\n\nNatürlich nur, wenn es für dich passt. Falls du lieber direkt Feedback geben möchtest, freue ich mich genauso über eine kurze private Rückmeldung. Danke dir!\n{{owner_name}}',
    isDefault: true,
    createdAt: stamp,
    updatedAt: stamp,
  },
  {
    id: 'tpl-de-email-professional',
    name: 'DE Email professional',
    language: 'de',
    tone: 'professional',
    channel: 'email',
    context: 'project_completed',
    templateText:
      'Hallo {{customer_name}},\n\nvielen Dank für die angenehme Zusammenarbeit bei {{project_name}}. Ehrliches Kundenfeedback hilft {{business_name}}, die eigene Arbeit weiter zu verbessern und neuen Kundinnen und Kunden Orientierung zu geben.\n\nWenn Sie Ihre Erfahrung teilen möchten, können Sie hier eine Google-Bewertung hinterlassen: {{google_review_link}}\n\nEs geht ausdrücklich um ehrliches Feedback, ohne Druck und ohne Erwartung einer bestimmten Bewertung. Alternativ können Sie mir auch direkt eine kurze private Rückmeldung senden.\n\nViele Grüße\n{{owner_name}}',
    isDefault: true,
    createdAt: stamp,
    updatedAt: stamp,
  },
  {
    id: 'tpl-de-linkedin-professional',
    name: 'DE LinkedIn professional',
    language: 'de',
    tone: 'professional',
    channel: 'linkedin',
    context: 'project_completed',
    templateText:
      'Hallo {{customer_name}}, danke nochmal für die Zusammenarbeit bei {{project_name}}. Wenn du deine Erfahrung mit {{business_name}} ehrlich teilen möchtest, hilft mir eine kurze Bewertung sehr: {{google_review_link}}\n\nFalls LinkedIn für dich passender ist, freue ich mich auch über ein kurzes Feedback hier im Chat.',
    isDefault: true,
    createdAt: stamp,
    updatedAt: stamp,
  },
  {
    id: 'tpl-de-sms-short',
    name: 'DE SMS short',
    language: 'de',
    tone: 'short',
    channel: 'sms',
    context: 'project_completed',
    templateText:
      'Hallo {{customer_name}}, danke für die Zusammenarbeit bei {{project_name}}. Wenn du magst, teile gern ehrliches Feedback als Google-Bewertung: {{google_review_link}} Danke, {{owner_name}}',
    isDefault: true,
    createdAt: stamp,
    updatedAt: stamp,
  },
  {
    id: 'tpl-en-whatsapp-friendly',
    name: 'EN WhatsApp friendly',
    language: 'en',
    tone: 'friendly',
    channel: 'whatsapp',
    context: 'project_completed',
    templateText:
      'Hi {{customer_name}}, thanks again for working with me on {{project_name}}. If you feel comfortable sharing your honest experience, a Google review would really help: {{google_review_link}}\n\nNo pressure at all, and honest feedback is what matters. You can also send me private feedback here if that is easier. Thanks, {{owner_name}}',
    isDefault: true,
    createdAt: stamp,
    updatedAt: stamp,
  },
  {
    id: 'tpl-en-email-professional',
    name: 'EN Email professional',
    language: 'en',
    tone: 'professional',
    channel: 'email',
    context: 'project_completed',
    templateText:
      'Hi {{customer_name}},\n\nThank you again for trusting {{business_name}} with {{project_name}}. Honest customer feedback helps us improve and helps future clients understand what working with us is like.\n\nIf you would like to share your experience, you can leave a Google review here: {{google_review_link}}\n\nThere is no pressure and no expectation of a specific rating. Private feedback is also very welcome.\n\nBest regards,\n{{owner_name}}',
    isDefault: true,
    createdAt: stamp,
    updatedAt: stamp,
  },
  {
    id: 'tpl-de-follow-up',
    name: 'DE Follow-up message',
    language: 'de',
    tone: 'friendly',
    channel: 'whatsapp',
    context: 'follow_up',
    templateText:
      'Hallo {{customer_name}}, kurze freundliche Erinnerung zu meiner Nachricht nach {{project_name}}. Wenn du deine ehrliche Erfahrung teilen möchtest, ist hier der Bewertungslink: {{google_review_link}}\n\nFalls es gerade nicht passt, ist das völlig in Ordnung. Danke dir!',
    isDefault: true,
    createdAt: stamp,
    updatedAt: stamp,
  },
  {
    id: 'tpl-en-follow-up',
    name: 'EN Follow-up message',
    language: 'en',
    tone: 'friendly',
    channel: 'whatsapp',
    context: 'follow_up',
    templateText:
      'Hi {{customer_name}}, just a friendly follow-up on my note after {{project_name}}. If you would like to share your honest experience, here is the review link: {{google_review_link}}\n\nNo worries at all if now is not a good time. Thank you!',
    isDefault: true,
    createdAt: stamp,
    updatedAt: stamp,
  },
  {
    id: 'tpl-de-testimonial-permission',
    name: 'DE Testimonial permission request',
    language: 'de',
    tone: 'professional',
    channel: 'email',
    context: 'testimonial_permission',
    templateText:
      'Hallo {{customer_name}},\n\ndeine Rückmeldung zu {{project_name}} war sehr hilfreich. Darf {{business_name}} einen kurzen Auszug daraus als Testimonial verwenden? Bitte sag mir auch, ob dein Name und Firmenname genannt werden dürfen.\n\nWenn du das nicht möchtest, ist das selbstverständlich völlig in Ordnung.\n\nViele Grüße\n{{owner_name}}',
    isDefault: true,
    createdAt: stamp,
    updatedAt: stamp,
  },
  {
    id: 'tpl-en-testimonial-permission',
    name: 'EN Testimonial permission request',
    language: 'en',
    tone: 'professional',
    channel: 'email',
    context: 'testimonial_permission',
    templateText:
      'Hi {{customer_name}},\n\nYour feedback on {{project_name}} was very helpful. Would you be comfortable with {{business_name}} using a short excerpt as a testimonial? Please also let me know whether your name and company may be shown.\n\nNo problem at all if you prefer not to.\n\nBest regards,\n{{owner_name}}',
    isDefault: true,
    createdAt: stamp,
    updatedAt: stamp,
  },
];
