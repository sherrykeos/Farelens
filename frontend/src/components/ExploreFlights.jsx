import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Calendar,
  Users,
  Search,
  Plane,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import HeroMap from "./HeroMap/HeroMap";
import { INDIAN_AIRPORTS } from "./HeroMap/constants";

export default function ExploreFlights() {
  const [searchForm, setSearchForm] = useState({
    from: "Delhi",
    to: "Mumbai",
    departureDate: "2026-08-10",
    returnDate: "2026-08-18",
    travelers: 2,
    cabinClass: "Economy",
  });

  const [prediction, setPrediction] = useState(null);
  const [trendingRoutes, setTrendingRoutes] = useState([]);
  const [mapRoutes, setMapRoutes] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [hoveredCity, setHoveredCity] = useState(null);

  // Initial Data Fetch
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // In a real app, you would fetch from your API:
      // const trendingRes = await fetch("/api/routes/trending");
      // const mapRes = await fetch("/api/routes/map");

      // Simulating API Response
      setTrendingRoutes([
        { from: "Delhi", to: "Mumbai", currentFare: 4200, drop: 8 },
        { from: "Bangalore", to: "Chennai", currentFare: 2900, drop: 6 },
        { from: "Hyderabad", to: "Kochi", currentFare: 5300, drop: 12 },
        { from: "Mumbai", to: "Kolkata", currentFare: 6750, drop: 7 }
      ]);

      setMapRoutes([
        { from: "Delhi", to: "Mumbai" },
        { from: "Bangalore", to: "Chennai" },
        { from: "Hyderabad", to: "Kochi" },
        { from: "Mumbai", to: "Kolkata" },
        { from: "Delhi", to: "Ahmedabad" }
      ]);

      // Load initial prediction for Delhi -> Mumbai
      handleSearch();
    } catch (err) {
      console.error(err);
      setError("Failed to load initial data.");
    }
  };

  const navigate = useNavigate();

  const handleRedirect = () => {
    const isLoggedIn = localStorage.getItem("token") || localStorage.getItem("user");
    if (isLoggedIn) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  const handleSearch = async (e) => {
    if (e) {
      e.preventDefault();
      handleRedirect();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockResponse = {
        currentFare: 41200,
        predictedFare: 36200,
        confidence: 94,
        recommendation: "WAIT",
        expectedDropDays: 9,
        route: { from: searchForm.from, to: searchForm.to }
      };

      setPrediction(mockResponse);

      const routeExists = mapRoutes.find(
        r => r.from === searchForm.from && r.to === searchForm.to
      );
      if (!routeExists) {
        setMapRoutes([...mapRoutes, { from: searchForm.from, to: searchForm.to }]);
      }

    } catch (err) {
      setError("Failed to fetch flight prediction.");
    } finally {
      setIsLoading(false);
    }
  };

  const getCityCoords = (cityName) => {
    return CITIES.find((c) => c.name === cityName)?.coordinates || [0, 0];
  };

  const calculatePercentageDrop = (current, predicted) => {
    return Math.round(((current - predicted) / current) * 100);
  };

  return (
    <section className="relative bg-[#030712] py-12 px-4 sm:px-8 overflow-hidden font-sans text-[#F8FAFC]">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Subtle Radial Glow */}
        <div className="absolute top-1/3 left-1/2 w-[80vw] h-[60vh] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.06)_0%,transparent_50%)]" />
        {/* Subtle Grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(248,250,252,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(248,250,252,0.2) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col gap-6">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F172A] border border-[rgba(255,255,255,.08)]">
            <Plane size={14} className="text-[#22D3EE]" />
            <span className="text-xs font-semibold tracking-widest uppercase text-[#22D3EE]">Explore Flights</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Find the <span className="text-[#22D3EE]">smartest</span> time to book.
          </h2>
          <p className="max-w-2xl mx-auto text-[#94A3B8] text-base">
            AI analyzes millions of fares every day to predict future flight prices, ensuring you never overpay again.
          </p>
        </motion.div>

        {/* Premium Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <form
            onSubmit={handleSearch}
            className="flex flex-col lg:flex-row items-center gap-4 p-4 rounded-2xl bg-[#0F172A]/80 backdrop-blur-xl border border-[rgba(255,255,255,.08)] shadow-2xl"
          >
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
              {/* From */}
              <div className="group flex flex-col gap-1 px-4 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                <label className="text-xs font-semibold text-[#94A3B8] flex items-center gap-1">
                  <MapPin size={12} /> From
                </label>
                <select
                  value={searchForm.from}
                  onChange={(e) => setSearchForm({ ...searchForm, from: e.target.value })}
                  className="bg-transparent border-none outline-none text-base font-medium text-[#F8FAFC] focus:ring-0 p-0 cursor-pointer appearance-none"
                  required
                >
                  <option value="" disabled className="bg-[#0F172A] text-[#94A3B8]">Select City</option>
                  {INDIAN_AIRPORTS.map(c => <option key={c.iata} value={c.name} className="bg-[#0F172A] text-white">{c.name} ({c.iata})</option>)}
                </select>
              </div>

              {/* To */}
              <div className="group flex flex-col gap-1 px-4 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                <label className="text-xs font-semibold text-[#94A3B8] flex items-center gap-1">
                  <MapPin size={12} /> To
                </label>
                <select
                  value={searchForm.to}
                  onChange={(e) => setSearchForm({ ...searchForm, to: e.target.value })}
                  className="bg-transparent border-none outline-none text-base font-medium text-[#F8FAFC] focus:ring-0 p-0 cursor-pointer appearance-none"
                  required
                >
                  <option value="" disabled className="bg-[#0F172A] text-[#94A3B8]">Select City</option>
                  {INDIAN_AIRPORTS.map(c => <option key={c.iata} value={c.name} className="bg-[#0F172A] text-white">{c.name} ({c.iata})</option>)}
                </select>
              </div>

              {/* Dates */}
              <div className="group flex flex-col gap-1 px-4 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-text col-span-1 md:col-span-2 lg:col-span-1">
                <label className="text-xs font-semibold text-[#94A3B8] flex items-center gap-1">
                  <Calendar size={12} color="#ffffffff" /> Dates
                </label>
                <div className="flex items-center gap-1 text-base font-medium text-[#F8FAFC]">
                  <input
                    type="date"
                    value={searchForm.departureDate}
                    onChange={e => setSearchForm({ ...searchForm, departureDate: e.target.value })}
                    className="bg-transparent border-none outline-none text-[#F8FAFC] focus:ring-0 p-0 cursor-pointer w-full [color-scheme:dark] text-sm"
                    required
                  />
                  {/* <span className="text-[#94A3B8]">-</span>
                   <input 
                     type="date" 
                     value={searchForm.returnDate} 
                     onChange={e => setSearchForm({...searchForm, returnDate: e.target.value})} 
                     className="bg-transparent border-none outline-none text-[#F8FAFC] focus:ring-0 p-0 cursor-pointer w-full [color-scheme:dark] text-sm" 
                     required 
                   />  */}
                </div>
              </div>

              {/* Travelers */}
              <div className="group flex flex-col gap-1 px-4 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                <label className="text-xs font-semibold text-[#94A3B8] flex items-center gap-1">
                  <Users size={12} /> Travelers (Max 5)
                </label>
                <div className="text-base font-medium text-[#F8FAFC] flex items-center">
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={searchForm.travelers}
                    onChange={(e) => {
                      let val = parseInt(e.target.value);
                      if (isNaN(val)) val = "";
                      else if (val > 5) val = 5;
                      setSearchForm({ ...searchForm, travelers: val });
                    }}
                    onBlur={(e) => {
                      let val = parseInt(e.target.value);
                      if (isNaN(val) || val < 1) val = 1;
                      setSearchForm({ ...searchForm, travelers: val });
                    }}
                    className="bg-transparent border-none outline-none text-base font-medium text-[#F8FAFC] focus:ring-0 p-0 w-12 text-center appearance-none"
                  />
                  <span className="text-sm ml-1">Pax</span>
                </div>
              </div>

              {/* Class */}
              <div className="group flex flex-col gap-1 px-4 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                <label className="text-xs font-semibold text-[#94A3B8]">
                  Cabin Class
                </label>
                <select
                  value={searchForm.cabinClass}
                  onChange={(e) => setSearchForm({ ...searchForm, cabinClass: e.target.value })}
                  className="bg-transparent border-none outline-none text-base font-medium text-[#F8FAFC] focus:ring-0 p-0 cursor-pointer appearance-none"
                  required
                >
                  <option value="Economy" className="bg-[#0F172A] text-white">Economy</option>
                  <option value="Premium Economy" className="bg-[#0F172A] text-white">Premium Eco</option>
                  <option value="Business" className="bg-[#0F172A] text-white">Business</option>
                  <option value="First Class" className="bg-[#0F172A] text-white">First Class</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full lg:w-auto h-12 px-6 rounded-xl bg-[#22D3EE] text-[#030712] font-bold text-base flex items-center justify-center gap-2 hover:bg-cyan-300 transition-all active:scale-95 shadow-[0_0_20px_rgba(34,211,238,0.3)] disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-[#030712] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search size={20} />
                  Search
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded-lg w-fit">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </motion.div>

        {/* Interactive Hero Map Component */}
        <div className="mt-6 mb-12">
           <HeroMap 
             searchForm={searchForm} 
             setSearchForm={setSearchForm} 
             prediction={prediction} 
             onAction={handleRedirect} 
           />
        </div>

        {/* Trending Routes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#F8FAFC] flex items-center gap-2">
              <TrendingDown size={18} className="text-[#22D3EE]" /> Trending Price Drops
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trendingRoutes.map((route, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4, scale: 1.02 }}
                className="group relative p-4 rounded-2xl bg-[#0F172A] border border-[rgba(255,255,255,.08)] hover:border-[#22D3EE]/30 transition-all cursor-pointer overflow-hidden shadow-lg hover:shadow-[0_8px_30px_rgba(34,211,238,0.1)]"
              >
                {/* Subtle gradient hover effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#22D3EE]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <p className="font-semibold text-sm flex items-center gap-2 text-[#F8FAFC]">
                      {route.from} <ArrowRight size={12} className="text-[#94A3B8]" /> {route.to}
                    </p>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-base font-bold text-[#F8FAFC]">₹{route.currentFare.toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">
                        ▼ {route.drop}%
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
