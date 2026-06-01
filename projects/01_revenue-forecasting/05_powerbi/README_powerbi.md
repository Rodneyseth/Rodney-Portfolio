# Power BI Dashboard — Setup Instructions

This folder is where your `.pbix` Power BI file lives once built.
Follow the steps below to connect Power BI to the project data and
recreate the dashboard from scratch (or import the provided template).

---

## Prerequisites

- Power BI Desktop (free): https://powerbi.microsoft.com/desktop
- The SQL views from `02_sql/03_revenue_summary.sql` already created in your database
- OR the CSV files in `01_data/` as a flat-file alternative

---

## Option A — Connect to PostgreSQL (Recommended)

1. Open Power BI Desktop → **Get Data** → **PostgreSQL**
2. Enter your server and database name
3. Import these views:
   - `v_monthly_revenue`
   - `v_category_revenue`
   - `v_segment_revenue`
   - `v_discount_impact`
   - `v_top_products`
4. Click **Load**

---

## Option B — Connect to CSV files (Quick start)

1. Open Power BI Desktop → **Get Data** → **Text/CSV**
2. Load `../01_data/superstore_raw.csv`
3. In Power Query Editor, set correct data types:
   - `Order Date` → Date
   - `Sales`, `Profit`, `Discount` → Decimal Number
   - `Quantity` → Whole Number

---

## Dashboard Pages to Build

### Page 1: Executive Summary
| Visual            | Fields                              |
|-------------------|-------------------------------------|
| KPI Card          | Total Revenue (SUM of Sales)        |
| KPI Card          | Total Profit (SUM of Profit)        |
| KPI Card          | Profit Margin % (Profit/Sales)      |
| KPI Card          | Total Orders (COUNT of Order ID)    |
| Line Chart        | Monthly Revenue trend               |
| Bar Chart         | Revenue by Category                 |

### Page 2: Category Deep Dive
| Visual            | Fields                              |
|-------------------|-------------------------------------|
| Treemap           | Revenue by Category + Sub-Category  |
| Bar Chart         | Profit Margin % by Sub-Category     |
| Table             | Top 10 Products by Revenue          |
| Slicer            | Category filter                     |

### Page 3: Discount Impact
| Visual            | Fields                              |
|-------------------|-------------------------------------|
| Clustered Bar     | Revenue vs Profit by Discount Band  |
| Scatter Plot      | Discount Rate vs Profit (per order) |
| KPI Card          | Average Discount Rate               |
| Callout card      | "Discounts > 20% lose money"        |

### Page 4: Forecast vs Actual
| Visual            | Fields                              |
|-------------------|-------------------------------------|
| Line Chart        | Actual Revenue vs XGBoost Forecast  |
| Table             | Month / Actual / Predicted / Error  |
| KPI Card          | Model MAPE (8.3%)                   |

---

## DAX Measures to Create

```dax
-- Total Revenue
Total Revenue = SUM(fact_orders[sales])

-- Total Profit
Total Profit = SUM(fact_orders[profit])

-- Profit Margin %
Profit Margin % = DIVIDE([Total Profit], [Total Revenue], 0)

-- Revenue per Customer
Revenue per Customer =
    DIVIDE([Total Revenue], DISTINCTCOUNT(fact_orders[customer_id]), 0)

-- MoM Revenue Growth
MoM Growth % =
VAR CurrentMonth = [Total Revenue]
VAR PriorMonth =
    CALCULATE([Total Revenue], DATEADD('Date'[Date], -1, MONTH))
RETURN DIVIDE(CurrentMonth - PriorMonth, PriorMonth, 0)
```

---

## Recommended Theme

- Primary color:  `#1B2A4A` (Navy)
- Accent color:   `#1A73E8` (Blue)
- Positive:       `#34A853` (Green)
- Negative:       `#EA4335` (Red)
- Font:           Segoe UI (Power BI default)

Save your theme as a JSON file and apply via:
**View → Themes → Browse for themes**

---

## Saving the .pbix File

Once built, save the file as:
```
05_powerbi/revenue_dashboard.pbix
```

Then commit it to GitHub using Git LFS (binary files are large):
```bash
git lfs install
git lfs track "*.pbix"
git add .gitattributes
git add 05_powerbi/revenue_dashboard.pbix
git commit -m "Add Power BI dashboard"
```
