<script setup lang="ts">
import { calculateSectionScore, calculateOverallScore, getIssues, getRating, SECTION_WEIGHTS } from '~/composables/useFengShui'
import { directionModifiers } from '~/data/directions'
import type { StepKey, Report } from '~/types/fengshui'

const { sharedState } = useReport()
const { t } = useI18n()

useSeoMeta({ title: () => t('report.title') })

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

  const allIssues = [
    ...(['external', 'entrance', 'livingRoom', 'kitchen'] as StepKey[]).flatMap(key =>
      getIssues(key, state.answers, t)
    ),
    ...state.rooms.bedroom.flatMap((room, idx) =>
      getIssues('bedroom', room.answers, t, idx === 0 ? t('wizard.masterBedroom') : t('wizard.bedroomN', { n: idx + 1 }))
    ),
    ...state.rooms.bathroom.flatMap((room, idx) =>
      getIssues('bathroom', room.answers, t, t('wizard.bathroomN', { n: idx + 1 }))
    ),
  ]

  return {
    overallScore,
    rating: getRating(overallScore, t),
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
      <p class="text-muted">{{ $t('report.invalidLink') }}</p>
      <UButton class="mt-4" to="/">{{ $t('report.startOver') }}</UButton>
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

    <div v-else class="text-center py-12">
      <UIcon name="i-lucide-loader" class="size-12 text-muted mx-auto mb-3" />
      <p class="text-muted">{{ $t('report.invalidLink') }}</p>
    </div>
  </UContainer>
</template>
