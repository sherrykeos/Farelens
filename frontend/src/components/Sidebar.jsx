import React from 'react';
import {
    LayoutDashboard,
    IndianRupee,
    CalendarDays,
    BarChart3,
    AlertTriangle,
    Bookmark,
    Search,
    Bell,
} from 'lucide-react';

const navItemClass = (active) =>
    `relative flex items-center gap-3 w-full p-2.5 rounded-xl text-sm font-medium text-left cursor-pointer transition-all duration-300 group ${active
        ? 'bg-white/15 text-white font-semibold'
        : 'text-white/60 hover:bg-white/10 hover:text-white'
    }`;

const iconBubbleClass = (active) =>
    `flex items-center justify-center w-9 h-9 rounded-full shrink-0 border transition-all duration-300 ${active
        ? 'bg-cyan-400/20 border-cyan-300/60 text-cyan-200 shadow-[0_0_12px_rgba(103,232,249,0.45)]'
        : 'bg-white/5 border-white/15 text-white/70 group-hover:border-white/30'
    }`;

const Sidebar = ({ activeTab, setActiveTab, onNavigate }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'price-prediction', label: 'Price Prediction', icon: IndianRupee },
        { id: 'fare-calendar', label: 'Fare Calendar', icon: CalendarDays },
        { id: 'market-analytics', label: 'Market Analytics', icon: BarChart3 },
        { id: 'anomaly-detection', label: 'Anomaly Detection', icon: AlertTriangle },
    ];

    const accountItems = [
        { id: 'watchlists', label: 'Watchlists', icon: Bookmark },
        { id: 'alerts', label: 'Price Alerts', icon: Bell },
        { id: 'saved-searches', label: 'Saved Searches', icon: Search },
    ];

    const handleSelect = (id) => {
        setActiveTab(id);
        if (window.innerWidth < 1024) {
            onNavigate?.();
        }
    };

    const renderItems = (items) =>
        items.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
                <li key={item.id}>
                    <button className={navItemClass(active)} onClick={() => handleSelect(item.id)}>
                        <span className={iconBubbleClass(active)}>
                            <Icon size={16} />
                        </span>
                        <span className="flex-1">{item.label}</span>
                    </button>
                </li>
            );
        });

    return (
        <aside className="w-66 lg:flex-1 lg:min-h-0 shrink-0 rounded-2xl border border-white/15 bg-white/8 backdrop-blur-xl shadow-2xl overflow-y-auto animate-fadeIn">
            <nav className="flex flex-col h-full p-5">
                <div className="mb-6">
                    <div className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3 px-2">Main Menu</div>
                    <ul className="list-none flex flex-col gap-1">{renderItems(menuItems)}</ul>
                </div>

                <div>
                    <div className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3 px-2">Account</div>
                    <ul className="list-none flex flex-col gap-1">{renderItems(accountItems)}</ul>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;
