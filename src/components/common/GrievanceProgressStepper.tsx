import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Send, 
  Wrench, 
  Camera, 
  ShieldCheck, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  User,
  Building,
  Sparkles
} from 'lucide-react';
import { Grievance, GrievanceStatus, GrievanceTimelineItem } from '../../types';

interface GrievanceProgressStepperProps {
  grievance: Grievance;
}

interface StepDefinition {
  key: string;
  label: string;
  subLabel: string;
  icon: React.ElementType;
}

export const GrievanceProgressStepper: React.FC<GrievanceProgressStepperProps> = ({ grievance }) => {
  const [showFullTimeline, setShowFullTimeline] = useState(false);

  const steps: StepDefinition[] = [
    {
      key: 'submitted',
      label: 'Submitted',
      subLabel: 'Citizen Logged',
      icon: Send,
    },
    {
      key: 'allocated',
      label: 'Allocated',
      subLabel: 'Work Order Issued',
      icon: Building,
    },
    {
      key: 'in_progress',
      label: 'In Progress',
      subLabel: 'Field Squad on Site',
      icon: Wrench,
    },
    {
      key: 'resolved',
      label: 'Resolved',
      subLabel: 'Photo Certified',
      icon: Camera,
    },
    {
      key: 'verified',
      label: grievance.status === 'disputed' ? 'Disputed' : 'Verified',
      subLabel: grievance.status === 'disputed' ? 'Collector Escalation' : 'Citizen Closure',
      icon: grievance.status === 'disputed' ? AlertTriangle : ShieldCheck,
    }
  ];

  // Map grievance status to numeric step index (0 to 4)
  const getStepIndex = (status: GrievanceStatus, timeline: GrievanceTimelineItem[]): number => {
    if (status === 'disputed') return 4;
    
    // Check if citizen closed
    const hasCitizenClosed = timeline.some(t => 
      t.stage.toLowerCase().includes('citizen closed') || 
      t.stage.toLowerCase().includes('satisfied') ||
      t.stage.toLowerCase().includes('accepted')
    );
    if (hasCitizenClosed) return 4;

    if (status === 'resolved') return 3;

    // Check if field crew is in progress
    const hasWorkInProgress = timeline.some(t => 
      t.stage.toLowerCase().includes('progress') ||
      t.stage.toLowerCase().includes('field') ||
      t.stage.toLowerCase().includes('underway')
    );
    if (hasWorkInProgress) return 2;

    if (status === 'work_allocated' || status === 'ai_triaged') return 1;
    return 0; // submitted
  };

  const currentStepIndex = getStepIndex(grievance.status, grievance.timeline);

  // Match timeline events to relevant steps for rich contextual tooltip/info
  const getTimelineForStep = (stepIndex: number): GrievanceTimelineItem | undefined => {
    const timeline = grievance.timeline;
    if (stepIndex === 0) {
      return timeline.find(t => 
        t.stage.toLowerCase().includes('submitted') || 
        t.stage.toLowerCase().includes('logged')
      ) || timeline[0];
    }
    if (stepIndex === 1) {
      return timeline.find(t => 
        t.stage.toLowerCase().includes('allocated') || 
        t.stage.toLowerCase().includes('review') ||
        t.stage.toLowerCase().includes('assigned')
      );
    }
    if (stepIndex === 2) {
      return timeline.find(t => 
        t.stage.toLowerCase().includes('progress') || 
        t.stage.toLowerCase().includes('underway') ||
        t.stage.toLowerCase().includes('mobilized')
      );
    }
    if (stepIndex === 3) {
      return timeline.find(t => 
        t.stage.toLowerCase().includes('resolved') || 
        t.stage.toLowerCase().includes('completed') ||
        t.stage.toLowerCase().includes('certified')
      );
    }
    if (stepIndex === 4) {
      return timeline.find(t => 
        t.stage.toLowerCase().includes('closed') || 
        t.stage.toLowerCase().includes('disputed') ||
        t.stage.toLowerCase().includes('escalated')
      );
    }
    return undefined;
  };

  return (
    <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-4">
      {/* Header with Live Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              grievance.status === 'resolved' 
                ? 'bg-emerald-400' 
                : grievance.status === 'disputed' 
                ? 'bg-rose-400' 
                : 'bg-amber-400'
            }`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              grievance.status === 'resolved' 
                ? 'bg-emerald-500' 
                : grievance.status === 'disputed' 
                ? 'bg-rose-500' 
                : 'bg-amber-500'
            }`} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Live Resolution Stepper
          </span>
        </div>

        <div className="text-xs">
          <span className="text-slate-500 text-[11px] mr-1.5">Current Stage:</span>
          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
            grievance.status === 'resolved'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : grievance.status === 'disputed'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
          }`}>
            {grievance.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Stepper Graphic Bar */}
      <div className="relative pt-2 pb-1">
        {/* Connecting Track Line */}
        <div className="absolute top-6 left-6 right-6 h-1 bg-slate-800 -translate-y-1/2 z-0 hidden sm:block">
          <div 
            className="h-full bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-400 transition-all duration-700 rounded-full"
            style={{ 
              width: `${Math.min(100, (currentStepIndex / (steps.length - 1)) * 100)}%` 
            }}
          />
        </div>

        {/* Step Nodes */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-2 relative z-10">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isFuture = index > currentStepIndex;
            const stepTimeline = getTimelineForStep(index);

            return (
              <div 
                key={step.key} 
                className={`flex flex-col items-center text-center p-2 rounded-xl transition ${
                  isCurrent 
                    ? 'bg-slate-900 border border-teal-500/40 shadow-lg shadow-teal-500/5' 
                    : 'bg-transparent'
                }`}
              >
                {/* Node Circle */}
                <div 
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-500 ${
                    isCompleted
                      ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20 shadow-md shadow-emerald-500/20'
                      : isCurrent
                      ? grievance.status === 'disputed'
                        ? 'bg-rose-500 text-white ring-4 ring-rose-500/30 shadow-lg animate-pulse'
                        : 'bg-teal-500 text-slate-950 ring-4 ring-teal-500/30 shadow-lg shadow-teal-500/30 animate-pulse'
                      : 'bg-slate-900 text-slate-500 border border-slate-700'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </div>

                {/* Node Label */}
                <div className="mt-2 space-y-0.5">
                  <div className={`text-xs font-bold ${
                    isCompleted 
                      ? 'text-emerald-300' 
                      : isCurrent 
                      ? grievance.status === 'disputed' ? 'text-rose-400' : 'text-teal-300'
                      : 'text-slate-400'
                  }`}>
                    {step.label}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight hidden sm:block">
                    {step.subLabel}
                  </div>
                  {stepTimeline && (
                    <div className="text-[10px] font-mono text-slate-400 mt-1">
                      {stepTimeline.timestamp}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Latest Step Highlight Card */}
      {grievance.timeline.length > 0 && (
        <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 text-xs flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 shrink-0 mt-0.5 border border-teal-500/20">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="space-y-0.5 flex-1 min-w-0">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-teal-300">
                Latest Activity: {grievance.timeline[grievance.timeline.length - 1].stage}
              </span>
              <span className="text-slate-400 font-mono text-[10px]">
                {grievance.timeline[grievance.timeline.length - 1].timestamp}
              </span>
            </div>
            <p className="text-slate-200 truncate">
              {grievance.timeline[grievance.timeline.length - 1].title}
            </p>
            <div className="text-[10px] text-slate-400">
              Actor: <span className="text-slate-300 font-medium">{grievance.timeline[grievance.timeline.length - 1].actor}</span>
            </div>
          </div>
        </div>
      )}

      {/* Accordion Toggle for Detailed Timeline History */}
      <div className="border-t border-slate-800/80 pt-2">
        <button
          onClick={() => setShowFullTimeline(!showFullTimeline)}
          className="w-full flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-slate-200 transition py-1 cursor-pointer"
        >
          <span>Detailed Accountability Event Log ({grievance.timeline.length} events)</span>
          {showFullTimeline ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showFullTimeline && (
          <div className="mt-3 space-y-2.5 border-l-2 border-teal-500/30 pl-3 ml-2 text-xs">
            {grievance.timeline.map((event, idx) => (
              <div key={idx} className="space-y-1 relative pb-1">
                {/* Dot */}
                <div className="absolute -left-[19px] top-1.5 w-2 h-2 rounded-full bg-teal-400 ring-2 ring-slate-950" />
                
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-300">{event.stage}</span>
                  <span className="text-[10px] font-mono text-slate-400">{event.timestamp}</span>
                </div>
                <div className="text-slate-200 leading-snug">{event.title}</div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-500" />
                  <span>Actor: {event.actor}</span>
                </div>
                {event.notes && (
                  <div className="text-[11px] bg-slate-900/60 p-2 rounded-lg border border-slate-800 text-amber-300/90 italic">
                    "{event.notes}"
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
