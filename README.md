# Cambridge Math Explorers

Cambridge Math Explorers is a React + TypeScript web experience designed for two learners (grade 3 and grade 5) growing up in Cambridge, MA. The app keeps practice fun with local storylines, adaptive difficulty, and positive feedback tailored to each child's skill profile.

## Highlights

- **Adaptive engine** – Tracking accuracy, streaks, and time on task drives the next problem selection and difficulty.
- **Cambridge-flavored missions** – Problems live inside stories set around Fresh Pond, Harvard Square, MIT maker labs, and the Charles River.
- **Grade-specific skills** – Grade 3 focuses on foundational operations, while grade 5 introduces fractions, decimals, and multi-step word problems.
- **Immediate feedback** – Kids collect XP, unlock badges, and see instant coaching tips or celebrations.
- **Recent history view** – A side timeline keeps the last 15 missions handy for quick reflection.

## Getting started

```bash
npm install
npm run dev
```

The development server defaults to `http://localhost:5173/` and opens automatically.

To create a production build:

```bash
npm run build
```

## Project structure

```
.
├── src
│   ├── App.tsx                  # Main layout and profile switching
│   ├── components               # UI pieces (problem workspace, progress board, etc.)
│   ├── data                     # Default learner profiles and themes
│   ├── hooks                    # Adaptive session management
│   ├── styles                   # Global and layout styles
│   └── utils                    # Grade-aware problem generator
├── public                       # Static assets (favicon, etc.)
├── index.html                   # Vite entry point
└── vite.config.ts               # Vite + React configuration
```

## Adapting for your kids

- **Update profiles** in `src/data/profiles.ts` to tweak names, mottos, favorite themes, or initial skill levels.
- **Adjust skills** by editing the rating values (1–10) so the first problems match each child's comfort zone.
- **Expand problem types** in `src/utils/problemGenerator.ts` – add new factory functions or Cambridge story contexts.
- **Tune feedback** in `src/hooks/useAdaptiveSession.ts` (see `celebrationPhrases` and `coachingPhrases`) to match your family's tone.

## Next ideas

1. Persist progress with local storage so streaks and XP survive page refreshes.
2. Add avatars or map-based navigation to deepen the story element.
3. Layer in timed challenges or collaborative puzzles for sibling play.

Enjoy exploring Cambridge math adventures together! If you have questions or want to extend the adaptive system, feel free to ask.
