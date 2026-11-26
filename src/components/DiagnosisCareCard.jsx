import React, { useState } from 'react';
import { 
  HeartPulse, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Check, 
  HelpCircle, 
  Save, 
  Sparkles, 
  BarChart3,
  Layers,
  ArrowRight,
  Shield
} from 'lucide-react';

export default function DiagnosisCareCard({
  diagnosisData,
  onSaveCheckup,
  onLogCareAction,
  completedActionIds = new Set(),
  isSavingCheckup,
  checkupAlreadySaved
}) {
  const [localCompleted, setLocalCompleted] = useState(new Set(completedActionIds));

  if (!diagnosisData) return null;

  const handleActionToggle = (action) => {
    const nextSet = new Set(localCompleted);
    if (!nextSet.has(action.id)) {
      nextSet.add(action.id);
      setLocalCompleted(nextSet);
      onLogCareAction(action);
    }
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high':
        return 'text-rose-400 bg-rose-950/60 border-rose-800';
      case 'medium':
        return 'text-amber-400 bg-amber-950/60 border-amber-800';
      default:
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
    }
  };

  const supporting = diagnosisData.supporting_and_conflicting_evidence?.supporting || [];
  const conflicting = diagnosisData.supporting_and_conflicting_evidence?.conflicting || [];

  return (
    <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/30">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
              Step 5 • Synthesis Complete
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Evidence-Based Diagnosis & Care Plan
            </h3>
          </div>
        </div>

        {/* Save Checkup Button */}
        <button
          onClick={onSaveCheckup}
          disabled={isSavingCheckup || checkupAlreadySaved}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-md ${
            checkupAlreadySaved
              ? 'bg-slate-800 text-emerald-400 border border-emerald-700/60'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
          }`}
        >
          {checkupAlreadySaved ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Logged to Timeline</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Checkup Snapshot</span>
            </>
          )}
        </button>
      </div>

      {/* Primary Diagnosis Banner */}
      <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Primary Provisional Condition
          </span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Confidence: {diagnosisData.confidence_level || 'High'}
          </span>
        </div>
        <h4 className="text-lg sm:text-xl font-extrabold text-white">
          {diagnosisData.provisional_diagnosis}
        </h4>
        {diagnosisData.uncertainty_notes && (
          <p className="text-xs text-slate-300 leading-relaxed pt-1">
            <span className="text-slate-400 font-semibold">Uncertainty & Boundaries: </span>
            {diagnosisData.uncertainty_notes}
          </p>
        )}
      </div>

      {/* Competing Hypotheses Ranking */}
      {diagnosisData.competing_hypotheses && diagnosisData.competing_hypotheses.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Differential Diagnostic Hypotheses Ranked:</span>
          </div>

          <div className="space-y-2">
            {diagnosisData.competing_hypotheses.map((hypo, idx) => {
              const pct = Math.round((hypo.probability || 0.1) * 100);
              return (
                <div key={idx} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">
                      {hypo.hypothesis}
                    </span>
                    <span className="font-mono font-bold text-emerald-400 text-xs">
                      {pct}%
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 0 ? 'bg-emerald-400' : 'bg-slate-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {hypo.reason && (
                    <p className="text-[11px] text-slate-400">
                      {hypo.reason}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Supporting vs Conflicting Evidence */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Supporting */}
        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Supporting Convergence</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-1.5">
            {supporting.length > 0 ? (
              supporting.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500 italic">No explicit supporting items listed</li>
            )}
          </ul>
        </div>

        {/* Conflicting */}
        <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Conflicting / Ruling Factors</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-1.5">
            {conflicting.length > 0 ? (
              conflicting.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500 italic">None noted; evidence aligns cleanly</li>
            )}
          </ul>
        </div>
      </div>

      {/* Safety Guardrail Notice */}
      <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/80 text-xs flex items-start gap-2.5">
        <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-slate-300 text-[11px] leading-relaxed">
          <strong className="text-emerald-300">Strict Safety Rule:</strong> RootMind never recommends automatic or unverified chemical treatments. All prescribed steps below are safe, physical, and reversible.
        </p>
      </div>

      {/* Actionable Care Checklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Safe Reversible Care Actions:
          </h4>
          <span className="text-[11px] text-slate-400">
            Click to mark done and log to plant history
          </span>
        </div>

        <div className="space-y-2.5">
          {diagnosisData.recommended_actions?.map((act, idx) => {
            const isDone = localCompleted.has(act.id);
            return (
              <div
                key={act.id || idx}
                className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isDone
                    ? 'bg-emerald-950/30 border-emerald-600/50'
                    : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700'
                }`}
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.2 rounded border ${getUrgencyBadge(act.urgency)}`}>
                      {act.urgency || 'low'} priority
                    </span>
                    <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/50 px-1.5 py-0.2 rounded border border-emerald-800/50">
                      Reversible
                    </span>
                    <h5 className={`text-xs font-bold ${isDone ? 'text-emerald-300 line-through' : 'text-white'}`}>
                      {act.title}
                    </h5>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {act.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleActionToggle(act)}
                  disabled={isDone}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1.5 transition ${
                    isDone
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isDone ? 'Action Logged' : 'Mark Done & Log'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
