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

    const glassCard = 'rounded-2xl border border-white/15 bg-white/5 shadow-lg p-6 transition-all duration-300';
    const cardHeader = 'flex justify-between items-center mb-6 pb-4 border-b border-white/10';
    const cardTitle = 'flex items-center gap-2 text-xl font-semibold text-white';
    const glassLabel = 'flex items-center gap-1 text-sm font-semibold text-white/70';
    const glassSelect = 'w-full px-4 py-2 rounded-md text-sm transition-all duration-300 bg-white/5 border border-white/15 text-white cursor-pointer focus:outline-none focus:border-cyan-300/60 focus:ring-3 focus:ring-cyan-300/15';
    const btnPrimary = 'inline-flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm font-semibold cursor-pointer transition-all duration-300 border-none bg-linear-to-br from-cyan-400 to-blue-600 text-white shadow-md hover:shadow-[0_0_16px_rgba(103,232,249,0.4)] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0';

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-start mb-2 flex-col lg:flex-row gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white mb-1">Anomaly Detection</h1>
                    <p className="text-base text-white/60">
                        Modified Z-score (median/MAD) over a rolling 7-day window of real price_history rows
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
                                <LineChart data={calendar}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="travel_date" stroke="rgba(255,255,255,0.5)" fontSize={11} tick={{ fontSize: 10 }} />
                                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{ background: 'rgba(20,28,40,0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff' }}
                                        formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Price']}
                                    />
                                    <Line type="monotone" dataKey="price" stroke="#67e8f9" strokeWidth={2} dot={<AnomalyDot />} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-base text-white/60">No data for this route yet.</p>
                        )}
                    </div>

                    <div className={glassCard}>
                        <div className={cardHeader}>
                            <h3 className={cardTitle}>
                                <AlertTriangle size={18} />
                                Detected Anomalies ({anomalies.length})
                            </h3>
                        </div>
                        <div className="flex flex-col gap-4 py-4 max-h-150 overflow-y-auto">
                            {anomalies.length > 0 ? (
                                anomalies.map((a, i) => (
                                    <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-md border-l-[3px] border-l-red-400 transition-all duration-300 hover:bg-white/10 hover:translate-x-1">
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-md shrink-0 ${a.severity === 'high' ? 'bg-red-400/15 text-red-300' : 'bg-amber-400/15 text-amber-300'}`}>
                                            <AlertTriangle size={20} />
                                        </div>
                                        <div className="flex-1 flex flex-col gap-1">
                                            <div className="flex justify-between items-center">
                                                <span className="inline-flex items-center gap-1 text-base font-bold text-white">
                                                    <MapPin size={14} /> {a.travel_date}
                                                </span>
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold capitalize tracking-wider border ${a.severity === 'high' ? 'bg-red-400/15 text-red-300 border-red-300/40' : 'bg-amber-400/15 text-amber-300 border-amber-300/40'}`}>
                                                    {a.severity}
                                                </span>
                                            </div>
                                            <p className="text-sm font-semibold text-white/70">₹{a.price.toLocaleString('en-IN')} vs expected ₹{a.expected_price.toLocaleString('en-IN')}</p>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="font-bold text-white">z = {a.deviation_score}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-base text-white/60">No anomalies found on this route.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnomalyDetection;
