"""
paysim_eda.py
EDA pipeline: transaction volumes, type mix, hourly patterns, amount distributions.
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
os.makedirs(OUT, exist_ok=True)

sns.set_theme(style='darkgrid')
plt.rcParams.update({'figure.dpi': 150})

TYPE_COLORS = {
    'CASH_OUT': '#ef4444',
    'PAYMENT':  '#06b6d4',
    'CASH_IN':  '#22c55e',
    'TRANSFER': '#a855f7',
    'DEBIT':    '#f59e0b',
}


def q(sql):
    with engine.connect() as conn:
        conn.execute(text('SET search_path TO paysim'))
        return pd.read_sql(text(sql), conn)


# ── 1. Daily transaction volume by type (stacked area) ───────────────────────
def plot_daily_volume():
    df = q('SELECT * FROM v_daily_by_type ORDER BY tx_day, tx_type')
    pivot = df.pivot(index='tx_day', columns='tx_type', values='tx_count').fillna(0)
    cols  = [c for c in ['CASH_OUT','PAYMENT','CASH_IN','TRANSFER','DEBIT'] if c in pivot.columns]
    colors = [TYPE_COLORS[c] for c in cols]

    fig, axes = plt.subplots(2, 1, figsize=(14, 8), sharex=True)

    # Volume
    pivot[cols].plot.area(ax=axes[0], color=colors, alpha=0.85, linewidth=0)
    axes[0].set_ylabel('Transaction Count')
    axes[0].set_title('Daily Transaction Volume by Type', fontsize=12, fontweight='bold')
    axes[0].yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f'{int(x):,}'))
    axes[0].legend(title='Type', framealpha=0.7)

    # Value
    pivot_v = df.pivot(index='tx_day', columns='tx_type', values='total_value').fillna(0)
    pivot_v[cols].plot.area(ax=axes[1], color=colors, alpha=0.85, linewidth=0)
    axes[1].set_xlabel('Day of Simulation')
    axes[1].set_ylabel('Total Value')
    axes[1].set_title('Daily Transaction Value by Type', fontsize=12, fontweight='bold')
    axes[1].yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f'${x/1e9:.1f}B'))
    axes[1].legend(title='Type', framealpha=0.7)

    plt.tight_layout()
    plt.savefig(os.path.join(OUT, '01_daily_volume.png'))
    plt.close()
    print('Saved 01_daily_volume.png')


# ── 2. Transaction type mix: volume % vs value % ─────────────────────────────
def plot_type_mix():
    df = q('SELECT * FROM v_type_performance')

    fig, axes = plt.subplots(1, 2, figsize=(13, 6))
    colors = [TYPE_COLORS.get(t, '#888') for t in df['tx_type']]

    for ax, col, title, fmt in [
        (axes[0], 'pct_volume', 'Share of Transaction Count', '{:.1f}%'),
        (axes[1], 'pct_value',  'Share of Total Value',       '{:.1f}%'),
    ]:
        wedges, _, autotexts = ax.pie(
            df[col], labels=df['tx_type'], colors=colors,
            autopct='%1.1f%%', startangle=90,
            wedgeprops={'width': 0.55}, textprops={'fontsize': 10},
        )
        for at in autotexts:
            at.set_fontsize(9)
            at.set_fontweight('bold')
        ax.set_title(title, fontsize=12, fontweight='bold')
        total_label = (f"{df['tx_count'].sum():,.0f}\nTxns"
                       if col == 'pct_volume' else
                       f"${df['total_value'].sum()/1e9:.1f}B\nTotal")
        ax.text(0, 0, total_label, ha='center', va='center', fontsize=10, fontweight='bold')
        centre = plt.Circle((0, 0), 0.44, fc='white')
        ax.add_patch(centre)

    fig.suptitle('Transaction Type Mix  --  Volume vs Value', fontsize=13, fontweight='bold')
    plt.tight_layout()
    plt.savefig(os.path.join(OUT, '02_type_mix.png'))
    plt.close()
    print('Saved 02_type_mix.png')


# ── 3. Hourly transaction heatmap (hour x day-of-week) ───────────────────────
def plot_hourly_heatmap():
    df = q('''
        SELECT tx_dow, tx_hour,
               COUNT(*) AS tx_count,
               SUM(amount) AS total_value
        FROM paysim.transactions
        GROUP BY tx_dow, tx_hour
        ORDER BY tx_dow, tx_hour
    ''')
    pivot = df.pivot(index='tx_hour', columns='tx_dow', values='tx_count')
    pivot.columns = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

    fig, ax = plt.subplots(figsize=(11, 8))
    sns.heatmap(
        pivot, ax=ax, cmap='YlOrRd',
        fmt=',d', annot=True,
        linewidths=0.3, cbar_kws={'label': 'Transaction Count'},
    )
    ax.set_title('Transaction Volume Heatmap -- Hour of Day x Day of Week', fontsize=13, fontweight='bold')
    ax.set_xlabel('Day of Week')
    ax.set_ylabel('Hour of Day (0 = midnight)')
    plt.tight_layout()
    plt.savefig(os.path.join(OUT, '03_hourly_heatmap.png'))
    plt.close()
    print('Saved 03_hourly_heatmap.png')


# ── 4. Transaction amount distribution by type (log scale) ───────────────────
def plot_amount_distribution():
    df = q('''
        SELECT tx_type, amount
        FROM paysim.transactions
        WHERE amount > 0
        ORDER BY RANDOM()
        LIMIT 100000
    ''')
    df['log_amount'] = np.log10(df['amount'])

    fig, ax = plt.subplots(figsize=(13, 6))
    for tx_type, grp in df.groupby('tx_type'):
        color = TYPE_COLORS.get(tx_type, '#888')
        ax.hist(grp['log_amount'], bins=60, alpha=0.6,
                label=tx_type, color=color, density=True)

    ax.set_xlabel('Transaction Amount (log10 scale)')
    ax.set_ylabel('Density')
    ax.set_title('Transaction Amount Distribution by Type (100K sample, log scale)',
                 fontsize=12, fontweight='bold')
    ticks = [1, 2, 3, 4, 5, 6, 7, 8]
    ax.set_xticks(ticks)
    ax.set_xticklabels([f'$10^{t}' for t in ticks])
    ax.legend(title='Type', framealpha=0.7)
    plt.tight_layout()
    plt.savefig(os.path.join(OUT, '04_amount_distribution.png'))
    plt.close()
    print('Saved 04_amount_distribution.png')


# ── 5. Daily total value with 7-day moving average ───────────────────────────
def plot_daily_value():
    df = q('SELECT tx_day, total_value, tx_count FROM v_daily_summary ORDER BY tx_day')
    df['ma7'] = df['total_value'].rolling(7, min_periods=1).mean()

    fig, ax1 = plt.subplots(figsize=(14, 5))
    ax2 = ax1.twinx()

    ax1.fill_between(df['tx_day'], df['total_value'] / 1e9,
                     alpha=0.3, color='#06b6d4', label='Daily value')
    ax1.plot(df['tx_day'], df['total_value'] / 1e9,
             color='#06b6d4', linewidth=1.5)
    ax1.plot(df['tx_day'], df['ma7'] / 1e9,
             color='#f59e0b', linewidth=2.5, linestyle='--', label='7-day MA')
    ax2.bar(df['tx_day'], df['tx_count'], alpha=0.25, color='#a855f7', label='Tx count')

    ax1.set_ylabel('Total Value (USD Billions)', color='#06b6d4')
    ax2.set_ylabel('Transaction Count', color='#a855f7')
    ax1.set_xlabel('Day of Simulation')
    ax1.set_title('Daily Transaction Value & Volume (30-Day Window)', fontsize=12, fontweight='bold')
    ax1.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f'${x:.1f}B'))
    lines1, labels1 = ax1.get_legend_handles_labels()
    lines2, labels2 = ax2.get_legend_handles_labels()
    ax1.legend(lines1 + lines2, labels1 + labels2, framealpha=0.7)
    plt.tight_layout()
    plt.savefig(os.path.join(OUT, '05_daily_value.png'))
    plt.close()
    print('Saved 05_daily_value.png')


# ── 6. Cumulative transaction growth over 30 days ────────────────────────────
def plot_cumulative_growth():
    df = q('SELECT tx_day, tx_count FROM v_daily_summary ORDER BY tx_day')
    df['cumulative'] = df['tx_count'].cumsum()

    fig, ax = plt.subplots(figsize=(13, 5))
    ax.fill_between(df['tx_day'], df['cumulative'] / 1e6,
                    alpha=0.3, color='#22c55e')
    ax.plot(df['tx_day'], df['cumulative'] / 1e6,
            color='#22c55e', linewidth=2.5)
    ax.set_xlabel('Day of Simulation')
    ax.set_ylabel('Cumulative Transactions (Millions)')
    ax.set_title('Cumulative Transaction Growth -- 30-Day Window', fontsize=12, fontweight='bold')
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f'{x:.1f}M'))

    # Milestone annotations
    for target in [1, 2, 3, 4, 5, 6]:
        row = df[df['cumulative'] >= target * 1e6].head(1)
        if not row.empty:
            d = row['tx_day'].iloc[0]
            ax.axvline(d, color='#f59e0b', linewidth=0.8, linestyle=':')
            ax.text(d + 0.3, target, f'{target}M', fontsize=8, color='#f59e0b', fontweight='bold')

    plt.tight_layout()
    plt.savefig(os.path.join(OUT, '06_cumulative_growth.png'))
    plt.close()
    print('Saved 06_cumulative_growth.png')


if __name__ == '__main__':
    print('Running PaySim EDA pipeline...')
    plot_daily_volume()
    plot_type_mix()
    plot_hourly_heatmap()
    plot_amount_distribution()
    plot_daily_value()
    plot_cumulative_growth()
    print('\nEDA complete. Charts saved to 06_outputs/')
