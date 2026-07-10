import React, { useEffect, useState } from "react";
import {
  IndianRupee,
  Target,
  Database,
  TrendingUp,
  Sparkles,
  MapPin,
  ArrowRight,
  Activity,
  Search,
  Bookmark,
  Bell,
  Clock,
  Calendar,
  PlaneTakeoff,
  PlaneLanding,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import toast from "react-hot-toast";
import {
  getModelInfo,
  getMarketAnalytics,
  listWatchlists,
  listSavedSearches,
  listAlerts,
  FLIGHT_OPTIONS,
} from "../api/client";

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  colorClass,
}) => (
  <div className="bg-surface border border-border rounded-xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
    <div className="flex justify-between items-start mb-4">
      <p className="text-sm font-medium text-text-secondary">{title}</p>
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-lg bg-bg-secondary border border-border text-text-tertiary transition-colors ${colorClass}`}
      >
        <Icon size={16} />
      </div>
    </div>
    <div className="flex items-baseline gap-3">
      <h3 className="text-2xl font-bold text-text-primary tracking-tight">
        {value}
      </h3>
      {trend && (
        <div
          className={`flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-md ${trend.includes("▲") || trend.includes("+") ? "text-success bg-success/10" : "text-error bg-error/10"}`}
        >
          {trend}
        </div>
      )}
    </div>
    {trendLabel && (
      <p className="text-xs text-text-tertiary mt-2">{trendLabel}</p>
    )}
  </div>
);

const ShortcutCard = ({
  title,
  icon: Icon,
  items,
  type,
  onClickViewAll,
  emptyText,
}) => {
  return (
    <div className="bg-surface border border-border rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] flex flex-col h-[280px]">
      <div className="p-5 border-b border-border flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2 text-text-primary font-semibold tracking-tight">
          <Icon size={16} className="text-primary" /> {title}
        </div>
        <button
          onClick={onClickViewAll}
          className="text-xs font-medium text-text-secondary hover:text-primary transition-colors flex items-center gap-1"
        >
          View All <ArrowRight size={12} />
        </button>
      </div>
      <div className="p-3 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2">
        {items && items.length > 0 ? (
          items.map((item, i) => (
            <div
              key={i}
              className="p-3 rounded-lg bg-bg-secondary border border-border hover:border-text-tertiary transition-colors flex flex-col gap-1.5 group cursor-default"
            >
              {type === "watchlist" && (
                <>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-text-primary">
                      {item.source_city}{" "}
                      <ArrowRight size={12} className="text-text-tertiary" />{" "}
                      {item.destination_city}
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Tracked since{" "}
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </>
              )}
              {type === "search" && (
                <>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-text-primary">
                      {item.source_city}{" "}
                      <ArrowRight size={12} className="text-text-tertiary" />{" "}
                      {item.destination_city}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-text-tertiary bg-surface px-1.5 py-0.5 rounded border border-border">
                      {item.flight_class}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Departs {new Date(item.travel_date).toLocaleDateString()}
                  </p>
                </>
              )}
              {type === "alert" && (
                <>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-text-primary">
                      {item.source_city}{" "}
                      <ArrowRight size={12} className="text-text-tertiary" />{" "}
                      {item.destination_city}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${item.status === "triggered" ? "bg-error/10 text-error border-error/20" : "bg-success/10 text-success border-success/20"}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Target: ₹{item.target_price.toLocaleString("en-IN")}
                  </p>
                </>
              )}
            </div>
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <Clock size={20} className="text-text-tertiary mb-2 opacity-50" />
            <p className="text-xs text-text-secondary">{emptyText}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard = ({ setActiveTab }) => {
  const [modelInfo, setModelInfo] = useState(null);
  const [market, setMarket] = useState(null);
  const [watchlists, setWatchlists] = useState([]);
  const [searches, setSearches] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [predictForm, setPredictForm] = useState({
    source_city: "Delhi",
    destination_city: "Mumbai",
    travel_date: new Date().toISOString().split("T")[0],
    flight_class: "Economy",
  });

  useEffect(() => {
    Promise.all([
      getModelInfo(),
      getMarketAnalytics(),
      listWatchlists(),
      listSavedSearches(),
      listAlerts(),
    ])
      .then(([model, analytics, wl, ss, al]) => {
        setModelInfo(model);
        setMarket(analytics);
        setWatchlists(wl.slice(0, 3));
        setSearches(ss.slice(0, 3));
        setAlerts(al.slice(0, 3));
      })
      .catch(() => toast.error("Could not load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  const handlePredict = (e) => {
    e.preventDefault();
    // In a real app we could pass this state to the prediction tab.
    // For now, we just navigate to it.
    setActiveTab("price-prediction");
  };

  const avgPriceChartData = market
    ? Object.entries(market.avg_price_by_class).map(([name, value]) => ({
        name,
        price: value,
      }))
    : [];

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-surface animate-pulse"
              style={{ height: 140 }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-end mb-2 flex-col lg:flex-row gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1 tracking-tight">
            Overview
          </h1>
          <p className="text-sm text-text-secondary">
            Welcome to your unified dashboard and market analysis.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            System Online
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Model Accuracy (MAE)"
          value={modelInfo ? `±₹${Math.round(modelInfo.metrics.mae)}` : "—"}
          icon={Target}
          trend="▲ 2.4%"
          trendLabel="vs previous model build"
          colorClass="group-hover:text-primary group-hover:border-primary/30 group-hover:bg-primary/10"
        />
        <StatCard
          title="R² Score"
          value={modelInfo ? modelInfo.metrics.r2.toFixed(3) : "—"}
          icon={Sparkles}
          trend="▲ 0.012"
          trendLabel="variance explained"
          colorClass="group-hover:text-info group-hover:border-info/30 group-hover:bg-info/10"
        />
        <StatCard
          title="Data Points"
          value={market ? market.data_points.toLocaleString() : "—"}
          icon={Database}
          trend="▲ 14.5%"
          trendLabel="growth this month"
          colorClass="group-hover:text-accent group-hover:border-accent/30 group-hover:bg-accent/10"
        />
        <StatCard
          title="Active Routes"
          value={market?.popular_routes.length || 0}
          icon={Activity}
          trend="▲ 8"
          trendLabel="new tracked routes"
          colorClass="group-hover:text-warning group-hover:border-warning/30 group-hover:bg-warning/10"
        />
      </div>

      {/* Analytics & Quick Predict */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Average Price Chart */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-semibold text-text-primary tracking-tight">
              Average Fare by Class
            </h3>
          </div>
          <div className="h-[280px] w-full overflow-x-auto custom-scrollbar pb-2">
            <div className="h-full min-w-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={avgPriceChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22D3EE" stopOpacity={1} />
                      <stop offset="95%" stopColor="#0284C7" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 12 }}
                    tickFormatter={(value) => `₹${value / 1000}k`}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      boxShadow:
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    }}
                    itemStyle={{
                      color: "#F8FAFC",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                    formatter={(value) => [
                      `₹${value.toLocaleString("en-IN")}`,
                      "Average Price",
                    ]}
                    labelStyle={{
                      color: "#94A3B8",
                      fontSize: "12px",
                      marginBottom: "4px",
                    }}
                  />
                  <Bar
                    dataKey="price"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={50}
                    activeBar={{ fill: "#38BDF8" }}
                  >
                    {avgPriceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="url(#colorPrice)" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick Predict Widget */}
        <div className="bg-surface border border-border rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h3 className="text-base font-semibold text-text-primary tracking-tight flex items-center gap-2">
              <IndianRupee size={16} className="text-primary" /> Quick Predict
            </h3>
          </div>
          <form onSubmit={handlePredict} className="flex-1 flex flex-col gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5">
                <PlaneTakeoff size={12} /> Source
              </label>
              <select
                className="w-full px-3 py-2.5 rounded-lg text-sm bg-bg-secondary border border-border text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                value={predictForm.source_city}
                onChange={(e) =>
                  setPredictForm({
                    ...predictForm,
                    source_city: e.target.value,
                  })
                }
              >
                {FLIGHT_OPTIONS.cities.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5">
                <PlaneLanding size={12} /> Destination
              </label>
              <select
                className="w-full px-3 py-2.5 rounded-lg text-sm bg-bg-secondary border border-border text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                value={predictForm.destination_city}
                onChange={(e) =>
                  setPredictForm({
                    ...predictForm,
                    destination_city: e.target.value,
                  })
                }
              >
                {FLIGHT_OPTIONS.cities.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5">
                  <Calendar size={12} /> Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2.5 rounded-lg text-sm bg-bg-secondary border border-border text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 [color-scheme:dark]"
                  value={predictForm.travel_date}
                  onChange={(e) =>
                    setPredictForm({
                      ...predictForm,
                      travel_date: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Class
                </label>
                <select
                  className="w-full px-3 py-2.5 rounded-lg text-sm bg-bg-secondary border border-border text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                  value={predictForm.flight_class}
                  onChange={(e) =>
                    setPredictForm({
                      ...predictForm,
                      flight_class: e.target.value,
                    })
                  }
                >
                  {FLIGHT_OPTIONS.classes.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="mt-auto w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 border-none bg-primary text-bg-primary shadow-[0_2px_10px_rgba(34,211,238,0.2)] hover:shadow-[0_4px_15px_rgba(34,211,238,0.4)] hover:-translate-y-0.5 hover:brightness-110"
            >
              Predict Fare <ArrowRight size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* Activity Shortcuts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ShortcutCard
          title="Recent Watchlists"
          icon={Bookmark}
          items={watchlists}
          type="watchlist"
          onClickViewAll={() => setActiveTab("watchlists")}
          emptyText="No watchlists yet"
        />

        <ShortcutCard
          title="Recent Searches"
          icon={Search}
          items={searches}
          type="search"
          onClickViewAll={() => setActiveTab("saved-searches")}
          emptyText="No saved searches yet"
        />

        <ShortcutCard
          title="Active Alerts"
          icon={Bell}
          items={alerts}
          type="alert"
          onClickViewAll={() => setActiveTab("alerts")}
          emptyText="No alerts set"
        />

        {/* Popular Routes Shortcut */}
        <div className="bg-surface border border-border rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] flex flex-col h-[280px]">
          <div className="p-5 border-b border-border flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2 text-text-primary font-semibold tracking-tight">
              <Activity size={16} className="text-warning" /> Popular Routes
            </div>
            <button
              onClick={() => setActiveTab("market-analytics")}
              className="text-xs font-medium text-text-secondary hover:text-primary transition-colors flex items-center gap-1"
            >
              Explore <ArrowRight size={12} />
            </button>
          </div>
          <div className="p-3 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2">
            {market && market.popular_routes.length > 0 ? (
              market.popular_routes.slice(0, 4).map((route, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-bg-secondary border border-border hover:border-text-tertiary transition-colors flex justify-between items-center group cursor-default"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                    <MapPin
                      size={12}
                      className="text-text-tertiary group-hover:text-warning"
                    />{" "}
                    {route.source_city}{" "}
                    <ArrowRight size={12} className="text-text-tertiary" />{" "}
                    {route.destination_city}
                  </div>
                  <span className="text-xs font-bold text-text-secondary">
                    {route.interest_count} views
                  </span>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <TrendingUp
                  size={20}
                  className="text-text-tertiary mb-2 opacity-50"
                />
                <p className="text-xs text-text-secondary">No routes tracked</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
