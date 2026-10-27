import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Eye,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  BarChart3,
  Package,
  ClipboardList,
  FileText,
  ChevronRight,
  ChevronDown,
  RefreshCcw,
  LogOut,
  TrendingUp,
  Users,
  MapPin,
  X,
  Filter,
  Smartphone,
  Key,
  BookOpen,
  Briefcase,
  CreditCard,
  Headphones,
  Glasses,
  HelpCircle,
  Shirt,
  Droplets,
  Fingerprint,
  Activity,
  Menu,
  Phone,
  Mail,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Tag,
  ShieldAlert,
  SlidersHorizontal,
  ExternalLink,
  UserPlus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

// ─── Types ───────────────────────────────────────────────────────────────────
interface AdminStats {
  totalReports: number;
  statusBreakdown: { status: string; count: string }[];
  typeBreakdown: { type: string; count: string }[];
  claims: {
    total_claims: string;
    pending: string;
    approved: string;
    returned: string;
    rejected: string;
    needs_info: string;
  };
  categoryBreakdown: { category: string; count: string }[];
  recoveryRate: number;
  weeklyTrend: { week_start: string; reports_count: string; lost_count: string; found_count: string }[];
}

interface AuditEntry {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: any;
  created_at: string;
  actor_name: string;
}

interface RecentReport {
  id: string;
  reference_number: string;
  title: string;
  type: string;
  category: string;
  location: string;
  status: string;
  image_url: string;
  created_at: string;
  reporter_name: string;
}

interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  student_id: string;
  department: string;
  role: string;
  phone_number: string | null;
  created_at: string;
  found_count: string;
  lost_count: string;
  claims_count: string;
}

type AdminNavSection = 'dashboard' | 'found_items' | 'users' | 'claims' | 'reports';

// ─── Icons Map ────────────────────────────────────────────────────────────────
const categoryIcons: Record<string, React.ReactNode> = {
  'Electronics': <Smartphone className="w-3.5 h-3.5" />,
  'ID Cards': <CreditCard className="w-3.5 h-3.5" />,
  'Keys': <Key className="w-3.5 h-3.5" />,
  'Wallets & Money': <CreditCard className="w-3.5 h-3.5" />,
  'Bags & Backpacks': <Briefcase className="w-3.5 h-3.5" />,
  'Books & Notes': <BookOpen className="w-3.5 h-3.5" />,
  'Headphones & Audio': <Headphones className="w-3.5 h-3.5" />,
  'Water Bottles': <Droplets className="w-3.5 h-3.5" />,
  'Apparel & Clothing': <Shirt className="w-3.5 h-3.5" />,
  'Eyewear & Accessories': <Glasses className="w-3.5 h-3.5" />,
};

export const AdminDashboardPage: React.FC = () => {
  const { items, claims, updateClaimStatus, updateItemStatus, user, logout } = useApp();
  const navigate = useNavigate();

  // Active Navigation
  const [activeNav, setActiveNav] = useState<AdminNavSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [claimStatusFilter, setClaimStatusFilter] = useState<string>('all');

  // Modals & Details
  const [selectedUserModal, setSelectedUserModal] = useState<AdminUser | null>(null);
  const [userModalTab, setUserModalTab] = useState<'details' | 'found' | 'claims'>('details');
  const [expandedClaimId, setExpandedClaimId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // ─── Fetch Admin Stats & Users ───────────────────────────────────────────
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.getAdminStats().catch(() => null),
        api.getAdminUsers().catch(() => null),
      ]);

      if (statsRes) {
        setStats(statsRes.stats);
        setRecentReports(statsRes.recentReports || []);
        setAuditLog(statsRes.auditLog || []);
      }

      if (usersRes?.users) {
        setRegisteredUsers(usersRes.users);
      } else {
        // Fallback demo users if offline/local
        setRegisteredUsers([
          { id: '1', full_name: 'Rahul Saxena', email: 'rahul.s@campus.edu', student_id: 'CS2024-089', department: 'Computer Science', role: 'student', phone_number: '8989898989', created_at: '2024-02-08 11:38:37', found_count: '2', lost_count: '1', claims_count: '1' },
          { id: '2', full_name: 'Farha Akthar', email: 'farha.a@campus.edu', student_id: 'EE2024-012', department: 'Electrical Eng', role: 'student', phone_number: '2525252525', created_at: '2024-02-08 11:38:37', found_count: '1', lost_count: '0', claims_count: '1' },
          { id: '3', full_name: 'Akash Jain', email: 'akash.j@campus.edu', student_id: 'ME2024-055', department: 'Mechanical Eng', role: 'student', phone_number: '6544646544', created_at: '2024-02-08 11:38:37', found_count: '0', lost_count: '2', claims_count: '2' },
          { id: '4', full_name: 'Ginni Mishra', email: 'ginni.m@campus.edu', student_id: 'EC2024-104', department: 'Electronics', role: 'student', phone_number: '3636363663', created_at: '2024-02-08 11:38:37', found_count: '3', lost_count: '1', claims_count: '0' },
          { id: '5', full_name: 'Anuj Kumar', email: 'anuj.k@campus.edu', student_id: 'IT2024-041', department: 'Information Tech', role: 'student', phone_number: '6174512546', created_at: '2024-02-08 11:38:37', found_count: '1', lost_count: '1', claims_count: '1' },
          { id: '6', full_name: 'John Deo', email: 'john.deo@campus.edu', student_id: 'CE2024-019', department: 'Civil Eng', role: 'student', phone_number: '1425632145', created_at: '2024-02-17 22:53:30', found_count: '0', lost_count: '1', claims_count: '1' },
          { id: '7', full_name: 'Ram Kumar', email: 'ram.kumar@campus.edu', student_id: 'BT2024-008', department: 'Biotechnology', role: 'student', phone_number: '5567891236', created_at: '2024-06-11 09:01:25', found_count: '2', lost_count: '0', claims_count: '0' },
          { id: '8', full_name: 'Rakesh Sharma', email: 'rakesh.s@campus.edu', student_id: 'MB2024-112', department: 'Business Admin', role: 'student', phone_number: '7894561236', created_at: '2024-06-11 12:22:37', found_count: '1', lost_count: '1', claims_count: '2' },
        ]);
      }
    } catch (err) {
      console.warn('Admin fetch notice:', err);
    } finally {
      setLoading(false);
    }
  }, [refreshKey]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Pending claims calculation
  const pendingClaims = claims.filter(c => c.status === 'Submitted' || c.status === 'Under Review');

  // ─── Claim Verification Handlers ─────────────────────────────────────────
  const handleApproveClaim = async (claimId: string) => {
    const note = adminNote || 'Verified by Admin: physical characteristics confirmed match.';
    await updateClaimStatus(claimId, 'Approved', note);
    setExpandedClaimId(null);
    setAdminNote('');
    setRefreshKey(k => k + 1);
  };

  const handleHandoverComplete = async (claimId: string) => {
    await updateClaimStatus(claimId, 'Item Returned', 'Physical item delivered to verified student at Security Desk.');
    setExpandedClaimId(null);
    setRefreshKey(k => k + 1);
  };

  const handleRejectClaim = async (claimId: string) => {
    if (!rejectReason.trim()) return;
    await updateClaimStatus(claimId, 'Rejected', rejectReason);
    setShowRejectModal(null);
    setRejectReason('');
    setRefreshKey(k => k + 1);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ─── Filtered Data ────────────────────────────────────────────────────────
  // 1. Found / Inventory Items
  const foundItemsList = useMemo(() => {
    return items.filter(item => {
      const isFound = activeNav === 'found_items' ? item.type === 'found' : true;
      const matchesSearch = !searchTerm ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.reporterName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return isFound && matchesSearch && matchesStatus;
    });
  }, [items, activeNav, searchTerm, statusFilter]);

  // 2. Registered Users Filtered
  const filteredUsers = useMemo(() => {
    return registeredUsers.filter(u => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.student_id.toLowerCase().includes(q) ||
        (u.phone_number && u.phone_number.includes(q))
      );
    });
  }, [registeredUsers, searchTerm]);

  // 3. Claims Filtered
  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      const matchesSearch = !searchTerm ||
        c.itemTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.claimantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = claimStatusFilter === 'all' || c.status === claimStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [claims, searchTerm, claimStatusFilter]);

  // Pagination for Users
  const totalUserPages = Math.ceil(filteredUsers.length / entriesPerPage) || 1;
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  // Reset page when search or entries changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, entriesPerPage, activeNav]);

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-slate-800 flex flex-col font-sans">
      
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 1. TOP BLUE NAVBAR (LFS | ADMIN STYLE)                                */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <header className="bg-[#1E73E8] text-white shadow-md sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 h-14 flex items-center justify-between">
          
          {/* Left Brand & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
              aria-label="Toggle Sidebar Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wide text-lg sm:text-xl text-white">LFS</span>
              <span className="text-white/60 font-light">|</span>
              <span className="font-semibold tracking-wider text-sm sm:text-base text-white/90 uppercase">ADMIN</span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setRefreshKey(k => k + 1); }}
              className="p-2 rounded-full hover:bg-white/15 text-white/90 hover:text-white transition-colors"
              title="Refresh Data"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>

            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-xs font-semibold text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Student Portal
            </Link>

            {/* Profile Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/20">
              <div className="w-8 h-8 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-white font-bold text-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 2. BODY LAYOUT: SIDEBAR + MAIN CONTENT AREA                          */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex w-full relative">
        
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-xs"
          />
        )}

        {/* ─── LEFT SIDEBAR (White, LFS Admin Layout) ───────────────────── */}
        <aside
          className={`fixed md:sticky top-14 left-0 z-40 w-64 h-[calc(100vh-3.5rem)] bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="py-5 overflow-y-auto">
            {/* Admin Profile Card in Sidebar */}
            <div className="px-5 pb-5 mb-3 border-b border-slate-100 flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center text-emerald-600">
                  <UserCheck className="w-6 h-6" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {user.name || 'Campus Administrator'}
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>
            </div>

            {/* Navigation List */}
            <nav className="px-3 space-y-1">
              <button
                onClick={() => { setActiveNav('dashboard'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  activeNav === 'dashboard'
                    ? 'bg-blue-50 text-[#1E73E8] font-bold border-l-4 border-[#1E73E8]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-purple-500" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => { setActiveNav('found_items'); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  activeNav === 'found_items'
                    ? 'bg-blue-50 text-[#1E73E8] font-bold border-l-4 border-[#1E73E8]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-amber-500" />
                  <span>Listed Found Item</span>
                </div>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                  {items.filter(i => i.type === 'found').length}
                </span>
              </button>

              <button
                onClick={() => { setActiveNav('users'); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  activeNav === 'users'
                    ? 'bg-blue-50 text-[#1E73E8] font-bold border-l-4 border-[#1E73E8]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span>Regd Users</span>
                </div>
                <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
                  {registeredUsers.length}
                </span>
              </button>

              <button
                onClick={() => { setActiveNav('claims'); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  activeNav === 'claims'
                    ? 'bg-blue-50 text-[#1E73E8] font-bold border-l-4 border-[#1E73E8]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ClipboardList className="w-4 h-4 text-sky-500" />
                  <span>Claims</span>
                </div>
                {pendingClaims.length > 0 && (
                  <span className="text-[10px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded-full shadow-xs animate-pulse">
                    {pendingClaims.length} new
                  </span>
                )}
              </button>

              <button
                onClick={() => { setActiveNav('reports'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  activeNav === 'reports'
                    ? 'bg-blue-50 text-[#1E73E8] font-bold border-l-4 border-[#1E73E8]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-500" />
                <span>Reports & Audit</span>
              </button>
            </nav>
          </div>

          {/* Bottom Security Desk Badge */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Campus Security SOP v3.2</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Verified handovers log to AWS SQS / RDS</p>
          </div>
        </aside>

        {/* ─── MAIN CONTENT CONTAINER ───────────────────────────────────── */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          
          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 1: REGD USERS (The Exact User UI requested from image)        */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeNav === 'users' && (
            <div className="space-y-4">
              {/* White Container Box */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                
                {/* Blue Title Banner Bar */}
                <div className="bg-[#1E73E8] px-5 py-3 sm:py-3.5 text-white flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-bold tracking-tight">Registered Users</h2>
                  <span className="text-xs font-medium text-white/80">Total: {registeredUsers.length} Users</span>
                </div>

                <div className="p-4 sm:p-6">
                  {/* Controls Row: Show entries & Search input */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span>Show</span>
                      <select
                        value={entriesPerPage}
                        onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                        className="border border-slate-300 rounded-md px-2.5 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1E73E8]"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                      <span>entries</span>
                    </div>

                    <div className="w-full sm:w-auto flex items-center gap-2">
                      <span className="text-sm text-slate-600">Search:</span>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search name, phone, roll..."
                        className="w-full sm:w-56 border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1E73E8]"
                      />
                    </div>
                  </div>

                  {/* Responsive Table for Desktop & Tablet */}
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 text-xs uppercase font-semibold tracking-wider">
                          <th className="py-3 px-4 font-bold text-slate-600">S.NO</th>
                          <th className="py-3 px-4 font-bold text-slate-600">Full Name</th>
                          <th className="py-3 px-4 font-bold text-slate-600">Mobile Number</th>
                          <th className="py-3 px-4 font-bold text-slate-600">User Registered Date</th>
                          <th className="py-3 px-4 font-bold text-slate-600 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedUsers.length > 0 ? (
                          paginatedUsers.map((u, idx) => (
                            <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-4 font-medium text-slate-500">
                                {(currentPage - 1) * entriesPerPage + idx + 1}
                              </td>
                              <td className="py-3.5 px-4">
                                <p className="font-semibold text-slate-800">{u.full_name}</p>
                                <p className="text-xs text-slate-500 font-mono">{u.student_id} • {u.department || 'Student'}</p>
                              </td>
                              <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                                {u.phone_number || 'N/A'}
                              </td>
                              <td className="py-3.5 px-4 text-slate-600 text-xs">
                                {u.created_at}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                  {/* Exact buttons from screenshot: Blue, Amber, Sky */}
                                  <button
                                    onClick={() => { setSelectedUserModal(u); setUserModalTab('details'); }}
                                    className="px-2.5 py-1 bg-[#0088FE] hover:bg-blue-600 text-white rounded text-xs font-semibold shadow-xs transition-colors"
                                  >
                                    View Details
                                  </button>
                                  <button
                                    onClick={() => { setSelectedUserModal(u); setUserModalTab('found'); }}
                                    className="px-2.5 py-1 bg-[#F59E0B] hover:bg-amber-600 text-white rounded text-xs font-semibold shadow-xs transition-colors"
                                  >
                                    Found Items ({u.found_count})
                                  </button>
                                  <button
                                    onClick={() => { setSelectedUserModal(u); setUserModalTab('claims'); }}
                                    className="px-2.5 py-1 bg-[#38BDF8] hover:bg-sky-500 text-white rounded text-xs font-semibold shadow-xs transition-colors"
                                  >
                                    Claims ({u.claims_count})
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-400">
                              No registered users found matching "{searchTerm}"
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5 pt-3 border-t border-slate-100 text-sm text-slate-600">
                    <div>
                      Showing {(currentPage - 1) * entriesPerPage + 1} to{' '}
                      {Math.min(currentPage * entriesPerPage, filteredUsers.length)} of{' '}
                      {filteredUsers.length} entries
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-slate-300 rounded text-xs font-medium hover:bg-slate-100 disabled:opacity-40 transition-colors"
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalUserPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-7 h-7 rounded text-xs font-bold transition-colors ${
                            currentPage === i + 1
                              ? 'bg-[#1E73E8] text-white'
                              : 'border border-slate-300 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalUserPages, p + 1))}
                        disabled={currentPage === totalUserPages}
                        className="px-3 py-1 border border-slate-300 rounded text-xs font-medium hover:bg-slate-100 disabled:opacity-40 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 2: DASHBOARD OVERVIEW                                         */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeNav === 'dashboard' && (
            <div className="space-y-6">
              {/* Stat Cards 4-Column Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Reports</span>
                    <h3 className="text-3xl font-black text-slate-800 mt-1">{stats?.totalReports ?? items.length}</h3>
                    <div className="flex items-center gap-2 mt-2 text-xs font-medium text-slate-500">
                      <span className="text-sky-600 font-bold">{items.filter(i => i.type === 'found').length} Found</span>
                      <span>•</span>
                      <span className="text-rose-600 font-bold">{items.filter(i => i.type === 'lost').length} Lost</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1E73E8] flex items-center justify-center">
                    <Package className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Claims</span>
                    <h3 className="text-3xl font-black text-amber-500 mt-1">{stats?.claims?.pending ?? pendingClaims.length}</h3>
                    <button
                      onClick={() => setActiveNav('claims')}
                      className="mt-2 text-xs font-semibold text-[#1E73E8] hover:underline flex items-center gap-1"
                    >
                      Verify claims <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recovery Rate</span>
                    <h3 className="text-3xl font-black text-emerald-600 mt-1">{stats?.recoveryRate ?? 85}%</h3>
                    <p className="mt-2 text-xs text-slate-500">Items successfully verified & returned</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Users</span>
                    <h3 className="text-3xl font-black text-indigo-600 mt-1">{registeredUsers.length}</h3>
                    <button
                      onClick={() => setActiveNav('users')}
                      className="mt-2 text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      View user directory <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

              </div>

              {/* 2-Column: Quick Claims Verification + Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Pending Verification Spotlight */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-amber-500 px-5 py-3 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5" />
                      <h3 className="font-bold text-sm sm:text-base">Awaiting Verification ({pendingClaims.length})</h3>
                    </div>
                    <button
                      onClick={() => setActiveNav('claims')}
                      className="text-xs bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded font-semibold"
                    >
                      View All
                    </button>
                  </div>

                  <div className="p-4 divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
                    {pendingClaims.length > 0 ? (
                      pendingClaims.map(c => (
                        <div key={c.id} className="py-3 first:pt-0 last:pb-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <span className="text-[11px] font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                                {c.id}
                              </span>
                              <h4 className="font-bold text-slate-800 text-sm mt-1">{c.itemTitle}</h4>
                              <p className="text-xs text-slate-500">
                                Claimed by <span className="font-semibold text-slate-700">{c.claimantName}</span> ({c.claimantEmail})
                              </p>
                              <p className="text-xs text-slate-600 mt-1 italic bg-slate-50 p-2 rounded border border-slate-100">
                                "{c.proofDetails}"
                              </p>
                            </div>
                            <button
                              onClick={() => { setActiveNav('claims'); setExpandedClaimId(c.id); }}
                              className="px-3 py-1.5 bg-[#1E73E8] text-white rounded text-xs font-semibold hover:bg-blue-600 flex-shrink-0"
                            >
                              Verify
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-slate-400">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="font-semibold text-sm">No Pending Claims</p>
                        <p className="text-xs text-slate-500 mt-1">All ownership claims have been reviewed.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Breakdown & Category Distribution */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-800 px-5 py-3 text-white flex items-center justify-between">
                    <h3 className="font-bold text-sm sm:text-base">Campus Lost & Found Breakdown</h3>
                    <span className="text-xs text-slate-300">Live Database Status</span>
                  </div>

                  <div className="p-5 space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1 text-slate-600">
                        <span>Items In Custody (Open & Available)</span>
                        <span className="font-bold text-emerald-600">{items.filter(i => i.status === 'open').length}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${Math.round((items.filter(i => i.status === 'open').length / (items.length || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1 text-slate-600">
                        <span>Items Under Verification / In Review</span>
                        <span className="font-bold text-amber-600">{items.filter(i => i.status === 'under_review').length}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500"
                          style={{ width: `${Math.round((items.filter(i => i.status === 'under_review').length / (items.length || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1 text-slate-600">
                        <span>Approved / Ready for Student Pickup</span>
                        <span className="font-bold text-blue-600">{items.filter(i => i.status === 'claimed').length}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${Math.round((items.filter(i => i.status === 'claimed').length / (items.length || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1 text-slate-600">
                        <span>Successfully Handed Over (Resolved)</span>
                        <span className="font-bold text-teal-600">{items.filter(i => i.status === 'resolved').length}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500"
                          style={{ width: `${Math.round((items.filter(i => i.status === 'resolved').length / (items.length || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Quick Category Chips */}
                    <div className="pt-4 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-500 uppercase block mb-2">Campus Categories</span>
                      <div className="flex flex-wrap gap-1.5">
                        {['Electronics', 'ID Cards', 'Keys', 'Wallets & Money', 'Bags & Backpacks', 'Books & Notes'].map(cat => (
                          <span key={cat} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-md">
                            {categoryIcons[cat]} {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 3: LISTED FOUND ITEMS (Inventory with SOP management)          */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeNav === 'found_items' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Blue Title Banner */}
                <div className="bg-[#1E73E8] px-5 py-3.5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold tracking-tight">Listed Found Items Inventory</h2>
                    <p className="text-xs text-white/80">Campus items recovered and held in custody</p>
                  </div>
                  <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-bold self-start sm:self-auto">
                    {foundItemsList.length} Found Items
                  </span>
                </div>

                <div className="p-4 sm:p-6">
                  {/* Filter Toolbar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by item title, reference #, location..."
                        className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E73E8]"
                      />
                    </div>

                    {/* Status Tabs */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                      {['all', 'open', 'under_review', 'claimed', 'resolved'].map(st => (
                        <button
                          key={st}
                          onClick={() => setStatusFilter(st)}
                          className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                            statusFilter === st
                              ? 'bg-[#1E73E8] text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {st === 'all' ? 'All' : st === 'under_review' ? 'In Review' : st.charAt(0).toUpperCase() + st.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Found Items Table */}
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 text-xs uppercase font-semibold">
                          <th className="py-3 px-4">Ref #</th>
                          <th className="py-3 px-4">Item Details</th>
                          <th className="py-3 px-4">Location Found</th>
                          <th className="py-3 px-4">Reported By</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {foundItemsList.length > 0 ? (
                          foundItemsList.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-xs text-[#1E73E8]">
                                {item.referenceNumber}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={item.imageUrl}
                                    alt=""
                                    className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <p className="font-semibold text-slate-800 truncate">{item.title}</p>
                                    <span className="text-xs text-slate-500">{item.category}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-slate-600 text-xs">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="truncate max-w-[150px]">{item.location}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-slate-600 text-xs">
                                {item.reporterName}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  item.status === 'open' ? 'bg-emerald-100 text-emerald-800' :
                                  item.status === 'under_review' ? 'bg-amber-100 text-amber-800' :
                                  item.status === 'claimed' ? 'bg-blue-100 text-blue-800' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    item.status === 'open' ? 'bg-emerald-500' :
                                    item.status === 'under_review' ? 'bg-amber-500' :
                                    item.status === 'claimed' ? 'bg-blue-500' :
                                    'bg-slate-500'
                                  }`} />
                                  {item.status === 'open' ? 'Open' : item.status === 'under_review' ? 'In Review' : item.status === 'claimed' ? 'Claimed' : 'Returned'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <Link
                                    to={`/item/${item.id}`}
                                    className="px-2.5 py-1 bg-[#0088FE] hover:bg-blue-600 text-white rounded text-xs font-semibold shadow-xs transition-colors"
                                  >
                                    View
                                  </Link>
                                  {item.status !== 'resolved' && (
                                    <button
                                      onClick={() => updateItemStatus(item.id, 'resolved')}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-xs transition-colors"
                                    >
                                      Mark Returned
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400">
                              No found items matching your search criteria
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 4: CLAIMS VERIFICATION WORKFLOW                               */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeNav === 'claims' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Header Banner */}
                <div className="bg-[#1E73E8] px-5 py-3.5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold tracking-tight">Student Ownership Claims Verification</h2>
                    <p className="text-xs text-white/80">Review private ownership evidence and authorize physical handovers</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-bold">
                      {claims.length} Claims Total
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-6 space-y-4">
                  {/* Claims Filters */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search claims by student, roll, or item name..."
                        className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E73E8]"
                      />
                    </div>

                    <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                      {['all', 'Submitted', 'Approved', 'Item Returned', 'Rejected'].map(st => (
                        <button
                          key={st}
                          onClick={() => setClaimStatusFilter(st)}
                          className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                            claimStatusFilter === st
                              ? 'bg-[#1E73E8] text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {st === 'all' ? 'All' : st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Claims List Accordion */}
                  <div className="space-y-3">
                    {filteredClaims.length > 0 ? (
                      filteredClaims.map(claim => (
                        <div
                          key={claim.id}
                          className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs hover:border-slate-300 transition-colors"
                        >
                          <div
                            onClick={() => setExpandedClaimId(expandedClaimId === claim.id ? null : claim.id)}
                            className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                                claim.status === 'Submitted' || claim.status === 'Under Review'
                                  ? 'bg-amber-100 text-amber-800'
                                  : claim.status === 'Approved'
                                    ? 'bg-blue-100 text-blue-800'
                                    : claim.status === 'Item Returned'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                              }`}>
                                <ShieldCheck className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-bold text-slate-700">{claim.id}</span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    claim.status === 'Submitted' || claim.status === 'Under Review'
                                      ? 'bg-amber-100 text-amber-800'
                                      : claim.status === 'Approved'
                                        ? 'bg-blue-100 text-blue-800'
                                        : claim.status === 'Item Returned'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-rose-100 text-rose-800'
                                  }`}>
                                    {claim.status}
                                  </span>
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm mt-0.5">{claim.itemTitle}</h4>
                                <p className="text-xs text-slate-500">Claimant: {claim.claimantName} • Submitted {claim.submittedAt}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <span className="text-xs text-[#1E73E8] font-semibold">
                                {expandedClaimId === claim.id ? 'Hide Details' : 'Review Evidence'}
                              </span>
                              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${
                                expandedClaimId === claim.id ? 'rotate-180' : ''
                              }`} />
                            </div>
                          </div>

                          {/* Expanded Claim Verification Details */}
                          {expandedClaimId === claim.id && (
                            <div className="p-4 sm:p-5 bg-slate-50/60 border-t border-slate-200 space-y-4">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="bg-white p-3 rounded-lg border border-slate-200">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Student Name</span>
                                  <p className="text-sm font-bold text-slate-800">{claim.claimantName}</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-slate-200">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Email / Contact</span>
                                  <p className="text-sm font-bold text-slate-800 truncate">{claim.claimantEmail}</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-slate-200">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Student Roll / ID</span>
                                  <p className="text-sm font-bold text-slate-800 font-mono">{claim.claimantId}</p>
                                </div>
                              </div>

                              {/* Ownership Proof Text Box */}
                              <div className="bg-white p-4 rounded-lg border border-slate-200">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase mb-2">
                                  <Fingerprint className="w-4 h-4 text-amber-500" />
                                  <span>Submitted Ownership Evidence / Marks</span>
                                </div>
                                <p className="text-sm text-slate-700 bg-amber-50/40 p-3 rounded-md border border-amber-200/60 italic leading-relaxed">
                                  "{claim.proofDetails}"
                                </p>
                              </div>

                              {/* Admin notes if any */}
                              {claim.adminNotes && (
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-xs text-blue-900">
                                  <span className="font-bold block mb-1">Previous Admin Note:</span>
                                  {claim.adminNotes}
                                </div>
                              )}

                              {/* Verification Actions */}
                              {(claim.status === 'Submitted' || claim.status === 'Under Review') && (
                                <div className="pt-2 space-y-3">
                                  <div>
                                    <label className="text-xs font-bold text-slate-600 block mb-1">
                                      Admin Verification Note (Optional)
                                    </label>
                                    <input
                                      type="text"
                                      value={adminNote}
                                      onChange={(e) => setAdminNote(e.target.value)}
                                      placeholder="e.g. Scratches verified. Authorized for pickup at Security Desk."
                                      className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E73E8]"
                                    />
                                  </div>

                                  <div className="flex flex-col sm:flex-row gap-2">
                                    <button
                                      onClick={() => handleApproveClaim(claim.id)}
                                      className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                      Approve Verification (Ready for Pickup)
                                    </button>
                                    <button
                                      onClick={() => setShowRejectModal(claim.id)}
                                      className="flex-1 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                    >
                                      <XCircle className="w-4 h-4" />
                                      Reject Claim (Insufficient Evidence)
                                    </button>
                                  </div>
                                </div>
                              )}

                              {claim.status === 'Approved' && (
                                <div className="pt-2">
                                  <button
                                    onClick={() => handleHandoverComplete(claim.id)}
                                    className="w-full sm:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Confirm Physical Handover to Student (Sign & Close)
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-slate-400">
                        <ClipboardList className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-sm">No Claims Found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 5: REPORTS & AUDIT LOG                                        */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeNav === 'reports' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-[#1E73E8] px-5 py-3.5 text-white flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-bold tracking-tight">System Audit & Compliance Log</h2>
                  <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-bold">AWS Audit Trail</span>
                </div>

                <div className="p-4 sm:p-6 space-y-3">
                  <p className="text-xs text-slate-500 mb-4">
                    Every admin decision, claim verification, status change, and handover is cryptographically signed and stored in Postgres / AWS SQS for campus accountability.
                  </p>

                  <div className="space-y-2">
                    {auditLog.length > 0 ? (
                      auditLog.map(entry => (
                        <div key={entry.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-3 text-xs">
                          <div className="w-7 h-7 rounded bg-blue-100 text-[#1E73E8] flex items-center justify-center font-bold flex-shrink-0">
                            <Activity className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">{entry.action}</span>
                              <span className="text-slate-500">• {entry.actor_name || 'Admin'}</span>
                            </div>
                            <p className="text-slate-600 mt-0.5 truncate">
                              Target {entry.entity_type}: {entry.entity_id}
                            </p>
                          </div>
                          <span className="text-slate-400 text-[11px] flex-shrink-0">{entry.created_at}</span>
                        </div>
                      ))
                    ) : (
                      claims.map(claim => (
                        <div key={claim.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-3 text-xs">
                          <div className="w-7 h-7 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold flex-shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-slate-800">Claim {claim.status}</span>
                            <p className="text-slate-600 mt-0.5">
                              {claim.claimantName} claimed "{claim.itemTitle}" ({claim.id})
                            </p>
                          </div>
                          <span className="text-slate-400 text-[11px] flex-shrink-0">{claim.submittedAt}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* USER DETAILS MODAL (Pop-up from View Details / Found Items / Claims) */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {selectedUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#1E73E8] px-5 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">{selectedUserModal.full_name}</h3>
                <p className="text-xs text-white/80 font-mono">{selectedUserModal.student_id} • {selectedUserModal.email}</p>
              </div>
              <button
                onClick={() => setSelectedUserModal(null)}
                className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Subtabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2">
              <button
                onClick={() => setUserModalTab('details')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
                  userModalTab === 'details'
                    ? 'border-[#1E73E8] text-[#1E73E8]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Profile Info
              </button>
              <button
                onClick={() => setUserModalTab('found')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
                  userModalTab === 'found'
                    ? 'border-[#F59E0B] text-[#F59E0B]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Found Items ({selectedUserModal.found_count})
              </button>
              <button
                onClick={() => setUserModalTab('claims')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
                  userModalTab === 'claims'
                    ? 'border-[#38BDF8] text-[#0088FE]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Claims History ({selectedUserModal.claims_count})
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 max-h-[420px] overflow-y-auto">
              {userModalTab === 'details' && (
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Department</span>
                      <p className="font-semibold text-slate-800">{selectedUserModal.department || 'Undergraduate'}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Mobile Number</span>
                      <p className="font-semibold text-slate-800 font-mono">{selectedUserModal.phone_number || 'N/A'}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Registration Date</span>
                      <p className="font-semibold text-slate-800 text-xs">{selectedUserModal.created_at}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Role / Clearance</span>
                      <p className="font-semibold text-slate-800 uppercase text-xs">{selectedUserModal.role}</p>
                    </div>
                  </div>
                </div>
              )}

              {userModalTab === 'found' && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">Items submitted as found by this student:</p>
                  {items.filter(i => (i.reporterName || '').toLowerCase().includes(selectedUserModal.full_name.toLowerCase()) || i.type === 'found').slice(0, 3).map(item => (
                    <div key={item.id} className="p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono text-[10px] text-blue-600 font-bold">{item.referenceNumber}</span>
                        <h4 className="font-bold text-slate-800">{item.title}</h4>
                        <span className="text-slate-500">{item.location}</span>
                      </div>
                      <Link
                        to={`/item/${item.id}`}
                        className="px-2.5 py-1 bg-[#1E73E8] text-white rounded font-semibold text-[11px]"
                      >
                        View Item
                      </Link>
                    </div>
                  ))}
                </div>
              )}

              {userModalTab === 'claims' && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">Claims submitted by this student:</p>
                  {claims.filter(c => (c.claimantName || '').toLowerCase().includes(selectedUserModal.full_name.toLowerCase())).map(claim => (
                    <div key={claim.id} className="p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="font-mono font-bold text-slate-700">{claim.id}</span>
                        <span className="font-bold text-blue-600">{claim.status}</span>
                      </div>
                      <p className="font-semibold text-slate-800">{claim.itemTitle}</p>
                      <p className="text-slate-600 italic bg-slate-50 p-2 rounded">"{claim.proofDetails}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedUserModal(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Rejection Reason Modal ───────────────────────────────────── */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-500" />
                Reject Claim
              </h3>
              <button onClick={() => { setShowRejectModal(null); setRejectReason(''); }} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Provide a valid reason for rejecting this claim. The student will be officially notified.
            </p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              placeholder="e.g. Serial number / description does not match the recovered item..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1E73E8] resize-none"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => { setShowRejectModal(null); setRejectReason(''); }}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => showRejectModal && handleRejectClaim(showRejectModal)}
                disabled={!rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 disabled:opacity-40"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
