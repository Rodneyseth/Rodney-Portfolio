export const projects = [
  {
    id: 'telco-churn',
    tag: 'Python · SQL · Machine Learning',
    title: 'Telco Customer Churn Prediction',
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
    id: 'revenue-forecasting',
    tag: 'Python · SQL · Time Series',
    title: 'Revenue Forecasting Model',
    desc: 'Time-series revenue forecasting pipeline combining SQL aggregation, Python modelling, and Power BI visualisation to project monthly revenue with confidence intervals.',
    metrics: ['Monthly revenue projected', 'Confidence intervals', 'Automated refresh'],
    accent: 'var(--accent)',
    status: 'In Progress',
    folders: [],
  },
  {
    id: 'apple-retail',
    tag: 'SQL · Python · Time Series · Power BI',
    title: 'Apple Retail Sales Analysis',
    desc: 'Multi-table retail analytics across 1M+ transactions — product category performance, time series decomposition, 12-month revenue forecasting with Prophet, and warranty claim analytics across 5 product lines.',
    metrics: ['1M+ transactions', '5 product categories', '12-month forecast'],
    accent: '#f59e0b',
    status: 'In Progress',
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
        body: `The dataset contains five linked tables that together model a real Apple retail data warehouse. The sales table is the central fact table with over one million transaction rows, joined to dimension tables for products, categories, stores, and warranty claims.\n\nschema overview:\n• sales — 1,000,000+ rows: sale_id, sale_date, store_id, product_id, quantity\n• products — product_id, product_name, category_id, launch_date, price\n• category — category_id, category_name (iPhone · Mac · iPad · Apple Watch · AirPods · Accessories)\n• stores — store_id, store_name, city, country, store_type\n• warranty — warranty_id, sale_id, claim_date, repair_status\n\nData sourced from Kaggle (amangarg08/apple-retail-sales-dataset). Loaded into Supabase via psql COPY commands after schema creation.`,
        files: [
          { name: 'sales.csv',    size: '~85 MB', note: '1M+ transaction rows — fact table' },
          { name: 'products.csv', size: '~12 KB', note: 'Product catalogue with launch dates and pricing' },
          { name: 'category.csv', size: '~1 KB',  note: '6 product categories' },
          { name: 'stores.csv',   size: '~28 KB', note: 'Global store register — city, country, type' },
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
        body: 'Chart outputs generated by apple_eda.py, revenue_forecast.py and warranty_analysis.py. Charts will appear here once the Python analysis pipeline is run against the downloaded dataset.',
        files: [],
        charts: [],
      },
      {
        id: '07_findings',
        label: '07_findings',
        type: 'folder',
        icon: 'pdf',
        phase: 'Findings Report',
        summary: 'Compiled PDF report covering category performance, seasonal patterns, 12-month forecast, warranty insights and business recommendations.',
        body: `The final deliverable — a structured findings report covering:\n\n• Executive summary with the business context and key findings\n• Data overview — 5 tables, schema, quality assessment, row counts\n• Category performance analysis — revenue trends, growth rates, market mix shift\n• Seasonal patterns — iPhone launch cycles, Q4 holiday effects by category\n• Store performance — top regions, store-type comparison, geographic spread\n• Warranty insights — high-risk products, claim rate benchmarks, cost estimates\n• 12-month revenue forecast per category with confidence intervals\n• Business recommendations — inventory planning, warranty risk mitigation, product strategy`,
        files: [
          { name: 'apple_retail_findings_report.pdf', note: 'Full analysis & recommendations — pending Python run' },
        ],
      },
    ],
  },
]
