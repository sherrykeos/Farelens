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
    `relative flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-left cursor-pointer transition-all duration-200 group ${active
        ? 'bg-primary/10 text-primary'
        : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
    }`;

const iconBubbleClass = (active) =>
    `flex items-center justify-center shrink-0 transition-colors duration-200 ${active
        ? 'text-primary'
        : 'text-text-tertiary group-hover:text-text-secondary'
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
                            <Icon size={18} />
                        </span>
                        <span className="flex-1">{item.label}</span>
                    </button>
                </li>
            );
        });

    return (
        <nav className="flex flex-col h-full p-4">
            <div className="mb-8">
                <div className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider mb-2 px-3">Main Menu</div>
                <ul className="list-none flex flex-col gap-0.5">{renderItems(menuItems)}</ul>
            </div>

            <div>
                <div className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider mb-2 px-3">Account</div>
                <ul className="list-none flex flex-col gap-0.5">{renderItems(accountItems)}</ul>
            </div>
        </nav>
    );
};

export default Sidebar;
