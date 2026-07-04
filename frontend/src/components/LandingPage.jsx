import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Play,
  ArrowRight,
  Bell,
  CalendarDays,
  Globe,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  BarChart2,
  AlertTriangle,
  Bookmark,
  TrendingUp,
  Lock,
  RotateCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PublicLayout from "./Footer";
import { ChevronsDown } from "lucide-react";
import ExploreFlights from "./ExploreFlights";
import FeaturesPage from "./FeaturesPage";

const SCREENSHOTS = [
  {
    src: "/screenshots/dashboard1.png",
    label: "Dashboard",
    caption: "Live model metrics and collected fare data — nothing simulated.",
    Icon: LayoutDashboard,
    color: "#06b6d4",
  },
  {
    src: "/screenshots/pricepredict.png",
    label: "Price Prediction",
    caption: "XGBoost model with confidence intervals and SHAP explanations.",
    Icon: BrainCircuit,
    color: "#a78bfa",
  },
  {
    src: "/screenshots/pricealert.png",
    label: "Price Alerts",
    caption: "Real-time notifications for price drops and opportunities.",
    Icon: Bell,
    color: "#34d399",
  },
];

const ScreenshotCarousel = () => {
  const [[page, direction], setPage] = useState([0, 0]);
  const active = page;

  const paginate = (newDirection) => {
    let nextPage = active + newDirection;
    if (nextPage < 0) nextPage = SCREENSHOTS.length - 1;
    if (nextPage >= SCREENSHOTS.length) nextPage = 0;
    setPage([nextPage, newDirection]);
  };

  const setTab = (newTab) => {
    if (newTab === active) return;
    setPage([newTab, newTab > active ? 1 : -1]);
  };

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 250 : -250,
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 260, damping: 26 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.25 },
      },
    },
    exit: (dir) => ({
      x: dir < 0 ? 250 : -250,
      opacity: 0,
      scale: 0.96,
      transition: {
        x: { type: "spring", stiffness: 260, damping: 26 },
        opacity: { duration: 0.15 },
        scale: { duration: 0.2 },
      },
    }),
  };

  const activeColor = SCREENSHOTS[active].color;

  return (
    <div className="flex flex-col items-center">
      {/* Floating Glass Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10 p-1.5 rounded-[2rem] sm:rounded-full bg-[#0F172A]/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
        {SCREENSHOTS.map(({ label, Icon, color }, i) => {
          const isActive = active === i;
          return (
            <button
              key={label}
              onClick={() => setTab(i)}
              className="relative flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 cursor-pointer"
              style={{
                color: isActive ? "#F8FAFC" : "#94A3B8",
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabGlimpse"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${color}22, ${color}0c)`,
                    border: `1px solid ${color}40`,
                    boxShadow: `0 0 16px ${color}20`,
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                size={16}
                className="relative z-10"
                style={{ color: isActive ? color : "inherit" }}
              />
              <span className="relative z-10">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Slide wrapper */}
      <div className="relative w-full max-w-5xl group/carousel">
        {/* Ambient glow behind browser */}
        <motion.div
          animate={{
            background: `radial-gradient(circle, ${activeColor}22 0%, transparent 65%)`,
          }}
          transition={{ duration: 0.5 }}
          className="absolute -inset-10 blur-3xl pointer-events-none z-0"
        />

        {/* Browser Frame */}
        <div
          className="relative z-10 overflow-hidden rounded-2xl bg-[#0b0f19] shadow-2xl transition-all duration-300"
          style={{
            border: `1px solid ${activeColor}25`,
            boxShadow: `0 32px 80px -10px rgba(0,0,0,0.9), 0 0 0 1px ${activeColor}10`,
          }}
        >
          {/* Chrome Bar / Browser Navbar */}
          <div
            className="flex h-12 items-center justify-between bg-[#0e1320] px-4 border-b transition-colors duration-300"
            style={{ borderColor: `${activeColor}20` }}
          >
            {/* Left side: Dots & Navigation arrows */}
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-[#ff5f57] opacity-80" />
                <div className="h-3 w-3 rounded-full bg-[#febc2e] opacity-80" />
                <div className="h-3 w-3 rounded-full bg-[#28c840] opacity-80" />
              </div>
              <div className="hidden sm:flex gap-1.5 ml-4">
                <div className="p-1 rounded text-white/20 hover:text-white/40 transition-colors cursor-pointer">
                  <ChevronLeft size={14} />
                </div>
                <div className="p-1 rounded text-white/20 hover:text-white/40 transition-colors cursor-pointer">
                  <ChevronRight size={14} />
                </div>
                <div className="p-1 rounded text-white/20 hover:text-white/40 transition-colors cursor-pointer">
                  <RotateCw size={12} className="mt-0.5" />
                </div>
              </div>
            </div>

            {/* Middle: Secure Address bar */}
            <div className="flex h-7 w-full max-w-[340px] items-center justify-center rounded-lg bg-[#070b13]/80 border border-white/5 px-3 truncate mx-2">
              <div className="flex items-center gap-1.5 text-white/40 truncate">
                <Lock size={10} className="text-cyan-400 shrink-0" />
                <span className="text-[11px] font-medium tracking-wide truncate">
                  https://farelens.app
                  <span className="text-white/60">/dashboard/{SCREENSHOTS[active].label.toLowerCase().replace(" ", "-")}</span>
                </span>
              </div>
            </div>

            {/* Right side: spacer to keep centered */}
            <div className="w-16 sm:w-24" />
          </div>

          {/* Animated Slide container */}
          <div className="relative aspect-[16/10] sm:aspect-video overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={active}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 w-full h-full"
              >
                <img
                  src={SCREENSHOTS[active].src}
                  alt={SCREENSHOTS[active].label}
                  className="w-full h-full object-cover object-top select-none"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Prev / Next floating page buttons */}
        {[
          { fn: () => paginate(-1), side: "left", Icon: ChevronLeft },
          { fn: () => paginate(1), side: "right", Icon: ChevronRight },
        ].map(({ fn, side, Icon: ArrowIcon }) => (
          <button
            key={side}
            onClick={fn}
            className="absolute top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-[#0e1320]/90 text-white shadow-xl transition-all duration-300 ease-in-out backdrop-blur-md opacity-0 group-hover/carousel:opacity-100"
            style={{ [side]: -24 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${activeColor}20`;
              e.currentTarget.style.borderColor = `${activeColor}50`;
              e.currentTarget.style.transform = `translateY(-50%) scale(1.08)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#0e1320ef";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              e.currentTarget.style.transform = `translateY(-50%) scale(1)`;
            }}
          >
            <ArrowIcon size={20} />
          </button>
        ))}
      </div>

      {/* Caption + Dots Indicators */}
      <div className="mt-8 text-center max-w-xl">
        <AnimatePresence mode="wait">
          <motion.p
            key={active}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="mb-4 text-sm text-white/60 leading-relaxed font-medium"
          >
            <span style={{ color: activeColor }} className="font-bold mr-1.5">
              {SCREENSHOTS[active].label}
            </span>
            — {SCREENSHOTS[active].caption}
          </motion.p>
        </AnimatePresence>
        
        <div className="flex justify-center gap-2">
          {SCREENSHOTS.map((s, i) => (
            <button
              key={i}
              onClick={() => setTab(i)}
              className={`h-1.5 cursor-pointer rounded-full border-none p-0 transition-all duration-300 ease-in-out ${active === i ? "w-8" : "w-2.5"}`}
              style={{
                background: active === i ? s.color : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const FEATURES_LIST = [
  {
    Icon: TrendingUp,
    title: "AI Price Prediction",
    desc: "Predict future flight prices using our state-of-the-art XGBoost machine learning model trained on millions of real data points.",
    color: "#06b6d4"
  },
  {
    Icon: CalendarDays,
    title: "Fare Calendar",
    desc: "Visualize price fluctuations across entire months. Instantly pinpoint the absolute cheapest dates to fly at a single glance.",
    color: "#a78bfa"
  },
  {
    Icon: Bell,
    title: "Smart Price Alerts",
    desc: "Never miss a deal again. Our automated sentinels watch your routes 24/7 and push alerts the second fares drop.",
    color: "#fbbf24"
  },
  {
    Icon: BrainCircuit,
    title: "AI Explainability",
    desc: "We don't just give you a number. See exactly why the AI made its prediction through advanced SHAP value breakdowns.",
    color: "#34d399"
  },
  {
    Icon: Globe,
    title: "Market Analytics",
    desc: "Dive deep into route demographics, average carrier costs, and historical pricing trends across the entire market.",
    color: "#ec4899"
  },
  {
    Icon: Bookmark,
    title: "Active Watchlists",
    desc: "Save and organize multiple itineraries in one dashboard. Track total trip costs and predict optimal booking windows.",
    color: "#3b82f6"
  },
];

const InteractiveFeatureShowcase = () => {
  const [active, setActive] = useState(0);
  const ActiveIcon = FEATURES_LIST[active].Icon;

  return (
    <section id="features" className="relative overflow-hidden py-20 px-4 sm:px-8 bg-[#030712]">
      {/* Background Orbs */}
      <motion.div
        animate={{
          background: `radial-gradient(circle, ${FEATURES_LIST[active].color}15 0%, transparent 60%)`,
        }}
        transition={{ duration: 0.8 }}
        className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[1000px] -translate-x-1/2 -translate-y-1/2 blur-3xl z-0"
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-14 text-center">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-sky-400 backdrop-blur-md">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
              Intelligence Suite
            </span>
            <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-extrabold tracking-tight text-white leading-tight">
              Everything you need to <br className="sm:hidden" />
              <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
                predict smarter.
              </span>
            </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-center">
          {/* Left Side: Navigation Stack */}
          <div className="w-full lg:w-5/12 flex flex-col gap-2.5">
            {FEATURES_LIST.map((feature, idx) => {
              const isActive = active === idx;
              return (
                <button
                  key={feature.title}
                  onClick={() => setActive(idx)}
                  className={`group relative flex items-center gap-4 rounded-xl p-4 text-left transition-all duration-300 ${
                    isActive
                      ? "bg-[#0F172A] shadow-lg ring-1 ring-white/10"
                      : "hover:bg-white/[0.02]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="feature-active-bg"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/5 to-transparent"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="feature-active-bar"
                      className="absolute left-0 top-1/4 h-1/2 w-1 rounded-r-full"
                      style={{ background: feature.color }}
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
                      isActive
                        ? "bg-[#1E293B] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                        : "bg-transparent group-hover:bg-white/5"
                    }`}
                  >
                    <feature.Icon
                      size={20}
                      style={{ color: isActive ? feature.color : "#64748B" }}
                      className="transition-colors duration-300"
                    />
                  </div>
                  <div className="relative z-10">
                    <h3
                      className={`text-base font-bold transition-colors duration-300 ${
                        isActive ? "text-white" : "text-[#94A3B8] group-hover:text-slate-300"
                      }`}
                    >
                      {feature.title}
                    </h3>
                    <p className={`mt-0.5 text-xs line-clamp-1 transition-colors duration-300 ${
                        isActive ? "text-slate-400" : "text-slate-500"
                      }`}>
                      {feature.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Side: Expanded Card Display */}
          <div className="w-full lg:w-7/12 h-[380px] sm:h-[450px] relative perspective-1000">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 20, rotateY: 10, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, rotateY: -10, scale: 0.95 }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
                className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[1.5rem] border bg-[#0B1221] shadow-2xl p-8"
                style={{
                  borderColor: `${FEATURES_LIST[active].color}30`,
                  boxShadow: `0 20px 40px -15px rgba(0,0,0,0.8), 0 0 30px ${FEATURES_LIST[active].color}15`
                }}
              >
                {/* Internal Glow Blob */}
                <div 
                  className="absolute -top-32 -right-32 h-80 w-80 rounded-full blur-3xl opacity-30 pointer-events-none"
                  style={{ background: FEATURES_LIST[active].color }}
                />
                
                <div className="relative z-10">
                  <div 
                    className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl backdrop-blur-xl border border-white/10"
                    style={{ background: `linear-gradient(135deg, ${FEATURES_LIST[active].color}20, transparent)` }}
                  >
                    <ActiveIcon size={32} style={{ color: FEATURES_LIST[active].color }} />
                  </div>
                  
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
                    {FEATURES_LIST[active].title}
                  </h3>
                  
                  <p className="text-base text-slate-300 leading-relaxed max-w-lg">
                    {FEATURES_LIST[active].desc}
                  </p>
                </div>
                
                <div className="relative z-10 mt-auto">
                  <Link
                    to="/working"
                    className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:scale-105"
                    style={{ background: FEATURES_LIST[active].color, boxShadow: `0 6px 16px ${FEATURES_LIST[active].color}40` }}
                  >
                    Learn how it works
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

const AVATARS = [
  { initial: "A", bg: "#e74c3c" },
  { initial: "M", bg: "#3b82f6" },
  { initial: "R", bg: "#22c55e" },
  { initial: "S", bg: "#f59e0b" },
];

const LandingPage = () => {
  useEffect(() => {
    if (window.location.hash === "#features" || window.location.pathname.includes("/feature")) {
      const el = document.getElementById("features");
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 150);
      }
    }
  }, []);

  return (
    <PublicLayout>
      {/* ══════════════════════════════════════════
                HERO — full-width background image
            ══════════════════════════════════════════ */}
      <section className="relative flex h-screen items-center overflow-hidden bg-[url(/Image/Backgroundimage.jpg)] bg-cover bg-[position:65%_center] sm:bg-right-center bg-no-repeat">
        {/* Dark overlay: solid black on left, fades to transparent on right */}

        <div className="absolute inset-0 bg-gradient-to-r from-[#050a14] from-30% via-[rgba(5,10,20,0.85)] via-48% to-transparent" />
        {/* Top fade — dark band behind the navbar */}
        <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-[rgba(5,10,20,0.8)] to-transparent" />

        {/* Content — paddingTop clears the 80px fixed navbar */}
        <div className="relative z-[2] mx-auto w-full max-w-7xl px-10 pt-9">
          <div className="max-w-2xl">
            {/* Heading */}
            <p className="text-xl sm:text-2xl text-cyan-100/60">Predict. Plan. Save.</p>
            <h1 className="my-2 mb-5 text-[clamp(2.5rem,6vw,4rem)] font-extrabold leading-tight -tracking-wider text-white">
              Know the Right Time to Fly.
            </h1>

            {/* Subtitle */}
            <p className="mb-20 max-w-xl text-base leading-relaxed text-white">
              AI-powered flight price predictions, fare calendars, and smart
              alerts that help you book at the right time and never overpay
              again.
            </p>

            {/* CTA Buttons */}
            <div className="mb-14 flex flex-wrap gap-4">
              {/* Primary */}
              <Link
                to="/register"
                className="inline-block rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 px-9 py-4 font-bold text-white no-underline shadow-lg transition-all duration-200"
                style={{ boxShadow: "0 6px 22px rgba(6,182,212,0.45)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 30px rgba(6,182,212,0.6)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 22px rgba(6,182,212,0.45)";
                }}
              >
                Start for Free
              </Link>

              {/* Secondary */}
              <Link
                to="/working"
                className="inline-flex items-center gap-2.5 rounded-2xl border border-white/30 bg-white/5 px-6 py-4 font-semibold text-white no-underline transition-colors duration-200"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)";
                }}
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                  <Play size={11} fill="white" color="white" />
                </span>
                See How It Works
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4">
              {/* Overlapping avatar circles */}
              <div className="flex">
                {AVATARS.map((av, i) => (
                  <div
                    key={i}
                    className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-[2.5px] border-[rgba(4,8,18,0.9)] text-xs font-bold text-white"
                    style={{
                      background: av.bg,
                      marginLeft: i > 0 ? -12 : 0,
                      zIndex: 4 - i,
                    }}
                  >
                    {av.initial}
                  </div>
                ))}
              </div>

              {/* Stars + label */}
              <div>
                <div className="mb-1 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="#f59e0b"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                    </svg>
                  ))}
                </div>
                <p className="m-0 text-sm text-white/55">
                  Loved by 10,000+ smart travelers
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Scroll Down Animated Icon */}
        <a
          //   href="#features"
          aria-label="Scroll down"
          className="absolute bottom-14 left-1/2 z-[2] flex -translate-x-1/2 flex-col items-center gap-1 text-white/50 transition-colors duration-300 ease-in-out animate-bounce"
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.9)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)";
          }}
        >
          <p className="text-xs text-gray-100/30">Explore</p>
          <ChevronsDown size={28} />
        </a>
      </section>

      <ExploreFlights/>

          <InteractiveFeatureShowcase />
      {/* <FeaturesPage/> */}

      {/* ══════════════════════════════════════════
                DASHBOARD GLIMPSE — screenshot carousel
            ══════════════════════════════════════════ */}
      <section
        id="dashboard-glimpse"
        className="relative overflow-hidden py-24 px-4 sm:px-8 bg-[#030712]"
      >
        {/* Subtle top divider */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

        {/* Ambient background glow */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[1000px] -translate-x-1/2 -translate-y-1/2 bg-cyan-900/10 blur-[100px] z-0" />

        <div className="relative z-[1] mx-auto max-w-5xl">
          {/* Badge + Heading */}
          <div className="mb-14 text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-sky-400 backdrop-blur-md">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
              Live App Preview
            </span>
            <h2 className="mb-3 text-[clamp(1.8rem,3vw,2.5rem)] font-extrabold tracking-tight text-white leading-tight">
              Glimpses of the{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h2>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              Real screenshots of the actual running app — nothing simulated.
            </p>
          </div>

          {/* Carousel */}
          <div className="px-2 sm:px-8">
            <ScreenshotCarousel />
          </div>

          {/* Feature pills */}
          <div className="mt-14 flex flex-wrap justify-center gap-3">
            {[
              { label: "Price Prediction", color: "#06b6d4" },
              { label: "Fare Calendar", color: "#06b6d4" },
              { label: "Market Analytics", color: "#34d399" },
              { label: "Anomaly Detection", color: "#fb7185" },
              { label: "Watchlists", color: "#a78bfa" },
              { label: "Price Alerts", color: "#fbbf24" },
              { label: "Saved Searches", color: "#06b6d4" },
              { label: "SHAP Explanations", color: "#34d399" },
            ].map(({ label, color }) => (
              <span
                key={label}
                className="rounded-lg px-4 py-2 text-[13px] font-semibold text-slate-300 transition-colors hover:text-white"
                style={{
                  background: `linear-gradient(to bottom, ${color}10, transparent)`,
                  border: `1px solid ${color}20`,
                  boxShadow: `inset 0 1px 1px ${color}10`
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      

      {/* ══════════════════════════════════════════
                STATS BAR
            ══════════════════════════════════════════ */}
      <section className="relative py-12 px-4 sm:px-8 bg-[#030712]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-900/10 to-transparent pointer-events-none" />
        <div className="relative mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-[clamp(1.3rem,2.5vw,2rem)] font-extrabold tracking-tight text-white mb-3">
              Built on <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400">hundreds</span> of data points.
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              We process massive amounts of flight data daily to ensure our AI models are the most accurate in the industry.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { stat: "300K+", label: "Real flight records\ntrained on" },
              { stat: "95%+", label: "Prediction accuracy\nin range" },
              { stat: "49 Days", label: "Reliable prediction\nhorizon" },
              { stat: "24/7", label: "Monitoring & anomaly\ndetection" },
            ].map(({ stat, label }) => (
              <div 
                key={stat} 
                className="group relative flex flex-col items-center justify-center p-6 rounded-2xl bg-[#0F172A]/80 border border-white/5 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_15px_30px_-10px_rgba(6,182,212,0.15)]"
              >
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/10 group-hover:to-transparent transition-all duration-500" />
                
                <div className="relative z-10 mb-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 group-hover:to-cyan-200 transition-colors duration-500">
                  {stat}
                </div>
                <div className="relative z-10 whitespace-pre-line text-xs text-center font-medium leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors duration-500">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
                CTA BANNER
            ══════════════════════════════════════════ */}
      <section className="relative py-16 px-4 sm:px-8 bg-[#030712] overflow-hidden">
        <div className="relative mx-auto max-w-4xl">
          <div className="relative rounded-[2.5rem] overflow-hidden bg-[#0A101D] border border-white/10 shadow-[0_0_80px_rgba(6,182,212,0.1)] p-10 sm:p-14 text-center">
            {/* Massive background glows inside the card */}
            <div className="absolute -top-32 -left-32 w-72 h-72 bg-cyan-500/30 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="relative z-10">
              <span className="inline-block mb-4 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-cyan-400 backdrop-blur-md">
                No credit card required
              </span>
              
              <h2 className="mb-5 text-[clamp(2rem,4vw,3.5rem)] font-extrabold tracking-tight text-white leading-none">
                Stop guessing. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400">Start predicting.</span>
              </h2>
              
              <p className="mx-auto mb-8 max-w-lg text-base text-slate-400 leading-relaxed">
                Join thousands of smart travelers who never overpay for flights. Run the live AI model on any route in seconds.
              </p>
              
              <Link
                to="/register"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-8 py-3.5 text-base font-bold text-[#0d1116] shadow-[0_0_30px_rgba(255,255,255,0.25)] transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(255,255,255,0.4)]"
              >
                <span className="relative z-10">Get Started for Free</span>
                <ArrowRight
                  size={18}
                  className="relative z-10 transition-transform group-hover:translate-x-1"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-100 to-white opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default LandingPage;
