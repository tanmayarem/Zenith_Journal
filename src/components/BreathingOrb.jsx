import { useState, useEffect, useRef } from "react";

const PHASES = [
  { label: "Inhale", duration: 7 },
  { label: "Hold", duration: 5 },
  { label: "Exhale", duration: 8 },
];

const TOTAL_CYCLES = 1;

export default function BreathingOrb({ onComplete }) {
  const [display, setDisplay] = useState({
    label: "Inhale",
    secondsLeft: 7,
    cycle: 1,
    done: false,
  });

  const startTime = useRef(Date.now());
  const intervalRef = useRef(null);

  // Pre-calculate the absolute timestamp when each phase ends
  const buildSchedule = () => {
    const schedule = [];
    let t = Date.now();
    for (let c = 1; c <= TOTAL_CYCLES; c++) {
      for (let p = 0; p < PHASES.length; p++) {
        schedule.push({
          endsAt: t + PHASES[p].duration * 1000,
          label: PHASES[p].label,
          duration: PHASES[p].duration,
          cycle: c,
          phaseIndex: p,
        });
        t += PHASES[p].duration * 1000;
      }
    }
    return schedule;
  };

  const schedule = useRef(buildSchedule());
  const scheduleIndex = useRef(0);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const current = schedule.current[scheduleIndex.current];

      if (!current) {
        clearInterval(intervalRef.current);
        setDisplay(prev => ({ ...prev, done: true }));
        return;
      }

      const secondsLeft = Math.ceil((current.endsAt - now) / 1000);

      if (secondsLeft <= 0) {
        scheduleIndex.current += 1;
        const next = schedule.current[scheduleIndex.current];

        if (!next) {
          clearInterval(intervalRef.current);
          setDisplay(prev => ({ ...prev, done: true }));
          return;
        }

        setDisplay({
          label: next.label,
          secondsLeft: next.duration,
          cycle: next.cycle,
          done: false,
        });
      } else {
        setDisplay({
          label: current.label,
          secondsLeft,
          cycle: current.cycle,
          done: false,
        });
      }
    }, 500); // tick every 500ms so we never miss a transition

    return () => clearInterval(intervalRef.current);
  }, []);

  const orbScale =
    display.label === "Inhale" || display.label === "Hold"
      ? "scale(1.3)"
      : "scale(0.85)";

  const orbTransition =
    display.label === "Inhale"
      ? "transform 7s ease-in"
      : display.label === "Hold"
      ? "transform 0.3s ease"
      : "transform 8s ease-out";

  if (display.done) {
    return (
      <div className="orb-backdrop">
        <div className="orb-container">
          <p className="orb-message">That's it. Good Job, now take a moment, then keep writing when you're ready. 🌸</p>
          <p className="orb-message" style={{ fontSize: "0.85rem", opacity: 0.6 }}>
            Just Relax, don't worry, you are strong and capable and truly loved. Keep writing only when you're ready.
          </p>
          <button
            className="gym-button"
            style={{ marginTop: "16px" }}
            onClick={onComplete}
          >
            Continue Writing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orb-backdrop">
      <div className="orb-container">
        <p className="orb-message">
          Hey, I noticed things are getting intense. Let's breathe together.
        </p>

        <div
          className="orb"
          style={{ transform: orbScale, transition: orbTransition }}
        />

        <p className="orb-phase">{display.label}</p>
        <p className="orb-countdown">{display.secondsLeft}s</p>
      </div>
    </div>
  );
}