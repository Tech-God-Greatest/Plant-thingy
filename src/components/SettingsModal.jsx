import React, { useState } from 'react';
import { 
  X, 
  Key, 
  Cpu, 
  MapPin, 
  ShieldAlert, 
  Check, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Compass, 
  RefreshCw 
} from 'lucide-react';
import { 
  AVAILABLE_VISION_MODELS, 
  AVAILABLE_DIAGNOSTIC_MODELS, 
  CITY_PRESETS 
} from '../services/storageService';
import { getBrowserCoordinates } from '../services/weatherService';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onRefreshWeather
}) {
  if (!isOpen) return null;

  const [form, setForm] = useState({ ...settings });
  const [showKey, setShowKey] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [locMessage, setLocMessage] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleCityPresetChange = (e) => {
    const selectedCity = CITY_PRESETS.find(c => c.name === e.target.value);
    if (selectedCity) {
      setForm(prev => ({
        ...prev,
        locationMode: 'manual',
        manualCity: selectedCity.name,
        manualLat: selectedCity.lat,
        manualLon: selectedCity.lon
      }));
    }
  };

  const handleDetectLocation = async () => {
    setLocLoading(true);
    setLocMessage('');
    try {
      const coords = await getBrowserCoordinates();
      setForm(prev => ({
        ...prev,
        locationMode: 'auto',
        manualLat: parseFloat(coords.lat.toFixed(4)),
        manualLon: parseFloat(coords.lon.toFixed(4)),
        manualCity: 'Detected Location'
      }));
      setLocMessage('Location coordinates detected successfully!');
    } catch (err) {
      setLocMessage(`Could not access browser GPS (${err.message}). Using manual coordinates.`);
    } finally {
      setLocLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings(form);
    setSavedSuccess(true);
    if (onRefreshWeather) {
      onRefreshWeather(form);
    }
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Settings & API Configuration</h2>
              <p className="text-xs text-slate-400">Configure Groq API key, models, and Open-Meteo weather microclimate</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
          
          {/* Groq API Key Section */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                Groq API Key (Multimodal Vision & Reasoning)
              </label>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium underline"
              >
                Get Free API Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={form.groqApiKey}
                onChange={(e) => setForm({ ...form, groqApiKey: e.target.value })}
                placeholder="gsk_..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 pr-10 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Privacy & Storage Alert */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300/90 leading-relaxed">
              <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong>Local Storage Only:</strong> Your Groq API key is stored exclusively in your browser's private local storage. It is transmitted directly to Groq's official API endpoints and is never logged to any intermediary server.
              </div>
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-teal-400" />
              AI Model Engines
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vision Model */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Vision Model (Symptom & Foliage Inspection)
                </label>
                <select
                  value={form.visionModel}
                  onChange={(e) => setForm({ ...form, visionModel: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                >
                  {AVAILABLE_VISION_MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Processes captured leaf photos to extract structured symptom vectors.
                </p>
              </div>

              {/* Diagnostic Model */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Diagnostic Model (Reasoning & Differential Analysis)
                </label>
                <select
                  value={form.diagnosticModel}
                  onChange={(e) => setForm({ ...form, diagnosticModel: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                >
                  {AVAILABLE_DIAGNOSTIC_MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Weighs competing hypotheses, uncertainties, and formulates safe care plans.
                </p>
              </div>
            </div>
          </div>

          {/* Location & Microclimate Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                Open-Meteo Microclimate Location
              </h3>
              <span className="text-[11px] text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                100% Free • No API Key Needed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Presets */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  City Preset
                </label>
                <select
                  value={form.manualCity}
                  onChange={handleCityPresetChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                >
                  {CITY_PRESETS.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                  <option value="Custom">Custom Coordinates</option>
                </select>
              </div>

              {/* GPS Auto Detect */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Or Use Device GPS
                </label>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={locLoading}
                  className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium transition disabled:opacity-50"
                >
                  {locLoading ? <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" /> : <Compass className="w-4 h-4 text-emerald-400" />}
                  <span>{locLoading ? 'Detecting GPS...' : 'Auto-Detect via GPS'}</span>
                </button>
              </div>
            </div>

            {/* Lat / Long Coordinates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={form.manualLat}
                  onChange={(e) => setForm({ ...form, manualLat: parseFloat(e.target.value) || 0, manualCity: 'Custom' })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={form.manualLon}
                  onChange={(e) => setForm({ ...form, manualLon: parseFloat(e.target.value) || 0, manualCity: 'Custom' })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {locMessage && (
              <p className="text-xs text-amber-300 bg-amber-950/30 p-2.5 rounded-lg border border-amber-900/40">
                {locMessage}
              </p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 transition"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : null}
              <span>{savedSuccess ? 'Saved!' : 'Save & Apply'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
