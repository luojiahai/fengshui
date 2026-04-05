// composables/useWizard.ts
import type { Direction, WizardState, WizardStep, RoomResult } from '~/types/fengshui'
import { WIZARD_STEPS } from '~/types/fengshui'

export const STEPS = WIZARD_STEPS

// --- Pure functions (exported for testing) ---

export function canAdvance(step: WizardStep, state: WizardState): boolean {
  if (step === 'report') return false
  if (step === 'direction') return state.facingDirection !== null
  // Content steps (external, entrance, etc.) are intentionally optional — user may skip any room
  return true
}

export function nextStep(current: WizardStep): WizardStep {
  const idx = STEPS.indexOf(current)
  return idx < STEPS.length - 1 ? STEPS[idx + 1] : 'report'
}

export function prevStep(current: WizardStep): WizardStep {
  const idx = STEPS.indexOf(current)
  return idx > 0 ? STEPS[idx - 1] : 'direction'
}

// --- Nuxt composable ---

function newRoom(type: 'bedroom' | 'bathroom', n: number): RoomResult {
  const label = type === 'bedroom'
    ? (n === 1 ? 'wizard.masterBedroom' : 'wizard.bedroomN')
    : 'wizard.bathroomN'
  return { roomId: `${type}-${n}`, label, answers: {} }
}

function defaultState(): WizardState {
  return {
    facingDirection: null,
    answers: {},
    rooms: {
      bedroom: [newRoom('bedroom', 1)],
      bathroom: [newRoom('bathroom', 1)],
    },
  }
}

export function useWizard() {
  const state = useState<WizardState>('wizard-state', defaultState)
  const currentStep = useState<WizardStep>('wizard-step', () => 'direction')

  const currentStepIndex = computed(() => STEPS.indexOf(currentStep.value))
  const totalSteps = STEPS.length

  const isCanAdvance = computed(() => canAdvance(currentStep.value, state.value))

  function goNext() {
    if (!isCanAdvance.value) return
    currentStep.value = nextStep(currentStep.value)
  }

  function goBack() {
    currentStep.value = prevStep(currentStep.value)
  }

  function setDirection(dir: Direction) {
    state.value.facingDirection = dir
  }

  function setAnswer(checkId: string, optionIds: string[]) {
    state.value.answers = { ...state.value.answers, [checkId]: optionIds }
  }

  function setRoomAnswer(type: 'bedroom' | 'bathroom', roomId: string, checkId: string, optionIds: string[]) {
    state.value.rooms[type] = state.value.rooms[type].map(r =>
      r.roomId === roomId
        ? { ...r, answers: { ...r.answers, [checkId]: optionIds } }
        : r
    )
  }

  function addRoom(type: 'bedroom' | 'bathroom') {
    const rooms = state.value.rooms[type]
    const maxN = rooms.reduce((m, r) => {
      const n = parseInt(r.roomId.split('-')[1] ?? '0', 10)
      return Math.max(m, isNaN(n) ? 0 : n)
    }, 0)
    state.value.rooms[type] = [...rooms, newRoom(type, maxN + 1)]
  }

  function removeRoom(type: 'bedroom' | 'bathroom', roomId: string) {
    if (state.value.rooms[type].length <= 1) return
    state.value.rooms[type] = state.value.rooms[type].filter(r => r.roomId !== roomId)
  }

  function reset() {
    state.value = defaultState()
    currentStep.value = 'direction'
  }

  return {
    state,
    currentStep,
    currentStepIndex,
    totalSteps,
    canAdvance: isCanAdvance,
    goNext,
    goBack,
    setDirection,
    setAnswer,
    setRoomAnswer,
    addRoom,
    removeRoom,
    reset,
  }
}
