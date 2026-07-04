import React, { useEffect, useState } from 'react';
import { Search, CalendarDays, Sparkles, HelpCircle, X, Plane } from 'lucide-react';
import toast from 'react-hot-toast';
import { getFareCalendar, getCheapestDate, getAirlineComparison, FLIGHT_OPTIONS } from '../api/client';

const toISODate = (date) => date.toISOString().slice(0, 10);
const today = new Date();

// price_history is generated 1-49 days out from today (see
// backend/app/jobs/generate_price_history.py, DAYS_AHEAD=49) — capped at
// 49, not a round number like 60, because the XGBoost model was only
// ever trained on days_left 1-49 and can't extrapolate past it. Constrain
// the pickers to that real, fully-reliable range instead of letting users
// pick any year — or a date the model can't honestly predict.
const MIN_DATE = toISODate(new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000));
const MAX_DATE = toISODate(new Date(today.getTime() + 49 * 24 * 60 * 60 * 1000));

const dateRangeOf = (days) => {
    const to = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    return { date_from: MIN_DATE, date_to: toISODate(to) > MAX_DATE ? MAX_DATE : toISODate(to) };
};

const daysLeftFor = (travelDateISO) => {
    const diff = new Date(travelDateISO) - new Date(toISODate(today));
    return Math.max(1, Math.round(diff / (24 * 60 * 60 * 1000)));
};

/** Green = cheapest third of what's currently displayed, red = priciest
 * third, yellow = the middle — relative to THIS search, not a fixed
 * rupee threshold (a "cheap" day on an expensive route is still pricier
 * than an "expensive" day on a cheap one). */
const priceTier = (price, sortedPrices) => {
    if (sortedPrices.length < 3) return 'tier-mid';
    const idx = sortedPrices.indexOf(price);
    const third = Math.ceil(sortedPrices.length / 3);
    if (idx < third) return 'tier-cheap';
    if (idx >= sortedPrices.length - third) return 'tier-expensive';
    return 'tier-mid';
};

const TIER_BG = { 'tier-cheap': 'bg-emerald-400/10', 'tier-mid': 'bg-white/5', 'tier-expensive': 'bg-red-400/10' };
const TIER_TEXT = { 'tier-cheap': 'text-emerald-300', 'tier-mid': 'text-amber-300', 'tier-expensive': 'text-red-300' };
const TIER_DOT = { 'tier-cheap': 'bg-emerald-400', 'tier-mid': 'bg-amber-400', 'tier-expensive': 'bg-red-400' };

const FareCalendar = ({ onPredictRoute }) => {
    const [route, setRoute] = useState({
        source_city: 'Delhi',
        destination_city: 'Mumbai',
        flight_class: 'Economy',
        airline: '',
        stops: '',
        ...dateRangeOf(49),
    });
    const [days, setDays] = useState([]);
    const [cheapest, setCheapest] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [compareDay, setCompareDay] = useState(null);
    const [compareRows, setCompareRows] = useState([]);
    const [compareLoading, setCompareLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if ((name === 'date_from' || name === 'date_to') && value) {
            // Native <input type="date"> only marks out-of-range years as
            // invalid — it doesn't stop you typing 1700 or 2200. Clamp it
            // back into the real data range immediately.
            if (value < MIN_DATE || value > MAX_DATE) {
                const clamped = value < MIN_DATE ? MIN_DATE : MAX_DATE;
                toast.error(`Data is only available ${MIN_DATE} to ${MAX_DATE}`);
                setRoute((prev) => ({ ...prev, [name]: clamped }));
                return;
            }
        }
        setRoute((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (route.source_city === route.destination_city) {
            toast.error('Source and destination cities must be different');
            return;
        }
        if (route.date_from > route.date_to) {
            toast.error('"From" date must be before "To" date');
            return;
        }
        setLoading(true);
        try {
            const filterOptions = { airline: route.airline || undefined, stops: route.stops || undefined };
            const fullCalendar = await getFareCalendar(route.source_city, route.destination_city, route.flight_class, filterOptions);
            const inRange = fullCalendar.filter(
                (d) => d.travel_date >= route.date_from && d.travel_date <= route.date_to
            );
            setDays(inRange);
            setSearched(true);

            if (inRange.length > 0) {
                try {
                    setCheapest(
                        await getCheapestDate(route.source_city, route.destination_city, route.flight_class, {
                            dateFrom: route.date_from, dateTo: route.date_to, ...filterOptions,
                        })
                    );
                } catch {
                    setCheapest(null);
                }
            } else {
                setCheapest(null);
                toast('No price data for this route/date range yet — run the generate_price_history job.', { icon: 'ℹ️' });
            }
        } catch {
            toast.error('Could not load fare calendar');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleSearch({ preventDefault: () => {} });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const sortedPrices = [...days.map((d) => d.price)].sort((a, b) => a - b);

    const handleDayClick = async (day) => {
        setCompareDay(day);
        setCompareRows([]);
        setCompareLoading(true);
        try {
            const rows = await getAirlineComparison(
                route.source_city, route.destination_city, day.travel_date, route.flight_class,
                { stops: route.stops || undefined }
            );
            setCompareRows(rows);
        } catch {
            toast.error('Could not load airline comparison');
        } finally {
            setCompareLoading(false);
        }
    };

    const handlePredictAirline = (day, row) => {
        if (!onPredictRoute) return;
        onPredictRoute({
            source_city: route.source_city,
            destination_city: route.destination_city,
            class: route.flight_class,
            airline: row.airline,
            stops: row.stops,
            duration: row.duration,
            departure_time: 'Morning',
            arrival_time: 'Afternoon',
            days_left: daysLeftFor(day.travel_date),
        });
        setCompareDay(null);
    };

    const glassCard = 'bg-surface border border-border rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] p-6';
    const cardHeader = 'flex justify-between items-center mb-6 pb-4 border-b border-border';
    const cardTitle = 'text-base font-semibold text-text-primary tracking-tight flex items-center gap-2';
    const glassLabel = 'flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5';
    const glassInput = 'w-full px-3 py-2.5 rounded-lg text-sm transition-all duration-200 bg-bg-secondary border border-border text-text-primary hover:border-text-tertiary focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10';
    const glassSelect = `${glassInput} cursor-pointer appearance-none`;
    const btnPrimary = 'inline-flex items-center justify-center gap-2 px-8 py-3.5 mt-2 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 border-none bg-primary text-bg-primary shadow-[0_2px_10px_rgba(34,211,238,0.2)] hover:shadow-[0_4px_15px_rgba(34,211,238,0.4)] hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none';
    const btnSecondary = 'inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 bg-surface border border-border text-text-primary hover:bg-surface-hover hover:border-text-tertiary shadow-sm';

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-start mb-2 flex-col lg:flex-row gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary mb-1 tracking-tight">Fare Calendar</h1>
                    <p className="text-sm text-text-secondary">Find the cheapest day to fly, from real collected fares.</p>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" style={{ alignItems: 'end', marginTop: 'var(--spacing-lg)' }}>
                    <div className="form-group">
                        <label className={glassLabel}>Airline (optional)</label>
                        <select name="airline" className={glassSelect} value={route.airline} onChange={handleChange}>
                            <option value="">Any airline (cheapest)</option>
                            {FLIGHT_OPTIONS.airlines.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className={glassLabel}>Stops (optional)</label>
                        <select name="stops" className={glassSelect} value={route.stops} onChange={handleChange}>
                            <option value="">Any stops (cheapest)</option>
                            {FLIGHT_OPTIONS.stops.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" style={{ alignItems: 'end', marginTop: 'var(--spacing-lg)' }}>
                    <div className="form-group">
                        <label className={glassLabel}>From Date</label>
                        <input
                            type="date" name="date_from" className={glassInput}
                            value={route.date_from} onChange={handleChange}
                            min={MIN_DATE} max={MAX_DATE} required
                        />
                    </div>
                    <div className="form-group">
                        <label className={glassLabel}>To Date</label>
                        <input
                            type="date" name="date_to" className={glassInput}
                            value={route.date_to} onChange={handleChange}
                            min={MIN_DATE} max={MAX_DATE} required
                        />
                    </div>
                </div>
                <p className="text-sm text-text-secondary" style={{ marginTop: 'var(--spacing-sm)' }}>
                    Data is collected {MIN_DATE} to {MAX_DATE} (next 49 days) — dates outside this range aren't available yet.
                </p>
                <button type="submit" className={btnPrimary} style={{ marginTop: 'var(--spacing-lg)' }} disabled={loading}>
                    <Search size={16} /> {loading ? 'Searching...' : 'Search Calendar'}
                </button>
            </form>

            {searched && cheapest && (
                <div className="flex items-center gap-4 bg-success/10 border border-success/30 rounded-xl p-6 shadow-sm">
                    <Sparkles size={28} className="text-success" />
                    <div>
                        <p className="font-bold text-text-primary">
                            Cheapest day: {cheapest.travel_date} — ₹{cheapest.price.toLocaleString('en-IN')}
                            <span className="text-sm text-text-secondary font-normal"> (±₹{Math.round(cheapest.price - cheapest.confidence_low).toLocaleString('en-IN')})</span>
                        </p>
                        <p className="text-sm text-text-secondary mt-1">
                            {cheapest.airline} · {FLIGHT_OPTIONS.stops.find((s) => s.value === cheapest.stops)?.label} ·
                            {' '}Out of {days.length} days between {route.date_from} and {route.date_to}
                        </p>
                    </div>
                </div>
            )}

            {searched && (
                <div className={glassCard}>
                    <div className={cardHeader}>
                        <h3 className={cardTitle}>
                            <CalendarDays size={18} />
                            {route.date_from} → {route.date_to} ({days.length} days)
                        </h3>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-info/10 text-info border border-info/20">
                            <HelpCircle size={12} /> Click a day to compare airlines
                        </span>
                    </div>
                    {days.length > 0 ? (
                        <div className="grid grid-cols-3 min-[480px]:grid-cols-4 md:grid-cols-7 gap-2">
                            {days.map((d) => {
                                const tier = priceTier(d.price, sortedPrices);
                                const isCheapestDay = cheapest && d.travel_date === cheapest.travel_date;
                                return (
                                    <button
                                        type="button"
                                        key={d.travel_date}
                                        onClick={() => handleDayClick(d)}
                                        className={`flex flex-col items-center justify-center gap-0.5 p-2 border rounded-lg transition-all duration-150 font-[inherit] cursor-pointer hover:border-primary hover:-translate-y-0.5 ${TIER_BG[tier] || 'bg-bg-secondary/50'} ${d.is_anomaly ? 'border-error shadow-[0_0_0_1px_#F87171]' : isCheapestDay ? 'border-success shadow-[0_0_0_2px_#34D399]' : 'border-border'}`}
                                        title={`${d.airline} · ${d.stops.replace('_', ' ')}`}
                                    >
                                        <span className="text-xs text-text-secondary">{d.travel_date.slice(5)}</span>
                                        <span className={`text-sm font-bold ${TIER_TEXT[tier]}`}>
                                            ₹{Math.round(d.price).toLocaleString('en-IN')}
                                        </span>
                                        <span className="text-[10px] text-text-tertiary">
                                            ±₹{Math.round(d.price - d.confidence_low).toLocaleString('en-IN')}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-text-secondary">
                            No data for this range — run <code className="bg-bg-secondary px-1.5 py-0.5 rounded text-xs border border-border">python -m app.jobs.generate_price_history</code> on the backend,
                            or widen your date range (only the next 49 days are collected).
                        </p>
                    )}
                    <div className="flex gap-6 mt-6 pt-4 border-t border-white/10 text-xs text-white/55 flex-wrap">
                        <span className="inline-flex items-center gap-1.5"><span className={`w-2.5 h-2.5 rounded-full inline-block ${TIER_DOT['tier-cheap']}`} /> Cheap</span>
                        <span className="inline-flex items-center gap-1.5"><span className={`w-2.5 h-2.5 rounded-full inline-block ${TIER_DOT['tier-mid']}`} /> Average</span>
                        <span className="inline-flex items-center gap-1.5"><span className={`w-2.5 h-2.5 rounded-full inline-block ${TIER_DOT['tier-expensive']}`} /> Expensive</span>
                        <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block bg-transparent border-2 border-red-400" /> Anomaly</span>
                    </div>
                </div>
            )}

            {compareDay && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-[1000] backdrop-blur-[4px] animate-fadeIn" onClick={() => setCompareDay(null)}>
                    <div className="bg-[rgba(20,28,40,0.95)] backdrop-blur-xl border border-white/15 rounded-2xl w-[90%] max-w-[800px] shadow-2xl flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-white m-0">
                                {route.source_city} → {route.destination_city} on {compareDay.travel_date}
                            </h3>
                            <button type="button" className="bg-transparent border-none text-white/55 cursor-pointer p-2 rounded-lg transition-all duration-200 hover:bg-white/10 hover:text-white" onClick={() => setCompareDay(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            {compareLoading ? (
                                <div className="rounded-md bg-white/5 animate-pulse" style={{ height: 160 }} />
                            ) : compareRows.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                    {compareRows.map((row, i) => (
                                        <div key={row.airline} className={`flex items-center justify-between gap-4 p-4 bg-white/5 rounded-md border ${i === 0 ? 'border-emerald-400' : 'border-transparent'}`}>
                                            <div className="flex items-center gap-2 font-semibold text-white">
                                                <Plane size={16} />
                                                {row.airline}
                                                {i === 0 && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-400/15 text-emerald-300 border border-emerald-300/40">Cheapest</span>}
                                                <span className="text-base text-white/60">
                                                    {FLIGHT_OPTIONS.stops.find((s) => s.value === row.stops)?.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-bold text-lg text-white">
                                                    ₹{Math.round(row.price).toLocaleString('en-IN')}
                                                </span>
                                                {onPredictRoute && (
                                                    <button
                                                        type="button"
                                                        className={`${btnSecondary} px-3.5 py-1.5 text-xs`}
                                                        onClick={() => handlePredictAirline(compareDay, row)}
                                                    >
                                                        See why
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-base text-white/60">No airline data for this date.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FareCalendar;
