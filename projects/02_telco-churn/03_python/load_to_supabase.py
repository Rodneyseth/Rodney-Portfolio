"""
Loads the Telco CSV into telco.raw_telco in Supabase via direct PostgreSQL.
Run this after 01_create_tables.sql has been executed.

Usage: python load_to_supabase.py
"""

import csv
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', 'master', '.env'))

DB_URL   = os.getenv("DATABASE_URL")
engine   = create_engine(DB_URL, connect_args={"options": "-csearch_path=telco"})

CSV_PATH   = os.path.join(os.path.dirname(__file__), '..', '01_data', 'WA_Fn-UseC_-Telco-Customer-Churn.csv')
BATCH_SIZE = 500


def load_csv():
    rows = []
    with open(CSV_PATH, newline='', encoding='utf-8') as f:
        for row in csv.DictReader(f):
            rows.append({
                'customerid':       row['customerID'],
                'gender':           row['gender'],
                'seniorcitizen':    int(row['SeniorCitizen']),
                'partner':          row['Partner'],
                'dependents':       row['Dependents'],
                'tenure':           int(row['tenure']),
                'phoneservice':     row['PhoneService'],
                'multiplelines':    row['MultipleLines'],
                'internetservice':  row['InternetService'],
                'onlinesecurity':   row['OnlineSecurity'],
                'onlinebackup':     row['OnlineBackup'],
                'deviceprotection': row['DeviceProtection'],
                'techsupport':      row['TechSupport'],
                'streamingtv':      row['StreamingTV'],
                'streamingmovies':  row['StreamingMovies'],
                'contract':         row['Contract'],
                'paperlessbilling': row['PaperlessBilling'],
                'paymentmethod':    row['PaymentMethod'],
                'monthlycharges':   float(row['MonthlyCharges']),
                'totalcharges':     row['TotalCharges'].strip() or None,
                'churn':            row['Churn'],
            })

    total = len(rows)
    print(f"Uploading {total} rows to telco.raw_telco in batches of {BATCH_SIZE}...")

    with engine.begin() as conn:
        conn.execute(text("SET search_path TO telco"))
        for i in range(0, total, BATCH_SIZE):
            batch = rows[i:i + BATCH_SIZE]
            conn.execute(
                text("""
                    INSERT INTO raw_telco (
                        customerid, gender, seniorcitizen, partner, dependents,
                        tenure, phoneservice, multiplelines, internetservice,
                        onlinesecurity, onlinebackup, deviceprotection, techsupport,
                        streamingtv, streamingmovies, contract, paperlessbilling,
                        paymentmethod, monthlycharges, totalcharges, churn
                    ) VALUES (
                        :customerid, :gender, :seniorcitizen, :partner, :dependents,
                        :tenure, :phoneservice, :multiplelines, :internetservice,
                        :onlinesecurity, :onlinebackup, :deviceprotection, :techsupport,
                        :streamingtv, :streamingmovies, :contract, :paperlessbilling,
                        :paymentmethod, :monthlycharges, :totalcharges, :churn
                    )
                """),
                batch,
            )
            print(f"  Inserted rows {i + 1}–{min(i + BATCH_SIZE, total)}")

    print(f"Done! {total} rows loaded into telco.raw_telco.")


if __name__ == '__main__':
    load_csv()
