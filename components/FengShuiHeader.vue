<script setup lang="ts">
const { locale, setLocale } = useI18n();
</script>

<template>
  <div class="my-6">
    <h1 v-if="locale === 'zh-CN'" class="text-3xl font-bold mb-3">
      这<span class="text-primary-400">风水</span>好不好
    </h1>
    <h1 v-else class="text-3xl font-bold mb-3">
      Is the <span class="text-primary-400">Feng Shui</span> good?
    </h1>
    <p class="text-gray-400 mb-3">{{ $t("disclaimer") }}</p>
    <div class="flex items-center">
      <UButton
        :color="locale === 'zh-CN' ? 'primary' : 'neutral'"
        variant="outline"
        @click="setLocale('zh-CN')"
      >
        简体中文
      </UButton>
      <UButton
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
          to="https://github.com/idlegram/fengshui"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
        />
      </UTooltip>
    </div>
  </div>
</template>
