# 04 · PaySim Mobile Money — Business Performance Analytics

End-to-end analytics pipeline on the PaySim synthetic mobile money dataset
(~6.3M transactions, 30-day simulation modelled on M-Pesa / Safaricom).

## Project goal
Analyse the business performance of a mobile money platform — transaction volumes,
value flows, product mix, customer behaviour, merchant revenue, and operational
KPIs — using SQL views + Python chart pipelines.

## Dataset
Source: Kaggle — ealaxi/paysim1  
File:   PS_20174392719_1491204439457_log.csv  
Rows:   ~6,362,620 transactions  
Cols:   11

| Column          | Description                                      |
|-----------------|--------------------------------------------------|
| step            | Hour of simulation (1–743, 30 days)              |
| type            | CASH_IN, CASH_OUT, DEBIT, PAYMENT, TRANSFER      |
| amount          | Transaction value (USD equivalent)               |
| nameOrig        | Originating account (C = customer, M = merchant) |
| oldbalanceOrg   | Sender balance before transaction                |
| newbalanceOrig  | Sender balance after transaction                 |
| nameDest        | Destination account                              |
| oldbalanceDest  | Receiver balance before transaction              |
| newbalanceDest  | Receiver balance after transaction               |
| isFraud         | Ground-truth fraud label (0/1)                   |
| isFlaggedFraud  | System-flagged fraud (0/1)                       |

## Folder structure
```
01_data/          Raw CSV
02_sql/           Schema creation + 15 analytical views (paysim schema, Supabase)
03_python/        EDA — transaction volumes, type mix, value flows, customer tiers
04_analysis/      Business performance — product revenue, merchant analytics, KPIs
05_forecasting/   Hourly / daily transaction volume forecasting (Prophet)
06_outputs/       Chart PNGs + CSV exports
07_report/        PDF explainer generator
08_logs/          Pipeline run logs
```

## Analytical modules
1. **Transaction overview**   — volume & value by type, daily trends, hourly peaks
2. **Product mix**            — PAYMENT vs TRANSFER vs CASH_OUT revenue split
3. **Customer segmentation**  — high/mid/low value tiers by transaction frequency & spend
4. **Merchant performance**   — top merchant accounts by inflow value and volume
5. **Balance flow**           — net liquidity movement, average balance by account type
6. **Forecasting**            — daily transaction volume forecast (Prophet, 7-day horizon)

## Setup
```
cd 04_paysim-mobile-money
pip install pandas numpy matplotlib seaborn sqlalchemy psycopg2-binary python-dotenv prophet pillow fpdf2
```
Database credentials: ../../master/.env  (DATABASE_URL, SUPABASE_URL, SUPABASE_KEY)
Schema: paysim (separate from telco and apple_retail schemas on same Supabase project)
