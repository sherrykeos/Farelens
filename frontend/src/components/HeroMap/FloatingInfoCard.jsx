import React from "react";
import { motion } from "framer-motion";
import { Plane, TrendingDown, ArrowRight, Compass } from "lucide-react";
import { panelVariants, containerVariants, itemVariants } from "./animations";

export default function FloatingInfoCard({ prediction, onAction }) {
  if (!prediction) {
    return (
      <motion.div
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:bottom-auto lg:top-6 lg:left-6 z-20 w-[90%] lg:w-[360px] bg-[#0F172A]/80 backdrop-blur-xl border border-[rgba(255,255,255,.08)] rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-center text-center gap-3"
      >
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-2">
          <Compass size={24} className="text-[#94A3B8]" />
        </div>
        <h3 className="text-lg font-bold text-[#F8FAFC]">Choose your departure</h3>
        <p className="text-sm text-[#94A3B8]">
          Select an origin and destination to see AI predictions and simulated flight routes.
        </p>
      </motion.div>
    );
  }

  const { route, currentFare, predictedFare, confidence, recommendation, expectedDropDays } = prediction;
  const dropPercentage = Math.round(((currentFare - predictedFare) / currentFare) * 100);

  return (
    <motion.div
      variants={panelVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute bottom-6 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:bottom-auto lg:top-6 lg:left-6 z-20 w-[90%] lg:w-[360px] bg-[#0F172A]/85 backdrop-blur-2xl border border-[rgba(255,255,255,.1)] rounded-3xl p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#22D3EE]/10 flex items-center justify-center">
            <TrendingDown size={16} className="text-[#22D3EE]" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">AI Prediction</span>
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {confidence}% Confidence
        </span>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <motion.h3 variants={itemVariants} className="text-xl font-bold mb-5 flex items-center gap-3 text-[#F8FAFC]">
          {route.from} 
          <Plane size={16} className="text-[#94A3B8] opacity-50" /> 
          {route.to}
        </motion.h3>

        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 mb-5">
          <div className="space-y-1">
            <p className="text-xs font-medium text-[#94A3B8]">Current Fare</p>
            <p className="text-2xl font-bold text-[#F8FAFC]">₹{currentFare.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-[#94A3B8]">Predicted Fare</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold text-[#22D3EE]">₹{predictedFare.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="p-4 rounded-xl bg-white/5 border border-white/5 mb-6 relative overflow-hidden">
          {/* Subtle shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#22D3EE]/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
          
          <div className="flex items-center justify-between mb-2 relative z-10">
            <p className="text-sm font-medium text-[#94A3B8]">Recommendation</p>
            <p className="text-sm font-bold text-[#22D3EE]">{recommendation}</p>
          </div>
          <p className="text-xs text-[#94A3B8] relative z-10 leading-relaxed">
            Prices expected to drop by <span className="text-emerald-400 font-semibold bg-emerald-400/10 px-1 rounded">▼{dropPercentage}%</span> within {expectedDropDays} days.
          </p>
        </motion.div>

        <motion.button
          variants={itemVariants}
          onClick={onAction}
          className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-[#F8FAFC] py-3.5 rounded-xl bg-white/5 border border-[rgba(255,255,255,.08)] hover:bg-white/10 hover:border-[#22D3EE]/30 transition-all active:scale-95 group"
        >
          View Full Analysis 
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
