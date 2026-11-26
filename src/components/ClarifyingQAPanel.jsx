import React, { useState } from 'react';
import { 
  HelpCircle, 
  Send, 
  Sparkles, 
  RefreshCw, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export default function ClarifyingQAPanel({
  questions = [],
  onSubmitAnswers,
  isDiagnosing,
  onBypass
}) {
  const [answers, setAnswers] = useState({});

  if (!questions || questions.length === 0) return null;

  const handleSelectOption = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleCustomText = (questionId, text) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: text
    }));
  };

  const allAnswered = questions.every(q => Boolean(answers[q.id]));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitAnswers(answers);
  };

  return (
    <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-5 shadow-2xl space-y-5 animate-fadeIn">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-950/70 border border-amber-700/60 flex items-center justify-center text-amber-400">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              4. Diagnostic Investigation & Clarifying Q&A
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Action Required
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Evidence is currently ambiguous. Clarifying these factors prevents harmful misdiagnosis.
            </p>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200/90 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p>
          <strong>Botanical Rule:</strong> Wilting foliage can be caused by either dry soil or drowned, rotting roots. Answering these questions helps isolate the true physiological cause.
        </p>
      </div>

      {/* Questions Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {questions.map((q, idx) => {
          const selected = answers[q.id];
          return (
            <div key={q.id || idx} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-3">
              <label className="text-xs sm:text-sm font-semibold text-slate-100 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-xs">
                  {idx + 1}
                </span>
                {q.question}
              </label>

              {/* Options */}
              {Array.isArray(q.options) && q.options.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = selected === opt;
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleSelectOption(q.id, opt)}
                        className={`text-left p-2.5 rounded-xl text-xs font-medium border transition ${
                          isSelected
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-md ring-1 ring-emerald-500/50'
                            : 'bg-slate-900/60 hover:bg-slate-900 border-slate-700 text-slate-300'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <input
                  type="text"
                  value={selected || ''}
                  onChange={(e) => handleCustomText(q.id, e.target.value)}
                  placeholder="Type your response here..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              )}
            </div>
          );
        })}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onBypass}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
          >
            <span>Skip to provisional diagnosis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="submit"
            disabled={isDiagnosing || !allAnswered}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition disabled:opacity-50"
          >
            {isDiagnosing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{isDiagnosing ? 'Re-Evaluating Hypotheses...' : 'Submit Answers & Finalize Diagnosis'}</span>
          </button>
        </div>
      </form>

    </div>
  );
}
