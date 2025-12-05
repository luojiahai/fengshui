<script setup lang="ts">
import { zh_cn, en } from "@nuxt/ui/locale";

const { locale, setLocale } = useI18n();
</script>

<template>
  <UApp>
    <UHeader title="" :toggle="false">
      <template #right>
        <ULocaleSelect
          :model-value="locale"
          :locales="[zh_cn, en]"
          @update:model-value="setLocale($event as 'en' | 'zh-CN')"
        />
        <UColorModeButton />
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
      </template>
    </UHeader>

    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>

    <USeparator class="py-2" />

    <UFooter>
      <template #left>
        <p class="text-muted text-sm">
          Copyright © {{ new Date().getFullYear() }}
          <a href="https://luojiahai.com" target="_blank" class="underline"
            >luojiahai</a
          >
        </p>
      </template>
    </UFooter>
  </UApp>
</template>
