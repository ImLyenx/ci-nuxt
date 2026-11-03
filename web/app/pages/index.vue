<script setup lang="ts">
const { apiBase } = useRuntimeConfig().public

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

const filteredPokemon = computed(() =>
  pokemon.value
    .filter((p) => normalize(p.name.fr).includes(normalize(search.value)))
    .filter((p) => !wishlistPokemon.value.includes(p)),
)

const wishlistPokemon = computed(() =>
  wishlist.value
    .map((id) => pokemon.value.find((p) => p.id === id))
    .filter((p) => p !== undefined),
)

// the API returns the updated wishlist, or { error } when it refuses
async function updateWishlist(request: Promise<number[]>) {
  try {
    wishlist.value = await request
    wishlistError.value = ''
  } catch (e) {
    const data = (e as { data?: { error?: string } }).data
    wishlistError.value = data?.error ?? 'API unreachable'
  }
}

function addPokemon(id: number) {
  updateWishlist(
    $fetch('/wishlist', { baseURL: apiBase, method: 'POST', body: { id } }),
  )
}

function removePokemon(id: number) {
  updateWishlist(
    $fetch(`/wishlist/${id}`, { baseURL: apiBase, method: 'DELETE' }),
  )
}
</script>
<template>
  <div class="flex p-4 font-serif gap-16">
    <div class="flex flex-col gap-4">
      <input v-model="search" placeholder="rechercher..." class="outline-1" />
      <ul>
        <li v-for="p in filteredPokemon" :key="p.id">
          <NuxtLink :to="`/pokemon/${p.slug}`" class="underline">
            {{ p.name.fr }}
          </NuxtLink>
          <button
            @click="addPokemon(p.id)"
            class="cursor-pointer underline bg-green-500"
          >
            Add
          </button>
        </li>
      </ul>
    </div>
    <ul>
      WISHLIST
      <p v-if="wishlistError" class="text-red-500">{{ wishlistError }}</p>
      <li v-for="p in wishlistPokemon" :key="p.id">
        {{ p.name.fr }}
        <button
          class="cursor-pointer underline bg-red-500"
          @click="removePokemon(p.id)"
        >
          Remove
        </button>
      </li>
    </ul>
  </div>
</template>
