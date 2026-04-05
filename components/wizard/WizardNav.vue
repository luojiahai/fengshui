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
