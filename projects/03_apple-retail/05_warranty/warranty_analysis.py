"""
warranty_analysis.py
Full warranty analytics pipeline: claim rates, repair status,
time-to-claim distributions, and store hotspot maps.
Outputs chart PNGs to ../06_outputs/
"""

import os
import warnings
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import seaborn as sns
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

warnings.filterwarnings("ignore")
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", "master", ".env"))

DB_URL = os.getenv("DATABASE_URL")
engine  = create_engine(DB_URL)

OUT = os.path.join(os.path.dirname(__file__), "..", "06_outputs")
os.makedirs(OUT, exist_ok=True)

STATUS_COLORS = {
    "Completed":   "#22c55e",
    "In Progress": "#f59e0b",
    "Rejected":    "#ef4444",
}
CATEGORY_PALETTE = {
    "iPhone":      "#06b6d4",
    "Mac":         "#a855f7",
    "iPad":        "#f59e0b",
    "Apple Watch": "#22c55e",
    "AirPods":     "#ef4444",
}
sns.set_theme(style="darkgrid")
plt.rcParams.update({"figure.dpi": 150})


def load(query: str) -> pd.DataFrame:
    with engine.connect() as conn:
        conn.execute(text("SET search_path TO apple_retail"))
        return pd.read_sql(text(query), conn)


# ── 1. Repair status donut chart ──────────────────────────
def plot_repair_status():
    df = load("SELECT * FROM v_repair_status_distribution ORDER BY claim_count DESC")

    colors = [STATUS_COLORS.get(s, "#888") for s in df["repair_status"]]
    fig, ax = plt.subplots(figsize=(7, 7))
    wedges, texts, autotexts = ax.pie(
        df["claim_count"],
        labels=df["repair_status"],
        autopct="%1.1f%%",
        colors=colors,
        startangle=90,
        wedgeprops={"width": 0.55},
        textprops={"fontsize": 12},
    )
    for at in autotexts:
        at.set_fontsize(11)
        at.set_fontweight("bold")

    ax.set_title("Warranty Claims by Repair Status", fontsize=14, fontweight="bold")
    centre = plt.Circle((0, 0), 0.45, fc="white")
    ax.add_patch(centre)
    total = df["claim_count"].sum()
    ax.text(0, 0, f"{total:,}\nClaims", ha="center", va="center", fontsize=12, fontweight="bold")

    plt.tight_layout()
    plt.savefig(os.path.join(OUT, "12_repair_status_donut.png"))
    plt.close()
    print("Saved 12_repair_status_donut.png")


# ── 2. Claim rate by category (bar) ───────────────────────
def plot_claim_rate_by_category():
    df = load("SELECT * FROM v_warranty_claim_rate_by_category ORDER BY year, claim_rate_pct DESC")

    years = sorted(df["year"].unique())
    fig, axes = plt.subplots(1, len(years), figsize=(5 * len(years), 5), sharey=True)
    if len(years) == 1:
        axes = [axes]

    for ax, year in zip(axes, years):
        sub = df[df["year"] == year].sort_values("claim_rate_pct", ascending=True)
        colors = [CATEGORY_PALETTE.get(c, "#888") for c in sub["category_name"]]
        bars = ax.barh(sub["category_name"], sub["claim_rate_pct"], color=colors)
        ax.set_title(str(int(year)), fontsize=12, fontweight="bold")
        ax.set_xlabel("Claim Rate (%)")
        for bar in bars:
            ax.text(
                bar.get_width() + 0.1, bar.get_y() + bar.get_height() / 2,
                f"{bar.get_width():.1f}%", va="center", fontsize=9,
            )

    fig.suptitle("Warranty Claim Rate by Category", fontsize=14, fontweight="bold", y=1.02)
    plt.tight_layout()
    plt.savefig(os.path.join(OUT, "13_claim_rate_by_category.png"), bbox_inches="tight")
    plt.close()
    print("Saved 13_claim_rate_by_category.png")


# ── 3. Time-to-claim bar chart (avg & median) ─────────────
def plot_time_to_claim():
    df = load("SELECT * FROM apple_retail.v_time_to_claim_analysis ORDER BY category_name, repair_status")

    categories = sorted(df["category_name"].unique())
    statuses   = df["repair_status"].unique()
    x          = range(len(categories))
    width      = 0.2

    fig, ax = plt.subplots(figsize=(14, 6))
    for i, status in enumerate(statuses):
        sub    = df[df["repair_status"] == status].set_index("category_name").reindex(categories)
        color  = STATUS_COLORS.get(status, "#888")
        offset = (i - len(statuses) / 2 + 0.5) * width
        ax.bar([xi + offset for xi in x], sub["avg_days_to_claim"],
               width=width, color=color, alpha=0.85, label=status)

    ax.set_xticks(list(x))
    ax.set_xticklabels(categories, rotation=25, ha="right", fontsize=9)
    ax.set_title("Avg Days from Sale to Warranty Claim by Category & Status", fontsize=13, fontweight="bold")
    ax.set_ylabel("Avg Days to Claim")
    ax.legend(title="Repair Status", framealpha=0.7)
    plt.tight_layout()
    plt.savefig(os.path.join(OUT, "14_time_to_claim_bars.png"))
    plt.close()
    print("Saved 14_time_to_claim_bars.png")


# ── 4. Store hotspot heatmap (top 20 stores) ──────────────
def plot_store_hotspots():
    df = load("""
        SELECT store_name, country, claim_rate_pct,
               completed, in_progress, rejected
        FROM v_store_warranty_hotspots
        ORDER BY claim_rate_pct DESC
        LIMIT 20
    """)

    df["label"] = df["store_name"].str[:25] + " (" + df["country"] + ")"
    status_df = df.set_index("label")[["completed", "in_progress", "rejected"]]

    fig, axes = plt.subplots(1, 2, figsize=(16, 8), gridspec_kw={"width_ratios": [1, 2]})

    # Claim rate bar
    axes[0].barh(df["label"], df["claim_rate_pct"], color="#ef4444", alpha=0.8)
    axes[0].set_xlabel("Claim Rate (%)")
    axes[0].set_title("Claim Rate", fontsize=11, fontweight="bold")
    axes[0].invert_yaxis()
    for i, v in enumerate(df["claim_rate_pct"]):
        axes[0].text(v + 0.05, i, f"{v:.1f}%", va="center", fontsize=8)

    # Status heatmap
    sns.heatmap(
        status_df, ax=axes[1], cmap="YlOrRd",
        annot=True, fmt="d", linewidths=0.3, cbar=False,
    )
    axes[1].set_title("Claims by Status", fontsize=11, fontweight="bold")
    axes[1].set_xlabel("")
    axes[1].set_yticklabels([])

    fig.suptitle("Top 20 Warranty Hotspot Stores", fontsize=14, fontweight="bold")
    plt.tight_layout()
    plt.savefig(os.path.join(OUT, "15_store_hotspots.png"), bbox_inches="tight")
    plt.close()
    print("Saved 15_store_hotspots.png")


# ── 5. Monthly warranty trend line ────────────────────────
def plot_monthly_trend():
    df = load("SELECT * FROM v_warranty_monthly_trend ORDER BY claim_month, repair_status")
    df["claim_month"] = pd.to_datetime(df["claim_month"])

    pivot = df.pivot(index="claim_month", columns="repair_status", values="claim_count").fillna(0)
    colors = [STATUS_COLORS.get(c, "#888") for c in pivot.columns]

    fig, ax = plt.subplots(figsize=(14, 5))
    pivot.plot(ax=ax, color=colors, linewidth=2)
    ax.set_title("Monthly Warranty Claims by Repair Status", fontsize=13, fontweight="bold")
    ax.set_ylabel("Claims")
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"{int(x):,}"))
    ax.legend(title="Status", framealpha=0.7)
    plt.tight_layout()
    plt.savefig(os.path.join(OUT, "16_monthly_warranty_trend.png"))
    plt.close()
    print("Saved 16_monthly_warranty_trend.png")


if __name__ == "__main__":
    print("Running warranty analytics pipeline...")
    plot_repair_status()
    plot_claim_rate_by_category()
    plot_time_to_claim()
    plot_store_hotspots()
    plot_monthly_trend()
    print("\nWarranty analysis complete. Charts saved to 06_outputs/")
