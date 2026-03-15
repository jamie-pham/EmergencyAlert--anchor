// src/components/RiskBadge.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RISK_LEVELS } from '../constants';

export default function RiskBadge({ level, large = false }) {
  const info = RISK_LEVELS[level] ?? RISK_LEVELS.LOW;
  return (
    <View style={[styles.badge, { backgroundColor: info.bgColor, borderColor: info.color }, large && styles.large]}>
      <Text style={[styles.text, { color: info.textColor }, large && styles.largeText]}>{level}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 0.5 },
  text:      { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  large:     { paddingHorizontal: 12, paddingVertical: 5 },
  largeText: { fontSize: 13 },
});
