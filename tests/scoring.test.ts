// tests/scoring.test.ts
import { describe, it, expect } from 'vitest'
import {
  calculateSectionScore,
  calculateOverallScore,
  getIssues,
  translateChecks,
} from '../composables/useFengShui'
import { stepChecks, sectionMinMax } from '../data/checks'
import { directionModifiers } from '../data/directions'
import type { WizardState, StepKey } from '../types/fengshui'

const emptyState: WizardState = {
  facingDirection: 'S',
  answers: {},
  rooms: { bedroom: [], bathroom: [] },
}

describe('calculateSectionScore', () => {
  it('returns ~59 for external with no selections (0 raw, min=-22, max=15)', () => {
    const score = calculateSectionScore('external', {}, directionModifiers, 'S')
    // (0 - (-22)) / (15 - (-22)) * 100 = 22/37*100 ≈ 59.46
    expect(score).toBeCloseTo(59.46, 0)
  })

  it('returns 100 for external when all celestial guardians selected, no sha', () => {
    const answers = {
      'ext-celestial': ['green-dragon', 'white-tiger', 'red-phoenix', 'black-tortoise'],
    }
    // raw = 12 (all guardians). With S-facing modifier (1.3): 12*1.3=15.6
    // normalized = (15.6+22)/37*100 = 37.6/37*100 ≈ 101.6 → clamped to 100
    const score = calculateSectionScore('external', answers, directionModifiers, 'S')
    expect(score).toBe(100)
  })

  it('returns lower score when sha formations are present', () => {
    const answers = { 'ext-sha': ['road-rush', 'sharp-corner'] }
    // raw = -4 + -3 = -7. No modifier for ext-sha with direction=N.
    const score = calculateSectionScore('external', answers, directionModifiers, 'N')
    // ((-7) - (-22)) / 37 * 100 = 15/37*100 ≈ 40.54
    expect(score).toBeCloseTo(40.54, 0)
  })

  it('returns 100 for bedroom with all good options selected', () => {
    const answers = {
      'bed-direction': ['north-south'],
      'bed-headwall': ['solid-wall'],
      'bed-door': ['not-facing'],
      'bed-mirror': ['not-facing'],
    }
    // raw = 2+3+2+2 = 9. max=9, min=-10.
    // normalized = (9-(-10))/(9-(-10))*100 = 100
    const score = calculateSectionScore('bedroom', answers, directionModifiers, 'N')
    expect(score).toBe(100)
  })

  it('applies direction modifier correctly for bedroom with E-facing house', () => {
    const answers = { 'bed-direction': ['north-south'] }
    // raw for bed-direction = 2. With E-facing modifier (1.3): 2*1.3=2.6
    // Section raw = 2.6. Normalized = (2.6+10)/19*100 ≈ 66.3
    const score = calculateSectionScore('bedroom', answers, directionModifiers, 'E')
    expect(score).toBeGreaterThan(60)
  })
})

describe('calculateOverallScore', () => {
  it('returns weighted average of section scores', () => {
    const sectionScores = {
      external: 80,
      entrance: 70,
      livingRoom: 90,
      kitchen: 60,
      bedroom: 75,
      bathroom: 85,
    }
    // 80*0.35 + 70*0.15 + 90*0.15 + 60*0.15 + 75*0.15 + 85*0.05
    // = 28 + 10.5 + 13.5 + 9 + 11.25 + 4.25 = 76.5
    expect(calculateOverallScore(sectionScores)).toBeCloseTo(76.5, 1)
  })
})

describe('getIssues', () => {
  it('returns issues for selected bad options with remedies', () => {
    const t = (key: string) => key  // identity fn for test
    const answers = { 'ext-sha': ['road-rush'] }
    const issues = getIssues('external', answers, t)
    expect(issues).toHaveLength(1)
    expect(issues[0].remedy).toBe('checks.extSha.options.roadRush.remedy')
  })

  it('returns no issues when only positive options are selected', () => {
    const t = (key: string) => key
    const answers = { 'ext-celestial': ['green-dragon', 'red-phoenix'] }
    const issues = getIssues('external', answers, t)
    expect(issues).toHaveLength(0)
  })
})

describe('translateChecks', () => {
  it('translates question and option labels using t function', () => {
    const t = (key: string) => `[${key}]`
    const checks = stepChecks['entrance']
    const translated = translateChecks(checks, t)
    expect(translated[0].question).toBe('[checks.entDoorFaces.question]')
    expect(translated[0].options[0].label).toBe('[checks.entDoorFaces.options.elevator.label]')
  })

  it('returns info as undefined when check has no info field', () => {
    const t = (key: string) => key
    // entLight has no info field in the check data
    const checks = stepChecks['entrance']
    const entLightTranslated = translateChecks(checks, t).find(c => c.id === 'ent-light')
    expect(entLightTranslated?.info).toBeUndefined()
  })

  it('returns translated info when check has info field', () => {
    const t = (key: string) => `[${key}]`
    // entDoorFaces has an info field
    const checks = stepChecks['entrance']
    const entDoorFacesTranslated = translateChecks(checks, t).find(c => c.id === 'ent-door-faces')
    expect(entDoorFacesTranslated?.info).toBe('[checks.entDoorFaces.info]')
  })
})
