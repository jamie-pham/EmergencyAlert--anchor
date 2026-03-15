// src/services/riskEngine.js
// Calculates HIGH / MED / LOW risk for each incident
// based on distance, intensity, and emergency type.

import { RISK_THRESHOLDS } from '../constants';

// ── Haversine distance (km) ────────────────────────────────────────────────
function haversineKm(lat1, lon1, lat2, lon2) {
  const R    = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Type severity weights ──────────────────────────────────────────────────
const TYPE_WEIGHT = {
  fire:       1.00,
  flood:      0.90,
  storm:      0.75,
  heatwave:   0.65,
  earthquake: 0.85,
  default:    0.50,
};

// ── Main function ──────────────────────────────────────────────────────────
/**
 * @param {object} incident  - { lat, lon, type, intensity (0–1) }
 * @param {number} userLat
 * @param {number} userLon
 * @returns {{ score: number, level: 'HIGH'|'MED'|'LOW', distanceKm: number }}
 */
export function calculateRisk(incident, userLat, userLon) {
  const distKm = haversineKm(userLat, userLon, incident.lat, incident.lon);

  const typeWeight  = TYPE_WEIGHT[incident.type] ?? TYPE_WEIGHT.default;
  const intensity   = Math.min(1, Math.max(0, incident.intensity ?? 0.5));

  // Proximity score — drops off over 200km
  const proxScore = Math.max(0, 1 - distKm / 200);

  // Weighted combined score
  const score = (proxScore * 0.50) + (intensity * 0.35) + (typeWeight * 0.15);

  const level =
    score >= RISK_THRESHOLDS.HIGH_SCORE ? 'HIGH' :
    score >= RISK_THRESHOLDS.MED_SCORE  ? 'MED'  : 'LOW';

  return {
    score:      Math.round(score * 100) / 100,
    level,
    distanceKm: Math.round(distKm),
    shouldNotify: distKm <= RISK_THRESHOLDS.CRITICAL_KM && level === 'HIGH',
  };
}

// ── Batch score all incidents ──────────────────────────────────────────────
export function scoreAllIncidents(incidents, userLat, userLon) {
  return incidents
    .map(inc => {
      const risk = calculateRisk(inc, userLat, userLon);
      return { ...inc, risk: risk.level, riskScore: risk.score, distanceKm: risk.distanceKm, shouldNotify: risk.shouldNotify };
    })
    .sort((a, b) => b.riskScore - a.riskScore); // highest risk first
}
