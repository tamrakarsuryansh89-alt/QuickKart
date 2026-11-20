import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  LogOut,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  CheckSquare,
  TrendingUp,
  Users,
  Settings
} from 'lucide-react';
import logo from '../assets/logo.png';
import Avatar from './Avatar';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview & stats'
  },
  {
    label: 'Orders',
    to: '/orders',
    icon: ShoppingCart,
    description: 'Manage all orders'
  },
  {
    label: 'Products',
    to: '/products',
    icon: Package,
    description: 'Catalogue & inventory'
  }
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { orders, checklist, refresh, loading } = useData();
  const [collapsed, setCollapsed] = useState(false);

  const pendingOrdersCount = orders.filter((o) => o.status === 'PLACED').length;

  const checklistCompletionCount = Object.values(checklist).filter(Boolean).length;

  return (
    <aside
      className={`hidden md:flex flex-col h-screen sticky top-0 text-slate-700 bg-white border-r border-sky-100 transition-all duration-300 ease-in-out shrink-0 z-20 ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
      style={{ boxShadow: '4px 0 24px -12px rgba(0,156,212,0.25)' }}
    >
      <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #009CD4, #FA79C5)' }} />

      <div className={`flex items-center border-b border-sky-100 transition-all duration-300 ${
        collapsed ? 'justify-center px-3 py-4' : 'px-5 py-4 gap-2'
      }`}>
        {collapsed ? (
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-brand-50 flex items-center justify-center border border-sky-100 shrink-0">
            <img src={logo} alt="QuickKart" className="h-full w-auto max-w-none object-cover object-left scale-[2.6] origin-[22%_62%]" />
          </div>
        ) : (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="inline-flex items-center shrink-0">
              <img src={logo} alt="QuickKart" className="h-12 w-auto object-contain" />
            </div>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="px-5 pt-5 pb-2">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Main Navigation
          </p>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-2 px-2.5 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : ''}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'text-brand-700 shadow-sm'
                    : 'text-slate-500 hover:text-brand-700 hover:bg-sky-50'
                } ${collapsed ? 'justify-center' : ''}`
              }
              style={({ isActive }) => isActive ? {
                background: 'linear-gradient(135deg, rgba(0,156,212,0.14) 0%, rgba(250,121,197,0.14) 100%)',
                borderLeft: '3px solid #009CD4'
              } : { borderLeft: '3px solid transparent' }}
            >
              {({ isActive }) => (
                <>
                  <div className={`relative shrink-0`}>
                    <Icon
                      className="w-[18px] h-[18px]"
                      style={isActive ? { color: '#009CD4' } : {}}
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />
                    {item.to === '/orders' && pendingOrdersCount > 0 && (
                      <span
                        className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-0.5 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                        style={{ background: '#FA79C5' }}
                      >
                        {pendingOrdersCount}
                      </span>
                    )}
                  </div>
                  {!collapsed && (
                    <div className="flex-1 overflow-hidden">
                      <span className={`text-[13px] font-medium block leading-tight ${isActive ? 'text-brand-800' : ''}`}>
                        {item.label}
                      </span>
                      <span className="text-[10px] text-slate-500 block leading-tight">{item.description}</span>
                    </div>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="mx-3 mb-3 p-3.5 rounded-xl border border-sky-100" style={{ background: 'linear-gradient(135deg,#E6F7FD,#FFF0FB)' }}>
          <div className="flex items-center gap-2 mb-2.5">
            <CheckSquare className="w-3.5 h-3.5" style={{ color: '#009CD4' }} strokeWidth={2} />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Project Checklist
            </span>
          </div>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-[11px] text-slate-500">Admin frontend</span>
            <span className="text-sm font-bold" style={{
              background: 'linear-gradient(135deg, #009CD4, #FA79C5)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {checklistCompletionCount}/9
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,156,212,0.15)' }}>
            <div
              className="h-1.5 rounded-full transition-all duration-700"
              style={{
                width: `${(checklistCompletionCount / 9) * 100}%`,
                background: 'linear-gradient(90deg, #009CD4, #FA79C5)'
              }}
            />
          </div>
        </div>
      )}

      <div className="px-2.5 pb-4 space-y-1.5 border-t border-sky-100 pt-3">
        {!collapsed && (
          <button
            onClick={refresh}
            disabled={loading}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-brand-700 hover:bg-sky-50 transition"
          >
            <RefreshCcw className={`w-3.5 h-3.5 shrink-0 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.8} />
            <span>{loading ? 'Refreshing...' : 'Refresh data'}</span>
          </button>
        )}

        <div className={`flex items-center gap-2.5 p-2.5 rounded-xl border border-sky-100 ${
          collapsed ? 'flex-col' : ''
        }`} style={{ background: '#F7FBFE' }}>
          <div className="relative shrink-0">
            <Avatar name={user?.name} size="sm" rounded="rounded-lg" />
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
              style={{ background: '#009CD4' }}
            />
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate leading-tight">{user?.name}</p>
              <p className="text-[9px] text-slate-500 truncate uppercase tracking-wider">{user?.role}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-pink-600 transition shrink-0"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={1.8} />
          </button>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center gap-2 py-1.5 px-3 rounded-xl text-[11px] text-slate-500 hover:text-brand-700 hover:bg-sky-50 transition ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4" strokeWidth={1.8} />
            : <><ChevronLeft className="w-4 h-4" strokeWidth={1.8} /><span>Collapse</span></>
          }
        </button>
      </div>
    </aside>
  );
}
