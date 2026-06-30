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
        <div className="relative w-full lg:w-66 shrink-0 mt-4">
            {open && (
                <div className="absolute z-[60] bottom-[calc(100%+0.5rem)] left-0 right-0 rounded-xl border border-white/15 bg-[rgba(20,28,40,0.95)] backdrop-blur-xl shadow-2xl overflow-hidden animate-fadeIn">
                    <button
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors duration-150"
                        onClick={() => {
                            setActiveTab('profile');
                            setOpen(false);
                        }}
                    >
                        <UserCircle size={16} />
                        Profile
                    </button>
                    <button
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-300 hover:bg-red-500/10 transition-colors duration-150"
                        onClick={handleLogout}
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            )}
            <div className="flex items-center gap-3">
                <button
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-linear-to-br from-cyan-400 to-blue-600 text-white overflow-hidden shrink-0 border border-white/20 shadow-lg"
                    onClick={() => setOpen(!open)}
                >
                    {user?.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : user?.name || user?.email ? (
                        <span className="text-sm font-bold">{initialsOf(user)}</span>
                    ) : (
                        <User size={20} />
                    )}
                </button>
                <button
                    className="flex-1 min-w-0 text-left px-4 py-3 rounded-xl border border-white/15 bg-white/8 backdrop-blur-xl shadow-lg hover:bg-white/15 transition-colors duration-300"
                    onClick={() => setOpen(!open)}
                >
                    <span className="block text-sm font-semibold text-white truncate">
                        {user?.name || user?.email}
                    </span>
                    <span className="block text-xs text-white/50">View account</span>
                </button>
            </div>
        </div>
    );
};

export default AccountBar;
