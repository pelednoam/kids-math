import { useState } from "react";
import type { LearnerProfile } from "../types";
import { useAdaptiveSession } from "../hooks/useAdaptiveSession";
import { ProblemWorkspace } from "./ProblemWorkspace";
import { ProgressBoard } from "./ProgressBoard";
import { HistoryTimeline } from "./HistoryTimeline";
import { FeedbackBanner } from "./FeedbackBanner";
import "./LearningDashboard.css";

interface LearningDashboardProps {
  learner: LearnerProfile;
}

export const LearningDashboard = ({ learner }: LearningDashboardProps) => {
  const sessionState = useAdaptiveSession(learner);
  const { currentProblem, session, history, feedback } = sessionState;
  const [isHistoryVisible, setIsHistoryVisible] = useState(true);

  return (
    <section className="dashboard-shell">
      <div className="dashboard-main">
        {feedback && <FeedbackBanner feedback={feedback} />}
        <ProblemWorkspace
          problem={currentProblem}
          onSubmit={sessionState.submitAnswer}
          onSkip={sessionState.skipProblem}
        />
        <div className="dashboard-bottom">
          <ProgressBoard
            learner={learner}
            session={session}
            problem={currentProblem}
            onReset={sessionState.resetSession}
            onToggleHistory={() => setIsHistoryVisible((prev) => !prev)}
            isHistoryVisible={isHistoryVisible}
          />
        </div>
      </div>
      {isHistoryVisible && (
        <aside className="dashboard-history">
          <HistoryTimeline history={history} />
        </aside>
      )}
    </section>
  );
};
