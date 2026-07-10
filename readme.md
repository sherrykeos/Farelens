# FareLens: AI-Powered Flight Price Prediction & Analytics

[![React](https://img.shields.io/badge/React-18.2.0-blue?logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-green?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-blue?logo=postgresql)](https://www.postgresql.org/)
[![Vite](https://img.shields.io/badge/Vite-5.2.0-yellowgreen?logo=vite)](https://vitejs.dev/)

**FareLens** is a premium flight price prediction and analytics web application. It leverages a machine learning model to forecast airfare, helping travelers find the best time to book. The platform features an interactive dashboard, price-drop alerts, market analytics, and detailed prediction explanations.

The project is architected as a modern monorepo with a **React + Vite** frontend and a **FastAPI + SQLAlchemy** backend.

---

## ✨ Core Features

*   **🤖 AI-Powered Price Prediction**: Get accurate fare forecasts using an XGBoost model trained on over 300,000 real flight records.
*   **📊 Interactive Dashboard**: Visualize price trends, confidence intervals, and fare calendars.
*   **🔍 Explainable AI (XAI)**: Understand *why* a price is predicted with SHAP waterfall charts that break down feature impacts.
*   **🔔 Price Drop Alerts**: Create a watchlist for a route and receive email notifications when the price drops below your target.
*   **📈 Market Analytics**: Discover popular routes, compare average prices across airlines, and spot pricing anomalies.
*   **🔐 Secure Authentication**: JWT-based authentication with email verification, password reset, and secure profile management.
*   **🎨 Premium UI/UX**: A responsive, glassmorphic interface built with Tailwind CSS and Framer Motion for a fluid user experience.

---

## 🛠️ Tech Stack

The project is divided into two main parts: a frontend single-page application and a backend REST API.

### Frontend (`/frontend`)

Built for a fast, responsive, and visually rich user experience.

*   **Framework**: **React 18**
*   **Build Tool**: **Vite**
*   **Styling**: **Tailwind CSS**
*   **Routing**: **React Router**
*   **Animation**: **Framer Motion**
*   **Data Visualization**: **Recharts**
*   **API Client**: **Axios** with JWT interceptors

> For detailed frontend documentation, see `frontend/readme-frontend.md`.

### Backend (`/backend`)

A robust and scalable API server powering the application's logic and data access.

*   **Framework**: **FastAPI**
*   **Language**: **Python 3.11**
*   **Database**: **PostgreSQL** (via SQLAlchemy ORM)
*   **Migrations**: **Alembic**
*   **Authentication**: **JWT** tokens (via `python-jose`)
*   **Email Delivery**: **Brevo** for transactional emails
*   **Background Jobs**: Scheduled tasks for checking price alerts.
*   **Testing**: **Pytest**

### Data Pipeline

The machine learning model is powered by a data pipeline that processes raw flight data.

*   **ETL**: **AWS Glue** job for cleaning, transforming, and feature-engineering raw JSON data from S3.
*   **Storage**: **Amazon S3** for the data lake and **Parquet** for the curated dataset.
*   **ML Model**: **XGBoost** for regression, with **SHAP** for model explainability.

---

## 🚀 Getting Started

### Prerequisites

*   **Node.js** (v18 or higher)
*   **Python** (v3.11 or higher) with `pip` and `venv`
*   **PostgreSQL** database

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create a .env file from the example and configure your DATABASE_URL
cp .env.example .env
# -> Edit .env with your database connection string and other secrets

# Run database migrations
alembic upgrade head

# Start the backend server
uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000`.

### 2. Frontend Setup

```bash
# In a new terminal, navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
The frontend application will be available at `http://localhost:5173` (or as specified by Vite).

---

## 🧑‍💻 The Team

*   [**Sumit Kumar**](https://github.com/sumitDev11) - *Backend Developer*
    *   Architected the entire FastAPI backend, including REST endpoints, database schema, authentication, and background jobs.
*   [**Dolly**](https://github.com/dolly-bit) - *ML Developer*
    *   Built and trained the core XGBoost model, from data cleaning and feature engineering to hyperparameter tuning and SHAP integration.
*   [**Sharad Kumar**](https://github.com/sherrykeos) - *Frontend Developer*
    *   Designed and built the complete React frontend, translating complex data into a clear, interactive, and visually appealing user experience.
    

---


for in in Detail documention read [frontend-readme](/frontend/readme-frontend.md) and [backend-readme](/backend/readme-backend.md)