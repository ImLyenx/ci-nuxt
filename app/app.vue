<script setup lang="ts">
type Pokemon = {
  pokedex_id: number
  name: { fr: string; en: string; jp: string }
}

const pokemon = useState<Pokemon[]>('pokemon')
const wishlist = useState<number[]>('wishlist', () => [])

onMounted(() => {
  const local = localStorage.getItem('pokeWishList')
  if (local) wishlist.value = local.split(',').map(Number)
})

watch(wishlist, (ids) => localStorage.setItem('pokeWishList', ids.join(',')), {
  deep: true,
})

await callOnce(async () => {
  pokemon.value = await $fetch('https://tyradex.app/api/v1/pokemon')
  pokemon.value = pokemon.value.slice(1)
})

const search = ref('')

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

const filteredPokemon = computed(() =>
  pokemon.value
    .filter((p) => normalize(p.name.fr).includes(normalize(search.value)))
    .filter((p) => !wishlistPokemon.value.includes(p)),
)

const wishlistPokemon = computed(() =>
  wishlist.value
    .map((id) => pokemon.value.find((p) => p.pokedex_id === id))
    .filter((p) => p !== undefined),
)

function addPokemon(id: number) {
  if (!wishlist.value.includes(id) && wishlist.value.length < 6)
    wishlist.value.push(id)
}

function removePokemon(id: number) {
  wishlist.value = wishlist.value.filter((w) => w !== id)
}
</script>
<template>
  <div class="flex p-4 font-serif gap-16">
    <div class="flex flex-col gap-4">
      <input v-model="search" placeholder="rechercher..." class="outline-1" />
      <ul>
        <li v-for="p in filteredPokemon" :key="p.pokedex_id">
          {{ p.name.fr }}
          <button
            @click="addPokemon(p.pokedex_id)"
            class="cursor-pointer underline"
          >
            Add
          </button>
        </li>
      </ul>
    </div>
    <ul>
      <li v-for="p in wishlistPokemon" :key="p.pokedex_id">
        {{ p.name.fr }}
        <button
          class="cursor-pointer underline"
          @click="removePokemon(p.pokedex_id)"
        >
          Remove
        </button>
      </li>
    </ul>
  </div>
</template>
