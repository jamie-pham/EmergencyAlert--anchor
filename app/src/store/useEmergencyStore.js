// src/store/useEmergencyStore.js
// Global state — all screens share this data

import { create } from 'zustand';

const useEmergencyStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────
  incidents:      [],       // all fetched emergency incidents
  userLocation:   null,     // { latitude, longitude }
  selectedId:     null,     // currently selected incident id
  aiSummaries:    {},       // { [incidentId]: 'AI text...' }
  filter:         'all',    // 'all' | 'fire' | 'flood' | 'storm' | 'heatwave'
  isLoading:      false,
  lastUpdated:    null,
  error:          null,

  // ── Actions ────────────────────────────────────────────────
  setIncidents:    (incidents)   => set({ incidents, lastUpdated: new Date(), error: null }),
  setUserLocation: (userLocation)=> set({ userLocation }),
  setSelectedId:   (selectedId)  => set({ selectedId }),
  setFilter:       (filter)      => set({ filter }),
  setLoading:      (isLoading)   => set({ isLoading }),
  setError:        (error)       => set({ error }),

  setAiSummary: (incidentId, summary) =>
    set(state => ({
      aiSummaries: { ...state.aiSummaries, [incidentId]: summary }
    })),

  // ── Derived / selectors ────────────────────────────────────
  getSelectedIncident: () => {
    const { incidents, selectedId } = get();
    return incidents.find(i => i.id === selectedId) ?? null;
  },

  getFilteredIncidents: () => {
    const { incidents, filter } = get();
    if (filter === 'all') return incidents;
    return incidents.filter(i => i.type === filter);
  },

  getStatsCounts: () => {
    const { incidents } = get();
    return {
      HIGH:  incidents.filter(i => i.risk === 'HIGH').length,
      MED:   incidents.filter(i => i.risk === 'MED').length,
      LOW:   incidents.filter(i => i.risk === 'LOW').length,
      total: incidents.length,
    };
  },
}));

export default useEmergencyStore;
