-- ============================================================
-- 03_category_revenue_views.sql
-- Monthly revenue, transaction counts and YoY growth by
-- product category — core analytical layer for Python + Power BI
-- ============================================================

SET search_path TO apple_retail;

-- ── View 1: Monthly revenue by category ───────────────────
CREATE OR REPLACE VIEW apple_retail.v_category_monthly_revenue AS
WITH monthly AS (
    SELECT
        c.category_name,
        DATE_TRUNC('month', s.sale_date)    AS month,
        SUM(s.quantity * p.price)           AS revenue,
        COUNT(DISTINCT s.sale_id)           AS transactions,
        SUM(s.quantity)                     AS units_sold
    FROM apple_retail.sales s
    JOIN apple_retail.products  p ON s.product_id  = p.product_id
    JOIN apple_retail.category  c ON p.category_id = c.category_id
    GROUP BY 1, 2
)
SELECT *,
    ROUND(
        100.0 * (revenue - LAG(revenue, 12) OVER w)
                / NULLIF(LAG(revenue, 12) OVER w, 0),
    1) AS yoy_revenue_growth_pct,
    ROUND(
        100.0 * (units_sold - LAG(units_sold, 12) OVER w)
                / NULLIF(LAG(units_sold, 12) OVER w, 0),
    1) AS yoy_units_growth_pct
FROM monthly
WINDOW w AS (PARTITION BY category_name ORDER BY month)
ORDER BY category_name, month;

-- ── View 2: Annual category summary ───────────────────────
CREATE OR REPLACE VIEW apple_retail.v_category_annual_summary AS
SELECT
    c.category_name,
    DATE_PART('year', s.sale_date)      AS year,
    SUM(s.quantity * p.price)           AS revenue,
    SUM(s.quantity)                     AS units_sold,
    COUNT(DISTINCT s.sale_id)           AS transactions,
    ROUND(AVG(s.quantity * p.price), 2) AS avg_basket_value,
    COUNT(DISTINCT s.store_id)          AS active_stores
FROM apple_retail.sales s
JOIN apple_retail.products  p ON s.product_id  = p.product_id
JOIN apple_retail.category  c ON p.category_id = c.category_id
GROUP BY 1, 2
ORDER BY 1, 2;

-- ── View 3: Category market mix by month ──────────────────
CREATE OR REPLACE VIEW apple_retail.v_category_market_mix AS
SELECT
    month,
    category_name,
    revenue,
    ROUND(100.0 * revenue / SUM(revenue) OVER (PARTITION BY month), 1) AS revenue_share_pct
FROM apple_retail.v_category_monthly_revenue
ORDER BY month, revenue DESC;

-- ── View 4: Top products by category ──────────────────────
CREATE OR REPLACE VIEW apple_retail.v_top_products_by_category AS
SELECT
    c.category_name,
    p.product_name,
    p.launch_date,
    p.price,
    SUM(s.quantity)              AS total_units,
    SUM(s.quantity * p.price)    AS total_revenue,
    COUNT(DISTINCT s.sale_id)    AS transactions,
    RANK() OVER (
        PARTITION BY c.category_name
        ORDER BY SUM(s.quantity * p.price) DESC
    ) AS revenue_rank
FROM apple_retail.sales s
JOIN apple_retail.products  p ON s.product_id  = p.product_id
JOIN apple_retail.category  c ON p.category_id = c.category_id
GROUP BY c.category_name, p.product_name, p.launch_date, p.price
ORDER BY c.category_name, revenue_rank;
