// tests/wizard.test.ts
import { describe, it, expect } from 'vitest'
import { canAdvance, nextStep, prevStep, STEPS } from '../composables/useWizard'
import type { WizardState, WizardStep } from '../types/fengshui'

const emptyState: WizardState = {
  facingDirection: null,
  answers: {},
  rooms: { bedroom: [], bathroom: [] },
}

describe('STEPS', () => {
  it('has 8 steps', () => {
    expect(STEPS).toHaveLength(8)
    expect(STEPS[0]).toBe('direction')
    expect(STEPS[7]).toBe('report')
  })
})

describe('canAdvance', () => {
  it('returns false for direction step when no direction is selected', () => {
    expect(canAdvance('direction', emptyState)).toBe(false)
  })

  it('returns true for direction step when direction is selected', () => {
    expect(canAdvance('direction', { ...emptyState, facingDirection: 'S' })).toBe(true)
  })

  it('returns true for all non-direction steps regardless of answers', () => {
    const steps: WizardStep[] = ['external', 'entrance', 'livingRoom', 'kitchen', 'bedroom', 'bathroom']
    for (const step of steps) {
      expect(canAdvance(step, emptyState)).toBe(true)
    }
  })

  it('returns false for report step (cannot advance past last step)', () => {
    expect(canAdvance('report', emptyState)).toBe(false)
  })
})

describe('nextStep', () => {
  it('returns the next step', () => {
    expect(nextStep('direction')).toBe('external')
    expect(nextStep('bathroom')).toBe('report')
  })

  it('returns report when already at report', () => {
    expect(nextStep('report')).toBe('report')
  })
})

describe('prevStep', () => {
  it('returns the previous step', () => {
    expect(prevStep('external')).toBe('direction')
    expect(prevStep('report')).toBe('bathroom')
  })

  it('returns direction when already at direction', () => {
    expect(prevStep('direction')).toBe('direction')
  })
})
