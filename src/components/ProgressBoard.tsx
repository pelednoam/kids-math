import type { LearnerProfile, ProblemBlueprint, SessionSnapshot } from "../types";
import "./ProgressBoard.css";

interface ProgressBoardProps {
  learner: LearnerProfile;
  session: SessionSnapshot;
  problem: ProblemBlueprint;
  onReset: () => void;
  onToggleHistory: () => void;
  isHistoryVisible: boolean;
}

export const ProgressBoard = ({
  learner,
  session,
  problem,
  onReset,
  onToggleHistory,
  isHistoryVisible
}: ProgressBoardProps) => {
  const accuracy =
    session.totalAttempts > 0
      ? Math.round((session.totalCorrect / session.totalAttempts) * 100)
      : 0;

  const masteryBarWidth = Math.min(problem.difficulty * 10, 100);

  return (
    <div className="progress-card">
      <header className="progress-header">
        <div>
          <h3>{learner.name}&apos;s Progress</h3>
          <p>Grade {learner.grade} • {problem.skillArea} focus</p>
        </div>
        <button type="button" className="ghost-button" onClick={onReset}>
          Reset session
        </button>
      </header>

      <section className="progress-grid">
        <div className="stat-bubble">
          <span className="stat-value">{session.totalAttempts}</span>
          <span className="stat-label">Attempts</span>
        </div>
        <div className="stat-bubble">
          <span className="stat-value">{session.totalCorrect}</span>
          <span className="stat-label">Correct</span>
        </div>
        <div className="stat-bubble">
          <span className="stat-value">{accuracy}%</span>
          <span className="stat-label">Accuracy</span>
        </div>
        <div className="stat-bubble">
          <span className="stat-value">{session.xp}</span>
          <span className="stat-label">XP earned</span>
        </div>
      </section>

      <section className="progress-meter">
        <div className="meter-label">
          Current Challenge Level <span>Level {problem.difficulty}</span>
        </div>
        <div className="meter-track">
          <div
            className="meter-fill"
            style={{ width: `${masteryBarWidth}%` }}
          />
        </div>
      </section>

      {session.recentlyEarnedBadges.length > 0 && (
        <section className="badge-banner">
          <h4>Badges unlocked</h4>
          <div className="badge-row">
            {session.recentlyEarnedBadges.map((badge) => (
              <span key={badge} className="badge-chip">
                {badge}
              </span>
            ))}
          </div>
        </section>
      )}

      <footer className="progress-footer">
        <button type="button" className="ghost-button" onClick={onToggleHistory}>
          {isHistoryVisible ? "Hide" : "Show"} recent history
        </button>
      </footer>
    </div>
  );
};
