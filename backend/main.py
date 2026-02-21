from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
from database import save_entry, delete_entry, get_all_entries, get_fingerprint
import os

load_dotenv()

app = FastAPI()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Allow React frontend to talk to this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



class JournalText(BaseModel):
    text: str

class SaveRequest(BaseModel):
    title: str = "Untitled"
    text: str
    intensity_score: int = 0
    distortion: str = None

@app.post("/save")
async def save(request: SaveRequest):
    save_entry(
        title=request.title,
        text=request.text,
        distortion=request.distortion,
        intensity_score=request.intensity_score,
    )
    return {"status": "saved"}

@app.delete("/entries/{entry_id}")
async def delete(entry_id: str):
    delete_entry(entry_id)
    return {"status": "deleted"}

@app.post("/analyze")
async def analyze(request: JournalText):
    prompt = f"""
You are a warm, empathetic assistant embedded in a journaling app designed to support mental wellness.

Analyze the following journal entry and detect if any of these cognitive or emotional patterns are present:

- Self-Blame: calling themselves stupid, useless, worthless, a burden, a failure, a mistake
- Rumination: looping thoughts, replaying events, can't stop thinking, stuck in their head
- Catastrophizing: everything is ruined, it's over, nothing will ever get better, no future
- Escape Ideation: wanting to disappear, vanish, not exist, run away, hide forever, fade away
- Anxiety: panic, dread, fear of the future, what if thinking, heart racing, can't calm down
- Hopelessness: no point, giving up, nothing works, life is pointless, done with everything
- Overgeneralization: always, never, everyone, no one, every time

Be SENSITIVE. Detect even mild versions of these patterns.
If someone seems to be in genuine distress even without exact keyword matches, detect it.
Positive entries, neutral entries, or creative writing should return NONE.

If NO distortion is detected, respond with exactly:
NONE

If a distortion IS detected, respond in this exact format and nothing else:
DISTORTION: <one of: Self-Blame, Rumination, Catastrophizing, Escape Ideation, Anxiety, Hopelessness, Overgeneralization>
MESSAGE: <one warm sentence acknowledging what they wrote without judgment>
REFRAME: <one gentle, realistic alternative way to see the situation>

Journal entry:
\"\"\"{request.text}\"\"\"
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
        max_tokens=200,
    )

    raw = response.choices[0].message.content.strip()

    if raw == "NONE" or raw.startswith("NONE"):
        return {"distortion": None}

    # Parse the response
    lines = raw.split("\n")
    result = {}
    for line in lines:
        if line.startswith("DISTORTION:"):
            result["distortion"] = line.replace("DISTORTION:", "").strip()
        elif line.startswith("MESSAGE:"):
            result["message"] = line.replace("MESSAGE:", "").strip()
        elif line.startswith("REFRAME:"):
            result["reframe"] = line.replace("REFRAME:", "").strip()

    return result if "distortion" in result else {"distortion": None}


@app.post("/save")
async def save(request: SaveRequest):
    save_entry(
        text=request.text,
        distortion=request.distortion,
        intensity_score=request.intensity_score,
    )
    return {"status": "saved"}


@app.get("/entries")
async def entries():
    return get_all_entries()


@app.get("/fingerprint")
async def fingerprint():
    return get_fingerprint()