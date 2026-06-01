-- ============================================================
--  01_create_tables.sql — Telco Customer Churn
--  Dataset: IBM Telco Customer Churn (Kaggle)
--  7,043 rows · 21 columns · Target: Churn (Yes/No)
-- ============================================================

CREATE SCHEMA IF NOT EXISTS telco;
SET search_path TO telco;

DROP TABLE IF EXISTS raw_telco CASCADE;
DROP TABLE IF EXISTS dim_customer CASCADE;
DROP TABLE IF EXISTS fact_subscriptions CASCADE;

-- ── RAW staging table (matches Kaggle CSV exactly) ───────────
CREATE TABLE raw_telco (
    customerID          VARCHAR(20),
    gender              VARCHAR(10),
    SeniorCitizen       INT,
    Partner             VARCHAR(5),
    Dependents          VARCHAR(5),
    tenure              INT,
    PhoneService        VARCHAR(5),
    MultipleLines       VARCHAR(30),
    InternetService     VARCHAR(30),
    OnlineSecurity      VARCHAR(30),
    OnlineBackup        VARCHAR(30),
    DeviceProtection    VARCHAR(30),
    TechSupport         VARCHAR(30),
    StreamingTV         VARCHAR(30),
    StreamingMovies     VARCHAR(30),
    Contract            VARCHAR(30),
    PaperlessBilling    VARCHAR(5),
    PaymentMethod       VARCHAR(50),
    MonthlyCharges      NUMERIC(8,2),
    TotalCharges        VARCHAR(20),    -- has spaces in raw CSV, cast later
    Churn               VARCHAR(5)
);

-- ── DIMENSION: Customer profile ──────────────────────────────
CREATE TABLE dim_customer (
    customer_id         VARCHAR(20) PRIMARY KEY,
    gender              VARCHAR(10),
    senior_citizen      BOOLEAN,
    has_partner         BOOLEAN,
    has_dependents      BOOLEAN
);

-- ── FACT: Subscription state ─────────────────────────────────
CREATE TABLE fact_subscriptions (
    customer_id         VARCHAR(20) REFERENCES dim_customer(customer_id),
    tenure_months       INT,
    phone_service       BOOLEAN,
    multiple_lines      BOOLEAN,
    internet_service    VARCHAR(30),
    online_security     BOOLEAN,
    online_backup       BOOLEAN,
    device_protection   BOOLEAN,
    tech_support        BOOLEAN,
    streaming_tv        BOOLEAN,
    streaming_movies    BOOLEAN,
    contract_type       VARCHAR(30),
    paperless_billing   BOOLEAN,
    payment_method      VARCHAR(50),
    monthly_charges     NUMERIC(8,2),
    total_charges       NUMERIC(10,2),
    churned             BOOLEAN         -- TRUE = churned
);

-- ── LOAD CSV ──────────────────────────────────────────────────
-- \COPY raw_telco FROM '../01_data/telco_churn.csv'
--   WITH (FORMAT csv, HEADER true);

SELECT 'Tables created.' AS status;
SELECT COUNT(*) AS raw_rows FROM raw_telco;
