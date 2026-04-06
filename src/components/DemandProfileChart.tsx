import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { HourlyDemand } from '../types';

interface Props {
  demand: HourlyDemand[];
  day: string;
}

function fmtHour(h: number) {
  if (h === 0 || h === 12) return h === 0 ? '12 AM' : '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

export default function DemandProfileChart({ demand, day }: Props) {
  const data = demand.map((d) => ({
    hour: fmtHour(d.hour),
    'Walk-in': d.walkInArrivalRate,
    'Mobile': d.mobileArrivalRate,
    total: +(d.walkInArrivalRate + d.mobileArrivalRate).toFixed(0),
  }));

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-3 mt-4">
      <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
        {day} Demand Profile
      </p>
      <p className="text-[10px] text-neutral-600 mb-2">Arrivals per hour from POS data</p>
      <ResponsiveContainer width="100%" height={150}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
          <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#737373' }} interval={2} />
          <YAxis tick={{ fontSize: 9, fill: '#737373' }} />
          <Tooltip contentStyle={{ fontSize: 11, backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          <Area
            type="monotone"
            dataKey="Walk-in"
            stackId="1"
            fill="#525252"
            stroke="#737373"
            fillOpacity={0.5}
          />
          <Area
            type="monotone"
            dataKey="Mobile"
            stackId="1"
            fill="#a3a3a3"
            stroke="#d4d4d4"
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
