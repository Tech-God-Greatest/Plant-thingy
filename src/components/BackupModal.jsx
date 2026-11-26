import React, { useState } from 'react';
import { X, Download, Upload, Database, Check, AlertCircle } from 'lucide-react';
import { storageService } from '../services/storageService';

export default function BackupModal({ isOpen, onClose, onDataRestored }) {
  if (!isOpen) return null;

  const [importJson, setImportJson] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleExport = () => {
    try {
      const dataStr = storageService.exportAllData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rootmind_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setStatus({ type: 'success', message: 'Backup JSON downloaded successfully!' });
    } catch (err) {
      setStatus({ type: 'error', message: `Export failed: ${err.message}` });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        setImportJson(text);
        setStatus({ type: 'info', message: `Loaded file "${file.name}". Click Restore to apply.` });
      } catch (err) {
        setStatus({ type: 'error', message: 'Failed to read file.' });
      }
    };
    reader.readAsText(file);
  };

  const handleRestore = () => {
    if (!importJson.trim()) {
      setStatus({ type: 'error', message: 'Please upload or paste valid JSON data.' });
      return;
    }

    const res = storageService.importAllData(importJson);
    if (res.success) {
      setStatus({ type: 'success', message: 'Data restored successfully!' });
      if (onDataRestored) {
        onDataRestored();
      }
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setStatus({ type: 'error', message: `Restore error: ${res.error}` });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Backup & Restore</h2>
              <p className="text-xs text-slate-400">Zero-cloud database: manage your local plant data</p>
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
        <div className="p-6 space-y-6">
          
          {/* Export Section */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Export All Plant History</h3>
              <p className="text-xs text-slate-400">Download complete profiles, checkups & care logs as JSON</p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600 transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download JSON</span>
            </button>
          </div>

          {/* Import Section */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">Restore from JSON Backup</h3>
            
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-4 cursor-pointer transition bg-slate-900/50">
              <Upload className="w-6 h-6 text-slate-400 mb-2" />
              <span className="text-xs font-medium text-slate-300">Choose a backup .json file</span>
              <span className="text-[11px] text-slate-500">or click to browse your files</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {importJson && (
              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-300 focus:outline-none"
                  placeholder="Paste JSON here..."
                />
                <button
                  onClick={handleRestore}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md"
                >
                  Confirm & Restore Data
                </button>
              </div>
            )}
          </div>

          {/* Status Message */}
          {status.message && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-xs ${
              status.type === 'success' 
                ? 'bg-emerald-950/40 border border-emerald-800 text-emerald-300' 
                : status.type === 'error'
                ? 'bg-rose-950/40 border border-rose-800 text-rose-300'
                : 'bg-blue-950/40 border border-blue-800 text-blue-300'
            }`}>
              {status.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{status.message}</span>
            </div>
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
