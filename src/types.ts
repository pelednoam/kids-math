export type GradeLevel = 3 | 5;

export type SkillArea =
  | "addition"
  | "subtraction"
  | "multiplication"
  | "division"
  | "fractions"
  | "decimals"
  | "wordProblems";

export interface SkillSnapshot {
  /** Dynamic rating that guides the adaptive difficulty (1-10). */
  rating: number;
  /** Running streak of correct answers in this skill. */
  streak: number;
  /** Total problems attempted. */
  attempts: number;
  /** Number of correct answers. */
  correct: number;
}

export interface LearnerProfile {
  id: string;
  name: string;
  grade: GradeLevel;
  favoriteThemes: string[];
  motto: string;
  skillSnapshots: Record<SkillArea, SkillSnapshot>;
}

export interface ProblemBlueprint {
  id: string;
  grade: GradeLevel;
  skillArea: SkillArea;
  difficulty: number;
  storyTitle: string;
  narrative: string;
  prompt: string;
  answer: string;
  choices?: string[];
  supportTip?: string;
  funFact?: string;
}

export interface ProblemResult {
  problem: ProblemBlueprint;
  givenAnswer: string;
  isCorrect: boolean;
  timestamp: number;
  timeTakenMs: number;
}

export interface SessionSnapshot {
  totalAttempts: number;
  totalCorrect: number;
  currentStreak: number;
  xp: number;
  recentlyEarnedBadges: string[];
}
