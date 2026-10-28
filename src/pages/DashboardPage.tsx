import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Plus,
  Clock,
  ArrowRight,
  FolderOpen,
  MessageSquare,
  Send
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge, TypeBadge } from '../components/cards/Badges';

export const DashboardPage: React.FC = () => {
  const { items, claims, matches, user, addClaimMessage } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found' | 'claims'>('all');
  const [replyInputs, setReplyInputs] = useState<{ [claimId: string]: string }>({});

  const userFirstName = user.name ? user.name.split(' ')[0].toLowerCase() : '';
  const myReports = items.filter(i => {
    if (!userFirstName) return false;
    const repName = (i.reporterName || '').toLowerCase();
    return repName.includes(userFirstName) || i.reporterEmail === user.email;
  });
  const myLostItems = myReports.filter(i => i.type === 'lost');
  const myFoundItems = myReports.filter(i => i.type === 'found');

  // Only show match suggestions if the found item is still open and unreturned
  const activeMatches = matches.filter(m => {
    const foundItem = items.find(i => i.id === m.foundItemId);
    const itemStatus = foundItem?.status || m.foundItem?.status;
    const isAlreadyClaimed = claims.some(c => (c.itemId === m.foundItemId) && (c.status === 'Approved' || c.status === 'Item Returned'));
    return itemStatus === 'open' && !isAlreadyClaimed;
  });

  const getClaimStatusBadge = (status: string) => {
    switch (status) {
      case 'Submitted':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">Submitted</span>;
      case 'Under Review':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Under Review</span>;
      case 'More Information Required':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">More Info Needed</span>;
      case 'Approved':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Approved</span>;
      case 'Item Returned':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-[#0F9D91] border border-teal-200">Returned</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100">{status}</span>;
    }
  };

  return (
    <div className="pb-28 md:pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
            Student Activity Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#70798B]">
            Track your reports, active ownership claims, and AI match status
          </p>
        </div>

        <Link
          to="/report"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#243B8A] hover:bg-[#3559C7] text-white text-xs sm:text-sm font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Report</span>
        </Link>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E7EAF1] card-shadow">
          <span className="text-xs font-semibold text-[#70798B] block">My Lost Reports</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-[#D64545]">{myLostItems.length || 1}</span>
            <span className="text-[11px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-medium">1 Active</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E7EAF1] card-shadow">
          <span className="text-xs font-semibold text-[#70798B] block">My Found Reports</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-[#243B8A]">{myFoundItems.length}</span>
            <span className="text-[11px] text-[#3559C7] bg-[#E8EEFF] px-2 py-0.5 rounded-full font-medium">Logged</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E7EAF1] card-shadow">
          <span className="text-xs font-semibold text-[#70798B] block">Active Claims</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-amber-600">{claims.length}</span>
            <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">Under Review</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E7EAF1] card-shadow">
          <span className="text-xs font-semibold text-[#70798B] block">Potential Matches</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-[#0F9D91]">{activeMatches.length}</span>
            <span className="text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-medium">AI Suggestions</span>
          </div>
        </div>
      </div>

      {/* Suggested Matches Section */}
      {activeMatches.length > 0 && (
        <div className="bg-white rounded-3xl border border-[#E7EAF1] p-5 card-shadow space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-[#172033]">Potential Matches Found</h2>
            </div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              High Confidence
            </span>
          </div>

          <div className="space-y-3">
            {activeMatches.map(m => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/50 to-white border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={m.foundItem.imageUrl}
                    alt={m.foundItem.title}
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-[#E7EAF1]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#172033]">{m.foundItem.title}</span>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-full">
                        {m.similarityScore}% Match Score
                      </span>
                    </div>
                    <p className="text-xs text-[#70798B] mt-1">{m.reason}</p>
                    <span className="text-[11px] text-[#70798B] mt-1 block">
                      Found at: <strong>{m.foundItem.location}</strong>
                    </span>
                  </div>
                </div>

                <Link
                  to={`/item/${m.foundItemId}`}
                  className="px-4 py-2 rounded-xl bg-[#243B8A] hover:bg-[#3559C7] text-white text-xs font-semibold text-center whitespace-nowrap shadow-xs"
                >
                  Inspect & Claim
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs: My Reports vs Active Claims */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E7EAF1] pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`text-xs sm:text-sm font-bold pb-2 relative transition-colors ${
                activeTab === 'all'
                  ? 'text-[#243B8A] border-b-2 border-[#243B8A]'
                  : 'text-[#70798B] hover:text-[#172033]'
              }`}
            >
              All My Reports ({myReports.length})
            </button>
            <button
              onClick={() => setActiveTab('claims')}
              className={`text-xs sm:text-sm font-bold pb-2 relative transition-colors ${
                activeTab === 'claims'
                  ? 'text-[#243B8A] border-b-2 border-[#243B8A]'
                  : 'text-[#70798B] hover:text-[#172033]'
              }`}
            >
              Track Ownership Claims ({claims.length})
            </button>
          </div>
        </div>

        {activeTab !== 'claims' ? (
          /* Reports List */
          <div className="space-y-3">
            {myReports.length > 0 ? (
              myReports.map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-[#E7EAF1] p-4 card-shadow flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-[#E7EAF1]"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <TypeBadge type={item.type} />
                        <StatusBadge status={item.status} />
                      </div>
                      <h4 className="font-bold text-sm text-[#172033]">{item.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-[#70798B] mt-0.5">
                        <span>Ref: {item.referenceNumber}</span>
                        <span>•</span>
                        <span>{item.location}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/item/${item.id}`}
                    className="p-2 rounded-xl text-[#70798B] hover:text-[#243B8A] hover:bg-slate-50 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-white rounded-2xl border border-[#E7EAF1] space-y-2">
                <FolderOpen className="w-10 h-10 text-[#70798B] mx-auto" />
                <p className="text-xs font-semibold text-[#172033]">No items reported yet</p>
                <Link to="/report" className="text-xs text-[#3559C7] font-semibold hover:underline">
                  Submit a lost or found report
                </Link>
              </div>
            )}
          </div>
        ) : (
          /* Claims Tracking List */
          <div className="space-y-3">
            {claims.map(claim => (
              <div
                key={claim.id}
                className="bg-white rounded-2xl border border-[#E7EAF1] p-4 card-shadow space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#243B8A] bg-[#E8EEFF] px-2 py-0.5 rounded-lg">
                      {claim.id}
                    </span>
                    <span className="text-xs text-[#70798B]">{claim.submittedAt}</span>
                  </div>
                  {getClaimStatusBadge(claim.status)}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#172033]">{claim.itemTitle}</h4>
                  <p className="text-xs text-[#70798B] mt-0.5">Location: {claim.itemLocation}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 text-xs text-[#70798B] space-y-1">
                  <span className="font-semibold text-[#172033] block">Provided Verification Evidence:</span>
                  <p className="text-slate-600 line-clamp-2">{claim.proofDetails}</p>
                </div>

                {claim.adminNotes && (
                  <div className="p-2.5 rounded-xl bg-amber-50 text-xs text-amber-900 border border-amber-200/60">
                    <strong>Admin Note:</strong> {claim.adminNotes}
                  </div>
                )}

                {/* Verification Inquiry Chat with Admin */}
                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>Admin Desk Verification Messages</span>
                  </div>

                  {claim.messages && claim.messages.length > 0 ? (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {claim.messages.map((m) => (
                        <div
                          key={m.id}
                          className={`p-2 rounded-lg text-xs max-w-[90%] ${
                            m.sender === 'claimant'
                              ? 'ml-auto bg-blue-600 text-white'
                              : 'mr-auto bg-white text-slate-800 border border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 text-[10px] opacity-75 mb-0.5">
                            <span className="font-semibold">{m.sender === 'claimant' ? 'You' : 'Admin Staff'}</span>
                            <span>{m.timestamp}</span>
                          </div>
                          <p>{m.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">
                      No questions asked by Admin yet. If additional proof is requested, it will appear here.
                    </p>
                  )}

                  {/* Reply Input */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Reply or provide additional details to admin..."
                      value={replyInputs[claim.id] || ''}
                      onChange={(e) => setReplyInputs(prev => ({ ...prev, [claim.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (replyInputs[claim.id] || '').trim()) {
                          addClaimMessage(claim.id, replyInputs[claim.id].trim(), 'claimant');
                          setReplyInputs(prev => ({ ...prev, [claim.id]: '' }));
                        }
                      }}
                      className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if ((replyInputs[claim.id] || '').trim()) {
                          addClaimMessage(claim.id, replyInputs[claim.id].trim(), 'claimant');
                          setReplyInputs(prev => ({ ...prev, [claim.id]: '' }));
                        }
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
