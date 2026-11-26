# 🌱 RootMind — Evidence-Based Plant Health & Diagnostic Assistant

**RootMind** is a responsive web application designed for evidence-based houseplant monitoring and diagnostics without requiring **any physical sensors or microcontrollers (no Arduino, ESP32, or soil probes)**. 

Instead of relying on hardware sensor kits, RootMind pairs the user's camera (or photo upload) with real-time **Open-Meteo** microclimate telemetry, tactile soil verification, and **Groq AI** multimodal vision and differential reasoning.

---

## 🪴 Diagnostic Philosophy & Core Concepts

1. **Zero Hardware Sensors**: Replaces fragile physical sensors with a synthesis of:
   - **Device Camera / Image Upload**: Analyzes foliar turgor, chlorosis, necrotic margins, and petiole posture.
   - **Open-Meteo API (100% Free, No API Key)**: Computes ambient outdoor temperature, relative humidity, and foliar **Vapor Pressure Deficit (VPD)** to assess transpiration pressure.
   - **User Tactile Verification**: Quick structured checks for soil moisture at depth (1.5–2 inches), planter heft/weight, and drainage saucer condition.
2. **Never Jump to Blind Conclusions**: Drooping foliage is not an automatic prompt to water—overwatering causes root hypoxia (suffocation) and rot, producing wilting identical to drought.
3. **Strict Non-Chemical Safety Rule**: Never recommends unverified synthetic pesticides or chemical treatments. Care steps are restricted to safe, reversible physical actions (aeration, saucer drainage, light adjustment, aerobic dry cycles).
4. **Differential Diagnosis & Uncertainty**: Weights competing hypotheses with probability scores, contrasting supporting evidence against conflicting factors.

---

## 🛠️ Tech Stack & Constraints

- **Frontend:** React 18 + Vite + Tailwind CSS + Lucide React.
- **Multimodal AI Vision & Reasoning:** [Groq API](https://console.groq.com/keys) (`https://api.groq.com/openai/v1/chat/completions`):
  - *Vision Engine:* `qwen/qwen3.8-27b` (or `meta-llama/llama-4-scout-17b-16e-preview`, configurable).
  - *Diagnostic Engine:* `openai/gpt-oss-120b` (or `qwen/qwen3.8-27b` / `llama-3.3-70b-versatile`).
  - *Fallback / Demo Mode:* Preloaded sample botanical scenarios (Healthy Pothos, Overwatered Root Hypoxia, Underwatered Drought Stress, Sunburn Scorch) for instant evaluation without an active camera or sick plant.
- **Microclimate Data:** [Open-Meteo API](https://open-meteo.com) (free, no sign-up, with GPS auto-detection and global city presets).
- **Storage:** Browser `localStorage` with JSON backup export and restore. Zero paid cloud database.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Groq API Key (Optional)
You can enter your `GROQ_API_KEY` directly inside the app's **Settings Modal** (it stays safely in browser `localStorage`), or create a `.env` file:
```env
VITE_GROQ_API_KEY=gsk_your_groq_api_key_here
```
> *Note: If no API key is provided, RootMind operates in **Local Botanical Simulation Mode**, allowing you to test all workflows and pre-loaded sample scenarios.*

### 3. Run Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173`.

---

## 🧭 5-Step Diagnostic Workbench Flow

1. **Visual Telemetry Input:** Live webcam stream with flip camera support, photo file upload, or preset sample picker.
2. **Environmental & Tactile Context:** Live Open-Meteo temperature, humidity, VPD gauge, and tactile soil touch checks.
3. **Vision Observations:** Multimodal extraction of symptom tags, affected zones, severity, and confidence score.
4. **Diagnostic Investigation (Interactive Q&A):** Clarifying questions appear if symptoms are ambiguous before diagnosing.
5. **Diagnosis & Care Action Plan:** Primary diagnosis, competing hypotheses ranking, supporting vs. conflicting evidence, and safe care checklist with **"Mark Done & Log"** buttons.

---

## 📊 Plant Memory & Recovery Timeline

- **Checkup Snapshots:** Saves full botanical evaluations with images, weather metrics, and notes.
- **Side-by-Side Progression:** Compares any two checkups to determine if the condition is **Improving**, **Unchanged**, or **Worsening**.
- **Care Action Audit Log:** Chronological record of completed maintenance actions.
- **JSON Export / Restore:** Back up and restore your full plant database at any time.
