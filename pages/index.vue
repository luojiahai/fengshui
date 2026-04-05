<script setup lang="ts">
import { STEPS } from '~/composables/useWizard'

const { currentStep, currentStepIndex, totalSteps, canAdvance, goNext, goBack } = useWizard()

const stepComponents: Record<string, ReturnType<typeof resolveComponent>> = {
  direction:  resolveComponent('WizardStepDirection'),
  external:   resolveComponent('WizardStepExternal'),
  entrance:   resolveComponent('WizardStepEntrance'),
  livingRoom: resolveComponent('WizardStepLivingRoom'),
  kitchen:    resolveComponent('WizardStepKitchen'),
  bedroom:    resolveComponent('WizardStepBedroom'),
  bathroom:   resolveComponent('WizardStepBathroom'),
  report:     resolveComponent('WizardStepReport'),
}

const currentComponent = computed(() => stepComponents[currentStep.value])
const isLastContentStep = computed(() => currentStep.value === 'bathroom')
const showNav = computed(() => currentStep.value !== 'report')
</script>

<template>
  <UContainer class="py-6 max-w-xl">
    <WizardProgress :current="currentStepIndex" :total="totalSteps" />

    <component :is="currentComponent" />

    <WizardNav
      v-if="showNav"
      :can-go-back="currentStepIndex > 0"
      :can-go-next="canAdvance"
      :is-last-content-step="isLastContentStep"
      @back="goBack"
      @next="goNext"
    />
  </UContainer>
</template>
