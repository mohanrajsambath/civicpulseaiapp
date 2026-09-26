import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Camera, 
  Mic, 
  Send, 
  X, 
  AlertTriangle, 
  CloudRain, 
  Sparkles,
  CheckCircle2,
  Crosshair,
  Languages,
  Info
} from 'lucide-react';
import { SectorCategory, Grievance } from '../../types';
import { SECTOR_CONFIG, SUPPORTED_LANGUAGES, DISTRICT_METRICS } from '../../data/seedData';

interface ReportIssueModalProps {
  initialCoords?: { lat: number; lng: number; districtName: string; ward: string };
  onClose: () => void;
  onSubmitGrievance: (grievance: Partial<Grievance>) => void;
}

// Helper to determine native language based on location/coordinates
export const getLocationLanguage = (districtName?: string, lat?: number, lng?: number) => {
  const d = (districtName || '').toLowerCase();
  
  if (d.includes('madurai') || d.includes('chennai') || d.includes('coimbatore') || d.includes('tamil')) {
    return { 
      value: 'Tamil (தமிழ்)', 
      name: 'Tamil', 
      script: 'தமிழ்', 
      region: 'Tamil Nadu',
      placeholderTitle: 'எ.கா: சாக்கடை அடைப்பு, சாலையில் தேங்கிய மழைநீர்...',
      placeholderDesc: 'பிரச்சனையின் தீவிரத்தன்மை, எத்தனை நாட்களாக உள்ளது மற்றும் பாதிக்கப்பட்ட வீடுகளின் எண்ணிக்கையை விவரிக்கவும்...'
    };
  }
  if (d.includes('kamrup') || d.includes('assam') || d.includes('guwahati') || d.includes('dibrugarh')) {
    return { 
      value: 'Assamese (অসমীয়া)', 
      name: 'Assamese', 
      script: 'অসমীয়া', 
      region: 'Assam',
      placeholderTitle: 'যেনে: নলা বন্ধ হৈ পানী জমা হোৱা, বাটৰ গাঁত...',
      placeholderDesc: 'সমস্যাটোৰ গভীৰতা আৰু প্ৰভাৱিত লোকসকলৰ বিষয়ে লিখক...'
    };
  }
  if (d.includes('bengaluru') || d.includes('bangalore') || d.includes('karnataka') || d.includes('mysuru')) {
    return { 
      value: 'Kannada (ಕನ್ನಡ)', 
      name: 'Kannada', 
      script: 'ಕನ್ನಡ', 
      region: 'Karnataka',
      placeholderTitle: 'ಉದಾ: ಚರಂಡಿ ಉಕ್ಕಿ ಹರಿಯುವುದು, ರಸ್ತೆ ಹೊಂಡ ಮತ್ತು ನೀರು ನಿಲ್ಲುವುದು...',
      placeholderDesc: 'ಸಮಸ್ಯೆಯ ತೀವ್ರತೆ ಮತ್ತು ಬಾಧಿತ ಮನೆಗಳ ವಿವರಗಳನ್ನು ಬರೆಯಿರಿ...'
    };
  }
  if (d.includes('pune') || d.includes('mumbai') || d.includes('maharashtra') || d.includes('nagpur')) {
    return { 
      value: 'Marathi (मराठी)', 
      name: 'Marathi', 
      script: 'मराठी', 
      region: 'Maharashtra',
      placeholderTitle: 'उदा: गटार तुंबणे, रस्त्यावरील खड्डे आणि पाणी साचणे...',
      placeholderDesc: 'समस्येचे गांभीर्य आणि बाधित नागरिकांची माहिती लिहा...'
    };
  }
  if (d.includes('hyderabad') || d.includes('telangana') || d.includes('andhra') || d.includes('visakhapatnam')) {
    return { 
      value: 'Telugu (తెలుగు)', 
      name: 'Telugu', 
      script: 'తెలుగు', 
      region: 'Andhra Pradesh / Telangana',
      placeholderTitle: 'ఉదా: మురుగు కాలువ బ్లాక్ కావడం, రోడ్డుపై నీరు నిలవడం...',
      placeholderDesc: 'సమస్య తీవ్రత మరియు ప్రభావిత గృహాల వివరాలు తెలపండి...'
    };
  }
  if (d.includes('kolkata') || d.includes('bengal')) {
    return { 
      value: 'Bengali (বাংলা)', 
      name: 'Bengali', 
      script: 'বাংলা', 
      region: 'West Bengal',
      placeholderTitle: 'যেমন: ড্রেন বন্ধ হয়ে জল জমা, ভাঙা রাস্তা...',
      placeholderDesc: 'সমস্যার তীব্রতা এবং কতগুলো পরিবার প্রভাবিত তা জানান...'
    };
  }
  if (d.includes('ahmedabad') || d.includes('gujarat') || d.includes('surat')) {
    return { 
      value: 'Gujarati (ગુજરાતી)', 
      name: 'Gujarati', 
      script: 'ગુજરાતી', 
      region: 'Gujarat',
      placeholderTitle: 'દા.ત: ગટર બ્લોક થવી, રસ્તા પર પાણી ભરાવું...',
      placeholderDesc: 'સમસ્યાની ગંભીરતા અને પ્રભાવિત પરિવારોની વિગત જણાવો...'
    };
  }
  if (d.includes('varanasi') || d.includes('gaya') || d.includes('uttar pradesh') || d.includes('bihar') || d.includes('delhi') || d.includes('patna') || d.includes('lucknow')) {
    return { 
      value: 'Hindi (हिंदी)', 
      name: 'Hindi', 
      script: 'हिंदी', 
      region: d.includes('gaya') ? 'Bihar' : 'Uttar Pradesh',
      placeholderTitle: 'उदा: नाली अवरुद्ध, बारिश का पानी भराव, टूटी सड़क...',
      placeholderDesc: 'समस्या की गंभीरता, कितने दिनों से खराब है और प्रभावित परिवारों की संख्या लिखें...'
    };
  }

  // Geographic coordinates fallback (India bounding zones)
  if (lat !== undefined && lng !== undefined) {
    if (lat < 13.5 && lng >= 76.0 && lng <= 80.5) {
      return { 
        value: 'Tamil (தமிழ்)', 
        name: 'Tamil', 
        script: 'தமிழ்', 
        region: 'Tamil Nadu',
        placeholderTitle: 'எ.கா: சாக்கடை அடைப்பு, சாலையில் தேங்கிய மழைநீர்...',
        placeholderDesc: 'பிரச்சனையின் தீவிரத்தன்மை மற்றும் பாதிக்கப்பட்ட வீடுகளின் எண்ணிக்கையை விவரிக்கவும்...'
      };
    }
    if (lat >= 24.0 && lat <= 28.5 && lng >= 89.5) {
      return { 
        value: 'Assamese (অসমীয়া)', 
        name: 'Assamese', 
        script: 'অসমীয়া', 
        region: 'Assam',
        placeholderTitle: 'যেনে: নলা বন্ধ হৈ পানী জমা হোৱা, বাটৰ গাঁত...',
        placeholderDesc: 'সমস্যাটোৰ গভীৰতা আৰু প্ৰভাৱিত লোকসকলৰ বিষয়ে লিখক...'
      };
    }
    if (lat >= 11.5 && lat <= 18.0 && lng >= 74.0 && lng < 78.5) {
      return { 
        value: 'Kannada (ಕನ್ನಡ)', 
        name: 'Kannada', 
        script: 'ಕನ್ನಡ', 
        region: 'Karnataka',
        placeholderTitle: 'ಉದಾ: ಚರಂಡಿ ಉಕ್ಕಿ ಹರಿಯುವುದು, ರಸ್ತೆ ಹೊಂಡ...',
        placeholderDesc: 'ಸಮಸ್ಯೆಯ ತೀವ್ರತೆ ಮತ್ತು ಬಾಧಿತ ಮನೆಗಳ ವಿವರಗಳನ್ನು ಬರೆಯಿರಿ...'
      };
    }
    if (lat >= 15.0 && lat <= 21.0 && lng >= 72.5 && lng < 78.0) {
      return { 
        value: 'Marathi (मराठी)', 
        name: 'Marathi', 
        script: 'मराठी', 
        region: 'Maharashtra',
        placeholderTitle: 'उदा: गटार तुंबणे, रस्त्यावरील खड्डे...',
        placeholderDesc: 'समस्येचे गांभीर्य आणि बाधित नागरिकांची माहिती लिहा...'
      };
    }
    if (lat >= 13.0 && lat <= 19.5 && lng >= 77.0 && lng < 84.0) {
      return { 
        value: 'Telugu (తెలుగు)', 
        name: 'Telugu', 
        script: 'తెలుగు', 
        region: 'Andhra / Telangana',
        placeholderTitle: 'ఉదా: మురుగు కాలువ బ్లాక్ కావడం...',
        placeholderDesc: 'సమస్య తీవ్రత మరియు ప్రభావిత గృహాల వివరాలు తెలపండి...'
      };
    }
    if (lat >= 21.0 && lat <= 30.0 && lng >= 75.0 && lng <= 88.0) {
      return { 
        value: 'Hindi (हिंदी)', 
        name: 'Hindi', 
        script: 'हिंदी', 
        region: 'North India',
        placeholderTitle: 'उदा: नाली अवरुद्ध, बारिश का पानी भराव...',
        placeholderDesc: 'समस्या की गंभीरता और प्रभावित घरों की संख्या लिखें...'
      };
    }
  }

  return { 
    value: 'Tamil (தமிழ்)', 
    name: 'Tamil', 
    script: 'தமிழ்', 
    region: 'Tamil Nadu',
    placeholderTitle: 'எ.கா: சாக்கடை அடைப்பு, சாலையில் தேங்கிய மழைநீர்...',
    placeholderDesc: 'பிரச்சனையின் தீவிரத்தன்மை மற்றும் பாதிக்கப்பட்ட வீடுகளின் எண்ணிக்கையை விவரிக்கவும்...'
  };
};

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  initialCoords,
  onClose,
  onSubmitGrievance
}) => {
  const [district, setDistrict] = useState<string>(initialCoords?.districtName || 'Madurai');
  const [ward, setWard] = useState<string>(initialCoords?.ward || 'Ward 14 (Goripalayam)');
  const [lat, setLat] = useState<number>(initialCoords?.lat || 9.9328);
  const [lng, setLng] = useState<number>(initialCoords?.lng || 78.1294);

  // Automatically determine default language from user location/coordinates
  const initialLangInfo = getLocationLanguage(initialCoords?.districtName || 'Madurai', initialCoords?.lat || 9.9328, initialCoords?.lng || 78.1294);
  const [language, setLanguage] = useState<string>(initialLangInfo.value);
  const [detectedLocInfo, setDetectedLocInfo] = useState(initialLangInfo);
  const [isDetectingGPS, setIsDetectingGPS] = useState<boolean>(false);
  const [locationSource, setLocationSource] = useState<'gps' | 'pindrop' | 'district'>(initialCoords ? 'pindrop' : 'district');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SectorCategory>('flood_drainage');
  const [urgencyScore, setUrgencyScore] = useState(7);
  const [isSimulatingWeatherCheck, setIsSimulatingWeatherCheck] = useState(false);
  const [detectedRainWarning, setDetectedRainWarning] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-detect user's current GPS location on mount if no initial coordinates were passed
  useEffect(() => {
    if (!initialCoords && typeof navigator !== 'undefined' && navigator.geolocation) {
      setIsDetectingGPS(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsDetectingGPS(false);
          const currentLat = Number(pos.coords.latitude.toFixed(4));
          const currentLng = Number(pos.coords.longitude.toFixed(4));
          
          let closest = DISTRICT_METRICS[0];
          let minDist = 999999;
          DISTRICT_METRICS.forEach(d => {
            const dist = Math.hypot(d.coordinates.lat - currentLat, d.coordinates.lng - currentLng);
            if (dist < minDist) {
              minDist = dist;
              closest = d;
            }
          });

          setLocationSource('gps');
          updateLocationAndLanguage(
            closest.districtName,
            currentLat,
            currentLng,
            `Ward ${(Math.floor(currentLat * 10) % 35) + 1} (GPS Verified)`
          );
        },
        () => {
          setIsDetectingGPS(false);
        },
        { timeout: 5000, maximumAge: 60000 }
      );
    }
  }, [initialCoords]);

  // Auto-update language whenever location/district changes
  const updateLocationAndLanguage = (newDistrict: string, newLat?: number, newLng?: number, newWard?: string) => {
    setDistrict(newDistrict);
    if (newLat !== undefined) setLat(newLat);
    if (newLng !== undefined) setLng(newLng);
    if (newWard) setWard(newWard);

    const langInfo = getLocationLanguage(newDistrict, newLat ?? lat, newLng ?? lng);
    setDetectedLocInfo(langInfo);
    setLanguage(langInfo.value);

    // Correlate rainfall hazard for vulnerable districts
    if (newDistrict === 'Madurai' || newDistrict === 'Kamrup Rural' || category === 'flood_drainage') {
      setDetectedRainWarning('High Precipitation (78mm) expected in 48h. Early desilting recommended.');
      setUrgencyScore(9);
    } else {
      setDetectedRainWarning(null);
    }
  };

  // GPS auto-locate
  const handleDetectGPS = () => {
    setIsDetectingGPS(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsDetectingGPS(false);
          const currentLat = Number(pos.coords.latitude.toFixed(4));
          const currentLng = Number(pos.coords.longitude.toFixed(4));
          
          // Match closest district or fallback
          let closest = DISTRICT_METRICS[0];
          let minDist = 999999;
          DISTRICT_METRICS.forEach(d => {
            const dist = Math.hypot(d.coordinates.lat - currentLat, d.coordinates.lng - currentLng);
            if (dist < minDist) {
              minDist = dist;
              closest = d;
            }
          });

          updateLocationAndLanguage(
            closest.districtName,
            currentLat,
            currentLng,
            `Ward ${(Math.floor(currentLat * 10) % 35) + 1} (GPS Verified)`
          );
        },
        () => {
          setIsDetectingGPS(false);
          // Fallback to Madurai
          updateLocationAndLanguage('Madurai', 9.9252, 78.1198, 'Ward 14 (Goripalayam)');
        },
        { timeout: 6000 }
      );
    } else {
      setIsDetectingGPS(false);
    }
  };

  // Check for localized forecast risk when category is flood_drainage
  const handleCheckRisk = () => {
    setIsSimulatingWeatherCheck(true);
    setTimeout(() => {
      setIsSimulatingWeatherCheck(false);
      if (category === 'flood_drainage' || district === 'Madurai' || district === 'Kamrup Rural') {
        setDetectedRainWarning('High Precipitation (78mm) expected in 48h. Early desilting recommended.');
        setUrgencyScore(9);
      } else {
        setDetectedRainWarning(null);
      }
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    onSubmitGrievance({
      title,
      description,
      category,
      state: district === 'Madurai' ? 'Tamil Nadu' : district === 'Gaya' ? 'Bihar' : district === 'Varanasi' ? 'Uttar Pradesh' : district === 'Pune' ? 'Maharashtra' : district.includes('Bengaluru') ? 'Karnataka' : 'Assam',
      district,
      talukOrWard: ward,
      coordinates: { lat, lng },
      urgencyScore,
      originalLanguage: language,
      imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=800&q=80',
      weatherRisk: detectedRainWarning ? {
        hasActiveRisk: true,
        riskLevel: 'high',
        forecastRainfallMm: 78,
        expectedTimeframe: '36-48 Hours',
        preventiveNotice: detectedRainWarning
      } : undefined
    });

    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 space-y-4 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <MapPin className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Lodge Geo-Tagged Civic Request
              </h3>
              <p className="text-xs text-slate-400">
                Pinpoint issue location &amp; verify weather hazards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Location-Aware Submission Language Intelligence Banner */}
        <div className="bg-gradient-to-r from-teal-950/70 via-slate-900 to-emerald-950/70 border border-teal-500/40 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 shrink-0">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-300">Auto-Selected Submission Language:</span>
                <span className="text-teal-300 font-extrabold text-sm bg-teal-500/20 px-2 py-0.5 rounded-md border border-teal-500/30">
                  {language}
                </span>
                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                  <Sparkles className="w-2.5 h-2.5" />
                  Calibrated for {district} ({detectedLocInfo.region})
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                AI dynamically localized vernacular prompts and voice normalizers to {detectedLocInfo.name} ({detectedLocInfo.script}) based on your current coordinates.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDetectGPS}
            disabled={isDetectingGPS}
            className="self-start sm:self-center flex items-center gap-1.5 text-[11px] font-bold text-teal-300 hover:text-teal-200 bg-teal-500/15 hover:bg-teal-500/25 px-2.5 py-1.5 rounded-xl border border-teal-500/40 transition cursor-pointer shrink-0"
            title="Sync with device GPS to detect location and regional language"
          >
            <Crosshair className={`w-3.5 h-3.5 ${isDetectingGPS ? 'animate-spin text-amber-400' : 'text-teal-400'}`} />
            <span>{isDetectingGPS ? 'Locating...' : 'Sync GPS Location'}</span>
          </button>
        </div>

        {isSuccess ? (
          <div className="py-12 text-center space-y-3">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">Request Successfully Placed on Public Map!</h4>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Your issue has been geotagged with coordinates ({lat.toFixed(4)}, {lng.toFixed(4)}) and dispatched into the CivicPulse AI triage pipeline in {language}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Geo Coordinates & Location Bar */}
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-semibold text-slate-300">
                    Location: <strong className="text-white">{district}</strong>, {detectedLocInfo.region}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={isDetectingGPS}
                  className="flex items-center gap-1 text-[11px] font-bold text-teal-400 hover:text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 px-2 py-0.5 rounded-md border border-teal-500/30 transition cursor-pointer"
                  title="Detect GPS coordinates"
                >
                  <Crosshair className={`w-3 h-3 ${isDetectingGPS ? 'animate-spin' : ''}`} />
                  <span>{isDetectingGPS ? 'Locating...' : 'My GPS'}</span>
                </button>
              </div>

              {/* District & Ward Quick Controls */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">District Area</label>
                  <select
                    value={district}
                    onChange={(e) => {
                      const matched = DISTRICT_METRICS.find(d => d.districtName === e.target.value);
                      if (matched) {
                        updateLocationAndLanguage(matched.districtName, matched.coordinates.lat, matched.coordinates.lng, `Ward ${(Math.floor(matched.coordinates.lat * 10) % 35) + 1} (Central)`);
                      } else {
                        updateLocationAndLanguage(e.target.value);
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg p-1.5 focus:outline-hidden focus:border-teal-500 cursor-pointer"
                  >
                    {DISTRICT_METRICS.map(d => (
                      <option key={d.districtId} value={d.districtName}>
                        {d.districtName} ({d.state})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Ward / Grid</label>
                  <input
                    type="text"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg p-1.5 focus:outline-hidden focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <span>Coordinates:</span>
                <span className="font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/30">
                  {lat.toFixed(4)}, {lng.toFixed(4)}
                </span>
              </div>
            </div>

            {/* Language & Category Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Submission Language (Auto-chosen based on user's location) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Submission Language
                  </label>
                  <span className="text-[10px] text-teal-400 font-semibold flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5 text-teal-400" />
                    Auto-chosen for your location
                  </span>
                </div>
                
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-950 border border-teal-500/60 rounded-xl p-2.5 text-xs text-slate-100 font-semibold focus:outline-hidden focus:border-teal-400 cursor-pointer shadow-xs shadow-teal-500/10"
                >
                  <option value={detectedLocInfo.value} className="bg-teal-950 text-teal-200 font-bold">
                    📍 {detectedLocInfo.value} — Auto-selected for {detectedLocInfo.region}
                  </option>
                  {SUPPORTED_LANGUAGES.filter(l => `${l.name} (${l.script})` !== detectedLocInfo.value).map((l) => (
                    <option key={l.code} value={`${l.name} (${l.script})`} className="bg-slate-900 text-slate-200">
                      {l.name} — {l.script}
                    </option>
                  ))}
                </select>

                {/* Location-based language info indicator */}
                <div className="mt-1 flex items-center justify-between gap-1.5 text-[10px] text-teal-300 bg-teal-500/10 px-2 py-1 rounded-md border border-teal-500/20">
                  <div className="flex items-center gap-1.5 truncate">
                    <Languages className="w-3 h-3 text-teal-400 shrink-0" />
                    <span className="truncate">
                      Native for <strong>{detectedLocInfo.region}</strong>: {detectedLocInfo.name} ({detectedLocInfo.script})
                    </span>
                  </div>
                  {language !== detectedLocInfo.value && (
                    <button
                      type="button"
                      onClick={() => setLanguage(detectedLocInfo.value)}
                      className="text-[10px] text-amber-300 underline hover:text-amber-200 shrink-0 font-medium cursor-pointer"
                    >
                      Reset to Local
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Infrastructure Sector
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    const cat = e.target.value as SectorCategory;
                    setCategory(cat);
                    if (cat === 'flood_drainage') handleCheckRisk();
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-hidden focus:border-teal-500 cursor-pointer"
                >
                  {Object.entries(SECTOR_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Issue Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Issue Summary / Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={detectedLocInfo.placeholderTitle}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-teal-500"
              />
            </div>

            {/* Detailed Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Detailed Description ({detectedLocInfo.name} / English)
                </label>
                <span className="text-[10px] text-teal-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Multilingual Normalizer
                </span>
              </div>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={detectedLocInfo.placeholderDesc}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-teal-500 resize-none"
              />
            </div>

            {/* Predictive Weather Check Warning */}
            {detectedRainWarning && (
              <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl flex items-start gap-2.5 text-xs text-rose-200">
                <CloudRain className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
                <div className="space-y-0.5">
                  <div className="font-bold text-rose-300">Predictive IMD Weather Hazard Correlated!</div>
                  <p>{detectedRainWarning}</p>
                </div>
              </div>
            )}

            {/* Image / Evidence Attachment Preview */}
            <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Camera className="w-4 h-4 text-teal-400" />
                <span>Geotagged Photo Attachment</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                Auto-Tagged with GPS
              </span>
            </div>

            {/* Submit Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Geotagged Request in {detectedLocInfo.name}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
