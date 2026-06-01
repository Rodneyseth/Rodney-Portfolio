"""
Exports all churn summary views from telco schema to CSV files
so they can be imported directly into Power BI.

Usage: python export_views_to_csv.py
"""

import os
import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', 'master', '.env'))

DB_URL  = os.getenv("DATABASE_URL")
engine  = create_engine(DB_URL, connect_args={"options": "-csearch_path=telco"})

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', '06_outputs')
os.makedirs(OUTPUT_DIR, exist_ok=True)

VIEWS = [
    'v_churn_by_contract',
    'v_churn_by_internet',
    'v_churn_by_tenure',
    'v_churn_by_payment',
    'v_services_impact',
    'v_churn_by_segment',
]


def export():
    with engine.connect() as conn:
        for view in VIEWS:
            df = pd.read_sql(text(f"SELECT * FROM {view}"), conn)
            path = os.path.join(OUTPUT_DIR, f"{view}.csv")
            df.to_csv(path, index=False)
            print(f"  Saved {len(df)} rows → {view}.csv")
    print("\nAll CSVs saved to 06_outputs/")


if __name__ == '__main__':
    export()
