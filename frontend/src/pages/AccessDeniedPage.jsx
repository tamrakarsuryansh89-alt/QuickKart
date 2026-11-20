import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { ShieldOff, LogIn, CircleX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Avatar from '../components/Avatar';
import logo from '../assets/logo.png';

const RESTRICTIONS = [
  'View the dashboard, orders or products',
  'Change order statuses or edit the catalogue',
];

export default function AccessDeniedPage() {
  const { user, role, isAuthenticated, isAdmin, logout } = useAuth();
  const { markChecklistItem } = useData();

  useEffect(() => {
    if (isAuthenticated && !isAdmin) markChecklistItem('testAdminCustomerRestriction', true);
  }, [isAuthenticated, isAdmin, markChecklistItem]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-pink-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full text-center space-y-6">
        <img src={logo} alt="QuickKart" className="h-14 w-auto mx-auto object-contain" />

        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-3xl bg-pink-100 flex items-center justify-center shadow-pink-glow">
            <ShieldOff className="w-10 h-10 text-pink-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-display text-slate-900">This area is for admins</h1>
          <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
            You are signed in with a customer account. The admin portal needs an account with the{' '}
            <span className="text-brand-700 font-semibold">ADMIN</span> role.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-left space-y-4">
          <div className="flex items-center gap-3">
            <Avatar name={user?.name} size="lg" rounded="rounded-xl" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <span className="ml-auto text-xs font-bold bg-pink-50 text-pink-700 border border-pink-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {role}
            </span>
          </div>
          <ul className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-600">
            {RESTRICTIONS.map((text) => (
              <li key={text} className="flex items-center gap-2">
                <CircleX className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-3 px-5 text-sm font-semibold text-white rounded-xl shadow-md transition btn-brand-gradient"
        >
          <LogIn className="w-4 h-4" />
          Sign in with a different account
        </button>
      </div>
    </div>
  );
}
