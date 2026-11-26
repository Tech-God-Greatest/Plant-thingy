// Storage Service for RootMind (Browser LocalStorage)

const STORAGE_KEYS = {
  PLANTS: 'rootmind_plants',
  ACTIVE_PLANT: 'rootmind_active_plant_id',
  CHECKUPS: 'rootmind_checkups',
  SETTINGS: 'rootmind_settings',
  CARE_LOGS: 'rootmind_care_logs'
};

export const DEFAULT_PLANT = {
  id: 'plant_pothos_default',
  name: 'Living Room Pothos',
  species: 'Epipremnum aureum (Golden Pothos / Money Plant)',
  commonName: 'Pothos',
  placement: 'indoor_indirect', // indoor_indirect, indoor_low_light, balcony_shaded, sunny_window
  placementLabel: 'Indoor (Bright Indirect Light)',
  potDrainage: 'holes_saucer', // holes_saucer, no_holes, self_watering, fabric_pot
  potDrainageLabel: 'Drainage holes with saucer',
  potSize: '6-inch nursery pot',
  pottingMix: 'Well-draining indoor potting soil with perlite',
  wateringPreference: 'Allow top 1.5 - 2 inches of soil to dry between thorough waterings',
  notes: 'Tolerant of typical indoor humidity (40-60%). Susceptible to root rot if standing water remains in saucer.',
  createdAt: new Date().toISOString()
};

export const DEFAULT_SETTINGS = {
  groqApiKey: import.meta.env.VITE_GROQ_API_KEY || '',
  visionModel: 'qwen/qwen3.8-27b',
  diagnosticModel: 'openai/gpt-oss-120b',
  checkupMode: 'interactive', // 'interactive' or 'quick'
  locationMode: 'auto', // 'auto' or 'manual'
  manualCity: 'New Delhi',
  manualLat: 28.6139,
  manualLon: 77.2090
};

// Available Curated Models on Groq
export const AVAILABLE_VISION_MODELS = [
  { id: 'qwen/qwen3.8-27b', name: 'Qwen 3.8 27B Vision (Default - High accuracy multimodal)' },
  { id: 'meta-llama/llama-4-scout-17b-16e-preview', name: 'Llama 4 Scout 17B (Fast Vision Preview)' },
  { id: 'llama-3.2-11b-vision-preview', name: 'Llama 3.2 11B Vision (Multimodal)' }
];

export const AVAILABLE_DIAGNOSTIC_MODELS = [
  { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B (Default - Deep Diagnostic Reasoning)' },
  { id: 'qwen/qwen3.8-27b', name: 'Qwen 3.8 27B (Multimodal + Reasoning)' },
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile (Detailed Botanical Synthesis)' }
];

export const CITY_PRESETS = [
  { name: 'New Delhi, India', lat: 28.6139, lon: 77.2090 },
  { name: 'London, UK', lat: 51.5074, lon: -0.1278 },
  { name: 'New York, USA', lat: 40.7128, lon: -74.0060 },
  { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'Berlin, Germany', lat: 52.5200, lon: 13.4050 },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { name: 'San Francisco, USA', lat: 37.7749, lon: -122.4194 },
  { name: 'Sydney, Australia', lat: -33.8688, lon: 151.2093 }
];

export const storageService = {
  // Settings
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (e) {
      console.error('Failed to parse settings from localStorage', e);
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings) {
    try {
      const current = this.getSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
      return null;
    }
  },

  // Plants
  getPlants() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLANTS);
      if (!data) {
        // Initialize with default plant
        const initial = [DEFAULT_PLANT];
        localStorage.setItem(STORAGE_KEYS.PLANTS, JSON.stringify(initial));
        return initial;
      }
      const list = JSON.parse(data);
      return Array.isArray(list) && list.length > 0 ? list : [DEFAULT_PLANT];
    } catch (e) {
      console.error('Failed to parse plants from localStorage', e);
      return [DEFAULT_PLANT];
    }
  },

  savePlant(plant) {
    try {
      const plants = this.getPlants();
      const existingIdx = plants.findIndex(p => p.id === plant.id);
      let updated;
      if (existingIdx >= 0) {
        updated = [...plants];
        updated[existingIdx] = { ...updated[existingIdx], ...plant, updatedAt: new Date().toISOString() };
      } else {
        const newPlant = {
          ...plant,
          id: plant.id || `plant_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          createdAt: new Date().toISOString()
        };
        updated = [...plants, newPlant];
      }
      localStorage.setItem(STORAGE_KEYS.PLANTS, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to save plant', e);
      return null;
    }
  },

  deletePlant(plantId) {
    try {
      const plants = this.getPlants().filter(p => p.id !== plantId);
      localStorage.setItem(STORAGE_KEYS.PLANTS, JSON.stringify(plants));
      // If deleted plant was active, reset active plant
      if (this.getActivePlantId() === plantId) {
        this.setActivePlantId(plants[0]?.id || DEFAULT_PLANT.id);
      }
      return plants;
    } catch (e) {
      console.error('Failed to delete plant', e);
      return null;
    }
  },

  getActivePlantId() {
    const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_PLANT);
    return id || DEFAULT_PLANT.id;
  },

  setActivePlantId(id) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PLANT, id);
  },

  getActivePlant() {
    const plants = this.getPlants();
    const activeId = this.getActivePlantId();
    return plants.find(p => p.id === activeId) || plants[0] || DEFAULT_PLANT;
  },

  // Checkups
  getCheckups(plantId = null) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHECKUPS);
      const list = data ? JSON.parse(data) : [];
      if (plantId) {
        return list.filter(c => c.plantId === plantId);
      }
      return list;
    } catch (e) {
      console.error('Failed to parse checkups', e);
      return [];
    }
  },

  saveCheckup(checkup) {
    try {
      const checkups = this.getCheckups();
      const newCheckup = {
        ...checkup,
        id: checkup.id || `chk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: checkup.timestamp || new Date().toISOString()
      };
      // Prepend so latest is first
      const updated = [newCheckup, ...checkups.filter(c => c.id !== newCheckup.id)];
      // Keep max 50 checkups to avoid filling localStorage
      const trimmed = updated.slice(0, 50);
      localStorage.setItem(STORAGE_KEYS.CHECKUPS, JSON.stringify(trimmed));
      return newCheckup;
    } catch (e) {
      console.error('Failed to save checkup', e);
      return null;
    }
  },

  deleteCheckup(checkupId) {
    try {
      const checkups = this.getCheckups().filter(c => c.id !== checkupId);
      localStorage.setItem(STORAGE_KEYS.CHECKUPS, JSON.stringify(checkups));
      return checkups;
    } catch (e) {
      console.error('Failed to delete checkup', e);
      return null;
    }
  },

  // Care Action Logs
  getCareLogs(plantId = null) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CARE_LOGS);
      const list = data ? JSON.parse(data) : [];
      if (plantId) {
        return list.filter(l => l.plantId === plantId);
      }
      return list;
    } catch (e) {
      console.error('Failed to parse care logs', e);
      return [];
    }
  },

  logCareAction(action) {
    try {
      const logs = this.getCareLogs();
      const entry = {
        ...action,
        id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString()
      };
      const updated = [entry, ...logs].slice(0, 100);
      localStorage.setItem(STORAGE_KEYS.CARE_LOGS, JSON.stringify(updated));
      return entry;
    } catch (e) {
      console.error('Failed to log care action', e);
      return null;
    }
  },

  // Export / Import
  exportAllData() {
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      plants: this.getPlants(),
      activePlantId: this.getActivePlantId(),
      checkups: this.getCheckups(),
      careLogs: this.getCareLogs(),
      settings: this.getSettings()
    }, null, 2);
  },

  importAllData(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.plants && Array.isArray(parsed.plants)) {
        localStorage.setItem(STORAGE_KEYS.PLANTS, JSON.stringify(parsed.plants));
      }
      if (parsed.activePlantId) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_PLANT, parsed.activePlantId);
      }
      if (parsed.checkups && Array.isArray(parsed.checkups)) {
        localStorage.setItem(STORAGE_KEYS.CHECKUPS, JSON.stringify(parsed.checkups));
      }
      if (parsed.careLogs && Array.isArray(parsed.careLogs)) {
        localStorage.setItem(STORAGE_KEYS.CARE_LOGS, JSON.stringify(parsed.careLogs));
      }
      if (parsed.settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed.settings));
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
};
