export const projects = [
  {
    id: 'telco-churn',
    tag: 'Python · SQL · Machine Learning',
    title: 'Telco Customer Churn Prediction',
    github: 'https://github.com/Rodneyseth/Rodney-Portfolio/tree/main/projects/02_telco-churn',
    desc: 'End-to-end churn prediction pipeline — SQL cleaning, feature engineering, and XGBoost classification — flagging at-risk customers 30 days before they leave.',
    metrics: ['85% of churners identified', 'AUC 0.891', 'Est. KES 340K/month saved'],
    accent: 'var(--accent2)',
    status: 'Complete',
    folders: [
      {
        id: '00_demo',
        label: '00_demo',
        type: 'folder',
        icon: 'model',
        phase: 'Interactive Demo',
        summary: 'Select a customer profile to see live XGBoost churn predictions, SHAP explanations and retention recommendations.',
        demo: true,
        demoType: 'churn',
        body: '',
        files: [],
      },
      {
        id: '01_data',
        label: '01_data',
        type: 'folder',
        icon: 'data',
        phase: 'Data Ingestion',
        summary: 'IBM Telco Customer Churn dataset — 7,043 customers, 21 features, binary churn target.',
        body: `The raw dataset comes from Kaggle's IBM Telco Customer Churn collection. It contains one row per customer with demographic details, account information, and the services each customer has subscribed to.\n\n7,043 customers · 21 feature columns · ~26% churn rate (class imbalance handled downstream).`,
        files: [
          { name: 'telco_churn.csv', size: '955 KB', note: 'Source: Kaggle / IBM' },
        ],
      },
      {
        id: '02_sql',
        label: '02_sql',
        type: 'folder',
        icon: 'sql',
        phase: 'Data Cleaning & Aggregation',
        summary: 'Schema creation, null handling, type casting, and churn summary views loaded into Supabase (PostgreSQL).',
        body: `Three SQL scripts handle the full data preparation layer:\n\n01_create_tables.sql — defines the typed schema with constraints.\n02_clean_data.sql — handles TotalCharges nulls (blank strings on new customers with zero tenure), casts numeric types, normalises categorical columns.\n03_churn_summary.sql — builds analytical views: churn by contract type, by internet service, by payment method, by tenure band, and by customer segment.`,
        files: [
          { name: '01_create_tables.sql', note: 'Schema + constraints' },
          { name: '02_clean_data.sql', note: 'Null handling, type casting' },
          { name: '03_churn_summary.sql', note: 'Analytical views' },
        ],
        snippet: `-- Churn rate by contract type
SELECT contract,
       COUNT(*) AS customers,
       SUM(CASE WHEN churn = 'Yes' THEN 1 ELSE 0 END) AS churned,
       ROUND(100.0 * SUM(CASE WHEN churn = 'Yes' THEN 1 ELSE 0 END) / COUNT(*), 1) AS churn_rate
FROM telco_churn
GROUP BY contract
ORDER BY churn_rate DESC;`,
      },
      {
        id: '03_python',
        label: '03_python',
        type: 'folder',
        icon: 'python',
        phase: 'Modelling & Analysis',
        summary: 'Full ML pipeline: EDA, preprocessing, Logistic Regression / Random Forest / XGBoost, SHAP explainability.',
        body: `churn_analysis.py runs the complete ML pipeline end-to-end:\n\n• Exploratory data analysis with correlation heatmaps and distribution plots\n• Label encoding + one-hot encoding of categorical features\n• Train / test split (80/20, stratified)\n• Three models compared: Logistic Regression, Random Forest, XGBoost\n• Class imbalance addressed via scale_pos_weight in XGBoost\n• SHAP values used to explain individual predictions\n• All chart outputs saved to 06_outputs/`,
        files: [
          { name: 'churn_analysis.py', note: 'Full ML pipeline' },
          { name: 'export_views_to_csv.py', note: 'Exports SQL views to CSV for Power BI' },
          { name: 'generate_findings_pdf.py', note: 'Compiles findings report PDF' },
          { name: 'requirements.txt', note: 'pandas, scikit-learn, xgboost, shap, matplotlib' },
        ],
        snippet: `# XGBoost with class imbalance handling
xgb = XGBClassifier(
    n_estimators=200,
    max_depth=5,
    learning_rate=0.05,
    scale_pos_weight=neg/pos,   # handles 74/26 imbalance
    eval_metric='auc',
    random_state=42
)
xgb.fit(X_train, y_train)`,
      },
      {
        id: '04_excel',
        label: '04_excel',
        type: 'folder',
        icon: 'excel',
        phase: 'Excel Dashboard',
        summary: 'Pivot-table dashboard for stakeholders who prefer Excel — churn by segment, contract, tenure band.',
        body: `An Excel workbook layered on the exported SQL view CSVs. Designed for non-technical stakeholders who need to slice churn data without touching Power BI or Python.\n\nContains: pivot tables for churn by contract, by internet service, by payment method, and by tenure band — with conditional formatting to highlight high-risk segments.`,
        files: [
          { name: 'churn_dashboard.xlsx', note: 'Pivot dashboards on SQL view exports' },
        ],
      },
      {
        id: '05_powerbi',
        label: '05_powerbi',
        type: 'folder',
        icon: 'powerbi',
        phase: 'Power BI Dashboard',
        summary: 'Interactive Power BI report connected to Supabase via psqlODBC — live churn analytics for the business.',
        body: `The Power BI report connects live to Supabase via a psqlODBC DSN, pulling from the analytical views created in 02_sql.\n\nKey pages:\n• Overview — total customers, churn rate, MRR at risk\n• Segment breakdown — churn by contract, internet, payment method\n• Tenure analysis — churn probability curve by months with company\n• Services impact — heatmap of services vs churn rate`,
        files: [
          { name: 'README_powerbi.md', note: 'Setup guide: ODBC DSN + connection steps' },
        ],
      },
      {
        id: '06_outputs',
        label: '06_outputs',
        type: 'folder',
        icon: 'chart',
        phase: 'Visualisations',
        summary: 'All chart outputs from the Python analysis — distributions, model performance, and SHAP feature importance.',
        body: 'Chart outputs generated by churn_analysis.py. Click any image to view full size.',
        files: [],
        charts: [
          { file: '01_target_distribution.png', label: 'Target Distribution', desc: 'Churn vs non-churn class split — 26% positive rate' },
          { file: '02_correlation_churn.png', label: 'Correlation Heatmap', desc: 'Feature correlations with churn target' },
          { file: '03_churn_by_contract.png', label: 'Churn by Contract', desc: 'Month-to-month customers churn at 3× annual rate' },
          { file: '03b_charges_distribution.png', label: 'Charges Distribution', desc: 'Monthly charges split by churn outcome' },
          { file: '03c_tenure_distribution.png', label: 'Tenure Distribution', desc: 'Tenure months split by churn outcome' },
          { file: '04_roc_curves.png', label: 'ROC Curves', desc: 'Model comparison — XGBoost AUC 0.891' },
          { file: '05_confusion_matrix.png', label: 'Confusion Matrix', desc: 'XGBoost predictions on held-out test set' },
          { file: '06_feature_importance.png', label: 'Feature Importance (SHAP)', desc: 'Top drivers of churn — contract type dominates' },
        ],
      },
      {
        id: '07_findings',
        label: '07_findings',
        type: 'folder',
        icon: 'pdf',
        phase: 'Findings Report',
        summary: 'Compiled PDF report covering methodology, model results, key churn drivers, and retention recommendations.',
        body: `The final deliverable — a structured findings report covering:\n\n• Executive summary with the business case\n• Methodology walkthrough (data → SQL → ML → insights)\n• Model comparison table (LR / RF / XGBoost)\n• Top 5 churn drivers with SHAP-backed explanations\n• Retention recommendations by customer segment\n• Estimated financial impact at scale`,
        files: [
          { name: 'telco_churn_findings_report.pdf', note: 'Full findings & recommendations', link: '/telco_churn_report.pdf' },
        ],
      },
      {
        id: '08_logs',
        label: '08_logs',
        type: 'folder',
        icon: 'log',
        phase: 'Run Logs',
        summary: 'Pipeline execution logs — data load confirmations, model training runs, and error traces.',
        body: `Logs from each pipeline stage:\n\n• Supabase data load confirmations (row counts, schema validation)\n• Python model training output — loss curves, eval metrics per epoch\n• Any data quality warnings caught during cleaning`,
        files: [
          { name: 'pipeline.log', note: 'Combined run log' },
        ],
      },
    ],
  },
  {
    id: 'paysim-mobile-money',
    tag: 'Python · SQL · Business Analytics',
    title: 'PaySim Mobile Money Analytics',
    github: 'https://github.com/Rodneyseth/Rodney-Portfolio/tree/main/projects/04_paysim-mobile-money',
    desc: 'End-to-end business performance analytics on 6.3M synthetic mobile money transactions — transaction volumes, product mix, customer segmentation, merchant performance, liquidity flows, and operational KPIs modelled on M-Pesa / Safaricom data.',
    metrics: ['6,362,620 transactions', '5 transaction types', '30-day simulation'],
    accent: '#22c55e',
    status: 'Complete',
    folders: [
      {
        id: '00_demo',
        label: '00_demo',
        type: 'folder',
        icon: 'model',
        phase: 'Interactive Demo',
        summary: 'Select a transaction type to explore daily volume trends, value contribution, and behavioural patterns across the 30-day simulation.',
        demo: true,
        demoType: 'paysim',
        body: '',
        files: [],
      },
      {
        id: '01_data',
        label: '01_data',
        type: 'folder',
        icon: 'data',
        phase: 'Data Ingestion',
        summary: 'PaySim synthetic mobile money dataset — 6.3M transactions, 11 columns, modelled on M-Pesa / Safaricom.',
        body: `The dataset is a synthetic mobile money simulation generated from real M-Pesa transaction logs (Kaggle — ealaxi/paysim1). It models 30 days of platform activity across 6,362,620 transactions.\n\nSchema overview:\n• step — hour of simulation (1–743)\n• type — CASH_IN, CASH_OUT, DEBIT, PAYMENT, TRANSFER\n• amount — transaction value (USD equivalent)\n• nameOrig / nameDest — account IDs (C = customer, M = merchant)\n• oldbalanceOrg / newbalanceOrig — sender balance before/after\n• oldbalanceDest / newbalanceDest — receiver balance before/after\n• isFraud — ground-truth fraud label (0/1)\n• isFlaggedFraud — system-flagged fraud (0/1)\n\nLoaded into Supabase PostgreSQL under the paysim schema (separate from telco and apple_retail schemas on the same project).`,
        files: [
          { name: 'PS_20174392719_1491204439457_log.csv', size: '~470 MB', note: 'Source: Kaggle / ealaxi/paysim1 — 6.36M rows' },
        ],
      },
      {
        id: '02_sql',
        label: '02_sql',
        type: 'folder',
        icon: 'sql',
        phase: 'Schema & Analytical Views',
        summary: 'Schema creation and 15 analytical views built in Supabase (PostgreSQL) — covering daily trends, type performance, hourly patterns, merchant analytics, customer tiers, and liquidity flows.',
        body: `Two SQL scripts handle the full data layer:\n\n01_create_schema.sql — typed schema with primary key, indexes on tx_day, tx_hour, tx_type, and name_dest for query performance.\n02_analytical_views.sql — 15 views covering every analytical module:\n• v_daily_summary — daily volume, value, avg amount, active customers\n• v_type_performance — per-type count, value, % share of volume and value\n• v_daily_by_type — daily breakdown by transaction type\n• v_hourly_pattern — avg transactions per hour across the simulation\n• v_amount_distribution — percentile distribution of transaction amounts\n• v_cumulative_growth — cumulative volume and value growth over 30 days\n• v_daily_value_flow — net value flow per day (inflow vs outflow)\n• v_top_merchants — top merchant accounts by total inflow and volume\n• v_customer_tiers — Whale / High / Mid / Low segmentation by spend\n• v_liquidity_flow — platform-level net balance movement by account type\n• v_weekly_kpis — week-over-week KPIs: volume, value, avg amount, active users\n• v_avg_tx_size_by_type — average transaction size trend per type over time\n• v_daily_active_customers — daily unique active customer count`,
        files: [
          { name: '01_create_schema.sql', note: 'Schema + indexes' },
          { name: '02_analytical_views.sql', note: '15 analytical views — full business intelligence layer' },
        ],
        snippet: `-- Transaction type performance: volume %, value %, avg and median amount
WITH totals AS (
    SELECT COUNT(*) AS all_count, SUM(amount) AS all_value
    FROM paysim.transactions
)
SELECT
    t.tx_type,
    COUNT(*)                                                   AS tx_count,
    ROUND(100.0 * COUNT(*) / tot.all_count, 2)                 AS pct_volume,
    SUM(t.amount)                                              AS total_value,
    ROUND(100.0 * SUM(t.amount) / tot.all_value, 2)            AS pct_value,
    ROUND(AVG(t.amount)::NUMERIC, 2)                           AS avg_amount,
    ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP
          (ORDER BY t.amount)::NUMERIC, 2)                     AS median_amount
FROM paysim.transactions t
CROSS JOIN totals tot
GROUP BY t.tx_type, tot.all_count, tot.all_value
ORDER BY total_value DESC;`,
      },
      {
        id: '03_python',
        label: '03_python',
        type: 'folder',
        icon: 'python',
        phase: 'EDA Pipeline',
        summary: 'Transaction volume and pattern analysis — daily trends by type, type mix, hourly heatmap, amount distributions, value flows, and cumulative growth.',
        body: `paysim_eda.py runs the exploratory analysis pipeline pulling from Supabase analytical views:\n\n• Daily transaction volume and value by type — stacked area charts (CASH_OUT, PAYMENT, CASH_IN, TRANSFER, DEBIT)\n• Transaction type mix — volume % vs value % dual pie chart showing how type share of count differs from share of value\n• Hourly transaction heatmap — 24-hour pattern averaged across all 30 days, showing peak activity windows\n• Amount distribution — percentile bar chart per transaction type revealing median vs tail spend behaviour\n• Daily value flow — net inflow vs outflow over the simulation period\n• Cumulative growth — 30-day running total of transaction count and platform value\n\nAll outputs saved to 06_outputs/ at 150 DPI.`,
        files: [
          { name: 'paysim_eda.py', note: 'EDA pipeline — volumes, type mix, hourly patterns, distributions' },
        ],
        snippet: `# Daily transaction volume by type (stacked area)
def plot_daily_volume():
    df = q('SELECT * FROM v_daily_by_type ORDER BY tx_day, tx_type')
    pivot = df.pivot(index='tx_day', columns='tx_type',
                     values='tx_count').fillna(0)

    fig, axes = plt.subplots(2, 1, figsize=(14, 8), sharex=True)

    # Volume stacked area
    pivot[cols].plot.area(ax=axes[0], color=colors, alpha=0.85, linewidth=0)
    axes[0].yaxis.set_major_formatter(
        mticker.FuncFormatter(lambda x, _: f'{int(x):,}'))

    # Value stacked area
    pivot_v = df.pivot(index='tx_day', columns='tx_type',
                       values='total_value').fillna(0)
    pivot_v[cols].plot.area(ax=axes[1], color=colors, alpha=0.85, linewidth=0)
    axes[1].yaxis.set_major_formatter(
        mticker.FuncFormatter(lambda x, _: f'$\{x/1e9:.1f\}B'))`,
      },
      {
        id: '04_analysis',
        label: '04_analysis',
        type: 'folder',
        icon: 'python',
        phase: 'Business Performance Analysis',
        summary: 'Merchant analytics, customer tier segmentation, liquidity flow, and weekly KPI tracking — the operational intelligence layer.',
        body: `business_performance.py runs the business analytics pipeline across four modules:\n\n• Top 20 merchants — ranked by total inflow value and transaction volume; dual bar + bubble chart showing inflow vs volume concentration\n• Customer tier segmentation — Whale / High / Mid / Low tiers based on transaction frequency and total spend; donut chart + tier summary table\n• Liquidity flow analysis — net balance movement by account type (customer vs merchant) across the simulation; shows capital accumulation and drawdown patterns\n• Weekly KPIs — week-over-week summary: total volume, total value, avg transaction size, daily active customers, and WoW growth rates\n• Supporting charts: avg transaction size trend by type over 30 days; daily active customer count with 7-day rolling average`,
        files: [
          { name: 'business_performance.py', note: 'Merchant analytics, customer tiers, liquidity flow, weekly KPIs' },
        ],
        snippet: `# Customer tier segmentation: Whale / High / Mid / Low
def plot_customer_tiers():
    df = q('SELECT * FROM v_customer_tiers ORDER BY total_spend DESC')

    tiers = df.groupby('tier').agg(
        customers=('name_orig', 'count'),
        total_spend=('total_spend', 'sum'),
        avg_tx=('tx_count', 'mean')
    ).reindex(['Whale', 'High', 'Mid', 'Low'])

    fig, axes = plt.subplots(1, 2, figsize=(14, 6))
    colors = [TIER_COLORS[t] for t in tiers.index]

    # Donut: share of total platform value by tier
    axes[0].pie(tiers['total_spend'], labels=tiers.index,
                colors=colors, autopct='%1.1f%%',
                wedgeprops={'width': 0.5}, startangle=90)
    axes[0].set_title('Platform Value Share by Customer Tier')`,
      },
      {
        id: '06_outputs',
        label: '06_outputs',
        type: 'folder',
        icon: 'chart',
        phase: 'Visualisations',
        summary: 'All 12 chart outputs from the EDA and business performance pipelines.',
        body: 'Chart outputs generated by paysim_eda.py and business_performance.py. Click any chart to view full size.',
        files: [],
        charts: [
          { file: '01_daily_volume.png',        label: 'Daily Volume',            desc: 'Daily transaction count and value by type — stacked area over 30 days' },
          { file: '02_type_mix.png',             label: 'Type Mix',                desc: 'Volume % vs value % split per transaction type — dual pie chart' },
          { file: '03_hourly_heatmap.png',       label: 'Hourly Heatmap',          desc: 'Average transaction activity by hour of day across the simulation' },
          { file: '04_amount_distribution.png',  label: 'Amount Distribution',     desc: 'Percentile distribution of transaction amounts per type' },
          { file: '05_daily_value.png',          label: 'Daily Value Flow',         desc: 'Net daily inflow vs outflow across the 30-day simulation' },
          { file: '06_cumulative_growth.png',    label: 'Cumulative Growth',        desc: '30-day running total of transaction count and platform value' },
          { file: '07_top_merchants.png',        label: 'Top Merchants',            desc: 'Top 20 merchant accounts by total inflow value and transaction volume' },
          { file: '08_customer_tiers.png',       label: 'Customer Tiers',           desc: 'Whale / High / Mid / Low segmentation by spend — value share donut' },
          { file: '09_liquidity_flow.png',       label: 'Liquidity Flow',           desc: 'Net balance movement by account type over the simulation period' },
          { file: '10_weekly_kpis.png',          label: 'Weekly KPIs',              desc: 'Week-over-week volume, value, avg transaction size, and active users' },
          { file: '11_avg_tx_size.png',          label: 'Avg Transaction Size',     desc: 'Average transaction size trend per type over 30 days' },
          { file: '12_daily_active_customers.png', label: 'Daily Active Customers', desc: 'Daily unique active customer count with 7-day rolling average' },
        ],
      },
      {
        id: '07_findings',
        label: '07_findings',
        type: 'folder',
        icon: 'pdf',
        phase: 'Findings Report',
        summary: 'Compiled PDF report covering transaction analysis, product mix, customer segmentation, merchant performance, liquidity flows, and business recommendations.',
        body: `The final deliverable -- a 10-page structured report covering:\n\n- Project overview, dataset schema, and full tech stack\n- All 15 PostgreSQL analytical views with descriptions\n- Transaction volume analysis -- daily trends, type mix, hourly heatmap\n- Amount distribution and temporal patterns\n- Value flow and 30-day cumulative growth analysis\n- Merchant performance -- top 20 merchants by inflow and volume\n- Customer tier segmentation -- Whale / High / Mid / Low value tiers\n- Platform liquidity analysis -- net CASH_IN vs CASH_OUT flow\n- Weekly KPI summary with supplementary charts\n- 6 key business findings with strategic implications\n- Methodology walkthrough and next steps (fraud detection, forecasting, Power BI)`,
        files: [
          { name: 'paysim_mobile_money_report.pdf', note: '10-page findings and recommendations report', link: '/paysim_mobile_money_report.pdf' },
          { name: 'generate_paysim_report.py', note: 'fpdf2-based PDF generator script' },
        ],
      },
    ],
  },
  {
    id: 'revenue-forecasting',
    tag: 'Python · SQL · Time Series',
    title: 'Revenue Forecasting Model',
    github: 'https://github.com/Rodneyseth/Rodney-Portfolio/tree/main/projects/01_revenue-forecasting',
    desc: 'Time-series revenue forecasting pipeline combining SQL aggregation, Python modelling, and Power BI visualisation to project monthly revenue with confidence intervals.',
    metrics: ['Monthly revenue projected', 'Confidence intervals', 'Automated refresh'],
    accent: 'var(--accent)',
    status: 'In Progress',
    folders: [],
  },
  {
    id: 'apple-retail',
    tag: 'SQL · Python · Time Series · Prophet',
    title: 'Apple Retail Sales Analysis',
    github: 'https://github.com/Rodneyseth/Rodney-Portfolio/tree/main/projects/03_apple-retail',
    desc: 'End-to-end retail analytics across 1,040,200 transactions — category performance, seasonal decomposition, 12-month Prophet forecasting, and warranty claim analytics across 10 product categories and 75 global stores.',
    metrics: ['1,040,200 transactions', '10 product categories', '75 global stores'],
    accent: '#f59e0b',
    status: 'Complete',
    folders: [
      {
        id: '00_demo',
        label: '00_demo',
        type: 'folder',
        icon: 'model',
        phase: 'Interactive Demo',
        summary: 'Select a product category to explore revenue trends, seasonal patterns, top products and warranty rates — all derived from the model outputs.',
        demo: true,
        demoType: 'apple',
        body: '',
        files: [],
      },
      {
        id: '01_data',
        label: '01_data',
        type: 'folder',
        icon: 'data',
        phase: 'Data Ingestion',
        summary: 'Apple Retail Sales dataset — 5 linked CSV tables, 1M+ sales transactions, global store coverage across 50+ countries.',
        body: `The dataset contains five linked tables that together model an Apple retail data warehouse. The sales table is the central fact table with 1,040,200 transaction rows, joined to dimension tables for products, categories, stores, and warranty claims.\n\nSchema overview:\n• sales — 1,040,200 rows: sale_id, sale_date, store_id, product_id, quantity\n• products — product_id, product_name, category_id, price\n• category — category_id, category_name (10 categories: Smartphone, Tablet, Laptop, Audio, Wearable, Desktop, Accessories, Subscription Service, Streaming Device, Smart Speaker)\n• stores — store_id, store_name, country, region (75 stores globally)\n• warranty — claim_id, sale_id, claim_date, repair_status\n\nAll tables use VARCHAR(20) primary keys matching the alphanumeric IDs in the source CSVs (e.g. CAT-1, ST-1, P-1). Loaded into Supabase PostgreSQL (apple_retail schema) via SQLAlchemy in 5,000-row batches.`,
        files: [
          { name: 'sales.csv',    size: '~85 MB', note: '1,040,200 transaction rows — fact table' },
          { name: 'products.csv', size: '~12 KB', note: 'Product catalogue with pricing' },
          { name: 'category.csv', size: '~1 KB',  note: '10 product categories' },
          { name: 'stores.csv',   size: '~28 KB', note: '75 global stores across Americas, Europe & APAC' },
          { name: 'warranty.csv', size: '~8 MB',  note: 'Warranty claims with repair status' },
        ],
      },
      {
        id: '02_sql',
        label: '02_sql',
        type: 'folder',
        icon: 'sql',
        phase: 'Schema, Cleaning & Aggregation',
        summary: 'Schema creation, data cleaning, and 5 analytical views built in Supabase (PostgreSQL) — covering revenue, growth, store performance and warranty.',
        body: `Five SQL scripts handle the full data preparation and aggregation layer loaded into Supabase (PostgreSQL):\n\n01_create_schema.sql — typed schema with primary keys, foreign key constraints, and indexes on sale_date, store_id and product_id for query performance.\n02_load_and_clean.sql — null handling, date format normalisation, price outlier detection, referential integrity checks across all five tables.\n03_category_revenue_views.sql — monthly revenue, transaction count and year-on-year growth rate by product category using LAG window functions.\n04_store_performance_views.sql — store revenue rankings, average basket size, country-level aggregations and store-type comparison.\n05_warranty_analytics_views.sql — claim rate per product and category, repair status distribution, time-to-claim analysis, and warranty cost estimation.`,
        files: [
          { name: '01_create_schema.sql',         note: 'Schema + indexes + constraints' },
          { name: '02_load_and_clean.sql',         note: 'Null handling, type casting, integrity checks' },
          { name: '03_category_revenue_views.sql', note: 'Monthly revenue + YoY growth by category' },
          { name: '04_store_performance_views.sql',note: 'Store rankings, basket size, country aggregates' },
          { name: '05_warranty_analytics_views.sql',note: 'Claim rates, repair status, time-to-claim' },
        ],
        snippet: `-- Monthly revenue by category with YoY growth (Supabase / PostgreSQL)
WITH monthly AS (
  SELECT
    c.category_name,
    DATE_TRUNC('month', s.sale_date)   AS month,
    SUM(s.quantity * p.price)          AS revenue,
    COUNT(DISTINCT s.sale_id)          AS transactions
  FROM sales s
  JOIN products p ON s.product_id  = p.product_id
  JOIN category c ON p.category_id = c.category_id
  GROUP BY 1, 2
)
SELECT *,
  ROUND(
    100.0 * (revenue - LAG(revenue, 12) OVER w)
            / NULLIF(LAG(revenue, 12) OVER w, 0),
  1) AS yoy_growth_pct
FROM monthly
WINDOW w AS (PARTITION BY category_name ORDER BY month)
ORDER BY category_name, month;`,
      },
      {
        id: '03_python',
        label: '03_python',
        type: 'folder',
        icon: 'python',
        phase: 'EDA & Time Series Analysis',
        summary: 'Full exploratory analysis — revenue trends, seasonal decomposition, iPhone launch cycle detection, product lifecycle curves, and cannibalisation analysis.',
        body: `apple_eda.py runs the complete exploratory and time series analysis pipeline:\n\n• Revenue distribution by category, store type and geography (choropleth + bar charts)\n• Monthly revenue trend per category — stacked area chart showing category mix shift over time\n• Time series decomposition using statsmodels seasonal_decompose — trend, seasonality and residual components per category\n• iPhone launch cycle detection — automated identification of annual September/October revenue spikes using changepoint analysis\n• Product lifecycle curves — revenue indexed from each product's launch_date to current, overlaid by category\n• Cannibalisation analysis — how a new iPhone launch affects iPad and Mac sales in the same quarter\n• All chart outputs saved to 06_outputs/`,
        files: [
          { name: 'apple_eda.py',                note: 'Full EDA + time series decomposition pipeline' },
          { name: 'product_lifecycle.py',        note: 'Launch-indexed sales curves per product' },
          { name: 'export_views_to_csv.py',      note: 'Exports Supabase views to CSV for Power BI' },
          { name: 'requirements.txt',            note: 'pandas, statsmodels, matplotlib, seaborn, sqlalchemy' },
        ],
        snippet: `# Seasonal decomposition by product category
from statsmodels.tsa.seasonal import seasonal_decompose
import matplotlib.pyplot as plt

for category in df['category_name'].unique():
    ts = (df[df['category_name'] == category]
          .set_index('month')['revenue']
          .asfreq('MS'))           # monthly start frequency

    result = seasonal_decompose(ts, model='additive', period=12)

    fig, axes = plt.subplots(4, 1, figsize=(14, 10), sharex=True)
    result.observed.plot(ax=axes[0], title=f'{category} — Observed')
    result.trend.plot(ax=axes[1],    title='Trend Component')
    result.seasonal.plot(ax=axes[2], title='Seasonal Component')
    result.resid.plot(ax=axes[3],    title='Residual')

    plt.tight_layout()
    plt.savefig(f'06_outputs/decomp_{category.lower().replace(" ","_")}.png', dpi=150)
    plt.close()`,
      },
      {
        id: '04_forecasting',
        label: '04_forecasting',
        type: 'folder',
        icon: 'chart',
        phase: 'Revenue Forecasting',
        summary: '12-month forward revenue forecast per category using Facebook Prophet — with annual launch-cycle seasonality and Q4 holiday regressors.',
        body: `revenue_forecast.py builds a 12-month forward revenue forecast per product category using Facebook Prophet, tuned for Apple\'s unique demand patterns:\n\n• Annual seasonality to capture iPhone launch cycles (September spikes)\n• Custom Q4 holiday regressor — November/December uplift across all categories\n• Changepoint detection tuned to historical Apple product announcement dates\n• Confidence intervals at 80% and 95% levels\n• Model accuracy benchmarked against held-out final 6 months (MAE, RMSE, MAPE)\n• Output per category: forecast chart PNG + CSV with predicted vs actual + confidence bands`,
        files: [
          { name: 'revenue_forecast.py',   note: 'Prophet forecast pipeline — all categories' },
          { name: 'forecast_evaluation.py',note: 'MAE / RMSE / MAPE on held-out test period' },
        ],
        snippet: `from prophet import Prophet
import pandas as pd

for category in categories:
    df_cat = monthly_revenue[monthly_revenue['category_name'] == category]
    df_p   = df_cat.rename(columns={'month': 'ds', 'revenue': 'y'})

    m = Prophet(
        yearly_seasonality   = True,
        weekly_seasonality   = False,
        changepoint_prior_scale = 0.15,   # moderate flexibility
    )
    # Custom launch-cycle seasonality (Apple's annual product rhythm)
    m.add_seasonality(name='launch_cycle', period=365.25, fourier_order=5)
    m.fit(df_p)

    future   = m.make_future_dataframe(periods=12, freq='MS')
    forecast = m.predict(future)

    fig = m.plot(forecast, figsize=(14, 6))
    fig.savefig(f'06_outputs/forecast_{category.lower().replace(" ","_")}.png', dpi=150)`,
      },
      {
        id: '05_warranty',
        label: '05_warranty',
        type: 'folder',
        icon: 'data',
        phase: 'Warranty Analytics',
        summary: 'Claim rates by product and category, repair status breakdown, time-to-claim analysis, and store-level warranty hotspot identification.',
        body: `warranty_analysis.py analyses the after-sales service data layer:\n\n• Claim rate per product — warranty claims / units sold, ranked highest to lowest\n• Repair status distribution — completed, in-progress, rejected — by category and product line\n• Time-to-claim analysis — days between sale_date and claim_date by category; identifies products with early-failure patterns\n• High-risk products — which specific products exceed their category average claim rate by more than 1 standard deviation\n• Store-level hotspots — stores with disproportionately high warranty rates relative to sales volume\n• Cross-analysis — correlation between high warranty rate and lower repeat-purchase rate (joined back to sales table)\n• Output: warranty dashboard data CSVs + chart PNGs for 06_outputs/`,
        files: [
          { name: 'warranty_analysis.py',    note: 'Full warranty analytics pipeline' },
          { name: 'warranty_dashboard.xlsx', note: 'Excel pivot summary for stakeholders' },
        ],
        snippet: `-- Warranty claim rate by product with category benchmark
SELECT
  p.product_name,
  c.category_name,
  COUNT(DISTINCT s.sale_id)                         AS units_sold,
  COUNT(DISTINCT w.warranty_id)                     AS claims,
  ROUND(100.0 * COUNT(DISTINCT w.warranty_id)
              / NULLIF(COUNT(DISTINCT s.sale_id), 0), 2) AS claim_rate_pct,
  ROUND(AVG(COUNT(DISTINCT w.warranty_id)
              / NULLIF(COUNT(DISTINCT s.sale_id), 0))
        OVER (PARTITION BY c.category_name) * 100, 2)    AS category_avg_pct
FROM sales s
JOIN products p  ON s.product_id  = p.product_id
JOIN category c  ON p.category_id = c.category_id
LEFT JOIN warranty w ON s.sale_id = w.sale_id
GROUP BY p.product_name, c.category_name
ORDER BY claim_rate_pct DESC;`,
      },
      {
        id: '06_outputs',
        label: '06_outputs',
        type: 'folder',
        icon: 'chart',
        phase: 'Visualisations',
        summary: 'All chart outputs from the Python EDA, time series decomposition, forecasting and warranty analysis pipelines.',
        body: 'Chart outputs generated by apple_eda.py, product_lifecycle.py, revenue_forecast.py, and warranty_analysis.py. Click any chart to view full size.',
        files: [],
        charts: [
          { file: '01_revenue_overview.png',         label: 'Revenue Overview',             desc: 'Monthly revenue by category — Jan 2022 to Dec 2023' },
          { file: '02_market_share.png',             label: 'Market Share',                 desc: 'Category revenue share as stacked % area chart' },
          { file: '04_annual_summary.png',           label: 'Annual Summary',               desc: '2022 vs 2023 revenue comparison by category' },
          { file: '05_top_products.png',             label: 'Top Products',                 desc: 'Top-5 products by total revenue across all categories' },
          { file: '07_avg_launch_ramp.png',          label: 'Avg Launch Ramp',              desc: 'Average week-over-week revenue ramp for weeks 1-52 post launch' },
          { file: '08_peak_timing.png',              label: 'Peak Sales Timing',            desc: 'Heatmap of peak revenue month by product' },
          { file: '10_forecast_all_categories.png',  label: 'Forecast — All Categories',   desc: '12-month Prophet forecast overlaid for all 10 categories' },
          { file: '09_forecast_tablet.png',          label: 'Forecast — Tablet',            desc: 'Individual Prophet forecast with 90% CI — Tablet category' },
          { file: '09_forecast_smartphone.png',      label: 'Forecast — Smartphone',        desc: 'Individual Prophet forecast with 90% CI — Smartphone category' },
          { file: '09_forecast_laptop.png',          label: 'Forecast — Laptop',            desc: 'Individual Prophet forecast with 90% CI — Laptop category' },
          { file: '12_repair_status_donut.png',      label: 'Repair Status',                desc: 'Warranty claims by repair outcome — completed / in progress / rejected' },
          { file: '13_claim_rate_by_category.png',   label: 'Claim Rate by Category',       desc: 'Annual warranty claim rate (%) per product category' },
          { file: '14_time_to_claim_bars.png',       label: 'Time to Claim',                desc: 'Avg days from sale to warranty claim by category and status' },
          { file: '15_store_hotspots.png',           label: 'Store Hotspots',               desc: 'Top 20 stores by warranty claim rate with status heatmap' },
          { file: '16_monthly_warranty_trend.png',   label: 'Monthly Warranty Trend',       desc: 'Monthly claim volume by repair status — Jan 2022 to Dec 2023' },
        ],
      },
      {
        id: '07_findings',
        label: '07_findings',
        type: 'folder',
        icon: 'pdf',
        phase: 'Findings Report',
        summary: 'Compiled PDF report covering category performance, seasonal patterns, 12-month forecast, warranty insights and business recommendations.',
        body: `The final deliverable — a 15-page structured report covering:\n\n• Cover page with module overview and dataset stats\n• Project overview, database schema, and full tech stack\n• All 15 PostgreSQL analytical views with descriptions\n• EDA section — revenue overview, market share, annual summary, top products\n• Product lifecycle analysis — launch ramp curves and peak timing\n• 12-month Prophet forecast — all categories overlaid + individual charts\n• Warranty analytics — repair status, claim rates, time-to-claim, store hotspots\n• Methodology walkthrough — 7-step data pipeline with script names\n• Limitations, next steps, and complete output inventory`,
        files: [
          { name: 'apple_retail_report.pdf', note: '15-page analysis report — all modules', link: '/apple_retail_report.pdf' },
        ],
      },
    ],
  },
]
