import React from 'react';
import { ItemStatus, ItemType } from '../../types';

export const StatusBadge: React.FC<{ status: ItemStatus; className?: string }> = ({ status, className = '' }) => {
  switch (status) {
    case 'open':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Active
        </span>
      );
    case 'under_review':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Under Review
        </span>
      );
    case 'claimed':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Claim Pending
        </span>
      );
    case 'resolved':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-[#0F9D91] border border-teal-200/60 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#0F9D91]" />
          Resolved / Returned
        </span>
      );
    default:
      return null;
  }
};

export const TypeBadge: React.FC<{ type: ItemType; className?: string }> = ({ type, className = '' }) => {
  if (type === 'lost') {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-[#D64545] border border-rose-200/70 ${className}`}>
        Lost Item
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#E8EEFF] text-[#243B8A] border border-[#3559C7]/20 ${className}`}>
      Found Item
    </span>
  );
};
