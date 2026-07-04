import React, { useState } from 'react';
import { User, UserCircle, LogOut } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const initialsOf = (user) => {
    const source = user?.name || user?.email || '';
    const parts = source.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return source.slice(0, 2).toUpperCase();
};

/** Floating avatar + account pill that sits below the sidebar card, as its
 * own separate row — matching the Figma reference, which keeps this outside
 * the sidebar panel rather than nested inside its bottom edge. */
const AccountBar = ({ setActiveTab }) => {
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setOpen(false);
        toast.success('Logged out');
    };

    return (
        <div className="relative w-full">
            {open && (
                <div className="absolute z-[60] bottom-[calc(100%+0.5rem)] left-0 right-0 rounded-lg border border-border bg-surface shadow-xl overflow-hidden animate-fadeIn">
                    <button
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors duration-150"
                        onClick={() => {
                            setActiveTab('profile');
                            setOpen(false);
                        }}
                    >
                        <UserCircle size={16} />
                        Profile
                    </button>
                    <button
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-error hover:bg-error/10 transition-colors duration-150"
                        onClick={handleLogout}
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            )}
            <button
                className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-surface-hover transition-colors duration-200 group"
                onClick={() => setOpen(!open)}
            >
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary overflow-hidden shrink-0 border border-primary/20 group-hover:border-primary/40 transition-colors">
                    {user?.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : user?.name || user?.email ? (
                        <span className="text-[11px] font-bold">{initialsOf(user)}</span>
                    ) : (
                        <User size={16} />
                    )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                    <span className="block text-sm font-medium text-text-primary truncate">
                        {user?.name || user?.email || 'User'}
                    </span>
                    <span className="block text-xs text-text-tertiary">Free Plan</span>
                </div>
            </button>
        </div>
    );
};

export default AccountBar;
