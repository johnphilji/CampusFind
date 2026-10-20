import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Sparkles,
  ShieldCheck,
  CheckCheck,
  QrCode,
  FileText,
  Clock,
  ArrowRight,
  Inbox
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ActivityPage: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead, unreadCount } = useApp();
  const [filterType, setFilterType] = useState<'all' | 'unread'>('all');

  const displayedNotifications = notifications.filter(n =>
    filterType === 'all' ? true : !n.read
  );

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'match':
        return (
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
        );
      case 'claim':
        return (
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#3559C7] flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        );
      case 'report':
        return (
          <div className="w-10 h-10 rounded-2xl bg-teal-100 text-[#0F9D91] flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-[#70798B] flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="pb-28 md:pb-16 max-w-2xl mx-auto px-4 sm:px-6 pt-4 space-y-6">
      {/* Header (Inspired by Ref 2) */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
              Activity & Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#D64545] text-white">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-xs text-[#70798B]">
            Real-time updates on your lost and found claims and match events
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#3559C7] hover:text-[#243B8A]"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Filter Segment */}
      <div className="flex items-center gap-2 p-1 bg-[#E7EAF1]/70 rounded-2xl w-fit">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
            filterType === 'all'
              ? 'bg-white text-[#243B8A] shadow-xs'
              : 'text-[#70798B] hover:text-[#172033]'
          }`}
        >
          All Updates ({notifications.length})
        </button>
        <button
          onClick={() => setFilterType('unread')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
            filterType === 'unread'
              ? 'bg-white text-[#243B8A] shadow-xs'
              : 'text-[#70798B] hover:text-[#172033]'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List (Matching Ref 2 aesthetics) */}
      <div className="space-y-3">
        {displayedNotifications.length > 0 ? (
          displayedNotifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => markNotificationRead(notif.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer card-shadow flex gap-3.5 items-start relative ${
                notif.read
                  ? 'bg-white border-[#E7EAF1] opacity-90'
                  : 'bg-white border-[#3559C7]/30 ring-1 ring-[#3559C7]/15'
              }`}
            >
              {getNotifIcon(notif.type)}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-[#172033] truncate">
                    {notif.title}
                  </h4>
                  <span className="text-[11px] text-[#70798B] flex-shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {notif.timestamp}
                  </span>
                </div>

                <p className="text-xs text-[#70798B] mt-1 leading-relaxed">
                  {notif.message}
                </p>

                {notif.targetId && (
                  <div className="mt-2.5">
                    <Link
                      to={`/item/${notif.targetId}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#3559C7] hover:text-[#243B8A]"
                    >
                      <span>View details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>

              {!notif.read && (
                <span className="w-2 h-2 rounded-full bg-[#3559C7] absolute top-4 right-3" />
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl border border-[#E7EAF1] p-10 text-center card-shadow max-w-sm mx-auto space-y-2">
            <Inbox className="w-10 h-10 text-[#70798B] mx-auto" />
            <h3 className="font-bold text-sm text-[#172033]">No updates right now</h3>
            <p className="text-xs text-[#70798B]">
              You're all caught up with your campus notifications.
            </p>
          </div>
        )}
      </div>

      {/* AWS & SNS readiness info note */}
      <div className="p-3.5 rounded-2xl bg-slate-100 border border-[#E7EAF1] text-xs text-[#70798B] flex items-center justify-between">
        <span>Email notification alerts ready to dispatch via Amazon SNS integration.</span>
        <span className="font-semibold text-[#243B8A]">AWS Ready</span>
      </div>
    </div>
  );
};
