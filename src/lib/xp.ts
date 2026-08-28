export const XP_PER_EPISODE = 10;

export function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50));
}

export function xpForLevel(level: number): number {
  return 50 * level * level;
}

export function xpToNextLevel(xp: number): { currentLevel: number; nextLevel: number; xpIntoLevel: number; xpNeeded: number; progress: number } {
  const currentLevel = levelFromXp(xp);
  const nextLevel = currentLevel + 1;
  const xpCurrent = xpForLevel(currentLevel);
  const xpNext = xpForLevel(nextLevel);
  const xpIntoLevel = xp - xpCurrent;
  const xpNeeded = xpNext - xpCurrent;
  const progress = xpNeeded > 0 ? Math.min(100, Math.round((xpIntoLevel / xpNeeded) * 100)) : 100;

  return { currentLevel, nextLevel, xpIntoLevel, xpNeeded, progress };
}

export const XP_TABLE: { level: number; xpRequired: number; episodesRequired: number }[] = Array.from(
  { length: 21 },
  (_, level) => ({
    level,
    xpRequired: xpForLevel(level),
    episodesRequired: Math.ceil(xpForLevel(level) / XP_PER_EPISODE),
  })
);
