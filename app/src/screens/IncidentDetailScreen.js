// src/screens/IncidentDetailScreen.js
// Full-screen detail view for a selected incident.
// Shows AI-generated safety instructions, risk level, and action buttons.

import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, Linking, Share,
} from 'react-native';
import { EMERGENCY_TYPES } from '../constants';
import { getAISafetySummary } from '../services/aiSummary';
import useEmergencyStore from '../store/useEmergencyStore';
import RiskBadge from '../components/RiskBadge';

export default function IncidentDetailScreen({ route, navigation }) {
  const { incident } = route.params;
  const { aiSummaries, setAiSummary } = useEmergencyStore();
  const [loadingAI, setLoadingAI] = useState(false);

  const typeInfo = EMERGENCY_TYPES[incident.type] ?? EMERGENCY_TYPES.default;
  const summary  = aiSummaries[incident.id];

  // ── Load AI summary if not already cached ─────────────────────────────
  useEffect(() => {
    if (!summary) {
      setLoadingAI(true);
      getAISafetySummary(incident)
        .then(text => setAiSummary(incident.id, text))
        .catch(console.warn)
        .finally(() => setLoadingAI(false));
    }
  }, [incident.id]);

  const handleShare = async () => {
    await Share.share({
      message: `🚨 ${incident.risk} RISK — ${incident.name}\n${incident.distanceKm}km away\n\nSafety info: ${summary ?? ''}`,
    });
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* ── Header ── */}
      <View style={[styles.header, { borderBottomColor: typeInfo.color + '55' }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back to map"
        >
          <Text style={styles.backText}>← Map</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={handleShare}
          accessibilityRole="button"
          accessibilityLabel="Share this alert"
        >
          <Text style={styles.shareText}>Share ↑</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* ── Title block ── */}
        <View style={[styles.titleBlock, { backgroundColor: typeInfo.color + '18', borderColor: typeInfo.color + '44' }]}>
          <Text style={styles.typeIcon}>{typeInfo.icon}</Text>
          <View style={styles.titleBody}>
            <Text style={styles.incidentName}>{incident.name}</Text>
            <View style={styles.titleMeta}>
              <RiskBadge level={incident.risk} large />
              <Text style={styles.distance}>{incident.distanceKm} km away</Text>
            </View>
          </View>
        </View>

        {/* ── Info rows ── */}
        <View style={styles.infoCard}>
          <InfoRow label="Type"     value={typeInfo.label} />
          <InfoRow label="Source"   value={incident.source} />
          <InfoRow label="Updated"  value={new Date(incident.updatedAt).toLocaleString('en-AU')} />
          {incident.description && <InfoRow label="Details" value={incident.description} />}
        </View>

        {/* ── AI Safety Instructions ── */}
        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <Text style={styles.aiTitle}>🤖 AI Safety Instructions</Text>
            <View style={styles.aiBadge}><Text style={styles.aiBadgeText}>GPT-4o-mini</Text></View>
          </View>

          {loadingAI ? (
            <View style={styles.aiLoading}>
              <ActivityIndicator size="small" color="#a855f7" />
              <Text style={styles.aiLoadingText}>Generating safety instructions...</Text>
            </View>
          ) : (
            <Text
              style={styles.aiText}
              accessibilityRole="text"
              accessibilityLabel={`Safety instructions: ${summary}`}
            >
              {summary ?? 'No instructions available.'}
            </Text>
          )}
        </View>

        {/* ── Emergency action buttons ── */}
        <View style={styles.actionsBlock}>
          <Text style={styles.actionsTitle}>Emergency Contacts</Text>

          <ActionButton
            emoji="📞" label="Triple Zero — 000"
            sublabel="Police, Fire, Ambulance"
            color="#ef4444"
            onPress={() => Linking.openURL('tel:000')}
          />
          <ActionButton
            emoji="🌊" label="SES — 132 500"
            sublabel="Storms, floods, damage"
            color="#3b82f6"
            onPress={() => Linking.openURL('tel:132500')}
          />
          <ActionButton
            emoji="📡" label="BOM Weather"
            sublabel="Latest warnings & radar"
            color="#6b7280"
            onPress={() => Linking.openURL('https://www.bom.gov.au/warnings/')}
          />
          <ActionButton
            emoji="🔥" label="CFA Fires Near Me"
            sublabel="Current fire activity"
            color="#f97316"
            onPress={() => Linking.openURL('https://www.cfa.vic.gov.au/')}
          />
        </View>

        {/* ── Disclaimer ── */}
        <Text style={styles.disclaimer}>
          AI-generated instructions are a guide only. Always follow official advice from emergency services.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Small helpers ──────────────────────────────────────────────────────────
function InfoRow({ label, value }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value}>{value}</Text>
    </View>
  );
}

function ActionButton({ emoji, label, sublabel, color, onPress }) {
  return (
    <TouchableOpacity
      style={[actionStyles.btn, { borderLeftColor: color }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label} — ${sublabel}`}
    >
      <Text style={actionStyles.emoji}>{emoji}</Text>
      <View style={actionStyles.body}>
        <Text style={actionStyles.label}>{label}</Text>
        <Text style={actionStyles.sub}>{sublabel}</Text>
      </View>
      <Text style={actionStyles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#0f1117' },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 0.5 },
  backBtn:      { minWidth: 44, minHeight: 44, justifyContent: 'center' },
  backText:     { color: '#60a5fa', fontSize: 15, fontWeight: '500' },
  shareBtn:     { minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'flex-end' },
  shareText:    { color: '#8896af', fontSize: 14 },
  scroll:       { flex: 1 },
  content:      { padding: 16, gap: 14, paddingBottom: 40 },
  titleBlock:   { flexDirection: 'row', gap: 12, padding: 14, borderRadius: 12, borderWidth: 0.5, alignItems: 'flex-start' },
  typeIcon:     { fontSize: 32, marginTop: 2 },
  titleBody:    { flex: 1 },
  incidentName: { fontSize: 18, fontWeight: '700', color: '#e8eaf0', marginBottom: 8, lineHeight: 24 },
  titleMeta:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  distance:     { color: '#8896af', fontSize: 13 },
  infoCard:     { backgroundColor: '#1e2533', borderRadius: 12, padding: 14, gap: 10, borderWidth: 0.5, borderColor: '#2a3347' },
  aiCard:       { backgroundColor: '#1a1528', borderRadius: 12, padding: 14, borderWidth: 0.5, borderColor: 'rgba(168,85,247,0.3)' },
  aiHeader:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  aiTitle:      { fontSize: 14, fontWeight: '600', color: '#e8eaf0', flex: 1 },
  aiBadge:      { backgroundColor: 'rgba(168,85,247,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 0.5, borderColor: 'rgba(168,85,247,0.4)' },
  aiBadgeText:  { fontSize: 10, color: '#c084fc' },
  aiLoading:    { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  aiLoadingText:{ color: '#8896af', fontSize: 13 },
  aiText:       { fontSize: 14, color: '#b8c4d4', lineHeight: 22 },
  actionsBlock: { gap: 8 },
  actionsTitle: { fontSize: 13, fontWeight: '600', color: '#8896af', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  disclaimer:   { fontSize: 11, color: '#4a5568', textAlign: 'center', lineHeight: 16 },
});

const infoStyles = StyleSheet.create({
  row:   { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  label: { fontSize: 12, color: '#8896af', flex: 0.4 },
  value: { fontSize: 12, color: '#e8eaf0', flex: 0.6, textAlign: 'right', flexWrap: 'wrap' },
});

const actionStyles = StyleSheet.create({
  btn:   { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1e2533', borderRadius: 10, padding: 12, borderWidth: 0.5, borderColor: '#2a3347', borderLeftWidth: 3, minHeight: 60 },
  emoji: { fontSize: 22 },
  body:  { flex: 1 },
  label: { fontSize: 14, fontWeight: '600', color: '#e8eaf0' },
  sub:   { fontSize: 12, color: '#8896af', marginTop: 2 },
  arrow: { fontSize: 20, color: '#4a5568' },
});
