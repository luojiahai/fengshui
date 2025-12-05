<script setup lang="ts">
import { fengShuiItemsData, type FengShuiItem } from "~/data/fengShui";

const { locale, setLocale } = useI18n();

const fengShuiItems = ref<FengShuiItem[]>(fengShuiItemsData);

type State = {
  selectedItems: string[];
};

const state = reactive<State>({
  selectedItems: [],
});

const { t } = useI18n();

const getItemLabel = (itemId: string) => {
  return t(`fengShui.${itemId}.label`);
};

const getItemAdvice = (itemId: string) => {
  return t(`fengShui.${itemId}.advice`);
};

const getCategoryName = (categoryKey: string) => {
  return t(`categories.${categoryKey}`);
};

const categories = computed(() => {
  const uniqueCategories = [
    ...new Set(fengShuiItems.value.map((item) => item.categoryKey)),
  ];
  return uniqueCategories;
});

const itemsByCategory = computed(() => {
  const grouped = new Map<string, FengShuiItem[]>();
  fengShuiItems.value.forEach((item) => {
    if (!grouped.has(item.categoryKey)) {
      grouped.set(item.categoryKey, []);
    }
    grouped.get(item.categoryKey)!.push(item);
  });
  return grouped;
});

const totalScore = computed(() => {
  const BASE_SCORE = 50;
  let positiveScore = 0;
  let negativeScore = 0;

  state.selectedItems.forEach((itemId) => {
    const item = fengShuiItems.value.find((i) => i.id === itemId);
    if (item) {
      if (item.score > 0) {
        positiveScore += item.score;
      } else {
        negativeScore += Math.abs(item.score);
      }
    }
  });

  const score = BASE_SCORE + positiveScore - negativeScore;
  return Math.max(0, Math.min(100, score));
});

const scoreBreakdown = computed(() => {
  let positiveScore = 0;
  let negativeScore = 0;

  state.selectedItems.forEach((itemId) => {
    const item = fengShuiItems.value.find((i) => i.id === itemId);
    if (item) {
      if (item.score > 0) {
        positiveScore += item.score;
      } else {
        negativeScore += Math.abs(item.score);
      }
    }
  });

  return { positiveScore, negativeScore };
});

const scoreRating = computed(() => {
  const score = totalScore.value;
  if (score >= 90) return { labelKey: "excellentFengShui", color: "emerald" };
  if (score >= 70) return { labelKey: "goodFengShui", color: "emerald" };
  if (score >= 50) return { labelKey: "fairFengShui", color: "yellow" };
  if (score >= 30) return { labelKey: "poorFengShui", color: "orange" };
  return { labelKey: "badFengShui", color: "red" };
});

const selectedItemsWithAdvice = computed(() => {
  return state.selectedItems
    .map((itemId) => fengShuiItems.value.find((i) => i.id === itemId))
    .filter((item) => {
      if (!item) return false;
      const advice = t(`fengShui.${item.id}.advice`);
      return advice && advice !== `fengShui.${item.id}.advice`;
    })
    .sort((a, b) => (b?.score || 0) - (a?.score || 0));
});
</script>

<template>
  <UContainer class="">
    <!-- 标题 -->
    <div class="py-6">
      <h1 class="text-3xl font-bold mb-4">{{ $t("description") }}</h1>
      <p class="text-sm text-gray-500 mb-4">{{ $t("disclaimer") }}</p>
      <div class="flex items-center" orientation="horizontal">
        <UButton
          class="rounded-none"
          :color="locale === 'zh-CN' ? 'primary' : 'neutral'"
          variant="outline"
          @click="setLocale('zh-CN')"
        >
          简体中文
        </UButton>
        <UButton
          class="rounded-none"
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
      <UCard class="mb-4 rounded-none" variant="subtle">
        <h2 class="font-semibold pb-4">{{ getCategoryName(category) }}</h2>
        <UCheckboxGroup
          color="primary"
          variant="table"
          orientation="horizontal"
          :ui="{
            fieldset: 'grid grid-cols-2 gap-1 space-x-0',
            item: 'first-of-type:rounded-none last-of-type:rounded-none',
          }"
          v-model="state.selectedItems"
          value-key="id"
          :items="
            (itemsByCategory.get(category) || []).map((item: FengShuiItem) => ({
              ...item,
              label: getItemLabel(item.id),
            }))
          "
        />
      </UCard>
    </div>

    <!-- 评分 -->
    <UCard class="mb-4 rounded-none" variant="subtle">
      <h2 class="font-semibold pb-4">{{ $t("score") }}</h2>
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span
            class="text-xl font-semibold"
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
    <UCard class="mb-4 rounded-none" variant="subtle">
      <h2 class="font-semibold pb-4">{{ $t("suggestions") }}</h2>
      <div v-if="selectedItemsWithAdvice.length === 0" class="text-gray-500">
        {{ $t("noSuggestions") }}
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="item in selectedItemsWithAdvice"
          :key="item?.id"
          class="border-l-4 border-primary-500 pl-4"
        >
          <p class="font-semibold">{{ getItemLabel(item?.id || "") }}</p>
          <p class="text-gray-400">
            {{ getItemAdvice(item?.id || "") }}
          </p>
        </div>
      </div>
    </UCard>
  </UContainer>
</template>
