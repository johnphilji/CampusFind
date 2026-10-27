import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  HelpCircle,
  QrCode,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  CreditCard,
  Key,
  Briefcase,
  BookOpen,
  Headphones,
  Milk,
  Shirt,
  Glasses,
  Clock,
  Compass,
  Info,
  Lock,
  Building2,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ItemCard } from '../components/cards/ItemCard';
import { CAMPUS_CATEGORIES } from '../data/mockData';

export const HomePage: React.FC = () => {
  const { items, matches, user } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found'>('all');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/explore');
    }
  };

  const getCategoryIcon = (name: string) => {
    switch (name) {
      case 'Electronics': return <Smartphone className="w-5 h-5 text-blue-600" />;
      case 'ID Cards': return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'Keys': return <Key className="w-5 h-5 text-blue-600" />;
      case 'Bags': return <Briefcase className="w-5 h-5 text-blue-600" />;
      case 'Books': return <BookOpen className="w-5 h-5 text-blue-600" />;
      case 'Earphones': return <Headphones className="w-5 h-5 text-blue-600" />;
      case 'Bottles': return <Milk className="w-5 h-5 text-blue-600" />;
      case 'Clothing': return <Shirt className="w-5 h-5 text-blue-600" />;
      case 'Accessories': return <Glasses className="w-5 h-5 text-blue-600" />;
      default: return <HelpCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  const recentItems = items
    .filter(item => activeTab === 'all' || item.type === activeTab)
    .slice(0, 6);

  const stats = {
    totalReports: items.length,
    returnedItems: items.filter(i => i.status === 'resolved').length,
    activeMatches: matches.length,
    successRate: items.length > 0 ? `${Math.round((items.filter(i => i.status === 'resolved').length / items.length) * 100)}%` : '100%'
  };

  return (
    <div className="pb-24 md:pb-16 space-y-4 sm:space-y-6 md:space-y-8 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-2 sm:pt-4">
      {/* Mobile Top App Bar */}
      <div className="md:hidden flex items-center justify-between py-2 px-1">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1E3A8A] to-[#0284C7] text-white flex items-center justify-center shadow-md flex-shrink-0">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="m10 15 5-3-5-3v6Z" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-500 font-medium block leading-none">
              {user?.name ? 'Welcome back,' : 'CampusFind'}
            </span>
            <h1 className="text-sm font-extrabold tracking-tight text-[#1E3A8A] truncate mt-0.5">
              {user?.name ? `${user.name.split(' ')[0]} 👋` : 'College Lost & Found'}
            </h1>
          </div>
        </div>

        <Link
          to={user?.email ? "/profile" : "/login"}
          className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100 transition-colors flex-shrink-0"
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || 'User'}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/20"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1E3A8A] font-bold text-xs flex items-center justify-center">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
          )}
        </Link>
      </div>

      {/* Hero Banner Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#0284C7] text-white p-4 sm:p-7 md:p-10 shadow-lg shadow-blue-900/15">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-semibold tracking-wide text-white/90 border border-white/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Campus Lost & Found
          </div>

          <h2 className="text-xl sm:text-3xl md:text-5xl font-extrabold tracking-tight leading-snug">
            Lost something on campus? <br className="hidden sm:inline" />
            <span className="text-sky-200">Let's find & return it.</span>
          </h2>

          {/* Search Input Bar */}
          <form onSubmit={handleSearchSubmit} className="pt-1">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search bags, ID cards, keys, earphones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-24 py-2.5 sm:py-3.5 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 font-medium text-xs sm:text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#1E3A8A] hover:bg-blue-800 text-white px-3 sm:px-4 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 active:scale-95"
              >
                <span>Search</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* 2 Primary Action Cards */}
        <div className="mt-4 sm:mt-6 pt-3.5 sm:pt-5 border-t border-white/15 grid grid-cols-2 gap-2.5 sm:gap-4 relative z-10">
          <Link
            to="/report?type=lost"
            className="group flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all active:scale-[0.98]"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-500/20 text-rose-200 border border-rose-300/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <span className="block text-xs sm:text-sm md:text-base font-bold text-white truncate">I Lost Something</span>
              <span className="text-[10px] sm:text-xs text-white/70 leading-tight block truncate">File report for matching</span>
            </div>
          </Link>

          <Link
            to="/report?type=found"
            className="group flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-white hover:bg-white/95 text-[#172033] shadow-md transition-all active:scale-[0.98]"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#E8EEFF] text-[#243B8A] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#243B8A]" />
            </div>
            <div className="min-w-0">
              <span className="block text-xs sm:text-sm md:text-base font-bold text-[#243B8A] truncate">I Found Something</span>
              <span className="text-[10px] sm:text-xs text-[#70798B] leading-tight block truncate">Upload photo in &lt;1 min</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Suggested Matches Notification Callout (Ref 2 Inspired) */}
      {matches.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl p-3.5 sm:p-5 card-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-amber-500/30">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                  Potential Match Suggestion (Demo)
                </span>
                <span className="text-[10px] text-[#70798B]">{matches[0].createdAt}</span>
              </div>
              <h3 className="text-xs sm:text-base font-bold text-[#172033] mt-1">
                Potential Match for "{matches[0].lostItem.title}"
              </h3>
              <p className="text-[11px] sm:text-xs text-[#70798B] mt-0.5">
                {matches[0].reason}
              </p>
            </div>
          </div>
          <Link
            to={`/item/${matches[0].foundItemId}`}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold transition-colors flex-shrink-0 shadow-sm active:scale-95"
          >
            <span>Review Match</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Categories Section - Responsive Horizontal Scroll / Grid */}
      <section className="space-y-2.5 sm:space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#172033] tracking-tight">Categories</h2>
            <p className="text-[11px] sm:text-xs text-[#70798B]">Filter campus reports by category</p>
          </div>
          <Link
            to="/explore"
            className="text-xs sm:text-sm font-semibold text-[#3559C7] hover:text-[#243B8A] transition-colors"
          >
            View all
          </Link>
        </div>

        {/* Scrollable / Flexible Grid */}
        <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-2 sm:gap-2.5">
          {CAMPUS_CATEGORIES.map(cat => (
            <button
              key={cat.name}
              onClick={() => navigate(`/explore?category=${encodeURIComponent(cat.name)}`)}
              className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl bg-white hover:bg-[#E8EEFF]/40 border border-[#E7EAF1] transition-all card-shadow hover:-translate-y-0.5 group focus:outline-none focus:ring-2 focus:ring-[#3559C7]/40 active:scale-95"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#E8EEFF] group-hover:bg-white text-[#243B8A] flex items-center justify-center transition-colors mb-1 sm:mb-1.5 shadow-xs">
                {getCategoryIcon(cat.name)}
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-[#172033] group-hover:text-[#243B8A] text-center truncate max-w-full">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Recently Reported Items */}
      <section className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#172033] tracking-tight">
                Recently Reported Items
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8EEFF] text-[#243B8A]">
                <Clock className="w-3 h-3" /> Live
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#70798B]">Submissions across campus departments</p>
          </div>

          <div className="flex items-center gap-1 bg-[#E7EAF1]/70 p-1 rounded-xl text-xs font-semibold flex-shrink-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all text-xs ${
                activeTab === 'all' ? 'bg-white text-[#243B8A] shadow-xs' : 'text-[#70798B] hover:text-[#172033]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('lost')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all text-xs ${
                activeTab === 'lost' ? 'bg-white text-[#D64545] shadow-xs' : 'text-[#70798B] hover:text-[#172033]'
              }`}
            >
              Lost
            </button>
            <button
              onClick={() => setActiveTab('found')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all text-xs ${
                activeTab === 'found' ? 'bg-white text-[#243B8A] shadow-xs' : 'text-[#70798B] hover:text-[#172033]'
              }`}
            >
              Found
            </button>
          </div>
        </div>

        {/* Responsive Grid of Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {recentItems.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>

        <div className="text-center pt-1 sm:pt-2">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#243B8A] font-semibold text-xs sm:text-sm border border-[#E7EAF1] shadow-xs transition-colors"
          >
            <Compass className="w-4 h-4 text-[#3559C7]" />
            <span>Browse All {items.length} Campus Items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* How It Works & Safety Verification Guarantee */}
      <section className="bg-white rounded-3xl border border-[#E7EAF1] p-5 sm:p-8 card-shadow space-y-5 sm:space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#3559C7] bg-[#E8EEFF] px-2.5 py-1 rounded-full">
            Simple 3-Step Process
          </span>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#172033]">How CampusFind Works</h3>
          <p className="text-xs sm:text-sm text-[#70798B]">
            A secure bridge between students, staff, and admin security desks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="flex gap-3.5 items-start">
            <div className="w-9 h-9 rounded-2xl bg-[#E8EEFF] text-[#243B8A] flex items-center justify-center font-bold text-sm flex-shrink-0">
              1
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm md:text-base text-[#172033]">Report with Photo</h4>
              <p className="text-[11px] sm:text-xs text-[#70798B] mt-1 leading-relaxed">
                Snap or upload a photo, pinpoint the campus zone (Library, CC3, Lab), and submit within 60 seconds.
              </p>
            </div>
          </div>

          <div className="flex gap-3.5 items-start">
            <div className="w-9 h-9 rounded-2xl bg-[#E8EEFF] text-[#243B8A] flex items-center justify-center font-bold text-sm flex-shrink-0">
              2
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm md:text-base text-[#172033]">Smart Verification</h4>
              <p className="text-[11px] sm:text-xs text-[#70798B] mt-1 leading-relaxed">
                CampusFind scans for matches. Claimants provide unique proof (lock screen wallpaper, sticker details) privately.
              </p>
            </div>
          </div>

          <div className="flex gap-3.5 items-start">
            <div className="w-9 h-9 rounded-2xl bg-[#E8EEFF] text-[#0F9D91] flex items-center justify-center font-bold text-sm flex-shrink-0">
              3
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm md:text-base text-[#172033]">Secure Admin Handover</h4>
              <p className="text-[11px] sm:text-xs text-[#70798B] mt-1 leading-relaxed">
                Official admin desk checks identity, coordinates safe handover, and marks the report resolved.
              </p>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="pt-3 sm:pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-500">
          <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/60 w-full sm:w-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="text-[11px] sm:text-xs">Strict privacy: Personal student IDs and contacts remain confidential.</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-500 self-start sm:self-auto flex items-center gap-1 font-medium">
            <Lock className="w-3 h-3 text-blue-600" /> Verified Custody Protocol
          </span>
        </div>
      </section>

      {/* College Community Stats */}
      <section className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span className="font-semibold uppercase tracking-wider text-[10px]">Campus Community Metrics</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 text-center card-shadow">
            <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#1E3A8A]">{stats.totalReports}</p>
            <p className="text-[11px] sm:text-xs font-medium text-slate-500 mt-1">Total Reported</p>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 text-center card-shadow">
            <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-teal-600">{stats.returnedItems}</p>
            <p className="text-[11px] sm:text-xs font-medium text-slate-500 mt-1">Items Returned</p>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E7EAF1] text-center card-shadow">
            <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-amber-600">{stats.activeMatches}</p>
            <p className="text-[11px] sm:text-xs font-medium text-[#70798B] mt-1">Active AI Matches</p>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E7EAF1] text-center card-shadow">
            <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-emerald-600">{stats.successRate}</p>
            <p className="text-[11px] sm:text-xs font-medium text-[#70798B] mt-1">Resolution Rate</p>
          </div>
        </div>
      </section>
    </div>
  );
};
