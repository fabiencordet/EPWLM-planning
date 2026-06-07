import type { SectionName } from "@/lib/constants";

export type PublicTraining = {
  id: string;
  section: SectionName;
  title: "Glace" | "PPG" | "Sol";
  type: "hebdomadaire" | "stage";
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  coach: string;
  notes?: string;
};

export const MOCK_TRAININGS: PublicTraining[] = [
  {
    id: "t1",
    section: "Loisirs",
    title: "Glace",
    type: "hebdomadaire",
    date: "2026-06-08",
    startTime: "18:00",
    endTime: "19:30",
    location: "Patinoire A",
    coach: "Coach Martin",
  },
  {
    id: "t2",
    section: "Synchro Juvéniles",
    title: "Glace",
    type: "hebdomadaire",
    date: "2026-06-09",
    startTime: "19:00",
    endTime: "21:00",
    location: "Patinoire A",
    coach: "Coach Leroy",
  },
  {
    id: "t3",
    section: "Artistique Nationaux",
    title: "PPG",
    type: "stage",
    date: "2026-06-10",
    startTime: "17:30",
    endTime: "18:30",
    location: "Salle Sol 2",
    coach: "Coach Bernard",
  },
  {
    id: "t4",
    section: "Danse Nationaux",
    title: "Sol",
    type: "hebdomadaire",
    date: "2026-06-12",
    startTime: "20:00",
    endTime: "21:00",
    location: "Salle Sol 1",
    coach: "Coach Vidal",
  },
];
