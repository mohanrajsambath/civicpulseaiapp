import React from 'react';
import { 
  Building2, 
  CheckCircle2, 
  Printer, 
  X, 
  FileText, 
  TrendingUp, 
  ShieldCheck, 
  Users, 
  Coins, 
  Sparkles,
  Calendar,
  Layers,
  MapPin,
  Clock,
  Landmark,
  ShieldAlert,
  BarChart2,
  CheckCircle
} from 'lucide-react';
import { ProjectRecommendation } from '../../types';
import { SECTOR_CONFIG } from '../../data/seedData';

interface CabinetDPRModalProps {
  project: ProjectRecommendation;
  onClose: () => void;
  onSanctionProject: (projectId: string) => void;
}

export const CabinetDPRModal: React.FC<CabinetDPRModalProps> = ({
  project,
  onClose,
  onSanctionProject
}) => {
  const sector = SECTOR_CONFIG[project.sector];

  const breakdown = project.ropiBreakdown || {
    socioeconomicEquityScore: Math.min(98, project.ropiScore + 1),
    infrastructureDeficitScore: Math.min(99, project.ropiScore - 2),
    climateResilienceScore: Math.min(97, project.ropiScore + 2),
    costEfficiencyScore: Math.min(95, project.ropiScore - 4),
    schemeAlignmentScore: 96
  };

  const centralCrores = project.fundingModel?.centralAmountCrores ?? Number((project.estimatedCapexCrores * 0.6).toFixed(2));
  const stateCrores = project.fundingModel?.stateAmountCrores ?? Number((project.estimatedCapexCrores * 0.4).toFixed(2));

  const milestones = project.milestones && project.milestones.length > 0 ? project.milestones : [
    { quarter: 'Q1 (Month 1-3)', task: 'Topographic LiDAR Survey & DPR Technical Sanction' },
    { quarter: 'Q2 (Month 4-7)', task: 'Precast Subterranean Conduit Installation & Drainage Desilting' },
    { quarter: 'Q3 (Month 8-10)', task: 'IoT Telemetry Flow Sensors & Citizen Feedback Integration' },
    { quarter: 'Q4 (Month 11-12)', task: 'Final Verification, Geo-tagging & Handover to Municipal Corporation' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-slate-100">
        {/* Print-Ready Official Cabinet Header */}
        <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950 p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                <Landmark className="w-3 h-3 text-amber-400" />
                Government of India • Ministry Cabinet Note
              </span>
              <span className="text-xs font-mono text-slate-400">Ref #{project.id}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                project.status === 'sanctioned'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {project.status === 'sanctioned' ? 'Sanction Approved' : 'Sanction Pending'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              Detailed Project Report (DPR) Executive Briefing
            </h2>
            <p className="text-xs text-slate-300">
              Formulated by CivicPulse AI for Expenditure &amp; Administrative Sanction under National Flagship Schemes
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer shadow transition active:scale-95"
              title="Print Cabinet Note / Save PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body / Official Document Canvas */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-200">
          {/* Key Metadata Table */}
          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Target Jurisdiction</span>
              <span className="font-bold text-white text-sm">{project.district}, {project.state}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Flagship Scheme</span>
              <span className="font-bold text-amber-300">{project.centralScheme}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Sanction Capex</span>
              <span className="font-bold text-emerald-400 text-sm">₹{project.estimatedCapexCrores} Crores</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Direct Beneficiaries</span>
              <span className="font-bold text-white text-sm">{project.estimatedBeneficiaries.toLocaleString()} Citizens</span>
            </div>
          </div>

          {/* Project Title */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-teal-400"></span>
              Official Project Nomenclature:
            </div>
            <h3 className="text-base sm:text-lg font-black text-white leading-snug">
              {project.title}
            </h3>
          </div>

          {/* Return on Public Investment (RoPI) Rating & Multi-Factor Breakdown */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 p-4 sm:p-5 rounded-2xl border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-black text-emerald-300 text-sm sm:text-base">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Return on Public Investment (RoPI) Index: {project.ropiScore} / 100</span>
                </div>
                <p className="text-xs text-slate-300">
                  Calculated by Gemini AI weighting community demand frequency, socioeconomic uplift, disaster avoidance, and capital longevity.
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 font-black text-xl border border-emerald-500/40 shrink-0">
                {project.ropiScore}%
              </div>
            </div>

            {/* RoPI Factor Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-emerald-500/20 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Socioeconomic Equity &amp; Inclusivity:</span>
                  <span className="font-bold text-emerald-400">{breakdown.socioeconomicEquityScore}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${breakdown.socioeconomicEquityScore}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>data.gov.in Baseline Deficit Offset:</span>
                  <span className="font-bold text-cyan-400">{breakdown.infrastructureDeficitScore}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${breakdown.infrastructureDeficitScore}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Climate &amp; Disaster Risk Mitigation:</span>
                  <span className="font-bold text-amber-400">{breakdown.climateResilienceScore}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${breakdown.climateResilienceScore}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Capital Efficiency &amp; Life-Cycle ROI:</span>
                  <span className="font-bold text-teal-300">{breakdown.costEfficiencyScore}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-teal-400 h-full rounded-full" style={{ width: `${breakdown.costEfficiencyScore}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Strategic Rationale & Citizen Feedback Evidence */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider border-b border-slate-800 pb-1 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              1. Citizen Demand &amp; Problem Statement
            </h4>
            <p className="leading-relaxed text-slate-300">
              {project.rationale}
            </p>
          </div>

          {/* Section 2: data.gov.in Demographic & Infrastructure Correlation */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider border-b border-slate-800 pb-1 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              2. data.gov.in Ground Truth &amp; Equity Correlation
            </h4>
            <p className="leading-relaxed text-slate-300">
              {project.demographicCorrelation}
            </p>
          </div>

          {/* Section 3: Phasing & Financial Architecture */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider border-b border-slate-800 pb-1 flex items-center gap-2">
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
              3. Capex Allocation &amp; Scheme Funding Model (60:40 Centre-State Share)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Central Ministry Share (60%):</span>
                <span className="font-bold text-white text-sm">₹{centralCrores} Cr</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block">State Matching Fund (40%):</span>
                <span className="font-bold text-white text-sm">₹{stateCrores} Cr</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Target Execution Window:</span>
                <span className="font-bold text-teal-300 text-sm">8–12 Months</span>
              </div>
            </div>
          </div>

          {/* Section 4: Phased Implementation Milestones */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider border-b border-slate-800 pb-1 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              4. Implementation Schedule &amp; Milestones
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {milestones.map((m, idx) => (
                <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-start gap-2">
                  <span className="text-teal-400 font-bold shrink-0">{m.quarter}:</span>
                  <span className="text-slate-300">{m.task}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Official Sanction Status & Action */}
          <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Current Administrative Status:</span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[11px] ${
                project.status === 'sanctioned'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {project.status.replace('_', ' ')}
              </span>
            </div>

            {project.status === 'sanctioned' ? (
              <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/30">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Administrative Sanction Issued &amp; Funds Released</span>
              </div>
            ) : (
              <button
                onClick={() => onSanctionProject(project.id)}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg transition active:scale-95 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Issue Official Administrative Sanction</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
