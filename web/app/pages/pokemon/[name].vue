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
      ? await $fetch<Likes>(url, {
          baseURL: apiBase,
          method: 'DELETE',
          query: { visitor },
        })
      : await $fetch<Likes>(url, {
          baseURL: apiBase,
          method: 'POST',
          body: { visitor },
        })
    likeError.value = ''
  } catch (e) {
    const data = (e as { data?: { error?: string } }).data
    likeError.value = data?.error ?? 'API unreachable'
  }
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
        #{{ pokemon.id }} {{ pokemon.name.fr }}
        <span class="text-gray-500">({{ pokemon.name.en }})</span>
      </h1>
      <p>{{ pokemon.category }}</p>

      <div class="flex items-center gap-2">
        <button
          class="cursor-pointer rounded border px-2 disabled:cursor-default"
          :class="{ 'bg-pink-100': likes?.liked }"
          :disabled="!likes"
          :title="likes?.liked ? 'Ne plus aimer' : undefined"
          @click="toggleLike"
        >
          {{ likes?.liked ? '♥ Aimé' : "♡ J'aime" }}
        </button>
        <span v-if="likes">{{ fr(likes.likes) }}</span>
        <span v-if="likeError" class="text-red-500">{{ likeError }}</span>
      </div>

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
