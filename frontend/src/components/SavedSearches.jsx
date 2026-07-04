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

    const glassCard = 'bg-surface border border-border rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] p-6';
    const cardHeader = 'flex justify-between items-center mb-6 pb-4 border-b border-border';
    const cardTitle = 'text-base font-semibold text-text-primary tracking-tight flex items-center gap-2';
    const glassLabel = 'flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5';
    const glassSelect = 'w-full px-3 py-2.5 rounded-lg text-sm transition-all duration-200 bg-bg-secondary border border-border text-text-primary hover:border-text-tertiary focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 cursor-pointer appearance-none';
    const btnPrimary = 'inline-flex items-center justify-center gap-2 px-8 py-3.5 mt-2 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 border-none bg-primary text-bg-primary shadow-[0_2px_10px_rgba(34,211,238,0.2)] hover:shadow-[0_4px_15px_rgba(34,211,238,0.4)] hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none';
    const btnSecondary = 'inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 bg-surface border border-border text-text-primary hover:bg-surface-hover hover:border-text-tertiary shadow-sm';
    const btnIcon = 'flex items-center justify-center w-9 h-9 bg-surface border border-border rounded-md cursor-pointer transition-all duration-200 text-text-tertiary hover:bg-error/10 hover:text-error hover:border-error/30 shadow-sm';

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-start mb-2 flex-col lg:flex-row gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary mb-1 tracking-tight">Saved Searches</h1>
                    <p className="text-sm text-text-secondary">Quick access to the routes you check often</p>
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
                                <div key={s.id} className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white/5 rounded-md transition-all duration-300 hover:bg-white/10">
                                    <div className="flex items-start sm:items-center gap-4 min-w-0">
                                        <div className="flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary mt-1 sm:mt-0">
                                            <MapPin size={16} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-text-primary mb-1 break-words">{s.source_city} → {s.destination_city} <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 sm:mt-0 sm:ml-2 rounded-md text-[10px] font-bold uppercase tracking-wider bg-info/10 text-info border border-info/20 whitespace-nowrap">{s.flight_class}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-auto">
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
                        <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border rounded-xl bg-bg-secondary/30 h-[300px]">
                            <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mb-4 text-text-tertiary shadow-sm">
                                <Search size={24} />
                            </div>
                            <h3 className="text-lg font-semibold text-text-primary mb-2">No saved searches yet</h3>
                            <p className="text-sm text-text-secondary max-w-sm">
                                Save a route to quickly predict it later.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SavedSearches;
