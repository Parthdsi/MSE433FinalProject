"""
Sweeps over staffing levels and identifies the cost-minimizing number of baristas.
"""

from dataclasses import dataclass
from simulation import SimResults, run_simulation_replications


@dataclass
class OptimizationResult:
    """Holds results across all tested staffing levels."""
    staffing_levels: list[int]
    results: list[SimResults]
    optimal_baristas: int
    optimal_result: SimResults


def optimize_staffing(
    schedule: dict[int, list[dict]],
    min_baristas: int = 1,
    max_baristas: int = 10,
    replications: int = 10,
    **sim_kwargs,
) -> OptimizationResult:
    """
    Run the simulation for each staffing level in [min_baristas, max_baristas]
    and return the level that maximises profit (revenue - cost).

    Parameters
    ----------
    schedule : hourly demand schedule
    min_baristas, max_baristas : range to search
    replications : number of simulation replications per staffing level
    **sim_kwargs : forwarded to run_simulation_replications
                   (sim_hours, revenue_per_order, barista_wage_per_hr,
                    waiting_penalty_per_min, seed)

    Returns
    -------
    OptimizationResult with every level's results and the optimum.
    """
    levels = list(range(min_baristas, max_baristas + 1))
    results: list[SimResults] = []

    for s in levels:
        print(f"  Simulating with {s} barista(s) …")
        res = run_simulation_replications(
            schedule, num_baristas=s, replications=replications, **sim_kwargs,
        )
        results.append(res)

    best_idx = max(range(len(results)), key=lambda i: results[i].profit)

    return OptimizationResult(
        staffing_levels=levels,
        results=results,
        optimal_baristas=levels[best_idx],
        optimal_result=results[best_idx],
    )


def print_optimization_summary(opt: OptimizationResult) -> None:
    """Pretty-print the optimization sweep and highlight the optimum."""
    header = (
        f"{'Baristas':>8} | {'Served':>7} | {'Abandoned':>9} | "
        f"{'Avg Wait':>9} | {'Util':>6} | {'Revenue':>9} | "
        f"{'Labor $':>9} | {'Wait Pen':>9} | {'Profit':>9}"
    )
    print("\n" + "=" * len(header))
    print("  STAFFING OPTIMIZATION RESULTS")
    print("=" * len(header))
    print(header)
    print("-" * len(header))

    for s, r in zip(opt.staffing_levels, opt.results):
        marker = " <<<" if s == opt.optimal_baristas else ""
        print(
            f"{s:>8} | {r.total_served:>7} | {r.total_abandoned:>9} | "
            f"{r.avg_wait_time:>8.2f}m | {r.utilization:>5.1%} | "
            f"${r.revenue:>8.2f} | ${r.labor_cost:>8.2f} | "
            f"${r.waiting_penalty:>8.2f} | ${r.profit:>8.2f}{marker}"
        )

    print("-" * len(header))
    print(
        f"\n  >>> Optimal staffing: {opt.optimal_baristas} barista(s) "
        f"with profit ${opt.optimal_result.profit:.2f}\n"
    )
