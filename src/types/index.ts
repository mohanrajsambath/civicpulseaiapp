export type SectorCategory = 
  | 'water_sanitation'
  | 'roads_bridges'
  | 'rural_health'
  | 'power_electricity'
  | 'digital_infra'
  | 'flood_drainage';

export type GrievanceStatus = 
  | 'submitted'
  | 'ai_triaged'
  | 'work_allocated'
  | 'resolved'
  | 'disputed';

export interface WeatherRiskAlert {
  hasActiveRisk: boolean;
  riskLevel: 'moderate' | 'high' | 'severe';
  forecastRainfallMm: number;
  expectedTimeframe: string;
  preventiveNotice: string;
}

export interface GrievanceTimelineItem {
  timestamp: string;
  stage: string;
  title: string;
  actor: string;
  notes?: string;
}

export interface Grievance {
  id: string;
  title: string;
  description: string;
  originalLanguage: string;
  category: SectorCategory;
  sectorCode: string;
  state: string;
  district: string;
  talukOrWard: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  urgencyScore: number; // 1 to 10
  status: GrievanceStatus;
  upvotesCount: number;
  userHasUpvoted?: boolean;
  imageUrl?: string;
  resolutionPhotoUrl?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  resolvedByContractor?: string;
  contractorId?: string;
  reportedByUid?: string;
  reportedByName?: string;
  disputeReason?: string;
  weatherRisk?: WeatherRiskAlert;
  timeline: GrievanceTimelineItem[];
  createdAt: string;
}

export interface DistrictMetric {
  districtId: string;
  districtName: string;
  state: string;
  coordinates: { lat: number; lng: number };
  population: number;
  ruralPct: number;
  isAspirationalDistrict: boolean;
  jjmWaterCoveragePct: number; // Jal Jeevan Mission %
  pmgsyRoadCoveragePct: number; // PM Gram Sadak Yojana %
  powerReliabilityScore: number; // 0-100
  primaryHealthCentersCount: number;
  floodVulnerabilityIndex: number; // 0-100
  activeGrievancesCount: number;
  criticalUnaddressedCount: number;
  allocatedBudgetCrores: number;
  spentBudgetCrores: number;
}

export interface WeatherAlert {
  alertId: string;
  district: string;
  state: string;
  warningType: 'heavy_rainfall' | 'inundation_risk' | 'waterlogging' | 'flash_flood';
  forecastMm: number;
  timeframe: string;
  affectedWards: string[];
  recommendedAction: string;
  severity: 'warning' | 'severe' | 'emergency';
}

export interface ProjectRecommendation {
  id: string;
  title: string;
  sector: SectorCategory;
  district: string;
  state: string;
  rationale: string;
  demographicCorrelation: string;
  estimatedCapexCrores: number;
  estimatedBeneficiaries: number;
  ropiScore: number; // Return on Public Investment (1-100)
  ropiBreakdown?: {
    socioeconomicEquityScore?: number;
    infrastructureDeficitScore?: number;
    climateResilienceScore?: number;
    costEfficiencyScore?: number;
    schemeAlignmentScore?: number;
  };
  priority: 'critical' | 'high' | 'medium';
  centralScheme: string; // e.g. PM Gati Shakti, Jal Jeevan Mission, AMRUT 2.0
  fundingModel?: {
    centralSharePct: number;
    stateSharePct: number;
    centralAmountCrores: number;
    stateAmountCrores: number;
  };
  milestones?: { quarter: string; task: string }[];
  executiveSummary?: string;
  status: 'proposed' | 'under_review' | 'sanctioned';
}

export type ActiveRole = 'civilian' | 'policymaker' | 'provider' | 'whatsapp';

export type AppTheme = 'dark' | 'light';

export interface UserProfile {
  id: string;
  name: string;
  designation: string;
  role: ActiveRole;
  emailOrPhone: string;
  department: string;
  jurisdiction: string;
  clearanceLevel: string;
  badgeLabel: string;
  badgeBg: string;
}
