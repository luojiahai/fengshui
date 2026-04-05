# Feng Shui App Rewrite — Design Spec
**Date:** 2026-04-05
**Status:** Approved

---

## Overview

Full rewrite of the existing Feng Shui Calculator (Nuxt 3 + Vue 3) from a simple checkbox scorer into a practical, guided house inspection tool. The rewrite keeps the same tech stack but redesigns everything: UX, data model, scoring engine, and output.

**Target users:** Homebuyers/renters evaluating a property, and curious users assessing their current home. No feng shui expertise required.

**Core value:** Walk through a property room by room, get a scored feng shui report with specific issues and actionable remedies, then share it.

---

## Wizard Flow

An 8-step guided wizard. Each step occupies the full screen with a progress bar at the top. Users can navigate back freely at any time. Moving forward requires:
- **Step 1 (Facing Direction):** must select a direction — it drives the rest of the analysis
- **All other steps:** optional — user can proceed without selecting anything (accommodates houses that lack a separate kitchen, studios with no dedicated living room, etc.)

```
Step 1: Facing Direction     → 8-point compass rose picker
Step 2: External Environment → sha formations, celestial guardians, surroundings
Step 3: Main Entrance        → what the door faces, alignment issues
Step 4: Living Room          → position in house, sofa backing, light
Step 5: Kitchen              → stove/sink relationship, backing, bathroom adjacency
Step 6: Bedroom(s)           → bed direction, wall support, door/mirror — expandable
Step 7: Bathroom(s)          → position in house, door alignment — expandable
Step 8: Report               → full scored report with remedies and share button
```

**Multi-room support (Steps 6 & 7):** Each step shows one room by default. An "+ Add Bedroom" / "+ Add Bathroom" button lets users assess additional rooms. The report shows per-room scores. The overall score averages across all added rooms of that type.

**Facing direction (Step 1):** Does not have its own score. Instead, modifies the scoring weight of direction-sensitive checks in later steps (e.g., south-facing house gets a higher bonus for water features in front).

---

## Data Model

### Check

Each question in the wizard is a `Check`:

```typescript
type Direction = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'

type CheckOption = {
  id: string
  label: string       // "Road / corridor pointing at door"
  score: number       // negative = bad feng shui, positive = good
  remedy?: string     // shown in report if this option is selected and score < 0
}

type Check = {
  id: string
  question: string    // "Does anything point directly at your front door?"
  info?: string       // tooltip explanation of the feng shui principle
  multiSelect: boolean
  options: CheckOption[]
}

type DirectionModifier = {
  checkId: string
  direction: Direction
  scoreMultiplier: number  // e.g. 1.5 = effect is 50% stronger for this direction
}
```

### Wizard State

```typescript
type RoomResult = {
  roomId: string        // e.g. "bedroom-1", "bedroom-2"
  label: string         // "Master Bedroom", "Bedroom 2"
  answers: Map<string, string[]>  // checkId → selected option IDs
}

type WizardState = {
  facingDirection: Direction | null
  answers: Map<string, string[]>          // non-room steps
  rooms: Map<'bedroom' | 'bathroom', RoomResult[]>
}
```

---

## Scoring

### Per-section scores

Each section's raw score is the sum of scores for all selected options, normalized to 0–100 using the section's min/max possible scores.

### Overall score

Weighted average of section scores:

| Section              | Weight |
|----------------------|--------|
| External Environment | 35%    |
| Entrance             | 15%    |
| Living Room          | 15%    |
| Kitchen              | 15%    |
| Bedroom(s)           | 15%    |
| Bathroom(s)          | 5%     |

**Rationale:** External features (sha formations, surroundings) are structural and cannot be remedied, so they carry the most weight. Interior issues have feng shui remedies and are weighted lower.

Bedroom and bathroom scores are the average across all rooms added by the user.

### Direction modifiers

After per-option scores are summed, direction-sensitive checks apply their multiplier based on the house's facing direction. Multipliers are defined in `data/directions.ts` and applied during score calculation, not stored on the check itself.

### Rating thresholds

| Score   | Label                                     |
|---------|-------------------------------------------|
| 90–100  | Excellent Feng Shui (Prosperous Home)     |
| 70–89   | Good Feng Shui (Steady Progress)          |
| 50–69   | Fair Feng Shui (Needs Improvement)        |
| 30–49   | Poor Feng Shui (Layout Adjustment Needed) |
| 0–29    | Bad Feng Shui (Major Remediation Needed)  |

---

## Report (Step 8)

Rendered as a full-screen view with:

1. **Overall score** — large number, progress bar, rating label and color
2. **Section breakdown** — list of all sections with their individual scores and a ✓/⚠ indicator
3. **Issues found** — only sections/rooms scoring below 50 are expanded; each issue shows:
   - The question/check that was flagged
   - The selected bad option label
   - The remedy text
4. **Actions:**
   - **Share Report** — encodes full wizard state as base64 JSON into a URL query param, copies the shareable URL to clipboard (`/report?d=<base64>`)
   - **Start Over** — resets wizard state

### Shareable report page

`pages/report/index.vue` decodes the URL parameter, renders the same report component in read-only mode. No backend or database required — all state is in the URL.

**Serialization:** `WizardState` uses `Map` internally for ergonomics, but `useReport.ts` converts all Maps to plain objects before JSON-encoding into the URL parameter, and back to Maps on decode.

---

## File Structure

```
pages/
  index.vue                 ← wizard entry point, step routing
  report/
    index.vue               ← shareable report (reads from URL query)

components/
  wizard/
    WizardProgress.vue      ← step progress bar
    WizardNav.vue           ← back/next navigation
    StepDirection.vue       ← compass rose picker
    StepExternal.vue
    StepEntrance.vue
    StepLivingRoom.vue
    StepKitchen.vue
    StepBedroom.vue         ← includes "+ Add Bedroom" multi-room logic
    StepBathroom.vue        ← includes "+ Add Bathroom" multi-room logic
    StepReport.vue          ← final report
  report/
    ReportOverall.vue       ← score + rating
    ReportBreakdown.vue     ← per-section scores
    ReportIssues.vue        ← issues + remedies list

composables/
  useWizard.ts              ← step navigation, progress, back/forward
  useFengShui.ts            ← scoring engine: per-section, direction modifiers, overall
  useReport.ts              ← report state serialization, URL encoding/decoding, share

data/
  checks.ts                 ← all checks organized by step, with options and remedies
  directions.ts             ← DirectionModifier[] table

types/
  fengshui.ts               ← all shared types (Check, CheckOption, WizardState, etc.)
```

---

## i18n

Keep existing English + Simplified Chinese support via `@nuxtjs/i18n`. All question text, option labels, info tooltips, and remedy strings are i18n keys. The compass direction labels are also translated.

---

## What Is Removed

- Flat single-page checkbox layout
- Undifferentiated scoring (all items same weight)
- No remedies
- No sharing
- No direction awareness
- No per-room analysis

---

## Out of Scope

- User accounts or saved history
- Kua number / personalized direction analysis
- Photo capture
- PDF export (share via URL is sufficient for v1)
- Backend / API
