import { useCallback, useMemo, useState } from "react";
import type {
  LearnerProfile,
  ProblemBlueprint,
  ProblemResult,
  SessionSnapshot,
  SkillArea,
  SkillSnapshot
} from "../types";
import { generateProblem, normalizeAnswer } from "../utils/problemGenerator";

const cloneSkills = (
  snapshots: Record<SkillArea, SkillSnapshot>
): Record<SkillArea, SkillSnapshot> =>
  Object.entries(snapshots).reduce<Record<SkillArea, SkillSnapshot>>(
    (acc, [area, snapshot]) => {
      acc[area as SkillArea] = { ...snapshot };
      return acc;
    },
    {} as Record<SkillArea, SkillSnapshot>
  );

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const toNumber = (value: string): number | null => {
  const numeric = value.replace(/\s+/g, "");
  if (/^-?\d+(\.\d+)?$/.test(numeric)) {
    return Number.parseFloat(numeric);
  }

  if (/^-?\d+\/-?\d+$/.test(numeric)) {
    const [numerator, denominator] = numeric.split("/").map(Number);
    if (denominator !== 0) {
      return numerator / denominator;
    }
  }

  if (/^-?\d+\d*remainder\d+$/.test(numeric)) {
    const [whole, remainder] = numeric.split("remainder").map(Number);
    return whole + remainder / 10;
  }

  if (/^-?\d+\s+\d+\/\d+$/.test(value.trim())) {
    const [whole, fraction] = value.trim().split(/\s+/);
    const [num, den] = fraction.split("/").map(Number);
    return Number(whole) + num / den;
  }

  return null;
};

const answersMatch = (expected: string, received: string): boolean => {
  const normalizedExpected = normalizeAnswer(expected);
  const normalizedReceived = normalizeAnswer(received);
  if (normalizedExpected === normalizedReceived) {
    return true;
  }

  const expectedNumber = toNumber(normalizedExpected);
  const receivedNumber = toNumber(normalizedReceived);

  if (
    expectedNumber !== null &&
    receivedNumber !== null &&
    Number.isFinite(expectedNumber) &&
    Number.isFinite(receivedNumber)
  ) {
    return Math.abs(expectedNumber - receivedNumber) < 0.01;
  }

  return false;
};

const XP_PER_CORRECT = 25;
const XP_PER_ATTEMPT = 5;

const badgeLibrary: Array<{
  id: string;
  check: (session: SessionSnapshot, problem: ProblemBlueprint) => boolean;
  label: (problem: ProblemBlueprint) => string;
}> = [
  {
    id: "streak-3",
    check: (session) => session.currentStreak === 3,
    label: () => "3-in-a-row Trailblazer"
  },
  {
    id: "streak-5",
    check: (session) => session.currentStreak === 5,
    label: () => "Super Solver Streak"
  },
  {
    id: "skill-boost",
    check: (_session, problem) => problem.difficulty >= 7,
    label: (problem) => `High Flyer in ${problem.skillArea}`
  }
];

export interface FeedbackState {
  tone: "positive" | "coaching";
  message: string;
}

export interface AdaptiveSession {
  learner: LearnerProfile;
  currentProblem: ProblemBlueprint;
  session: SessionSnapshot;
  history: ProblemResult[];
  feedback: FeedbackState | null;
  submitAnswer: (answer: string) => void;
  skipProblem: () => void;
  resetSession: () => void;
}

export const useAdaptiveSession = (learner: LearnerProfile): AdaptiveSession => {
  const initialSkills = useMemo(
    () => cloneSkills(learner.skillSnapshots),
    [learner.skillSnapshots]
  );

  const [skills, setSkills] = useState(initialSkills);
  const [currentProblem, setCurrentProblem] = useState<ProblemBlueprint>(() =>
    generateProblem(learner, initialSkills)
  );
  const [problemStart, setProblemStart] = useState(() => Date.now());
  const [session, setSession] = useState<SessionSnapshot>({
    totalAttempts: 0,
    totalCorrect: 0,
    currentStreak: 0,
    xp: 0,
    recentlyEarnedBadges: []
  });
  const [history, setHistory] = useState<ProblemResult[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const queueNextProblem = useCallback(
    (nextSkills: Record<SkillArea, SkillSnapshot>) => {
      const upcoming = generateProblem(learner, nextSkills);
      setCurrentProblem(upcoming);
      setProblemStart(Date.now());
    },
    [learner]
  );

  const registerAttempt = useCallback(
    (isCorrect: boolean, answer: string) => {
      const timeTaken = Date.now() - problemStart;
      const resultEntry: ProblemResult = {
        problem: currentProblem,
        givenAnswer: answer,
        isCorrect,
        timestamp: Date.now(),
        timeTakenMs: timeTaken
      };

      setHistory((prev) => [resultEntry, ...prev].slice(0, 15));
    },
    [currentProblem, problemStart]
  );

  const applyBadgeChecks = useCallback(
    (nextSession: SessionSnapshot, problem: ProblemBlueprint) => {
      const newlyEarned = badgeLibrary
        .filter((badge) => badge.check(nextSession, problem))
        .map((badge) => badge.label(problem));

      if (newlyEarned.length > 0) {
        setSession({
          ...nextSession,
          recentlyEarnedBadges: Array.from(new Set(newlyEarned))
        });
      } else {
        setSession({
          ...nextSession,
          recentlyEarnedBadges: []
        });
      }

      return newlyEarned;
    },
    []
  );

  const submitAnswer = useCallback(
    (answer: string) => {
      if (!answer) {
        setFeedback({
          tone: "coaching",
          message: "Try entering an answer so we can learn together!"
        });
        return;
      }

      const isCorrect = answersMatch(currentProblem.answer, answer);
      const area = currentProblem.skillArea;
      const updatedSkills = cloneSkills(skills);
      const areaSnapshot = updatedSkills[area];
      areaSnapshot.attempts += 1;

      let nextSession: SessionSnapshot = {
        totalAttempts: session.totalAttempts + 1,
        totalCorrect: session.totalCorrect,
        currentStreak: isCorrect ? session.currentStreak + 1 : 0,
        xp: session.xp + XP_PER_ATTEMPT,
        recentlyEarnedBadges: []
      };

      if (isCorrect) {
        areaSnapshot.correct += 1;
        areaSnapshot.streak += 1;
        areaSnapshot.rating = clamp(areaSnapshot.rating + 0.4, 1, 10);
        nextSession = {
          ...nextSession,
          totalCorrect: nextSession.totalCorrect + 1,
          xp: nextSession.xp + XP_PER_CORRECT
        };

        setFeedback({
          tone: "positive",
          message: sampleCelebration(area, learner.favoriteThemes)
        });
      } else {
        areaSnapshot.streak = 0;
        areaSnapshot.rating = clamp(areaSnapshot.rating - 0.5, 1, 10);
        setFeedback({
          tone: "coaching",
          message: sampleCoaching(area)
        });
      }

      setSkills(updatedSkills);
      applyBadgeChecks(nextSession, currentProblem);

      registerAttempt(isCorrect, answer);
      queueNextProblem(updatedSkills);
    },
    [
      skills,
      currentProblem,
      learner.favoriteThemes,
      session,
      queueNextProblem,
      applyBadgeChecks,
      registerAttempt
    ]
  );

  const skipProblem = useCallback(() => {
    const updatedSkills = cloneSkills(skills);
    const areaSnapshot = updatedSkills[currentProblem.skillArea];
    areaSnapshot.rating = clamp(areaSnapshot.rating - 0.2, 1, 10);
    areaSnapshot.streak = 0;
    setSkills(updatedSkills);
    setFeedback({
      tone: "coaching",
      message:
        "No worries! Let's tackle a different challenge and come back to this later."
    });
    queueNextProblem(updatedSkills);
  }, [skills, currentProblem, queueNextProblem]);

  const resetSession = useCallback(() => {
    const resetSkills = cloneSkills(learner.skillSnapshots);
    setSkills(resetSkills);
    const firstProblem = generateProblem(learner, resetSkills);
    setCurrentProblem(firstProblem);
    setProblemStart(Date.now());
    setHistory([]);
    setSession({
      totalAttempts: 0,
      totalCorrect: 0,
      currentStreak: 0,
      xp: 0,
      recentlyEarnedBadges: []
    });
    setFeedback(null);
  }, [learner]);

  return {
    learner,
    currentProblem,
    session,
    history,
    feedback,
    submitAnswer,
    skipProblem,
    resetSession
  };
};

const celebrationPhrases: Record<SkillArea, string[]> = {
  addition: [
    "Great adding! Those numbers lined up perfectly.",
    "Sum-tastic! You're adding like a pro mathematician."
  ],
  subtraction: [
    "Subtraction superstar! You kept track like a detective.",
    "Nice work! You balanced the numbers brilliantly."
  ],
  multiplication: [
    "Multiplication master! Arrays are no match for you.",
    "Boom! Those groups multiplied beautifully."
  ],
  division: [
    "You shared everything fairly—division delight!",
    "Division victory! Remainders fear your reasoning."
  ],
  fractions: [
    "Fraction hero! Those slices add up perfectly.",
    "Delicious fractions! You're serving perfect portions."
  ],
  decimals: [
    "Decimals done! Your place values are on point.",
    "Money math champion—Cambridge cafes applaud you."
  ],
  wordProblems: [
    "Story solved! Math adventures are your specialty.",
    "Wow! You decoded that story puzzle flawlessly."
  ]
};

const coachingPhrases: Record<SkillArea, string[]> = {
  addition: [
    "Double-check the ones place and try again.",
    "Try adding with a number line—it can help visualize."
  ],
  subtraction: [
    "Remember to regroup when the top digit is smaller.",
    "Think about the difference between the two numbers."
  ],
  multiplication: [
    "Try skip-counting to double-check your product.",
    "Break the numbers into tens and ones, then multiply."
  ],
  division: [
    "Estimate the quotient first, then refine your answer.",
    "Try writing a related multiplication fact."
  ],
  fractions: [
    "Keep the denominator the same and focus on the numerator.",
    "Convert to like denominators to compare slices easier."
  ],
  decimals: [
    "Line up the decimals before multiplying or adding.",
    "Think about money to make decimals friendlier."
  ],
  wordProblems: [
    "Underline the important numbers and operations first.",
    "Break the story into smaller steps to plan your strategy."
  ]
};

const sampleCelebration = (area: SkillArea, themes: string[]): string => {
  const theme = themes[Math.floor(Math.random() * themes.length)];
  const phrase = celebrationPhrases[area][
    Math.floor(Math.random() * celebrationPhrases[area].length)
  ];
  return `${phrase} Keep it up, ${theme} explorer!`;
};

const sampleCoaching = (area: SkillArea): string =>
  coachingPhrases[area][
    Math.floor(Math.random() * coachingPhrases[area].length)
  ];
