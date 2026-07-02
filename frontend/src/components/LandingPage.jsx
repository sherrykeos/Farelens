import React, { useState } from "react";
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
} from "lucide-react";
import PublicLayout from "./Footer";
import { ChevronsDown } from "lucide-react";

const SCREENSHOTS = [
  {
    src: "/screenshots/Dashboard.png",
    label: "Dashboard",
    caption: "Live model metrics and collected fare data — nothing simulated.",
    Icon: LayoutDashboard,
    color: "#06b6d4",
  },
  {
    src: "/screenshots/Price Prediction.png",
    label: "Price Prediction",
    caption: "XGBoost model with confidence intervals and SHAP explanations.",
    Icon: BrainCircuit,
    color: "#a78bfa",
  },
  {
    src: "/screenshots/Market Analytics.png",
    label: "Market Analytics",
    caption: "Average price by class, cheapest and most expensive routes.",
    Icon: BarChart2,
    color: "#34d399",
  },
];

const ScreenshotCarousel = () => {
  const [active, setActive] = useState(0);
  const prev = () =>
    setActive((i) => (i === 0 ? SCREENSHOTS.length - 1 : i - 1));
  const next = () =>
    setActive((i) => (i === SCREENSHOTS.length - 1 ? 0 : i + 1));

  return (
    <div>
      {/* Tab navigation */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {SCREENSHOTS.map(({ label, Icon, color }, i) => (
          <button
            key={label}
            onClick={() => setActive(i)}
            className="flex items-center gap-3 rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 ease-in-out"
            style={{
              background:
                active === i
                  ? `linear-gradient(135deg, ${color}30, ${color}18)`
                  : "rgba(255,255,255,0.04)",
              border:
                active === i
                  ? `1px solid ${color}70`
                  : "1px solid rgba(255,255,255,0.1)",
              color: active === i ? color : "rgba(255,255,255,0.45)",
              boxShadow: active === i ? `0 0 16px ${color}25` : "none",
            }}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Slide wrapper */}
      <div className="relative">
        {/* Ambient glow behind frame */}
        <div
          className="absolute top-[10%] left-1/2 h-3/5 w-[70%] -translate-x-1/2 blur-2xl transition-colors duration-500 ease-in-out pointer-events-none"
          style={{
            background: `radial-gradient(ellipse, ${SCREENSHOTS[active].color}20 0%, transparent 70%)`,
          }}
        />

        {/* Slide track */}
        <div className="relative z-[1] overflow-hidden rounded-2xl">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${active * 100}%)` }}
          >
            {SCREENSHOTS.map(({ src, label, color }) => (
              <div key={label} className="min-w-full">
                <div
                  className="overflow-hidden rounded-xl"
                  style={{
                    border: `1px solid ${color}30`,
                    boxShadow: `0 32px 72px rgba(0,0,0,0.7), 0 0 0 1px ${color}15`,
                  }}
                >
                  {/* Chrome bar */}
                  <div
                    className="flex h-9 items-center gap-1.5 bg-[rgba(13,17,22,0.98)] px-3.5"
                    style={{ borderBottom: `1px solid ${color}20` }}
                  >
                    <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                    <div className="mx-3.5 flex h-5 flex-1 items-center justify-center rounded bg-white/5">
                      <span className="text-[0.68rem] text-white/30">
                        localhost:3000 — FareLens
                      </span>
                    </div>
                  </div>
                  {/* Screenshot */}
                  <img src={src} alt={label} className="block w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prev / Next */}
        {[
          { fn: prev, side: "left", Icon: ChevronLeft },
          { fn: next, side: "right", Icon: ChevronRight },
        ].map(({ fn, side, Icon: ArrowIcon }) => (
          <button
            key={side}
            onClick={fn}
            className="absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-[rgba(13,17,22,0.92)] text-white shadow-lg transition-all duration-200 ease-in-out"
            style={{ [side]: -22 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${SCREENSHOTS[active].color}22`;
              e.currentTarget.style.borderColor = `${SCREENSHOTS[active].color}60`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(13,17,22,0.92)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
            }}
          >
            <ArrowIcon size={18} />
          </button>
        ))}
      </div>

      {/* Caption + dots */}
      <div className="mt-6 text-center">
        <p className="mb-4 text-sm text-white/50">
          <span style={{ color: SCREENSHOTS[active].color, fontWeight: 700 }}>
            {SCREENSHOTS[active].label}
          </span>
          {" — "}
          {SCREENSHOTS[active].caption}
        </p>
        <div className="flex justify-center gap-2">
          {SCREENSHOTS.map((s, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-2 cursor-pointer rounded border-none p-0 transition-all duration-300 ease-in-out ${active === i ? "w-7" : "w-2"}`}
              style={{
                background: active === i ? s.color : "rgba(255,255,255,0.18)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const AVATARS = [
  { initial: "A", bg: "#e74c3c" },
  { initial: "M", bg: "#3b82f6" },
  { initial: "R", bg: "#22c55e" },
  { initial: "S", bg: "#f59e0b" },
];

const LandingPage = () => {
  return (
    <PublicLayout>
      {/* ══════════════════════════════════════════
                HERO — full-width background image
            ══════════════════════════════════════════ */}
      <section className="relative flex h-screen items-center overflow-hidden bg-[url(/Image/Backgroundimage.jpg)] bg-cover bg-right-center bg-no-repeat">
        {/* Dark overlay: solid black on left, fades to transparent on right */}

        <div className="absolute inset-0 bg-gradient-to-r from-[#050a14] from-30% via-[rgba(5,10,20,0.85)] via-48% to-transparent" />
        {/* Top fade — dark band behind the navbar */}
        <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-[rgba(5,10,20,0.8)] to-transparent" />

        {/* Content — paddingTop clears the 80px fixed navbar */}
        <div className="relative z-[2] mx-auto w-full max-w-7xl px-10 pt-9">
          <div className="max-w-2xl">
            {/* Heading */}
            <p1 className=" text-2xl text-cyan-100/60">Predict. Plan. Save.</p1>
            <h1 className="my-2 mb-5 text-[clamp(2rem,6vw,3rem)] font-extrabold leading-tight -tracking-wider text-white">
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

      {/* ══════════════════════════════════════════
                DASHBOARD GLIMPSE — screenshot carousel
            ══════════════════════════════════════════ */}
      <section
        id="features"
        className="relative overflow-hidden border-t border-white/5 py-20 px-8 bg-blue-500/10"
      >
        {/* Decorative top line */}
        <div className="absolute top-0 left-1/2 h-px w-96 -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-500/70 to-transparent" />

        {/* Background grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* Left + right edge fade */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[rgba(13,17,22,0.8)] via-transparent to-[rgba(13,17,22,0.8)]" />

        <div className="relative z-[1] mx-auto max-w-5xl">
          {/* Badge + Heading */}
          <div className="mb-12 text-center">
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-cyan-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-500" />
              Live App Preview
            </span>
            <h2 className="my-2  text-[clamp(1.6rem,3vw,2.3rem)] font-extrabold tracking-wider text-white">
              Glimpses of the{" "}
              <span className="bg-gradient-to-r from-cyan-500 to-sky-500 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h2>
            <p className="text-base text-cyan-100/50">
              Real screenshots of the actual running app — nothing simulated.
            </p>
          </div>

          {/* Carousel */}
          <div className="px-4 sm:px-8">
            <ScreenshotCarousel />
          </div>

          {/* Feature pills */}
          <div className="mt-10 flex flex-wrap justify-center gap-2.5">
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
                className="rounded-full px-4 py-1.5 text-sm font-medium text-white/70"
                style={{
                  background: `${color}0f`,
                  border: `1px solid ${color}35`,
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
                TOP 6 FEATURES — 2×3 grid
            ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-24 px-4 sm:px-8 bg-[#030712]">
        {/* Decorative radial glow */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(34,211,238,0.08)_0%,transparent_60%)]" />

        <div className="relative z-[1] mx-auto max-w-6xl">
          {/* Heading */}
          <div className="mb-16 text-center">
            <h2 className="text-4xl lg:text-4xl font-extrabold tracking-tight text-white">
              Everything you need to predict smarter.
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-sm text-[#94A3B8]">
              Powerful AI tools built to help travelers make better booking
              decisions.
            </p>
          </div>

          {/* 3x2 grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                Icon: TrendingUp,
                title: "AI Price Prediction",
                desc: "Predict future flight prices using machine learning trained on real airline data.",
              },
              {
                Icon: CalendarDays,
                title: "Fare Calendar",
                desc: "Compare prices across multiple dates and instantly discover the cheapest day to fly.",
              },
              {
                Icon: Bell,
                title: "Smart Price Alerts",
                desc: "Receive notifications whenever fares drop or unusual price movements are detected.",
              },
              {
                Icon: BrainCircuit,
                title: "AI Explainability",
                desc: "Understand why the model predicted a price using explainable AI and confidence scores.",
              },
              {
                Icon: Globe,
                title: "Route Analytics",
                desc: "Visualize fare trends, route popularity, and historical price movements.",
              },
              {
                Icon: Bookmark,
                title: "Watchlists",
                desc: "Save your favorite routes and monitor prices automatically.",
              },
            ].map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-cyan-400/20 bg-[#111827]/60 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/40 hover:shadow-[0_0_40px_rgba(34,211,238,0.1)]"
              >
                {/* Decorative background pattern */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-20"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 0, rgba(34, 211, 238, 0.1), transparent 40%), radial-gradient(circle at 100% 100%, rgba(56, 189, 248, 0.1), transparent 40%)",
                  }}
                />
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/10 shadow-inner-glow">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B1220] shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                      <Icon size={28} className="text-[#22D3EE]" />
                    </div>
                  </div>

                  {/* Text */}
                  <h3 className="mb-3 text-xl font-bold text-[#F8FAFC]">
                    {title}
                  </h3>
                  <p className="text-base leading-relaxed text-[#94A3B8]">
                    {desc}
                  </p>

                  {/* Bottom link */}
                  <Link
                    to="/working"
                    className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#94A3B8] no-underline transition-colors duration-200 group-hover:text-[#F8FAFC]"
                  >
                    Learn More
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
                STATS BAR
            ══════════════════════════════════════════ */}
      <section className="border-y border-cyan-500/20 bg-blue-600/10 py-14 px-8 rounded-3xl">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 text-center text-[clamp(1.4rem,2.5vw,1.9rem)] font-extrabold tracking-wide text-white ">
            Built on data. Designed for trust.
          </h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-8 text-center ">
            {[
              { stat: "300K+", label: "Real flight records\ntrained on" },
              { stat: "95%+", label: "Prediction accuracy\nin range" },
              { stat: "49 Days", label: "Reliable prediction\nhorizon" },
              { stat: "24/7", label: "Monitoring & anomaly\ndetection" },
            ].map(({ stat, label }) => (
              <div key={stat} className="flex flex-col items-center justify-center gap-1.5 border border-cyan-500/30 bg-gray-900/10 p-4 rounded-lg shadow-lg" >
                <div className="mb-1.5 text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold tracking-wide text-white">
                  {stat}
                </div>
                <div className="whitespace-pre-line text-xs leading-snug text-white/50">
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
      <section className="py-20 px-8">
        <div className="mx-auto max-w-4xl rounded-full border border-cyan-500/30 bg-gradient-to-r from-gray-500/10 to-sky-600/10 p-14 text-center">
          <h2 className="mb-3 text-3xl font-extrabold tracking-wide text-white">
            Ready to see a real price prediction?
          </h2>
          <p className="mx-auto mb-8 max-w-md text-white/55">
            Create a free account and run the live model on any route in
            seconds.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-sky-600 px-8 py-3 text-base font-bold text-white no-underline shadow-lg transition-all duration-200"
            style={{ boxShadow: "0 6px 20px rgba(6,182,212,0.4)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 10px 28px rgba(6,182,212,0.55)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 6px 20px rgba(6,182,212,0.4)";
            }}
          >
            Get Started Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
};

export default LandingPage;
