import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  Upload, 
  RefreshCw, 
  SwitchCamera, 
  Sparkles, 
  AlertCircle, 
  Check, 
  Sliders, 
  X,
  ScanEye,
  Video
} from 'lucide-react';
import { SAMPLE_SCENARIOS } from '../services/sampleData';

export default function CameraWorkbench({
  onImageSelected,
  selectedImage,
  isAnalyzingVision,
  onTriggerVisionAnalysis,
  activeSampleId,
  onSelectSampleScenario,
  onClearImage
}) {
  const [streamActive, setStreamActive] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // environment (back) or user (front)
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Enumerate available video input devices
  const loadVideoDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(d => d.kind === 'videoinput');
      setVideoDevices(videoInputs);
      if (videoInputs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoInputs[0].deviceId);
      }
    } catch (err) {
      console.warn('Could not enumerate video devices:', err);
    }
  }, [selectedDeviceId]);

  // Listen for hardware device changes (plugging/unplugging webcam)
  useEffect(() => {
    loadVideoDevices();
    if (navigator.mediaDevices && navigator.mediaDevices.addEventListener) {
      navigator.mediaDevices.addEventListener('devicechange', loadVideoDevices);
      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', loadVideoDevices);
      };
    }
  }, [loadVideoDevices]);

  // Stop camera stream safely
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
    setIsStartingCamera(false);
  }, []);

  // Callback ref for the video element to guarantee immediate attachment of stream
  const handleVideoRef = useCallback((node) => {
    videoRef.current = node;
    if (node && streamRef.current) {
      if (node.srcObject !== streamRef.current) {
        node.srcObject = streamRef.current;
      }
      node.play().catch(err => {
        console.warn('Video auto-play interrupted:', err);
      });
    }
  }, []);

  // Synchronize stream with video element when streamActive changes
  useEffect(() => {
    if (streamActive && videoRef.current && streamRef.current) {
      const video = videoRef.current;
      if (video.srcObject !== streamRef.current) {
        video.srcObject = streamRef.current;
      }
      video.play().catch(err => {
        console.warn('Video play error in effect:', err);
      });
    }
  }, [streamActive]);

  // Robust camera starter with 3-tier fallback to avoid overconstrained or blank states
  const startCamera = async (targetDeviceId = selectedDeviceId, mode = facingMode) => {
    setCameraError('');
    setIsStartingCamera(true);
    stopStream();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access not supported on this device/browser.');
      setIsStartingCamera(false);
      return;
    }

    let stream = null;

    // Attempt 1: Target deviceId (if valid non-empty string)
    if (targetDeviceId && typeof targetDeviceId === 'string' && targetDeviceId.trim() !== '') {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { ideal: targetDeviceId },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch (err) {
        console.warn('Attempt 1 (ideal deviceId) failed, falling back:', err);
      }
    }

    // Attempt 2: Facing mode
    if (!stream) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode ? { ideal: mode } : undefined,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch (err) {
        console.warn('Attempt 2 (facingMode) failed, falling back:', err);
      }
    }

    // Attempt 3: Universal basic video fallback (never fails on constraints)
    if (!stream) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      } catch (err) {
        console.error('All camera attempts failed:', err);
        setCameraError(err.message || 'Unable to access camera. Check browser permissions.');
        setStreamActive(false);
        setIsStartingCamera(false);
        return;
      }
    }

    streamRef.current = stream;
    setStreamActive(true);
    setIsStartingCamera(false);

    // Directly bind stream to video element if already in DOM
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => console.warn(err));
    }

    // Update active device ID if available
    const activeTrack = stream.getVideoTracks()[0];
    if (activeTrack) {
      const settings = activeTrack.getSettings ? activeTrack.getSettings() : {};
      if (settings.deviceId) {
        setSelectedDeviceId(settings.deviceId);
      }
    }

    // Re-query devices so labels become visible after permission grant
    loadVideoDevices();
  };

  // Switch camera device
  const handleSelectDevice = (deviceId) => {
    setSelectedDeviceId(deviceId);
    if (streamActive) {
      startCamera(deviceId);
    }
  };

  // Toggle front/back camera (for mobile / multiple cameras)
  const toggleFacingMode = () => {
    if (videoDevices.length > 1) {
      const currentIdx = videoDevices.findIndex(d => d.deviceId === selectedDeviceId);
      const nextIdx = (currentIdx + 1) % videoDevices.length;
      const nextDev = videoDevices[nextIdx];
      if (nextDev) {
        handleSelectDevice(nextDev.deviceId);
        return;
      }
    }
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (streamActive) {
      startCamera(null, nextMode);
    }
  };

  // Snap photo from stream
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 600;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    stopStream();
    onImageSelected(dataUrl, null); // null sample ID = custom user photo
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1200;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        stopStream();
        onImageSelected(compressedDataUrl, null);
      };
      img.src = event.target?.result;
    };
    reader.readAsDataURL(file);
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      
      {/* Workbench Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/70 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <ScanEye className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              1. Visual Inspection Workbench
              {activeSampleId && (
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Demo Sample Mode
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Capture webcam photo, upload leaf image, or test with sample plants
            </p>
          </div>
        </div>

        {selectedImage && (
          <button
            onClick={() => {
              stopStream();
              onClearImage();
            }}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 px-2 py-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Viewport Area */}
      <div className="relative aspect-video sm:aspect-[16/10] bg-slate-950 flex items-center justify-center overflow-hidden">
        
        {/* State A: Selected/Captured Image Preview */}
        {selectedImage ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={selectedImage}
              alt="Plant specimen"
              className="w-full h-full object-contain"
            />

            {/* Overlay Banner */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <span className="bg-slate-950/80 backdrop-blur-md text-emerald-300 border border-emerald-800/60 text-xs px-2.5 py-1 rounded-lg shadow-md font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Specimen Frame Captured
              </span>
            </div>

            {/* Action Bar on Image */}
            <div className="absolute bottom-4 inset-x-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  stopStream();
                  startCamera();
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 backdrop-blur-md text-xs font-semibold shadow-lg transition flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>Retake</span>
              </button>

              <button
                type="button"
                onClick={onTriggerVisionAnalysis}
                disabled={isAnalyzingVision}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/60 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isAnalyzingVision ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{isAnalyzingVision ? 'Observing Foliage...' : 'Run Vision Inspection'}</span>
              </button>
            </div>
          </div>
        ) : streamActive ? (
          /* State B: Live Camera Stream */
          <div className="relative w-full h-full bg-black flex items-center justify-center">
            <video
              ref={handleVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              onLoadedMetadata={(e) => {
                e.target.play().catch(err => console.warn('Autoplay on metadata:', err));
              }}
            />

            {/* Camera Input Switcher Pill (Top Bar) */}
            {videoDevices.length > 0 && (
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md border border-slate-700/80 rounded-xl px-2.5 py-1 text-xs text-slate-200 shadow-lg">
                <Video className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <select
                  value={selectedDeviceId}
                  onChange={(e) => handleSelectDevice(e.target.value)}
                  className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer max-w-[160px] sm:max-w-[220px] truncate"
                  title="Switch camera input source"
                >
                  {videoDevices.map((dev, idx) => (
                    <option key={dev.deviceId || idx} value={dev.deviceId} className="bg-slate-900 text-slate-100">
                      {dev.label || `Camera ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Target Reticle Overlay */}
            <div className="absolute inset-8 border border-white/20 rounded-2xl pointer-events-none flex flex-col justify-between p-4">
              <div className="flex justify-between">
                <div className="w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                <div className="w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
              </div>
              <p className="text-center text-xs text-white/70 font-medium bg-black/40 backdrop-blur-sm self-center px-3 py-1 rounded-full">
                Center foliage & petiole base in frame
              </p>
              <div className="flex justify-between">
                <div className="w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                <div className="w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
              </div>
            </div>

            {/* Camera Controls */}
            <div className="absolute bottom-4 inset-x-4 flex items-center justify-center gap-4 z-10">
              <button
                type="button"
                onClick={toggleFacingMode}
                className="p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 shadow-md transition"
                title={videoDevices.length > 1 ? "Cycle Next Camera Input" : "Switch Camera (Front/Back)"}
              >
                <SwitchCamera className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={capturePhoto}
                className="p-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xl shadow-emerald-500/40 ring-4 ring-white/20 transition active:scale-95"
                title="Capture Photo"
              >
                <Camera className="w-6 h-6 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={stopStream}
                className="p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 shadow-md transition"
                title="Stop Stream"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          /* State C: Initial Standby / Selection Menu */
          <div className="p-6 text-center max-w-md space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center mx-auto text-emerald-400 shadow-inner">
              {isStartingCamera ? (
                <RefreshCw className="w-7 h-7 animate-spin text-emerald-400" />
              ) : (
                <Camera className="w-7 h-7" />
              )}
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-200 mb-1">
                Visual Telemetry Input
              </h4>
              <p className="text-xs text-slate-400">
                {isStartingCamera 
                  ? 'Initializing camera sensor...' 
                  : 'Use your device camera to inspect leaf turgor and color, or upload an existing image.'}
              </p>
            </div>

            {/* Camera Device Selector if multiple cameras already detected */}
            {videoDevices.length > 1 && !isStartingCamera && (
              <div className="inline-flex items-center gap-2 p-1.5 px-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 max-w-xs mx-auto">
                <Video className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-slate-400 shrink-0">Input:</span>
                <select
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer truncate"
                  title="Choose default camera input"
                >
                  {videoDevices.map((dev, idx) => (
                    <option key={dev.deviceId || idx} value={dev.deviceId} className="bg-slate-900 text-slate-100">
                      {dev.label || `Camera ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {cameraError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={isStartingCamera}
                onClick={() => startCamera(selectedDeviceId)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-950/50 transition disabled:opacity-50"
              >
                {isStartingCamera ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                <span>{isStartingCamera ? 'Connecting...' : 'Open Live Camera'}</span>
              </button>

              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-medium cursor-pointer transition shadow-md">
                <Upload className="w-4 h-4 text-slate-400" />
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

      </div>

      {/* Preset Demo Samples Bar */}
      <div className="p-3.5 bg-slate-800/30 border-t border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Sliders className="w-3 h-3 text-emerald-400" />
            Instant Botanical Test Scenarios:
          </span>
          <span className="text-[10px] text-slate-500">
            Click to evaluate without camera
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SAMPLE_SCENARIOS.map((scen) => {
            const isSelected = activeSampleId === scen.id;
            return (
              <button
                key={scen.id}
                type="button"
                onClick={() => {
                  stopStream();
                  onSelectSampleScenario(scen);
                }}
                className={`flex flex-col text-left p-2 rounded-xl border transition text-xs ${
                  isSelected
                    ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200 shadow-md ring-1 ring-emerald-500/50'
                    : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/60 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-semibold truncate text-[11px] text-white">
                    {scen.title.split(' ')[0]} {scen.title.split(' ')[1] || ''}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium border ${scen.tagColor}`}>
                    {scen.tag.split(' ')[0]}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 line-clamp-1">
                  {scen.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
