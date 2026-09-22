import React from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  UserSearch,
  Briefcase,
  FileText,
} from 'lucide-react';

export type TenantTab = 'overview' | 'verification' | 'active_tenants' | 'active_seekers' | 'active_gigs' | 'agreement_forms';

interface TenantBottomNavBarProps {
  activeTab: TenantTab;
  onTabChange: (tab: TenantTab) => void;
}

export const TenantBottomNavBar: React.FC<TenantBottomNavBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'verification', label: 'Verification', icon: ShieldCheck },
    { id: 'active_tenants', label: 'Tenants', icon: Users },
    { id: 'active_seekers', label: 'Seekers', icon: UserSearch },
    { id: 'active_gigs', label: 'GiGs', icon: Briefcase },
    { id: 'agreement_forms', label: 'Forms', icon: FileText },
  ] as const;

  return (
    <nav
      id="tenant-bottom-nav-bar"
      className="sticky bottom-0 z-50 bg-white/90 backdrop-blur-md border-t border-neutral-100 px-2 pt-1 pb-safe shadow-2xl"
    >
      <div className="max-w-md mx-auto flex items-center justify-between gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`btn-tenant-tab-${tab.id}`}
              type="button"
              onClick={() => onTabChange(tab.id as TenantTab)}
              className={`flex flex-col items-center gap-1 py-1.5 px-1 flex-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-neutral-900 bg-neutral-50 shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50/50'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-neutral-900 text-white' : ''}`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <span className={`text-[9px] font-bold tracking-tight ${isActive ? 'text-neutral-900' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
