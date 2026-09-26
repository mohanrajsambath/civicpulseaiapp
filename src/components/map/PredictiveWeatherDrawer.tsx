import React, { useState } from 'react';
import { 
  CloudRain, 
  AlertTriangle, 
  Send, 
  CheckCircle2, 
  Calendar, 
  ShieldAlert, 
  ExternalLink,
  Flame,
  ArrowRight,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { WeatherAlert, Grievance } from '../../types';

interface PredictiveWeatherDrawerProps {
  weatherAlerts: WeatherAlert[];
  grievances: Grievance[];
  onSelectGrievance: (grievance: Grievance) => void;
  onDispatchPreemptiveNotice?: (district: string, alertId: string) => void;
}

export const PredictiveWeatherDrawer: React.FC<PredictiveWeatherDrawerProps> = ({
  weatherAlerts,
  grievances,
  onSelectGrievance,
  onDispatchPreemptiveNotice
}) => {
  const [notifiedAlerts, setNotifiedAlerts] = useState<Record<string, boolean>>({});

  // Find grievances that are in districts with active weather alerts and relate to drainage/culverts
  const vulnerableSpots = grievances.filter(
    (g) => g.weatherRisk?.hasActiveRisk || g.category === 'flood_drainage'
  );

  const handleNotifyProvider = (alertId: string, district: string) => {
    setNotifiedAlerts((prev) => ({ ...prev, [alertId]: true }));
    if (onDispatchPreemptiveNotice) {
      onDispatchPreemptiveNotice(district, alertId);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
            <CloudRain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white">
                Predictive Weather &amp; GEE Satellite Alerts
              </h3>
              <span className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Early Preventive Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Cross-referencing reported drainage choke points with 48h meteorological rainfall models to avert urban flooding.
            </p>
          </div>
        </div>
      </div>

      {/* Weather Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {weatherAlerts.map((alert) => {
          const isNotified = notifiedAlerts[alert.alertId];
          const isSevere = alert.severity === 'emergency' || alert.severity === 'severe';

          return (
            <div
              key={alert.alertId}
              className={`rounded-2xl p-4 border transition flex flex-col justify-between space-y-3 ${
                isSevere
                  ? 'bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 border-rose-500/40 shadow-lg shadow-rose-950/20'
                  : 'bg-slate-950/80 border-cyan-500/30 shadow-md'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className={`px-2 py-0.5 rounded-md font-extrabold uppercase text-[10px] border ${
                    isSevere 
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' 
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  }`}>
                    {alert.warningType.replace('_', ' ')}
                  </span>
                  <span className="text-slate-400 text-[11px] font-semibold flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {alert.timeframe}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <h4 className="text-base font-bold text-white">
                    {alert.district}, {alert.state}
                  </h4>
                  <span className="text-xl font-black text-cyan-400">
                    {alert.forecastMm}<span className="text-xs font-normal text-slate-400">mm rain</span>
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {alert.recommendedAction}
                </p>

                {/* Affected Wards List */}
                <div className="pt-1">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    High Vulnerability Zones:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {alert.affectedWards.map((w, idx) => (
                      <span key={idx} className="bg-slate-900 border border-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded-md">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button: Citizen Pre-emptive Alert to Contractor/Municipal Provider */}
              <div className="pt-2 border-t border-slate-800/80">
                {isNotified ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Preventive Alert Sent to Municipal Control Room!</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleNotifyProvider(alert.alertId, alert.district)}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs py-2 px-3 rounded-xl shadow-md transition active:scale-95 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Alert Service Provider for Pre-emptive Desilting</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Linked Choked Drains in Alerted Wards */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Unaddressed Drainage Issues Under Imminent Downpour Threat</span>
          </div>
          <span className="text-teal-400 font-semibold text-[11px]">
            {vulnerableSpots.length} Choke Points Monitored
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {vulnerableSpots.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectGrievance(item)}
              className="group bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 p-3.5 rounded-2xl cursor-pointer transition shadow-md flex items-center justify-between gap-3"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/30">
                    High Vulnerability
                  </span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    {item.talukOrWard}, {item.district}
                  </span>
                </div>
                <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition line-clamp-1">
                  {item.title}
                </div>
                <div className="text-[11px] text-slate-400">
                  Forecast: <span className="text-cyan-300 font-semibold">{item.weatherRisk?.forecastRainfallMm || 70}mm</span> in next 48h
                </div>
              </div>

              <div className="flex items-center gap-1 text-slate-400 group-hover:text-cyan-300 shrink-0">
                <span className="text-xs font-bold">Review</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
