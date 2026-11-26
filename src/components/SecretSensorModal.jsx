import React, { useState } from 'react';
import { 
  X, 
  Cpu, 
  Droplets, 
  Thermometer, 
  Sun, 
  Activity, 
  Sliders, 
  Sparkles, 
  Check, 
  Lock, 
  ShieldAlert,
  RotateCcw
} from 'lucide-react';
import { SENSOR_PRESETS, DEFAULT_SENSOR_CONFIG } from '../services/sensorSimulationService';

export default function SecretSensorModal({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  currentLiveTick
}) {
  if (!isOpen) return null;

  const [form, setForm] = useState({ ...config });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleApplyPreset = (preset) => {
    setForm(prev => ({
      ...prev,
      ...preset.values,
      activePreset: preset.id
    }));
  };

  const handleReset = () => {
    setForm({ ...DEFAULT_SENSOR_CONFIG });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveConfig(form);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col glow-emerald">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Indoor Telemetry Rig Calibration
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700 font-semibold uppercase">
                  Secret Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Override simulated in-pot sensors and natural organic fluctuations
              </p>
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
          
          {/* Quick Presets */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2.5 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Quick Physiological Simulation Presets:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SENSOR_PRESETS.map((p) => {
                const isSelected = form.activePreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className={`text-left p-3 rounded-xl border text-xs transition ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/50'
                        : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-slate-100 flex items-center justify-between">
                      <span>{p.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {p.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sensor Sliders */}
          <div className="space-y-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-teal-400" />
              Base Telemetry Parameters
            </h3>

            {/* Soil Moisture */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-300 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-sky-400" /> In-Pot Soil Moisture Probe
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  {form.baseSoilMoisture}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={form.baseSoilMoisture}
                onChange={(e) => setForm({ ...form, baseSoilMoisture: parseFloat(e.target.value), activePreset: 'custom' })}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0% (Bone Dry)</span>
                <span>40-60% (Optimal Moist)</span>
                <span>100% (Saturated)</span>
              </div>
            </div>

            {/* Indoor Temperature */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-300 flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-rose-400" /> Indoor Room Temperature
                </span>
                <span className="font-mono font-bold text-rose-400">
                  {form.baseIndoorTemp}°C
                </span>
              </div>
              <input
                type="range"
                min="12"
                max="40"
                step="0.2"
                value={form.baseIndoorTemp}
                onChange={(e) => setForm({ ...form, baseIndoorTemp: parseFloat(e.target.value), activePreset: 'custom' })}
                className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>12°C (Cold Draft)</span>
                <span>22-26°C (Ideal)</span>
                <span>40°C (Heat Stress)</span>
              </div>
            </div>

            {/* Indoor Humidity */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-300 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-blue-400" /> Indoor Relative Humidity
                </span>
                <span className="font-mono font-bold text-blue-400">
                  {form.baseIndoorHumidity}%
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="95"
                step="0.5"
                value={form.baseIndoorHumidity}
                onChange={(e) => setForm({ ...form, baseIndoorHumidity: parseFloat(e.target.value), activePreset: 'custom' })}
                className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>15% (Dry HVAC Air)</span>
                <span>50-65% (Tropical)</span>
                <span>95% (Greenhouse)</span>
              </div>
            </div>

            {/* Light Level Lux */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-300 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" /> Canopy Light Intensity
                </span>
                <span className="font-mono font-bold text-amber-400">
                  {form.baseLightLevel} Lux
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="4000"
                step="20"
                value={form.baseLightLevel}
                onChange={(e) => setForm({ ...form, baseLightLevel: parseInt(e.target.value, 10), activePreset: 'custom' })}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>50 Lux (Dark)</span>
                <span>800-1500 Lux (Bright Indirect)</span>
                <span>4000 Lux (Direct Sun)</span>
              </div>
            </div>

          </div>

          {/* Organic Fluctuation Settings */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  Natural Organic Sensor Jitter
                </h4>
                <p className="text-[11px] text-slate-400">
                  Generates subtle, lifelike Brownian micro-fluctuations every 3 seconds
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.fluctuationsEnabled}
                  onChange={(e) => setForm({ ...form, fluctuationsEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {form.fluctuationsEnabled && (
              <div className="pt-2">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Jitter Intensity</span>
                  <span className="font-mono text-emerald-400">{form.fluctuationIntensity}x</span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="2.5"
                  step="0.1"
                  value={form.fluctuationIntensity}
                  onChange={(e) => setForm({ ...form, fluctuationIntensity: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Live Preview Pill */}
          {currentLiveTick && (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Active Telemetry Feed Sent to Groq:
              </span>
              <div className="font-mono text-[11px] text-emerald-300 space-x-2">
                <span>Soil: {currentLiveTick.soilMoisture}%</span>
                <span>•</span>
                <span>Temp: {currentLiveTick.indoorTemp}°C</span>
                <span>•</span>
                <span>RH: {currentLiveTick.indoorHumidity}%</span>
                <span>•</span>
                <span>{currentLiveTick.lightLevel} Lux</span>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/60 transition"
              >
                {savedSuccess ? <Check className="w-4 h-4" /> : null}
                <span>{savedSuccess ? 'Applied!' : 'Save & Calibrate'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
