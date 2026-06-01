"""
product_lifecycle.py
Launch-indexed sales curves — aligns each product to Day 0 at launch
so you can compare adoption ramp across generations and categories.
Outputs chart PNGs to ../06_outputs/
"""

import os
import warnings
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

warnings.filterwarnings("ignore")
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", "master", ".env"))

DB_URL = os.getenv("DATABASE_URL")
engine  = create_engine(DB_URL)

OUT = os.path.join(os.path.dirname(__file__), "..", "06_outputs")
os.makedirs(OUT, exist_ok=True)

PALETTE = {
    "iPhone":      "#06b6d4",
    "Mac":         "#a855f7",
    "iPad":        "#f59e0b",
    "Apple Watch": "#22c55e",
    "AirPods":     "#ef4444",
}


def load(query: str) -> pd.DataFrame:
    with engine.connect() as conn:
        conn.execute(text("SET search_path TO apple_retail"))
        return pd.read_sql(text(query), conn)


def build_launch_curves() -> pd.DataFrame:
    """Monthly units sold indexed to months-since-launch for every product."""
    df = load("""
        SELECT
            p.product_id,
            p.product_name,
            c.category_name,
            p.launch_date,
            DATE_TRUNC('month', s.sale_date) AS month,
            SUM(s.quantity)                  AS units_sold
        FROM sales s
        JOIN products p  ON s.product_id  = p.product_id
        JOIN category c  ON p.category_id = c.category_id
        GROUP BY p.product_id, p.product_name, c.category_name, p.launch_date,
                 DATE_TRUNC('month', s.sale_date)
        ORDER BY p.product_id, month
    """)
    df["month"]       = pd.to_datetime(df["month"])
    df["launch_date"] = pd.to_datetime(df["launch_date"])
    df["months_since_launch"] = (
        (df["month"].dt.year  - df["launch_date"].dt.year) * 12
        + (df["month"].dt.month - df["launch_date"].dt.month)
    )
    return df[df["months_since_launch"] >= 0]


# ── Plot 1: Launch curves by category ─────────────────────
def plot_launch_curves_by_category(df: pd.DataFrame):
    categories = df["category_name"].unique()
    fig, axes = plt.subplots(
        len(categories), 1,
        figsize=(14, 4 * len(categories)),
        sharex=False,
    )
    if len(categories) == 1:
        axes = [axes]

    for ax, cat in zip(axes, sorted(categories)):
        subset  = df[df["category_name"] == cat]
        color   = PALETTE.get(cat, "#888")
        products = subset["product_name"].unique()

        for prod in products:
            s = subset[subset["product_name"] == prod].sort_values("months_since_launch")
            ax.plot(
                s["months_since_launch"], s["units_sold"],
                color=color, alpha=0.6, linewidth=1.2,
                label=prod if len(prod) < 30 else prod[:28] + "…",
            )

        ax.set_title(f"{cat} — Launch Curves", fontsize=12, fontweight="bold")
        ax.set_xlabel("Months Since Launch")
        ax.set_ylabel("Units Sold")
        ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"{int(x):,}"))
        ax.legend(fontsize=7, ncol=2, framealpha=0.5)

    plt.suptitle("Product Lifecycle — Monthly Units Since Launch", fontsize=14, fontweight="bold", y=1.01)
    plt.tight_layout()
    plt.savefig(os.path.join(OUT, "06_launch_curves_by_category.png"), bbox_inches="tight")
    plt.close()
    print("Saved 06_launch_curves_by_category.png")


# ── Plot 2: Average launch curve comparison across categories ──
def plot_avg_launch_curve(df: pd.DataFrame):
    max_months = 24
    fig, ax = plt.subplots(figsize=(14, 6))

    for cat, color in PALETTE.items():
        subset = df[(df["category_name"] == cat) & (df["months_since_launch"] <= max_months)]
        if subset.empty:
            continue
        avg = subset.groupby("months_since_launch")["units_sold"].mean()
        ax.plot(avg.index, avg.values, color=color, linewidth=2.2, label=cat, marker="o", markersize=3)

    ax.set_title("Average Launch Ramp — First 24 Months by Category", fontsize=13, fontweight="bold")
    ax.set_xlabel("Months Since Launch")
    ax.set_ylabel("Avg Units Sold / Product")
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"{int(x):,}"))
    ax.legend(framealpha=0.7)
    plt.tight_layout()
    plt.savefig(os.path.join(OUT, "07_avg_launch_ramp.png"))
    plt.close()
    print("Saved 07_avg_launch_ramp.png")


# ── Plot 3: Peak sales month distribution ─────────────────
def plot_peak_timing(df: pd.DataFrame):
    peak = (
        df.groupby(["product_id", "product_name", "category_name"])
        .apply(lambda g: g.loc[g["units_sold"].idxmax(), "months_since_launch"])
        .reset_index(name="peak_month")
    )

    fig, ax = plt.subplots(figsize=(12, 5))
    for cat, color in PALETTE.items():
        vals = peak[peak["category_name"] == cat]["peak_month"]
        if not vals.empty:
            ax.hist(vals, bins=range(0, 37), alpha=0.65, color=color, label=cat, edgecolor="none")

    ax.set_title("Peak Sales Month Distribution (Months Since Launch)", fontsize=13, fontweight="bold")
    ax.set_xlabel("Months Since Launch at Peak")
    ax.set_ylabel("Number of Products")
    ax.legend(framealpha=0.7)
    plt.tight_layout()
    plt.savefig(os.path.join(OUT, "08_peak_timing.png"))
    plt.close()
    print("Saved 08_peak_timing.png")


if __name__ == "__main__":
    print("Running product lifecycle analysis...")
    df = build_launch_curves()
    plot_launch_curves_by_category(df)
    plot_avg_launch_curve(df)
    plot_peak_timing(df)
    print("Product lifecycle analysis complete.")
