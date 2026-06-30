import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthLayout from './components/auth/AuthLayout';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import VerifyEmail from './components/auth/VerifyEmail';
import LandingPage from './components/LandingPage';
import FeaturesPage from './components/FeaturesPage';
import WorkingPage from './components/WorkingPage';
import AboutPage from './components/AboutPage';
import Dashboard from './components/Dashboard';
import PricePrediction from './components/PricePrediction';
import FareCalendar from './components/FareCalendar';
import MarketAnalytics from './components/MarketAnalytics';
import AnomalyDetection from './components/AnomalyDetection';
import Watchlists from './components/Watchlists';
import SavedSearches from './components/SavedSearches';
import Alerts from './components/Alerts';
import Profile from './components/Profile';
import Sidebar from './components/Sidebar';
import AccountBar from './components/AccountBar';
import { Menu, X, Plane } from 'lucide-react';

function AppShell() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [predictionPrefill, setPredictionPrefill] = useState(null);

    const goToPrediction = (prefill) => {
        setPredictionPrefill(prefill);
        setActiveTab('price-prediction');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard setActiveTab={setActiveTab} />;
            case 'price-prediction':
                return <PricePrediction initialValues={predictionPrefill} />;
            case 'fare-calendar':
                return <FareCalendar onPredictRoute={goToPrediction} />;
            case 'market-analytics':
                return <MarketAnalytics />;
            case 'anomaly-detection':
                return <AnomalyDetection />;
            case 'watchlists':
                return <Watchlists />;
            case 'alerts':
                return <Alerts />;
            case 'saved-searches':
                return <SavedSearches onPredictRoute={goToPrediction} />;
            case 'profile':
                return <Profile />;
            default:
                return <Dashboard setActiveTab={setActiveTab} />;
        }
    };

    return (
        <div className="relative min-h-screen lg:h-screen lg:overflow-hidden flex flex-col bg-[url('/Image/sky.jpg')] bg-cover bg-center bg-fixed">
            <div className="flex items-center justify-between px-6 sm:px-8 py-6 shrink-0">
                <div className="flex items-center gap-3">
                    <Plane size={26} className="text-cyan-300 drop-shadow-[0_0_10px_rgba(103,232,249,0.6)]" />
                    <span
                        className="text-2xl sm:text-3xl font-extrabold text-cyan-200"
                        style={{ textShadow: '0 0 16px rgba(103,232,249,0.55), 0 0 2px rgba(255,255,255,0.8)' }}
                    >
                        FareLens
                    </span>
                </div>
                <button
                    className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors duration-200"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label="Toggle sidebar"
                >
                    {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 px-4 sm:px-6 lg:px-8 pb-6 lg:flex-1 lg:min-h-0">
                {sidebarOpen && (
                    <div className="flex flex-col lg:shrink-0 lg:h-full">
                        <Sidebar
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            onNavigate={() => setSidebarOpen(false)}
                        />
                        <AccountBar setActiveTab={setActiveTab} />
                    </div>
                )}

                <main className="flex-1 min-w-0 lg:h-full lg:overflow-y-auto">
                    <div className="rounded-2xl border border-white/15 bg-white/8 backdrop-blur-xl shadow-2xl p-4 sm:p-6 lg:p-8 lg:min-h-full animate-fadeIn">
                        <div className="max-w-[1600px] mx-auto">
                            {renderContent()}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

function LoadingScreen() {
    return (
        <div className="flex items-center justify-center min-h-screen p-6 bg-[radial-gradient(circle_at_15%_20%,rgba(217,164,65,0.14),transparent_40%),radial-gradient(circle_at_85%_80%,rgba(61,107,133,0.18),transparent_40%),linear-gradient(160deg,#0d1116_0%,#161c23_60%,#11161c_100%)]">
            <div className="skeleton" style={{ width: 64, height: 64, borderRadius: '50%' }} />
        </div>
    );
}

/** Auth pages (login/register/forgot/reset/verify): redirect away if already logged in. */
function PublicOnlyRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <LoadingScreen />;
    return user ? <Navigate to="/" replace /> : children;
}

/** Everything else: redirect to /login if not authenticated. */
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <LoadingScreen />;
    return user ? children : <Navigate to="/login" replace />;
}

/** Root path is the public marketing page for logged-out visitors, but
 * shows the real app directly for anyone already logged in — so existing
 * bookmarks/links to "/" keep working exactly as before. */
function HomeRoute() {
    const { user, loading } = useAuth();
    if (loading) return <LoadingScreen />;
    return user ? <AppShell /> : <LandingPage />;
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#161c23',
                            color: '#eef2f3',
                            border: '1px solid #232b34',
                        },
                    }}
                />
                <Routes>
                    <Route path="/login" element={<PublicOnlyRoute><AuthLayout><Login /></AuthLayout></PublicOnlyRoute>} />
                    <Route path="/register" element={<PublicOnlyRoute><AuthLayout><Signup /></AuthLayout></PublicOnlyRoute>} />
                    <Route path="/forgot-password" element={<PublicOnlyRoute><AuthLayout><ForgotPassword /></AuthLayout></PublicOnlyRoute>} />
                    <Route path="/reset-password" element={<PublicOnlyRoute><AuthLayout><ResetPassword /></AuthLayout></PublicOnlyRoute>} />
                    <Route path="/verify-email" element={<PublicOnlyRoute><AuthLayout><VerifyEmail /></AuthLayout></PublicOnlyRoute>} />
                    <Route path="/" element={<HomeRoute />} />
                    <Route path="/features" element={<FeaturesPage />} />
                    <Route path="/working" element={<WorkingPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/*" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
