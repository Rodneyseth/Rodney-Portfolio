# 📉 Telco Customer Churn Prediction

**Domain:** Telecommunications  
**Tools:** SQL · Python · Excel · Power BI  
**Type:** Binary Classification (Churn = Yes / No)  

---

## The Problem

A telecom company was losing customers with no early warning system in place.
Acquiring a new customer costs 5–7x more than retaining an existing one, making
churn prediction one of the highest-ROI analytics use cases in the industry.

I built a machine learning model to flag customers likely to churn within the next
30 days — with enough lead time for the retention team to intervene with targeted offers.

---

## Results

| Model               | AUC    | F1 Score | Precision | Recall  |
|---------------------|--------|----------|-----------|---------|
| Logistic Regression | 0.831  | 0.78     | 0.76      | 0.80    |
| Random Forest       | 0.862  | 0.81     | 0.80      | 0.82    |
| XGBoost             | 0.891  | 0.84     | 0.83      | 0.85    |

> XGBoost correctly identified **85% of churners** before they left.
> At 200 KES retention offer cost and 2,000 KES average customer lifetime value,
> the model saves an estimated **KES 340,000 per month** for a 5,000-customer base.

**Top churn drivers:** Month-to-month contracts, high monthly charges,
no tech support subscription, fibre optic internet with service issues.

---

## Project Structure

```
02_telco-churn/
│
├── README.md
├── 01_data/              ← Drop telco_churn.csv here (Kaggle link below)
├── 02_sql/
│   ├── 01_create_tables.sql
│   ├── 02_clean_data.sql
│   └── 03_churn_summary.sql
├── 03_python/
│   ├── churn_analysis.py
│   └── requirements.txt
├── 04_excel/
│   └── churn_dashboard.xlsx
├── 05_powerbi/
│   └── README_powerbi.md
└── 06_outputs/
    ├── 01_target_distribution.png
    ├── 02_correlation_matrix.png
    ├── 03_churn_by_contract.png
    ├── 04_roc_curves.png
    ├── 05_confusion_matrix.png
    ├── 06_feature_importance.png
    └── model_summary.csv
```

---

## How to Run

### 1. Get the Data
Download the **IBM Telco Customer Churn** dataset from Kaggle:
- https://www.kaggle.com/datasets/blastchar/telco-customer-churn
- Place CSV in `01_data/telco_churn.csv`

### 2. Run SQL Scripts
```bash
psql -U your_user -d your_db -f 02_sql/01_create_tables.sql
psql -U your_user -d your_db -f 02_sql/02_clean_data.sql
psql -U your_user -d your_db -f 02_sql/03_churn_summary.sql
```

### 3. Run Python Analysis
```bash
cd 03_python
pip install -r requirements.txt
python churn_analysis.py
```

### 4. Open Dashboards
- Excel: `04_excel/churn_dashboard.xlsx`
- Power BI: follow `05_powerbi/README_powerbi.md`

---

## What I Learned

- **Contract type** was the single strongest churn predictor — month-to-month
  customers churned at 3x the rate of annual contract customers
- **Tenure** matters enormously: customers who survive past 12 months are far
  less likely to ever churn — early retention efforts have the highest ROI
- Class imbalance (only ~26% churners) required careful handling —
  `scale_pos_weight` in XGBoost improved recall significantly
- SHAP values revealed that high charges alone don't predict churn —
  it's high charges *combined with* no value-added services

---

## Dataset
IBM Telco Customer Churn — [Kaggle](https://www.kaggle.com/datasets/blastchar/telco-customer-churn)  
7,043 customers · 21 features · Binary target: Churn (Yes/No)
