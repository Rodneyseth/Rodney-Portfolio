# Data Analytics Projects — Rodney Seth

End-to-end data analytics projects covering SQL, Python, machine learning, and time series analysis.
All projects share a single Supabase PostgreSQL instance with per-project schemas.

## Projects

| # | Project | Stack | Status |
|---|---------|-------|--------|
| 01 | [Revenue Forecasting](./01_revenue-forecasting/) | Python · SQL · Time Series | In Progress |
| 02 | [Telco Customer Churn Prediction](./02_telco-churn/) | Python · SQL · XGBoost · SHAP | Complete |
| 03 | [Apple Retail Sales Analysis](./03_apple-retail/) | Python · SQL · Prophet | Complete |
| 04 | [PaySim Mobile Money Analytics](./04_paysim-mobile-money/) | Python · SQL · Business Analytics | Complete |

## Setup

All projects connect to a shared Supabase PostgreSQL instance.
Each project loads credentials from `master/.env` (not committed — create locally from the template below).

### 1. Create `master/.env`

```
master/
  .env          <-- create this file (gitignored)
```

```env
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_KEY=<your-anon-key>
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
DIRECT_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres
```

Get these values from: **Supabase Dashboard > Project Settings > API / Database**.

### 2. Install dependencies

Each project has its own `requirements.txt` inside `03_python/`:

```bash
pip install -r projects/02_telco-churn/03_python/requirements.txt
```

### 3. Run a project

```bash
# Example: telco churn analysis
cd projects/02_telco-churn/03_python
python load_to_supabase.py     # load data into Supabase
python churn_analysis.py       # run EDA + ML pipeline
```

## Large data files (not committed)

Some raw data files are excluded from this repo due to size:

| File | Size | Where to get it |
|------|------|-----------------|
| `04_paysim-mobile-money/01_data/PS_...log.csv` | ~470 MB | [Kaggle — ealaxi/paysim1](https://www.kaggle.com/datasets/ealaxi/paysim1) |
| `03_apple-retail/01_data/sales.csv` | ~85 MB | Apple Retail Sales dataset (Kaggle) |
| `03_apple-retail/01_data/warranty.csv` | ~8 MB | Same as above |

All other data files (small dimension tables, output CSVs) are included.

## Schema map

Each project uses a dedicated PostgreSQL schema on the same Supabase project:

| Project | Schema |
|---------|--------|
| 02_telco-churn | `telco` / `public` |
| 03_apple-retail | `apple_retail` |
| 04_paysim-mobile-money | `paysim` |
