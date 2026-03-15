// src/services/nasaFirms.js
// Fetches real fire hotspot data from NASA FIRMS (free API)
// Docs: https://firms.modaps.eosdis.nasa.gov/api/

import axios from 'axios';
import { NASA_FIRMS_KEY } from '@env';

// Bounding box for Australia — change for other regions
const AU_BBOX = '112,-44,154,-10'; // lon_min,lat_min,lon_max,lat_max

/**
 * Fetch fire hotspots from the past 24 hours
 * Returns array of normalised incident objects
 */
export async function fetchFireHotspots() {
  try {
    // NASA FIRMS CSV endpoint
    const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${NASA_FIRMS_KEY}/VIIRS_SNPP_NRT/${AU_BBOX}/1`;
    const { data } = await axios.get(url, { timeout: 10000 });

    const rows = parseCSV(data);

    // Group nearby hotspots into single incidents (within ~10km)
    const clusters = clusterHotspots(rows);

    return clusters.map((cluster, index) => ({
      id:          `fire-${cluster.lat.toFixed(3)}-${cluster.lon.toFixed(3)}`,
      type:        'fire',
      name:        `Bushfire — ${cluster.region}`,
      lat:         cluster.lat,
      lon:         cluster.lon,
      intensity:   Math.min(1, cluster.avgBrightness / 380), // normalise brightness temp
      radiusKm:    Math.max(5, cluster.count * 2),            // bigger cluster = bigger radius
      hotspotCount: cluster.count,
      source:      'NASA FIRMS (VIIRS)',
      updatedAt:   new Date().toISOString(),
    }));

  } catch (err) {
    console.warn('[NASA FIRMS] Failed to fetch:', err.message);
    return getMockFireData(); // fall back to mock data so app still works
  }
}

// ── CSV parser ────────────────────────────────────────────────────────────
function parseCSV(csv) {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return Object.fromEntries(headers.map((h, i) => [h, values[i]?.trim()]));
  });
}

// ── Simple grid clustering ────────────────────────────────────────────────
function clusterHotspots(rows) {
  const gridSize = 0.1; // ~10km grid cells
  const grid     = {};

  rows.forEach(row => {
    const lat = parseFloat(row.latitude);
    const lon = parseFloat(row.longitude);
    if (isNaN(lat) || isNaN(lon)) return;

    const key = `${Math.floor(lat / gridSize)},${Math.floor(lon / gridSize)}`;
    if (!grid[key]) grid[key] = { lat: 0, lon: 0, count: 0, brightness: 0 };
    grid[key].lat        += lat;
    grid[key].lon        += lon;
    grid[key].count      += 1;
    grid[key].brightness += parseFloat(row.bright_ti4 || row.brightness || 330);
  });

  return Object.values(grid).map(cell => ({
    lat:           cell.lat / cell.count,
    lon:           cell.lon / cell.count,
    count:         cell.count,
    avgBrightness: cell.brightness / cell.count,
    region:        'AU', // enhance later with reverse geocoding
  }));
}

// ── Mock data — used when API key not yet set ─────────────────────────────
export function getMockFireData() {
  return [
    { id: 'fire-mock-1', type: 'fire', name: 'Gippsland Complex Fire',   lat: -37.8, lon: 147.2, intensity: 0.92, radiusKm: 38, source: 'Mock', updatedAt: new Date().toISOString() },
    { id: 'fire-mock-2', type: 'fire', name: 'East Gippsland Spot Fire', lat: -37.5, lon: 148.3, intensity: 0.30, radiusKm: 10, source: 'Mock', updatedAt: new Date().toISOString() },
  ];
}
