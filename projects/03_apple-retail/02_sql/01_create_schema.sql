-- ============================================================
-- 01_create_schema.sql
-- Apple Retail Sales — Supabase (PostgreSQL) schema
-- Run this first, then load data via 03_python/load_to_supabase.py
-- ============================================================

CREATE SCHEMA IF NOT EXISTS apple_retail;
SET search_path TO apple_retail;

-- Drop tables if re-running (safe order: dependents first)
DROP TABLE IF EXISTS warranty  CASCADE;
DROP TABLE IF EXISTS sales     CASCADE;
DROP TABLE IF EXISTS products  CASCADE;
DROP TABLE IF EXISTS category  CASCADE;
DROP TABLE IF EXISTS stores    CASCADE;

-- ── Category ──────────────────────────────────────────────
CREATE TABLE category (
    category_id   VARCHAR(20)  PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL
);

-- ── Stores ────────────────────────────────────────────────
CREATE TABLE stores (
    store_id    VARCHAR(20)  PRIMARY KEY,
    store_name  VARCHAR(200) NOT NULL,
    city        VARCHAR(100),
    country     VARCHAR(100),
    store_type  VARCHAR(50)           -- populated manually if known
);

-- ── Products ──────────────────────────────────────────────
CREATE TABLE products (
    product_id    VARCHAR(20)   PRIMARY KEY,
    product_name  VARCHAR(200)  NOT NULL,
    category_id   VARCHAR(20)   REFERENCES category(category_id),
    launch_date   DATE,
    price         NUMERIC(10,2)
);

-- ── Sales (fact table — 1M+ rows) ─────────────────────────
CREATE TABLE sales (
    sale_id     VARCHAR(20) PRIMARY KEY,
    sale_date   DATE        NOT NULL,
    store_id    VARCHAR(20) REFERENCES stores(store_id),
    product_id  VARCHAR(20) REFERENCES products(product_id),
    quantity    INT         NOT NULL CHECK (quantity > 0)
);

-- ── Warranty ──────────────────────────────────────────────
CREATE TABLE warranty (
    claim_id      VARCHAR(20) PRIMARY KEY,
    sale_id       VARCHAR(20) REFERENCES sales(sale_id),
    claim_date    DATE,
    repair_status VARCHAR(50)  -- Completed, In Progress, Rejected
);

-- ── Indexes for query performance ─────────────────────────
CREATE INDEX idx_sales_date       ON sales(sale_date);
CREATE INDEX idx_sales_store      ON sales(store_id);
CREATE INDEX idx_sales_product    ON sales(product_id);
CREATE INDEX idx_products_cat     ON products(category_id);
CREATE INDEX idx_warranty_sale    ON warranty(sale_id);
CREATE INDEX idx_warranty_status  ON warranty(repair_status);
