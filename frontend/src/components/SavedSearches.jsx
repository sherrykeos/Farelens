import React, { useEffect, useState } from 'react';
import { Search, Plus, Trash2, MapPin, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { listSavedSearches, createSavedSearch, deleteSavedSearch, FLIGHT_OPTIONS } from '../api/client';

const SavedSearches = ({ onPredictRoute }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({
        source_city: 'Delhi',
        destination_city: 'Mumbai',
        flight_class: 'Economy',
    });

    const load = () => {
        setLoading(true);
        listSavedSearches()
            .then(setItems)
            .catch(() => toast.error('Could not load saved searches'))
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleCreate = async (e) => {
        e.preventDefault();
        if (form.source_city === form.destination_city) {
            toast.error('Source and destination cities must be different');
            return;
        }
        setCreating(true);
        try {
            const created = await createSavedSearch(form);
            setItems((prev) => [...prev, created]);
            toast.success('Search saved');
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Could not save search');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteSavedSearch(id);
            setItems((prev) => prev.filter((s) => s.id !== id));
            toast.success('Saved search removed');
        } catch {
            toast.error('Could not remove saved search');
        }
    };

    const handlePredict = (search) => {
        onPredictRoute?.({
            source_city: search.source_city,
            destination_city: search.destination_city,
            class: search.flight_class,
        });
    };

    const glassCard = 'rounded-2xl border border-white/15 bg-white/5 shadow-lg p-6 transition-all duration-300';
    const cardHeader = 'flex justify-between items-center mb-6 pb-4 border-b border-white/10';
    const cardTitle = 'flex items-center gap-2 text-xl font-semibold text-white';
    const glassLabel = 'flex items-center gap-1 text-sm font-semibold text-white/70';
    const glassSelect = 'w-full px-4 py-2 rounded-md text-sm transition-all duration-300 bg-white/5 border border-white/15 text-white cursor-pointer focus:outline-none focus:border-cyan-300/60 focus:ring-3 focus:ring-cyan-300/15';
    const btnPrimary = 'inline-flex items-center justify-center gap-2 px-8 py-4 rounded-md text-base font-semibold cursor-pointer transition-all duration-300 border-none bg-linear-to-br from-cyan-400 to-blue-600 text-white shadow-md hover:shadow-[0_0_16px_rgba(103,232,249,0.4)] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0';
    const btnSecondary = 'inline-flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm font-semibold cursor-pointer transition-all duration-300 bg-white/10 text-white border border-white/15 hover:bg-white/20';
    const btnIcon = 'flex items-center justify-center w-10 h-10 bg-white/5 border border-white/15 rounded-md cursor-pointer transition-all duration-300 text-white/55 hover:bg-white/10 hover:text-white hover:border-cyan-300/40';

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-start mb-2 flex-col lg:flex-row gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white mb-1">Saved Searches</h1>
                    <p className="text-base text-white/60">Quick access to the routes you check often</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <form className={glassCard} onSubmit={handleCreate}>
                    <div className={cardHeader}>
                        <h3 className={cardTitle}>New Saved Search</h3>
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
                    <div className="form-group">
                        <label className={glassLabel}>Class</label>
                        <select name="flight_class" className={glassSelect} value={form.flight_class} onChange={handleChange}>
                            {FLIGHT_OPTIONS.classes.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                    </div>
                    <button type="submit" className={btnPrimary} disabled={creating}>
                        <Plus size={18} /> {creating ? 'Saving...' : 'Save Search'}
                    </button>
                </form>

                <div className={glassCard}>
                    <div className={cardHeader}>
                        <h3 className={cardTitle}>
                            <Search size={18} />
                            Your Saved Searches ({items.length}/30)
                        </h3>
                    </div>
                    {loading ? (
                        <div className="rounded-md bg-white/5 animate-pulse" style={{ height: 200 }} />
                    ) : items.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {items.map((s) => (
                                <div key={s.id} className="flex items-center justify-between gap-4 p-4 bg-white/5 rounded-md transition-all duration-300 hover:bg-white/10">
                                    <div className="flex items-center gap-4">
                                        <MapPin size={18} className="text-cyan-300" />
                                        <p className="text-white">{s.source_city} → {s.destination_city} <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-sky-400/15 text-sky-300 border border-sky-300/40">{s.flight_class}</span></p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className={btnSecondary} onClick={() => handlePredict(s)}>
                                            <TrendingUp size={14} /> Predict
                                        </button>
                                        <button className={btnIcon} onClick={() => handleDelete(s.id)} aria-label="Delete saved search">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="min-h-100 flex items-center justify-center">
                            <div className="text-center max-w-100">
                                <Search size={48} className="text-white/25 mb-6 mx-auto" />
                                <h3 className="text-xl font-bold text-white mb-2">No saved searches yet</h3>
                                <p className="text-sm text-white/55 leading-relaxed">Save a route to quickly predict it later</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SavedSearches;
