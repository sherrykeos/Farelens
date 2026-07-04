import React, { useState } from 'react';
import PublicLayout from './Footer';
import { 
  Database, 
  Cpu, 
  LineChart, 
  TrendingUp, 
  Layers, 
  Search, 
  Gauge, 
  Activity, 
  ShieldAlert, 
  Server,
  Cloud,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WorkingPage = () => {
  const [activeStep, setActiveStep] = useState(0);

  const pipelineSteps = [
    {
      id: 0,
      phase: "01. INPUT DATA",
      title: "Search & Route Selection",
      shortDesc: "Pick your origin, destination, class, and lead time.",
      detailedDesc: "Define your travel route, select your preferred airlines, cabin class, flight duration, and booking lead time. These inputs are processed instantly to form the prediction feature matrix.",
      icon: Database,
      color: "from-cyan-500 to-blue-500",
      glowColor: "rgba(6, 182, 212, 0.15)",
      techs: ["Dynamic Inputs", "Feature Extraction", "Route Parameters"]
    },
    {
      id: 1,
      phase: "02. FARE FORECASTING",
      title: "Real-time AI Prediction",
      shortDesc: "Scores the route query in milliseconds.",
      detailedDesc: "The API processes the input parameters through our trained XGBoost Regressor model. It calculates the predicted ticket price and computes high/low confidence boundaries using error-metric evaluation.",
      icon: Cpu,
      color: "from-blue-500 to-indigo-500",
      glowColor: "rgba(59, 130, 246, 0.15)",
      techs: ["XGBoost Regressor", "Out-of-Distribution Check", "FastAPI Backend"]
    },
    {
      id: 2,
      phase: "03. EXPLAINABILITY ENGINE",
      title: "SHAP Attribute Analysis",
      shortDesc: "Explains exactly why the fare changed.",
      detailedDesc: "FareLens runs local SHAP (SHapley Additive exPlanations) algorithms to break down the exact mathematical impact of each input parameter. You see exactly how much every feature (like stops or carrier choice) pushed the price up or down.",
      icon: LineChart,
      color: "from-indigo-500 to-purple-500",
      glowColor: "rgba(99, 102, 241, 0.15)",
      techs: ["SHAP Explainer", "Waterfall Analysis", "Attribution Scoring"]
    },
    {
      id: 3,
      phase: "04. LIVE FARE TRACKING",
      title: "Watchlists & Alerts",
      shortDesc: "Monitors fares and alerts you on drops.",
      detailedDesc: "Save the flight route to your personal watchlist to initiate background monitoring. Our system runs automated schedules to check for price dips, triggering instant alerts when fares drop.",
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500",
      glowColor: "rgba(168, 85, 247, 0.15)",
      techs: ["Background Scheduler", "Price History Logs", "Alert Notification Rules"]
    }
  ];

  const modelSpecs = [
    {
      title: "Price Regression Engine",
      subtitle: "XGBoost Regressor",
      metric: "RMSE <$15",
      metricLabel: "Average Prediction Variance",
      desc: "Computes the exact projected price for the selected flight route. It analyzes seasonality, booking lead time, historical patterns, and route demand to output a precise numerical price forecast.",
      icon: Gauge,
      accent: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5"
    },
    {
      title: "Demand & Occupancy Classifier",
      subtitle: "LightGBM + XGBoost",
      metric: "85%+",
      metricLabel: "Classification Accuracy",
      desc: "Forecasts flight capacity limits and demand levels. It categorizes whether seats will sell out fast, allowing us to compute wait-versus-buy urgency recommendations.",
      icon: Activity,
      accent: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
    },
    {
      title: "Anomaly & Glitch Detector",
      subtitle: "Isolation Forest",
      metric: "90%+",
      metricLabel: "Surge Detection Precision",
      desc: "Scans real-time ticket streams to isolate error fares, sudden pricing glitches, or massive price anomalies, flagging instant alerts for users before airlines correct them.",
      icon: ShieldAlert,
      accent: "text-rose-400 border-rose-500/20 bg-rose-500/5"
    }
  ];

  return (
    <PublicLayout>
      <div className="relative bg-[#030712] overflow-hidden min-h-screen text-slate-100 pb-24">
        
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-[700px] h-[700px] bg-purple-900/5 rounded-full blur-[140px] pointer-events-none" />
        
        {/* Hero Section */}
        <section className="relative pt-32 pb-16 px-4 sm:px-8 max-w-6xl mx-auto text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-cyan-400 backdrop-blur-md">
            The Technology Stack
          </span>
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold tracking-tight text-white mb-6 leading-none">
            How <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400">FareLens</span> Works
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Combining real-time cloud data pipelines with advanced machine learning ensembles to forecast airline pricing with industry-leading precision.
          </p>
        </section>

        {/* Data Pipeline Pipeline Interactive Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Real-time Data Pipeline</h2>
            <p className="text-sm text-slate-400">Interact with the phases below to explore how flight data transitions from ingestion to prediction.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Step selector */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {pipelineSteps.map((step) => {
                const Icon = step.icon;
                const isSelected = activeStep === step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                      isSelected 
                        ? 'bg-[#0F172A] border-cyan-500/30 shadow-[0_4px_20px_-5px_rgba(6,182,212,0.15)]' 
                        : 'bg-[#0A0F1D]/60 border-white/5 hover:border-white/10 hover:bg-[#0B1122]/80'
                    }`}
                  >
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${step.color} text-white shrink-0`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold tracking-wider text-cyan-400 block mb-1">{step.phase}</span>
                      <h3 className="text-base font-bold text-white mb-1">{step.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-1">{step.shortDesc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Display pane */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="relative rounded-3xl bg-[#090D1A] border border-white/10 p-8 sm:p-10 min-h-[380px] overflow-hidden flex flex-col justify-between"
                  style={{
                    boxShadow: `0 20px 50px -10px ${pipelineSteps[activeStep].glowColor}`
                  }}
                >
                  {/* Decorative glowing gradient backdrop */}
                  <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${pipelineSteps[activeStep].color} opacity-5 rounded-full blur-[80px] pointer-events-none`} />
                  
                  <div>
                    <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase">
                      Detailed Architecture
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 mb-4">
                      {pipelineSteps[activeStep].title}
                    </h3>
                    <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
                      {pipelineSteps[activeStep].detailedDesc}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Technologies Involved
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {pipelineSteps[activeStep].techs.map((tech) => (
                        <span 
                          key={tech} 
                          className="px-3.5 py-1.5 rounded-lg border border-white/5 bg-[#0F172A] text-xs font-semibold text-slate-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Explainable AI & SHAP */}
        <section className="max-w-6xl mx-auto px-4 sm:px-8 py-16">
          <div className="relative rounded-3xl bg-gradient-to-b from-[#0F172A]/80 to-transparent border border-white/5 p-8 sm:p-12 overflow-hidden">
            {/* Visual glow decoration */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-purple-500/10 rounded-full blur-[90px] pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7">
                <span className="mb-3 inline-block rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-400">
                  Explainable AI (XAI)
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
                  Why is the price changing? <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">We explain it with SHAP.</span>
                </h2>
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
                  Traditional ML models act as black boxes, giving predictions without explanation. FareLens solves this by running SHAP (SHapley Additive exPlanations) algorithms. We break down the mathematical contribution of every feature—such as historical demand, day-of-week seasonality, and carrier premiums—showing you exactly what factor is pulling the price up or pushing it down.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex gap-2.5 items-start">
                    <CheckCircle2 size={16} className="text-purple-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Full Transparency</h4>
                      <p className="text-xs text-slate-500">No hidden logic. See how seasonality affects your route.</p>
                    </div>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <CheckCircle2 size={16} className="text-purple-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Feature Weighting</h4>
                      <p className="text-xs text-slate-500">Know exactly if it is the carrier premium causing a surge.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Symbolic visual of features */}
              <div className="md:col-span-5 flex flex-col gap-3.5 p-6 rounded-2xl bg-[#090D1A] border border-white/10">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-white/5 pb-2">
                  Prediction Factor Breakdown
                </h4>
                {[
                  { name: "Day of Week Seasonality", val: "+$34.20", type: "up" },
                  { name: "Historical Carrier Margin", val: "-$12.50", type: "down" },
                  { name: "Remaining Flight Seats", val: "+$45.10", type: "up" },
                  { name: "Destination Airport Popularity", val: "-$5.30", type: "down" }
                ].map((item) => (
                  <div key={item.name} className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">{item.name}</span>
                    <span className={`font-bold px-2 py-0.5 rounded ${
                      item.type === 'up' ? 'text-rose-400 bg-rose-500/10' : 'text-emerald-400 bg-emerald-500/10'
                    }`}>
                      {item.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Model Specifications Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Model Architectural Layers</h2>
            <p className="text-sm text-slate-400">Our predictive suite comprises three dedicated modeling algorithms working in tandem.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modelSpecs.map((spec) => {
              const Icon = spec.icon;
              return (
                <div 
                  key={spec.title} 
                  className="rounded-2xl border border-white/5 bg-[#0A0F1D]/80 p-6 flex flex-col justify-between hover:border-white/10 transition-all duration-300"
                >
                  <div>
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${spec.accent}`}>
                      <Icon size={20} />
                    </div>
                    <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase block mb-1">
                      {spec.subtitle}
                    </span>
                    <h3 className="text-lg font-bold text-white mb-3">{spec.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-6">
                      {spec.desc}
                    </p>
                  </div>

                  <div className="border-t border-white/5 pt-4">
                    <span className="text-2xl font-black text-white tracking-tight">{spec.metric}</span>
                    <span className="block text-[10px] text-slate-500 uppercase font-semibold mt-1">
                      {spec.metricLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </PublicLayout>
  );
};

export default WorkingPage;
