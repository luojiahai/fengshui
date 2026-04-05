<script setup lang="ts">
defineProps<{
  current: number   // 0-based index
  total: number
}>()
</script>

<template>
  <div class="mb-6">
    <div class="flex justify-between items-center mb-2">
      <span class="text-sm text-muted">
        {{ $t('wizard.stepOf', { current: current + 1, total }) }}
      </span>
      <span class="text-sm text-muted">{{ total > 1 ? Math.round((Math.min(current, total - 1) / (total - 1)) * 100) : 100 }}%</span>
    </div>
    <div class="w-full bg-elevated rounded-full h-1.5">
      <div
        class="bg-primary h-1.5 rounded-full transition-all duration-300"
        :style="{ width: `${total > 1 ? (Math.min(current, total - 1) / (total - 1)) * 100 : 100}%` }"
      />
    </div>
  </div>
</template>
