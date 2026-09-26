import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  Building2, 
  BarChart3, 
  Smartphone, 
  MessageSquare, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Sparkles,
  HelpCircle,
  RefreshCw,
  LogOut,
  Briefcase,
  FileBadge,
  AlertCircle
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { ActiveRole, UserProfile } from '../../types';
import { DEFAULT_USER_PROFILES } from '../../data/seedData';
import { signInWithGoogle, signOutUser, updateUserRoleInFirestore } from '../../services/firebase';

interface RoleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  firebaseUser: FirebaseUser | null;
  onSelectRole: (role: ActiveRole, customProfile?: UserProfile) => void;
  onGoogleSignInSuccess?: (user: FirebaseUser, profile: UserProfile) => void;
  onSignOutSuccess?: () => void;
}

export const RoleLoginModal: React.FC<RoleLoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  firebaseUser,
  onSelectRole,
  onGoogleSignInSuccess,
  onSignOutSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'google_auth' | 'quick_roles' | 'gov_sso'>('google_auth');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Contractor details if upgrading/setting up contractor role
  const [contractorFirm, setContractorFirm] = useState('Madurai Infrastructure & PWD Division');
  const [contractorLicense, setContractorLicense] = useState('TN-PWD-2024-8841');
  const [selectedRoleForGoogleUser, setSelectedRoleForGoogleUser] = useState<ActiveRole>('provider');

  // Parichay SSO State
  const [customGovId, setCustomGovId] = useState('TN-IAS-2018-842');
  const [customPassword, setCustomPassword] = useState('••••••••••••');
  const [ssoRole, setSsoRole] = useState<ActiveRole>('policymaker');

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    setAuthSuccess(null);
    try {
      const { user, profile } = await signInWithGoogle();
      setAuthSuccess(`Signed in as ${user.displayName || user.email}!`);
      if (onGoogleSignInSuccess) {
        onGoogleSignInSuccess(user, profile);
      }
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Google Sign-In was cancelled or failed.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      if (onSignOutSuccess) {
        onSignOutSuccess();
      }
      setAuthSuccess('Signed out successfully.');
      setTimeout(() => {
        setAuthSuccess(null);
      }, 2000);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to sign out.');
    }
  };

  const handleApplyRoleForGoogleUser = async (role: ActiveRole) => {
    if (!firebaseUser) {
      handleQuickLogin(role);
      return;
    }

    setIsSigningIn(true);
    try {
      const updatedProfile = await updateUserRoleInFirestore(firebaseUser.uid, role, {
        firmName: role === 'provider' ? contractorFirm : undefined,
        licenseNo: role === 'provider' ? contractorLicense : undefined
      });
      onSelectRole(role, updatedProfile);
      setAuthSuccess(`Active role updated to ${role.toUpperCase()}!`);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to update role in database.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleQuickLogin = (role: ActiveRole) => {
    const targetProfile = DEFAULT_USER_PROFILES[role];
    onSelectRole(role, targetProfile);
    onClose();
  };

  const handleSsoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetProfile = DEFAULT_USER_PROFILES[ssoRole];
    onSelectRole(ssoRole, targetProfile);
    setAuthSuccess(`Authenticated via Gov SSO as ${targetProfile.name}!`);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-7 text-slate-100 space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-600 via-teal-600 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-teal-900/30">
              <div className="h-full w-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-teal-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">Identity &amp; Role-Based Access</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30 font-mono">
                  Google OAuth + DPI Auth
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Authenticate with your real Google account or switch roles for testing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 text-sm font-bold cursor-pointer transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Current Active Session Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3">
            {firebaseUser?.photoURL ? (
              <img 
                src={firebaseUser.photoURL} 
                alt={firebaseUser.displayName || 'User'} 
                className="h-11 w-11 rounded-full border-2 border-teal-500 object-cover"
              />
            ) : (
              <div className="h-11 w-11 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold text-sm">
                {currentUser.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Logged In:</span>
                <span className="font-bold text-white text-sm">{currentUser.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentUser.badgeBg}`}>
                  {currentUser.badgeLabel}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {currentUser.designation} • <span className="text-slate-300 font-mono">{currentUser.department}</span>
              </div>
              {firebaseUser && (
                <div className="text-[10px] text-teal-400 font-mono mt-0.5 flex items-center gap-1">
                  <span>Google UID: {firebaseUser.uid.substring(0, 10)}...</span>
                  <span className="text-slate-500">|</span>
                  <span>{firebaseUser.email}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto justify-end">
            {firebaseUser ? (
              <button
                onClick={handleSignOut}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1.5 cursor-pointer transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            ) : (
              <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
                Demo / Guest Session
              </span>
            )}
          </div>
        </div>

        {/* Notices */}
        {authError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{authError}</span>
          </div>
        )}
        {authSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{authSuccess}</span>
          </div>
        )}

        {/* Tabs: Google OAuth vs 1-Click Role Switch vs Gov SSO */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveTab('google_auth')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'google_auth'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            Real Google OAuth Sign-In
          </button>
          <button
            onClick={() => setActiveTab('quick_roles')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'quick_roles'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            1-Click Demo Switch
          </button>
          <button
            onClick={() => setActiveTab('gov_sso')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'gov_sso'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Gov SSO / Parichay
          </button>
        </div>

        {/* Tab 1: Google OAuth Sign-In */}
        {activeTab === 'google_auth' && (
          <div className="space-y-5">
            {!firebaseUser ? (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/40 border border-slate-800 text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">Sign In with your Google Account</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Authenticate securely to lodge verified grievances, claim municipal contractor work orders, or administer civic infrastructure.
                  </p>
                </div>

                <button
                  onClick={handleGoogleLogin}
                  disabled={isSigningIn}
                  className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl hover:shadow-2xl transition cursor-pointer disabled:opacity-50"
                >
                  {isSigningIn ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-700" />
                      Connecting to Google Auth...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Signed In View: Choose or Link Role */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-teal-300">Google Account Linked:</span> {firebaseUser.displayName} ({firebaseUser.email})
                    <p className="text-slate-300 mt-1">
                      Choose which governance role this Google account operates as. Changes are stored persistently in Firestore.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Citizen Role */}
                  <div 
                    onClick={() => setSelectedRoleForGoogleUser('civilian')}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer text-left ${
                      selectedRoleForGoogleUser === 'civilian'
                        ? 'bg-teal-950/40 border-teal-500/60 ring-2 ring-teal-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-white">Citizen</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Report infrastructure defects, view live status, and upvote neighborhood issues.
                    </p>
                  </div>

                  {/* Contractor Role */}
                  <div 
                    onClick={() => setSelectedRoleForGoogleUser('provider')}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer text-left ${
                      selectedRoleForGoogleUser === 'provider'
                        ? 'bg-amber-950/40 border-amber-500/60 ring-2 ring-amber-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-white">Contractor</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Claim field work orders, change status to In-Progress, and upload photo proof.
                    </p>
                  </div>

                  {/* Admin Role */}
                  <div 
                    onClick={() => setSelectedRoleForGoogleUser('policymaker')}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer text-left ${
                      selectedRoleForGoogleUser === 'policymaker'
                        ? 'bg-blue-950/40 border-blue-500/60 ring-2 ring-blue-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-white">Admin / Magistrate</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Telemetry, Gati Shakti &amp; AMRUT 2.0 Capex, DPR synthesis, and contractor review.
                    </p>
                  </div>
                </div>

                {/* Additional Contractor fields if role is contractor */}
                {selectedRoleForGoogleUser === 'provider' && (
                  <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                      <Briefcase className="w-4 h-4" />
                      <span>Municipal Contractor Licensing Information</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Contractor / Contracting Agency Name:</label>
                        <input
                          type="text"
                          value={contractorFirm}
                          onChange={(e) => setContractorFirm(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Municipal License / Vendor ID:</label>
                        <input
                          type="text"
                          value={contractorLicense}
                          onChange={(e) => setContractorLicense(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-hidden focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleApplyRoleForGoogleUser(selectedRoleForGoogleUser)}
                  disabled={isSigningIn}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-teal-900/40 flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
                >
                  {isSigningIn ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Updating Profile in Database...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Activate {selectedRoleForGoogleUser === 'provider' ? 'Contractor' : selectedRoleForGoogleUser === 'policymaker' ? 'Admin' : 'Citizen'} Role for Google Account
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: 1-Click Role Switch */}
        {activeTab === 'quick_roles' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Switch immediately between the four core governance personas to test permissions and views:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              
              {/* Role 1: Admin / Policymaker */}
              <div 
                onClick={() => handleQuickLogin('policymaker')}
                className={`p-4 rounded-2xl border transition text-left cursor-pointer relative group flex flex-col justify-between ${
                  currentUser.role === 'policymaker'
                    ? 'bg-blue-950/40 border-blue-500/60 ring-2 ring-blue-500/30'
                    : 'bg-slate-950/70 border-slate-800 hover:border-blue-500/40 hover:bg-slate-950'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                        Admin Panel
                      </span>
                    </div>
                    {currentUser.role === 'policymaker' ? (
                      <span className="text-[10px] font-bold text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-blue-400" /> Active Role
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 group-hover:text-blue-400 flex items-center gap-0.5 font-semibold">
                        Switch <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-white text-sm">District Magistrate / Chief Admin</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    Access high-level infrastructure telemetry, data.gov.in metrics, Gati Shakti &amp; AMRUT 2.0 Capex sanctioning, and Cabinet DPR synthesis.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono text-blue-300">Dr. K. Rajesh, IAS</span>
                  <span className="font-medium text-slate-400">Level 4 Executive</span>
                </div>
              </div>

              {/* Role 2: Field Contractor & Municipal Engineer */}
              <div 
                onClick={() => handleQuickLogin('provider')}
                className={`p-4 rounded-2xl border transition text-left cursor-pointer relative group flex flex-col justify-between ${
                  currentUser.role === 'provider'
                    ? 'bg-amber-950/40 border-amber-500/60 ring-2 ring-amber-500/30'
                    : 'bg-slate-950/70 border-slate-800 hover:border-amber-500/40 hover:bg-slate-950'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                        Contractor Portal
                      </span>
                    </div>
                    {currentUser.role === 'provider' ? (
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-amber-400" /> Active Role
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 group-hover:text-amber-400 flex items-center gap-0.5 font-semibold">
                        Switch <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-white text-sm">Executive Engineer / Contractor</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    Dispatch field repair squads, manage work orders, update SLA timers, and upload certified photo resolution evidence.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono text-amber-300">Er. S. Murugesan</span>
                  <span className="font-medium text-slate-400">PWD Hydrology &amp; Works</span>
                </div>
              </div>

              {/* Role 3: Civilian App */}
              <div 
                onClick={() => handleQuickLogin('civilian')}
                className={`p-4 rounded-2xl border transition text-left cursor-pointer relative group flex flex-col justify-between ${
                  currentUser.role === 'civilian'
                    ? 'bg-teal-950/40 border-teal-500/60 ring-2 ring-teal-500/30'
                    : 'bg-slate-950/70 border-slate-800 hover:border-teal-500/40 hover:bg-slate-950'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                        Civilian App
                      </span>
                    </div>
                    {currentUser.role === 'civilian' ? (
                      <span className="text-[10px] font-bold text-teal-300 bg-teal-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-teal-400" /> Active Role
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 group-hover:text-teal-400 flex items-center gap-0.5 font-semibold">
                        Switch <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-white text-sm">Verified Resident / Citizen</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    Explore multi-layered GIS maps, lodge geo-tagged requests with auto-detected local languages, upvote community issues, and dispute faulty fixes.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono text-teal-300">Ananya Sharma</span>
                  <span className="font-medium text-slate-400">Ward 14 Resident</span>
                </div>
              </div>

              {/* Role 4: WhatsApp Gateway */}
              <div 
                onClick={() => handleQuickLogin('whatsapp')}
                className={`p-4 rounded-2xl border transition text-left cursor-pointer relative group flex flex-col justify-between ${
                  currentUser.role === 'whatsapp'
                    ? 'bg-emerald-950/40 border-emerald-500/60 ring-2 ring-emerald-500/30'
                    : 'bg-slate-950/70 border-slate-800 hover:border-emerald-500/40 hover:bg-slate-950'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        WhatsApp Gateway
                      </span>
                    </div>
                    {currentUser.role === 'whatsapp' ? (
                      <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Active Role
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 group-hover:text-emerald-400 flex items-center gap-0.5 font-semibold">
                        Switch <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-white text-sm">WhatsApp Vernacular Bot</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    Simulate WhatsApp messaging for non-tech-savvy rural citizens lodging complaints in Tamil, Hindi, Kannada, Telugu, etc.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono text-emerald-300">Public DPG Service</span>
                  <span className="font-medium text-slate-400">Zero App Store</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 3: Government SSO / Parichay */}
        {activeTab === 'gov_sso' && (
          <form onSubmit={handleSsoSubmit} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-blue-300">National Single Sign-On (Jan Parichay / e-Pramaan):</span>
                <p className="text-blue-200/90 mt-0.5">
                  Allows government officials and contractors to sign in securely using official `.gov.in` / `.nic.in` credentials or DigiLocker e-KYC.
                </p>
              </div>
            </div>

            <div className="space-y-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Designated Government Role / Access Level:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'policymaker', label: 'Admin (Collector)', icon: BarChart3 },
                    { id: 'provider', label: 'Contractor (PWD)', icon: Building2 },
                    { id: 'civilian', label: 'Citizen (e-KYC)', icon: Smartphone },
                    { id: 'whatsapp', label: 'WhatsApp Bot', icon: MessageSquare }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSsoRole(item.id as ActiveRole)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 cursor-pointer transition ${
                        ssoRole === item.id
                          ? 'bg-teal-600 text-white border-teal-400 shadow-md'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Government Employee ID / Aadhaar UID / Parichay Username:
                </label>
                <input
                  type="text"
                  value={customGovId}
                  onChange={(e) => setCustomGovId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-teal-400 font-mono"
                  placeholder="e.g. TN-IAS-2018-842"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Secure Passkey / Digital Token:
                </label>
                <input
                  type="password"
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-teal-400 font-mono"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-teal-900/40 flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <Lock className="w-4 h-4" />
              Authenticate &amp; Open {ssoRole === 'policymaker' ? 'Admin Panel' : ssoRole === 'provider' ? 'Contractor Portal' : 'Citizen App'}
            </button>
          </form>
        )}

        {/* Informational Footer */}
        <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Role-Based Permissions Breakdown</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <strong className="text-teal-300 block mb-0.5">1. Citizen:</strong>
              Browse GIS map, submit geotagged issues, upvote, track live progress.
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <strong className="text-amber-300 block mb-0.5">2. Contractor (Login Req.):</strong>
              Claim work orders, change status to In Progress, submit completion proof photos.
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <strong className="text-blue-300 block mb-0.5">3. Admin (Magistrate):</strong>
              Full access to district telemetry, Capex sanctioning, DPR synthesis, and audit log.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
