import React, { useState } from 'react';
import { Menu, X, Plane, User, LogOut, UserCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const initialsOf = (user) => {
    const source = user?.name || user?.email || '';
    const parts = source.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return source.slice(0, 2).toUpperCase();
};

const Header = ({ sidebarOpen, setSidebarOpen, setActiveTab }) => {
    const { user, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
        toast.success('Logged out');
    };

    const handleNavigation = (tab) => {
        setActiveTab(tab);
        setShowUserMenu(false);
    };

    return (
        <header className="sticky top-0 z-[100] h-20 bg-[rgba(22,28,35,0.9)] backdrop-blur-[10px] border-b border-border shadow-md">
            <div className="h-full flex items-center justify-between px-4 sm:px-8 gap-8">
                <div className="flex items-center gap-6">
                    <button
                        className="btn-icon"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="Toggle sidebar"
                    >
                        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <div className="flex items-center gap-4">
                        <Plane size={32} className="text-primary drop-shadow-[0_0_10px_rgba(217,164,65,0.45)]" />
                        <div className="hidden sm:flex flex-col">
                            <h1 className="gradient-text text-xl font-extrabold leading-none">AirlineML</h1>
                            <p className="text-xs text-text-tertiary">Dynamic Pricing System</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div
                            className="flex items-center gap-2 px-2 py-1 bg-bg-secondary border border-border rounded-lg cursor-pointer transition-all duration-300 hover:bg-surface-hover hover:border-primary"
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                            <div className="flex items-center justify-center w-9 h-9 bg-linear-to-br from-primary to-secondary rounded-full text-white overflow-hidden">
                                {user?.avatar_url ? (
                                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : user?.name || user?.email ? (
                                    <span className="text-xs font-bold">{initialsOf(user)}</span>
                                ) : (
                                    <User size={20} />
                                )}
                            </div>
                            <div className="hidden sm:flex flex-col">
                                <span className="text-sm font-semibold text-text-primary">{user?.name || user?.email}</span>
                                <span className="text-xs text-text-tertiary capitalize">{user?.role}</span>
                            </div>
                        </div>

                        {showUserMenu && (
                            <div className="absolute top-[calc(100%+0.5rem)] right-0 w-65 bg-surface border border-border rounded-lg shadow-xl z-[110] overflow-hidden animate-fadeIn">
                                <div className="flex items-center gap-4 p-6">
                                    <div className="flex items-center justify-center w-12 h-12 shrink-0 bg-linear-to-br from-primary to-secondary rounded-full text-white overflow-hidden">
                                        {user?.avatar_url ? (
                                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : user?.name || user?.email ? (
                                            <span className="text-base font-bold">{initialsOf(user)}</span>
                                        ) : (
                                            <User size={32} />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-text-primary break-all">{user?.name || user?.email}</p>
                                        <p className="text-xs text-text-tertiary">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="dropdown-divider"></div>
                                <div className="flex flex-col p-2">
                                    <button
                                        className="flex items-center gap-4 w-full px-4 py-2 bg-transparent border-none rounded-md text-text-secondary text-sm cursor-pointer text-left transition-all duration-150 hover:bg-surface-hover hover:text-text-primary"
                                        onClick={() => handleNavigation('profile')}
                                    >
                                        <UserCircle size={18} />
                                        <span>Profile</span>
                                    </button>
                                </div>
                                <div className="dropdown-divider"></div>
                                <button
                                    className="flex items-center gap-4 w-[calc(100%-1rem)] m-2 px-4 py-2 bg-transparent border-none rounded-md text-error text-sm cursor-pointer text-left transition-all duration-150 hover:bg-[rgba(217,83,79,0.1)]"
                                    onClick={handleLogout}
                                >
                                    <LogOut size={18} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
