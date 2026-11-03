<script setup lang="ts">
const { apiBase } = useRuntimeConfig().public
const { locale, t } = useLocale()
const api = useApi()

useSeoMeta({ title: 'PokéWishlist' })

const { data: pokemon } = await useFetch<PokemonSummary[]>('/api/pokemon', {
  default: () => [],
})
// browser-only: a prerendered page would otherwise freeze the wishlist at build time
const { data: wishlist } = await useFetch<number[]>('/wishlist', {
  baseURL: apiBase,
  default: () => [],
  server: false,
})
const wishlistError = ref('')

const search = ref('')

const wishlistPokemon = computed<WishlistItem[]>(() =>
  wishlist.value
    .map((id) => pokemon.value.find((p) => p.id === id))
    .filter((p) => p !== undefined),
)

const filteredPokemon = computed(() =>
  pokemon.value
    .filter((p) =>
      normalize(p.name[locale.value]).includes(normalize(search.value)),
    )
    .filter((p) => !wishlist.value.includes(p.id)),
)

async function updateWishlist(request: () => Promise<number[]>) {
  try {
    wishlist.value = await request()
    wishlistError.value = ''
  } catch (e) {
    wishlistError.value = (e as Error).message
  }
}

function add(item: WishlistItem) {
  try {
    addPokemon(wishlistPokemon.value, item)
  } catch (e) {
    const reason = (e as Error).message as 'duplicate' | 'full'
    wishlistError.value = t(reason, { max: MAX_WISHLIST })
    return
  }
  updateWishlist(() =>
    api('/wishlist', { method: 'POST', body: { id: item.id } }),
  )
}

function remove(id: number) {
  updateWishlist(() => api(`/wishlist/${id}`, { method: 'DELETE' }))
}
</script>
<template>
  <div class="flex gap-16 p-4">
    <div class="flex flex-col gap-4">
      <input
        v-model="search"
        :placeholder="t('search')"
        class="outline-1"
        data-testid="search"
      />
      <ul>
        <li v-for="p in filteredPokemon" :key="p.id" data-testid="result">
          <NuxtLink :to="`/pokemon/${p.slug}`" class="underline">
            {{ p.name[locale] }}
          </NuxtLink>
          <button class="cursor-pointer bg-green-500 underline" @click="add(p)">
            {{ t('add') }}
          </button>
        </li>
      </ul>
    </div>
    <div data-testid="wishlist">
      <h2 class="uppercase">{{ t('wishlist') }}</h2>
      <p v-if="wishlistError" class="text-red-500" data-testid="error">
        {{ wishlistError }}
      </p>
      <ul>
        <li v-for="p in wishlistPokemon" :key="p.id">
          {{ p.name[locale] }}
          <button
            class="cursor-pointer bg-red-500 underline"
            @click="remove(p.id)"
          >
            {{ t('remove') }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
