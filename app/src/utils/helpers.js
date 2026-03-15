// src/utils/helpers.js
// Shared utility functions used across the app.

/**
 * Format a date as a human-readable "time ago" string.
 * e.g. "just now", "5m ago", "2h ago"
 */
export function timeAgo(date) {
  if (!date) return 'unknown';
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Format a distance in km, with rounding.
 * e.g. 0.4 → "400 m", 1.2 → "1.2 km", 45 → "45 km"
 */
export function formatDistance(km) {
  if (km < 1)   return `${Math.round(km * 1000)} m`;
  if (km < 10)  return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

/**
 * Capitalise the first letter of a string.
 */
export function capitalise(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
