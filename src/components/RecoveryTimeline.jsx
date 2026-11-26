import React, { useState } from 'react';
import { 
  History, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Trash2, 
  Calendar, 
  CloudSun, 
  CheckCircle, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  X,
  Activity
} from 'lucide-react';

export default function RecoveryTimeline({
  isOpen,
  onClose,
  plant,
  checkups = [],
  careLogs = [],
  onDeleteCheckup
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'compare' | 'actions'
  const [compareIdxA, setCompareIdxA] = useState(0); // latest
  const [compareIdxB, setCompareIdxB] = useState(checkups.length > 1 ? 1 : 0); // previous

  const formatTimestamp = (iso) => {
    if (!iso) return 'Unknown date';
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper to compare two checkup snapshots
  const getComparisonAnalysis = (curr, prev) => {
    if (!curr || !prev || curr.id === prev.id) {
      return {
        status: 'baseline',
        badgeColor: 'text-slate-300 bg-slate-800 border-slate-700',
        label: 'Single Snapshot Baseline',
        description: 'First checkup recorded. Additional checkups over subsequent days will map recovery trajectory.'
      };
    }

    const currSev = curr.visionData?.severity || 'mild';
    const prevSev = prev.visionData?.severity || 'mild';
    const sevRank = { none: 0, mild: 1, moderate: 2, severe: 3 };
    const currScore = sevRank[currSev] ?? 1;
    const prevScore = sevRank[prevSev] ?? 1;

    if (currScore < prevScore) {
      return {
        status: 'improving',
        badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-700',
        label: 'Condition Improving',
        description: `Visual foliage severity reduced from ${prevSev} to ${currSev}. Turgor and foliage color show positive physiological rebound.`
      };
    } else if (currScore > prevScore) {
      return {
        status: 'worsening',
        badgeColor: 'text-rose-400 bg-rose-950/60 border-rose-700',
        label: 'Condition Worsening',
        description: `Symptom severity escalated from ${prevSev} to ${currSev}. Re-assess moisture saturation, drafts, or root conditions.`
      };
    } else {
      return {
        status: 'unchanged',
        badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-700',
        label: 'Condition Steady / Unchanged',
        description: `Symptom severity remains steady at ${currSev}. Continue monitored care protocol; biological recovery in tropicals typically requires 7–14 days.`
      };
    }
  };

  const compResult = checkups.length >= 2 
    ? getComparisonAnalysis(checkups[compareIdxA], checkups[compareIdxB])
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Plant Memory & Recovery Timeline
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                  🪴 {plant?.name || 'Plant'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Track physiological recovery, side-by-side progression, and care logs
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-3 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Checkup History ({checkups.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`pb-3 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'compare'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Side-by-Side Comparison</span>
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            className={`pb-3 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'actions'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Care Action Audit Log ({careLogs.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: Checkups Timeline */}
          {activeTab === 'timeline' && (
            checkups.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <History className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No Checkup Snapshots Yet</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Complete an inspection on the workbench and click "Save Checkup Snapshot" to record your plant's condition.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {checkups.map((chk, idx) => (
                  <div
                    key={chk.id || idx}
                    className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/80 hover:border-slate-600 transition flex flex-col md:flex-row gap-4"
                  >
                    {/* Image Thumbnail */}
                    <div className="w-full md:w-36 h-36 rounded-lg bg-slate-950 overflow-hidden shrink-0 border border-slate-800 flex items-center justify-center">
                      {chk.imageUrl ? (
                        <img
                          src={chk.imageUrl}
                          alt="Checkup"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-slate-600">No Image</span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                            Checkup #{checkups.length - idx}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatTimestamp(chk.timestamp)}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            if (window.confirm('Delete this checkup record?')) {
                              onDeleteCheckup(chk.id);
                            }
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded transition"
                          title="Delete snapshot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-sm font-bold text-white">
                        {chk.diagnosis?.provisional_diagnosis || 'Botanical Evaluation'}
                      </h4>

                      {/* Weather snapshot pill */}
                      {chk.weatherSnapshot && (
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                          <CloudSun className="w-3 h-3 text-amber-400" />
                          <span>Outdoor: {chk.weatherSnapshot.temperature}°C</span>
                          <span>•</span>
                          <span>{chk.weatherSnapshot.humidity}% RH</span>
                          <span>•</span>
                          <span>VPD: {chk.weatherSnapshot.vpdKpa} kPa</span>
                        </div>
                      )}

                      {/* Indoor Sensor Rig snapshot pill */}
                      {chk.indoorSensors && (
                        <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
                          <Activity className="w-3 h-3 text-emerald-400" />
                          <span>Soil Probe: {chk.indoorSensors.soilMoisture}%</span>
                          <span>•</span>
                          <span>Room: {chk.indoorSensors.indoorTemp}°C</span>
                          <span>•</span>
                          <span>{chk.indoorSensors.lightLevel} Lux</span>
                        </div>
                      )}

                      {/* Symptoms tags */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {chk.visionData?.visible_symptoms?.map((s, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                          >
                            {s.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>

                      {/* Tactile notes */}
                      {chk.tactileData && (
                        <p className="text-[11px] text-slate-400 pt-1">
                          <strong className="text-slate-300">Soil:</strong> {chk.tactileData.soilMoisture?.replace(/_/g, ' ')} | <strong className="text-slate-300">Pot:</strong> {chk.tactileData.potWeight}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* TAB 2: Side-by-Side Comparison */}
          {activeTab === 'compare' && (
            checkups.length < 2 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Layers className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">Need At Least 2 Checkups to Compare</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Perform another checkup after adjusting your plant's care to track recovery trajectory side-by-side.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Trajectory Badge */}
                {compResult && (
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Recovery Trajectory
                      </span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${compResult.badgeColor} flex items-center gap-1.5`}>
                        {compResult.status === 'improving' ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : compResult.status === 'worsening' ? (
                          <TrendingDown className="w-4 h-4" />
                        ) : (
                          <Minus className="w-4 h-4" />
                        )}
                        <span>{compResult.label}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {compResult.description}
                    </p>
                  </div>
                )}

                {/* Selectors */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Checkup A (Newer / Current):
                    </label>
                    <select
                      value={compareIdxA}
                      onChange={(e) => setCompareIdxA(parseInt(e.target.value, 10))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                    >
                      {checkups.map((c, i) => (
                        <option key={c.id || i} value={i}>
                          Checkup #{checkups.length - i} - {formatTimestamp(c.timestamp)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Checkup B (Older / Baseline):
                    </label>
                    <select
                      value={compareIdxB}
                      onChange={(e) => setCompareIdxB(parseInt(e.target.value, 10))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                    >
                      {checkups.map((c, i) => (
                        <option key={c.id || i} value={i}>
                          Checkup #{checkups.length - i} - {formatTimestamp(c.timestamp)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Side-by-side Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Card A */}
                  {checkups[compareIdxA] && (
                    <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-400">
                          Current: Checkup #{checkups.length - compareIdxA}
                        </span>
                        <span className="text-slate-400">
                          {formatTimestamp(checkups[compareIdxA].timestamp)}
                        </span>
                      </div>

                      <div className="aspect-video bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
                        <img
                          src={checkups[compareIdxA].imageUrl}
                          alt="Checkup A"
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="text-xs space-y-1">
                        <div className="font-semibold text-slate-200">
                          {checkups[compareIdxA].diagnosis?.provisional_diagnosis}
                        </div>
                        <div className="text-slate-400">
                          Severity: <span className="text-emerald-400 font-bold">{checkups[compareIdxA].visionData?.severity}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card B */}
                  {checkups[compareIdxB] && (
                    <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-300">
                          Baseline: Checkup #{checkups.length - compareIdxB}
                        </span>
                        <span className="text-slate-400">
                          {formatTimestamp(checkups[compareIdxB].timestamp)}
                        </span>
                      </div>

                      <div className="aspect-video bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
                        <img
                          src={checkups[compareIdxB].imageUrl}
                          alt="Checkup B"
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="text-xs space-y-1">
                        <div className="font-semibold text-slate-200">
                          {checkups[compareIdxB].diagnosis?.provisional_diagnosis}
                        </div>
                        <div className="text-slate-400">
                          Severity: <span className="text-slate-300 font-bold">{checkups[compareIdxB].visionData?.severity}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )
          )}

          {/* TAB 3: Care Action Audit Log */}
          {activeTab === 'actions' && (
            careLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Activity className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No Care Actions Logged</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When you execute recommended care steps (e.g. emptying saucers or aerating soil), click "Mark Done & Log" to record them here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {careLogs.map((log, idx) => (
                  <div
                    key={log.id || idx}
                    className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-slate-100">
                          {log.title}
                        </h5>
                        <p className="text-slate-400 text-[11px]">
                          {log.description}
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400 shrink-0">
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            )
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
