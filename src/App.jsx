import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import SettingsModal from './components/SettingsModal';
import PlantModal from './components/PlantModal';
import BackupModal from './components/BackupModal';
import CameraWorkbench from './components/CameraWorkbench';
import EnvironmentCard from './components/EnvironmentCard';
import VisionObservationsPanel from './components/VisionObservationsPanel';
import ClarifyingQAPanel from './components/ClarifyingQAPanel';
import DiagnosisCareCard from './components/DiagnosisCareCard';
import RecoveryTimeline from './components/RecoveryTimeline';
import SecretSensorModal from './components/SecretSensorModal';

import { storageService, DEFAULT_PLANT, DEFAULT_SETTINGS } from './services/storageService';
import { fetchWeatherData } from './services/weatherService';
import { analyzePlantVision, diagnosePlantHealth, generateLocalBotanicalAnalysis } from './services/groqClient';
import { SAMPLE_SCENARIOS } from './services/sampleData';
import { sensorSimulationService, SENSOR_PRESETS } from './services/sensorSimulationService';

import { 
  Sprout, 
  Sparkles, 
  AlertCircle, 
  RefreshCw, 
  Layers, 
  HelpCircle, 
  CheckCircle2, 
  Compass, 
  ShieldCheck, 
  Info,
  Calendar,
  ArrowRight,
  Cpu
} from 'lucide-react';

export default function App() {
  // Persistence state
  const [plants, setPlants] = useState([]);
  const [activePlantId, setActivePlantId] = useState('');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [checkups, setCheckups] = useState([]);
  const [careLogs, setCareLogs] = useState([]);

  // Weather state
  const [weatherData, setWeatherData] = useState(null);
  const [isRefreshingWeather, setIsRefreshingWeather] = useState(false);

  // Simulated Indoor Sensor Rig state
  const [sensorConfig, setSensorConfig] = useState(sensorSimulationService.getConfig());
  const [sensorTickCount, setSensorTickCount] = useState(0);
  const [indoorSensorTick, setIndoorSensorTick] = useState(() => 
    sensorSimulationService.generateLiveTick(sensorSimulationService.getConfig(), 0)
  );
  const [isSecretModalOpen, setIsSecretModalOpen] = useState(false);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPlantModalOpen, setIsPlantModalOpen] = useState(false);
  const [plantToEdit, setPlantToEdit] = useState(null);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  // Workbench Diagnostic State
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeSampleId, setActiveSampleId] = useState(null);
  const [tactileData, setTactileData] = useState({
    soilMoisture: 'dry_top',
    potWeight: 'normal',
    drainageStatus: 'clear',
    lastWateredDays: 3,
    draftExposure: 'none',
    userNote: ''
  });

  const [isAnalyzingVision, setIsAnalyzingVision] = useState(false);
  const [visionData, setVisionData] = useState(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisData, setDiagnosisData] = useState(null);
  const [clarifyingQuestions, setClarifyingQuestions] = useState([]);
  const [checkupAlreadySaved, setCheckupAlreadySaved] = useState(false);
  const [diagnosticError, setDiagnosticError] = useState('');

  // Active plant object
  const activePlant = plants.find(p => p.id === activePlantId) || plants[0] || DEFAULT_PLANT;

  // Initialize storage & settings on mount
  useEffect(() => {
    const loadedSettings = storageService.getSettings();
    setSettings(loadedSettings);

    const loadedPlants = storageService.getPlants();
    setPlants(loadedPlants);

    const activeId = storageService.getActivePlantId();
    setActivePlantId(activeId);

    const allCheckups = storageService.getCheckups(activeId);
    setCheckups(allCheckups);

    const allCareLogs = storageService.getCareLogs(activeId);
    setCareLogs(allCareLogs);
  }, []);

  // Real-time organic sensor fluctuation loop (ticks every 3 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setSensorTickCount(prev => {
        const next = prev + 1;
        const tick = sensorSimulationService.generateLiveTick(sensorConfig, next);
        setIndoorSensorTick(tick);
        return next;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [sensorConfig]);

  // Handle saving sensor config from secret modal
  const handleSaveSensorConfig = (newConfig) => {
    const saved = sensorSimulationService.saveConfig(newConfig);
    setSensorConfig(saved);
    const tick = sensorSimulationService.generateLiveTick(saved, sensorTickCount);
    setIndoorSensorTick(tick);
  };

  // Fetch Open-Meteo weather
  const loadWeather = useCallback(async (currentSettings = settings) => {
    setIsRefreshingWeather(true);
    const lat = currentSettings.manualLat || 28.6139;
    const lon = currentSettings.manualLon || 77.2090;
    const res = await fetchWeatherData(lat, lon);
    if (res.success) {
      setWeatherData(res.data);
    } else {
      console.warn('Weather fetch failed, keeping fallback');
    }
    setIsRefreshingWeather(false);
  }, [settings]);

  useEffect(() => {
    loadWeather(settings);
  }, [settings.manualLat, settings.manualLon]);

  // Update checkups & care logs when active plant changes
  useEffect(() => {
    if (activePlantId) {
      setCheckups(storageService.getCheckups(activePlantId));
      setCareLogs(storageService.getCareLogs(activePlantId));
    }
  }, [activePlantId]);

  // Handle Plant Switching
  const handleSelectPlant = (plantId) => {
    setActivePlantId(plantId);
    storageService.setActivePlantId(plantId);
    handleClearWorkbench();
  };

  const handleOpenAddPlant = () => {
    setPlantToEdit(null);
    setIsPlantModalOpen(true);
  };

  const handleOpenEditPlant = () => {
    setPlantToEdit(activePlant);
    setIsPlantModalOpen(true);
  };

  const handleSavePlant = (plant) => {
    const updated = storageService.savePlant(plant);
    if (updated) {
      setPlants(updated);
      if (plant.id) {
        setActivePlantId(plant.id);
      }
    }
  };

  const handleDeletePlant = (plantId) => {
    const updated = storageService.deletePlant(plantId);
    if (updated) {
      setPlants(updated);
      setActivePlantId(updated[0]?.id || DEFAULT_PLANT.id);
    }
  };

  // Handle Mode Toggle
  const handleToggleMode = (mode) => {
    const next = { ...settings, checkupMode: mode };
    setSettings(next);
    storageService.saveSettings(next);
  };

  // Workbench Actions
  const handleImageSelected = (imageDataUrl, sampleId = null) => {
    setSelectedImage(imageDataUrl);
    setActiveSampleId(sampleId);
    setVisionData(null);
    setDiagnosisData(null);
    setClarifyingQuestions([]);
    setCheckupAlreadySaved(false);
    setDiagnosticError('');
  };

  const handleClearWorkbench = () => {
    setSelectedImage(null);
    setActiveSampleId(null);
    setVisionData(null);
    setDiagnosisData(null);
    setClarifyingQuestions([]);
    setCheckupAlreadySaved(false);
    setDiagnosticError('');
  };

  const handleSelectSampleScenario = (scenario) => {
    handleImageSelected(scenario.imageDataUrl, scenario.id);
    if (scenario.mockTactile) {
      setTactileData(prev => ({
        ...prev,
        ...scenario.mockTactile
      }));
    }

    // Auto-calibrate indoor sensor rig to match scenario
    if (scenario.id === 'sample_overwatered') {
      const overwateredPreset = SENSOR_PRESETS.find(p => p.id === 'overwatered');
      if (overwateredPreset) {
        handleSaveSensorConfig({ ...sensorConfig, ...overwateredPreset.values, activePreset: 'overwatered' });
      }
    } else if (scenario.id === 'sample_underwatered') {
      const underwateredPreset = SENSOR_PRESETS.find(p => p.id === 'underwatered');
      if (underwateredPreset) {
        handleSaveSensorConfig({ ...sensorConfig, ...underwateredPreset.values, activePreset: 'underwatered' });
      }
    } else if (scenario.id === 'sample_healthy') {
      const optimalPreset = SENSOR_PRESETS.find(p => p.id === 'optimal');
      if (optimalPreset) {
        handleSaveSensorConfig({ ...sensorConfig, ...optimalPreset.values, activePreset: 'optimal' });
      }
    } else if (scenario.id === 'sample_sunburn') {
      handleSaveSensorConfig({ ...sensorConfig, baseLightLevel: 3600, baseIndoorTemp: 28.5, activePreset: 'custom' });
    }

    // Set mock vision and diagnosis immediately for instant test
    setVisionData(scenario.mockVisionResult);
    if (settings.checkupMode === 'interactive' && scenario.id === 'sample_overwatered') {
      setClarifyingQuestions([
        {
          id: 'q_saucer',
          question: 'Is there stagnant water standing inside the bottom saucer or decorative cachepot?',
          options: ['Yes, pot is sitting in water', 'No, saucer is dry and empty']
        },
        {
          id: 'q_stem_feel',
          question: 'Are the lower stems firm, or soft and mushy near the soil line?',
          options: ['Stems feel soft/squishy', 'Stems are still firm but drooping']
        }
      ]);
    } else {
      setDiagnosisData(scenario.mockDiagnosis);
    }
  };

  // Run Vision Inspection
  const handleTriggerVisionAnalysis = async () => {
    if (!selectedImage) return;

    setIsAnalyzingVision(true);
    setDiagnosticError('');

    try {
      if (settings.groqApiKey) {
        const result = await analyzePlantVision({
          apiKey: settings.groqApiKey,
          modelId: settings.visionModel,
          imageDataUrl: selectedImage,
          plantProfile: activePlant
        });
        setVisionData(result);
      } else {
        const matchingSample = SAMPLE_SCENARIOS.find(s => s.id === activeSampleId);
        if (matchingSample) {
          setVisionData(matchingSample.mockVisionResult);
        } else {
          setVisionData({
            visible_symptoms: ['turgor_evaluation_complete', 'cuticle_inspected'],
            affected_areas: ['foliage_canopy'],
            severity: (indoorSensorTick?.soilMoisture > 70 || tactileData.soilMoisture === 'soggy') ? 'moderate' : 'mild',
            confidence: 0.88,
            visual_notes: 'Visual foliage patterns observed. Running in Local Simulation Mode. Add Groq API Key in Settings for live cloud multimodal inference.'
          });
        }
      }
    } catch (err) {
      console.error('Vision analysis error:', err);
      setDiagnosticError(`Vision Inspection Notice: ${err.message}`);
      setVisionData({
        visible_symptoms: ['manual_visual_mode'],
        affected_areas: ['canopy'],
        severity: 'mild',
        confidence: 0.80,
        visual_notes: `Direct vision notice: ${err.message}. Proceeding with environmental and tactile synthesis.`
      });
    } finally {
      setIsAnalyzingVision(false);
    }
  };

  // Run Diagnostic Reasoning with Outdoor Weather + Indoor Sensors
  const handleTriggerDiagnosis = async (previousAnswers = null) => {
    if (!visionData) {
      await handleTriggerVisionAnalysis();
    }

    setIsDiagnosing(true);
    setDiagnosticError('');

    try {
      if (settings.groqApiKey) {
        // Send Outdoor Open-Meteo Weather + Indoor Simulated Sensor Telemetry to Groq
        const result = await diagnosePlantHealth({
          apiKey: settings.groqApiKey,
          modelId: settings.diagnosticModel,
          plantProfile: activePlant,
          visionData: visionData || { visible_symptoms: ['evaluated'] },
          weatherData,
          tactileData,
          indoorSensors: indoorSensorTick,
          pastCheckups: checkups,
          previousAnswers,
          mode: settings.checkupMode
        });

        if (result.status === 'needs_info' && result.clarifying_questions?.length > 0 && !previousAnswers && settings.checkupMode === 'interactive') {
          setClarifyingQuestions(result.clarifying_questions);
          setDiagnosisData(null);
        } else {
          setDiagnosisData(result);
          setClarifyingQuestions([]);
        }
      } else {
        // Local Botanical Analysis with indoor sensors
        const matchingSample = SAMPLE_SCENARIOS.find(s => s.id === activeSampleId);
        if (matchingSample && (!settings.checkupMode || settings.checkupMode === 'quick' || previousAnswers)) {
          setDiagnosisData(matchingSample.mockDiagnosis);
          setClarifyingQuestions([]);
        } else {
          const localResult = generateLocalBotanicalAnalysis({
            plantProfile: activePlant,
            visionData,
            weatherData,
            tactileData,
            indoorSensors: indoorSensorTick,
            mode: settings.checkupMode
          });
          if (localResult.status === 'needs_info' && !previousAnswers && settings.checkupMode === 'interactive') {
            setClarifyingQuestions(localResult.clarifying_questions);
            setDiagnosisData(null);
          } else {
            setDiagnosisData(localResult);
            setClarifyingQuestions([]);
          }
        }
      }
    } catch (err) {
      console.error('Diagnostic reasoning error:', err);
      setDiagnosticError(`Diagnostic Error: ${err.message}`);
      const fallback = generateLocalBotanicalAnalysis({
        plantProfile: activePlant,
        visionData,
        weatherData,
        tactileData,
        indoorSensors: indoorSensorTick,
        mode: 'quick'
      });
      setDiagnosisData(fallback);
      setClarifyingQuestions([]);
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Handle Clarifying Q&A submission
  const handleSubmitAnswers = (answers) => {
    handleTriggerDiagnosis(answers);
  };

  // Handle Save Checkup to History
  const handleSaveCheckup = () => {
    if (!diagnosisData) return;

    const newCheckup = {
      plantId: activePlant.id,
      timestamp: new Date().toISOString(),
      imageUrl: selectedImage,
      visionData,
      weatherSnapshot: weatherData,
      tactileData,
      indoorSensors: indoorSensorTick,
      diagnosis: diagnosisData
    };

    const saved = storageService.saveCheckup(newCheckup);
    if (saved) {
      setCheckupAlreadySaved(true);
      setCheckups(storageService.getCheckups(activePlant.id));
    }
  };

  // Handle Care Action Logged
  const handleLogCareAction = (action) => {
    const entry = storageService.logCareAction({
      plantId: activePlant.id,
      title: action.title,
      description: action.description,
      urgency: action.urgency
    });
    if (entry) {
      setCareLogs(storageService.getCareLogs(activePlant.id));
    }
  };

  const handleDeleteCheckup = (chkId) => {
    const updated = storageService.deleteCheckup(chkId);
    setCheckups(updated.filter(c => c.plantId === activePlant.id));
  };

  const handleDataRestored = () => {
    setPlants(storageService.getPlants());
    const actId = storageService.getActivePlantId();
    setActivePlantId(actId);
    setCheckups(storageService.getCheckups(actId));
    setCareLogs(storageService.getCareLogs(actId));
    setSettings(storageService.getSettings());
    loadWeather(storageService.getSettings());
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        plants={plants}
        activePlant={activePlant}
        onSelectPlant={handleSelectPlant}
        onOpenAddPlant={handleOpenAddPlant}
        onOpenEditPlant={handleOpenEditPlant}
        checkupMode={settings.checkupMode}
        onToggleMode={handleToggleMode}
        weatherData={weatherData}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTimeline={() => setIsTimelineOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        hasApiKey={Boolean(settings.groqApiKey)}
        checkupCount={checkups.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Banner: Local Simulation vs Live Groq */}
        {!settings.groqApiKey && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-900/60 flex items-center justify-center text-emerald-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-emerald-300 flex items-center gap-2">
                  <span>Local Botanical Simulation Active</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-800 text-emerald-400">
                    Live Telemetry Rig Connected
                  </span>
                </div>
                <p className="text-slate-400">
                  Try the preset botanical sample cases below. For live multimodal camera analysis & reasoning, configure your free Groq API key in Settings.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shrink-0 shadow-md transition"
            >
              Add Groq Key
            </button>
          </div>
        )}

        {/* Plant Overview Header Pill */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  {activePlant.name}
                </h2>
                <span className="text-xs text-slate-400 font-mono">
                  ({activePlant.species})
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 pt-0.5">
                <span>📍 {activePlant.placementLabel}</span>
                <span>•</span>
                <span>🪴 {activePlant.potDrainageLabel}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTimelineOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>{checkups.length} Checkups Logged</span>
            </button>
          </div>
        </div>

        {/* Global Error Banner if any */}
        {diagnosticError && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{diagnosticError}</span>
            </div>
            <button
              onClick={() => setDiagnosticError('')}
              className="text-xs text-amber-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Workbench Layout: 2 Columns on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Visual Workbench & Vision Panel (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Camera / Upload / Sample Picker */}
            <CameraWorkbench
              onImageSelected={handleImageSelected}
              selectedImage={selectedImage}
              isAnalyzingVision={isAnalyzingVision}
              onTriggerVisionAnalysis={handleTriggerVisionAnalysis}
              activeSampleId={activeSampleId}
              onSelectSampleScenario={handleSelectSampleScenario}
              onClearImage={handleClearWorkbench}
            />

            {/* Step 3: Vision Observations Panel */}
            <VisionObservationsPanel
              visionData={visionData}
              isAnalyzingVision={isAnalyzingVision}
              onTriggerVision={handleTriggerVisionAnalysis}
            />

            {/* Synthesis Action Trigger Button (if vision is ready but diagnosis not yet generated) */}
            {visionData && !diagnosisData && clarifyingQuestions.length === 0 && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-800/40 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    Ready to Synthesize Evidence
                  </h4>
                  <p className="text-xs text-slate-400">
                    Cross-references vision telemetry with Open-Meteo microclimate, indoor sensor probes, and tactile checks.
                  </p>
                </div>

                <button
                  onClick={() => handleTriggerDiagnosis()}
                  disabled={isDiagnosing}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/60 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isDiagnosing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{isDiagnosing ? 'Synthesizing...' : 'Run Botanical Diagnosis'}</span>
                </button>
              </div>
            )}

            {/* Step 4: Clarifying Q&A Panel (Interactive mode when status is needs_info) */}
            {clarifyingQuestions.length > 0 && (
              <ClarifyingQAPanel
                questions={clarifyingQuestions}
                onSubmitAnswers={handleSubmitAnswers}
                isDiagnosing={isDiagnosing}
                onBypass={() => handleTriggerDiagnosis({ bypassed: true })}
              />
            )}

            {/* Step 5: Diagnosis & Care Plan */}
            {diagnosisData && (
              <DiagnosisCareCard
                diagnosisData={diagnosisData}
                onSaveCheckup={handleSaveCheckup}
                onLogCareAction={handleLogCareAction}
                isSavingCheckup={false}
                checkupAlreadySaved={checkupAlreadySaved}
              />
            )}

          </div>

          {/* Right Column: Environmental Telemetry (Outdoor + Indoor Rig + Tactile) (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Step 2: Environmental Telemetry & Tactile Verification */}
            <EnvironmentCard
              weatherData={weatherData}
              isRefreshingWeather={isRefreshingWeather}
              onRefreshWeather={() => loadWeather(settings)}
              tactileData={tactileData}
              onChangeTactileData={setTactileData}
              indoorSensorTick={indoorSensorTick}
              onOpenSecretModal={() => setIsSecretModalOpen(true)}
            />

            {/* Diagnostic Philosophy & Safety Mandate Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>RootMind Dual Telemetry Synthesis</span>
              </div>
              <ul className="text-xs text-slate-400 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Outdoor Ambient + In-Pot Rig:</strong> Evaluates Open-Meteo external transpiration VPD alongside live capacitive in-pot moisture probes and canopy light.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>No Blind Watering:</strong> If soil probe reads &gt;70% moisture while leaves droop, AI identifies root hypoxia/rot, avoiding fatal watering mistakes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Safe Reversible Interventions:</strong> Zero synthetic chemicals. Interventions focus on aeration, drainage, and light equilibrium.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>

      </main>

      {/* Secret Sensor Calibration Modal */}
      <SecretSensorModal
        isOpen={isSecretModalOpen}
        onClose={() => setIsSecretModalOpen(false)}
        config={sensorConfig}
        onSaveConfig={handleSaveSensorConfig}
        currentLiveTick={indoorSensorTick}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          storageService.saveSettings(newSettings);
        }}
        onRefreshWeather={loadWeather}
      />

      {/* Plant Modal */}
      <PlantModal
        isOpen={isPlantModalOpen}
        onClose={() => {
          setIsPlantModalOpen(false);
          setPlantToEdit(null);
        }}
        plantToEdit={plantToEdit}
        onSavePlant={handleSavePlant}
        onDeletePlant={handleDeletePlant}
      />

      {/* Backup Modal */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onDataRestored={handleDataRestored}
      />

      {/* Recovery Timeline Modal */}
      <RecoveryTimeline
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        plant={activePlant}
        checkups={checkups}
        careLogs={careLogs}
        onDeleteCheckup={handleDeleteCheckup}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        <p>RootMind Plant Diagnostic Assistant • 100% Free Open-Meteo Telemetry + Groq AI Vision & Reasoning</p>
      </footer>

    </div>
  );
}
