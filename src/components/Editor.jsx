import { useRef, useEffect, useState } from "react";
import { recordKeystroke, analyzeText, computeIntensityScore, isCrisisDetected } from "../lib/intensityScore";
import axios from "axios";


export default function Editor({
  journalText,
  setJournalText,
  intensityScore,
  setIntensityScore,
  setSidePanelData,
  gymUnlocked,
  onSaved,
  initialTitle = "",
}) {
  const [title, setTitle] = useState(initialTitle);
  const scoreInterval = useRef(null);
  const analysisTimeout = useRef(null);

  useEffect(() => {
    scoreInterval.current = setInterval(() => {
      const score = computeIntensityScore();
      setIntensityScore(score);
    }, 1000);
    return () => clearInterval(scoreInterval.current);
  }, []);

  const handleKeyDown = (e) => {
    recordKeystroke(e.key);
  };

  const [showCrisis, setShowCrisis] = useState(false);

  scoreInterval.current = setInterval(() => {
  const score = computeIntensityScore();
  setIntensityScore(score);
  setShowCrisis(isCrisisDetected());
}, 1000);

  const handleChange = (e) => {
    const text = e.target.value;
    setJournalText(text);
    analyzeText(text);

    clearTimeout(analysisTimeout.current);
    analysisTimeout.current = setTimeout(() => {
      if (text.trim().length > 20) {
        runAIAnalysis(text);
      }
    }, 1500);
  };

  const runAIAnalysis = async (text) => {
    try {
      const response = await axios.post("https://zenith-journal.onrender.com/analyze", { text });
      if (response.data && response.data.distortion) {
        setSidePanelData(response.data);
      }
    } catch (err) {
      console.error("AI analysis failed:", err);
    }
  };

  const isLocked = intensityScore >= 60 && intensityScore < 85 && !gymUnlocked;

  const handleSave = async () => {
    if (!journalText.trim()) return;
    try {
      await axios.post("https://zenith-journal.onrender.com/save", {
        title: title.trim() || "Untitled",
        text: journalText,
        intensity_score: intensityScore,
      });
      if (onSaved) onSaved();
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  return (
    <div className="editor-wrapper">
      <div className="score-badge">Intensity: {intensityScore}</div>

      <input
        className="title-input"
        placeholder="Give this entry a title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isLocked}
      />

      <div className={`editor-container ${isLocked ? "locked" : ""}`}>
        <textarea
          className="editor-textarea"
          placeholder="Start writing... this is your space."
          value={journalText}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isLocked}
        />
        {isLocked && (
          <div className="lock-overlay">
            <p>✋ Take a breath before continuing.</p>
          </div>
        )}
      </div>

      {showCrisis && (
        <div className="crisis-note">
          <p>💙 If you're having thoughts of hurting yourself, you don't have to face this alone.</p>
          <a href="https://iCall.iitb.ac.in" target="_blank" rel="noreferrer">iCall India — 9152987821</a>
          <span> · </span>
          <a href="https://www.icallhelpline.org" target="_blank" rel="noreferrer">iCall Online</a>
        </div>
      )}
      <div className="save-row">
        <button className="save-button" onClick={handleSave} disabled={isLocked}>
          Save Entry
        </button>
      </div>
    </div>
  );
}