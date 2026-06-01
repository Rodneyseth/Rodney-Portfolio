-- ============================================================
-- 04_store_performance_views.sql
-- Store-level revenue rankings, country aggregations,
-- basket size, and top-store identification
-- ============================================================

SET search_path TO apple_retail;

-- ── View 1: Monthly revenue by store ──────────────────────
CREATE OR REPLACE VIEW apple_retail.v_store_monthly_revenue AS
SELECT
    st.store_id,
    st.store_name,
    st.city,
    st.country,
    st.store_type,
    DATE_TRUNC('month', s.sale_date)    AS month,
    SUM(s.quantity * p.price)           AS revenue,
    COUNT(DISTINCT s.sale_id)           AS transactions,
    SUM(s.quantity)                     AS units_sold,
    ROUND(AVG(s.quantity * p.price), 2) AS avg_basket_value
FROM apple_retail.sales s
JOIN apple_retail.products p  ON s.product_id = p.product_id
JOIN apple_retail.stores   st ON s.store_id   = st.store_id
GROUP BY st.store_id, st.store_name, st.city, st.country, st.store_type,
         DATE_TRUNC('month', s.sale_date)
ORDER BY month, revenue DESC;

-- ── View 2: Store annual summary with ranking ──────────────
CREATE OR REPLACE VIEW apple_retail.v_store_annual_summary AS
WITH annual AS (
    SELECT
        st.store_id,
        st.store_name,
        st.city,
        st.country,
        st.store_type,
        DATE_PART('year', s.sale_date)      AS year,
        SUM(s.quantity * p.price)           AS revenue,
        COUNT(DISTINCT s.sale_id)           AS transactions,
        SUM(s.quantity)                     AS units_sold,
        ROUND(AVG(s.quantity * p.price), 2) AS avg_basket_value
    FROM apple_retail.sales s
    JOIN apple_retail.products p  ON s.product_id = p.product_id
    JOIN apple_retail.stores   st ON s.store_id   = st.store_id
    GROUP BY st.store_id, st.store_name, st.city, st.country, st.store_type,
             DATE_PART('year', s.sale_date)
)
SELECT *,
    RANK() OVER (PARTITION BY year ORDER BY revenue DESC) AS revenue_rank,
    ROUND(
        100.0 * (revenue - LAG(revenue, 1) OVER (PARTITION BY store_id ORDER BY year))
                / NULLIF(LAG(revenue, 1) OVER (PARTITION BY store_id ORDER BY year), 0),
    1) AS yoy_revenue_growth_pct
FROM annual
ORDER BY year, revenue_rank;

-- ── View 3: Country-level aggregation ─────────────────────
CREATE OR REPLACE VIEW apple_retail.v_country_revenue_summary AS
SELECT
    st.country,
    DATE_PART('year', s.sale_date)      AS year,
    COUNT(DISTINCT st.store_id)         AS store_count,
    SUM(s.quantity * p.price)           AS revenue,
    COUNT(DISTINCT s.sale_id)           AS transactions,
    ROUND(AVG(s.quantity * p.price), 2) AS avg_basket_value,
    ROUND(
        100.0 * SUM(s.quantity * p.price)
                / SUM(SUM(s.quantity * p.price)) OVER (PARTITION BY DATE_PART('year', s.sale_date)),
    2) AS revenue_share_pct
FROM apple_retail.sales s
JOIN apple_retail.products p  ON s.product_id = p.product_id
JOIN apple_retail.stores   st ON s.store_id   = st.store_id
GROUP BY st.country, DATE_PART('year', s.sale_date)
ORDER BY year, revenue DESC;

-- ── View 4: Store-type performance comparison ─────────────
CREATE OR REPLACE VIEW apple_retail.v_store_type_performance AS
SELECT
    st.store_type,
    DATE_PART('year', s.sale_date)      AS year,
    COUNT(DISTINCT st.store_id)         AS store_count,
    SUM(s.quantity * p.price)           AS total_revenue,
    ROUND(
        SUM(s.quantity * p.price) / COUNT(DISTINCT st.store_id),
    2)                                  AS revenue_per_store,
    COUNT(DISTINCT s.sale_id)           AS transactions,
    ROUND(AVG(s.quantity * p.price), 2) AS avg_basket_value
FROM apple_retail.sales s
JOIN apple_retail.products p  ON s.product_id = p.product_id
JOIN apple_retail.stores   st ON s.store_id   = st.store_id
GROUP BY st.store_type, DATE_PART('year', s.sale_date)
ORDER BY year, total_revenue DESC;

-- ── View 5: Best-selling categories per store ─────────────
CREATE OR REPLACE VIEW apple_retail.v_store_category_mix AS
SELECT
    st.store_id,
    st.store_name,
    st.country,
    c.category_name,
    SUM(s.quantity * p.price)     AS revenue,
    SUM(s.quantity)               AS units_sold,
    ROUND(
        100.0 * SUM(s.quantity * p.price)
                / SUM(SUM(s.quantity * p.price)) OVER (PARTITION BY st.store_id),
    1)                            AS revenue_share_pct,
    RANK() OVER (
        PARTITION BY st.store_id
        ORDER BY SUM(s.quantity * p.price) DESC
    )                             AS category_rank
FROM apple_retail.sales s
JOIN apple_retail.products  p ON s.product_id  = p.product_id
JOIN apple_retail.category  c ON p.category_id = c.category_id
JOIN apple_retail.stores   st ON s.store_id    = st.store_id
GROUP BY st.store_id, st.store_name, st.country, c.category_name
ORDER BY st.store_id, category_rank;
