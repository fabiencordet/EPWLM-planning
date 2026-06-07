export const CLUB_NAME = "EPWLM - Club de Patinage";

export const SECTIONS = [
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

export type SectionName = (typeof SECTIONS)[number];
