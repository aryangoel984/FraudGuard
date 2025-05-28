import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import classification_report, roc_auc_score
from imblearn.over_sampling import SMOTE

# Load dataset
df = pd.read_csv('data/transactions_train.csv')

print("📊 Columns in dataset:", df.columns.tolist())

# Rename columns (mapping your dataset to standard names)
column_mapping = {
    'transaction_payment_mode_anonymous': 'transaction_payment_mode',
    'payment_gateway_bank_anonymous': 'payment_gateway_bank',
    'payer_email_anonymous': 'payer_email',
    'payer_mobile_anonymous': 'payer_mobile',
    'payer_browser_anonymous': 'payer_browser',
    'payee_id_anonymous': 'payee_id',
    'transaction_id_anonymous': 'transaction_id'
}
df.rename(columns=column_mapping, inplace=True)

# Automatically detect categorical columns
categorical_cols = []
for col in df.columns:
    if df[col].dtype == 'object' and col not in ['transaction_date']:
        categorical_cols.append(col)

# Label Encode detected categoricals
le = LabelEncoder()
for col in categorical_cols:
    df[col] = le.fit_transform(df[col].astype(str))
    print(f"✅ Encoded: {col}")

# Features & Target
feature_cols = [col for col in df.columns if col not in ['transaction_date', 'transaction_id', 'is_fraud']]
X = df[feature_cols]
y = df['is_fraud']

# Impute missing values BEFORE scaling
imputer = SimpleImputer(strategy='mean')
X_imputed = imputer.fit_transform(X)
joblib.dump(imputer, 'models/imputer.pkl')

# Standardize data
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_imputed)
joblib.dump(scaler, 'models/scaler.pkl')

# ✅ Step 1: Split original data first
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, stratify=y, random_state=42
)

print("⚠️ Original train distribution:", pd.Series(y_train).value_counts().to_dict())
print("⚠️ Original test distribution:", pd.Series(y_test).value_counts().to_dict())

# ✅ Step 2: Apply SMOTE only on training set
smote = SMOTE(random_state=42)
X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)
print("✅ After SMOTE - Training distribution:", pd.Series(y_train_resampled).value_counts().to_dict())

# Step 3: Define models
models = {
    "random_forest": RandomForestClassifier(n_estimators=100, class_weight='balanced', random_state=42),
    "gradient_boosting": GradientBoostingClassifier(n_estimators=100, random_state=42),
    "logistic_regression": LogisticRegression(max_iter=1000, class_weight='balanced', random_state=42),
    "neural_network": MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=300, random_state=42)
}

# Step 4: Train & Save models
for name, model in models.items():
    model.fit(X_train_resampled, y_train_resampled)
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    print(f"\n----- {name.upper()} -----")
    print(classification_report(y_test, y_pred, zero_division=0))
    print("ROC AUC Score:", roc_auc_score(y_test, y_prob))
    joblib.dump(model, f'models/{name}_model.pkl')
    print(f"✅ Saved {name}_model.pkl")

print("🎯 All models trained on balanced data and tested on real imbalanced data!")
