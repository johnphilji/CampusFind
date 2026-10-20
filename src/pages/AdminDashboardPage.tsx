import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  FileText,
  AlertTriangle,
  QrCode,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge, TypeBadge } from '../components/cards/Badges';

export const AdminDashboardPage: React.FC = () => {
  const { items, claims, updateClaimStatus, updateItemStatus } = useApp();
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [adminNotesInput, setAdminNotesInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'claims' | 'reports'>('claims');

  const selectedClaim = claims.find(c => c.id === selectedClaimId);

  const pendingClaims = claims.filter(c => c.status === 'Submitted' || c.status === 'Under Review');
  const resolvedItems = items.filter(i => i.status === 'resolved');

  const handleApproveClaim = (claimId: string) => {
    updateClaimStatus(claimId, 'Approved', 'Verification confirmed against student college record. Authorized for collection at desk.');
    setSelectedClaimId(null);
  };

  const handleHandoverComplete = (claimId: string) => {
    updateClaimStatus(claimId, 'Item Returned', 'Physical item handed over to verified student. Physical receipt signed.');
    setSelectedClaimId(null);
  };

  const handleRejectClaim = (claimId: string) => {
    const reason = prompt('Please specify reason for rejection (e.g. proof does not match physical item):');
    if (reason) {
      updateClaimStatus(claimId, 'Rejected', reason);
      setSelectedClaimId(null);
    }
  };

  return (
    <div className="pb-28 md:pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-amber-500/10 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-700 flex-shrink-0" />
          <span>
            <strong>Official Administrator Portal:</strong> Authorized for Security Staff and Student Affairs Office. Handover audits are logged.
          </span>
        </div>
        <span className="font-mono text-[11px] bg-white px-2.5 py-1 rounded-lg border border-amber-200 self-start sm:self-auto">
          Role: Admin Security Desk
        </span>
      </div>

      {/* Admin Stat Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E7EAF1] card-shadow">
          <span className="text-xs font-semibold text-[#70798B] block">Total Campus Reports</span>
          <p className="text-2xl font-black text-[#172033] mt-1">{items.length}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E7EAF1] card-shadow">
          <span className="text-xs font-semibold text-[#70798B] block">Pending Verification</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{pendingClaims.length}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E7EAF1] card-shadow">
          <span className="text-xs font-semibold text-[#70798B] block">Successful Handovers</span>
          <p className="text-2xl font-black text-[#0F9D91] mt-1">{resolvedItems.length}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E7EAF1] card-shadow">
          <span className="text-xs font-semibold text-[#70798B] block">Active Lost Reports</span>
          <p className="text-2xl font-black text-[#D64545] mt-1">{items.filter(i => i.type === 'lost' && i.status === 'open').length}</p>
        </div>
      </div>

      {/* Navigation sub-tabs */}
      <div className="flex items-center gap-2 border-b border-[#E7EAF1] pb-2">
        <button
          onClick={() => setActiveTab('claims')}
          className={`text-xs sm:text-sm font-bold pb-2 border-b-2 transition-all ${
            activeTab === 'claims'
              ? 'text-[#243B8A] border-[#243B8A]'
              : 'border-transparent text-[#70798B] hover:text-[#172033]'
          }`}
        >
          Ownership Claims Review ({claims.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`text-xs sm:text-sm font-bold pb-2 border-b-2 transition-all ${
            activeTab === 'reports'
              ? 'text-[#243B8A] border-[#243B8A]'
              : 'border-transparent text-[#70798B] hover:text-[#172033]'
          }`}
        >
          All Cataloged Reports ({items.length})
        </button>
      </div>

      {/* CLAIMS REVIEW TAB */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#70798B]">
            <span>Manage ownership claims submitted by students</span>
            <span className="text-amber-700 font-semibold">{pendingClaims.length} require action</span>
          </div>

          <div className="space-y-3">
            {claims.map(claim => (
              <div
                key={claim.id}
                className="bg-white rounded-2xl border border-[#E7EAF1] p-4 sm:p-5 card-shadow space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E7EAF1]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#243B8A] bg-[#E8EEFF] px-2.5 py-0.5 rounded-lg">
                      {claim.id}
                    </span>
                    <span className="text-xs font-bold text-[#172033]">{claim.itemTitle}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#70798B]">{claim.submittedAt}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      claim.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                      claim.status === 'Item Returned' ? 'bg-teal-100 text-[#0F9D91]' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {claim.status}
                    </span>
                  </div>
                </div>

                {/* Claimant Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[#70798B] block">Claimant Student:</span>
                    <strong className="text-[#172033]">{claim.claimantName}</strong>
                  </div>
                  <div>
                    <span className="text-[#70798B] block">Student Roll / ID:</span>
                    <strong className="text-[#172033]">{claim.claimantId}</strong>
                  </div>
                  <div>
                    <span className="text-[#70798B] block">College Email:</span>
                    <strong className="text-[#172033]">{claim.claimantEmail}</strong>
                  </div>
                </div>

                {/* Evidence Details provided privately */}
                <div className="p-3 bg-slate-50 rounded-xl border border-[#E7EAF1] text-xs">
                  <span className="font-bold text-[#172033] block mb-1">
                    Submitted Identifying Proof / Evidence:
                  </span>
                  <p className="text-slate-700 italic font-mono bg-white p-2 rounded-lg border border-[#E7EAF1]">
                    "{claim.proofDetails}"
                  </p>
                </div>

                {/* Action Controls */}
                <div className="pt-2 flex flex-wrap items-center justify-end gap-2 text-xs font-semibold">
                  <Link
                    to={`/item/${claim.itemId}`}
                    className="px-3 py-1.5 rounded-xl border border-[#E7EAF1] text-[#70798B] hover:text-[#172033] hover:bg-slate-50 inline-flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Item Record</span>
                  </Link>

                  {claim.status === 'Submitted' || claim.status === 'Under Review' ? (
                    <>
                      <button
                        onClick={() => handleRejectClaim(claim.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 text-[#D64545] border border-rose-200 hover:bg-rose-100"
                      >
                        Reject Claim
                      </button>
                      <button
                        onClick={() => handleApproveClaim(claim.id)}
                        className="px-3 py-1.5 rounded-xl bg-[#243B8A] text-white hover:bg-[#3559C7] shadow-xs"
                      >
                        Approve for Pickup
                      </button>
                    </>
                  ) : null}

                  {claim.status === 'Approved' ? (
                    <button
                      onClick={() => handleHandoverComplete(claim.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0F9D91] hover:bg-[#0c7c72] text-white shadow-xs inline-flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm Physical Handover</span>
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ALL CATALOGED REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E7EAF1] p-3 card-shadow">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#70798B]" />
              <input
                type="text"
                placeholder="Filter reports by keyword, reference, student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 border border-[#E7EAF1] focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#E7EAF1] overflow-hidden card-shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F6F7FB] border-b border-[#E7EAF1] text-[#70798B] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Ref Number</th>
                    <th className="py-3 px-4">Item Details</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7EAF1]">
                  {items
                    .filter(i =>
                      !searchTerm ||
                      i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      i.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      i.location.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#243B8A]">
                          {item.referenceNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <img
                              src={item.imageUrl}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-[#E7EAF1]"
                            />
                            <div>
                              <strong className="text-[#172033] block truncate max-w-xs">{item.title}</strong>
                              <span className="text-[11px] text-[#70798B]">{item.category}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <TypeBadge type={item.type} />
                        </td>
                        <td className="py-3 px-4 text-[#70798B]">
                          {item.location}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <Link
                              to={`/item/${item.id}`}
                              className="p-1 rounded text-[#70798B] hover:text-[#243B8A]"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            {item.status !== 'resolved' ? (
                              <button
                                onClick={() => updateItemStatus(item.id, 'resolved')}
                                className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              >
                                Mark Returned
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
