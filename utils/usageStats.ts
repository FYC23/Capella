import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage shape:
// {
//   totalRatings: number,
//   byDay: { "2025-10-28": number },
//   byScreen?: { [screen: string]: number } // optional if you want screen breakdowns
// }
const KEY = 'usageStats:v1';

type UsageStats = {
  totalRatings: number;
  byDay: Record<string, number>;
  byScreen?: Record<string, number>;
};

function todayStr(tzOffsetMinutes?: number) {
  // Use device local time; if you need a fixed zone, inject one here.
  const now = new Date();
  if (typeof tzOffsetMinutes === 'number') {
    // Adjust if you want a fixed zone, e.g., Asia/Singapore = UTC+480
    const local = new Date(now.getTime() + (tzOffsetMinutes - now.getTimezoneOffset()) * 60000);
    return local.toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

async function read(): Promise<UsageStats> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) as UsageStats : { totalRatings: 0, byDay: {}, byScreen: {} };
}

async function write(data: UsageStats) {
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
}

export async function incrementRating(screen?: string) {
  const stats = await read();
  const day = todayStr();
  stats.totalRatings = (stats.totalRatings || 0) + 1;
  stats.byDay[day] = (stats.byDay[day] || 0) + 1;
  if (screen) {
    stats.byScreen = stats.byScreen || {};
    stats.byScreen[screen] = (stats.byScreen[screen] || 0) + 1;
  }
  await write(stats);
}

export async function getUsageSnapshot() {
  const stats = await read();
  const day = todayStr();
  const todayCount = stats.byDay[day] || 0;
  const total = stats.totalRatings || 0;
  return { today: todayCount, total };
}
