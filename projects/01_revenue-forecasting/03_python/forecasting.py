# ============================================================
#  Small Business Revenue Forecasting — Starter Code
#  Tools: pandas, scikit-learn, xgboost, matplotlib, prophet
# ============================================================

# ── STEP 0: Install dependencies (run once in terminal) ──────
# pip install pandas numpy scikit-learn xgboost matplotlib seaborn prophet kaggle

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error
from xgboost import XGBRegressor
import warnings
warnings.filterwarnings("ignore")

plt.style.use("seaborn-v0_8-whitegrid")


# ============================================================
# STEP 1 — LOAD DATA
# ============================================================
# Option A: Download from Kaggle
#   kaggle datasets download -d vivek468/superstore-dataset-final
#   unzip superstore-dataset-final.zip

# Option B: Use your own CSV — replace the path below
df = pd.read_csv("Sample - Superstore.csv", encoding="latin-1")

print("Shape:", df.shape)
print(df.head())
print(df.dtypes)


# ============================================================
# STEP 2 — CLEAN & PARSE DATES
# ============================================================
df["Order Date"] = pd.to_datetime(df["Order Date"])
df["Ship Date"]  = pd.to_datetime(df["Ship Date"])

# Extract time components
df["Year"]        = df["Order Date"].dt.year
df["Month"]       = df["Order Date"].dt.month
df["DayOfWeek"]   = df["Order Date"].dt.dayofweek   # 0=Mon, 6=Sun
df["Quarter"]     = df["Order Date"].dt.quarter
df["WeekOfYear"]  = df["Order Date"].dt.isocalendar().week.astype(int)

print("\nDate range:", df["Order Date"].min(), "→", df["Order Date"].max())


# ============================================================
# STEP 3 — EXPLORATORY DATA ANALYSIS (EDA)
# ============================================================

# 3a. Monthly revenue trend
monthly = (
    df.groupby(["Year", "Month"])["Sales"]
    .sum()
    .reset_index()
    .sort_values(["Year", "Month"])
)
monthly["Period"] = pd.to_datetime(
    monthly["Year"].astype(str) + "-" + monthly["Month"].astype(str).str.zfill(2)
)

plt.figure(figsize=(14, 4))
plt.plot(monthly["Period"], monthly["Sales"], marker="o", linewidth=2, color="#1a73e8")
plt.title("Monthly Revenue Trend", fontsize=14, fontweight="bold")
plt.ylabel("Sales (USD)")
plt.xlabel("")
plt.tight_layout()
plt.savefig("01_monthly_trend.png", dpi=150)
plt.show()

# 3b. Revenue by category
cat_sales = df.groupby("Category")["Sales"].sum().sort_values(ascending=False)
cat_sales.plot(kind="bar", color=["#1a73e8","#34a853","#fbbc04"], figsize=(7, 4))
plt.title("Revenue by Category", fontweight="bold")
plt.ylabel("Total Sales")
plt.xticks(rotation=0)
plt.tight_layout()
plt.savefig("02_category_sales.png", dpi=150)
plt.show()

# 3c. Discount vs Profit scatter
plt.figure(figsize=(7, 4))
plt.scatter(df["Discount"], df["Profit"], alpha=0.3, color="#ea4335")
plt.axhline(0, color="black", linewidth=0.8, linestyle="--")
plt.title("Discount vs Profit", fontweight="bold")
plt.xlabel("Discount Rate")
plt.ylabel("Profit")
plt.tight_layout()
plt.savefig("03_discount_profit.png", dpi=150)
plt.show()


# ============================================================
# STEP 4 — FEATURE ENGINEERING
# ============================================================
monthly_rev = monthly.copy()
monthly_rev = monthly_rev.sort_values("Period").reset_index(drop=True)

# Lag features — prior months' revenue
monthly_rev["lag_1"]  = monthly_rev["Sales"].shift(1)
monthly_rev["lag_2"]  = monthly_rev["Sales"].shift(2)
monthly_rev["lag_3"]  = monthly_rev["Sales"].shift(3)

# Rolling averages
monthly_rev["rolling_3m"] = monthly_rev["Sales"].shift(1).rolling(3).mean()
monthly_rev["rolling_6m"] = monthly_rev["Sales"].shift(1).rolling(6).mean()

# Drop rows with NaN from lag creation
monthly_rev.dropna(inplace=True)

print("\nFeature set preview:")
print(monthly_rev[["Period","Sales","lag_1","lag_2","rolling_3m"]].head())


# ============================================================
# STEP 5 — TRAIN / TEST SPLIT
# ============================================================
features = ["Month", "Quarter", "lag_1", "lag_2", "lag_3", "rolling_3m", "rolling_6m"]
target   = "Sales"

X = monthly_rev[features]
y = monthly_rev[target]

# Keep last 6 months as test set (time-ordered split — no shuffle!)
split_idx = len(X) - 6
X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]

print(f"\nTrain: {len(X_train)} months | Test: {len(X_test)} months")


# ============================================================
# STEP 6 — BASELINE: LINEAR REGRESSION
# ============================================================
lr = LinearRegression()
lr.fit(X_train, y_train)
lr_preds = lr.predict(X_test)

lr_mae  = mean_absolute_error(y_test, lr_preds)
lr_rmse = np.sqrt(mean_squared_error(y_test, lr_preds))
lr_mape = np.mean(np.abs((y_test - lr_preds) / y_test)) * 100

print(f"\n── Linear Regression ──")
print(f"  MAE : ${lr_mae:,.0f}")
print(f"  RMSE: ${lr_rmse:,.0f}")
print(f"  MAPE: {lr_mape:.1f}%")


# ============================================================
# STEP 7 — UPGRADE: XGBOOST
# ============================================================
xgb = XGBRegressor(
    n_estimators=200,
    learning_rate=0.05,
    max_depth=4,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42
)
xgb.fit(X_train, y_train)
xgb_preds = xgb.predict(X_test)

xgb_mae  = mean_absolute_error(y_test, xgb_preds)
xgb_rmse = np.sqrt(mean_squared_error(y_test, xgb_preds))
xgb_mape = np.mean(np.abs((y_test - xgb_preds) / y_test)) * 100

print(f"\n── XGBoost ──")
print(f"  MAE : ${xgb_mae:,.0f}")
print(f"  RMSE: ${xgb_rmse:,.0f}")
print(f"  MAPE: {xgb_mape:.1f}%")


# ============================================================
# STEP 8 — VISUALISE: ACTUAL vs PREDICTED
# ============================================================
test_periods = monthly_rev["Period"].iloc[split_idx:].values

plt.figure(figsize=(12, 5))
plt.plot(test_periods, y_test.values,    label="Actual",           marker="o", linewidth=2)
plt.plot(test_periods, lr_preds,         label="Linear Regression",marker="s", linestyle="--")
plt.plot(test_periods, xgb_preds,        label="XGBoost",          marker="^", linestyle="--")
plt.title("Actual vs Predicted Monthly Revenue", fontsize=14, fontweight="bold")
plt.ylabel("Sales (USD)")
plt.legend()
plt.tight_layout()
plt.savefig("04_actual_vs_predicted.png", dpi=150)
plt.show()


# ============================================================
# STEP 9 — FEATURE IMPORTANCE (XGBoost)
# ============================================================
importance = pd.Series(xgb.feature_importances_, index=features).sort_values(ascending=True)

importance.plot(kind="barh", color="#1a73e8", figsize=(7, 4))
plt.title("XGBoost Feature Importance", fontweight="bold")
plt.xlabel("Importance Score")
plt.tight_layout()
plt.savefig("05_feature_importance.png", dpi=150)
plt.show()


# ============================================================
# STEP 10 — BONUS: PROPHET (time series specialist)
# ============================================================
# Prophet handles seasonality and trends automatically.
# Uncomment after: pip install prophet

# from prophet import Prophet
#
# prophet_df = monthly_rev[["Period", "Sales"]].rename(columns={"Period": "ds", "Sales": "y"})
# m = Prophet(yearly_seasonality=True, weekly_seasonality=False, daily_seasonality=False)
# m.fit(prophet_df.iloc[:split_idx])
#
# future   = m.make_future_dataframe(periods=6, freq="MS")
# forecast = m.predict(future)
# m.plot(forecast)
# plt.title("Prophet Revenue Forecast")
# plt.tight_layout()
# plt.savefig("06_prophet_forecast.png", dpi=150)
# plt.show()


# ============================================================
# SUMMARY TABLE
# ============================================================
results = pd.DataFrame({
    "Model":  ["Linear Regression", "XGBoost"],
    "MAE":    [f"${lr_mae:,.0f}",   f"${xgb_mae:,.0f}"],
    "RMSE":   [f"${lr_rmse:,.0f}",  f"${xgb_rmse:,.0f}"],
    "MAPE %": [f"{lr_mape:.1f}%",   f"{xgb_mape:.1f}%"],
})
print("\n── Model Comparison ──")
print(results.to_string(index=False))

print("\n✅ All charts saved as PNG files in your working directory.")
print("   Add them to your portfolio writeup and GitHub README.")
