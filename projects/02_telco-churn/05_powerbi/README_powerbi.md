# Power BI Dashboard — Telco Customer Churn

## Step 1: Connect to Supabase

1. Open **Power BI Desktop**
2. Click **Home → Get Data → PostgreSQL database**
   - If PostgreSQL is not listed, install the driver:
     [npgsql.org/doc/installation.html](https://www.npgsql.org/doc/installation.html) then restart Power BI
3. Enter connection details:

| Field    | Value |
|----------|-------|
| Server   | `aws-0-eu-west-1.pooler.supabase.com:5432` |
| Database | `postgres` |

4. Click **OK** → choose **Database** tab on the sign-in screen
   - Username: `postgres.axtfegiuknlaarycetwd`
   - Password: *(your Supabase DB password)*
5. In the Navigator, tick these views and click **Load**:
   - `v_churn_by_contract`
   - `v_churn_by_internet`
   - `v_churn_by_tenure`
   - `v_churn_by_payment`
   - `v_services_impact`
   - `v_churn_by_segment`

---

## Step 2: Key DAX Measures

Create these in **Home → New Measure**:

```dax
Total Customers = SUM(v_churn_by_contract[total_customers])

Total Churned = SUM(v_churn_by_contract[churned_count])

Overall Churn Rate % =
DIVIDE(
    SUMX(v_churn_by_contract, v_churn_by_contract[churned_count]),
    SUMX(v_churn_by_contract, v_churn_by_contract[total_customers]),
    0
) * 100

Revenue at Risk =
SUMX(
    v_churn_by_contract,
    v_churn_by_contract[churned_count] * v_churn_by_contract[avg_monthly_charges]
)
```

---

## Step 3: Dashboard Pages

### Page 1 — Executive Summary
| Visual | Data | Notes |
|--------|------|-------|
| KPI Card | `Total Customers` | |
| KPI Card | `Total Churned` | |
| KPI Card | `Overall Churn Rate %` | Conditional formatting — red if > 25% |
| KPI Card | `Revenue at Risk` | Monthly $ lost to churn |
| Donut Chart | `v_churn_by_contract` → contract_type / churned_count | |
| Bar Chart | `v_churn_by_payment` → payment_method / churn_rate_pct | Sort descending |

### Page 2 — Churn Drivers
| Visual | Data | Notes |
|--------|------|-------|
| Clustered Bar | `v_churn_by_tenure` → tenure_band / churn_rate_pct | Colour by rate |
| Bar Chart | `v_churn_by_internet` → internet_service / churn_rate_pct | |
| Matrix Table | `v_services_impact` → service / churn_rate_with / churn_rate_without | Highlight difference |
| Slicer | `v_churn_by_segment` → gender | |

### Page 3 — Customer Segments
| Visual | Data | Notes |
|--------|------|-------|
| Clustered Column | `v_churn_by_segment` → gender + senior_citizen / churn_rate_pct | |
| Table | `v_churn_by_segment` → all columns | Conditional formatting on churn_rate_pct |
| Bar Chart | `v_churn_by_contract` → contract_type / avg_monthly_charges | |

---

## Colour Theme

```
Primary (Navy):   #1B2A4A
Accent (Blue):    #1A73E8
High Churn (Red): #EA4335
Low Churn (Green):#34A853
Neutral (Grey):   #F5F5F5
Font: Segoe UI
```

Apply via **View → Themes → Customize current theme**

---

## Save

Save as `05_powerbi/telco_churn_dashboard.pbix`
