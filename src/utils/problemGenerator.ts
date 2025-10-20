import type {
  GradeLevel,
  LearnerProfile,
  ProblemBlueprint,
  SkillArea,
  SkillSnapshot
} from "../types";

interface ProblemContext {
  title: string;
  narrativeIntro: string;
  funFact: string;
}

interface GeneratorInput {
  difficulty: number;
  context: ProblemContext;
  grade: GradeLevel;
}

type ProblemFactory = (
  input: GeneratorInput
) => Omit<ProblemBlueprint, "id" | "grade" | "skillArea" | "difficulty">;

const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const sample = <T>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)];

const shuffle = <T>(items: T[]): T[] =>
  [...items].sort(() => Math.random() - 0.5);

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const contextsByGrade: Record<GradeLevel, ProblemContext[]> = {
  3: [
    {
      title: "Fresh Pond Picnic Planner",
      narrativeIntro:
        "It's a sunny afternoon at Fresh Pond in Cambridge, and you're packing a picnic basket.",
      funFact:
        "Fresh Pond supplies drinking water to the city of Cambridge after it's treated nearby."
    },
    {
      title: "Bike Ride on the Minuteman",
      narrativeIntro:
        "You're biking the Minuteman Trail with friends and planning snack stops along the way.",
      funFact:
        "The Minuteman Bikeway follows part of Paul Revere's famous midnight ride from 1775."
    },
    {
      title: "Museum of Science Mission",
      narrativeIntro:
        "A guide at the Museum of Science asked for help setting up a math puzzle for visitors.",
      funFact:
        "The Museum of Science straddles both Cambridge and Boston across the Charles River."
    }
  ],
  5: [
    {
      title: "MIT Maker Lab Challenge",
      narrativeIntro:
        "You're joining an MIT maker lab workshop to build eco-friendly inventions.",
      funFact:
        "MIT students host outreach events for local Cambridge kids to explore engineering."
    },
    {
      title: "Charles River Regatta Prep",
      narrativeIntro:
        "A crew team needs help planning their regatta practice schedule on the Charles River.",
      funFact:
        "Every October, the Head of the Charles Regatta brings thousands of rowers to Cambridge."
    },
    {
      title: "Harvard Square Study Quest",
      narrativeIntro:
        "You're embarking on a study quest through Harvard Square bookstores and cafes.",
      funFact:
        "Harvard Square has served as a gathering spot for scholars, artists, and musicians for centuries."
    }
  ]
};

const additionFactory: ProblemFactory = ({ difficulty, context, grade }) => {
  const span = grade === 3 ? 30 : 70;
  const base = grade === 3 ? 10 : 25;
  const maxValue = base + difficulty * (span / 10);
  const a = randomInt(8, Math.round(maxValue));
  const b = randomInt(7, Math.round(maxValue));
  const prompt = `${context.narrativeIntro} You collected ${a} colorful tokens and your friend found ${b} more. How many tokens do you have together?`;
  const answer = a + b;
  const choices = shuffle([
    answer,
    answer + randomInt(1, 5),
    answer - randomInt(1, 5),
    answer + randomInt(6, 9)
  ]);

  return {
    storyTitle: context.title,
    narrative: prompt,
    prompt: "Add the totals from both friends.",
    answer: answer.toString(),
    choices: choices.map(String),
    supportTip: "Try lining the numbers up and adding the ones place first.",
    funFact: context.funFact
  };
};

const subtractionFactory: ProblemFactory = ({ difficulty, context, grade }) => {
  const maxValue = grade === 3 ? 100 : 250;
  const minuend = randomInt(Math.round(maxValue / 2), maxValue);
  const subtrahend = randomInt(8, Math.round(minuend * (0.2 + difficulty / 15)));
  const answer = minuend - subtrahend;
  const prompt = `${context.narrativeIntro} You count ${minuend} visitors entering the event. Later, ${subtrahend} visitors leave to grab snacks. How many visitors remain inside?`;

  return {
    storyTitle: context.title,
    narrative: prompt,
    prompt: "Subtract the guests who left from the total guests.",
    answer: answer.toString(),
    choices: shuffle([
      answer,
      answer + randomInt(5, 12),
      answer - randomInt(5, 12),
      minuend + subtrahend
    ]).map(String),
    supportTip: "If regrouping is tough, draw base-ten blocks to visualize.",
    funFact: context.funFact
  };
};

const multiplicationFactory: ProblemFactory = ({
  difficulty,
  context,
  grade
}) => {
  const multiplier = grade === 3 ? randomInt(2, 12) : randomInt(4, 18);
  const baseFactor =
    grade === 3 ? randomInt(2, clamp(6 + difficulty, 2, 12)) : randomInt(6, 24);
  const answer = multiplier * baseFactor;
  const prompt = `${context.narrativeIntro} You are arranging rows of seats for a community math show. You set up ${multiplier} rows with ${baseFactor} seats in each row. How many seats are ready?`;

  return {
    storyTitle: context.title,
    narrative: prompt,
    prompt: "Multiply rows by seats per row.",
    answer: answer.toString(),
    choices: shuffle([
      answer,
      answer + multiplier,
      answer - baseFactor,
      multiplier * (baseFactor + 1)
    ]).map(String),
    supportTip: "Think of arrays or skip-count to multiply quickly.",
    funFact: context.funFact
  };
};

const divisionFactory: ProblemFactory = ({ difficulty, context, grade }) => {
  const divisor = grade === 3 ? randomInt(2, 9) : randomInt(3, 12);
  const quotient = grade === 3 ? randomInt(2, 12) : randomInt(4, 18);
  const dividend = divisor * quotient;
  const remainderModifier = grade === 5 && difficulty > 6 ? randomInt(1, divisor - 1) : 0;
  const actualDividend = dividend + remainderModifier;
  const answer =
    remainderModifier === 0
      ? `${quotient}`
      : `${quotient} remainder ${remainderModifier}`;
  const prompt = `${context.narrativeIntro} You have ${actualDividend} science kits to share equally among ${divisor} teams. How many kits does each team get?`;

  const wrongChoiceBase = quotient + randomInt(-2, 2);
  const choices = [
    answer,
    `${wrongChoiceBase}`,
    `${quotient + randomInt(1, 3)}`,
    remainderModifier === 0
      ? `${quotient - 1} remainder ${divisor - 1}`
      : `${quotient + 1} remainder ${Math.max(0, remainderModifier - 1)}`
  ];

  return {
    storyTitle: context.title,
    narrative: prompt,
    prompt: "Divide the kits into equal groups. Don't forget remainders if needed.",
    answer,
    choices: shuffle(choices),
    supportTip: "Use repeated subtraction or think backwards with multiplication.",
    funFact: context.funFact
  };
};

const fractionFactory: ProblemFactory = ({ difficulty, context }) => {
  const denominator = sample([4, 5, 6, 8, 10, 12]);
  const whole = randomInt(1, clamp(difficulty, 1, 4));
  const numerator = randomInt(1, denominator - 1);
  const multiplier = randomInt(2, 3 + Math.round(difficulty / 2));
  const prompt = `${context.narrativeIntro} You're slicing pies into equal pieces for a community dinner. You have ${multiplier} pies, and each pie is cut into ${denominator} slices. If you serve ${numerator} slices from each pie, how many slices are served in total?`;
  const answerFraction = numerator * multiplier;
  const answer = `${answerFraction}/${denominator}`;
  const incorrect = `${answerFraction + randomInt(1, 3)}/${denominator}`;
  const simplified =
    answerFraction % denominator === 0
      ? `${answerFraction / denominator}`
      : `${Math.floor(answerFraction / denominator)} ${answerFraction % denominator}/${denominator}`;

  return {
    storyTitle: context.title,
    narrative: prompt,
    prompt: "Multiply the fraction by the number of pies.",
    answer,
    choices: shuffle([answer, incorrect, simplified]),
    supportTip: "Multiply the numerator by the number of pies while keeping the denominator the same.",
    funFact: context.funFact
  };
};

const decimalFactory: ProblemFactory = ({ difficulty, context }) => {
  const price = (randomInt(150, 245) / 10).toFixed(2);
  const count = randomInt(3, 7 + Math.round(difficulty / 2));
  const answer = (parseFloat(price) * count).toFixed(2);
  const prompt = `${context.narrativeIntro} A Harvard Square café is selling trail mix for $${price} per bag. If you buy ${count} bags for your math club, what is the total cost?`;

  return {
    storyTitle: context.title,
    narrative: prompt,
    prompt: "Multiply the unit price by the number of bags.",
    answer,
    choices: shuffle([
      answer,
      (parseFloat(answer) + 1.1).toFixed(2),
      (parseFloat(answer) - 0.9).toFixed(2)
    ]),
    supportTip: "Line up the decimals and multiply as you would whole numbers.",
    funFact: context.funFact
  };
};

const wordProblemFactory: ProblemFactory = ({
  difficulty,
  context,
  grade
}) => {
  const minutesPerSession = randomInt(45, 75);
  const meetingsPerWeek = randomInt(2, 4);
  const scavengerCheckpoints = randomInt(5, 8);
  const puzzlesPerCheckpoint = randomInt(3, 5);
  const pointsPerPuzzle = randomInt(10, 15);
  const gardenSections = randomInt(4, 6);
  const percentVeggies = randomInt(45, 65);

  const options: Array<{ question: string; answer: string; supportTip: string }> =
    [
      {
        question:
          `${context.narrativeIntro} A coding club meets ${meetingsPerWeek} times a week for ${minutesPerSession} minutes each session. How many minutes does the club meet in two weeks?`,
        answer: (meetingsPerWeek * minutesPerSession * 2).toString(),
        supportTip:
          "Break the problem into steps: minutes per meeting, meetings per week, then multiply."
      },
      {
        question:
          `${context.narrativeIntro} You're planning a math scavenger hunt with ${scavengerCheckpoints} checkpoints. Each checkpoint has ${puzzlesPerCheckpoint} puzzles worth ${pointsPerPuzzle} points each. How many points can teammates earn in total?`,
        answer: (
          scavengerCheckpoints *
          puzzlesPerCheckpoint *
          pointsPerPuzzle
        ).toString(),
        supportTip:
          "Multiply checkpoints by puzzles, then multiply by points per puzzle."
      }
    ];

  if (grade === 5) {
    const veggieSections = ((percentVeggies / 100) * gardenSections).toFixed(2);
    const flowerSections = (
      gardenSections -
      parseFloat(veggieSections)
    ).toFixed(2);

    options.push({
      question:
        `${context.narrativeIntro} A community garden is split into ${gardenSections} sections. ${percentVeggies}% of the garden is planted with veggies and the rest with flowers. How many sections are flowers?`,
      answer: flowerSections,
      supportTip:
        "Convert the percent to a decimal, multiply by the sections, then subtract from the total."
    });
  }

  const chosen = sample(options);

  return {
    storyTitle: context.title,
    narrative: chosen.question,
    prompt: "Solve the multi-step story problem.",
    answer: chosen.answer,
    choices: undefined,
    supportTip: chosen.supportTip,
    funFact: context.funFact
  };
};

const factories: Record<SkillArea, ProblemFactory> = {
  addition: additionFactory,
  subtraction: subtractionFactory,
  multiplication: multiplicationFactory,
  division: divisionFactory,
  fractions: fractionFactory,
  decimals: decimalFactory,
  wordProblems: wordProblemFactory
};

const normalizeSkillWeight = (snapshot: SkillSnapshot): number => {
  const baseWeight = 10 - snapshot.rating;
  const challengeBoost = snapshot.streak >= 3 ? 0.5 : 0;
  const accuracyPenalty =
    snapshot.attempts > 0
      ? (snapshot.attempts - snapshot.correct) / snapshot.attempts
      : 0.3;
  return clamp(baseWeight + accuracyPenalty * 4 + challengeBoost, 0.5, 12);
};

const chooseSkillArea = (
  grade: GradeLevel,
  skillSnapshots: Record<SkillArea, SkillSnapshot>
): SkillArea => {
  const allowedAreas: SkillArea[] =
    grade === 3
      ? ["addition", "subtraction", "multiplication", "division", "wordProblems"]
      : [
          "addition",
          "subtraction",
          "multiplication",
          "division",
          "fractions",
          "decimals",
          "wordProblems"
        ];

  const weightedPool: SkillArea[] = [];
  allowedAreas.forEach((area) => {
    const weight = normalizeSkillWeight(skillSnapshots[area]);
    for (let i = 0; i < Math.round(weight); i += 1) {
      weightedPool.push(area);
    }
  });

  return sample(weightedPool);
};

export const generateProblem = (
  learner: LearnerProfile,
  skillSnapshots: Record<SkillArea, SkillSnapshot>
): ProblemBlueprint => {
  const skillArea = chooseSkillArea(learner.grade, skillSnapshots);
  const context = sample(contextsByGrade[learner.grade]);
  const snapshot = skillSnapshots[skillArea];
  const difficulty = clamp(Math.round(snapshot.rating), 1, 10);
  const factory = factories[skillArea];
  const body = factory({
    difficulty,
    context,
    grade: learner.grade
  });

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    grade: learner.grade,
    skillArea,
    difficulty,
    ...body
  };
};

export const normalizeAnswer = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, " ");
