<script setup lang="ts">
const route = useRoute()

const { data: pokemon } = await useFetch<Pokemon>(
  () => `/api/pokemon/${encodeURIComponent(String(route.params.name))}`,
)

const statLabels: Record<keyof Pokemon['stats'], string> = {
  hp: 'PV',
  attack: 'Attaque',
  defense: 'Défense',
  'special-attack': 'Atq. Spé.',
  'special-defense': 'Déf. Spé.',
  speed: 'Vitesse',
}

const fr = (n: number) => n.toLocaleString('fr-FR')
</script>
<template>
  <div class="flex flex-col p-4 font-serif gap-4">
    <NuxtLink to="/" class="underline">← retour</NuxtLink>

    <p v-if="!pokemon" class="text-red-500">
      Pokémon « {{ route.params.name }} » introuvable
    </p>

    <template v-else>
      <h1 class="text-2xl">
        #{{ pokemon.id }} {{ pokemon.name.fr }}
        <span class="text-gray-500">({{ pokemon.name.en }})</span>
      </h1>
      <p>{{ pokemon.category }}</p>

      <div class="flex gap-2">
        <span
          v-for="t in pokemon.types"
          :key="t"
          class="rounded border px-2 text-sm"
        >
          {{ t }}
        </span>
      </div>

      <img
        v-if="pokemon.sprite"
        :src="pokemon.sprite"
        :alt="pokemon.name.fr"
        class="h-48 w-48 [image-rendering:pixelated]"
      />

      <p>
        Taille : {{ fr(pokemon.height) }} m · Poids :
        {{ fr(pokemon.weight) }} kg
      </p>

      <table class="w-fit">
        <tr v-for="(label, key) in statLabels" :key="key">
          <td class="pr-4">{{ label }}</td>
          <td>{{ pokemon.stats[key] }}</td>
        </tr>
      </table>
    </template>
  </div>
</template>
