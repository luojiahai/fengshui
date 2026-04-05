<script setup lang="ts">
import { Analytics } from "@vercel/analytics/nuxt"
import { SpeedInsights } from "@vercel/speed-insights/nuxt"

const { t, locale, setLocale } = useI18n()

useSeoMeta({
  title: t("title"),
  description: t("description"),
})
</script>

<template>
  <UApp>
    <Analytics />
    <SpeedInsights />

    <!-- Header bar -->
    <div class="border-b border-default">
      <UContainer class="max-w-xl py-3 flex items-center justify-between">
        <span class="font-semibold text-primary">{{ $t('title') }}</span>
        <div class="flex items-center gap-1">
          <UButton
            size="xs"
            :color="locale === 'zh-CN' ? 'primary' : 'neutral'"
            variant="ghost"
            @click="setLocale('zh-CN')"
          >
            中文
          </UButton>
          <UButton
            size="xs"
            :color="locale === 'en' ? 'primary' : 'neutral'"
            variant="ghost"
            @click="setLocale('en')"
          >
            EN
          </UButton>
          <UColorModeButton />
          <UButton
            color="neutral"
            variant="ghost"
            size="xs"
            to="https://github.com/idlegram/fengshui"
            target="_blank"
            icon="i-simple-icons-github"
            aria-label="GitHub"
          />
        </div>
      </UContainer>
    </div>

    <UMain>
      <NuxtPage />
    </UMain>

    <USeparator class="py-2" />

    <UFooter>
      <template #left>
        <p class="text-muted text-sm">
          Copyright © {{ new Date().getFullYear() }}
          <span class="font-semibold text-primary">{{ $t("idlegram") }}</span>
          by
          <a href="https://luojiahai.com" target="_blank" class="underline">luojiahai</a>
        </p>
      </template>
    </UFooter>
  </UApp>
</template>
