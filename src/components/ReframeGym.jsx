import { useState } from "react";

const PROMPTS = {
  default: [
    "If my best friend said this about themselves, I would tell them ___",
    "One thing about this situation that is still okay is ___",
    "What is the one decision I actually need to make today?",
    "Three months ago something felt impossible and then ___",
    "The part of this I can actually control is ___",
  ],
};

function getRandomPrompt() {
  const list = PROMPTS.default;
  return list[Math.floor(Math.random() * list.length)];
}

export default function ReframeGym({ intensityScore, onUnlock }) {
  const [prompt] = useState(getRandomPrompt());
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (response.trim().length < 20) {
      setError("Write a little more before continuing.");
      return;
    }
    setError("");
    onUnlock();
  };

  return (
    <div className="gym-backdrop">
      <div className="gym-container">
        <p className="gym-title">✋ Pause for a second.</p>
        <p className="gym-subtitle">
          Your writing suggests things might be getting heavy. Before you
          continue, finish this thought:
        </p>

        <p className="gym-prompt">"{prompt}"</p>

        <textarea
          className="gym-textarea"
          placeholder="Write your response here..."
          value={response}
          onChange={(e) => setResponse(e.target.value)}
        />

        {error && <p className="gym-error">{error}</p>}

        <button className="gym-button" onClick={handleSubmit}>
          Continue Writing
        </button>
      </div>
    </div>
  );
}