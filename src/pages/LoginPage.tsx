import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Lock, Mail, User, Shield, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export const AuthModalPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, register, isAuthenticated, user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!fullName || !email || !password || !studentId) {
          throw new Error('Please fill in all required fields.');
        }
        await register({ fullName, email, password, studentId, department });
      } else {
        if (!email || !password) {
          throw new Error('Please enter your email and password.');
        }
        await login({ email, password });
      }
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoFill = (role: 'student' | 'admin') => {
    if (role === 'admin') {
      setEmail('admin@somaiya.edu');
      setPassword('password123');
    } else {
      setEmail('alex@somaiya.edu');
      setPassword('password123');
    }
    setIsRegister(false);
  };

  if (isAuthenticated && user) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-3xl border border-[#E7EAF1] card-shadow text-center space-y-4">
        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#172033]">You are signed in</h2>
        <p className="text-sm text-[#70798B]">
          Signed in as <strong>{user.name}</strong> ({user.email}) &bull; Role: <span className="capitalize font-semibold text-[#243B8A]">{user.role}</span>
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <Link
            to="/dashboard"
            className="w-full py-2.5 rounded-xl bg-[#243B8A] text-white font-semibold text-sm hover:bg-[#3559C7] transition-all"
          >
            Go to My Dashboard
          </Link>
          <button
            onClick={() => logout()}
            className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-600 font-semibold text-sm hover:bg-rose-50 transition-colors"
          >
            Sign Out Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E7EAF1] card-shadow p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-[#E8EEFF] text-[#243B8A] flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h2 className="text-2xl font-bold text-[#172033] tracking-tight">
            {isRegister ? 'Join CampusFind' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-[#70798B]">
            {isRegister
              ? 'Create a verified college lost-and-found profile'
              : 'Sign in to report items, file claims, and track activity'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              !isRegister ? 'bg-white text-[#243B8A] shadow-xs' : 'text-[#70798B]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              isRegister ? 'bg-white text-[#243B8A] shadow-xs' : 'text-[#70798B]'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#70798B] mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#70798B] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E7EAF1] focus:outline-none focus:border-[#243B8A] bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#70798B] mb-1">
                    Student / Roll ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. STU-10665"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E7EAF1] focus:outline-none focus:border-[#243B8A] bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#70798B] mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E7EAF1] focus:outline-none focus:border-[#243B8A] bg-slate-50/50"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#70798B] mb-1">
              Campus Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#70798B] absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@somaiya.edu"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E7EAF1] focus:outline-none focus:border-[#243B8A] bg-slate-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#70798B] mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#70798B] absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E7EAF1] focus:outline-none focus:border-[#243B8A] bg-slate-50/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#243B8A] hover:bg-[#3559C7] text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <span>{isRegister ? 'Complete Registration' : 'Sign In to CampusFind'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Logins for CCL practical demonstration */}
        <div className="pt-2 border-t border-[#E7EAF1] space-y-2">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#70798B] text-center">
            Demo Examiner One-Click Credentials
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoFill('student')}
              className="px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-[#E7EAF1] text-[11px] font-semibold text-[#172033] transition-colors"
            >
              Fill Student (Alex)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoFill('admin')}
              className="px-2 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[11px] font-semibold text-amber-900 transition-colors"
            >
              Fill Admin Desk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
