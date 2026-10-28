import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Lock, Mail, User, Shield, AlertCircle, ArrowRight, CheckCircle2, Building2, BadgeCheck, Sparkles, KeyRound } from 'lucide-react';

export const AuthModalPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

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
        if (!fullName.trim() || !email.trim() || !password || !studentId.trim()) {
          throw new Error('Please fill in all required fields.');
        }
        await register({ fullName: fullName.trim(), email: email.trim(), password, studentId: studentId.trim(), department: department.trim(), rememberMe });
      } else {
        if (!email.trim() || !password) {
          throw new Error('Please enter your registered email and password.');
        }
        await login({ email: email.trim(), password, rememberMe });
      }
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#E7EAF1] shadow-xl p-8 text-center space-y-5">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100 shadow-sm">
            <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full">
              Session Active
            </span>
            <h2 className="text-2xl font-bold text-[#172033] mt-2 tracking-tight">You are Signed In</h2>
            <p className="text-xs text-[#70798B] mt-1">
              Currently logged in as <strong className="text-[#172033]">{user.name}</strong> ({user.email})
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EEFF] text-[#243B8A] text-xs font-semibold mt-2.5">
              <BadgeCheck className="w-3.5 h-3.5" />
              <span>Role: <strong className="capitalize">{user.role}</strong></span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 pt-3">
            <Link
              to="/dashboard"
              className="w-full py-3 rounded-xl bg-[#243B8A] hover:bg-[#3559C7] text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Go to My Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => logout()}
              className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs transition-colors"
            >
              Sign Out from Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-10 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/50">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-[#E7EAF1] shadow-2xl p-6 sm:p-9 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#243B8A] to-[#3B66DE] text-white flex items-center justify-center mx-auto mb-2 shadow-lg shadow-[#243B8A]/20">
            <Shield className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8EEFF] text-[#243B8A] text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>Campus Operational Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            {isRegister ? 'Create Your Account' : 'Sign in to CampusFind'}
          </h2>
          <p className="text-xs sm:text-sm text-[#70798B] max-w-xs mx-auto">
            {isRegister
              ? 'Register with your college credentials to report lost/found items and file verified ownership claims.'
              : 'Enter your campus credentials to access your lost-and-found dashboard.'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              !isRegister
                ? 'bg-white text-[#243B8A] shadow-sm'
                : 'text-[#70798B] hover:text-[#172033]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              isRegister
                ? 'bg-white text-[#243B8A] shadow-sm'
                : 'text-[#70798B] hover:text-[#172033]'
            }`}
          >
            Register / Sign Up
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-700 text-xs font-medium animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#70798B] mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#70798B] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Philji"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-[#E7EAF1] focus:outline-none focus:ring-2 focus:ring-[#243B8A]/20 focus:border-[#243B8A] bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#70798B] mb-1.5">
                    Student ID / Roll No <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. STU-10665"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E7EAF1] focus:outline-none focus:ring-2 focus:ring-[#243B8A]/20 focus:border-[#243B8A] bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#70798B] mb-1.5">
                    Department
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-[#70798B] absolute left-3 top-3" />
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Computer Engg"
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-[#E7EAF1] focus:outline-none focus:ring-2 focus:ring-[#243B8A]/20 focus:border-[#243B8A] bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#70798B] mb-1.5">
              Campus Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#70798B] absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@somaiya.edu"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-[#E7EAF1] focus:outline-none focus:ring-2 focus:ring-[#243B8A]/20 focus:border-[#243B8A] bg-slate-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#70798B] mb-1.5">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#70798B] absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-[#E7EAF1] focus:outline-none focus:ring-2 focus:ring-[#243B8A]/20 focus:border-[#243B8A] bg-slate-50/50"
              />
            </div>
          </div>

          {/* Remember Me Option */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#243B8A] focus:ring-[#243B8A]/30 border-[#D1D5DB] transition cursor-pointer"
              />
              <span className="text-xs text-[#4B5563] font-medium">Remember me on this device</span>
            </label>
            <span className="text-[11px] text-[#9CA3AF]">
              {rememberMe ? 'Stay signed in' : 'Session only'}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#243B8A] to-[#3B66DE] hover:from-[#1D3070] hover:to-[#2F54BA] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#243B8A]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer active:scale-[0.99]"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <span>{isRegister ? 'Complete Registration' : 'Sign In to CampusFind'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* BOTTOM TAG: Switch Between Sign In and Register */}
        <div className="pt-2 text-center border-t border-[#E7EAF1]">
          {!isRegister ? (
            <p className="text-xs text-[#70798B]">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(true); setError(null); }}
                className="font-bold text-[#243B8A] hover:underline cursor-pointer"
              >
                Sign up / Register now
              </button>
            </p>
          ) : (
            <p className="text-xs text-[#70798B]">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(false); setError(null); }}
                className="font-bold text-[#243B8A] hover:underline cursor-pointer"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

