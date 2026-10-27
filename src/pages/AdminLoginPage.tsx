import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { refreshData } = useApp();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!email.trim() || !password) {
        throw new Error('Please enter both your officer email and master access key.');
      }

      const res = await api.adminLogin({
        email: email.trim(),
        password: password
      });

      api.setToken(res.token);

      const profile = {
        id: res.user.id,
        name: res.user.fullName || res.user.full_name,
        email: res.user.email,
        studentId: res.user.studentId || res.user.student_id,
        department: res.user.department || 'Campus Security & Administration',
        role: res.user.role || 'admin',
        avatar: res.user.avatarUrl || res.user.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
      };

      localStorage.setItem('cf_user', JSON.stringify(profile));
      await refreshData();

      // Navigate to dedicated verification desk
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Authorization failed. This portal is restricted to authorized personnel.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between text-slate-800 font-sans selection:bg-[#1E73E8] selection:text-white">
      
      {/* Top Header Bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200 bg-white shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1E73E8]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-wider text-slate-900">CAMPUSFIND</span>
            <span className="text-[10px] text-[#1E73E8] bg-blue-50 px-2 py-0.5 rounded font-mono ml-2 uppercase tracking-wider font-bold border border-blue-200">
              OFFICIAL DESK
            </span>
          </div>
        </div>

        <Link
          to="/"
          className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-100 border border-slate-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Student Portal
        </Link>
      </header>

      {/* Main Login Form Box */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          
          {/* Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1E73E8] to-blue-600" />

          {/* Heading */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto shadow-xs text-[#1E73E8]">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Security Officer Login</h1>
            <p className="text-xs text-slate-500">
              Restricted verification terminal for authorized campus administration and lost & found custody desk.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Officer / Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin.desk@college.edu or admin@somaiya.edu"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E73E8]/30 focus:border-[#1E73E8] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Master Security Key / Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E73E8]/30 focus:border-[#1E73E8] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#1E73E8] hover:bg-blue-600 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.99] mt-2"
            >
              {loading ? (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Access Verification Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Compliance Notice */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Every authentication attempt is logged in AWS CloudWatch & PostgreSQL audit trail. Unauthorized access attempts violate university security policy.
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        CampusFind Enterprise Security SOP v3.2 • Authorized Staff Access Only
      </footer>

    </div>
  );
};
