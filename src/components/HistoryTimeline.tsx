import type { ProblemResult } from "../types";
import "./HistoryTimeline.css";

interface HistoryTimelineProps {
  history: ProblemResult[];
}

export const HistoryTimeline = ({ history }: HistoryTimelineProps) => {
  if (history.length === 0) {
    return (
      <div className="history-empty">
        Solve a few challenges to build your timeline!
      </div>
    );
  }

  return (
    <div className="history-list">
      <h3>Recent Missions</h3>
      <ul>
        {history.map((entry) => (
          <li
            key={entry.timestamp}
            className={entry.isCorrect ? "correct" : "missed"}
          >
            <div className="history-row">
              <span className="history-tag">{entry.problem.skillArea}</span>
              <span className="history-title">{entry.problem.storyTitle}</span>
            </div>
            <div className="history-outcome">
              <div className="history-text">
                <span>
                  {entry.isCorrect ? "Correct" : "Keep practicing"}
                  {" • "}
                  You answered <strong>{entry.givenAnswer || "Skipped"}</strong>
                </span>
                {!entry.isCorrect && (
                  <span className="history-correct">
                    Correct answer: {entry.problem.answer}
                  </span>
                )}
              </div>
              <span className="history-time">
                {Math.round(entry.timeTakenMs / 1000)}s
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
