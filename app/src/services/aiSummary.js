// src/services/aiSummary.js
// Generates human-readable safety instructions using OpenAI GPT-4o-mini.
// Responses are cached in the Zustand store so we don't re-call the API.

import OpenAI from 'openai';
import { OPENAI_KEY } from '@env';

let client = null;

function getClient() {
  if (!client) {
    client = new OpenAI({ apiKey: OPENAI_KEY, dangerouslyAllowBrowser: true });
  }
  return client;
}

/**
 * Get AI safety instructions for an incident.
 * @param {object} incident - the full incident object
 * @returns {Promise<string>} plain-text safety instructions
 */
export async function getAISafetySummary(incident) {
  // If no API key, return a sensible default
  if (!OPENAI_KEY || OPENAI_KEY === 'YOUR_OPENAI_KEY_HERE') {
    return getDefaultSafetySummary(incident);
  }

  try {
    const ai = getClient();

    const prompt = buildPrompt(incident);

    const response = await ai.chat.completions.create({
      model:      'gpt-4o-mini',
      max_tokens: 300,
      messages:   [{ role: 'user', content: prompt }],
    });

    return response.choices[0].message.content;

  } catch (err) {
    console.warn('[AI Summary] Failed:', err.message);
    return getDefaultSafetySummary(incident);
  }
}

// ── Prompt builder ────────────────────────────────────────────────────────
function buildPrompt(incident) {
  return `You are an Australian emergency safety assistant helping the public during a crisis.

Write 3–4 clear, calm safety instructions for this situation:
- Emergency type: ${incident.type}
- Name: ${incident.name}
- Risk level: ${incident.risk}
- Distance from user: ${incident.distanceKm} km
- Description: ${incident.description || 'No additional detail.'}

Rules:
1. Use plain, simple English — suitable for elderly users and people under stress.
2. Start with the single most important action.
3. Mention relevant Australian services: ABC Radio 774, BOM (bom.gov.au), SES (ses.vic.gov.au), CFA (cfa.vic.gov.au), Triple Zero (000).
4. Keep each instruction to one sentence.
5. Do NOT use technical jargon or abbreviations without explaining them.
6. End with a calm reassurance sentence.`;
}

// ── Default summaries (no API key needed) ────────────────────────────────
function getDefaultSafetySummary(incident) {
  const defaults = {
    fire: `Move away from the fire immediately if it is within 20km of you and do not attempt to defend property. 
Close all windows and doors and turn off evaporative cooling to prevent smoke entry. 
Monitor ABC Radio 774 or the CFA website at cfa.vic.gov.au for real-time updates. 
If you are told to evacuate, leave early using designated routes and do not wait until the last moment. 
Emergency services are responding — stay calm and follow official instructions.`,

    flood: `Do not walk, drive, or swim through floodwater as even 15cm can be dangerous. 
Move valuables and yourself to the highest floor of your building immediately. 
Call the SES on 132 500 for flood assistance and monitor bom.gov.au for updates. 
Avoid bridges and low-lying roads as water may be deeper than it appears. 
Emergency services are working to help — stay put unless told to evacuate.`,

    storm: `Go indoors immediately and stay away from windows and skylights. 
Secure or bring inside any loose outdoor items such as furniture, trampolines, or umbrellas. 
Avoid using corded phones and unplug non-essential electronics to protect from lightning strikes. 
If driving, pull over safely away from trees and wait for the storm to pass. 
Monitor bom.gov.au radar and stay indoors until the all-clear is given.`,

    heatwave: `Stay indoors in air-conditioned spaces between 11am and 4pm when heat is most intense. 
Drink at least 2 litres of water throughout the day even if you do not feel thirsty. 
Never leave children, elderly people, or pets in parked vehicles under any circumstances. 
Check on elderly neighbours and family members at least twice today. 
Cooling centres are open at local libraries and shopping centres — take advantage of these free resources.`,

    default: `Move to a safe location away from the affected area as a precaution. 
Follow all instructions from emergency services and do not re-enter affected areas until given the all-clear. 
Call Triple Zero (000) if you or someone nearby is in immediate danger. 
Monitor the official ABC Emergency app and bom.gov.au for the latest updates. 
Stay calm — emergency services are responding to this situation.`,
  };

  return defaults[incident.type] || defaults.default;
}
