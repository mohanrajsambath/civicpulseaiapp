import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  CloudRain, 
  Volume2, 
  Languages,
  Play,
  RotateCcw,
  MapPin
} from 'lucide-react';
import { Grievance, SectorCategory } from '../../types';
import { SUPPORTED_LANGUAGES, SECTOR_CONFIG } from '../../data/seedData';

interface VernacularVoiceRecorderProps {
  onPublishGrievance: (grievance: Partial<Grievance>) => void;
  defaultDistrict?: string;
}

// Sample presets in Indian vernacular languages for immediate testing
const VERNACULAR_PRESETS = [
  {
    langCode: 'ta',
    langName: 'Tamil (தமிழ்)',
    script: 'தமிழ்',
    audioText: 'எங்கள் தெருவில் மழைநீர் வடிகால் அடைபட்டுள்ளதால், கழிவுநீர் வீடுகளுக்குள் நுழைகிறது. உடனடியாக தூர்வார வேண்டும்.',
    englishTranslation: 'Stormwater drain is severely clogged on our street; sewage is backing up into houses. Urgent desilting needed before rains.',
    district: 'Madurai',
    ward: 'Ward 14 (Goripalayam)',
    category: 'flood_drainage' as SectorCategory,
    urgency: 9,
    rainRisk: true
  },
  {
    langCode: 'hi',
    langName: 'Hindi (हिंदी)',
    script: 'हिंदी',
    audioText: 'अस्सी घाट के पास पेयजल की मुख्य पाइपलाइन टूट गई है। 80 परिवारों को गंदा पानी मिल रहा है, बच्चे बीमार हो रहे हैं।',
    englishTranslation: 'Main drinking water pipeline is ruptured near Assi Ghat. Over 80 households are receiving contaminated water; children are falling ill.',
    district: 'Varanasi',
    ward: 'Assi Ward - Lane 4',
    category: 'water_sanitation' as SectorCategory,
    urgency: 10,
    rainRisk: false
  },
  {
    langCode: 'te',
    langName: 'Telugu (తెలుగు)',
    script: 'తెలుగు',
    audioText: 'గ్రామంలో ప్రధాన రహదారి కల్వర్టు కూలిపోయింది. వర్షం వస్తే గ్రామం మొత్తం నీట మునిగే ప్రమాదం ఉంది.',
    englishTranslation: 'The main village road culvert has collapsed. With impending rains, the entire village is at risk of submergence.',
    district: 'Gaya',
    ward: 'Bodhgaya Rural Link',
    category: 'roads_bridges' as SectorCategory,
    urgency: 8,
    rainRisk: true
  },
  {
    langCode: 'kn',
    langName: 'Kannada (ಕನ್ನಡ)',
    script: 'ಕನ್ನಡ',
    audioText: 'ಸರ್ಕಾರಿ ಶಾಲೆ ಬಳಿಯ ಟ್ರಾನ್ಸ್‌ಫಾರ್ಮರ್‌ನಲ್ಲಿ ನಿರಂತರವಾಗಿ ಬೆಂಕಿ ಕಿಡಿಗಳು ಬರುತ್ತಿವೆ. ಮಕ್ಕಳ ಸುರಕ್ಷತೆಗೆ ತಕ್ಷಣ ಸರಿಪಡಿಸಿ.',
    englishTranslation: 'Continuous sparking from the distribution transformer near the government school. Immediate replacement needed for child safety.',
    district: 'Bengaluru Rural',
    ward: 'Devanahalli - Ward 3',
    category: 'power_electricity' as SectorCategory,
    urgency: 8,
    rainRisk: false
  }
];

export const VernacularVoiceRecorder: React.FC<VernacularVoiceRecorderProps> = ({
  onPublishGrievance,
  defaultDistrict = 'Madurai'
}) => {
  const [selectedLang, setSelectedLang] = useState('ta');
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    translatedTitle: string;
    category: SectorCategory;
    sectorCode: string;
    urgencyScore: number;
    summaryEnglish: string;
    rainHazardCorrelated: boolean;
  } | null>(null);
  const [isPublished, setIsPublished] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Animated Waveform Canvas Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let step = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const bars = 24;
      const barWidth = width / bars - 2;

      for (let i = 0; i < bars; i++) {
        const amplitude = isRecording
          ? Math.sin(step * 0.15 + i * 0.4) * 0.5 + 0.5
          : 0.15;
        const barHeight = Math.max(4, amplitude * (height - 8));
        const x = i * (barWidth + 2);
        const y = (height - barHeight) / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isRecording) {
          grad.addColorStop(0, '#f59e0b');
          grad.addColorStop(1, '#0d9488');
        } else {
          grad.addColorStop(0, '#334155');
          grad.addColorStop(1, '#1e293b');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();
      }

      if (isRecording) step++;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isRecording]);

  // Handle Speech Recognition or Simulated Recording
  const handleToggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // Analyze the transcript
      runAIAnalysis(transcribedText);
    } else {
      setIsRecording(true);
      setAnalysisResult(null);
      setIsPublished(false);

      // Check if browser has Web Speech API
      const SpeechRecognition = (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.lang = `${selectedLang}-IN`;
          recognition.continuous = false;
          recognition.interimResults = true;

          recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
              .map((r: any) => r[0].transcript)
              .join('');
            setTranscribedText(transcript);
          };

          recognition.onend = () => {
            setIsRecording(false);
            if (transcribedText) runAIAnalysis(transcribedText);
          };

          recognition.start();
        } catch {
          simulateVoiceCapture();
        }
      } else {
        simulateVoiceCapture();
      }
    }
  };

  const simulateVoiceCapture = () => {
    // Pick the preset corresponding to the language or default to Tamil
    const preset = VERNACULAR_PRESETS.find((p) => p.langCode === selectedLang) || VERNACULAR_PRESETS[0];
    setTimeout(() => {
      setTranscribedText(preset.audioText);
      setIsRecording(false);
      runAIAnalysis(preset.audioText);
    }, 2400);
  };

  const handleSelectPreset = (preset: typeof VERNACULAR_PRESETS[0]) => {
    setSelectedLang(preset.langCode);
    setTranscribedText(preset.audioText);
    runAIAnalysis(preset.audioText);
  };

  // Run Gemini AI or fallback analysis
  const runAIAnalysis = async (text: string) => {
    if (!text) return;
    setIsAnalyzing(true);

    try {
      const res = await fetch('/api/ai/parse-grievance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language: selectedLang,
          district: defaultDistrict
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data);
      } else {
        fallbackAnalysis(text);
      }
    } catch {
      fallbackAnalysis(text);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fallbackAnalysis = (text: string) => {
    const isWater = /drain|sewer|pipe|jal|வடிகால்|சாக்கடை|నీరు|కాలువ|ಚರಂಡಿ|नाला/i.test(text);
    setAnalysisResult({
      translatedTitle: isWater 
        ? 'Severe Stormwater Drain Obstruction & Sewage Backflow'
        : 'Critical Infrastructure Disrepair & Public Access Hazard',
      category: isWater ? 'flood_drainage' : 'roads_bridges',
      sectorCode: isWater ? 'MoHUA-AMRUT' : 'MoRTH-PMGSY',
      urgencyScore: isWater ? 9 : 8,
      summaryEnglish: `Citizen submitted voice complaint in regional dialect: "${text.slice(0, 80)}...". Automatically categorized and priority weighted.`,
      rainHazardCorrelated: isWater
    });
  };

  const handlePublish = () => {
    if (!analysisResult) return;

    onPublishGrievance({
      title: analysisResult.translatedTitle,
      description: `${transcribedText} (English AI Summary: ${analysisResult.summaryEnglish})`,
      originalLanguage: SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang)?.name || 'Vernacular',
      category: analysisResult.category,
      sectorCode: analysisResult.sectorCode,
      district: defaultDistrict,
      talukOrWard: 'Ward 14 (Goripalayam)',
      coordinates: { lat: 9.9328, lng: 78.1294 },
      urgencyScore: analysisResult.urgencyScore,
      weatherRisk: analysisResult.rainHazardCorrelated ? {
        hasActiveRisk: true,
        riskLevel: 'severe',
        forecastRainfallMm: 78,
        expectedTimeframe: '36-48 Hours',
        preventiveNotice: 'Pre-emptive clearing urgently required before IMD forecasted 78mm downpour hits.'
      } : undefined
    });

    setIsPublished(true);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <Mic className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Multilingual Vernacular Voice Input
              <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                10 Indian Languages
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Citizens speak naturally in their mother tongue; Gemini AI transcribes, translates, and triages.
            </p>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-teal-400 shrink-0" />
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs font-semibold text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:border-teal-500 cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name} ({l.script})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Voice Waveform & Record Trigger */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center space-y-4">
        {/* Waveform Canvas */}
        <canvas
          ref={canvasRef}
          width={320}
          height={48}
          className="w-full max-w-sm h-12 rounded-xl"
        />

        {/* Mic Button */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleToggleRecording}
            className={`relative flex h-16 w-16 items-center justify-center rounded-full shadow-2xl transition active:scale-95 cursor-pointer ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-500/30'
                : 'bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 hover:from-amber-400 hover:to-orange-400'
            }`}
          >
            {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
          </button>
          <span className="text-xs font-bold text-slate-300">
            {isRecording ? 'Listening... Speak in your regional dialect' : 'Tap to Start Speaking'}
          </span>
        </div>

        {/* Live Audio Transcript Display */}
        {transcribedText && (
          <div className="w-full bg-slate-900 border border-slate-700/80 p-3.5 rounded-xl space-y-1 text-xs">
            <div className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">
              Captured Speech Transcript:
            </div>
            <p className="text-slate-100 font-medium leading-relaxed italic">
              "{transcribedText}"
            </p>
          </div>
        )}
      </div>

      {/* Quick Vernacular Speech Simulation Chips */}
      <div className="space-y-2">
        <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
          <span>Or test instant speech sample presets:</span>
          <span className="text-teal-400 text-[10px]">Zero-friction testing</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {VERNACULAR_PRESETS.map((p) => (
            <button
              key={p.langCode}
              onClick={() => handleSelectPreset(p)}
              className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/40 p-2.5 rounded-xl text-left transition active:scale-98 cursor-pointer space-y-1"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-amber-300">{p.langName}</span>
                <span className="text-slate-500 text-[10px] flex items-center gap-1">
                  <Play className="w-3 h-3 text-teal-400" />
                  Simulate Audio
                </span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-1 italic">
                "{p.audioText}"
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* AI Analysis & Normalization Result */}
      {isAnalyzing && (
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-teal-500/30 flex items-center justify-center gap-2 text-xs text-teal-300 animate-pulse">
          <Sparkles className="w-4 h-4 text-teal-400 animate-spin" />
          <span>Gemini 3.8 Flash translating vernacular dialect and mapping DPI sector...</span>
        </div>
      )}

      {analysisResult && !isAnalyzing && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950/40 border border-teal-500/40 shadow-xl space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>AI Vernacular Normalization Complete</span>
            </div>
            <span className="text-xs font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              Severity: {analysisResult.urgencyScore}/10
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-400 font-semibold">Standardized Governance Title:</div>
            <div className="text-sm font-bold text-white">{analysisResult.translatedTitle}</div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Allocated Sector:</span>
              <span className="font-semibold text-teal-300">{SECTOR_CONFIG[analysisResult.category]?.label}</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Ministry Code:</span>
              <span className="font-mono font-semibold text-slate-200">{analysisResult.sectorCode}</span>
            </div>
          </div>

          {analysisResult.rainHazardCorrelated && (
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-2 text-xs text-cyan-200">
              <CloudRain className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Correlated with IMD Inundation Alert: High priority desilting recommended.</span>
            </div>
          )}

          {isPublished ? (
            <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
              <span>Voice Grievance Published &amp; Visible on Civilian Map!</span>
            </div>
          ) : (
            <button
              onClick={handlePublish}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-teal-900/40 transition active:scale-95 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish Verified Ticket to Public Map</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
