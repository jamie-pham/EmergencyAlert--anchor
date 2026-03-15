# ⚓ Anchor — Personalised Emergency Intelligence

> **Know exactly why you're at risk. Not just that you are.**

[![Hackathon 2026](https://img.shields.io/badge/Hackathon-2026-red)](.)
[![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-blue)](.)
[![Data](https://img.shields.io/badge/Data-NASA%20FIRMS%20%7C%20BOM%20%7C%20OpenAI-green)](.)

---

## The Problem

Every existing emergency app sends the same generic broadcast:

> *"Bushfire warning for the East Gippsland region."*

No wind direction. No distance from your home. No evacuation route. No reason why it affects **you**.

## The Solution

Anchor tells you:

> *"The fire is 12km south-east. Wind is blowing directly toward your address at 35km/h. Estimated threat time: under 20 minutes. Leave now via Princes Highway West."*

**One fire. One person. One clear reason why it matters to them.**

---

## What's In This Repo

```
anchor-emergency/
├── website/
│   ├── index.html          ← Main website with live demo
│   ├── phone-demo.html     ← Standalone mobile demo (open on your phone)
│   └── demo-video.html     ← Self-playing animated pitch demo
├── app/
│   ├── App.js              ← Root entry point
│   ├── app.json            ← Expo config
│   ├── package.json        ← All dependencies
│   ├── .env.example        ← API key template (copy to .env)
│   └── src/
│       ├── screens/
│       │   ├── MapScreen.js              ← Main map view
│       │   └── IncidentDetailScreen.js   ← Incident detail + AI brief
│       ├── services/
│       │   ├── aggregator.js             ← Combines all data sources ← START HERE
│       │   ├── nasaFirms.js              ← NASA FIRMS fire data
│       │   ├── openWeather.js            ← Weather alerts
│       │   ├── riskEngine.js             ← HIGH/MED/LOW risk calculator
│       │   └── aiSummary.js              ← OpenAI WHY explanations
│       ├── notifications/
│       │   └── pushHandler.js            ← Push alert registration
│       ├── store/
│       │   └── useEmergencyStore.js      ← Global state (Zustand)
│       ├── components/
│       │   ├── EmergencyMarker.js        ← Map marker
│       │   ├── AlertCard.js              ← Incident list card
│       │   └── RiskBadge.js              ← HIGH/MED/LOW badge
│       ├── constants/
│       │   └── index.js                  ← Emergency types, colours, settings
│       └── utils/
│           └── helpers.js                ← Shared utility functions
├── API_KEYS_GUIDE.txt      ← Where to put your API keys
└── README.md               ← You are here
```

---

## Quick Start

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/anchor-emergency.git
cd anchor-emergency
```

### 2. Install dependencies
```bash
cd app
npm install -g expo-cli eas-cli
npx expo install react-native-maps expo-location expo-notifications expo-device expo-constants
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler
npm install axios @tanstack/react-query zustand openai react-native-dotenv
npx expo install react-native-web react-dom
```

### 3. Add your API keys
```bash
cp .env.example .env
# Open .env and fill in your keys
```

| Key | Where to get it | Cost |
|-----|----------------|------|
| `NASA_FIRMS_KEY` | [firms.modaps.eosdis.nasa.gov/api](https://firms.modaps.eosdis.nasa.gov/api/) | Free |
| `OPENWEATHER_KEY` | [openweathermap.org/api](https://openweathermap.org/api) | Free tier |
| `OPENAI_KEY` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | ~$0.001/call |

### 4. Run the app

```bash
# Mobile (scan QR with Expo Go)
npx expo start

# Web browser
npx expo start --web
```

> **No API keys yet?** The app runs with mock data by default.
> In `src/services/aggregator.js` set `USE_MOCK_DATA = true` (it already is).

---

## The Core Differentiator — The WHY Engine

Every incident has a personalised **"Why you are at risk"** explanation generated for the user's exact GPS location.

The same fire produces three completely different alerts:

| Person | Distance | WHY message |
|--------|----------|-------------|
| Margaret, Traralgon | 8km | *"Fire is 8km SE. Wind 40km/h toward your home. Zone A — mandatory evacuation. No vehicle at address."* |
| The Nguyens, Sale | 35km | *"Wind change forecast at 3pm may redirect fire toward Sale. Prepare now."* |
| Priya, Melbourne | 145km | *"No direct threat. Smoke will reach CBD from 6pm. Close windows tonight."* |

This is built in `src/services/riskEngine.js` and `src/services/aiSummary.js`.

---

## Website Demo

The website (`website/index.html`) is a single HTML file — no server needed.

**To go live instantly (free):**
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag `website/index.html` onto the page
3. Live URL in 10 seconds

**To run locally:**
Just open `website/index.html` in any browser. No server needed.

---

## Data Sources

| Source | Type | Update Frequency |
|--------|------|-----------------|
| NASA FIRMS (VIIRS) | Fire hotspots | Every 3 hours |
| Bureau of Meteorology | Weather alerts | Real-time |
| OpenWeatherMap | Severe weather | Real-time |
| GDACS / Copernicus | EU expansion ready | Daily |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo (React Native + Web) |
| Language | JavaScript ES2022 |
| State | Zustand |
| Data fetching | Axios + TanStack Query |
| Map | react-native-maps |
| AI (WHY engine) | OpenAI GPT-4o-mini |
| Notifications | Expo Notifications |
| Navigation | React Navigation v6 |

---

## For Developers — Where to Start

1. **Read `src/services/aggregator.js`** — all data flows through here
2. **Tune risk thresholds** in `src/constants/index.js`
3. **Edit AI prompts** in `src/services/aiSummary.js` → `buildPrompt()`
4. **Add new emergency types** in `src/constants/index.js` — no UI changes needed
5. **Add new regions (EU)** — add sources to `aggregator.js` only

---

## Accessibility

- Large text and high contrast for elderly users
- Plain English AI briefs — no jargon
- WCAG AA compliant
- Screen reader support
- Reduced motion support
- Multilingual ready (AI briefs translate to any language instantly)

---

## Expanding to the EU

The architecture is designed for multi-region from day one.

```javascript
// src/services/aggregator.js — just add these sources:
const EU_SOURCES = [
  { name: 'EFFIS',      type: 'fire',  url: 'https://effis.jrc.ec.europa.eu/' },
  { name: 'Copernicus', type: 'flood', url: 'https://emergency.copernicus.eu/' },
  { name: 'GDACS',      type: 'multi', url: 'https://www.gdacs.org/xml/rss.xml' },
];
```

Adding a new region requires changes to **two files only**: `aggregator.js` and `constants/index.js`.

---

## Team

Built at Hackathon 2026 for social impact.

---

*"When the world is on fire — Anchor keeps you clear."*
