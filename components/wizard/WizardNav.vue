<script setup lang="ts">
defineProps<{
  canGoBack: boolean
  canGoNext: boolean
  isLastContentStep: boolean
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
      @click="canGoNext && $emit('next')"
    >
      {{ isLastContentStep ? $t('wizard.viewReport') : $t('wizard.next') }}
    </UButton>
  </div>
</template>
