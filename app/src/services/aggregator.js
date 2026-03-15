// src/services/aggregator.js
// Combines all data sources into one normalised array of incidents.
// Add new data sources here — everything else in the app stays the same.

import { fetchFireHotspots, getMockFireData }          from './nasaFirms';
import { fetchWeatherAlerts, getMockWeatherAlerts }    from './openWeather';
import { scoreAllIncidents }                           from './riskEngine';

const USE_MOCK_DATA = true; // ← Set to false once you have real API keys

/**
 * Fetch all emergencies from all sources, score them, and return sorted array.
 * @param {number} userLat
 * @param {number} userLon
 * @returns {Promise<Array>}
 */
export async function fetchAllEmergencies(userLat = -37.8136, userLon = 144.9631) {
  let allIncidents = [];

  if (USE_MOCK_DATA) {
    // ── Mock mode: works without API keys ──────────────────────────────
    allIncidents = [
      ...getMockFireData(),
      ...getMockWeatherAlerts(userLat, userLon),
    ];
  } else {
    // ── Live mode: real API calls ───────────────────────────────────────
    const [fires, weatherAlerts] = await Promise.allSettled([
      fetchFireHotspots(),
      fetchWeatherAlerts(userLat, userLon),
    ]);

    if (fires.status          === 'fulfilled') allIncidents.push(...fires.value);
    if (weatherAlerts.status  === 'fulfilled') allIncidents.push(...weatherAlerts.value);

    // ── Future sources — uncomment to add ──────────────────────────────
    // const gdacs = await fetchGDACS();        // global disasters
    // allIncidents.push(...gdacs);
    // const effis = await fetchEFFIS();        // EU wildfires
    // allIncidents.push(...effis);
  }

  // Score and sort by risk
  return scoreAllIncidents(allIncidents, userLat, userLon);
}
