import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'lastUsedTimestamps';

type MapType = Record<string, number>;

export async function getLastUsedMap(): Promise<MapType> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as MapType) : {};
}

export async function touchLastUsed(screen: string) {
  const map = await getLastUsedMap();
  map[screen] = Date.now();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function relativeLastUsedLabel(ts?: number): { key: string; values?: Record<string, number> } {
  if (!ts) return { key: 'home.neverUsed' };

  const diffMs = Date.now() - ts;
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (mins < 60) return { key: 'home.usedMinutesAgo', values: { minutes: Math.max(1, mins) } };
  if (hours < 24) return { key: 'home.usedHoursAgo', values: { hours } };
  if (days === 1) return { key: 'home.usedYesterday' };
  if (days < 7) return { key: 'home.usedDaysAgo', values: { days } };
  return { key: 'home.usedWeeksAgo', values: { weeks } };
}

