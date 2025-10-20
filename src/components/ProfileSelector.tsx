import type { LearnerProfile } from "../types";
import "./ProfileSelector.css";

interface ProfileSelectorProps {
  learners: LearnerProfile[];
  activeLearner: LearnerProfile;
  onSelect: (profile: LearnerProfile) => void;
}

export const ProfileSelector = ({
  learners,
  activeLearner,
  onSelect
}: ProfileSelectorProps) => (
  <aside className="profile-panel">
    <h2 className="profile-heading">Choose Your Explorer</h2>
    <div className="profile-grid">
      {learners.map((profile) => {
        const isActive = profile.id === activeLearner.id;
        return (
          <button
            key={profile.id}
            type="button"
            className={`profile-card ${isActive ? "active" : ""}`}
            onClick={() => onSelect(profile)}
          >
            <span className="profile-name">{profile.name}</span>
            <span className="profile-grade">Grade {profile.grade}</span>
            <span className="profile-motto">{profile.motto}</span>
            <span className="profile-tags">
              {profile.favoriteThemes.join(" • ")}
            </span>
          </button>
        );
      })}
    </div>
  </aside>
);
