import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { OptimizationResult, SensitivityResult } from '../types';

interface Props {
  optimization: OptimizationResult | null;
  sensitivity: SensitivityResult | null;
}

const TOOLTIP_STYLE = {
  fontSize: 12,
  borderRadius: 8,
  border: '1px solid #e5e5e5',
  backgroundColor: '#fff',
};

const AXIS_TICK = { fontSize: 10, fill: '#a3a3a3' };
const AXIS_LABEL_STYLE = { fontSize: 11, fill: '#a3a3a3' };
const GRID_COLOR = '#f0f0f0';

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white border border-neutral-200 p-5 shadow-sm">
      <p className="text-xs font-semibold text-neutral-500 mb-4">{title}</p>
      {children}
    </div>
  );
}

export default function Charts({ optimization, sensitivity }: Props) {
  if (!optimization && !sensitivity) return null;

  const optData = optimization
    ? optimization.staffingLevels.map((s, i) => ({
        baristas: s,
        totalCost: +optimization.results[i].totalCost.toFixed(2),
        laborCost: +optimization.results[i].laborCost.toFixed(2),
        waitPenalty: +optimization.results[i].waitPenalty.toFixed(2),
        abandonPenalty: +optimization.results[i].abandonmentPenalty.toFixed(2),
        profit: +optimization.results[i].profit.toFixed(2),
      }))
    : [];

  const waitData = optimization
    ? optimization.staffingLevels.map((s, i) => ({
        baristas: s,
        walkIn: +optimization.results[i].avgWaitTimeWalkIn.toFixed(2),
        mobile: +optimization.results[i].avgWaitTimeMobile.toFixed(2),
        overall: +optimization.results[i].avgWaitTimeOverall.toFixed(2),
      }))
    : [];

  const abandonData = optimization
    ? optimization.staffingLevels.map((s, i) => ({
        baristas: s,
        rate: +(optimization.results[i].abandonmentRate * 100).toFixed(1),
        utilization: +(optimization.results[i].serverUtilization * 100).toFixed(1),
      }))
    : [];

  const sensData = sensitivity
    ? sensitivity.multipliers.map((m, i) => ({
        rate: +sensitivity.totalRates[i].toFixed(0),
        multiplier: `${m.toFixed(1)}x`,
        waitTime: +sensitivity.results[i].avgWaitTimeOverall.toFixed(2),
        abandonRate: +(sensitivity.results[i].abandonmentRate * 100).toFixed(1),
        totalCost: +sensitivity.results[i].totalCost.toFixed(2),
      }))
    : [];

  const optimal = optimization?.optimalBaristas;

  return (
    <div className="space-y-4">
      {optimization && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Cost & Profit vs. Staffing Level">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={optData}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis dataKey="baristas" label={{ value: 'Baristas', position: 'insideBottom', offset: -5, style: AXIS_LABEL_STYLE }} tick={AXIS_TICK} />
                <YAxis label={{ value: 'Dollars ($)', angle: -90, position: 'insideLeft', style: AXIS_LABEL_STYLE }} tick={AXIS_TICK} />
                <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {optimal && (
                  <ReferenceLine x={optimal} stroke="#d4d4d4" strokeDasharray="4 4"
                    label={{ value: `s*=${optimal}`, position: 'top', style: { fontSize: 10, fill: '#a3a3a3' } }}
                  />
                )}
                <Line type="monotone" dataKey="profit" stroke="#171717" strokeWidth={2} name="Profit" dot={{ r: 3, fill: '#171717' }} />
                <Line type="monotone" dataKey="totalCost" stroke="#a3a3a3" strokeWidth={2} name="Total Cost" dot={{ r: 3, fill: '#a3a3a3' }} />
                <Line type="monotone" dataKey="laborCost" stroke="#d4d4d4" strokeWidth={1} strokeDasharray="5 5" name="Labor" dot={false} />
                <Line type="monotone" dataKey="waitPenalty" stroke="#e5e5e5" strokeWidth={1} strokeDasharray="5 5" name="Wait Penalty" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Wait Time vs. Staffing Level">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={waitData}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis dataKey="baristas" label={{ value: 'Baristas', position: 'insideBottom', offset: -5, style: AXIS_LABEL_STYLE }} tick={AXIS_TICK} />
                <YAxis label={{ value: 'Wait (min)', angle: -90, position: 'insideLeft', style: AXIS_LABEL_STYLE }} tick={AXIS_TICK} />
                <Tooltip formatter={(v: number) => `${v.toFixed(2)} min`} contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {optimal && <ReferenceLine x={optimal} stroke="#d4d4d4" strokeDasharray="4 4" />}
                <Line type="monotone" dataKey="overall" stroke="#171717" strokeWidth={2} name="Overall" dot={{ r: 3, fill: '#171717' }} />
                <Line type="monotone" dataKey="walkIn" stroke="#a3a3a3" strokeWidth={1} strokeDasharray="4 4" name="Walk-in" dot={false} />
                <Line type="monotone" dataKey="mobile" stroke="#d4d4d4" strokeWidth={1} strokeDasharray="4 4" name="Mobile" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Abandonment & Utilization vs. Staffing Level">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={abandonData}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis dataKey="baristas" label={{ value: 'Baristas', position: 'insideBottom', offset: -5, style: AXIS_LABEL_STYLE }} tick={AXIS_TICK} />
                <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', style: AXIS_LABEL_STYLE }} tick={AXIS_TICK} />
                <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {optimal && <ReferenceLine x={optimal} stroke="#d4d4d4" strokeDasharray="4 4" />}
                <Line type="monotone" dataKey="rate" stroke="#171717" strokeWidth={2} name="Abandon Rate" dot={{ r: 3, fill: '#171717' }} />
                <Line type="monotone" dataKey="utilization" stroke="#a3a3a3" strokeWidth={2} name="Utilization" dot={{ r: 3, fill: '#a3a3a3' }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {sensitivity && (
            <ChartCard title="Sensitivity: Metrics vs. Total Arrival Rate">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={sensData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis dataKey="rate" label={{ value: 'Total Arrival Rate (/hr)', position: 'insideBottom', offset: -5, style: AXIS_LABEL_STYLE }} tick={AXIS_TICK} />
                  <YAxis yAxisId="left" label={{ value: 'Wait / Abandon (%)', angle: -90, position: 'insideLeft', style: AXIS_LABEL_STYLE }} tick={AXIS_TICK} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Cost ($)', angle: 90, position: 'insideRight', style: AXIS_LABEL_STYLE }} tick={AXIS_TICK} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line yAxisId="left" type="monotone" dataKey="waitTime" stroke="#171717" strokeWidth={2} name="Avg Wait (min)" dot={{ r: 3, fill: '#171717' }} />
                  <Line yAxisId="left" type="monotone" dataKey="abandonRate" stroke="#a3a3a3" strokeWidth={2} name="Abandon (%)" dot={{ r: 3, fill: '#a3a3a3' }} />
                  <Line yAxisId="right" type="monotone" dataKey="totalCost" stroke="#d4d4d4" strokeWidth={2} strokeDasharray="5 5" name="Cost ($)" dot={{ r: 3, fill: '#d4d4d4' }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>
      )}
    </div>
  );
}
