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

    const glassCard = 'bg-surface border border-border rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] p-6';
    const cardHeader = 'flex justify-between items-center mb-6 pb-4 border-b border-border';
    const cardTitle = 'text-base font-semibold text-text-primary tracking-tight flex items-center gap-2';

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-start mb-2 flex-col lg:flex-row gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary mb-1 tracking-tight">Price Alerts</h1>
                    <p className="text-sm text-text-secondary">
                        Triggered automatically when a watchlisted route drops to or below your target price.
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
                            <div key={a.id} className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white/5 rounded-md transition-all duration-300 hover:bg-white/10">
                                <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                                    <div className="flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary mt-1 sm:mt-0">
                                        <MapPin size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-text-primary mb-1 break-words">
                                            {a.source_city} → {a.destination_city}{' '}
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 sm:mt-0 sm:ml-2 rounded-md text-[10px] font-bold uppercase tracking-wider bg-info/10 text-info border border-info/20 whitespace-nowrap">{a.flight_class}</span>
                                        </p>
                                        <p className="text-xs text-text-secondary truncate">
                                            Travel date {a.travel_date} — triggered {new Date(a.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                                    <span className="font-bold text-success">
                                        ₹{a.price_at_trigger.toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-xs text-text-tertiary">
                                        target ₹{a.target_price.toLocaleString('en-IN')}
                                    </span>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 ml-auto md:ml-2 rounded-md text-[10px] font-bold uppercase tracking-wider border ${a.channel === 'email' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
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
                    <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border rounded-xl bg-bg-secondary/30 h-[300px]">
                        <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mb-4 text-text-tertiary shadow-sm">
                            <Bell size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">No alerts yet</h3>
                        <p className="text-sm text-text-secondary max-w-md">
                            Add a route to your Watchlist with a target price — alerts appear here once the price-checking job finds a match.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Alerts;
