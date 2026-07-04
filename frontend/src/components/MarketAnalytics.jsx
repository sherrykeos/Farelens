import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { BarChart3, MapPin, TrendingDown, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMarketAnalytics } from '../api/client';

const routeLabel = (r) => `${r.source_city} → ${r.destination_city}`;

const tooltipStyle = { backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' };
const axisColor = '#94A3B8';
const gridColor = 'rgba(255,255,255,0.05)';

const RouteBarChart = ({ data, dataKey, gradientId, color1, color2, activeColor, formatter, height }) => (
    <ResponsiveContainer width="100%" height={height || Math.max(160, data.length * 56)}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 10, bottom: 10 }}>
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor={color1} stopOpacity={1}/>
                    <stop offset="95%" stopColor={color2} stopOpacity={1}/>
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
            <XAxis type="number" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
                dataKey="route"
                type="category"
                stroke={axisColor}
                fontSize={12}
                width={150}
                tickLine={false}
                axisLine={false}
            />
            <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.03)' }} 
                contentStyle={tooltipStyle} 
                formatter={formatter} 
                itemStyle={{ color: '#F8FAFC', fontSize: '13px', fontWeight: 600 }}
                labelStyle={{ color: '#94A3B8', fontSize: '12px', marginBottom: '4px' }}
            />
            <Bar dataKey={dataKey} radius={[0, 6, 6, 0]} barSize={24} activeBar={{ fill: activeColor }}>
                {data.map((_, i) => <Cell key={i} fill={`url(#${gradientId})`} />)}
                <LabelList dataKey={dataKey} position="right" fill="#F8FAFC" fontSize={12} fontWeight={600} formatter={formatter ? (v) => formatter(v)[0] : undefined} />
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

    const glassCard = 'bg-surface border border-border rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] p-6 flex flex-col hover:border-text-tertiary transition-colors duration-300';
    const cardHeader = 'flex justify-between items-center mb-6';
    const cardTitle = 'text-base font-semibold text-text-primary tracking-tight flex items-center gap-2';

    if (loading) {
        return (
            <div className="flex flex-col gap-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="rounded-xl border border-border bg-surface animate-pulse" style={{ height: 350 }} />
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
                    <h1 className="text-2xl font-bold text-text-primary mb-1 tracking-tight">Market Analytics</h1>
                    <p className="text-sm text-text-secondary">
                        Aggregated from {data.data_points.toLocaleString()} real price history records.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className={glassCard}>
                    <div className={cardHeader}>
                        <h3 className={cardTitle}>
                            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"><BarChart3 size={16} /></div>
                            Average Price by Class
                        </h3>
                    </div>
                    <div className="w-full overflow-x-auto custom-scrollbar pb-2">
                        <div className="min-w-[500px] h-[260px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={avgPriceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorAvgPrice" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22D3EE" stopOpacity={1}/>
                                            <stop offset="95%" stopColor="#0284C7" stopOpacity={1}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12 }} tickFormatter={(value) => `₹${value/1000}k`} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                        contentStyle={tooltipStyle}
                                        itemStyle={{ color: '#F8FAFC', fontSize: '13px', fontWeight: 600 }}
                                        labelStyle={{ color: '#94A3B8', fontSize: '12px', marginBottom: '4px' }}
                                        formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Average Price']}
                                    />
                                    <Bar dataKey="price" radius={[6, 6, 0, 0]} maxBarSize={48} activeBar={{ fill: '#38BDF8' }}>
                                        {avgPriceChartData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill="url(#colorAvgPrice)" />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className={glassCard}>
                    <div className={cardHeader}>
                        <h3 className={cardTitle}>
                            <div className="w-8 h-8 rounded-lg bg-info/10 border border-info/20 flex items-center justify-center text-info"><MapPin size={16} /></div>
                            Most-Watched Routes
                        </h3>
                    </div>
                    {popularChartData.length > 0 ? (
                        <RouteBarChart
                            data={popularChartData}
                            dataKey="users"
                            gradientId="colorPopular"
                            color1="#38BDF8"
                            color2="#0284C7"
                            activeColor="#7DD3FC"
                            formatter={(value) => [`${value} user${value === 1 ? '' : 's'} tracking`, '']}
                        />
                    ) : (
                        <p className="text-sm text-text-secondary">No watchlists or saved searches yet.</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className={glassCard}>
                    <div className={cardHeader}>
                        <h3 className={cardTitle}>
                            <div className="w-8 h-8 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center text-success"><TrendingDown size={16} /></div>
                            Cheapest Routes
                        </h3>
                    </div>
                    <RouteBarChart
                        data={cheapestChartData}
                        dataKey="price"
                        gradientId="colorCheapest"
                        color1="#34D399"
                        color2="#059669"
                        activeColor="#6EE7B7"
                        formatter={(value) => [`₹${value.toLocaleString('en-IN')} avg`, '']}
                    />
                </div>

                <div className={glassCard}>
                    <div className={cardHeader}>
                        <h3 className={cardTitle}>
                            <div className="w-8 h-8 rounded-lg bg-error/10 border border-error/20 flex items-center justify-center text-error"><TrendingUp size={16} /></div>
                            Most Expensive Routes
                        </h3>
                    </div>
                    <RouteBarChart
                        data={expensiveChartData}
                        dataKey="price"
                        gradientId="colorExpensive"
                        color1="#F87171"
                        color2="#DC2626"
                        activeColor="#FCA5A5"
                        formatter={(value) => [`₹${value.toLocaleString('en-IN')} avg`, '']}
                    />
                </div>
            </div>
        </div>
    );
};

export default MarketAnalytics;
