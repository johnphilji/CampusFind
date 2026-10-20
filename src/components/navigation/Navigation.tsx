import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Plus, Activity, User, ShieldCheck, Bell } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BottomNav: React.FC = () => {
  const { unreadCount } = useApp();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E7EAF1] bottom-nav-shadow px-3 pb-[env(safe-area-inset-bottom,8px)] pt-2">
      <div className="flex items-center justify-around max-w-lg mx-auto relative">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
              isActive ? 'text-[#243B8A] font-semibold' : 'text-[#70798B] hover:text-[#172033]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`p-1 rounded-lg ${isActive ? 'bg-[#E8EEFF]' : ''}`}>
                <Home className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">Home</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/explore"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
              isActive ? 'text-[#243B8A] font-semibold' : 'text-[#70798B] hover:text-[#172033]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`p-1 rounded-lg ${isActive ? 'bg-[#E8EEFF]' : ''}`}>
                <Compass className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">Explore</span>
            </>
          )}
        </NavLink>

        {/* Center Prominent Report Button */}
        <NavLink
          to="/report"
          className="relative -top-4 flex flex-col items-center group focus:outline-none"
          aria-label="Report lost or found item"
        >
          <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#243B8A] to-[#3559C7] text-white flex items-center justify-center shadow-lg shadow-[#3559C7]/35 border-4 border-white group-active:scale-95 transition-transform">
            <Plus className="w-6 h-6 stroke-[2.8]" />
          </div>
          <span className="text-[11px] font-semibold text-[#243B8A] mt-0.5">Report</span>
        </NavLink>

        <NavLink
          to="/activity"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors relative ${
              isActive ? 'text-[#243B8A] font-semibold' : 'text-[#70798B] hover:text-[#172033]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`p-1 rounded-lg relative ${isActive ? 'bg-[#E8EEFF]' : ''}`}>
                <Activity className="w-5 h-5 stroke-[2.2]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#D64545] ring-2 ring-white"></span>
                )}
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">Activity</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
              isActive ? 'text-[#243B8A] font-semibold' : 'text-[#70798B] hover:text-[#172033]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`p-1 rounded-lg ${isActive ? 'bg-[#E8EEFF]' : ''}`}>
                <User className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">Profile</span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
};

export const DesktopHeader: React.FC = () => {
  const { user, activeRole, toggleRole, unreadCount } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E7EAF1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#243B8A] text-white flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="m10 15 5-3-5-3v6Z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-[#243B8A]">CampusFind</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#E8EEFF] text-[#243B8A]">
                  College Ops
                </span>
              </div>
              <p className="text-[10px] text-[#70798B] hidden sm:block">Campus-Wide Lost & Found</p>
            </div>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-[#E8EEFF] text-[#243B8A]' : 'text-[#70798B] hover:text-[#172033] hover:bg-slate-100'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/explore"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-[#E8EEFF] text-[#243B8A]' : 'text-[#70798B] hover:text-[#172033] hover:bg-slate-100'
                }`
              }
            >
              Explore Items
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-[#E8EEFF] text-[#243B8A]' : 'text-[#70798B] hover:text-[#172033] hover:bg-slate-100'
                }`
              }
            >
              My Dashboard
            </NavLink>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-amber-50 text-amber-900 font-semibold' : 'text-[#70798B] hover:text-[#172033] hover:bg-slate-100'
                }`
              }
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Admin Hub</span>
            </NavLink>
          </nav>
        </div>

        {/* Right Action Items */}
        <div className="flex items-center gap-3">
          {/* Quick Role Switcher Pill */}
          <button
            onClick={toggleRole}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
              activeRole === 'admin'
                ? 'bg-amber-100/70 border-amber-300 text-amber-900'
                : 'bg-slate-100 border-[#E7EAF1] text-[#70798B] hover:bg-slate-200'
            }`}
            title="Toggle between Student and Admin perspective for demo"
          >
            <span className={`w-2 h-2 rounded-full ${activeRole === 'admin' ? 'bg-amber-600' : 'bg-[#0F9D91]'}`} />
            <span>View as: {activeRole === 'admin' ? 'Admin Officer' : 'Student'}</span>
          </button>

          <NavLink
            to="/report"
            className="hidden sm:inline-flex items-center gap-1.5 bg-[#243B8A] hover:bg-[#3559C7] text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Report Item</span>
          </NavLink>

          {/* Activity / Notification Bell */}
          <NavLink
            to="/activity"
            className="relative p-2 rounded-xl text-[#70798B] hover:text-[#172033] hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 stroke-[2]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#D64545] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </NavLink>

          {/* Profile pill */}
          <NavLink
            to="/profile"
            className="flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-slate-100 transition-colors border border-[#E7EAF1]"
          >
            <span className="text-xs font-semibold text-[#172033] hidden lg:block">
              {user.name.split(' ')[0]}
            </span>
            <img
              src={user.avatar}
              alt={user.name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-[#3559C7]/20"
            />
          </NavLink>
        </div>
      </div>
    </header>
  );
};
