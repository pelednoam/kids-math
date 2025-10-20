import type { FeedbackState } from "../hooks/useAdaptiveSession";
import "./FeedbackBanner.css";

interface FeedbackBannerProps {
  feedback: FeedbackState;
}

export const FeedbackBanner = ({ feedback }: FeedbackBannerProps) => (
  <div className={`feedback-banner ${feedback.tone}`}>
    <span>{feedback.message}</span>
  </div>
);
