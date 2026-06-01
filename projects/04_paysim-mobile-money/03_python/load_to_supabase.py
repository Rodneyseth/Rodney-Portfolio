"""
load_to_supabase.py
Loads 2M PaySim rows into paysim.transactions on Supabase.
Samples evenly across all 30 simulation days so every day is represented.
Uses psycopg2 autocommit + read-write to bypass pooler routing issues.
"""

import os
import io
import time
import psycopg2
import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', 'master', '.env'))

DB_URL = os.getenv('DATABASE_URL')
CSV    = os.path.join(os.path.dirname(__file__), '..', '01_data',
                      'PS_20174392719_1491204439457_log.csv')

TARGET_ROWS = 2_000_000
BATCH_SIZE  = 10_000

COL_MAP = {
    'type':           'tx_type',
    'nameOrig':       'name_orig',
    'oldbalanceOrg':  'old_bal_orig',
    'newbalanceOrig': 'new_bal_orig',
    'nameDest':       'name_dest',
    'oldbalanceDest': 'old_bal_dest',
    'newbalanceDest': 'new_bal_dest',
    'isFraud':        'is_fraud',
    'isFlaggedFraud': 'is_flagged',
}

FINAL_COLS = [
    'step', 'tx_day', 'tx_week', 'tx_hour', 'tx_dow',
    'tx_type', 'amount',
    'name_orig', 'orig_type', 'old_bal_orig', 'new_bal_orig',
    'name_dest', 'dest_type', 'old_bal_dest', 'new_bal_dest',
    'is_fraud', 'is_flagged',
]


def add_time_cols(df: pd.DataFrame) -> pd.DataFrame:
    df['tx_day']    = ((df['step'] - 1) // 24 + 1).astype('int16')
    df['tx_week']   = ((df['step'] - 1) // 168 + 1).astype('int16')
    df['tx_hour']   = ((df['step'] - 1) % 24).astype('int16')
    df['tx_dow']    = (((df['step'] - 1) // 24) % 7).astype('int16')
    df['orig_type'] = df['nameOrig'].str[0]
    df['dest_type'] = df['nameDest'].str[0]
    return df


def get_conn():
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute('SET SESSION CHARACTERISTICS AS TRANSACTION READ WRITE')
    cur.execute('SET search_path TO paysim')
    return conn, cur


def insert_batch(cur, df: pd.DataFrame):
    buf = io.StringIO()
    df.to_csv(buf, index=False, header=False)
    buf.seek(0)
    cur.copy_expert(
        "COPY paysim.transactions ("
        "step,tx_day,tx_week,tx_hour,tx_dow,tx_type,amount,"
        "name_orig,orig_type,old_bal_orig,new_bal_orig,"
        "name_dest,dest_type,old_bal_dest,new_bal_dest,"
        "is_fraud,is_flagged"
        ") FROM STDIN WITH CSV",
        buf,
    )


def create_schema():
    sql_path = os.path.join(os.path.dirname(__file__), '..', '02_sql', '01_create_schema.sql')
    with open(sql_path) as f:
        sql = f.read()
    conn, cur = get_conn()
    cur.execute(sql)
    conn.close()
    print('Schema created.')


def sample_2m() -> pd.DataFrame:
    print(f'Reading CSV and sampling {TARGET_ROWS:,} rows spread across all 30 days...')
    total_rows = 6_362_620
    sample_frac = TARGET_ROWS / total_rows

    chunks = []
    for chunk in pd.read_csv(CSV, chunksize=200_000):
        sampled = chunk.sample(frac=sample_frac, random_state=42)
        chunks.append(sampled)

    df = pd.concat(chunks, ignore_index=True)
    df = add_time_cols(df)
    df = df.rename(columns=COL_MAP)
    df = df[FINAL_COLS]
    print(f'Sampled {len(df):,} rows covering days {df["tx_day"].min()}-{df["tx_day"].max()}')
    return df


def load(df: pd.DataFrame):
    total   = len(df)
    loaded  = 0
    t0      = time.time()
    conn, cur = get_conn()

    for start in range(0, total, BATCH_SIZE):
        batch = df.iloc[start:start + BATCH_SIZE]
        try:
            insert_batch(cur, batch)
        except Exception as e:
            print(f'  Batch error at row {start}: {e}. Reconnecting...')
            conn.close()
            conn, cur = get_conn()
            insert_batch(cur, batch)

        loaded += len(batch)
        elapsed = time.time() - t0
        rate    = loaded / elapsed if elapsed > 0 else 0
        eta     = (total - loaded) / rate if rate > 0 else 0
        print(f'  {loaded:>9,} / {total:,} ({loaded/total*100:5.1f}%) '
              f'| {rate:,.0f} rows/s | ETA {eta/60:.1f} min', end='\r')

    conn.close()
    print(f'\nDone. {loaded:,} rows in {(time.time()-t0)/60:.1f} minutes.')


def create_views():
    sql_path = os.path.join(os.path.dirname(__file__), '..', '02_sql', '02_analytical_views.sql')
    with open(sql_path) as f:
        sql = f.read()
    conn, cur = get_conn()
    cur.execute(sql)
    conn.close()
    print('Analytical views created.')


if __name__ == '__main__':
    print('Creating schema...')
    create_schema()

    df = sample_2m()

    print('Loading to Supabase via COPY...')
    load(df)

    print('Creating analytical views...')
    create_views()

    print('\nAll done.')
