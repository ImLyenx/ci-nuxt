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
  hooks: {
    // nuxt generate prerenders a page per pokemon; slugs come from pokeapi.
    // nuxt build stays SSR
    async 'nitro:config'(nitroConfig) {
      if (nitroConfig.dev || !nitroConfig.static) return

      const res = await fetch('https://graphql.pokeapi.co/v1beta2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '{ pokemonspecies { name } }' }),
      })
      const { data } = (await res.json()) as {
        data: { pokemonspecies: { name: string }[] }
      }

      nitroConfig.prerender ??= {}
      nitroConfig.prerender.routes = [
        ...(nitroConfig.prerender.routes ?? []),
        ...data.pokemonspecies.map((s) => `/pokemon/${s.name}`),
      ]
    },
  },
})
