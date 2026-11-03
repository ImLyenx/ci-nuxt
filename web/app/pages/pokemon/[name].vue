<script setup lang="ts">
type Pokemon = {
  pokedex_id: number
  category: string
  name: { fr: string; en: string; jp: string }
  sprites: { regular: string; shiny: string | null }
  types: { name: string; image: string }[]
  stats: {
    hp: number
    atk: number
    def: number
    spe_atk: number
    spe_def: number
    vit: number
  }
  height: string
  weight: string
}

const route = useRoute()

// tyradex only matches unaccented names ("salameche", not "Salamèche")
const name = computed(() => normalize(String(route.params.name)))

// unknown names come back as HTTP 200 with { status: 404, message }
const { data: pokemon } = await useFetch(
  () => `https://tyradex.app/api/v1/pokemon/${encodeURIComponent(name.value)}`,
  {
    transform: (res: Pokemon | { status: number }) =>
      'pokedex_id' in res ? res : null,
  },
)

const statLabels: Record<keyof Pokemon['stats'], string> = {
  hp: 'PV',
  atk: 'Attaque',
  def: 'Défense',
  spe_atk: 'Atq. Spé.',
  spe_def: 'Déf. Spé.',
  vit: 'Vitesse',
}
</script>
<template>
  <div class="flex flex-col p-4 font-serif gap-4">
    <NuxtLink to="/" class="underline">← retour</NuxtLink>

    <p v-if="!pokemon" class="text-red-500">
      Pokémon « {{ route.params.name }} » introuvable
    </p>

    <template v-else>
      <h1 class="text-2xl">
        #{{ pokemon.pokedex_id }} {{ pokemon.name.fr }}
        <span class="text-gray-500">({{ pokemon.name.en }})</span>
      </h1>
      <p>{{ pokemon.category }}</p>

      <div class="flex gap-2">
        <img
          v-for="t in pokemon.types"
          :key="t.name"
          :src="t.image"
          :alt="t.name"
          :title="t.name"
          class="h-6"
        />
      </div>

      <img
        :src="pokemon.sprites.regular"
        :alt="pokemon.name.fr"
        class="h-48 w-48"
      />

      <p>Taille : {{ pokemon.height }} · Poids : {{ pokemon.weight }}</p>

      <table class="w-fit">
        <tr v-for="(label, key) in statLabels" :key="key">
          <td class="pr-4">{{ label }}</td>
          <td>{{ pokemon.stats[key] }}</td>
        </tr>
      </table>
    </template>
  </div>
</template>
