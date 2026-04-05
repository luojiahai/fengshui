<script setup lang="ts">
import { stepChecks } from '~/data/checks'
import { translateChecks } from '~/composables/useFengShui'

const { t } = useI18n()
const { state, setRoomAnswer, addRoom, removeRoom } = useWizard()

const translatedChecks = computed(() => translateChecks(stepChecks.bathroom, t))

const rooms = computed(() => state.value.rooms.bathroom)

function roomLabel(idx: number) {
  return t('wizard.bathroomN', { n: idx + 1 })
}
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold mb-6">{{ $t('steps.bathroom') }}</h2>

    <div v-for="(room, idx) in rooms" :key="room.roomId" class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-primary">{{ roomLabel(idx) }}</h3>
        <UButton
          v-if="idx > 0"
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-trash-2"
          @click="removeRoom('bathroom', room.roomId)"
        />
      </div>

      <WizardCheck
        v-for="check in translatedChecks"
        :key="check.id"
        :check="check"
        :model-value="room.answers[check.id] ?? []"
        @update:model-value="setRoomAnswer('bathroom', room.roomId, check.id, $event)"
      />

      <USeparator v-if="idx < rooms.length - 1" class="my-4" />
    </div>

    <UButton
      color="neutral"
      variant="outline"
      icon="i-lucide-plus"
      @click="addRoom('bathroom')"
    >
      {{ $t('wizard.addBathroom') }}
    </UButton>
  </div>
</template>
