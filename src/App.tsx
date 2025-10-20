import { useState } from "react";
import { defaultProfiles } from "./data/profiles";
import { ProfileSelector } from "./components/ProfileSelector";
import { LearningDashboard } from "./components/LearningDashboard";
import type { LearnerProfile } from "./types";
import "./styles/app.css";

function App() {
  const [activeLearner, setActiveLearner] = useState<LearnerProfile>(
    defaultProfiles[0]
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Cambridge Math Explorers</h1>
        <p className="app-tagline">
          Personalized practice for Cambridge MA 3rd &amp; 5th graders.
        </p>
      </header>
      <main className="app-main">
        <ProfileSelector
          learners={defaultProfiles}
          activeLearner={activeLearner}
          onSelect={setActiveLearner}
        />
        <LearningDashboard key={activeLearner.id} learner={activeLearner} />
      </main>
    </div>
  );
}

export default App;
