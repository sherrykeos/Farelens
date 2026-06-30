import React, { useEffect, useRef, useState } from 'react';
import { User, Mail, Shield, Calendar, Bookmark, Search, Bell, LogOut, KeyRound, Pencil, Camera, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
    listWatchlists, listSavedSearches, listAlerts, forgotPassword,
    uploadAvatarToCloudinary, isCloudinaryConfigured,
} from '../api/client';

const initialsOf = (user) => {
    const source = user?.name || user?.email || '';
    const parts = source.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return source.slice(0, 2).toUpperCase();
};

const Profile = () => {
    const { user, logout, updateProfile, removeAvatar } = useAuth();
    const [counts, setCounts] = useState({ watchlists: 0, savedSearches: 0, alerts: 0 });
    const [requesting, setRequesting] = useState(false);
    const [requestSent, setRequestSent] = useState(false);
    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(user?.name || '');
    const [savingName, setSavingName] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [removingPhoto, setRemovingPhoto] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        Promise.all([listWatchlists(), listSavedSearches(), listAlerts()])
            .then(([watchlists, savedSearches, alerts]) => setCounts({
                watchlists: watchlists.length, savedSearches: savedSearches.length, alerts: alerts.length,
            }))
            .catch(() => {});
    }, []);

    const handleRequestReset = async () => {
        setRequesting(true);
        try {
            const result = await forgotPassword(user.email);
            toast.success(result.detail);
            setRequestSent(true);
        } catch {
            toast.error('Could not request a password reset');
        } finally {
            setRequesting(false);
        }
    };

    const handleSaveName = async () => {
        if (!nameInput.trim()) {
            toast.error('Name cannot be empty');
            return;
        }
        setSavingName(true);
        try {
            await updateProfile({ name: nameInput.trim() });
            toast.success('Name updated');
            setEditingName(false);
        } catch {
            toast.error('Could not update name');
        } finally {
            setSavingName(false);
        }
    };

    const handlePhotoSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!isCloudinaryConfigured()) {
            toast.error('Photo upload is not configured yet');
            return;
        }
        setUploadingPhoto(true);
        try {
            const avatarUrl = await uploadAvatarToCloudinary(file);
            await updateProfile({ avatar_url: avatarUrl });
            toast.success('Profile photo updated');
        } catch {
            toast.error('Could not upload photo');
        } finally {
            setUploadingPhoto(false);
            e.target.value = '';
        }
    };

    const handleRemovePhoto = async () => {
        setRemovingPhoto(true);
        try {
            await removeAvatar();
            toast.success('Profile photo removed');
        } catch {
            toast.error('Could not remove photo');
        } finally {
            setRemovingPhoto(false);
        }
    };

    const glassCard = 'rounded-2xl border border-white/15 bg-white/5 shadow-lg p-6 transition-all duration-300';
    const cardHeader = 'flex justify-between items-center mb-6 pb-4 border-b border-white/10';
    const cardTitle = 'flex items-center gap-2 text-xl font-semibold text-white';
    const glassInput = 'w-full px-4 py-2 rounded-md text-sm transition-all duration-300 bg-white/5 border border-white/15 text-white focus:outline-none focus:border-cyan-300/60 focus:ring-3 focus:ring-cyan-300/15';
    const btnSecondary = 'inline-flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm font-semibold cursor-pointer transition-all duration-300 bg-white/10 text-white border border-white/15 hover:bg-white/20 disabled:opacity-60 disabled:cursor-not-allowed';

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-start mb-2 flex-col lg:flex-row gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white mb-1">Profile</h1>
                    <p className="text-base text-white/60">Your real account data from /auth/me</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className={`${glassCard} flex flex-col items-center p-8 text-center`}>
                    <div className="relative mb-6">
                        <div className="flex items-center justify-center w-30 h-30 bg-linear-to-br from-cyan-400 to-blue-600 rounded-full text-white overflow-hidden border border-white/20">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : user?.name || user?.email ? (
                                <span className="text-3xl font-bold">{initialsOf(user)}</span>
                            ) : (
                                <User size={56} />
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingPhoto}
                                aria-label="Change profile photo"
                                className="flex items-center justify-center w-9 h-9 bg-cyan-500 text-white rounded-full border-2 border-[#0d1116] cursor-pointer hover:bg-cyan-400 transition-colors duration-300"
                            >
                                <Camera size={16} />
                            </button>
                            {user?.avatar_url && (
                                <button
                                    type="button"
                                    onClick={handleRemovePhoto}
                                    disabled={removingPhoto}
                                    aria-label="Remove profile photo"
                                    className="flex items-center justify-center w-9 h-9 bg-red-500 text-white rounded-full border-2 border-[#0d1116] cursor-pointer hover:bg-red-400 transition-colors duration-300"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoSelect}
                        />
                    </div>
                    {uploadingPhoto && <p className="text-xs text-white/55 -mt-4 mb-4">Uploading...</p>}
                    {removingPhoto && <p className="text-xs text-white/55 -mt-4 mb-4">Removing...</p>}

                    {editingName ? (
                        <div className="flex items-center gap-2 mb-1">
                            <input
                                type="text"
                                className={`${glassInput} text-center`}
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                autoFocus
                            />
                            <button className={`${btnSecondary} px-3.5 py-1.5 text-xs`} onClick={handleSaveName} disabled={savingName}>
                                {savingName ? '...' : 'Save'}
                            </button>
                        </div>
                    ) : (
                        <h2 className="flex items-center gap-2 text-2xl font-bold text-white mb-1">
                            {user?.name || user?.email}
                            <button
                                type="button"
                                aria-label="Edit name"
                                onClick={() => { setNameInput(user?.name || ''); setEditingName(true); }}
                                className="text-white/55 hover:text-cyan-300 transition-colors duration-300"
                            >
                                <Pencil size={14} />
                            </button>
                        </h2>
                    )}
                    <p className="text-base text-white/60 mb-6">{user?.role}</p>

                    <div className="flex gap-8 pt-6 border-t border-white/10 w-full justify-center">
                        <div className="flex flex-col items-center">
                            <span className="text-xl font-bold text-cyan-300">{counts.watchlists}</span>
                            <span className="text-xs text-white/55">Watchlists</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-xl font-bold text-cyan-300">{counts.savedSearches}</span>
                            <span className="text-xs text-white/55">Saved Searches</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-xl font-bold text-cyan-300">{counts.alerts}</span>
                            <span className="text-xs text-white/55">Price Alerts</span>
                        </div>
                    </div>

                    <button className={`${btnSecondary} px-8 py-4 text-base`} style={{ marginTop: 'var(--spacing-lg)', width: '100%' }} onClick={logout}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>

                <div className={`${glassCard} lg:col-span-2`}>
                    <div className={cardHeader}>
                        <h3 className={cardTitle}>Account Details</h3>
                    </div>
                    <div className="flex flex-col gap-6 mt-4">
                        <div className="flex gap-4 items-start">
                            <div className="flex items-center justify-center w-10 h-10 bg-cyan-400/15 border border-cyan-300/40 rounded-md text-cyan-300 shrink-0"><User size={18} /></div>
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-white/55 mb-1">Name</label>
                                <p className="text-base text-white">{user?.name || '—'}</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="flex items-center justify-center w-10 h-10 bg-cyan-400/15 border border-cyan-300/40 rounded-md text-cyan-300 shrink-0"><Mail size={18} /></div>
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-white/55 mb-1">Email</label>
                                <p className="text-base text-white">{user?.email}</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="flex items-center justify-center w-10 h-10 bg-cyan-400/15 border border-cyan-300/40 rounded-md text-cyan-300 shrink-0"><Shield size={18} /></div>
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-white/55 mb-1">Role</label>
                                <p className="text-base text-white">{user?.role}</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="flex items-center justify-center w-10 h-10 bg-cyan-400/15 border border-cyan-300/40 rounded-md text-cyan-300 shrink-0"><Calendar size={18} /></div>
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-white/55 mb-1">Member since</label>
                                <p className="text-base text-white">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="flex items-center justify-center w-10 h-10 bg-cyan-400/15 border border-cyan-300/40 rounded-md text-cyan-300 shrink-0"><Bookmark size={18} /></div>
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-white/55 mb-1">Watchlists</label>
                                <p className="text-base text-white">{counts.watchlists} of 20 used</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="flex items-center justify-center w-10 h-10 bg-cyan-400/15 border border-cyan-300/40 rounded-md text-cyan-300 shrink-0"><Search size={18} /></div>
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-white/55 mb-1">Saved Searches</label>
                                <p className="text-base text-white">{counts.savedSearches} of 30 used</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="flex items-center justify-center w-10 h-10 bg-cyan-400/15 border border-cyan-300/40 rounded-md text-cyan-300 shrink-0"><Bell size={18} /></div>
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-white/55 mb-1">Price Alerts</label>
                                <p className="text-base text-white">{counts.alerts} triggered</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-white/10" style={{ margin: 'var(--spacing-lg) 0' }}></div>

                    <h3 className={cardTitle} style={{ marginBottom: 'var(--spacing-md)' }}>
                        <KeyRound size={18} />
                        Change Password
                    </h3>
                    {!requestSent ? (
                        <>
                            <button className={btnSecondary} onClick={handleRequestReset} disabled={requesting}>
                                {requesting ? 'Sending...' : 'Send password reset link'}
                            </button>
                            <p className="text-base text-white/60" style={{ marginTop: 'var(--spacing-sm)' }}>
                                We'll email a reset link to {user?.email} — click it to set a new password.
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-emerald-400 font-semibold">
                                Check your inbox for the reset link.
                            </p>
                            <button className={`${btnSecondary} px-3.5 py-1.5 text-xs`} style={{ marginTop: 'var(--spacing-sm)' }} onClick={handleRequestReset} disabled={requesting}>
                                {requesting ? 'Sending...' : 'Send again'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
