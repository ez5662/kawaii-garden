import type { PlotTarget } from '../../lib/garden'
import { sceneColors } from '../../lib/theme'
import type { Garden } from '../../lib/useGarden'
import type { Sky as SkyState } from '../../lib/useSky'
import { Shape } from '../Shape'
import { Fence, Precipitation, Sky } from './Backdrop'
import { Bird, FertilizeGlow, ForegroundEffect, Frog, WeedEffect } from './Critters'
import { FlowerBed, ScenePlots } from './Plots'
import { SceneTopBar, Toast } from './SceneOverlay'
import { Mound, Tree } from './Tree'
import { Waterfall } from './Waterfall'

const groundDot = (side: 'left' | 'right', pos: string, bottom: number, z: number, color: string) => (
  <Shape s={{ [side]: pos, bottom, width: z, height: z, borderRadius: '50%', background: color, boxShadow: '0 0 0 3px #fff' }} />
)

/** The garden scene. All children are absolutely positioned from the bottom, back → front. */
export function Scene({ g, sky, onLive, onPlant }: {
  g: Garden; sky: SkyState; onLive: () => void; onPlant: (t: PlotTarget) => void
}) {
  const c = sceneColors(sky.tod, sky.weather)
  const night = sky.tod === 'night'
  const fx = g.fx

  return (
    <div
      className="relative overflow-hidden rounded-3xl"
      style={{ height: 'clamp(450px, 62vh, 600px)' }}
    >
      <Sky blend={sky.blend} weather={sky.weather} sun={sky.sun} moon={sky.moon} c={c} />

      <Shape s={{ left: '-20%', right: '-20%', bottom: 0, height: 150, borderRadius: '50% 50% 0 0 / 22px 22px 0 0', background: c.ground1, transition: 'background 1.2s' }} />
      <Waterfall c={c} />
      <Fence c={c} />
      <Shape s={{ left: '-25%', right: '-25%', bottom: 0, height: 76, borderRadius: '50% 50% 0 0 / 26px 26px 0 0', background: c.ground2, transition: 'background 1.2s' }} />
      {groundDot('left', '14%', 42, 12, '#FFB3C7')}
      {groundDot('left', '22%', 26, 9, '#FFE07A')}
      {groundDot('right', '16%', 38, 11, '#FFB3C7')}
      {groundDot('right', '26%', 20, 8, '#C9B8FF')}

      <FlowerBed bed={g.bed} bedCap={g.bedCap} bedOpen={g.bedOpen} done={g.done} onPlant={onPlant} />
      <ScenePlots plots={g.plots} level={g.level} done={g.done} night={night} pool={c.pool} onPlant={onPlant} />

      {fx?.effect === 'weed' && <WeedEffect key={fx.key} />}
      {g.streak > 6 && <Frog />}
      {fx?.effect === 'fertilize' && <FertilizeGlow key={fx.key} />}

      <Tree stage={g.stageIndex} blossoms={g.nBloom} />
      <Mound showFace={g.stageIndex < 3} asleep={night} />

      {g.streak > 3 && <Bird />}
      {fx && <ForegroundEffect key={fx.key} effect={fx.effect} />}

      <Precipitation weather={sky.weather} />
      <SceneTopBar sky={sky} onManual={g.setWeather} onLive={onLive} />
      {fx && <Toast key={fx.key} toast={fx.toast} />}
    </div>
  )
}
