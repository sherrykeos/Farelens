import React, { useRef, useCallback, useMemo } from 'react';
import Map, { NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { motion, AnimatePresence } from 'framer-motion';

import { INDIAN_AIRPORTS, MAP_STYLE, COLORS, INITIAL_VIEW_STATE } from './constants';
import AirportMarker from './AirportMarker';
import FlightPath from './FlightPath';
import FloatingInfoCard from './FloatingInfoCard';
import * as turf from '@turf/turf';

export default function HeroMap({ 
  searchForm, 
  setSearchForm, 
  prediction, 
  onAction 
}) {
  const mapRef = useRef();
  
  const originAirport = useMemo(() => 
    INDIAN_AIRPORTS.find(a => a.name === searchForm.from || a.iata === searchForm.from),
  [searchForm.from]);

  const destAirport = useMemo(() => 
    INDIAN_AIRPORTS.find(a => a.name === searchForm.to || a.iata === searchForm.to),
  [searchForm.to]);

  const handleAirportClick = useCallback((airport) => {
    // If neither selected or both selected, set origin
    if ((!originAirport && !destAirport) || (originAirport && destAirport)) {
      setSearchForm(prev => ({ ...prev, from: airport.name, to: '' }));
      mapRef.current?.getMap()?.flyTo({
        center: airport.coordinates,
        zoom: 6,
        pitch: 45,
        duration: 2000,
        essential: true
      });
    } 
    // If origin selected but no dest, set dest
    else if (originAirport && !destAirport && airport.iata !== originAirport.iata) {
      setSearchForm(prev => ({ ...prev, to: airport.name }));
      
      // Calculate bounding box for both airports
      const line = turf.lineString([originAirport.coordinates, airport.coordinates]);
      const bbox = turf.bbox(line);
      
      mapRef.current?.getMap()?.fitBounds(
        [[bbox[0], bbox[1]], [bbox[2], bbox[3]]],
        { padding: 100, pitch: 40, duration: 2500, essential: true }
      );
    }
  }, [originAirport, destAirport, setSearchForm]);

  const onMapLoad = useCallback((e) => {
    const map = e.target;
    const layers = map.getStyle().layers;
    if (layers) {
      layers.forEach(layer => {
        if (layer.type === 'symbol') {
          if (layer['source-layer'] === 'place') {
            const currentFilter = map.getFilter(layer.id);
            const newFilter = currentFilter 
              ? ['all', currentFilter, ['==', 'iso_a2', 'IN']]
              : ['==', 'iso_a2', 'IN'];
            map.setFilter(layer.id, newFilter);
          } else {
            map.setLayoutProperty(layer.id, 'visibility', 'none');
          }
        }
      });
    }
  }, []);

  return (
    <div className="relative w-full h-[600px] lg:h-[700px] rounded-3xl overflow-hidden shadow-2xl border border-[rgba(255,255,255,.05)]">
      {/* Background Gradient (acts as sky/space behind map) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#000000] to-[#030712] pointer-events-none" />

      <Map
        ref={mapRef}
        initialViewState={INITIAL_VIEW_STATE}
        mapStyle={MAP_STYLE}
        onLoad={onMapLoad}
        attributionControl={false}
        interactiveLayerIds={[]} // Disable native clicking to prevent clutter
        dragRotate={true}
        maxPitch={60}
        minZoom={3}
        maxZoom={12}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        {/* Airport Markers */}
        {INDIAN_AIRPORTS.map(airport => (
          <AirportMarker
            key={airport.iata}
            airport={airport}
            isSelected={originAirport?.iata === airport.iata || destAirport?.iata === airport.iata}
            isOrigin={originAirport?.iata === airport.iata}
            onClick={handleAirportClick}
          />
        ))}

        {/* Flight Route Animation */}
        {originAirport && destAirport && (
           <FlightPath origin={originAirport} destination={destAirport} />
        )}

        {/* Zoom & Orientation controls */}
        <NavigationControl position="bottom-right" visualizePitch={true} />
      </Map>

      {/* Subtle UI Gradients to frame the map */}
      <div className="absolute inset-0 pointer-events-none rounded-3xl shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#030712] to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#030712] to-transparent pointer-events-none" />

      {/* Map Controls Info Icon */}
      <div className="absolute bottom-6 left-6 z-30 group cursor-help">
        <div className="w-8 h-8 rounded-full bg-[#0F172A]/80 backdrop-blur-sm border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#94A3B8] shadow-lg transition-colors group-hover:text-[#22D3EE] group-hover:border-[#22D3EE]/50">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="M12 8h.01"></path>
          </svg>
        </div>
        <div className="absolute bottom-full left-0 mb-3 w-56 p-3 rounded-lg bg-[#0F172A] border border-[rgba(255,255,255,0.1)] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-40 pointer-events-none">
          <p className="font-semibold mb-2 text-[#22D3EE] text-xs uppercase tracking-wider">Map Rotation</p>
          <ul className="space-y-2 text-xs text-[#94A3B8]">
            <li><strong className="text-white">Desktop:</strong> Shift + Arrow keys, or Right-Click & Drag</li>
            <li><strong className="text-white">Mobile:</strong> Two-finger twist & drag</li>
          </ul>
        </div>
      </div>

      {/* Floating UI Card - Hidden on Mobile */}
      <div className="absolute right-6 top-6 bottom-6 z-20 pointer-events-none hidden lg:flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <FloatingInfoCard 
            prediction={(originAirport && destAirport) ? prediction : null} 
            onAction={onAction}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
