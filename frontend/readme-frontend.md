# FareLens Frontend Documentation

Welcome to the frontend application architecture of **FareLens**, a premium flight price prediction and analytics web app. The interface is engineered as a responsive Single Page Application (SPA) designed to deliver a high-end, visual experience utilizing glassmorphism, glowing micro-interactions, and complex structural animations.

---

## 🛠️ Tech Stack & Key Libraries

The application is built on top of a modern client-side environment:

* **Build Tooling:** **Vite** for rapid hot-reloads and optimized production builds.
* **Styling Framework:** **Tailwind CSS v4.0** (integrated via `@tailwindcss/vite` plugin) utilizing CSS variables and modern custom designs.
* **Core Library:** **React v18** with functional components and React hooks.
* **Routing:** **React Router DOM v7** managing page states, public/protected route authorization walls, and dashboard sub-paths.
* **Animation Engine:** **Framer Motion v12** driving the landing page carousels, responsive expanding feature cards, and dashboard page transitions.
* **Data Visualization:** **Recharts** rendering pricing trends, error margin confidence envelopes, and SHAP feature-impact waterfalls.
* **Iconography:** **Lucide React** supplying responsive UI icons.

---

## 📂 Project Structure

```
frontend/
├── public/                 # Static assets, branding logos, and authentication backgrounds
├── src/
│   ├── api/
│   │   └── client.js       # Pre-configured Axios instance with JWT auth interceptors
│   ├── context/
│   │   └── AuthContext.jsx # Global user session manager, token storage, and auth hooks
│   ├── components/
│   │   ├── auth/           # Glassmorphic auth cards (Login, Signup, Forgot, Reset, Verify)
│   │   ├── AboutPage.jsx   # Public project info and team profile section
│   │   ├── WorkingPage.jsx # Technical details explaining Kinesis, Glue, and SageMaker
│   │   ├── LandingPage.jsx # Marketing homepage (Interactive Showcase, Browser Glimpse)
│   │   ├── Dashboard.jsx   # Quick actions summary, user watchlists, and key stats
│   │   ├── PricePrediction.jsx # XGBoost runs with SHAP waterfall & confidence charts
│   │   ├── MarketAnalytics.jsx # Route comparison graphs and pricing history charts
│   │   ├── AnomalyDetection.jsx # Isolation Forest anomaly streams & fare glitches
│   │   ├── FareCalendar.jsx # Grid-view multi-day fare calendar planner
│   │   ├── Sidebar.jsx     # Navigation menu matching active URL paths
│   │   ├── AccountBar.jsx  # Floating user profile widget in dashboard sidebar
│   │   ├── Navbar.jsx      # Sticky/floating public header supporting scroll-transforms
│   │   └── Footer.jsx      # Public footer enclosing marketing pages
│   ├── App.jsx             # React router configuration and dashboard AppShell component
│   └── index.css           # Global CSS variables, custom scrollbars, and keyframes
```

---

## 🔌 API & Authentication Integration

### 1. Global Session Management (`AuthContext.jsx`)
Exposes state properties:
* `user`: The authenticated user object (`name`, `email`, etc.).
* `loading`: Blocking loader state while validating stored local tokens on mount.
* Methods: `login()`, `signup()`, `logout()`, and `verifyEmail()`.

### 2. Authorization Interceptors (`client.js`)
* Automatically injects `Authorization: Bearer <token>` header on outgoing queries.
* Redirects automatically or handles session purges if the backend throws a `401 Unauthorized` token expiry response.

---

## 📈 Dashboard Data Visualizations

The dashboard translates complex machine learning outputs into intuitive charts:
* **Confidence Envelopes:** Renders the predicted fare along with upper and lower margins using Recharts Area charts to visualize margin metrics.
* **SHAP Waterfall Charts:** Displays dynamic horizontal Bar charts showing how individual features (e.g., flight class, lead days, stops) pulled or pushed the price away from the model's base value.
* **Anomaly Flagging:** Color-codes routes based on Isolation Forest output values, letting users quickly spot pricing anomalies and "error fares."

---

## ⚡ Setup & Execution

Ensure Node.js is installed on your local machine.

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Run the Development Server
Starts the local development server at `http://localhost:5173`:
```bash
npm run dev
```

### 3. Build for Production
Compiles optimized assets in the `/dist` directory:
```bash
npm run build
```
