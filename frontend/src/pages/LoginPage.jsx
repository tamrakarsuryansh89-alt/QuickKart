import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  Eye,
  EyeOff,
  ShieldCheck,
  Lock,
  Mail,
  CircleAlert,
  ArrowRight,
  Package,
  ShoppingCart,
  Truck,
  Heart,
  Sparkles,
  CircleCheck,
} from 'lucide-react';
import logo from '../assets/logo.png';

const HIGHLIGHTS = [
  { icon: Package, title: 'Catalogue', text: 'Add and edit products', tone: 'blue' },
  { icon: ShoppingCart, title: 'Orders', text: 'Search and filter', tone: 'pink' },
  { icon: Truck, title: 'Fulfilment', text: 'Move orders forward', tone: 'blue' },
];

export default function LoginPage() {
  const { login, isAuthenticated, loading, authError, role } = useAuth();
  const { addToast, markChecklistItem } = useData();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  if (isAuthenticated) {
    return <Navigate to={role === 'ADMIN' ? '/dashboard' : '/access-denied'} replace />;
  }

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Enter your email address';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'That does not look like an email address';
    if (!password) errs.password = 'Enter your password';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await login(email, password);
    if (!result.success) return;

    markChecklistItem('loginJwt', true);
    if (result.user.role === 'ADMIN') {
      markChecklistItem('protectedDashboard', true);
      addToast(`Welcome back, ${result.user.name}`, 'success');
      navigate('/dashboard', { replace: true });
    } else {
      markChecklistItem('testAdminCustomerRestriction', true);
      navigate('/access-denied', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-white">
      <div
        className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #E6F7FD 0%, #FFFFFF 50%, #FFF0FB 100%)' }}
      >
        <div
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: '#009CD4' }}
        />
        <div
          className="absolute -bottom-24 -left-20 w-96 h-96 rounded-full blur-3xl opacity-25 pointer-events-none"
          style={{ background: '#FA79C5' }}
        />

        <div className="relative z-10">
          <img src={logo} alt="QuickKart" className="h-24 w-auto object-contain" />
          <span className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white text-brand-700 border border-sky-100 shadow-sm">
            <Sparkles className="w-3 h-3 text-pink-500" />
            Stationery delivered in minutes
          </span>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-pink-600">
              <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
              Admin portal
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900 leading-tight">
              Run your store with care and clarity.
            </h1>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            Keep the catalogue fresh, follow every order from placed to delivered, and see how the
            store is doing at a glance.
          </p>
          <div className="grid grid-cols-3 gap-3 pt-2">
            {HIGHLIGHTS.map(({ icon: Icon, title, text, tone }) => (
              <div
                key={title}
                className="bg-white border border-sky-100 rounded-2xl p-3.5 shadow-sm hover:shadow-blue-glow transition"
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${
                    tone === 'pink' ? 'bg-pink-100 text-pink-600' : 'bg-sky-100 text-brand-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-sm font-bold text-slate-900 font-display">{title}</p>
                <p className="text-[11px] text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 border-t border-sky-100 pt-4">
          <span>QuickKart Admin Portal</span>
          <span className="flex items-center gap-1.5 text-brand-600">
            <CircleCheck className="w-3.5 h-3.5 text-pink-500" />
            Secured with JWT
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 max-w-lg mx-auto w-full bg-white">
        <div className="flex flex-col items-center mb-8 lg:hidden">
          <img src={logo} alt="QuickKart" className="h-16 w-auto object-contain mb-2" />
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
            Admin Portal
          </span>
        </div>

        <div className="w-full space-y-6">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-brand-700 border border-sky-100 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
              Admins only
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
              Sign in to your dashboard
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Use the email and password of a QuickKart account with admin access.
            </p>
          </div>

          {authError && (
            <div
              role="alert"
              className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 animate-fadeIn"
            >
              <CircleAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-rose-700">Could not sign you in</p>
                <p className="text-xs text-rose-600 mt-0.5">{authError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 inset-y-0 flex items-center text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  autoFocus
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldErrors((p) => ({ ...p, email: '' }));
                  }}
                  placeholder="you@quickkart.com"
                  autoComplete="email"
                  aria-invalid={Boolean(fieldErrors.email)}
                  className={`w-full pl-10 pr-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 transition ${
                    fieldErrors.email
                      ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/50'
                      : 'border-slate-300 focus:ring-brand-400 focus:border-brand-500 bg-white'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                  <CircleAlert className="w-3.5 h-3.5" /> {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 inset-y-0 flex items-center text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors((p) => ({ ...p, password: '' }));
                  }}
                  placeholder="Your password"
                  autoComplete="current-password"
                  aria-invalid={Boolean(fieldErrors.password)}
                  className={`w-full pl-10 pr-11 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 transition ${
                    fieldErrors.password
                      ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/50'
                      : 'border-slate-300 focus:ring-brand-400 focus:border-brand-500 bg-white'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 inset-y-0 flex items-center text-slate-400 hover:text-slate-700 transition"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff className="w-4 h-4 text-brand-600" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                  <CircleAlert className="w-3.5 h-3.5" /> {fieldErrors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold text-sm rounded-xl py-3 shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 btn-brand-gradient"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-slate-500 text-center bg-[#F7FBFE] border border-sky-100 rounded-2xl p-4 leading-relaxed">
            New accounts are created as customers. Ask an existing admin to give your account the{' '}
            <span className="font-semibold text-brand-700">ADMIN</span> role before signing in here.
          </p>
        </div>
      </div>
    </div>
  );
}
