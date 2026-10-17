import { BLOSSOM_SPOTS } from '../../lib/garden'
import { Shape } from '../Shape'

const pop = (d: string) => ({ inset: 0, transformOrigin: '50% 100%', animation: `popIn ${d} ease-out` })
const leafL = { borderRadius: '0 100% 0 100%' }
const leafR = { borderRadius: '100% 0 100% 0' }

/** Canopy face for the little tree / blossom tree (stage index 3+). */
function CanopyFace({ eyeB, eyeW, eyeH, eyeL, eyeR, cheekB, cheekW, cheekL, cheekR, mouthW, mouthL }: {
  eyeB: number; eyeW: number; eyeH: number; eyeL: number; eyeR: number
  cheekB: number; cheekW: number; cheekL: number; cheekR: number; mouthW: number; mouthL: number
}) {
  return (
    <>
      <Shape s={{ bottom: eyeB, left: '50%', marginLeft: eyeL, width: eyeW, height: eyeH, borderRadius: '50%', background: '#3E5A48' }} />
      <Shape s={{ bottom: eyeB, left: '50%', marginLeft: eyeR, width: eyeW, height: eyeH, borderRadius: '50%', background: '#3E5A48' }} />
      <Shape s={{ bottom: cheekB, left: '50%', marginLeft: cheekL, width: cheekW, height: 8, borderRadius: '50%', background: '#FF9DB2', opacity: 0.75 }} />
      <Shape s={{ bottom: cheekB, left: '50%', marginLeft: cheekR, width: cheekW, height: 8, borderRadius: '50%', background: '#FF9DB2', opacity: 0.75 }} />
      <Shape s={{ bottom: cheekB, left: '50%', marginLeft: mouthL, width: mouthW, height: 7, border: '3px solid #3E5A48', borderTop: 0, borderRadius: '0 0 10px 10px' }} />
    </>
  )
}

function Blossom({ ml, bottom, rot, c }: (typeof BLOSSOM_SPOTS)[number]) {
  const petal = (left: number, top: number) => (
    <Shape s={{ left, top, width: 10, height: 10, borderRadius: '50%', background: c, boxShadow: '0 0 0 1.5px #fff' }} />
  )
  return (
    <Shape s={{ left: '50%', marginLeft: ml, bottom, width: 22, height: 22, animation: 'popIn .6s ease-out' }}>
      <div className="relative" style={{ width: 22, height: 22, transform: `rotate(${rot}deg)` }}>
        {petal(6, 0)}{petal(6, 12)}{petal(0, 6)}{petal(12, 6)}
        <Shape s={{ left: 7.5, top: 7.5, width: 7, height: 7, borderRadius: '50%', background: '#FFE07A' }} />
      </div>
    </Shape>
  )
}

/** The kawaii tree: seed → sprout → sapling → little tree → blossom tree. */
export function Tree({ stage, blossoms }: { stage: number; blossoms: number }) {
  return (
    <Shape s={{ left: '50%', bottom: 70, width: 260, height: 250, marginLeft: -130, zIndex: 2 }}>
      <div className="relative h-full w-full" style={{ transformOrigin: '50% 100%', animation: 'sway 5s ease-in-out infinite' }}>
        {stage === 0 && (
          <Shape s={{ inset: 0, animation: 'popIn .6s ease-out' }}>
            <Shape s={{ bottom: -2, left: '50%', marginLeft: -11, width: 22, height: 16, borderRadius: '50%', background: '#B6845F' }} />
            <Shape s={{ bottom: 8, left: '50%', marginLeft: -1, width: 3, height: 8, borderRadius: 2, background: '#7FCF9E' }} />
            <Shape
              className="font-fredoka"
              s={{ bottom: 30, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', padding: '6px 12px', borderRadius: 999, background: 'rgba(255,255,255,.92)', fontWeight: 500, fontSize: 13, color: '#6B5A60', boxShadow: '0 3px 0 rgba(0,0,0,.06)' }}
            >
              three chores a day help me sprout
            </Shape>
          </Shape>
        )}
        {stage === 1 && (
          <Shape s={pop('.7s')}>
            <Shape s={{ bottom: 0, left: '50%', marginLeft: -3, width: 6, height: 50, borderRadius: 4, background: '#6CC08F' }} />
            <Shape s={{ bottom: 42, left: '50%', marginLeft: -38, width: 38, height: 21, ...leafL, background: '#94DDB0' }} />
            <Shape s={{ bottom: 42, left: '50%', width: 38, height: 21, ...leafR, background: '#7FD3A0' }} />
          </Shape>
        )}
        {stage === 2 && (
          <Shape s={pop('.7s')}>
            <Shape s={{ bottom: 0, left: '50%', marginLeft: -4, width: 8, height: 116, borderRadius: 5, background: '#6CC08F' }} />
            <Shape s={{ bottom: 40, left: '50%', marginLeft: -46, width: 46, height: 24, ...leafL, background: '#94DDB0' }} />
            <Shape s={{ bottom: 56, left: '50%', width: 44, height: 23, ...leafR, background: '#7FD3A0' }} />
            <Shape s={{ bottom: 80, left: '50%', marginLeft: -38, width: 38, height: 21, ...leafL, background: '#7FD3A0' }} />
            <Shape s={{ bottom: 94, left: '50%', width: 36, height: 20, ...leafR, background: '#94DDB0' }} />
            <Shape s={{ bottom: 108, left: '50%', marginLeft: -12, width: 24, height: 24, borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', background: '#A8E8C0' }} />
          </Shape>
        )}
        {stage === 3 && (
          <Shape s={pop('.8s')}>
            <Shape s={{ bottom: 0, left: '50%', marginLeft: -10, width: 20, height: 100, borderRadius: '10px 10px 4px 4px', background: '#C79A78' }} />
            <Shape s={{ bottom: 76, left: '50%', marginLeft: -104, width: 94, height: 94, borderRadius: '50%', background: '#8AD6A8' }} />
            <Shape s={{ bottom: 76, left: '50%', marginLeft: 10, width: 94, height: 94, borderRadius: '50%', background: '#8AD6A8' }} />
            <Shape s={{ bottom: 92, left: '50%', marginLeft: -62, width: 124, height: 124, borderRadius: '50%', background: '#9BE0B5' }} />
            <Shape s={{ bottom: 180, left: '50%', marginLeft: -36, width: 28, height: 14, borderRadius: '50%', background: 'rgba(255,255,255,.55)', transform: 'rotate(-20deg)' }} />
            <CanopyFace eyeB={146} eyeW={8} eyeH={10} eyeL={-20} eyeR={12} cheekB={136} cheekW={14} cheekL={-34} cheekR={20} mouthW={12} mouthL={-6} />
          </Shape>
        )}
        {stage === 4 && (
          <Shape s={pop('.8s')}>
            <Shape s={{ bottom: 0, left: '50%', marginLeft: -12, width: 24, height: 112, borderRadius: '12px 12px 5px 5px', background: '#C79A78' }} />
            <Shape s={{ bottom: 84, left: '50%', marginLeft: -128, width: 112, height: 112, borderRadius: '50%', background: '#8AD6A8' }} />
            <Shape s={{ bottom: 84, left: '50%', marginLeft: 16, width: 112, height: 112, borderRadius: '50%', background: '#8AD6A8' }} />
            <Shape s={{ bottom: 98, left: '50%', marginLeft: -76, width: 152, height: 152, borderRadius: '50%', background: '#9BE0B5' }} />
            <Shape s={{ bottom: 212, left: '50%', marginLeft: -44, width: 32, height: 16, borderRadius: '50%', background: 'rgba(255,255,255,.55)', transform: 'rotate(-20deg)' }} />
            <CanopyFace eyeB={172} eyeW={9} eyeH={11} eyeL={-22} eyeR={13} cheekB={162} cheekW={15} cheekL={-38} cheekR={23} mouthW={13} mouthL={-7} />
            {BLOSSOM_SPOTS.slice(0, blossoms).map((b, i) => <Blossom key={i} {...b} />)}
          </Shape>
        )}
      </div>
    </Shape>
  )
}

/** Soil mound the tree grows from. Carries the face until the canopy takes over. */
export function Mound({ showFace, asleep }: { showFace: boolean; asleep: boolean }) {
  const eye = { width: 7, height: 9, borderRadius: '50%', background: '#4A3F45', top: 22 }
  const closed = { top: 24, width: 11, height: 5, border: '2.5px solid #4A3F45', borderTop: 0, borderRadius: '0 0 8px 8px' }
  return (
    <Shape s={{ left: '50%', bottom: 46, width: 180, height: 46, marginLeft: -90, zIndex: 3 }}>
      <Shape s={{ inset: 0, borderRadius: '50% 50% 46% 46%', background: '#A97C62', boxShadow: 'inset 0 -8px 0 rgba(0,0,0,.08), inset 0 6px 0 rgba(255,255,255,.12)' }} />
      <Shape s={{ top: 4, left: -6, width: 26, height: 14, borderRadius: '0 100% 0 100%', background: '#7FD3A0', transform: 'rotate(-20deg)' }} />
      <Shape s={{ top: 2, right: -6, width: 26, height: 14, borderRadius: '100% 0 100% 0', background: '#7FD3A0', transform: 'rotate(20deg)' }} />
      {showFace && (
        <>
          {asleep ? (
            <>
              <Shape s={{ ...closed, left: 66 }} />
              <Shape s={{ ...closed, right: 66 }} />
            </>
          ) : (
            <>
              <Shape s={{ ...eye, left: 70 }} />
              <Shape s={{ ...eye, right: 70 }} />
            </>
          )}
          <Shape s={{ top: 32, left: 56, width: 14, height: 7, borderRadius: '50%', background: '#FF8FA8', opacity: 0.75 }} />
          <Shape s={{ top: 32, right: 56, width: 14, height: 7, borderRadius: '50%', background: '#FF8FA8', opacity: 0.75 }} />
        </>
      )}
    </Shape>
  )
}
