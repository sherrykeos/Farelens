import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
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
import { Menu, X, Plane, ArrowLeft } from 'lucide-react';

function AppShell() {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [predictionPrefill, setPredictionPrefill] = useState(null);

    // Sync activeTab with URL sub-path, e.g. /dashboard/price-prediction -> 'price-prediction'
    const pathParts = location.pathname.split('/');
    const activeTab = pathParts[2] || 'dashboard';

    const setActiveTab = (tabId) => {
        if (tabId === 'dashboard') {
            navigate('/dashboard');
        } else {
            navigate(`/dashboard/${tabId}`);
        }
    };

    const goToPrediction = (prefill) => {
        setPredictionPrefill(prefill);
        navigate('/dashboard/price-prediction');
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
        <div className="relative min-h-screen lg:h-screen lg:overflow-hidden flex bg-bg-primary text-text-primary font-sans">
            {/* Sidebar (Desktop + Mobile overlay if open) */}
            {sidebarOpen && (
                <>
                    <div className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                    <div className="fixed lg:static inset-y-0 w-[250px] z-30 flex flex-col transition-transform duration-300">
                        {/* Logo Header */}
                        <a
                        href='/'>
                        <div className="flex items-center justify-between px-10 h-[72px] shrink-0">
                            <div className="flex items-center gap-3">
                                <img
                                    src="/logos/farelens_logo-.png"
                                    alt="FareLens Logo"
                                    className="w-10 h-10 mt-1"
                                />
                                <span className="text-lg font-bold text-white tracking-wide">
                                    FareLens
                                </span>
                            </div>
                            <button className="lg:hidden text-text-tertiary hover:text-white" onClick={() => setSidebarOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        </a>

                        {/* Floating Box containing Navigation & Account */}
                        <div className="flex-1 flex flex-col bg-[#020e1a] border border-border rounded-2xl ml-5 mb-10 mt-5 overflow-hidden">
                            {/* Sidebar Navigation */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <Sidebar
                                    activeTab={activeTab}
                                    setActiveTab={setActiveTab}
                                    onNavigate={() => { if (window.innerWidth < 1024) setSidebarOpen(false) }}
                                />
                            </div>

                            {/* User Account / Bottom Action */}
                            <div className="p-3 border-t rounded-2xl    border-border shrink-0">
                                <AccountBar setActiveTab={setActiveTab} />
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 lg:h-full lg:overflow-hidden bg-bg-primary">
                {/* Top Navigation Bar */}
                <header className="h-[72px] flex items-center justify-between px-4 md:px-6 lg:px-10 border-b rounded-3xl border-border bg-bg-primary/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        {!sidebarOpen && (
                            <button
                                className="flex items-center justify-center w-10 h-10 rounded-lg text-text-secondary hover:text-white hover:bg-surface-hover transition-colors duration-200"
                                onClick={() => setSidebarOpen(true)}
                                aria-label="Toggle sidebar"
                            >
                                <Menu size={20} />
                            </button>
                        )}
                        <h2 className="text-sm font-medium text-text-secondary capitalize hidden sm:block tracking-wide">
                            {activeTab.split('-').join(' ')}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link 
                            to="/landing" 
                            className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold text-text-secondary bg-surface border border-border transition-all duration-200 hover:bg-surface-hover hover:text-text-primary hover:-translate-y-0.5"
                            aria-label="Back to landing page"
                        >
                            <ArrowLeft size={14} />
                            <span className="hidden sm:inline">Back to landing page</span>
                        </Link>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 scroll-smooth">
                    <div className="max-w-[1400px] mx-auto animate-fadeIn pb-12 overflow-x-hidden">
                        {renderContent()}
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
    return user ? <Navigate to="/dashboard" replace /> : children;
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
                    <Route path="/features" element={<Navigate to="/#features" replace />} />
                    <Route path="/feature" element={<Navigate to="/#features" replace />} />
                    <Route path="/landing" element={<LandingPage />} />
                    <Route path="/dashboard/*" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
                    <Route path="/dashboard" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/working" element={<WorkingPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/*" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
