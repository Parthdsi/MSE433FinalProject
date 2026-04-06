import type {
  SimulationParams,
  SimulationResults,
  OptimizationConstraints,
  OptimizationResult,
  SensitivityResult,
  HourlyDemand,
  HourlyStaffingResult,
  DailySchedule,
} from '../types';
import { runSimulationAvg } from './simulation';

// ── Cost-only params the manager sets (no demand data) ──────────────────────

export interface CostParams {
  laborCostPerHour: number;
  revenuePerWalkIn: number;
  revenuePerMobile: number;
  abandonmentThreshold: number;
  penaltyCostPerAbandonment: number;
  waitPenaltyPerMinute: number;
}

function hourlyDemandToSimParams(
  hd: HourlyDemand,
  cost: CostParams,
  numBaristas: number,
): SimulationParams {
  const totalRate = hd.walkInArrivalRate + hd.mobileArrivalRate;
  const weightedServiceTime =
    totalRate > 0
      ? (hd.walkInArrivalRate * hd.avgServiceTimeWalkIn +
          hd.mobileArrivalRate * hd.avgServiceTimeMobile) /
        totalRate
      : hd.avgServiceTimeWalkIn;
  const serviceRate = 60 / Math.max(weightedServiceTime, 0.1);

  return {
    walkInArrivalRate: hd.walkInArrivalRate,
    mobileArrivalRate: hd.mobileArrivalRate,
    serviceRate,
    numBaristas,
    simulationHours: 1,
    ...cost,
  };
}

export function optimizeStaffing(
  baseParams: SimulationParams,
  constraints: OptimizationConstraints,
  minBaristas = 1,
  maxBaristas = 10,
  replications = 10,
): OptimizationResult {
  const levels: number[] = [];
  const results: SimulationResults[] = [];
  const feasible: number[] = [];

  for (let s = minBaristas; s <= maxBaristas; s++) {
    const params = { ...baseParams, numBaristas: s };
    const res = runSimulationAvg(params, replications);
    levels.push(s);
    results.push(res);

    const waitOk = res.avgWaitTimeOverall <= constraints.maxWaitTime;
    const abandonOk = res.abandonmentRate <= constraints.maxAbandonmentRate;
    if (waitOk && abandonOk) feasible.push(s);
  }

  let bestIdx: number;
  if (feasible.length > 0) {
    const feasibleIndices = feasible.map((s) => s - minBaristas);
    bestIdx = feasibleIndices.reduce(
      (best, i) => (results[i].totalCost < results[best].totalCost ? i : best),
      feasibleIndices[0],
    );
  } else {
    bestIdx = results.reduce(
      (best, r, i) => (r.totalCost < results[best].totalCost ? i : best),
      0,
    );
  }

  return {
    staffingLevels: levels,
    results,
    optimalBaristas: levels[bestIdx],
    optimalResult: results[bestIdx],
    feasibleLevels: feasible,
  };
}

export function runSensitivityAnalysis(
  baseParams: SimulationParams,
  multipliers: number[] = [0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0],
  replications = 10,
): SensitivityResult {
  const results: SimulationResults[] = [];
  const totalRates: number[] = [];

  for (const m of multipliers) {
    const params: SimulationParams = {
      ...baseParams,
      walkInArrivalRate: baseParams.walkInArrivalRate * m,
      mobileArrivalRate: baseParams.mobileArrivalRate * m,
    };
    results.push(runSimulationAvg(params, replications));
    totalRates.push(
      baseParams.walkInArrivalRate * m + baseParams.mobileArrivalRate * m,
    );
  }

  return { multipliers, results, totalRates };
}

// ── Per-hour daily schedule optimizer ───────────────────────────────────────

export function optimizeDaily(
  dayLabel: string,
  hourlyDemand: HourlyDemand[],
  cost: CostParams,
  constraints: OptimizationConstraints,
  minBaristas = 1,
  maxBaristas = 10,
  replications = 10,
): DailySchedule {
  const hours: HourlyStaffingResult[] = [];

  for (const hd of hourlyDemand) {
    let bestS = minBaristas;
    let bestRes: SimulationResults | null = null;
    let bestCost = Infinity;
    const feasible: { s: number; res: SimulationResults }[] = [];

    for (let s = minBaristas; s <= maxBaristas; s++) {
      const params = hourlyDemandToSimParams(hd, cost, s);
      const res = runSimulationAvg(params, replications);

      const waitOk = res.avgWaitTimeOverall <= constraints.maxWaitTime;
      const abandonOk = res.abandonmentRate <= constraints.maxAbandonmentRate;
      if (waitOk && abandonOk) feasible.push({ s, res });

      if (res.totalCost < bestCost) {
        bestCost = res.totalCost;
        bestS = s;
        bestRes = res;
      }
    }

    if (feasible.length > 0) {
      const best = feasible.reduce((a, b) =>
        a.res.totalCost < b.res.totalCost ? a : b,
      );
      bestS = best.s;
      bestRes = best.res;
    }

    hours.push({ hour: hd.hour, optimalBaristas: bestS, metrics: bestRes! });
  }

  const totalDailyLaborCost = hours.reduce(
    (s, h) => s + h.optimalBaristas * cost.laborCostPerHour,
    0,
  );
  const totalDailyRevenue = hours.reduce((s, h) => s + h.metrics.totalRevenue, 0);
  const totalDailyCost = hours.reduce((s, h) => s + h.metrics.totalCost, 0);
  const totalDailyProfit = totalDailyRevenue - totalDailyCost;
  const totalCustomers = hours.reduce((s, h) => s + h.metrics.totalCustomers, 0);
  const totalAbandoned = hours.reduce((s, h) => s + h.metrics.abandonedCustomers, 0);
  const peakBaristas = Math.max(...hours.map((h) => h.optimalBaristas));

  return {
    day: dayLabel,
    hours,
    totalDailyLaborCost,
    totalDailyRevenue,
    totalDailyProfit,
    totalDailyCost,
    totalCustomers,
    totalAbandoned,
    peakBaristas,
  };
}
