import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Moon,
  Sun,
  Laptop,
  Bell,
  Shield,
  LogOut,
  Mail,
  KeyRound,
  CheckCircle2,
  Lock,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProfilePage: React.FC = () => {
  const { user, activeRole, toggleRole, logout, isAuthenticated } = useApp();
  const navigate = useNavigate();

  // Settings states
  const [pushNotifs, setPushNotifs] = useState(true);
  const [matchAlerts, setMatchAlerts] = useState(true);
  const [claimUpdates, setClaimUpdates] = useState(true);
  const [securityPin, setSecurityPin] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggle = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(prev => !prev);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="pb-28 md:pb-16 max-w-2xl mx-auto px-4 sm:px-6 pt-4 space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-[#E7EAF1] p-5 sm:p-6 card-shadow flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
        <div className="relative">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-[#E8EEFF]"
          />
          <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#0F9D91] border-2 border-white flex items-center justify-center text-white text-[10px]">
            ✓
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#172033]">{user.name}</h2>
              <p className="text-xs text-[#70798B]">{user.department}</p>
            </div>
            <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E8EEFF] text-[#243B8A] w-fit mx-auto sm:mx-0">
              Student ID: {user.studentId}
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-[#E7EAF1] flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[#70798B]">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#3559C7]" />
              <span>{user.email}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0F9D91]" />
              <span>Verified Student Account</span>
            </span>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Preference setting updated!</span>
        </div>
      )}

      {/* Role Switcher Demo Box */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-4 card-shadow flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
            Prototype Evaluation Control
          </span>
          <h4 className="text-sm font-bold text-[#172033] mt-0.5">Switch Application Perspective</h4>
          <p className="text-xs text-[#70798B]">
            Currently previewing as: <strong>{activeRole === 'admin' ? 'College Admin Desk' : 'Student (Alex)'}</strong>
          </p>
        </div>
        <button
          onClick={toggleRole}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition-colors flex-shrink-0"
        >
          Switch to {activeRole === 'student' ? 'Admin' : 'Student'}
        </button>
      </div>

      {/* Settings Sections (Inspired by Ref 2) */}
      <div className="space-y-4">
        {/* Appearance Section */}
        <div className="bg-white rounded-3xl border border-[#E7EAF1] p-5 card-shadow space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#70798B]">
            Appearance
          </span>

          <div className="space-y-1">
            <button
              onClick={() => setTheme('light')}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-[#172033]">Light Mode</span>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                theme === 'light' ? 'border-[#243B8A] bg-[#243B8A]' : 'border-[#E7EAF1]'
              }`}>
                {theme === 'light' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Moon className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-semibold text-[#172033]">Dark Mode (Campus Night)</span>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                theme === 'dark' ? 'border-[#243B8A] bg-[#243B8A]' : 'border-[#E7EAF1]'
              }`}>
                {theme === 'dark' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </button>

            <button
              onClick={() => setTheme('system')}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Laptop className="w-4 h-4 text-[#70798B]" />
                <span className="text-xs font-semibold text-[#172033]">System Default</span>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                theme === 'system' ? 'border-[#243B8A] bg-[#243B8A]' : 'border-[#E7EAF1]'
              }`}>
                {theme === 'system' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </button>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-3xl border border-[#E7EAF1] p-5 card-shadow space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#70798B]">
            Notifications
          </span>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-[#3559C7]" />
                <div>
                  <h5 className="text-xs font-semibold text-[#172033]">Push Notifications</h5>
                  <p className="text-[11px] text-[#70798B]">Instant updates on phone / laptop browser</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle(setPushNotifs)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  pushNotifs ? 'bg-[#243B8A]' : 'bg-[#E7EAF1]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  pushNotifs ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold">
                  ★
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-[#172033]">AI Match Alerts</h5>
                  <p className="text-[11px] text-[#70798B]">Alert when a found item matches your description</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle(setMatchAlerts)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  matchAlerts ? 'bg-[#243B8A]' : 'bg-[#E7EAF1]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  matchAlerts ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-[#0F9D91]" />
                <div>
                  <h5 className="text-xs font-semibold text-[#172033]">Claim Handover Updates</h5>
                  <p className="text-[11px] text-[#70798B]">Receive verification progress and ready-for-pickup notice</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle(setClaimUpdates)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  claimUpdates ? 'bg-[#243B8A]' : 'bg-[#E7EAF1]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  claimUpdates ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Privacy & Security Section */}
        <div className="bg-white rounded-3xl border border-[#E7EAF1] p-5 card-shadow space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#70798B]">
            Privacy & Security
          </span>

          <div className="space-y-1">
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-[#70798B]" />
                <div>
                  <h5 className="text-xs font-semibold text-[#172033]">Campus Privacy Policy</h5>
                  <p className="text-[11px] text-[#70798B]">Student data restricted according to college regulations</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#70798B]" />
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl text-[#D64545] hover:bg-rose-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4" />
                <span className="text-xs font-semibold">{isAuthenticated ? 'Sign Out from Session' : 'Go to Sign In Page'}</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
