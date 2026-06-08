# FraudGuard — Fraud Detection, Alert & Monitoring System
### Execute 4.0 Hackathon · SabPaisa · **Winning Project**

**Live Demo:** [fraudguard-pearl.vercel.app/](https://fraudguard-pearl.vercel.app/)

---

## What We Built

FraudGuard is an end-to-end Fraud Detection, Alert, and Monitoring (FDAM) platform built for SabPaisa, a real payment gateway handling thousands of transactions daily. The system combines rule-based logic, five machine learning models, and unsupervised anomaly detection to identify fraudulent transactions in real-time with sub-300ms response time.

The platform is not just a model — it is a complete operational system: a live analyst dashboard, a no-code rule builder powered by natural language processing, a real-time detection API, batch processing for bulk scoring, and a self-improving feedback loop that retrains models as new confirmed fraud is reported.

---

## The Problem

SabPaisa posed five core fraud detection challenges:

| Challenge | Description |
|---|---|
| Fraudulent transaction detection | Identifying fraud among 172,926 transactions where only 11 are fraudulent (0.0064% fraud rate) |
| Real-time prevention | Detection must complete within 300ms — batch or delayed systems cannot prevent fraud once a transaction is processed |
| Anomaly detection | Flagging unusual behaviour (high-value transactions, device/location mismatches) that rule-based systems miss |
| Extreme class imbalance | 0.006% fraud rate makes raw accuracy meaningless — a model predicting everything as "not fraud" achieves 99.994% accuracy |
| Scalable monitoring | Enterprise-grade system integrating with payment gateways, supporting millions of transactions, with continuous analyst tooling |

---

## Dataset

The training data comprised real SabPaisa payment gateway transactions covering six days (November 1–6, 2024).

| Property | Value |
|---|---|
| Total transactions | 172,926 rows × 12 columns |
| Fraud cases | 11 (0.0064%) |
| Legitimate cases | 172,915 (99.9936%) |
| Average legitimate amount | INR 1,577.52 |
| Average fraud amount | INR 6,561.36 (4.16× higher) |
| Fraud amount range | INR 300 – INR 24,990 |
| Unique payer emails | 41,146 |
| Unique payee IDs | 414 |
| Test set (submission) | 148,228 transactions |

### Key Data Observations

**Extreme imbalance:** 11 fraud cases in 172,926 transactions. Standard models predict everything as "not fraud" and achieve 99.99% accuracy — making accuracy a completely misleading metric. We used ROC-AUC and Precision-Recall AUC instead.

**Fraud profile:** Fraud transactions clustered on the mobile channel (6 of 11 frauds) and showed transaction amounts averaging 4× higher than legitimate transactions.

**Structural missing data:** `payer_mobile` had 60% missing values — not random missingness, but structural: web transactions (93% of data) do not capture mobile numbers. This was treated as a meaningful signal rather than noise, with a binary `has_mobile` feature created to capture the correlation with transaction channel.

**Data quality issue discovered:** `transaction_channel` had values 'w' and 'W' representing the same web channel — required normalisation during preprocessing.

**`payee_ip_anonymous`:** Identical hash across nearly all records, suggesting a single merchant endpoint — a key data quality observation that informed feature selection.

---

## Solution Architecture

The system is divided into three service layers communicating over RESTful APIs:

### Layer 1 — Platform Services (Port 3000)
Next.js frontend serving the FraudGuard analyst dashboard, backed by Node.js API routes handling: rules management, analytics aggregation, real-time detection proxying, batch processing, and reporting. All Node.js backends communicate with the ML layer via internal HTTP calls to Port 8000.

### Layer 2 — Rules Engine (Port 3000)
A Groq NLP Server using HuggingFace's `distil-whisper-large-v3-en` model parses natural language rule descriptions typed by analysts. The NLP output is converted to executable Python rule logic via `Rules.py` and stored in PostgreSQL. This enables non-technical fraud analysts to create and deploy detection rules without developer intervention.

### Layer 3 — Model Services (Port 8000)
FastAPI Python backend serving the real-time detection API, batch API, and reporting API. All endpoints are backed by trained scikit-learn/XGBoost/Keras models loaded as `.pkl` files at server startup (pre-loading eliminates per-request disk I/O, a key contributor to the sub-300ms SLA). An `api.py` orchestrator manages the rule-check-first, then model-inference flow.

### Database
PostgreSQL running in Docker (Port 5321), accessed from Node.js via Prisma ORM for type-safe, SQL-injection-safe queries. All transaction decisions, analyst-reported fraud confirmations, and configured rules are persisted here.

---

## Machine Learning Pipeline

### The Imbalance Problem and SMOTEENN

With only 11 fraud cases in 172,926 training transactions, standard training produces models that ignore the minority class entirely. We applied **SMOTEENN** — a two-stage resampling technique:

1. **SMOTE (Synthetic Minority Oversampling Technique):** Creates synthetic fraud samples by interpolating between real fraud examples in feature space, dramatically increasing minority class representation.
2. **ENN (Edited Nearest Neighbours):** Removes samples from either class that are misclassified by their nearest neighbours — cleaning ambiguous borderline examples that SMOTE can introduce.

Result after SMOTEENN: **110,156 fraud : 110,637 legitimate** — from the original 11 : 172,915. The cleaned, balanced dataset produces models with meaningful discriminatory power on the minority class.

### Feature Engineering

Nine features were engineered from the raw transaction data:

| Feature | Type | Key Insight |
|---|---|---|
| `transaction_amount` | Float | Fraud averages 4× higher; primary rule-based signal |
| `transaction_channel` | Categorical (encoded) | Mobile channel disproportionately represented in fraud (6/11 cases) |
| `transaction_payment_mode_anonymous` | Int (encoded) | Fraud seen in specific modes (10, 2, 6); mode 0 is dominant legitimate |
| `payer_email_anonymous` | Label encoded | 41,146 unique payers; enables payer-level velocity and deviation tracking |
| `payee_id_anonymous` | Label encoded | Certain merchant accounts receive disproportionate fraud |
| `has_mobile` | Binary (engineered) | Presence/absence of mobile number correlates with channel and fraud |
| `hour_of_day` | Extracted | Fraud shows daytime clustering |
| `payment_gateway_bank_anonymous` | Label encoded | Gateway 6 appeared in majority of fraud cases |
| `payee_ip_anonymous` | Label encoded | IP-level pattern signal |

**High-cardinality encoding:** `payer_email_anonymous` has 41,146 unique hashed values — too many for one-hot encoding. Label encoding was used to assign integer IDs (preserving identity while keeping dimensionality manageable). Target encoding was considered but rejected: with only 11 fraud cases, encoding by mean fraud rate per payer would severely overfit.

### Why a Hybrid Approach

No single model handles extreme imbalance optimally across all fraud types:

- **Rule-based (zero latency):** Catches obvious, high-confidence fraud instantly — flagging any transaction above INR 50,000, known suspicious patterns. Runs in microseconds before any ML inference.
- **Supervised ML (learned patterns):** Random Forest, XGBoost, Neural Network, and Logistic Regression capture complex feature interactions learned from the SMOTEENN-balanced historical data.
- **Unsupervised anomaly detection (novel patterns):** Isolation Forest flags statistically unusual transactions without requiring labelled fraud examples — critical for detecting fraud types not seen during training.
- **Ensemble (combined decision):** A meta-model averaging predictions from all supervised models, reducing variance and balancing recall against precision.

### Model Results

| Model | Train Time | ROC-AUC | Auto-Tuned Threshold | Recall (Fraud) | Notes |
|---|---|---|---|---|---|
| Isolation Forest | ~few sec | N/A | N/A | N/A | Unsupervised; flags statistical outliers |
| Random Forest | 80.77 sec | 0.7476 | 0.557 | 0.50 | Precision = 0.25 on fraud class |
| Logistic Regression | 0.51 sec | 0.9670 | 0.900 | 0.00 | High overall AUC but zero fraud recall |
| Neural Network | 10.42 sec | 0.9996 | 0.671 | 0.50 | Highest ROC-AUC among supervised |
| XGBoost | 0.89 sec | **0.9999** | 0.345 | 0.50 | Near-perfect AUC; fastest training |
| Ensemble (Final) | 82.2 sec | 0.9797 | 0.443 | 0.50 | Combined; balances recall and precision |

### Threshold Auto-Tuning

Each model's default classification threshold of 0.5 is suboptimal for imbalanced data. After training, a sweep from 0.01 to 0.99 on the validation set selects the threshold maximising F1-Score per model. XGBoost's auto-tuned threshold of **0.345** means it flags a transaction as fraud with only 34.5% model confidence — deliberately aggressive to prioritise recall in a scenario where missed fraud is more costly than false alarms.

### Why ROC-AUC as Primary Metric

With 0.006% fraud rate, accuracy is deceptive — a model predicting everything as "not fraud" achieves 99.994% accuracy. ROC-AUC measures the model's ability to rank fraud above legitimate transactions across all possible thresholds. XGBoost's ROC-AUC of 0.9999 indicates near-perfect discriminatory power. Precision-Recall AUC is used as the secondary metric: it focuses exclusively on the minority class and is more informative than ROC-AUC when the positive class is extremely rare.

### XGBoost Confusion Matrix (Best Single Model)

On the test set (27,668 samples, 2 fraud cases):

| | Predicted Legit | Predicted Fraud |
|---|---|---|
| **Actual Legit** | 27,666 (TN) | 0 (FP) |
| **Actual Fraud** | 1 (FN) | 1 (TP) |

Precision = 1.0, Recall = 0.50, F1 = 0.67. Zero false positives — no legitimate transactions wrongly blocked.

---

## Real-Time Detection Flow

When a transaction arrives at `POST /api/fraud/detect`:

1. Transaction hits the Node.js API (Port 3000)
2. Node.js forwards to FastAPI on Port 8000
3. FastAPI checks the rule engine first — configured rules (high amount, new device, location mismatch) are evaluated. If a rule fires, the system returns immediately with `fraud_source: "rule"` — no ML inference needed
4. If no rule fires, feature engineering is applied to the transaction
5. The ensemble model runs (internally calling RF, NN, XGBoost, LR)
6. Response returned: `is_fraud`, `fraud_score` (0–1), `fraud_reason`, `fraud_source: "model"`
7. Result stored in PostgreSQL for analytics

**Total end-to-end latency: under 300ms.** Achieved by pre-loading `.pkl` models into memory at FastAPI startup, async architecture, and rule-first short-circuiting for obvious cases.

---

## APIs

| Endpoint | Method | Description |
|---|---|---|
| `/api/fraud/detect` | POST | Real-time single transaction detection. Returns `is_fraud`, `fraud_score`, `fraud_source`, `fraud_reason` in under 300ms |
| `/api/fraud/batch` | POST | Batch processing: upload CSV/JSON of multiple transactions; returns fraud predictions for all. Used to generate the hackathon submission |
| `/api/fraud/report` | GET | Analysts report confirmed fraud cases; feeds the self-improving feedback loop |

**Hackathon submission:** The batch API processed 148,228 test transactions and predicted 6 as fraud (0.004% predicted fraud rate), producing `submission_Spark.csv`.

---

## Self-Improving Feedback Loop

When fraud analysts confirm a transaction as fraud through the Reporting API, that confirmation is stored in PostgreSQL. Periodically, the `model_training.py` retraining pipeline picks up confirmed fraud data, adds it to the training set, rebalances with SMOTEENN, retrains all five models, and redeploys the updated `.pkl` files to the FastAPI server. This ensures the system improves accuracy over time as real fraud is confirmed — addressing the fundamental problem that fraud patterns evolve and static models degrade.

---

## Dashboard and Product Features

### Analyst Dashboard
Four key panels: KPI tiles (Total Transactions, Predicted Frauds, Reported Frauds, Detection Accuracy with month-over-month delta); Fraud Detection Trend (line chart comparing predicted vs. reported frauds over time); Fraud by Dimension (bar chart filterable by transaction channel — Web: 750 predicted/650 reported, Mobile: 450/350, API: 124/24); and a Model Evaluation tab with confusion matrix and feature importance visualisations.

### No-Code Rule Builder
A drag-reorderable rule interface with three tabs: Rule Engine, Model Settings, and Rule Testing. Analysts see and toggle rules grouped by category — Transaction Amount Rules (`transaction_amount > 50000`; `transaction_amount > avg_user_transaction * 5`) and Location & Device Rules (`user_country != transaction_country`; `is_new_device == true && transaction_amount > 10000`). Analysts can also type new rules in plain English; the NLP engine converts the natural language to executable rule logic automatically.

### API Testing Interface
An integrated testing environment within the dashboard. Analysts fill a transaction form (ID, amount, channel, payment mode, bank, email, mobile, device, browser), submit it, and see the raw JSON request and response side by side alongside a visual fraud score bar. Enables immediate evaluation of rule changes and model behaviour on specific transactions without writing code.

---

## Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui | App Router for SSR/SSG; TypeScript for type safety; shadcn for production-grade components |
| Platform backend | Next.js API Routes (Node.js), Prisma ORM | Co-located API routes with frontend; Prisma for type-safe, SQL-injection-safe database access |
| ML backend | FastAPI (Python), scikit-learn, XGBoost, TensorFlow/Keras | Python-native ML ecosystem; async-first for high throughput; auto-generates OpenAPI docs |
| Database | PostgreSQL (Docker, Port 5321) | ACID compliance for financial data integrity; Docker for consistent dev/prod environments |
| NLP / Rules | Groq NLP Server, HuggingFace `distil-whisper-large-v3-en` | Natural language rule parsing enables non-technical analysts to create rules without code |
| Data visualisation | Chart.js | Lightweight browser-native charts for real-time fraud trend displays |
| Deployment | Vercel (frontend), Docker (DB), custom server (FastAPI) | Vercel instant CI/CD for Next.js; Docker for environment parity |

---

## Competitive Differentiation

| Competitor Type | Their Weakness | Our Advantage |
|---|---|---|
| Traditional rule-based systems | Rigid, static rules; fail against evolving fraud patterns; no learning | Rules + ML + anomaly detection; continuous feedback loop; adapts to new patterns |
| Single-model ML solutions | Single model blind spots; high false positives or false negatives | Multi-model ensemble + anomaly detection; better recall while reducing false positives |
| SaaS tools (Stripe Radar, Sift) | Limited customisation; expensive; black-box models | Fully customisable rule engine; explainable AI with fraud reasons; domain-specific tuning |

---

## What We Would Build Next

**Graph-based fraud detection:** Model relationships between payers, payees, devices, and IPs as a network graph. Fraudsters form networks detectable only through graph analysis — a connected fraudster ring may not be visible on individual transaction data alone.

**Real-time feature store:** Instead of computing features per-request from scratch, maintain a live feature store (e.g., Redis) tracking each payer's running average amount, transaction velocity, and device history. This would dramatically improve feature quality for velocity-based fraud patterns.

**SHAP/LIME explainability:** Provide fraud analysts the specific feature contributions that drove each flagged transaction's fraud score. Currently `fraud_reason` gives a rule or model label; SHAP would give a ranked list of contributing features, improving analyst trust and supporting appeal resolution.

**Adaptive thresholds:** Current thresholds are auto-tuned once on the validation set. A production system should adjust thresholds dynamically based on operational feedback — if false positive rates rise, the threshold shifts; if fraud catch rate drops, it shifts the other way.

---

## Key Metrics at a Glance

| Metric | Value |
|---|---|
| Training transactions | 172,926 |
| Fraud cases (training) | 11 (0.0064%) |
| After SMOTEENN (fraud : legit) | 110,156 : 110,637 |
| Test transactions (submission) | 148,228 |
| Predicted frauds (submission) | 6 (0.004%) |
| Best ROC-AUC (XGBoost) | 0.9999 |
| Ensemble ROC-AUC | 0.9797 |
| Real-time response SLA | < 300ms |
| Average fraud transaction amount | INR 6,561 (4× above legitimate) |
| ML models built | 6 (Isolation Forest, RF, LR, NN, XGBoost, Ensemble) |
| XGBoost auto-tuned threshold | 0.345 |
