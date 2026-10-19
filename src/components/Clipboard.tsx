import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowDownUp, Ban, Check, CloudUpload, Download, List, ListTodo, PartyPopper, Plus, RotateCcw, Sprout, Trash2, Upload, X,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { downloadBackup, parseBackup } from '../lib/backup'
import type { Task } from '../lib/garden'
import type { AutoBackup } from '../lib/useAutoBackup'
import type { Garden } from '../lib/useGarden'

const ROW_STYLE = {
  done: { bg: '#ECF9F2', border: '#BDE8D1', dashed: false, color: '#4E8468', sub: '#4E8468', dotBg: '#6CC896', dotBorder: '#6CC896', label: 'Completed · helped the garden' },
  dropped: { bg: '#F7F3F0', border: '#E3D8D0', dashed: true, color: '#9A8C86', sub: '#9A8C86', dotBg: '#CFC2BA', dotBorder: '#CFC2BA', label: 'Dropped · not counted' },
  todo: { bg: '#FFFDF9', border: '#F1E4DA', dashed: false, color: '#4A3F45', sub: '#A8969C', dotBg: '#FFFFFF', dotBorder: '#E6D2C4', label: 'Waiting to grow' },
}

const footerBtn = 'flex h-8 cursor-pointer items-center gap-1.5 rounded-full border-2 border-line bg-transparent px-3.5 font-fredoka text-[13px] font-medium text-muted hover:bg-[#FFF1E6]'
const actionBtn = 'flex h-[34px] items-center gap-[5px] rounded-full border-0 pr-3 pl-[9px] font-fredoka text-[13px] font-semibold transition-transform enabled:cursor-pointer enabled:hover:-translate-y-px disabled:opacity-35'

function TaskRow({ t, g, onDelete }: { t: Task; g: Garden; onDelete: () => void }) {
  const st = t.status
  const r = ROW_STYLE[st]
  const todo = st === 'todo'
  const toggleTitle = todo ? 'Mark complete' : 'Undo'
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18, ease: 'easeIn' } }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      className="flex flex-wrap items-center gap-x-3 gap-y-2.5 rounded-[22px] border-2 py-3 pr-3 pl-3.5"
      style={{ background: r.bg, borderColor: r.border, borderStyle: r.dashed ? 'dashed' : 'solid', transition: 'background .3s, border-color .3s' }}
    >
      <div className="flex min-w-0 flex-[1_1_180px] items-center gap-3">
        <button
          onClick={() => (todo ? g.complete(t.id) : g.undo(t.id))}
          title={toggleTitle}
          aria-label={`${toggleTitle}: ${t.text}`}
          className="box-border flex h-[30px] w-[30px] shrink-0 cursor-pointer items-center justify-center rounded-full border-2 p-0 hover:scale-[1.15] active:scale-[.92]"
          style={{ background: r.dotBg, borderColor: r.dotBorder, color: todo ? '#E6D2C4' : '#FFFFFF', transition: 'transform .15s, background .3s' }}
        >
          {st === 'dropped' ? <Ban size={14} strokeWidth={3} /> : <Check size={15} strokeWidth={3} />}
        </button>
        <div className="flex min-w-0 flex-col gap-px">
          <span
            className="text-base font-bold [overflow-wrap:anywhere]"
            style={{ color: r.color, textDecoration: todo ? 'none' : 'line-through', textDecorationThickness: 2 }}
          >
            {t.text}
          </span>
          <span className="text-xs font-bold" style={{ color: r.sub }}>{r.label}</span>
        </div>
      </div>
      <div className="ml-auto flex gap-1.5">
        <button onClick={() => g.complete(t.id)} disabled={!todo} title="Complete" className={`${actionBtn} bg-[#C9F0DA] text-mint-ink`}>
          <Check size={15} strokeWidth={3} />Done
        </button>
        <button onClick={() => g.undo(t.id)} disabled={todo} title="Undo" className={`${actionBtn} bg-[#FFF0BF] text-[#8A5F00]`}>
          <RotateCcw size={15} strokeWidth={2.8} />Undo
        </button>
        <button onClick={() => g.drop(t.id)} disabled={!todo} title="Mark irrelevant" className={`${actionBtn} bg-pink-tint text-pink-ink`}>
          <Ban size={15} strokeWidth={2.8} />Drop
        </button>
        <button
          onClick={onDelete}
          title="Delete task"
          aria-label={`Delete: ${t.text}`}
          className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-muted-3 transition-colors hover:bg-pink-tint hover:text-pink-ink"
        >
          <Trash2 size={15} strokeWidth={2.6} />
        </button>
      </div>
    </motion.div>
  )
}

function StatTile({ bg, ink, strong, title, value, sub, pct, bar }: {
  bg: string; ink: string; strong: string; title: string; value: string | number; sub: string; pct?: number; bar?: string
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-[22px] p-3.5" style={{ background: bg }}>
      <span className="text-xs font-extrabold" style={{ color: ink }}>{title}</span>
      <span className="font-fredoka text-[30px] leading-[1.1] font-semibold" style={{ color: strong }}>{value}</span>
      <span className="text-xs font-bold" style={{ color: ink }}>{sub}</span>
      {pct != null && (
        <div className="mt-0.5 h-[7px] overflow-hidden rounded-full bg-[rgba(255,255,255,.75)]">
          <div className="h-full rounded-full" style={{ width: pct + '%', background: bar, transition: 'width .5s' }} />
        </div>
      )}
    </div>
  )
}

type ListView = 'all' | 'todoFirst' | 'todoOnly'
const VIEWS: [ListView, string, LucideIcon][] = [
  ['all', 'All', List],
  ['todoFirst', 'To-do first', ArrowDownUp],
  ['todoOnly', 'To-do only', ListTodo],
]
const VIEW_KEY = 'kawaii-garden-list-view'

function loadView(): ListView {
  try {
    const v = localStorage.getItem(VIEW_KEY)
    return VIEWS.some(([k]) => k === v) ? (v as ListView) : 'all'
  } catch {
    return 'all'
  }
}

/** All: newest first · To-do first: open tasks, then done/dropped · To-do only: open tasks. */
function visibleTasks(tasks: Task[], view: ListView) {
  if (view === 'all') return tasks
  const todo = tasks.filter(t => t.status === 'todo')
  return view === 'todoOnly' ? todo : [...todo, ...tasks.filter(t => t.status !== 'todo')]
}

function ViewSwitch({ view, onChange, openCount }: { view: ListView; onChange: (v: ListView) => void; openCount: number }) {
  return (
    <div role="radiogroup" aria-label="Show tasks" className="flex gap-1 rounded-full border-2 border-line bg-[#FFF9F3] p-1">
      {VIEWS.map(([k, label, Icon]) => {
        const on = k === view
        return (
          <button
            key={k}
            role="radio"
            aria-checked={on}
            onClick={() => onChange(k)}
            className={`relative flex h-8 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full border-0 bg-transparent px-2 font-fredoka text-[13px] font-semibold whitespace-nowrap transition-colors ${on ? 'text-pink-ink' : 'text-muted hover:text-ink'}`}
          >
            {on && (
              <motion.span
                layoutId="list-view-pill"
                className="absolute inset-0 rounded-full bg-pink-tint shadow-[0_2px_0_#F7B5C6]"
                transition={{ type: 'spring', stiffness: 500, damping: 36 }}
              />
            )}
            <span className="relative flex"><Icon size={14} strokeWidth={2.6} /></span>
            <span className="relative">{label}</span>
            {k === 'todoOnly' && openCount > 0 && <span className="relative text-[11px] opacity-70">{openCount}</span>}
          </button>
        )
      })}
    </div>
  )
}

/** Clip with a little face at the top of the board. */
function MetalClip() {
  return (
    <div className="absolute -top-2.5 left-1/2 z-[2] -ml-[62px] h-12 w-[124px] rounded-[16px_16px_22px_22px] bg-[#D8DCE6] shadow-[0_4px_0_#B4BACA,inset_0_3px_0_rgba(255,255,255,.6)]">
      <div className="absolute top-2 left-1/2 -ml-4 h-3 w-8 rounded-lg bg-[#F2C59A] shadow-[inset_0_2px_0_rgba(0,0,0,.12)]" />
      <div className="absolute top-7 left-11 h-1.5 w-[5px] rounded-full bg-ink" />
      <div className="absolute top-7 right-11 h-1.5 w-[5px] rounded-full bg-ink" />
      <div className="absolute top-[33px] left-[34px] h-[5px] w-[9px] rounded-full bg-[#FF9DB2]" />
      <div className="absolute top-[33px] right-[34px] h-[5px] w-[9px] rounded-full bg-[#FF9DB2]" />
      <div className="absolute top-[31px] left-1/2 -ml-1 box-content h-1 w-2 rounded-[0_0_6px_6px] border-2 border-t-0 border-ink" />
    </div>
  )
}

function savedAgo(ms: number | null, now: Date) {
  if (!ms) return ''
  const m = Math.round((now.getTime() - ms) / 60_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m} min ago`
  const d = new Date(ms)
  return d.toDateString() === now.toDateString()
    ? `today at ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
    : d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

/** Auto-backup status line + its one action. */
function AutoBackupRow({ ab, now }: { ab: AutoBackup; now: Date }) {
  const linkBtn = 'cursor-pointer rounded-full border-0 bg-transparent p-0 font-fredoka text-[13px] font-semibold text-pink-ink underline decoration-2 underline-offset-2 hover:text-[#7E2A45]'
  let text: string, action: [string, () => void] | null, ok = false
  if (ab.mode === 'file') {
    if (ab.fileState === 'ready') {
      ok = true
      text = `Auto-saving to ${ab.fileName ?? 'your backup file'} · ${savedAgo(ab.lastSavedAt, now)}`
      action = ['Turn off', ab.turnOff]
    } else if (ab.fileState === 'needs-permission') {
      text = 'Your browser needs a click to keep updating the backup file.'
      action = ['Reconnect', ab.reconnect]
    } else if (ab.fileState === 'idle') {
      text = 'Reconnecting to your backup file…'
      action = null
    } else {
      text = ab.fileState === 'missing' ? 'The backup file link was lost.' : 'Couldn’t write the backup file (was it moved?).'
      action = ['Choose file', ab.linkFile]
    }
  } else if (ab.mode === 'daily') {
    ok = true
    text = `A backup downloads on your first click each day · last ${savedAgo(ab.lastSavedAt, now)}`
    action = ['Turn off', ab.turnOff]
  } else {
    text = ab.canLinkFile
      ? 'Pick a file once and it’s kept up to date every time your garden changes.'
      : 'Download a backup to your Downloads folder automatically once a day.'
    action = ['Turn on', ab.canLinkFile ? ab.linkFile : ab.enableDaily]
  }
  return (
    <div className="flex items-start gap-2 text-[13px] font-semibold text-muted-2">
      <span className={`mt-px flex ${ok ? 'text-mint-strong' : 'text-muted-3'}`}>
        {ok ? <Check size={15} strokeWidth={3} /> : <CloudUpload size={15} strokeWidth={2.6} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="font-extrabold text-muted">Auto-backup: </span>
        {text}
        {action && <> <button onClick={action[1]} className={linkBtn}>{action[0]}</button></>}
      </span>
    </div>
  )
}

/** Slide-in clipboard panel holding the to-do list and analytics. */
export function ClipboardPanel({ open, g, ab, now, onClose }: {
  open: boolean; g: Garden; ab: AutoBackup; now: Date; onClose: () => void
}) {
  const [draft, setDraft] = useState('')
  const [view, setView] = useState<ListView>(loadView)
  const changeView = (v: ListView) => {
    setView(v)
    try { localStorage.setItem(VIEW_KEY, v) } catch { /* not remembered */ }
  }
  const shown = visibleTasks(g.tasks, view)
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const [deleted, setDeleted] = useState<Parameters<Garden['unremove']>[0] | null>(null)

  // The "Deleted · Undo" pop-up hides itself after a few seconds.
  useEffect(() => {
    if (!deleted) return
    const t = window.setTimeout(() => setDeleted(null), 6000)
    return () => window.clearTimeout(t)
  }, [deleted])
  const deleteTask = (id: number) => {
    const r = g.remove(id)
    if (r) setDeleted(r)
  }
  const undoDelete = () => {
    if (deleted) g.unremove(deleted)
    setDeleted(null)
  }
  const add = () => { if (g.add(draft)) setDraft('') }
  const pct = (x: number) => Math.round(x * 100)
  const reset = () => {
    if (window.confirm('Reset your garden? This clears all tasks, plots and progress.')) g.reset()
  }
  const exportBackup = () => {
    downloadBackup(g.garden)
    setNotice({ ok: true, text: 'Backup downloaded — keep it somewhere safe.' })
  }
  const importBackup = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow picking the same file again
    if (!file) return
    try {
      const { garden, exportedAt } = parseBackup(await file.text())
      const from = exportedAt ? ` from ${exportedAt.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}` : ''
      const n = garden.tasks.length
      if (!window.confirm(`Restore this backup${from} (${n} task${n === 1 ? '' : 's'})? It replaces your current garden.`)) return
      g.restore(garden)
      setNotice({ ok: true, text: `Garden restored${from}.` })
    } catch (err) {
      setNotice({ ok: false, text: err instanceof Error ? err.message : 'Couldn’t read that file.' })
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-[rgba(74,63,69,.18)]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label="To-do list"
            className="fixed top-4 right-4 bottom-4 z-[91] flex w-[min(460px,calc(100vw-32px))] flex-col"
            initial={{ x: 40, rotate: 3, opacity: 0 }}
            animate={{ x: 0, rotate: 0, opacity: 1 }}
            exit={{ x: 40, rotate: 3, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }}
            transition={{ duration: 0.35, ease: [0.3, 1.3, 0.5, 1] }}
          >
            <div className="relative box-border flex min-h-0 flex-1 flex-col rounded-[30px] bg-[#F2C59A] px-3.5 pt-10 pb-3.5 shadow-[0_8px_0_#D9A577,0_30px_60px_rgba(90,60,70,.28)]">
              <MetalClip />
              <button
                onClick={onClose}
                aria-label="Close list"
                className="absolute top-2.5 right-3.5 z-[3] flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-[rgba(255,253,249,.9)] text-[#8A6A50] shadow-[0_3px_0_#D9A577] hover:bg-white"
              >
                <X size={18} strokeWidth={2.8} />
              </button>
              <section
                className="box-border flex min-h-0 flex-1 flex-col gap-5 overflow-auto rounded-[20px] bg-paper px-[22px] pt-[30px] pb-[22px] shadow-[0_3px_0_rgba(160,110,70,.25)]"
                style={{ backgroundImage: 'repeating-linear-gradient(180deg, transparent 0, transparent 35px, #F5EAE0 35px, #F5EAE0 36px)' }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <h2 className="m-0 font-fredoka text-[26px] font-semibold">Little to-dos</h2>
                    <span className="text-sm font-semibold text-muted-2">
                      {now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <span className="flex h-8 items-center gap-[5px] rounded-full bg-pink-tint px-3.5 font-fredoka text-sm font-semibold text-pink-ink">
                    {g.open} to tend
                  </span>
                </div>

                <div className="flex gap-2.5">
                  <input
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') add() }}
                    placeholder="Add a tiny task…"
                    aria-label="New task"
                    autoFocus
                    className="box-border h-[54px] min-w-0 flex-1 rounded-full border-2 border-line bg-[#FFF9F3] px-[22px] font-nunito text-base font-semibold text-ink outline-none transition-[border-color,box-shadow] duration-200 focus:border-pink focus:shadow-[0_0_0_4px_#FFE3EA]"
                  />
                  <button
                    onClick={add}
                    aria-label="Add task"
                    className="flex h-[54px] w-[54px] shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-pink text-white shadow-[0_4px_0_#E67E99] transition-transform duration-150 hover:-translate-y-0.5 hover:rotate-90 active:translate-y-0.5 active:shadow-[0_2px_0_#E67E99]"
                  >
                    <Plus size={24} strokeWidth={3} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <StatTile bg="#FFF2C4" ink="#8A6400" strong="#5E4500" title="Total tasks" value={g.total} sub={`${g.open} open · ${g.dropped} dropped`} />
                  <StatTile bg="#FFE0E8" ink="#A63D5E" strong="#7E2A45" title="Completion" value={pct(g.rate) + '%'} sub={`${g.done} / ${g.total} done`} pct={pct(g.rate)} bar="#F07A9A" />
                  <StatTile bg="#D5F3E4" ink="#2F7A55" strong="#1F5C3E" title="Effective" value={pct(g.eff) + '%'} sub={`${g.done} / ${g.effective} relevant`} pct={pct(g.eff)} bar="#4FB884" />
                </div>

                {g.total > 0 && <ViewSwitch view={view} onChange={changeView} openCount={g.open} />}

                <div className="flex flex-col gap-2.5">
                  {g.total > 0 && shown.length === 0 && (
                    <div className="flex flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-[#BDE8D1] px-5 py-[30px] text-center text-muted-2">
                      <span className="flex text-mint-strong"><PartyPopper size={28} strokeWidth={2.4} /></span>
                      <span className="font-fredoka text-[17px] font-semibold text-[#6B5A60]">All caught up!</span>
                      <span className="text-sm font-semibold">Nothing left to do. Add a task or switch to All to see finished ones.</span>
                    </div>
                  )}
                  {g.total === 0 && (
                    <div className="flex flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-[#EAD9CC] px-5 py-[34px] text-center text-muted-2">
                      <span className="flex text-mint"><Sprout size={28} strokeWidth={2.4} /></span>
                      <span className="font-fredoka text-[17px] font-semibold text-[#6B5A60]">Your garden is waiting</span>
                      <span className="text-sm font-semibold">Add a tiny task above to plant the first seed.</span>
                    </div>
                  )}
                  <AnimatePresence initial={false}>
                    {shown.map(t => <TaskRow key={t.id} t={t} g={g} onDelete={() => deleteTask(t.id)} />)}
                  </AnimatePresence>
                </div>

                <div className="flex flex-col gap-2.5 border-t-2 border-dashed border-line pt-3.5">
                  <span className="text-[13px] font-semibold text-muted-2">Dropped tasks don't count against your effective rate.</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-extrabold tracking-[.8px] text-muted-3 uppercase">Backup</span>
                    <button onClick={exportBackup} className={footerBtn} title="Save your garden to a backup file" aria-label="Export backup">
                      <Download size={14} strokeWidth={2.6} />Export
                    </button>
                    <button onClick={() => fileInput.current?.click()} className={footerBtn} title="Restore your garden from a backup file" aria-label="Import backup">
                      <Upload size={14} strokeWidth={2.6} />Import
                    </button>
                    <input ref={fileInput} type="file" accept=".json,application/json" onChange={importBackup} className="hidden" aria-hidden="true" tabIndex={-1} />
                    <button onClick={reset} className={`${footerBtn} ml-auto`}>
                      Reset garden
                    </button>
                  </div>
                  <AutoBackupRow ab={ab} now={now} />
                  {notice && (
                    <span role="status" className={`text-[13px] font-bold ${notice.ok ? 'text-mint-ink' : 'text-pink-ink'}`}>
                      {notice.text}
                    </span>
                  )}
                </div>
              </section>
              <AnimatePresence>
                {deleted && (
                  <motion.div
                    key={deleted.task.id}
                    role="status"
                    initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                    className="absolute right-7 bottom-7 left-7 z-[4] flex items-center gap-3 rounded-full bg-ink py-2 pr-2 pl-4 text-sm font-bold text-white shadow-[0_6px_18px_rgba(74,63,69,.3)]"
                  >
                    <Trash2 size={15} strokeWidth={2.6} className="shrink-0 opacity-70" />
                    <span className="min-w-0 flex-1 truncate">Deleted “{deleted.task.text}”</span>
                    <button
                      onClick={undoDelete}
                      className="h-8 shrink-0 cursor-pointer rounded-full border-0 bg-pink px-3.5 font-fredoka text-[13px] font-semibold text-white hover:bg-[#FF8AA6]"
                    >
                      Undo
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/** Floating pink clipboard (bottom-right) with open-task badge. */
export function ClipboardFab({ open, onClick }: { open: number; onClick: () => void }) {
  const d = (cls: string) => <div className={`absolute ${cls}`} />
  return (
    <div className="fixed right-6 bottom-6 z-[80]" style={{ animation: 'bob 3s ease-in-out infinite' }}>
      <button
        onClick={onClick}
        aria-label={`Open to-do list${open ? ` (${open} open)` : ''}`}
        className="relative block h-[92px] w-[84px] cursor-pointer border-0 bg-transparent p-0 transition-transform duration-200 hover:scale-[1.06] hover:-rotate-6"
      >
        {d('left-2.5 top-3 h-[76px] w-16 rounded-[18px] bg-pink shadow-[0_5px_0_#E67E99,0_14px_26px_rgba(200,90,120,.3)]')}
        {d('left-[18px] top-[22px] h-[58px] w-12 rounded-[10px] bg-paper')}
        {d('left-7 top-1.5 h-4 w-7 rounded-[7px] bg-[#D8DCE6] shadow-[0_2px_0_#B4BACA]')}
        {d('left-[25px] top-[34px] h-2 w-2 rounded-[3px] bg-mint')}
        {d('left-[37px] top-9 h-1 w-[22px] rounded-sm bg-line')}
        {d('left-[25px] top-[47px] box-border h-2 w-2 rounded-[3px] border-2 border-line')}
        {d('left-[37px] top-[49px] h-1 w-[22px] rounded-sm bg-line')}
        {d('left-[31px] top-[62px] h-1.5 w-[5px] rounded-full bg-ink')}
        {d('left-12 top-[62px] h-1.5 w-[5px] rounded-full bg-ink')}
        {d('left-[23px] top-[67px] h-[5px] w-2 rounded-full bg-[#FF9DB2]')}
        {d('left-[53px] top-[67px] h-[5px] w-2 rounded-full bg-[#FF9DB2]')}
        {d('left-[38px] top-[67px] box-content h-1 w-2 rounded-[0_0_6px_6px] border-2 border-t-0 border-ink')}
        {open > 0 && (
          <div className="absolute top-0 right-0 box-border flex h-7 min-w-7 items-center justify-center rounded-full border-[3px] border-cream bg-butter px-[7px] font-fredoka text-sm font-bold text-[#7A5600]">
            {open}
          </div>
        )}
      </button>
    </div>
  )
}
