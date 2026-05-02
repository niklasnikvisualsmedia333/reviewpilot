export type Language = 'de' | 'en';
export type Tone = 'friendly' | 'professional' | 'warm' | 'short';
export type Channel = 'whatsapp' | 'email' | 'sms' | 'linkedin';
export type CustomerStatus =
  | 'new_customer'
  | 'project_completed'
  | 'request_prepared'
  | 'review_requested'
  | 'follow_up_needed'
  | 'feedback_received'
  | 'testimonial_approved'
  | 'archived';

export type PermissionStatus = 'not_requested' | 'requested' | 'granted' | 'declined';
export type GoogleReviewStatus = 'not_requested' | 'requested' | 'received';
export type RequestStatus = 'draft' | 'prepared' | 'sent';
export type BusinessType = 'freelancer' | 'local_service' | 'agency' | 'photography' | 'health_practice' | 'consulting' | 'handcraft' | 'other';
export type CustomerType = 'private_client' | 'business_client' | 'partner' | 'repeat_client' | 'other';
export type TemplateContext =
  | 'project_completed'
  | 'workshop_completed'
  | 'service_delivered'
  | 'product_delivered'
  | 'follow_up'
  | 'testimonial_permission';

export interface BusinessProfile {
  id: string;
  businessName: string;
  ownerName: string;
  googleReviewLink: string;
  defaultLanguage: Language;
  defaultTone: Tone;
  primaryChannel: Channel;
  websiteUrl: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  projectName: string;
  serviceType: string;
  customerType: CustomerType;
  acquisitionSource: string;
  projectValue: number;
  projectDate: string;
  status: CustomerStatus;
  internalNotes: string;
  preferredChannel: Channel;
  language: Language;
  testimonialPermissionStatus: PermissionStatus;
  googleReviewStatus: GoogleReviewStatus;
  followUpDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewRequest {
  id: string;
  customerId: string;
  channel: Channel;
  language: Language;
  tone: Tone;
  messageText: string;
  status: RequestStatus;
  preparedAt: string;
  copiedAt: string;
  manuallyMarkedAsSentAt: string;
  followUpDate: string;
}

export interface Feedback {
  id: string;
  customerId: string;
  satisfactionRating: 1 | 2 | 3 | 4 | 5;
  feedbackText: string;
  testimonialText: string;
  permissionStatus: PermissionStatus;
  canUseName: boolean;
  canUseCompany: boolean;
  source: string;
  notes: string;
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  language: Language;
  tone: Tone;
  channel: Channel;
  context: TemplateContext;
  templateText: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  onboardingCompleted: boolean;
  businessProfile: BusinessProfile;
  customers: Customer[];
  reviewRequests: ReviewRequest[];
  feedback: Feedback[];
  templates: Template[];
}

export interface LocalAccount {
  id: string;
  name: string;
  email: string;
  businessType: BusinessType;
  createdAt: string;
  lastActiveAt: string;
}
