import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { BarChart3, MapPin, TrendingDown, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMarketAnalytics } from '../api/client';

const routeLabel = (r) => `${r.source_city} → ${r.destination_city}`;

const tooltipStyle = { background: 'rgba(20,28,40,0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff' };
const axisColor = 'rgba(255,255,255,0.5)';
const gridColor = 'rgba(255,255,255,0.1)';

/** Horizontal bar chart — route names are long strings ("Chennai → Bangalore"),
 * which read far better as Y-axis category labels than crammed under
 * vertical bars on the X-axis. */
const RouteBarChart = ({ data, dataKey, color, formatter, height }) => (
    <ResponsiveContainer width="100%" height={height || Math.max(160, data.length * 56)}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
            <XAxis type="number" stroke={axisColor} fontSize={12} />
            <YAxis
                dataKey="route"
                type="category"
                stroke={axisColor}
                fontSize={12}
                width={150}
            />
            <Tooltip contentStyle={tooltipStyle} formatter={formatter} />
            <Bar dataKey={dataKey} radius={[0, 6, 6, 0]} barSize={22}>
                {data.map((_, i) => <Cell key={i} fill={color} />)}
                <LabelList dataKey={dataKey} position="right" fill="#fff" fontSize={12} formatter={formatter ? (v) => formatter(v)[0] : undefined} />
            </Bar>
        </BarChart>
    </ResponsiveContainer>
);

const MarketAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMarketAnalytics()
            .then(setData)
            .catch(() => toast.error('Could not load market analytics'))
            .finally(() => setLoading(false));
    }, []);

    const glassCard = 'rounded-2xl border border-white/15 bg-white/5 shadow-lg p-6 transition-all duration-300';
    const cardHeader = 'flex justify-between items-center mb-6 pb-4 border-b border-white/10';
    const cardTitle = 'flex items-center gap-2 text-xl font-semibold text-white';

    if (loading) {
        return (
            <div className="flex flex-col gap-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="rounded-2xl border border-white/10 bg-white/5 animate-pulse" style={{ height: 120 }} />
                    ))}
                </div>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    const avgPriceChartData = Object.entries(data.avg_price_by_class).map(([name, value]) => ({ name, price: value }));
    const popularChartData = data.popular_routes.map((r) => ({ route: routeLabel(r), users: r.interest_count }));
    const cheapestChartData = data.cheapest_routes.map((r) => ({ route: routeLabel(r), price: r.avg_price }));
    const expensiveChartData = data.most_expensive_routes.map((r) => ({ route: routeLabel(r), price: r.avg_price }));

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-start mb-2 flex-col lg:flex-row gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white mb-1">Market Analytics</h1>
                    <p className="text-base text-white/60">
                        Aggregated from {data.data_points.toLocaleString()} real price_history rows
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className={glassCard}>
                    <div className={cardHeader}>
                        <h3 className={cardTitle}><BarChart3 size={18} />Average Price by Class</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={avgPriceChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="name" stroke={axisColor} fontSize={12} />
                            <YAxis stroke={axisColor} fontSize={12} />
                            <Tooltip
                                contentStyle={tooltipStyle}
                                formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Avg price']}
                            />
                            <Bar dataKey="price" fill="#67e8f9" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className={glassCard}>
                    <div className={cardHeader}>
                        <h3 className={cardTitle}><MapPin size={18} />Most-Watched Routes</h3>
                    </div>
                    {popularChartData.length > 0 ? (
                        <RouteBarChart
                            data={popularChartData}
                            dataKey="users"
                            color="#67e8f9"
                            formatter={(value) => [`${value} user${value === 1 ? '' : 's'} tracking`, '']}
                        />
                    ) : (
                        <p className="text-base text-white/60">No watchlists or saved searches yet.</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className={glassCard}>
                    <div className={cardHeader}>
                        <h3 className={cardTitle}><TrendingDown size={18} />Cheapest Routes</h3>
                    </div>
                    <RouteBarChart
                        data={cheapestChartData}
                        dataKey="price"
                        color="#6ee7b7"
                        formatter={(value) => [`₹${value.toLocaleString('en-IN')} avg`, '']}
                    />
                </div>

                <div className={glassCard}>
                    <div className={cardHeader}>
                        <h3 className={cardTitle}><TrendingUp size={18} />Most Expensive Routes</h3>
                    </div>
                    <RouteBarChart
                        data={expensiveChartData}
                        dataKey="price"
                        color="#fb7185"
                        formatter={(value) => [`₹${value.toLocaleString('en-IN')} avg`, '']}
                    />
                </div>
            </div>
        </div>
    );
};

export default MarketAnalytics;
