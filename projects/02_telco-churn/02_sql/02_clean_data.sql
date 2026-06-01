-- ============================================================
--  02_clean_data.sql — Telco Customer Churn
--  Validates raw data and populates dimension + fact tables
-- ============================================================

SET search_path TO telco;

-- ── STEP 1: Data quality checks ───────────────────────────────
SELECT
    COUNT(*)                                                AS total_rows,
    COUNT(*) FILTER (WHERE customerID IS NULL)              AS null_ids,
    COUNT(*) FILTER (WHERE MonthlyCharges IS NULL)          AS null_monthly_charges,
    COUNT(*) FILTER (WHERE TRIM(TotalCharges) = '')         AS blank_total_charges,
    COUNT(*) FILTER (WHERE Churn = 'Yes')                   AS churned,
    COUNT(*) FILTER (WHERE Churn = 'No')                    AS retained,
    ROUND(
        COUNT(*) FILTER (WHERE Churn = 'Yes')::NUMERIC /
        COUNT(*) * 100, 2
    )                                                       AS churn_rate_pct
FROM raw_telco;

-- Blank TotalCharges = new customers (tenure=0), will set to 0
SELECT customerID, tenure, TotalCharges
FROM raw_telco
WHERE TRIM(TotalCharges) = ''
LIMIT 10;

-- Tenure distribution
SELECT
    CASE WHEN tenure <= 12  THEN '0-12 months'
         WHEN tenure <= 24  THEN '13-24 months'
         WHEN tenure <= 48  THEN '25-48 months'
         ELSE '49+ months' END  AS tenure_band,
    COUNT(*)                    AS customers,
    ROUND(COUNT(*) FILTER (WHERE Churn='Yes')::NUMERIC / COUNT(*) * 100, 1) AS churn_pct
FROM raw_telco
GROUP BY 1 ORDER BY MIN(tenure);

-- Churn by contract type
SELECT Contract, COUNT(*) AS customers,
       SUM(CASE WHEN Churn='Yes' THEN 1 ELSE 0 END) AS churned,
       ROUND(AVG(CASE WHEN Churn='Yes' THEN 1.0 ELSE 0 END)*100,1) AS churn_rate_pct
FROM raw_telco
GROUP BY 1 ORDER BY churn_rate_pct DESC;


-- ── STEP 2: Populate dim_customer ────────────────────────────
INSERT INTO dim_customer (customer_id, gender, senior_citizen, has_partner, has_dependents)
SELECT
    customerID,
    gender,
    SeniorCitizen = 1,
    Partner = 'Yes',
    Dependents = 'Yes'
FROM raw_telco
WHERE customerID IS NOT NULL
ON CONFLICT (customer_id) DO NOTHING;

SELECT 'dim_customer loaded:', COUNT(*) FROM dim_customer;


-- ── STEP 3: Populate fact_subscriptions ──────────────────────
INSERT INTO fact_subscriptions (
    customer_id, tenure_months, phone_service, multiple_lines,
    internet_service, online_security, online_backup, device_protection,
    tech_support, streaming_tv, streaming_movies, contract_type,
    paperless_billing, payment_method, monthly_charges, total_charges, churned
)
SELECT
    customerID,
    tenure,
    PhoneService = 'Yes',
    MultipleLines = 'Yes',
    InternetService,
    OnlineSecurity = 'Yes',
    OnlineBackup = 'Yes',
    DeviceProtection = 'Yes',
    TechSupport = 'Yes',
    StreamingTV = 'Yes',
    StreamingMovies = 'Yes',
    Contract,
    PaperlessBilling = 'Yes',
    PaymentMethod,
    MonthlyCharges,
    CASE WHEN TRIM(TotalCharges) = '' THEN 0
         ELSE TRIM(TotalCharges)::NUMERIC END,
    Churn = 'Yes'
FROM raw_telco
WHERE customerID IS NOT NULL
ON CONFLICT DO NOTHING;

SELECT 'fact_subscriptions loaded:', COUNT(*) FROM fact_subscriptions;


-- ── STEP 4: Verification ──────────────────────────────────────
SELECT
    churned,
    COUNT(*) AS customers,
    ROUND(AVG(tenure_months),1)     AS avg_tenure,
    ROUND(AVG(monthly_charges),2)   AS avg_monthly_charges,
    ROUND(AVG(total_charges),2)     AS avg_total_charges
FROM fact_subscriptions
GROUP BY churned;

SELECT 'Cleaning complete.' AS status;
