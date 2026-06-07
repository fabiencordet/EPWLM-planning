import { TrainingTitle, TrainingType } from "@prisma/client";

const titleToLabel: Record<TrainingTitle, string> = {
  GLACE: "Glace",
  PPG: "PPG",
  SOL: "Sol",
};

const typeToLabel: Record<TrainingType, string> = {
  HEBDOMADAIRE: "hebdomadaire",
  STAGE: "stage",
};

export function toLabelTitle(title: TrainingTitle): string {
  return titleToLabel[title];
}

export function toLabelType(type: TrainingType): string {
  return typeToLabel[type];
}
