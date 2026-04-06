import type {
  SimulationResults,
  OptimizationResult,
  OptimizationConstraints,
} from '../types';
import InfoTip from './InfoTip';

interface Props {
  results: SimulationResults | null;
  optimization: OptimizationResult | null;
  constraints: OptimizationConstraints;
}

function Metric({
  label,
  value,
  sub,
  info,
  accent = false,
}: {
  label: string;
  value: string;
  sub?: string;
  info: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl bg-white border border-neutral-200 p-4 flex flex-col shadow-sm">
      <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
        {label}
        <InfoTip text={info} />
      </p>
      <p className={`text-xl font-bold mt-1 tabular-nums ${accent ? 'text-neutral-900' : 'text-neutral-600'}`}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-neutral-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function ResultsDashboard({
  results,
  optimization,
  constraints,
}: Props) {
  if (!results) {
    return (
      <div className="rounded-xl border-2 border-dashed border-neutral-300 bg-white p-12 text-center">
        <p className="text-neutral-400 text-sm">
          Configure parameters and click <span className="text-neutral-900 font-medium">Optimize Staffing</span> to see results.
        </p>
      </div>
    );
  }

  const fmt = (n: number, d = 1) => n.toFixed(d);
  const dollar = (n: number) =>
    n < 0 ? `-$${Math.abs(n).toFixed(2)}` : `$${n.toFixed(2)}`;
  const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

  return (
    <div className="space-y-4">
      {/* Optimal staffing banner */}
      {optimization && (
        <div className="rounded-xl bg-neutral-950 p-5 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                Optimal Staffing
                <InfoTip text="The staffing level (1–10 baristas) that minimizes total system cost while meeting your wait time and abandonment constraints." />
              </p>
              <p className="text-4xl font-bold text-white mt-1 tabular-nums">
                {optimization.optimalBaristas}
                <span className="text-base font-medium text-neutral-500 ml-2">
                  barista{optimization.optimalBaristas !== 1 ? 's' : ''}
                </span>
              </p>
              {optimization.feasibleLevels.length === 0 && (
                <p className="text-[11px] text-neutral-500 mt-1 font-medium">
                  No level meets all constraints. Showing lowest-cost option.
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
              <span className="text-neutral-500">
                Total Cost
                <InfoTip text="Labor + abandonment penalty + wait penalty at the optimal staffing level." />
              </span>
              <span className="font-semibold text-neutral-300 tabular-nums">
                {dollar(optimization.optimalResult.totalCost)}
              </span>
              <span className="text-neutral-500">
                Profit
                <InfoTip text="Revenue − total system cost at the optimal staffing level." />
              </span>
              <span className="font-semibold text-white tabular-nums">
                {dollar(optimization.optimalResult.profit)}
              </span>
              <span className="text-neutral-500">Avg Wait</span>
              <span className="font-semibold text-neutral-300 tabular-nums">
                {fmt(optimization.optimalResult.avgWaitTimeOverall)} min
                {optimization.optimalResult.avgWaitTimeOverall > constraints.maxWaitTime
                  ? <span className="text-neutral-500 ml-1 text-[11px]">over limit</span>
                  : <span className="text-neutral-600 ml-1 text-[11px]">ok</span>
                }
              </span>
              <span className="text-neutral-500">Abandon</span>
              <span className="font-semibold text-neutral-300 tabular-nums">
                {pct(optimization.optimalResult.abandonmentRate)}
                {optimization.optimalResult.abandonmentRate > constraints.maxAbandonmentRate
                  ? <span className="text-neutral-500 ml-1 text-[11px]">over limit</span>
                  : <span className="text-neutral-600 ml-1 text-[11px]">ok</span>
                }
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <Metric
          label="Wait (Walk-in)"
          value={`${fmt(results.avgWaitTimeWalkIn)} min`}
          info="Average time a walk-in customer waits from arrival until a barista begins their order."
        />
        <Metric
          label="Wait (Mobile)"
          value={`${fmt(results.avgWaitTimeMobile)} min`}
          info="Average time a mobile/pickup customer waits. Mobile orders have priority over walk-ins."
        />
        <Metric
          label="Avg Queue"
          value={fmt(results.avgQueueLength)}
          info="Time-weighted average number of customers waiting in line across the simulation period."
        />
        <Metric
          label="Utilization"
          value={pct(results.serverUtilization)}
          info="Fraction of time baristas are actively serving (total busy time ÷ total available barista-time)."
        />
        <Metric
          label="Abandon Rate"
          value={pct(results.abandonmentRate)}
          sub={`${results.abandonedCustomers} of ${results.totalCustomers}`}
          info="Abandoned ÷ total customers. Only walk-ins can abandon (when wait exceeds their patience threshold)."
        />
        <Metric
          label="Served"
          value={`${results.servedCustomers}`}
          sub={`${results.servedWalkIn} walk-in, ${results.servedMobile} mobile`}
          info="Number of customers who completed service (were not abandoned)."
        />
        <Metric
          label="Revenue"
          value={dollar(results.totalRevenue)}
          accent
          info="(Served walk-ins × walk-in price) + (served mobile × mobile price). Abandoned customers generate $0."
        />
        <Metric
          label="Profit"
          value={dollar(results.profit)}
          sub={`Cost: ${dollar(results.totalCost)}`}
          accent={results.profit >= 0}
          info="Revenue − System Cost. System cost = labor + abandonment penalty + wait penalty."
        />
      </div>

      {/* Cost breakdown */}
      <div className="rounded-xl bg-white border border-neutral-200 p-4 shadow-sm">
        <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-3">
          Cost Breakdown
          <InfoTip text="These three components sum to the total system cost." />
        </p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-neutral-800 tabular-nums">
              {dollar(results.laborCost)}
            </p>
            <p className="text-[11px] text-neutral-400">
              Labor
              <InfoTip text="Baristas × hourly wage × simulation hours." />
            </p>
          </div>
          <div>
            <p className="text-lg font-bold text-neutral-500 tabular-nums">
              {dollar(results.abandonmentPenalty)}
            </p>
            <p className="text-[11px] text-neutral-400">
              Abandonment
              <InfoTip text="Number of abandoned customers × penalty cost per abandonment." />
            </p>
          </div>
          <div>
            <p className="text-lg font-bold text-neutral-500 tabular-nums">
              {dollar(results.waitPenalty)}
            </p>
            <p className="text-[11px] text-neutral-400">
              Wait Penalty
              <InfoTip text="Sum of all wait minutes (across served customers) × wait penalty rate per minute." />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
