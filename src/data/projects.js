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
]
