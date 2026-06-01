"""
revenue_forecast.py
Prophet 12-month revenue forecast per product category.
Uses v_category_monthly_revenue from Supabase as training data.
Outputs forecast CSVs and chart PNGs to ../06_outputs/
"""

import os
import warnings
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
from prophet import Prophet
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

warnings.filterwarnings("ignore")
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", "master", ".env"))

DB_URL = os.getenv("DATABASE_URL")
engine  = create_engine(DB_URL)

OUT     = os.path.join(os.path.dirname(__file__), "..", "06_outputs")
CSV_OUT = os.path.join(OUT, "csv")
os.makedirs(OUT,     exist_ok=True)
os.makedirs(CSV_OUT, exist_ok=True)

PALETTE = {
    "iPhone":      "#06b6d4",
    "Mac":         "#a855f7",
    "iPad":        "#f59e0b",
    "Apple Watch": "#22c55e",
    "AirPods":     "#ef4444",
}

FORECAST_MONTHS = 12


def load_revenue() -> pd.DataFrame:
    with engine.connect() as conn:
        conn.execute(text("SET search_path TO apple_retail"))
        df = pd.read_sql(
            text("SELECT category_name, month, revenue FROM v_category_monthly_revenue ORDER BY category_name, month"),
            conn,
        )
    df["month"] = pd.to_datetime(df["month"]).dt.tz_localize(None)
    return df


def fit_and_forecast(series: pd.DataFrame, category: str) -> pd.DataFrame:
    """Fit Prophet and return combined history + forecast DataFrame."""
    ts = series[["month", "revenue"]].rename(columns={"month": "ds", "revenue": "y"})

    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=False,
        daily_seasonality=False,
        seasonality_mode="multiplicative",
        changepoint_prior_scale=0.15,
        seasonality_prior_scale=10.0,
        interval_width=0.90,
    )
    # Apple product launch seasonality: stronger Q4 (Sep-Nov launches + holiday)
    model.add_seasonality(name="launch_cycle", period=365.25, fourier_order=5)
    model.fit(ts)

    future   = model.make_future_dataframe(periods=FORECAST_MONTHS, freq="MS")
    forecast = model.predict(future)

    # Merge actuals
    merged = forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]].copy()
    merged = merged.merge(ts, on="ds", how="left")
    merged["category"] = category
    return merged, model


def plot_forecast(merged: pd.DataFrame, category: str):
    color = PALETTE.get(category, "#888")
    hist  = merged[merged["y"].notna()]
    fcast = merged[merged["y"].isna()]

    fig, ax = plt.subplots(figsize=(14, 5))

    # Historical actuals
    ax.plot(hist["ds"], hist["y"], color=color, linewidth=2, label="Actual")

    # Forecast line + CI band
    ax.plot(fcast["ds"], fcast["yhat"], color=color, linewidth=2, linestyle="--", label="Forecast")
    ax.fill_between(
        fcast["ds"], fcast["yhat_lower"], fcast["yhat_upper"],
        color=color, alpha=0.18, label="90% CI",
    )

    # Bridge: last actual → first forecast
    bridge = pd.concat([hist.tail(1), fcast.head(1)])
    ax.plot(bridge["ds"], bridge["yhat"], color=color, linewidth=1.5, linestyle="--", alpha=0.5)

    ax.axvline(hist["ds"].max(), color="#666", linewidth=1, linestyle=":", alpha=0.6)
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"${x/1e6:.1f}M"))
    ax.set_title(f"{category} — 12-Month Revenue Forecast (Prophet)", fontsize=13, fontweight="bold")
    ax.set_xlabel("")
    ax.legend(framealpha=0.7)
    plt.tight_layout()

    fname = f"09_forecast_{category.lower().replace(' ', '_')}.png"
    plt.savefig(os.path.join(OUT, fname))
    plt.close()
    print(f"  Saved {fname}")


def plot_all_forecasts(all_forecasts: dict):
    """Single chart overlaying all category forecasts."""
    fig, ax = plt.subplots(figsize=(14, 6))

    for cat, merged in all_forecasts.items():
        color = PALETTE.get(cat, "#888")
        hist  = merged[merged["y"].notna()]
        fcast = merged[merged["y"].isna()]
        ax.plot(hist["ds"],  hist["y"],     color=color, linewidth=1.8,  label=cat)
        ax.plot(fcast["ds"], fcast["yhat"], color=color, linewidth=1.8,  linestyle="--")
        ax.fill_between(fcast["ds"], fcast["yhat_lower"], fcast["yhat_upper"],
                        color=color, alpha=0.10)

    ax.axvline(
        max(m[m["y"].notna()]["ds"].max() for m in all_forecasts.values()),
        color="#666", linewidth=1, linestyle=":", alpha=0.6, label="Forecast start",
    )
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"${x/1e6:.1f}M"))
    ax.set_title("12-Month Revenue Forecast — All Categories", fontsize=13, fontweight="bold")
    ax.legend(framealpha=0.7)
    plt.tight_layout()
    plt.savefig(os.path.join(OUT, "10_forecast_all_categories.png"))
    plt.close()
    print("  Saved 10_forecast_all_categories.png")


if __name__ == "__main__":
    print("Running Prophet revenue forecast pipeline...")
    df = load_revenue()
    all_forecasts = {}

    for cat in df["category_name"].unique():
        print(f"  Fitting {cat}...")
        series = df[df["category_name"] == cat].copy()
        merged, _ = fit_and_forecast(series, cat)
        plot_forecast(merged, cat)
        all_forecasts[cat] = merged
        merged.to_csv(os.path.join(CSV_OUT, f"forecast_{cat.lower().replace(' ', '_')}.csv"), index=False)

    plot_all_forecasts(all_forecasts)
    print("\nForecast pipeline complete.")
