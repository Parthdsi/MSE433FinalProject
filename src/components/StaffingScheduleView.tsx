import {
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from 'recharts';
import type { DailySchedule, HourlyStaffingResult } from '../types';
import InfoTip from './InfoTip';

interface Props {
  schedule: DailySchedule;
  laborCostPerHour: number;
}

function fmtHour(h: number) {
  if (h === 0 || h === 12) return h === 0 ? '12 AM' : '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

const dollar = (n: number) =>
  n < 0 ? `-$${Math.abs(n).toFixed(2)}` : `$${n.toFixed(2)}`;

// ── Shift consolidation ─────────────────────────────────────────────────────

interface ShiftBlock {
  startHour: number;
  endHour: number;
  baristas: number;
  numHours: number;
  sourceHours: HourlyStaffingResult[];
}

function buildShiftPlan(hours: HourlyStaffingResult[]): ShiftBlock[] {
  if (hours.length === 0) return [];

  const blocks: ShiftBlock[] = hours.map((h) => ({
    startHour: h.hour,
    endHour: h.hour + 1,
    baristas: h.optimalBaristas,
    numHours: 1,
    sourceHours: [h],
  }));

  let changed = true;
  while (changed) {
    changed = false;
    const merged: ShiftBlock[] = [blocks[0]];
    for (let i = 1; i < blocks.length; i++) {
      const prev = merged[merged.length - 1];
      const curr = blocks[i];
      if (Math.abs(prev.baristas - curr.baristas) <= 1) {
        prev.endHour = curr.endHour;
        prev.baristas = Math.max(prev.baristas, curr.baristas);
        prev.numHours += curr.numHours;
        prev.sourceHours = prev.sourceHours.concat(curr.sourceHours);
        changed = true;
      } else {
        merged.push({ ...curr, sourceHours: [...curr.sourceHours] });
      }
    }
    blocks.length = 0;
    blocks.push(...merged);
  }

  return blocks;
}

export default function StaffingScheduleView({ schedule, laborCostPerHour }: Props) {
  const chartData = schedule.hours.map((h) => ({
    hour: fmtHour(h.hour),
    baristas: h.optimalBaristas,
    demand: h.metrics.totalCustomers,
    waitTime: +h.metrics.avgWaitTimeOverall.toFixed(1),
    utilization: +(h.metrics.serverUtilization * 100).toFixed(0),
  }));

  return (
    <div className="space-y-4">
      {/* Summary banner */}
      <div className="rounded-xl bg-neutral-950 p-6 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-4">
          {schedule.day} &mdash; Staffing Schedule
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-white tabular-nums">
              {schedule.peakBaristas}
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Peak Baristas
              <InfoTip text="Maximum number of baristas needed in any single hour of the day." />
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold text-neutral-400 tabular-nums">
              {dollar(schedule.totalDailyLaborCost)}
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Labor Cost
              <InfoTip text="Sum of (baristas × hourly wage) for each hour. Only counts hours where baristas are scheduled." />
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold text-neutral-400 tabular-nums">
              {dollar(schedule.totalDailyRevenue)}
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Revenue
              <InfoTip text="(Served walk-ins × walk-in price) + (served mobile × mobile price). Abandoned customers generate no revenue." />
            </p>
          </div>
          <div>
            <p className={`text-3xl font-bold tabular-nums ${schedule.totalDailyProfit >= 0 ? 'text-white' : 'text-neutral-500'}`}>
              {dollar(schedule.totalDailyProfit)}
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Profit
              <InfoTip text="Revenue − System Cost. System cost includes labor, abandonment penalties, and wait penalties." />
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mt-4 pt-4 border-t border-neutral-800">
          <div>
            <p className="text-lg font-semibold text-neutral-300 tabular-nums">{schedule.totalCustomers}</p>
            <p className="text-[11px] text-neutral-500">
              Total Customers
              <InfoTip text="Total walk-in + mobile arrivals across all hours (from Poisson simulation)." />
            </p>
          </div>
          <div>
            <p className="text-lg font-semibold text-neutral-400 tabular-nums">{schedule.totalAbandoned}</p>
            <p className="text-[11px] text-neutral-500">
              Abandoned
              <InfoTip text="Walk-in customers who left before being served because their wait exceeded the patience threshold. Mobile orders never abandon." />
            </p>
          </div>
          <div>
            <p className="text-lg font-semibold text-neutral-300 tabular-nums">{dollar(schedule.totalDailyCost)}</p>
            <p className="text-[11px] text-neutral-500">
              System Cost
              <InfoTip text="Labor Cost + Abandonment Penalty (abandoned × penalty rate) + Wait Penalty (total wait minutes × penalty per minute)." />
            </p>
          </div>
          <div>
            <p className="text-lg font-semibold text-neutral-300 tabular-nums">
              {schedule.totalCustomers > 0
                ? ((schedule.totalAbandoned / schedule.totalCustomers) * 100).toFixed(1)
                : '0.0'}%
            </p>
            <p className="text-[11px] text-neutral-500">
              Abandon Rate
              <InfoTip text="Abandoned customers ÷ total customers. Only walk-ins can abandon." />
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl bg-white border border-neutral-200 p-5 shadow-sm">
        <p className="text-xs font-semibold text-neutral-500 mb-4">
          Recommended Baristas per Hour
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#a3a3a3' }} />
            <YAxis
              yAxisId="left"
              label={{ value: 'Baristas', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#a3a3a3' } }}
              allowDecimals={false}
              tick={{ fontSize: 10, fill: '#a3a3a3' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{ value: 'Customers/hr', angle: 90, position: 'insideRight', style: { fontSize: 11, fill: '#a3a3a3' } }}
              tick={{ fontSize: 10, fill: '#a3a3a3' }}
            />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e5e5' }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar yAxisId="left" dataKey="baristas" fill="#171717" name="Baristas" radius={[3, 3, 0, 0]} opacity={0.85} />
            <Line yAxisId="right" type="monotone" dataKey="demand" stroke="#a3a3a3" strokeWidth={2} dot={{ r: 3, fill: '#a3a3a3', stroke: '#a3a3a3' }} name="Customers" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Hourly table */}
      <div className="rounded-xl bg-white border border-neutral-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 text-neutral-400 text-[11px] uppercase tracking-wider">
              <th className="px-4 py-2.5 text-left font-semibold">Hour</th>
              <th className="px-4 py-2.5 text-right font-semibold">
                Baristas
                <InfoTip text="Optimal number of baristas for this hour, chosen to minimize system cost while meeting wait and abandon constraints." />
              </th>
              <th className="px-4 py-2.5 text-right font-semibold">
                Walk-in
                <InfoTip text="Estimated walk-in customer arrivals per hour from the dataset." />
              </th>
              <th className="px-4 py-2.5 text-right font-semibold">
                Mobile
                <InfoTip text="Estimated mobile/pickup customer arrivals per hour from the dataset." />
              </th>
              <th className="px-4 py-2.5 text-right font-semibold">
                Avg Wait
                <InfoTip text="Average time (minutes) a customer waits from arrival until service begins." />
              </th>
              <th className="px-4 py-2.5 text-right font-semibold">
                Util.
                <InfoTip text="Server utilization: fraction of time baristas are actively serving customers (busy time ÷ total available time)." />
              </th>
              <th className="px-4 py-2.5 text-right font-semibold">
                Abandon
                <InfoTip text="Percentage of customers who left without service. Only walk-ins abandon (when wait exceeds patience threshold)." />
              </th>
              <th className="px-4 py-2.5 text-right font-semibold">
                Profit
                <InfoTip text="Revenue − System Cost for this hour. System cost = labor + abandonment penalty + wait penalty." />
              </th>
            </tr>
          </thead>
          <tbody>
            {schedule.hours.map((h) => (
              <tr key={h.hour} className="border-t border-neutral-100 hover:bg-neutral-50 transition-colors">
                <td className="px-4 py-2 font-medium text-neutral-800">{fmtHour(h.hour)}</td>
                <td className="px-4 py-2 text-right">
                  <span className="inline-block bg-neutral-900 text-white font-bold rounded px-2 py-0.5 text-xs tabular-nums">
                    {h.optimalBaristas}
                  </span>
                </td>
                <td className="px-4 py-2 text-right text-neutral-500 tabular-nums">
                  {h.metrics.servedWalkIn + h.metrics.abandonedCustomers > 0
                    ? Math.round((h.metrics.totalCustomers * h.metrics.servedWalkIn) / Math.max(h.metrics.servedCustomers, 1))
                    : 0}
                </td>
                <td className="px-4 py-2 text-right text-neutral-500 tabular-nums">{h.metrics.servedMobile}</td>
                <td className="px-4 py-2 text-right text-neutral-500 tabular-nums">{h.metrics.avgWaitTimeOverall.toFixed(1)}m</td>
                <td className="px-4 py-2 text-right text-neutral-500 tabular-nums">{(h.metrics.serverUtilization * 100).toFixed(0)}%</td>
                <td className="px-4 py-2 text-right tabular-nums">
                  <span className={h.metrics.abandonmentRate > 0.1 ? 'text-neutral-800 font-medium' : 'text-neutral-400'}>
                    {(h.metrics.abandonmentRate * 100).toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-2 text-right tabular-nums">
                  <span className={h.metrics.profit >= 0 ? 'text-neutral-800' : 'text-neutral-400'}>
                    {dollar(h.metrics.profit)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Practical Shift Plan */}
      <ShiftPlanSection schedule={schedule} laborCostPerHour={laborCostPerHour} />
    </div>
  );
}

// ── Practical Shift Plan ────────────────────────────────────────────────────

function ShiftPlanSection({
  schedule,
  laborCostPerHour,
}: {
  schedule: DailySchedule;
  laborCostPerHour: number;
}) {
  const shifts = buildShiftPlan(schedule.hours);

  const shiftBaristaHours = shifts.reduce((sum, s) => sum + s.baristas * s.numHours, 0);
  const shiftLaborCost = shiftBaristaHours * laborCostPerHour;
  const abandonmentPenalty = schedule.hours.reduce((s, h) => s + h.metrics.abandonmentPenalty, 0);
  const waitPenalty = schedule.hours.reduce((s, h) => s + h.metrics.waitPenalty, 0);
  const shiftSystemCost = shiftLaborCost + abandonmentPenalty + waitPenalty;
  const shiftRevenue = schedule.totalDailyRevenue;
  const shiftProfit = shiftRevenue - shiftSystemCost;

  return (
    <div className="rounded-xl bg-white border border-neutral-200 p-5 shadow-sm">
      <div className="flex items-center gap-2.5 mb-1">
        <h3 className="text-xs font-bold text-neutral-800">
          Practical Shift Plan
        </h3>
        <span className="text-[10px] bg-neutral-900 text-white rounded-full px-2 py-0.5 font-medium">
          Realistic
        </span>
      </div>
      <p className="text-[11px] text-neutral-400 mb-5">
        Hours grouped into contiguous shifts, staffed at the peak need within each block.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-5">
        {shifts.map((s, i) => (
          <div key={i} className="rounded-lg bg-neutral-950 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
              Shift {i + 1}
            </p>
            <p className="text-2xl font-bold text-white tabular-nums">
              {s.baristas}
              <span className="text-sm font-medium text-neutral-500 ml-1">
                barista{s.baristas !== 1 ? 's' : ''}
              </span>
            </p>
            <p className="text-sm font-medium text-neutral-400 mt-1">
              {fmtHour(s.startHour)} &ndash; {fmtHour(s.endHour)}
            </p>
            <p className="text-[11px] mt-1.5 text-neutral-600">
              {s.numHours}hr &middot; {dollar(s.baristas * s.numHours * laborCostPerHour)} labor
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-3.5 text-sm space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-neutral-400">
            Daily revenue
            <InfoTip text="(Served walk-ins × walk-in price) + (served mobile × mobile price), summed across all hours." />
          </span>
          <span className="font-medium text-neutral-700 tabular-nums">{dollar(shiftRevenue)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-neutral-400">
            Shift-based labor cost
            <InfoTip text="Sum of (baristas × hourly wage × shift hours) for each shift block. Higher than the per-hour ideal because each shift is staffed at its peak need." />
          </span>
          <span className="font-medium text-neutral-700 tabular-nums">{dollar(shiftLaborCost)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-neutral-400">
            Abandonment penalty
            <InfoTip text="Number of abandoned customers × penalty cost per abandonment, summed across all hours." />
          </span>
          <span className="font-medium text-neutral-700 tabular-nums">{dollar(abandonmentPenalty)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-neutral-400">
            Wait penalty
            <InfoTip text="Total wait minutes across all served customers × penalty rate per minute." />
          </span>
          <span className="font-medium text-neutral-700 tabular-nums">{dollar(waitPenalty)}</span>
        </div>
        <div className="flex justify-between items-center border-t border-neutral-200 pt-1.5">
          <span className="text-neutral-400">
            System cost
            <InfoTip text="Labor + abandonment penalty + wait penalty. Uses shift-based labor (not idealized per-hour)." />
          </span>
          <span className="font-medium text-neutral-700 tabular-nums">{dollar(shiftSystemCost)}</span>
        </div>
        <div className="flex justify-between items-center border-t border-neutral-200 pt-1.5">
          <span className="text-neutral-600 font-medium">
            Estimated daily profit
            <InfoTip text="Revenue − system cost (which includes shift-based labor, abandonment penalty, and wait penalty)." />
          </span>
          <span className={`font-bold tabular-nums ${shiftProfit >= 0 ? 'text-neutral-900' : 'text-neutral-400'}`}>
            {dollar(shiftProfit)}
          </span>
        </div>
      </div>

      <p className="text-[10px] text-neutral-400 mt-3">
        Adjacent hours merged when optimal staffing differs by &le;1 barista.
        Each shift staffed at the maximum needed across its hours.
      </p>
    </div>
  );
}
