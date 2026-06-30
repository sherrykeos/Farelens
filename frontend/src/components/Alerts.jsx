import React, { useEffect, useState } from 'react';
import { Bell, Mail, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { listAlerts } from '../api/client';

const Alerts = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        listAlerts()
            .then(setItems)
            .catch(() => toast.error('Could not load alerts'))
            .finally(() => setLoading(false));
    }, []);

    const glassCard = 'rounded-2xl border border-white/15 bg-white/5 shadow-lg p-6 transition-all duration-300';
    const cardHeader = 'flex justify-between items-center mb-6 pb-4 border-b border-white/10';
    const cardTitle = 'flex items-center gap-2 text-xl font-semibold text-white';

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-start mb-2 flex-col lg:flex-row gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white mb-1">Price Alerts</h1>
                    <p className="text-base text-white/60">
                        Triggered automatically when a watchlisted route drops to or below your target price
                    </p>
                </div>
            </div>

            <div className={glassCard}>
                <div className={cardHeader}>
                    <h3 className={cardTitle}>
                        <Bell size={18} />
                        Your Alerts ({items.length})
                    </h3>
                </div>

                {loading ? (
                    <div className="rounded-md bg-white/5 animate-pulse" style={{ height: 200 }} />
                ) : items.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        {items.map((a) => (
                            <div key={a.id} className="flex items-center justify-between gap-4 p-4 bg-white/5 rounded-md transition-all duration-300 hover:bg-white/10 flex-wrap">
                                <div className="flex items-center gap-4">
                                    <MapPin size={18} className="text-cyan-300" />
                                    <div>
                                        <p className="text-white">
                                            {a.source_city} → {a.destination_city}{' '}
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-sky-400/15 text-sky-300 border border-sky-300/40">{a.flight_class}</span>
                                        </p>
                                        <p className="text-xs text-white/55">
                                            Travel date {a.travel_date} — triggered {new Date(a.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-emerald-400">
                                        ₹{a.price_at_trigger.toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-xs text-white/55">
                                        target ₹{a.target_price.toLocaleString('en-IN')}
                                    </span>
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${a.channel === 'email' ? 'bg-emerald-400/15 text-emerald-300 border-emerald-300/40' : 'bg-amber-400/15 text-amber-300 border-amber-300/40'}`}>
                                        {a.channel === 'email' ? (
                                            <><Mail size={12} /> Emailed</>
                                        ) : (
                                            'In-app only'
                                        )}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="min-h-100 flex items-center justify-center">
                        <div className="text-center max-w-100">
                            <Bell size={48} className="text-white/25 mb-6 mx-auto" />
                            <h3 className="text-xl font-bold text-white mb-2">No alerts yet</h3>
                            <p className="text-sm text-white/55 leading-relaxed">
                                Add a route to your Watchlist with a target price — alerts appear here once the
                                price-checking job finds a match.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Alerts;
