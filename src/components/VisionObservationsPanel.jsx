import React, { useState } from 'react';
import { 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  FileCode,
  Tag
} from 'lucide-react';

export default function VisionObservationsPanel({
  visionData,
  isAnalyzingVision,
  onTriggerVision
}) {
  const [showRawJson, setShowRawJson] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyJson = () => {
    if (!visionData) return;
    navigator.clipboard.writeText(JSON.stringify(visionData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'none':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" /> None (Healthy)
          </span>
        );
      case 'mild':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
            <AlertTriangle className="w-3.5 h-3.5" /> Mild Stress
          </span>
        );
      case 'moderate':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" /> Moderate Stress
          </span>
        );
      case 'severe':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <AlertTriangle className="w-3.5 h-3.5" /> Severe Acute Stress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            Assessing
          </span>
        );
    }
  };

  const formatTag = (str) => {
    if (!str) return '';
    return str
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-950/70 border border-teal-800/60 flex items-center justify-center text-teal-400">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              3. Visual Symptoms & Foliage Observation
            </h3>
            <p className="text-xs text-slate-400">
              Multimodal computer vision breakdown of physical foliage symptoms
            </p>
          </div>
        </div>

        {visionData && getSeverityBadge(visionData.severity)}
      </div>

      {/* Body States */}
      {isAnalyzingVision ? (
        <div className="py-8 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-xs font-medium text-emerald-400">
            Analyzing leaf turgor, petiole posture, and color venation...
          </p>
        </div>
      ) : visionData ? (
        <div className="space-y-4">
          
          {/* Confidence Meter */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Visual Telemetry Confidence</span>
              <span className="font-semibold text-emerald-400">
                {Math.round((visionData.confidence || 0.85) * 100)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.round((visionData.confidence || 0.85) * 100)}%` }}
              />
            </div>
          </div>

          {/* Symptom Tags */}
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-400" /> Detected Visible Symptoms:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {visionData.visible_symptoms?.map((symptom, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/90 text-slate-200 border border-slate-700/80 shadow-sm"
                >
                  {symptom.includes('healthy') ? '🌿 ' : '⚠️ '}
                  {formatTag(symptom)}
                </span>
              ))}
            </div>
          </div>

          {/* Affected Areas */}
          {visionData.affected_areas && visionData.affected_areas.length > 0 && (
            <div>
              <span className="text-xs font-medium text-slate-400 block mb-1.5">
                Affected Anatomical Zones:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {visionData.affected_areas.map((area, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800/60 text-slate-300 border border-slate-700/60"
                  >
                    📍 {formatTag(area)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Visual Notes Block */}
          {visionData.visual_notes && (
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300 leading-relaxed font-sans">
              <span className="font-semibold text-slate-200 block mb-0.5">
                Botanical Vision Observations:
              </span>
              {visionData.visual_notes}
            </div>
          )}

          {/* Raw JSON Debugging Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowRawJson(!showRawJson)}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono transition"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{showRawJson ? 'Hide Raw Vision JSON' : 'Inspect Raw Vision JSON'}</span>
              {showRawJson ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showRawJson && (
              <div className="mt-2 relative">
                <button
                  onClick={copyJson}
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700"
                  title="Copy JSON"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400/90 overflow-x-auto max-h-48">
                  {JSON.stringify(visionData, null, 2)}
                </pre>
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="p-6 text-center text-slate-400 text-xs space-y-2">
          <p>No foliar inspection has been run yet.</p>
          <p className="text-slate-500">
            Capture a photo or pick a sample scenario above, then run Vision Inspection.
          </p>
        </div>
      )}

    </div>
  );
}
