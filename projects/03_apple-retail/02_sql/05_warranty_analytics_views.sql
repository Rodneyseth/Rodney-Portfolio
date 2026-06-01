-- ============================================================
-- 05_warranty_analytics_views.sql
-- Warranty claim rates, repair status breakdown,
-- time-to-claim analysis, and store hotspot identification
-- ============================================================

SET search_path TO apple_retail;

-- ── View 1: Warranty claim rate by product ────────────────
CREATE OR REPLACE VIEW apple_retail.v_warranty_claim_rate_by_product AS
SELECT
    p.product_id,
    p.product_name,
    c.category_name,
    p.price,
    COUNT(DISTINCT s.sale_id)       AS total_sales,
    COUNT(DISTINCT w.claim_id)      AS total_claims,
    ROUND(
        100.0 * COUNT(DISTINCT w.claim_id)
                / NULLIF(COUNT(DISTINCT s.sale_id), 0),
    2)                              AS claim_rate_pct
FROM apple_retail.sales s
JOIN apple_retail.products  p ON s.product_id  = p.product_id
JOIN apple_retail.category  c ON p.category_id = c.category_id
LEFT JOIN apple_retail.warranty w ON s.sale_id = w.sale_id
GROUP BY p.product_id, p.product_name, c.category_name, p.price
ORDER BY claim_rate_pct DESC;

-- ── View 2: Warranty claim rate by category & year ────────
CREATE OR REPLACE VIEW apple_retail.v_warranty_claim_rate_by_category AS
SELECT
    c.category_name,
    DATE_PART('year', s.sale_date)    AS year,
    COUNT(DISTINCT s.sale_id)         AS total_sales,
    COUNT(DISTINCT w.claim_id)        AS total_claims,
    ROUND(
        100.0 * COUNT(DISTINCT w.claim_id)
                / NULLIF(COUNT(DISTINCT s.sale_id), 0),
    2)                                AS claim_rate_pct
FROM apple_retail.sales s
JOIN apple_retail.products  p ON s.product_id  = p.product_id
JOIN apple_retail.category  c ON p.category_id = c.category_id
LEFT JOIN apple_retail.warranty w ON s.sale_id = w.sale_id
GROUP BY c.category_name, DATE_PART('year', s.sale_date)
ORDER BY year, claim_rate_pct DESC;

-- ── View 3: Repair status distribution ────────────────────
CREATE OR REPLACE VIEW apple_retail.v_repair_status_distribution AS
SELECT
    w.repair_status,
    COUNT(*)                                  AS claim_count,
    ROUND(
        100.0 * COUNT(*) / SUM(COUNT(*)) OVER (),
    1)                                        AS pct_of_total,
    ROUND(AVG(w.claim_date - s.sale_date), 0) AS avg_days_to_claim
FROM apple_retail.warranty w
JOIN apple_retail.sales s ON w.sale_id = s.sale_id
WHERE w.repair_status IS NOT NULL
GROUP BY w.repair_status
ORDER BY claim_count DESC;

-- ── View 4: Time-to-claim distribution ────────────────────
CREATE OR REPLACE VIEW apple_retail.v_time_to_claim_analysis AS
SELECT
    c.category_name,
    w.repair_status,
    ROUND(AVG(w.claim_date - s.sale_date), 0)    AS avg_days_to_claim,
    PERCENTILE_CONT(0.5) WITHIN GROUP
        (ORDER BY (w.claim_date - s.sale_date))   AS median_days_to_claim,
    MIN(w.claim_date - s.sale_date)               AS min_days,
    MAX(w.claim_date - s.sale_date)               AS max_days,
    COUNT(*)                                      AS claim_count
FROM apple_retail.warranty  w
JOIN apple_retail.sales     s ON w.sale_id     = s.sale_id
JOIN apple_retail.products  p ON s.product_id  = p.product_id
JOIN apple_retail.category  c ON p.category_id = c.category_id
WHERE w.claim_date IS NOT NULL
GROUP BY c.category_name, w.repair_status
ORDER BY c.category_name, avg_days_to_claim;

-- ── View 5: Store warranty hotspots ───────────────────────
CREATE OR REPLACE VIEW apple_retail.v_store_warranty_hotspots AS
SELECT
    st.store_id,
    st.store_name,
    st.city,
    st.country,
    COUNT(DISTINCT s.sale_id)       AS total_sales,
    COUNT(DISTINCT w.claim_id)      AS total_claims,
    ROUND(
        100.0 * COUNT(DISTINCT w.claim_id)
                / NULLIF(COUNT(DISTINCT s.sale_id), 0),
    2)                              AS claim_rate_pct,
    COUNT(CASE WHEN w.repair_status = 'Completed'   THEN 1 END) AS completed,
    COUNT(CASE WHEN w.repair_status = 'In Progress' THEN 1 END) AS in_progress,
    COUNT(CASE WHEN w.repair_status = 'Rejected'    THEN 1 END) AS rejected
FROM apple_retail.sales s
JOIN apple_retail.stores   st ON s.store_id  = st.store_id
LEFT JOIN apple_retail.warranty w ON s.sale_id = w.sale_id
GROUP BY st.store_id, st.store_name, st.city, st.country
ORDER BY claim_rate_pct DESC;

-- ── View 6: Monthly warranty trend ────────────────────────
CREATE OR REPLACE VIEW apple_retail.v_warranty_monthly_trend AS
SELECT
    DATE_TRUNC('month', w.claim_date) AS claim_month,
    w.repair_status,
    COUNT(*)                          AS claim_count,
    ROUND(AVG(w.claim_date - s.sale_date), 0) AS avg_days_to_claim
FROM apple_retail.warranty w
JOIN apple_retail.sales s ON w.sale_id = s.sale_id
WHERE w.claim_date IS NOT NULL
GROUP BY DATE_TRUNC('month', w.claim_date), w.repair_status
ORDER BY claim_month, w.repair_status;
