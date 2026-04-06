import type { HourlyDemand } from '../types';

interface RawRow {
  day: string;
  hour: number;
  type: 'Walk-in' | 'Pickup';
  arrivalRate: number;
  serviceTime: number;
  abandonProb: number;
}

const RAW: RawRow[] = [
  { day:'Monday',hour:8,type:'Walk-in',arrivalRate:18,serviceTime:4,abandonProb:0.10 },
  { day:'Monday',hour:8,type:'Pickup',arrivalRate:12,serviceTime:2,abandonProb:0.05 },
  { day:'Monday',hour:9,type:'Walk-in',arrivalRate:22,serviceTime:5,abandonProb:0.12 },
  { day:'Monday',hour:9,type:'Pickup',arrivalRate:15,serviceTime:2,abandonProb:0.06 },
  { day:'Monday',hour:10,type:'Walk-in',arrivalRate:25,serviceTime:5,abandonProb:0.15 },
  { day:'Monday',hour:10,type:'Pickup',arrivalRate:18,serviceTime:2,abandonProb:0.05 },
  { day:'Monday',hour:11,type:'Walk-in',arrivalRate:20,serviceTime:4,abandonProb:0.10 },
  { day:'Monday',hour:11,type:'Pickup',arrivalRate:14,serviceTime:2,abandonProb:0.04 },
  { day:'Monday',hour:12,type:'Walk-in',arrivalRate:15,serviceTime:4,abandonProb:0.08 },
  { day:'Monday',hour:12,type:'Pickup',arrivalRate:10,serviceTime:2,abandonProb:0.03 },
  { day:'Monday',hour:13,type:'Walk-in',arrivalRate:12,serviceTime:3,abandonProb:0.07 },
  { day:'Monday',hour:13,type:'Pickup',arrivalRate:8,serviceTime:2,abandonProb:0.02 },
  { day:'Monday',hour:14,type:'Walk-in',arrivalRate:10,serviceTime:3,abandonProb:0.05 },
  { day:'Monday',hour:14,type:'Pickup',arrivalRate:6,serviceTime:2,abandonProb:0.02 },
  { day:'Monday',hour:15,type:'Walk-in',arrivalRate:18,serviceTime:4,abandonProb:0.10 },
  { day:'Monday',hour:15,type:'Pickup',arrivalRate:12,serviceTime:2,abandonProb:0.05 },
  { day:'Monday',hour:16,type:'Walk-in',arrivalRate:28,serviceTime:5,abandonProb:0.18 },
  { day:'Monday',hour:16,type:'Pickup',arrivalRate:20,serviceTime:2,abandonProb:0.07 },
  { day:'Monday',hour:17,type:'Walk-in',arrivalRate:30,serviceTime:5,abandonProb:0.20 },
  { day:'Monday',hour:17,type:'Pickup',arrivalRate:25,serviceTime:2,abandonProb:0.08 },
  { day:'Monday',hour:18,type:'Walk-in',arrivalRate:22,serviceTime:4,abandonProb:0.15 },
  { day:'Monday',hour:18,type:'Pickup',arrivalRate:18,serviceTime:2,abandonProb:0.06 },
  { day:'Monday',hour:19,type:'Walk-in',arrivalRate:15,serviceTime:4,abandonProb:0.10 },
  { day:'Monday',hour:19,type:'Pickup',arrivalRate:12,serviceTime:2,abandonProb:0.05 },
  { day:'Monday',hour:20,type:'Walk-in',arrivalRate:10,serviceTime:3,abandonProb:0.08 },
  { day:'Monday',hour:20,type:'Pickup',arrivalRate:8,serviceTime:2,abandonProb:0.03 },

  { day:'Tuesday',hour:8,type:'Walk-in',arrivalRate:20,serviceTime:4,abandonProb:0.11 },
  { day:'Tuesday',hour:8,type:'Pickup',arrivalRate:14,serviceTime:2,abandonProb:0.05 },
  { day:'Tuesday',hour:9,type:'Walk-in',arrivalRate:23,serviceTime:5,abandonProb:0.13 },
  { day:'Tuesday',hour:9,type:'Pickup',arrivalRate:16,serviceTime:2,abandonProb:0.06 },
  { day:'Tuesday',hour:10,type:'Walk-in',arrivalRate:27,serviceTime:5,abandonProb:0.16 },
  { day:'Tuesday',hour:10,type:'Pickup',arrivalRate:19,serviceTime:2,abandonProb:0.05 },
  { day:'Tuesday',hour:11,type:'Walk-in',arrivalRate:21,serviceTime:4,abandonProb:0.11 },
  { day:'Tuesday',hour:11,type:'Pickup',arrivalRate:15,serviceTime:2,abandonProb:0.04 },
  { day:'Tuesday',hour:12,type:'Walk-in',arrivalRate:16,serviceTime:4,abandonProb:0.09 },
  { day:'Tuesday',hour:12,type:'Pickup',arrivalRate:11,serviceTime:2,abandonProb:0.03 },
  { day:'Tuesday',hour:13,type:'Walk-in',arrivalRate:13,serviceTime:3,abandonProb:0.07 },
  { day:'Tuesday',hour:13,type:'Pickup',arrivalRate:9,serviceTime:2,abandonProb:0.02 },
  { day:'Tuesday',hour:14,type:'Walk-in',arrivalRate:11,serviceTime:3,abandonProb:0.06 },
  { day:'Tuesday',hour:14,type:'Pickup',arrivalRate:7,serviceTime:2,abandonProb:0.02 },
  { day:'Tuesday',hour:15,type:'Walk-in',arrivalRate:19,serviceTime:4,abandonProb:0.11 },
  { day:'Tuesday',hour:15,type:'Pickup',arrivalRate:13,serviceTime:2,abandonProb:0.05 },
  { day:'Tuesday',hour:16,type:'Walk-in',arrivalRate:29,serviceTime:5,abandonProb:0.19 },
  { day:'Tuesday',hour:16,type:'Pickup',arrivalRate:21,serviceTime:2,abandonProb:0.07 },
  { day:'Tuesday',hour:17,type:'Walk-in',arrivalRate:31,serviceTime:5,abandonProb:0.21 },
  { day:'Tuesday',hour:17,type:'Pickup',arrivalRate:26,serviceTime:2,abandonProb:0.09 },
  { day:'Tuesday',hour:18,type:'Walk-in',arrivalRate:23,serviceTime:4,abandonProb:0.16 },
  { day:'Tuesday',hour:18,type:'Pickup',arrivalRate:19,serviceTime:2,abandonProb:0.06 },
  { day:'Tuesday',hour:19,type:'Walk-in',arrivalRate:16,serviceTime:4,abandonProb:0.11 },
  { day:'Tuesday',hour:19,type:'Pickup',arrivalRate:13,serviceTime:2,abandonProb:0.05 },
  { day:'Tuesday',hour:20,type:'Walk-in',arrivalRate:11,serviceTime:3,abandonProb:0.09 },
  { day:'Tuesday',hour:20,type:'Pickup',arrivalRate:9,serviceTime:2,abandonProb:0.03 },

  { day:'Wednesday',hour:8,type:'Walk-in',arrivalRate:19,serviceTime:4,abandonProb:0.10 },
  { day:'Wednesday',hour:8,type:'Pickup',arrivalRate:13,serviceTime:2,abandonProb:0.05 },
  { day:'Wednesday',hour:9,type:'Walk-in',arrivalRate:22,serviceTime:5,abandonProb:0.12 },
  { day:'Wednesday',hour:9,type:'Pickup',arrivalRate:15,serviceTime:2,abandonProb:0.06 },
  { day:'Wednesday',hour:10,type:'Walk-in',arrivalRate:26,serviceTime:5,abandonProb:0.17 },
  { day:'Wednesday',hour:10,type:'Pickup',arrivalRate:18,serviceTime:2,abandonProb:0.05 },
  { day:'Wednesday',hour:11,type:'Walk-in',arrivalRate:21,serviceTime:4,abandonProb:0.11 },
  { day:'Wednesday',hour:11,type:'Pickup',arrivalRate:14,serviceTime:2,abandonProb:0.04 },
  { day:'Wednesday',hour:12,type:'Walk-in',arrivalRate:16,serviceTime:4,abandonProb:0.09 },
  { day:'Wednesday',hour:12,type:'Pickup',arrivalRate:11,serviceTime:2,abandonProb:0.03 },
  { day:'Wednesday',hour:13,type:'Walk-in',arrivalRate:13,serviceTime:3,abandonProb:0.07 },
  { day:'Wednesday',hour:13,type:'Pickup',arrivalRate:9,serviceTime:2,abandonProb:0.02 },
  { day:'Wednesday',hour:14,type:'Walk-in',arrivalRate:11,serviceTime:3,abandonProb:0.06 },
  { day:'Wednesday',hour:14,type:'Pickup',arrivalRate:7,serviceTime:2,abandonProb:0.02 },
  { day:'Wednesday',hour:15,type:'Walk-in',arrivalRate:20,serviceTime:4,abandonProb:0.11 },
  { day:'Wednesday',hour:15,type:'Pickup',arrivalRate:13,serviceTime:2,abandonProb:0.05 },
  { day:'Wednesday',hour:16,type:'Walk-in',arrivalRate:28,serviceTime:5,abandonProb:0.18 },
  { day:'Wednesday',hour:16,type:'Pickup',arrivalRate:20,serviceTime:2,abandonProb:0.07 },
  { day:'Wednesday',hour:17,type:'Walk-in',arrivalRate:30,serviceTime:5,abandonProb:0.20 },
  { day:'Wednesday',hour:17,type:'Pickup',arrivalRate:25,serviceTime:2,abandonProb:0.08 },
  { day:'Wednesday',hour:18,type:'Walk-in',arrivalRate:22,serviceTime:4,abandonProb:0.15 },
  { day:'Wednesday',hour:18,type:'Pickup',arrivalRate:18,serviceTime:2,abandonProb:0.06 },
  { day:'Wednesday',hour:19,type:'Walk-in',arrivalRate:15,serviceTime:4,abandonProb:0.10 },
  { day:'Wednesday',hour:19,type:'Pickup',arrivalRate:12,serviceTime:2,abandonProb:0.05 },
  { day:'Wednesday',hour:20,type:'Walk-in',arrivalRate:10,serviceTime:3,abandonProb:0.08 },
  { day:'Wednesday',hour:20,type:'Pickup',arrivalRate:8,serviceTime:2,abandonProb:0.03 },

  { day:'Thursday',hour:8,type:'Walk-in',arrivalRate:18,serviceTime:4,abandonProb:0.10 },
  { day:'Thursday',hour:8,type:'Pickup',arrivalRate:12,serviceTime:2,abandonProb:0.05 },
  { day:'Thursday',hour:9,type:'Walk-in',arrivalRate:22,serviceTime:5,abandonProb:0.12 },
  { day:'Thursday',hour:9,type:'Pickup',arrivalRate:15,serviceTime:2,abandonProb:0.06 },
  { day:'Thursday',hour:10,type:'Walk-in',arrivalRate:25,serviceTime:5,abandonProb:0.15 },
  { day:'Thursday',hour:10,type:'Pickup',arrivalRate:18,serviceTime:2,abandonProb:0.05 },
  { day:'Thursday',hour:11,type:'Walk-in',arrivalRate:20,serviceTime:4,abandonProb:0.10 },
  { day:'Thursday',hour:11,type:'Pickup',arrivalRate:14,serviceTime:2,abandonProb:0.04 },
  { day:'Thursday',hour:12,type:'Walk-in',arrivalRate:15,serviceTime:4,abandonProb:0.08 },
  { day:'Thursday',hour:12,type:'Pickup',arrivalRate:10,serviceTime:2,abandonProb:0.03 },
  { day:'Thursday',hour:13,type:'Walk-in',arrivalRate:12,serviceTime:3,abandonProb:0.07 },
  { day:'Thursday',hour:13,type:'Pickup',arrivalRate:8,serviceTime:2,abandonProb:0.02 },
  { day:'Thursday',hour:14,type:'Walk-in',arrivalRate:10,serviceTime:3,abandonProb:0.05 },
  { day:'Thursday',hour:14,type:'Pickup',arrivalRate:6,serviceTime:2,abandonProb:0.02 },
  { day:'Thursday',hour:15,type:'Walk-in',arrivalRate:18,serviceTime:4,abandonProb:0.10 },
  { day:'Thursday',hour:15,type:'Pickup',arrivalRate:12,serviceTime:2,abandonProb:0.05 },
  { day:'Thursday',hour:16,type:'Walk-in',arrivalRate:28,serviceTime:5,abandonProb:0.18 },
  { day:'Thursday',hour:16,type:'Pickup',arrivalRate:20,serviceTime:2,abandonProb:0.07 },
  { day:'Thursday',hour:17,type:'Walk-in',arrivalRate:30,serviceTime:5,abandonProb:0.20 },
  { day:'Thursday',hour:17,type:'Pickup',arrivalRate:25,serviceTime:2,abandonProb:0.08 },
  { day:'Thursday',hour:18,type:'Walk-in',arrivalRate:22,serviceTime:4,abandonProb:0.15 },
  { day:'Thursday',hour:18,type:'Pickup',arrivalRate:18,serviceTime:2,abandonProb:0.06 },
  { day:'Thursday',hour:19,type:'Walk-in',arrivalRate:15,serviceTime:4,abandonProb:0.10 },
  { day:'Thursday',hour:19,type:'Pickup',arrivalRate:12,serviceTime:2,abandonProb:0.05 },
  { day:'Thursday',hour:20,type:'Walk-in',arrivalRate:10,serviceTime:3,abandonProb:0.08 },
  { day:'Thursday',hour:20,type:'Pickup',arrivalRate:8,serviceTime:2,abandonProb:0.03 },

  { day:'Friday',hour:8,type:'Walk-in',arrivalRate:20,serviceTime:4,abandonProb:0.11 },
  { day:'Friday',hour:8,type:'Pickup',arrivalRate:14,serviceTime:2,abandonProb:0.05 },
  { day:'Friday',hour:9,type:'Walk-in',arrivalRate:23,serviceTime:5,abandonProb:0.13 },
  { day:'Friday',hour:9,type:'Pickup',arrivalRate:16,serviceTime:2,abandonProb:0.06 },
  { day:'Friday',hour:10,type:'Walk-in',arrivalRate:27,serviceTime:5,abandonProb:0.16 },
  { day:'Friday',hour:10,type:'Pickup',arrivalRate:19,serviceTime:2,abandonProb:0.05 },
  { day:'Friday',hour:11,type:'Walk-in',arrivalRate:21,serviceTime:4,abandonProb:0.11 },
  { day:'Friday',hour:11,type:'Pickup',arrivalRate:15,serviceTime:2,abandonProb:0.04 },
  { day:'Friday',hour:12,type:'Walk-in',arrivalRate:16,serviceTime:4,abandonProb:0.09 },
  { day:'Friday',hour:12,type:'Pickup',arrivalRate:11,serviceTime:2,abandonProb:0.03 },
  { day:'Friday',hour:13,type:'Walk-in',arrivalRate:13,serviceTime:3,abandonProb:0.07 },
  { day:'Friday',hour:13,type:'Pickup',arrivalRate:9,serviceTime:2,abandonProb:0.02 },
  { day:'Friday',hour:14,type:'Walk-in',arrivalRate:11,serviceTime:3,abandonProb:0.06 },
  { day:'Friday',hour:14,type:'Pickup',arrivalRate:7,serviceTime:2,abandonProb:0.02 },
  { day:'Friday',hour:15,type:'Walk-in',arrivalRate:19,serviceTime:4,abandonProb:0.11 },
  { day:'Friday',hour:15,type:'Pickup',arrivalRate:13,serviceTime:2,abandonProb:0.05 },
  { day:'Friday',hour:16,type:'Walk-in',arrivalRate:29,serviceTime:5,abandonProb:0.19 },
  { day:'Friday',hour:16,type:'Pickup',arrivalRate:21,serviceTime:2,abandonProb:0.07 },
  { day:'Friday',hour:17,type:'Walk-in',arrivalRate:31,serviceTime:5,abandonProb:0.21 },
  { day:'Friday',hour:17,type:'Pickup',arrivalRate:26,serviceTime:2,abandonProb:0.09 },
  { day:'Friday',hour:18,type:'Walk-in',arrivalRate:23,serviceTime:4,abandonProb:0.16 },
  { day:'Friday',hour:18,type:'Pickup',arrivalRate:19,serviceTime:2,abandonProb:0.06 },
  { day:'Friday',hour:19,type:'Walk-in',arrivalRate:16,serviceTime:4,abandonProb:0.11 },
  { day:'Friday',hour:19,type:'Pickup',arrivalRate:13,serviceTime:2,abandonProb:0.05 },
  { day:'Friday',hour:20,type:'Walk-in',arrivalRate:11,serviceTime:3,abandonProb:0.09 },
  { day:'Friday',hour:20,type:'Pickup',arrivalRate:9,serviceTime:2,abandonProb:0.03 },

  { day:'Saturday',hour:8,type:'Walk-in',arrivalRate:15,serviceTime:4,abandonProb:0.09 },
  { day:'Saturday',hour:8,type:'Pickup',arrivalRate:10,serviceTime:2,abandonProb:0.04 },
  { day:'Saturday',hour:9,type:'Walk-in',arrivalRate:18,serviceTime:5,abandonProb:0.12 },
  { day:'Saturday',hour:9,type:'Pickup',arrivalRate:12,serviceTime:2,abandonProb:0.05 },
  { day:'Saturday',hour:10,type:'Walk-in',arrivalRate:22,serviceTime:5,abandonProb:0.15 },
  { day:'Saturday',hour:10,type:'Pickup',arrivalRate:15,serviceTime:2,abandonProb:0.05 },
  { day:'Saturday',hour:11,type:'Walk-in',arrivalRate:18,serviceTime:4,abandonProb:0.10 },
  { day:'Saturday',hour:11,type:'Pickup',arrivalRate:12,serviceTime:2,abandonProb:0.04 },
  { day:'Saturday',hour:12,type:'Walk-in',arrivalRate:14,serviceTime:4,abandonProb:0.08 },
  { day:'Saturday',hour:12,type:'Pickup',arrivalRate:10,serviceTime:2,abandonProb:0.03 },
  { day:'Saturday',hour:13,type:'Walk-in',arrivalRate:12,serviceTime:3,abandonProb:0.07 },
  { day:'Saturday',hour:13,type:'Pickup',arrivalRate:8,serviceTime:2,abandonProb:0.02 },
  { day:'Saturday',hour:14,type:'Walk-in',arrivalRate:10,serviceTime:3,abandonProb:0.05 },
  { day:'Saturday',hour:14,type:'Pickup',arrivalRate:6,serviceTime:2,abandonProb:0.02 },
  { day:'Saturday',hour:15,type:'Walk-in',arrivalRate:16,serviceTime:4,abandonProb:0.10 },
  { day:'Saturday',hour:15,type:'Pickup',arrivalRate:12,serviceTime:2,abandonProb:0.05 },
  { day:'Saturday',hour:16,type:'Walk-in',arrivalRate:24,serviceTime:5,abandonProb:0.17 },
  { day:'Saturday',hour:16,type:'Pickup',arrivalRate:18,serviceTime:2,abandonProb:0.06 },
  { day:'Saturday',hour:17,type:'Walk-in',arrivalRate:26,serviceTime:5,abandonProb:0.18 },
  { day:'Saturday',hour:17,type:'Pickup',arrivalRate:20,serviceTime:2,abandonProb:0.07 },
  { day:'Saturday',hour:18,type:'Walk-in',arrivalRate:20,serviceTime:4,abandonProb:0.13 },
  { day:'Saturday',hour:18,type:'Pickup',arrivalRate:16,serviceTime:2,abandonProb:0.05 },
  { day:'Saturday',hour:19,type:'Walk-in',arrivalRate:14,serviceTime:4,abandonProb:0.09 },
  { day:'Saturday',hour:19,type:'Pickup',arrivalRate:12,serviceTime:2,abandonProb:0.04 },
  { day:'Saturday',hour:20,type:'Walk-in',arrivalRate:10,serviceTime:3,abandonProb:0.08 },
  { day:'Saturday',hour:20,type:'Pickup',arrivalRate:8,serviceTime:2,abandonProb:0.03 },

  { day:'Sunday',hour:8,type:'Walk-in',arrivalRate:12,serviceTime:4,abandonProb:0.08 },
  { day:'Sunday',hour:8,type:'Pickup',arrivalRate:8,serviceTime:2,abandonProb:0.03 },
  { day:'Sunday',hour:9,type:'Walk-in',arrivalRate:15,serviceTime:5,abandonProb:0.10 },
  { day:'Sunday',hour:9,type:'Pickup',arrivalRate:10,serviceTime:2,abandonProb:0.04 },
  { day:'Sunday',hour:10,type:'Walk-in',arrivalRate:20,serviceTime:5,abandonProb:0.14 },
  { day:'Sunday',hour:10,type:'Pickup',arrivalRate:14,serviceTime:2,abandonProb:0.05 },
  { day:'Sunday',hour:11,type:'Walk-in',arrivalRate:16,serviceTime:4,abandonProb:0.11 },
  { day:'Sunday',hour:11,type:'Pickup',arrivalRate:12,serviceTime:2,abandonProb:0.04 },
  { day:'Sunday',hour:12,type:'Walk-in',arrivalRate:12,serviceTime:4,abandonProb:0.09 },
  { day:'Sunday',hour:12,type:'Pickup',arrivalRate:8,serviceTime:2,abandonProb:0.03 },
  { day:'Sunday',hour:13,type:'Walk-in',arrivalRate:10,serviceTime:3,abandonProb:0.07 },
  { day:'Sunday',hour:13,type:'Pickup',arrivalRate:6,serviceTime:2,abandonProb:0.02 },
  { day:'Sunday',hour:14,type:'Walk-in',arrivalRate:8,serviceTime:3,abandonProb:0.05 },
  { day:'Sunday',hour:14,type:'Pickup',arrivalRate:5,serviceTime:2,abandonProb:0.02 },
  { day:'Sunday',hour:15,type:'Walk-in',arrivalRate:14,serviceTime:4,abandonProb:0.09 },
  { day:'Sunday',hour:15,type:'Pickup',arrivalRate:10,serviceTime:2,abandonProb:0.04 },
  { day:'Sunday',hour:16,type:'Walk-in',arrivalRate:22,serviceTime:5,abandonProb:0.16 },
  { day:'Sunday',hour:16,type:'Pickup',arrivalRate:16,serviceTime:2,abandonProb:0.06 },
  { day:'Sunday',hour:17,type:'Walk-in',arrivalRate:24,serviceTime:5,abandonProb:0.17 },
  { day:'Sunday',hour:17,type:'Pickup',arrivalRate:18,serviceTime:2,abandonProb:0.07 },
  { day:'Sunday',hour:18,type:'Walk-in',arrivalRate:18,serviceTime:4,abandonProb:0.12 },
  { day:'Sunday',hour:18,type:'Pickup',arrivalRate:14,serviceTime:2,abandonProb:0.05 },
  { day:'Sunday',hour:19,type:'Walk-in',arrivalRate:12,serviceTime:4,abandonProb:0.08 },
  { day:'Sunday',hour:19,type:'Pickup',arrivalRate:10,serviceTime:2,abandonProb:0.03 },
  { day:'Sunday',hour:20,type:'Walk-in',arrivalRate:8,serviceTime:3,abandonProb:0.06 },
  { day:'Sunday',hour:20,type:'Pickup',arrivalRate:6,serviceTime:2,abandonProb:0.02 },
];

export const DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
] as const;

export type DayName = (typeof DAYS)[number];

function buildHourlyDemand(walkIn: RawRow, pickup: RawRow): HourlyDemand {
  return {
    hour: walkIn.hour,
    walkInArrivalRate: walkIn.arrivalRate,
    mobileArrivalRate: pickup.arrivalRate,
    avgServiceTimeWalkIn: walkIn.serviceTime,
    avgServiceTimeMobile: pickup.serviceTime,
    abandonmentProb: walkIn.abandonProb,
  };
}

export function getHoursForDay(day: DayName): HourlyDemand[] {
  const dayRows = RAW.filter((r) => r.day === day);
  const hours = [...new Set(dayRows.map((r) => r.hour))].sort((a, b) => a - b);

  return hours.map((h) => {
    const wi = dayRows.find((r) => r.hour === h && r.type === 'Walk-in')!;
    const pk = dayRows.find((r) => r.hour === h && r.type === 'Pickup')!;
    return buildHourlyDemand(wi, pk);
  });
}

export function getAverageDay(): HourlyDemand[] {
  const hours = [...new Set(RAW.map((r) => r.hour))].sort((a, b) => a - b);
  const numDays = DAYS.length;

  return hours.map((h) => {
    const wiRows = RAW.filter((r) => r.hour === h && r.type === 'Walk-in');
    const pkRows = RAW.filter((r) => r.hour === h && r.type === 'Pickup');

    return {
      hour: h,
      walkInArrivalRate: wiRows.reduce((s, r) => s + r.arrivalRate, 0) / numDays,
      mobileArrivalRate: pkRows.reduce((s, r) => s + r.arrivalRate, 0) / numDays,
      avgServiceTimeWalkIn: wiRows.reduce((s, r) => s + r.serviceTime, 0) / numDays,
      avgServiceTimeMobile: pkRows.reduce((s, r) => s + r.serviceTime, 0) / numDays,
      abandonmentProb: wiRows.reduce((s, r) => s + r.abandonProb, 0) / numDays,
    };
  });
}

export function getDemandProfile(day: DayName | 'Average'): HourlyDemand[] {
  return day === 'Average' ? getAverageDay() : getHoursForDay(day);
}
