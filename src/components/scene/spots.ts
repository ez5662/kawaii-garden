import { SCENE_PLOTS, type FlowerSpot } from '../../lib/garden'

// Flower-bed geometry: 226px planter at right 3%, five 38px slots spread across 198px.
export const BED_W = 226, BED_BOTTOM = 52
const bedSlotCenter = (k: number) => 14 + 19 + k * 40

/** Where a flower's head is in the scene — anchors its little card and the harvest effect. */
export function spotAnchor(spot: FlowerSpot): { left: string; bottom: number } {
  if (typeof spot === 'number') {
    const p = SCENE_PLOTS.find(x => x.lv === spot)!
    return { left: p.left, bottom: p.bottom + 112 }
  }
  return { left: `calc(97% - ${BED_W - bedSlotCenter(spot.bedSlot)}px)`, bottom: BED_BOTTOM + 30 + 92 }
}

