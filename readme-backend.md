# FareLens Backend Documentation

Welcome to the backend architecture of **FareLens**, a state-of-the-art flight fare prediction and analytics service. This backend combines robust, real-time data ingestion pipelines, automated ETL workflows, and advanced machine learning modeling layers to deliver high-precision price predictions and transparent feature explanations.

---

## 🛠️ Architecture Overview

The platform is designed around a scalable cloud-native architecture optimized for throughput and predictive accuracy:

### 1. Data Ingestion & Streaming
* **High-Throughput Ingestion:** Leverages **Amazon Kinesis Data Streams** capable of handling over 10,000+ flight search events/sec.
* **Cold Storage Data Lake:** Dispatches raw streams via **Kinesis Firehose** into an **S3 Raw Data Lake** as compressed, raw JSON files.

### 2. Processing & ETL (Feature Refinery)
* **PySpark ETL Pipelines:** Triggered automatically (via Lambda on S3 upload events) using **AWS Glue**.
* **Feature Engineering:** Flattens nested search trees, parses timestamps, extracts seasonality trends, and computes rolling averages.
* **Curated Data Store:** Saves processed records to an **S3 Curated Lake** in optimized column-store **Parquet** format.

### 3. Analytics & Queries
* **Amazon Athena:** Used for running low-latency SQL queries over the curated Parquet dataset for reporting and market trends.

---

## 🤖 Machine Learning Modeling Layers

FareLens uses three distinct model pipelines to provide comprehensive fare analysis:

### 1. Price Regression Engine
* **Algorithm:** XGBoost Regressor (`XGBRegressor`)
* **Objective:** Predicts the numeric price of a specific flight selection.
* **Input Features:** 25+ engineered indicators including booking lead time (`days_left`), flight duration, airline, time-of-day category, and route stops.
* **Accuracy Bounds:** Average Mean Absolute Error (MAE) evaluated, yielding an $R^2 > 0.85$ and $RMSE < \$15$.

### 2. Out-of-Distribution (OOD) Z-Score Safeguard
* **Logic:** Computes standard deviations and means on key variables like flight duration and days left.
* **Safety Net:** If a request’s Z-score exceeds `3.0`, it flags the transaction as OOD and dynamically doubles the prediction confidence intervals (using $2 \times MAE$) to reflect the higher uncertainty.

### 3. Per-Request Explainable AI (SHAP)
* **Explainer:** Runs **SHAP (SHapley Additive exPlanations)** on the fly via `shap.TreeExplainer`.
* **Attribution:** Decomposes the predicted price relative to the model baseline (`base_value`), listing top positive/negative contribution weights.
* **Waterfall Consistency:** Ensures `base_value + sum(contributions) + other_features_impact` perfectly aligns with the final predicted price.

---

## 📂 Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py             # User Authentication (Login, Signup, JWT validation)
│   │       ├── predict.py          # Real-time XGBoost price prediction endpoint
│   │       ├── model.py            # Model metadata, versioning, and global stats
│   │       ├── alerts.py           # User-configured price thresholds & alerts
│   │       ├── analytics.py        # Aggregated route pricing analytics
│   │       └── watchlists.py       # Saved lists for fare tracking
│   ├── core/
│   │   ├── config.py               # Settings parser & environment configuration
│   │   ├── rate_limit.py           # SlowAPI limiter setup
│   │   └── scheduler.py            # Background job scheduling (apscheduler)
│   ├── ml/
│   │   ├── artifacts/              # Serialized XGBoost model.json & metadata.json
│   │   └── features.py             # Request-time transformation pipelines
│   ├── services/
│   │   └── prediction.py           # Core PredictionService (Inference + SHAP)
│   └── main.py                     # FastAPI application entrypoint
```

---

## ⚡ Setup & Execution

### 1. Virtual Environment & Dependencies
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Or venv\Scripts\activate on Windows
pip install -r requirements-run.txt
```

### 2. Running the Development Server
The API server runs via Uvicorn with automatic hot-reloading:
```bash
uvicorn app.main:app --reload
```

---

## 🔒 API Specifications (v1)

* **`POST /api/v1/predict`**
  * Invokes `PredictionService` to score a flight details payload.
  * *Returns:* `predicted_price`, `confidence_low`, `confidence_high`, `out_of_distribution`, and `shap_contributions`.
* **`POST /api/v1/auth/register`** / **`POST /api/v1/auth/login`**
  * Handles authentication token creation and validation.
* **`GET /api/v1/model/info`**
  * Fetches the active model version, metrics (MAE, RMSE, $R^2$), and global feature importances.
