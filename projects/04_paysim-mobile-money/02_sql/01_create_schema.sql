-- 01_create_schema.sql
-- PaySim Mobile Money  --  paysim schema on shared Supabase project

CREATE SCHEMA IF NOT EXISTS paysim;

SET search_path TO paysim;

DROP TABLE IF EXISTS paysim.transactions CASCADE;

CREATE TABLE paysim.transactions (
    step          INTEGER     NOT NULL,          -- simulation hour 1-743
    tx_day        SMALLINT    NOT NULL,          -- day 1-31  (ceil(step/24))
    tx_week       SMALLINT    NOT NULL,          -- week 1-5  (ceil(step/168))
    tx_hour       SMALLINT    NOT NULL,          -- hour of day 0-23
    tx_dow        SMALLINT    NOT NULL,          -- day of week 0=Mon 6=Sun
    tx_type       VARCHAR(10) NOT NULL,          -- CASH_IN CASH_OUT DEBIT PAYMENT TRANSFER
    amount        NUMERIC(18,2) NOT NULL,
    name_orig     VARCHAR(20) NOT NULL,
    orig_type     CHAR(1)     NOT NULL,          -- C=customer M=merchant
    old_bal_orig  NUMERIC(18,2),
    new_bal_orig  NUMERIC(18,2),
    name_dest     VARCHAR(20) NOT NULL,
    dest_type     CHAR(1)     NOT NULL,
    old_bal_dest  NUMERIC(18,2),
    new_bal_dest  NUMERIC(18,2),
    is_fraud      SMALLINT    NOT NULL DEFAULT 0,
    is_flagged    SMALLINT    NOT NULL DEFAULT 0
);

-- Indexes for view performance
CREATE INDEX idx_ps_day      ON paysim.transactions (tx_day);
CREATE INDEX idx_ps_type     ON paysim.transactions (tx_type);
CREATE INDEX idx_ps_hour     ON paysim.transactions (tx_hour);
CREATE INDEX idx_ps_dest     ON paysim.transactions (name_dest);
CREATE INDEX idx_ps_orig     ON paysim.transactions (name_orig);
CREATE INDEX idx_ps_daytype  ON paysim.transactions (tx_day, tx_type);
