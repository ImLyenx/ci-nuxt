<script setup lang="ts">
const { locale, setLocale, t, cookie } = useLocale()

useHead({ htmlAttrs: { lang: locale } })

onMounted(() => {
  if (isLocale(cookie.value)) locale.value = cookie.value
})
</script>
<template>
  <div class="font-serif">
    <label class="flex justify-end gap-2 p-4">
      {{ t('language') }}
      <select
        :value="locale"
        class="outline-1"
        @change="
          setLocale(($event.target as HTMLSelectElement).value as Locale)
        "
      >
        <option v-for="l in LOCALES" :key="l" :value="l">
          {{ l.toUpperCase() }}
        </option>
      </select>
    </label>
    <NuxtPage />
  </div>
</template>
