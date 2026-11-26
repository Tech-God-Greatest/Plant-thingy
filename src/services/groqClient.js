// Groq Multimodal Vision & Botanical Diagnostic Reasoning Service

const GROQ_COMPLETIONS_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Robust multi-pass JSON extractor
 * Safely extracts JSON even if LLM surrounds it with markdown codeblocks or explanatory text.
 */
export function extractJsonFromResponse(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Empty response from model');
  }

  const trimmed = text.trim();

  // Pass 1: Direct JSON parse
  try {
    return JSON.parse(trimmed);
  } catch {
    // Continue to next pass
  }

  // Pass 2: Extract content inside ```json ... ``` or ``` ... ```
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // Continue to next pass
    }
  }

  // Pass 3: Extract from first '{' to last '}'
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = trimmed.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      // Continue to next pass
    }
  }

  // Pass 4: Fallback object
  console.warn('Could not parse clean JSON from LLM response, returning fallback structure. Raw:', trimmed);
  return {
    raw_response: trimmed,
    parse_error: true
  };
}

/**
 * Vision Stage: Analyzes captured plant photo using Groq Multimodal model
 */
export async function analyzePlantVision({ apiKey, modelId, imageDataUrl, plantProfile }) {
  if (!apiKey) {
    throw new Error('Missing Groq API Key. Please provide your key in Settings or use Local Botanical Simulation Mode.');
  }

  const model = modelId || 'qwen/qwen3.8-27b';

  const systemPrompt = `You are RootMind's Botanical Computer Vision Observer.
Your sole job is to visually inspect the provided plant photo with objective botanical precision.
Plant context: ${plantProfile?.name || 'Plant'} (${plantProfile?.species || 'Houseplant'}).

CRITICAL SAFETY & REASONING RULES:
1. Do not jump to a final diagnosis yet—report only what is visually observed.
2. Observe leaf turgor (firm, limp/drooping, curled inward, shriveled), coloration (chlorosis/yellowing, deep green, pale, variegation), leaf margins (crispy brown, soft dark brown, water-soaked, intact), petiole posture, and any visible pest signs (webbing, speckling, scale, none).
3. Distinguish between natural variegation patterns and stress chlorosis.
4. Output STRICT JSON ONLY matching this schema:
{
  "visible_symptoms": ["turgor_loss", "chlorosis", "brown_margins", "spots", "pest_signs", "healthy"],
  "affected_areas": ["older_lower_leaves", "new_growth", "petioles", "leaf_tips", "entire_plant", "none"],
  "severity": "none" | "mild" | "moderate" | "severe",
  "confidence": 0.0 to 1.0,
  "visual_notes": "Concise 2-3 sentence description of visual evidence observed in foliage and stems."
}
Do not include any text outside the JSON block.`;

  const payload = {
    model: model,
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Carefully inspect this plant specimen and return structured visual observations in pure JSON.'
          },
          {
            type: 'image_url',
            image_url: {
              url: imageDataUrl
            }
          }
        ]
      }
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' }
  };

  const response = await fetch(GROQ_COMPLETIONS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    let parsedErr = errText;
    try {
      const errObj = JSON.parse(errText);
      parsedErr = errObj.error?.message || errText;
    } catch {
      // use raw text
    }
    throw new Error(`Groq Vision API Error (${response.status}): ${parsedErr}`);
  }

  const resData = await response.json();
  const rawText = resData.choices?.[0]?.message?.content || '';
  const parsed = extractJsonFromResponse(rawText);

  // Normalize structure
  return {
    visible_symptoms: Array.isArray(parsed.visible_symptoms) ? parsed.visible_symptoms : ['visual_inspection_complete'],
    affected_areas: Array.isArray(parsed.affected_areas) ? parsed.affected_areas : ['foliage'],
    severity: ['none', 'mild', 'moderate', 'severe'].includes(parsed.severity) ? parsed.severity : 'mild',
    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.85,
    visual_notes: parsed.visual_notes || rawText.substring(0, 200),
    raw: rawText
  };
}

/**
 * Diagnostic Stage: Evaluates all gathered evidence (Vision + Weather + Plant Profile + Soil/Tactile + Q&A)
 */
export async function diagnosePlantHealth({
  apiKey,
  modelId,
  plantProfile,
  visionData,
  weatherData,
  tactileData,
  indoorSensors = null,
  pastCheckups = [],
  previousAnswers = null,
  mode = 'interactive'
}) {
  if (!apiKey) {
    throw new Error('Missing Groq API Key. Please provide your key in Settings or use Local Botanical Simulation Mode.');
  }

  const model = modelId || 'openai/gpt-oss-120b';

  const systemPrompt = `You are RootMind, an evidence-based plant health diagnostic assistant.
You apply rigorous botanical logic and differential diagnosis.

STRICT BOTANICAL RULES & PHILOSOPHY:
1. Cross-reference EXTERNAL OUTDOOR CLIMATE (Open-Meteo) with IN-POT & INDOOR SENSOR TELEMETRY (soil moisture probe %, room temperature, indoor humidity, and light Lux).
2. Never jump to conclusions: wilting or drooping foliage does NOT automatically mean underwatering! Overwatering causes root hypoxia and suffocation, leading to identical wilting symptoms. If in-pot soil moisture is high (>65-70%) while leaves droop, you MUST diagnose overwatering/root suffocation risk, NOT underwatering.
3. If soil moisture is low (<25%) and light/temp are elevated, diagnose vascular dehydration.
4. If canopy light is critically low (<150 Lux), factor in light deficit/etiolation risk.
5. Explicitly evaluate COMPETING HYPOTHESES (e.g. Overwatering vs Underwatering vs Low Humidity Stress vs Light Shock vs Pests).
6. Detail SUPPORTING and CONFLICTING evidence for the primary hypothesis.
7. STRICT SAFETY MANDATE: NEVER recommend automatic or unverified chemical treatments, systemic pesticides, or synthetic fungicides. Recommend only safe, reversible, physical/cultural interventions (soil touch verification, adjusting saucer drainage, adjusting light distance, aeration, bottom-watering, safe cosmetic tip snips, gentle wash).
8. State uncertainty clearly when evidence is incomplete or ambiguous.
9. In 'interactive' mode, if critical information is missing (e.g., soil moisture depth or watering history is ambiguous), set "status": "needs_info" and provide 2-3 focused multiple-choice clarifying questions. If sufficient information exists or questions were answered, set "status": "diagnosed".
10. In 'quick' mode, provide a provisional diagnosis with "status": "diagnosed" immediately.

OUTPUT FORMAT: Strict JSON only matching:
{
  "status": "needs_info" | "diagnosed",
  "clarifying_questions": [
    {
      "id": "q1",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C"]
    }
  ],
  "provisional_diagnosis": "Name of primary condition",
  "confidence_level": "High (0.85-1.0)" | "Moderate (0.60-0.84)" | "Low / Speculative (<0.60)",
  "uncertainty_notes": "Explanation of what is known vs uncertain",
  "competing_hypotheses": [
    {
      "hypothesis": "Hypothesis name",
      "probability": 0.0 to 1.0,
      "reason": "Brief reason"
    }
  ],
  "supporting_and_conflicting_evidence": {
    "supporting": ["Evidence 1", "Evidence 2"],
    "conflicting": ["Evidence conflicting with primary diagnosis or distinguishing it from alternatives"]
  },
  "recommended_actions": [
    {
      "id": "action_id",
      "title": "Short action name",
      "description": "Safe, reversible instruction",
      "urgency": "low" | "medium" | "high",
      "reversible": true
    }
  ]
}`;

  const evidencePrompt = `
EVIDENCE DOSSIER:
- Plant: ${plantProfile?.name || 'Pothos'}
- Species: ${plantProfile?.species || 'Epipremnum aureum'}
- Placement: ${plantProfile?.placementLabel || plantProfile?.placement || 'Indoor'}
- Pot & Drainage: ${plantProfile?.potDrainageLabel || plantProfile?.potDrainage || 'With drainage holes'}
- Potting Mix: ${plantProfile?.pottingMix || 'Standard indoor mix'}

VISUAL OBSERVATIONS (Camera/Vision):
- Visible Symptoms: ${JSON.stringify(visionData?.visible_symptoms || [])}
- Affected Areas: ${JSON.stringify(visionData?.affected_areas || [])}
- Visual Severity: ${visionData?.severity || 'unknown'}
- Vision Confidence: ${visionData?.confidence || '0.85'}
- Visual Notes: ${visionData?.visual_notes || 'None'}

INDOOR SENSOR TELEMETRY RIG (In-Pot Probes & Room Metrics):
${indoorSensors ? `
- Soil Moisture Probe: ${indoorSensors.soilMoisture}% (${indoorSensors.soilCategory?.label || 'Active'})
- Indoor Ambient Temperature: ${indoorSensors.indoorTemp} °C
- Indoor Ambient Humidity: ${indoorSensors.indoorHumidity} % RH
- Canopy Light Intensity: ${indoorSensors.lightLevel} Lux (${indoorSensors.lightCategory?.label || 'Active'})
` : '- Indoor sensor rig: Not active'}

EXTERNAL MICROCLIMATE CONTEXT (Open-Meteo Outdoor Ambient):
- Outdoor Temperature: ${weatherData?.temperature ?? '22'} °C
- Outdoor Humidity: ${weatherData?.humidity ?? '50'} %
- Precipitation: ${weatherData?.precipitation ?? '0'} mm
- Cloud Cover: ${weatherData?.cloudCover ?? '0'} %
- VPD (Transpiration Pressure): ${weatherData?.vpdKpa ?? '1.0'} kPa (${weatherData?.vpdStatus?.label || 'Moderate'})
- Weather Disclaimer: Outdoor meteorological forecast.

USER TACTILE & OBSERVATIONAL CONTEXT:
- Soil Moisture at 1-2 inch depth: ${tactileData?.soilMoisture || 'Not tested'}
- Pot Weight Feeling: ${tactileData?.potWeight || 'Normal'}
- Drainage Saucer: ${tactileData?.drainageStatus || 'Clear'}
- Days Since Last Watered: ${tactileData?.lastWateredDays ?? 'Unknown'}
- Indoor Draft / HVAC: ${tactileData?.draftExposure || 'None'}
- User Freeform Notes: ${tactileData?.userNote || 'None'}

DIAGNOSTIC MODE: ${mode}
${previousAnswers ? `USER RECENT ANSWERS TO CLARIFYING QUESTIONS:\n${JSON.stringify(previousAnswers, null, 2)}` : ''}

Synthesize this evidence and return strictly compliant JSON.`;

  const payload = {
    model: model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: evidencePrompt }
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' }
  };

  const response = await fetch(GROQ_COMPLETIONS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    let parsedErr = errText;
    try {
      const errObj = JSON.parse(errText);
      parsedErr = errObj.error?.message || errText;
    } catch {
      // use raw
    }
    throw new Error(`Groq Diagnostic API Error (${response.status}): ${parsedErr}`);
  }

  const resData = await response.json();
  const rawText = resData.choices?.[0]?.message?.content || '';
  const parsed = extractJsonFromResponse(rawText);

  // If in quick mode or if user answered clarifying questions, ensure diagnosed status
  let status = parsed.status || 'diagnosed';
  if (mode === 'quick' || previousAnswers) {
    status = 'diagnosed';
  }

  return {
    status,
    clarifying_questions: Array.isArray(parsed.clarifying_questions) ? parsed.clarifying_questions : [],
    provisional_diagnosis: parsed.provisional_diagnosis || 'Botanical Equilibrium Under Assessment',
    confidence_level: parsed.confidence_level || 'Moderate (0.75)',
    uncertainty_notes: parsed.uncertainty_notes || 'Analysis generated based on visual and environmental telemetry.',
    competing_hypotheses: Array.isArray(parsed.competing_hypotheses) ? parsed.competing_hypotheses : [],
    supporting_and_conflicting_evidence: parsed.supporting_and_conflicting_evidence || {
      supporting: ['Visual examination recorded.'],
      conflicting: []
    },
    recommended_actions: Array.isArray(parsed.recommended_actions) ? parsed.recommended_actions : [
      {
        id: 'action_check_moisture',
        title: 'Check Soil Depth Moisture',
        description: 'Insert finger 2 inches into soil to verify actual root-zone dampness.',
        urgency: 'low',
        reversible: true
      }
    ],
    raw: rawText
  };
}

/**
 * Local Botanical Fallback Simulation Generator
 * Used when no Groq API Key is provided or for offline testing.
 */
export function generateLocalBotanicalAnalysis({ plantProfile, visionData, weatherData, tactileData, indoorSensors = null, mode }) {
  const symptoms = visionData?.visible_symptoms || [];
  const soil = tactileData?.soilMoisture || 'dry_top';
  const sensorSoil = indoorSensors?.soilMoisture ?? null;
  const sensorLight = indoorSensors?.lightLevel ?? null;

  // Check if indoor sensor indicates extreme saturation
  const isSaturated = (sensorSoil !== null && sensorSoil > 70) || soil === 'soggy' || tactileData?.drainageStatus === 'standing_water';
  const isDrought = (sensorSoil !== null && sensorSoil < 22) || soil === 'bone_dry' || tactileData?.potWeight === 'very_light';
  const isLightStarved = sensorLight !== null && sensorLight < 150;

  if (symptoms.includes('turgor_loss') || symptoms.includes('epinasty_droop') || isSaturated || isDrought) {
    if (isSaturated) {
      return {
        status: 'diagnosed',
        provisional_diagnosis: 'Suspected Root Hypoxia from Soil Saturation (Overwatering Risk)',
        confidence_level: 'High (0.87)',
        uncertainty_notes: 'While drooping leaves often trigger an urge to water, saturated soil and heavy pot weight clearly indicate root oxygen deprivation rather than drought.',
        competing_hypotheses: [
          {
            hypothesis: 'Overwatering & Root Zone Suffocation',
            probability: 0.84,
            reason: 'Turgor drop occurs simultaneously with wet potting medium.'
          },
          {
            hypothesis: 'Dehydration / Vascular Wilt',
            probability: 0.10,
            reason: 'Symptoms match wilting, but soil is wet.'
          },
          {
            hypothesis: 'Cold Root Shock',
            probability: 0.06,
            reason: 'Cold floor drafts can paralyze root water uptake.'
          }
        ],
        supporting_and_conflicting_evidence: {
          supporting: [
            'Potting soil feels soggy / saturated',
            'Leaves appear limp and petioles have lost upright tension',
            'Lower foliage yellowing indicates root stress'
          ],
          conflicting: [
            'Outdoor ambient humidity is not critically low'
          ]
        },
        recommended_actions: [
          {
            id: 'local_drain_saucer',
            title: 'Empty Drainage Saucer',
            description: 'Ensure the pot is not sitting in standing runoff water.',
            urgency: 'high',
            reversible: true
          },
          {
            id: 'local_dry_cycle',
            title: 'Allow Soil to Breathe & Dry',
            description: 'Withhold further watering until the top 2 inches dry out completely.',
            urgency: 'high',
            reversible: true
          },
          {
            id: 'local_aeration',
            title: 'Gentle Soil Aeration',
            description: 'Carefully probe a few small holes in the surface soil with a clean stick to introduce oxygen.',
            urgency: 'medium',
            reversible: true
          }
        ]
      };
    } else if (soil === 'bone_dry' || tactileData?.potWeight === 'very_light') {
      return {
        status: 'diagnosed',
        provisional_diagnosis: 'Vascular Dehydration / Soil Drought Stress',
        confidence_level: 'High (0.91)',
        uncertainty_notes: 'Limp petioles, inward curling foliage, and bone-dry soil provide unequivocal convergence on moisture deficit.',
        competing_hypotheses: [
          {
            hypothesis: 'Acute Underwatering',
            probability: 0.90,
            reason: 'Foliage curls to conserve water; planter is feather-light.'
          },
          {
            hypothesis: 'Dry Air Transpiration Stress (High VPD)',
            probability: 0.10,
            reason: 'Ambient humidity may accelerate foliar drying.'
          }
        ],
        supporting_and_conflicting_evidence: {
          supporting: [
            'Soil is completely dry past 2 inches',
            'Planter weight is noticeably light',
            'Foliage curls inward'
          ],
          conflicting: [
            'No soft black rot at stem bases'
          ]
        },
        recommended_actions: [
          {
            id: 'local_bottom_soak',
            title: 'Thorough Bottom Soak',
            description: 'Place pot in a container of lukewarm water for 25 minutes to re-hydrate dry soil pockets, then drain.',
            urgency: 'high',
            reversible: true
          },
          {
            id: 'local_leaf_snip',
            title: 'Trim Completely Dry Tips',
            description: 'Snip brown crispy leaf tips, leaving a sliver of brown to avoid cutting green tissue.',
            urgency: 'low',
            reversible: true
          }
        ]
      };
    } else if (mode === 'interactive') {
      return {
        status: 'needs_info',
        clarifying_questions: [
          {
            id: 'q_soil_depth',
            question: 'When you insert your finger 2 inches into the soil, how does it feel?',
            options: ['Bone dry and dusty', 'Slightly cool and damp', 'Muddy, soggy, or wet']
          },
          {
            id: 'q_saucer_water',
            question: 'Is there water currently sitting in the bottom saucer or cachepot?',
            options: ['No, completely empty/dry', 'Yes, a small puddle', 'Yes, standing submerged']
          }
        ],
        provisional_diagnosis: 'Ambiguous Foliar Droop (Differential Diagnosis Active)',
        confidence_level: 'Low-Moderate (0.55)',
        uncertainty_notes: 'Drooping foliage can be caused by either root dehydration or root suffocation from overwatering. Clarification of soil dampness is needed.',
        competing_hypotheses: [
          { hypothesis: 'Underwatering', probability: 0.50, reason: 'Limp stems match drought.' },
          { hypothesis: 'Overwatering / Root Hypoxia', probability: 0.50, reason: 'Limp stems also occur when roots drown.' }
        ],
        supporting_and_conflicting_evidence: {
          supporting: ['Visual turgor loss observed.'],
          conflicting: ['Soil moisture state not yet confirmed.']
        },
        recommended_actions: [
          {
            id: 'local_check_roots',
            title: 'Check Soil Moisture Before Adding Water',
            description: 'Do not add water until you confirm whether soil is dry or soggy.',
            urgency: 'high',
            reversible: true
          }
        ]
      };
    }
  }

  // Default healthy / steady state
  return {
    status: 'diagnosed',
    provisional_diagnosis: 'Healthy Foliar Equilibrium & Steady Growth',
    confidence_level: 'High (0.92)',
    uncertainty_notes: 'Visual symptoms and ambient context indicate stable plant physiological health.',
    competing_hypotheses: [
      {
        hypothesis: 'Steady State Physiology',
        probability: 0.92,
        reason: 'Upright petioles, intact leaf cuticle, absence of stress marks.'
      },
      {
        hypothesis: 'Minor Seasonal Light Adaptation',
        probability: 0.08,
        reason: 'Natural seasonal light intensity shifts.'
      }
    ],
    supporting_and_conflicting_evidence: {
      supporting: [
        'Foliage holds firm structural turgor',
        'No chlorotic yellowing or necrotic spotting'
      ],
      conflicting: []
    },
    recommended_actions: [
      {
        id: 'local_maintain_care',
        title: 'Maintain Current Watering Cadence',
        description: 'Continue allowing topsoil to dry moderately before the next thorough watering.',
        urgency: 'low',
        reversible: true
      },
      {
        id: 'local_wipe_dust',
        title: 'Gently Wipe Leaf Dust',
        description: 'Wipe leaves with a damp cloth once a month to maximize photosynthesis.',
        urgency: 'low',
        reversible: true
      }
    ]
  };
}
