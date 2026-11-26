import React, { useState, useEffect } from 'react';
import { X, Sprout, Trash2, Check, Sparkles } from 'lucide-react';

const PLANT_PRESETS = [
  {
    name: 'Pothos (Epipremnum aureum)',
    species: 'Epipremnum aureum (Golden Pothos / Money Plant)',
    commonName: 'Pothos',
    placement: 'indoor_indirect',
    placementLabel: 'Indoor (Bright Indirect Light)',
    potDrainage: 'holes_saucer',
    potDrainageLabel: 'Drainage holes with saucer',
    potSize: '6-inch nursery pot',
    pottingMix: 'Standard well-draining indoor potting soil with perlite',
    wateringPreference: 'Allow top 1.5 - 2 inches to dry between deep waterings',
    notes: 'Hardy tropical vine. Overwatering quickly leads to root hypoxia.'
  },
  {
    name: 'Monstera Deliciosa',
    species: 'Monstera deliciosa (Swiss Cheese Plant)',
    commonName: 'Monstera',
    placement: 'indoor_indirect',
    placementLabel: 'Indoor (Medium to Bright Indirect Light)',
    potDrainage: 'holes_saucer',
    potDrainageLabel: 'Drainage holes with saucer',
    potSize: '8-inch nursery pot',
    pottingMix: 'Chunky aroid mix (orchid bark, perlite, peat, charcoal)',
    wateringPreference: 'Allow top 2-3 inches to dry out thoroughly',
    notes: 'Prone to brown spot edema if roots sit in saturated medium.'
  },
  {
    name: 'Snake Plant (Sansevieria)',
    species: 'Dracaena trifasciata (Snake Plant / Mother-in-Law Tongue)',
    commonName: 'Snake Plant',
    placement: 'indoor_low_light',
    placementLabel: 'Indoor (Low to Bright Indirect)',
    potDrainage: 'holes_saucer',
    potDrainageLabel: 'Drainage holes with saucer',
    potSize: '6-inch ceramic pot with drainage',
    pottingMix: 'Cactus/succulent gritty soil with coarse sand',
    wateringPreference: 'Allow soil to dry out 100% completely between waterings',
    notes: 'Extremely drought-tolerant. Highly sensitive to overwatering rot.'
  },
  {
    name: 'Peace Lily (Spathiphyllum)',
    species: 'Spathiphyllum wallisii (Peace Lily)',
    commonName: 'Peace Lily',
    placement: 'indoor_indirect',
    placementLabel: 'Indoor (Low to Medium Indirect Light)',
    potDrainage: 'holes_saucer',
    potDrainageLabel: 'Drainage holes with saucer',
    potSize: '6-inch pot',
    pottingMix: 'Rich, moisture-retentive potting mix with perlite',
    wateringPreference: 'Water when top 1 inch begins to dry before deep droop occurs',
    notes: 'Dramatic wilting indicator when thirsty; sensitive to chlorine/tap salts.'
  }
];

export default function PlantModal({
  isOpen,
  onClose,
  plantToEdit = null,
  onSavePlant,
  onDeletePlant
}) {
  if (!isOpen) return null;

  const isEditing = Boolean(plantToEdit?.id);

  const [form, setForm] = useState({
    name: '',
    species: '',
    commonName: '',
    placement: 'indoor_indirect',
    placementLabel: 'Indoor (Bright Indirect Light)',
    potDrainage: 'holes_saucer',
    potDrainageLabel: 'Drainage holes with saucer',
    potSize: '6-inch pot',
    pottingMix: 'Indoor potting soil with perlite',
    wateringPreference: 'Allow top 1.5 - 2 inches to dry between waterings',
    notes: ''
  });

  useEffect(() => {
    if (plantToEdit) {
      setForm({ ...plantToEdit });
    } else {
      // Default to Pothos preset for new plant
      setForm({ ...PLANT_PRESETS[0], name: 'My New Pothos' });
    }
  }, [plantToEdit]);

  const handleApplyPreset = (preset) => {
    setForm(prev => ({
      ...prev,
      ...preset,
      name: prev.name && prev.name !== 'My New Pothos' ? prev.name : preset.name
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSavePlant(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEditing ? 'Edit Plant Profile' : 'Add New Plant Profile'}
              </h2>
              <p className="text-xs text-slate-400">
                Detailed botanical profile used to calibrate diagnostic reasoning
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">
          
          {/* Quick Species Presets */}
          {!isEditing && (
            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Quick Auto-Fill from Common Species:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PLANT_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-300 border border-slate-700 transition"
                  >
                    🌿 {p.commonName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Plant Name & Species */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Plant Nickname *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Living Room Pothos"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Botanical Species
              </label>
              <input
                type="text"
                value={form.species}
                onChange={(e) => setForm({ ...form, species: e.target.value })}
                placeholder="e.g. Epipremnum aureum"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Placement & Pot Drainage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Light Placement
              </label>
              <select
                value={form.placement}
                onChange={(e) => {
                  const opts = {
                    indoor_indirect: 'Indoor (Bright Indirect Light)',
                    indoor_low_light: 'Indoor (Low Light / Shaded Corner)',
                    balcony_shaded: 'Balcony / Covered Patio',
                    sunny_window: 'Direct Sunlight Windowsill'
                  };
                  setForm({
                    ...form,
                    placement: e.target.value,
                    placementLabel: opts[e.target.value] || e.target.value
                  });
                }}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="indoor_indirect">Indoor (Bright Indirect Light)</option>
                <option value="indoor_low_light">Indoor (Low Light / Shaded Corner)</option>
                <option value="balcony_shaded">Balcony / Covered Patio</option>
                <option value="sunny_window">Direct Sunlight Windowsill</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Pot Drainage Type
              </label>
              <select
                value={form.potDrainage}
                onChange={(e) => {
                  const opts = {
                    holes_saucer: 'Drainage holes with saucer',
                    no_holes: 'No drainage holes (High root rot risk)',
                    cachepot: 'Inner nursery pot inside decorative cachepot',
                    self_watering: 'Self-watering sub-irrigated pot',
                    terracotta: 'Terracotta / porous unglazed clay pot'
                  };
                  setForm({
                    ...form,
                    potDrainage: e.target.value,
                    potDrainageLabel: opts[e.target.value] || e.target.value
                  });
                }}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="holes_saucer">Drainage holes with saucer</option>
                <option value="cachepot">Inner nursery pot inside cachepot</option>
                <option value="no_holes">No drainage holes (High risk)</option>
                <option value="terracotta">Terracotta / porous clay pot</option>
                <option value="self_watering">Self-watering pot</option>
              </select>
            </div>
          </div>

          {/* Pot Size & Medium */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Pot Size
              </label>
              <input
                type="text"
                value={form.potSize}
                onChange={(e) => setForm({ ...form, potSize: e.target.value })}
                placeholder="e.g. 6-inch nursery pot"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Potting Substrate / Soil Mix
              </label>
              <input
                type="text"
                value={form.pottingMix}
                onChange={(e) => setForm({ ...form, pottingMix: e.target.value })}
                placeholder="e.g. Potting soil with perlite"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Special Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Care Notes / History
            </label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. Repotted 3 months ago; sits near north-facing window."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {isEditing ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete profile for "${form.name}"?`)) {
                    onDeletePlant(form.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/40 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Plant</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
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
                <Check className="w-4 h-4" />
                <span>{isEditing ? 'Save Profile' : 'Add Plant'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
