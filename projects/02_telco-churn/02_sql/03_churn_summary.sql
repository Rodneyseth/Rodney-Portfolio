-- ============================================================
--  03_churn_summary.sql — Telco Customer Churn
--  Views that feed the Excel & Power BI dashboards
-- ============================================================

SET search_path TO telco;

-- ── VIEW 1: Churn by Contract Type ───────────────────────────
CREATE OR REPLACE VIEW v_churn_by_contract AS
SELECT
    contract_type,
    COUNT(*)                                                AS total_customers,
    SUM(churned::INT)                                       AS churned_count,
    COUNT(*) - SUM(churned::INT)                            AS retained_count,
    ROUND(SUM(churned::INT)::NUMERIC / COUNT(*) * 100, 2)  AS churn_rate_pct,
    ROUND(AVG(monthly_charges), 2)                          AS avg_monthly_charges,
    ROUND(AVG(tenure_months), 1)                            AS avg_tenure_months
FROM fact_subscriptions
GROUP BY 1
ORDER BY churn_rate_pct DESC;

SELECT * FROM v_churn_by_contract;


-- ── VIEW 2: Churn by Internet Service ────────────────────────
CREATE OR REPLACE VIEW v_churn_by_internet AS
SELECT
    internet_service,
    COUNT(*)                                                AS total_customers,
    ROUND(SUM(churned::INT)::NUMERIC / COUNT(*) * 100, 2)  AS churn_rate_pct,
    ROUND(AVG(monthly_charges), 2)                          AS avg_monthly_charges
FROM fact_subscriptions
GROUP BY 1
ORDER BY churn_rate_pct DESC;

SELECT * FROM v_churn_by_internet;


-- ── VIEW 3: Churn by Tenure Band ─────────────────────────────
CREATE OR REPLACE VIEW v_churn_by_tenure AS
SELECT
    CASE
        WHEN tenure_months <= 12  THEN '01: 0-12 months'
        WHEN tenure_months <= 24  THEN '02: 13-24 months'
        WHEN tenure_months <= 36  THEN '03: 25-36 months'
        WHEN tenure_months <= 48  THEN '04: 37-48 months'
        ELSE                           '05: 49+ months'
    END                                                     AS tenure_band,
    COUNT(*)                                                AS customers,
    ROUND(SUM(churned::INT)::NUMERIC / COUNT(*) * 100, 2)  AS churn_rate_pct,
    ROUND(AVG(monthly_charges), 2)                          AS avg_monthly_charges
FROM fact_subscriptions
GROUP BY 1
ORDER BY 1;

SELECT * FROM v_churn_by_tenure;


-- ── VIEW 4: Value-Added Services Impact ──────────────────────
CREATE OR REPLACE VIEW v_services_impact AS
SELECT
    'Tech Support'      AS service,
    ROUND(SUM(CASE WHEN tech_support     AND churned THEN 1 ELSE 0 END)::NUMERIC /
          NULLIF(SUM(tech_support::INT),0)*100,2)           AS churn_rate_with,
    ROUND(SUM(CASE WHEN NOT tech_support AND churned THEN 1 ELSE 0 END)::NUMERIC /
          NULLIF(SUM((NOT tech_support)::INT),0)*100,2)     AS churn_rate_without
FROM fact_subscriptions
UNION ALL
SELECT
    'Online Security',
    ROUND(SUM(CASE WHEN online_security     AND churned THEN 1 ELSE 0 END)::NUMERIC /
          NULLIF(SUM(online_security::INT),0)*100,2),
    ROUND(SUM(CASE WHEN NOT online_security AND churned THEN 1 ELSE 0 END)::NUMERIC /
          NULLIF(SUM((NOT online_security)::INT),0)*100,2)
FROM fact_subscriptions
UNION ALL
SELECT
    'Online Backup',
    ROUND(SUM(CASE WHEN online_backup     AND churned THEN 1 ELSE 0 END)::NUMERIC /
          NULLIF(SUM(online_backup::INT),0)*100,2),
    ROUND(SUM(CASE WHEN NOT online_backup AND churned THEN 1 ELSE 0 END)::NUMERIC /
          NULLIF(SUM((NOT online_backup)::INT),0)*100,2)
FROM fact_subscriptions;

SELECT * FROM v_services_impact;


-- ── VIEW 5: Senior Citizen Churn ─────────────────────────────
CREATE OR REPLACE VIEW v_churn_by_segment AS
SELECT
    c.gender,
    c.senior_citizen,
    COUNT(*)                                                AS customers,
    ROUND(SUM(f.churned::INT)::NUMERIC / COUNT(*) * 100,2) AS churn_rate_pct,
    ROUND(AVG(f.monthly_charges), 2)                        AS avg_charges
FROM fact_subscriptions f
JOIN dim_customer c ON f.customer_id = c.customer_id
GROUP BY 1, 2
ORDER BY churn_rate_pct DESC;

SELECT * FROM v_churn_by_segment;


-- ── VIEW 6: Payment Method Impact ────────────────────────────
CREATE OR REPLACE VIEW v_churn_by_payment AS
SELECT
    payment_method,
    COUNT(*)                                                AS customers,
    ROUND(SUM(churned::INT)::NUMERIC / COUNT(*) * 100, 2)  AS churn_rate_pct,
    ROUND(AVG(monthly_charges), 2)                          AS avg_monthly_charges
FROM fact_subscriptions
GROUP BY 1
ORDER BY churn_rate_pct DESC;

SELECT * FROM v_churn_by_payment;


-- ── EXPORT for Python model ───────────────────────────────────
-- \COPY (SELECT f.*, c.gender, c.senior_citizen, c.has_partner, c.has_dependents
--        FROM fact_subscriptions f JOIN dim_customer c ON f.customer_id = c.customer_id)
--   TO '../01_data/churn_model_ready.csv' WITH (FORMAT csv, HEADER true);

SELECT 'All churn views created.' AS status;
