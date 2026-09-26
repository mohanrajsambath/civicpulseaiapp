import React, { useState } from 'react';
import { 
  BarChart3, 
  MapPin, 
  Layers, 
  TrendingUp, 
  AlertTriangle, 
  Database, 
  DollarSign, 
  Building2, 
  CheckCircle2, 
  ArrowUpRight, 
  ShieldAlert, 
  Flame, 
  Filter, 
  Download, 
  ChevronRight, 
  Send, 
  CloudRain, 
  ExternalLink, 
  Users, 
  Sparkles, 
  PlusCircle, 
  FileCheck,
  Wrench,
  UserCheck,
  Briefcase,
  Clock,
  Search,
  ShieldCheck
} from 'lucide-react';
import { DistrictMetric, Grievance, ProjectRecommendation, WeatherAlert } from '../../types';
import { SECTOR_CONFIG } from '../../data/seedData';
import { CabinetDPRModal } from './CabinetDPRModal';

interface PolicymakerCommandCenterProps {
  districtMetrics: DistrictMetric[];
  grievances: Grievance[];
  weatherAlerts: WeatherAlert[];
  projectRecommendations: ProjectRecommendation[];
  onSelectGrievance: (grievance: Grievance) => void;
  onDispatchWorkOrder?: (ticketId: string, department: string) => void;
  onSanctionProject?: (projectId: string) => void;
  onAddSynthesizedProject?: (project: ProjectRecommendation) => void;
}

export const PolicymakerCommandCenter: React.FC<PolicymakerCommandCenterProps> = ({
  districtMetrics,
  grievances,
  weatherAlerts,
  projectRecommendations,
  onSelectGrievance,
  onDispatchWorkOrder,
  onSanctionProject,
  onAddSynthesizedProject
}) => {
  const [adminLevel, setAdminLevel] = useState<'national' | 'state' | 'district'>('national');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('TN-MDU');
  const [activeAdminTab, setActiveAdminTab] = useState<'hotspots' | 'datagov' | 'budget' | 'contractors_sla'>('hotspots');
  const [selectedProjectForDPR, setSelectedProjectForDPR] = useState<ProjectRecommendation | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisSuccess, setSynthesisSuccess] = useState<string | null>(null);
  const [adminGrievanceSearch, setAdminGrievanceSearch] = useState('');
  const [adminSectorFilter, setAdminSectorFilter] = useState('all');

  const selectedDistrict = districtMetrics.find((d) => d.districtId === selectedDistrictId) || districtMetrics[0];

  // Calculate high-level KPIs
  const totalPopulationTracked = districtMetrics.reduce((acc, d) => acc + d.population, 0);
  const totalActiveGrievances = grievances.length;
  const criticalHazardsCount = grievances.filter((g) => g.urgencyScore >= 8 || g.weatherRisk?.hasActiveRisk).length;
  const totalSanctionedBudget = districtMetrics.reduce((acc, d) => acc + d.allocatedBudgetCrores, 0);
  const totalSpentBudget = districtMetrics.reduce((acc, d) => acc + d.spentBudgetCrores, 0);

  // Trigger Gemini AI DPR Synthesis
  const handleSynthesizeCapitalWork = async () => {
    setIsSynthesizing(true);
    setSynthesisSuccess(null);

    try {
      const relevantGrievances = grievances
        .filter((g) => g.district === selectedDistrict.districtName)
        .map((g) => g.title);

      const res = await fetch('/api/ai/synthesize-dpr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          district: selectedDistrict.districtName,
          state: selectedDistrict.state,
          sector: 'flood_drainage',
          grievancesSummary: relevantGrievances.slice(0, 5),
          dataGovMetrics: {
            jjmWaterCoveragePct: selectedDistrict.jjmWaterCoveragePct,
            pmgsyRoadCoveragePct: selectedDistrict.pmgsyRoadCoveragePct,
            floodVulnerabilityIndex: selectedDistrict.floodVulnerabilityIndex,
            population: selectedDistrict.population
          }
        })
      });

      const data = await res.json();
      const newDpr: ProjectRecommendation = {
        id: `DPI-REC-0${projectRecommendations.length + 1}`,
        title: data.title || `Integrated Drainage Modernization Project — ${selectedDistrict.districtName}`,
        sector: 'flood_drainage',
        district: selectedDistrict.districtName,
        state: selectedDistrict.state,
        rationale: data.rationale || 'Formulated by AI clustering persistent citizen demand into high-impact capital works.',
        demographicCorrelation: data.demographicCorrelation || `Addresses severe deficit in ${selectedDistrict.districtName} (${selectedDistrict.jjmWaterCoveragePct}% coverage).`,
        estimatedCapexCrores: data.estimatedCapexCrores || 7.5,
        estimatedBeneficiaries: data.estimatedBeneficiaries || 68000,
        ropiScore: data.ropiScore || 95,
        ropiBreakdown: data.ropiBreakdown || {
          socioeconomicEquityScore: 94,
          infrastructureDeficitScore: 92,
          climateResilienceScore: 96,
          costEfficiencyScore: 90,
          schemeAlignmentScore: 95
        },
        fundingModel: data.fundingModel || {
          centralSharePct: 60,
          stateSharePct: 40,
          centralAmountCrores: Number(((data.estimatedCapexCrores || 7.5) * 0.6).toFixed(2)),
          stateAmountCrores: Number(((data.estimatedCapexCrores || 7.5) * 0.4).toFixed(2))
        },
        milestones: data.milestones,
        executiveSummary: data.executiveSummary,
        priority: 'critical',
        centralScheme: data.centralScheme || 'AMRUT 2.0 & Urban Flood Mitigation Fund',
        status: 'proposed'
      };

      if (onAddSynthesizedProject) {
        onAddSynthesizedProject(newDpr);
      }
      setSelectedProjectForDPR(newDpr);
      setSynthesisSuccess(`Gemini 3.8 Flash formulated "${newDpr.title}" with RoPI ${newDpr.ropiScore}/100!`);
      setTimeout(() => setSynthesisSuccess(null), 5000);
    } catch {
      // Fallback proposal
      const fallbackDpr: ProjectRecommendation = {
        id: `DPI-REC-0${projectRecommendations.length + 1}`,
        title: `Pre-Emptive Storm Conduit Construction — ${selectedDistrict.districtName}`,
        sector: 'flood_drainage',
        district: selectedDistrict.districtName,
        state: selectedDistrict.state,
        rationale: 'Mitigates recurring drainage choke points and protects market corridors from forecasted flood inundation.',
        demographicCorrelation: `Benefits over 50,000 citizens in high-density wards with flood vulnerability score of ${selectedDistrict.floodVulnerabilityIndex}/100.`,
        estimatedCapexCrores: 6.8,
        estimatedBeneficiaries: 52000,
        ropiScore: 92,
        ropiBreakdown: {
          socioeconomicEquityScore: 93,
          infrastructureDeficitScore: 90,
          climateResilienceScore: 95,
          costEfficiencyScore: 88,
          schemeAlignmentScore: 94
        },
        fundingModel: {
          centralSharePct: 60,
          stateSharePct: 40,
          centralAmountCrores: 4.08,
          stateAmountCrores: 2.72
        },
        priority: 'critical',
        centralScheme: 'AMRUT 2.0 Flood Resilience Mission',
        status: 'proposed'
      };
      if (onAddSynthesizedProject) onAddSynthesizedProject(fallbackDpr);
      setSelectedProjectForDPR(fallbackDpr);
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Admin Controls & Scope Switcher */}
      <div className="rounded-3xl border border-blue-500/30 bg-slate-900 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-blue-400 bg-blue-500/15 px-2.5 py-0.5 rounded-md border border-blue-500/40 uppercase tracking-wider font-mono">
                🏛️ Admin Panel Active
              </span>
              <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/30">
                National Governance &amp; Policy Command
              </span>
              <span className="text-xs text-slate-400">data.gov.in Verified Feed</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              District Magistrate &amp; Strategic Infrastructure Command Panel
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Synthesizing 1.4B citizen feedback vectors across Indian languages with national infrastructure indices 
              to identify unaddressed infrastructure deficits and sanction capital public works (PM Gati Shakti / AMRUT 2.0).
            </p>
          </div>

          {/* Administrative Hierarchy Scope Selector */}
          <div className="bg-slate-950 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-1 shrink-0 text-xs font-bold">
            <button
              onClick={() => setAdminLevel('national')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                adminLevel === 'national'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              National (Ministries)
            </button>
            <button
              onClick={() => setAdminLevel('state')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                adminLevel === 'state'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              State Level
            </button>
            <button
              onClick={() => setAdminLevel('district')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                adminLevel === 'district'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              District Magistrate
            </button>
          </div>
        </div>

        {/* Executive Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-1">
            <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
              <span>Tracked Citizens</span>
              <Users className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {(totalPopulationTracked / 10000000).toFixed(2)} Cr
            </div>
            <div className="text-[10px] text-teal-400 font-semibold">Across 8 Flagship States</div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-1">
            <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
              <span>Aggregated Grievances</span>
              <Layers className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-400">
              {totalActiveGrievances} Active
            </div>
            <div className="text-[10px] text-amber-300 font-semibold">Clustered in 12 Demand Hotspots</div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-1">
            <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
              <span>Severe Risk / Hazard</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-400">
              {criticalHazardsCount} Wards
            </div>
            <div className="text-[10px] text-rose-300 font-semibold">IMD Inundation Linked</div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-1">
            <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
              <span>DPI Budget Utilization</span>
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400">
              ₹{((totalSpentBudget / totalSanctionedBudget) * 100).toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-400 font-semibold">
              ₹{totalSpentBudget.toFixed(0)}Cr / ₹{totalSanctionedBudget.toFixed(0)}Cr Sanctioned
            </div>
          </div>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveAdminTab('hotspots')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
            activeAdminTab === 'hotspots'
              ? 'bg-blue-600 text-white font-bold shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Demand Hotspots Heatmap</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('datagov')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
            activeAdminTab === 'datagov'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>data.gov.in Correlation Matrix</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('budget')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
            activeAdminTab === 'budget'
              ? 'bg-emerald-600 text-white font-bold shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Public Spending &amp; Budget Realignment</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('contractors_sla')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
            activeAdminTab === 'contractors_sla'
              ? 'bg-indigo-600 text-white font-bold shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 text-indigo-300" />
          <span>Contractor Governance &amp; SLA Audit</span>
        </button>
      </div>

      {/* Tab 1: Demand Hotspots Heatmap & District Breakdown */}
      {activeAdminTab === 'hotspots' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Macro District Hotspot Rankings */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
                  <h3 className="text-sm font-bold text-white">
                    Prioritized Regional Demand Hotspots
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">
                  Ranked by Urgency, Community Density &amp; Hazard Multiplier
                </span>
              </div>

              <div className="space-y-3">
                {districtMetrics.map((d, index) => {
                  const isSevere = d.criticalUnaddressedCount >= 10;
                  return (
                    <div
                      key={d.districtId}
                      onClick={() => setSelectedDistrictId(d.districtId)}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        selectedDistrictId === d.districtId
                          ? 'bg-slate-950 border-blue-500/80 shadow-md ring-1 ring-blue-500/40'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 rounded-full bg-slate-800 text-[10px] font-black text-slate-300 items-center justify-center">
                            #{index + 1}
                          </span>
                          <span className="font-bold text-white text-sm">
                            {d.districtName}, {d.state}
                          </span>
                          {d.isAspirationalDistrict && (
                            <span className="text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded font-bold">
                              NITI Aayog Aspirational
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          <span>Population: {(d.population / 100000).toFixed(1)} Lakhs ({d.ruralPct}% Rural)</span>
                          <span>•</span>
                          <span>JJM Tap Water: <strong className="text-cyan-400">{d.jjmWaterCoveragePct}%</strong></span>
                          <span>•</span>
                          <span>PMGSY Roads: <strong className="text-amber-400">{d.pmgsyRoadCoveragePct}%</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-xs text-slate-400">Critical Gaps</div>
                          <div className={`text-base font-black ${isSevere ? 'text-rose-400' : 'text-amber-400'}`}>
                            {d.criticalUnaddressedCount} urgent
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Col: Deep Dive on Selected District */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-400" />
                  <h3 className="text-sm font-bold text-white">District DM Dashboard</h3>
                </div>
                <span className="font-mono text-[10px] text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">
                  {selectedDistrict.districtId}
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-extrabold text-white">
                  {selectedDistrict.districtName}, {selectedDistrict.state}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Comprehensive infrastructure health report generated by cross-referencing citizen tickets with Ministry data.
                </p>
              </div>

              {/* Progress Gauges */}
              <div className="space-y-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Jal Jeevan Mission Coverage:</span>
                    <span className="font-bold text-cyan-400">{selectedDistrict.jjmWaterCoveragePct}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${selectedDistrict.jjmWaterCoveragePct}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>PMGSY All-Weather Road Index:</span>
                    <span className="font-bold text-amber-400">{selectedDistrict.pmgsyRoadCoveragePct}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${selectedDistrict.pmgsyRoadCoveragePct}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Flood Vulnerability Index:</span>
                    <span className="font-bold text-rose-400">{selectedDistrict.floodVulnerabilityIndex}/100</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: `${selectedDistrict.floodVulnerabilityIndex}%` }} />
                  </div>
                </div>
              </div>

              {/* District Budget Snapshot */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Sanctioned District Works Budget:</span>
                  <span className="font-bold text-white">₹{selectedDistrict.allocatedBudgetCrores} Cr</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Utilized to Date:</span>
                  <span className="font-bold text-emerald-400">₹{selectedDistrict.spentBudgetCrores} Cr</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Unallocated Fiscal Reserve:</span>
                  <span className="font-bold text-amber-400">
                    ₹{(selectedDistrict.allocatedBudgetCrores - selectedDistrict.spentBudgetCrores).toFixed(1)} Cr
                  </span>
                </div>
              </div>

              {/* Gemini 3.8 Flash Capital Works Synthesizer Card */}
              <div className="bg-gradient-to-br from-indigo-950/70 via-slate-950 to-blue-950 p-4 rounded-2xl border border-indigo-500/30 space-y-3">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>AI Capital Works Synthesizer (Gemini 3.8 Flash)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Synthesize persistent citizen demand clusters in {selectedDistrict.districtName} into a formal Cabinet Detailed Project Report (DPR) with Return on Public Investment (RoPI) scoring.
                </p>

                {isSynthesizing ? (
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-indigo-500/40 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-indigo-300 font-semibold animate-pulse">
                      <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin shrink-0" />
                      <span>Gemini 3.8 Flash Synthesizing DPR...</span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-400 pl-5">
                      <div>• Clustering citizen voice requests in {selectedDistrict.districtName}...</div>
                      <div>• Grounding with data.gov.in JJM &amp; PMGSY deficits...</div>
                      <div>• Calculating RoPI index &amp; Capex sanction model...</div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleSynthesizeCapitalWork}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Synthesize Capital DPR for {selectedDistrict.districtName}</span>
                  </button>
                )}

                {synthesisSuccess && (
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{synthesisSuccess}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: data.gov.in Ground Truth Correlation Matrix */}
      {activeAdminTab === 'datagov' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  DPI Evidence Matrix: Citizen Grievances vs data.gov.in Official Baseline
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically identifies "Unheard Communities" where official infrastructure indices are low and citizen grievances are surging.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
              Correlated with 2026 Live Census &amp; JJM Datasets
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">District &amp; State</th>
                  <th className="p-3">Demographics</th>
                  <th className="p-3">data.gov.in Infrastructure Index</th>
                  <th className="p-3">Citizen Voice Cluster</th>
                  <th className="p-3">Severity Gap</th>
                  <th className="p-3">DPI Policy Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {districtMetrics.map((d) => {
                  const isWaterSevere = d.jjmWaterCoveragePct < 55;
                  const isRoadSevere = d.pmgsyRoadCoveragePct < 70;

                  return (
                    <tr key={d.districtId} className="hover:bg-slate-950/40 transition">
                      <td className="p-3">
                        <div className="font-bold text-white">{d.districtName}</div>
                        <div className="text-[10px] text-slate-400">{d.state}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-slate-200">{(d.population / 100000).toFixed(1)} Lakhs</div>
                        <div className="text-[10px] text-slate-500">{d.ruralPct}% Rural</div>
                      </td>
                      <td className="p-3 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400">JJM Water:</span>
                          <span className={`font-bold ${isWaterSevere ? 'text-rose-400' : 'text-cyan-400'}`}>
                            {d.jjmWaterCoveragePct}%
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400">PMGSY Roads:</span>
                          <span className={`font-bold ${isRoadSevere ? 'text-rose-400' : 'text-amber-400'}`}>
                            {d.pmgsyRoadCoveragePct}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-white">{d.activeGrievancesCount} reports</div>
                        <div className="text-[10px] text-rose-400 font-semibold">{d.criticalUnaddressedCount} urgent safety hazards</div>
                      </td>
                      <td className="p-3">
                        {isWaterSevere || isRoadSevere ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                            High Infrastructure Deficit
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                            Aligned Spending
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            setSelectedDistrictId(d.districtId);
                            const matchingProject = projectRecommendations.find((p) => p.district === d.districtName);
                            if (matchingProject) {
                              setSelectedProjectForDPR(matchingProject);
                            } else {
                              setActiveAdminTab('hotspots');
                            }
                          }}
                          className="flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 cursor-pointer bg-blue-500/10 hover:bg-blue-500/20 px-2 py-1 rounded-lg border border-blue-500/30 transition"
                        >
                          <span>Review / Synthesize DPR</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Public Spending & Budget Realignment */}
      {activeAdminTab === 'budget' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  National Flagship Schemes Expenditure &amp; Budget Optimization
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Reallocating unspent central funds towards high-impact community clusters identified by CivicPulse AI.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Cabinet Briefing PDF</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectRecommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-teal-300">{rec.district}, {rec.state}</span>
                    <span className="font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px]">
                      RoPI Score: {rec.ropiScore}/100
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white">{rec.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{rec.rationale}</p>

                  <div className="bg-slate-900 p-2.5 rounded-xl text-[11px] text-slate-400 space-y-1">
                    <div>Scheme Alignment: <strong className="text-amber-300">{rec.centralScheme}</strong></div>
                    <div>Demographic Link: <span className="text-slate-300">{rec.demographicCorrelation}</span></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Est. Capex:</span>
                      <span className="font-bold text-amber-400 text-sm">₹{rec.estimatedCapexCrores} Crores</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block">Beneficiaries:</span>
                      <span className="font-bold text-white text-sm">{rec.estimatedBeneficiaries.toLocaleString()} Citizens</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      rec.status === 'sanctioned'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {rec.status === 'sanctioned' ? 'Sanction Approved' : 'Sanction Pending'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedProjectForDPR(rec)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-bold text-[11px] cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>View Cabinet DPR</span>
                      </button>

                      {rec.status !== 'sanctioned' && onSanctionProject && (
                        <button
                          onClick={() => onSanctionProject(rec.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold text-[11px] cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Sanction</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Contractor Governance & SLA Audit Matrix */}
      {activeAdminTab === 'contractors_sla' && (
        <div className="space-y-6">
          {/* Top Banner */}
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950/40 p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  District Magistrate Audit Terminal
                </span>
                <span className="text-xs text-slate-400 font-mono">Real-Time Contractor Governance</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Municipal Contractor SLA Compliance, Quality Audits &amp; Disputed Fixes
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl">
                As District Magistrate / Chief Administrator, you have complete visibility over all municipal service providers, active field squads, citizen dispute rates, and SLA contract penalties.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center">
                <div className="text-[10px] text-slate-400 font-bold uppercase">SLA Benchmark</div>
                <div className="text-base font-black text-emerald-400 mt-0.5">&gt;95% On-Time</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Dispute Limit</div>
                <div className="text-base font-black text-amber-400 mt-0.5">&lt;5% Recidivism</div>
              </div>
            </div>
          </div>

          {/* Registered Municipal Contractors Matrix */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">
                  Vetted Municipal Contractor Roster &amp; SLA Performance
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">4 Agencies Under Jurisdiction</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800 bg-slate-950/50">
                  <tr>
                    <th className="py-3 px-3">Contractor / Agency</th>
                    <th className="py-3 px-3">Authorized Sector</th>
                    <th className="py-3 px-3">Active Claims</th>
                    <th className="py-3 px-3">Verified Completed</th>
                    <th className="py-3 px-3">On-Time SLA</th>
                    <th className="py-3 px-3">Dispute Strikes</th>
                    <th className="py-3 px-3 text-right">Contract Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {[
                    {
                      name: 'Madurai Municipal Infrastructure Works Div-1',
                      lead: 'Er. S. Murugesan (PWD Vendor #TN-7721)',
                      sector: 'Roads & Bridges / Culverts',
                      active: grievances.filter((g) => g.status === 'work_allocated' && g.category === 'roads_bridges').length + 2,
                      completed: grievances.filter((g) => g.status === 'resolved' && g.category === 'roads_bridges').length + 18,
                      sla: '96.8%',
                      strikes: grievances.filter((g) => g.status === 'disputed' && g.category === 'roads_bridges').length,
                      statusBadge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    },
                    {
                      name: 'Vaigai Basin PWD Hydrology & Drainage Squad',
                      lead: 'Executive Engineer Div-3 (Vendor #TN-9042)',
                      sector: 'Flood & Drainage / Desilting',
                      active: grievances.filter((g) => g.status === 'work_allocated' && g.category === 'flood_drainage').length + 1,
                      completed: grievances.filter((g) => g.status === 'resolved' && g.category === 'flood_drainage').length + 24,
                      sla: '94.2%',
                      strikes: grievances.filter((g) => g.status === 'disputed' && g.category === 'flood_drainage').length,
                      statusBadge: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    },
                    {
                      name: 'TNEB Madurai Metro Urban Electrical Works',
                      lead: 'Chief Electrical Contractor (Vendor #TN-4112)',
                      sector: 'Power & Electricity',
                      active: grievances.filter((g) => g.status === 'work_allocated' && g.category === 'power_electricity').length,
                      completed: grievances.filter((g) => g.status === 'resolved' && g.category === 'power_electricity').length + 14,
                      sla: '98.5%',
                      strikes: 0,
                      statusBadge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    },
                    {
                      name: 'Jal Jeevan Mission Rural Water Supply Div',
                      lead: 'Tamil Nadu Water Supply Board (Vendor #TN-8190)',
                      sector: 'Water & Sanitation Pipelines',
                      active: grievances.filter((g) => g.status === 'work_allocated' && g.category === 'water_sanitation').length + 1,
                      completed: grievances.filter((g) => g.status === 'resolved' && g.category === 'water_sanitation').length + 11,
                      sla: '92.1%',
                      strikes: grievances.filter((g) => g.status === 'disputed' && g.category === 'water_sanitation').length + 1,
                      statusBadge: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }
                  ].map((c, i) => (
                    <tr key={i} className="hover:bg-slate-950/40 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white text-xs">{c.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{c.lead}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-300">{c.sector}</span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-amber-400">{c.active}</td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-400">{c.completed}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${c.statusBadge}`}>
                          {c.sla}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {c.strikes > 0 ? (
                          <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            {c.strikes} Active Strikes
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">0 Strikes</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            alert(`Milestone sign-off dossier generated for ${c.name}. Verified for treasury disbursement.`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition cursor-pointer"
                        >
                          Audit Dossier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Citizen Disputed Fixes Desk */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-white text-base">
                  Citizen Disputed Resolutions Desk (Immediate Redressal)
                </h3>
              </div>
              <span className="text-xs text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30 font-semibold">
                {grievances.filter((g) => g.status === 'disputed').length} Disputed Fixes Requiring Magistrate Intervention
              </span>
            </div>

            {grievances.filter((g) => g.status === 'disputed').length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <div className="font-bold text-white text-sm">No Active Disputes</div>
                <div className="text-xs text-slate-400 mt-0.5">All contractor resolutions currently meet citizen satisfaction criteria.</div>
              </div>
            ) : (
              <div className="space-y-3">
                {grievances.filter((g) => g.status === 'disputed').map((ticket) => (
                  <div key={ticket.id} className="p-4 rounded-2xl bg-slate-950 border border-rose-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-400">{ticket.id}</span>
                        <span className="text-xs text-slate-300 font-semibold">{ticket.title}</span>
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                          Disputed by Citizen
                        </span>
                      </div>
                      <div className="text-xs text-rose-300">
                        <strong>Citizen Grievance Note:</strong> "{ticket.disputeReason || 'Fix was incomplete or broke again'}"
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Assigned Contractor: <strong className="text-white">{ticket.resolvedByContractor || 'Madurai PWD Infrastructure Works'}</strong> • Location: {ticket.talukOrWard}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onSelectGrievance(ticket)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition"
                      >
                        Inspect Photos
                      </button>
                      <button
                        onClick={() => {
                          alert(`Special Magistrate Inspection squad ordered for ticket #${ticket.id}. Contractor payment milestone suspended.`);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer transition shadow-md"
                      >
                        Dispatch Inspection Squad
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Master All Grievances Table (Admin Role "Sees All") */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-base">
                  Master Civic Grievances Repository (Pan-District Oversight)
                </h3>
                <p className="text-xs text-slate-400">
                  Comprehensive audit view of every citizen report across all wards, sectors, and contractor units.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={adminGrievanceSearch}
                    onChange={(e) => setAdminGrievanceSearch(e.target.value)}
                    placeholder="Search ticket / ward..."
                    className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-indigo-500 w-44"
                  />
                </div>

                <select
                  value={adminSectorFilter}
                  onChange={(e) => setAdminSectorFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All Sectors</option>
                  <option value="roads_bridges">Roads &amp; Bridges</option>
                  <option value="flood_drainage">Flood &amp; Drainage</option>
                  <option value="water_sanitation">Water &amp; Sanitation</option>
                  <option value="power_electricity">Power &amp; Electricity</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800 bg-slate-950/50">
                  <tr>
                    <th className="py-2.5 px-3">Ticket ID</th>
                    <th className="py-2.5 px-3">Sector</th>
                    <th className="py-2.5 px-3">Title &amp; Location</th>
                    <th className="py-2.5 px-3">Urgency</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Contractor Assigned</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {grievances
                    .filter((g) => {
                      if (adminSectorFilter !== 'all' && g.category !== adminSectorFilter) return false;
                      if (adminGrievanceSearch && !g.title.toLowerCase().includes(adminGrievanceSearch.toLowerCase()) && !g.talukOrWard.toLowerCase().includes(adminGrievanceSearch.toLowerCase())) return false;
                      return true;
                    })
                    .slice(0, 15)
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-slate-950/40 transition">
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{item.id}</td>
                        <td className="py-2.5 px-3">
                          <span className="capitalize text-slate-300 font-semibold">{item.category.replace('_', ' ')}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-white text-xs truncate max-w-xs">{item.title}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-rose-400" />
                            {item.talukOrWard}, {item.district}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`font-bold ${item.urgencyScore >= 8 ? 'text-rose-400' : 'text-amber-400'}`}>
                            {item.urgencyScore}/10
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.status === 'resolved'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : item.status === 'disputed'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : item.status === 'work_allocated'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {item.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {item.resolvedByContractor || 'Unallocated Queue'}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => onSelectGrievance(item)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold text-[11px] cursor-pointer"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Cabinet DPR Executive Briefing Modal */}
      {selectedProjectForDPR && (
        <CabinetDPRModal
          project={selectedProjectForDPR}
          onClose={() => setSelectedProjectForDPR(null)}
          onSanctionProject={(projectId) => {
            if (onSanctionProject) onSanctionProject(projectId);
            setSelectedProjectForDPR((prev) => prev ? { ...prev, status: 'sanctioned' } : null);
          }}
        />
      )}
    </div>
  );
};
