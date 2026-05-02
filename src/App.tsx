import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  Archive,
  CalendarClock,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileDown,
  FileUp,
  Plus,
  RefreshCw,
  Save,
  Search,
  Send,
  Trash2,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Layout, type PageKey } from './components/Layout';
import { Badge, Card, EmptyState, FieldLabel, StatCard } from './components/ui';
import { defaultTemplates } from './data/defaultTemplates';
import { addDaysISO, formatDate, isDueOrOverdue, isOverdue, nowISO, todayISO } from './lib/dates';
import { downloadText, toCsv } from './lib/csv';
import { calculateMetrics, countByServiceType, funnelData } from './lib/reports';
import { importData, loadData, resetDemoData, saveData } from './lib/storage';
import { createMailtoLink, createMessageVariants, createWaMeLink, renderTemplate } from './lib/templates';
import { permissionLabels, statusLabels, statusOrder } from './lib/status';
import type { AppData, Channel, Customer, CustomerStatus, Feedback, Language, PermissionStatus, Template, TemplateContext, Tone } from './types';

const blankCustomer = (): Customer => ({
  id: `cust-${crypto.randomUUID()}`,
  name: '',
  company: '',
  email: '',
  phone: '',
  projectName: '',
  serviceType: '',
  projectDate: todayISO(),
  status: 'project_completed',
  internalNotes: '',
  preferredChannel: 'whatsapp',
  language: 'de',
  testimonialPermissionStatus: 'not_requested',
  googleReviewStatus: 'not_requested',
  followUpDate: '',
  createdAt: nowISO(),
  updatedAt: nowISO(),
});

const customerColumns = [
  { key: 'name', label: 'Name' },
  { key: 'company', label: 'Company' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'projectName', label: 'Project' },
  { key: 'serviceType', label: 'Service type' },
  { key: 'status', label: 'Status' },
  { key: 'followUpDate', label: 'Follow-up date' },
] satisfies Array<{ key: keyof Customer; label: string }>;

const feedbackColumns = [
  { key: 'customerName', label: 'Customer' },
  { key: 'company', label: 'Company' },
  { key: 'serviceType', label: 'Service type' },
  { key: 'satisfactionRating', label: 'Rating' },
  { key: 'testimonialText', label: 'Testimonial' },
  { key: 'permissionStatus', label: 'Permission' },
  { key: 'source', label: 'Source' },
] as const;

function App() {
  const [data, setData] = useState<AppData>(() => loadData());
  const [active, setActive] = useState<PageKey>('dashboard');

  useEffect(() => saveData(data), [data]);

  const updateData = (updater: (current: AppData) => AppData) => setData((current) => updater(current));

  const exportCustomers = () => downloadText('reviewpilot-customers.csv', toCsv(data.customers, customerColumns), 'text/csv;charset=utf-8');
  const testimonialRows = data.feedback.map((feedback) => {
    const customer = data.customers.find((item) => item.id === feedback.customerId);
    return {
      customerName: customer?.name ?? '',
      company: customer?.company ?? '',
      serviceType: customer?.serviceType ?? '',
      satisfactionRating: feedback.satisfactionRating,
      testimonialText: feedback.testimonialText,
      permissionStatus: feedback.permissionStatus,
      source: feedback.source,
    };
  });
  const exportTestimonials = () => downloadText('reviewpilot-testimonials.csv', toCsv(testimonialRows, feedbackColumns), 'text/csv;charset=utf-8');
  const exportJson = () => downloadText('reviewpilot-backup.json', JSON.stringify(data, null, 2), 'application/json;charset=utf-8');

  const page = {
    dashboard: <Dashboard data={data} setActive={setActive} updateData={updateData} />,
    business: <BusinessSetup data={data} updateData={updateData} />,
    customers: <Customers data={data} updateData={updateData} setActive={setActive} />,
    generator: <Generator data={data} updateData={updateData} />,
    followups: <FollowUps data={data} updateData={updateData} />,
    feedback: <FeedbackTestimonials data={data} updateData={updateData} exportTestimonials={exportTestimonials} />,
    templates: <Templates data={data} updateData={updateData} />,
    reports: (
      <Reports
        data={data}
        updateData={updateData}
        exportCustomers={exportCustomers}
        exportTestimonials={exportTestimonials}
        exportJson={exportJson}
      />
    ),
    settings: (
      <Settings
        data={data}
        updateData={updateData}
        setData={setData}
        exportCustomers={exportCustomers}
        exportTestimonials={exportTestimonials}
        exportJson={exportJson}
      />
    ),
    about: <About />,
  }[active];

  return (
    <Layout active={active} setActive={setActive}>
      {page}
    </Layout>
  );
}

const PageHeader = ({ title, eyebrow, children }: { title: string; eyebrow?: string; children?: React.ReactNode }) => (
  <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div>
      {eyebrow ? <p className="text-sm font-medium text-teal-200">{eyebrow}</p> : null}
      <h1 className="mt-1 text-3xl font-semibold text-white">{title}</h1>
    </div>
    {children}
  </div>
);

const Dashboard = ({ data, setActive, updateData }: { data: AppData; setActive: (page: PageKey) => void; updateData: (fn: (data: AppData) => AppData) => void }) => {
  const metrics = calculateMetrics(data);
  const due = data.customers.filter((customer) => isDueOrOverdue(customer.followUpDate) && customer.status !== 'archived');
  const approved = data.feedback.filter((feedback) => feedback.permissionStatus === 'granted').slice(-3).reverse();
  const nextAction = data.customers.find((customer) => customer.status === 'project_completed') ?? due[0] ?? data.customers.find((customer) => customer.status === 'request_prepared');

  return (
    <>
      <PageHeader title="Review workflow dashboard" eyebrow="Honest feedback, followed through">
        <button className="btn btn-primary" onClick={() => updateData((current) => ({ ...current, customers: [blankCustomer(), ...current.customers] }))}>
          <Plus size={16} /> Quick add customer
        </button>
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total customers" value={metrics.totalCustomers} />
        <StatCard label="Completed projects" value={metrics.projectsCompleted} />
        <StatCard label="Requests prepared" value={metrics.requestsPrepared} />
        <StatCard label="Sent manually" value={metrics.requestsSent} />
        <StatCard label="Follow-ups due" value={metrics.followUpsDue} hint={`${metrics.overdueFollowUps} overdue`} />
        <StatCard label="Feedback received" value={metrics.feedbackReceived} />
        <StatCard label="Approved testimonials" value={metrics.testimonialsApproved} />
        <StatCard label="Google reviews received" value={metrics.googleReviewsReceived} />
        <StatCard label="Request to feedback" value={`${metrics.requestToFeedbackRate}%`} />
        <StatCard label="Approval rate" value={`${metrics.testimonialApprovalRate}%`} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Status funnel</h2>
            <span className="text-sm text-slate-500">Current customer stage</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData(data)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2a44" />
                <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {funnelData(data).map((_, index) => (
                    <Cell key={index} fill={['#38bdf8', '#818cf8', '#22d3ee', '#2dd4bf', '#f59e0b', '#34d399', '#a3e635'][index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-white">Next best action</h2>
          {nextAction ? (
            <div className="mt-4 rounded-lg border border-teal-300/20 bg-teal-300/10 p-4">
              <p className="font-medium text-white">{nextAction.name}</p>
              <p className="mt-1 text-sm text-slate-300">{nextAction.projectName}</p>
              <button className="btn btn-primary mt-4" onClick={() => setActive(nextAction.status === 'project_completed' ? 'generator' : 'followups')}>
                Continue workflow
              </button>
            </div>
          ) : (
            <EmptyState title="No next action" body="Add a completed customer or prepare a review request to start the workflow." />
          )}
        </Card>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-white">Today’s follow-ups</h2>
          <div className="mt-4 space-y-3">
            {due.length ? due.map((customer) => <CustomerMini key={customer.id} customer={customer} />) : <EmptyState title="No follow-ups due" body="Nothing needs chasing today. Nice, quiet dashboard energy." />}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-white">Recently approved testimonials</h2>
          <div className="mt-4 space-y-3">
            {approved.length ? (
              approved.map((feedback) => {
                const customer = data.customers.find((item) => item.id === feedback.customerId);
                return <QuoteCard key={feedback.id} feedback={feedback} customer={customer} compact />;
              })
            ) : (
              <EmptyState title="No approved testimonials yet" body="Approved quotes will appear here once permission is granted." />
            )}
          </div>
        </Card>
      </div>
    </>
  );
};

const CustomerMini = ({ customer }: { customer: Customer }) => (
  <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="font-medium text-white">{customer.name}</p>
        <p className="text-sm text-slate-400">{customer.projectName}</p>
      </div>
      <span className="text-sm text-amber-200">{formatDate(customer.followUpDate)}</span>
    </div>
  </div>
);

const BusinessSetup = ({ data, updateData }: { data: AppData; updateData: (fn: (data: AppData) => AppData) => void }) => {
  const [qr, setQr] = useState('');
  useEffect(() => {
    if (data.businessProfile.googleReviewLink) {
      QRCode.toDataURL(data.businessProfile.googleReviewLink, { margin: 2, width: 280 }).then(setQr);
    } else {
      setQr('');
    }
  }, [data.businessProfile.googleReviewLink]);

  const updateProfile = (field: keyof AppData['businessProfile'], value: string) =>
    updateData((current) => ({
      ...current,
      businessProfile: { ...current.businessProfile, [field]: value, updatedAt: nowISO() },
    }));

  return (
    <>
      <PageHeader title="Business setup" eyebrow="Review link, defaults and ethical guardrails" />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput label="Business name" value={data.businessProfile.businessName} onChange={(value) => updateProfile('businessName', value)} />
            <TextInput label="Owner name" value={data.businessProfile.ownerName} onChange={(value) => updateProfile('ownerName', value)} />
            <TextInput label="Google review link" value={data.businessProfile.googleReviewLink} onChange={(value) => updateProfile('googleReviewLink', value)} />
            <TextInput label="Website URL" value={data.businessProfile.websiteUrl} onChange={(value) => updateProfile('websiteUrl', value)} />
            <SelectInput label="Default language" value={data.businessProfile.defaultLanguage} onChange={(value) => updateProfile('defaultLanguage', value)} options={['de', 'en']} />
            <SelectInput label="Default tone" value={data.businessProfile.defaultTone} onChange={(value) => updateProfile('defaultTone', value)} options={['friendly', 'professional', 'warm', 'short']} />
            <SelectInput label="Primary channel" value={data.businessProfile.primaryChannel} onChange={(value) => updateProfile('primaryChannel', value)} options={['whatsapp', 'email', 'sms', 'linkedin']} />
            <div className="md:col-span-2">
              <TextArea label="Notes" value={data.businessProfile.notes} onChange={(value) => updateProfile('notes', value)} />
            </div>
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-white">Google review link</h2>
          <p className="mt-2 text-sm text-slate-400">Use this QR code on invoices, aftercare PDFs, or at the counter. It is generated locally in your browser.</p>
          {qr ? <img src={qr} alt="Google review QR code" className="mx-auto mt-5 rounded-lg bg-white p-3" /> : <EmptyState title="No link yet" body="Add your Google review URL to generate a QR code." />}
          <div className="mt-5 flex flex-wrap gap-2">
            <button className="btn" onClick={() => navigator.clipboard.writeText(data.businessProfile.googleReviewLink)} disabled={!data.businessProfile.googleReviewLink}>
              <Copy size={16} /> Copy link
            </button>
            <a className="btn" href={qr} download="reviewpilot-google-review-qr.png">
              <Download size={16} /> Download PNG
            </a>
          </div>
          <div className="mt-5 rounded-lg border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-50">
            Ask every real customer for honest feedback. Do not offer incentives. Do not manipulate review outcomes.
          </div>
        </Card>
      </div>
    </>
  );
};

const Customers = ({ data, updateData, setActive }: { data: AppData; updateData: (fn: (data: AppData) => AppData) => void; setActive: (page: PageKey) => void }) => {
  const [editing, setEditing] = useState<Customer | null>(null);
  const [filters, setFilters] = useState({ search: '', status: 'all', serviceType: 'all', language: 'all', due: 'all' });
  const serviceTypes = Array.from(new Set(data.customers.map((customer) => customer.serviceType).filter(Boolean)));
  const filtered = data.customers.filter((customer) => {
    const haystack = `${customer.name} ${customer.company} ${customer.projectName}`.toLowerCase();
    return (
      haystack.includes(filters.search.toLowerCase()) &&
      (filters.status === 'all' || customer.status === filters.status) &&
      (filters.serviceType === 'all' || customer.serviceType === filters.serviceType) &&
      (filters.language === 'all' || customer.language === filters.language) &&
      (filters.due === 'all' || (filters.due === 'due' ? isDueOrOverdue(customer.followUpDate) : !isDueOrOverdue(customer.followUpDate)))
    );
  });

  const saveCustomer = (customer: Customer) => {
    updateData((current) => ({
      ...current,
      customers: current.customers.some((item) => item.id === customer.id)
        ? current.customers.map((item) => (item.id === customer.id ? { ...customer, updatedAt: nowISO() } : item))
        : [{ ...customer, createdAt: nowISO(), updatedAt: nowISO() }, ...current.customers],
    }));
    setEditing(null);
  };

  return (
    <>
      <PageHeader title="Customers" eyebrow="Completed projects, statuses and next actions">
        <button className="btn btn-primary" onClick={() => setEditing(blankCustomer())}>
          <Plus size={16} /> Add customer
        </button>
      </PageHeader>
      <Card>
        <div className="grid gap-3 md:grid-cols-5">
          <div className="md:col-span-2">
            <FieldLabel>Search</FieldLabel>
            <div className="relative mt-1">
              <Search size={16} className="absolute left-3 top-2.5 text-slate-500" />
              <input className="field pl-9" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Name, company or project" />
            </div>
          </div>
          <SelectInput label="Status" value={filters.status} onChange={(value) => setFilters({ ...filters, status: value })} options={['all', ...statusOrder, 'archived']} />
          <SelectInput label="Service type" value={filters.serviceType} onChange={(value) => setFilters({ ...filters, serviceType: value })} options={['all', ...serviceTypes]} />
          <SelectInput label="Follow-up" value={filters.due} onChange={(value) => setFilters({ ...filters, due: value })} options={['all', 'due', 'not due']} />
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.12em] text-slate-500">
              <tr>
                {['Customer', 'Project', 'Status', 'Follow-up', 'Channel', 'Permission', 'Actions'].map((heading) => (
                  <th key={heading} className="border-b border-white/10 px-3 py-3">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => (
                <tr key={customer.id} className="border-b border-white/5">
                  <td className="px-3 py-4">
                    <p className="font-medium text-white">{customer.name || 'Unnamed customer'}</p>
                    <p className="text-slate-500">{customer.company}</p>
                  </td>
                  <td className="px-3 py-4">
                    <p>{customer.projectName}</p>
                    <p className="text-slate-500">{customer.serviceType}</p>
                  </td>
                  <td className="px-3 py-4"><Badge value={customer.status} label={statusLabels[customer.status]} /></td>
                  <td className={`px-3 py-4 ${isOverdue(customer.followUpDate) ? 'text-amber-200' : 'text-slate-300'}`}>{formatDate(customer.followUpDate)}</td>
                  <td className="px-3 py-4 capitalize">{customer.preferredChannel}</td>
                  <td className="px-3 py-4"><Badge value={customer.testimonialPermissionStatus} label={permissionLabels[customer.testimonialPermissionStatus]} /></td>
                  <td className="px-3 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button className="btn btn-ghost" onClick={() => setEditing(customer)}>Edit</button>
                      <button className="btn btn-ghost" onClick={() => setActive('generator')}>Prepare</button>
                      <button className="btn btn-ghost" onClick={() => setActive('feedback')}>Feedback</button>
                      <button className="btn btn-ghost" onClick={() => updateData((current) => ({ ...current, customers: current.customers.map((item) => (item.id === customer.id ? { ...item, googleReviewStatus: 'received', updatedAt: nowISO() } : item)) }))}>Review received</button>
                      <button className="btn btn-ghost" onClick={() => updateData((current) => ({ ...current, customers: current.customers.map((item) => (item.id === customer.id ? { ...item, status: 'archived', updatedAt: nowISO() } : item)) }))}><Archive size={15} /></button>
                      <button className="btn btn-ghost text-rose-200" onClick={() => updateData((current) => ({ ...current, customers: current.customers.filter((item) => item.id !== customer.id) }))}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {editing ? <CustomerModal customer={editing} onClose={() => setEditing(null)} onSave={saveCustomer} /> : null}
    </>
  );
};

const CustomerModal = ({ customer, onClose, onSave }: { customer: Customer; onClose: () => void; onSave: (customer: Customer) => void }) => {
  const [draft, setDraft] = useState(customer);
  const set = (field: keyof Customer, value: string) => setDraft((current) => ({ ...current, [field]: value }));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="panel max-h-[90vh] w-full max-w-4xl overflow-y-auto p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Customer record</h2>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <TextInput label="Name" value={draft.name} onChange={(value) => set('name', value)} />
          <TextInput label="Company" value={draft.company} onChange={(value) => set('company', value)} />
          <TextInput label="Email" value={draft.email} onChange={(value) => set('email', value)} />
          <TextInput label="Phone" value={draft.phone} onChange={(value) => set('phone', value)} />
          <TextInput label="Project name" value={draft.projectName} onChange={(value) => set('projectName', value)} />
          <TextInput label="Service type" value={draft.serviceType} onChange={(value) => set('serviceType', value)} />
          <TextInput label="Project date" type="date" value={draft.projectDate} onChange={(value) => set('projectDate', value)} />
          <TextInput label="Follow-up date" type="date" value={draft.followUpDate} onChange={(value) => set('followUpDate', value)} />
          <SelectInput label="Status" value={draft.status} onChange={(value) => set('status', value)} options={[...statusOrder, 'archived']} />
          <SelectInput label="Preferred channel" value={draft.preferredChannel} onChange={(value) => set('preferredChannel', value)} options={['whatsapp', 'email', 'sms', 'linkedin']} />
          <SelectInput label="Language" value={draft.language} onChange={(value) => set('language', value)} options={['de', 'en']} />
          <SelectInput label="Testimonial permission" value={draft.testimonialPermissionStatus} onChange={(value) => set('testimonialPermissionStatus', value)} options={['not_requested', 'requested', 'granted', 'declined']} />
          <div className="md:col-span-2"><TextArea label="Internal notes" value={draft.internalNotes} onChange={(value) => set('internalNotes', value)} /></div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(draft)}><Save size={16} /> Save customer</button>
        </div>
      </div>
    </div>
  );
};

const Generator = ({ data, updateData }: { data: AppData; updateData: (fn: (data: AppData) => AppData) => void }) => {
  const [customerId, setCustomerId] = useState(data.customers.find((customer) => customer.status !== 'archived')?.id ?? '');
  const customer = data.customers.find((item) => item.id === customerId) ?? data.customers[0];
  const [channel, setChannel] = useState<Channel>(customer?.preferredChannel ?? data.businessProfile.primaryChannel);
  const [language, setLanguage] = useState<Language>(customer?.language ?? data.businessProfile.defaultLanguage);
  const [tone, setTone] = useState<Tone>(data.businessProfile.defaultTone);
  const [context, setContext] = useState<TemplateContext>('project_completed');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [followUpDate, setFollowUpDate] = useState(addDaysISO(7));

  const variants = customer ? createMessageVariants(data, customer, channel, language, tone, context) : [];
  const selected = variants[selectedIndex]?.text ?? '';
  const wa = customer ? createWaMeLink(customer.phone, selected) : '';
  const mailto = customer ? createMailtoLink(customer.email, `Honest feedback for ${customer.projectName || data.businessProfile.businessName}`, selected) : '';

  const mark = (status: 'prepared' | 'sent') => {
    if (!customer) return;
    const request = {
      id: `req-${crypto.randomUUID()}`,
      customerId: customer.id,
      channel,
      language,
      tone,
      messageText: selected,
      status,
      preparedAt: nowISO(),
      copiedAt: '',
      manuallyMarkedAsSentAt: status === 'sent' ? nowISO() : '',
      followUpDate: status === 'sent' ? followUpDate : '',
    };
    updateData((current) => ({
      ...current,
      reviewRequests: [request, ...current.reviewRequests],
      customers: current.customers.map((item) =>
        item.id === customer.id
          ? {
              ...item,
              status: status === 'sent' ? 'review_requested' : 'request_prepared',
              googleReviewStatus: status === 'sent' ? 'requested' : item.googleReviewStatus,
              followUpDate: status === 'sent' ? followUpDate : item.followUpDate,
              updatedAt: nowISO(),
            }
          : item,
      ),
    }));
  };

  return (
    <>
      <PageHeader title="Review request generator" eyebrow="Deterministic, ethical, copy-ready messages" />
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card>
          <div className="space-y-4">
            <SelectInput label="Customer" value={customer?.id ?? ''} onChange={setCustomerId} options={data.customers.map((item) => item.id)} labels={Object.fromEntries(data.customers.map((item) => [item.id, `${item.name} · ${item.projectName}`]))} />
            <SelectInput label="Channel" value={channel} onChange={(value) => setChannel(value as Channel)} options={['whatsapp', 'email', 'sms', 'linkedin']} />
            <SelectInput label="Language" value={language} onChange={(value) => setLanguage(value as Language)} options={['de', 'en']} />
            <SelectInput label="Tone" value={tone} onChange={(value) => setTone(value as Tone)} options={['friendly', 'professional', 'warm', 'short']} />
            <SelectInput label="Context" value={context} onChange={(value) => setContext(value as TemplateContext)} options={['project_completed', 'workshop_completed', 'service_delivered', 'product_delivered']} />
            <TextInput label="Follow-up date" type="date" value={followUpDate} onChange={setFollowUpDate} />
          </div>
          <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
            No incentives, no pressure, no 5-star wording, no gating. The same public review option stays available for every real customer.
          </div>
        </Card>
        <Card>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant, index) => (
              <button key={`${variant.label}-${index}`} className={`btn ${selectedIndex === index ? 'btn-primary' : ''}`} onClick={() => setSelectedIndex(index)}>
                {variant.label}
              </button>
            ))}
          </div>
          <textarea className="field mt-5 min-h-[300px] resize-y leading-6" value={selected} onChange={() => undefined} readOnly />
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn btn-primary" onClick={() => navigator.clipboard.writeText(selected)}><Copy size={16} /> Copy message</button>
            <button className="btn" onClick={() => mark('prepared')}><Check size={16} /> Mark prepared</button>
            <button className="btn" onClick={() => mark('sent')}><Send size={16} /> Mark sent manually</button>
            {wa ? <a className="btn" href={wa} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Open WhatsApp</a> : null}
            {mailto ? <a className="btn" href={mailto}><ExternalLink size={16} /> Open email</a> : null}
          </div>
        </Card>
      </div>
    </>
  );
};

const FollowUps = ({ data, updateData }: { data: AppData; updateData: (fn: (data: AppData) => AppData) => void }) => {
  const groups = [
    { title: 'Overdue follow-ups', items: data.customers.filter((customer) => isOverdue(customer.followUpDate) && customer.status !== 'archived') },
    { title: 'Due today', items: data.customers.filter((customer) => customer.followUpDate === todayISO() && customer.status !== 'archived') },
    { title: 'Upcoming', items: data.customers.filter((customer) => customer.followUpDate > todayISO() && customer.status !== 'archived') },
    { title: 'Completed follow-ups', items: data.customers.filter((customer) => customer.status === 'feedback_received' || customer.status === 'testimonial_approved') },
  ];

  const followTemplate = (customer: Customer) => {
    const variant = createMessageVariants(data, customer, customer.preferredChannel, customer.language, data.businessProfile.defaultTone, 'follow_up')[4];
    return variant?.text ?? '';
  };

  return (
    <>
      <PageHeader title="Follow-up queue" eyebrow="The calm place for promises you made to future-you" />
      <div className="grid gap-6 xl:grid-cols-2">
        {groups.map((group) => (
          <Card key={group.title}>
            <h2 className="text-lg font-semibold text-white">{group.title}</h2>
            <div className="mt-4 space-y-3">
              {group.items.length ? (
                group.items.map((customer) => (
                  <div key={customer.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{customer.name}</p>
                        <p className="text-sm text-slate-400">{customer.projectName}</p>
                      </div>
                      <span className="text-sm text-amber-200">{formatDate(customer.followUpDate)}</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button className="btn" onClick={() => navigator.clipboard.writeText(followTemplate(customer))}><Copy size={16} /> Copy follow-up</button>
                      <button className="btn" onClick={() => updateData((current) => ({ ...current, customers: current.customers.map((item) => (item.id === customer.id ? { ...item, status: 'feedback_received', followUpDate: '', updatedAt: nowISO() } : item)) }))}>Mark done</button>
                      <button className="btn" onClick={() => updateData((current) => ({ ...current, customers: current.customers.map((item) => (item.id === customer.id ? { ...item, status: 'archived', internalNotes: `${item.internalNotes}\nNot interested after follow-up.`, updatedAt: nowISO() } : item)) }))}>Not interested</button>
                      <button className="btn" onClick={() => updateData((current) => ({ ...current, customers: current.customers.map((item) => (item.id === customer.id ? { ...item, followUpDate: addDaysISO(7), status: 'follow_up_needed', updatedAt: nowISO() } : item)) }))}><CalendarClock size={16} /> Reschedule</button>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState title="Nothing here" body="This bucket is empty right now." />
              )}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
};

const FeedbackTestimonials = ({ data, updateData, exportTestimonials }: { data: AppData; updateData: (fn: (data: AppData) => AppData) => void; exportTestimonials: () => void }) => {
  const [draft, setDraft] = useState<Feedback>({
    id: `fb-${crypto.randomUUID()}`,
    customerId: data.customers[0]?.id ?? '',
    satisfactionRating: 5,
    feedbackText: '',
    testimonialText: '',
    permissionStatus: 'not_requested',
    canUseName: true,
    canUseCompany: true,
    source: 'Manual note',
    notes: '',
    createdAt: nowISO(),
  });
  const [search, setSearch] = useState('');
  const library = data.feedback.filter((feedback) => {
    const customer = data.customers.find((item) => item.id === feedback.customerId);
    return `${feedback.testimonialText} ${customer?.name} ${customer?.company} ${customer?.serviceType}`.toLowerCase().includes(search.toLowerCase());
  });

  const saveFeedback = () => {
    updateData((current) => ({
      ...current,
      feedback: [{ ...draft, id: `fb-${crypto.randomUUID()}`, createdAt: nowISO() }, ...current.feedback],
      customers: current.customers.map((customer) =>
        customer.id === draft.customerId
          ? {
              ...customer,
              status: draft.permissionStatus === 'granted' ? 'testimonial_approved' : 'feedback_received',
              testimonialPermissionStatus: draft.permissionStatus,
              updatedAt: nowISO(),
            }
          : customer,
      ),
    }));
    setDraft({ ...draft, feedbackText: '', testimonialText: '', notes: '' });
  };

  return (
    <>
      <PageHeader title="Feedback and testimonials" eyebrow="Private learning plus reusable proof">
        <button className="btn" onClick={exportTestimonials}><FileDown size={16} /> Export testimonials CSV</button>
      </PageHeader>
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card>
          <h2 className="text-lg font-semibold text-white">Add feedback</h2>
          <div className="mt-4 space-y-4">
            <SelectInput label="Customer" value={draft.customerId} onChange={(value) => setDraft({ ...draft, customerId: value })} options={data.customers.map((customer) => customer.id)} labels={Object.fromEntries(data.customers.map((customer) => [customer.id, customer.name]))} />
            <SelectInput label="Satisfaction rating" value={String(draft.satisfactionRating)} onChange={(value) => setDraft({ ...draft, satisfactionRating: Number(value) as Feedback['satisfactionRating'] })} options={['1', '2', '3', '4', '5']} />
            <TextArea label="Private feedback" value={draft.feedbackText} onChange={(value) => setDraft({ ...draft, feedbackText: value })} />
            <TextArea label="Suggested testimonial quote" value={draft.testimonialText} onChange={(value) => setDraft({ ...draft, testimonialText: value })} />
            <SelectInput label="Permission status" value={draft.permissionStatus} onChange={(value) => setDraft({ ...draft, permissionStatus: value as PermissionStatus })} options={['not_requested', 'requested', 'granted', 'declined']} />
            <div className="flex gap-4 text-sm text-slate-300">
              <label className="flex items-center gap-2"><input type="checkbox" checked={draft.canUseName} onChange={(event) => setDraft({ ...draft, canUseName: event.target.checked })} /> Use name</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={draft.canUseCompany} onChange={(event) => setDraft({ ...draft, canUseCompany: event.target.checked })} /> Use company</label>
            </div>
            <TextInput label="Source" value={draft.source} onChange={(value) => setDraft({ ...draft, source: value })} />
            <TextArea label="Notes" value={draft.notes} onChange={(value) => setDraft({ ...draft, notes: value })} />
            <button className="btn btn-primary w-full" onClick={saveFeedback}><Plus size={16} /> Save feedback</button>
          </div>
        </Card>
        <Card>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold text-white">Testimonial library</h2>
            <input className="field md:w-72" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search quotes or customers" />
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {library.length ? (
              library.map((feedback) => {
                const customer = data.customers.find((item) => item.id === feedback.customerId);
                return <QuoteCard key={feedback.id} feedback={feedback} customer={customer} />;
              })
            ) : (
              <div className="lg:col-span-2"><EmptyState title="No testimonials found" body="Add feedback or adjust your search to build the library." /></div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
};

const QuoteCard = ({ feedback, customer, compact = false }: { feedback: Feedback; customer?: Customer; compact?: boolean }) => {
  const attribution = [feedback.canUseName ? customer?.name : '', feedback.canUseCompany ? customer?.company : ''].filter(Boolean).join(', ');
  const copy = (prefix: string) => navigator.clipboard.writeText(`${prefix ? `${prefix}\n\n` : ''}"${feedback.testimonialText}"\n${attribution ? `- ${attribution}` : ''}`);
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <Badge value={feedback.permissionStatus} label={permissionLabels[feedback.permissionStatus]} />
        <span className="text-sm text-gold">{'★'.repeat(feedback.satisfactionRating)}</span>
      </div>
      <p className={`text-slate-100 ${compact ? 'text-sm' : 'text-base'}`}>"{feedback.testimonialText}"</p>
      <p className="mt-3 text-sm text-slate-400">{attribution || customer?.serviceType || 'Private attribution'}</p>
      {!compact ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn btn-ghost" onClick={() => copy('Website testimonial')}>Website</button>
          <button className="btn btn-ghost" onClick={() => copy('LinkedIn post quote')}>LinkedIn</button>
          <button className="btn btn-ghost" onClick={() => copy('Proposal proof quote')}>Proposal</button>
        </div>
      ) : null}
    </div>
  );
};

const Templates = ({ data, updateData }: { data: AppData; updateData: (fn: (data: AppData) => AppData) => void }) => {
  const [selectedId, setSelectedId] = useState(data.templates[0]?.id ?? '');
  const selected = data.templates.find((template) => template.id === selectedId) ?? data.templates[0];
  const previewCustomer = data.customers[0];
  const updateTemplate = (patch: Partial<Template>) =>
    updateData((current) => ({ ...current, templates: current.templates.map((template) => (template.id === selected.id ? { ...template, ...patch, updatedAt: nowISO() } : template)) }));

  return (
    <>
      <PageHeader title="Templates" eyebrow="Editable deterministic copy, not AI">
        <div className="flex gap-2">
          <button className="btn" onClick={() => updateData((current) => ({ ...current, templates: defaultTemplates }))}><RefreshCw size={16} /> Reset defaults</button>
          <button className="btn btn-primary" onClick={() => {
            const clone = { ...selected, id: `tpl-${crypto.randomUUID()}`, name: `${selected.name} copy`, isDefault: false };
            updateData((current) => ({ ...current, templates: [clone, ...current.templates] }));
            setSelectedId(clone.id);
          }}><Copy size={16} /> Duplicate</button>
        </div>
      </PageHeader>
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card>
          <div className="space-y-2">
            {data.templates.map((template) => (
              <button key={template.id} className={`w-full rounded-md px-3 py-3 text-left text-sm ${selectedId === template.id ? 'bg-teal-300 text-slate-950' : 'bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]'}`} onClick={() => setSelectedId(template.id)}>
                <span className="block font-medium">{template.name}</span>
                <span className="text-xs opacity-70">{template.language} · {template.channel} · {template.tone}</span>
              </button>
            ))}
          </div>
        </Card>
        {selected ? (
          <Card>
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput label="Template name" value={selected.name} onChange={(value) => updateTemplate({ name: value })} />
              <SelectInput label="Context" value={selected.context} onChange={(value) => updateTemplate({ context: value as TemplateContext })} options={['project_completed', 'workshop_completed', 'service_delivered', 'product_delivered', 'follow_up', 'testimonial_permission']} />
              <SelectInput label="Language" value={selected.language} onChange={(value) => updateTemplate({ language: value as Language })} options={['de', 'en']} />
              <SelectInput label="Tone" value={selected.tone} onChange={(value) => updateTemplate({ tone: value as Tone })} options={['friendly', 'professional', 'warm', 'short']} />
              <SelectInput label="Channel" value={selected.channel} onChange={(value) => updateTemplate({ channel: value as Channel })} options={['whatsapp', 'email', 'sms', 'linkedin']} />
              <div>
                <FieldLabel>Variables</FieldLabel>
                <p className="mt-2 text-sm text-slate-400">{'{{customer_name}}, {{business_name}}, {{project_name}}, {{service_type}}, {{google_review_link}}, {{owner_name}}'}</p>
              </div>
              <div className="md:col-span-2"><TextArea label="Template text" value={selected.templateText} onChange={(value) => updateTemplate({ templateText: value })} rows={9} /></div>
            </div>
            <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-medium text-slate-300">Preview</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-100">{renderTemplate(selected.templateText, previewCustomer, data)}</p>
            </div>
          </Card>
        ) : null}
      </div>
    </>
  );
};

const Reports = ({ data, updateData, exportCustomers, exportTestimonials, exportJson }: { data: AppData; updateData: (fn: (data: AppData) => AppData) => void; exportCustomers: () => void; exportTestimonials: () => void; exportJson: () => void }) => {
  const metrics = calculateMetrics(data);
  const serviceTypeData = Object.entries(countByServiceType(data)).map(([name, value]) => ({ name, value }));
  const trend = Array.from({ length: 8 }).map((_, index) => {
    const label = `W${index + 1}`;
    return {
      label,
      prepared: data.reviewRequests.filter((request) => request.preparedAt).slice(0, index + 1).length,
      sent: data.reviewRequests.filter((request) => request.manuallyMarkedAsSentAt).slice(0, index + 1).length,
      feedback: data.feedback.slice(0, index + 1).length,
      testimonials: data.feedback.filter((item) => item.permissionStatus === 'granted').slice(0, index + 1).length,
    };
  });
  return (
    <>
      <PageHeader title="Reports" eyebrow="Simple operational visibility">
        <div className="flex flex-wrap gap-2">
          <button className="btn" onClick={exportCustomers}><FileDown size={16} /> Customers CSV</button>
          <button className="btn" onClick={exportTestimonials}><FileDown size={16} /> Testimonials CSV</button>
          <button className="btn" onClick={exportJson}><Download size={16} /> JSON backup</button>
          <button className="btn" onClick={() => updateData(() => resetDemoData())}><RefreshCw size={16} /> Reset demo</button>
        </div>
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Average rating" value={metrics.averageRating || 'N/A'} />
        <StatCard label="Overdue follow-ups" value={metrics.overdueFollowUps} />
        <StatCard label="Feedback received" value={metrics.feedbackReceived} />
        <StatCard label="Testimonials approved" value={metrics.testimonialsApproved} />
        <StatCard label="Conversion rate" value={`${metrics.requestToFeedbackRate}%`} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-white">Workflow over time</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2a44" />
                <XAxis dataKey="label" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
                <Line type="monotone" dataKey="prepared" stroke="#22d3ee" />
                <Line type="monotone" dataKey="sent" stroke="#2dd4bf" />
                <Line type="monotone" dataKey="feedback" stroke="#f4c95d" />
                <Line type="monotone" dataKey="testimonials" stroke="#a3e635" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-white">Testimonials by service type</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2a44" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
                <Bar dataKey="value" fill="#2dd4bf" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </>
  );
};

const Settings = ({ data, updateData, setData, exportCustomers, exportTestimonials, exportJson }: { data: AppData; updateData: (fn: (data: AppData) => AppData) => void; setData: (data: AppData) => void; exportCustomers: () => void; exportTestimonials: () => void; exportJson: () => void }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const importBackup = (file?: File) => {
    if (!file) return;
    file.text().then((text) => {
      try {
        setData(importData(text));
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Could not import this backup.');
      }
    });
  };
  return (
    <>
      <PageHeader title="Settings" eyebrow="Local data, backups and principles" />
      <div className="grid gap-6 xl:grid-cols-2">
        <BusinessSetup data={data} updateData={updateData} />
        <Card>
          <h2 className="text-lg font-semibold text-white">Data import and export</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn" onClick={exportCustomers}><FileDown size={16} /> Customers CSV</button>
            <button className="btn" onClick={exportTestimonials}><FileDown size={16} /> Testimonials CSV</button>
            <button className="btn" onClick={exportJson}><Download size={16} /> Export JSON</button>
            <button className="btn" onClick={() => inputRef.current?.click()}><FileUp size={16} /> Import JSON</button>
            <input ref={inputRef} className="hidden" type="file" accept="application/json" onChange={(event) => importBackup(event.target.files?.[0])} />
            <button className="btn text-rose-200" onClick={() => confirm('Reset local data to demo data?') && setData(resetDemoData())}><RefreshCw size={16} /> Reset demo data</button>
          </div>
          <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-slate-300">
            <p className="font-medium text-white">Ethical review collection notes</p>
            <p className="mt-2">Ask real customers only. Ask for honest feedback, not positive reviews. Do not incentivize reviews. Do not filter unhappy customers away from public review options. Use private feedback to improve the business.</p>
          </div>
        </Card>
      </div>
    </>
  );
};

const About = () => (
  <>
    <PageHeader title="About ReviewPilot" eyebrow="Manual-first review operations for small businesses" />
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <h2 className="text-lg font-semibold text-white">What it does</h2>
        <p className="mt-3 leading-7 text-slate-300">ReviewPilot helps freelancers, local service businesses, small agencies, photographers, practices and consultants ask every real customer for honest Google feedback, track follow-ups, save private learning, and reuse testimonials only when permission is clear.</p>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold text-white">What v0.1 intentionally does not do</h2>
        <p className="mt-3 leading-7 text-slate-300">No Google API, no scraping, no automated sending, no authentication, no backend, no paid APIs, no OpenAI API, no Stripe, and no review gating. The point is a trustworthy manual workflow that can be deployed as a static site.</p>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold text-white">Why manual-first</h2>
        <p className="mt-3 leading-7 text-slate-300">Small businesses often need consistency more than automation. Copy-ready messages, follow-up dates, testimonial permission, exports and simple reports prove the workflow before adding infrastructure.</p>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold text-white">Roadmap</h2>
        <p className="mt-3 leading-7 text-slate-300">v0.2 adds Supabase Auth, persistent feedback forms, shareable links, better QR exports, CSV import and website widgets. v0.3 adds user-owned email sending, scheduled reminders, client-facing testimonial walls and agency dashboards. v0.4 explores Google Business Profile integration, review monitoring, reply templates, multi-location support and reputation insights.</p>
      </Card>
    </div>
  </>
);

const TextInput = ({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    <input className="field mt-1" type={type} value={value} onChange={(event) => onChange(event.target.value)} />
  </div>
);

const TextArea = ({ label, value, onChange, rows = 4 }: { label: string; value: string; onChange: (value: string) => void; rows?: number }) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    <textarea className="field mt-1 resize-y" rows={rows} value={value} onChange={(event) => onChange(event.target.value)} />
  </div>
);

const SelectInput = ({ label, value, onChange, options, labels = {} }: { label: string; value: string; onChange: (value: string) => void; options: string[]; labels?: Record<string, string> }) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    <select className="field mt-1" value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option} value={option}>{labels[option] ?? option.replace(/_/g, ' ')}</option>
      ))}
    </select>
  </div>
);

export default App;
