import { ClipboardList, Flame, Leaf, Sprout, type LucideIcon } from 'lucide-react'

const pill = 'flex h-11 items-center gap-2 rounded-full pr-[18px] pl-3 font-fredoka text-base font-semibold'

function PillIcon({ Icon, bg }: { Icon: LucideIcon; bg: string }) {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full text-white" style={{ background: bg }}>
      <Icon size={16} strokeWidth={2.6} />
    </span>
  )
}

export function Header({ streak, level, onToggleList }: { streak: number; level: number; onToggleList: () => void }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="flex h-14 w-14 -rotate-6 items-center justify-center rounded-[20px] bg-[#CFF2DF] text-[#3E8E66] shadow-[0_4px_0_#A9E2C4]">
          <Sprout size={28} strokeWidth={2.4} />
        </div>
        <div className="flex flex-col gap-0.5">
          <h1 className="m-0 font-fredoka text-[32px] leading-[1.05] font-semibold tracking-[-0.5px]">Kawaii Garden</h1>
          <div className="text-[15px] font-semibold text-muted">Grow a little tree, one tiny task at a time</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <div className={`${pill} bg-[#FFF0BF] text-[#7A5600] shadow-[0_4px_0_#F2D98A]`}>
          <PillIcon Icon={Flame} bg="#FFB36B" />
          <span>{streak}-day streak</span>
        </div>
        <div className={`${pill} bg-[#D9F5E6] text-mint-ink shadow-[0_4px_0_#ACE3C6]`}>
          <PillIcon Icon={Leaf} bg="#6CC896" />
          Level {level}
        </div>
        <button
          onClick={onToggleList}
          className={`${pill} cursor-pointer border-0 bg-pink-tint text-pink-ink shadow-[0_4px_0_#F7B5C6] transition-transform hover:-translate-y-px active:translate-y-0.5 active:shadow-[0_2px_0_#F7B5C6]`}
        >
          <PillIcon Icon={ClipboardList} bg="#FF9DB5" />
          To-dos
        </button>
      </div>
    </header>
  )
}
