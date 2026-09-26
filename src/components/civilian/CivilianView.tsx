import React, { useState } from 'react';
import { 
  MapPin, 
  ListFilter, 
  CloudRain, 
  PlusCircle, 
  Search, 
  Layers, 
  ThumbsUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Compass,
  ArrowUpRight,
  Mic,
  UserCheck,
  FileText,
  Lock,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { Grievance, WeatherAlert, UserProfile } from '../../types';
import { SECTOR_CONFIG } from '../../data/seedData';
import { CivilianInteractiveMap } from '../map/CivilianInteractiveMap';
import { PredictiveWeatherDrawer } from '../map/PredictiveWeatherDrawer';
import { ReportIssueModal } from './ReportIssueModal';
import { VernacularVoiceRecorder } from '../voice/VernacularVoiceRecorder';

interface CivilianViewProps {
  grievances: Grievance[];
  weatherAlerts: WeatherAlert[];
  currentUser?: UserProfile;
  firebaseUser?: FirebaseUser | null;
  onSelectGrievance: (grievance: Grievance) => void;
  onUpvoteGrievance: (id: string, e?: React.MouseEvent) => void;
  onAddNewGrievance: (grievance: Partial<Grievance>) => void;
  onOpenRoleLogin?: () => void;
}

export const CivilianView: React.FC<CivilianViewProps> = ({
  grievances,
  weatherAlerts,
  currentUser,
  firebaseUser,
  onSelectGrievance,
  onUpvoteGrievance,
  onAddNewGrievance,
  onOpenRoleLogin
}) => {
  const [activeTab, setActiveTab] = useState<'map' | 'issues' | 'my_reports' | 'voice' | 'weather'>('map');
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [droppedCoords, setDroppedCoords] = useState<{ lat: number; lng: number; districtName: string; ward: string } | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'critical' | 'resolved' | 'my_reports'>('all');

  const handleDropPinAtCoordinates = (coords: { lat: number; lng: number; districtName: string; ward: string }) => {
    setDroppedCoords(coords);
    setIsReportModalOpen(true);
  };

  // User's own grievances
  const myGrievances = grievances.filter((g) => {
    if (firebaseUser?.uid && g.reportedByUid === firebaseUser.uid) return true;
    if (firebaseUser?.displayName && g.reportedByName === firebaseUser.displayName) return true;
    // Also match the seed default for civilian demo
    if (currentUser?.role === 'civilian' && (g.id === 'CP-1001' || g.id === 'CP-1002')) return true;
    return false;
  });

  const filteredGrievances = grievances.filter((g) => {
    const matchSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.talukOrWard.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.district.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === 'critical') {
      return matchSearch && (g.urgencyScore >= 8 || g.weatherRisk?.hasActiveRisk);
    }
    if (selectedFilter === 'resolved') {
      return matchSearch && g.status === 'resolved';
    }
    if (selectedFilter === 'my_reports') {
      const isMine = (firebaseUser?.uid && g.reportedByUid === firebaseUser.uid) ||
        (currentUser?.role === 'civilian' && (g.id === 'CP-1001' || g.id === 'CP-1002'));
      return matchSearch && isMine;
    }
    return matchSearch;
  });

  return (
    <div className="space-y-5 pb-24">
      {/* Top Civilian Navigation & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-2 sm:p-2.5 rounded-2xl shadow-md">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
              activeTab === 'map'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Map View</span>
          </button>

          <button
            onClick={() => setActiveTab('issues')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
              activeTab === 'issues'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Community Feed</span>
            <span className="text-[10px] bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded-full">
              {grievances.length}
            </span>
          </button>

          {/* Dedicated "My Reports" Tab for Citizen Role */}
          <button
            onClick={() => setActiveTab('my_reports')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
              activeTab === 'my_reports'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>My Reports</span>
            {myGrievances.length > 0 && (
              <span className="text-[10px] bg-blue-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                {myGrievances.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('voice')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
              activeTab === 'voice'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Vernacular Voice</span>
          </button>

          <button
            onClick={() => setActiveTab('weather')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
              activeTab === 'weather'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Weather Risk</span>
            {weatherAlerts.length > 0 && (
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            )}
          </button>
        </div>

        {/* Primary Action Button: "Report Spot" */}
        <button
          onClick={() => {
            setDroppedCoords(undefined);
            setIsReportModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition active:scale-95 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report Spot at My Location</span>
        </button>
      </div>

      {/* Tab Content 1: Interactive Map Screen */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          <CivilianInteractiveMap
            grievances={grievances}
            weatherAlerts={weatherAlerts}
            onSelectGrievance={onSelectGrievance}
            onUpvoteGrievance={onUpvoteGrievance}
            onDropPinAtCoordinates={handleDropPinAtCoordinates}
          />
        </div>
      )}

      {/* Tab Content 2: My Reports (Role-Based Citizen View) */}
      {activeTab === 'my_reports' && (
        <div className="space-y-5">
          {/* Header Card */}
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950/40 p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/30">
                  Citizen Reporting Dashboard
                </span>
                <span className="text-xs text-slate-400">Section 14 Civic Transparency</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                My Lodged Grievances &amp; Resolution Tracking
              </h2>
              <p className="text-xs text-slate-300 max-w-xl">
                Track all civic hazard reports lodged from your identity. You will see when a municipal contractor claims the ticket, their SLA timeline, and photographic proof once fixed.
              </p>
            </div>

            {!firebaseUser && (
              <button
                onClick={onOpenRoleLogin}
                className="shrink-0 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition"
              >
                <Lock className="w-3.5 h-3.5" />
                Sign in with Google to Sync Reports
              </button>
            )}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="text-xs text-slate-400 font-semibold">Total Reports Lodged</div>
              <div className="text-xl font-black text-white mt-1">{myGrievances.length}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="text-xs text-slate-400 font-semibold">In Progress (Contractor)</div>
              <div className="text-xl font-black text-amber-400 mt-1">
                {myGrievances.filter((g) => g.status === 'work_allocated').length}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="text-xs text-slate-400 font-semibold">Resolved with Photo</div>
              <div className="text-xl font-black text-emerald-400 mt-1">
                {myGrievances.filter((g) => g.status === 'resolved').length}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="text-xs text-slate-400 font-semibold">Community Upvotes</div>
              <div className="text-xl font-black text-teal-400 mt-1">
                {myGrievances.reduce((acc, g) => acc + g.upvotesCount, 0)}
              </div>
            </div>
          </div>

          {/* List of User's Grievances */}
          {myGrievances.length === 0 ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-400 space-y-3">
              <FileText className="mx-auto w-12 h-12 text-blue-400 bg-blue-500/10 p-2.5 rounded-full" />
              <h3 className="text-base font-bold text-white">No Reports Lodged Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Spot a pothole, open manhole, water logging, or hazardous wire in your ward? Drop a pin to lodge your first public report.
              </p>
              <button
                onClick={() => {
                  setDroppedCoords(undefined);
                  setIsReportModalOpen(true);
                }}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 font-bold text-xs shadow-md cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Lodge Civic Report
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myGrievances.map((item) => {
                const sector = SECTOR_CONFIG[item.category];
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectGrievance(item)}
                    className="group bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-4 sm:p-5 transition shadow-md hover:shadow-xl cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className={`px-2 py-0.5 rounded-md font-semibold border ${sector?.bgBadge}`}>
                            {sector?.label}
                          </span>
                          <span className="text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-rose-400" />
                            {item.talukOrWard}, {item.district}
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="text-blue-300 font-mono text-[11px] font-bold">
                            Ticket #{item.id}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400 flex-wrap">
                          <span className="capitalize font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            Status: {item.status.replace('_', ' ')}
                          </span>
                          {item.resolvedByContractor && (
                            <span className="text-slate-300">
                              Contractor: <strong className="text-white">{item.resolvedByContractor}</strong>
                            </span>
                          )}
                          {item.resolutionPhotoUrl && (
                            <span className="flex items-center gap-1 text-emerald-400 font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              Resolution Photo Attached
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-xl border border-teal-500/30 flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {item.upvotesCount} Endorsements
                        </span>
                        <span className="text-xs text-blue-400 group-hover:translate-x-0.5 transition flex items-center gap-0.5">
                          Inspect <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 3: Issues Feed */}
      {activeTab === 'issues' && (
        <div className="space-y-4">
          {/* Search & Status Filters */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ward, district, or keyword (e.g., culvert, water, school)..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-1.5 shrink-0 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs overflow-x-auto">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer shrink-0 ${
                  selectedFilter === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({grievances.length})
              </button>
              <button
                onClick={() => setSelectedFilter('critical')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer shrink-0 ${
                  selectedFilter === 'critical'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Critical
              </button>
              <button
                onClick={() => setSelectedFilter('resolved')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer shrink-0 ${
                  selectedFilter === 'resolved'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Resolved
              </button>
              <button
                onClick={() => setSelectedFilter('my_reports')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer shrink-0 ${
                  selectedFilter === 'my_reports'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                My Reports ({myGrievances.length})
              </button>
            </div>
          </div>

          {/* Grievances List */}
          <div className="space-y-3">
            {filteredGrievances.map((item) => {
              const sector = SECTOR_CONFIG[item.category];
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectGrievance(item)}
                  className="group bg-slate-900 border border-slate-800 hover:border-teal-500/50 rounded-2xl p-4 sm:p-5 transition shadow-md hover:shadow-xl cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded-md font-semibold border ${sector?.bgBadge}`}>
                          {sector?.label}
                        </span>
                        <span className="text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-400" />
                          {item.talukOrWard}, {item.district}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 font-medium">{item.originalLanguage}</span>
                        {item.weatherRisk?.hasActiveRisk && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-300 font-semibold text-[11px] animate-pulse">
                            <CloudRain className="w-3 h-3 text-rose-400" />
                            Rain Risk: {item.weatherRisk.forecastRainfallMm}mm
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1 font-semibold text-slate-300">
                          <Clock className="w-3 h-3 text-slate-500" />
                          #{item.id}
                        </span>
                        <span>•</span>
                        <span className="capitalize font-medium text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {item.status.replace('_', ' ')}
                        </span>
                        {item.resolutionPhotoUrl && (
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Resolved with Photo Proof
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                        <span className="text-slate-400 text-[10px]">Severity</span>
                        <span className={`font-black ${item.urgencyScore >= 8 ? 'text-rose-400' : 'text-amber-400'}`}>
                          {item.urgencyScore}/10
                        </span>
                      </div>

                      <button
                        onClick={(e) => onUpvoteGrievance(item.id, e)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 cursor-pointer ${
                          item.userHasUpvoted
                            ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/30'
                            : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700'
                        }`}
                        title="Click if this issue impacts your household too"
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${item.userHasUpvoted ? 'fill-slate-950' : ''}`} />
                        <span>{item.upvotesCount}</span>
                        <span className="hidden sm:inline text-[10px] opacity-80">Me Too</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content 4: Vernacular Voice Recorder */}
      {activeTab === 'voice' && (
        <VernacularVoiceRecorder
          onPublishGrievance={(data) => {
            onAddNewGrievance(data);
            setActiveTab('map');
          }}
        />
      )}

      {/* Tab Content 5: Predictive Weather & GEE Drawer */}
      {activeTab === 'weather' && (
        <PredictiveWeatherDrawer
          weatherAlerts={weatherAlerts}
          grievances={grievances}
          onSelectGrievance={onSelectGrievance}
        />
      )}

      {/* Mobile Android-Style Bottom Navigation Bar (Persistent) */}
      <nav className="fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 py-2 px-4 z-40 sm:hidden flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            activeTab === 'map' ? 'text-teal-400' : 'text-slate-400'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Map</span>
        </button>

        <button
          onClick={() => setActiveTab('my_reports')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            activeTab === 'my_reports' ? 'text-blue-400' : 'text-slate-400'
          }`}
        >
          <UserCheck className="w-5 h-5" />
          <span>My Posts</span>
        </button>

        <button
          onClick={() => {
            setDroppedCoords(undefined);
            setIsReportModalOpen(true);
          }}
          className="flex flex-col items-center gap-0.5 -mt-4"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/30">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold text-amber-400">Report</span>
        </button>

        <button
          onClick={() => setActiveTab('issues')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            activeTab === 'issues' ? 'text-teal-400' : 'text-slate-400'
          }`}
        >
          <ListFilter className="w-5 h-5" />
          <span>Issues</span>
        </button>

        <button
          onClick={() => setActiveTab('weather')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold relative ${
            activeTab === 'weather' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <CloudRain className="w-5 h-5" />
          <span>Weather</span>
          {weatherAlerts.length > 0 && (
            <span className="absolute top-0 right-2 h-2 w-2 rounded-full bg-cyan-400" />
          )}
        </button>
      </nav>

      {/* Report Issue Modal */}
      {isReportModalOpen && (
        <ReportIssueModal
          initialCoords={droppedCoords}
          onClose={() => setIsReportModalOpen(false)}
          onSubmitGrievance={(data) => {
            onAddNewGrievance(data);
          }}
        />
      )}
    </div>
  );
};
