import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'favorites_v1';

export type Favorite = { cat: string; id: number | string };

export async function getFavorites(): Promise<Favorite[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function isFavorite(cat: string, id: any): Promise<boolean> {
  const favs = await getFavorites();
  return favs.some(f => f.cat === cat && String(f.id) === String(id));
}

export async function toggleFavorite(cat: string, id: any): Promise<boolean> {
  const favs = await getFavorites();
  const idx = favs.findIndex(f => f.cat === cat && String(f.id) === String(id));
  if (idx >= 0) {
    favs.splice(idx, 1);
    await AsyncStorage.setItem(KEY, JSON.stringify(favs));
    return false;
  } else {
    favs.unshift({ cat, id });
    await AsyncStorage.setItem(KEY, JSON.stringify(favs));
    return true;
  }
}
