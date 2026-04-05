<script setup lang="ts">
import { stepChecks } from '~/data/checks'
import { translateChecks } from '~/composables/useFengShui'

const { t } = useI18n()
const { state, setAnswer } = useWizard()

const translatedChecks = computed(() => translateChecks(stepChecks.kitchen, t))
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold mb-6">{{ $t('steps.kitchen') }}</h2>
    <WizardCheck
      v-for="check in translatedChecks"
      :key="check.id"
      :check="check"
      :model-value="state.answers[check.id] ?? []"
      @update:model-value="setAnswer(check.id, $event)"
    />
  </div>
</template>
