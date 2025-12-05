<script setup lang="ts">
import {
  fengShuiCategoryItems,
  fengShuiItems,
  type FengShuiItem,
} from "~/data/fengShui";

const { locale, setLocale } = useI18n();
const { t } = useI18n();

const selectedItems = ref<string[]>([]);

const itemMap = computed(() => {
  const map = new Map<string, FengShuiItem>();
  fengShuiItems.forEach((item) => map.set(item.id, item));
  return map;
});

const categories = computed(() =>
  Object.keys(fengShuiCategoryItems).map((categoryKey) =>
    t(`fengShuiCategories.${categoryKey}`)
  )
);

const itemsByCategory = computed(() => {
  const map = new Map<string, FengShuiItem[]>();
  Object.entries(fengShuiCategoryItems).forEach(([categoryKey, items]) => {
    map.set(t(`fengShuiCategories.${categoryKey}`), items);
  });
  return map;
});

const totalScore = computed(() => {
  const netScore = selectedItems.value.reduce(
    (sum, itemId) => sum + (itemMap.value.get(itemId)?.score ?? 0),
    50
  );
  return Math.max(0, Math.min(100, netScore));
});

const scoreRating = computed(() => {
  const score = totalScore.value;
  return (
    [
      { threshold: 90, labelKey: "excellentFengShui", color: "emerald" },
      { threshold: 70, labelKey: "goodFengShui", color: "emerald" },
      { threshold: 50, labelKey: "fairFengShui", color: "yellow" },
      { threshold: 30, labelKey: "poorFengShui", color: "orange" },
    ].find((r) => score >= r.threshold) || {
      labelKey: "badFengShui",
      color: "red",
    }
  );
});

const selectedItemsWithAdvice = computed(() =>
  selectedItems.value
    .map((itemId) => itemMap.value.get(itemId))
    .filter((item) => {
      if (!item?.adviceKey) return false;
      const advice = t(item.adviceKey);
      return advice && advice !== item.adviceKey;
    })
    .sort((a, b) => (b?.score || 0) - (a?.score || 0))
);
</script>

<template>
  <UContainer class="">
    <!-- 标题 -->
    <div class="py-6">
      <h1 class="text-3xl font-bold mb-4">{{ $t("description") }}</h1>
      <p class="text-gray-500 mb-4">{{ $t("disclaimer") }}</p>
      <div class="flex items-center" orientation="horizontal">
        <UButton
          class=""
          :color="locale === 'zh-CN' ? 'primary' : 'neutral'"
          variant="outline"
          @click="setLocale('zh-CN')"
        >
          简体中文
        </UButton>
        <UButton
          class=""
          :color="locale === 'en' ? 'primary' : 'neutral'"
          variant="outline"
          @click="setLocale('en')"
        >
          English
        </UButton>
        <UColorModeButton class="ml-2" />
        <UTooltip text="source" :kbds="['meta', 'G']">
          <UButton
            color="neutral"
            variant="ghost"
            to="https://github.com/luojiahai/fengshui"
            target="_blank"
            icon="i-simple-icons-github"
            aria-label="GitHub"
          />
        </UTooltip>
      </div>
    </div>

    <!-- 风水选项 -->
    <div v-for="category in categories" :key="category">
      <UCard
        class="mb-4"
        variant="subtle"
        :ui="{
          body: 'p-4 sm:p-4',
        }"
      >
        <h2 class="font-semibold pb-4">
          {{ category }}
        </h2>
        <UCheckboxGroup
          color="primary"
          variant="card"
          orientation="horizontal"
          indicator="start"
          :ui="{
            fieldset: 'grid grid-cols-1 sm:grid-cols-2 gap-1',
            item: 'bg-elevated',
          }"
          v-model="selectedItems"
          value-key="id"
          :items="
            (itemsByCategory.get(category) || []).map((item: FengShuiItem) => ({
              ...item,
              label: t(item.labelKey),
            }))
          "
        />
      </UCard>
    </div>

    <!-- 评分 -->
    <UCard
      class="mb-4"
      variant="subtle"
      :ui="{
        body: 'p-4 sm:p-4',
      }"
    >
      <h2 class="font-semibold pb-4">{{ $t("score") }}</h2>
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span
            class="text-lg font-semibold"
            :class="{
              'text-emerald-500': scoreRating.color === 'emerald',
              'text-yellow-500': scoreRating.color === 'yellow',
              'text-orange-500': scoreRating.color === 'orange',
              'text-red-500': scoreRating.color === 'red',
            }"
            >{{ totalScore }}</span
          >
          <div class="flex items-center gap-2">
            <span
              class="font-semibold"
              :class="{
                'text-emerald-500': scoreRating.color === 'emerald',
                'text-yellow-500': scoreRating.color === 'yellow',
                'text-orange-500': scoreRating.color === 'orange',
                'text-red-500': scoreRating.color === 'red',
              }"
            >
              {{ $t(scoreRating.labelKey) }}
            </span>
          </div>
        </div>
      </div>
    </UCard>

    <!-- 建议 -->
    <UCard
      class="mb-4"
      variant="subtle"
      :ui="{
        body: 'p-4 sm:p-4',
      }"
    >
      <h2 class="font-semibold pb-4">{{ $t("suggestions") }}</h2>
      <div v-if="selectedItemsWithAdvice.length === 0" class="text-gray-500">
        {{ $t("noSuggestions") }}
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="item in selectedItemsWithAdvice"
          :key="item?.id"
          class="border-l-4 border-primary pl-4"
        >
          <p class="font-semibold">
            {{ item && t(item.labelKey) }}
          </p>
          <p class="text-gray-400">
            {{ item?.adviceKey ? t(item.adviceKey) : "" }}
          </p>
        </div>
      </div>
    </UCard>
  </UContainer>
</template>
