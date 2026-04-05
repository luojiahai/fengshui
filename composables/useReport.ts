// composables/useReport.ts
import type { WizardState } from '~/types/fengshui'

// --- Pure functions (exported for testing) ---

export function encodeState(state: WizardState): string {
  const json = JSON.stringify(state)
  // TextEncoder-based approach works in browser and Node 18+
  return btoa(
    Array.from(new TextEncoder().encode(json), b => String.fromCharCode(b)).join('')
  )
}

export function decodeState(encoded: string): WizardState | null {
  try {
    const binary = atob(encoded)
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0))
    const json = new TextDecoder().decode(bytes)
    const parsed = JSON.parse(json)
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
