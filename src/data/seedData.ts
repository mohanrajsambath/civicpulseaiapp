import { DistrictMetric, Grievance, ProjectRecommendation, WeatherAlert } from '../types';

export const DISTRICT_METRICS: DistrictMetric[] = [
  {
    districtId: 'TN-MDU',
    districtName: 'Madurai',
    state: 'Tamil Nadu',
    coordinates: { lat: 9.9252, lng: 78.1198 },
    population: 3038252,
    ruralPct: 39.2,
    isAspirationalDistrict: false,
    jjmWaterCoveragePct: 76.4,
    pmgsyRoadCoveragePct: 91.2,
    powerReliabilityScore: 88,
    primaryHealthCentersCount: 68,
    floodVulnerabilityIndex: 72,
    activeGrievancesCount: 43,
    criticalUnaddressedCount: 7,
    allocatedBudgetCrores: 310.5,
    spentBudgetCrores: 245.2,
  },
  {
    districtId: 'UP-VNS',
    districtName: 'Varanasi',
    state: 'Uttar Pradesh',
    coordinates: { lat: 25.3176, lng: 82.9739 },
    population: 3676841,
    ruralPct: 56.6,
    isAspirationalDistrict: false,
    jjmWaterCoveragePct: 62.1,
    pmgsyRoadCoveragePct: 84.7,
    powerReliabilityScore: 79,
    primaryHealthCentersCount: 74,
    floodVulnerabilityIndex: 81,
    activeGrievancesCount: 61,
    criticalUnaddressedCount: 12,
    allocatedBudgetCrores: 480.0,
    spentBudgetCrores: 392.4,
  },
  {
    districtId: 'BR-GAY',
    districtName: 'Gaya',
    state: 'Bihar',
    coordinates: { lat: 24.7914, lng: 85.0002 },
    population: 4391418,
    ruralPct: 86.8,
    isAspirationalDistrict: true,
    jjmWaterCoveragePct: 48.3,
    pmgsyRoadCoveragePct: 68.9,
    powerReliabilityScore: 61,
    primaryHealthCentersCount: 42,
    floodVulnerabilityIndex: 65,
    activeGrievancesCount: 94,
    criticalUnaddressedCount: 26,
    allocatedBudgetCrores: 340.0,
    spentBudgetCrores: 198.5,
  },
  {
    districtId: 'MH-PUN',
    districtName: 'Pune',
    state: 'Maharashtra',
    coordinates: { lat: 18.5204, lng: 73.8567 },
    population: 9429408,
    ruralPct: 39.1,
    isAspirationalDistrict: false,
    jjmWaterCoveragePct: 89.1,
    pmgsyRoadCoveragePct: 94.6,
    powerReliabilityScore: 92,
    primaryHealthCentersCount: 104,
    floodVulnerabilityIndex: 58,
    activeGrievancesCount: 78,
    criticalUnaddressedCount: 9,
    allocatedBudgetCrores: 780.0,
    spentBudgetCrores: 642.0,
  },
  {
    districtId: 'AS-KAM',
    districtName: 'Kamrup Rural',
    state: 'Assam',
    coordinates: { lat: 26.3167, lng: 91.5833 },
    population: 1517542,
    ruralPct: 90.6,
    isAspirationalDistrict: true,
    jjmWaterCoveragePct: 41.2,
    pmgsyRoadCoveragePct: 62.4,
    powerReliabilityScore: 54,
    primaryHealthCentersCount: 38,
    floodVulnerabilityIndex: 94,
    activeGrievancesCount: 82,
    criticalUnaddressedCount: 29,
    allocatedBudgetCrores: 290.0,
    spentBudgetCrores: 152.0,
  },
  {
    districtId: 'RJ-JAI',
    districtName: 'Jaipur',
    state: 'Rajasthan',
    coordinates: { lat: 26.9124, lng: 75.7873 },
    population: 6626178,
    ruralPct: 47.6,
    isAspirationalDistrict: false,
    jjmWaterCoveragePct: 53.4,
    pmgsyRoadCoveragePct: 88.0,
    powerReliabilityScore: 84,
    primaryHealthCentersCount: 88,
    floodVulnerabilityIndex: 44,
    activeGrievancesCount: 52,
    criticalUnaddressedCount: 8,
    allocatedBudgetCrores: 510.0,
    spentBudgetCrores: 430.0,
  },
  {
    districtId: 'KA-BLR',
    districtName: 'Bengaluru Rural',
    state: 'Karnataka',
    coordinates: { lat: 13.2385, lng: 77.5750 },
    population: 990923,
    ruralPct: 72.9,
    isAspirationalDistrict: false,
    jjmWaterCoveragePct: 82.5,
    pmgsyRoadCoveragePct: 90.1,
    powerReliabilityScore: 87,
    primaryHealthCentersCount: 34,
    floodVulnerabilityIndex: 61,
    activeGrievancesCount: 38,
    criticalUnaddressedCount: 4,
    allocatedBudgetCrores: 260.0,
    spentBudgetCrores: 215.0,
  },
  {
    districtId: 'OR-CTC',
    districtName: 'Cuttack',
    state: 'Odisha',
    coordinates: { lat: 20.4625, lng: 85.8828 },
    population: 2624470,
    ruralPct: 71.9,
    isAspirationalDistrict: false,
    jjmWaterCoveragePct: 58.7,
    pmgsyRoadCoveragePct: 81.3,
    powerReliabilityScore: 71,
    primaryHealthCentersCount: 56,
    floodVulnerabilityIndex: 88,
    activeGrievancesCount: 67,
    criticalUnaddressedCount: 18,
    allocatedBudgetCrores: 375.0,
    spentBudgetCrores: 289.0,
  }
];

export const WEATHER_ALERTS: WeatherAlert[] = [
  {
    alertId: 'IMD-RAIN-2026-09-01',
    district: 'Madurai',
    state: 'Tamil Nadu',
    warningType: 'heavy_rainfall',
    forecastMm: 78,
    timeframe: 'Next 36-48 Hours',
    affectedWards: ['Ward 14 (Goripalayam)', 'Ward 22 (Sellur)', 'Ward 38 (Avaniapuram)'],
    recommendedAction: 'Immediate desilting of major stormwater culverts to avert urban inundation.',
    severity: 'severe'
  },
  {
    alertId: 'IMD-FLOOD-2026-09-04',
    district: 'Kamrup Rural',
    state: 'Assam',
    warningType: 'flash_flood',
    forecastMm: 142,
    timeframe: 'Next 24 Hours',
    affectedWards: ['Boko Block', 'Chaygaon Taluk', 'Palasbari Riverbank'],
    recommendedAction: 'Deploy district disaster response; reinforce temporary embankments and clear culvert sluice gates.',
    severity: 'emergency'
  },
  {
    alertId: 'IMD-RAIN-2026-09-07',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    warningType: 'waterlogging',
    forecastMm: 62,
    timeframe: 'Next 48 Hours',
    affectedWards: ['Assi Ward', 'Bhelupur Sector 3', 'Sigra low-lying crossing'],
    recommendedAction: 'Pre-position high-capacity dewatering pumps at known drainage choke points.',
    severity: 'warning'
  }
];

export const INITIAL_GRIEVANCES: Grievance[] = [
  {
    id: 'CP-1042',
    title: 'Severe Storm Drain Blockage & Choked Culvert at Goripalayam Junction',
    description: 'The main concrete drainage culvert near Goripalayam junction is packed with silt and construction waste. Stagnant sludge is overflowing onto the main market road, making walking hazardous and smelling terrible.',
    originalLanguage: 'Tamil (தமிழ்)',
    category: 'flood_drainage',
    sectorCode: 'MoHUA-AMRUT',
    state: 'Tamil Nadu',
    district: 'Madurai',
    talukOrWard: 'Ward 14 (Goripalayam)',
    coordinates: { lat: 9.9328, lng: 78.1294 },
    urgencyScore: 9,
    status: 'submitted',
    upvotesCount: 54,
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=800&q=80',
    weatherRisk: {
      hasActiveRisk: true,
      riskLevel: 'severe',
      forecastRainfallMm: 78,
      expectedTimeframe: '36-48 Hours',
      preventiveNotice: 'Pre-emptive clearing urgently required before IMD forecasted 78mm torrential downpour hits on Saturday night.'
    },
    timeline: [
      {
        timestamp: '2026-09-25 09:30 AM',
        stage: 'Submitted',
        title: 'Voice report filed in Tamil',
        actor: 'Citizen (K. Muthukrishnan)',
        notes: 'Audio transcribed automatically with high confidence.'
      },
      {
        timestamp: '2026-09-25 09:32 AM',
        stage: 'AI Triaged',
        title: 'Urgency escalated to 9/10 with IMD Weather Warning',
        actor: 'CivicPulse AI Engine',
        notes: 'Correlated with IMD 78mm precipitation forecast.'
      }
    ],
    createdAt: '2026-09-25T09:30:00Z'
  },
  {
    id: 'CP-1039',
    title: 'Collapsed Box Culvert Cutting Off 3 Agrarian Hamlets from PHC',
    description: 'The earthen approach road and masonry box culvert collapsed following the last pre-monsoon storm. Ambulance and auto-rickshaws cannot reach the Gram Panchayat health sub-center.',
    originalLanguage: 'Hindi (हिंदी)',
    category: 'roads_bridges',
    sectorCode: 'MoRTH-PMGSY',
    state: 'Bihar',
    district: 'Gaya',
    talukOrWard: 'Manpur Block - Ward 7',
    coordinates: { lat: 24.8120, lng: 85.0210 },
    urgencyScore: 8,
    status: 'work_allocated',
    upvotesCount: 89,
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    timeline: [
      {
        timestamp: '2026-09-22 14:15 PM',
        stage: 'Submitted',
        title: 'Grievance lodged with geotagged photo',
        actor: 'Citizen (Sunita Devi)'
      },
      {
        timestamp: '2026-09-23 11:00 AM',
        stage: 'Work Allocated',
        title: 'Dispatched to Rural Works Dept Contractor (Bihar RWD Unit 4)',
        actor: 'District Magistrate Office, Gaya'
      }
    ],
    createdAt: '2026-09-22T14:15:00Z'
  },
  {
    id: 'CP-1031',
    title: 'Main Pipeline Valve Rupture - Drinking Water Contaminated',
    description: 'Clean tap water under Jal Jeevan scheme is contaminated due to a cracked underground pipe crossing the open sewer trench. Over 80 households are receiving turbid, foul-smelling water.',
    originalLanguage: 'Hindi (हिंदी)',
    category: 'water_sanitation',
    sectorCode: 'MoJS-JJM',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    talukOrWard: 'Assi Ward - Lane 4',
    coordinates: { lat: 25.2982, lng: 83.0035 },
    urgencyScore: 10,
    status: 'resolved',
    upvotesCount: 112,
    imageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
    resolutionPhotoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    resolutionNotes: 'UP Jal Nigam engineers excavated the broken 150mm PVC connector, replaced it with ductile iron pipe, and disinfected the supply line. Water quality tested and cleared.',
    resolvedAt: '2026-09-25T16:20:00Z',
    resolvedByContractor: 'UP Jal Nigam Division II (Eng. R.K. Srivastava)',
    timeline: [
      {
        timestamp: '2026-09-21 08:00 AM',
        stage: 'Submitted',
        title: 'Urgent Drinking Water Hazard report',
        actor: 'Citizen (Prakash Pandey)'
      },
      {
        timestamp: '2026-09-21 08:05 AM',
        stage: 'AI Triaged',
        title: 'Tagged Severity 10 - Public Health Contamination',
        actor: 'CivicPulse AI Engine'
      },
      {
        timestamp: '2026-09-22 09:30 AM',
        stage: 'Work Allocated',
        title: 'Emergency repair order issued',
        actor: 'Municipal Health & Water Officer'
      },
      {
        timestamp: '2026-09-25 16:20 PM',
        stage: 'Resolved',
        title: 'Completed with geo-verified after photo & water purity test report',
        actor: 'UP Jal Nigam Division II'
      }
    ],
    createdAt: '2026-09-21T08:00:00Z'
  },
  {
    id: 'CP-1025',
    title: 'Transformer Overload & Frequent Sparking near Government Girls School',
    description: 'The pole-mounted distribution transformer sparks heavily during evening peak load hours. Two live spark episodes caused panic among school students and nearby vendors.',
    originalLanguage: 'Kannada (ಕನ್ನಡ)',
    category: 'power_electricity',
    sectorCode: 'MoP-RDSS',
    state: 'Karnataka',
    district: 'Bengaluru Rural',
    talukOrWard: 'Devanahalli - Ward 3',
    coordinates: { lat: 13.2490, lng: 77.7120 },
    urgencyScore: 8,
    status: 'work_allocated',
    upvotesCount: 37,
    imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80',
    timeline: [
      {
        timestamp: '2026-09-23 18:30 PM',
        stage: 'Submitted',
        title: 'Electricity safety hazard reported via WhatsApp Bot',
        actor: 'Citizen (Anand Kumar)'
      },
      {
        timestamp: '2026-09-24 10:00 AM',
        stage: 'Work Allocated',
        title: 'BESCOM lineman squad assigned to replace 100kVA transformer',
        actor: 'BESCOM Sub-division'
      }
    ],
    createdAt: '2026-09-23T18:30:00Z'
  },
  {
    id: 'CP-1018',
    title: 'Unrepaired Embankment Breached on Brahmaputra Tributary',
    description: 'Last monsoon flood weakened the bamboo and sandbag dyke at Palasbari. The breach is widening, and water will enter paddy fields if not fortified before upcoming heavy rainfall.',
    originalLanguage: 'Assamese (অসমীয়া)',
    category: 'flood_drainage',
    sectorCode: 'MoJS-WaterResources',
    state: 'Assam',
    district: 'Kamrup Rural',
    talukOrWard: 'Palasbari Riverbank',
    coordinates: { lat: 26.1311, lng: 91.5011 },
    urgencyScore: 10,
    status: 'submitted',
    upvotesCount: 142,
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    weatherRisk: {
      hasActiveRisk: true,
      riskLevel: 'severe',
      forecastRainfallMm: 142,
      expectedTimeframe: '24 Hours',
      preventiveNotice: 'Critical: Red Alert issued by IMD for 142mm rain in Brahmaputra catchment within 24 hours. Immediate dyke protection required.'
    },
    timeline: [
      {
        timestamp: '2026-09-25 07:00 AM',
        stage: 'Submitted',
        title: 'Community alert submitted with 142 digital endorsements',
        actor: 'Gram Sabha President (B. Kalita)'
      }
    ],
    createdAt: '2026-09-25T07:00:00Z'
  },
  {
    id: 'CP-1011',
    title: 'Rural CSC Digital Kiosk Down for 3 Weeks - No Aadhaar/DBT Access',
    description: 'The Common Service Center optical fiber link is disconnected due to road digging. Villagers from 5 hamlets have to travel 28km to town to claim their pension and PM-Kisan payouts.',
    originalLanguage: 'Hindi (हिंदी)',
    category: 'digital_infra',
    sectorCode: 'MeitY-BharatNet',
    state: 'Rajasthan',
    district: 'Jaipur',
    talukOrWard: 'Chaksu Tehsil - Gram Kiosk',
    coordinates: { lat: 26.6012, lng: 75.9521 },
    urgencyScore: 6,
    status: 'submitted',
    upvotesCount: 48,
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    timeline: [
      {
        timestamp: '2026-09-24 11:20 AM',
        stage: 'Submitted',
        title: 'BharatNet connectivity failure recorded',
        actor: 'Village Youth Leader (Vikram Meena)'
      }
    ],
    createdAt: '2026-09-24T11:20:00Z'
  }
];

export const INITIAL_PROJECT_RECOMMENDATIONS: ProjectRecommendation[] = [
  {
    id: 'DPI-REC-01',
    title: 'Integrated Stormwater Arterial Conduit & Desilting Project (Sellur-Goripalayam)',
    sector: 'flood_drainage',
    district: 'Madurai',
    state: 'Tamil Nadu',
    rationale: 'Persistent annual inundation and 54 citizen reports at Ward 14 & Ward 22. Replacing open clogged masonry channel with high-discharge RCC box conduits prevents recurrent market submergence.',
    demographicCorrelation: 'High urban commercial density (12,400 people/sq km) with 72/100 flood vulnerability index from data.gov.in.',
    estimatedCapexCrores: 4.8,
    estimatedBeneficiaries: 65000,
    ropiScore: 94,
    priority: 'critical',
    centralScheme: 'AMRUT 2.0 & State Disaster Mitigation Fund',
    status: 'proposed'
  },
  {
    id: 'DPI-REC-02',
    title: 'All-Weather Bituminous Upgrade & High-Level Culvert (Manpur-Bodhgaya Corridor)',
    sector: 'roads_bridges',
    district: 'Gaya',
    state: 'Bihar',
    rationale: 'Resolves critical disconnection of 3 agrarian hamlets where collapsed box culverts halt ambulance transit and farm produce logistics.',
    demographicCorrelation: 'Aspirational District with only 68.9% PMGSY road connectivity. High rural proportion (86.8%).',
    estimatedCapexCrores: 8.2,
    estimatedBeneficiaries: 42000,
    ropiScore: 88,
    priority: 'high',
    centralScheme: 'PM Gram Sadak Yojana (PMGSY-III)',
    status: 'under_review'
  },
  {
    id: 'DPI-REC-03',
    title: 'Reinforced Embankment & Geo-Bag Sluice Gates on Brahmaputra Tributary',
    sector: 'flood_drainage',
    district: 'Kamrup Rural',
    state: 'Assam',
    rationale: 'Frequent dyke breaches causing crop loss and seasonal displacement across 4 riverine villages. Automated sluice gates regulate monsoon runoff.',
    demographicCorrelation: 'Flood vulnerability index is 94/100 (highest in state). Over 90% rural population.',
    estimatedCapexCrores: 12.5,
    estimatedBeneficiaries: 85000,
    ropiScore: 96,
    priority: 'critical',
    centralScheme: 'PM Gati Shakti Multi-Modal & National River Flood Mitigation',
    status: 'proposed'
  },
  {
    id: 'DPI-REC-04',
    title: 'Underground Ducting & Overhead Conductor Replacement near Rural Schools',
    sector: 'power_electricity',
    district: 'Bengaluru Rural',
    state: 'Karnataka',
    rationale: 'Aging overhead lines and overloaded transformers present electrocution hazards near 4 rural educational institutions.',
    demographicCorrelation: 'Fast suburban expansion with 87/100 power reliability, but distribution safety gaps in peri-urban wards.',
    estimatedCapexCrores: 3.2,
    estimatedBeneficiaries: 28000,
    ropiScore: 82,
    priority: 'medium',
    centralScheme: 'Revamped Distribution Sector Scheme (RDSS)',
    status: 'proposed'
  }
];

export const SECTOR_CONFIG: Record<string, { label: string; iconColor: string; bgBadge: string; ministry: string }> = {
  water_sanitation: {
    label: 'Water & Sanitation',
    iconColor: 'text-cyan-400',
    bgBadge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    ministry: 'Ministry of Jal Shakti (JJM)'
  },
  roads_bridges: {
    label: 'Roads & Bridges',
    iconColor: 'text-amber-400',
    bgBadge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    ministry: 'Ministry of Road Transport (MoRTH / PMGSY)'
  },
  rural_health: {
    label: 'Rural Health & PHC',
    iconColor: 'text-rose-400',
    bgBadge: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    ministry: 'Ministry of Health & Family Welfare (NHM)'
  },
  power_electricity: {
    label: 'Power & Streetlights',
    iconColor: 'text-yellow-400',
    bgBadge: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
    ministry: 'Ministry of Power (RDSS)'
  },
  digital_infra: {
    label: 'Digital Kiosks & CSC',
    iconColor: 'text-purple-400',
    bgBadge: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    ministry: 'Ministry of Electronics & IT (BharatNet)'
  },
  flood_drainage: {
    label: 'Flood & Drainage',
    iconColor: 'text-blue-400',
    bgBadge: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    ministry: 'MoHUA (AMRUT 2.0 / Urban Drainage)'
  }
};

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', script: 'English' },
  { code: 'hi', name: 'Hindi', script: 'हिंदी' },
  { code: 'ta', name: 'Tamil', script: 'தமிழ்' },
  { code: 'te', name: 'Telugu', script: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', script: 'ಕನ್ನಡ' },
  { code: 'bn', name: 'Bengali', script: 'বাংলা' },
  { code: 'mr', name: 'Marathi', script: 'मराठी' },
  { code: 'gu', name: 'Gujarati', script: 'ગુજરાતી' },
  { code: 'as', name: 'Assamese', script: 'অসমীয়া' },
  { code: 'or', name: 'Odia', script: 'ଓଡ଼ିଆ' }
];

export const DEFAULT_USER_PROFILES: Record<string, import('../types').UserProfile> = {
  policymaker: {
    id: 'USR-ADMIN-01',
    name: 'Dr. K. Rajesh, IAS',
    designation: 'District Collector & District Magistrate',
    role: 'policymaker',
    emailOrPhone: 'collector.mdu@tn.gov.in',
    department: 'Revenue & Disaster Management Authority (Govt. of Tamil Nadu)',
    jurisdiction: 'Madurai District (All 11 Taluks & 100 Wards)',
    clearanceLevel: 'Executive Commissioner Tier-1 (Full DPR Sanction & Budget Authority)',
    badgeLabel: 'District Magistrate / Admin',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40'
  },
  provider: {
    id: 'USR-ENG-02',
    name: 'Er. S. Murugesan',
    designation: 'Executive Engineer (Lead Contractor)',
    role: 'provider',
    emailOrPhone: 'ee.pwd.madurai@tneb.gov.in',
    department: 'Public Works Department (PWD Hydrology & Municipal Works)',
    jurisdiction: 'Zone 3 (Goripalayam, Anna Nagar, Simmakkal)',
    clearanceLevel: 'Field Authority Tier-2 (Work Order Dispatch & Photo Verification)',
    badgeLabel: 'Municipal Contractor',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
  },
  civilian: {
    id: 'USR-CIT-03',
    name: 'Ananya Sharma',
    designation: 'Verified Citizen Resident',
    role: 'civilian',
    emailOrPhone: '+91 98412 ••••• (Aadhaar Verified)',
    department: 'Civilian Community Portal (Ward 14 Resident)',
    jurisdiction: 'Goripalayam / Vaigai North Bank',
    clearanceLevel: 'Citizen Grievance & Closed-Loop Auditing (Tier-1)',
    badgeLabel: 'Verified Citizen',
    badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/40'
  },
  whatsapp: {
    id: 'USR-BOT-04',
    name: 'Govt. DPI WhatsApp Gateway',
    designation: 'Vernacular AI Grievance Ingestion',
    role: 'whatsapp',
    emailOrPhone: '+91 90000 CIVIC (Official DPG)',
    department: 'Ministry of Housing and Urban Affairs (MoHUA DPI)',
    jurisdiction: 'Pan-India Vernacular Public Access',
    clearanceLevel: 'Public Open Access Gateway (Zero App Install)',
    badgeLabel: 'WhatsApp Gateway',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
  }
};
