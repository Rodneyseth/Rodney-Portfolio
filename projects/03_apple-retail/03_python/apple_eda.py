"""
apple_eda.py
Exploratory data analysis + seasonal decomposition for Apple Retail Sales.
Connects to Supabase via SQLAlchemy, pulls analytical views, and outputs
chart PNGs to ../06_outputs/
"""

import os
import warnings
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import seaborn as sns
from sqlalchemy import create_engine, text
from statsmodels.tsa.seasonal import seasonal_decompose
from dotenv import load_dotenv

warnings.filterwarnings("ignore")
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", "master", ".env"))

# ── Connection ────────────────────────────────────────────
DB_URL = os.getenv("DATABASE_URL")
engine = create_engine(DB_URL)

OUT = os.path.join(os.path.dirname(__file__), "..", "06_outputs")
os.makedirs(OUT, exist_ok=True)

PALETTE = {
    "iPhone":      "#06b6d4",
    "Mac":         "#a855f7",
    "iPad":        "#f59e0b",
    "Apple Watch": "#22c55e",
    "AirPods":     "#ef4444",
}
sns.set_theme(style="darkgrid", palette="muted")
plt.rcParams.update({"figure.dpi": 150, "font.family": "sans-serif"})


def load(query: str) -> pd.DataFrame:
    with engine.connect() as conn:
        conn.execute(text("SET search_path TO apple_retail"))
        return pd.read_sql(text(query), conn)


# ── 1. Revenue overview ───────────────────────────────────
def plot_revenue_overview():
    df = load("SELECT * FROM v_category_monthly_revenue ORDER BY month")
    df["month"] = pd.to_datetime(df["month"])

    fig, axes = plt.subplots(2, 1, figsize=(14, 10))

    # Stacked area
    pivot = df.pivot(index="month", columns="category_name", values="revenue").fillna(0)
    pivot.plot.area(ax=axes[0], color=[PALETTE.get(c, "#888") for c in pivot.columns], alpha=0.85)
    axes[0].set_title("Monthly Revenue by Category — Stacked Area", fontsize=13, fontweight="bold")
    axes[0].yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"${x/1e6:.1f}M"))
    axes[0].set_xlabel("")

    # YoY growth heatmap
    yoy = df.pivot(index="month", columns="category_name", values="yoy_revenue_growth_pct")
    sns.heatmap(
        yoy.T, ax=axes[1], cmap="RdYlGn", center=0,
        linewidths=0.4, annot=False,
        xticklabels=[d.strftime("%b %y") if d.month in (1, 7) else "" for d in yoy.index],
    )
    axes[1].set_title("YoY Revenue Growth (%) — Heatmap", fontsize=13, fontweight="bold")
    axes[1].set_xlabel("")

    plt.tight_layout()
    plt.savefig(os.path.join(OUT, "01_revenue_overview.png"))
    plt.close()
    print("Saved 01_revenue_overview.png")


# ── 2. Category market share ──────────────────────────────
def plot_market_share():
    df = load("SELECT * FROM v_category_market_mix ORDER BY month")
    df["month"] = pd.to_datetime(df["month"])

    pivot = df.pivot(index="month", columns="category_name", values="revenue_share_pct").fillna(0)

    fig, ax = plt.subplots(figsize=(14, 5))
    bottom = np.zeros(len(pivot))
    for cat in pivot.columns:
        ax.bar(pivot.index, pivot[cat], bottom=bottom,
               color=PALETTE.get(cat, "#888"), label=cat, width=20)
        bottom += pivot[cat].values

    ax.set_title("Revenue Market Share by Category (% Monthly)", fontsize=13, fontweight="bold")
    ax.set_ylabel("Share (%)")
    ax.yaxis.set_major_formatter(mticker.PercentFormatter())
    ax.legend(loc="upper right", framealpha=0.7)
    plt.tight_layout()
    plt.savefig(os.path.join(OUT, "02_market_share.png"))
    plt.close()
    print("Saved 02_market_share.png")


# ── 3. Seasonal decomposition per category ────────────────
def plot_seasonal_decomposition():
    df = load("""
        SELECT category_name, month, revenue
        FROM v_category_monthly_revenue
        ORDER BY category_name, month
    """)
    df["month"] = pd.to_datetime(df["month"])
    categories = df["category_name"].unique()

    for cat in categories:
        series = (
            df[df["category_name"] == cat]
            .set_index("month")["revenue"]
            .asfreq("MS")
            .ffill()
        )
        if len(series) < 24:
            continue

        result = seasonal_decompose(series, model="multiplicative", period=12)
        fig, axes = plt.subplots(4, 1, figsize=(14, 10))
        color = PALETTE.get(cat, "#06b6d4")

        for ax, component, label in zip(
            axes,
            [series, result.trend, result.seasonal, result.resid],
            ["Observed", "Trend", "Seasonal", "Residual"],
        ):
            ax.plot(component, color=color, linewidth=1.5)
            ax.set_ylabel(label, fontsize=10)
            ax.set_xlabel("")
            if label == "Observed":
                ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"${x/1e6:.1f}M"))

        axes[0].set_title(f"Seasonal Decomposition — {cat}", fontsize=13, fontweight="bold")
        plt.tight_layout()
        fname = f"03_decomp_{cat.lower().replace(' ', '_')}.png"
        plt.savefig(os.path.join(OUT, fname))
        plt.close()
        print(f"Saved {fname}")


# ── 4. Annual category summary bars ───────────────────────
def plot_annual_summary():
    df = load("SELECT * FROM v_category_annual_summary ORDER BY year, revenue DESC")

    years = sorted(df["year"].unique())
    fig, axes = plt.subplots(1, len(years), figsize=(5 * len(years), 6), sharey=False)
    if len(years) == 1:
        axes = [axes]

    for ax, year in zip(axes, years):
        subset = df[df["year"] == year].sort_values("revenue", ascending=True)
        colors = [PALETTE.get(c, "#888") for c in subset["category_name"]]
        ax.barh(subset["category_name"], subset["revenue"] / 1e6, color=colors)
        ax.set_title(str(int(year)), fontsize=12, fontweight="bold")
        ax.set_xlabel("Revenue ($M)")
        ax.xaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"${x:.0f}M"))

    fig.suptitle("Annual Revenue by Category", fontsize=14, fontweight="bold", y=1.02)
    plt.tight_layout()
    plt.savefig(os.path.join(OUT, "04_annual_summary.png"))
    plt.close()
    print("Saved 04_annual_summary.png")


# ── 5. Top products ───────────────────────────────────────
def plot_top_products():
    df = load("""
        SELECT category_name, product_name, total_revenue
        FROM v_top_products_by_category
        WHERE revenue_rank <= 5
        ORDER BY category_name, revenue_rank
    """)

    categories = df["category_name"].unique()
    fig, axes = plt.subplots(1, len(categories), figsize=(4 * len(categories), 6), sharey=False)
    if len(categories) == 1:
        axes = [axes]

    for ax, cat in zip(axes, categories):
        subset = df[df["category_name"] == cat].sort_values("total_revenue", ascending=True)
        color = PALETTE.get(cat, "#888")
        ax.barh(subset["product_name"], subset["total_revenue"] / 1e6, color=color)
        ax.set_title(cat, fontsize=11, fontweight="bold")
        ax.set_xlabel("Revenue ($M)")
        for label in ax.get_yticklabels():
            label.set_fontsize(8)

    fig.suptitle("Top 5 Products by Category — Total Revenue", fontsize=14, fontweight="bold", y=1.02)
    plt.tight_layout()
    plt.savefig(os.path.join(OUT, "05_top_products.png"))
    plt.close()
    print("Saved 05_top_products.png")


# ── Main ──────────────────────────────────────────────────
if __name__ == "__main__":
    print("Running Apple Retail EDA pipeline...")
    plot_revenue_overview()
    plot_market_share()
    plot_seasonal_decomposition()
    plot_annual_summary()
    plot_top_products()
    print("EDA pipeline complete. Charts saved to 06_outputs/")
