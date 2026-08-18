// Free, keyless APIs: ipapi.co for a rough location from the visitor's IP,
// then open-meteo.com for real current weather at that location. Both are
// public GET endpoints with CORS enabled — no signup, no secrets.

const FALLBACK_LOCATION = { latitude: 12.9716, longitude: 77.5946, city: "Bengaluru" };

const WEATHER_CODES = {
  0: { label: "Clear Sky", kind: "clear", icon: "☀️" },
  1: { label: "Mostly Clear", kind: "clear", icon: "🌤️" },
  2: { label: "Partly Cloudy", kind: "cloud", icon: "⛅" },
  3: { label: "Overcast", kind: "cloud", icon: "☁️" },
  45: { label: "Foggy", kind: "fog", icon: "🌫️" },
  48: { label: "Rime Fog", kind: "fog", icon: "🌫️" },
  51: { label: "Light Drizzle", kind: "rain", icon: "🌦️" },
  53: { label: "Drizzle", kind: "rain", icon: "🌦️" },
  55: { label: "Heavy Drizzle", kind: "rain", icon: "🌧️" },
  61: { label: "Light Rain", kind: "rain", icon: "🌧️" },
  63: { label: "Rain", kind: "rain", icon: "🌧️" },
  65: { label: "Heavy Rain", kind: "rain", icon: "🌧️" },
  71: { label: "Light Snow", kind: "snow", icon: "🌨️" },
  73: { label: "Snow", kind: "snow", icon: "🌨️" },
  75: { label: "Heavy Snow", kind: "snow", icon: "❄️" },
  80: { label: "Rain Showers", kind: "rain", icon: "🌧️" },
  81: { label: "Rain Showers", kind: "rain", icon: "🌧️" },
  82: { label: "Violent Showers", kind: "rain", icon: "⛈️" },
  85: { label: "Snow Showers", kind: "snow", icon: "🌨️" },
  86: { label: "Snow Showers", kind: "snow", icon: "❄️" },
  95: { label: "Thunderstorm", kind: "storm", icon: "⛈️" },
  96: { label: "Thunderstorm + Hail", kind: "storm", icon: "⛈️" },
  99: { label: "Severe Thunderstorm", kind: "storm", icon: "⛈️" },
};

export function describeWeatherCode(code) {
  return WEATHER_CODES[code] || { label: "Clear Sky", kind: "clear", icon: "✨" };
}

export async function fetchApproxLocation(signal) {
  try {
    const res = await fetch("https://ipapi.co/json/", { signal });
    if (!res.ok) throw new Error("location lookup failed");
    const data = await res.json();
    if (typeof data.latitude !== "number" || typeof data.longitude !== "number") {
      throw new Error("no coordinates");
    }
    return { latitude: data.latitude, longitude: data.longitude, city: data.city || FALLBACK_LOCATION.city };
  } catch {
    return FALLBACK_LOCATION;
  }
}

export async function fetchCurrentWeather({ latitude, longitude }, signal) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("weather lookup failed");
  const data = await res.json();
  return data.current_weather;
}

export async function fetchLiveWeather(signal) {
  const location = await fetchApproxLocation(signal);
  const current = await fetchCurrentWeather(location, signal);
  const info = describeWeatherCode(current.weathercode);
  return {
    city: location.city,
    tempC: Math.round(current.temperature),
    isDay: current.is_day === 1,
    ...info,
  };
}
