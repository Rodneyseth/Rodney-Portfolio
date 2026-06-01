"""
business_performance.py
Business performance analytics: merchants, customer tiers, liquidity, weekly KPIs.
Charts saved to ../06_outputs/
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

warnings.filterwarnings('ignore')
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', 'master', '.env'))

engine = create_engine(os.getenv('DATABASE_URL'))
OUT    = os.path.join(os.path.dirname(__file__), '..', '06_outputs')
CSV    = os.path.join(os.path.dirname(__file__), '..', '01_data',
                      'PS_20174392719_1491204439457_log.csv')
os.makedirs(OUT, exist_ok=True)

sns.set_theme(style='darkgrid')
plt.rcParams.update({'figure.dpi': 150})

TYPE_COLORS = {
    'CASH_OUT': '#ef4444', 'PAYMENT': '#06b6d4',
    'CASH_IN':  '#22c55e', 'TRANSFER': '#a855f7', 'DEBIT': '#f59e0b',
}
TIER_COLORS = {'Whale': '#ef4444', 'High': '#f59e0b', 'Mid': '#06b6d4', 'Low': '#94a3b8'}


def q(sql):
    with engine.connect() as conn:
        conn.execute(text('SET search_path TO paysim'))
        return pd.read_sql(text(sql), conn)


# ── 7. Top 20 merchants by total inflow ──────────────────────────────────────
def plot_top_merchants():
    df = q('SELECT * FROM v_top_merchants ORDER BY total_inflow DESC LIMIT 20')
    df['label'] = df['merchant_id'].str[:12]

    fig, axes = plt.subplots(1, 2, figsize=(16, 8), gridspec_kw={'width_ratios': [2, 1]})

    # Inflow bars
    bars = axes[0].barh(df['label'][::-1], df['total_inflow'][::-1] / 1e6,
                        color='#06b6d4', alpha=0.85)
    axes[0].set_xlabel('Total Inflow (USD Millions)')
    axes[0].set_title('Top 20 Merchants by Total Inflow', fontsize=11, fontweight='bold')
    for bar in bars:
        w = bar.get_width()
        axes[0].text(w + 0.3, bar.get_y() + bar.get_height() / 2,
                     f'${w:.1f}M', va='center', fontsize=8)

    # Tx count bars
    axes[1].barh(df['label'][::-1], df['tx_count'][::-1],
                 color='#a855f7', alpha=0.85)
    axes[1].set_xlabel('Transaction Count')
    axes[1].set_title('Transaction Volume', fontsize=11, fontweight='bold')
    axes[1].set_yticklabels([])

    fig.suptitle('Merchant Performance  --  Top 20 by Inflow Value', fontsize=13, fontweight='bold')
    plt.tight_layout()
    plt.savefig(os.path.join(OUT, '07_top_merchants.png'), bbox_inches='tight')
    plt.close()
    print('Saved 07_top_merchants.png')


# ── 8. Customer tier distribution (read from local CSV — avoids DB timeout) ──
def plot_customer_tiers():
    print('  Loading customer data from CSV...')
    raw = pd.read_csv(CSV, usecols=['nameOrig', 'amount'])
    raw = raw[raw['nameOrig'].str[0] == 'C']
    cust = raw.groupby('nameOrig')['amount'].agg(['count', 'sum']).reset_index()
    cust.columns = ['name_orig', 'tx_count', 'total_spent']

    p25, p50, p75 = cust['total_spent'].quantile([0.25, 0.50, 0.75])
    cust['tier'] = pd.cut(
        cust['total_spent'],
        bins=[-1, p25, p50, p75, float('inf')],
        labels=['Low', 'Mid', 'High', 'Whale'],
    )
    df = (cust.groupby('tier', observed=True)
          .agg(customer_count=('name_orig', 'count'),
               total_value=('total_spent', 'sum'),
               avg_spend_per_customer=('total_spent', 'mean'),
               total_transactions=('tx_count', 'sum'))
          .reset_index())
    df['pct_value_share'] = 100 * df['total_value'] / df['total_value'].sum()

    tier_order = ['Whale', 'High', 'Mid', 'Low']
    df['tier'] = pd.Categorical(df['tier'], categories=tier_order, ordered=True)
    df = df.sort_values('tier')
    colors = [TIER_COLORS.get(t, '#888') for t in df['tier']]

    fig, axes = plt.subplots(1, 3, figsize=(15, 6))

    # Customer count bar
    axes[0].bar(df['tier'], df['customer_count'], color=colors, alpha=0.85)
    axes[0].set_title('Customers per Tier', fontsize=11, fontweight='bold')
    axes[0].set_ylabel('Customer Count')
    axes[0].yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f'{int(x):,}'))
    for i, (v, c) in enumerate(zip(df['customer_count'], colors)):
        axes[0].text(i, v + 500, f'{v:,}', ha='center', fontsize=9, fontweight='bold')

    # Value share donut
    wedges, _, autotexts = axes[1].pie(
        df['pct_value_share'], labels=df['tier'], colors=colors,
        autopct='%1.1f%%', startangle=90, wedgeprops={'width': 0.55},
    )
    for at in autotexts:
        at.set_fontsize(9)
        at.set_fontweight('bold')
    axes[1].set_title('Value Share by Tier', fontsize=11, fontweight='bold')
    centre = plt.Circle((0, 0), 0.44, fc='white')
    axes[1].add_patch(centre)

    # Avg spend per customer
    bars = axes[2].barh(df['tier'], df['avg_spend_per_customer'] / 1e3, color=colors, alpha=0.85)
    axes[2].set_title('Avg Spend per Customer', fontsize=11, fontweight='bold')
    axes[2].set_xlabel('USD Thousands')
    for bar in bars:
        w = bar.get_width()
        axes[2].text(w + 0.5, bar.get_y() + bar.get_height() / 2,
                     f'${w:.1f}K', va='center', fontsize=9)

    fig.suptitle('Customer Value Tier Segmentation', fontsize=13, fontweight='bold')
    plt.tight_layout()
    plt.savefig(os.path.join(OUT, '08_customer_tiers.png'), bbox_inches='tight')
    plt.close()
    print('Saved 08_customer_tiers.png')


# ── 9. Platform liquidity: CASH_IN vs CASH_OUT vs net flow ───────────────────
def plot_liquidity():
    df = q('SELECT * FROM v_platform_liquidity ORDER BY tx_day')

    fig, axes = plt.subplots(2, 1, figsize=(14, 8), sharex=True)

    # Gross flows
    axes[0].fill_between(df['tx_day'], df['cash_in'] / 1e9,
                         alpha=0.5, color='#22c55e', label='CASH_IN')
    axes[0].fill_between(df['tx_day'], -df['cash_out'] / 1e9,
                         alpha=0.5, color='#ef4444', label='CASH_OUT')
    axes[0].plot(df['tx_day'], df['cash_in'] / 1e9,  color='#22c55e', linewidth=1.5)
    axes[0].plot(df['tx_day'], -df['cash_out'] / 1e9, color='#ef4444', linewidth=1.5)
    axes[0].axhline(0, color='white', linewidth=0.5, linestyle='--')
    axes[0].set_ylabel('Value (USD Billions)')
    axes[0].set_title('Daily Platform Cash Flows', fontsize=12, fontweight='bold')
    axes[0].yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f'${abs(x):.1f}B'))
    axes[0].legend(framealpha=0.7)

    # Net flow
    net = df['net_flow'] / 1e9
    axes[1].bar(df['tx_day'], net,
                color=net.apply(lambda x: '#22c55e' if x >= 0 else '#ef4444'),
                alpha=0.8)
    axes[1].axhline(0, color='white', linewidth=0.8)
    axes[1].set_xlabel('Day of Simulation')
    axes[1].set_ylabel('Net Flow (USD Billions)')
    axes[1].set_title('Daily Net Liquidity (CASH_IN minus CASH_OUT)', fontsize=12, fontweight='bold')
    axes[1].yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f'${x:.1f}B'))

    plt.tight_layout()
    plt.savefig(os.path.join(OUT, '09_liquidity_flow.png'))
    plt.close()
    print('Saved 09_liquidity_flow.png')


# ── 10. Weekly business KPI summary ──────────────────────────────────────────
def plot_weekly_kpis():
    df = q('SELECT * FROM v_weekly_summary ORDER BY tx_week')

    fig, axes = plt.subplots(1, 3, figsize=(15, 5))
    week_labels = [f'Week {w}' for w in df['tx_week']]
    bar_colors  = ['#06b6d4', '#a855f7', '#22c55e', '#f59e0b', '#ef4444'][:len(df)]

    # Volume
    bars = axes[0].bar(week_labels, df['tx_count'] / 1e6, color=bar_colors, alpha=0.85)
    axes[0].set_title('Weekly Transaction Volume', fontsize=11, fontweight='bold')
    axes[0].set_ylabel('Transactions (Millions)')
    for bar, growth in zip(bars[1:], df['wow_volume_growth'].iloc[1:]):
        if pd.notna(growth):
            color = '#22c55e' if growth >= 0 else '#ef4444'
            axes[0].text(bar.get_x() + bar.get_width() / 2,
                         bar.get_height() + 0.01,
                         f'{growth:+.1f}%', ha='center', fontsize=9,
                         color=color, fontweight='bold')

    # Value
    bars = axes[1].bar(week_labels, df['total_value'] / 1e12, color=bar_colors, alpha=0.85)
    axes[1].set_title('Weekly Transaction Value', fontsize=11, fontweight='bold')
    axes[1].set_ylabel('Value (USD Trillions)')
    axes[1].yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f'${x:.2f}T'))
    for bar, growth in zip(bars[1:], df['wow_value_growth'].iloc[1:]):
        if pd.notna(growth):
            color = '#22c55e' if growth >= 0 else '#ef4444'
            axes[1].text(bar.get_x() + bar.get_width() / 2,
                         bar.get_height() + 0.001,
                         f'{growth:+.1f}%', ha='center', fontsize=9,
                         color=color, fontweight='bold')

    # Active customers
    axes[2].bar(week_labels, df['active_customers'] / 1e6, color=bar_colors, alpha=0.85)
    axes[2].set_title('Weekly Active Customers', fontsize=11, fontweight='bold')
    axes[2].set_ylabel('Customers (Millions)')
    axes[2].yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f'{x:.1f}M'))

    fig.suptitle('Weekly Business KPIs  --  Volume, Value & Active Customers',
                 fontsize=13, fontweight='bold')
    plt.tight_layout()
    plt.savefig(os.path.join(OUT, '10_weekly_kpis.png'), bbox_inches='tight')
    plt.close()
    print('Saved 10_weekly_kpis.png')


# ── 11. Average transaction size by type over time ────────────────────────────
def plot_avg_tx_size():
    df = q('SELECT * FROM v_avg_tx_size_trend ORDER BY tx_day, tx_type')
    types = ['CASH_OUT', 'PAYMENT', 'CASH_IN', 'TRANSFER', 'DEBIT']

    fig, ax = plt.subplots(figsize=(14, 5))
    for tx_type in types:
        sub = df[df['tx_type'] == tx_type]
        if sub.empty:
            continue
        ma = sub.set_index('tx_day')['avg_amount'].rolling(5, min_periods=1).mean()
        ax.plot(ma.index, ma / 1e3, label=tx_type,
                color=TYPE_COLORS.get(tx_type, '#888'), linewidth=2)

    ax.set_xlabel('Day of Simulation')
    ax.set_ylabel('Average Transaction Size (USD Thousands)')
    ax.set_title('Average Transaction Size by Type  --  5-Day Rolling Average',
                 fontsize=12, fontweight='bold')
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f'${x:.0f}K'))
    ax.legend(title='Type', framealpha=0.7)
    plt.tight_layout()
    plt.savefig(os.path.join(OUT, '11_avg_tx_size.png'))
    plt.close()
    print('Saved 11_avg_tx_size.png')


# ── 12. Daily active customers trend (from local CSV — COUNT DISTINCT too slow on DB) ─
def plot_dac():
    print('  Loading DAC data from CSV...')
    raw = pd.read_csv(CSV, usecols=['step', 'nameOrig'])
    raw = raw[raw['nameOrig'].str[0] == 'C']
    raw['tx_day'] = ((raw['step'] - 1) // 24 + 1).astype(int)
    df = raw.groupby('tx_day')['nameOrig'].nunique().reset_index()
    df.columns = ['tx_day', 'dac']
    df['ma7'] = df['dac'].rolling(7, min_periods=1).mean()

    fig, ax = plt.subplots(figsize=(13, 5))
    ax.fill_between(df['tx_day'], df['dac'] / 1e6, alpha=0.3, color='#f59e0b')
    ax.plot(df['tx_day'], df['dac'] / 1e6, color='#f59e0b', linewidth=1.5, label='DAC')
    ax.plot(df['tx_day'], df['ma7'] / 1e6, color='#ef4444', linewidth=2.5,
            linestyle='--', label='7-day MA')
    ax.set_xlabel('Day of Simulation')
    ax.set_ylabel('Daily Active Customers (Millions)')
    ax.set_title('Daily Active Customers  --  30-Day Trend', fontsize=12, fontweight='bold')
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f'{x:.2f}M'))
    ax.legend(framealpha=0.7)
    plt.tight_layout()
    plt.savefig(os.path.join(OUT, '12_daily_active_customers.png'))
    plt.close()
    print('Saved 12_daily_active_customers.png')


if __name__ == '__main__':
    print('Running business performance pipeline...')
    plot_top_merchants()
    plot_customer_tiers()
    plot_liquidity()
    plot_weekly_kpis()
    plot_avg_tx_size()
    plot_dac()
    print('\nBusiness performance analysis complete. Charts saved to 06_outputs/')
