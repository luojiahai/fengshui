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
