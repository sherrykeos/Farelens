import React, { useEffect, useState } from 'react';
import { Bookmark, Plus, Trash2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { listWatchlists, createWatchlist, deleteWatchlist, FLIGHT_OPTIONS } from '../api/client';

const Watchlists = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({
        source_city: 'Delhi',
        destination_city: 'Mumbai',
        flight_class: 'Economy',
        target_price: 5000,
    });

    const load = () => {
        setLoading(true);
        listWatchlists()
            .then(setItems)
            .catch(() => toast.error('Could not load watchlists'))
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: name === 'target_price' ? Number(value) : value }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (form.source_city === form.destination_city) {
            toast.error('Source and destination cities must be different');
            return;
        }
        setCreating(true);
        try {
            const created = await createWatchlist(form);
            setItems((prev) => [...prev, created]);
            toast.success('Watchlist created');
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Could not create watchlist');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteWatchlist(id);
            setItems((prev) => prev.filter((w) => w.id !== id));
            toast.success('Watchlist removed');
        } catch {
            toast.error('Could not remove watchlist');
        }
    };

    const glassCard = 'bg-surface border border-border rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] p-6';
    const cardHeader = 'flex justify-between items-center mb-6 pb-4 border-b border-border';
    const cardTitle = 'text-base font-semibold text-text-primary tracking-tight flex items-center gap-2';
    const glassLabel = 'flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5';
    const glassInput = 'w-full px-3 py-2.5 rounded-lg text-sm transition-all duration-200 bg-bg-secondary border border-border text-text-primary hover:border-text-tertiary focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10';
    const glassSelect = `${glassInput} cursor-pointer appearance-none`;
    const btnPrimary = 'inline-flex items-center justify-center gap-2 px-8 py-3.5 mt-2 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 border-none bg-primary text-bg-primary shadow-[0_2px_10px_rgba(34,211,238,0.2)] hover:shadow-[0_4px_15px_rgba(34,211,238,0.4)] hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none';
    const btnIcon = 'flex items-center justify-center w-8 h-8 bg-surface border border-border rounded-md cursor-pointer transition-all duration-200 text-text-tertiary hover:bg-error/10 hover:text-error hover:border-error/30';

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-start mb-2 flex-col lg:flex-row gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary mb-1 tracking-tight">Watchlists</h1>
                    <p className="text-sm text-text-secondary">Get notified when a route drops below your target price</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <form className={glassCard} onSubmit={handleCreate}>
                    <div className={cardHeader}>
                        <h3 className={cardTitle}>New Watchlist</h3>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className={glassLabel}>Source City</label>
                            <select name="source_city" className={glassSelect} value={form.source_city} onChange={handleChange}>
                                {FLIGHT_OPTIONS.cities.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className={glassLabel}>Destination City</label>
                            <select name="destination_city" className={glassSelect} value={form.destination_city} onChange={handleChange}>
                                {FLIGHT_OPTIONS.cities.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className={glassLabel}>Class</label>
                            <select name="flight_class" className={glassSelect} value={form.flight_class} onChange={handleChange}>
                                {FLIGHT_OPTIONS.classes.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className={glassLabel}>Target Price (₹)</label>
                            <input
                                type="number"
                                name="target_price"
                                className={glassInput}
                                min="1"
                                max="200000"
                                value={form.target_price}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className={btnPrimary} disabled={creating}>
                        <Plus size={18} /> {creating ? 'Adding...' : 'Add Watchlist'}
                    </button>
                </form>

                <div className={glassCard}>
                    <div className={cardHeader}>
                        <h3 className={cardTitle}>
                            <Bookmark size={18} />
                            Your Watchlists ({items.length}/20)
                        </h3>
                    </div>
                    {loading ? (
                        <div className="rounded-md bg-white/5 animate-pulse" style={{ height: 200 }} />
                    ) : items.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {items.map((w) => (
                                <div key={w.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white/5 rounded-md transition-all duration-300 hover:bg-white/10">
                                    <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto">
                                        <div className="flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary mt-1 sm:mt-0">
                                            <MapPin size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-text-primary mb-1 break-words">{w.source_city} → {w.destination_city} <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 sm:mt-0 sm:ml-2 rounded-md text-[10px] font-bold uppercase tracking-wider bg-info/10 text-info border border-info/20 whitespace-nowrap">{w.flight_class}</span></p>
                                            <p className="text-xs text-text-secondary">Alert below <span className="font-bold text-success">₹{w.target_price.toLocaleString('en-IN')}</span></p>
                                        </div>
                                    </div>
                                    <button className={`${btnIcon} self-end sm:self-auto`} onClick={() => handleDelete(w.id)} aria-label="Delete watchlist">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border rounded-xl bg-bg-secondary/30 h-[300px]">
                            <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mb-4 text-text-tertiary shadow-sm">
                                <Bookmark size={24} />
                            </div>
                            <h3 className="text-lg font-semibold text-text-primary mb-2">No watchlists yet</h3>
                            <p className="text-sm text-text-secondary max-w-sm">
                                Add a route to track its price.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Watchlists;
