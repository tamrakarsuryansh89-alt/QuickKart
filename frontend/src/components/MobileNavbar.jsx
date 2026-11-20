import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ShoppingCart, Package, Menu, X, LogOut, Sparkles } from 'lucide-react';
import logo from '../assets/logo.png';
import Avatar from './Avatar';

export default function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const NAV_LINKS = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/orders', icon: ShoppingCart, label: 'Orders' },
    { to: '/products', icon: Package, label: 'Products' }
  ];

  return (
    <nav className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md text-slate-700 border-b border-sky-100">
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center">
          <img src={logo} alt="QuickKart" className="h-9 w-auto object-contain" />
        </div>

        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 rounded-xl text-slate-500 hover:text-brand-700 hover:bg-sky-50 transition"
          aria-label="Toggle Navigation Menu"
        >
          {isOpen ? <X className="w-5 h-5 text-pink-500" /> : <Menu className="w-5 h-5 text-brand-500" />}
        </button>
      </div>

      {isOpen && (
        <div className="bg-white px-4 pb-4 pt-2 border-t border-sky-100 space-y-1 animate-fadeIn">
          {NAV_LINKS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-500/15 to-pink-500/15 text-brand-800 border-l-2 border-brand-500'
                    : 'text-slate-600 hover:bg-sky-50 hover:text-brand-700'
                }`
              }
            >
              <Icon className="w-4 h-4 text-brand-500" />
              {label}
            </NavLink>
          ))}
          <div className="pt-3 border-t border-sky-100 flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Avatar name={user?.name} size="xs" rounded="rounded-lg" />
              <div>
                <p className="text-xs font-semibold text-slate-800 truncate max-w-[140px]">{user?.name}</p>
                <p className="text-[10px] text-pink-600 uppercase tracking-wider">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1 text-xs text-pink-600 hover:text-pink-700 transition px-2.5 py-1 rounded-lg hover:bg-pink-50"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
