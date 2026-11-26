// Open-Meteo Weather Service
// Zero API Key required. 100% Free outdoor microclimate context.

export async function fetchWeatherData(lat, lon) {
  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', lat.toString());
    url.searchParams.set('longitude', lon.toString());
    url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,precipitation,weather_code,cloud_cover,wind_speed_10m');
    url.searchParams.set('hourly', 'temperature_2m,relative_humidity_2m,uv_index');
    url.searchParams.set('forecast_days', '1');
    url.searchParams.set('timezone', 'auto');

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`Open-Meteo HTTP error: ${res.status}`);
    }
    const data = await res.json();
    const current = data.current || {};
    
    // Calculate Vapor Pressure Deficit (VPD in kPa)
    const tempC = current.temperature_2m ?? 22;
    const rh = current.relative_humidity_2m ?? 50;
    const vpd = calculateVPD(tempC, rh);

    // Weather code description
    const weatherDesc = getWeatherDescription(current.weather_code);

    return {
      success: true,
      data: {
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
        elevation: data.elevation,
        temperature: current.temperature_2m,
        temperatureUnit: '°C',
        humidity: current.relative_humidity_2m,
        humidityUnit: '%',
        precipitation: current.precipitation,
        precipitationUnit: 'mm',
        cloudCover: current.cloud_cover,
        cloudCoverUnit: '%',
        windSpeed: current.wind_speed_10m,
        windSpeedUnit: 'km/h',
        weatherCode: current.weather_code,
        weatherDescription: weatherDesc,
        vpdKpa: vpd.toFixed(2),
        vpdStatus: getVPDStatus(vpd),
        fetchedAt: new Date().toISOString(),
        disclaimer: 'External ambient forecast from Open-Meteo (Not an in-pot sensor).'
      }
    };
  } catch (error) {
    console.error('Error fetching Open-Meteo weather:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch weather data'
    };
  }
}

/**
 * Calculates Vapor Pressure Deficit (VPD in kPa)
 * Important botanical indicator of plant transpiration pressure.
 */
export function calculateVPD(tempC, rhPercent) {
  // Tetens formula for saturated vapor pressure (kPa)
  const vpSat = 0.61078 * Math.exp((17.27 * tempC) / (tempC + 237.3));
  const vpAct = vpSat * (Math.max(0, Math.min(100, rhPercent)) / 100);
  return Math.max(0, vpSat - vpAct);
}

function getVPDStatus(vpd) {
  if (vpd < 0.4) {
    return {
      label: 'Low Transpiration Pressure',
      badgeColor: 'text-blue-400 bg-blue-950/40 border-blue-800',
      description: 'Air is moist; plant foliage transpires slowly. Wet potting medium will stay damp longer (watch for overwatering).'
    };
  } else if (vpd <= 1.25) {
    return {
      label: 'Optimal Foliar Transpiration',
      badgeColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-800',
      description: 'Ideal evaporative demand for indoor tropicals like Pothos. Roots and leaves exchange moisture comfortably.'
    };
  } else if (vpd <= 1.6) {
    return {
      label: 'Moderate Moisture Pull',
      badgeColor: 'text-amber-400 bg-amber-950/40 border-amber-800',
      description: 'Air is relatively dry; leaves transpire faster. Soil moisture evaporates at an accelerated rate.'
    };
  } else {
    return {
      label: 'High Atmospheric Stress',
      badgeColor: 'text-rose-400 bg-rose-950/40 border-rose-800',
      description: 'Dry air aggressively draws moisture from leaf surfaces. Tips may brown or droop rapidly if root uptake cannot keep up.'
    };
  }
}

function getWeatherDescription(code) {
  if (code === undefined || code === null) return 'Clear / Unknown';
  const codes = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snowfall',
    73: 'Moderate snowfall',
    75: 'Heavy snowfall',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    95: 'Thunderstorm'
  };
  return codes[code] || 'Variable conditions';
}

/**
 * Browser Geolocation helper with timeout
 */
export function getBrowserCoordinates() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  });
}
