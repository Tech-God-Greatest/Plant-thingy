import React, { useState } from 'react';
import { 
  CloudSun, 
  Thermometer, 
  Droplets, 
  Wind, 
  Cloud, 
  Gauge, 
  Info, 
  RefreshCw, 
  Hand,
  Cpu,
  Sun,
  Activity,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function EnvironmentCard({
  weatherData,
  isRefreshingWeather,
  onRefreshWeather,
  tactileData,
  onChangeTactileData,
  indoorSensorTick,
  onOpenSecretModal
}) {
  const [clickCount, setClickCount] = useState(0);

  const updateField = (field, value) => {
    onChangeTactileData({
      ...tactileData,
      [field]: value
    });
  };

  // Secret triple click handler on badge
  const handleSecretTripleClick = () => {
    const next = clickCount + 1;
    setClickCount(next);
    if (next >= 3) {
      setClickCount(0);
      onOpenSecretModal();
    } else {
      setTimeout(() => setClickCount(0), 1200);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-950/70 border border-amber-800/60 flex items-center justify-center text-amber-400">
            <CloudSun className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              2. Environmental & Microclimate Telemetry
            </h3>
            <p className="text-xs text-slate-400">
              Open-Meteo external climate + live indoor sensor rig + tactile checks
            </p>
          </div>
        </div>

        <button
          onClick={onRefreshWeather}
          disabled={isRefreshingWeather}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
          title="Refresh Open-Meteo Forecast"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingWeather ? 'animate-spin text-emerald-400' : ''}`} />
        </button>
      </div>

      {/* SECTION A: INDOOR TELEMETRY SENSOR RIG (Fluctuating) */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Indoor Telemetry Rig (In-Pot Probes)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Live pulsing stream badge (Triple click to trigger secret modal) */}
            <button
              type="button"
              onClick={handleSecretTripleClick}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-[10px] font-mono text-emerald-400 hover:border-emerald-500 transition cursor-pointer select-none"
              title="Live fluctuating sensor telemetry (Click to calibrate)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE • 3s Jitter</span>
            </button>

            {/* Secret Calibration Trigger Button */}
            <button
              type="button"
              onClick={onOpenSecretModal}
              className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 border border-slate-700 transition"
              title="Secret Telemetry Calibration & Overrides"
            >
              <SlidersHorizontal className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Live Fluctuating Sensor Grid */}
        {indoorSensorTick && (
          <div className="grid grid-cols-2 gap-2.5">
            {/* In-Pot Soil Moisture */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 text-[11px]">
                  <Droplets className="w-3 h-3 text-sky-400" /> Soil Probe
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${indoorSensorTick.soilCategory?.badge || 'border-slate-700'}`}>
                  {indoorSensorTick.soilCategory?.label.split(' ')[0] || 'Moist'}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-mono font-bold text-white tracking-tight">
                  {indoorSensorTick.soilMoisture}%
                </span>
                <span className="text-[10px] text-slate-500 font-mono">capacitive</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-700"
                  style={{ width: `${Math.min(100, indoorSensorTick.soilMoisture)}%` }}
                />
              </div>
            </div>

            {/* Light Intensity Lux */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 text-[11px]">
                  <Sun className="w-3 h-3 text-amber-400" /> Canopy Light
                </span>
                <span className="text-[10px] text-amber-400 font-medium truncate max-w-[80px]">
                  {indoorSensorTick.lightLevel > 600 ? 'Bright' : 'Low'}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-mono font-bold text-white tracking-tight">
                  {indoorSensorTick.lightLevel} <span className="text-xs text-slate-400 font-normal">Lux</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">photodiode</span>
              </div>
              <span className="text-[10px] text-slate-400 truncate block">
                {indoorSensorTick.lightCategory?.label}
              </span>
            </div>

            {/* Indoor Temperature */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 text-[11px]">
                  <Thermometer className="w-3 h-3 text-rose-400" /> Room Temp
                </span>
                <span className="text-[10px] text-slate-500 font-mono">ambient</span>
              </div>
              <div className="text-lg font-mono font-bold text-white tracking-tight">
                {indoorSensorTick.indoorTemp}°C
              </div>
              <span className="text-[10px] text-slate-400 block">
                {indoorSensorTick.indoorTemp > 26 ? 'Warm draft' : indoorSensorTick.indoorTemp < 18 ? 'Cool draft' : 'Optimal comfort'}
              </span>
            </div>

            {/* Indoor Humidity */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 text-[11px]">
                  <Droplets className="w-3 h-3 text-blue-400" /> Room RH
                </span>
                <span className="text-[10px] text-slate-500 font-mono">hygrometer</span>
              </div>
              <div className="text-lg font-mono font-bold text-white tracking-tight">
                {indoorSensorTick.indoorHumidity}% <span className="text-xs text-slate-400 font-normal">RH</span>
              </div>
              <span className="text-[10px] text-slate-400 block">
                {indoorSensorTick.indoorHumidity < 40 ? 'Dry air' : 'Comfortable foliar'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* SECTION B: OPEN-METEO OUTDOOR METRICS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <CloudSun className="w-3.5 h-3.5 text-sky-400" />
            External Ambient Weather (Open-Meteo)
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
            Free Meteorological API
          </span>
        </div>

        {weatherData ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Outdoor Temp */}
            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block">Outdoor Temp</span>
              <div className="text-base font-bold text-white">
                {weatherData.temperature}°C
              </div>
              <span className="text-[10px] text-slate-400 truncate block">
                {weatherData.weatherDescription}
              </span>
            </div>

            {/* Outdoor Humidity */}
            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block">Outdoor RH</span>
              <div className="text-base font-bold text-white">
                {weatherData.humidity}%
              </div>
              <span className="text-[10px] text-slate-400 truncate block">
                Ambient moisture
              </span>
            </div>

            {/* Foliar VPD */}
            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block">Foliar VPD</span>
              <div className="text-base font-bold text-white">
                {weatherData.vpdKpa} <span className="text-[10px] text-slate-400 font-normal">kPa</span>
              </div>
              <span className={`text-[10px] font-semibold truncate block ${weatherData.vpdStatus?.badgeColor?.split(' ')[0] || 'text-emerald-400'}`}>
                {weatherData.vpdStatus?.label || 'Optimal'}
              </span>
            </div>

            {/* Sky / Cloud */}
            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block">Sky & Wind</span>
              <div className="text-sm font-semibold text-slate-200 mt-0.5">
                {weatherData.cloudCover}% Cloud
              </div>
              <span className="text-[10px] text-slate-400 block truncate">
                {weatherData.windSpeed} km/h wind
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-slate-800/30 text-xs text-slate-400 text-center animate-pulse">
            Connecting to Open-Meteo API...
          </div>
        )}
      </div>

      {/* SECTION C: USER TACTILE ROOT CHECKS */}
      <div className="space-y-4 pt-1 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <Hand className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            User Physical Verification (Tactile Checks)
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Soil Moisture */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Manual Soil Touch Test (1.5–2" depth):
            </label>
            <select
              value={tactileData.soilMoisture || 'dry_top'}
              onChange={(e) => updateField('soilMoisture', e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="bone_dry">Bone Dry (dusty, crumbly, pulls away from pot rim)</option>
              <option value="dry_top">Top 1-2" dry (cool/faintly damp at deeper roots)</option>
              <option value="moist">Moist throughout (damp to touch, clings to finger)</option>
              <option value="soggy">Soggy / Waterlogged (muddy, releases free water if pressed)</option>
            </select>
          </div>

          {/* Pot Weight */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Planter Lift Weight:
            </label>
            <select
              value={tactileData.potWeight || 'normal'}
              onChange={(e) => updateField('potWeight', e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="very_light">Feather-light (indicates fully dried root ball)</option>
              <option value="normal">Balanced / Moderate heft</option>
              <option value="heavy">Noticeably heavy (indicates water saturation)</option>
            </select>
          </div>

          {/* Drainage Saucer */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Drainage Saucer / Tray Status:
            </label>
            <select
              value={tactileData.drainageStatus || 'clear'}
              onChange={(e) => updateField('drainageStatus', e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="clear">Completely dry / emptied</option>
              <option value="moist">Damp residue (no standing puddle)</option>
              <option value="standing_water">Standing water pooling in saucer (High rot hazard!)</option>
            </select>
          </div>

          {/* Last Watered */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Days Since Last Watered:
            </label>
            <select
              value={tactileData.lastWateredDays ?? 3}
              onChange={(e) => updateField('lastWateredDays', parseInt(e.target.value, 10))}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value={0}>Today</option>
              <option value={1}>Yesterday (1 day ago)</option>
              <option value={3}>3–4 days ago</option>
              <option value={7}>1 week ago</option>
              <option value={14}>2 weeks ago</option>
              <option value={21}>3+ weeks ago</option>
            </select>
          </div>
        </div>

        {/* Freeform Observation Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Extra Indoor Clues (HVAC, recent repotting, AC vent proximity):
          </label>
          <input
            type="text"
            value={tactileData.userNote || ''}
            onChange={(e) => updateField('userNote', e.target.value)}
            placeholder="e.g. Sits 3 feet from AC vent; leaves started drooping 2 days after watering."
            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

    </div>
  );
}
