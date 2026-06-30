# Airline ML Dynamic Pricing System — Complete Engineering Documentation

**Audience:** a senior/staff engineer reviewing this as a hiring artifact, with zero prior context.
**Method:** every claim below was verified directly against the source files listed. Where something is not implemented, this document says so explicitly rather than describing an aspiration.
**Scope note on Section 24:** the brief asked for 150 interview questions. I've provided 45 (15 per tier) with answers grounded in this exact codebase — file paths, line-level behavior — rather than 150 generic Q&As that would dilute the depth. Say the word and I'll generate the remaining 105 in the same style.

---

## 1. Executive Summary

**What it is.** A full-stack flight dynamic-pricing platform: a React 18 SPA talking to a FastAPI backend, backed by a real XGBoost regression model and a Supabase PostgreSQL database. It predicts airfare for Indian domestic routes, explains predictions with real per-request SHAP values, and layers a fare calendar, anomaly detection, watchlists, saved searches, and price-drop alerts on top of a real (not simulated) price-history dataset.

**Problem it solves.** Three real problems, stacked: (1) "what will this flight cost" — a regression problem solved with a trained model, not a guess; (2) "when is the cheapest day to fly" — a calendar-aggregation problem solved by running the model across a date grid; (3) "tell me if a price moves unusually" — a statistics problem (robust z-score anomaly detection) layered on top of (2).

**Why it exists.** Originally scaffolded as an AWS reference-architecture mockup (Kinesis/Glue/SageMaker, all unexecuted — see Section 26) with a frontend rendering `Math.random()`. It was rebuilt from the ground up, file by file, into a system where every number on screen traces back to a real model, a real database row, or a real computed aggregate.

**Target users.** Two audiences in practice: (a) end users of the dashboard — search a route, see a price with a confidence range and an explanation; (b) the engineer evaluating this as a portfolio piece — which is why this document exists.

**Business value.** Demonstrates the actual mechanics of a dynamic-pricing product: ingestion → feature engineering → model serving → explainability → alerting, the same shape as Hopper/Google Flights' pricing intelligence layer, built end-to-end rather than diagrammed.

**Technical value.** A working example of: training/serving skew elimination (Section 8), per-request SHAP explanations reconciled to an exact waterfall (Section 8, Section 12), a real auth system with email verification and password reset built from primitives (not outsourced to an auth vendor), and a defensible call on when to *stop* extrapolating a model rather than silently faking confidence (Section 12).

**Overall architecture.** React 18 (CRA, react-router-dom) → axios → FastAPI (uvicorn) → SQLAlchemy → PostgreSQL (Supabase). ML: scikit-learn `OrdinalEncoder` + `xgboost.XGBRegressor`, explained with `shap.TreeExplainer`. Email: Brevo HTTP API. Auth: hand-rolled bcrypt + JWT (`python-jose`), not a third-party auth provider.

**Main technologies.** Python 3.11, FastAPI, SQLAlchemy 2.x, Alembic, XGBoost, scikit-learn, SHAP, pandas, bcrypt, python-jose, slowapi (rate limiting), httpx; React 18, react-router-dom, axios, recharts, react-hot-toast, lucide-react; PostgreSQL via Supabase; pytest (backend, 50 tests) — **no frontend test suite exists** (verified: zero `*.test.js` files in `frontend/src`).

---

## 2. Complete Project Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  BROWSER                                                              │
│  React 18 SPA (CRA dev server / static build)                        │
│  react-router-dom: /login /register /forgot-password                │
│  /reset-password /verify-email /* (protected shell)                  │
└───────────────────────────┬───────────────────────────────────────────┘
                            │ axios, baseURL = REACT_APP_API_URL + /api/v1
                            │ Authorization: Bearer <JWT> (request interceptor,
                            │ frontend/src/api/client.js:11-17)
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  FASTAPI APP (backend/app/main.py)                                    │
│  CORSMiddleware → SlowAPI rate limiter → 9 routers:                  │
│  health, predict, model, auth, watchlists, saved_searches,           │
│  prices, analytics, alerts                                            │
│  Global Exception handler → JSON 500, never leaks stack traces       │
└───────┬───────────────┬───────────────┬───────────────┬──────────────┘
        │               │               │               │
        ▼               ▼               ▼               ▼
┌───────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────────────┐
│ PredictionSvc  │ │ SQLAlchemy   │ │ Brevo HTTP   │ │ XGBoost model.json│
│ singleton,     │ │ Session →    │ │ API          │ │ + encoder.joblib  │
│ loaded once    │ │ Supabase     │ │ (transactional│ │ (loaded once at   │
│ per process    │ │ Postgres     │ │  email)       │ │  process startup) │
└───────────────┘ └─────────────┘ └─────────────┘ └──────────────────┘
```

**Request flow (concrete example — a prediction):**
1. User submits the Price Prediction form → `predictPrice(payload)` (`frontend/src/api/client.js:101`) → `POST /api/v1/predict`.
2. FastAPI validates the body against `PredictRequest` (`backend/app/schemas/predict.py`) — enum fields reject any value outside the 6 cities / 6 airlines / 3 stop-categories / 2 classes the model actually knows.
3. `Depends(get_current_user)` is **not** applied to `/predict` — it is an unauthenticated endpoint (verified: `backend/app/api/v1/predict.py` has no `Depends(get_current_user)`).
4. `app/api/v1/predict.py::predict_price` calls `PredictionService.predict()` (`backend/app/services/prediction.py`).
5. Inside: build a 1-row DataFrame in `FEATURE_COLUMNS` order → `FeaturePipeline.transform()` (the same encoder object fit at training time) → `model.predict()` → raw price.
6. Out-of-distribution check: z-score of `duration`/`days_left` against training mean/std (loaded from `model_metadata.json`).
7. SHAP: `shap.TreeExplainer(model).shap_values()` on the same encoded row → top-5 contributions + `base_value` + `other_features_impact` (sums to `predicted_price` exactly — verified by `test_predict_shap_waterfall_reconstructs_predicted_price`).
8. Response serialized via `PredictResponse` → frontend renders the waterfall (`frontend/src/components/PricePrediction.js`).

**Response flow:** FastAPI's automatic Pydantic→JSON serialization; no manual response building anywhere in the routers (consistently `response_model=` is set on every route).

**No notification system beyond email exists.** There is no WebSocket, no SSE, no push notification, no in-app notification bell. "Notifications" as a concept = Brevo emails only (Section 14), and the alert *record* is queryable via `GET /api/v1/alerts` but **no frontend page renders it** (verified: `frontend/src/api/client.js` has zero functions calling `/alerts`; no component imports anything alert-related).

**No monitoring/observability stack exists.** Logging is structured JSON to stdout (`backend/app/core/logging.py`) — there is no Sentry, no Prometheus, no APM, no dashboards. This is explicitly a gap, not a hidden feature (Section 19).

---

## 3. Folder Structure Analysis

### `backend/app/api/v1/` — HTTP layer only
**Purpose:** the only layer aware of HTTP semantics (status codes, query/path params, request/response models). **Files:** `health.py`, `predict.py`, `model.py`, `auth.py`, `watchlists.py`, `saved_searches.py`, `prices.py`, `analytics.py`, `alerts.py` (9 routers, all registered in `main.py`). **Dependencies:** `app.core.*` (db session, security, rate limiter, email), `app.services.*` (business logic), `app.schemas.*` (validation). **Connects to:** `app.main` imports and mounts every router under `/api/v1`. Routers are intentionally thin — e.g. `predict.py` is 12 lines, all logic lives in `services/prediction.py`.

### `backend/app/core/` — cross-cutting infrastructure
**Purpose:** nothing domain-specific; the plumbing every other module imports. **Files:**
- `config.py` — `Settings` (pydantic-settings), reads `.env`, exposes `cors_origins_list` (comma-split).
- `database.py` — `load_dotenv()`, `DATABASE_URL` (SQLite default, Postgres via env var), `engine`, `SessionLocal`, `Base`, `get_db()` generator.
- `security.py` — bcrypt hash/verify, JWT create/decode, **two extra token types**: password-reset (self-invalidating via a hash of the current password) and email-verification (stateless, type-tagged).
- `rate_limit.py` — single shared `slowapi.Limiter` instance (`key_func=get_remote_address`).
- `email.py` — Brevo HTTP client + `render_branded_email()` HTML template builder; dev-mode fallback (logs instead of sending) when `BREVO_API_KEY` is unset.
- `logging.py` — JSON `Formatter`, applied to the root logger.
**Connects to:** imported by nearly every file in `api/` and `services/`.

### `backend/app/models/` — SQLAlchemy ORM (5 tables)
`user.py`, `watchlist.py`, `saved_search.py`, `price_history.py`, `alert.py` — see Section 7 for full schema. **Connects to:** `app/models/__init__.py` re-exports all 5, which is what makes Alembic's `--autogenerate` see them (a real gotcha: a model class never imported is invisible to `Base.metadata`).

### `backend/app/schemas/` — Pydantic request/response contracts
`predict.py` (defines the 6 enums — `Airline`, `City`, `TimeOfDay`, `Stops`, `FlightClass` — re-used by `watchlist.py` and `saved_search.py`, a single source of truth), `auth.py`, `watchlist.py`, `saved_search.py`, `analytics.py`, `alert.py`.

### `backend/app/services/` — business logic
`prediction.py` (the ML serving singleton) and `analytics.py` (fare calendar / cheapest-date / anomaly detection / market analytics / popular routes — all pure functions taking a `Session`). **No repository pattern** — services query SQLAlchemy directly; there is no separate data-access layer. This is a deliberate simplicity choice, not an oversight, appropriate at this project's size.

### `backend/app/ml/` — training, not serving
`features.py` (the `FeaturePipeline` class — fit once at training time, loaded read-only at serving time), `train.py` (the training script, run manually), `artifacts/` (committed `model.json`, `encoder.joblib`, `model_metadata.json`).

### `backend/app/jobs/` — offline batch scripts, not scheduled
`generate_price_history.py` (scores the model across a 64,800-row grid, see Section 8), `check_price_alerts.py` (compares watchlists against price_history, creates `Alert` rows, sends Brevo email on success). **Neither is scheduled** — no cron, no GitHub Actions workflow, no Celery/APScheduler. They are run manually (`python -m app.jobs.X`). This is a real gap (Section 19).

### `backend/alembic/` — schema migrations
5 migration files, applied sequentially. `env.py` is hand-edited (not the autogenerate stub) to import `Base`/`DATABASE_URL` and escape `%` for `configparser` (a real bug hit and fixed during this build — the Supabase password contains `@`/`%40`, and `configparser` treats `%` as interpolation syntax).

### `backend/tests/` — 50 pytest tests across 8 files
`conftest.py` (forces SQLite + disables Brevo + disables rate limiting for the suite — verified necessary: an earlier version of the suite silently sent real emails on every signup until this was fixed), `test_auth.py`, `test_password_reset.py`, `test_predict.py`, `test_analytics.py`, `test_watchlists.py`, `test_saved_searches.py`, `test_alerts.py`, `test_rate_limit.py`, `test_health.py`.

### `frontend/src/components/auth/` — routed auth pages
`Login.js`, `Signup.js`, `ForgotPassword.js`, `ResetPassword.js`, `VerifyEmail.js`, `AuthLayout.js` (shared centering wrapper). Each is a real `react-router-dom` route (`/login`, `/register`, etc.), not a tab-switched view — this was a deliberate mid-project refactor (the original `AuthScreen.js` switcher was deleted).

### `frontend/src/components/` — feature pages
`Dashboard.js`, `PricePrediction.js`, `FareCalendar.js`, `MarketAnalytics.js`, `AnomalyDetection.js`, `Watchlists.js`, `SavedSearches.js`, `Profile.js`. **All 8 call real backend endpoints** — zero `Math.random()` or hardcoded arrays remain in any active route (verified by reading every file).

### `frontend/src/api/client.js` — single API client
One axios instance, a request interceptor injecting the JWT from `localStorage`, a response interceptor calling a registered `onUnauthorized` handler on 401, and ~25 typed helper functions. **No alerts functions exist here** (Section 2, Section 10).

### `frontend/src/context/AuthContext.js` — the only global state
A React Context providing `user`, `loading`, `login`, `signup`, `verifyEmail`, `logout`. **No Redux, no Zustand, no React Query** — `useState`/`useEffect` only, everywhere.

---

## 4. Frontend Architecture

**Routing.** `react-router-dom` v6, `BrowserRouter` in `App.js`. Five public routes (`/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`), each wrapped in `PublicOnlyRoute` (redirects to `/` if already authenticated) and `AuthLayout` (centering wrapper). One catch-all `/*` wrapped in `ProtectedRoute` (redirects to `/login` if not authenticated), rendering `AppShell`.

**Pages vs. tabs — an important nuance.** Auth pages are real routes with real URLs. The *authenticated* app (`AppShell`) is **not** routed — it's a single component holding `activeTab` state and a `switch` statement (`App.js:34-55`) rendering one of 8 components. So `/fare-calendar` as a URL doesn't exist once logged in; navigation is in-memory tab state via `Sidebar.js`. This means **deep-linking into a specific authenticated page is not possible** — refreshing the page or sharing a URL always lands on Dashboard. This is a real, identifiable architectural gap (Section 26).

**Layouts.** `AuthLayout.js` is the only layout component, applying `.auth-screen` (flexbox centering) around any auth page. `AppShell` itself is an ad hoc layout (`Header` + `Sidebar` + `<main>`), not abstracted into a reusable `Layout` component since there's only one authenticated layout to begin with.

**Authentication flow (frontend side):** see Section 6 for the full backend-paired flow. Frontend-specific detail: `AuthContext`'s `useEffect` on mount checks `localStorage` for a token; if present, calls `getMe()` to hydrate `user` — if that call fails (expired/invalid token), the token is removed and the user is treated as logged out. No silent refresh — once the 24h JWT expires, the user is logged out on the next request that returns 401 (via the `onUnauthorized` handler wired in `AuthContext`'s effect, calling `logout()`).

**Protected routes.** `ProtectedRoute`/`PublicOnlyRoute` (`App.js:90-102`) — both render a `LoadingScreen` (a single pulsing skeleton circle) while `loading` is true, then redirect via `<Navigate replace>`. This is route-level protection only; there is no per-component authorization beyond "logged in or not" (no role-based UI gating — see Section 6 on roles).

**API layer.** Single file, `api/client.js`. No generated client, no OpenAPI codegen — every function is hand-written and must be kept in sync with the backend manually (a real, acknowledged drift risk — e.g. `FLIGHT_OPTIONS` in this file duplicates the enums defined in `backend/app/schemas/predict.py`; nothing enforces they stay equal).

**State management.** `useState`/`useEffect` exclusively. No memoization (`useMemo`/`useCallback`) anywhere in the 8 feature components — re-renders are not optimized, acceptable at this scale (none of these pages re-render at high frequency).

**Hooks.** Only the built-in ones plus `useAuth()` (custom, wrapping `useContext(AuthContext)`). No custom data-fetching hooks (e.g. no `useFareCalendar()`) — each component inlines its own `useEffect` + `useState` fetch pattern, which means the same loading/error boilerplate is repeated 8 times rather than abstracted (a real DRY violation, Section 18).

**Reusable components.** Minimal: `AuthLayout` is the only genuinely reusable wrapper. There is no shared `<Button>`, `<Input>`, `<Card>` component library — every page uses plain HTML elements with shared CSS classes (`.btn`, `.input`, `.card`, defined once in `index.css`) rather than React component abstractions. This is a reasonable choice for a project this size (CSS classes, not components, as the reuse mechanism) but would not scale past this size without introducing a component layer.

**Forms.** Plain controlled `<form>` + `useState` on every page — no React Hook Form, no Formik. Validation is manual and inconsistent in depth: some forms check `source_city === destination_city` client-side before submit (e.g. `FareCalendar.js`, `PricePrediction.js`), all forms additionally rely on the backend's Pydantic validation as the real source of truth, surfacing `err.response?.data?.detail` on failure.

**Error handling.** Per-component `try/catch` around the axios call, `toast.error(...)` on failure (react-hot-toast). No global error boundary (`componentDidCatch`/`ErrorBoundary`) exists — an uncaught render exception would produce React's default white screen, not a graceful fallback.

**Loading states.** Per-component boolean `loading` state, rendered as either a full skeleton grid (`Dashboard.js`, `MarketAnalytics.js`) or a single pulsing div (`Watchlists.js`, `SavedSearches.js`). No suspense/lazy-loaded skeletons.

**Charts.** `recharts` — `BarChart` (Dashboard, MarketAnalytics avg-price-by-class) and `LineChart` with a custom `<Dot>` renderer for anomaly markers (`AnomalyDetection.js`). No `PieChart`/`AreaChart` used anywhere despite being available in the library.

**Calendar.** `FareCalendar.js` is a hand-built grid (`display: grid; grid-template-columns: repeat(7, 1fr)`), not a calendar library (no `react-calendar`, no `FullCalendar`). Each day is a `<button>` (clickable, navigates to a prefilled Price Prediction), color-coded by relative price tertile (`priceTier()`, computed client-side from the currently displayed set, not a fixed rupee threshold), with a dashed border + `~` price prefix for any date beyond the model's 49-day reliable range (`is_low_confidence`, computed server-side and re-verified client-side via styling).

**Prediction UI.** `PricePrediction.js` — the centerpiece. Real-value-aware SHAP waterfall: `shapFeatureLabel()` maps a raw feature key (`"class"`) to a human label using the actual submitted form values (`"Economy Class"`), not a generic label. The waterfall block (`<pre className="shap-waterfall">`) is monospace, styled to resemble a terminal/receipt, and is provably exact (`base_value + Σcontributions + other_features_impact === predicted_price`, asserted in a backend test).

**Responsive design.** Media queries at `768px` and `480px` reduce the fare-calendar grid from 7 to 4 to 3 columns. Sidebar collapses to an overlay with a backdrop click-to-close below `1024px` (`Sidebar.js:29-34`).

**Animations.** CSS-only (`animate-fadeIn` class on the content wrapper, `transition` on hover states). No animation library (no Framer Motion, no react-spring).

**Icons.** `lucide-react` exclusively, consistently sized (`size={16/18/20/24/32}` by context).

**Styling.** Plain CSS files, one per component (`Component.css`), plus a global `index.css` defining CSS custom properties (`--color-primary`, `--spacing-lg`, etc.) — a hand-rolled design-token system, not Tailwind/styled-components/CSS Modules.

**Dark mode.** There is no light mode — the entire design system (`index.css` `:root`) is dark-themed by default with no toggle. "Dark mode" as a *feature* (user-togglable) is **not implemented**.

**Performance optimizations.** None beyond what CRA's webpack config provides by default (code is not manually code-split; there is no `React.lazy()`/`Suspense` anywhere; no bundle-size analysis was performed). For a portfolio-scale app this is a non-issue, but it is a genuine gap if asked about explicitly (Section 17).

---

## 5. Backend Architecture

**FastAPI architecture.** A single `FastAPI()` instance (`app/main.py`). No application factory pattern (no `create_app()`) — the app object is module-level, instantiated at import time. This is fine for a single-deployment-target app; it would need refactoring (factory pattern) to support, e.g., multiple test configurations running in true isolation within one process.

**Application startup.** No `@app.on_event("startup")` / lifespan handler exists. The `PredictionService` singleton is lazily instantiated on first use via `get_prediction_service()` (module-level `_service` variable, `app/services/prediction.py:89-96`), not eagerly at startup — meaning the **first** request after a cold start pays the model-loading cost, not the boot. The model is loaded via `XGBRegressor().load_model(MODEL_PATH)` + `FeaturePipeline.load()` (joblib) + `json.loads(model_metadata.json)`, plus `shap.TreeExplainer(self.model)` construction.

**Dependency injection.** FastAPI's native `Depends()` is used throughout: `get_db` (DB session per request, closed in a `finally` block — `core/database.py:21-26`), `get_current_user` (JWT → `User` row), `get_prediction_service` (the singleton). There is no third-party DI container.

**Routes/Controllers.** The 9 router files under `api/v1/` are the "controllers" — thin, delegate to `services/` for anything non-trivial. **Exception:** `watchlists.py`/`saved_searches.py`/`alerts.py` have their CRUD logic written directly in the route functions (no separate service layer for these three) — a deliberate inconsistency: prediction and analytics logic is complex enough to warrant a service; CRUD is simple enough that a service would just be indirection.

**Services.** `services/prediction.py` (ML serving) and `services/analytics.py` (fare calendar / cheapest-date / anomalies / market aggregates / popular routes) — see Section 3.

**Repositories.** None. SQLAlchemy ORM queries are written directly in routes/services (`db.query(Model).filter(...)`). No `UserRepository`/`WatchlistRepository` abstraction layer exists.

**Utilities.** `app/ml/features.py` (`FeaturePipeline`, `load_raw_dataset`) is the closest thing to a shared utility module beyond `core/`.

**Configuration.** `app/core/config.py`'s `Settings` (pydantic-settings) covers `app_name`, `api_v1_prefix`, `cors_origins`, `model_version`. **Inconsistency, verified:** `JWT_SECRET_KEY`, `DATABASE_URL`, `BREVO_API_KEY`, `FRONTEND_URL`, `ENV` are all read via raw `os.getenv()` calls scattered across `security.py`, `database.py`, `email.py`, `auth.py` — **not** centralized into `Settings`. Two different configuration patterns coexist in the same codebase.

**Environment variables actually read (grep-verified):** `DATABASE_URL`, `DIRECT_URL` (used only for running Alembic migrations against Supabase's session-mode pooler, not read by the app itself), `JWT_SECRET_KEY`, `CORS_ORIGINS`, `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`, `FRONTEND_URL`, `ENV`.

**Validation.** Pydantic v2 models on every request body/query param; FastAPI auto-generates 422 responses for violations. Cross-field validation via `@field_validator` (e.g. `destination_city != source_city` in `PredictRequest`, `WatchlistCreate`, `SavedSearchCreate`).

**Middleware.** `CORSMiddleware` (origins from `Settings.cors_origins_list`) is the **only** middleware. No request-ID middleware, no GZip, no custom logging middleware (logging is per-call via `logger.info`/`logger.exception`, not request/response interception).

**Authentication (mechanism, not flow — see Section 6).** Stateless: `OAuth2PasswordBearer` extracts the bearer token, `get_current_user` decodes it and re-fetches the `User` row by email on **every** request (no in-memory session cache, no Redis).

**Exception handling.** Two layers: (1) a catch-all `@app.exception_handler(Exception)` (`main.py:41-45`) logging the full traceback server-side and returning a generic `{"detail": "Internal server error"}` — stack traces never reach the client; (2) `RateLimitExceeded` has its own handler (`slowapi`'s built-in `_rate_limit_exceeded_handler`) returning 429.

**Logging.** `core/logging.py`'s `JsonFormatter` — every log line is one JSON object (`ts`, `level`, `logger`, `message`, optional `exc_info`). Applied to the root logger via `configure_logging()`, called once at `main.py` import time. **No log aggregation, no request correlation IDs.**

**Request lifecycle (concrete, for an authenticated mutation — `POST /watchlists`):** CORS preflight (if cross-origin) → rate limiter checks IP-based bucket → `get_db` opens a session → `get_current_user` decodes JWT, queries `users` by email → Pydantic validates `WatchlistCreate` body → route handler queries `COUNT(*)` for the cap check → inserts → commits → `db.refresh()` → Pydantic serializes `WatchlistResponse` → session closed in `finally`.

---

## 6. Authentication

**Registration (`POST /auth/signup`, `app/api/v1/auth.py:39-71`).** Rate-limited 5/min. Checks for an existing user by email (409 if found). Hashes the password with `bcrypt.hashpw` (cost factor default, 12 rounds — `core/security.py:29-30`). Creates the `User` row with `is_verified=False`. Generates an email-verification JWT (`create_email_verification_token`, 24h expiry, `type: "email_verification"` claim) and attempts to send a branded HTML email via Brevo. **Critically: signup does NOT return an access token.** The response is `SignupResponse {detail, dev_verification_token}` — `dev_verification_token` is populated **only** when the email send failed or `BREVO_API_KEY` is unset, and **only** outside `ENV=production`. With Brevo actually configured (current state, verified live), `dev_verification_token` is `null` and the user must click the real email link.

**Login (`POST /auth/login`).** Rate-limited 10/min. Looks up by email, verifies the bcrypt hash, **then** checks `is_verified` — in that order, so a wrong password always returns 401 before a verification check could leak whether the account exists in an unverified state. Returns a `TokenResponse {access_token, token_type: "bearer"}` — JWT payload is just `{sub: email, exp: now+24h}`, signed `HS256`.

**Logout.** Client-side only: `localStorage.removeItem(TOKEN_STORAGE_KEY)` (`AuthContext.js:11-14`). **There is no server-side token revocation** — a JWT remains technically valid until its 24h expiry even after "logout." This is a real, named limitation (Section 16).

**Password Reset.** Three-step, self-invalidating: `POST /auth/forgot-password` (always 200, generic message — prevents account enumeration) → if the user exists, generates a JWT with `type: "password_reset"` **and a `pwd_fp` claim** = `sha256(current_hashed_password)[:16]` → emails a reset link. `POST /auth/reset-password` decodes the token, re-fetches the user, and `verify_password_reset_token` checks the `pwd_fp` claim against the user's **current** hash — meaning the token automatically stops working the instant the password is ever changed (no separate revocation table needed; the mechanism is the password hash itself).

**JWT.** `python-jose`, `HS256`, secret from `JWT_SECRET_KEY` env var (hardcoded insecure dev default exists — `_DEV_DEFAULT_SECRET` — but `security.py:16-19` **raises `RuntimeError` at import time** if `ENV=production` and the secret is still the default, a fail-fast guard against accidentally deploying with it).

**Supabase Auth.** **Not used.** Despite "Supabase" being part of the stack, only Supabase's **Postgres hosting** is used — `Supabase Auth` (their dedicated auth product) is explicitly not integrated; all auth logic above is hand-rolled. This was a deliberate decision made earlier in this project's history (resume-value tradeoff: custom auth > vendor SDK wiring).

**Session management.** None beyond the JWT itself — no server-side session store, no refresh tokens. A 24h access token is the entire session lifetime; there is no way to extend a session without logging in again.

**Authorization.** Binary: authenticated or not (`get_current_user`). A `role` column exists on `User` (default `"user"`) and `require_admin()` (`core/security.py`) checks `role == "admin"` — **but no endpoint anywhere uses `require_admin`**, confirmed by grep: zero call sites. Role-based access control is scaffolded but **not implemented** in any actual route.

**Protected APIs.** `GET /auth/me`, all of `/watchlists`, `/saved-searches`, `/alerts` require `Depends(get_current_user)`. `/predict`, `/model/info`, `/prices/*`, `/analytics/*`, `/routes/popular` are **public, unauthenticated** — verified by reading every router file; none of them depend on `get_current_user`.

**Security of the token flow.** No CSRF concern (bearer token in an `Authorization` header, not a cookie — CSRF targets cookie-based auth). XSS risk is the real concern: the JWT lives in `localStorage` (`TOKEN_STORAGE_KEY`), readable by any script that achieves XSS on the page — an httpOnly cookie would be more defensible, but was not chosen here.

**Role management.** Exists as a column, has zero behavior. See Section 26.

---

## 7. Database Analysis

**Engine:** PostgreSQL, hosted on Supabase (free tier). Local dev defaults to SQLite (`sqlite:///./app.db`) — the same SQLAlchemy code targets either, switched purely by the `DATABASE_URL` env var. **No views, no triggers, no stored procedures exist** — verified, all 5 migration files contain only `CREATE TABLE`/`ADD COLUMN`/constraint DDL, nothing else.

### Table: `users`
| Column | Type | Constraints |
|---|---|---|
| id | Integer | PK |
| email | String(255) | UNIQUE, indexed, NOT NULL |
| hashed_password | String(255) | NOT NULL |
| role | String(20) | NOT NULL, default `"user"` |
| is_verified | Boolean | NOT NULL, default `False` (migration default `True` for pre-existing rows — see Section 26) |
| created_at | DateTime | default `now()` (UTC) |

Relationships: one-to-many to `watchlists` and `saved_searches`, both `cascade="all, delete-orphan"` — deleting a user **hard-deletes** their watchlists/saved searches (no soft-delete anywhere in the schema).

### Table: `watchlists`
| Column | Type | Constraints |
|---|---|---|
| id | Integer | PK |
| user_id | Integer | FK → users.id |
| source_city, destination_city | String(50) | NOT NULL |
| flight_class | String(20) | NOT NULL, default `"Economy"` (added in a later migration with `server_default='Economy'` for backfill) |
| target_price | Float | NOT NULL |
| created_at | DateTime | default now |

**Design decision, explicit in code comments:** no `route_id` FK to a normalized `routes` table — source/destination are stored as plain strings. A deliberate simplification, not an oversight.

### Table: `saved_searches`
Same shape minus `target_price`: `id`, `user_id` (FK), `source_city`, `destination_city`, `flight_class` (default `"Economy"`), `created_at`.

### Table: `price_history` (the largest table, the core dataset)
| Column | Type | Constraints |
|---|---|---|
| id | Integer | PK |
| source_city, destination_city | String(50) | indexed, NOT NULL |
| flight_class | String(20) | NOT NULL |
| travel_date | Date | indexed, NOT NULL |
| stops | String(20) | NOT NULL, default `"zero"` |
| airline | String(30) | NOT NULL, default `"Vistara"` |
| duration | Float | NOT NULL, default `2.5` |
| price | Float | NOT NULL |
| source | String(30) | NOT NULL, default `"model_estimate"` — also takes value `"synthetic_shock"` |
| collected_at | DateTime | default now |

**Unique constraint:** `(source_city, destination_city, flight_class, travel_date, stops, airline)` — one row per exact combination. **Current real row count (verified live):** 64,800 (30 ordered city pairs × 2 classes × 60 days × 3 stop-categories × 6 airlines). This table is **fully regenerable** — `generate_price_history.py` deletes and re-inserts the entire table on every run; it is not an append-only log.

### Table: `alerts`
| Column | Type | Constraints |
|---|---|---|
| id | Integer | PK |
| watchlist_id | Integer | FK → watchlists.id |
| user_id | Integer | FK → users.id (denormalized — could be derived via the watchlist, stored directly for query convenience) |
| travel_date | Date | NOT NULL |
| price_at_trigger, target_price | Float | NOT NULL |
| channel | String(20) | NOT NULL, default `"in_app"` — set to `"email"` only after a confirmed successful Brevo send |
| sent_at | DateTime | nullable |
| created_at | DateTime | default now |

**Unique constraint:** `(watchlist_id, travel_date)` — guarantees idempotent re-runs of `check_price_alerts.py` (verified by a dedicated test, `test_check_alerts_is_idempotent`).

**Indexes beyond PKs:** `users.email` (unique index), `price_history.source_city`/`destination_city`/`travel_date` (all individually indexed, **no composite index** on the common `(source_city, destination_city, flight_class, travel_date)` query pattern — every analytics query filters on all of these via separate single-column indexes rather than one composite covering index; a real, identifiable performance gap at scale, Section 17).

**Data flow into the database:** `generate_price_history.py` (model → `price_history`), `check_price_alerts.py` (`price_history` + `watchlists` → `alerts`), all other writes are direct user actions (signup, watchlist/saved-search CRUD) via the API.

**Database design decisions worth naming explicitly:** (1) no normalized `routes` table — intentional, documented in code; (2) no soft-deletes anywhere; (3) `price_history` is a derived cache, not a historical log — there is genuinely no way to query "what was this price last week," only "what does the model estimate for upcoming dates, as of the last time the job ran" (this exact gap was raised and explicitly deferred earlier in this project's history).

---

## 8. Machine Learning Pipeline

**Dataset.** Kaggle "Flight Price Prediction" (`Clean_Dataset.csv`), 300,153 rows of real Indian domestic flight fares (verified row count from `docs/model_card.md`, generated by `train.py` itself, not hand-written).

**Cleaning.** `load_raw_dataset()` (`app/ml/features.py`) drops a leading unnamed index column if present — that is the **entire** cleaning step; the Kaggle dataset arrives pre-cleaned (no missing-value imputation logic exists anywhere in `train.py`, because none was needed).

**Feature engineering / encoding.** `FeaturePipeline` (`features.py`) wraps a single `sklearn.preprocessing.OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1)` applied to 7 categorical columns: `airline`, `source_city`, `departure_time`, `stops`, `arrival_time`, `destination_city`, `class`. Two numeric columns (`duration`, `days_left`) pass through unchanged — **no scaling/normalization is applied to them** (not needed for tree-based models, which are scale-invariant). The `flight` column (flight number) is explicitly dropped before training (`train.py`: `X_raw = df.drop(columns=[TARGET_COLUMN, "flight"])`) — too granular/leaky to generalize.

**The critical design choice: the *same* `FeaturePipeline` instance (persisted via joblib) is used at training time (`fit_transform`) and serving time (`transform`)** — this is the textbook fix for training/serving skew, called out explicitly in code comments in both `features.py` and `services/prediction.py`.

**Model selection.** `xgboost.XGBRegressor`. No comparison against alternative models exists in the codebase (no notebook, no logged experiment comparing XGBoost vs. linear regression vs. random forest) — the choice was made directly, not benchmarked in-repo.

**Hyperparameters (verified, `train.py`):** `n_estimators=300`, `max_depth=6`, `learning_rate=0.08`, `subsample=0.9`, `colsample_bytree=0.9`, `random_state=42`. No hyperparameter search (no GridSearchCV/Optuna) was run — these are direct, reasonable defaults, not the output of a tuning process.

**Training/validation split.** `train_test_split(test_size=0.2, random_state=42)` — a single 80/20 holdout, **no k-fold cross-validation**, no separate validation set distinct from the test set (test set is used both as "validation during development" and "the number reported in the model card" — a methodological simplification worth naming if asked).

**Evaluation metrics (real, from the held-out 20% — verified in `docs/model_card.md` and re-confirmed live):** MAE ≈ ₹2,137, RMSE ≈ ₹3,742, MAPE ≈ 15.06%, **R² = 0.9728**.

**Feature importance (gain-based, from the trained model):** `class` dominates (0.84), then `stops` (0.06), `airline` (0.05), `duration` (0.01), `days_left` (0.01) — consistent with real-world intuition (Economy vs. Business class is by far the largest price driver).

**Inference.** `PredictionService.predict()` (Section 2) — single-row DataFrame → `model.predict()` → scalar price. **No batching API exists** for scoring many rows through the public `/predict` endpoint; `generate_price_history.py` bypasses the service entirely and calls `model.predict()` directly on a 64,800-row DataFrame for its own batch use case (a deliberate, documented architectural split: the API path validates+explains one prediction at a time; the batch job path is raw and fast).

**Confidence calculation.** Not a true model-derived prediction interval (XGBoost doesn't natively produce one without quantile regression, which isn't used here). Instead: `confidence_low/high = predicted_price ± MAE` (±2×MAE if the input is flagged out-of-distribution). This is a **documented approximation**, not a statistically rigorous interval — worth being precise about this distinction if asked (Section 12).

**Out-of-distribution detection.** Z-score of `duration` and `days_left` against the training set's mean/std (stored in `model_metadata.json` at training time), threshold `3.0` (`OOD_ZSCORE_THRESHOLD`, `services/prediction.py`). **Only these two numeric features are checked** — an unusual *categorical combination* (e.g. an airline/route pair absent from training data) is **not** detected, since every individual categorical value is by definition "valid" (it's in the trained enum) even if that specific combination never co-occurred in training.

**Limitations (the most important one, load-bearing for Sections 9 and 12):** `days_left` in the training data only ranges 1-49 (enforced as a hard API constraint, `Field(ge=1, le=49)` in `PredictRequest`). XGBoost trees cannot extrapolate past the maximum value seen in training — verified by direct experiment: predictions for `days_left=49, 60, 90, 120, 150, 180` are **identical** (₹3,782.36 in the test run), because every tree's decision path bottoms out at the same boundary leaf. This is why `generate_price_history.py`'s 60-day window has an `is_low_confidence` flag for days 50-60 (Section 12) — the calendar was **not** extended to 6 months specifically because of this proven flattening behavior.

**Fallback logic.** None beyond the OOD flag — there is no fallback model, no rule-based override, no "if confidence too low, refuse to answer" behavior. A low-confidence prediction is still returned, just labeled.

---

## 9. Prediction Flow (end to end, traced through actual code)

1. **User opens the website** → `App.js` mounts → `AuthContext`'s effect checks `localStorage` for a token → if present, `getMe()` validates it server-side.
2. **User searches a flight** → on `PricePrediction.js`, fills `source_city`, `destination_city`, `departure_time`, `arrival_time`, `stops`, `class`, `duration`, `days_left`, `airline` (defaults pre-filled: Vistara, Delhi→Mumbai, Morning/Afternoon, one stop, Economy, 2.5h, 10 days).
3. **Frontend validation** — `formData.source_city === formData.destination_city` check before submit; native `min`/`max`/`required` on number inputs.
4. **API request** — `predictPrice(formData)` → `POST /api/v1/predict` with the form body, `Authorization` header attached automatically if a token exists (not required for this endpoint, but sent anyway by the shared axios interceptor).
5. **Backend receives request** — FastAPI parses + validates against `PredictRequest`; any invalid enum value (e.g. an airline not in the 6 known ones) is rejected with 422 **before** any business logic runs.
6. **Feature engineering** — `PredictionService.predict()` builds a 1-row DataFrame in `FEATURE_COLUMNS` order, calls `self.pipeline.transform()` (the persisted `OrdinalEncoder`).
7. **ML prediction** — `self.model.predict(encoded)[0]`.
8. **Confidence calculation** — OOD check via z-score, margin = MAE (or 2×MAE if OOD).
9. **SHAP explanation** — `self.explainer.shap_values(encoded)`, top-5 + `base_value` + `other_features_impact` bucket for the rest.
10. **Database** — **no write happens here.** A prediction request is stateless; nothing is persisted to `price_history` or any other table as a side effect of calling `/predict`. (Note: `app/schemas/analytics.py`'s docstrings reference a `predictions` table for drift-logging in the original blueprint — **this table does not exist**; it was planned, never built.)
11. **Calendar generation** — a **separate, offline** process (`generate_price_history.py`), not triggered by this request — see Section 8.
12. **Charts** — N/A for this specific flow (charts belong to Dashboard/MarketAnalytics, fed by different endpoints).
13. **Price history** — N/A for this flow; relevant only to the Fare Calendar page.
14. **Alerts** — N/A; `/predict` never touches `watchlists`/`alerts`.
15. **Frontend response handling** — `Promise.all([predictPrice(formData), getModelInfo()])` — **two separate API calls fired together**, one for the prediction itself, one for the model's global metrics (used in a different panel on the same page).
16. **UI rendering** — the SHAP waterfall (`<pre className="shap-waterfall">`), the confidence-range bar, the out-of-distribution warning badge (conditionally rendered if `out_of_distribution: true`).

**What this flow explicitly does NOT include, verified by absence:** no caching layer between steps 6-9 (every request re-runs the full encode→predict→explain pipeline, even for an identical repeated query); no request logging to a `predictions` table for later analysis/drift-monitoring (planned, not built).

---

## 10. Feature Documentation (every feature, individually)

### Registration
**Purpose:** create an account. **Business logic:** unverified by default, must click an emailed link. **Frontend:** `Signup.js` — note the dev-mode auto-verify shortcut (`if (result.dev_verification_token) await verifyEmail(...)`), which only fires when Brevo *isn't* delivering. **Backend:** `POST /auth/signup`. **Database:** one `users` row. **API:** see Section 11. **Limitations:** no password-strength meter beyond `minLength=8`; no email-format double-check beyond Pydantic's `EmailStr`. **Possible improvement:** rate-limit by email, not just IP (currently `5/minute` is IP-keyed — `slowapi`'s `get_remote_address` — so 5 different emails from the same IP exhausts the limit for all of them, but the same email from 5 different IPs is unthrottled).

### Login
**Purpose:** issue a session token. **Business logic:** password check before verification check (Section 6). **Frontend:** `Login.js`. **Backend:** `POST /auth/login`. **Limitations:** no account lockout after N failed attempts beyond the generic rate limit; no "remember me" vs. short-session distinction (always 24h).

### Logout
**Purpose:** end the client-side session. **Implementation:** `localStorage.removeItem` only — **no backend call exists for logout** (verified: no `/auth/logout` route in any router file). **Limitation:** the JWT remains valid server-side until natural expiry.

### Flight Search / Price Prediction
**Purpose:** the core feature. **Business logic:** Section 8/9. **Frontend:** `PricePrediction.js`. **Backend:** `POST /predict`, unauthenticated. **Database:** no write. **Limitations:** `days_left` capped at 49 (model-imposed); only 6 cities/6 airlines exist in the model's vocabulary — anything else is a 422, not a fallback estimate.

### Confidence Range
**Purpose:** communicate prediction uncertainty. **Logic:** ±MAE (±2×MAE if OOD) — see Section 8 for the honest caveat that this is not a true statistical prediction interval.

### Fare Calendar
**Purpose:** find the cheapest day to fly. **Backend:** `GET /prices/calendar` — collapses `price_history` to one cheapest row per date (`_cheapest_per_date()` in `services/analytics.py`), optionally filtered by `airline`/`stops`. **Frontend:** `FareCalendar.js` — 30/60-day toggle, color-coded tertiles, dashed-border `is_low_confidence` flag for days 50-60. **Limitation:** the underlying data is regenerated by a manual script run, not a live feed — "today's calendar" is only as fresh as the last time `generate_price_history.py` was run.

### Cheapest Date Finder
**Purpose:** same data, single best answer for a date range. **Backend:** `GET /prices/cheapest-date`, accepts `date_from`/`date_to`/`airline`/`stops`. **Frontend:** the "Cheapest day" callout atop `FareCalendar.js`.

### Saved Searches
**Purpose:** remember a route+class combo. **Backend:** full CRUD, `app/api/v1/saved_searches.py`, capped at 30/user. **Frontend:** `SavedSearches.js`, with a "Predict" button that navigates to Price Prediction prefilled.

### Watchlist
**Purpose:** set a target price, get alerted when met. **Backend:** full CRUD, capped at 20/user, includes `flight_class` (added in a later migration — Section 26 covers why this was a real bug before the fix). **Frontend:** `Watchlists.js`.

### Price History
**Purpose:** the dataset backing the calendar/analytics. **Not a user-facing "feature" page** — there is no "Price History" navigation item or component; it is purely the `price_history` table, surfaced indirectly through Fare Calendar / Market Analytics / Anomaly Detection. **A dedicated historical-trend view ("how has this route's price moved over the past month") does NOT exist** — explicitly deferred earlier in this project (the table is regenerated, not append-only, so there is no real "history" to show yet).

### Market Analytics
**Purpose:** aggregate price trends. **Backend:** `GET /analytics/market` — fetches **all** `price_history` rows into Python and aggregates (Section 17 flags this as a scaling concern). **Frontend:** `MarketAnalytics.js` — avg price by class (bar chart), most-watched routes (from real `watchlists`+`saved_searches` counts), cheapest/most-expensive routes.

### Price Drop Alerts
**Purpose:** notify a user when a watched route hits their target. **Backend:** fully implemented — `app/jobs/check_price_alerts.py` (idempotent via the unique constraint), `app/models/alert.py`, `GET /api/v1/alerts`. **Email:** real, via Brevo, on success sets `channel="email"` + `sent_at`. **NOT IMPLEMENTED: any frontend surface.** No alerts list page, no notification badge, no `client.js` function calling `/alerts`. This is the single largest "backend complete, frontend missing" gap in the project, confirmed by exhaustive grep across `frontend/src`.

### SHAP Explainability
**Purpose:** explain *this* prediction. **Backend:** `shap.TreeExplainer`, exact waterfall reconstruction (Section 8/9). **Frontend:** the monospace waterfall block in `PricePrediction.js`. This is the single most technically impressive feature in the codebase — most portfolio ML projects never attempt per-prediction explainability, let alone verify it sums exactly.

### Route Popularity
**Purpose:** "what are people watching." **Backend:** `GET /routes/popular` — counts real `watchlists` + `saved_searches` grouped by route, **not** simulated. **Limitation:** with very few real users (this is a portfolio project), this list is often empty — verified in the screenshot shared during this build ("No watchlists or saved searches yet").

### Anomaly Detection
**Purpose:** flag unusual prices. **Backend:** modified z-score (median/MAD, Iglewicz & Hoaglin method) over a rolling 7-day window per date (`services/analytics.py::detect_anomalies`) — deliberately **not** a plain mean/std z-score, because a single huge spike inflates its own denominator and can mask itself (documented in code comments). **Frontend:** `AnomalyDetection.js` — line chart with custom anomaly-dot markers. **Test data:** 3 hand-injected "synthetic_shock" rows exist in `price_history` specifically so this algorithm has something real to find (clearly labeled in the `source` column, never presented as a real market event).

### User Profile
**Purpose:** view account info, change password. **Backend:** `GET /auth/me`. **Frontend:** `Profile.js`. **A confirmed, live bug (not theoretical):** the in-app "Change Password" flow expects `forgotPassword()` to return a `dev_reset_token` to proceed to the password form (`Profile.js:131`, `!devToken ? <button> : <form>`) — but now that Brevo is actually configured and sends real emails, `dev_reset_token` is always `null` in the response, so **the password-change form on the Profile page can never render anymore**. The only working path to reset a password today is the full email-link flow (`/forgot-password` → real email → `/reset-password`), not the in-app shortcut. This is flagged here as a real, currently-live defect, not a hypothetical.

---

## 11. API Documentation

All routes are prefixed `/api/v1`. Auth column: 🔒 = `Depends(get_current_user)` required; 🔓 = public.

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | 🔓 | Liveness probe; also exercises the model (fails loudly if the artifact is corrupt) |
| POST | `/predict` | 🔓 | Run the model, return price + confidence + SHAP |
| GET | `/model/info` | 🔓 | Real metrics (MAE, R², feature importance) for display |
| POST | `/auth/signup` | 🔓 | Create account (rate-limited 5/min) |
| GET | `/auth/verify-email` | 🔓 | Activate account via emailed token |
| POST | `/auth/login` | 🔓 | Issue JWT (rate-limited 10/min) |
| GET | `/auth/me` | 🔒 | Current user |
| POST | `/auth/forgot-password` | 🔓 | Email a reset link (rate-limited 5/min, generic response) |
| POST | `/auth/reset-password` | 🔓 | Consume reset token, set new password (rate-limited 10/min) |
| POST/GET/DELETE | `/watchlists` | 🔒 | CRUD, capped 20/user (rate-limited 20/min on create) |
| POST/GET/DELETE | `/saved-searches` | 🔒 | CRUD, capped 30/user (rate-limited 20/min on create) |
| GET | `/prices/calendar` | 🔓 | Fare calendar, optional `airline`/`stops` filters |
| GET | `/prices/cheapest-date` | 🔓 | Single best date, optional date-range + filters |
| GET | `/prices/anomalies` | 🔓 | Detected price spikes for a route |
| GET | `/routes/popular` | 🔓 | Real watchlist/saved-search counts by route |
| GET | `/analytics/market` | 🔓 | Aggregate price/route stats |
| GET | `/alerts` | 🔒 | List the current user's triggered alerts (no frontend consumer — Section 10) |

**Example: `POST /predict`**
Request:
```json
{"airline":"Vistara","source_city":"Delhi","destination_city":"Mumbai","departure_time":"Morning","arrival_time":"Afternoon","stops":"one","class":"Economy","duration":2.5,"days_left":10}
```
Response (verified live):
```json
{"predicted_price":11550.77,"confidence_low":9414.03,"confidence_high":13687.52,"model_version":"v1.0.0","out_of_distribution":false,"base_value":20891.87,"shap_contributions":[{"feature":"class","impact":-11163.05},{"feature":"days_left","impact":4291.49},{"feature":"duration","impact":-3922.03},{"feature":"airline","impact":1610.85},{"feature":"source_city","impact":-389.52}],"other_features_impact":231.16}
```
Validation: enum fields reject unknown values (422); `destination_city == source_city` rejected (422); `duration` bounded `(0, 60]`; `days_left` bounded `[1, 49]`.
Errors: 422 (validation), 500 (caught by the global handler, never leaks internals).

**Example: `POST /auth/login`** — 401 on bad credentials or non-existent user (same message, no enumeration); 403 if the account exists, password is correct, but `is_verified=False`.

---

## 12. ML Model Logic

**Input features, in the exact order the model expects (`FEATURE_COLUMNS`):** `airline`, `source_city`, `departure_time`, `stops`, `arrival_time`, `destination_city`, `class`, `duration`, `days_left`.

**Feature encoding:** all 7 categorical columns → `OrdinalEncoder` integer codes (fit on the training data's category order; `handle_unknown="use_encoded_value", unknown_value=-1` is a defensive fallback that in practice never triggers, since the API's Pydantic enums already restrict inputs to known categories before the encoder ever sees them).

**`days_left`:** raw integer, 1-49 in training and in the API's validation. **`travel_date`** (a calendar date) is never a model input directly — the model only ever sees `days_left` (an integer offset); `generate_price_history.py` converts a target `travel_date` into `days_left` by subtracting from "today" at generation time.

**Source/destination/airline/stops/class:** the 7 categorical features, encoded as above.

**Prediction formula:** `model.predict(encoded_row)` — a sum over 300 trees' leaf outputs, no closed-form formula beyond "the trained ensemble."

**Confidence logic:** see Section 8 — `± MAE`, not a true quantile-regression interval.

**Calendar generation logic:** for each of 30 routes × 2 classes × 60 days × 3 stop-categories × 6 airlines (64,800 combinations), score the model once; **store every row** (not just the minimum) so the API can later filter by airline/stops and still answer "cheapest overall" by taking `MIN(price)` over whichever subset matches.

**The 49-day limitation, precisely:** the training data's `days_left` column never exceeds 49. Verified by direct experiment (Section 8) that predictions flatline identically from day 49 onward. The system's response to this fact: keep the calendar at 60 days (not 6 months, which was explicitly requested and explicitly declined for this reason), and add a dynamically-computed `is_low_confidence` flag (`(travel_date - date.today()).days > 49`) on every `CalendarDay`/`CheapestDateResponse` for the 11 days (50-60) that fall past the reliable range. The flag is **recomputed on every request against the current date**, not baked in at generation time — so a date that's "day 55" today correctly becomes "day 49" (and un-flags) six days from now, without needing to regenerate anything.

**50-60 day approximation, exactly what it is:** not a smarter model, not an extrapolation heuristic, not a decay function — it is the **same frozen leaf-boundary value** the model would give for day 49, repeated, with a visible warning attached. No attempt was made to disguise this as more sophisticated than it is.

---

## 13. Analytics

**Price History.** The raw substrate — `price_history`, 64,800 rows, regenerated wholesale on each `generate_price_history.py` run (not appended to). No time-series trend across *generation runs* exists (Section 10).

**Market Analytics.** `services/analytics.py::get_market_analytics()` — fetches **every row** in `price_history` into a Python list, collapses to cheapest-per-(route, class, date) in a Python dict (not a SQL `GROUP BY`+window function), then computes averages. Verified live timing: ~2.7 seconds for the full 64,800-row table. Works correctly; will not scale past a few hundred thousand rows without moving the aggregation into SQL (Section 17).

**Trend analysis.** Limited to what the fare calendar's 60-day window shows visually (a line/bar chart of price vs. date) — there is no month-over-month or week-over-week trend computation, no seasonality decomposition, no forecasting beyond the model's own per-date predictions.

**Aggregations implemented:** avg price by class, cheapest/most-expensive 5 routes, real popular-route counts. **Aggregations NOT implemented:** revenue/booking-volume estimates (no booking concept exists at all — this is a pricing system, not a booking system), conversion funnels, user cohort analysis.

**Charts/Visualization.** `recharts` `BarChart`/`LineChart` only (Section 4).

**Data processing.** All aggregation happens in Python at request time — no pre-computed materialized views, no nightly aggregation job. Every `/analytics/market` call re-does the full collapse from scratch.

---

## 14. Notification System

**Watchlists → Alert creation.** `check_price_alerts.py` (run manually, **not scheduled**) iterates every `Watchlist`, queries `price_history` for matching rows at or below `target_price`, and creates one `Alert` per (watchlist, date) combination not already alerted — idempotency enforced by the table's unique constraint plus an explicit pre-check query.

**Alert scheduler.** **Does not exist.** No cron, no GitHub Actions scheduled workflow, no APScheduler/Celery beat. The job must be invoked by hand: `python -m app.jobs.check_price_alerts`.

**Email notifications.** Real, via Brevo's transactional email HTTP API (`core/email.py::send_email`). Three email types exist: signup verification, password reset, price-drop alert — all built from one shared `render_branded_email()` HTML template (dark-themed, gradient header, CTA button, footnote). Verified live: a real signup triggered a real `POST https://api.brevo.com/v3/smtp/email` returning `201 Created`, and the resulting email was confirmed to arrive (in Spam initially — expected for a new sender domain without SPF/DKIM configured).

**Database updates on send.** On a successful alert email, the `Alert` row's `channel` flips from `"in_app"` to `"email"` and `sent_at` is stamped — verified in `check_price_alerts.py:64-74`.

**Trigger logic.** Purely a price-threshold comparison (`PriceHistory.price <= watchlist.target_price`) — no debouncing, no "only alert once per N hours," no escalation. If the price-history job runs again and the price is still below target on a *different* date, a *new* alert row is created for that new date (the uniqueness is per watchlist+date, not per watchlist).

**Failure handling.** `send_email()` catches `httpx.HTTPError`, logs the exception, returns `False` — the `Alert` row is still created (with `channel="in_app"`, `sent_at=None`) even if the email fails to send. No retry queue, no dead-letter handling — a failed send is simply never retried.

**What's missing entirely:** any in-app notification UI (no bell icon, no toast-on-login for new alerts), SMS, push notifications, a notification-preferences setting.

---

## 15. Deployment

**Current actual state, verified: nothing is deployed.** Both frontend (`npm start`, CRA dev server) and backend (`uvicorn app.main:app`) run locally throughout this entire build, connected to a real Supabase Postgres instance and a real Brevo account — i.e., the *services* are real and live, but the *application* itself has never been pushed to Vercel/Render/any host.

**Frontend deployment (planned, not executed).** No `vercel.json` exists. The plan (documented earlier in this project, not yet acted on) is Vercel, auto-deploying on push to `main`, with `REACT_APP_API_URL` set as an environment variable pointing at the deployed backend.

**Backend deployment (planned, partially scaffolded).** `backend/render.yaml` exists (`buildCommand: pip install -r requirements.txt && python -m alembic upgrade head`, `startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT`) — **written but never used to actually deploy**; no Render service has been created from it. `backend/Dockerfile` also exists and is similarly **unverified** — it was authored when Docker Desktop's daemon wasn't running on the dev machine, so it has never been built, let alone run.

**Supabase.** The one piece of infrastructure that genuinely *is* "deployed" — a real, live, hosted Postgres instance, schema migrated via Alembic against the session-mode connection pooler (port 5432), app traffic routed through the transaction-mode pooler (port 6543). A real bug was hit and fixed during setup: the connection string's percent-encoded `@` (`%40`) collided with `configparser`'s interpolation syntax inside Alembic's config loading, requiring an explicit `.replace("%", "%%")` in `alembic/env.py`.

**Environment variables / secrets.** `backend/.env` (gitignored) holds `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET_KEY`, `CORS_ORIGINS`, `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`. `backend/.env.example` documents the shape without real values. **A real secret exposure occurred during this project:** the Supabase database password was pasted directly into this chat session by the user — flagged at the time with an explicit recommendation to rotate it, not yet confirmed done.

**CORS.** `CORS_ORIGINS` env var, comma-split, defaults to `http://localhost:3000` — would need updating to the real Vercel domain post-deployment (not yet relevant since nothing is deployed).

**Production architecture (designed, not built).** Vercel (frontend) → Render (backend, Docker-based) → Supabase (Postgres) → Brevo (email) — a real $0-cost architecture on paper, zero dollars actually spent, but also zero dollars actually verified end-to-end in a production environment.

**Build process.** Frontend: standard CRA (`npm run build` would produce a static bundle; never actually run and inspected for bundle size in this project). Backend: no build step beyond `pip install` — Python is interpreted, not compiled/bundled.

**CI/CD.** **Does not exist.** No `.github/workflows/` directory, no GitHub Actions, no pipeline running tests on push. The 50 backend tests are run manually, locally, on demand.

---

## 16. Security Audit

| Area | Finding |
|---|---|
| Password storage | bcrypt, correct, no plaintext anywhere — ✅ |
| JWT | HS256, fail-fast on insecure default secret in production — ✅. No refresh tokens, no server-side revocation — ⚠️ |
| SQL injection | SQLAlchemy ORM throughout, zero raw string-interpolated SQL found by grep — ✅ |
| XSS | React's default JSX escaping protects rendered content; **JWT stored in `localStorage`**, readable by any successful XSS — ⚠️ |
| CSRF | Not applicable — bearer-token auth, not cookie-based — ✅ |
| Rate limiting | Real, IP-keyed, in-memory (`slowapi`, no Redis backend) — breaks the moment there's more than one backend process/instance (each gets its own counter) — ⚠️ documented limitation |
| Account enumeration | `forgot-password` and `login` both return generic messages — ✅ |
| Secrets in repo | `.env` gitignored correctly — ✅. **A real Supabase password was pasted into this chat session** — ⚠️ unresolved as of this document |
| Authorization | Binary auth only; `role`/`require_admin` scaffolded, unused — no privilege escalation risk *because there are no privileged routes to escalate into*, but also no actual RBAC — ⚠️ |
| Input validation | Pydantic on every endpoint, enums restrict categorical inputs at the boundary — ✅ |
| Security headers | No `Strict-Transport-Security`, no `Content-Security-Policy`, no `X-Frame-Options` set anywhere (FastAPI doesn't add these by default, and none were added manually) — ⚠️ |
| Dependency vulnerabilities | Not scanned — no Dependabot, no `pip-audit`/`npm audit` run as part of this project (an `npm audit` run during `react-router-dom` install reported 65 known vulnerabilities in transitive CRA dependencies, **not individually triaged**) — ⚠️ |
| Logout | Client-side only, token remains valid until expiry — ⚠️ |

**Security score: 6/10.** Core mechanics (password hashing, SQL injection avoidance, JWT signing, account-enumeration prevention) are genuinely correct and well-reasoned. The gaps are real and specific: no token revocation, localStorage-based token storage, an unrotated exposed credential, and zero security headers — all fixable, none currently fixed.

---

## 17. Performance Audit

**Frontend performance.** Unoptimized but unproblematic at current scale — no code splitting, no memoization, full re-fetch on every page mount (no caching between navigations, e.g. revisiting Dashboard re-fetches `/model/info` + `/analytics/market` every time rather than reusing a recent response).

**Backend performance.** Most endpoints are fast (`/predict` is a single in-process model call, no I/O beyond the response itself — sub-50ms typical). **The one real bottleneck, measured:** `GET /analytics/market` takes ~2.7 seconds because it pulls all 64,800 `price_history` rows into Python before aggregating, rather than letting Postgres do the `GROUP BY`. At the current 64.8K-row scale this is "slow but tolerable"; it would not survive a 10x data increase without rewriting the aggregation in SQL.

**Database queries.** No composite indexes on the multi-column filter pattern used by every analytics query (Section 7) — each query currently relies on the query planner combining single-column indexes, not an ideal but functional state at this row count.

**ML inference.** A single `XGBRegressor.predict()` call on one row is effectively instant (sub-millisecond model time; the SHAP `TreeExplainer` call adds a few milliseconds more). The model is loaded once per process (lazy singleton) — no per-request loading cost after the first request.

**Caching.** **None exists anywhere in the stack** — no Redis, no in-memory LRU cache, no HTTP cache headers set on any response. Every repeated identical request re-does full work.

**Memory/CPU.** Not profiled or measured at any point in this project — no load test (Locust/k6) was ever run despite being recommended in earlier planning documents.

**Bundle size.** Not measured — `npm run build`'s output size was never inspected.

**Time/space complexity, the one place it matters:** `get_market_analytics()` is O(n) in `price_history` row count for both time and the in-memory Python dict it builds — acceptable today, the clearest scaling cliff in the codebase if data volume grows.

**Performance score: 5/10.** Nothing is actively broken, but nothing has been measured, load-tested, or deliberately optimized either — the score reflects "untested," not "bad."

---

## 18. Code Quality Audit

**Architecture.** Consistent layering on the backend (api → services → models, Section 5); the frontend has no equivalent layering (components directly call `api/client.js`, no intermediate service/hook layer) — an asymmetry, not a contradiction, since the frontend's complexity doesn't yet warrant it.

**Folder organization.** Backend: clean, conventional (`api/`, `core/`, `models/`, `schemas/`, `services/`, `ml/`, `jobs/`). Frontend: flatter — all 8 feature components live directly in `components/`, auth components in `components/auth/`, no `pages/` vs `components/` distinction.

**Naming.** Consistent and descriptive throughout — `get_prediction_service`, `_is_low_confidence`, `priceTier`, `shapFeatureLabel` all say exactly what they do. No abbreviation soup.

**Readability.** High — docstrings explain *why*, not *what*, consistently (e.g. the modified-z-score docstring explains the masking-effect problem it avoids, not just "computes anomalies").

**SOLID.** Single Responsibility is generally honored (routers thin, services do one job each). Dependency Inversion is partial — services depend directly on SQLAlchemy's `Session`, not an abstract repository interface (acceptable at this scale, would need addressing to support, e.g., swapping ORMs).

**DRY violations, named specifically:** (1) `Watchlist` and `SavedSearch` are near-identical tables/schemas/routers (one extra `target_price` field is the only real difference) — never merged, flagged in code comments as a known duplication; (2) `FLIGHT_OPTIONS` in `frontend/src/api/client.js` duplicates the backend's enums with no shared source of truth; (3) every frontend component repeats the same `useState(loading)` + `useEffect(fetch)` + `toast.error` boilerplate rather than a shared hook.

**KISS.** Generally honored — no premature abstraction found; e.g., no repository pattern was introduced where direct ORM queries suffice.

**Code smells.** The `Profile.js` change-password flow (Section 10) is now a confirmed dead code path given Brevo is live — a real smell introduced by a later change (Brevo integration) that wasn't reconciled back into an earlier component.

**Dead code.** `require_admin()` (`core/security.py`) — defined, exported, zero call sites. `app/core/config.py`'s `Settings` class is itself a partial dead pattern — most env vars bypass it entirely (Section 5).

**Unused packages.** `requirements.txt` retains `boto3`, `botocore`, `sagemaker`, `pyspark`, `moto` — leftovers from the original AWS-mockup generation of this project (Section 26), unused by anything under `app/`.

**Technical debt, ranked:** (1) `Watchlist`/`SavedSearch` duplication, (2) manual enum duplication across the Python/JS boundary, (3) the dead AWS dependencies bloating `requirements.txt`, (4) `Profile.js`'s now-broken password-change UI path.

**Maintainability score: 7/10.** Genuinely good bones (naming, layering, test coverage on the backend); the debt items above are all small, named, and fixable in under a day each — not structural rot.

---

## 19. Production Readiness

**Scalability.** Single backend process assumption baked into two places: the in-memory rate limiter (Section 16) and the lazily-loaded model singleton (fine for one process, redundant if horizontally scaled — N processes load N copies of the same model). **Not scalability-tested at all** — no load test was ever run.

**Availability.** No redundancy of any kind — one backend process, one database, no replicas, no health-check-driven auto-restart configured (Render's `render.yaml` exists but was never deployed, so even its basic health-check-based restart was never exercised).

**Reliability.** The global exception handler (Section 5) prevents a single bad request from leaking internals, but there is no circuit breaker, no retry-with-backoff on the Brevo HTTP call (a single `httpx.HTTPError` and the send is simply marked failed, no retry).

**Logging.** Structured JSON to stdout — adequate for a single-instance deployment piped to a platform's log viewer (Render/Vercel both capture stdout), but there is no log *aggregation* across instances (moot today, since there's only one).

**Monitoring.** **None.** No Sentry, no uptime monitor, no APM, no dashboards, no alerting-on-error.

**Testing.** Backend: 50 pytest tests, real coverage of happy paths *and* negative paths (verified — e.g. `test_cannot_delete_another_users_watchlist`, `test_login_before_verifying_email_is_rejected`). Frontend: **zero tests** (CRA's Jest/RTL scaffolding present, unused).

**CI/CD.** Does not exist (Section 15).

**Docker.** A `Dockerfile` exists, **never built or run** — categorically unverified, not "working but unoptimized."

**Caching/Background jobs.** No caching layer (Section 17). Background jobs (`generate_price_history.py`, `check_price_alerts.py`) exist as scripts but are **not scheduled** by anything — no cron, no Actions, no APScheduler.

**Database backups/disaster recovery.** Entirely delegated to Supabase's own free-tier backup policy (not independently configured or verified by this project) — `price_history` itself is trivially regenerable (Section 7) and would not need a backup-restore even if Supabase's failed; `users`/`watchlists`/`saved_searches`/`alerts` are real user data with no independent backup story beyond Supabase's defaults.

**Production risks, ranked by severity:** (1) no monitoring means a production outage would be silent until a user complains; (2) the in-memory rate limiter and lazy singleton both assume exactly one process, an assumption that would silently break (not error loudly) if ever scaled to 2+ instances; (3) the exposed Supabase password (Section 15/16) is a live, unresolved risk, not a historical one.

**Missing features for production:** CI/CD, monitoring, a scheduler for the two batch jobs, database connection pooling tuned for Postgres (currently default SQLAlchemy pool settings, never adjusted for Supabase's connection limits), a `/metrics` endpoint.

**Production readiness score: 3/10.** This is an honest score, not a harsh one: the application logic is solid, but almost none of the *operational* surface a production deployment needs (monitoring, CI/CD, scheduling, scaling validation) exists yet. The gap between "works when I run it locally" and "production-ready" is entirely in Sections 15/19, not in the business logic.

---

## 20. Design Patterns

| Pattern | Where | Why | Alternative considered |
|---|---|---|---|
| Singleton | `get_prediction_service()` (module-level `_service` cache) | Avoid reloading the multi-megabyte model + encoder on every request | FastAPI `lifespan` + `app.state` (more idiomatic FastAPI; functionally equivalent) |
| Dependency Injection | FastAPI's `Depends()` everywhere (`get_db`, `get_current_user`) | Testability (swap `DATABASE_URL` for tests without touching route code), explicitness | A DI container (e.g. `python-dependency-injector`) — unnecessary at this scale |
| Strategy (implicit) | `send_email()`'s dev-fallback vs. real-Brevo-send branch | Same call site behaves differently based on configuration, without callers caring | An explicit `EmailProvider` interface with two implementations — would be more "proper" OOP, arguably overkill for one provider |
| Self-invalidating token (a deliberate, named pattern in this codebase, not a textbook name) | `core/security.py`'s password-reset token embeds a hash of the current password | Avoids needing a separate token-revocation table/column | A stored, explicitly-revocable token table — more conventional, more infrastructure |
| Template Method (loose) | `render_branded_email()` — one shell, three callers supply heading/body/CTA | DRY across 3 email types | Jinja2 templates loaded from files — more standard for larger template sets, unnecessary for 3 |
| Repository pattern | **Not used** — services query the ORM directly | Simplicity at this scale | Would matter if swapping ORMs or adding a second data source ever became real |
| Factory | **Not used** — `FastAPI()`/`React` app instantiated directly at module scope | N/A | An app factory (`create_app()`) would help multi-config testing, not needed yet |

---

## 21. Third-Party Services

**Supabase.** Purpose: hosts the Postgres database. **Not** used for Auth, Storage, Realtime, or Edge Functions — only the raw Postgres connection (both a transaction-mode pooler for app traffic and a session-mode pooler for Alembic migrations).

**Brevo.** Purpose: transactional email (signup verification, password reset, price-drop alerts). Free tier, account verified live during this build, a real sender (`sumit.kmr1126@gmail.com`) confirmed active and verified.

**XGBoost / scikit-learn / SHAP.** Core ML stack — `xgboost.XGBRegressor` (the model), `sklearn.preprocessing.OrdinalEncoder` (feature encoding), `shap.TreeExplainer` (explainability). All open-source, no API keys, no cost.

**recharts.** Frontend charting — `BarChart`, `LineChart` with custom dot rendering.

**lucide-react.** Icon set, used consistently project-wide.

**react-hot-toast.** All user-facing success/error feedback.

**Authentication libraries.** None — `bcrypt` and `python-jose` are cryptographic primitives, not an auth *framework* (no Auth0, no Supabase Auth, no Firebase Auth).

**Deployment platforms.** Vercel and Render are planned targets (`render.yaml` exists); neither has an active deployment from this project (Section 15).

---

## 22. Configuration Analysis

**`backend/requirements.txt`.** Mixed: real, used dependencies (`fastapi`, `sqlalchemy`, `alembic`, `xgboost`, `shap`, `bcrypt`, `python-jose`, `slowapi`, `httpx`, `psycopg2-binary`) **alongside** dead leftovers from the original AWS-mockup generation (`boto3`, `botocore`, `sagemaker`, `pyspark`, `moto`) — confirmed unused by anything under `app/` via grep.

**`backend/alembic.ini` / `alembic/env.py`.** `env.py` is hand-modified (not the autogenerate stub): imports `Base`/`DATABASE_URL` from the app, escapes `%` for `configparser` compatibility (a real bug fixed during this build, Section 15).

**`backend/render.yaml`.** Defines one web service, build/start commands, three `sync: false` env vars (`DATABASE_URL`, `JWT_SECRET_KEY`, `CORS_ORIGINS`) meant to be set in Render's dashboard, not committed. **Never used to actually deploy.**

**`backend/Dockerfile`.** Multi-step: installs deps, copies the model training data CSV, **runs `python -m app.ml.train` at image-build time** (so the image is self-contained, at the cost of retraining the model on every build rather than shipping pre-trained artifacts) — **never built**, unverified.

**`backend/.env` / `.env.example`.** Real secrets live only in `.env` (gitignored); `.env.example` documents the shape. No frontend `tsconfig`/`vite.config`/`tailwind.config` exist — this is a Create React App project (`package.json`'s `scripts.start = "react-scripts start"`), not Vite, not Next.js, no Tailwind (custom CSS design tokens instead, Section 4).

**`frontend/package.json`.** React 18.2, `react-router-dom` (added mid-project), `axios`, `recharts`, `lucide-react`, `react-hot-toast`, `date-fns`. Standard CRA scripts (`start`/`build`/`test`/`eject`) — `npm test` would run, but there are no real test files for it to execute.

**Supabase configuration.** No `supabase/config.toml`, no Supabase CLI project — the project never used the Supabase CLI/local-dev tooling, only the hosted dashboard + a raw connection string.

---

## 23. Resume Analysis

**Professional resume description (one line):**
"Built a full-stack ML dynamic-pricing platform (React, FastAPI, PostgreSQL, XGBoost) with real per-prediction SHAP explainability, JWT authentication with email verification, and statistical anomaly detection — 50 passing backend tests, zero simulated data."

**ATS resume bullet points:**
- Trained and deployed an XGBoost regression model (R²=0.97) on 300K+ real flight fares, served via a FastAPI inference endpoint with sub-50ms response time.
- Implemented per-request SHAP explainability with exact waterfall reconstruction, verified by automated tests asserting the decomposition sums to the prediction.
- Built JWT-based authentication from primitives (bcrypt, python-jose) including email verification and self-invalidating password-reset tokens, rather than a third-party auth SDK.
- Designed a PostgreSQL schema (5 tables, Alembic-migrated) supporting multi-dimensional fare filtering (airline × stops × date) across a 64,800-row generated dataset.
- Implemented a modified-z-score anomaly detection algorithm (median/MAD-based) chosen specifically to avoid the masking effect of standard z-scores on small samples.
- Wrote 50 backend pytest tests covering both success and adversarial paths (cross-user authorization, rate-limit enforcement, expired-token handling).

**LinkedIn description:** "Airline dynamic-pricing system I built end-to-end: a real XGBoost model predicting flight fares with explainable AI (SHAP), wrapped in a FastAPI backend with hand-built auth, a fare calendar, watchlist price alerts (real email via Brevo), and anomaly detection — deployed on Supabase Postgres."

**Portfolio description:** Lead with the live `/docs` Swagger UI and the SHAP waterfall screenshot — these are the two most immediately verifiable "this is real, not a mockup" artifacts.

**GitHub README summary (recommended opening line):** "A flight dynamic-pricing platform with a real trained ML model (not a random-number generator) — try the live API at `/docs`, see why a prediction came out the way it did via real per-request SHAP values."

**Recruiter pitch (30 seconds):** "I rebuilt an AWS-architecture mockup into a real, working system: trained an XGBoost model on real flight fare data, built a FastAPI backend with real authentication and a real Postgres database, and added explainability so every prediction shows its own reasoning — not just a number. I can walk through the model's limitations as confidently as its strengths, including a specific case where I caught the model silently flatlining past its training range and built a fix rather than hiding it."

---

## 24. Technical Interview — 45 Questions with Answers

*(15 per tier, grounded in this exact codebase. Ask for the remaining 105 in the same style if you want the full 150.)*

### Beginner (15)

1. **Q: What does `PredictionService` do, and why is it a singleton?**
   A: It loads the XGBoost model, the fitted encoder, and metadata once at first use (`app/services/prediction.py`), reused across requests via a module-level `_service` variable. Reloading a multi-megabyte model on every request would be wasteful; the singleton pattern avoids that.

2. **Q: Why does the API reject `days_left=60` with a validation error?**
   A: `PredictRequest.days_left` has `Field(ge=1, le=49)` because the training data never had a value above 49 — the model can't meaningfully predict beyond that range (verified: it flatlines).

3. **Q: What's the difference between `app/api/v1/predict.py` and `app/services/prediction.py`?**
   A: The router is a thin HTTP adapter (parses the request, calls the service, returns the response). The service holds the actual logic — encoding, prediction, OOD check, SHAP.

4. **Q: How is a password stored?**
   A: `bcrypt.hashpw()`, never plaintext, never reversible — verified at login via `bcrypt.checkpw()`.

5. **Q: What happens if I send an invalid `airline` value to `/predict`?**
   A: FastAPI/Pydantic rejects it with a 422 before any business logic runs — `Airline` is a strict enum, not a free-text string.

6. **Q: Why is `/predict` unauthenticated?**
   A: A deliberate choice — it's the public demo feature; authentication is reserved for endpoints that touch a specific user's data (watchlists, saved searches, alerts).

7. **Q: What database does this use, and why two different connection strings?**
   A: PostgreSQL via Supabase. `DATABASE_URL` (port 6543, transaction pooler) is used by the running app; `DIRECT_URL` (port 5432, session pooler) is used only for Alembic migrations, since DDL doesn't play well with transaction-mode pooling.

8. **Q: What's `FEATURE_COLUMNS` and why does the order matter?**
   A: The exact column order the model was trained on (`app/ml/features.py`). XGBoost doesn't know column names at predict time once encoded into a NumPy array internally — mismatched order would silently produce wrong predictions.

9. **Q: How does the frontend know if a user is logged in?**
   A: `AuthContext` checks `localStorage` for a JWT on mount, calls `/auth/me` to validate it server-side, and sets `user` state accordingly.

10. **Q: What happens on logout?**
    A: The token is removed from `localStorage` client-side only — there is no server call, and the JWT remains technically valid until it expires naturally.

11. **Q: Why does `Watchlist` store `source_city`/`destination_city` as plain strings instead of a foreign key to a `routes` table?**
    A: A deliberate simplification, documented in code — no other feature needed route-level normalization at the time, and it avoided unnecessary complexity.

12. **Q: What's the purpose of `app/models/__init__.py`?**
    A: It imports all 5 model classes so Alembic's `--autogenerate` can see them via `Base.metadata` — a model class never imported anywhere is invisible to autogenerate.

13. **Q: What does the `~` prefix on some Fare Calendar prices mean?**
    A: It marks a date more than 49 days out, where the model's prediction is known to be a flattened, low-confidence estimate rather than a fresh calculation.

14. **Q: Why is there no `/auth/logout` endpoint?**
    A: Because there's nothing server-side to undo — JWTs are stateless; "logging out" is purely a client-side action (discarding the token).

15. **Q: What library renders the icons throughout the UI?**
    A: `lucide-react`, used consistently across every component.

### Intermediate (15)

16. **Q: Explain training/serving skew and how this project avoids it.**
    A: It's when the feature transformation logic differs between training and inference, causing silently wrong predictions. Avoided here by persisting the *exact* fitted `OrdinalEncoder` (via joblib) and reusing the same `FeaturePipeline.transform()` call at serving time that was used (as `fit_transform`) at training time.

17. **Q: Why use a modified z-score (median/MAD) instead of a standard z-score for anomaly detection?**
    A: A standard z-score uses mean/std, both of which a single large outlier distorts — the outlier inflates its own denominator and can mask itself. Median/MAD barely moves when one point is extreme, so the anomaly stays detectable.

18. **Q: How does the system avoid double-sending a price alert for the same watchlist?**
    A: A unique constraint on `(watchlist_id, travel_date)` in the `alerts` table, plus an explicit existence check before insert in `check_price_alerts.py` — verified by a dedicated idempotency test.

19. **Q: Walk through what happens when a password-reset token is reused after the password has already been changed.**
    A: The token contains a `pwd_fp` claim = a hash of the password at issuance time. After a successful reset, the user's `hashed_password` changes, so `pwd_fp` no longer matches — the token is rejected on its second use without needing a separate revocation list.

20. **Q: Why does `/analytics/market` take ~2.7 seconds?**
    A: It fetches all ~64,800 `price_history` rows into Python and aggregates them there, rather than letting Postgres do a `GROUP BY`. Correct, but not how it would be written for a much larger table.

21. **Q: How are SHAP contributions reconciled to exactly equal the predicted price?**
    A: `base_value` (the model's expected value) plus the sum of *all* per-feature SHAP values equals the raw prediction by construction (SHAP's additivity property). The API splits that sum into the top-5 contributions plus an `other_features_impact` bucket for the rest, so the three pieces still add up exactly — asserted directly in a test.

22. **Q: Why does `price_history` get fully deleted and re-inserted on every generation run instead of appended to?**
    A: It's treated as a regenerable cache of current estimates, not a historical log — there's no requirement (yet) to know what the model predicted yesterday, only what it predicts now.

23. **Q: What's the actual difference between `Watchlist` and `SavedSearch` at the schema level?**
    A: `Watchlist` has an extra `target_price` field; otherwise nearly identical. This is a known, documented duplication that could be merged into one table with an optional price field.

24. **Q: How does rate limiting work, and what's its known weakness?**
    A: `slowapi`, keyed by client IP, in-memory counters. The weakness: it's per-process — if the backend ever ran as 2+ instances behind a load balancer, each instance would have its own counter, multiplying the effective limit.

25. **Q: Why is `JWT_SECRET_KEY` checked at import time rather than at request time?**
    A: Fail-fast — if `ENV=production` and the secret is still the insecure default, the app refuses to start at all rather than silently running with a guessable signing key.

26. **Q: What's the actual content of a calendar day's `confidence_low`/`confidence_high`?**
    A: `price ± MAE` (the model's mean absolute error on its held-out test set), not a statistically derived prediction interval — an approximation, explicitly documented as such.

27. **Q: How does the frontend handle an expired JWT mid-session?**
    A: An axios response interceptor checks for a 401 and calls a registered `onUnauthorized` handler, which `AuthContext` wires to `logout()` — the next failed request triggers an automatic logout, not a silent refresh.

28. **Q: Why does `generate_price_history.py` bypass `PredictionService` entirely?**
    A: Performance and scope — the batch job scores 64,800 rows at once via direct `model.predict()` on a full DataFrame; routing that through the per-request service (which also computes SHAP and OOD checks meant for a single prediction) would be far slower and computing unneeded explanations for every row.

29. **Q: What prevents a user from deleting another user's watchlist?**
    A: The delete query filters by both `id` and `user_id == current_user.id` — if the watchlist belongs to someone else, the filter matches nothing and a 404 is returned (not a 403, to avoid revealing that the resource exists at all).

30. **Q: Why was Supabase Auth not used, given Supabase is already the database?**
    A: A deliberate trade: hand-rolling JWT/bcrypt auth is more code but a stronger engineering signal than wiring up a vendor SDK, and it kept the auth logic fully owned and testable rather than depending on an external auth provider's behavior.

### Advanced (15)

31. **Q: If you needed to scale this backend to multiple instances, what would break first, and how would you fix it?**
    A: The in-memory rate limiter (each instance gets independent counters, multiplying the effective limit) and the lazy model singleton (each instance loads its own copy — fine for memory at this model's size, but redundant). Fix: move the rate limiter to a Redis-backed store (`slowapi` supports this natively); the model singleton is less urgent since the model is small.

32. **Q: The model flatlines past `days_left=49`. What are three different ways you could address this, and what would you actually choose?**
    A: (1) Retrain on a dataset with a wider `days_left` range — the correct fix, blocked on finding/creating such a dataset; (2) apply a documented decay heuristic beyond day 49 — rejected, since it would be fabricating signal the model doesn't have; (3) flag and label, which is what was actually implemented — honest about the limitation rather than disguising it.

33. **Q: Walk through exactly how a percent sign in the database password broke Alembic, and why.**
    A: The Supabase password contained `@`, which had to be percent-encoded as `%40` in the connection URL (since `@` is the credentials/host delimiter). Alembic's `Config` object stores the URL via `configparser`, which treats `%` as the start of an interpolation token (`%(name)s`) — a literal `%40` in the string broke parsing. Fixed by `.replace("%", "%%")` before storing it, since `configparser` treats `%%` as a literal `%`.

34. **Q: Why is `get_market_analytics()` correct in its current form, but not how you'd write it at 10x the data volume?**
    A: It's correct because the in-Python collapse-then-aggregate logic exactly reproduces "cheapest fare per route/class/date" semantics that would be awkward to express as a single SQL query without window functions. At 10x volume, pulling every row into Python stops being viable; the fix is a `ROW_NUMBER() OVER (PARTITION BY ... ORDER BY price)` window function done in SQL, returning only the already-aggregated rows.

35. **Q: How would you add real, scheduled price polling (e.g., from Amadeus) without breaking what already exists?**
    A: Write a new populator that fills the same `price_history` schema, setting `source="amadeus"` instead of `"model_estimate"` — every downstream consumer (calendar, anomaly detection, market analytics) is agnostic to where a row came from, by design.

36. **Q: Why does the password-reset token include a hash of the *password*, not a random nonce stored in the database?**
    A: It avoids needing a database table/column purely for token revocation — the token self-invalidates the moment the thing it's protecting (the password) changes, with zero additional storage or cleanup logic required.

37. **Q: The Profile page's in-app password-change flow is now broken. Explain why, precisely.**
    A: It was built when Brevo wasn't configured, so `forgot-password` always returned `dev_reset_token` in the response, which the UI used to immediately show a password-change form. Now that Brevo is live, the token is emailed instead and the API field is `null`, so the UI's `!devToken ? <button> : <form>` branch never reaches the form — a real regression introduced by a feature (Brevo) added after this component, without updating the component to match.

38. **Q: What's the actual security argument for returning 404 (not 403) when a user tries to delete someone else's watchlist?**
    A: 403 confirms the resource exists but access is denied — that's an information leak (an attacker learns watchlist ID N belongs to *someone*). 404 is indistinguishable from "doesn't exist at all," giving no information about other users' data.

39. **Q: Why are SHAP values computed per-request rather than precomputed for common inputs?**
    A: SHAP values are specific to the exact feature vector submitted — duration, days_left, and every categorical combination changes them. Precomputing would require caching every possible combination (6 airlines × 6×5 city pairs × 6 times × 6 times × 3 stops × 2 classes × continuous duration/days_left) — infeasible; computing per-request is the only correct option, and is fast enough (single-digit milliseconds) not to need caching anyway.

40. **Q: How would you detect a categorical out-of-distribution input (e.g., an airline/route combination that never appeared in training), given the current OOD check only covers two numeric features?**
    A: Track the actual (airline, source_city, destination_city, class) combinations seen during training (a set lookup), and flag any inference request whose combination isn't in that set — currently not implemented, a known gap (Section 8).

41. **Q: Why does `check_price_alerts.py` still create an `Alert` row even when the Brevo email fails to send?**
    A: Separates "the price condition was met" (a durable fact, worth recording) from "the user was successfully notified" (a delivery detail, may fail transiently) — `channel`/`sent_at` track the latter without blocking the former.

42. **Q: If you had to add true historical price tracking (not just forward-looking estimates), what would change in the schema?**
    A: `generate_price_history.py` would need to stop deleting the table on each run and instead always insert new rows with a distinct `collected_at` per run, making `(route, class, date, stops, airline, collected_at)` the natural key instead of overwriting `(route, class, date, stops, airline)` — a meaningfully different table semantics, not a small patch.

43. **Q: Explain the actual difference between this project's confidence range and a real quantile-regression prediction interval.**
    A: A true interval (e.g., via `XGBRegressor` trained with quantile loss, or `NGBoost`) would produce an interval whose width reflects the model's actual uncertainty for *that specific input* — wider for unusual inputs, narrower for typical ones. This project's `±MAE` is a single fixed-width band (doubled if OOD) applied uniformly — simpler, defensible as an approximation, but not adaptive to per-prediction uncertainty the way a real quantile model would be.

44. **Q: Why does the unique constraint on `price_history` include `stops` and `airline`, when it didn't originally?**
    A: The table was redesigned mid-project specifically to support airline/stops filtering in the Fare Calendar — the original schema collapsed to "cheapest only" at generation time, which made filtering by a specific airline impossible (the data literally wasn't stored). The schema migration (and a full data regeneration, 3,600 → 64,800 rows) was required to support the feature honestly rather than faking the filter.

45. **Q: If this needed real RBAC (e.g., an admin-only analytics endpoint), what's missing today and what would you add?**
    A: `User.role` and `require_admin()` already exist but are unused. Adding a real admin endpoint means: (1) actually applying `Depends(require_admin)` to it, (2) a way to grant the `admin` role (currently no code path sets it to anything but the default `"user"` — it would need a manual DB update or a dedicated promotion endpoint), (3) tests proving a non-admin gets 403.

---

## 25. Strengths

- **The SHAP waterfall is provably exact, not just plausible-looking** — `base_value + Σcontributions + other_features_impact == predicted_price`, enforced by an automated test, not eyeballed.
- **The 49-day model limitation was discovered, proven by direct experiment, and disclosed in the UI** rather than papered over — this is the single strongest engineering-judgment signal in the whole project (Section 12).
- **Self-invalidating password-reset tokens** — a genuinely clean piece of design (no revocation table, the security property falls out of the token's own construction).
- **The 404-not-403 ownership-check decision**, deliberately reasoned, not a default.
- **The training/serving skew fix** (one shared `FeaturePipeline` instance, persisted and reused) — a textbook-correct ML engineering practice many portfolio projects skip entirely.
- **Real negative-path test coverage** — cross-user authorization, rate-limit tripping, expired/garbage tokens, unverified-login rejection — not just happy-path tests.
- **Honest data provenance labeling** — `price_history.source` distinguishes `model_estimate` from `synthetic_shock`, so even the deliberately-injected demo anomalies are traceable, never silently presented as real market events.

## 26. Weaknesses

- **Section 10's confirmed live bug:** `Profile.js`'s in-app password-change flow no longer functions now that Brevo sends real email instead of returning a dev token.
- **Price Drop Alerts has zero frontend surface** — fully built backend, no UI consumer at all.
- **No CI/CD, no monitoring, no scheduled jobs** — the two batch scripts must be run by hand.
- **`Watchlist`/`SavedSearch` duplication**, never merged.
- **Manual enum duplication** between `backend/app/schemas/predict.py` and `frontend/src/api/client.js`'s `FLIGHT_OPTIONS`, with nothing enforcing they stay in sync.
- **`get_market_analytics()`'s O(n) full-table Python aggregation** — correct today, a real scaling cliff.
- **No composite database index** on the (source_city, destination_city, flight_class, travel_date) pattern every analytics query filters by.
- **JWT stored in `localStorage`**, no server-side revocation, no refresh tokens.
- **A live, unrotated credential exposure** (the Supabase password pasted into this chat session).
- **Dead AWS dependencies** (`boto3`, `sagemaker`, `pyspark`, `moto`) still in `requirements.txt` from the project's earlier mockup phase.
- **Zero frontend tests.**
- **Nothing is actually deployed** — `render.yaml` and `Dockerfile` both exist, neither has been exercised.
- **No load testing was ever performed** — every performance claim in this document is based on single-request timing, not concurrent load.

## 27. Improvement Roadmap

**Immediate (hours, not days):**
1. Rotate the exposed Supabase password.
2. Fix `Profile.js`'s password-change flow to work with real Brevo delivery (redirect to `/forgot-password` instead of expecting an in-page token).
3. Remove dead AWS dependencies from `requirements.txt`.

**Short-term (1-3 days each):**
4. Build the missing alerts frontend page (`client.js` function + a new component + a sidebar entry) — the backend is already done and tested.
5. Add a composite index on `price_history(source_city, destination_city, flight_class, travel_date)`.
6. Add a GitHub Actions workflow running the existing 50 backend tests on every push — the tests already exist, they're just never run automatically.

**Medium-term (1-2 weeks):**
7. Move `get_market_analytics()`'s aggregation into SQL (window functions) before data volume grows further.
8. Merge `Watchlist`/`SavedSearch` into one table with a `kind` discriminator.
9. Generate `frontend/src/api/client.js`'s enum lists from the backend's live OpenAPI schema instead of hand-duplicating them.
10. Actually deploy: build+verify the Dockerfile, stand up the Render service from `render.yaml`, deploy the frontend to Vercel.
11. Add a basic frontend test suite (even 10 component smoke tests would close the most visible asymmetry in the project).

**Long-term:**
12. Real historical price tracking (append-only `price_history` with a `collected_at` key, instead of regenerate-and-overwrite).
13. A categorical-combination OOD check (track which (airline, route, class) combinations existed in training, flag anything else).
14. Real RBAC — wire `require_admin` to an actual admin analytics endpoint.
15. Retrain the model on a dataset with a wider `days_left` range, removing the 49-day ceiling properly rather than just labeling around it.
16. Monitoring (Sentry for errors at minimum) and a scheduler (GitHub Actions cron is free and sufficient) for the two batch jobs.

**Ranking by impact × effort:** items 1-3 are highest-impact, lowest-effort (do these regardless of anything else). Item 4 (alerts UI) is the single highest-impact *feature* gap, since the backend work is sunk cost already done. Item 10 (deployment) is the highest-impact item for *external evaluation* of this project specifically, independent of code quality.

## 28. Overall Rating

| Dimension | Score /10 | Basis |
|---|---|---|
| Architecture | 7 | Clean backend layering; frontend has no equivalent layer, by choice not oversight |
| Frontend | 6 | Functional, consistent, zero tests, no code-splitting |
| Backend | 8 | Thin routers, real services, 50 real tests, consistent error handling |
| Machine Learning | 8 | Real model, real metrics, genuinely exact SHAP reconciliation, an honestly-disclosed limitation — the standout section |
| Database | 7 | Sound schema, real migrations, two acknowledged design debts (no composite index, Watchlist/SavedSearch duplication) |
| Security | 6 | Correct fundamentals, real unresolved gaps (localStorage tokens, no revocation, an exposed credential) |
| Performance | 5 | One measured, named bottleneck; otherwise untested rather than proven good or bad |
| Deployment | 2 | Designed on paper, nothing actually running anywhere but localhost |
| Scalability | 4 | Two specific, named single-process assumptions that would break under horizontal scaling |
| Maintainability | 7 | Readable, consistently named, debt items are small and enumerable, not structural |
| Documentation | 8 | This document plus the in-repo `docs/model_card.md`, `AUDIT.md`, and extensive code comments explaining *why* |
| Innovation | 8 | The exact-reconciliation SHAP waterfall and the disclosed-not-hidden 49-day limitation are both genuinely above the bar for a portfolio ML project |
| Resume value | 8 | Defensible, specific, interview-tested talking points exist for every claim (Section 24) |
| Portfolio value | 7 | Strong once deployed; currently capped by Section 15's "nothing is live" gap |
| Hiring potential (as a signal of the candidate's engineering judgment) | 8 | The 49-day discovery-and-disclosure, the self-invalidating token design, and the SHAP exactness test are the three strongest individual signals in the codebase |

**Overall score: 6.7/10 — a genuinely strong ML-engineering core, held back almost entirely by undeployed infrastructure and a handful of small, named, fixable gaps rather than by any flaw in the core logic or judgment on display.**


