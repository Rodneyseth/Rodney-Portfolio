-- ============================================================
--  02_clean_data.sql
--  Validate, clean, and populate dimension + fact tables
--  Run AFTER 01_create_tables.sql and loading orders_raw
-- ============================================================

-- ── STEP 1: Validation checks on raw data ────────────────────

-- Check for nulls in critical columns
SELECT
    COUNT(*)                                        AS total_rows,
    COUNT(*) FILTER (WHERE order_id   IS NULL)      AS null_order_id,
    COUNT(*) FILTER (WHERE order_date IS NULL)      AS null_order_date,
    COUNT(*) FILTER (WHERE sales      IS NULL)      AS null_sales,
    COUNT(*) FILTER (WHERE customer_id IS NULL)     AS null_customer_id,
    COUNT(*) FILTER (WHERE product_id  IS NULL)     AS null_product_id
FROM orders_raw;

-- Check for negative sales (data quality flag)
SELECT COUNT(*) AS negative_sales_count
FROM orders_raw
WHERE sales < 0;

-- Check date range
SELECT
    MIN(order_date) AS earliest_order,
    MAX(order_date) AS latest_order
FROM orders_raw;

-- Check for duplicate row_ids
SELECT row_id, COUNT(*) AS cnt
FROM orders_raw
GROUP BY row_id
HAVING COUNT(*) > 1;


-- ── STEP 2: Populate dim_customer ────────────────────────────
INSERT INTO dim_customer (customer_id, customer_name, segment, region, state, city)
SELECT DISTINCT
    customer_id,
    customer_name,
    segment,
    region,
    state,
    city
FROM orders_raw
WHERE customer_id IS NOT NULL
ON CONFLICT (customer_id) DO NOTHING;

SELECT 'dim_customer loaded:' AS msg, COUNT(*) AS rows FROM dim_customer;


-- ── STEP 3: Populate dim_product ─────────────────────────────
INSERT INTO dim_product (product_id, product_name, category, sub_category)
SELECT DISTINCT
    product_id,
    product_name,
    category,
    sub_category
FROM orders_raw
WHERE product_id IS NOT NULL
ON CONFLICT (product_id) DO NOTHING;

SELECT 'dim_product loaded:' AS msg, COUNT(*) AS rows FROM dim_product;


-- ── STEP 4: Populate fact_orders (with date casting) ─────────
INSERT INTO fact_orders (
    row_id, order_id, order_date, ship_date, ship_mode,
    customer_id, product_id, sales, quantity, discount, profit
)
SELECT
    row_id,
    order_id,
    TO_DATE(order_date, 'MM/DD/YYYY'),   -- adjust format if your CSV differs
    TO_DATE(ship_date,  'MM/DD/YYYY'),
    ship_mode,
    customer_id,
    product_id,
    COALESCE(sales,  0),
    COALESCE(quantity, 0),
    COALESCE(discount, 0),
    COALESCE(profit, 0)
FROM orders_raw
WHERE row_id      IS NOT NULL
  AND order_date  IS NOT NULL
  AND customer_id IS NOT NULL
  AND product_id  IS NOT NULL
ON CONFLICT (row_id) DO NOTHING;

SELECT 'fact_orders loaded:' AS msg, COUNT(*) AS rows FROM fact_orders;


-- ── STEP 5: Post-load sanity checks ──────────────────────────

-- Sales totals should match between raw and fact
SELECT
    ROUND(SUM(sales)::NUMERIC, 2) AS fact_total_sales
FROM fact_orders;

SELECT
    ROUND(SUM(sales)::NUMERIC, 2) AS raw_total_sales
FROM orders_raw;

-- Profit margin overall
SELECT
    ROUND(SUM(profit) / NULLIF(SUM(sales), 0) * 100, 2) AS overall_profit_margin_pct
FROM fact_orders;

SELECT 'Data cleaning complete.' AS status;
