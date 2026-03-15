// src/screens/MapScreen.js
// Main screen — shows the map with colour-coded emergency markers
// and a bottom sheet list of active incidents.

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, RefreshControl, ActivityIndicator,
  Platform, SafeAreaView,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';

import useEmergencyStore        from '../store/useEmergencyStore';
import { fetchAllEmergencies }  from '../services/aggregator';
import { sendLocalEmergencyAlert, addNotificationResponseListener } from '../notifications/pushHandler';
import { EMERGENCY_TYPES, DEFAULT_REGION, REFRESH_INTERVAL_MS } from '../constants';
import EmergencyMarker from '../components/EmergencyMarker';
import AlertCard       from '../components/AlertCard';

export default function MapScreen({ navigation }) {
  const mapRef  = useRef(null);
  const [refreshing, setRefreshing] = useState(false);

  const {
    incidents, userLocation, selectedId, filter,
    isLoading, lastUpdated, error,
    setIncidents, setUserLocation, setSelectedId, setFilter, setLoading, setError,
    getFilteredIncidents, getStatsCounts,
  } = useEmergencyStore();

  // ── Load location + data ──────────────────────────────────────────────
  const loadData = useCallback(async (lat, lon) => {
    setLoading(true);
    try {
      const data = await fetchAllEmergencies(lat, lon);
      setIncidents(data);

      // Fire push notifications for HIGH risk nearby incidents
      data.filter(i => i.shouldNotify).forEach(inc => {
        sendLocalEmergencyAlert(inc).catch(console.warn);
      });
    } catch (err) {
      setError('Could not load emergency data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      // Get user location
      const { status } = await Location.requestForegroundPermissionsAsync();
      let lat = DEFAULT_REGION.latitude;
      let lon = DEFAULT_REGION.longitude;

      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        lat = loc.coords.latitude;
        lon = loc.coords.longitude;
        setUserLocation({ latitude: lat, longitude: lon });
      }

      await loadData(lat, lon);
    })();

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      const loc = useEmergencyStore.getState().userLocation;
      if (loc) loadData(loc.latitude, loc.longitude);
    }, REFRESH_INTERVAL_MS);

    // Handle notification taps
    const sub = addNotificationResponseListener(incidentId => {
      setSelectedId(incidentId);
      const inc = useEmergencyStore.getState().incidents.find(i => i.id === incidentId);
      if (inc) navigation.navigate('Detail', { incident: inc });
    });

    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, []);

  // ── Pull-to-refresh ───────────────────────────────────────────────────
  const onRefresh = async () => {
    setRefreshing(true);
    const loc = userLocation ?? { latitude: DEFAULT_REGION.latitude, longitude: DEFAULT_REGION.longitude };
    await loadData(loc.latitude, loc.longitude);
    setRefreshing(false);
  };

  // ── Tap a marker or card ──────────────────────────────────────────────
  const handleSelectIncident = (incident) => {
    setSelectedId(incident.id);
    // Pan map to incident
    mapRef.current?.animateToRegion({
      latitude:      incident.lat,
      longitude:     incident.lon,
      latitudeDelta:  1.5,
      longitudeDelta: 1.5,
    }, 500);
    navigation.navigate('Detail', { incident });
  };

  const filtered = getFilteredIncidents();
  const stats    = getStatsCounts();

  const FILTER_TABS = [
    { key: 'all',      label: 'All',   emoji: '🗺' },
    { key: 'fire',     label: 'Fire',  emoji: '🔥' },
    { key: 'flood',    label: 'Flood', emoji: '🌊' },
    { key: 'storm',    label: 'Storm', emoji: '⛈'  },
    { key: 'heatwave', label: 'Heat',  emoji: '🌡' },
  ];

  return (
    <SafeAreaView style={styles.container}>

      {/* ── Map ── */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={DEFAULT_REGION}
          showsUserLocation
          showsMyLocationButton={false}
          mapType="standard"
        >
          {filtered.map(incident => {
            const typeInfo = EMERGENCY_TYPES[incident.type] ?? EMERGENCY_TYPES.default;
            return (
              <React.Fragment key={incident.id}>
                <Circle
                  center={{ latitude: incident.lat, longitude: incident.lon }}
                  radius={(incident.radiusKm ?? 20) * 1000}
                  fillColor={typeInfo.color + '22'}
                  strokeColor={typeInfo.color + '88'}
                  strokeWidth={1}
                />
                <Marker
                  coordinate={{ latitude: incident.lat, longitude: incident.lon }}
                  onPress={() => handleSelectIncident(incident)}
                  tracksViewChanges={false}
                >
                  <EmergencyMarker type={incident.type} risk={incident.risk} />
                </Marker>
              </React.Fragment>
            );
          })}
        </MapView>

        {/* ── Top HUD ── */}
        <View style={styles.hud} accessibilityRole="header">
          <View>
            <Text style={styles.hudTitle}>🚨 AlertAU</Text>
            <Text style={styles.hudSub}>
              {isLoading ? 'Updating...' : `${stats.total} active  ·  updated ${formatTime(lastUpdated)}`}
            </Text>
          </View>
          <View style={styles.hudStats}>
            <StatPill count={stats.HIGH} color="#ef4444" label="HIGH" />
            <StatPill count={stats.MED}  color="#f97316" label="MED"  />
            <StatPill count={stats.LOW}  color="#eab308" label="LOW"  />
          </View>
        </View>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#ef4444" />
          </View>
        )}
      </View>

      {/* ── Bottom panel ── */}
      <View style={styles.panel}>

        {/* Filter tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
          {FILTER_TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.filterBtn, filter === tab.key && styles.filterBtnActive]}
              onPress={() => setFilter(tab.key)}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${tab.label}`}
              accessibilityState={{ selected: filter === tab.key }}
            >
              <Text style={[styles.filterText, filter === tab.key && styles.filterTextActive]}>
                {tab.emoji} {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Incident list */}
        <ScrollView
          style={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ef4444" />}
        >
          {error && <Text style={styles.error}>{error}</Text>}

          {filtered.length === 0 && !isLoading && (
            <Text style={styles.empty}>No active {filter === 'all' ? '' : filter} incidents in your region.</Text>
          )}

          {filtered.map(incident => (
            <AlertCard
              key={incident.id}
              incident={incident}
              onPress={handleSelectIncident}
              selected={incident.id === selectedId}
            />
          ))}
        </ScrollView>
      </View>

    </SafeAreaView>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────
function StatPill({ count, color, label }) {
  return (
    <View style={[styles.pill, { backgroundColor: color + '22', borderColor: color + '55' }]}>
      <Text style={[styles.pillText, { color }]}>{count} {label}</Text>
    </View>
  );
}

function formatTime(date) {
  if (!date) return 'never';
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

// ── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#0f1117' },
  mapContainer:  { flex: 1, position: 'relative' },
  map:           { flex: 1 },
  hud: {
    position:        'absolute', top: 0, left: 0, right: 0,
    flexDirection:   'row', justifyContent: 'space-between', alignItems: 'center',
    padding:          12, paddingTop: 16,
    backgroundColor: 'rgba(15,17,23,0.85)',
  },
  hudTitle:    { color: '#fff', fontWeight: '700', fontSize: 17 },
  hudSub:      { color: '#8896af', fontSize: 11, marginTop: 2 },
  hudStats:    { flexDirection: 'row', gap: 6 },
  pill:        { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 0.5 },
  pillText:    { fontSize: 10, fontWeight: '700' },
  loadingOverlay: {
    position: 'absolute', bottom: 12, right: 12,
    backgroundColor: 'rgba(15,17,23,0.8)', borderRadius: 20,
    padding: 8,
  },
  panel:        { height: 280, backgroundColor: '#161b24', borderTopWidth: 0.5, borderTopColor: '#2a3347' },
  filterScroll: { flexGrow: 0 },
  filterRow:    { flexDirection: 'row', gap: 8, padding: 10, paddingBottom: 6 },
  filterBtn:    { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 0.5, borderColor: '#2a3347', backgroundColor: 'transparent' },
  filterBtnActive: { backgroundColor: 'rgba(59,130,246,0.15)', borderColor: 'rgba(59,130,246,0.5)' },
  filterText:   { fontSize: 13, color: '#8896af' },
  filterTextActive: { color: '#60a5fa' },
  list:         { flex: 1, paddingHorizontal: 10 },
  error:        { color: '#f87171', fontSize: 12, padding: 12, textAlign: 'center' },
  empty:        { color: '#8896af', fontSize: 13, padding: 20, textAlign: 'center' },
});
