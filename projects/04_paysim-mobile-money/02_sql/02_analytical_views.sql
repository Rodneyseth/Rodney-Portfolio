-- 02_analytical_views.sql
-- 15 analytical views for PaySim business performance analytics
-- All objects fully schema-qualified for PgBouncer compatibility

-- ── 1. Daily transaction summary ─────────────────────────────────────────────
CREATE OR REPLACE VIEW paysim.v_daily_summary AS
SELECT
    tx_day,
    COUNT(*)                                   AS tx_count,
    SUM(amount)                                AS total_value,
    ROUND(AVG(amount)::NUMERIC, 2)             AS avg_amount,
    COUNT(DISTINCT name_orig)                  AS active_customers,
    ROUND(SUM(amount) / NULLIF(COUNT(*), 0)::NUMERIC, 2) AS revenue_per_tx
FROM paysim.transactions
GROUP BY tx_day
ORDER BY tx_day;

-- ── 2. Transaction type performance ─────────────────────────────────────────
CREATE OR REPLACE VIEW paysim.v_type_performance AS
WITH totals AS (
    SELECT COUNT(*) AS all_count, SUM(amount) AS all_value
    FROM paysim.transactions
)
SELECT
    t.tx_type,
    COUNT(*)                                                   AS tx_count,
    SUM(t.amount)                                              AS total_value,
    ROUND(AVG(t.amount)::NUMERIC, 2)                           AS avg_amount,
    ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t.amount)::NUMERIC, 2) AS median_amount,
    ROUND(100.0 * COUNT(*) / tot.all_count, 2)                 AS pct_volume,
    ROUND(100.0 * SUM(t.amount) / tot.all_value, 2)            AS pct_value
FROM paysim.transactions t
CROSS JOIN totals tot
GROUP BY t.tx_type, tot.all_count, tot.all_value
ORDER BY total_value DESC;

-- ── 3. Daily breakdown by transaction type ───────────────────────────────────
CREATE OR REPLACE VIEW paysim.v_daily_by_type AS
SELECT
    tx_day,
    tx_type,
    COUNT(*)               AS tx_count,
    SUM(amount)            AS total_value,
    ROUND(AVG(amount)::NUMERIC, 2) AS avg_amount
FROM paysim.transactions
GROUP BY tx_day, tx_type
ORDER BY tx_day, total_value DESC;

-- ── 4. Hourly transaction pattern (avg across all days) ──────────────────────
CREATE OR REPLACE VIEW paysim.v_hourly_pattern AS
SELECT
    tx_hour,
    ROUND(AVG(day_count)::NUMERIC, 1)   AS avg_tx_per_hour,
    ROUND(AVG(day_value)::NUMERIC, 2)   AS avg_value_per_hour,
    SUM(day_count)                       AS total_tx,
    SUM(day_value)                       AS total_value
FROM (
    SELECT tx_day, tx_hour,
           COUNT(*)    AS day_count,
           SUM(amount) AS day_value
    FROM paysim.transactions
    GROUP BY tx_day, tx_hour
) sub
GROUP BY tx_hour
ORDER BY tx_hour;

-- ── 5. Day-of-week pattern ────────────────────────────────────────────────────
CREATE OR REPLACE VIEW paysim.v_dow_pattern AS
SELECT
    tx_dow,
    CASE tx_dow
        WHEN 0 THEN 'Monday'    WHEN 1 THEN 'Tuesday'
        WHEN 2 THEN 'Wednesday' WHEN 3 THEN 'Thursday'
        WHEN 4 THEN 'Friday'    WHEN 5 THEN 'Saturday'
        ELSE 'Sunday'
    END AS day_name,
    COUNT(*)                           AS tx_count,
    SUM(amount)                        AS total_value,
    ROUND(AVG(amount)::NUMERIC, 2)     AS avg_amount,
    COUNT(DISTINCT name_orig)          AS unique_customers
FROM paysim.transactions
GROUP BY tx_dow
ORDER BY tx_dow;

-- ── 6. Weekly summary with WoW growth ────────────────────────────────────────
CREATE OR REPLACE VIEW paysim.v_weekly_summary AS
WITH weekly AS (
    SELECT
        tx_week,
        COUNT(*)               AS tx_count,
        SUM(amount)            AS total_value,
        COUNT(DISTINCT name_orig) AS active_customers
    FROM paysim.transactions
    GROUP BY tx_week
)
SELECT
    tx_week,
    tx_count,
    total_value,
    active_customers,
    ROUND(100.0 * (tx_count    - LAG(tx_count)    OVER w) / NULLIF(LAG(tx_count)    OVER w, 0), 1) AS wow_volume_growth,
    ROUND(100.0 * (total_value - LAG(total_value) OVER w) / NULLIF(LAG(total_value) OVER w, 0), 1) AS wow_value_growth
FROM weekly
WINDOW w AS (ORDER BY tx_week)
ORDER BY tx_week;

-- ── 7. Top 20 merchants by inflow value ──────────────────────────────────────
CREATE OR REPLACE VIEW paysim.v_top_merchants AS
SELECT
    name_dest                          AS merchant_id,
    COUNT(*)                           AS tx_count,
    SUM(amount)                        AS total_inflow,
    ROUND(AVG(amount)::NUMERIC, 2)     AS avg_tx_value,
    COUNT(DISTINCT name_orig)          AS unique_senders,
    MIN(tx_day)                        AS first_active_day,
    MAX(tx_day)                        AS last_active_day
FROM paysim.transactions
WHERE dest_type = 'M'
GROUP BY name_dest
ORDER BY total_inflow DESC
LIMIT 20;

-- ── 8. Merchant daily inflow trend (top 5 merchants) ─────────────────────────
CREATE OR REPLACE VIEW paysim.v_merchant_daily AS
WITH top5 AS (
    SELECT name_dest
    FROM paysim.transactions
    WHERE dest_type = 'M'
    GROUP BY name_dest
    ORDER BY SUM(amount) DESC
    LIMIT 5
)
SELECT
    t.tx_day,
    t.name_dest AS merchant_id,
    COUNT(*)               AS tx_count,
    SUM(t.amount)          AS daily_inflow
FROM paysim.transactions t
JOIN top5 ON t.name_dest = top5.name_dest
GROUP BY t.tx_day, t.name_dest
ORDER BY t.tx_day, daily_inflow DESC;

-- ── 9. Customer value tiers ───────────────────────────────────────────────────
CREATE OR REPLACE VIEW paysim.v_customer_tiers AS
WITH customer_spend AS (
    SELECT
        name_orig,
        COUNT(*)               AS tx_count,
        SUM(amount)            AS total_spent,
        ROUND(AVG(amount)::NUMERIC, 2) AS avg_tx_size,
        COUNT(DISTINCT tx_day) AS active_days
    FROM paysim.transactions
    WHERE orig_type = 'C'
    GROUP BY name_orig
),
percentiles AS (
    SELECT
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY total_spent) AS p75,
        PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY total_spent) AS p50,
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY total_spent) AS p25
    FROM customer_spend
)
SELECT
    cs.name_orig,
    cs.tx_count,
    cs.total_spent,
    cs.avg_tx_size,
    cs.active_days,
    CASE
        WHEN cs.total_spent >= p.p75 THEN 'Whale'
        WHEN cs.total_spent >= p.p50 THEN 'High'
        WHEN cs.total_spent >= p.p25 THEN 'Mid'
        ELSE 'Low'
    END AS tier
FROM customer_spend cs
CROSS JOIN percentiles p;

-- ── 10. Customer tier summary ─────────────────────────────────────────────────
CREATE OR REPLACE VIEW paysim.v_tier_summary AS
WITH tiers AS (
    SELECT tier, total_spent, tx_count
    FROM paysim.v_customer_tiers
)
SELECT
    tier,
    COUNT(*)                           AS customer_count,
    SUM(total_spent)                   AS total_value,
    ROUND(AVG(total_spent)::NUMERIC, 2)AS avg_spend_per_customer,
    SUM(tx_count)                      AS total_transactions,
    ROUND(100.0 * SUM(total_spent) / SUM(SUM(total_spent)) OVER (), 2) AS pct_value_share
FROM tiers
GROUP BY tier
ORDER BY avg_spend_per_customer DESC;

-- ── 11. Platform liquidity: daily CASH_IN vs CASH_OUT ────────────────────────
CREATE OR REPLACE VIEW paysim.v_platform_liquidity AS
SELECT
    tx_day,
    SUM(CASE WHEN tx_type = 'CASH_IN'  THEN amount ELSE 0 END) AS cash_in,
    SUM(CASE WHEN tx_type = 'CASH_OUT' THEN amount ELSE 0 END) AS cash_out,
    SUM(CASE WHEN tx_type = 'PAYMENT'  THEN amount ELSE 0 END) AS payments,
    SUM(CASE WHEN tx_type = 'TRANSFER' THEN amount ELSE 0 END) AS transfers,
    SUM(CASE WHEN tx_type = 'DEBIT'    THEN amount ELSE 0 END) AS debits,
    SUM(CASE WHEN tx_type = 'CASH_IN'  THEN amount ELSE 0 END)
  - SUM(CASE WHEN tx_type = 'CASH_OUT' THEN amount ELSE 0 END) AS net_flow
FROM paysim.transactions
GROUP BY tx_day
ORDER BY tx_day;

-- ── 12. Average transaction size by type over time ────────────────────────────
CREATE OR REPLACE VIEW paysim.v_avg_tx_size_trend AS
SELECT
    tx_day,
    tx_type,
    ROUND(AVG(amount)::NUMERIC, 2)  AS avg_amount,
    COUNT(*)                         AS tx_count
FROM paysim.transactions
GROUP BY tx_day, tx_type
ORDER BY tx_day, tx_type;

-- ── 13. Daily active customers ────────────────────────────────────────────────
CREATE OR REPLACE VIEW paysim.v_daily_active_customers AS
SELECT
    tx_day,
    COUNT(DISTINCT CASE WHEN orig_type = 'C' THEN name_orig END) AS dac,
    COUNT(DISTINCT name_orig)                                      AS total_active_orig
FROM paysim.transactions
GROUP BY tx_day
ORDER BY tx_day;

-- ── 14. Peak operating hours (ranked by avg volume) ──────────────────────────
CREATE OR REPLACE VIEW paysim.v_peak_hours AS
SELECT
    tx_hour,
    ROUND(AVG(cnt)::NUMERIC, 1)  AS avg_tx_per_day,
    ROUND(AVG(val)::NUMERIC, 2)  AS avg_value_per_day,
    RANK() OVER (ORDER BY AVG(cnt) DESC) AS volume_rank
FROM (
    SELECT tx_day, tx_hour, COUNT(*) AS cnt, SUM(amount) AS val
    FROM paysim.transactions
    GROUP BY tx_day, tx_hour
) sub
GROUP BY tx_hour
ORDER BY volume_rank;

-- ── 15. High-value transaction segments (> 1M) ───────────────────────────────
CREATE OR REPLACE VIEW paysim.v_high_value_segments AS
SELECT
    tx_type,
    COUNT(*)                           AS tx_count,
    SUM(amount)                        AS total_value,
    ROUND(AVG(amount)::NUMERIC, 2)     AS avg_amount,
    MIN(amount)                        AS min_amount,
    MAX(amount)                        AS max_amount,
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM paysim.transactions WHERE amount > 1000000), 2) AS pct_of_hv_volume
FROM paysim.transactions
WHERE amount > 1000000
GROUP BY tx_type
ORDER BY total_value DESC;
