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
