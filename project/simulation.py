"""
Discrete-event simulation of an M/M/s coffee shop queue with:
  - Priority scheduling (Pickup/Mobile orders served before Walk-ins)
  - Walk-in abandonment based on per-hour probability
"""

import simpy
import numpy as np
from dataclasses import dataclass, field


PRIORITY_PICKUP = 0   # higher priority (lower number = higher priority in SimPy)
PRIORITY_WALKIN = 1


@dataclass
class SimMetrics:
    """Accumulates raw metrics during a simulation run."""
    total_served: int = 0
    total_abandoned: int = 0
    total_arrivals: int = 0
    total_wait_time: float = 0.0
    wait_times: list = field(default_factory=list)
    queue_length_area: float = 0.0
    busy_time: float = 0.0          # total barista-minutes of work
    last_event_time: float = 0.0


@dataclass
class SimResults:
    """Post-processed results from one simulation run."""
    avg_wait_time: float
    avg_queue_length: float
    utilization: float
    total_served: int
    total_abandoned: int
    total_arrivals: int
    abandonment_rate: float
    revenue: float
    labor_cost: float
    waiting_penalty: float
    total_cost: float
    profit: float


def _customer(
    env: simpy.Environment,
    name: str,
    server: simpy.PriorityResource,
    priority: int,
    service_time_mean: float,
    abandon_prob: float,
    metrics: SimMetrics,
    rng: np.random.Generator,
    waiting_penalty_per_min: float,
    revenue_per_order: float,
):
    """Process representing a single customer."""
    arrival_time = env.now
    metrics.total_arrivals += 1

    if priority == PRIORITY_WALKIN and rng.random() < abandon_prob:
        metrics.total_abandoned += 1
        return

    with server.request(priority=priority) as req:
        yield req
        wait = env.now - arrival_time
        metrics.total_wait_time += wait
        metrics.wait_times.append(wait)

        service_duration = rng.exponential(service_time_mean)
        yield env.timeout(service_duration)

        metrics.total_served += 1
        metrics.busy_time += service_duration


def _arrival_generator(
    env: simpy.Environment,
    server: simpy.PriorityResource,
    schedule: dict[int, list[dict]],
    metrics: SimMetrics,
    rng: np.random.Generator,
    sim_hours: int,
    waiting_penalty_per_min: float,
    revenue_per_order: float,
):
    """
    Generates Poisson arrivals that change rate each hour based on the schedule.
    Time units are minutes throughout the simulation.
    """
    hours = sorted(schedule.keys())
    start_hour = hours[0]
    customer_id = 0

    for offset in range(sim_hours):
        hour_idx = offset % len(hours)
        current_hour = hours[hour_idx]
        params_list = schedule[current_hour]
        hour_start = offset * 60  # minute offset within the simulation

        combined_rate = sum(p["arrival_rate"] for p in params_list)
        if combined_rate == 0:
            yield env.timeout(60)
            continue

        inter_arrival = 60.0 / combined_rate  # mean minutes between arrivals

        type_weights = [p["arrival_rate"] for p in params_list]
        total_weight = sum(type_weights)
        type_probs = [w / total_weight for w in type_weights]

        elapsed = 0.0
        while elapsed < 60.0:
            gap = rng.exponential(inter_arrival)
            elapsed += gap
            if elapsed >= 60.0:
                break

            yield env.timeout(gap)
            customer_id += 1

            chosen_idx = rng.choice(len(params_list), p=type_probs)
            p = params_list[chosen_idx]
            ctype = p["customer_type"]
            priority = PRIORITY_PICKUP if ctype == "Pickup" else PRIORITY_WALKIN
            abandon = p["abandon_prob"] if priority == PRIORITY_WALKIN else 0.0

            env.process(_customer(
                env, f"C{customer_id}", server, priority,
                p["service_time"], abandon, metrics, rng,
                waiting_penalty_per_min, revenue_per_order,
            ))

        remaining = 60.0 - (env.now - hour_start)
        if remaining > 0:
            yield env.timeout(remaining)


def run_simulation(
    schedule: dict[int, list[dict]],
    num_baristas: int,
    sim_hours: int = 13,
    revenue_per_order: float = 5.0,
    barista_wage_per_hr: float = 15.0,
    waiting_penalty_per_min: float = 0.10,
    seed: int | None = None,
) -> SimResults:
    """
    Run one simulation replication.

    Parameters
    ----------
    schedule : dict mapping hour -> list of param dicts
    num_baristas : number of servers (s)
    sim_hours : how many hours to simulate
    revenue_per_order : revenue earned per served customer
    barista_wage_per_hr : wage cost per barista per hour
    waiting_penalty_per_min : cost charged per minute a customer waits
    seed : random seed for reproducibility

    Returns
    -------
    SimResults with all performance / financial metrics
    """
    rng = np.random.default_rng(seed)
    env = simpy.Environment()
    server = simpy.PriorityResource(env, capacity=num_baristas)
    metrics = SimMetrics()

    env.process(_arrival_generator(
        env, server, schedule, metrics, rng,
        sim_hours, waiting_penalty_per_min, revenue_per_order,
    ))

    sim_duration = sim_hours * 60  # minutes
    env.run(until=sim_duration)

    avg_wait = metrics.total_wait_time / max(metrics.total_served, 1)
    avg_queue = metrics.total_wait_time / sim_duration
    utilization = metrics.busy_time / (num_baristas * sim_duration)

    total_arrivals = metrics.total_arrivals
    abandonment_rate = metrics.total_abandoned / max(total_arrivals, 1)

    revenue = metrics.total_served * revenue_per_order
    labor_cost = num_baristas * barista_wage_per_hr * sim_hours
    waiting_penalty = metrics.total_wait_time * waiting_penalty_per_min
    total_cost = labor_cost + waiting_penalty
    profit = revenue - total_cost

    return SimResults(
        avg_wait_time=avg_wait,
        avg_queue_length=avg_queue,
        utilization=utilization,
        total_served=metrics.total_served,
        total_abandoned=metrics.total_abandoned,
        total_arrivals=total_arrivals,
        abandonment_rate=abandonment_rate,
        revenue=revenue,
        labor_cost=labor_cost,
        waiting_penalty=waiting_penalty,
        total_cost=total_cost,
        profit=profit,
    )


def run_simulation_replications(
    schedule: dict[int, list[dict]],
    num_baristas: int,
    replications: int = 10,
    **kwargs,
) -> SimResults:
    """
    Run multiple replications and return averaged results for stability.
    """
    all_results: list[SimResults] = []
    base_seed = kwargs.pop("seed", 42)

    for i in range(replications):
        res = run_simulation(schedule, num_baristas, seed=base_seed + i, **kwargs)
        all_results.append(res)

    def avg(attr):
        return sum(getattr(r, attr) for r in all_results) / replications

    return SimResults(
        avg_wait_time=avg("avg_wait_time"),
        avg_queue_length=avg("avg_queue_length"),
        utilization=avg("utilization"),
        total_served=round(avg("total_served")),
        total_abandoned=round(avg("total_abandoned")),
        total_arrivals=round(avg("total_arrivals")),
        abandonment_rate=avg("abandonment_rate"),
        revenue=avg("revenue"),
        labor_cost=avg("labor_cost"),
        waiting_penalty=avg("waiting_penalty"),
        total_cost=avg("total_cost"),
        profit=avg("profit"),
    )
