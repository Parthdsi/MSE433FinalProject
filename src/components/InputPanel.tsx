import type { OptimizationConstraints, HourlyDemand, SimulationParams } from '../types';
import type { CostParams } from '../lib/optimizer';
import type { DayName } from '../lib/dataset';
import { DAYS } from '../lib/dataset';

export type DaySelection = DayName | 'Average' | 'Custom';

interface Props {
  selectedDay: DaySelection;
  onDayChange: (day: DaySelection) => void;
  demand: HourlyDemand[] | null;
  customParams: SimulationParams;
  onCustomParamsChange: (p: SimulationParams) => void;
  cost: CostParams;
  onCostChange: (c: CostParams) => void;
  constraints: OptimizationConstraints;
  onConstraintsChange: (c: OptimizationConstraints) => void;
  onOptimize: () => void;
  isRunning: boolean;
}

function Field({
  label,
  value,
  onChange,
  suffix,
  prefix,
  min,
  max,
  step = 1,
  disabled = false,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  prefix?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-neutral-500 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-1.5">
        {prefix && (
          <span className="text-xs text-neutral-600 w-3">{prefix}</span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={`block w-full px-2.5 py-1.5 rounded-lg border text-sm transition-colors
                     focus:outline-none focus:ring-1 focus:ring-neutral-600 focus:border-neutral-600
                     ${disabled
                       ? 'bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed'
                       : 'bg-neutral-900 border-neutral-800 text-neutral-200 hover:border-neutral-700'
                     }`}
        />
        {suffix && (
          <span className="text-[11px] text-neutral-600 whitespace-nowrap">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function fmtHour(h: number) {
  if (h === 0 || h === 12) return h === 0 ? '12 AM' : '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

function DemandSummary({ demand, day }: { demand: HourlyDemand[]; day: string }) {
  const totals = demand.map((d) => ({
    hour: d.hour,
    total: d.walkInArrivalRate + d.mobileArrivalRate,
    walkIn: d.walkInArrivalRate,
    mobile: d.mobileArrivalRate,
  }));

  const peak = totals.reduce((a, b) => (b.total > a.total ? b : a));
  const quietest = totals.reduce((a, b) => (b.total < a.total ? b : a));
  const avgTotal = totals.reduce((s, t) => s + t.total, 0) / totals.length;
  const avgWalkIn = totals.reduce((s, t) => s + t.walkIn, 0) / totals.length;
  const avgMobile = totals.reduce((s, t) => s + t.mobile, 0) / totals.length;

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-3 space-y-2">
      <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
        {day} Demand
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
        <span className="text-neutral-500">Peak hour</span>
        <span className="font-medium text-neutral-300">
          {fmtHour(peak.hour)} ({peak.total.toFixed(0)}/hr)
        </span>
        <span className="text-neutral-500">Quietest hour</span>
        <span className="font-medium text-neutral-300">
          {fmtHour(quietest.hour)} ({quietest.total.toFixed(0)}/hr)
        </span>
        <span className="text-neutral-500">Avg walk-in</span>
        <span className="font-medium text-neutral-300">
          {avgWalkIn.toFixed(1)}/hr
        </span>
        <span className="text-neutral-500">Avg mobile</span>
        <span className="font-medium text-neutral-300">
          {avgMobile.toFixed(1)}/hr
        </span>
        <span className="text-neutral-500">Avg total</span>
        <span className="font-medium text-neutral-300">
          {avgTotal.toFixed(1)}/hr
        </span>
        <span className="text-neutral-500">Hours</span>
        <span className="font-medium text-neutral-300">
          {fmtHour(demand[0].hour)} &ndash; {fmtHour(demand[demand.length - 1].hour + 1)}
        </span>
      </div>
    </div>
  );
}

export default function InputPanel({
  selectedDay,
  onDayChange,
  demand,
  customParams,
  onCustomParamsChange,
  cost,
  onCostChange,
  constraints,
  onConstraintsChange,
  onOptimize,
  isRunning,
}: Props) {
  const isCustom = selectedDay === 'Custom';

  const setC = (key: keyof CostParams, v: number) =>
    onCostChange({ ...cost, [key]: v });

  const setP = (key: keyof SimulationParams, v: number) =>
    onCustomParamsChange({ ...customParams, [key]: v });

  return (
    <div className="space-y-5">
      {/* Data source */}
      <section>
        <h3 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
          Data Source
        </h3>
        <select
          value={selectedDay}
          onChange={(e) => onDayChange(e.target.value as DaySelection)}
          className="block w-full px-2.5 py-2 rounded-lg border border-neutral-800 text-sm
                     focus:outline-none focus:ring-1 focus:ring-neutral-600 focus:border-neutral-600
                     bg-neutral-900 text-neutral-200 cursor-pointer"
        >
          <optgroup label="Historical POS Data">
            <option value="Average">Week Average</option>
            {DAYS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </optgroup>
          <optgroup label="Manual">
            <option value="Custom">Custom Input</option>
          </optgroup>
        </select>
      </section>

      {!isCustom && demand && (
        <DemandSummary demand={demand} day={selectedDay} />
      )}

      {isCustom && (
        <section>
          <h3 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
            Custom Demand
          </h3>
          <div className="space-y-2">
            <Field label="Walk-in arrival rate" value={customParams.walkInArrivalRate} onChange={(v) => setP('walkInArrivalRate', v)} suffix="/hr" min={0} />
            <Field label="Mobile (pickup) arrival rate" value={customParams.mobileArrivalRate} onChange={(v) => setP('mobileArrivalRate', v)} suffix="/hr" min={0} />
            <Field label="Service rate per barista" value={customParams.serviceRate} onChange={(v) => setP('serviceRate', v)} suffix="cust/hr" min={1} />
            <Field label="Simulation duration" value={customParams.simulationHours} onChange={(v) => setP('simulationHours', v)} suffix="hours" min={1} max={24} />
          </div>
        </section>
      )}

      <div className="border-t border-neutral-800/60" />

      {/* Revenue */}
      <section>
        <h3 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
          Revenue per Order
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Walk-in" value={cost.revenuePerWalkIn} onChange={(v) => setC('revenuePerWalkIn', v)} prefix="$" min={0} step={0.25} />
          <Field label="Mobile" value={cost.revenuePerMobile} onChange={(v) => setC('revenuePerMobile', v)} prefix="$" min={0} step={0.25} />
        </div>
      </section>

      {/* Costs */}
      <section>
        <h3 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
          Labor &amp; Penalties
        </h3>
        <div className="space-y-2">
          <Field label="Labor cost per barista" value={cost.laborCostPerHour} onChange={(v) => setC('laborCostPerHour', v)} prefix="$" suffix="/hr" min={0} step={0.5} />
          <Field label="Walk-in patience threshold" value={cost.abandonmentThreshold} onChange={(v) => setC('abandonmentThreshold', v)} suffix="min" min={1} step={0.5} />
          <Field label="Penalty per abandonment" value={cost.penaltyCostPerAbandonment} onChange={(v) => setC('penaltyCostPerAbandonment', v)} prefix="$" min={0} step={0.25} />
          <Field label="Wait penalty rate" value={cost.waitPenaltyPerMinute} onChange={(v) => setC('waitPenaltyPerMinute', v)} prefix="$" suffix="/min" min={0} step={0.01} />
        </div>
      </section>

      <div className="border-t border-neutral-800/60" />

      {/* Constraints */}
      <section>
        <h3 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
          Service-Level Constraints
        </h3>
        <div className="space-y-2">
          <Field label="Max acceptable avg wait" value={constraints.maxWaitTime} onChange={(v) => onConstraintsChange({ ...constraints, maxWaitTime: v })} suffix="min" min={1} />
          <Field label="Max abandonment rate" value={Math.round(constraints.maxAbandonmentRate * 100)} onChange={(v) => onConstraintsChange({ ...constraints, maxAbandonmentRate: v / 100 })} suffix="%" min={0} max={100} />
        </div>
      </section>

      {/* Action */}
      <div className="pt-1">
        <button
          onClick={onOptimize}
          disabled={isRunning}
          className="w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all
                     bg-white text-neutral-900 hover:bg-neutral-200 active:scale-[0.98]
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isRunning
            ? 'Optimizing...'
            : isCustom
              ? 'Optimize Staffing (s = 1..10)'
              : 'Optimize Daily Schedule'}
        </button>
        <p className="text-[11px] text-neutral-600 mt-2 text-center">
          {isCustom
            ? 'Sweeps 1\u201310 baristas using flat demand rates'
            : 'Sweeps 1\u201310 baristas per hour using historical data'}
        </p>
      </div>
    </div>
  );
}
