// lowercase and strip accents: "Salamèche" -> "salameche"
export const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
