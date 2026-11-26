import React from 'react';
import { 
  Sprout, 
  Settings as SettingsIcon, 
  History, 
  Plus, 
  Sparkles, 
  Zap, 
  CloudSun, 
  Database,
  Edit2
} from 'lucide-react';

export default function Navbar({
  plants = [],
  activePlant,
  onSelectPlant,
  onOpenAddPlant,
  onOpenEditPlant,
  checkupMode,
  onToggleMode,
  weatherData,
  onOpenSettings,
  onOpenTimeline,
  onOpenBackup,
  hasApiKey,
  checkupCount = 0
}) {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-900/30">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  RootMind
                </span>
                <span className="hidden md:inline-block text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Zero Sensors • Vision + Weather
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Evidence-Based Plant Health & Diagnostic Assistant
              </p>
            </div>
          </div>

          {/* Plant Selector */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={activePlant?.id || ''}
                onChange={(e) => onSelectPlant(e.target.value)}
                className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-medium rounded-lg pl-3 pr-8 py-1.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-colors max-w-[150px] sm:max-w-[210px] truncate"
              >
                {plants.map((p) => (
                  <option key={p.id} value={p.id}>
                    🪴 {p.name} ({p.commonName || 'Plant'})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onOpenEditPlant}
              title="Edit Active Plant Profile"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onOpenAddPlant}
              title="Add New Plant"
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Plant</span>
            </button>
          </div>

          {/* Mode Toggle & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Interactive vs Quick Mode Toggle */}
            <div className="hidden lg:flex items-center p-1 bg-slate-800/80 rounded-xl border border-slate-700/80 text-xs">
              <button
                onClick={() => onToggleMode('interactive')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition ${
                  checkupMode === 'interactive'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Asks targeted clarifying questions before diagnosing"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Interactive Q&A</span>
              </button>
              <button
                onClick={() => onToggleMode('quick')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition ${
                  checkupMode === 'quick'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Provides immediate provisional diagnosis"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Quick Triage</span>
              </button>
            </div>

            {/* Live Weather Pill */}
            {weatherData && (
              <div 
                onClick={onOpenSettings} 
                className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-800/70 border border-slate-700 text-xs text-slate-300 cursor-pointer hover:border-slate-600 transition"
                title="External Ambient Weather from Open-Meteo"
              >
                <CloudSun className="w-4 h-4 text-amber-400" />
                <span>{weatherData.temperature}°C</span>
                <span className="text-slate-500">|</span>
                <span>{weatherData.humidity}% RH</span>
              </div>
            )}

            {/* Timeline / History */}
            <button
              onClick={onOpenTimeline}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Checkup History & Recovery Timeline"
            >
              <History className="w-4 h-4" />
              {checkupCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                  {checkupCount > 9 ? '9+' : checkupCount}
                </span>
              )}
            </button>

            {/* Backup / Export */}
            <button
              onClick={onOpenBackup}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Backup & Restore Data (JSON)"
            >
              <Database className="w-4 h-4" />
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Settings & API Configuration"
            >
              <SettingsIcon className="w-4 h-4" />
              {!hasApiKey && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Add Groq API Key" />
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
