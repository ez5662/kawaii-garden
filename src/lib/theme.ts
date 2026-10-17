import type { TimeOfDay, Weather } from './garden'

export const SKIES: Record<TimeOfDay, string> = {
  morning: 'linear-gradient(180deg, #CDE6FF 0%, #E9F0FF 45%, #FFF0C4 100%)',
  noon: 'linear-gradient(180deg, #9ED3FF 0%, #C9E8FF 55%, #E6F5FF 100%)',
  sunset: 'linear-gradient(180deg, #FFAE9C 0%, #FFCAD6 50%, #FFE6BC 100%)',
  night: 'linear-gradient(180deg, #1F2146 0%, #352F67 55%, #574684 100%)',
}

export interface SceneColors {
  ground1: string
  ground2: string
  rockA: string
  rockB: string
  rockC: string
  rockWall: string
  moss: string
  bushA: string
  bushB: string
  waterA: string
  waterB: string
  pool: string
  fence: string
  fenceShade: string
  cloud: string
  cloudOpacity: number
  sun: string
}

/** Rocks, water, bushes, fence and ground recolor per period and weather. */
export function sceneColors(tod: TimeOfDay, w: Weather): SceneColors {
  const night = tod === 'night', sunset = tod === 'sunset'
  const [ground1, ground2] = w === 'snowing' ? ['#E4ECF5', '#F4F8FC'] : night ? ['#3F6268', '#4E7676'] : sunset ? ['#BFDDB0', '#D2EBC2'] : ['#A9E0C2', '#C3EED6']
  const [rockA, rockB, rockC] = night ? ['#6E6A8A', '#625E7E', '#78749A'] : sunset ? ['#D6C8BF', '#C9B9AF', '#E0D4CC'] : ['#C9C7B8', '#B7B5A6', '#D5D3C5']
  return {
    ground1, ground2, rockA, rockB, rockC,
    rockWall: night ? '#57537A' : sunset ? '#BFAFA5' : '#ABA999',
    moss: w === 'snowing' ? '#FFFFFF' : night ? '#5E8C78' : '#A6D79A',
    bushA: night ? '#3F6A63' : sunset ? '#A2CF9A' : '#93CFA0',
    bushB: night ? '#4A776E' : sunset ? '#B2D9A6' : '#A6DAB0',
    waterA: night ? '#6F86C2' : '#AEDFFA',
    waterB: night ? '#A3B6EA' : '#EAF8FF',
    pool: night ? '#5F77B4' : '#9ED6F5',
    fence: night ? '#A79FCB' : '#FFF3E6',
    fenceShade: night ? '#8E86B6' : '#EBD6C3',
    cloud: w === 'sunny' ? '#FFFFFF' : night ? '#8F8BB0' : '#E4E8F1',
    cloudOpacity: night ? (w === 'sunny' ? 0.25 : 0.7) : 0.92,
    sun: sunset ? '#FFC46B' : '#FFE07A',
  }
}
