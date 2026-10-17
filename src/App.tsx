import { useEffect, useState } from 'react'
import { ClipboardFab, ClipboardPanel } from './components/Clipboard'
import { GardenStatus } from './components/GardenStatus'
import { Header } from './components/Header'
import { Scene } from './components/scene/Scene'
import { SeedPicker } from './components/SeedPicker'
import { readTestingProps, type PlotTarget } from './lib/garden'
import { useAutoBackup } from './lib/useAutoBackup'
import { useGarden } from './lib/useGarden'
import { useSky } from './lib/useSky'

const testing = readTestingProps()

export default function App() {
  const g = useGarden(testing)
  const sky = useSky(testing, g.weatherLive, g.manualWeather)
  const autoBackup = useAutoBackup(g.garden)
  const [listOpen, setListOpen] = useState(false)
  const [picking, setPicking] = useState<PlotTarget | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (picking != null) setPicking(null)
      else setListOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [picking])

  const toggleList = () => setListOpen(o => !o)

  return (
    <div
      className="box-border min-h-screen px-5 pt-7 pb-14 font-nunito text-ink"
      style={{ backgroundColor: '#FFF8F1', backgroundImage: 'radial-gradient(#F2E1D3 1.3px, transparent 1.3px)', backgroundSize: '22px 22px' }}
    >
      <div className="mx-auto flex max-w-[1240px] flex-col gap-[22px]">
        <Header streak={g.streak} level={g.level} onToggleList={toggleList} />
        <section
          aria-label="Garden"
          className="flex min-w-0 flex-col gap-1.5 rounded-[32px] border-2 border-line bg-paper p-3 shadow-[0_8px_0_#F0E0D3,0_22px_44px_rgba(160,120,100,.12)]"
        >
          <Scene g={g} sky={sky} onLive={g.setWeatherLive} onPlant={setPicking} />
          <GardenStatus g={g} onPlant={setPicking} />
        </section>
      </div>

      <ClipboardPanel open={listOpen} g={g} ab={autoBackup} now={sky.now} onClose={() => setListOpen(false)} />
      <ClipboardFab open={g.open} onClick={toggleList} />
      <SeedPicker
        target={picking}
        onClose={() => setPicking(null)}
        onPick={type => {
          if (picking == null) return
          g.plant(picking, type)
          setPicking(null)
        }}
      />
    </div>
  )
}
