// tests/report.test.ts
import { describe, it, expect } from 'vitest'
import { encodeState, decodeState } from '../composables/useReport'
import type { WizardState } from '../types/fengshui'

const sampleState: WizardState = {
  facingDirection: 'S',
  answers: {
    'ext-sha': ['road-rush', 'sharp-corner'],
    'ent-light': ['good'],
  },
  rooms: {
    bedroom: [
      { roomId: 'bedroom-1', label: 'wizard.masterBedroom', answers: { 'bed-direction': ['north-south'] } },
    ],
    bathroom: [
      { roomId: 'bathroom-1', label: 'wizard.bathroomN', answers: {} },
    ],
  },
}

describe('encodeState / decodeState', () => {
  it('round-trips a complete state', () => {
    const encoded = encodeState(sampleState)
    expect(typeof encoded).toBe('string')
    expect(encoded.length).toBeGreaterThan(0)
    const decoded = decodeState(encoded)
    expect(decoded).toEqual(sampleState)
  })

  it('returns null for invalid base64', () => {
    expect(decodeState('not-valid-base64!!!')).toBeNull()
  })

  it('returns null for valid base64 but invalid JSON', () => {
    const bad = btoa('this is not json')
    expect(decodeState(bad)).toBeNull()
  })

  it('returns null for valid JSON but wrong shape', () => {
    const bad = btoa(JSON.stringify({ wrong: 'shape' }))
    expect(decodeState(bad)).toBeNull()
  })

  it('round-trips a state with Unicode characters (Chinese room labels)', () => {
    const unicodeState: WizardState = {
      ...sampleState,
      rooms: {
        bedroom: [
          { roomId: 'bedroom-1', label: '主卧室', answers: {} },
        ],
        bathroom: [
          { roomId: 'bathroom-1', label: '卫生间', answers: {} },
        ],
      },
    }
    const decoded = decodeState(encodeState(unicodeState))
    expect(decoded).toEqual(unicodeState)
  })

  it('survives a URL query-string round-trip (encodeURIComponent + decodeURIComponent)', () => {
    const encoded = encodeState(sampleState)
    // Simulate what happens when shareReport puts the value in a URL
    // and the router/browser decodes it back before passing to decodeState
    const urlParam = encodeURIComponent(encoded)
    const decodedParam = decodeURIComponent(urlParam)
    expect(decodeState(decodedParam)).toEqual(sampleState)
  })

  it('returns null for valid JSON null', () => {
    // typeof null === 'object' — our guard must handle this
    const bad = btoa(JSON.stringify(null))
    expect(decodeState(bad)).toBeNull()
  })
})
