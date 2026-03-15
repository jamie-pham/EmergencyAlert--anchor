// src/components/EmergencyMarker.js
// Custom map marker — colour and icon change based on type and risk level.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EMERGENCY_TYPES, RISK_LEVELS } from '../constants';

export default function EmergencyMarker({ type, risk }) {
  const typeInfo = EMERGENCY_TYPES[type] ?? EMERGENCY_TYPES.default;
  const riskInfo = RISK_LEVELS[risk]     ?? RISK_LEVELS.LOW;

  return (
    <View style={styles.wrapper}>
      {/* Pulsing ring for HIGH risk */}
      {risk === 'HIGH' && <View style={[styles.pulse, { borderColor: typeInfo.color }]} />}

      {/* Main marker dot */}
      <View style={[styles.marker, { backgroundColor: typeInfo.color }]}>
        <Text style={styles.icon}>{typeInfo.icon}</Text>
      </View>

      {/* Risk badge */}
      <View style={[styles.badge, { backgroundColor: riskInfo.bgColor, borderColor: typeInfo.color }]}>
        <Text style={[styles.badgeText, { color: riskInfo.textColor }]}>{risk}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    // Accessibility — large enough to tap easily
    minWidth:  44,
    minHeight: 44,
    justifyContent: 'center',
  },
  pulse: {
    position:    'absolute',
    width:        44,
    height:       44,
    borderRadius: 22,
    borderWidth:  1.5,
    opacity:      0.4,
  },
  marker: {
    width:        34,
    height:       34,
    borderRadius: 17,
    alignItems:    'center',
    justifyContent:'center',
    borderWidth:   2,
    borderColor:   'rgba(255,255,255,0.6)',
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius:  4,
    elevation:     5,
  },
  icon: {
    fontSize: 16,
  },
  badge: {
    marginTop:    2,
    paddingHorizontal: 6,
    paddingVertical:   1,
    borderRadius:  8,
    borderWidth:   0.5,
  },
  badgeText: {
    fontSize:   9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
