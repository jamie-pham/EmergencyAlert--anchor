// src/constants/index.js
// Central place for all app-wide constants

export const EMERGENCY_TYPES = {
  fire:     { label: 'Bushfire',  icon: '🔥', color: '#ef4444', bgColor: 'rgba(239,68,68,0.15)'  },
  flood:    { label: 'Flood',     icon: '🌊', color: '#3b82f6', bgColor: 'rgba(59,130,246,0.15)' },
  storm:    { label: 'Storm',     icon: '⛈',  color: '#a855f7', bgColor: 'rgba(168,85,247,0.15)' },
  heatwave: { label: 'Heatwave',  icon: '🌡', color: '#f97316', bgColor: 'rgba(249,115,22,0.15)' },
  earthquake:{ label: 'Earthquake',icon: '🌍', color: '#eab308', bgColor: 'rgba(234,179,8,0.15)' },
  default:  { label: 'Alert',     icon: '⚠️', color: '#6b7280', bgColor: 'rgba(107,114,128,0.15)'},
};

export const RISK_LEVELS = {
  HIGH: { label: 'HIGH',   color: '#ef4444', bgColor: 'rgba(239,68,68,0.15)',  textColor: '#f87171' },
  MED:  { label: 'MEDIUM', color: '#f97316', bgColor: 'rgba(249,115,22,0.15)', textColor: '#fb923c' },
  LOW:  { label: 'LOW',    color: '#eab308', bgColor: 'rgba(234,179,8,0.15)',  textColor: '#fbbf24' },
};

// Default map region — centred on Melbourne, AU
// Change this to your target region
export const DEFAULT_REGION = {
  latitude:      -37.8136,
  longitude:     144.9631,
  latitudeDelta:  6.0,
  longitudeDelta: 6.0,
};

// Risk thresholds — tune these to adjust sensitivity
export const RISK_THRESHOLDS = {
  HIGH_SCORE:     0.60,   // score >= this = HIGH
  MED_SCORE:      0.30,   // score >= this = MED, below = LOW
  NEARBY_KM:      50,     // within 50km = proximity boost
  CRITICAL_KM:    20,     // within 20km = send push notification
};

// How often to refresh data (milliseconds)
export const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // every 5 minutes

// EU expansion — add regions here to support new areas
export const SUPPORTED_REGIONS = [
  { id: 'AU', label: 'Australia', bounds: { minLat: -44, maxLat: -10, minLon: 112, maxLon: 154 } },
  // { id: 'EU', label: 'Europe', bounds: { minLat: 35, maxLat: 72, minLon: -25, maxLon: 45 } },
];
