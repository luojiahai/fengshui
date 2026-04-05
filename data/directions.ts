// data/directions.ts
import type { DirectionModifier } from '~/types/fengshui'

export const directionModifiers: DirectionModifier[] = [
  // Intercardinal directions (NE, SE, SW, NW) have no modifier (scoreMultiplier = 1.0 by default).
  // South-facing: open space / water in front (celestial guardians) more auspicious
  { checkId: 'ext-celestial', direction: 'S', scoreMultiplier: 1.3 },
  // North-facing: mountain support behind more auspicious
  { checkId: 'ext-celestial', direction: 'N', scoreMultiplier: 1.2 },
  // South/East facing: road rush sha compounds (main qi ingress direction)
  { checkId: 'ext-sha', direction: 'S', scoreMultiplier: 1.3 },
  { checkId: 'ext-sha', direction: 'E', scoreMultiplier: 1.2 },
  // East/West facing houses: N-S bed alignment is especially beneficial
  { checkId: 'bed-direction', direction: 'E', scoreMultiplier: 1.3 },
  { checkId: 'bed-direction', direction: 'W', scoreMultiplier: 1.3 },
]
