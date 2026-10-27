import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ChevronDown,
  RefreshCcw,
  LogOut,
  MapPin,
  X,
  Smartphone,
  Key,
  BookOpen,
  Briefcase,
  CreditCard,
  Headphones,
  Glasses,
  Shirt,
  Droplets,
  Fingerprint,
  Phone,
  Mail,
  Calendar,
  ExternalLink,
  ShieldAlert,
  User,
  Image as ImageIcon,
  Check,
  FileCheck2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ClaimRecord, ItemStatus } from '../types';

// Category icon helper
const getCategoryIcon = (category?: string) => {
  switch (category) {
    case 'Electronics': return <Smartphone className="w-3.5 h-3.5" />;
    case 'ID Cards':
    case 'Wallets & Money': return <CreditCard className="w-3.5 h-3.5" />;
    case 'Keys': return <Key className="w-3.5 h-3.5" />;
    case 'Bags & Backpacks': return <Briefcase className="w-3.5 h-3.5" />;
    case 'Books & Notes': return <BookOpen className="w-3.5 h-3.5" />;
    case 'Headphones & Audio': return <Headphones className="w-3.5 h-3.5" />;
    case 'Water Bottles': return <Droplets className="w-3.5 h-3.5" />;
    case 'Apparel & Clothing': return <Shirt className="w-3.5 h-3.5" />;
    case 'Eyewear & Accessories': return <Glasses className="w-3.5 h-3.5" />;
    default: return <ShieldCheck className="w-3.5 h-3.5" />;
  }
};

export const AdminDashboardPage: React.FC = () => {
  const { claims, items, updateClaimStatus, updateItemStatus, user, logout, refreshData } = useApp();
  const navigate = useNavigate();

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedClaimId, setExpandedClaimId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Match claim with corresponding item in items collection for fallback image/status
  const enrichedClaims = useMemo(() => {
    return claims.map(claim => {
      const matchedItem = items.find(i => i.id === claim.itemId || i.referenceNumber === claim.itemId);
      const imageUrl = claim.itemImageUrl || matchedItem?.imageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80';
      const itemStatus: ItemStatus = claim.reportStatus || matchedItem?.status || 'under_review';
      const itemRef = claim.itemReferenceNumber || matchedItem?.referenceNumber || 'REF-LFS';
      const itemCategory = claim.itemCategory || matchedItem?.category || 'General';
      const itemDescription = claim.itemDescription || matchedItem?.description || 'No additional description provided.';

      return {
        ...claim,
        imageUrl,
        itemStatus,
        itemRef,
        itemCategory,
        itemDescription,
      };
    });
  }, [claims, items]);

  // Filtered Claims
  const filteredClaims = useMemo(() => {
    return enrichedClaims.filter(c => {
      const matchesSearch = !searchTerm ||
        c.itemTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.claimantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.claimantId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.itemRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.itemLocation.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [enrichedClaims, searchTerm, statusFilter]);

  // Action handlers
  const handleApprove = async (claimId: string, itemId: string) => {
    const note = adminNote.trim() || 'Verified by Admin: physical characteristics and proof confirmed match.';
    await updateClaimStatus(claimId, 'Approved', note);
    // Also update item status
    updateItemStatus(itemId, 'claimed');
    setAdminNote('');
  };

  const handleReject = async (claimId: string) => {
    if (!rejectReason.trim()) return;
    await updateClaimStatus(claimId, 'Rejected', rejectReason.trim());
    setShowRejectModal(null);
    setRejectReason('');
  };

  const handleHandover = async (claimId: string, itemId: string) => {
    await updateClaimStatus(claimId, 'Item Returned', 'Physical item delivered to verified student at Security Desk.');
    updateItemStatus(itemId, 'resolved');
  };

  // Status counts
  const pendingCount = enrichedClaims.filter(c => c.status === 'Submitted' || c.status === 'Under Review').length;
  const approvedCount = enrichedClaims.filter(c => c.status === 'Approved').length;
  const returnedCount = enrichedClaims.filter(c => c.status === 'Item Returned').length;
  const rejectedCount = enrichedClaims.filter(c => c.status === 'Rejected').length;

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-900">
      
      {/* ─── 1. DEDICATED ADMIN DESK HEADER ─── */}
      <header className="sticky top-0 z-40 bg-[#1E293B]/95 backdrop-blur-md border-b border-slate-700/80 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 font-black">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight">CAMPUSFIND</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Verification Desk
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Official Item Ownership Claims & Verification Console</p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className={`p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors ${isRefreshing ? 'animate-spin text-amber-400' : ''}`}
              title="Refresh Claims"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>

            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Student Portal
            </Link>

            <div className="flex items-center gap-2 pl-3 border-l border-slate-700">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-xs flex items-center justify-center">
                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-200 leading-tight">{user.name || 'Admin Officer'}</p>
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Security Staff
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── 2. MAIN SINGLE PAGE CONTENT ─── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* Header Title + Stats Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Item Claims Verification
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {filteredClaims.length} records
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Verify submitted proof, inspect item photos, and manage lost/found item claim authorization.
            </p>
          </div>

          {/* Quick Filter Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60'
              }`}
            >
              All ({enrichedClaims.length})
            </button>
            <button
              onClick={() => setStatusFilter('Submitted')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                statusFilter === 'Submitted'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 hover:bg-slate-700/80 text-amber-400 border border-amber-500/30'
              }`}
            >
              <Clock className="w-3 h-3" />
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('Approved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                statusFilter === 'Approved'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 hover:bg-slate-700/80 text-blue-400 border border-blue-500/30'
              }`}
            >
              <Check className="w-3 h-3" />
              Approved ({approvedCount})
            </button>
            <button
              onClick={() => setStatusFilter('Item Returned')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                statusFilter === 'Item Returned'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 hover:bg-slate-700/80 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              Returned ({returnedCount})
            </button>
            <button
              onClick={() => setStatusFilter('Rejected')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === 'Rejected'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 hover:bg-slate-700/80 text-rose-400 border border-rose-500/30'
              }`}
            >
              Rejected ({rejectedCount})
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, roll number, claim ID, item title, or location..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all shadow-inner"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ─── 3. CLAIMS LIST CARDS ─── */}
        <div className="space-y-4">
          {filteredClaims.length > 0 ? (
            filteredClaims.map((claim) => {
              const isExpanded = expandedClaimId === claim.id;

              return (
                <div
                  key={claim.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isExpanded
                      ? 'bg-slate-800/90 border-amber-500/50 shadow-xl shadow-amber-500/5 ring-1 ring-amber-500/30'
                      : 'bg-slate-800/50 border-slate-700/70 hover:border-slate-600 hover:bg-slate-800/80'
                  }`}
                >
                  {/* Collapsed Row Bar */}
                  <div
                    onClick={() => setExpandedClaimId(isExpanded ? null : claim.id)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    {/* Left: Item Thumbnail & Claims Info */}
                    <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                      
                      {/* Item Thumbnail */}
                      <div className="relative group/thumb flex-shrink-0">
                        <img
                          src={claim.imageUrl}
                          alt={claim.itemTitle}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-slate-700 ring-1 ring-slate-600/50"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePhotoModal(claim.imageUrl);
                          }}
                          className="absolute inset-0 bg-slate-900/60 rounded-xl opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity text-white"
                          title="Enlarge Photo"
                        >
                          <ImageIcon className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Item Title & Metadata */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {claim.id}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {claim.itemRef}
                          </span>
                          
                          {/* Item Status Badge */}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            claim.itemStatus === 'open' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                            claim.itemStatus === 'claimed' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' :
                            claim.itemStatus === 'under_review' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
                            'bg-slate-700/50 text-slate-300 border border-slate-600'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              claim.itemStatus === 'open' ? 'bg-emerald-400' :
                              claim.itemStatus === 'claimed' ? 'bg-blue-400' :
                              claim.itemStatus === 'under_review' ? 'bg-amber-400' :
                              'bg-slate-400'
                            }`} />
                            Item: {claim.itemStatus === 'open' ? 'Available' : claim.itemStatus === 'claimed' ? 'Claimed' : claim.itemStatus === 'under_review' ? 'In Review' : 'Resolved'}
                          </span>
                        </div>

                        <h3 className="font-bold text-white text-base truncate">{claim.itemTitle}</h3>

                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 text-slate-300 font-medium">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {claim.claimantName}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            {claim.itemLocation}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {claim.submittedAt}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Claim Status Pill & Arrow */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/60">
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                        claim.status === 'Submitted' || claim.status === 'Under Review'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : claim.status === 'Approved'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : claim.status === 'Item Returned'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {claim.status === 'Submitted' || claim.status === 'Under Review' ? <Clock className="w-3.5 h-3.5" /> :
                         claim.status === 'Approved' ? <Check className="w-3.5 h-3.5" /> :
                         claim.status === 'Item Returned' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                         <XCircle className="w-3.5 h-3.5" />}
                        {claim.status}
                      </span>

                      <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                        <span>{isExpanded ? 'Collapse' : 'Review'}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-amber-400' : ''}`} />
                      </div>
                    </div>
                  </div>

                  {/* ─── 4. EXPANDED VIEW WITH FULL PHOTO & VERIFICATION EVIDENCE ─── */}
                  {isExpanded && (
                    <div className="border-t border-slate-700/80 bg-slate-900/70 p-4 sm:p-6 space-y-6 animate-in fade-in duration-150">
                      
                      {/* Grid: Photo & Student / Item Details */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                        
                        {/* Expanded Item Photo (Left 4 cols) */}
                        <div className="md:col-span-4 space-y-2">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Item Physical Photo
                          </span>
                          <div
                            onClick={() => setActivePhotoModal(claim.imageUrl)}
                            className="relative group cursor-pointer overflow-hidden rounded-xl border border-slate-700 bg-slate-950/60 aspect-square flex items-center justify-center"
                          >
                            <img
                              src={claim.imageUrl}
                              alt={claim.itemTitle}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                              <span className="text-xs text-white font-semibold flex items-center gap-1.5">
                                <ImageIcon className="w-4 h-4 text-amber-400" /> Click to enlarge full photo
                              </span>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-400 text-center">
                            Inspect visual markers against ownership explanation
                          </p>
                        </div>

                        {/* Details (Right 8 cols) */}
                        <div className="md:col-span-8 space-y-4">
                          
                          {/* Student Claimant Info Card */}
                          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80">
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-2">
                              Claimant Credentials
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                              <div>
                                <span className="text-slate-400 block text-[11px]">Full Name</span>
                                <p className="font-bold text-white text-sm mt-0.5">{claim.claimantName}</p>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[11px]">Student Roll / ID</span>
                                <p className="font-mono font-bold text-slate-200 mt-0.5">{claim.claimantId}</p>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[11px]">Email Address</span>
                                <p className="font-medium text-slate-200 truncate mt-0.5">{claim.claimantEmail}</p>
                              </div>
                            </div>
                          </div>

                          {/* Ownership Proof / Private Evidence */}
                          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2">
                            <div className="flex items-center gap-2">
                              <Fingerprint className="w-4 h-4 text-amber-400" />
                              <span className="text-xs font-bold text-white uppercase tracking-wider">
                                Claimant's Ownership Description & Secret Marks
                              </span>
                            </div>
                            <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-700/60 text-sm text-amber-100/90 leading-relaxed italic">
                              "{claim.proofDetails}"
                            </div>
                          </div>

                          {/* Item Listing Details */}
                          <div className="bg-slate-800/40 rounded-xl p-3.5 border border-slate-700/50 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400">Category:</span>
                              <span className="font-semibold text-slate-200 flex items-center gap-1">
                                {getCategoryIcon(claim.itemCategory)}
                                {claim.itemCategory}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400">Recovery Spot:</span>
                              <span className="font-semibold text-slate-200">{claim.itemLocation}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400">Current Item Status:</span>
                              <span className="font-bold text-amber-400 uppercase text-[11px]">{claim.itemStatus}</span>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Admin Decision Notes if existing */}
                      {claim.adminNotes && (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3.5 text-xs text-blue-200">
                          <span className="font-bold text-blue-300 block mb-1">Previous Admin Note:</span>
                          {claim.adminNotes}
                        </div>
                      )}

                      {/* Action Decision Toolbar */}
                      <div className="pt-2 border-t border-slate-800 space-y-3">
                        
                        {(claim.status === 'Submitted' || claim.status === 'Under Review') && (
                          <div className="space-y-3">
                            <div>
                              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                Verification Note / Security Staff Remarks (Optional)
                              </label>
                              <input
                                type="text"
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                placeholder="e.g. Scratches verified with claimant at security desk. Authorized."
                                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                              />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                              <button
                                onClick={() => handleApprove(claim.id, claim.itemId)}
                                className="flex-1 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Approve Claim (Authorize Item Collection)
                              </button>
                              
                              <button
                                onClick={() => setShowRejectModal(claim.id)}
                                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-slate-700 hover:border-rose-500/40 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2"
                              >
                                <XCircle className="w-4 h-4" />
                                Reject Claim
                              </button>
                            </div>
                          </div>
                        )}

                        {claim.status === 'Approved' && (
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl">
                            <div>
                              <p className="font-bold text-blue-300 text-sm">Awaiting Physical Handover</p>
                              <p className="text-xs text-blue-200/80">Student is authorized to collect the item. Click confirm once given.</p>
                            </div>
                            <button
                              onClick={() => handleHandover(claim.id, claim.itemId)}
                              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                            >
                              <FileCheck2 className="w-4 h-4" />
                              Confirm Physical Handover (Close Case)
                            </button>
                          </div>
                        )}

                        {claim.status === 'Item Returned' && (
                          <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                            <span>This item was successfully verified, handed over, and marked as resolved.</span>
                          </div>
                        )}

                        {claim.status === 'Rejected' && (
                          <div className="bg-rose-500/10 border border-rose-500/30 p-3.5 rounded-xl flex items-center gap-2 text-xs text-rose-300">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>This claim was rejected due to lack of matching ownership verification.</span>
                          </div>
                        )}

                      </div>

                    </div>
                  )}

                </div>
              );
            })
          ) : (
            <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-slate-800">
              <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-300">No Claims Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No ownership claims match the active filter or search keyword.
              </p>
            </div>
          )}
        </div>

      </main>

      {/* ─── 5. FULL PHOTO ENLARGE MODAL ─── */}
      {activePhotoModal && (
        <div
          onClick={() => setActivePhotoModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-slate-900 rounded-2xl border border-slate-700 max-w-3xl w-full overflow-hidden shadow-2xl"
          >
            <div className="p-3 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between text-white">
              <span className="text-xs font-bold tracking-wide flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                Physical Item Photo Preview
              </span>
              <button
                onClick={() => setActivePhotoModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-black/60 max-h-[75vh] overflow-hidden">
              <img
                src={activePhotoModal}
                alt="Enlarged Item"
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── 6. REJECTION REASON MODAL ─── */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-md p-5 sm:p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-500" />
                Reject Ownership Claim
              </h3>
              <button
                onClick={() => { setShowRejectModal(null); setRejectReason(''); }}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-xs text-slate-400 mb-3">
              State the reason for rejecting this claim. This explanation will be logged and communicated to the student.
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="e.g. Unique identifying marks or device lock pin did not match the physical item."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-none"
            />

            <div className="flex gap-2.5 mt-4">
              <button
                onClick={() => { setShowRejectModal(null); setRejectReason(''); }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => showRejectModal && handleReject(showRejectModal)}
                disabled={!rejectReason.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-rose-600/20"
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
