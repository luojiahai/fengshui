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
