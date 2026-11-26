// Curated Botanical Sample Scenarios for Testing Without a Camera / Live Plant

// Helpers to generate clear SVG plant illustrations as base64 data URLs
function createPlantSvgDataUrl({ bgColor, foliageColor, leafVariegation, symptomOverlay, label }) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgColor[0]}" />
        <stop offset="100%" stop-color="${bgColor[1]}" />
      </linearGradient>
      <linearGradient id="pot" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#9a4731" />
        <stop offset="50%" stop-color="#be5d44" />
        <stop offset="100%" stop-color="#803522" />
      </linearGradient>
      <radialGradient id="soil" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#3d2817" />
        <stop offset="100%" stop-color="#1f140b" />
      </radialGradient>
      <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="8" stdDeviation="6" flood-opacity="0.35"/>
      </filter>
    </defs>
    
    <!-- Background Wall/Table -->
    <rect width="400" height="400" fill="url(#bg)"/>
    <rect y="310" width="400" height="90" fill="#1e293b" opacity="0.6"/>
    <line x1="0" y1="310" x2="400" y2="310" stroke="#334155" stroke-width="2"/>

    <!-- Plant Pot -->
    <ellipse cx="200" cy="330" rx="60" ry="14" fill="#0f172a" opacity="0.5"/>
    <!-- Saucer -->
    <path d="M125 315 C125 328, 275 328, 275 315 L265 305 L135 305 Z" fill="#782d1c"/>
    <!-- Pot Body -->
    <path d="M140 230 L155 310 Q200 320 245 310 L260 230 Z" fill="url(#pot)" filter="url(#shadow)"/>
    <!-- Pot Rim -->
    <ellipse cx="200" cy="230" rx="62" ry="12" fill="#be5d44"/>
    <ellipse cx="200" cy="230" rx="56" ry="9" fill="url(#soil)"/>

    <!-- Vines / Stems -->
    <path d="M200 230 Q170 190 140 160" stroke="#4a6b3e" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M200 230 Q225 180 250 140" stroke="#4a6b3e" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M200 230 Q195 150 200 110" stroke="#4a6b3e" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <path d="M200 230 Q240 230 270 250" stroke="#4a6b3e" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M200 230 Q160 240 130 260" stroke="#4a6b3e" stroke-width="3.5" fill="none" stroke-linecap="round"/>

    <!-- Leaves (Pothos Heart Shaped) -->
    <!-- Leaf 1 (Left High) -->
    <path d="M140 160 C110 140, 95 175, 125 200 C145 220, 155 190, 140 160 Z" fill="${foliageColor[0]}" stroke="#2d4a25" stroke-width="1.5"/>
    <path d="M135 168 Q128 185 125 198" stroke="#7eb872" stroke-width="1.2" fill="none"/>
    ${leafVariegation ? `<path d="M130 170 Q115 178 122 188" stroke="#d5f57a" stroke-width="2.5" fill="none" opacity="0.8"/>` : ''}

    <!-- Leaf 2 (Center Top) -->
    <path d="M200 110 C170 80, 160 120, 195 150 C220 170, 230 130, 200 110 Z" fill="${foliageColor[1]}" stroke="#2d4a25" stroke-width="1.5"/>
    <path d="M195 118 Q192 135 195 148" stroke="#7eb872" stroke-width="1.2" fill="none"/>

    <!-- Leaf 3 (Right High) -->
    <path d="M250 140 C280 120, 300 155, 270 180 C245 200, 235 170, 250 140 Z" fill="${foliageColor[2]}" stroke="#2d4a25" stroke-width="1.5"/>
    <path d="M253 148 Q262 165 268 178" stroke="#7eb872" stroke-width="1.2" fill="none"/>

    <!-- Leaf 4 (Trailing Left) -->
    <path d="M130 260 C90 250, 95 290, 125 305 C150 315, 155 285, 130 260 Z" fill="${foliageColor[3]}" stroke="#2d4a25" stroke-width="1.5"/>

    <!-- Leaf 5 (Trailing Right) -->
    <path d="M270 250 C310 240, 310 280, 280 300 C255 315, 250 280, 270 250 Z" fill="${foliageColor[4]}" stroke="#2d4a25" stroke-width="1.5"/>

    <!-- Symptom Overlays (Chlorosis, browning, drooping, scorch) -->
    ${symptomOverlay}

    <!-- Label Banner -->
    <rect x="20" y="20" rx="8" width="360" height="34" fill="#0f172a" opacity="0.85" stroke="#334155" stroke-width="1"/>
    <text x="200" y="42" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="13" font-weight="600" text-anchor="middle">
      ${label}
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_SCENARIOS = [
  {
    id: 'sample_healthy',
    title: 'Healthy Golden Pothos',
    subtitle: 'Vibrant green, high turgor pressure, clean foliage',
    tag: 'Baseline Healthy',
    tagColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-700',
    imageDataUrl: createPlantSvgDataUrl({
      bgColor: ['#062e22', '#0f172a'],
      foliageColor: ['#22c55e', '#16a34a', '#22c55e', '#15803d', '#16a34a'],
      leafVariegation: true,
      symptomOverlay: `
        <!-- Crisp glistening leaf highlights -->
        <circle cx="132" cy="180" r="1.5" fill="#ffffff" opacity="0.6"/>
        <circle cx="265" cy="165" r="1.5" fill="#ffffff" opacity="0.6"/>
      `,
      label: 'SAMPLE: Healthy Epipremnum aureum (Firm, glossy foliage)'
    }),
    mockTactile: {
      soilMoisture: 'dry_top',
      potWeight: 'normal',
      drainageStatus: 'clear',
      lastWateredDays: 4,
      draftExposure: 'none'
    },
    mockVisionResult: {
      visible_symptoms: ['healthy_foliage', 'glossy_cuticle', 'erect_petioles'],
      affected_areas: ['none'],
      severity: 'none',
      confidence: 0.94,
      visual_notes: 'Specimen exhibits robust cellular turgor with upright, well-supported petioles. Leaf margins are intact with no necrotic borders or chlorotic venation. Classic golden-yellow variegation is clean.'
    },
    mockDiagnosis: {
      status: 'diagnosed',
      provisional_diagnosis: 'Robust Physiological Health (Optimal Condition)',
      confidence_level: 'High (0.94)',
      uncertainty_notes: 'Visual indicators, cellular turgor, and ambient microclimate all converge on healthy botanical status. Minimal diagnostic uncertainty.',
      competing_hypotheses: [
        {
          hypothesis: 'Optimal Hydration & Light Equilibrium',
          probability: 0.92,
          reason: 'Firm petiole posture, active growth tips, and absence of stress pigment.'
        },
        {
          hypothesis: 'Early Stage Moisture Fluctuation',
          probability: 0.08,
          reason: 'Routine baseline consideration; no macroscopic signs observed.'
        }
      ],
      supporting_and_conflicting_evidence: {
        supporting: [
          'Erect petioles (90-110° angle relative to vine)',
          'Intact cell membranes with no soft watery margins',
          'Healthy coloration without chlorotic yellow halo'
        ],
        conflicting: [
          'No visible necrotic spots or leaf margin crisping'
        ]
      },
      recommended_actions: [
        {
          id: 'action_maintain_schedule',
          title: 'Maintain current moisture cycle',
          description: 'Wait until the top 1.5–2 inches of soil feel dry to the touch before the next deep soak.',
          urgency: 'low',
          reversible: true
        },
        {
          id: 'action_rotate_pot',
          title: 'Quarter-turn pot orientation',
          description: 'Rotate the planter 90° weekly to promote even foliage density facing your light source.',
          urgency: 'low',
          reversible: true
        }
      ]
    }
  },
  {
    id: 'sample_overwatered',
    title: 'Overwatered Droop & Chlorosis',
    subtitle: 'Limp petioles despite wet soil, yellowing lower leaves',
    tag: 'Root Hypoxia Risk',
    tagColor: 'text-rose-400 bg-rose-950/60 border-rose-700',
    imageDataUrl: createPlantSvgDataUrl({
      bgColor: ['#2e1515', '#0f172a'],
      foliageColor: ['#857f36', '#4a6331', '#9e963b', '#2c3d1f', '#6b5e28'],
      leafVariegation: false,
      symptomOverlay: `
        <!-- Chlorosis yellow blotches on lower leaf -->
        <ellipse cx="125" cy="285" rx="18" ry="12" fill="#eab308" opacity="0.85"/>
        <ellipse cx="130" cy="288" rx="8" ry="5" fill="#713f12" opacity="0.75"/>
        <!-- Droop petiole browning -->
        <circle cx="200" cy="232" r="5" fill="#3f2314"/>
        <!-- Soft brown soggy leaf tip on trailing leaf -->
        <path d="M265 290 Q275 305 282 300 Z" fill="#451a03"/>
      `,
      label: 'SAMPLE: Overwatered Pothos (Limp foliage, yellowing bases)'
    }),
    mockTactile: {
      soilMoisture: 'soggy',
      potWeight: 'heavy',
      drainageStatus: 'standing_water',
      lastWateredDays: 1,
      draftExposure: 'none'
    },
    mockVisionResult: {
      visible_symptoms: ['turgor_loss', 'chlorosis', 'soft_browning', 'epinasty_droop'],
      affected_areas: ['older_basal_leaves', 'petioles', 'leaf_tips'],
      severity: 'moderate',
      confidence: 0.88,
      visual_notes: 'Petioles display generalized limp drooping (epinastic curvature). Older lower leaves display diffuse interveinal chlorosis and water-soaked softening at leaf margins. Stems appear slightly dark near soil line.'
    },
    mockDiagnosis: {
      status: 'diagnosed',
      provisional_diagnosis: 'Root Zone Hypoxia / Early Root Suffocation from Soil Saturation',
      confidence_level: 'High-Moderate (0.87)',
      uncertainty_notes: 'While drooping foliage superficially mimics underwatering, the presence of soggy soil, heavy pot weight, and soft yellowing basal leaves strongly conflicts with drought stress.',
      competing_hypotheses: [
        {
          hypothesis: 'Overwatering & Root Oxygen Deprivation',
          probability: 0.82,
          reason: 'Droop coincides with waterlogged soil and chlorotic lower leaves.'
        },
        {
          hypothesis: 'Underwatering / Vascular Dehydration',
          probability: 0.12,
          reason: 'Leaves are droopy, but soil is wet, which fundamentally invalidates simple drought.'
        },
        {
          hypothesis: 'Bacterial Soft Rot / Fungal Pythium',
          probability: 0.06,
          reason: 'Possible if anaerobic conditions have persisted longer than 10-14 days.'
        }
      ],
      supporting_and_conflicting_evidence: {
        supporting: [
          'Potting soil is damp/soggy and saucer contains standing runoff',
          'Older leaves yellowing first (mobile nitrogen reabsorption under stress)',
          'Soft, damp browning rather than brittle dry margins'
        ],
        conflicting: [
          'Outdoor humidity is moderate, ruling out extreme transpiration shock'
        ]
      },
      recommended_actions: [
        {
          id: 'action_drain_saucer',
          title: 'Empty Saucer Immediately',
          description: 'Discard any pooling runoff water trapped in the drainage tray or decorative cachepot.',
          urgency: 'high',
          reversible: true
        },
        {
          id: 'action_aerobic_dry',
          title: 'Suspend Watering & Aerate Soil Top',
          description: 'Halt all irrigation. Gently poke 4-5 ventilation holes in topsoil using a clean chopstick to introduce air.',
          urgency: 'high',
          reversible: true
        },
        {
          id: 'action_bright_indirect',
          title: 'Boost Gentle Indirect Light & Air Circulation',
          description: 'Move 1-2 feet closer to a bright window (avoiding direct harsh sun) to encourage foliar transpiration.',
          urgency: 'medium',
          reversible: true
        }
      ]
    }
  },
  {
    id: 'sample_underwatered',
    title: 'Severe Underwatering / Dehydration',
    subtitle: 'Curled limp leaves, dry papery leaf tips, lightweight pot',
    tag: 'Drought Dehydration',
    tagColor: 'text-amber-400 bg-amber-950/60 border-amber-700',
    imageDataUrl: createPlantSvgDataUrl({
      bgColor: ['#261e12', '#0f172a'],
      foliageColor: ['#4d693f', '#445e38', '#547345', '#394d2f', '#47633b'],
      leafVariegation: false,
      symptomOverlay: `
        <!-- Inward leaf curling and dry crispy brown tips -->
        <path d="M120 195 Q115 208 123 205 Z" fill="#78350f"/>
        <path d="M260 172 Q270 185 264 180 Z" fill="#78350f"/>
        <!-- Dry soil gap indicator -->
        <ellipse cx="200" cy="230" rx="58" ry="10" stroke="#78350f" stroke-width="1.5" fill="none" opacity="0.6"/>
      `,
      label: 'SAMPLE: Underwatered Pothos (Inward curling, light dry pot)'
    }),
    mockTactile: {
      soilMoisture: 'bone_dry',
      potWeight: 'very_light',
      drainageStatus: 'clear',
      lastWateredDays: 14,
      draftExposure: 'none'
    },
    mockVisionResult: {
      visible_symptoms: ['turgor_loss', 'inward_leaf_curling', 'crispy_brown_tips', 'dull_cuticle'],
      affected_areas: ['all_foliage', 'leaf_apices'],
      severity: 'moderate',
      confidence: 0.91,
      visual_notes: 'Foliage shows uniform loss of hydrostatic pressure. Leaves are curling inward lengthwise to minimize exposed surface area. Leaf tips are crisp and brittle rather than soft.'
    },
    mockDiagnosis: {
      status: 'diagnosed',
      provisional_diagnosis: 'Vascular Dehydration / Acute Soil Drought Stress',
      confidence_level: 'High (0.92)',
      uncertainty_notes: 'Clear alignment across limp turgor, curled leaf margins, bone-dry soil, and exceptionally light planter weight.',
      competing_hypotheses: [
        {
          hypothesis: 'Primary Underwatering & Soil Hydrophobia',
          probability: 0.90,
          reason: 'Foliage curls inwards, potting soil has pulled away from pot walls.'
        },
        {
          hypothesis: 'Dry Atmospheric VPD Shock',
          probability: 0.10,
          reason: 'May accelerate leaf tip desiccation, though root dehydration is the driver.'
        }
      ],
      supporting_and_conflicting_evidence: {
        supporting: [
          'Pot feels unusually feather-light when lifted',
          'Soil is dry more than 2 inches deep and contracted from rim',
          'Leaves are papery and thin rather than mushy'
        ],
        conflicting: [
          'No yellowing of basal stems characteristic of root suffocation'
        ]
      },
      recommended_actions: [
        {
          id: 'action_bottom_water',
          title: 'Bottom Soak or Thorough Drench',
          description: 'Submerge the pot in a bowl of lukewarm water for 25–30 minutes until the root ball rehydrates completely, then drain thoroughly.',
          urgency: 'high',
          reversible: true
        },
        {
          id: 'action_trim_crisp',
          title: 'Safe Cosmetic Trimming',
          description: 'Gently snip off completely dried, crispy brown tips using sterilized scissors, leaving a tiny margin of brown so live tissue is not cut.',
          urgency: 'low',
          reversible: true
        }
      ]
    }
  },
  {
    id: 'sample_sunburn',
    title: 'Sunburn / Photo-Oxidative Scorch',
    subtitle: 'Bleached white/tan crispy patches on upper leaves',
    tag: 'Light Scorch',
    tagColor: 'text-yellow-400 bg-yellow-950/60 border-yellow-700',
    imageDataUrl: createPlantSvgDataUrl({
      bgColor: ['#282613', '#0f172a'],
      foliageColor: ['#22c55e', '#16a34a', '#22c55e', '#15803d', '#16a34a'],
      leafVariegation: true,
      symptomOverlay: `
        <!-- Scorch bleach patches on top center leaf directly under sun -->
        <ellipse cx="185" cy="130" rx="14" ry="9" fill="#fef08a" opacity="0.9"/>
        <ellipse cx="185" cy="130" rx="9" ry="5" fill="#f59e0b" opacity="0.8"/>
        <circle cx="186" cy="130" r="3" fill="#78350f"/>
      `,
      label: 'SAMPLE: Sunburn Scorch (Bleached paper-like patches on top)'
    }),
    mockTactile: {
      soilMoisture: 'dry_top',
      potWeight: 'normal',
      drainageStatus: 'clear',
      lastWateredDays: 3,
      draftExposure: 'sunny_sill'
    },
    mockVisionResult: {
      visible_symptoms: ['localized_necrosis', 'photo_bleaching', 'foliar_scorch'],
      affected_areas: ['uppermost_exposed_leaves'],
      severity: 'mild',
      confidence: 0.89,
      visual_notes: 'Upper sun-facing leaves feature irregular bleached straw-colored necrotic patches with crisp brown centers. Lower shaded leaves remain undamaged.'
    },
    mockDiagnosis: {
      status: 'diagnosed',
      provisional_diagnosis: 'Photo-Oxidative Solar Scorch (Direct UV Radiation Damage)',
      confidence_level: 'High (0.89)',
      uncertainty_notes: 'Damage is strictly localized to upward-facing leaf surfaces exposed to direct window rays. Cellular damage is permanent on affected patches but harmless to overall plant health if light is softened.',
      competing_hypotheses: [
        {
          hypothesis: 'Direct Solar Radiation Scorch',
          probability: 0.85,
          reason: 'Bleaching is confined strictly to direct light intercept angles.'
        },
        {
          hypothesis: 'Chemical Contact Burn / Fertilizer Splash',
          probability: 0.15,
          reason: 'Can create similar localized scorch spots if foliar sprays dried under sun.'
        }
      ],
      supporting_and_conflicting_evidence: {
        supporting: [
          'Only highest canopy leaves exhibit bleach spots',
          'Pothos is an understory vine intolerant of intense unshielded solar rays',
          'Soil moisture and root health appear completely intact'
        ],
        conflicting: [
          'No generalized yellowing or fungal halo rings'
        ]
      },
      recommended_actions: [
        {
          id: 'action_diffuse_light',
          title: 'Diffuse or Relocate Light Source',
          description: 'Step the plant back 2–3 feet from the window or install a sheer curtain to convert harsh direct sun into bright indirect illumination.',
          urgency: 'high',
          reversible: true
        },
        {
          id: 'action_leave_scorch',
          title: 'Preserve Majority Leaf Tissue',
          description: 'Do not remove partially scorched leaves if they are still mostly green, as they continue to photosynthesize and sustain the vine.',
          urgency: 'low',
          reversible: true
        }
      ]
    }
  }
];
