"""
Loads and preprocesses the coffee shop demand dataset.
"""

import os
import pandas as pd


DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def load_data(csv_path: str | None = None) -> pd.DataFrame:
    """Load the coffee shop dataset and validate its schema."""
    if csv_path is None:
        csv_path = os.path.join(os.path.dirname(__file__), "..", "coffee_shop_dataset.csv")

    df = pd.read_csv(csv_path)

    required = {
        "Day", "Hour", "Customer_Type",
        "Arrival_Rate_per_hr", "Avg_Service_Time_min", "Abandonment_Probability",
    }
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Missing columns in dataset: {missing}")

    df["Day"] = pd.Categorical(df["Day"], categories=DAY_ORDER, ordered=True)
    df = df.sort_values(["Day", "Hour", "Customer_Type"]).reset_index(drop=True)
    return df


def get_hourly_params(df: pd.DataFrame, day: str, hour: int) -> list[dict]:
    """Return a list of dicts (one per customer type) for a given day/hour."""
    subset = df[(df["Day"] == day) & (df["Hour"] == hour)]
    records = []
    for _, row in subset.iterrows():
        records.append({
            "customer_type": row["Customer_Type"],
            "arrival_rate": row["Arrival_Rate_per_hr"],
            "service_time": row["Avg_Service_Time_min"],
            "abandon_prob": row["Abandonment_Probability"],
        })
    return records


def get_day_schedule(df: pd.DataFrame, day: str) -> dict[int, list[dict]]:
    """Return {hour: [param_dicts]} for every hour on a given day."""
    day_df = df[df["Day"] == day]
    hours = sorted(day_df["Hour"].unique())
    return {h: get_hourly_params(df, day, h) for h in hours}


def get_average_schedule(df: pd.DataFrame) -> dict[int, list[dict]]:
    """Average the demand parameters across all days for each hour/customer type."""
    grouped = (
        df.groupby(["Hour", "Customer_Type"])
        .agg({
            "Arrival_Rate_per_hr": "mean",
            "Avg_Service_Time_min": "mean",
            "Abandonment_Probability": "mean",
        })
        .reset_index()
    )

    schedule: dict[int, list[dict]] = {}
    for hour in sorted(grouped["Hour"].unique()):
        subset = grouped[grouped["Hour"] == hour]
        records = []
        for _, row in subset.iterrows():
            records.append({
                "customer_type": row["Customer_Type"],
                "arrival_rate": row["Arrival_Rate_per_hr"],
                "service_time": row["Avg_Service_Time_min"],
                "abandon_prob": row["Abandonment_Probability"],
            })
        schedule[hour] = records
    return schedule
