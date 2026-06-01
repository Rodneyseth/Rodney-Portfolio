-- ============================================================
--  03_revenue_summary.sql
--  Aggregation queries that feed the Excel & Power BI dashboards
--  Run AFTER 02_clean_data.sql
-- ============================================================

-- ── VIEW 1: Monthly Revenue Summary ──────────────────────────
-- Used as the base feed for the forecasting model and trend charts

CREATE OR REPLACE VIEW v_monthly_revenue AS
SELECT
    DATE_TRUNC('month', order_date)         AS month_start,
    EXTRACT(YEAR  FROM order_date)::INT     AS year,
    EXTRACT(MONTH FROM order_date)::INT     AS month,
    TO_CHAR(order_date, 'Mon YYYY')         AS month_label,
    COUNT(DISTINCT order_id)                AS total_orders,
    SUM(quantity)                           AS total_units,
    ROUND(SUM(sales)::NUMERIC,   2)         AS total_sales,
    ROUND(SUM(profit)::NUMERIC,  2)         AS total_profit,
    ROUND(AVG(discount)::NUMERIC, 4)        AS avg_discount,
    ROUND(
        SUM(profit) / NULLIF(SUM(sales), 0) * 100, 2
    )                                       AS profit_margin_pct
FROM fact_orders
GROUP BY 1, 2, 3, 4
ORDER BY 1;

SELECT * FROM v_monthly_revenue;


-- ── VIEW 2: Revenue by Category & Sub-Category ───────────────
CREATE OR REPLACE VIEW v_category_revenue AS
SELECT
    p.category,
    p.sub_category,
    COUNT(DISTINCT o.order_id)              AS total_orders,
    ROUND(SUM(o.sales)::NUMERIC,  2)        AS total_sales,
    ROUND(SUM(o.profit)::NUMERIC, 2)        AS total_profit,
    ROUND(
        SUM(o.profit) / NULLIF(SUM(o.sales), 0) * 100, 2
    )                                       AS profit_margin_pct,
    ROUND(AVG(o.discount)::NUMERIC, 4)      AS avg_discount
FROM fact_orders o
JOIN dim_product p ON o.product_id = p.product_id
GROUP BY 1, 2
ORDER BY total_sales DESC;

SELECT * FROM v_category_revenue;


-- ── VIEW 3: Customer Segment Performance ─────────────────────
CREATE OR REPLACE VIEW v_segment_revenue AS
SELECT
    c.segment,
    c.region,
    COUNT(DISTINCT c.customer_id)           AS unique_customers,
    COUNT(DISTINCT o.order_id)              AS total_orders,
    ROUND(SUM(o.sales)::NUMERIC,  2)        AS total_sales,
    ROUND(SUM(o.profit)::NUMERIC, 2)        AS total_profit,
    ROUND(SUM(o.sales) / NULLIF(COUNT(DISTINCT c.customer_id), 0), 2) AS revenue_per_customer
FROM fact_orders o
JOIN dim_customer c ON o.customer_id = c.customer_id
GROUP BY 1, 2
ORDER BY total_sales DESC;

SELECT * FROM v_segment_revenue;


-- ── VIEW 4: Discount Impact Analysis ─────────────────────────
-- Key finding: discounts > 20% hurt profit
CREATE OR REPLACE VIEW v_discount_impact AS
SELECT
    CASE
        WHEN discount = 0           THEN '0% - No Discount'
        WHEN discount <= 0.10       THEN '1-10%'
        WHEN discount <= 0.20       THEN '11-20%'
        WHEN discount <= 0.30       THEN '21-30%'
        ELSE '31%+'
    END                                     AS discount_band,
    COUNT(*)                                AS order_lines,
    ROUND(SUM(sales)::NUMERIC,  2)          AS total_sales,
    ROUND(SUM(profit)::NUMERIC, 2)          AS total_profit,
    ROUND(
        SUM(profit) / NULLIF(SUM(sales), 0) * 100, 2
    )                                       AS profit_margin_pct
FROM fact_orders
GROUP BY 1
ORDER BY MIN(discount);

SELECT * FROM v_discount_impact;


-- ── VIEW 5: Top 10 Products by Revenue ───────────────────────
CREATE OR REPLACE VIEW v_top_products AS
SELECT
    p.product_name,
    p.category,
    p.sub_category,
    ROUND(SUM(o.sales)::NUMERIC,  2)        AS total_sales,
    ROUND(SUM(o.profit)::NUMERIC, 2)        AS total_profit,
    SUM(o.quantity)                         AS total_units_sold
FROM fact_orders o
JOIN dim_product p ON o.product_id = p.product_id
GROUP BY 1, 2, 3
ORDER BY total_sales DESC
LIMIT 10;

SELECT * FROM v_top_products;


-- ── EXPORT QUERY: Monthly data for Python forecasting model ──
-- Copy output to 01_data/monthly_summary.csv
-- \COPY (SELECT * FROM v_monthly_revenue ORDER BY month_start) 
--   TO '../01_data/monthly_summary.csv' WITH (FORMAT csv, HEADER true);

SELECT 'All views created. Ready for dashboard.' AS status;
