<script setup lang="ts">
import type { TranslatedCheck } from '~/types/fengshui'

const props = defineProps<{
  check: TranslatedCheck
  modelValue: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

// Nuxt UI UCheckboxGroup / URadioGroup use objects with 'value' key
const uiItems = computed(() =>
  props.check.options.map(opt => ({
    value: opt.id,
    label: opt.label,
  }))
)

// For single-select: v-model is a single string (radio), but we store as string[]
const radioValue = computed({
  get: () => props.modelValue[0] ?? '',
  set: (val: string) => emit('update:modelValue', val ? [val] : []),
})

// For multi-select
const checkboxValue = computed({
  get: () => props.modelValue,
  set: (val: string[]) => emit('update:modelValue', val),
})
</script>

<template>
  <div class="mb-6">
    <div class="flex items-center gap-1.5 mb-2">
      <h3 class="font-medium">{{ check.question }}</h3>
      <UPopover v-if="check.info" placement="top">
        <UIcon name="i-lucide-info" class="size-4 text-muted cursor-pointer shrink-0" />
        <template #content>
          <div class="p-3 max-w-xs text-sm">{{ check.info }}</div>
        </template>
      </UPopover>
    </div>

    <UCheckboxGroup
      v-if="check.multiSelect"
      v-model="checkboxValue"
      :items="uiItems"
      value-key="value"
      color="primary"
      variant="card"
      orientation="vertical"
      indicator="start"
      :ui="{ fieldset: 'gap-1.5', item: 'bg-elevated' }"
    />

    <URadioGroup
      v-else
      v-model="radioValue"
      :items="uiItems"
      value-key="value"
      color="primary"
      variant="card"
      orientation="vertical"
      indicator="start"
      :ui="{ fieldset: 'gap-1.5', item: 'bg-elevated' }"
    />
  </div>
</template>
