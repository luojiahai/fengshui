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
