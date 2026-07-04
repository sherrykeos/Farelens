import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot } from 'recharts';
import { AlertTriangle, Search, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAnomalies, getFareCalendar, FLIGHT_OPTIONS } from '../api/client';

const AnomalyDot = (props) => {
    const { cx, cy, payload } = props;
    if (!payload.is_anomaly) return null;
    return <Dot cx={cx} cy={cy} r={5} fill="#f87171" stroke="white" strokeWidth={1} />;
};

const AnomalyDetection = () => {
    const [route, setRoute] = useState({
        source_city: 'Delhi',
        destination_city: 'Mumbai',
        flight_class: 'Economy',
    });
    const [calendar, setCalendar] = useState([]);
    const [anomalies, setAnomalies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleChange = (e) => setRoute((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSearch = async (e) => {
        e.preventDefault();
        if (route.source_city === route.destination_city) {
            toast.error('Source and destination cities must be different');
            return;
        }
        setLoading(true);
        try {
            const [cal, anom] = await Promise.all([
                getFareCalendar(route.source_city, route.destination_city, route.flight_class),
                getAnomalies(route.source_city, route.destination_city, route.flight_class),
            ]);
            setCalendar(cal);
            setAnomalies(anom);
            setSearched(true);
            if (cal.length === 0) {
                toast('No price_history yet for this route — run the generate_price_history job.', { icon: 'ℹ️' });
            }
        } catch {
            toast.error('Could not load anomaly data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleSearch({ preventDefault: () => {} });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const glassCard = 'bg-surface border border-border rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] p-6';
    const cardHeader = 'flex justify-between items-center mb-6 pb-4 border-b border-border';
    const cardTitle = 'text-base font-semibold text-text-primary tracking-tight flex items-center gap-2';
    const glassLabel = 'flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5';
    const glassInput = 'w-full px-3 py-2.5 rounded-lg text-sm transition-all duration-200 bg-bg-secondary border border-border text-text-primary hover:border-text-tertiary focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10';
    const glassSelect = `${glassInput} cursor-pointer appearance-none`;
    const btnPrimary = 'inline-flex items-center justify-center gap-2 px-8 py-3.5 mt-2 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 border-none bg-primary text-bg-primary shadow-[0_2px_10px_rgba(34,211,238,0.2)] hover:shadow-[0_4px_15px_rgba(34,211,238,0.4)] hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none';

    const tooltipStyle = { backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' };
    const axisColor = '#94A3B8';
    const gridColor = 'rgba(255,255,255,0.05)';

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-start mb-2 flex-col lg:flex-row gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary mb-1 tracking-tight">Anomaly Detection</h1>
                    <p className="text-sm text-text-secondary">
                        Modified Z-score (median/MAD) over a rolling 7-day window of real price_history rows.
                    </p>
                </div>
            </div>

            <form className={glassCard} onSubmit={handleSearch}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" style={{ alignItems: 'end' }}>
                    <div className="form-group">
                        <label className={glassLabel}>Source City</label>
                        <select name="source_city" className={glassSelect} value={route.source_city} onChange={handleChange}>
                            {FLIGHT_OPTIONS.cities.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className={glassLabel}>Destination City</label>
                        <select name="destination_city" className={glassSelect} value={route.destination_city} onChange={handleChange}>
                            {FLIGHT_OPTIONS.cities.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className={glassLabel}>Class</label>
                        <select name="flight_class" className={glassSelect} value={route.flight_class} onChange={handleChange}>
                            {FLIGHT_OPTIONS.classes.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                    </div>
                </div>
                <button type="submit" className={btnPrimary} style={{ marginTop: 'var(--spacing-lg)' }} disabled={loading}>
                    <Search size={16} /> {loading ? 'Scanning...' : 'Scan for Anomalies'}
                </button>
            </form>

            {searched && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className={glassCard}>
                        <div className={cardHeader}>
                            <h3 className={cardTitle}>49-Day Price Trend</h3>
                        </div>
                        {calendar.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={calendar} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                                    <XAxis dataKey="travel_date" axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12 }} tickFormatter={(value) => `₹${value/1000}k`} />
                                    <Tooltip
                                        cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }}
                                        contentStyle={tooltipStyle}
                                        itemStyle={{ color: '#F8FAFC', fontSize: '13px', fontWeight: 600 }}
                                        labelStyle={{ color: '#94A3B8', fontSize: '12px', marginBottom: '4px' }}
                                        formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Price']}
                                    />
                                    <Line type="monotone" dataKey="price" stroke="#22D3EE" strokeWidth={2.5} dot={<AnomalyDot />} activeDot={{ r: 6, fill: '#22D3EE', stroke: '#0F172A', strokeWidth: 2 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] border border-dashed border-border rounded-xl bg-bg-secondary/30">
                                <p className="text-sm text-text-secondary">No data for this route yet.</p>
                            </div>
                        )}
                    </div>

                    <div className={glassCard}>
                        <div className={cardHeader}>
                            <h3 className={cardTitle}>
                                <AlertTriangle size={18} />
                                Detected Anomalies ({anomalies.length})
                            </h3>
                        </div>
                        <div className="flex flex-col gap-3 py-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {anomalies.length > 0 ? (
                                anomalies.map((a, i) => (
                                    <div key={i} className="flex gap-4 p-4 bg-bg-secondary rounded-xl border border-border transition-all duration-300 hover:border-text-tertiary hover:-translate-y-0.5">
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${a.severity === 'high' ? 'bg-error/10 text-error border border-error/20' : 'bg-warning/10 text-warning border border-warning/20'}`}>
                                            <AlertTriangle size={18} />
                                        </div>
                                        <div className="flex-1 flex flex-col gap-1">
                                            <div className="flex justify-between items-center">
                                                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-text-primary">
                                                    <MapPin size={14} className="text-text-tertiary" /> {a.travel_date}
                                                </span>
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${a.severity === 'high' ? 'bg-error/10 text-error border-error/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
                                                    {a.severity}
                                                </span>
                                            </div>
                                            <p className="text-xs font-medium text-text-secondary mt-1">₹{a.price.toLocaleString('en-IN')} vs expected <span className="text-text-primary">₹{a.expected_price.toLocaleString('en-IN')}</span></p>
                                            <div className="flex justify-between items-center mt-1.5">
                                                <span className="text-[10px] font-bold text-text-tertiary bg-surface px-1.5 py-0.5 rounded border border-border">z = {a.deviation_score}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-xl bg-bg-secondary/30 h-[200px]">
                                    <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center mb-3 text-text-tertiary shadow-sm">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <p className="text-sm text-text-secondary">No anomalies found on this route.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnomalyDetection;
