import React, { useState } from "react";
import { Marker } from "react-map-gl/maplibre";
import { motion, AnimatePresence } from "framer-motion";
import { COLORS } from "./constants";

export default function AirportMarker({ airport, isSelected, isOrigin, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Marker
      longitude={airport.coordinates[0]}
      latitude={airport.coordinates[1]}
      anchor="center"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick(airport);
      }}
    >
      <div 
        className="relative flex items-center justify-center cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Hover / Selected Outer Glow */}
        <AnimatePresence>
          {(isHovered || isSelected) && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute w-12 h-12 rounded-full"
              style={{
                background: `radial-gradient(circle, ${COLORS.primaryGlow} 0%, transparent 70%)`
              }}
            />
          )}
        </AnimatePresence>

        {/* Pulse Animation */}
        {isSelected && (
          <div className="absolute w-6 h-6 rounded-full bg-[#22D3EE]/30 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
        )}

        {/* Core Dot */}
        <div 
          className={`relative z-10 rounded-full transition-all duration-300 ${
            isSelected 
              ? "w-3 h-3 bg-white shadow-[0_0_15px_#ffffff]" 
              : "w-2 h-2 bg-[#22D3EE] shadow-[0_0_8px_#22D3EE]"
          }`} 
        />

        {/* Airport Code Tooltip */}
        <AnimatePresence>
          {(isHovered || isSelected) && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: -25 }}
              exit={{ opacity: 0, y: 0 }}
              className="absolute whitespace-nowrap px-2 py-1 bg-[#0F172A]/90 backdrop-blur-sm border border-[rgba(255,255,255,.1)] rounded text-xs font-bold text-white shadow-lg pointer-events-none"
            >
              {airport.iata}
              {isSelected && (
                <span className="block text-[9px] font-medium text-[#94A3B8] uppercase mt-0.5">
                  {isOrigin ? "Departure" : "Arrival"}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Marker>
  );
}
