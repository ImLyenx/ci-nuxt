<script setup lang="ts">
const route = useRoute()
const { locale, t } = useLocale()
const api = useApi()

const { data: pokemon } = await useFetch<Pokemon>(
  () => `/api/pokemon/${encodeURIComponent(String(route.params.name))}`,
)

if (!pokemon.value && import.meta.server) {
  setResponseStatus(useRequestEvent()!, 404)
}

useSeoMeta({
  title: () =>
    pokemon.value ? `${pokemon.value.name[locale.value]} | PokéWishlist` : '',
  description: () =>
    pokemon.value
      ? t('description', {
          name: pokemon.value.name[locale.value],
          category: pokemon.value.category[locale.value],
        })
      : '',
})

const statLabels: Record<keyof Pokemon['stats'], MessageKey> = {
  hp: 'hp',
  attack: 'attack',
  defense: 'defense',
  'special-attack': 'specialAttack',
  'special-defense': 'specialDefense',
  speed: 'speed',
}

const format = (n: number) => n.toLocaleString(locale.value)

const { apiBase } = useRuntimeConfig().public

// browser-only: the page is prerendered, the count must be live
const visitor = import.meta.client ? useVisitorId() : ''

type Likes = { likes: number; liked: boolean }
const { data: likes } = useFetch<Likes>(() => `/likes/${pokemon.value?.id}`, {
  baseURL: apiBase,
  query: { visitor },
  server: false,
  immediate: !!pokemon.value,
})
const likeError = ref('')

// like, or unlike if this visitor already liked it
async function toggleLike() {
  const url = `/likes/${pokemon.value!.id}`
  try {
    likes.value = likes.value?.liked
      ? await api<Likes>(url, { method: 'DELETE', query: { visitor } })
      : await api<Likes>(url, { method: 'POST', body: { visitor } })
    likeError.value = ''
  } catch (e) {
    likeError.value = (e as Error).message
  }
}
</script>
<template>
  <div class="flex flex-col gap-4 p-4">
    <NuxtLink to="/" class="underline">{{ t('back') }}</NuxtLink>

    <p v-if="!pokemon" class="text-red-500">
      {{ t('notFound', { name: String(route.params.name) }) }}
    </p>

    <template v-else>
      <h1 class="text-2xl">
        #{{ pokemon.id }} {{ pokemon.name[locale] }}
        <span v-if="locale !== 'en'" class="text-gray-500">
          ({{ pokemon.name.en }})
        </span>
      </h1>
      <p>{{ pokemon.category[locale] }}</p>

      <div class="flex items-center gap-2">
        <button
          class="cursor-pointer rounded border px-2 disabled:cursor-default"
          :class="{ 'bg-pink-100': likes?.liked }"
          :disabled="!likes"
          :title="likes?.liked ? t('unlike') : undefined"
          data-testid="like"
          @click="toggleLike"
        >
          {{ likes?.liked ? `♥ ${t('liked')}` : `♡ ${t('like')}` }}
        </button>
        <span v-if="likes" data-testid="likes">{{ format(likes.likes) }}</span>
        <span v-if="likeError" class="text-red-500">{{ likeError }}</span>
      </div>

      <div class="flex gap-2">
        <span
          v-for="type in pokemon.types"
          :key="type.en"
          class="rounded border px-2 text-sm"
        >
          {{ type[locale] }}
        </span>
      </div>

      <img
        v-if="pokemon.sprite"
        :src="pokemon.sprite"
        :alt="pokemon.name[locale]"
        class="h-48 w-48 [image-rendering:pixelated]"
      />

      <p>{{ t('height', { value: format(pokemon.height) }) }}</p>
      <p>{{ t('weight', { value: format(pokemon.weight) }) }}</p>

      <table class="w-fit">
        <tr v-for="(label, key) in statLabels" :key="key">
          <td class="pr-4">{{ t(label) }}</td>
          <td>{{ pokemon.stats[key] }}</td>
        </tr>
      </table>
    </template>
  </div>
</template>
