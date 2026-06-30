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

    const glassCard = 'rounded-2xl border border-white/15 bg-white/5 shadow-lg p-6 transition-all duration-300';
    const cardHeader = 'flex justify-between items-center mb-6 pb-4 border-b border-white/10';
    const cardTitle = 'flex items-center gap-2 text-xl font-semibold text-white';
    const glassLabel = 'flex items-center gap-1 text-sm font-semibold text-white/70';
    const glassInput = 'w-full px-4 py-2 rounded-md text-sm transition-all duration-300 bg-white/5 border border-white/15 text-white focus:outline-none focus:border-cyan-300/60 focus:ring-3 focus:ring-cyan-300/15';
    const glassSelect = `${glassInput} cursor-pointer`;
    const btnPrimary = 'inline-flex items-center justify-center gap-2 px-8 py-4 rounded-md text-base font-semibold cursor-pointer transition-all duration-300 border-none bg-linear-to-br from-cyan-400 to-blue-600 text-white shadow-md hover:shadow-[0_0_16px_rgba(103,232,249,0.4)] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0';
    const btnIcon = 'flex items-center justify-center w-10 h-10 bg-white/5 border border-white/15 rounded-md cursor-pointer transition-all duration-300 text-white/55 hover:bg-white/10 hover:text-white hover:border-cyan-300/40';

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-start mb-2 flex-col lg:flex-row gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white mb-1">Watchlists</h1>
                    <p className="text-base text-white/60">Get notified when a route drops below your target price</p>
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
                                <div key={w.id} className="flex items-center justify-between gap-4 p-4 bg-white/5 rounded-md transition-all duration-300 hover:bg-white/10">
                                    <div className="flex items-center gap-4">
                                        <MapPin size={18} className="text-cyan-300" />
                                        <div>
                                            <p className="text-white">{w.source_city} → {w.destination_city} <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-sky-400/15 text-sky-300 border border-sky-300/40">{w.flight_class}</span></p>
                                            <p className="text-xs text-white/55">Alert below <span className="font-bold text-emerald-400">₹{w.target_price.toLocaleString('en-IN')}</span></p>
                                        </div>
                                    </div>
                                    <button className={btnIcon} onClick={() => handleDelete(w.id)} aria-label="Delete watchlist">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="min-h-[400px] flex items-center justify-center">
                            <div className="text-center max-w-[400px]">
                                <Bookmark size={48} className="text-white/25 mb-6 mx-auto" />
                                <h3 className="text-xl font-bold text-white mb-2">No watchlists yet</h3>
                                <p className="text-sm text-white/55 leading-relaxed">Add a route to track its price</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Watchlists;
