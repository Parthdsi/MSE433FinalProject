import type { SimulationParams, SimulationResults } from '../types';

// ── Seeded PRNG (mulberry32) ────────────────────────────────────────────────

function createRng(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function exponentialRv(mean: number, rand: () => number): number {
  return -mean * Math.log(1 - rand());
}

function generatePoissonArrivals(
  ratePerHour: number,
  durationMinutes: number,
  rand: () => number,
): number[] {
  if (ratePerHour <= 0) return [];
  const meanGap = 60 / ratePerHour;
  const times: number[] = [];
  let t = 0;
  for (;;) {
    t += exponentialRv(meanGap, rand);
    if (t >= durationMinutes) break;
    times.push(t);
  }
  return times;
}

// ── Min-heap event queue ────────────────────────────────────────────────────

interface SimEvent {
  time: number;
  type: 0 | 1 | 2; // 0=arrival, 1=service_complete, 2=abandon
  customerId: number;
  baristaId: number;
}

class EventQueue {
  private h: SimEvent[] = [];
  get size() {
    return this.h.length;
  }

  push(e: SimEvent) {
    this.h.push(e);
    let i = this.h.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.h[i].time < this.h[p].time) {
        [this.h[i], this.h[p]] = [this.h[p], this.h[i]];
        i = p;
      } else break;
    }
  }

  pop(): SimEvent {
    const top = this.h[0];
    const last = this.h.pop()!;
    if (this.h.length > 0) {
      this.h[0] = last;
      let i = 0;
      for (;;) {
        let s = i;
        const l = 2 * i + 1,
          r = 2 * i + 2;
        if (l < this.h.length && this.h[l].time < this.h[s].time) s = l;
        if (r < this.h.length && this.h[r].time < this.h[s].time) s = r;
        if (s === i) break;
        [this.h[i], this.h[s]] = [this.h[s], this.h[i]];
        i = s;
      }
    }
    return top;
  }
}

// ── Customer record ─────────────────────────────────────────────────────────

const WALKIN = 0;
const MOBILE = 1;

interface Customer {
  type: number;
  arrivalTime: number;
  serviceStart: number;
  abandoned: boolean;
  inService: boolean;
  served: boolean;
}

// ── Single simulation run ───────────────────────────────────────────────────

export function runSimulation(
  params: SimulationParams,
  seed: number = 42,
): SimulationResults {
  const rand = createRng(seed);
  const duration = params.simulationHours * 60;
  const meanService = 60 / Math.max(params.serviceRate, 0.01);

  const walkInTimes = generatePoissonArrivals(params.walkInArrivalRate, duration, rand);
  const mobileTimes = generatePoissonArrivals(params.mobileArrivalRate, duration, rand);

  const customers: Customer[] = [];
  const events = new EventQueue();

  for (const t of walkInTimes) {
    const id = customers.length;
    customers.push({ type: WALKIN, arrivalTime: t, serviceStart: -1, abandoned: false, inService: false, served: false });
    events.push({ time: t, type: 0, customerId: id, baristaId: -1 });
  }
  for (const t of mobileTimes) {
    const id = customers.length;
    customers.push({ type: MOBILE, arrivalTime: t, serviceStart: -1, abandoned: false, inService: false, served: false });
    events.push({ time: t, type: 0, customerId: id, baristaId: -1 });
  }

  const numB = Math.max(params.numBaristas, 1);
  const baristaFree: boolean[] = Array(numB).fill(true);
  const mobileQ: number[] = [];
  const walkinQ: number[] = [];
  let queueSize = 0;
  let queueArea = 0;
  let lastTime = 0;
  let busyTime = 0;

  function findFree(): number {
    for (let i = 0; i < numB; i++) if (baristaFree[i]) return i;
    return -1;
  }

  function startService(cid: number, bid: number, now: number) {
    const c = customers[cid];
    c.inService = true;
    c.serviceStart = now;
    baristaFree[bid] = false;
    const dur = exponentialRv(meanService, rand);
    events.push({ time: now + dur, type: 1, customerId: cid, baristaId: bid });
  }

  function serveNext(bid: number, now: number) {
    while (mobileQ.length > 0) {
      const id = mobileQ.shift()!;
      const c = customers[id];
      if (!c.abandoned && !c.served) {
        queueSize--;
        startService(id, bid, now);
        return;
      }
    }
    while (walkinQ.length > 0) {
      const id = walkinQ.shift()!;
      const c = customers[id];
      if (!c.abandoned && !c.served) {
        queueSize--;
        startService(id, bid, now);
        return;
      }
    }
  }

  while (events.size > 0) {
    const ev = events.pop();
    queueArea += queueSize * (ev.time - lastTime);
    lastTime = ev.time;

    if (ev.type === 0) {
      // Arrival
      const free = findFree();
      if (free >= 0) {
        startService(ev.customerId, free, ev.time);
      } else {
        queueSize++;
        const c = customers[ev.customerId];
        if (c.type === MOBILE) {
          mobileQ.push(ev.customerId);
        } else {
          walkinQ.push(ev.customerId);
          if (params.abandonmentThreshold > 0) {
            events.push({ time: ev.time + params.abandonmentThreshold, type: 2, customerId: ev.customerId, baristaId: -1 });
          }
        }
      }
    } else if (ev.type === 1) {
      // Service complete
      const c = customers[ev.customerId];
      c.served = true;
      c.inService = false;
      busyTime += ev.time - c.serviceStart;
      baristaFree[ev.baristaId] = true;
      serveNext(ev.baristaId, ev.time);
    } else {
      // Abandon
      const c = customers[ev.customerId];
      if (!c.inService && !c.served && !c.abandoned) {
        c.abandoned = true;
        queueSize--;
      }
    }
  }

  // ── Compute metrics ─────────────────────────────────────────────────────
  let wiWait = 0, wiCount = 0;
  let moWait = 0, moCount = 0;
  let abandoned = 0;

  for (const c of customers) {
    if (c.abandoned) {
      abandoned++;
    } else if (c.served) {
      const w = c.serviceStart - c.arrivalTime;
      if (c.type === WALKIN) { wiWait += w; wiCount++; }
      else { moWait += w; moCount++; }
    }
  }

  const served = wiCount + moCount;
  const total = customers.length;

  const laborCost = numB * params.laborCostPerHour * params.simulationHours;
  const abandonPen = abandoned * params.penaltyCostPerAbandonment;
  const waitPen = (wiWait + moWait) * params.waitPenaltyPerMinute;
  const revenue = wiCount * params.revenuePerWalkIn + moCount * params.revenuePerMobile;

  return {
    avgWaitTimeWalkIn: wiCount > 0 ? wiWait / wiCount : 0,
    avgWaitTimeMobile: moCount > 0 ? moWait / moCount : 0,
    avgWaitTimeOverall: served > 0 ? (wiWait + moWait) / served : 0,
    avgQueueLength: duration > 0 ? queueArea / duration : 0,
    serverUtilization: busyTime / (numB * duration),
    abandonmentRate: total > 0 ? abandoned / total : 0,
    abandonedCustomers: abandoned,
    totalCustomers: total,
    servedCustomers: served,
    servedWalkIn: wiCount,
    servedMobile: moCount,
    totalRevenue: revenue,
    laborCost,
    abandonmentPenalty: abandonPen,
    waitPenalty: waitPen,
    totalCost: laborCost + abandonPen + waitPen,
    profit: revenue - (laborCost + abandonPen + waitPen),
  };
}

// ── Multiple replications for stability ─────────────────────────────────────

export function runSimulationAvg(
  params: SimulationParams,
  replications: number = 10,
  baseSeed: number = 42,
): SimulationResults {
  const all: SimulationResults[] = [];
  for (let i = 0; i < replications; i++) {
    all.push(runSimulation(params, baseSeed + i * 997));
  }

  const avg = (key: keyof SimulationResults) =>
    (all.reduce((s, r) => s + (r[key] as number), 0)) / replications;

  return {
    avgWaitTimeWalkIn: avg('avgWaitTimeWalkIn'),
    avgWaitTimeMobile: avg('avgWaitTimeMobile'),
    avgWaitTimeOverall: avg('avgWaitTimeOverall'),
    avgQueueLength: avg('avgQueueLength'),
    serverUtilization: avg('serverUtilization'),
    abandonmentRate: avg('abandonmentRate'),
    abandonedCustomers: Math.round(avg('abandonedCustomers')),
    totalCustomers: Math.round(avg('totalCustomers')),
    servedCustomers: Math.round(avg('servedCustomers')),
    servedWalkIn: Math.round(avg('servedWalkIn')),
    servedMobile: Math.round(avg('servedMobile')),
    totalRevenue: avg('totalRevenue'),
    laborCost: avg('laborCost'),
    abandonmentPenalty: avg('abandonmentPenalty'),
    waitPenalty: avg('waitPenalty'),
    totalCost: avg('totalCost'),
    profit: avg('profit'),
  };
}
