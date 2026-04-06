"""
Generates matplotlib plots for the staffing optimization tradeoff analysis.
"""

import os
import matplotlib.pyplot as plt
from optimizer import OptimizationResult


def plot_optimization(opt: OptimizationResult, output_dir: str = "plots") -> None:
    """
    Create and save three subplots:
      1. Total cost & profit vs. number of baristas
      2. Average wait time vs. number of baristas
      3. Abandonment rate vs. number of baristas
    """
    os.makedirs(output_dir, exist_ok=True)

    levels = opt.staffing_levels
    profits = [r.profit for r in opt.results]
    total_costs = [r.total_cost for r in opt.results]
    labor_costs = [r.labor_cost for r in opt.results]
    wait_penalties = [r.waiting_penalty for r in opt.results]
    wait_times = [r.avg_wait_time for r in opt.results]
    abandon_rates = [r.abandonment_rate * 100 for r in opt.results]
    utilizations = [r.utilization * 100 for r in opt.results]

    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle("Coffee Shop Staffing Optimization", fontsize=16, fontweight="bold")

    # --- Plot 1: Cost & Profit ---
    ax = axes[0, 0]
    ax.plot(levels, profits, "g-o", label="Profit", linewidth=2)
    ax.plot(levels, total_costs, "r-s", label="Total Cost", linewidth=2)
    ax.plot(levels, labor_costs, "b--^", label="Labor Cost", linewidth=1, alpha=0.7)
    ax.plot(levels, wait_penalties, "m--v", label="Waiting Penalty", linewidth=1, alpha=0.7)
    ax.axvline(opt.optimal_baristas, color="green", linestyle=":", alpha=0.5, label=f"Optimal = {opt.optimal_baristas}")
    ax.set_xlabel("Number of Baristas")
    ax.set_ylabel("Dollars ($)")
    ax.set_title("Cost & Profit vs. Staffing Level")
    ax.legend(fontsize=8)
    ax.grid(True, alpha=0.3)
    ax.set_xticks(levels)

    # --- Plot 2: Wait Time ---
    ax = axes[0, 1]
    ax.plot(levels, wait_times, "b-o", linewidth=2)
    ax.axvline(opt.optimal_baristas, color="green", linestyle=":", alpha=0.5, label=f"Optimal = {opt.optimal_baristas}")
    ax.set_xlabel("Number of Baristas")
    ax.set_ylabel("Average Wait Time (min)")
    ax.set_title("Average Wait Time vs. Staffing Level")
    ax.legend(fontsize=8)
    ax.grid(True, alpha=0.3)
    ax.set_xticks(levels)

    # --- Plot 3: Abandonment Rate ---
    ax = axes[1, 0]
    ax.plot(levels, abandon_rates, "r-o", linewidth=2)
    ax.axvline(opt.optimal_baristas, color="green", linestyle=":", alpha=0.5, label=f"Optimal = {opt.optimal_baristas}")
    ax.set_xlabel("Number of Baristas")
    ax.set_ylabel("Abandonment Rate (%)")
    ax.set_title("Abandonment Rate vs. Staffing Level")
    ax.legend(fontsize=8)
    ax.grid(True, alpha=0.3)
    ax.set_xticks(levels)

    # --- Plot 4: Utilization ---
    ax = axes[1, 1]
    ax.plot(levels, utilizations, "darkorange", marker="o", linewidth=2)
    ax.axvline(opt.optimal_baristas, color="green", linestyle=":", alpha=0.5, label=f"Optimal = {opt.optimal_baristas}")
    ax.set_xlabel("Number of Baristas")
    ax.set_ylabel("Barista Utilization (%)")
    ax.set_title("Utilization vs. Staffing Level")
    ax.legend(fontsize=8)
    ax.grid(True, alpha=0.3)
    ax.set_xticks(levels)

    plt.tight_layout(rect=[0, 0, 1, 0.95])

    path = os.path.join(output_dir, "staffing_optimization.png")
    fig.savefig(path, dpi=150)
    plt.close(fig)
    print(f"  Plot saved to {path}")
