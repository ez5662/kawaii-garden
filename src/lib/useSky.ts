import { useCallback, useEffect, useRef, useState } from 'react'
import type { TestingProps, Weather } from './garden'
import {
  DEFAULT_SUN, arcPosition, arcProgress, hourForPeriod, hourOf, periodAt, skyBlend, usableSun, type SunTimes,
} from './sun'
import {
  fetchWeather, formatTemp, geocodeCity, loadPlace, loadUnit, savePlace, saveUnit, type Place, type TempUnit, type WeatherReport,
} from './weatherApi'

const TICK_MS = 20_000
const REFRESH_MS = 15 * 60_000

export type LiveStatus = 'idle' | 'locating' | 'loading' | 'ready' | 'error'

/**
 * Everything about the sky: the device clock, sun & moon on real sunrise/sunset
 * (once a location is known), and live weather from Open-Meteo.
 */
export function useSky(testing: TestingProps, live: boolean, manualWeather: Weather) {
  const [now, setNow] = useState(() => new Date())
  const [place, setPlace] = useState<Place | null>(loadPlace)
  const [report, setReport] = useState<WeatherReport | null>(null)
  const [status, setStatus] = useState<LiveStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [unit, setUnitState] = useState<TempUnit>(loadUnit)
  const askedForLocation = useRef(false)
  const setUnit = useCallback((u: TempUnit) => { saveUnit(u); setUnitState(u) }, [])

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), TICK_MS)
    return () => window.clearInterval(t)
  }, [])

  const choosePlace = useCallback((p: Place) => {
    savePlace(p)
    setPlace(p)
  }, [])

  const locate = useCallback(() => {
    askedForLocation.current = true
    if (!navigator.geolocation) {
      setStatus('error')
      setError('This browser can’t share your location — type a city instead.')
      return
    }
    setStatus('locating')
    setError(null)
    navigator.geolocation.getCurrentPosition(
      pos => choosePlace({ lat: pos.coords.latitude, lon: pos.coords.longitude, name: 'Your location' }),
      err => {
        setStatus('error')
        setError(err.code === err.PERMISSION_DENIED
          ? 'Location was blocked — type a city instead.'
          : 'Couldn’t find your location — type a city instead.')
      },
      { timeout: 15_000, maximumAge: 60 * 60_000 },
    )
  }, [choosePlace])

  const searchCity = useCallback(async (query: string) => {
    const q = query.trim()
    if (!q) return
    setStatus('loading')
    setError(null)
    try {
      const p = await geocodeCity(q)
      if (p) choosePlace(p)
      else {
        setStatus('error')
        setError(`Couldn’t find “${q}”.`)
      }
    } catch {
      setStatus('error')
      setError('Couldn’t reach the weather service. Are you online?')
    }
  }, [choosePlace])

  // First visit with live weather on: ask for the location once.
  useEffect(() => {
    if (live && !place && !askedForLocation.current) locate()
  }, [live, place, locate])

  // Fetch for the current place (also gives real sunrise/sunset), then refresh.
  useEffect(() => {
    if (!place) return
    let cancelled = false
    const load = async () => {
      setStatus(s => (s === 'ready' ? s : 'loading'))
      try {
        const r = await fetchWeather(place)
        if (cancelled) return
        setReport(r)
        setStatus('ready')
        setError(null)
      } catch {
        if (cancelled) return
        setStatus('error')
        setError('Couldn’t reach the weather service. Showing the last known sky.')
      }
    }
    load()
    const t = window.setInterval(load, REFRESH_MS)
    return () => {
      cancelled = true
      window.clearInterval(t)
    }
  }, [place])

  // ---- derived ----
  const sun: SunTimes | null = usableSun(report ? {
    rise: hourOf(new Date(report.sunrise * 1000)),
    set: hourOf(new Date(report.sunset * 1000)),
  } : null)
  const arc = sun ?? DEFAULT_SUN
  const forced = testing.timeOfDay !== 'auto' ? testing.timeOfDay : null
  const clockHour = testing.hour ?? hourOf(now)
  // What the clock chip shows — follows the ?hour= override when testing.
  const clock = testing.hour == null ? now : new Date(new Date(now).setHours(0, 0, 0, 0) + testing.hour * 3_600_000)
  const h = forced ? hourForPeriod(forced, arc) : clockHour

  const tod = forced ?? periodAt(h, sun)
  const blend = forced ? { from: forced, to: forced, t: 0 } : skyBlend(h, sun)
  const sunP = arcProgress(h, arc.rise, arc.set)
  const moonP = arcProgress(h, arc.set, arc.rise)
  const weather = live && report ? report.weather : manualWeather

  return {
    now, clock, tod, blend, weather,
    sunTimes: sun,
    sun: sunP < 1 ? arcPosition(sunP, 36) : null,
    moon: moonP < 1 ? arcPosition(moonP, 40) : null,
    live, place, report, status, error,
    unit, setUnit, temp: report ? formatTemp(report.tempC, unit) : null,
    locate, searchCity,
  }
}

export type Sky = ReturnType<typeof useSky>
