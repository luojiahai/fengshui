// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  routeRules: {
    '/':       { prerender: true },
    '/report': { prerender: true },
  },
  modules: ["@nuxt/ui", "@nuxtjs/i18n"],
  css: ["~/assets/css/main.css"],
  i18n: {
    defaultLocale: "zh-CN",
    locales: [
      { code: "zh-CN", name: "简体中文", file: "zh-CN.json" },
      { code: "en", name: "English", file: "en.json" },
    ],
    detectBrowserLanguage: false,
  },
});
