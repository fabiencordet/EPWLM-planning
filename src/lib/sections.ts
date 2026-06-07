export const SECTION_DISPLAY_ORDER = [
  "Loisirs",
  "Artistique Adultes",
  "Artistique Nationaux",
  "Artistique Régionaux",
  "Danse Adultes",
  "Danse Nationaux",
  "Danse Régionaux",
  "Synchro Détection",
  "Synchro Juvéniles",
  "Synchro Novices B",
] as const;

const SECTION_RANK = new Map<string, number>(
  SECTION_DISPLAY_ORDER.map((name, index) => [name, index]),
);

export function sortSections<T extends { name: string }>(sections: T[]): T[] {
  return [...sections]
    .filter((section) => section.name !== "Artistique")
    .sort((a, b) => {
      const rankA = SECTION_RANK.get(a.name) ?? 999;
      const rankB = SECTION_RANK.get(b.name) ?? 999;
      if (rankA !== rankB) return rankA - rankB;
      return a.name.localeCompare(b.name, "fr");
    });
}
