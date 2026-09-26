import React from 'react';
import { 
  Shield, 
  Smartphone, 
  BarChart3, 
  MessageSquare, 
  Sparkles, 
  Building2, 
  Flame,
  Sun,
  Moon,
  ChevronDown,
  Lock,
  LogOut,
  UserCheck
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { ActiveRole, AppTheme, UserProfile } from '../../types';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activeRole: ActiveRole;
  setActiveRole: (role: ActiveRole) => void;
  pendingGrievancesCount: number;
  activeWeatherAlertsCount: number;
  theme: AppTheme;
  onToggleTheme: () => void;
  currentUser: UserProfile;
  firebaseUser: FirebaseUser | null;
  onOpenRoleLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeRole,
  setActiveRole,
  pendingGrievancesCount,
  activeWeatherAlertsCount,
  theme,
  onToggleTheme,
  currentUser,
  firebaseUser,
  onOpenRoleLogin
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md transition-colors duration-200">
      {/* Hackathon Crest Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-emerald-950 px-4 py-1.5 border-b border-slate-800/80 text-[11px] text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold text-white">Google Build with AI: Code for Communities (2nd Edition)</span>
          <span className="text-slate-500">•</span>
          <span className="text-amber-300 font-medium">Team AIQubix</span>
          <span className="text-slate-500">•</span>
          <span className="text-cyan-300">Theme: DPI &amp; Governance (data.gov.in)</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          {activeWeatherAlertsCount > 0 && (
            <span className="flex items-center gap-1 text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 text-[10px]">
              <Flame className="w-3 h-3 text-amber-400 animate-bounce" />
              {activeWeatherAlertsCount} Predictive Weather Hazard Alerts Active
            </span>
          )}
          {/* Direct link to Admin Panel */}
          <button
            onClick={() => setActiveRole('policymaker')}
            className="text-[10px] font-bold text-blue-300 hover:text-white bg-blue-500/15 hover:bg-blue-500/25 px-2 py-0.5 rounded border border-blue-500/30 flex items-center gap-1 cursor-pointer transition"
          >
            <BarChart3 className="w-3 h-3" />
            Admin Panel Quick Access
          </button>
        </div>
      </div>

      {/* Main App Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Logo & Identity */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-teal-600 to-emerald-500 p-0.5 shadow-lg shadow-teal-900/30">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <Shield className="w-5 h-5 text-teal-400" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-amber-500 ring-2 ring-slate-950 flex items-center justify-center">
              <Sparkles className="w-2 h-2 text-slate-950 font-bold" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                CivicPulse <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-amber-400">AI</span>
              </h1>
              <span className="hidden md:inline-block rounded-md bg-teal-500/15 border border-teal-500/30 px-1.5 py-0.5 text-[10px] font-semibold text-teal-300">
                सिविकपल्स एआई
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              AI for Digital Public Infrastructure &amp; Governance by <span className="text-slate-200 font-semibold">AIQubix</span>
            </p>
          </div>
        </div>

        {/* Persona Mode Switcher */}
        <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 shadow-inner overflow-x-auto">
          <button
            onClick={() => setActiveRole('civilian')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer ${
              activeRole === 'civilian'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-900/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Civilian Citizen Portal (Zero Barrier)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Citizen</span> App
          </button>

          <button
            onClick={() => setActiveRole('whatsapp')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer ${
              activeRole === 'whatsapp'
                ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md shadow-emerald-900/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="WhatsApp Vernacular Gateway"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">WhatsApp</span> Bot
          </button>

          <button
            onClick={() => setActiveRole('provider')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer ${
              activeRole === 'provider'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold shadow-md shadow-amber-900/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Field Municipal Contractor Portal (Login Required)"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Contractor</span> Portal
          </button>

          {/* Admin Panel Tab */}
          <button
            onClick={() => setActiveRole('policymaker')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
              activeRole === 'policymaker'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/40 ring-1 ring-blue-400/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Admin Panel: District Magistrate & Policy Command Center"
          >
            <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold">Admin Panel</span>
            {pendingGrievancesCount > 0 && (
              <span className="ml-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-950">
                {pendingGrievancesCount}
              </span>
            )}
          </button>
        </div>

        {/* Right Actions: Dual Theme Toggle + Role-Based Login Button + PWA */}
        <div className="flex items-center gap-2">
          
          {/* Dual Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
              theme === 'dark'
                ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-amber-300'
                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800 shadow-sm'
            }`}
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle Light and Dark Theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                <span className="hidden md:inline text-[11px] font-medium text-slate-200">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="hidden md:inline text-[11px] font-medium text-slate-700">Dark Mode</span>
              </>
            )}
          </button>

          {/* Role-Based / Google Login Button */}
          <button
            onClick={onOpenRoleLogin}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition shadow-sm group"
            title="Google OAuth & Role-Based Access Control"
          >
            <div className="relative">
              {firebaseUser?.photoURL ? (
                <img 
                  src={firebaseUser.photoURL} 
                  alt={firebaseUser.displayName || 'User'} 
                  className="h-6 w-6 rounded-full object-cover ring-1 ring-teal-400"
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center text-[11px] font-bold text-white shadow-xs">
                  {currentUser.name.charAt(0)}
                </div>
              )}
              <span className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ${firebaseUser ? 'bg-emerald-400' : 'bg-amber-400'} ring-1 ring-slate-900`} />
            </div>
            <div className="text-left hidden lg:block leading-tight">
              <div className="text-[11px] font-bold text-white group-hover:text-teal-300 flex items-center gap-1">
                <span>{currentUser.name.split(',')[0]}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <div className="text-[9px] text-slate-400 font-mono">
                {currentUser.badgeLabel}
              </div>
            </div>
            <div className="lg:hidden flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-[10px] font-bold">{firebaseUser ? 'Account' : 'Login'}</span>
            </div>
          </button>

          {/* PWA Install Action */}
          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
