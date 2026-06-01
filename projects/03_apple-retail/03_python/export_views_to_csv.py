"""
export_views_to_csv.py
Pulls every analytical view from Supabase and writes CSVs to ../06_outputs/csv/
Used as a lightweight alternative to the psqlODBC Power BI connector,
or as a backup when ODBC is unavailable.
"""

import os
import pandas as pd
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", "master", ".env"))

DB_URL  = os.getenv("DATABASE_URL")
engine  = create_engine(DB_URL)

CSV_DIR = os.path.join(os.path.dirname(__file__), "..", "06_outputs", "csv")
os.makedirs(CSV_DIR, exist_ok=True)

VIEWS = [
    "v_category_monthly_revenue",
    "v_category_annual_summary",
    "v_category_market_mix",
    "v_top_products_by_category",
    "v_store_monthly_revenue",
    "v_store_annual_summary",
    "v_country_revenue_summary",
    "v_store_type_performance",
    "v_store_category_mix",
    "v_warranty_claim_rate_by_product",
    "v_warranty_claim_rate_by_category",
    "v_repair_status_distribution",
    "v_time_to_claim_analysis",
    "v_store_warranty_hotspots",
    "v_warranty_monthly_trend",
]


def export_view(view_name: str) -> None:
    with engine.connect() as conn:
        conn.execute(text("SET search_path TO apple_retail"))
        df = pd.read_sql(text(f"SELECT * FROM {view_name}"), conn)
    path = os.path.join(CSV_DIR, f"{view_name}.csv")
    df.to_csv(path, index=False)
    print(f"  {view_name}: {len(df):,} rows → {path}")


if __name__ == "__main__":
    print(f"Exporting {len(VIEWS)} views to {CSV_DIR}\n")
    for v in VIEWS:
        try:
            export_view(v)
        except Exception as exc:
            print(f"  ERROR on {v}: {exc}")
    print("\nExport complete.")
