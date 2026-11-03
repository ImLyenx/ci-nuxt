export const MAX_WISHLIST = 6

export function addPokemon(
  wishlist: WishlistItem[],
  item: WishlistItem,
): WishlistItem[] {
  if (wishlist.some((p) => p.id === item.id)) {
    throw new Error('duplicate')
  }
  if (wishlist.length >= MAX_WISHLIST) {
    throw new Error('full')
  }
  return [...wishlist, item]
}
