import { FormEvent, useState } from "react";
import type { ProblemBlueprint } from "../types";
import "./ProblemWorkspace.css";

interface ProblemWorkspaceProps {
  problem: ProblemBlueprint;
  onSubmit: (answer: string) => void;
  onSkip: () => void;
}

export const ProblemWorkspace = ({
  problem,
  onSubmit,
  onSkip
}: ProblemWorkspaceProps) => {
  const [answer, setAnswer] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(answer);
    setAnswer("");
  };

  const handleChoiceClick = (choice: string) => {
    setAnswer(choice);
    onSubmit(choice);
    setAnswer("");
  };

  return (
    <article className="problem-card">
      <header className="problem-header">
        <span className="problem-tag">{problem.skillArea}</span>
        <h2>{problem.storyTitle}</h2>
        <span className="problem-difficulty">
          Level {problem.difficulty} • Grade {problem.grade}
        </span>
      </header>

      <div className="problem-body">
        <p className="problem-narrative">{problem.narrative}</p>
        <p className="problem-prompt">{problem.prompt}</p>

        {problem.choices ? (
          <div className="problem-choice-wrapper">
            <div className="problem-choices">
              {problem.choices.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  className="choice-chip"
                  onClick={() => handleChoiceClick(choice)}
                >
                  {choice}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="secondary-button skip-inline"
              onClick={onSkip}
            >
              Skip for now
            </button>
          </div>
        ) : (
          <form className="problem-form" onSubmit={handleSubmit}>
            <label className="problem-label" htmlFor="answer-input">
              Your answer
            </label>
            <input
              id="answer-input"
              className="problem-input"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Type your answer"
            />
            <div className="problem-actions">
              <button type="submit" className="primary-button">
                Check answer
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={onSkip}
              >
                Skip for now
              </button>
            </div>
          </form>
        )}
      </div>

      <footer className="problem-footer">
        {problem.supportTip && (
          <p className="problem-support">
            <strong>Strategy tip:</strong> {problem.supportTip}
          </p>
        )}
        {problem.funFact && (
          <p className="problem-fact">
            <strong>Cambridge fact:</strong> {problem.funFact}
          </p>
        )}
      </footer>
    </article>
  );
};
