import { BarChart3, Building2, ClipboardList, FileText, Home, Info, MessageSquareText, Settings, Star, Users, Bell } from 'lucide-react';

export type PageKey =
  | 'dashboard'
  | 'business'
  | 'customers'
  | 'generator'
  | 'followups'
  | 'feedback'
  | 'templates'
  | 'reports'
  | 'settings'
  | 'about';

const items = [
  { key: 'dashboard', label: 'Dashboard', icon: Home },
  { key: 'business', label: 'Business Setup', icon: Building2 },
  { key: 'customers', label: 'Customers', icon: Users },
  { key: 'generator', label: 'Review Generator', icon: MessageSquareText },
  { key: 'followups', label: 'Follow-Up Queue', icon: Bell },
  { key: 'feedback', label: 'Testimonials', icon: Star },
  { key: 'templates', label: 'Templates', icon: FileText },
  { key: 'reports', label: 'Reports', icon: BarChart3 },
  { key: 'settings', label: 'Settings', icon: Settings },
  { key: 'about', label: 'About', icon: Info },
] as const;

export const Layout = ({
  active,
  setActive,
  children,
}: {
  active: PageKey;
  setActive: (page: PageKey) => void;
  children: React.ReactNode;
}) => (
  <div className="min-h-screen lg:flex">
    <aside className="border-b border-white/10 bg-slate-950/70 lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-300 text-slate-950">
          <ClipboardList size={21} />
        </div>
        <div>
          <p className="text-lg font-semibold text-white">ReviewPilot</p>
          <p className="text-xs text-slate-500">Manual-first v0.1</p>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:overflow-visible">
        {items.map((item) => {
          const Icon = item.icon;
          const selected = active === item.key;
          return (
            <button
              key={item.key}
              className={`flex shrink-0 items-center gap-3 rounded-md px-3 py-2 text-sm transition lg:w-full ${
                selected ? 'bg-teal-300 text-slate-950' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
              onClick={() => setActive(item.key)}
            >
              <Icon size={17} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="hidden px-5 py-5 text-xs leading-5 text-slate-500 lg:block">
        Ask every real customer for honest feedback. Track the manual work. Reuse testimonials with permission.
      </div>
    </aside>
    <main className="w-full px-4 py-5 lg:ml-72 lg:px-8 lg:py-8">{children}</main>
  </div>
);
