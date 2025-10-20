import type { LearnerProfile, SkillArea, SkillSnapshot } from "../types";

const baseSkillSnapshot = (rating: number): SkillSnapshot => ({
  rating,
  streak: 0,
  attempts: 0,
  correct: 0
});

const buildSkillMap = (ratings: Partial<Record<SkillArea, number>>) => {
  const allAreas: SkillArea[] = [
    "addition",
    "subtraction",
    "multiplication",
    "division",
    "fractions",
    "decimals",
    "wordProblems"
  ];

  return allAreas.reduce<Record<SkillArea, SkillSnapshot>>((acc, area) => {
    const defaultRating = area === "fractions" || area === "decimals" ? 4 : 6;
    acc[area] = baseSkillSnapshot(ratings[area] ?? defaultRating);
    return acc;
  }, {} as Record<SkillArea, SkillSnapshot>);
};

export const defaultProfiles: LearnerProfile[] = [
  {
    id: "ava",
    name: "Ava",
    grade: 3,
    favoriteThemes: ["Nature in Cambridge", "Red Line Adventures", "City Puzzles"],
    motto: "Curious thinkers grow every day!",
    skillSnapshots: buildSkillMap({
      addition: 7,
      subtraction: 6,
      multiplication: 5,
      division: 4,
      wordProblems: 6
    })
  },
  {
    id: "max",
    name: "Max",
    grade: 5,
    favoriteThemes: ["Charles River Science", "MIT Maker Lab", "Bike Trails"],
    motto: "Challenge accepted, every single time.",
    skillSnapshots: buildSkillMap({
      addition: 7,
      subtraction: 7,
      multiplication: 7,
      division: 6,
      fractions: 6,
      decimals: 6,
      wordProblems: 7
    })
  }
];
