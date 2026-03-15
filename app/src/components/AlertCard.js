// src/components/AlertCard.js
// Reusable card shown in the incident list.

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { EMERGENCY_TYPES } from '../constants';
import RiskBadge from './RiskBadge';

export default function AlertCard({ incident, onPress, selected = false }) {
  const typeInfo = EMERGENCY_TYPES[incident.type] ?? EMERGENCY_TYPES.default;

  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.selected, { borderLeftColor: typeInfo.color }]}
      onPress={() => onPress(incident)}
      accessibilityRole="button"
      accessibilityLabel={`${typeInfo.label} alert: ${incident.name}, ${incident.risk} risk, ${incident.distanceKm} kilometres away`}
      accessibilityHint="Tap to view safety instructions"
    >
      <View style={styles.row}>
        <Text style={styles.icon}>{typeInfo.icon}</Text>
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={1}>{incident.name}</Text>
            <RiskBadge level={incident.risk} />
          </View>
          <Text style={styles.meta}>
            {incident.distanceKm}km away  ·  {typeInfo.label}  ·  {incident.source}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e2533',
    borderRadius:     10,
    marginBottom:      8,
    padding:          12,
    borderWidth:       0.5,
    borderColor:      '#2a3347',
    borderLeftWidth:   3,
  },
  selected: {
    borderColor:       '#3b82f6',
    backgroundColor:  'rgba(59,130,246,0.08)',
  },
  row:      { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  icon:     { fontSize: 22, marginTop: 1 },
  body:     { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, gap: 8 },
  name:     { fontSize: 13, fontWeight: '600', color: '#e8eaf0', flex: 1 },
  meta:     { fontSize: 11, color: '#8896af' },
});
