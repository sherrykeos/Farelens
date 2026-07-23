import React, { useState, useEffect, useMemo } from 'react';
import { Source, Layer, Marker } from 'react-map-gl/maplibre';
import { Plane } from 'lucide-react';
import * as turf from '@turf/turf';
import { COLORS } from './constants';

export default function FlightPath({ origin, destination }) {
  const [animationProgress, setAnimationProgress] = useState(0);

  // Generate Bezier Curve for the flight path (only recalculate if origin/dest change)
  const lineData = useMemo(() => {
    if (!origin || !destination) return null;
    const start = origin.coordinates;
    const end = destination.coordinates;
    const distance = turf.distance(start, end);
    const midpoint = turf.midpoint(start, end);
    const bearing = turf.bearing(start, end);
    const offsetDistance = distance * 0.2;
    const offsetBearing = bearing - 90;
    const controlPoint = turf.destination(midpoint, offsetDistance, offsetBearing);
    const line = turf.lineString([start, controlPoint.geometry.coordinates, end]);
    return turf.bezierSpline(line, { resolution: 10000, sharpness: 0.85 });
  }, [origin, destination]);

  // Calculate airplane position based on animation progress
  const planePoint = useMemo(() => {
    if (!lineData) return null;
    const lineDistance = turf.length(lineData);
    const alongPath = turf.along(lineData, lineDistance * animationProgress);
    const nextAlongPath = turf.along(lineData, lineDistance * Math.min(animationProgress + 0.01, 1));
    const planeBearing = turf.bearing(alongPath, nextAlongPath);
    alongPath.properties.bearing = planeBearing;
    return alongPath;
  }, [lineData, animationProgress]);

  // Animation Loop
  useEffect(() => {
    let animationId;
    let startTimestamp = null;
    const DURATION = 8000; // 8 seconds per flight

    const animate = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = ((timestamp - startTimestamp) % DURATION) / DURATION;
      
      // Easing function for smoother takeoff and landing
      const easeInOutCubic = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      setAnimationProgress(easeInOutCubic);
      animationId = requestAnimationFrame(animate);
    };

    if (origin && destination) {
      animationId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [origin, destination]);

  if (!lineData || !planePoint) return null;

  return (
    <>
      {/* Glow Effect Line */}
      <Source id="route-glow-source" type="geojson" data={lineData}>
        <Layer 
          id="route-glow-layer" 
          type="line" 
          paint={{
            'line-color': COLORS.primary,
            'line-width': 6,
            'line-opacity': 0.2,
            'line-blur': 4
          }} 
        />
      </Source>

      {/* Main Solid Dashed Line */}
      <Source id="route-source" type="geojson" data={lineData}>
        <Layer 
          id="route-layer" 
          type="line" 
          paint={{
            'line-color': COLORS.primary,
            'line-width': 2,
            'line-dasharray': [2, 4],
          }} 
        />
      </Source>

      {/* Airplane Icon */}
      <Marker 
        longitude={planePoint.geometry.coordinates[0]} 
        latitude={planePoint.geometry.coordinates[1]}
        anchor="center"
        style={{ pointerEvents: 'none' }}
      >
        <div 
          style={{ 
            transform: `rotate(${planePoint.properties.bearing}deg)`,
            filter: `drop-shadow(0 0 10px ${COLORS.primaryGlow})`
          }}
          className="text-white bg-transparent"
        >
          <Plane size={24} fill="#FFFFFF" strokeWidth={1} />
        </div>
      </Marker>
    </>
  );
}
