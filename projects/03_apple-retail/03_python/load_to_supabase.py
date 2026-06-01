"""
load_to_supabase.py
Loads all 5 Apple Retail CSVs into the apple_retail schema in Supabase.
Run after 01_create_schema.sql (or the schema setup script) has been executed.

Usage: python load_to_supabase.py
"""

import os
import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", "master", ".env"))

engine   = create_engine(os.getenv("DATABASE_URL"))
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "01_data")


def conn_schema():
    c = engine.connect()
    c.execute(text("SET search_path TO apple_retail"))
    return c


# ── 1. Category ───────────────────────────────────────────
def load_category():
    df = pd.read_csv(os.path.join(DATA_DIR, "category.csv"))
    df.columns = ["category_id", "category_name"]
    with engine.begin() as conn:
        conn.execute(text("SET search_path TO apple_retail"))
        df.to_sql("category", conn, schema="apple_retail", if_exists="append", index=False)
    print(f"  category: {len(df)} rows")


# ── 2. Stores ─────────────────────────────────────────────
def load_stores():
    df = pd.read_csv(os.path.join(DATA_DIR, "stores.csv"))
    df.columns = ["store_id", "store_name", "city", "country"]
    df["store_type"] = None
    with engine.begin() as conn:
        conn.execute(text("SET search_path TO apple_retail"))
        df.to_sql("stores", conn, schema="apple_retail", if_exists="append", index=False)
    print(f"  stores: {len(df)} rows")


# ── 3. Products ───────────────────────────────────────────
def load_products():
    df = pd.read_csv(os.path.join(DATA_DIR, "products.csv"))
    df.columns = ["product_id", "product_name", "category_id", "launch_date", "price"]
    df["launch_date"] = pd.to_datetime(df["launch_date"], dayfirst=False, errors="coerce")
    with engine.begin() as conn:
        conn.execute(text("SET search_path TO apple_retail"))
        df.to_sql("products", conn, schema="apple_retail", if_exists="append", index=False)
    print(f"  products: {len(df)} rows")


# ── 4. Sales (1M rows — chunked) ──────────────────────────
def load_sales():
    print("  sales: reading CSV...")
    df = pd.read_csv(os.path.join(DATA_DIR, "sales.csv"))
    df.columns = ["sale_id", "sale_date", "store_id", "product_id", "quantity"]
    df["sale_date"] = pd.to_datetime(df["sale_date"], dayfirst=True, errors="coerce")

    total = len(df)
    chunk = 5_000
    print(f"  sales: {total:,} rows — loading in chunks of {chunk:,}...")

    for i in range(0, total, chunk):
        batch = df.iloc[i:i + chunk]
        with engine.begin() as conn:
            conn.execute(text("SET search_path TO apple_retail"))
            batch.to_sql("sales", conn, schema="apple_retail", if_exists="append", index=False, method="multi")
        done = min(i + chunk, total)
        print(f"    {done:,} / {total:,}  ({done * 100 // total}%)")

    print(f"  sales: done — {total:,} rows loaded")


# ── 5. Warranty ───────────────────────────────────────────
def load_warranty():
    df = pd.read_csv(os.path.join(DATA_DIR, "warranty.csv"))
    df.columns = ["claim_id", "claim_date", "sale_id", "repair_status"]
    df["claim_date"] = pd.to_datetime(df["claim_date"], errors="coerce")
    df["repair_status"] = df["repair_status"].str.strip().str.title()
    with engine.begin() as conn:
        conn.execute(text("SET search_path TO apple_retail"))
        df.to_sql("warranty", conn, schema="apple_retail", if_exists="append", index=False)
    print(f"  warranty: {len(df)} rows")


if __name__ == "__main__":
    print("Loading Apple Retail data into apple_retail schema...\n")
    load_category()
    load_stores()
    load_products()
    load_sales()
    load_warranty()
    print("\nAll tables loaded.")
