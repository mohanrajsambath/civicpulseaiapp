import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition active:scale-95 cursor-pointer"
        title="Install CivicPulse AI to Home Screen"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span>Add to iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  Install on iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-3 space-y-2.5 text-xs text-slate-300">
                <p className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 font-bold text-amber-400">1</span>
                  <span>Tap the <strong>Share</strong> button in the Safari toolbar at the bottom of the screen.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 font-bold text-amber-400">2</span>
                  <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 font-bold text-amber-400">3</span>
                  <span>Launch <strong>CivicPulse</strong> with native performance and offline access.</span>
                </p>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-slate-800 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
              >
                Understood
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
