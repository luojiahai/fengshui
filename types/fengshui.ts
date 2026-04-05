// types/fengshui.ts

export type Direction = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'

export type StepKey = 'external' | 'entrance' | 'livingRoom' | 'kitchen' | 'bedroom' | 'bathroom'
export type WizardStep = 'direction' | StepKey | 'report'

export const WIZARD_STEPS: WizardStep[] = [
  'direction', 'external', 'entrance', 'livingRoom', 'kitchen', 'bedroom', 'bathroom', 'report'
]

// --- Check types ---

// NOTE: Structurally identical to TranslatedCheckOption. TypeScript cannot
// enforce the i18n-key vs. translated-string distinction at compile time.
// Use translateChecks() to convert Check → TranslatedCheck.
export type CheckOption = {
  id: string
  label: string       // i18n key
  score: number       // positive = good feng shui, negative = bad
  remedy?: string     // i18n key — shown in report when score < 0 and this option is selected
}

export type Check = {
  id: string
  question: string    // i18n key
  info?: string       // i18n key — shown in tooltip
  multiSelect: boolean
  options: CheckOption[]
}

// Translated versions (i18n keys replaced with actual strings)
// NOTE: Structurally identical to CheckOption. Produced by translateChecks()
// which resolves all i18n keys to actual strings.
export type TranslatedCheckOption = {
  id: string
  label: string
  score: number
  remedy?: string
}

export type TranslatedCheck = {
  id: string
  question: string
  info?: string        // optional — matches Check.info; translateChecks() passes undefined when absent
  multiSelect: boolean
  options: TranslatedCheckOption[]
}

export type DirectionModifier = {
  checkId: string
  direction: Direction
  scoreMultiplier: number  // multiplies the check's raw score contribution
}

// --- Wizard state (JSON-serializable for useState + URL encoding) ---

export type RoomResult = {
  roomId: string    // e.g. 'bedroom-1', 'bedroom-2'
  label: string     // i18n key (e.g. 'wizard.masterBedroom'). Stored as i18n key in WizardState (persisted to URL) to allow cross-locale sharing in shared reports
  answers: Record<string, string[]>  // checkId → selected option IDs
}

export type WizardState = {
  facingDirection: Direction | null
  answers: Record<string, string[]>  // checkId → selected option IDs (non-room steps)
  rooms: {
    bedroom: RoomResult[]
    bathroom: RoomResult[]
  }
}

// --- Scoring ---

export type SectionScore = {
  stepKey: StepKey
  label: string    // translated string (computed at render time by scoring composable). e.g. 'External Environment'
  score: number    // 0-100
  weight: number   // 0-1 (proportion of overall score)
}

export type Issue = {
  stepKey: StepKey
  roomLabel?: string   // translated string (set for bedroom/bathroom room-specific issues, computed at render time)
  checkQuestion: string  // translated string (computed at render time by scoring composable)
  optionLabel: string  // translated string (computed at render time by scoring composable)
  remedy: string  // translated string (computed at render time by scoring composable)
}

export type Rating = {
  label: string   // translated string (computed at render time by scoring composable)
  color: 'emerald' | 'yellow' | 'orange' | 'red'
}

export type Report = {
  overallScore: number    // 0-100
  rating: Rating
  sectionScores: SectionScore[]
  issues: Issue[]
}
