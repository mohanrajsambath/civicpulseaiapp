import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Camera, 
  Upload, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  Wrench, 
  FileText, 
  Check, 
  UserCheck, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Lock,
  Building2,
  Briefcase,
  ArrowRight,
  Filter,
  Flame,
  Award,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { Grievance, GrievanceStatus, UserProfile, ActiveRole, SectorCategory } from '../../types';
import { SECTOR_CONFIG } from '../../data/seedData';

interface ProviderResolutionPortalProps {
  grievances: Grievance[];
  currentUser: UserProfile;
  firebaseUser: FirebaseUser | null;
  activeRole: ActiveRole;
  onOpenRoleLogin: () => void;
  onSelectRole: (role: ActiveRole, customProfile?: UserProfile) => void;
  onUpdateGrievanceStatus: (
    id: string, 
    status: GrievanceStatus, 
    resolutionPhotoUrl?: string, 
    notes?: string,
    contractorName?: string
  ) => void;
  onSelectGrievance: (grievance: Grievance) => void;
}

// Simulated after-resolution photo evidence presets
const RESOLUTION_PHOTO_PRESETS = [
  {
    title: 'Desilted Concrete Culvert (Clear Waterflow)',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=800&q=80',
    notes: 'Desilting squad removed 14 tonnes of accumulated municipal silt and debris. Full hydraulic gravity discharge restored.'
  },
  {
    title: 'New Ductile Iron Pipe Replaced & Disinfected',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    notes: 'Replaced ruptured 150mm PVC connector with Class K9 ductile iron pipe. Disinfected with sodium hypochlorite; water sample cleared potability lab test.'
  },
  {
    title: 'Reinforced Box Culvert Approach Paved',
    url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
    notes: 'Poured RCC slab over damaged culvert and laid bituminous wearing course. Ambulances can now navigate safely.'
  },
  {
    title: '100kVA Distribution Transformer Upgraded',
    url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80',
    notes: 'Replaced faulty overloaded transformer unit with new 100kVA copper-wound unit and erected 2.5m chain-link protective fencing.'
  }
];

export const ProviderResolutionPortal: React.FC<ProviderResolutionPortalProps> = ({
  grievances,
  currentUser,
  firebaseUser,
  activeRole,
  onOpenRoleLogin,
  onSelectRole,
  onUpdateGrievanceStatus,
  onSelectGrievance
}) => {
  const [selectedTicket, setSelectedTicket] = useState<Grievance | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [selectedPhotoPreset, setSelectedPhotoPreset] = useState(RESOLUTION_PHOTO_PRESETS[0]);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filtering states
  const [activeFilter, setActiveFilter] = useState<'pending' | 'allocated' | 'resolved'>('pending');
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<string>('all');
  const [selectedWardFilter, setSelectedWardFilter] = useState<string>('all');

  const contractorDisplayName = currentUser.role === 'provider' 
    ? currentUser.name 
    : 'Madurai Municipal Infrastructure Works Div-1';
  const contractorFirmName = currentUser.role === 'provider' 
    ? currentUser.department 
    : 'PWD Hydrology & Municipal Works';

  // Sector and Ward Lists for Filtering
  const availableWards = Array.from(new Set(grievances.map((g) => g.talukOrWard))).filter(Boolean);

  // Apply filters
  const filteredBySectorAndWard = grievances.filter((g) => {
    if (selectedSectorFilter !== 'all' && g.category !== selectedSectorFilter) return false;
    if (selectedWardFilter !== 'all' && g.talukOrWard !== selectedWardFilter) return false;
    return true;
  });

  const pendingList = filteredBySectorAndWard.filter((g) => g.status === 'submitted');
  const allocatedList = filteredBySectorAndWard.filter((g) => g.status === 'work_allocated');
  const resolvedList = filteredBySectorAndWard.filter((g) => g.status === 'resolved');

  const displayList = activeFilter === 'pending' 
    ? pendingList 
    : activeFilter === 'allocated' 
    ? allocatedList 
    : resolvedList;

  // Compute SLA stats
  const totalCompleted = grievances.filter((g) => g.status === 'resolved').length;
  const totalAllocated = grievances.filter((g) => g.status === 'work_allocated').length;
  const totalPending = grievances.filter((g) => g.status === 'submitted').length;

  // SLA Calculation Helper
  const getSlaStatus = (ticket: Grievance) => {
    // 24hr for urgent (urgencyScore >= 8 or flood hazard), 48hr for standard
    const isCritical = ticket.urgencyScore >= 8 || ticket.weatherRisk?.hasActiveRisk;
    const slaLimitHours = isCritical ? 24 : 48;
    
    // Parse created date
    const createdTime = new Date(ticket.createdAt).getTime();
    const now = Date.now();
    // In our mock or real data, calculate simulated hours
    const elapsedHours = Math.max(1, Math.round((now - createdTime) / (1000 * 60 * 60)) % 72);
    const hoursRemaining = slaLimitHours - elapsedHours;

    if (ticket.status === 'resolved') {
      return {
        label: 'Resolved On-Time',
        badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        isBreached: false,
        hoursRemaining: 0
      };
    }

    if (hoursRemaining <= 0) {
      return {
        label: `SLA BREACHED (${Math.abs(hoursRemaining)}h overdue)`,
        badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse font-bold',
        isBreached: true,
        hoursRemaining
      };
    } else if (hoursRemaining <= 6) {
      return {
        label: `CRITICAL SLA (${hoursRemaining}h left)`,
        badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold',
        isBreached: false,
        hoursRemaining
      };
    } else {
      return {
        label: `SLA: ${hoursRemaining}h remaining`,
        badgeClass: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
        isBreached: false,
        hoursRemaining
      };
    }
  };

  const handleResolveTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setIsSubmitting(true);
    const finalPhotoUrl = customPhotoUrl.trim() || selectedPhotoPreset.url;
    const finalNotes = resolutionNotes.trim() || selectedPhotoPreset.notes;

    setTimeout(() => {
      onUpdateGrievanceStatus(
        selectedTicket.id,
        'resolved',
        finalPhotoUrl,
        finalNotes,
        contractorDisplayName
      );
      setIsSubmitting(false);
      setSelectedTicket(null);
      setResolutionNotes('');
    }, 500);
  };

  const handleAssignToSelf = (ticket: Grievance) => {
    onUpdateGrievanceStatus(
      ticket.id,
      'work_allocated',
      undefined,
      `Work order claimed by ${contractorDisplayName}. Field repair unit mobilized.`,
      contractorDisplayName
    );
  };

  // Check if current user is authorized as contractor
  const isAuthorizedContractor = currentUser.role === 'provider' || currentUser.role === 'policymaker';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950/40 p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              Contractor &amp; Municipal Service Provider Terminal
            </span>
            <span className="text-xs text-slate-400 font-mono">Real-Time Work Orders</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            Field Execution, SLA Enforcement &amp; Photographic Verification
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            In compliance with Digital Public Good standards, municipal contractors can claim pending citizen complaints, monitor automated SLA countdowns, and upload legally certified "After" resolution evidence.
          </p>
        </div>

        {/* Contractor Identity Pill */}
        <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl shrink-0 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Logged Field Unit:</div>
            <div className="text-xs font-bold text-white max-w-[220px] truncate">{contractorDisplayName}</div>
            <div className="text-[10px] text-emerald-400 font-semibold truncate max-w-[220px]">{contractorFirmName}</div>
          </div>
        </div>
      </div>

      {/* Contractor Performance KPI Scorecard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">Active Claims</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{totalAllocated}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">Verified Completed</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{totalCompleted}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">On-Time SLA Rate</div>
            <div className="text-2xl font-black text-teal-400 mt-1">96.8%</div>
          </div>
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">Citizen Quality Score</div>
            <div className="text-2xl font-black text-blue-400 mt-1">4.9 / 5.0</div>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Contractor Authentication Notice if in civilian mode */}
      {!isAuthorizedContractor && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-300">Contractor Verification Required for Work Allocation</h4>
              <p className="text-xs text-slate-300 mt-0.5">
                You are currently viewing in Citizen mode. To claim public work orders and submit legally certified resolution proofs, sign in with your contractor Google account or switch to the Contractor persona.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenRoleLogin}
            className="shrink-0 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition"
          >
            <Lock className="w-3.5 h-3.5" />
            Authenticate as Contractor
          </button>
        </div>
      )}

      {/* Filter Toolbar: Status Tabs + Sector Dropdown + Ward Dropdown */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-2 sm:p-2.5 rounded-2xl shadow-md">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveFilter('pending')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
              activeFilter === 'pending'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Unallocated Queue</span>
            <span className="bg-slate-900 text-amber-300 px-1.5 py-0.5 rounded-full text-[10px]">
              {pendingList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('allocated')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
              activeFilter === 'allocated'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Work Underway</span>
            <span className="bg-slate-900 text-blue-300 px-1.5 py-0.5 rounded-full text-[10px]">
              {allocatedList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('resolved')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
              activeFilter === 'resolved'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Completed &amp; Audited</span>
            <span className="bg-slate-900 text-emerald-300 px-1.5 py-0.5 rounded-full text-[10px]">
              {resolvedList.length}
            </span>
          </button>
        </div>

        {/* Sector & Ward Jurisdiction Selectors */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-400 font-medium">Sector:</span>
            <select
              value={selectedSectorFilter}
              onChange={(e) => setSelectedSectorFilter(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">All Sectors</option>
              <option value="roads_bridges" className="bg-slate-900 text-white">Roads &amp; Bridges</option>
              <option value="water_sanitation" className="bg-slate-900 text-white">Water &amp; Sanitation</option>
              <option value="flood_drainage" className="bg-slate-900 text-white">Flood &amp; Drainage</option>
              <option value="power_electricity" className="bg-slate-900 text-white">Power &amp; Electricity</option>
              <option value="rural_health" className="bg-slate-900 text-white">Rural Health</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-400 font-medium">Ward:</span>
            <select
              value={selectedWardFilter}
              onChange={(e) => setSelectedWardFilter(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">All Wards</option>
              {availableWards.map((w) => (
                <option key={w} value={w} className="bg-slate-900 text-white">{w}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Work Orders on Left, Resolution Form on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Work Order Cards */}
        <div className="lg:col-span-7 space-y-4">
          {displayList.length === 0 ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-400 space-y-3">
              <Check className="mx-auto w-12 h-12 text-emerald-400 bg-emerald-500/10 p-2.5 rounded-full" />
              <h3 className="text-base font-bold text-white">No Tickets Matching Filter</h3>
              <p className="text-xs text-slate-400">All work orders in this category have been dispatched or closed.</p>
            </div>
          ) : (
            displayList.map((ticket) => {
              const sector = SECTOR_CONFIG[ticket.category];
              const isSelected = selectedTicket?.id === ticket.id;
              const sla = getSlaStatus(ticket);

              return (
                <div
                  key={ticket.id}
                  onClick={() => {
                    setSelectedTicket(ticket);
                    onSelectGrievance(ticket);
                  }}
                  className={`rounded-2xl border p-4 sm:p-5 transition cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 bg-amber-950/20 ring-1 ring-amber-500/40 shadow-lg'
                      : 'border-slate-800 bg-slate-900/90 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-amber-400">{ticket.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${sector?.bgBadge || 'bg-slate-800 text-slate-300'}`}>
                          {sector?.label || ticket.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {ticket.talukOrWard}, {ticket.district}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-white text-sm sm:text-base leading-snug">
                        {ticket.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {ticket.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0 space-y-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 block">
                        Urgency {ticket.urgencyScore}/10
                      </span>
                    </div>
                  </div>

                  {/* Automated SLA Timer Alert */}
                  <div className="mt-3 flex items-center justify-between text-xs bg-slate-950/70 p-2 rounded-xl border border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${sla.badgeClass}`}>
                        {sla.label}
                      </span>
                    </div>
                    {sla.isBreached && (
                      <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Penalty Escalation Flagged
                      </span>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="text-[11px] text-slate-400">
                      Reported {new Date(ticket.createdAt).toLocaleDateString()}
                    </div>

                    <div className="flex items-center gap-2">
                      {ticket.status === 'submitted' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isAuthorizedContractor) {
                              onOpenRoleLogin();
                              return;
                            }
                            handleAssignToSelf(ticket);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer transition shadow-sm"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          Claim Work Order
                        </button>
                      )}

                      {ticket.status === 'work_allocated' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTicket(ticket);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition shadow-sm"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          Submit Proof
                        </button>
                      )}

                      {ticket.status === 'resolved' && (
                        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Resolution & Evidence Upload Form */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-white text-sm sm:text-base">
                  Proof-of-Resolution Portal
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-mono">
                Gov-Cert 4.1
              </span>
            </div>

            {selectedTicket ? (
              <form onSubmit={handleResolveTicket} className="space-y-4">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-400 font-mono">{selectedTicket.id}</span>
                    <span className="text-slate-400 text-[11px]">{selectedTicket.talukOrWard}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{selectedTicket.title}</h4>
                </div>

                {/* Proof Photo Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Certified Resolution Proof (After-Photo):
                  </label>
                  
                  {/* Photo Presets */}
                  <div className="space-y-2">
                    {RESOLUTION_PHOTO_PRESETS.map((preset, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedPhotoPreset(preset)}
                        className={`p-2 rounded-xl border text-xs cursor-pointer flex items-center gap-3 transition ${
                          selectedPhotoPreset.title === preset.title
                            ? 'border-teal-500 bg-teal-950/20 text-white ring-1 ring-teal-500/40'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                        }`}
                      >
                        <img 
                          src={preset.url} 
                          alt={preset.title} 
                          className="w-12 h-12 rounded-lg object-cover shrink-0" 
                        />
                        <div className="leading-tight overflow-hidden">
                          <div className="font-bold truncate text-[11px]">{preset.title}</div>
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">{preset.notes}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Or Custom URL */}
                  <div className="pt-2">
                    <label className="block text-[11px] text-slate-400 mb-1">Or paste custom proof photo URL:</label>
                    <input
                      type="url"
                      value={customPhotoUrl}
                      onChange={(e) => setCustomPhotoUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-400"
                    />
                  </div>
                </div>

                {/* Work Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contractor Engineering Notes &amp; Certification:
                  </label>
                  <textarea
                    rows={3}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder={selectedPhotoPreset.notes}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-400 resize-none"
                  />
                </div>

                {/* Submit Resolution */}
                <button
                  type="submit"
                  disabled={isSubmitting || !isAuthorizedContractor}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-900/40 flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    'Publishing Verified Proof...'
                  ) : !isAuthorizedContractor ? (
                    'Contractor Login Required to Close Ticket'
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Sign &amp; Certify Resolution
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <FileText className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-xs font-semibold text-slate-300">Select a work order from the list</p>
                <p className="text-[11px] text-slate-500">
                  Click any ticket on the left to review telemetry, claim field assignment, and attach verified photographic proof of resolution.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
