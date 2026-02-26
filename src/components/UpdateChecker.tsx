import { useState } from "react";
import "./UpdateChecker.css";

export function UpdateChecker() {
  const [status, setStatus] = useState<
    "idle" | "checking" | "up-to-date" | "error"
  >("idle");

  const buildDate = new Date(__BUILD_TIME__);

  async function checkForUpdates() {
    setStatus("checking");
    try {
      const res = await fetch("/version.json?t=" + Date.now());
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      const serverTime = data.buildTime as string;

      if (serverTime !== __BUILD_TIME__) {
        // A newer build is available — reload to pick it up
        window.location.reload();
      } else {
        setStatus("up-to-date");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="update-checker">
      <button
        className="update-checker-btn"
        onClick={checkForUpdates}
        disabled={status === "checking"}
      >
        {status === "checking" ? "Checking…" : "Check for Updates"}
      </button>
      {status === "up-to-date" && (
        <span className="update-checker-msg">
          Up to date — built{" "}
          {buildDate.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}{" "}
          at{" "}
          {buildDate.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      )}
      {status === "error" && (
        <span className="update-checker-msg update-checker-error">
          Could not check for updates
        </span>
      )}
    </div>
  );
}
