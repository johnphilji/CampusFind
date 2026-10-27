import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Compass, Plus, Activity, User, ShieldCheck, Bell, LogIn, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BottomNav: React.FC = () => {
  const { unreadCount, isAuthenticated } = useApp();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 bottom-nav-shadow px-2 pb-[env(safe-area-inset-bottom,8px)] pt-1.5">
      <div className="flex items-center justify-around max-w-lg mx-auto relative">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-[#1E3A8A] font-bold' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-[#1E3A8A]' : ''}`}>
                <Home className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/explore"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-[#1E3A8A] font-bold' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-[#1E3A8A]' : ''}`}>
                <Compass className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">Explore</span>
            </>
          )}
        </NavLink>

        {/* Center Prominent Report Button */}
        <NavLink
          to="/report"
          className="relative -top-4 flex flex-col items-center group focus:outline-none"
          aria-label="Report lost or found item"
        >
          <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#1E3A8A] to-[#0284C7] text-white flex items-center justify-center shadow-lg shadow-[#0284C7]/25 border-4 border-white group-active:scale-95 transition-transform">
            <Plus className="w-6 h-6 stroke-[2.8]" />
          </div>
          <span className="text-[10px] font-bold text-[#1E3A8A] mt-0.5">Report</span>
        </NavLink>

        <NavLink
          to="/activity"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
              isActive ? 'text-[#1E3A8A] font-bold' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`p-1 rounded-lg relative transition-colors ${isActive ? 'bg-blue-50 text-[#1E3A8A]' : ''}`}>
                <Activity className="w-5 h-5 stroke-[2.2]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">Activity</span>
            </>
          )}
        </NavLink>

        <NavLink
          to={isAuthenticated ? "/profile" : "/login"}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-[#1E3A8A] font-bold' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-[#1E3A8A]' : ''}`}>
                {isAuthenticated ? <User className="w-5 h-5 stroke-[2.2]" /> : <LogIn className="w-5 h-5 stroke-[2.2]" />}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{isAuthenticated ? "Profile" : "Sign In"}</span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
};

export const DesktopHeader: React.FC = () => {
  const { user, activeRole, toggleRole, unreadCount, isAuthenticated, logout } = useApp();
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1E3A8A] to-[#0284C7] text-white flex items-center justify-center shadow-md shadow-[#1E3A8A]/15">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="m10 15 5-3-5-3v6Z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-[#1E3A8A]">CampusFind</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-[#1E3A8A] border border-blue-200/60">
                  Operations
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block">Institutional Lost & Found Repository</p>
            </div>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive ? 'bg-blue-50 text-[#1E3A8A]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/explore"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive ? 'bg-blue-50 text-[#1E3A8A]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              Browse Listings
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive ? 'bg-blue-50 text-[#1E3A8A]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              My Claims & Items
            </NavLink>
            {(user.role === 'admin' || user.role === 'security_staff' || activeRole === 'admin') && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive ? 'bg-amber-50 text-amber-900 border border-amber-200/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Security Desk</span>
              </NavLink>
            )}
          </nav>
        </div>

        {/* Right Action Items */}
        <div className="flex items-center gap-2.5">
          {/* Quick Role Switcher Pill - only visible if staff or admin */}
          {isAuthenticated && (user.role === 'admin' || user.role === 'security_staff') && (
            <button
              onClick={toggleRole}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                activeRole === 'admin'
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title="Toggle role perspective"
            >
              <span className={`w-2 h-2 rounded-full ${activeRole === 'admin' ? 'bg-amber-600' : 'bg-emerald-500'}`} />
              <span>{activeRole === 'admin' ? 'Campus Admin' : 'Staff Mode'}</span>
            </button>
          )}

          <NavLink
            to="/report"
            className="hidden sm:inline-flex items-center gap-1.5 bg-[#1E3A8A] hover:bg-[#172554] text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Turn In / Report Item</span>
          </NavLink>

          {/* Activity Bell */}
          <NavLink
            to="/activity"
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 stroke-[2]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </NavLink>

          {/* Auth State Button */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-1.5">
              <NavLink
                to="/profile"
                className="flex items-center gap-2 p-1 pl-2.5 rounded-full hover:bg-slate-100 transition-colors border border-slate-200"
              >
                <span className="text-xs font-semibold text-slate-800 hidden lg:block">
                  {user.name.split(' ')[0]}
                </span>
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-300"
                />
              </NavLink>

              <button
                onClick={handleLogoutClick}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border border-slate-200"
            >
              <LogIn className="w-4 h-4 text-[#1E3A8A]" />
              <span>Sign In</span>
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
};
