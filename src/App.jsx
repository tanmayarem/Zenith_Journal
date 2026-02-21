import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Editor from "./components/Editor";
import BreathingOrb from "./components/BreathingOrb";
import ReframeGym from "./components/ReframeGym";
import SidePanel from "./components/SidePanel";
import Home from "./components/Home";
import { resetWindow } from "./lib/intensityScore";
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/journal" element={<JournalPage />} />
      </Routes>
    </BrowserRouter>
  );
}

function JournalPage() {
  const [intensityScore, setIntensityScore] = useState(0);
  const [journalText, setJournalText] = useState("");
  const [sidePanelData, setSidePanelData] = useState(null);
  const [gymUnlocked, setGymUnlocked] = useState(false);
  const resetRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [orbDone, setOrbDone] = useState(false);
const [orbActive, setOrbActive] = useState(false);

  const existingEntry = location.state?.entry || null;

  useEffect(() => {
    if (existingEntry) {
      setJournalText(existingEntry.text || "");
    }
  }, []);

  useEffect(() => {
    if (intensityScore >= 85 && !orbDone && !orbActive) {
      setOrbActive(true);
    }
  }, [intensityScore]);

  const getThemeStyle = () => {
    if (intensityScore >= 85) {
      return {
        "--bg-color": "#0a0a0a",
        "--text-color": "#e0e0e0",
        "--editor-bg": "#111111",
        "--border-color": "#333",
        "--static-opacity": "0.04",
      };
    } else if (intensityScore >= 60) {
      const t = (intensityScore - 60) / 25;
      return {
        "--bg-color": interpolateColor("#fff5f5", "#1a1a1a", t),
        "--text-color": interpolateColor("#2d2d2d", "#e0e0e0", t),
        "--editor-bg": interpolateColor("#ffffff", "#111111", t),
        "--border-color": interpolateColor("#f5c6c6", "#444", t),
        "--static-opacity": `${t * 0.04}`,
      };
    } else {
      const t = intensityScore / 60;
      return {
        "--bg-color": interpolateColor("#fff5f5", "#ffe0e0", t),
        "--text-color": "#2d2d2d",
        "--editor-bg": "#ffffff",
        "--border-color": interpolateColor("#f5c6c6", "#e88888", t),
        "--static-opacity": "0",
      };
    }
  };

  return (
    <div className="app-wrapper" style={getThemeStyle()}>
      <div className="static-overlay" />
      <div className="app-container">
        <div className="journal-topbar">
          <button className="back-button" onClick={() => navigate("/")}>← Home</button>
          <h1 className="app-title">journal</h1>
        </div>

        <div className="main-layout">
          <Editor
            journalText={journalText}
            setJournalText={setJournalText}
            intensityScore={intensityScore}
            setIntensityScore={setIntensityScore}
            setSidePanelData={setSidePanelData}
            gymUnlocked={gymUnlocked}
            onSaved={() => navigate("/")}
            initialTitle={existingEntry?.title || ""}
          />
          <SidePanel data={sidePanelData} />
        </div>

        {intensityScore >= 60 && intensityScore < 85 && !gymUnlocked && (
          <ReframeGym intensityScore={intensityScore} onUnlock={() => setGymUnlocked(true)} />
        )}

        {intensityScore >= 85 && !orbDone && <BreathingOrb onComplete={() => setOrbDone(true)} />}
      </div>
    </div>
  );
}

function interpolateColor(hex1, hex2, t) {
  const r1 = parseInt(hex1.slice(1, 3), 16);
  const g1 = parseInt(hex1.slice(3, 5), 16);
  const b1 = parseInt(hex1.slice(5, 7), 16);
  const r2 = parseInt(hex2.slice(1, 3), 16);
  const g2 = parseInt(hex2.slice(3, 5), 16);
  const b2 = parseInt(hex2.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${b})`;
}