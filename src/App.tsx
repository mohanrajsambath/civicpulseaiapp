import React, { useState, useEffect } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { 
  Grievance, 
  ActiveRole, 
  DistrictMetric, 
  WeatherAlert, 
  ProjectRecommendation,
  GrievanceStatus,
  AppTheme,
  UserProfile
} from './types';
import { 
  DISTRICT_METRICS, 
  INITIAL_GRIEVANCES, 
  INITIAL_PROJECT_RECOMMENDATIONS, 
  WEATHER_ALERTS,
  DEFAULT_USER_PROFILES
} from './data/seedData';
import { 
  auth, 
  testFirestoreConnection, 
  subscribeToGrievances, 
  saveGrievanceToFirestore, 
  updateGrievanceInFirestore 
} from './services/firebase';
import { Header } from './components/common/Header';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { CivilianView } from './components/civilian/CivilianView';
import { WhatsAppBotSimulator } from './components/whatsapp/WhatsAppBotSimulator';
import { ProviderResolutionPortal } from './components/provider/ProviderResolutionPortal';
import { PolicymakerCommandCenter } from './components/admin/PolicymakerCommandCenter';
import { GrievanceProgressStepper } from './components/common/GrievanceProgressStepper';
import { RoleLoginModal } from './components/common/RoleLoginModal';
import { 
  MapPin, 
  AlertTriangle, 
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  ThumbsUp,
  MessageSquare,
  Flame,
  Send,
  Lock,
  Building2
} from 'lucide-react';

export default function App() {
  const [activeRole, setActiveRole] = useState<ActiveRole>('civilian');
  const [grievances, setGrievances] = useState<Grievance[]>(INITIAL_GRIEVANCES);
  const [districtMetrics] = useState<DistrictMetric[]>(DISTRICT_METRICS);
  const [weatherAlerts] = useState<WeatherAlert[]>(WEATHER_ALERTS);
  const [projectRecommendations, setProjectRecommendations] = useState<ProjectRecommendation[]>(INITIAL_PROJECT_RECOMMENDATIONS);
  const [activeGrievanceDetail, setActiveGrievanceDetail] = useState<Grievance | null>(null);
  const [disputeInput, setDisputeInput] = useState<string>('');
  const [isDisputing, setIsDisputing] = useState<boolean>(false);
  const [feedbackSuccessNotice, setFeedbackSuccessNotice] = useState<string | null>(null);

  // Dual Theme State with LocalStorage Persistence
  const [theme, setTheme] = useState<AppTheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('civicpulse_theme') as AppTheme;
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark';
  });

  // Firebase Auth & User Profile State
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_USER_PROFILES.civilian);
  const [isRoleLoginOpen, setIsRoleLoginOpen] = useState<boolean>(false);

  // Test connection on boot and listen to Auth state changes
  useEffect(() => {
    testFirestoreConnection();

    // Listen to Firebase Auth state
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        // Build base profile from Google credentials
        setCurrentUser((prev) => ({
          ...prev,
          id: user.uid,
          name: user.displayName || user.email || 'Authenticated User',
          emailOrPhone: user.email || prev.emailOrPhone,
          badgeLabel: prev.role === 'provider' 
            ? 'Contractor (Google Auth)' 
            : prev.role === 'policymaker' 
            ? 'Admin (Google Auth)' 
            : 'Citizen (Google Auth)'
        }));
      }
    });

    // Real-time Firestore sync for grievances
    const unsubscribeGrievances = subscribeToGrievances((cloudGrievances) => {
      if (cloudGrievances && cloudGrievances.length > 0) {
        setGrievances(cloudGrievances);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeGrievances();
    };
  }, []);

  // Sync theme with <html> element and localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('civicpulse_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleRoleChange = (newRole: ActiveRole, customProfile?: UserProfile) => {
    setActiveRole(newRole);
    const profile = customProfile || DEFAULT_USER_PROFILES[newRole] || DEFAULT_USER_PROFILES.civilian;
    setCurrentUser(profile);

    const roleNames: Record<ActiveRole, string> = {
      policymaker: 'Admin Panel (District Magistrate & Command Center)',
      provider: 'Contractor Portal (Field Municipal Works)',
      civilian: 'Civilian App (Citizen Interactive Map)',
      whatsapp: 'WhatsApp Vernacular Bot Simulator'
    };

    setFeedbackSuccessNotice(`Active Persona: ${profile.name} [${roleNames[newRole]}]`);
    setTimeout(() => setFeedbackSuccessNotice(null), 4000);
  };

  // Upvote / "Impacts Me Too" handler (saved to Firestore)
  const handleUpvote = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = grievances.find((g) => g.id === id);
    if (!target) return;

    const hasUpvoted = target.userHasUpvoted;
    const newCount = hasUpvoted ? Math.max(0, target.upvotesCount - 1) : target.upvotesCount + 1;

    setGrievances((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          return {
            ...g,
            upvotesCount: newCount,
            userHasUpvoted: !hasUpvoted,
          };
        }
        return g;
      })
    );

    try {
      await updateGrievanceInFirestore(id, {
        upvotesCount: newCount
      });
    } catch (err) {
      console.warn('Fallback upvote in local state');
    }
  };

  // Add new grievance from Map Pin Drop, Voice, or WhatsApp
  const handleAddNewGrievance = async (newTicket: Partial<Grievance>) => {
    const fullTicket: Grievance = {
      id: `CP-${Math.floor(1050 + Math.random() * 900)}`,
      title: newTicket.title || 'Reported Civic Issue',
      description: newTicket.description || '',
      originalLanguage: newTicket.originalLanguage || 'English',
      category: newTicket.category || 'flood_drainage',
      sectorCode: 'MoHUA-DPI',
      state: newTicket.state || 'Tamil Nadu',
      district: newTicket.district || 'Madurai',
      talukOrWard: newTicket.talukOrWard || 'Ward 14 (Goripalayam)',
      coordinates: newTicket.coordinates || { lat: 9.9328, lng: 78.1294 },
      urgencyScore: newTicket.urgencyScore || 8,
      status: 'submitted',
      upvotesCount: 1,
      userHasUpvoted: true,
      imageUrl: newTicket.imageUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=800&q=80',
      weatherRisk: newTicket.weatherRisk,
      timeline: [
        {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          stage: 'Submitted',
          title: 'Direct GPS Pin dropped on Civilian Map',
          actor: firebaseUser?.displayName ? `Citizen: ${firebaseUser.displayName}` : 'Public Citizen'
        }
      ],
      createdAt: new Date().toISOString()
    };

    setGrievances((prev) => [fullTicket, ...prev]);

    try {
      await saveGrievanceToFirestore(fullTicket);
      setFeedbackSuccessNotice(`Grievance #${fullTicket.id} persisted to Firestore! Dispatched to municipal dispatch queue.`);
      setTimeout(() => setFeedbackSuccessNotice(null), 4000);
    } catch (err) {
      console.warn('Saved to local state, Firestore sync fallback');
    }
  };

  // Update Grievance Status from Contractor or Admin
  const handleUpdateGrievanceStatus = async (
    id: string,
    status: GrievanceStatus,
    resolutionPhotoUrl?: string,
    notes?: string,
    contractorName?: string
  ) => {
    const target = grievances.find((g) => g.id === id);
    if (!target) return;

    const newTimelineItem = {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stage: status === 'resolved' ? 'Resolved' : 'Work Allocated',
      title: status === 'resolved' 
        ? 'Resolution photo evidence submitted by field squad' 
        : `Dispatched to ${contractorName || 'Assigned Municipal Unit'}`,
      actor: contractorName || currentUser.name || 'Municipal Authority',
      notes: notes || undefined
    };

    const updates: Partial<Grievance> = {
      status,
      resolutionPhotoUrl: resolutionPhotoUrl || target.resolutionPhotoUrl,
      resolutionNotes: notes || target.resolutionNotes,
      resolvedAt: status === 'resolved' ? new Date().toISOString() : target.resolvedAt,
      resolvedByContractor: contractorName || currentUser.name,
      timeline: [...target.timeline, newTimelineItem]
    };

    setGrievances((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );

    if (activeGrievanceDetail?.id === id) {
      setActiveGrievanceDetail({ ...target, ...updates });
    }

    try {
      await updateGrievanceInFirestore(id, updates);
      setFeedbackSuccessNotice(`Work Order #${id} updated: ${status.toUpperCase()} in Firestore!`);
      setTimeout(() => setFeedbackSuccessNotice(null), 4000);
    } catch (err) {
      console.warn('Updated in local state');
    }
  };

  // Citizen Closed-Loop Feedback: Dispute fix or Escalate
  const handleCitizenDispute = async (id: string, reason: string) => {
    const target = grievances.find((g) => g.id === id);
    if (!target) return;

    const newTimeline = [
      ...target.timeline,
      {
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        stage: 'Disputed',
        title: 'Citizen marked resolution as incomplete / disputed',
        actor: firebaseUser?.displayName || 'Citizen Verified',
        notes: `Citizen Dispute Note: "${reason}" - Automatic SLA breach strike recorded against contractor.`
      }
    ];

    const updates: Partial<Grievance> = {
      status: 'disputed',
      urgencyScore: 10,
      disputeReason: reason,
      timeline: newTimeline
    };

    setGrievances((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );

    if (activeGrievanceDetail?.id === id) {
      setActiveGrievanceDetail({ ...target, ...updates });
    }

    setIsDisputing(false);
    setDisputeInput('');
    setFeedbackSuccessNotice('Grievance disputed! High-priority escalation dispatched to District Collector Office.');
    setTimeout(() => setFeedbackSuccessNotice(null), 4000);

    try {
      await updateGrievanceInFirestore(id, updates);
    } catch (err) {
      console.warn('Dispute updated locally');
    }
  };

  // Citizen demands more attention for unaddressed ticket
  const handleCitizenDemandAttention = async (id: string) => {
    const target = grievances.find((g) => g.id === id);
    if (!target) return;

    const updates: Partial<Grievance> = {
      urgencyScore: 10,
      upvotesCount: target.upvotesCount + 10,
      timeline: [
        ...target.timeline,
        {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          stage: 'Urgent Escalation',
          title: 'Citizen demanded emergency attention; escalated to District Magistrate Priority Queue',
          actor: 'Citizen Escalation Trigger'
        }
      ]
    };

    setGrievances((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );

    if (activeGrievanceDetail?.id === id) {
      setActiveGrievanceDetail({ ...target, ...updates });
    }

    setFeedbackSuccessNotice('Emergency attention flag sent! Priority score elevated to 10/10 on Admin Dashboard.');
    setTimeout(() => setFeedbackSuccessNotice(null), 4000);

    try {
      await updateGrievanceInFirestore(id, updates);
    } catch (err) {
      console.warn('Escalation saved locally');
    }
  };

  // Citizen confirms satisfaction and closes ticket
  const handleCitizenSatisfied = async (id: string) => {
    const target = grievances.find((g) => g.id === id);
    if (!target) return;

    const updates: Partial<Grievance> = {
      timeline: [
        ...target.timeline,
        {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          stage: 'Citizen Closed',
          title: 'Citizen verified photographic fix and rated 5/5 stars',
          actor: firebaseUser?.displayName || 'Citizen Verified'
        }
      ]
    };

    setGrievances((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );

    if (activeGrievanceDetail?.id === id) {
      setActiveGrievanceDetail({ ...target, ...updates });
    }

    setFeedbackSuccessNotice('Thank you! Your verified civic closure has been recorded in the public accountability registry.');
    setTimeout(() => setFeedbackSuccessNotice(null), 4000);

    try {
      await updateGrievanceInFirestore(id, updates);
    } catch (err) {
      console.warn('Saved closure locally');
    }
  };

  // Policymaker sanctions project recommendation
  const handleSanctionProject = (projectId: string) => {
    setProjectRecommendations((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return { ...p, status: 'sanctioned' as const };
        }
        return p;
      })
    );
    setFeedbackSuccessNotice(`Official Administrative Sanction granted for Project #${projectId}! Central matching funds released.`);
    setTimeout(() => setFeedbackSuccessNotice(null), 5000);
  };

  // Add new AI synthesized project recommendation
  const handleAddSynthesizedProject = (newProject: ProjectRecommendation) => {
    setProjectRecommendations((prev) => [newProject, ...prev]);
  };

  const pendingCount = grievances.filter((g) => g.status !== 'resolved').length;
  const activeRisksCount = weatherAlerts.length;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-200`}>
      {/* Universal Header with Persona Switcher, Dual Theme Toggle & Google/Role Login */}
      <Header
        activeRole={activeRole}
        setActiveRole={handleRoleChange}
        pendingGrievancesCount={pendingCount}
        activeWeatherAlertsCount={activeRisksCount}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        currentUser={currentUser}
        firebaseUser={firebaseUser}
        onOpenRoleLogin={() => setIsRoleLoginOpen(true)}
      />

      {/* Global Feedback Toast Notice */}
      {feedbackSuccessNotice && (
        <div className="bg-emerald-600 border-b border-emerald-400 text-white text-xs font-bold px-4 py-2 text-center animate-in slide-in-from-top flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedbackSuccessNotice}</span>
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Civilian Mode (Interactive Map & Issue Feeds) */}
        {activeRole === 'civilian' && (
          <CivilianView
            grievances={grievances}
            weatherAlerts={weatherAlerts}
            currentUser={currentUser}
            firebaseUser={firebaseUser}
            onSelectGrievance={(g) => setActiveGrievanceDetail(g)}
            onUpvoteGrievance={handleUpvote}
            onAddNewGrievance={handleAddNewGrievance}
            onOpenRoleLogin={() => setIsRoleLoginOpen(true)}
          />
        )}

        {/* WhatsApp Vernacular DPI Bot Simulator */}
        {activeRole === 'whatsapp' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                    Digital Public Good (DPG) Messaging Gateway
                  </span>
                  <span className="text-xs text-slate-400">Zero App-Store Barrier</span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  WhatsApp Regional Vernacular Grievance Gateway
                </h3>
                <p className="text-xs text-slate-300">
                  Rural and semi-urban citizens can send voice notes in regional Indian dialects. CivicPulse AI converts them into verified public work orders.
                </p>
              </div>
              <button
                onClick={() => setActiveRole('civilian')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold shrink-0 cursor-pointer"
              >
                ← Return to Map View
              </button>
            </div>

            <WhatsAppBotSimulator
              onTicketGenerated={(data) => {
                handleAddNewGrievance(data);
              }}
              onViewOnMap={(ticketId) => {
                setActiveRole('civilian');
                const matched = grievances.find((g) => g.id === ticketId);
                if (matched) setActiveGrievanceDetail(matched);
              }}
            />
          </div>
        )}

        {/* Provider Resolution Terminal */}
        {activeRole === 'provider' && (
          <ProviderResolutionPortal
            grievances={grievances}
            currentUser={currentUser}
            firebaseUser={firebaseUser}
            activeRole={activeRole}
            onOpenRoleLogin={() => setIsRoleLoginOpen(true)}
            onSelectRole={handleRoleChange}
            onUpdateGrievanceStatus={handleUpdateGrievanceStatus}
            onSelectGrievance={(g) => setActiveGrievanceDetail(g)}
          />
        )}

        {/* Policymaker Admin Command Center */}
        {activeRole === 'policymaker' && (
          <PolicymakerCommandCenter
            districtMetrics={districtMetrics}
            grievances={grievances}
            weatherAlerts={weatherAlerts}
            projectRecommendations={projectRecommendations}
            onSelectGrievance={(g) => setActiveGrievanceDetail(g)}
            onSanctionProject={handleSanctionProject}
            onAddSynthesizedProject={handleAddSynthesizedProject}
          />
        )}
      </main>

      {/* Detail Modal with Photographic Evidence & Citizen Closed-Loop Actions */}
      {activeGrievanceDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 text-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/30 font-mono">
                    Ticket #{activeGrievanceDetail.id}
                  </span>
                  <span className="text-xs text-slate-400">{activeGrievanceDetail.originalLanguage}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    activeGrievanceDetail.status === 'resolved'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : activeGrievanceDetail.status === 'disputed'
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {activeGrievanceDetail.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">{activeGrievanceDetail.title}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  {activeGrievanceDetail.talukOrWard}, {activeGrievanceDetail.district}, {activeGrievanceDetail.state}
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveGrievanceDetail(null);
                  setIsDisputing(false);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Description & Weather Warning */}
            <div className="space-y-2 text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <div className="text-slate-400 font-semibold text-xs uppercase tracking-wider">Citizen Voice Report:</div>
              <p>{activeGrievanceDetail.description}</p>
            </div>

            {activeGrievanceDetail.weatherRisk?.hasActiveRisk && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Predictive IMD Weather Hazard Correlated:</span>
                  <p className="text-slate-300 mt-0.5">
                    {activeGrievanceDetail.weatherRisk.preventiveNotice} ({activeGrievanceDetail.weatherRisk.forecastRainfallMm}mm rainfall expected).
                  </p>
                </div>
              </div>
            )}

            {/* Before vs After Photos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Reported Issue Photo:
                </span>
                <img
                  src={activeGrievanceDetail.imageUrl}
                  alt="Defect"
                  className="w-full h-40 object-cover rounded-xl border border-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Certified "After" Proof:</span>
                  {activeGrievanceDetail.status === 'resolved' && (
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Geo-Verified
                    </span>
                  )}
                </span>
                {activeGrievanceDetail.resolutionPhotoUrl ? (
                  <img
                    src={activeGrievanceDetail.resolutionPhotoUrl}
                    alt="Resolved"
                    className="w-full h-40 object-cover rounded-xl border border-emerald-500/40 ring-1 ring-emerald-500/20"
                  />
                ) : (
                  <div className="w-full h-40 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 flex flex-col items-center justify-center p-4 text-center text-slate-500">
                    <Building2 className="w-6 h-6 mb-1 text-slate-600" />
                    <span className="text-xs font-semibold text-slate-400">Awaiting Contractor Resolution</span>
                    <span className="text-[10px] text-slate-500 mt-1">Photo evidence required prior to ticket closure</span>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Stepper & Timeline */}
            <div className="pt-2">
              <GrievanceProgressStepper
                grievance={activeGrievanceDetail}
              />
            </div>

            {/* Resolution Contractor Notes */}
            {activeGrievanceDetail.resolutionNotes && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Contractor Resolution Report:</span>
                </div>
                <p className="mt-1 text-slate-300">{activeGrievanceDetail.resolutionNotes}</p>
                <div className="mt-2 text-[10px] text-emerald-400 font-mono">
                  Certified by: {activeGrievanceDetail.resolvedByContractor || 'Municipal Works Contractor'}
                </div>
              </div>
            )}

            {/* Closed-Loop Citizen Feedback Section */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-teal-400" />
                  <span>Citizen Closed-Loop Verification:</span>
                </span>
                <span className="text-[10px] text-slate-400">Section 14 Public Audit Guarantee</span>
              </div>

              {/* If Resolved: Citizen can confirm satisfaction OR Dispute */}
              {activeGrievanceDetail.status === 'resolved' && (
                <div className="space-y-2">
                  {!isDisputing ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <button
                        onClick={() => handleCitizenSatisfied(activeGrievanceDetail.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Satisfied with Fix (Confirm Closure)</span>
                      </button>

                      <button
                        onClick={() => setIsDisputing(true)}
                        className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold text-xs shadow-md transition cursor-pointer"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span>Dispute Fix (Issue Persists)</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 bg-slate-900 p-3 rounded-xl border border-rose-500/30">
                      <label className="block text-xs font-semibold text-rose-300">
                        Why is this fix incomplete? (e.g. water is still muddy, road patch broke again)
                      </label>
                      <input
                        type="text"
                        value={disputeInput}
                        onChange={(e) => setDisputeInput(e.target.value)}
                        placeholder="State reason for dispute (will be forwarded to District Collector)..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-hidden focus:border-rose-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setIsDisputing(false)}
                          className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleCitizenDispute(activeGrievanceDetail.id, disputeInput)}
                          disabled={!disputeInput.trim()}
                          className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs disabled:opacity-50 cursor-pointer"
                        >
                          Escalate to District Collector
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* When Ticket is Still Pending / In Progress */}
              {activeGrievanceDetail.status !== 'resolved' && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className="text-xs text-slate-400">
                    Has this issue worsened or requires immediate municipal attention?
                  </p>
                  <button
                    onClick={() => handleCitizenDemandAttention(activeGrievanceDetail.id)}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-md transition active:scale-95 cursor-pointer shrink-0"
                  >
                    <Flame className="w-4 h-4 text-slate-950" />
                    <span>Demand Urgent Attention (Escalate)</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  setActiveGrievanceDetail(null);
                  setIsDisputing(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-white hover:bg-slate-700 cursor-pointer"
              >
                Close Ticket View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role-Based Authentication & Access Control Modal */}
      <RoleLoginModal
        isOpen={isRoleLoginOpen}
        onClose={() => setIsRoleLoginOpen(false)}
        currentUser={currentUser}
        firebaseUser={firebaseUser}
        onSelectRole={handleRoleChange}
        onGoogleSignInSuccess={(user, profile) => {
          setFirebaseUser(user);
          setCurrentUser(profile);
          setActiveRole(profile.role);
          setFeedbackSuccessNotice(`Signed in with Google as ${profile.name}!`);
          setTimeout(() => setFeedbackSuccessNotice(null), 4000);
        }}
        onSignOutSuccess={() => {
          setFirebaseUser(null);
          setCurrentUser(DEFAULT_USER_PROFILES.civilian);
          setActiveRole('civilian');
          setFeedbackSuccessNotice('Signed out. Switched to Citizen Guest Mode.');
          setTimeout(() => setFeedbackSuccessNotice(null), 4000);
        }}
      />

      {/* Offline Status Toast Indicator */}
      <OfflineIndicator />
    </div>
  );
}
