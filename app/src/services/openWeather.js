// src/services/openWeather.js
// Fetches storm, flood, and heatwave alerts from OpenWeatherMap
// Docs: https://openweathermap.org/api/one-call-3

import axios from 'axios';
import { OPENWEATHER_KEY } from '@env';

/**
 * Fetch weather alerts for a given lat/lon
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<Array>} normalised incident objects
 */
export async function fetchWeatherAlerts(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/3.0/onecall` +
      `?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_KEY}` +
      `&exclude=minutely,hourly,daily&units=metric`;

    const { data } = await axios.get(url, { timeout: 10000 });

    if (!data.alerts || data.alerts.length === 0) return [];

    return data.alerts.map((alert, index) => ({
      id:          `wx-${alert.start}-${index}`,
      type:        classifyAlertType(alert.event),
      name:        alert.event,
      lat,
      lon,
      radiusKm:    60,
      intensity:   severityToIntensity(alert.tags),
      description: alert.description,
      source:      alert.sender_name || 'OpenWeatherMap',
      startsAt:    new Date(alert.start * 1000).toISOString(),
      endsAt:      new Date(alert.end   * 1000).toISOString(),
      updatedAt:   new Date().toISOString(),
    }));

  } catch (err) {
    console.warn('[OpenWeather] Failed to fetch:', err.message);
    return getMockWeatherAlerts(lat, lon);
  }
}

// ── Classify alert type from event name ──────────────────────────────────
function classifyAlertType(eventName) {
  const name = (eventName || '').toLowerCase();
  if (name.includes('fire') || name.includes('heat') || name.includes('hot')) return 'heatwave';
  if (name.includes('flood') || name.includes('rain'))                         return 'flood';
  if (name.includes('storm') || name.includes('thunder') || name.includes('wind') || name.includes('cyclone')) return 'storm';
  return 'default';
}

// ── Map OpenWeather severity tags → 0–1 intensity ─────────────────────────
function severityToIntensity(tags = []) {
  if (tags.includes('Extreme'))  return 0.95;
  if (tags.includes('Severe'))   return 0.75;
  if (tags.includes('Moderate')) return 0.50;
  return 0.30;
}

// ── Mock data for development ──────────────────────────────────────────────
export function getMockWeatherAlerts(lat = -37.8, lon = 144.9) {
  return [
    {
      id: 'wx-mock-1', type: 'flood', name: 'Murray River Flooding',
      lat: -36.0, lon: 144.8, radiusKm: 40, intensity: 0.85,
      description: 'Major flooding expected along the Murray River system. Residents in low-lying areas should evacuate.',
      source: 'BOM (Mock)', updatedAt: new Date().toISOString(),
    },
    {
      id: 'wx-mock-2', type: 'storm', name: 'Severe Thunderstorm Warning',
      lat: -38.1, lon: 145.1, radiusKm: 55, intensity: 0.60,
      description: 'Severe thunderstorms with large hail and damaging winds forecast.',
      source: 'BOM (Mock)', updatedAt: new Date().toISOString(),
    },
    {
      id: 'wx-mock-3', type: 'heatwave', name: 'Wimmera Heatwave',
      lat: -36.7, lon: 142.5, radiusKm: 80, intensity: 0.55,
      description: 'Extreme heat conditions with temperatures forecast to exceed 43°C.',
      source: 'BOM (Mock)', updatedAt: new Date().toISOString(),
    },
  ];
}
