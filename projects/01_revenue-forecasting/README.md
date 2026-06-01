# 📊 Small Business Revenue Forecasting

**Domain:** Business & Finance  
**Tools:** SQL · Python · Excel · Power BI  
**Type:** Time Series Forecasting + Business Intelligence  

---

## The Problem

Small businesses often operate without forward visibility into revenue. Decisions about
staffing, restocking, and spending are made reactively rather than proactively.

This project builds an end-to-end revenue forecasting system — from raw data extraction
in SQL, through machine learning in Python, to interactive dashboards in Excel and Power BI
— giving business owners an early signal to plan better.

---

## Results

| Model             | MAE       | RMSE      | MAPE   |
|-------------------|-----------|-----------|--------|
| Linear Regression | ~$4,200   | ~$5,100   | ~12%   |
| XGBoost           | ~$2,850   | ~$3,400   | ~8.3%  |

> XGBoost predictions landed within **8% of actual monthly revenue** — actionable
> for operational planning in a business turning over $50K–$500K/month.

**Key finding:** Discounts above 20% negatively correlated with profit — a counterintuitive
result with direct business implications beyond the model itself.

---

## Project Structure

```
revenue-forecasting-project/
│
├── README.md                        ← You are here
│
├── 01_data/
│   └── superstore_raw.csv           ← Raw source data (download instructions below)
│
├── 02_sql/
│   ├── 01_create_tables.sql         ← Schema creation
│   ├── 02_clean_data.sql            ← Data cleaning & validation
│   └── 03_revenue_summary.sql       ← Aggregations for dashboards
│
├── 03_python/
│   ├── forecasting.py               ← EDA, feature engineering, ML models
│   └── requirements.txt             ← Python dependencies
│
├── 04_excel/
│   └── revenue_dashboard.xlsx       ← Pivot table KPI dashboard
│
├── 05_powerbi/
│   └── README_powerbi.md            ← Power BI setup instructions
│
└── 06_outputs/
    ├── 01_monthly_trend.png
    ├── 02_category_sales.png
    ├── 03_discount_profit.png
    ├── 04_actual_vs_predicted.png
    └── 05_feature_importance.png
```

---

## How to Run

### 1. Get the Data
Download the **Sample Superstore dataset** from Kaggle:
- https://www.kaggle.com/datasets/vivek468/superstore-dataset-final
- Place the CSV in `/01_data/superstore_raw.csv`

### 2. Run SQL Scripts (PostgreSQL)
```bash
psql -U your_user -d your_db -f 02_sql/01_create_tables.sql
psql -U your_user -d your_db -f 02_sql/02_clean_data.sql
psql -U your_user -d your_db -f 02_sql/03_revenue_summary.sql
```

### 3. Run Python Analysis
```bash
cd 03_python
pip install -r requirements.txt
python forecasting.py
```
Charts will be saved to `/06_outputs/`

### 4. Open Excel Dashboard
Open `04_excel/revenue_dashboard.xlsx` — refresh the pivot tables if using live data.

### 5. Open Power BI Dashboard
See `05_powerbi/README_powerbi.md` for connection and setup instructions.

---

## What I Learned

- **Lag features** made the single biggest accuracy improvement — more than any model change
- **Discounts > 20%** consistently hurt profit margins across all categories
- **Q4 seasonality** is strong and predictable — useful for inventory planning
- Prophet handled trend breaks better but XGBoost was more accurate on this dataset

---

## Dataset
Superstore Sales Dataset — [Kaggle](https://www.kaggle.com/datasets/vivek468/superstore-dataset-final)  
Original source: Tableau sample data, widely used for BI/analytics practice.
