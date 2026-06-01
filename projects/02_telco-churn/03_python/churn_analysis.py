# ============================================================
#  churn_analysis.py — Telco Customer Churn Prediction
#  Dataset: IBM Telco Customer Churn (Kaggle, 7,043 rows)
#  Task: Binary Classification — predict Churn = Yes/No
# ============================================================

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection  import train_test_split, StratifiedKFold, cross_val_score
from sklearn.linear_model     import LogisticRegression
from sklearn.ensemble         import RandomForestClassifier
from sklearn.preprocessing    import StandardScaler
from sklearn.metrics          import (classification_report, confusion_matrix,
                                      roc_auc_score, roc_curve, ConfusionMatrixDisplay)
from xgboost import XGBClassifier
import warnings, os, logging
from datetime import datetime
warnings.filterwarnings("ignore")
plt.style.use("seaborn-v0_8-whitegrid")

OUTPUT_DIR = "../06_outputs"
LOGS_DIR = "../08_logs"
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(LOGS_DIR, exist_ok=True)

# Setup logging
log_file = os.path.join(LOGS_DIR, f"churn_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)
logger.info("=" * 60)
logger.info("TELCO CHURN ANALYSIS STARTED")
logger.info("=" * 60)

COLORS = {"churn": "#EA4335", "retain": "#1A73E8", "accent": "#34A853"}


# ============================================================
# STEP 1 — LOAD & INSPECT
# ============================================================
logger.info("STEP 1: Loading and inspecting data...")
df = pd.read_csv("../01_data/WA_Fn-UseC_-Telco-Customer-Churn.csv")
logger.info(f"✓ Data loaded. Shape: {df.shape}")
logger.info(f"Columns: {list(df.columns)}")
print(f"Shape: {df.shape}")
print(df.head())
print(f"\nChurn breakdown:\n{df['Churn'].value_counts()}")
churn_pct = df['Churn'].eq('Yes').mean()*100
print(f"Churn rate: {churn_pct:.1f}%")
logger.info(f"✓ Churn rate: {churn_pct:.1f}%")


# ============================================================
# STEP 2 — CLEAN
# ============================================================
logger.info("STEP 2: Cleaning data...")
# TotalCharges has blanks for new customers (tenure=0)
df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce").fillna(0)

# Binary target
df["churned"] = (df["Churn"] == "Yes").astype(int)

# Drop raw Churn column and customerID
df.drop(columns=["Churn", "customerID"], inplace=True)

logger.info(f"✓ Data cleaned. Missing values: {df.isnull().sum().sum()}")
print(f"\nMissing after clean:\n{df.isnull().sum()[df.isnull().sum() > 0]}")


# ============================================================
# STEP 3 — EDA
# ============================================================
logger.info("STEP 3: Generating exploratory data analysis visualizations...")

# 3a. Churn rate overall
logger.info("  - Generating target distribution chart...")
fig, ax = plt.subplots(figsize=(6, 4))
df["churned"].value_counts().rename({0: "Retained", 1: "Churned"}).plot(
    kind="bar", color=[COLORS["retain"], COLORS["churn"]], ax=ax)
ax.set_title("Overall Churn Distribution", fontweight="bold")
ax.set_ylabel("Customers")
ax.set_xticklabels(["Retained", "Churned"], rotation=0)
plt.tight_layout()
plt.savefig(f"{OUTPUT_DIR}/01_target_distribution.png", dpi=150)
logger.info("  ✓ Saved: 01_target_distribution.png")
plt.show()

# 3b. Churn by Contract Type
logger.info("  - Generating churn by contract chart...")
churn_contract = df.groupby("Contract")["churned"].mean().sort_values(ascending=False) * 100
fig, ax = plt.subplots(figsize=(7, 4))
churn_contract.plot(kind="bar", color=COLORS["churn"], ax=ax)
ax.set_title("Churn Rate by Contract Type", fontweight="bold")
ax.set_ylabel("Churn Rate (%)")
ax.set_xticklabels(churn_contract.index, rotation=15)
for i, v in enumerate(churn_contract):
    ax.text(i, v + 0.5, f"{v:.1f}%", ha="center", fontsize=10, fontweight="bold")
plt.tight_layout()
plt.savefig(f"{OUTPUT_DIR}/03_churn_by_contract.png", dpi=150)
logger.info("  ✓ Saved: 03_churn_by_contract.png")
plt.show()

# 3c. Monthly charges distribution: churned vs retained
logger.info("  - Generating charges distribution chart...")
fig, ax = plt.subplots(figsize=(8, 4))
df[df["churned"]==1]["MonthlyCharges"].hist(
    bins=30, alpha=0.7, color=COLORS["churn"],  label="Churned",   ax=ax)
df[df["churned"]==0]["MonthlyCharges"].hist(
    bins=30, alpha=0.7, color=COLORS["retain"], label="Retained",  ax=ax)
ax.set_title("Monthly Charges: Churned vs Retained", fontweight="bold")
ax.set_xlabel("Monthly Charges")
ax.legend()
plt.tight_layout()
plt.savefig(f"{OUTPUT_DIR}/03b_charges_distribution.png", dpi=150)
logger.info("  ✓ Saved: 03b_charges_distribution.png")
plt.show()

# 3d. Tenure distribution
logger.info("  - Generating tenure distribution chart...")
fig, ax = plt.subplots(figsize=(8, 4))
df[df["churned"]==1]["tenure"].hist(
    bins=30, alpha=0.7, color=COLORS["churn"],  label="Churned",  ax=ax)
df[df["churned"]==0]["tenure"].hist(
    bins=30, alpha=0.7, color=COLORS["retain"], label="Retained", ax=ax)
ax.set_title("Tenure Distribution: Churned vs Retained", fontweight="bold")
ax.set_xlabel("Tenure (months)")
ax.legend()
plt.tight_layout()
plt.savefig(f"{OUTPUT_DIR}/03c_tenure_distribution.png", dpi=150)
logger.info("  ✓ Saved: 03c_tenure_distribution.png")
plt.show()
logger.info("✓ STEP 3 complete: EDA visualizations generated")


# ============================================================
# STEP 4 — FEATURE ENGINEERING
# ============================================================
logger.info("STEP 4: Engineering features...")
# Services subscribed count (more services = more sticky)
service_cols = ["OnlineSecurity","OnlineBackup","DeviceProtection",
                "TechSupport","StreamingTV","StreamingMovies"]
df["services_count"] = (df[service_cols] == "Yes").sum(axis=1)

# Charges per month of tenure (value density)
df["charge_per_tenure"] = df["MonthlyCharges"] / df["tenure"].replace(0, 1)

# High value flag
df["is_high_value"] = (df["MonthlyCharges"] > df["MonthlyCharges"].median()).astype(int)
logger.info("✓ STEP 4 complete: 3 new features created")


# ============================================================
# STEP 5 — ENCODE & PREPARE
# ============================================================
logger.info("STEP 5: Encoding categorical variables...")
df_model = df.copy()

# Binary Yes/No columns
yes_no_cols = ["Partner","Dependents","PhoneService","PaperlessBilling"]
for col in yes_no_cols:
    df_model[col] = (df_model[col] == "Yes").astype(int)

# MultipleLines: No phone service → 0, No → 0, Yes → 1
df_model["MultipleLines"] = (df_model["MultipleLines"] == "Yes").astype(int)

# Service columns
for col in service_cols:
    df_model[col] = (df_model[col] == "Yes").astype(int)

# One-hot encode remaining categoricals
cat_cols = df_model.select_dtypes(include="object").columns.tolist()
df_model = pd.get_dummies(df_model, columns=cat_cols, drop_first=True)

logger.info(f"✓ STEP 5 complete: Encoded to {df_model.shape[1] - 1} features")
print(f"\nFeature count after encoding: {df_model.shape[1] - 1}")
print(df_model.dtypes)


# ============================================================
# STEP 6 — CORRELATION HEATMAP
# ============================================================
logger.info("STEP 6: Analyzing feature correlations...")
# Top 15 features correlated with churn
top_corr = df_model.corr()["churned"].abs().sort_values(ascending=False)[1:16]
fig, ax = plt.subplots(figsize=(8, 5))
top_corr.sort_values().plot(kind="barh", color="#1A73E8", ax=ax)
ax.set_title("Top 15 Features Correlated with Churn", fontweight="bold")
ax.set_xlabel("Absolute Correlation")
plt.tight_layout()
plt.savefig(f"{OUTPUT_DIR}/02_correlation_churn.png", dpi=150)
logger.info("✓ STEP 6 complete: Saved correlation chart")
plt.show()


# ============================================================
# STEP 7 — TRAIN / TEST SPLIT
# ============================================================
logger.info("STEP 7: Splitting data into train/test sets...")
X = df_model.drop(columns=["churned"])
y = df_model["churned"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)
logger.info(f"✓ Train set: {len(X_train)} samples | Test set: {len(X_test)} samples")
print(f"\nTrain: {len(X_train)} | Test: {len(X_test)}")
print(f"Churn rate in test: {y_test.mean()*100:.1f}%")

# Scale for Logistic Regression
scaler = StandardScaler()
X_train_sc = scaler.fit_transform(X_train)
X_test_sc  = scaler.transform(X_test)
logger.info("✓ Data scaled for Logistic Regression")


# ============================================================
# STEP 8 — MODELS
# ============================================================
logger.info("STEP 8: Training 3 classification models...")
models = {
    "Logistic Regression": LogisticRegression(
        max_iter=1000, class_weight="balanced", random_state=42),
    "Random Forest": RandomForestClassifier(
        n_estimators=200, class_weight="balanced",
        max_depth=8, random_state=42),
    "XGBoost": XGBClassifier(
        n_estimators=300, learning_rate=0.05, max_depth=5,
        scale_pos_weight=(y_train==0).sum() / (y_train==1).sum(),
        random_state=42, eval_metric="logloss"),
}

results = {}
for name, model in models.items():
    logger.info(f"  Training: {name}...")
    X_tr = X_train_sc if name == "Logistic Regression" else X_train
    X_te = X_test_sc  if name == "Logistic Regression" else X_test

    model.fit(X_tr, y_train)
    preds = model.predict(X_te)
    proba = model.predict_proba(X_te)[:, 1]
    auc   = roc_auc_score(y_test, proba)
    rep   = classification_report(y_test, preds, output_dict=True)

    results[name] = {
        "AUC":       round(auc, 4),
        "F1":        round(rep["weighted avg"]["f1-score"], 4),
        "Precision": round(rep["weighted avg"]["precision"], 4),
        "Recall":    round(rep["weighted avg"]["recall"], 4),
    }
    logger.info(f"  ✓ {name} - AUC: {auc:.4f}")
    print(f"\n── {name} ──  AUC: {auc:.4f}")
    print(classification_report(y_test, preds))


# ============================================================
# STEP 9 — ROC CURVES
# ============================================================
logger.info("STEP 9: Generating ROC curves...")
plt.figure(figsize=(8, 6))
for name, model in models.items():
    X_te = X_test_sc if name == "Logistic Regression" else X_test
    proba = model.predict_proba(X_te)[:, 1]
    fpr, tpr, _ = roc_curve(y_test, proba)
    auc = roc_auc_score(y_test, proba)
    plt.plot(fpr, tpr, label=f"{name} (AUC={auc:.3f})", linewidth=2)
plt.plot([0,1],[0,1],"k--", linewidth=1, label="Random")
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate (Recall)")
plt.title("ROC Curves — Churn Prediction Models", fontweight="bold")
plt.legend(loc="lower right")
plt.tight_layout()
plt.savefig(f"{OUTPUT_DIR}/04_roc_curves.png", dpi=150)
logger.info("✓ STEP 9 complete: Saved ROC curves")
plt.show()


# ============================================================
# STEP 10 — CONFUSION MATRIX (XGBoost)
# ============================================================
logger.info("STEP 10: Generating confusion matrix for XGBoost...")
xgb_preds = models["XGBoost"].predict(X_test)
cm = confusion_matrix(y_test, xgb_preds)
disp = ConfusionMatrixDisplay(cm, display_labels=["Retained","Churned"])
fig, ax = plt.subplots(figsize=(6, 5))
disp.plot(ax=ax, colorbar=False, cmap="Blues")
ax.set_title("Confusion Matrix — XGBoost", fontweight="bold")
plt.tight_layout()
plt.savefig(f"{OUTPUT_DIR}/05_confusion_matrix.png", dpi=150)
logger.info("✓ STEP 10 complete: Saved confusion matrix")
plt.show()

tn, fp, fn, tp = cm.ravel()
logger.info(f"  TP: {tp} | FN: {fn} | FP: {fp} | TN: {tn}")
print(f"\nTrue Positives (caught churners):  {tp}")
print(f"False Negatives (missed churners): {fn}")
print(f"False Positives (wrong alerts):    {fp}")
print(f"True Negatives (correct retains):  {tn}")


# ============================================================
# STEP 11 — FEATURE IMPORTANCE (XGBoost)
# ============================================================
logger.info("STEP 11: Extracting feature importance from XGBoost...")
importance = pd.Series(
    models["XGBoost"].feature_importances_, index=X.columns
).sort_values(ascending=True).tail(15)

fig, ax = plt.subplots(figsize=(9, 6))
importance.plot(kind="barh", color="#1A73E8", ax=ax)
ax.set_title("Top 15 Features — XGBoost Churn Model", fontweight="bold")
ax.set_xlabel("Importance Score")
plt.tight_layout()
plt.savefig(f"{OUTPUT_DIR}/06_feature_importance.png", dpi=150)
logger.info("✓ STEP 11 complete: Saved feature importance chart")
plt.show()


# ============================================================
# STEP 12 — BUSINESS IMPACT ESTIMATE
# ============================================================
logger.info("STEP 12: Calculating business impact...")
retention_cost = 200    # KES per customer offered a retention deal
clv           = 2000    # KES average customer lifetime value
n_customers   = 5000    # hypothetical customer base
churn_rate    = 0.265   # from dataset
recall        = results["XGBoost"]["Recall"]

churners_caught  = int(n_customers * churn_rate * recall)
revenue_saved    = churners_caught * clv
intervention_cost = churners_caught * retention_cost
net_saving       = revenue_saved - intervention_cost

logger.info(f"  Churners flagged: {churners_caught} | Revenue saved: KES {revenue_saved:,.0f}")
logger.info(f"  Intervention cost: KES {intervention_cost:,.0f} | Net saving: KES {net_saving:,.0f}")
print(f"\n── Business Impact Estimate ──")
print(f"  Customers flagged as at-risk: {churners_caught}")
print(f"  Revenue saved:               KES {revenue_saved:,.0f}")
print(f"  Intervention cost:           KES {intervention_cost:,.0f}")
print(f"  Net saving per month:        KES {net_saving:,.0f}")


# ============================================================
# STEP 13 — SAVE RESULTS
# ============================================================
logger.info("STEP 13: Saving all results...")
results_df = pd.DataFrame(results).T.reset_index().rename(columns={"index": "Model"})
results_df.to_csv(f"{OUTPUT_DIR}/model_summary.csv", index=False)
logger.info(f"✓ Saved: model_summary.csv")
print(f"\n── Model Comparison ──")
print(results_df.to_string(index=False))
logger.info("✓ All outputs saved to 06_outputs/")
logger.info("=" * 60)
logger.info("✅ TELCO CHURN ANALYSIS COMPLETE")
logger.info("=" * 60)
logger.info(f"Log file: {log_file}")
print(f"\n✅ All outputs saved to {OUTPUT_DIR}/")
