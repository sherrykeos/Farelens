import React, { useEffect, useState } from 'react';
import {
    IndianRupee,
    Target,
    Database,
    TrendingUp,
    Sparkles,
    MapPin,
    ArrowRight,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { getModelInfo, getMarketAnalytics } from '../api/client';

const Dashboard = ({ setActiveTab }) => {
    const [modelInfo, setModelInfo] = useState(null);
    const [market, setMarket] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getModelInfo(), getMarketAnalytics()])
            .then(([model, analytics]) => {
                setModelInfo(model);
                setMarket(analytics);
            })
            .catch(() => toast.error('Could not load dashboard data'))
            .finally(() => setLoading(false));
    }, []);

    const avgPriceChartData = market
        ? Object.entries(market.avg_price_by_class).map(([name, value]) => ({ name, price: value }))
        : [];

    const glassCard = 'rounded-2xl border border-white/15 bg-white/8 backdrop-blur-xl shadow-lg p-6 transition-all duration-300 hover:bg-white/12';

    if (loading) {
        return (
            <div className="flex flex-col gap-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="rounded-2xl border border-white/10 bg-white/5 animate-pulse" style={{ height: 140 }} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-start mb-2 flex-col lg:flex-row gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white mb-1">Dashboard</h1>
                    <p className="text-base text-white/60">
                        Live numbers from the trained model and collected fare data — nothing simulated
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className={glassCard}>
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full border border-amber-300/40 bg-amber-400/15 text-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.35)]">
                            <Target size={24} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <h3 className="text-3xl font-extrabold text-white leading-none">{modelInfo ? `±${Math.round(modelInfo.metrics.mae)}` : '—'}</h3>
                        <p className="text-sm text-white/55">Model MAE (₹), held-out test set</p>
                    </div>
                </div>

                <div className={glassCard}>
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full border border-emerald-300/40 bg-emerald-400/15 text-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.35)]">
                            <Sparkles size={24} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <h3 className="text-3xl font-extrabold text-white leading-none">{modelInfo ? modelInfo.metrics.r2.toFixed(3) : '—'}</h3>
                        <p className="text-sm text-white/55">R² score (variance explained)</p>
                    </div>
                </div>

                <div className={glassCard}>
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full border border-cyan-300/40 bg-cyan-400/15 text-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.35)]">
                            <Database size={24} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <h3 className="text-3xl font-extrabold text-white leading-none">{market ? market.data_points.toLocaleString() : '—'}</h3>
                        <p className="text-sm text-white/55">Collected price_history rows</p>
                    </div>
                </div>

                <div className={glassCard}>
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full border border-orange-300/40 bg-orange-400/15 text-orange-300 shadow-[0_0_12px_rgba(251,146,60,0.35)]">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <h3 className="text-3xl font-extrabold text-white leading-none">{market?.popular_routes.length || 0}</h3>
                        <p className="text-sm text-white/55">Routes with active user interest</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className={glassCard}>
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                        <h3 className="flex items-center gap-2 text-xl font-semibold text-white">Average Price by Class</h3>
                    </div>
                    <div className="py-4">
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={avgPriceChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ background: 'rgba(20,28,40,0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff' }}
                                    formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Avg price']}
                                />
                                <Bar dataKey="price" fill="#67e8f9" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className={glassCard}>
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                        <h3 className="flex items-center gap-2 text-xl font-semibold text-white">Most-Watched Routes</h3>
                    </div>
                    <div className="flex flex-col gap-4 py-4">
                        {market && market.popular_routes.length > 0 ? (
                            market.popular_routes.map((route, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 bg-white/5 border-l-[3px] border-l-cyan-400 rounded-md transition-all duration-300 hover:bg-white/10 hover:translate-x-1 text-cyan-300">
                                    <MapPin size={18} />
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-white mb-1">{route.source_city} → {route.destination_city}</p>
                                        <p className="text-xs text-white/55">{route.interest_count} users tracking this route</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-base text-white/60">No watchlists or saved searches yet — try creating one.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <button className={`${glassCard} group w-full font-[inherit] text-inherit cursor-pointer text-left`} onClick={() => setActiveTab('price-prediction')}>
                    <div className="flex justify-between items-center mb-2 text-white">
                        <h3 className="flex items-center gap-2 text-xl font-semibold group-hover:text-cyan-300 transition-colors duration-300"><IndianRupee size={18} />Predict a Fare</h3>
                        <ArrowRight size={18} className="group-hover:text-cyan-300 transition-colors duration-300" />
                    </div>
                    <p className="text-base text-white/60">Run the live XGBoost model on any route, date, and class.</p>
                </button>

                <button className={`${glassCard} group w-full font-[inherit] text-inherit cursor-pointer text-left`} onClick={() => setActiveTab('fare-calendar')}>
                    <div className="flex justify-between items-center mb-2 text-white">
                        <h3 className="flex items-center gap-2 text-xl font-semibold group-hover:text-cyan-300 transition-colors duration-300"><TrendingUp size={18} />Browse Fare Calendar</h3>
                        <ArrowRight size={18} className="group-hover:text-cyan-300 transition-colors duration-300" />
                    </div>
                    <p className="text-base text-white/60">Find the cheapest day to fly a route over the next 49 days.</p>
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
