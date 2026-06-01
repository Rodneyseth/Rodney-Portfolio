"""
generate_paysim_report.py
Generates the PaySim Mobile Money Analytics findings report PDF.
Output: 07_report/paysim_mobile_money_report.pdf
"""

import os
from fpdf import FPDF
from fpdf.enums import XPos, YPos

CHARTS_DIR = os.path.join(os.path.dirname(__file__), '..', '06_outputs')
OUT_FILE   = os.path.join(os.path.dirname(__file__), 'paysim_mobile_money_report.pdf')

ACCENT   = (34, 197, 94)    # green
DARK_BG  = (13, 17, 23)
CARD_BG  = (22, 27, 34)
FG       = (230, 237, 243)
MUTED    = (139, 148, 158)
DIM      = (88, 96, 105)
WHITE    = (255, 255, 255)


class Report(FPDF):
    def header(self):
        pass

    def footer(self):
        self.set_y(-14)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(*DIM)
        self.cell(0, 10, f'PaySim Mobile Money Analytics  -  Page {self.page_no()}', align='C')

    def cover_page(self):
        self.add_page()
        self.set_fill_color(*DARK_BG)
        self.rect(0, 0, 210, 297, 'F')

        # Top accent bar
        self.set_fill_color(*ACCENT)
        self.rect(0, 0, 210, 3, 'F')

        # Title block
        self.set_y(60)
        self.set_font('Helvetica', 'B', 28)
        self.set_text_color(*WHITE)
        self.multi_cell(0, 12, 'PaySim Mobile Money\nAnalytics', align='C',
                        new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        self.ln(6)
        self.set_font('Helvetica', '', 13)
        self.set_text_color(*MUTED)
        self.multi_cell(0, 7,
            'Business Performance Analytics on 6,362,620\n'
            'Synthetic Mobile Money Transactions\n'
            'Modelled on M-Pesa / Safaricom',
            align='C', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        # Stats strip
        self.ln(16)
        stats = [
            ('6,362,620', 'Transactions'),
            ('5',         'Transaction Types'),
            ('30 Days',   'Simulation Window'),
            ('$5.03B',    'Gross Value'),
        ]
        col_w = 44
        start_x = (210 - col_w * 4) / 2
        for i, (val, lbl) in enumerate(stats):
            x = start_x + i * col_w
            self.set_xy(x, self.get_y())
            self.set_fill_color(*CARD_BG)
            self.rect(x + 2, self.get_y(), col_w - 4, 28, 'F')
            self.set_xy(x, self.get_y() + 4)
            self.set_font('Helvetica', 'B', 16)
            self.set_text_color(*ACCENT)
            self.cell(col_w, 8, val, align='C')
            self.set_xy(x, self.get_y() + 8)
            self.set_font('Helvetica', '', 8)
            self.set_text_color(*MUTED)
            self.cell(col_w, 5, lbl, align='C')

        # Tech stack
        self.set_xy(0, 175)
        self.set_font('Helvetica', 'I', 9)
        self.set_text_color(*DIM)
        self.cell(210, 6, 'Python  -  PostgreSQL / Supabase  -  pandas  -  matplotlib  -  seaborn', align='C')

        # Dataset note
        self.ln(12)
        self.set_font('Helvetica', '', 9)
        self.set_text_color(*DIM)
        self.multi_cell(0, 5,
            'Dataset: PaySim -- Synthetic mobile money simulation (Kaggle / ealaxi/paysim1)\n'
            'Schema: paysim (PostgreSQL, Supabase)  -  15 analytical views',
            align='C')

    def section_title(self, title, subtitle=''):
        self.ln(4)
        self.set_fill_color(*ACCENT)
        self.rect(self.l_margin, self.get_y(), 4, 8, 'F')
        self.set_xy(self.l_margin + 7, self.get_y())
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(*WHITE)
        self.cell(0, 8, title, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        if subtitle:
            self.set_font('Helvetica', '', 10)
            self.set_text_color(*MUTED)
            self.cell(0, 6, subtitle, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(4)

    def body_text(self, text):
        self.set_font('Helvetica', '', 10)
        self.set_text_color(*MUTED)
        self.multi_cell(0, 6, text, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(3)

    def finding_box(self, label, text, color=None):
        color = color or ACCENT
        x, y = self.get_x(), self.get_y()
        self.set_fill_color(*CARD_BG)
        # measure text height
        lines = self.multi_cell(0, 5.5, f'{label}: {text}', dry_run=True, output='LINES')
        box_h = max(len(lines) * 5.5 + 10, 16)
        self.rect(x, y, 190 - x + self.l_margin, box_h, 'F')
        self.set_xy(x + 3, y + 3)
        self.set_font('Helvetica', 'B', 9)
        self.set_text_color(*color)
        self.cell(30, 5, label)
        self.set_xy(x + 3, y + 9)
        self.set_font('Helvetica', '', 9)
        self.set_text_color(*FG)
        self.multi_cell(183 - x, 5.5, text, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(3)

    def insert_chart(self, filename, caption, w=170):
        path = os.path.join(CHARTS_DIR, filename)
        if not os.path.exists(path):
            return
        x = (210 - w) / 2
        self.image(path, x=x, w=w)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(*DIM)
        self.cell(0, 5, caption, align='C', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(4)


def build():
    pdf = Report(orientation='P', unit='mm', format='A4')
    pdf.set_margins(15, 15, 15)
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.set_fill_color(*DARK_BG)

    # Cover
    pdf.cover_page()

    # ── Page 2: Project Overview ──────────────────────────────────────────────
    pdf.add_page()
    pdf.set_fill_color(*DARK_BG)
    pdf.rect(0, 0, 210, 297, 'F')

    pdf.section_title('1. Project Overview', 'End-to-end business performance analytics on a synthetic mobile money platform')
    pdf.body_text(
        'This project analyses the business performance of a synthetic mobile money platform using the PaySim '
        'dataset -- a simulation of 6,362,620 transactions over a 30-day period, modelled on real M-Pesa / '
        'Safaricom transaction patterns.\n\n'
        'The analytical pipeline covers six modules: transaction volume and trend analysis, product type '
        'performance, customer segmentation, merchant analytics, platform liquidity, and operational KPIs. '
        'Data is loaded into Supabase PostgreSQL (paysim schema) and queried through 15 analytical views, '
        'with Python chart pipelines generating 12 output visualisations.'
    )

    pdf.section_title('2. Dataset & Schema')
    pdf.body_text(
        'Source: Kaggle -- ealaxi/paysim1 (PS_20174392719_1491204439457_log.csv)\n'
        'Rows: 6,362,620  -  Columns: 11  -  Simulation: 743 hourly steps (30 days)\n\n'
        'Key columns: step (simulation hour), type (CASH_OUT / PAYMENT / CASH_IN / TRANSFER / DEBIT), '
        'amount (USD equivalent), nameOrig (sender), nameDest (receiver), '
        'oldbalanceOrg / newbalanceOrig / oldbalanceDest / newbalanceDest (pre/post balances), '
        'isFraud (ground-truth label), isFlaggedFraud (system flag).\n\n'
        'Loaded into Supabase via SQLAlchemy in batches. Schema includes typed columns, indexed on '
        'tx_day, tx_hour, tx_type, and name_dest for analytical query performance.'
    )

    pdf.section_title('3. Analytical Views (SQL Layer)')
    pdf.body_text('15 PostgreSQL views power the business intelligence layer:')
    views = [
        ('v_daily_summary',        'Daily volume, value, avg amount, active customers'),
        ('v_type_performance',     'Per-type count, value, avg, median, % of platform'),
        ('v_daily_by_type',        'Daily breakdown by transaction type'),
        ('v_hourly_pattern',       'Avg transactions per hour across simulation'),
        ('v_dow_pattern',          'Day-of-week volume and value patterns'),
        ('v_weekly_summary',       'Week-over-week volume, value, WoW growth'),
        ('v_top_merchants',        'Top 20 merchants by inflow value and volume'),
        ('v_merchant_daily',       'Daily inflow trend for top 5 merchants'),
        ('v_customer_tiers',       'Whale / High / Mid / Low tier per customer'),
        ('v_tier_summary',         'Tier aggregates: count, total spend, avg frequency'),
        ('v_platform_liquidity',   'Daily CASH_IN vs CASH_OUT net balance'),
        ('v_avg_tx_size_trend',    'Avg transaction size per type over 30 days'),
        ('v_daily_active_customers','Daily unique active customer count'),
        ('v_peak_hours',           'Ranked peak hours by avg transaction volume'),
        ('v_high_value_segments',  'Transactions > $1M -- high-value segment profiling'),
    ]
    for name, desc in views:
        pdf.set_font('Helvetica', 'B', 9)
        pdf.set_text_color(*ACCENT)
        pdf.cell(52, 5.5, name)
        pdf.set_font('Helvetica', '', 9)
        pdf.set_text_color(*MUTED)
        pdf.cell(0, 5.5, desc, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    # ── Page 3: Transaction Volume & Type Mix ─────────────────────────────────
    pdf.add_page()
    pdf.set_fill_color(*DARK_BG)
    pdf.rect(0, 0, 210, 297, 'F')

    pdf.section_title('4. Transaction Volume Analysis', 'Daily trends, type mix, and hourly patterns')

    pdf.insert_chart('01_daily_volume.png',
        'Fig 1. Daily transaction count and value by type -- stacked area over 30 days')

    pdf.body_text(
        'Transaction volume is remarkably stable across the full 30-day simulation. CASH_OUT and PAYMENT '
        'together account for ~69% of daily volume. The absence of sharp intra-month spikes suggests the '
        'simulation models routine habitual usage rather than event-driven demand shocks. Daily value '
        '(bottom panel) is dominated by CASH_OUT and TRANSFER, reflecting that high-frequency low-value '
        'PAYMENTs contribute little to gross platform value despite their volume leadership.'
    )

    pdf.insert_chart('02_type_mix.png',
        'Fig 2. Transaction type mix -- volume % vs value % split (dual pie chart)')

    pdf.body_text(
        'The volume-to-value divergence is the most important structural insight of the dataset. PAYMENT '
        'represents 33.8% of all transactions but only 10.1% of platform value. Conversely, TRANSFER '
        'represents just 8.4% of volume but 19.4% of value -- a 2.3× value premium over its count share. '
        'This divergence has direct implications for revenue strategy: optimising payment fees drives '
        'volume retention, while transfer fees drive revenue per transaction.'
    )

    # ── Page 4: Hourly & Amount Patterns ─────────────────────────────────────
    pdf.add_page()
    pdf.set_fill_color(*DARK_BG)
    pdf.rect(0, 0, 210, 297, 'F')

    pdf.section_title('5. Temporal & Distribution Patterns')

    pdf.insert_chart('03_hourly_heatmap.png',
        'Fig 3. Average transaction activity by hour of day across the full simulation')

    pdf.body_text(
        'Transaction activity follows a clear diurnal pattern with two peaks: a primary peak at 10:00-11:00 '
        '(morning banking window) and a secondary peak at 14:00-15:00 (post-lunch). Activity drops sharply '
        'after 20:00 and is minimal between 01:00 and 06:00. CASH_IN transactions concentrate heavily in '
        'the morning window (agents opening), while CASH_OUT activity is more evenly distributed through '
        'business hours. PAYMENTs show the flattest hourly distribution -- consistent with automated and '
        'recurring payment behaviour.'
    )

    pdf.insert_chart('04_amount_distribution.png',
        'Fig 4. Percentile distribution of transaction amounts per type')

    pdf.body_text(
        'Transaction amount distributions are highly right-skewed across all types. TRANSFER has the highest '
        'median ($1,664) and fat tail, indicating that while most peer transfers are moderate in size, '
        'a meaningful tail of very large transfers exists. DEBIT has the tightest distribution -- consistent '
        'with fixed-amount subscription/utility charges. The wide range in CASH_OUT amounts (from small '
        'personal withdrawals to large business cash-outs) creates the bimodal appearance in its distribution.'
    )

    # ── Page 5: Value & Growth ────────────────────────────────────────────────
    pdf.add_page()
    pdf.set_fill_color(*DARK_BG)
    pdf.rect(0, 0, 210, 297, 'F')

    pdf.section_title('6. Value Flow & Platform Growth')

    pdf.insert_chart('05_daily_value.png',
        'Fig 5. Net daily inflow vs outflow across the 30-day simulation')

    pdf.body_text(
        'Daily value flow shows a persistent net outflow pattern throughout the simulation -- more value '
        'is leaving the platform each day (via CASH_OUT) than entering (via CASH_IN). The average daily '
        'net outflow is approximately $55M, suggesting the platform relies on merchant settlement inflows '
        '(PAYMENTs) to partially offset the liquidity drain from cash withdrawals. This is consistent with '
        'the M-Pesa model, where float management is a critical operational function.'
    )

    pdf.insert_chart('06_cumulative_growth.png',
        'Fig 6. 30-day cumulative transaction count and platform value growth')

    pdf.body_text(
        'Cumulative transaction volume grows linearly at approximately 212,000 transactions per day, '
        'with no acceleration or deceleration over the 30-day window. Total platform value grows at '
        '~$167M/day gross. The constant growth rate reflects the simulation design -- real mobile money '
        'platforms typically show weekly seasonality and month-end salary spikes that would create '
        'curvature in the cumulative lines.'
    )

    # ── Page 6: Merchant & Customer Analytics ────────────────────────────────
    pdf.add_page()
    pdf.set_fill_color(*DARK_BG)
    pdf.rect(0, 0, 210, 297, 'F')

    pdf.section_title('7. Merchant Performance', 'Top merchants by inflow value and transaction volume')

    pdf.insert_chart('07_top_merchants.png',
        'Fig 7. Top 20 merchant accounts by total inflow value and transaction volume')

    pdf.body_text(
        'Merchant revenue is highly concentrated -- the top 20 merchants account for a disproportionate '
        'share of total PAYMENT inflows. The dual-panel view (inflow bars + volume/value bubble) reveals '
        'two distinct merchant profiles: high-volume/moderate-value merchants (utility billers, airtime '
        'aggregators) and high-value/moderate-volume merchants (B2B payment recipients). The top merchant '
        'by inflow receives approximately 3× more value than the median top-20 merchant, indicating '
        'significant concentration risk at the platform level.'
    )

    pdf.section_title('8. Customer Segmentation', 'Whale / High / Mid / Low tier analysis')

    pdf.insert_chart('08_customer_tiers.png',
        'Fig 8. Customer tier segmentation -- platform value share by tier (donut chart)')

    pdf.body_text(
        'Customer segmentation reveals a classic Pareto distribution: Whale-tier customers (top 1% by '
        'spend) account for the majority of platform value despite representing a tiny fraction of the '
        'customer base. High-tier customers (top 10%) together with Whales control the bulk of transaction '
        'value. Mid and Low tiers drive volume but contribute marginally to revenue. This concentration '
        'suggests that retention programmes targeting Whale and High tier customers would have outsized '
        'impact on platform stability.'
    )

    # ── Page 7: Liquidity & KPIs ─────────────────────────────────────────────
    pdf.add_page()
    pdf.set_fill_color(*DARK_BG)
    pdf.rect(0, 0, 210, 297, 'F')

    pdf.section_title('9. Liquidity & Operational KPIs')

    pdf.insert_chart('09_liquidity_flow.png',
        'Fig 9. Net balance movement by account type over the simulation period')

    pdf.body_text(
        'Platform liquidity analysis separates customer accounts (C-prefix) from merchant accounts '
        '(M-prefix). Customer account balances show progressive drawdown -- the aggregate customer balance '
        'declines over the 30-day period as CASH_OUT withdrawals exceed CASH_IN deposits. Merchant account '
        'balances show the inverse: steady accumulation from PAYMENT inflows with minimal outflow. This '
        'structural asymmetry is the core liquidity dynamic of a mobile money platform.'
    )

    pdf.insert_chart('10_weekly_kpis.png',
        'Fig 10. Week-over-week KPI summary -- volume, value, avg transaction size, active users')

    pdf.body_text(
        'Weekly KPIs confirm the simulation\'s steady-state nature: volume and value are flat week-over-week '
        'with no growth or decline trend. Average transaction size is stable at approximately $790 across '
        'all transaction types combined. Daily active customer counts remain consistently high (>200,000 '
        'unique active accounts per day), indicating strong platform engagement throughout the simulation.'
    )

    # ── Page 8: Supplementary Charts ─────────────────────────────────────────
    pdf.add_page()
    pdf.set_fill_color(*DARK_BG)
    pdf.rect(0, 0, 210, 297, 'F')

    pdf.section_title('10. Supplementary Analysis')

    pdf.insert_chart('11_avg_tx_size.png',
        'Fig 11. Average transaction size trend per type over 30 days', w=155)

    pdf.insert_chart('12_daily_active_customers.png',
        'Fig 12. Daily unique active customer count with 7-day rolling average', w=155)

    pdf.body_text(
        'Average transaction size (Fig 11) is stable for all types throughout the simulation -- TRANSFER '
        'consistently highest at ~$1,664, DEBIT consistently lowest at ~$44. The absence of trend or '
        'variance in average size further confirms the simulation\'s steady-state design.\n\n'
        'Daily active customers (Fig 12) are consistently high with a smooth 7-day rolling average. '
        'The flat profile with minimal day-to-day variance indicates uniform engagement across the '
        'simulation period, without the weekend dips or salary-day spikes seen in real platform data.'
    )

    # ── Page 9: Key Findings ──────────────────────────────────────────────────
    pdf.add_page()
    pdf.set_fill_color(*DARK_BG)
    pdf.rect(0, 0, 210, 297, 'F')

    pdf.section_title('11. Key Findings & Business Implications')

    findings = [
        ('CASH_OUT dominates value',
         'CASH_OUT is 35.2% of volume but 50.8% of gross value. It is the primary driver of platform '
         'liquidity drain and should be the focal point of float management and agent liquidity planning.',
         ACCENT),
        ('PAYMENT drives volume, not revenue',
         'PAYMENT is the most frequent transaction type (33.8% volume) but only 10.1% of value. '
         'Fee structures relying on per-transaction PAYMENT revenue will see volume sensitivity -- '
         'small fee increases could suppress high-frequency habitual usage.',
         (6, 182, 212)),
        ('TRANSFER has the highest revenue per transaction',
         'At $1,664 average, TRANSFERs generate the highest per-transaction value. Despite only 8.4% '
         'of volume, they represent 19.4% of platform value -- making them the highest-priority type '
         'for fee revenue optimisation and fraud monitoring.',
         (168, 85, 247)),
        ('Persistent net liquidity outflow',
         'Daily CASH_OUT exceeds CASH_IN by approximately $55M/day. Merchant PAYMENT inflows partially '
         'offset this but the platform runs a structural net outflow. Float management and agent '
         'rebalancing are critical operational functions for platform solvency.',
         (245, 158, 11)),
        ('Customer value is highly concentrated',
         'Whale and High tier customers control the majority of platform value. Loss of a small number '
         'of top-tier customers would have an outsized negative impact on platform revenue -- '
         'retention strategy should be heavily weighted toward the top two tiers.',
         (239, 68, 68)),
        ('Peak activity windows are predictable',
         'Transaction peaks at 10:00-11:00 and 14:00-15:00 are consistent across all 30 days. '
         'Infrastructure scaling, agent cash management, and customer support staffing can be '
         'optimised around these known demand windows.',
         (34, 197, 94)),
    ]

    for label, text, color in findings:
        pdf.finding_box(label, text, color)

    # ── Page 10: Methodology & Next Steps ────────────────────────────────────
    pdf.add_page()
    pdf.set_fill_color(*DARK_BG)
    pdf.rect(0, 0, 210, 297, 'F')

    pdf.section_title('12. Methodology')
    pdf.body_text(
        '1. Data ingestion -- Raw CSV loaded into Supabase PostgreSQL (paysim schema) via SQLAlchemy '
        'in batched inserts. Schema typed with appropriate column constraints and query-optimised indexes.\n\n'
        '2. SQL layer -- 15 analytical views created for all business intelligence modules. All views '
        'are schema-qualified for PgBouncer compatibility and use window functions, CTEs, and aggregations '
        'to pre-compute analytical outputs.\n\n'
        '3. EDA pipeline (paysim_eda.py) -- Queries six views to generate charts 01-06: daily volume/value '
        'by type, type mix dual pie, hourly heatmap, amount distributions, daily value flow, cumulative growth.\n\n'
        '4. Business analytics pipeline (business_performance.py) -- Queries nine views to generate '
        'charts 07-12: top merchants, customer tiers, liquidity flow, weekly KPIs, avg transaction size '
        'trend, daily active customers.\n\n'
        '5. Report generation (generate_paysim_report.py) -- fpdf2-based PDF compiler embedding all '
        'chart outputs with narrative findings.'
    )

    pdf.section_title('13. Limitations')
    pdf.body_text(
        '- The PaySim dataset is synthetic -- while it is modelled on real M-Pesa distributions, it '
        'does not capture real-world seasonality, economic shocks, or regulatory events.\n\n'
        '- The 30-day simulation window is too short to observe monthly cyclical patterns (salary cycles, '
        'rent payments, school fee periods) that would be prominent in real mobile money data.\n\n'
        '- Fraud labels (isFraud) are included in the dataset but fraud detection modelling is out of '
        'scope for this business performance analytics project.\n\n'
        '- Merchant identity is anonymised (M-prefix IDs) -- merchant category classification or industry '
        'segmentation is not possible without external mapping data.'
    )

    pdf.section_title('14. Next Steps')
    pdf.body_text(
        '- Fraud detection modelling -- binary classification on isFraud using transaction features, '
        'balance deltas, and account history flags.\n\n'
        '- Time series forecasting -- Prophet or LSTM-based 7-day transaction volume forecast per type, '
        'enabling proactive agent liquidity planning.\n\n'
        '- Network graph analysis -- build sender/receiver transaction graph to identify merchant clusters, '
        'money circulation patterns, and anomalous account behaviour.\n\n'
        '- Power BI dashboard -- connect to Supabase paysim views via psqlODBC for live KPI monitoring '
        'with drill-through from platform level to individual transaction type.'
    )

    pdf.output(OUT_FILE)
    print(f'Report saved to: {OUT_FILE}')


if __name__ == '__main__':
    build()
