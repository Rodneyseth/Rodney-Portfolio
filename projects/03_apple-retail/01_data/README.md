# 01_data — Raw Data

Paste the 5 CSV files from the Kaggle download here:

| File | Description | Est. Size |
|---|---|---|
| `sales.csv` | Fact table — 1M+ rows: sale_id, sale_date, store_id, product_id, quantity | ~85 MB |
| `products.csv` | Product catalogue — product_id, product_name, category_id, launch_date, price | ~12 KB |
| `category.csv` | Product categories — category_id, category_name | ~1 KB |
| `stores.csv` | Global store register — store_id, store_name, city, country, store_type | ~28 KB |
| `warranty.csv` | Warranty claims — warranty_id, sale_id, claim_date, repair_status | ~8 MB |

Once pasted, run `02_sql/01_create_schema.sql` to load into Supabase.
