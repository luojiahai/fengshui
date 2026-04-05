# Feng Shui App Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the feng shui app from a single-page checkbox scorer into an 8-step room-by-room wizard with direction-aware scoring, per-room analysis, issue remedies, and shareable URL-encoded reports.

**Architecture:** A Nuxt-managed wizard drives 8 step components. All wizard state (`WizardState`) is held in Nuxt's `useState` (JSON-serializable, SSR-safe). Pure scoring functions are decoupled from the Vue layer so they can be unit-tested in isolation. The report is serialized to base64 JSON in a URL query param — no backend required.

**Tech Stack:** Nuxt 4, Vue 3, TypeScript, Tailwind CSS, Nuxt UI 4 (`@nuxt/ui`), `@nuxtjs/i18n`, vitest (for pure function tests)

---

## File Map

| File | Status | Purpose |
|------|--------|---------|
| `types/fengshui.ts` | Rewrite | All shared types |
| `data/checks.ts` | Create | All check definitions with i18n keys |
| `data/directions.ts` | Create | Direction modifier table |
| `i18n/locales/en.json` | Rewrite | English content (questions, options, remedies) |
| `i18n/locales/zh-CN.json` | Rewrite | Chinese content |
| `composables/useFengShui.ts` | Rewrite | Scoring engine (pure functions + Nuxt wrapper) |
| `composables/useWizard.ts` | Create | Wizard state + step navigation |
| `composables/useReport.ts` | Create | URL encode/decode + share |
| `components/wizard/WizardProgress.vue` | Create | Progress bar |
| `components/wizard/WizardNav.vue` | Create | Back/Next buttons |
| `components/wizard/StepDirection.vue` | Create | Compass rose picker |
| `components/wizard/WizardCheck.vue` | Create | Reusable check question + options |
| `components/wizard/StepExternal.vue` | Create | External environment step |
| `components/wizard/StepEntrance.vue` | Create | Entrance step |
| `components/wizard/StepLivingRoom.vue` | Create | Living room step |
| `components/wizard/StepKitchen.vue` | Create | Kitchen step |
| `components/wizard/StepBedroom.vue` | Create | Bedroom(s) step |
| `components/wizard/StepBathroom.vue` | Create | Bathroom(s) step |
| `components/wizard/StepReport.vue` | Create | Final report step |
| `components/report/ReportOverall.vue` | Create | Score + rating display |
| `components/report/ReportBreakdown.vue` | Create | Per-section score table |
| `components/report/ReportIssues.vue` | Create | Issues + remedies list |
| `pages/index.vue` | Rewrite | Wizard orchestrator |
| `pages/report/index.vue` | Create | Shareable report (read-only) |
| `app.vue` | Modify | Add language/color mode header bar |
| `nuxt.config.ts` | Modify | Add report route prerender |
| `vitest.config.ts` | Create | Test configuration |
| `tests/scoring.test.ts` | Create | Scoring engine tests |
| `tests/wizard.test.ts` | Create | Wizard navigation tests |
| `tests/report.test.ts` | Create | Serialization tests |
| **Delete** `data/fengShui.ts` | Delete | Replaced by checks.ts |
| **Delete** `components/FengShuiHeader.vue` | Delete | Replaced by app.vue header |
| **Delete** `components/FengShuiOptions.vue` | Delete | Replaced by step components |
| **Delete** `components/FengShuiScore.vue` | Delete | Replaced by report components |

---

## Task 1: Test Infrastructure

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/scoring.test.ts` (placeholder, verified to run)

- [ ] **Step 1: Install vitest**

```bash
cd /home/luojh/workplace/fengshui
pnpm add -D vitest
```

Expected: vitest added to devDependencies.

- [ ] **Step 2: Add test script to package.json**

In `package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
})
```

- [ ] **Step 4: Create placeholder test to confirm setup**

```typescript
// tests/scoring.test.ts
describe('placeholder', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 5: Run tests and verify**

```bash
pnpm test
```

Expected output: `1 passed`.

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts tests/scoring.test.ts package.json pnpm-lock.yaml
git commit -m "feat: add vitest test infrastructure"
```

---

## Task 2: Types Foundation

**Files:**
- Rewrite: `types/fengshui.ts`

- [ ] **Step 1: Rewrite types/fengshui.ts**

```typescript
// types/fengshui.ts

export type Direction = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'

export type StepKey = 'external' | 'entrance' | 'livingRoom' | 'kitchen' | 'bedroom' | 'bathroom'
export type WizardStep = 'direction' | StepKey | 'report'

export const WIZARD_STEPS: WizardStep[] = [
  'direction', 'external', 'entrance', 'livingRoom', 'kitchen', 'bedroom', 'bathroom', 'report'
]

// --- Check types ---

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
export type TranslatedCheckOption = {
  id: string
  label: string
  score: number
  remedy?: string
}

export type TranslatedCheck = {
  id: string
  question: string
  info: string
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
  label: string     // e.g. 'Master Bedroom'
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
  label: string    // e.g. 'External Environment'
  score: number    // 0-100
  weight: number   // 0-1 (proportion of overall score)
}

export type Issue = {
  stepKey: StepKey
  roomLabel?: string   // set for bedroom/bathroom room-specific issues
  checkQuestion: string
  optionLabel: string
  remedy: string
}

export type Report = {
  overallScore: number    // 0-100
  rating: Rating
  sectionScores: SectionScore[]
  issues: Issue[]
}

export type Rating = {
  label: string   // i18n key
  color: 'emerald' | 'yellow' | 'orange' | 'red'
}
```

- [ ] **Step 2: Commit**

```bash
git add types/fengshui.ts
git commit -m "feat: define types for wizard rewrite"
```

---

## Task 3: Check Data & Direction Modifiers

**Files:**
- Create: `data/checks.ts`
- Create: `data/directions.ts`
- Delete: `data/fengShui.ts`

**Score reference used throughout:**
- Section min/max (used for normalization):
  - external: min=-22, max=15
  - entrance: min=-14, max=4
  - livingRoom: min=-6, max=8
  - kitchen: min=-7, max=7
  - bedroom: min=-10, max=9
  - bathroom: min=-6, max=4

- [ ] **Step 1: Create data/checks.ts**

```typescript
// data/checks.ts
import type { Check, StepKey } from '~/types/fengshui'

// External: checks.extCelestial.*
const extCelestial: Check = {
  id: 'ext-celestial',
  question: 'checks.extCelestial.question',
  info: 'checks.extCelestial.info',
  multiSelect: true,
  options: [
    { id: 'green-dragon',   label: 'checks.extCelestial.options.greenDragon.label',   score: 3 },
    { id: 'white-tiger',    label: 'checks.extCelestial.options.whiteTiger.label',    score: 3 },
    { id: 'red-phoenix',    label: 'checks.extCelestial.options.redPhoenix.label',    score: 3 },
    { id: 'black-tortoise', label: 'checks.extCelestial.options.blackTortoise.label', score: 3 },
  ],
}

// External: checks.extSha.*
const extSha: Check = {
  id: 'ext-sha',
  question: 'checks.extSha.question',
  info: 'checks.extSha.info',
  multiSelect: true,
  options: [
    { id: 'road-rush',     label: 'checks.extSha.options.roadRush.label',     score: -4, remedy: 'checks.extSha.options.roadRush.remedy' },
    { id: 'sharp-corner',  label: 'checks.extSha.options.sharpCorner.label',  score: -3, remedy: 'checks.extSha.options.sharpCorner.remedy' },
    { id: 'reverse-bow',   label: 'checks.extSha.options.reverseBow.label',   score: -3, remedy: 'checks.extSha.options.reverseBow.remedy' },
    { id: 'heavens-blade', label: 'checks.extSha.options.heavensBlade.label', score: -3, remedy: 'checks.extSha.options.heavensBlade.remedy' },
    { id: 'piercing-heart',label: 'checks.extSha.options.piercingHeart.label',score: -4, remedy: 'checks.extSha.options.piercingHeart.remedy' },
    { id: 'light-sha',     label: 'checks.extSha.options.lightSha.label',     score: -2, remedy: 'checks.extSha.options.lightSha.remedy' },
  ],
}

// External: checks.extSurroundings.*
const extSurroundings: Check = {
  id: 'ext-surroundings',
  question: 'checks.extSurroundings.question',
  multiSelect: true,
  options: [
    { id: 'yin', label: 'checks.extSurroundings.options.yin.label', score: -3, remedy: 'checks.extSurroundings.options.yin.remedy' },
    { id: 'yang', label: 'checks.extSurroundings.options.yang.label', score: 3 },
  ],
}

// Entrance: checks.entDoorFaces.*
const entDoorFaces: Check = {
  id: 'ent-door-faces',
  question: 'checks.entDoorFaces.question',
  info: 'checks.entDoorFaces.info',
  multiSelect: true,
  options: [
    { id: 'elevator', label: 'checks.entDoorFaces.options.elevator.label', score: -3, remedy: 'checks.entDoorFaces.options.elevator.remedy' },
    { id: 'bathroom', label: 'checks.entDoorFaces.options.bathroom.label', score: -3, remedy: 'checks.entDoorFaces.options.bathroom.remedy' },
    { id: 'kitchen',  label: 'checks.entDoorFaces.options.kitchen.label',  score: -2, remedy: 'checks.entDoorFaces.options.kitchen.remedy' },
    { id: 'balcony',  label: 'checks.entDoorFaces.options.balcony.label',  score: -3, remedy: 'checks.entDoorFaces.options.balcony.remedy' },
  ],
}

// Entrance: checks.entLight.*
const entLight: Check = {
  id: 'ent-light',
  question: 'checks.entLight.question',
  multiSelect: false,
  options: [
    { id: 'good', label: 'checks.entLight.options.good.label', score: 2 },
    { id: 'poor', label: 'checks.entLight.options.poor.label', score: -1, remedy: 'checks.entLight.options.poor.remedy' },
  ],
}

// Entrance: checks.entClutter.*
const entClutter: Check = {
  id: 'ent-clutter',
  question: 'checks.entClutter.question',
  multiSelect: false,
  options: [
    { id: 'clean',     label: 'checks.entClutter.options.clean.label',     score: 2 },
    { id: 'cluttered', label: 'checks.entClutter.options.cluttered.label', score: -2, remedy: 'checks.entClutter.options.cluttered.remedy' },
  ],
}

// Living Room: checks.lrPosition.*
const lrPosition: Check = {
  id: 'lr-position',
  question: 'checks.lrPosition.question',
  info: 'checks.lrPosition.info',
  multiSelect: false,
  options: [
    { id: 'front', label: 'checks.lrPosition.options.front.label', score: 3 },
    { id: 'back',  label: 'checks.lrPosition.options.back.label',  score: -2, remedy: 'checks.lrPosition.options.back.remedy' },
  ],
}

// Living Room: checks.lrSofa.*
const lrSofa: Check = {
  id: 'lr-sofa',
  question: 'checks.lrSofa.question',
  info: 'checks.lrSofa.info',
  multiSelect: false,
  options: [
    { id: 'solid-wall', label: 'checks.lrSofa.options.solidWall.label', score: 3 },
    { id: 'window',     label: 'checks.lrSofa.options.window.label',    score: -2, remedy: 'checks.lrSofa.options.window.remedy' },
    { id: 'open-space', label: 'checks.lrSofa.options.openSpace.label', score: -3, remedy: 'checks.lrSofa.options.openSpace.remedy' },
  ],
}

// Living Room: checks.lrLight.*
const lrLight: Check = {
  id: 'lr-light',
  question: 'checks.lrLight.question',
  multiSelect: false,
  options: [
    { id: 'good', label: 'checks.lrLight.options.good.label', score: 2 },
    { id: 'poor', label: 'checks.lrLight.options.poor.label', score: -1, remedy: 'checks.lrLight.options.poor.remedy' },
  ],
}

// Kitchen: checks.kitStoveSink.*
const kitStoveSink: Check = {
  id: 'kit-stove-sink',
  question: 'checks.kitStoveSink.question',
  info: 'checks.kitStoveSink.info',
  multiSelect: false,
  options: [
    { id: 'separate', label: 'checks.kitStoveSink.options.separate.label', score: 3 },
    { id: 'adjacent', label: 'checks.kitStoveSink.options.adjacent.label', score: -3, remedy: 'checks.kitStoveSink.options.adjacent.remedy' },
  ],
}

// Kitchen: checks.kitStoveBack.*
const kitStoveBack: Check = {
  id: 'kit-stove-back',
  question: 'checks.kitStoveBack.question',
  multiSelect: false,
  options: [
    { id: 'wall',   label: 'checks.kitStoveBack.options.wall.label',   score: 2 },
    { id: 'window', label: 'checks.kitStoveBack.options.window.label', score: -2, remedy: 'checks.kitStoveBack.options.window.remedy' },
  ],
}

// Kitchen: checks.kitBathroom.*
const kitBathroom: Check = {
  id: 'kit-bathroom',
  question: 'checks.kitBathroom.question',
  multiSelect: false,
  options: [
    { id: 'separate', label: 'checks.kitBathroom.options.separate.label', score: 2 },
    { id: 'adjacent', label: 'checks.kitBathroom.options.adjacent.label', score: -2, remedy: 'checks.kitBathroom.options.adjacent.remedy' },
  ],
}

// Bedroom: checks.bedDirection.*
const bedDirection: Check = {
  id: 'bed-direction',
  question: 'checks.bedDirection.question',
  info: 'checks.bedDirection.info',
  multiSelect: false,
  options: [
    { id: 'north-south', label: 'checks.bedDirection.options.northSouth.label', score: 2 },
    { id: 'east-west',   label: 'checks.bedDirection.options.eastWest.label',   score: -2, remedy: 'checks.bedDirection.options.eastWest.remedy' },
  ],
}

// Bedroom: checks.bedHeadwall.*
const bedHeadwall: Check = {
  id: 'bed-headwall',
  question: 'checks.bedHeadwall.question',
  multiSelect: false,
  options: [
    { id: 'solid-wall', label: 'checks.bedHeadwall.options.solidWall.label', score: 3 },
    { id: 'window',     label: 'checks.bedHeadwall.options.window.label',    score: -3, remedy: 'checks.bedHeadwall.options.window.remedy' },
  ],
}

// Bedroom: checks.bedDoor.*
const bedDoor: Check = {
  id: 'bed-door',
  question: 'checks.bedDoor.question',
  multiSelect: false,
  options: [
    { id: 'not-facing', label: 'checks.bedDoor.options.notFacing.label', score: 2 },
    { id: 'facing',     label: 'checks.bedDoor.options.facing.label',    score: -3, remedy: 'checks.bedDoor.options.facing.remedy' },
  ],
}

// Bedroom: checks.bedMirror.*
const bedMirror: Check = {
  id: 'bed-mirror',
  question: 'checks.bedMirror.question',
  multiSelect: false,
  options: [
    { id: 'not-facing', label: 'checks.bedMirror.options.notFacing.label', score: 2 },
    { id: 'facing',     label: 'checks.bedMirror.options.facing.label',    score: -2, remedy: 'checks.bedMirror.options.facing.remedy' },
  ],
}

// Bathroom: checks.bathCenter.*
const bathCenter: Check = {
  id: 'bath-center',
  question: 'checks.bathCenter.question',
  info: 'checks.bathCenter.info',
  multiSelect: false,
  options: [
    { id: 'not-center', label: 'checks.bathCenter.options.notCenter.label', score: 2 },
    { id: 'center',     label: 'checks.bathCenter.options.center.label',    score: -3, remedy: 'checks.bathCenter.options.center.remedy' },
  ],
}

// Bathroom: checks.bathDoor.*
const bathDoor: Check = {
  id: 'bath-door',
  question: 'checks.bathDoor.question',
  multiSelect: false,
  options: [
    { id: 'not-facing', label: 'checks.bathDoor.options.notFacing.label', score: 2 },
    { id: 'facing',     label: 'checks.bathDoor.options.facing.label',    score: -3, remedy: 'checks.bathDoor.options.facing.remedy' },
  ],
}

export const stepChecks: Record<StepKey, Check[]> = {
  external:   [extCelestial, extSha, extSurroundings],
  entrance:   [entDoorFaces, entLight, entClutter],
  livingRoom: [lrPosition, lrSofa, lrLight],
  kitchen:    [kitStoveSink, kitStoveBack, kitBathroom],
  bedroom:    [bedDirection, bedHeadwall, bedDoor, bedMirror],
  bathroom:   [bathCenter, bathDoor],
}

// All check IDs that belong to each step (for scoring lookup)
export const stepCheckIds: Record<StepKey, string[]> = Object.fromEntries(
  Object.entries(stepChecks).map(([key, checks]) => [key, checks.map(c => c.id)])
) as Record<StepKey, string[]>

// Per-section min/max raw scores (sum of min/max across all checks in the section)
export const sectionMinMax: Record<StepKey, { min: number; max: number }> = {
  external:   { min: -22, max: 15 },
  entrance:   { min: -14, max: 4  },
  livingRoom: { min: -6,  max: 8  },
  kitchen:    { min: -7,  max: 7  },
  bedroom:    { min: -10, max: 9  },
  bathroom:   { min: -6,  max: 4  },
}
```

- [ ] **Step 2: Create data/directions.ts**

```typescript
// data/directions.ts
import type { DirectionModifier } from '~/types/fengshui'

export const directionModifiers: DirectionModifier[] = [
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
```

- [ ] **Step 3: Delete old data file**

```bash
rm /home/luojh/workplace/fengshui/data/fengShui.ts
```

- [ ] **Step 4: Commit**

```bash
git add data/checks.ts data/directions.ts data/fengShui.ts
git commit -m "feat: add check data and direction modifiers, remove old data file"
```

---

## Task 4: i18n Locale Files

**Files:**
- Rewrite: `i18n/locales/en.json`
- Rewrite: `i18n/locales/zh-CN.json`

- [ ] **Step 1: Rewrite i18n/locales/en.json**

```json
{
  "idlegram": "idlegram",
  "title": "Feng Shui Inspector",
  "description": "Walk through a property room by room and get a feng shui report with remedies.",
  "disclaimer": "For educational and entertainment purposes. Consult a professional feng shui master for authoritative advice.",
  "steps": {
    "direction": "Facing Direction",
    "external": "External Environment",
    "entrance": "Main Entrance",
    "livingRoom": "Living Room",
    "kitchen": "Kitchen",
    "bedroom": "Bedroom",
    "bathroom": "Bathroom",
    "report": "Report"
  },
  "directions": {
    "N": "North", "NE": "Northeast", "E": "East", "SE": "Southeast",
    "S": "South", "SW": "Southwest", "W": "West", "NW": "Northwest"
  },
  "wizard": {
    "back": "Back",
    "next": "Next",
    "viewReport": "View Report",
    "stepOf": "Step {current} of {total}",
    "directionPrompt": "Which direction does the front door face?",
    "directionHint": "Stand inside looking out through the front door. Use a compass or map app to find the direction.",
    "addBedroom": "Add Another Bedroom",
    "addBathroom": "Add Another Bathroom",
    "bedroom": "Bedroom",
    "masterBedroom": "Master Bedroom",
    "bedroomN": "Bedroom {n}",
    "bathroomN": "Bathroom {n}"
  },
  "report": {
    "title": "Feng Shui Report",
    "overallScore": "Overall Score",
    "sectionBreakdown": "Section Breakdown",
    "issuesFound": "Issues Found",
    "noIssues": "No issues found — great feng shui!",
    "remedy": "Remedy",
    "shareReport": "Share Report",
    "startOver": "Start Over",
    "linkCopied": "Link copied to clipboard!",
    "readOnly": "This is a shared report (read-only).",
    "weight": "weight"
  },
  "ratings": {
    "excellent": "Excellent Feng Shui",
    "good": "Good Feng Shui",
    "fair": "Fair Feng Shui",
    "poor": "Poor Feng Shui",
    "bad": "Bad Feng Shui"
  },
  "sectionLabels": {
    "external": "External Environment",
    "entrance": "Main Entrance",
    "livingRoom": "Living Room",
    "kitchen": "Kitchen",
    "bedroom": "Bedroom(s)",
    "bathroom": "Bathroom(s)"
  },
  "checks": {
    "extCelestial": {
      "question": "Which of the Four Celestial Guardians are present?",
      "info": "Classical feng shui describes ideal surroundings as four protective formations — green dragon (left), white tiger (right), red phoenix (front), black tortoise (behind).",
      "options": {
        "greenDragon":   { "label": "Green Dragon (Left) — buildings on the left are slightly taller" },
        "whiteTiger":    { "label": "White Tiger (Right) — buildings on the right are slightly lower" },
        "redPhoenix":    { "label": "Red Phoenix (Front) — open space or water feature in front" },
        "blackTortoise": { "label": "Black Tortoise (Back) — mountain or tall building behind" }
      }
    },
    "extSha": {
      "question": "Are any negative sha formations present nearby?",
      "info": "Sha qi (煞气) refers to aggressive energy caused by sharp, direct, or oppressive environmental features.",
      "options": {
        "roadRush":     { "label": "Road Rush (路冲) — road or corridor points directly at the front door",         "remedy": "Install a screen wall, dense shrubs, or a bagua mirror above the door to deflect the sha." },
        "sharpCorner":  { "label": "Sharp Corner Sha (角煞) — a building's sharp corner points at the house",       "remedy": "Place tall plants or a wind chime between the corner and the house windows." },
        "reverseBow":   { "label": "Reverse Bow Sha (反弓煞) — road or river curves away from the house",          "remedy": "Add a water feature on the concave side to attract qi back toward the property." },
        "heavensBlade": { "label": "Heaven's Blade Sha (天斩煞) — narrow gap between two tall buildings faces you", "remedy": "Avoid opening windows facing the gap. Use crystals or curtains to deflect the cutting energy." },
        "piercingHeart":{ "label": "Piercing Heart Sha (穿心煞) — underground passage or road runs below",          "remedy": "Place heavy grounding objects on lower floors. Keep lower levels well-lit and active." },
        "lightSha":     { "label": "Light Sha (光煞) — glass facade or strong reflected light hits the house",      "remedy": "Apply UV-blocking window film. Use dense curtains and buffer plants to absorb reflected energy." }
      }
    },
    "extSurroundings": {
      "question": "What notable buildings or features are in the immediate surroundings?",
      "options": {
        "yin":  { "label": "Yin surroundings — hospital, mortuary, garbage station, power substation, or temple nearby", "remedy": "Place strong yang elements near windows facing the yin structure: bright lights, active water features, or lush plants." },
        "yang": { "label": "Yang surroundings — park, school, library, or clean river nearby" }
      }
    },
    "entDoorFaces": {
      "question": "What does the front door face when opened?",
      "info": "The front door is the mouth of qi for the home. Whatever it faces directly influences what energy enters.",
      "options": {
        "elevator": { "label": "Elevator or staircase directly opposite",     "remedy": "Place a plant or decorative screen between the door and the elevator to slow rushing qi." },
        "bathroom": { "label": "Bathroom door directly opposite",             "remedy": "Keep the bathroom door closed at all times. Hang a faceted crystal or small screen between the two doors." },
        "kitchen":  { "label": "Kitchen (stove or appliances) directly ahead","remedy": "Keep the kitchen door closed. Place a room divider or tall plant between the entrance and kitchen." },
        "balcony":  { "label": "Balcony door or window directly across",      "remedy": "Place furniture or a room divider in the path to slow qi from rushing straight through the unit." }
      }
    },
    "entLight": {
      "question": "How is the natural light at the entrance?",
      "options": {
        "good": { "label": "Bright — ample natural light or well-lit entry" },
        "poor": { "label": "Dark — minimal light, feels dim or enclosed",     "remedy": "Add a bright overhead light and a mirror to reflect light. Keep the entry area clean and uncluttered." }
      }
    },
    "entClutter": {
      "question": "How is the entrance area kept?",
      "options": {
        "clean":     { "label": "Clean and uncluttered — welcoming and open" },
        "cluttered": { "label": "Cluttered — shoes, bags, or objects block the entryway", "remedy": "Install a shoe rack or storage cabinet. A clear path at the entrance allows qi to flow in freely." }
      }
    },
    "lrPosition": {
      "question": "Where is the living room located within the unit?",
      "info": "In feng shui, the living room should be near the entrance so qi can gather there before reaching private rooms.",
      "options": {
        "front": { "label": "Front half of the unit — close to the main entrance" },
        "back":  { "label": "Back half of the unit — past the bedrooms", "remedy": "Use furniture placement and lighting to define a clear 'gathering space' near the entrance as a secondary welcoming area." }
      }
    },
    "lrSofa": {
      "question": "What is behind the main sofa?",
      "info": "A sofa with solid backing (a wall) provides stability and support — the occupants feel secure.",
      "options": {
        "solidWall": { "label": "Solid wall — the sofa back is against a wall" },
        "window":    { "label": "Window — the sofa back faces a window",           "remedy": "Place a sofa table or tall plant behind the sofa as a symbolic backing." },
        "openSpace": { "label": "Open space or walkway behind the sofa",           "remedy": "Reposition the sofa against a wall. If impossible, place a tall bookshelf or screen behind it." }
      }
    },
    "lrLight": {
      "question": "How is the natural light and ventilation in the living room?",
      "options": {
        "good": { "label": "Good — bright with natural light and air flow" },
        "poor": { "label": "Poor — dim, stuffy, or relies mainly on artificial light", "remedy": "Keep windows clean and open when possible. Add full-spectrum lighting and air-purifying plants." }
      }
    },
    "kitStoveSink": {
      "question": "Are the stove and sink directly adjacent or facing each other?",
      "info": "The stove represents fire and the sink represents water. In feng shui, fire and water in direct conflict create disharmony.",
      "options": {
        "separate": { "label": "Separated — stove and sink are not side-by-side or directly opposite" },
        "adjacent": { "label": "Adjacent — stove and sink are right next to each other or face each other", "remedy": "Place a wood element between them: a small cutting board, a green plant, or a wood-toned panel to mediate between fire and water." }
      }
    },
    "kitStoveBack": {
      "question": "What is behind the stove?",
      "options": {
        "wall":   { "label": "Solid wall — the stove has a solid wall backing" },
        "window": { "label": "Window or open space behind the stove", "remedy": "Install a solid backsplash (tile or stone). Hang a small mirror behind the stove to symbolically double wealth." }
      }
    },
    "kitBathroom": {
      "question": "Is the kitchen adjacent to or sharing a wall with a bathroom?",
      "options": {
        "separate": { "label": "Not adjacent — kitchen and bathroom are separated by at least one room or hallway" },
        "adjacent": { "label": "Adjacent — kitchen and bathroom share a wall or are directly next to each other", "remedy": "Keep both doors closed. Place a bowl of sea salt in the bathroom corners to absorb negative energy." }
      }
    },
    "bedDirection": {
      "question": "Which direction does the bed run (head to foot)?",
      "info": "North-South alignment follows the Earth's magnetic field, which many traditions associate with better rest.",
      "options": {
        "northSouth": { "label": "North-South — head points North or South" },
        "eastWest":   { "label": "East-West — head points East or West", "remedy": "Reposition the bed to a North-South orientation if the room layout allows." }
      }
    },
    "bedHeadwall": {
      "question": "What is behind the headboard?",
      "options": {
        "solidWall": { "label": "Solid wall — headboard is against a solid wall" },
        "window":    { "label": "Window or door — headboard is against a window or near a door", "remedy": "Move the bed so the headboard is against a solid wall. If not possible, install heavy blackout curtains behind the headboard." }
      }
    },
    "bedDoor": {
      "question": "Is the bed directly in line with the bedroom door?",
      "options": {
        "notFacing": { "label": "Not in line — bed is offset from the door" },
        "facing":    { "label": "In line — lying in bed you look directly at the door", "remedy": "Reposition the bed so it is no longer in direct line with the door. If not possible, place a footboard or a low chest at the bed foot." }
      }
    },
    "bedMirror": {
      "question": "Is there a mirror facing the bed?",
      "options": {
        "notFacing": { "label": "No mirror facing the bed" },
        "facing":    { "label": "Mirror faces the bed — you can see yourself lying down", "remedy": "Cover the mirror with a curtain at night, or relocate it to a wall not visible from bed." }
      }
    },
    "bathCenter": {
      "question": "Where is the bathroom located in the floor plan?",
      "info": "A bathroom in the center of the home is considered inauspicious as it drains the qi of the entire home.",
      "options": {
        "notCenter": { "label": "On the perimeter — bathroom is along an outer wall" },
        "center":    { "label": "Center of the unit — bathroom is in the middle of the floor plan", "remedy": "Keep the door closed always. Use bright lighting and strong ventilation. Place a faceted crystal ball in the bathroom to lift energy." }
      }
    },
    "bathDoor": {
      "question": "Does the bathroom door face the main entrance?",
      "options": {
        "notFacing": { "label": "No — bathroom door is not visible from the front door" },
        "facing":    { "label": "Yes — bathroom door faces or is visible from the front door", "remedy": "Keep the bathroom door closed. Hang a wind chime or crystal between the two doors to catch and redirect energy." }
      }
    }
  }
}
```

- [ ] **Step 2: Rewrite i18n/locales/zh-CN.json**

```json
{
  "idlegram": "闲置程序",
  "title": "风水勘察仪",
  "description": "逐室勘察房屋风水，获取评分与化解建议。",
  "disclaimer": "仅供教育与娱乐参考，如需专业意见请咨询风水师。",
  "steps": {
    "direction": "朝向",
    "external": "外部环境",
    "entrance": "大门",
    "livingRoom": "客厅",
    "kitchen": "厨房",
    "bedroom": "卧室",
    "bathroom": "卫生间",
    "report": "报告"
  },
  "directions": {
    "N": "北", "NE": "东北", "E": "东", "SE": "东南",
    "S": "南", "SW": "西南", "W": "西", "NW": "西北"
  },
  "wizard": {
    "back": "上一步",
    "next": "下一步",
    "viewReport": "查看报告",
    "stepOf": "第 {current} / {total} 步",
    "directionPrompt": "大门朝向哪个方向？",
    "directionHint": "站在室内面向大门向外看，使用指南针或地图应用确认方向。",
    "addBedroom": "添加卧室",
    "addBathroom": "添加卫生间",
    "bedroom": "卧室",
    "masterBedroom": "主卧",
    "bedroomN": "卧室 {n}",
    "bathroomN": "卫生间 {n}"
  },
  "report": {
    "title": "风水报告",
    "overallScore": "综合评分",
    "sectionBreakdown": "分项评分",
    "issuesFound": "发现问题",
    "noIssues": "未发现明显问题，风水良好！",
    "remedy": "化解建议",
    "shareReport": "分享报告",
    "startOver": "重新测算",
    "linkCopied": "链接已复制！",
    "readOnly": "这是一份共享报告（只读）。",
    "weight": "权重"
  },
  "ratings": {
    "excellent": "风水极佳",
    "good": "风水良好",
    "fair": "风水一般",
    "poor": "风水欠佳",
    "bad": "风水不利"
  },
  "sectionLabels": {
    "external": "外部环境",
    "entrance": "大门",
    "livingRoom": "客厅",
    "kitchen": "厨房",
    "bedroom": "卧室",
    "bathroom": "卫生间"
  },
  "checks": {
    "extCelestial": {
      "question": "周边具备哪些四灵山诀？",
      "info": "传统风水认为理想的居所四面应有护卫：左青龙、右白虎、前朱雀、后玄武。",
      "options": {
        "greenDragon":   { "label": "左青龙 — 房屋左侧建筑略高" },
        "whiteTiger":    { "label": "右白虎 — 房屋右侧建筑略低" },
        "redPhoenix":    { "label": "前朱雀 — 房屋前方开阔，或有水景（公园、河流）" },
        "blackTortoise": { "label": "后玄武 — 房屋背后有山体或高大建筑" }
      }
    },
    "extSha": {
      "question": "周边是否存在形煞？",
      "info": "煞气是指由尖锐、直冲或压迫性的环境特征引起的不良能量。",
      "options": {
        "roadRush":     { "label": "路冲 — 道路或走廊直冲大门",           "remedy": "在门前设置照壁、密植灌木或在门楣悬挂八卦镜以化解冲煞。" },
        "sharpCorner":  { "label": "角煞 — 邻近建筑的尖角正对房屋",       "remedy": "在尖角与房屋之间种植高大植物或悬挂风铃来散煞。" },
        "reverseBow":   { "label": "反弓煞 — 道路或河流呈弓形背对房屋",   "remedy": "在弓形凹侧设置水景，将气引回房屋。" },
        "heavensBlade": { "label": "天斩煞 — 两栋高楼之间的缝隙正对房屋", "remedy": "避免开设朝向缝隙的窗户，可用水晶或厚窗帘化解刀形气场。" },
        "piercingHeart":{ "label": "穿心煞 — 地下通道或车道从建筑下方穿过","remedy": "在低层放置厚重的接地物件，保持低楼层灯光明亮、人气旺盛。" },
        "lightSha":     { "label": "光煞 — 玻璃幕墙或强反光长期照射房屋", "remedy": "安装隔热膜，使用厚窗帘及茂密植物作为缓冲。" }
      }
    },
    "extSurroundings": {
      "question": "周边有哪些值得关注的建筑或设施？",
      "options": {
        "yin":  { "label": "阴性设施 — 附近有医院、殡仪馆、垃圾站、变电站或寺庙", "remedy": "在朝向阴性建筑的窗户附近放置强阳性元素：明亮灯光、流动水景或生机盎然的绿植。" },
        "yang": { "label": "阳性设施 — 附近有公园、学校、图书馆或清洁河流" }
      }
    },
    "entDoorFaces": {
      "question": "大门打开后正对什么？",
      "info": "大门是住宅纳气之口，其正对之物直接影响进入的气场。",
      "options": {
        "elevator": { "label": "电梯或楼梯直对大门",           "remedy": "在大门与电梯之间摆放植物或屏风，减缓急速进入的气流。" },
        "bathroom": { "label": "卫生间门直对大门",             "remedy": "卫生间门随时保持关闭，在两扇门之间悬挂水晶或小屏风。" },
        "kitchen":  { "label": "厨房（灶台或电器）正对大门",   "remedy": "厨房门随时保持关闭，在入口与厨房之间放置隔断或高大植物。" },
        "balcony":  { "label": "阳台门或窗户正对大门直穿而过", "remedy": "在穿堂路线上摆放家具或隔断，减缓气流直穿而过。" }
      }
    },
    "entLight": {
      "question": "入口区域的自然采光如何？",
      "options": {
        "good": { "label": "明亮 — 自然光充足，入口敞亮" },
        "poor": { "label": "昏暗 — 光线不足，入口幽暗封闭", "remedy": "安装明亮顶灯，并放置镜子以反射光线。保持入口整洁。" }
      }
    },
    "entClutter": {
      "question": "入口区域的整洁程度如何？",
      "options": {
        "clean":     { "label": "整洁有序 — 入口干净，通行无阻" },
        "cluttered": { "label": "杂物堆积 — 鞋子、包袋或杂物堵塞入口", "remedy": "安装鞋柜或收纳柜。入口畅通，气才能顺畅进入。" }
      }
    },
    "lrPosition": {
      "question": "客厅位于整套房屋的哪个位置？",
      "info": "风水上客厅应靠近入口，使气在进入私密房间前有聚集之处。",
      "options": {
        "front": { "label": "前半部 — 客厅靠近大门" },
        "back":  { "label": "后半部 — 客厅在卧室之后", "remedy": "通过家具布置和灯光，在入口附近打造一个清晰的"迎客区"作为辅助聚气点。" }
      }
    },
    "lrSofa": {
      "question": "主沙发背后是什么？",
      "info": "沙发背实墙（有靠）寓意稳固有依，居住者感到安全踏实。",
      "options": {
        "solidWall": { "label": "实墙 — 沙发背靠实墙" },
        "window":    { "label": "窗户 — 沙发背对窗户",           "remedy": "在沙发后方放置条案或高大植物，作为象征性的靠山。" },
        "openSpace": { "label": "过道或开放空间 — 沙发后方无遮挡", "remedy": "将沙发移至靠墙位置；若无法移动，则在后方放置高书架或屏风。" }
      }
    },
    "lrLight": {
      "question": "客厅的自然采光与通风如何？",
      "options": {
        "good": { "label": "良好 — 光线明亮，空气流通" },
        "poor": { "label": "欠佳 — 昏暗、闷热，主要依赖人工照明", "remedy": "尽量保持窗户清洁并定期开窗。增设全光谱灯具和空气净化植物。" }
      }
    },
    "kitStoveSink": {
      "question": "灶台与水槽是否紧邻或相对？",
      "info": "灶台属火，水槽属水，水火相克会产生不和谐。",
      "options": {
        "separate": { "label": "分开 — 灶台与水槽不相邻，也不正对" },
        "adjacent": { "label": "紧邻 — 灶台与水槽紧挨着或正对着", "remedy": "在两者之间放置木质元素：砧板、绿植或木色隔板，以"木"调和水火。" }
      }
    },
    "kitStoveBack": {
      "question": "灶台背后是什么？",
      "options": {
        "wall":   { "label": "实墙 — 灶台背靠实墙" },
        "window": { "label": "窗户或开放空间在灶台后方", "remedy": "安装实心防溅板（瓷砖或石材），并可在灶台后方挂小镜子，象征财富翻倍。" }
      }
    },
    "kitBathroom": {
      "question": "厨房与卫生间是否相邻或共用一面墙？",
      "options": {
        "separate": { "label": "不相邻 — 厨房与卫生间之间至少隔一个房间或走廊" },
        "adjacent": { "label": "相邻 — 厨房与卫生间共用一面墙或紧挨着", "remedy": "两处门随时保持关闭。在卫生间角落放置海盐碗以吸收负能量。" }
      }
    },
    "bedDirection": {
      "question": "床的朝向（头部到脚部）是哪个方向？",
      "info": "南北方向与地球磁场平行，许多传统认为这有助于改善睡眠质量。",
      "options": {
        "northSouth": { "label": "南北向 — 床头朝南或朝北" },
        "eastWest":   { "label": "东西向 — 床头朝东或朝西", "remedy": "在房间布局允许的情况下，将床调整为南北朝向。" }
      }
    },
    "bedHeadwall": {
      "question": "床头靠的是什么？",
      "options": {
        "solidWall": { "label": "实墙 — 床头板紧靠实墙" },
        "window":    { "label": "窗户或门 — 床头靠近窗户或门旁", "remedy": "将床移至靠实墙的位置。若无法移动，在床头安装厚重遮光窗帘。" }
      }
    },
    "bedDoor": {
      "question": "床与卧室门是否正对？",
      "options": {
        "notFacing": { "label": "不正对 — 躺在床上看不到门" },
        "facing":    { "label": "正对 — 躺在床上直视卧室门", "remedy": "调整床位使其偏离门的正对方向；若无法移动，在床脚放置床尾凳或屏风。" }
      }
    },
    "bedMirror": {
      "question": "卧室内是否有镜子正对床铺？",
      "options": {
        "notFacing": { "label": "没有镜子正对床" },
        "facing":    { "label": "有镜子正对床，躺下可看到自己", "remedy": "夜间用布帘遮盖镜子，或将镜子移至躺下时视线看不到的墙面。" }
      }
    },
    "bathCenter": {
      "question": "卫生间位于整套房屋平面图的哪个位置？",
      "info": "位于房屋中央的卫生间被认为是不吉的，会从中心泄漏整个住宅的气场。",
      "options": {
        "notCenter": { "label": "靠外墙 — 卫生间沿外墙而设" },
        "center":    { "label": "位于中央 — 卫生间处于户型平面图的中心位置", "remedy": "随时保持门关闭，确保灯光明亮、通风良好，并在卫生间内放置水晶球以提升气场。" }
      }
    },
    "bathDoor": {
      "question": "卫生间门是否面向大门？",
      "options": {
        "notFacing": { "label": "不正对 — 从大门看不到卫生间门" },
        "facing":    { "label": "正对 — 卫生间门朝向或正对大门", "remedy": "保持卫生间门常闭。在两门之间悬挂风铃或水晶以引导和转化气流。" }
      }
    }
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add i18n/locales/en.json i18n/locales/zh-CN.json
git commit -m "feat: rewrite i18n locale files with check content and remedies"
```

---

## Task 5: Scoring Engine (TDD)

**Files:**
- Create: `composables/useFengShui.ts`
- Create: `tests/scoring.test.ts`

The scoring engine exports pure functions. Tests import those functions directly (no Nuxt runtime needed).

**Score normalization formula:**
`normalized = clamp((raw - sectionMin) / (sectionMax - sectionMin) * 100, 0, 100)`

Where `sectionMin` and `sectionMax` come from `sectionMinMax` in `data/checks.ts`.

**Direction modifier:** applied to the entire check's raw contribution before summing to the section raw score.

- [ ] **Step 1: Write the failing tests**

```typescript
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
```

- [ ] **Step 2: Run tests and confirm they fail**

```bash
pnpm test
```

Expected: fails with "Cannot find module '../composables/useFengShui'".

- [ ] **Step 3: Implement composables/useFengShui.ts**

```typescript
// composables/useFengShui.ts
import { stepChecks, stepCheckIds, sectionMinMax } from '~/data/checks'
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

// --- Pure functions (exported for testing) ---

export function calculateSectionScore(
  stepKey: StepKey,
  answers: Record<string, string[]>,
  modifiers: DirectionModifier[],
  direction: Direction,
): number {
  const checks = stepChecks[stepKey]
  const { min, max } = sectionMinMax[stepKey]

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
    info: check.info ? t(check.info) : '',
    multiSelect: check.multiSelect,
    options: check.options.map(opt => ({
      id: opt.id,
      label: t(opt.label),
      score: opt.score,
      remedy: opt.remedy ? t(opt.remedy) : undefined,
    })),
  }))
}

function getRating(score: number, t: (key: string) => string): Rating {
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
    const stepKeys = Object.keys(sectionMinMax) as StepKey[]
    return Object.fromEntries(
      stepKeys.map(key => {
        if (key === 'bedroom' || key === 'bathroom') {
          const rooms = state.value.rooms[key]
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
    const stepKeys = ['external', 'entrance', 'livingRoom', 'kitchen'] as StepKey[]
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
```

- [ ] **Step 4: Run tests and verify they pass**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add composables/useFengShui.ts tests/scoring.test.ts
git commit -m "feat: scoring engine with direction modifiers — TDD"
```

---

## Task 6: Wizard State (TDD)

**Files:**
- Create: `composables/useWizard.ts`
- Create: `tests/wizard.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
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
```

- [ ] **Step 2: Run tests and confirm they fail**

```bash
pnpm test
```

Expected: fails with "Cannot find module '../composables/useWizard'".

- [ ] **Step 3: Implement composables/useWizard.ts**

```typescript
// composables/useWizard.ts
import type { Direction, WizardState, WizardStep, StepKey, RoomResult } from '~/types/fengshui'

export const STEPS: WizardStep[] = [
  'direction', 'external', 'entrance', 'livingRoom', 'kitchen', 'bedroom', 'bathroom', 'report'
]

// --- Pure functions (exported for testing) ---

export function canAdvance(step: WizardStep, state: WizardState): boolean {
  if (step === 'report') return false
  if (step === 'direction') return state.facingDirection !== null
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

function defaultState(): WizardState {
  return {
    facingDirection: null,
    answers: {},
    rooms: { bedroom: [newRoom('bedroom', 1)], bathroom: [newRoom('bathroom', 1)] },
  }
}

function newRoom(type: 'bedroom' | 'bathroom', n: number): RoomResult {
  const label = type === 'bedroom'
    ? (n === 1 ? 'wizard.masterBedroom' : `wizard.bedroomN`)
    : `wizard.bathroomN`
  return { roomId: `${type}-${n}`, label, answers: {} }
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
    const rooms = state.value.rooms[type]
    const room = rooms.find(r => r.roomId === roomId)
    if (room) {
      room.answers = { ...room.answers, [checkId]: optionIds }
    }
  }

  function addRoom(type: 'bedroom' | 'bathroom') {
    const rooms = state.value.rooms[type]
    state.value.rooms[type] = [...rooms, newRoom(type, rooms.length + 1)]
  }

  function removeRoom(type: 'bedroom' | 'bathroom', roomId: string) {
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
```

- [ ] **Step 4: Run tests and verify they pass**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add composables/useWizard.ts tests/wizard.test.ts
git commit -m "feat: wizard state and step navigation — TDD"
```

---

## Task 7: Report Serialization (TDD)

**Files:**
- Create: `composables/useReport.ts`
- Create: `tests/report.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
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
})
```

- [ ] **Step 2: Run tests and confirm they fail**

```bash
pnpm test
```

Expected: fails with "Cannot find module '../composables/useReport'".

- [ ] **Step 3: Implement composables/useReport.ts**

```typescript
// composables/useReport.ts
import type { WizardState } from '~/types/fengshui'

// --- Pure functions (exported for testing) ---

export function encodeState(state: WizardState): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(state))))
}

export function decodeState(encoded: string): WizardState | null {
  try {
    const json = decodeURIComponent(escape(atob(encoded)))
    const parsed = JSON.parse(json)
    // Shape validation
    if (
      typeof parsed !== 'object' ||
      !('facingDirection' in parsed) ||
      !('answers' in parsed) ||
      !('rooms' in parsed) ||
      !('bedroom' in parsed.rooms) ||
      !('bathroom' in parsed.rooms)
    ) {
      return null
    }
    return parsed as WizardState
  } catch {
    return null
  }
}

// --- Nuxt composable ---

export function useReport() {
  const route = useRoute()
  const { t } = useI18n()

  // Decode state from URL param (for shareable report page)
  const sharedState = computed<WizardState | null>(() => {
    const d = route.query.d
    if (typeof d !== 'string') return null
    return decodeState(d)
  })

  async function shareReport(state: WizardState) {
    const encoded = encodeState(state)
    const url = `${window.location.origin}/report?d=${encoded}`
    try {
      await navigator.clipboard.writeText(url)
      return true
    } catch {
      return false
    }
  }

  return { sharedState, shareReport, encodeState, decodeState }
}
```

- [ ] **Step 4: Run tests and verify they pass**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add composables/useReport.ts tests/report.test.ts
git commit -m "feat: report URL serialization — TDD"
```

---

## Task 8: Wizard Shell Components

**Files:**
- Create: `components/wizard/WizardProgress.vue`
- Create: `components/wizard/WizardNav.vue`

- [ ] **Step 1: Create components/wizard/WizardProgress.vue**

```vue
<script setup lang="ts">
defineProps<{
  current: number   // 0-based, 0=direction, 7=report
  total: number
}>()
</script>

<template>
  <div class="mb-6">
    <div class="flex justify-between items-center mb-2">
      <span class="text-sm text-muted">
        {{ $t('wizard.stepOf', { current: current + 1, total }) }}
      </span>
      <span class="text-sm text-muted">{{ Math.round((current / (total - 1)) * 100) }}%</span>
    </div>
    <div class="w-full bg-elevated rounded-full h-1.5">
      <div
        class="bg-primary h-1.5 rounded-full transition-all duration-300"
        :style="{ width: `${(current / (total - 1)) * 100}%` }"
      />
    </div>
  </div>
</template>
```

- [ ] **Step 2: Create components/wizard/WizardNav.vue**

```vue
<script setup lang="ts">
defineProps<{
  canGoBack: boolean
  canGoNext: boolean
  isLastContentStep: boolean  // true when on 'bathroom' step → button says "View Report"
}>()

defineEmits<{
  back: []
  next: []
}>()
</script>

<template>
  <div class="flex justify-between mt-6">
    <UButton
      v-if="canGoBack"
      variant="ghost"
      color="neutral"
      icon="i-lucide-arrow-left"
      @click="$emit('back')"
    >
      {{ $t('wizard.back') }}
    </UButton>
    <div v-else />

    <UButton
      color="primary"
      :disabled="!canGoNext"
      trailing-icon="i-lucide-arrow-right"
      @click="$emit('next')"
    >
      {{ isLastContentStep ? $t('wizard.viewReport') : $t('wizard.next') }}
    </UButton>
  </div>
</template>
```

- [ ] **Step 3: Commit**

```bash
git add components/wizard/WizardProgress.vue components/wizard/WizardNav.vue
git commit -m "feat: wizard progress bar and navigation components"
```

---

## Task 9: Direction Step

**Files:**
- Create: `components/wizard/StepDirection.vue`

The compass uses a 3×3 CSS grid. Directions are mapped to grid positions. Center cell is a compass icon.

```
Grid positions:
[NW][N ][NE]
[W ][  ][E ]
[SW][S ][SE]
```

- [ ] **Step 1: Create components/wizard/StepDirection.vue**

```vue
<script setup lang="ts">
import type { Direction } from '~/types/fengshui'

const { state, setDirection } = useWizard()

type CompassCell = { dir: Direction; row: number; col: number }

const cells: CompassCell[] = [
  { dir: 'NW', row: 1, col: 1 }, { dir: 'N',  row: 1, col: 2 }, { dir: 'NE', row: 1, col: 3 },
  { dir: 'W',  row: 2, col: 1 },                                  { dir: 'E',  row: 2, col: 3 },
  { dir: 'SW', row: 3, col: 1 }, { dir: 'S',  row: 3, col: 2 }, { dir: 'SE', row: 3, col: 3 },
]
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold mb-2">{{ $t('wizard.directionPrompt') }}</h2>
    <p class="text-muted text-sm mb-6">{{ $t('wizard.directionHint') }}</p>

    <div
      class="grid gap-2 w-fit mx-auto"
      style="grid-template-columns: repeat(3, 72px); grid-template-rows: repeat(3, 72px);"
    >
      <!-- Center compass icon -->
      <div
        class="flex items-center justify-center"
        style="grid-row: 2; grid-column: 2;"
      >
        <UIcon name="i-lucide-compass" class="size-8 text-muted" />
      </div>

      <!-- Direction buttons -->
      <UButton
        v-for="cell in cells"
        :key="cell.dir"
        :style="{ gridRow: cell.row, gridColumn: cell.col }"
        :color="state.facingDirection === cell.dir ? 'primary' : 'neutral'"
        :variant="state.facingDirection === cell.dir ? 'solid' : 'outline'"
        class="h-full w-full flex-col gap-1 text-xs font-semibold"
        @click="setDirection(cell.dir)"
      >
        {{ $t(`directions.${cell.dir}`) }}
      </UButton>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add components/wizard/StepDirection.vue
git commit -m "feat: compass rose direction picker step"
```

---

## Task 10: WizardCheck Component

**Files:**
- Create: `components/wizard/WizardCheck.vue`

A reusable component that renders a single `TranslatedCheck` with radio (single-select) or checkbox (multi-select) options from Nuxt UI.

- [ ] **Step 1: Create components/wizard/WizardCheck.vue**

```vue
<script setup lang="ts">
import type { TranslatedCheck } from '~/types/fengshui'

const props = defineProps<{
  check: TranslatedCheck
  modelValue: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

// Nuxt UI UCheckboxGroup / URadioGroup use objects with 'value' key
const uiItems = computed(() =>
  props.check.options.map(opt => ({
    value: opt.id,
    label: opt.label,
  }))
)

// For single-select: v-model is a single string (radio), but we store as string[]
const radioValue = computed({
  get: () => props.modelValue[0] ?? '',
  set: (val: string) => emit('update:modelValue', val ? [val] : []),
})

// For multi-select
const checkboxValue = computed({
  get: () => props.modelValue,
  set: (val: string[]) => emit('update:modelValue', val),
})
</script>

<template>
  <div class="mb-6">
    <div class="flex items-center gap-1.5 mb-2">
      <h3 class="font-medium">{{ check.question }}</h3>
      <UPopover v-if="check.info" placement="top">
        <UIcon name="i-lucide-info" class="size-4 text-muted cursor-pointer shrink-0" />
        <template #content>
          <div class="p-3 max-w-xs text-sm">{{ check.info }}</div>
        </template>
      </UPopover>
    </div>

    <UCheckboxGroup
      v-if="check.multiSelect"
      v-model="checkboxValue"
      :items="uiItems"
      value-key="value"
      color="primary"
      variant="card"
      orientation="vertical"
      indicator="start"
      :ui="{ fieldset: 'gap-1.5', item: 'bg-elevated' }"
    />

    <URadioGroup
      v-else
      v-model="radioValue"
      :items="uiItems"
      value-key="value"
      color="primary"
      variant="card"
      orientation="vertical"
      indicator="start"
      :ui="{ fieldset: 'gap-1.5', item: 'bg-elevated' }"
    />
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add components/wizard/WizardCheck.vue
git commit -m "feat: reusable WizardCheck component for check questions"
```

---

## Task 11: Single-Room Content Steps

**Files:**
- Create: `components/wizard/StepExternal.vue`
- Create: `components/wizard/StepEntrance.vue`
- Create: `components/wizard/StepLivingRoom.vue`
- Create: `components/wizard/StepKitchen.vue`

All four follow the same pattern: get checks for the step, translate them, render `WizardCheck` for each.

- [ ] **Step 1: Create components/wizard/StepExternal.vue**

```vue
<script setup lang="ts">
import { stepChecks } from '~/data/checks'
import { translateChecks } from '~/composables/useFengShui'

const { t } = useI18n()
const { state, setAnswer } = useWizard()

const translatedChecks = computed(() => translateChecks(stepChecks.external, t))

function getModel(checkId: string) {
  return computed({
    get: () => state.value.answers[checkId] ?? [],
    set: (val: string[]) => setAnswer(checkId, val),
  })
}
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold mb-6">{{ $t('steps.external') }}</h2>
    <WizardCheck
      v-for="check in translatedChecks"
      :key="check.id"
      :check="check"
      :model-value="state.answers[check.id] ?? []"
      @update:model-value="setAnswer(check.id, $event)"
    />
  </div>
</template>
```

- [ ] **Step 2: Create components/wizard/StepEntrance.vue**

```vue
<script setup lang="ts">
import { stepChecks } from '~/data/checks'
import { translateChecks } from '~/composables/useFengShui'

const { t } = useI18n()
const { state, setAnswer } = useWizard()

const translatedChecks = computed(() => translateChecks(stepChecks.entrance, t))
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold mb-6">{{ $t('steps.entrance') }}</h2>
    <WizardCheck
      v-for="check in translatedChecks"
      :key="check.id"
      :check="check"
      :model-value="state.answers[check.id] ?? []"
      @update:model-value="setAnswer(check.id, $event)"
    />
  </div>
</template>
```

- [ ] **Step 3: Create components/wizard/StepLivingRoom.vue**

```vue
<script setup lang="ts">
import { stepChecks } from '~/data/checks'
import { translateChecks } from '~/composables/useFengShui'

const { t } = useI18n()
const { state, setAnswer } = useWizard()

const translatedChecks = computed(() => translateChecks(stepChecks.livingRoom, t))
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold mb-6">{{ $t('steps.livingRoom') }}</h2>
    <WizardCheck
      v-for="check in translatedChecks"
      :key="check.id"
      :check="check"
      :model-value="state.answers[check.id] ?? []"
      @update:model-value="setAnswer(check.id, $event)"
    />
  </div>
</template>
```

- [ ] **Step 4: Create components/wizard/StepKitchen.vue**

```vue
<script setup lang="ts">
import { stepChecks } from '~/data/checks'
import { translateChecks } from '~/composables/useFengShui'

const { t } = useI18n()
const { state, setAnswer } = useWizard()

const translatedChecks = computed(() => translateChecks(stepChecks.kitchen, t))
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold mb-6">{{ $t('steps.kitchen') }}</h2>
    <WizardCheck
      v-for="check in translatedChecks"
      :key="check.id"
      :check="check"
      :model-value="state.answers[check.id] ?? []"
      @update:model-value="setAnswer(check.id, $event)"
    />
  </div>
</template>
```

- [ ] **Step 5: Commit**

```bash
git add components/wizard/StepExternal.vue components/wizard/StepEntrance.vue \
  components/wizard/StepLivingRoom.vue components/wizard/StepKitchen.vue
git commit -m "feat: single-room content step components"
```

---

## Task 12: Multi-Room Steps

**Files:**
- Create: `components/wizard/StepBedroom.vue`
- Create: `components/wizard/StepBathroom.vue`

Each renders a collapsible section per room, with an "Add Room" button. Rooms start with one by default (seeded in `defaultState`).

- [ ] **Step 1: Create components/wizard/StepBedroom.vue**

```vue
<script setup lang="ts">
import { stepChecks } from '~/data/checks'
import { translateChecks } from '~/composables/useFengShui'

const { t } = useI18n()
const { state, setRoomAnswer, addRoom, removeRoom } = useWizard()

const translatedChecks = computed(() => translateChecks(stepChecks.bedroom, t))

const rooms = computed(() => state.value.rooms.bedroom)

function roomLabel(idx: number) {
  return idx === 0 ? t('wizard.masterBedroom') : t('wizard.bedroomN', { n: idx + 1 })
}
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold mb-6">{{ $t('steps.bedroom') }}</h2>

    <div v-for="(room, idx) in rooms" :key="room.roomId" class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-primary">{{ roomLabel(idx) }}</h3>
        <UButton
          v-if="idx > 0"
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-trash-2"
          @click="removeRoom('bedroom', room.roomId)"
        />
      </div>

      <WizardCheck
        v-for="check in translatedChecks"
        :key="check.id"
        :check="check"
        :model-value="room.answers[check.id] ?? []"
        @update:model-value="setRoomAnswer('bedroom', room.roomId, check.id, $event)"
      />

      <USeparator v-if="idx < rooms.length - 1" class="my-4" />
    </div>

    <UButton
      color="neutral"
      variant="outline"
      icon="i-lucide-plus"
      @click="addRoom('bedroom')"
    >
      {{ $t('wizard.addBedroom') }}
    </UButton>
  </div>
</template>
```

- [ ] **Step 2: Create components/wizard/StepBathroom.vue**

```vue
<script setup lang="ts">
import { stepChecks } from '~/data/checks'
import { translateChecks } from '~/composables/useFengShui'

const { t } = useI18n()
const { state, setRoomAnswer, addRoom, removeRoom } = useWizard()

const translatedChecks = computed(() => translateChecks(stepChecks.bathroom, t))

const rooms = computed(() => state.value.rooms.bathroom)

function roomLabel(idx: number) {
  return t('wizard.bathroomN', { n: idx + 1 })
}
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold mb-6">{{ $t('steps.bathroom') }}</h2>

    <div v-for="(room, idx) in rooms" :key="room.roomId" class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-primary">{{ roomLabel(idx) }}</h3>
        <UButton
          v-if="idx > 0"
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-trash-2"
          @click="removeRoom('bathroom', room.roomId)"
        />
      </div>

      <WizardCheck
        v-for="check in translatedChecks"
        :key="check.id"
        :check="check"
        :model-value="room.answers[check.id] ?? []"
        @update:model-value="setRoomAnswer('bathroom', room.roomId, check.id, $event)"
      />

      <USeparator v-if="idx < rooms.length - 1" class="my-4" />
    </div>

    <UButton
      color="neutral"
      variant="outline"
      icon="i-lucide-plus"
      @click="addRoom('bathroom')"
    >
      {{ $t('wizard.addBathroom') }}
    </UButton>
  </div>
</template>
```

- [ ] **Step 3: Commit**

```bash
git add components/wizard/StepBedroom.vue components/wizard/StepBathroom.vue
git commit -m "feat: multi-room bedroom and bathroom step components"
```

---

## Task 13: Report Components

**Files:**
- Create: `components/report/ReportOverall.vue`
- Create: `components/report/ReportBreakdown.vue`
- Create: `components/report/ReportIssues.vue`

These receive a `Report` prop (computed in `useFengShui`) and render read-only report content. Used in both `StepReport.vue` and `pages/report/index.vue`.

- [ ] **Step 1: Create components/report/ReportOverall.vue**

```vue
<script setup lang="ts">
import type { Report } from '~/types/fengshui'

defineProps<{ report: Report }>()

const colorClass = (color: string) => ({
  'text-emerald-400': color === 'emerald',
  'text-yellow-400':  color === 'yellow',
  'text-orange-400':  color === 'orange',
  'text-red-400':     color === 'red',
})
</script>

<template>
  <UCard variant="subtle" class="mb-4">
    <p class="text-sm text-muted mb-1">{{ $t('report.overallScore') }}</p>
    <div class="flex items-end gap-3 mb-3">
      <span class="text-5xl font-bold" :class="colorClass(report.rating.color)">
        {{ report.overallScore }}
      </span>
      <span class="text-lg font-semibold pb-1" :class="colorClass(report.rating.color)">
        {{ report.rating.label }}
      </span>
    </div>
    <div class="w-full bg-elevated rounded-full h-2">
      <div
        class="h-2 rounded-full transition-all duration-500"
        :class="{
          'bg-emerald-400': report.rating.color === 'emerald',
          'bg-yellow-400':  report.rating.color === 'yellow',
          'bg-orange-400':  report.rating.color === 'orange',
          'bg-red-400':     report.rating.color === 'red',
        }"
        :style="{ width: `${report.overallScore}%` }"
      />
    </div>
  </UCard>
</template>
```

- [ ] **Step 2: Create components/report/ReportBreakdown.vue**

```vue
<script setup lang="ts">
import type { Report } from '~/types/fengshui'

defineProps<{ report: Report }>()
</script>

<template>
  <UCard variant="subtle" class="mb-4">
    <h3 class="font-semibold mb-3">{{ $t('report.sectionBreakdown') }}</h3>
    <div class="space-y-2">
      <div
        v-for="section in report.sectionScores"
        :key="section.stepKey"
        class="flex items-center gap-3"
      >
        <UIcon
          :name="section.score >= 50 ? 'i-lucide-check-circle' : 'i-lucide-alert-circle'"
          :class="section.score >= 50 ? 'text-emerald-400' : 'text-orange-400'"
          class="size-4 shrink-0"
        />
        <span class="flex-1 text-sm">{{ section.label }}</span>
        <span class="text-xs text-muted">({{ Math.round(section.weight * 100) }}%)</span>
        <span class="text-sm font-semibold w-8 text-right">{{ section.score }}</span>
      </div>
    </div>
  </UCard>
</template>
```

- [ ] **Step 3: Create components/report/ReportIssues.vue**

```vue
<script setup lang="ts">
import type { Report } from '~/types/fengshui'

defineProps<{ report: Report }>()
</script>

<template>
  <UCard variant="subtle" class="mb-4">
    <h3 class="font-semibold mb-3">
      {{ $t('report.issuesFound') }}
      <UBadge v-if="report.issues.length" color="orange" variant="subtle" class="ml-2">
        {{ report.issues.length }}
      </UBadge>
    </h3>

    <p v-if="report.issues.length === 0" class="text-muted text-sm">
      {{ $t('report.noIssues') }}
    </p>

    <div v-else class="space-y-4">
      <div
        v-for="(issue, idx) in report.issues"
        :key="idx"
        class="border-l-2 border-orange-400 pl-3"
      >
        <p class="text-sm font-medium">
          {{ issue.roomLabel ? `${issue.roomLabel} — ` : '' }}{{ issue.checkQuestion }}
        </p>
        <p class="text-sm text-muted mt-0.5">{{ issue.optionLabel }}</p>
        <div class="mt-1.5 flex gap-1.5">
          <UIcon name="i-lucide-wrench" class="size-3.5 text-primary shrink-0 mt-0.5" />
          <p class="text-xs text-primary">{{ issue.remedy }}</p>
        </div>
      </div>
    </div>
  </UCard>
</template>
```

- [ ] **Step 4: Commit**

```bash
git add components/report/ReportOverall.vue components/report/ReportBreakdown.vue \
  components/report/ReportIssues.vue
git commit -m "feat: report display components (overall score, breakdown, issues)"
```

---

## Task 14: StepReport + Main Wizard Page

**Files:**
- Create: `components/wizard/StepReport.vue`
- Rewrite: `pages/index.vue`
- Modify: `app.vue`

- [ ] **Step 1: Create components/wizard/StepReport.vue**

```vue
<script setup lang="ts">
const { report } = useFengShui()
const { state, reset } = useWizard()
const { shareReport } = useReport()
const { t } = useI18n()

const toast = useToast()

async function handleShare() {
  const success = await shareReport(state.value)
  toast.add({
    title: success ? t('report.linkCopied') : 'Failed to copy link',
    color: success ? 'success' : 'error',
    duration: 2000,
  })
}
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold mb-6">{{ $t('report.title') }}</h2>

    <ReportOverall :report="report" />
    <ReportBreakdown :report="report" />
    <ReportIssues :report="report" />

    <div class="flex gap-3 mt-6">
      <UButton color="primary" icon="i-lucide-share-2" @click="handleShare">
        {{ $t('report.shareReport') }}
      </UButton>
      <UButton color="neutral" variant="outline" icon="i-lucide-rotate-ccw" @click="reset">
        {{ $t('report.startOver') }}
      </UButton>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Rewrite pages/index.vue**

```vue
<script setup lang="ts">
import { STEPS } from '~/composables/useWizard'

const { currentStep, currentStepIndex, totalSteps, canAdvance, goNext, goBack } = useWizard()

const stepComponents: Record<string, ReturnType<typeof resolveComponent>> = {
  direction:  resolveComponent('WizardStepDirection'),
  external:   resolveComponent('WizardStepExternal'),
  entrance:   resolveComponent('WizardStepEntrance'),
  livingRoom: resolveComponent('WizardStepLivingRoom'),
  kitchen:    resolveComponent('WizardStepKitchen'),
  bedroom:    resolveComponent('WizardStepBedroom'),
  bathroom:   resolveComponent('WizardStepBathroom'),
  report:     resolveComponent('WizardStepReport'),
}

const currentComponent = computed(() => stepComponents[currentStep.value])
const isLastContentStep = computed(() => currentStep.value === 'bathroom')
const showNav = computed(() => currentStep.value !== 'report')
</script>

<template>
  <UContainer class="py-6 max-w-xl">
    <WizardProgress :current="currentStepIndex" :total="totalSteps" />

    <component :is="currentComponent" />

    <WizardNav
      v-if="showNav"
      :can-go-back="currentStepIndex > 0"
      :can-go-next="canAdvance"
      :is-last-content-step="isLastContentStep"
      @back="goBack"
      @next="goNext"
    />
  </UContainer>
</template>
```

- [ ] **Step 3: Update app.vue to add header with language/color toggle**

Replace the existing `app.vue` content with:

```vue
<script setup lang="ts">
import { Analytics } from "@vercel/analytics/nuxt"
import { SpeedInsights } from "@vercel/speed-insights/nuxt"

const { t } = useI18n()
const { locale, setLocale } = useI18n()

useSeoMeta({
  title: t("title"),
  description: t("description"),
})
</script>

<template>
  <UApp>
    <Analytics />
    <SpeedInsights />

    <!-- Header bar -->
    <div class="border-b border-default">
      <UContainer class="max-w-xl py-3 flex items-center justify-between">
        <span class="font-semibold text-primary">{{ $t('title') }}</span>
        <div class="flex items-center gap-1">
          <UButton
            size="xs"
            :color="locale === 'zh-CN' ? 'primary' : 'neutral'"
            variant="ghost"
            @click="setLocale('zh-CN')"
          >
            中文
          </UButton>
          <UButton
            size="xs"
            :color="locale === 'en' ? 'primary' : 'neutral'"
            variant="ghost"
            @click="setLocale('en')"
          >
            EN
          </UButton>
          <UColorModeButton />
          <UButton
            color="neutral"
            variant="ghost"
            size="xs"
            to="https://github.com/idlegram/fengshui"
            target="_blank"
            icon="i-simple-icons-github"
            aria-label="GitHub"
          />
        </div>
      </UContainer>
    </div>

    <UMain>
      <NuxtPage />
    </UMain>

    <USeparator class="py-2" />

    <UFooter>
      <template #left>
        <p class="text-muted text-sm">
          Copyright © {{ new Date().getFullYear() }}
          <span class="font-semibold text-primary">{{ $t("idlegram") }}</span>
          by
          <a href="https://luojiahai.com" target="_blank" class="underline">luojiahai</a>
        </p>
      </template>
    </UFooter>
  </UApp>
</template>
```

- [ ] **Step 4: Delete old components**

```bash
rm /home/luojh/workplace/fengshui/components/FengShuiHeader.vue
rm /home/luojh/workplace/fengshui/components/FengShuiOptions.vue
rm /home/luojh/workplace/fengshui/components/FengShuiScore.vue
```

- [ ] **Step 5: Run dev server and test the wizard manually**

```bash
pnpm dev
```

Open http://localhost:3000. Verify:
- Compass rose renders on step 1
- Can't click Next without selecting a direction
- Navigating through all 8 steps works
- Report renders with scores, breakdown, and issues

- [ ] **Step 6: Commit**

```bash
git add components/wizard/StepReport.vue pages/index.vue app.vue \
  components/FengShuiHeader.vue components/FengShuiOptions.vue components/FengShuiScore.vue
git commit -m "feat: wire up main wizard page and StepReport with share button"
```

---

## Task 15: Shareable Report Page + Cleanup

**Files:**
- Create: `pages/report/index.vue`
- Modify: `nuxt.config.ts`

- [ ] **Step 1: Create pages/report/index.vue**

```vue
<script setup lang="ts">
const { sharedState } = useReport()
const { t } = useI18n()

// Build a synthetic Report from the shared state (no reactive wizard state)
const report = computed(() => {
  const state = sharedState.value
  if (!state) return null

  // Re-use scoring engine with the shared state as input
  const direction = state.facingDirection ?? 'N'
  const { directionModifiers } = useNuxtApp().$directionModifiers ?? {}

  return null  // placeholder — actual implementation below
})
</script>
```

Wait — the report page needs to call the same scoring logic but with a decoded state rather than the live wizard state. The cleanest way is to pass the decoded state directly to `useFengShui`'s pure functions. Replace the above with the correct implementation:

```vue
<script setup lang="ts">
import { calculateSectionScore, calculateOverallScore, getIssues, getRating } from '~/composables/useFengShui'
import { sectionMinMax } from '~/data/checks'
import { directionModifiers } from '~/data/directions'
import type { StepKey, Report } from '~/types/fengshui'

const { sharedState } = useReport()
const { t } = useI18n()

useSeoMeta({ title: t('report.title') })

const SECTION_WEIGHTS: Record<StepKey, number> = {
  external: 0.35, entrance: 0.15, livingRoom: 0.15,
  kitchen: 0.15, bedroom: 0.15, bathroom: 0.05,
}

const report = computed<Report | null>(() => {
  const state = sharedState.value
  if (!state) return null

  const direction = state.facingDirection ?? 'N'
  const stepKeys = Object.keys(SECTION_WEIGHTS) as StepKey[]

  const sectionScores = Object.fromEntries(
    stepKeys.map(key => {
      if (key === 'bedroom' || key === 'bathroom') {
        const rooms = state.rooms[key]
        if (rooms.length === 0) {
          return [key, calculateSectionScore(key, {}, directionModifiers, direction)]
        }
        const avg = rooms.reduce((sum, room) =>
          sum + calculateSectionScore(key, room.answers, directionModifiers, direction), 0
        ) / rooms.length
        return [key, Math.round(avg * 100) / 100]
      }
      return [key, calculateSectionScore(key, state.answers, directionModifiers, direction)]
    })
  ) as Record<StepKey, number>

  const overallScore = calculateOverallScore(sectionScores)

  const getRatingFn = (score: number) => {
    if (score >= 90) return { label: t('ratings.excellent'), color: 'emerald' as const }
    if (score >= 70) return { label: t('ratings.good'),      color: 'emerald' as const }
    if (score >= 50) return { label: t('ratings.fair'),      color: 'yellow' as const  }
    if (score >= 30) return { label: t('ratings.poor'),      color: 'orange' as const  }
    return               { label: t('ratings.bad'),          color: 'red' as const     }
  }

  const allIssues = [
    ...(['external', 'entrance', 'livingRoom', 'kitchen'] as StepKey[]).flatMap(key =>
      getIssues(key, state.answers, t)
    ),
    ...state.rooms.bedroom.flatMap(room =>
      getIssues('bedroom', room.answers, t, t('wizard.masterBedroom'))
    ),
    ...state.rooms.bathroom.flatMap((room, idx) =>
      getIssues('bathroom', room.answers, t, t('wizard.bathroomN', { n: idx + 1 }))
    ),
  ]

  return {
    overallScore,
    rating: getRatingFn(overallScore),
    sectionScores: stepKeys.map(key => ({
      stepKey: key,
      label: t(`sectionLabels.${key}`),
      score: sectionScores[key],
      weight: SECTION_WEIGHTS[key],
    })),
    issues: allIssues,
  }
})
</script>

<template>
  <UContainer class="py-6 max-w-xl">
    <div v-if="!sharedState" class="text-center py-12">
      <UIcon name="i-lucide-link-2-off" class="size-12 text-muted mx-auto mb-3" />
      <p class="text-muted">Invalid or missing report link.</p>
      <UButton class="mt-4" to="/">Start a new inspection</UButton>
    </div>

    <div v-else-if="report">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-semibold">{{ $t('report.title') }}</h1>
        <UBadge color="neutral" variant="subtle">{{ $t('report.readOnly') }}</UBadge>
      </div>

      <ReportOverall :report="report" />
      <ReportBreakdown :report="report" />
      <ReportIssues :report="report" />

      <UButton class="mt-4" variant="outline" to="/">
        {{ $t('report.startOver') }}
      </UButton>
    </div>
  </UContainer>
</template>
```

- [ ] **Step 2: Export `getRating` from useFengShui.ts**

In `composables/useFengShui.ts`, change `function getRating` from a private function to an exported one:

```typescript
// Change this line:
function getRating(score: number, t: (key: string) => string): Rating {

// To:
export function getRating(score: number, t: (key: string) => string): Rating {
```

- [ ] **Step 3: Update nuxt.config.ts**

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },
  routeRules: {
    '/':       { prerender: true },
    '/report': { prerender: true },
  },
  modules: ['@nuxt/ui', '@nuxtjs/i18n'],
  css: ['~/assets/css/main.css'],
  i18n: {
    defaultLocale: 'zh-CN',
    locales: [
      { code: 'zh-CN', name: '简体中文', file: 'zh-CN.json' },
      { code: 'en',    name: 'English',  file: 'en.json'    },
    ],
    detectBrowserLanguage: false,
  },
})
```

- [ ] **Step 4: Add .superpowers to .gitignore**

```bash
echo '.superpowers/' >> /home/luojh/workplace/fengshui/.gitignore
```

- [ ] **Step 5: Run dev server and test shareable report**

```bash
pnpm dev
```

1. Complete the wizard, click "Share Report" — confirm toast shows "Link copied"
2. Paste the URL in a new browser tab — confirm the report renders correctly and read-only
3. Visit `/report` with no `?d=` param — confirm the "invalid link" message shows

- [ ] **Step 6: Run all tests one final time**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add pages/report/index.vue nuxt.config.ts composables/useFengShui.ts .gitignore
git commit -m "feat: shareable report page with URL-encoded state, complete rewrite"
```

---

## Self-Review Checklist

- [x] **Types**: All types in `types/fengshui.ts` — `Direction`, `StepKey`, `WizardStep`, `Check`, `TranslatedCheck`, `DirectionModifier`, `WizardState`, `RoomResult`, `Report`, `Rating`, `SectionScore`, `Issue`
- [x] **Spec coverage**: Direction input (Task 9) ✓, external/sha/surroundings (Tasks 3,11) ✓, entrance/lr/kitchen (Task 11) ✓, bedroom/bathroom multi-room (Task 12) ✓, scoring weights 35/15/15/15/15/5 (Task 5) ✓, direction modifiers (Tasks 3,5) ✓, report with overall+breakdown+issues (Task 13) ✓, share via URL (Tasks 7,14,15) ✓, shareable read-only page (Task 15) ✓, i18n EN+ZH (Task 4) ✓, Start Over (Task 14) ✓
- [x] **Type consistency**: `translateChecks` in Task 5 returns `TranslatedCheck[]`; `WizardCheck` in Task 10 accepts `TranslatedCheck`; `getIssues` returns `Issue[]`; `Report` uses `SectionScore[]` and `Issue[]` throughout — all consistent
- [x] **Section weights sum**: 0.35+0.15+0.15+0.15+0.15+0.05 = 1.0 ✓
- [x] **No placeholders**: All code blocks are complete
- [x] **Old files deleted**: `data/fengShui.ts`, `FengShuiHeader.vue`, `FengShuiOptions.vue`, `FengShuiScore.vue`
