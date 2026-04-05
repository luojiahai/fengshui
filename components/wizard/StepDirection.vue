<script setup lang="ts">
import type { Direction } from '~/types/fengshui'

const { state, setDirection } = useWizard()

type CompassCell = { dir: Direction; row: number; col: number }

const cells: CompassCell[] = [
  { dir: 'NW', row: 1, col: 1 }, { dir: 'N',  row: 1, col: 2 }, { dir: 'NE', row: 1, col: 3 },
  { dir: 'W',  row: 2, col: 1 },                                  { dir: 'E',  row: 2, col: 3 },
  { dir: 'SW', row: 3, col: 1 }, { dir: 'S',  row: 3, col: 2 }, { dir: 'SE', row: 3, col: 3 },
]
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold mb-2">{{ $t('wizard.directionPrompt') }}</h2>
    <p class="text-muted text-sm mb-6">{{ $t('wizard.directionHint') }}</p>

    <div
      class="grid gap-2 w-fit mx-auto"
      style="grid-template-columns: repeat(3, 72px); grid-template-rows: repeat(3, 72px);"
    >
      <!-- Center compass icon -->
      <div
        class="flex items-center justify-center"
        style="grid-row: 2; grid-column: 2;"
      >
        <UIcon name="i-lucide-compass" class="size-8 text-muted" />
      </div>

      <!-- Direction buttons -->
      <UButton
        v-for="cell in cells"
        :key="cell.dir"
        :style="{ gridRow: cell.row, gridColumn: cell.col }"
        :color="state.facingDirection === cell.dir ? 'primary' : 'neutral'"
        :variant="state.facingDirection === cell.dir ? 'solid' : 'outline'"
        class="h-full w-full flex-col gap-1 text-xs font-semibold"
        @click="setDirection(cell.dir)"
      >
        {{ $t(`directions.${cell.dir}`) }}
      </UButton>
    </div>
  </div>
</template>
