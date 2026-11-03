// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: ['@nuxt/eslint'],
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      // override with NUXT_PUBLIC_API_BASE
      apiBase: 'http://localhost:3001',
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
