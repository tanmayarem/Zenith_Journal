# 🍒 Zenith Journal

An emotionally intelligent journaling web app that detects harmful thought patterns in real time and gently intervenes before emotional spirals intensify.

Unlike traditional journaling platforms that passively capture emotions after the fact, Zenith Journal actively supports you **while you write** — watching both what you say and how you say it.

---

## ✨ What Makes It Different

Most journaling apps are just a text box and a save button. Zenith Journal is a thinking support system.

- **It watches how you write, not just what you write** — keystroke patterns, backspace frequency, and sudden bursts of typing all feed into a live intensity score
- **It intervenes during the spiral, not after** — reframe prompts appear before the damage is done
- **It gets darker as you do** — the UI literally mirrors your emotional state in real time
- **It breathes with you** — a glowing orb guides you through a clinically backed breathing cycle at peak intensity
- **It builds a picture of you over time** — a cognitive fingerprint tracks your specific patterns across sessions

---

## 🧠 Core Features

### Spiral Meter
A live intensity score (0–100) computed from behavioral signals:
- Negative word and phrase detection across 5 distortion categories
- Repetition of the same negative thoughts
- Inactivity followed by sudden typing bursts
- Backspace patterns

As the score rises, the UI shifts from a soft red and white cozy theme to a dark, static-like screen — making escalation visible before it becomes overwhelming.

### Spiral Mode (85+ Intensity)
When the intensity score crosses 85, the screen darkens fully and a glowing breathing orb appears. It guides you through one complete breathing cycle:
- **Inhale** — 7 seconds
- **Hold** — 5 seconds  
- **Exhale** — 8 seconds

The journal is locked until the cycle completes. You cannot skip it.

### Reframe Gym (60–70 Intensity)
At moderate intensity, the journal temporarily blurs and a reflective prompt appears. Examples:

- *"If my best friend said this about themselves, I would tell them ___"*
- *"One thing about this situation that is still okay is ___"*
- *"What is the one decision I actually need to make today?"*

The journal unlocks once you've written a genuine response. It's not a punishment — it's a speed bump.

### AI Distortion Detection
After you stop typing, your entry is analyzed by an LLM (via Groq) for cognitive distortions including:
- Self-Blame
- Rumination  
- Catastrophizing
- Escape Ideation
- Anxiety
- Hopelessness
- Overgeneralization

A gentle side panel surfaces the detected pattern with a warm message and a suggested reframe.

### Crisis Detection
Phrases indicating serious distress trigger a quiet, non-alarming note with helpline resources. Not intrusive — just present.

### Cognitive Fingerprint
Over time, the app builds a personal profile of your thinking patterns — which distortions appear most, which days are hardest, which hours are most difficult. Stored locally, private to you.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | Plain CSS with CSS variable-driven theme transitions |
| Backend | Python + FastAPI |
| Database | SQLite (local) |
| AI | Groq API (llama-3.3-70b-versatile) |
| Routing | React Router DOM |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Python 3.9+
- A Groq API key (free at [console.groq.com](https://console.groq.com))

### Installation

**1. Clone the repo**
```bash
git clone https://github.com/tanmayarem/Zenith_Journal.git
cd Zenith_Journal
```

**2. Install frontend dependencies**
```bash
npm install
```

**3. Set up the Python backend**
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux
pip install fastapi uvicorn groq python-dotenv
```

**4. Add your Groq API key**

Create a `.env` file inside the `backend` folder:
```
GROQ_API_KEY=your_key_here
```

**5. Run both servers**

Terminal 1 — Backend:
```bash
cd backend
venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

Terminal 2 — Frontend:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 📁 Project Structure

```
journal/
├── src/
│   ├── components/
│   │   ├── Editor.jsx          ← textarea + keystroke tracking + crisis detection
│   │   ├── SpiralMeter.jsx     ← intensity + theme shift
│   │   ├── BreathingOrb.jsx    ← glowing orb at 85+
│   │   ├── ReframeGym.jsx      ← lock/unlock prompts at 60-70
│   │   ├── SidePanel.jsx       ← AI reframe suggestions
│   │   └── Home.jsx            ← entry archive home page
│   ├── lib/
│   │   └── intensityScore.js   ← all behavioral signal logic
│   ├── App.jsx
│   └── index.css
├── backend/
│   ├── main.py                 ← FastAPI + Groq integration
│   ├── database.py             ← SQLite logic
│   └── .env                    ← Groq API key (not committed)
└── vite.config.js
```

---

## 🔒 Privacy

All journal entries are stored locally in a SQLite database file on your own machine. Nothing is sent to any server except the text of your entry to the Groq API for distortion analysis. No accounts, no cloud storage, no tracking.

---

## 🌱 What's Next

- Facial micro-expression detection via webcam (face-api.js) as an optional intensity signal
- Cognitive fingerprint dashboard with charts
- Export entries as PDF
- Tone selector for intervention personality (gentle / reality check / hype / deadpan)

---

## 💙 A Note

Zenith Journal is not a therapy replacement. It is a thinking support tool designed to help you notice your patterns and be a little kinder to yourself. If you're in crisis, please reach out to someone who can help.

**iCall India:** 9152987821  
**iCall Online:** [icallhelpline.org](https://www.icallhelpline.org)

---

*Built with care at TinkerHack 2026* 🍒
