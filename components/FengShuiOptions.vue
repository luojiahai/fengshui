<script setup lang="ts">
import { fengShuiItems } from "~/data/fengShui";
import type { FengShuiCategory } from "~/types/fengshui";

const { t } = useI18n();
const { state } = useFengShui();

const categories = computed<FengShuiCategory[]>(() => {
  const items = fengShuiItems.map((item) => ({
    ...item,
    title: t(item.title),
    info: t(item.info),
    options: item.options.map((option) => ({
      ...option,
      label: t(option.label),
      description: option.description ? t(option.description) : "",
    })),
  }));

  return [
    {
      title: t("externalEnvironment"),
      items: items.slice(0, 3),
    },
    {
      title: t("internalLayout"),
      items: items.slice(3),
    },
  ];
});

const checkboxModels = new Map(
  fengShuiItems.map((item) => [
    item.id,
    computed({
      get: () => state.value.selectedOptions.get(item.id) ?? [],
      set: (value: string[]) => {
        if (value.length > 0) {
          state.value.selectedOptions.set(item.id, value);
        } else {
          state.value.selectedOptions.delete(item.id);
        }
      },
    }),
  ])
);
</script>

<template>
  <UCard
    class="mb-3"
    variant="subtle"
    v-for="category in categories"
    :key="category.title"
  >
    <h1 class="text-lg font-semibold mb-4">{{ category.title }}</h1>
    <div
      class="not-last-of-type:mb-4"
      v-for="item in category.items"
      :key="item.id"
    >
      <div class="flex items-center gap-1 mb-1">
        <h2 class="font-semibold">{{ item.title }}</h2>
        <UPopover v-if="item.info" placement="top">
          <UIcon
            name="i-lucide-info"
            class="size-5 text-muted cursor-pointer"
          />
          <template #content>
            <div class="p-4 max-w-xs">
              <p>{{ item.info }}</p>
            </div>
          </template>
        </UPopover>
      </div>
      <UCheckboxGroup
        v-model="checkboxModels.get(item.id)!.value"
        color="primary"
        variant="card"
        orientation="vertical"
        indicator="start"
        :ui="{
          fieldset: 'grid grid-cols-1 sm:grid-cols-2 gap-1',
          item: 'bg-elevated',
        }"
        value-key="id"
        description-key="description"
        :items="item.options"
      />
    </div>
  </UCard>
</template>
