export const INDIAN_AIRPORTS = [
  { name: "Delhi", iata: "DEL", coordinates: [77.1025, 28.5562] },
  { name: "Mumbai", iata: "BOM", coordinates: [72.8656, 19.0902] },
  { name: "Bengaluru", iata: "BLR", coordinates: [77.7066, 13.1986] },
  { name: "Hyderabad", iata: "HYD", coordinates: [78.4294, 17.2403] },
  { name: "Chennai", iata: "MAA", coordinates: [80.1705, 12.9716] },
  { name: "Kolkata", iata: "CCU", coordinates: [88.4467, 22.6520] },
  { name: "Ahmedabad", iata: "AMD", coordinates: [72.6346, 23.0734] },
  { name: "Pune", iata: "PNQ", coordinates: [73.9197, 18.5793] },
  { name: "Kochi", iata: "COK", coordinates: [76.4019, 10.1520] },
  { name: "Goa (Mopa)", iata: "GOX", coordinates: [73.8607, 15.7294] },
  { name: "Goa (Dabolim)", iata: "GOI", coordinates: [73.8313, 15.3808] },
  { name: "Jaipur", iata: "JAI", coordinates: [75.8122, 26.8242] },
  { name: "Lucknow", iata: "LKO", coordinates: [80.8893, 26.7606] },
  { name: "Amritsar", iata: "ATQ", coordinates: [74.7973, 31.7096] },
  { name: "Ludhiana", iata: "LUH", coordinates: [75.9526, 30.8547] },
  { name: "Chandigarh", iata: "IXC", coordinates: [76.7885, 30.6735] },
   { name: "Dehradun", iata: "DED", coordinates: [78.1803, 30.1897] },
  { name: "Srinagar", iata: "SXR", coordinates: [74.7743, 33.9871] },
  { name: "Indore", iata: "IDR", coordinates: [75.8011, 22.7218] },
  { name: "Nagpur", iata: "NAG", coordinates: [79.0472, 21.0922] },
  { name: "Bhubaneswar", iata: "BBI", coordinates: [85.8178, 20.2444] },
  { name: "Visakhapatnam", iata: "VTZ", coordinates: [83.2245, 17.7212] },
  { name: "Coimbatore", iata: "CJB", coordinates: [77.0434, 11.0300] },
  { name: "Thiruvananthapuram", iata: "TRV", coordinates: [76.9201, 8.4821] },
  { name: "Calicut", iata: "CCJ", coordinates: [75.9553, 11.1368] },
  { name: "Patna", iata: "PAT", coordinates: [85.0880, 25.5913] },
  { name: "Ranchi", iata: "IXR", coordinates: [85.3217, 23.3143] },
  { name: "Shillong", iata: "SHL", coordinates: [91.9787, 25.7036] },
  { name: "Deoghar", iata: "DGH", coordinates: [86.7130, 24.4460] },
  { name: "Guwahati", iata: "GAU", coordinates: [91.5859, 26.1061] },
  { name: "Varanasi", iata: "VNS", coordinates: [82.8593, 25.4524] },
  { name: "Jammu", iata: "IXJ", coordinates: [74.8389, 32.6891] },
  { name: "Leh", iata: "IXL", coordinates: [77.5465, 34.1359] },
];

// Carto Dark Matter (no API key required)
export const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

export const COLORS = {
  ocean: "#030712", // Very dark navy
  land: "#0F172A", // Deep graphite
  indiaFill: "rgba(34, 211, 238, 0.05)",
  indiaBorder: "rgba(34, 211, 238, 0.4)",
  primary: "#22D3EE",
  primaryGlow: "rgba(34, 211, 238, 0.6)",
  text: "#F8FAFC",
  textMuted: "#94A3B8"
};

export const INITIAL_VIEW_STATE = {
  longitude: 80,
  latitude: 22,
  zoom: 3.8, // Show entire India with surrounding countries
  pitch: 35, // Cinematic tilt
  bearing: 0,
};
