-- ============================================================
--  01_create_tables.sql
--  Create the schema for the Superstore revenue forecasting project
--  Database: PostgreSQL 13+
-- ============================================================

-- Drop tables if re-running
DROP TABLE IF EXISTS orders_raw CASCADE;
DROP TABLE IF EXISTS dim_customer CASCADE;
DROP TABLE IF EXISTS dim_product CASCADE;
DROP TABLE IF EXISTS fact_orders CASCADE;

-- ── RAW staging table (matches CSV columns exactly) ──────────
CREATE TABLE orders_raw (
    row_id          INT,
    order_id        VARCHAR(20),
    order_date      VARCHAR(20),    -- loaded as text, cast later
    ship_date       VARCHAR(20),
    ship_mode       VARCHAR(50),
    customer_id     VARCHAR(20),
    customer_name   VARCHAR(100),
    segment         VARCHAR(50),
    country         VARCHAR(50),
    city            VARCHAR(100),
    state           VARCHAR(100),
    postal_code     VARCHAR(20),
    region          VARCHAR(50),
    product_id      VARCHAR(30),
    category        VARCHAR(50),
    sub_category    VARCHAR(50),
    product_name    VARCHAR(255),
    sales           NUMERIC(12,4),
    quantity        INT,
    discount        NUMERIC(5,4),
    profit          NUMERIC(12,4)
);

-- ── DIMENSION: Customer ───────────────────────────────────────
CREATE TABLE dim_customer (
    customer_id     VARCHAR(20) PRIMARY KEY,
    customer_name   VARCHAR(100),
    segment         VARCHAR(50),
    region          VARCHAR(50),
    state           VARCHAR(100),
    city            VARCHAR(100)
);

-- ── DIMENSION: Product ────────────────────────────────────────
CREATE TABLE dim_product (
    product_id      VARCHAR(30) PRIMARY KEY,
    product_name    VARCHAR(255),
    category        VARCHAR(50),
    sub_category    VARCHAR(50)
);

-- ── FACT: Orders ──────────────────────────────────────────────
CREATE TABLE fact_orders (
    row_id          INT PRIMARY KEY,
    order_id        VARCHAR(20),
    order_date      DATE,
    ship_date       DATE,
    ship_mode       VARCHAR(50),
    customer_id     VARCHAR(20) REFERENCES dim_customer(customer_id),
    product_id      VARCHAR(30) REFERENCES dim_product(product_id),
    sales           NUMERIC(12,4),
    quantity        INT,
    discount        NUMERIC(5,4),
    profit          NUMERIC(12,4)
);

-- ── LOAD raw CSV ─────────────────────────────────────────────
-- Run this from psql with your actual file path:
-- \COPY orders_raw FROM '../01_data/superstore_raw.csv' WITH (FORMAT csv, HEADER true);

SELECT 'Tables created successfully.' AS status;
SELECT COUNT(*) AS raw_row_count FROM orders_raw;
