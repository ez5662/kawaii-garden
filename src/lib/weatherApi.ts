import type { Weather } from './garden'

// Open-Meteo: free, no API key, CORS-enabled (works from file:// too).
const FORECAST = 'https://api.open-meteo.com/v1/forecast'
const GEOCODE = 'https://geocoding-api.open-meteo.com/v1/search'

export interface Place {
  lat: number
  lon: number
  name: string
}

export interface WeatherReport {
  weather: Weather
  code: number
  /** Always Celsius; converted for display. */
  tempC: number
  /** Unix seconds. */
  sunrise: number
  sunset: number
  fetchedAt: number
}

const PLACE_KEY = 'kawaii-garden-place'

export function loadPlace(): Place | null {
  try {
    const p = JSON.parse(localStorage.getItem(PLACE_KEY) ?? 'null')
    return p && typeof p.lat === 'number' && typeof p.lon === 'number' && typeof p.name === 'string' ? p : null
  } catch {
    return null
  }
}
export function savePlace(p: Place) {
  try { localStorage.setItem(PLACE_KEY, JSON.stringify(p)) } catch { /* in-memory only */ }
}

/** WMO weather code → scene weather. */
export function weatherFromCode(code: number): Weather {
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snowing'
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95) return 'raining'
  if (code === 2 || code === 3 || code === 45 || code === 48) return 'cloudy'
  return 'sunny'
}

export type TempUnit = 'C' | 'F'
const UNIT_KEY = 'kawaii-garden-temp-unit'

/** Saved choice, else °F for US English browsers and °C everywhere else. */
export function loadUnit(): TempUnit {
  try {
    const u = localStorage.getItem(UNIT_KEY)
    if (u === 'C' || u === 'F') return u
  } catch { /* fall through */ }
  return /^en-US$/i.test(navigator.language || '') ? 'F' : 'C'
}
export function saveUnit(u: TempUnit) {
  try { localStorage.setItem(UNIT_KEY, u) } catch { /* not remembered */ }
}
export const formatTemp = (c: number, u: TempUnit) => `${Math.round(u === 'F' ? c * 9 / 5 + 32 : c)}°${u}`

async function getJson(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchWeather(p: Place): Promise<WeatherReport> {
  const q = new URLSearchParams({
    latitude: p.lat.toFixed(3),
    longitude: p.lon.toFixed(3),
    current: 'weather_code,temperature_2m',
    daily: 'sunrise,sunset',
    timezone: 'auto',
    timeformat: 'unixtime',
    forecast_days: '1',
    temperature_unit: 'celsius',
  })
  const d = await getJson(`${FORECAST}?${q}`)
  const code = Number(d?.current?.weather_code)
  const sunrise = Number(d?.daily?.sunrise?.[0]), sunset = Number(d?.daily?.sunset?.[0])
  if (![code, sunrise, sunset].every(Number.isFinite)) throw new Error('Unexpected weather response')
  return {
    weather: weatherFromCode(code),
    code,
    tempC: Number(d.current.temperature_2m),
    sunrise,
    sunset,
    fetchedAt: Date.now(),
  }
}

/** Look up a city by name. Returns null if nothing matches. */
export async function geocodeCity(query: string): Promise<Place | null> {
  const q = new URLSearchParams({ name: query, count: '1', language: 'en', format: 'json' })
  const d = await getJson(`${GEOCODE}?${q}`)
  const r = d?.results?.[0]
  if (!r) return null
  const region = r.country_code === 'US' ? r.admin1 : r.country
  return { lat: r.latitude, lon: r.longitude, name: region ? `${r.name}, ${region}` : r.name }
}
