// Sensor Simulation Service
// Generates realistic fluctuating indoor telemetry (Soil Moisture, Indoor Temp, Humidity, Light Level)
// and handles secret override calibration.

const SENSOR_CONFIG_STORAGE_KEY = 'rootmind_secret_sensors';

export const SENSOR_PRESETS = [
  {
    id: 'optimal',
    name: 'Optimal Tropical (Healthy Equilibrium)',
    description: 'Soil 42%, 23.5°C, 55% RH, 900 Lux (Bright Indirect)',
    values: {
      baseSoilMoisture: 42.0,
      baseIndoorTemp: 23.5,
      baseIndoorHumidity: 55.0,
      baseLightLevel: 900
    }
  },
  {
    id: 'overwatered',
    name: 'Waterlogged / Root Rot Risk',
    description: 'Soil 84%, 19.0°C, 78% RH, 320 Lux (Soggy, cold, low evap)',
    values: {
      baseSoilMoisture: 84.0,
      baseIndoorTemp: 19.0,
      baseIndoorHumidity: 78.0,
      baseLightLevel: 320
    }
  },
  {
    id: 'underwatered',
    name: 'Severe Drought / Parched Soil',
    description: 'Soil 13%, 29.5°C, 25% RH, 1450 Lux (Dry, warm, thirsty)',
    values: {
      baseSoilMoisture: 13.0,
      baseIndoorTemp: 29.5,
      baseIndoorHumidity: 25.0,
      baseLightLevel: 1450
    }
  },
  {
    id: 'low_light',
    name: 'Light-Starved / Dark Shaded Corner',
    description: 'Soil 62%, 20.5°C, 52% RH, 75 Lux (Deep shade, slow transpiration)',
    values: {
      baseSoilMoisture: 62.0,
      baseIndoorTemp: 20.5,
      baseIndoorHumidity: 52.0,
      baseLightLevel: 75
    }
  }
];

export const DEFAULT_SENSOR_CONFIG = {
  enabled: true,
  fluctuationsEnabled: true,
  fluctuationIntensity: 1.0,
  baseSoilMoisture: 44.5,
  baseIndoorTemp: 23.2,
  baseIndoorHumidity: 52.5,
  baseLightLevel: 880,
  activePreset: 'optimal'
};

export const sensorSimulationService = {
  getConfig() {
    try {
      const data = localStorage.getItem(SENSOR_CONFIG_STORAGE_KEY);
      return data ? { ...DEFAULT_SENSOR_CONFIG, ...JSON.parse(data) } : DEFAULT_SENSOR_CONFIG;
    } catch (e) {
      console.warn('Failed to load sensor config:', e);
      return DEFAULT_SENSOR_CONFIG;
    }
  },

  saveConfig(config) {
    try {
      const current = this.getConfig();
      const updated = { ...current, ...config };
      localStorage.setItem(SENSOR_CONFIG_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to save sensor config:', e);
      return null;
    }
  },

  /**
   * Generates a single jittered tick based on current base config
   */
  generateLiveTick(config, tickIndex = 0) {
    if (!config.fluctuationsEnabled) {
      return {
        soilMoisture: parseFloat(config.baseSoilMoisture.toFixed(1)),
        indoorTemp: parseFloat(config.baseIndoorTemp.toFixed(1)),
        indoorHumidity: parseFloat(config.baseIndoorHumidity.toFixed(1)),
        lightLevel: Math.round(config.baseLightLevel),
        soilCategory: this.getSoilCategory(config.baseSoilMoisture),
        lightCategory: this.getLightCategory(config.baseLightLevel),
        timestamp: new Date().toISOString()
      };
    }

    const intensity = config.fluctuationIntensity ?? 1.0;

    // Organic wave + small random jitter
    const wave = Math.sin(tickIndex * 0.4);
    const cosWave = Math.cos(tickIndex * 0.35);

    // Soil moisture fluctuates very slowly (capacitive drift)
    const soilNoise = (wave * 0.3 + (Math.random() - 0.5) * 0.25) * intensity;
    const soilMoisture = Math.max(0, Math.min(100, config.baseSoilMoisture + soilNoise));

    // Temperature fluctuates slightly
    const tempNoise = (cosWave * 0.18 + (Math.random() - 0.5) * 0.15) * intensity;
    const indoorTemp = Math.max(10, Math.min(45, config.baseIndoorTemp + tempNoise));

    // Humidity drifts
    const humNoise = (-wave * 0.5 + (Math.random() - 0.5) * 0.4) * intensity;
    const indoorHumidity = Math.max(10, Math.min(99, config.baseIndoorHumidity + humNoise));

    // Light level flickers realistically like room daylight / clouds
    const lightNoise = (wave * 25 + (Math.random() - 0.5) * 20) * intensity;
    const lightLevel = Math.max(0, Math.round(config.baseLightLevel + lightNoise));

    return {
      soilMoisture: parseFloat(soilMoisture.toFixed(1)),
      indoorTemp: parseFloat(indoorTemp.toFixed(1)),
      indoorHumidity: parseFloat(indoorHumidity.toFixed(1)),
      lightLevel,
      soilCategory: this.getSoilCategory(soilMoisture),
      lightCategory: this.getLightCategory(lightLevel),
      timestamp: new Date().toISOString()
    };
  },

  getSoilCategory(pct) {
    if (pct < 18) return { label: 'Parched / Bone Dry', color: 'text-amber-400', badge: 'bg-amber-950/60 border-amber-800' };
    if (pct < 32) return { label: 'Dry (Watering Window)', color: 'text-yellow-400', badge: 'bg-yellow-950/60 border-yellow-800' };
    if (pct <= 60) return { label: 'Ideal Moist (Aerated)', color: 'text-emerald-400', badge: 'bg-emerald-950/60 border-emerald-800' };
    if (pct <= 75) return { label: 'High Moisture / Damp', color: 'text-sky-400', badge: 'bg-sky-950/60 border-sky-800' };
    return { label: 'Saturated / Hypoxia Risk', color: 'text-rose-400', badge: 'bg-rose-950/60 border-rose-800' };
  },

  getLightCategory(lux) {
    if (lux < 150) return { label: 'Deep Shade (<150 Lux)', color: 'text-slate-400' };
    if (lux < 600) return { label: 'Low/Medium Indirect (150-600 Lux)', color: 'text-teal-400' };
    if (lux <= 2500) return { label: 'Bright Indirect (600-2500 Lux)', color: 'text-emerald-400' };
    return { label: 'Direct Intense Sunlight (>2500 Lux)', color: 'text-amber-400' };
  }
};
