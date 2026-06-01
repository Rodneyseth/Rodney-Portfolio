-- ============================================================
-- 02_load_and_clean.sql
-- Load CSVs into Supabase + data quality checks + cleaning
-- ============================================================
-- NOTE: Replace <PATH> with the absolute path to your 01_data/ folder
-- Run each COPY block one at a time and check the row count output.
-- ============================================================

SET search_path TO apple_retail;

-- ── Load dimension tables first ───────────────────────────

\COPY category FROM '<PATH>/01_data/category.csv' WITH (FORMAT csv, HEADER true);
SELECT COUNT(*) AS category_rows FROM category;

\COPY stores   FROM '<PATH>/01_data/stores.csv'   WITH (FORMAT csv, HEADER true);
SELECT COUNT(*) AS store_rows FROM stores;

\COPY products FROM '<PATH>/01_data/products.csv' WITH (FORMAT csv, HEADER true);
SELECT COUNT(*) AS product_rows FROM products;

-- ── Load fact table ───────────────────────────────────────

\COPY sales    FROM '<PATH>/01_data/sales.csv'    WITH (FORMAT csv, HEADER true);
SELECT COUNT(*) AS sales_rows FROM sales;

-- ── Load warranty ─────────────────────────────────────────

\COPY warranty FROM '<PATH>/01_data/warranty.csv' WITH (FORMAT csv, HEADER true);
SELECT COUNT(*) AS warranty_rows FROM warranty;

-- ── Data quality checks ───────────────────────────────────

-- Null checks across all tables
SELECT 'sales - null sale_date'   AS check_name, COUNT(*) AS count FROM sales    WHERE sale_date  IS NULL
UNION ALL
SELECT 'sales - null store_id',                  COUNT(*) FROM sales    WHERE store_id   IS NULL
UNION ALL
SELECT 'sales - null product_id',                COUNT(*) FROM sales    WHERE product_id IS NULL
UNION ALL
SELECT 'sales - null quantity',                  COUNT(*) FROM sales    WHERE quantity   IS NULL
UNION ALL
SELECT 'products - null price',                  COUNT(*) FROM products WHERE price      IS NULL
UNION ALL
SELECT 'products - null launch_date',            COUNT(*) FROM products WHERE launch_date IS NULL
UNION ALL
SELECT 'warranty - null claim_date',             COUNT(*) FROM warranty WHERE claim_date IS NULL;

-- Date range check
SELECT
    MIN(sale_date) AS earliest_sale,
    MAX(sale_date) AS latest_sale,
    MAX(sale_date) - MIN(sale_date) AS date_span_days
FROM sales;

-- Orphan check: sales with no matching store
SELECT COUNT(*) AS orphan_store_sales
FROM sales s
LEFT JOIN stores st ON s.store_id = st.store_id
WHERE st.store_id IS NULL;

-- Orphan check: sales with no matching product
SELECT COUNT(*) AS orphan_product_sales
FROM sales s
LEFT JOIN products p ON s.product_id = p.product_id
WHERE p.product_id IS NULL;

-- Price sanity check
SELECT
    MIN(price)  AS min_price,
    MAX(price)  AS max_price,
    AVG(price)  AS avg_price,
    COUNT(*)    AS products_with_price
FROM products
WHERE price IS NOT NULL;

-- ── Cleaning: fix any issues found above ──────────────────

-- Remove sales rows with no valid store (if any orphans found)
-- DELETE FROM sales WHERE store_id NOT IN (SELECT store_id FROM stores);

-- Remove sales rows with no valid product (if any orphans found)
-- DELETE FROM sales WHERE product_id NOT IN (SELECT product_id FROM products);

-- Standardise repair_status casing
UPDATE warranty
SET repair_status = INITCAP(TRIM(repair_status))
WHERE repair_status IS NOT NULL;
