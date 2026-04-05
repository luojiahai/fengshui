// composables/useFengShui.ts
import { stepChecks, sectionMinMax } from '~/data/checks'
import { directionModifiers as defaultModifiers } from '~/data/directions'
import type {
  Check, TranslatedCheck, TranslatedCheckOption,
  Direction, DirectionModifier, StepKey, WizardState,
  Issue, Report, Rating, SectionScore,
} from '~/types/fengshui'

// Section weights (must sum to 1)
const SECTION_WEIGHTS: Record<StepKey, number> = {
  external:   0.35,
  entrance:   0.15,
  livingRoom: 0.15,
  kitchen:    0.15,
  bedroom:    0.15,
  bathroom:   0.05,
}

const ROOM_KEYS = new Set<StepKey>(['bedroom', 'bathroom'])
const NON_ROOM_KEYS = (Object.keys(SECTION_WEIGHTS) as StepKey[]).filter(k => !ROOM_KEYS.has(k))

// --- Pure functions (exported for testing) ---

export function calculateSectionScore(
  stepKey: StepKey,
  answers: Record<string, string[]>,
  modifiers: DirectionModifier[],
  direction: Direction,
): number {
  const checks = stepChecks[stepKey]
  const { min, max } = sectionMinMax[stepKey]

  if (max === min) return 50  // degenerate section: no scoring range, treat as neutral

  let sectionRaw = 0
  for (const check of checks) {
    const selectedIds = answers[check.id] ?? []
    if (selectedIds.length === 0) continue

    const checkRaw = selectedIds.reduce((sum, optId) => {
      const opt = check.options.find(o => o.id === optId)
      return sum + (opt?.score ?? 0)
    }, 0)

    const modifier = modifiers.find(m => m.checkId === check.id && m.direction === direction)
    sectionRaw += modifier ? checkRaw * modifier.scoreMultiplier : checkRaw
  }

  const normalized = ((sectionRaw - min) / (max - min)) * 100
  return Math.round(Math.max(0, Math.min(100, normalized)) * 100) / 100
}

export function calculateOverallScore(sectionScores: Record<StepKey, number>): number {
  const total = (Object.keys(SECTION_WEIGHTS) as StepKey[]).reduce((sum, key) => {
    return sum + sectionScores[key] * SECTION_WEIGHTS[key]
  }, 0)
  return Math.round(total * 100) / 100
}

export function getIssues(
  stepKey: StepKey,
  answers: Record<string, string[]>,
  t: (key: string) => string,
  roomLabel?: string,
): Issue[] {
  const checks = stepChecks[stepKey]
  const issues: Issue[] = []
  for (const check of checks) {
    const selectedIds = answers[check.id] ?? []
    for (const optId of selectedIds) {
      const opt = check.options.find(o => o.id === optId)
      if (opt && opt.score < 0 && opt.remedy) {
        issues.push({
          stepKey,
          roomLabel,
          checkQuestion: t(check.question),
          optionLabel: t(opt.label),
          remedy: t(opt.remedy),
        })
      }
    }
  }
  return issues
}

export function translateChecks(checks: Check[], t: (key: string) => string): TranslatedCheck[] {
  return checks.map(check => ({
    id: check.id,
    question: t(check.question),
    // info is optional on TranslatedCheck; undefined when check has no info
    info: check.info ? t(check.info) : undefined,
    multiSelect: check.multiSelect,
    options: check.options.map(opt => ({
      id: opt.id,
      label: t(opt.label),
      score: opt.score,
      remedy: opt.remedy ? t(opt.remedy) : undefined,
    })),
  }))
}

export function getRating(score: number, t: (key: string) => string): Rating {
  if (score >= 90) return { label: t('ratings.excellent'), color: 'emerald' }
  if (score >= 70) return { label: t('ratings.good'),      color: 'emerald' }
  if (score >= 50) return { label: t('ratings.fair'),      color: 'yellow'  }
  if (score >= 30) return { label: t('ratings.poor'),      color: 'orange'  }
  return               { label: t('ratings.bad'),          color: 'red'     }
}

// --- Nuxt composable ---

export function useFengShui() {
  const { t } = useI18n()
  const { state } = useWizard()

  const sectionScores = computed<Record<StepKey, number>>(() => {
    const direction = state.value.facingDirection ?? 'N'
    return Object.fromEntries(
      (Object.keys(SECTION_WEIGHTS) as StepKey[]).map(key => {
        if (ROOM_KEYS.has(key)) {
          const rooms = state.value.rooms[key as 'bedroom' | 'bathroom']
          if (rooms.length === 0) {
            return [key, calculateSectionScore(key, {}, defaultModifiers, direction)]
          }
          const avg = rooms.reduce((sum, room) =>
            sum + calculateSectionScore(key, room.answers, defaultModifiers, direction), 0
          ) / rooms.length
          return [key, Math.round(avg * 100) / 100]
        }
        return [key, calculateSectionScore(key, state.value.answers, defaultModifiers, direction)]
      })
    ) as Record<StepKey, number>
  })

  const overallScore = computed(() => calculateOverallScore(sectionScores.value))

  const rating = computed(() => getRating(overallScore.value, t))

  const allIssues = computed<Issue[]>(() => {
    const stepKeys = NON_ROOM_KEYS
    const issues: Issue[] = []
    for (const key of stepKeys) {
      issues.push(...getIssues(key, state.value.answers, t))
    }
    for (const room of state.value.rooms.bedroom) {
      issues.push(...getIssues('bedroom', room.answers, t, room.label))
    }
    for (const room of state.value.rooms.bathroom) {
      issues.push(...getIssues('bathroom', room.answers, t, room.label))
    }
    return issues
  })

  const report = computed<Report>(() => ({
    overallScore: overallScore.value,
    rating: rating.value,
    sectionScores: (Object.keys(SECTION_WEIGHTS) as StepKey[]).map(key => ({
      stepKey: key,
      label: t(`sectionLabels.${key}`),
      score: sectionScores.value[key],
      weight: SECTION_WEIGHTS[key],
    })),
    issues: allIssues.value,
  }))

  return { sectionScores, overallScore, rating, report }
}
