export interface SimulationParams {
  walkInArrivalRate: number;
  mobileArrivalRate: number;
  serviceRate: number;
  numBaristas: number;
  laborCostPerHour: number;
  revenuePerWalkIn: number;
  revenuePerMobile: number;
  abandonmentThreshold: number;
  penaltyCostPerAbandonment: number;
  waitPenaltyPerMinute: number;
  simulationHours: number;
}

export interface SimulationResults {
  avgWaitTimeWalkIn: number;
  avgWaitTimeMobile: number;
  avgWaitTimeOverall: number;
  avgQueueLength: number;
  serverUtilization: number;
  abandonmentRate: number;
  abandonedCustomers: number;
  totalCustomers: number;
  servedCustomers: number;
  servedWalkIn: number;
  servedMobile: number;
  totalRevenue: number;
  laborCost: number;
  abandonmentPenalty: number;
  waitPenalty: number;
  totalCost: number;
  profit: number;
}

export interface OptimizationConstraints {
  maxWaitTime: number;
  maxAbandonmentRate: number;
}

export interface OptimizationResult {
  staffingLevels: number[];
  results: SimulationResults[];
  optimalBaristas: number;
  optimalResult: SimulationResults;
  feasibleLevels: number[];
}

export interface SensitivityResult {
  multipliers: number[];
  results: SimulationResults[];
  totalRates: number[];
}

export interface Scenario {
  name: string;
  description: string;
  params: Partial<SimulationParams>;
}

// ── Dataset-driven hourly types ─────────────────────────────────────────────

export interface HourlyDemand {
  hour: number;
  walkInArrivalRate: number;
  mobileArrivalRate: number;
  avgServiceTimeWalkIn: number;
  avgServiceTimeMobile: number;
  abandonmentProb: number;
}

export interface HourlyStaffingResult {
  hour: number;
  optimalBaristas: number;
  metrics: SimulationResults;
}

export interface DailySchedule {
  day: string;
  hours: HourlyStaffingResult[];
  totalDailyLaborCost: number;
  totalDailyRevenue: number;
  totalDailyProfit: number;
  totalDailyCost: number;
  totalCustomers: number;
  totalAbandoned: number;
  peakBaristas: number;
}

export const DEFAULT_PARAMS: SimulationParams = {
  walkInArrivalRate: 22,
  mobileArrivalRate: 15,
  serviceRate: 20,
  numBaristas: 3,
  laborCostPerHour: 18,
  revenuePerWalkIn: 5.5,
  revenuePerMobile: 4.5,
  abandonmentThreshold: 8,
  penaltyCostPerAbandonment: 3,
  waitPenaltyPerMinute: 0.15,
  simulationHours: 12,
};

export const DEFAULT_CONSTRAINTS: OptimizationConstraints = {
  maxWaitTime: 10,
  maxAbandonmentRate: 0.15,
};
