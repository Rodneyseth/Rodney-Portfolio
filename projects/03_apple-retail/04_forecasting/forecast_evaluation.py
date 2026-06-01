"""
forecast_evaluation.py
Evaluates Prophet forecast accuracy using walk-forward validation.
Computes MAE, RMSE, MAPE per category and saves a summary CSV + bar chart.
"""

import os
import warnings
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from prophet import Prophet
from sklearn.metrics import mean_absolute_error, mean_squared_error
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

HOLDOUT_MONTHS = 6   # last 6 months held out for evaluation


def load_revenue() -> pd.DataFrame:
    with engine.connect() as conn:
        conn.execute(text("SET search_path TO apple_retail"))
        df = pd.read_sql(
            text("SELECT category_name, month, revenue FROM v_category_monthly_revenue ORDER BY category_name, month"),
            conn,
        )
    df["month"] = pd.to_datetime(df["month"])
    return df


def mape(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    mask = y_true != 0
    return float(np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100)


def evaluate_category(series: pd.DataFrame) -> dict:
    ts = series[["month", "revenue"]].rename(columns={"month": "ds", "revenue": "y"})
    cutoff = ts["ds"].max() - pd.DateOffset(months=HOLDOUT_MONTHS)
    train  = ts[ts["ds"] <= cutoff]
    test   = ts[ts["ds"] >  cutoff]

    if len(train) < 18 or test.empty:
        return None

    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=False,
        daily_seasonality=False,
        seasonality_mode="multiplicative",
        changepoint_prior_scale=0.15,
        interval_width=0.90,
    )
    model.fit(train)
    future   = model.make_future_dataframe(periods=HOLDOUT_MONTHS, freq="MS")
    forecast = model.predict(future)
    preds    = forecast[forecast["ds"].isin(test["ds"])]["yhat"].values
    actuals  = test["y"].values

    return {
        "MAE":  round(mean_absolute_error(actuals, preds), 0),
        "RMSE": round(np.sqrt(mean_squared_error(actuals, preds)), 0),
        "MAPE": round(mape(actuals, preds), 2),
        "n_test": len(actuals),
    }


def plot_metrics(summary: pd.DataFrame):
    fig, axes = plt.subplots(1, 3, figsize=(14, 5))

    for ax, metric in zip(axes, ["MAE", "RMSE", "MAPE"]):
        bars = ax.bar(summary["category_name"], summary[metric], color="#06b6d4", alpha=0.85)
        ax.set_title(metric, fontsize=12, fontweight="bold")
        ax.set_xticklabels(summary["category_name"], rotation=25, ha="right", fontsize=9)
        for bar in bars:
            ax.text(
                bar.get_x() + bar.get_width() / 2,
                bar.get_height() * 1.01,
                f"{bar.get_height():,.1f}",
                ha="center", va="bottom", fontsize=8,
            )

    fig.suptitle(f"Forecast Accuracy — {HOLDOUT_MONTHS}-Month Holdout", fontsize=13, fontweight="bold")
    plt.tight_layout()
    plt.savefig(os.path.join(OUT, "11_forecast_accuracy.png"))
    plt.close()
    print("Saved 11_forecast_accuracy.png")


if __name__ == "__main__":
    print("Running forecast evaluation...")
    df = load_revenue()
    rows = []

    for cat in df["category_name"].unique():
        metrics = evaluate_category(df[df["category_name"] == cat].copy())
        if metrics:
            rows.append({"category_name": cat, **metrics})
            print(f"  {cat}: MAE={metrics['MAE']:,.0f}  RMSE={metrics['RMSE']:,.0f}  MAPE={metrics['MAPE']:.1f}%")

    summary = pd.DataFrame(rows)
    summary.to_csv(os.path.join(CSV_OUT, "forecast_accuracy_summary.csv"), index=False)
    plot_metrics(summary)
    print("\nEvaluation complete.")
