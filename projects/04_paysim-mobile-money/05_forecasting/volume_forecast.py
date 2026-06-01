"""
volume_forecast.py
Prophet 7-day daily transaction volume forecast per transaction type.
Uses v_daily_by_type from Supabase as training data.
Outputs chart PNGs and forecast CSVs to ../06_outputs/
"""

import os
import warnings
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
from prophet import Prophet
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

warnings.filterwarnings('ignore')
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', 'master', '.env'))

engine  = create_engine(os.getenv('DATABASE_URL'))
OUT     = os.path.join(os.path.dirname(__file__), '..', '06_outputs')
CSV_OUT = os.path.join(OUT, 'csv')
os.makedirs(OUT, exist_ok=True)
os.makedirs(CSV_OUT, exist_ok=True)

# Simulation starts 2023-01-01
SIM_START    = pd.Timestamp('2023-01-01')
FORECAST_DAYS = 7

TYPE_COLORS = {
    'CASH_OUT': '#ef4444', 'PAYMENT': '#06b6d4',
    'CASH_IN':  '#22c55e', 'TRANSFER': '#a855f7', 'DEBIT': '#f59e0b',
}


def load_daily():
    with engine.connect() as conn:
        conn.execute(text('SET search_path TO paysim'))
        df = pd.read_sql(
            text('SELECT tx_day, tx_type, tx_count, total_value FROM v_daily_by_type ORDER BY tx_day, tx_type'),
            conn,
        )
    df['ds'] = SIM_START + pd.to_timedelta(df['tx_day'] - 1, unit='D')
    return df


def fit_forecast(series: pd.DataFrame, col: str = 'tx_count') -> pd.DataFrame:
    ts = series[['ds', col]].rename(columns={col: 'y'})
    model = Prophet(
        yearly_seasonality=False,
        weekly_seasonality=True,
        daily_seasonality=False,
        changepoint_prior_scale=0.15,
        interval_width=0.90,
    )
    model.fit(ts)
    future   = model.make_future_dataframe(periods=FORECAST_DAYS, freq='D')
    forecast = model.predict(future)
    merged   = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].merge(ts, on='ds', how='left')
    return merged


def plot_single_forecast(merged: pd.DataFrame, tx_type: str, col_label: str):
    color = TYPE_COLORS.get(tx_type, '#888')
    hist  = merged[merged['y'].notna()]
    fcast = merged[merged['y'].isna()]

    fig, ax = plt.subplots(figsize=(13, 4))
    ax.plot(hist['ds'], hist['y'],      color=color, linewidth=2,   label='Actual')
    ax.plot(fcast['ds'], fcast['yhat'], color=color, linewidth=2,   linestyle='--', label='Forecast')
    ax.fill_between(fcast['ds'], fcast['yhat_lower'], fcast['yhat_upper'],
                    color=color, alpha=0.20, label='90% CI')
    bridge = pd.concat([hist.tail(1), fcast.head(1)])
    ax.plot(bridge['ds'], bridge['yhat'], color=color, linewidth=1.5, linestyle='--', alpha=0.5)
    ax.axvline(hist['ds'].max(), color='#888', linewidth=1, linestyle=':', alpha=0.7)

    fmt = mticker.FuncFormatter(lambda x, _: f'{int(x):,}')
    ax.yaxis.set_major_formatter(fmt)
    ax.set_title(f'{tx_type}  --  {FORECAST_DAYS}-Day {col_label} Forecast (Prophet)',
                 fontsize=12, fontweight='bold')
    ax.set_xlabel('')
    ax.legend(framealpha=0.7)
    plt.tight_layout()

    slug = tx_type.lower().replace('_', '')
    fname = f'13_forecast_{slug}.png'
    plt.savefig(os.path.join(OUT, fname))
    plt.close()
    print(f'  Saved {fname}')
    return fname


def plot_all_forecasts(forecasts: dict):
    fig, ax = plt.subplots(figsize=(14, 6))
    for tx_type, merged in forecasts.items():
        color = TYPE_COLORS.get(tx_type, '#888')
        hist  = merged[merged['y'].notna()]
        fcast = merged[merged['y'].isna()]
        ax.plot(hist['ds'],  hist['y'],      color=color, linewidth=1.8, label=tx_type)
        ax.plot(fcast['ds'], fcast['yhat'],  color=color, linewidth=1.8, linestyle='--')
        ax.fill_between(fcast['ds'], fcast['yhat_lower'], fcast['yhat_upper'],
                        color=color, alpha=0.12)

    last_actual = max(m[m['y'].notna()]['ds'].max() for m in forecasts.values())
    ax.axvline(last_actual, color='#888', linewidth=1, linestyle=':', label='Forecast start')
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f'{int(x):,}'))
    ax.set_title(f'{FORECAST_DAYS}-Day Transaction Volume Forecast  --  All Types',
                 fontsize=13, fontweight='bold')
    ax.legend(framealpha=0.7)
    plt.tight_layout()
    plt.savefig(os.path.join(OUT, '14_forecast_all_types.png'))
    plt.close()
    print('  Saved 14_forecast_all_types.png')


if __name__ == '__main__':
    print('Running volume forecast pipeline...')
    df = load_daily()
    forecasts = {}

    for tx_type in df['tx_type'].unique():
        print(f'  Fitting {tx_type}...')
        series  = df[df['tx_type'] == tx_type].copy()
        merged  = fit_forecast(series, col='tx_count')
        plot_single_forecast(merged, tx_type, 'Transaction Volume')
        forecasts[tx_type] = merged
        merged.to_csv(
            os.path.join(CSV_OUT, f'forecast_{tx_type.lower()}.csv'), index=False
        )

    plot_all_forecasts(forecasts)
    print('\nForecast pipeline complete. Charts and CSVs saved to 06_outputs/')
