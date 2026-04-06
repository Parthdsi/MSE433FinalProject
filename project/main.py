#!/usr/bin/env python3
"""
Coffee Shop Staffing Optimization Tool
=======================================
Uses queueing theory (M/M/s) and discrete-event simulation to find the
profit-maximizing number of baristas given demand data, priority scheduling
(Pickup > Walk-in), and walk-in abandonment.

Run:
    python main.py
"""

from data_loader import load_data, get_average_schedule
from optimizer import optimize_staffing, print_optimization_summary
from visualization import plot_optimization


# ── Configurable parameters ──────────────────────────────────────────────────
BARISTA_WAGE_PER_HR = 15.00        # $ per barista per hour
REVENUE_PER_ORDER = 5.00           # $ earned per served customer
WAITING_PENALTY_PER_MIN = 0.10     # $ penalty per minute a customer waits
SIM_HOURS = 13                     # simulation length in hours (8 AM – 9 PM)
MIN_BARISTAS = 1
MAX_BARISTAS = 10
REPLICATIONS = 10                  # Monte-Carlo replications per staffing level
SEED = 42
# ─────────────────────────────────────────────────────────────────────────────


def main() -> None:
    print("=" * 60)
    print("  COFFEE SHOP STAFFING OPTIMIZATION")
    print("=" * 60)

    # 1. Load data
    print("\n[1/3] Loading demand data …")
    df = load_data()
    schedule = get_average_schedule(df)
    hours = sorted(schedule.keys())
    print(f"  Loaded {len(df)} rows — hours {hours[0]}:00 to {hours[-1]}:00")

    # 2. Optimize
    print(f"\n[2/3] Running optimization (baristas {MIN_BARISTAS}–{MAX_BARISTAS}, "
          f"{REPLICATIONS} replications each) …")
    opt = optimize_staffing(
        schedule,
        min_baristas=MIN_BARISTAS,
        max_baristas=MAX_BARISTAS,
        replications=REPLICATIONS,
        sim_hours=SIM_HOURS,
        revenue_per_order=REVENUE_PER_ORDER,
        barista_wage_per_hr=BARISTA_WAGE_PER_HR,
        waiting_penalty_per_min=WAITING_PENALTY_PER_MIN,
        seed=SEED,
    )
    print_optimization_summary(opt)

    # 3. Visualize
    print("[3/3] Generating plots …")
    plot_optimization(opt)

    print("Done.")


if __name__ == "__main__":
    main()
