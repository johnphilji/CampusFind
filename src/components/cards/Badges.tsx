import React from 'react';
import { ItemStatus, ItemType, SecurityLevel } from '../../types';
import { ShieldCheck, Lock, AlertTriangle, Clock } from 'lucide-react';

export const StatusBadge: React.FC<{ status: ItemStatus; className?: string }> = ({ status, className = '' }) => {
  switch (status) {
    case 'open':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Available to Claim
        </span>
      );
    case 'under_review':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Verification in Progress
        </span>
      );
    case 'claimed':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Approved / Ready for Pickup
        </span>
      );
    case 'resolved':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 ${className}`}>
          <ShieldCheck className="w-3 h-3 text-slate-500" />
          Handover Confirmed
        </span>
      );
    case 'police_custody':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 ${className}`}>
          <Lock className="w-3 h-3 text-purple-500" />
          Campus Police Custody
        </span>
      );
    case 'disposed':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200 ${className}`}>
          Disposed (Perishable)
        </span>
      );
    default:
      return null;
  }
};

export const TypeBadge: React.FC<{ type: ItemType; className?: string }> = ({ type, className = '' }) => {
  if (type === 'lost') {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 ${className}`}>
        Lost Report
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-800 border border-sky-200 ${className}`}>
      Found in Campus
    </span>
  );
};

export const SecurityBadge: React.FC<{ level?: SecurityLevel; className?: string }> = ({ level, className = '' }) => {
  if (level === 'valuable_secure') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 ${className}`} title="Stored in dual-custody safe at Campus Security HQ">
        <Lock className="w-2.5 h-2.5 text-amber-600" />
        High Value Safe
      </span>
    );
  }
  if (level === 'perishable') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-orange-50 text-orange-800 border border-orange-200 ${className}`} title="48h hygiene disposal rule">
        <Clock className="w-2.5 h-2.5 text-orange-600" />
        48h Perishable
      </span>
    );
  }
  return null;
};
