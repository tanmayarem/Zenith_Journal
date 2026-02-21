from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client["zenith_journal"]

entries_col = db["entries"]
fingerprint_col = db["fingerprint"]

def save_entry(title, text, distortion=None, intensity_score=0):
    now = datetime.now().isoformat()
    entry = {
        "title": title,
        "text": text,
        "distortion": distortion,
        "intensity_score": intensity_score,
        "created_at": now,
    }
    entries_col.insert_one(entry)

    if distortion:
        fingerprint_col.insert_one({
            "distortion": distortion,
            "day_of_week": datetime.now().strftime("%A"),
            "hour_of_day": datetime.now().hour,
            "entry_length": len(text),
            "created_at": now,
        })

def delete_entry(entry_id):
    from bson import ObjectId
    entries_col.delete_one({"_id": ObjectId(entry_id)})

def get_all_entries():
    entries = entries_col.find().sort("created_at", -1)
    return [
        {
            "id": str(e["_id"]),
            "title": e.get("title", "Untitled"),
            "text": e.get("text", ""),
            "distortion": e.get("distortion"),
            "intensity_score": e.get("intensity_score", 0),
            "created_at": e.get("created_at", ""),
        }
        for e in entries
    ]

def get_fingerprint():
    from collections import Counter
    docs = list(fingerprint_col.find())

    distortion_counts = Counter(d["distortion"] for d in docs)
    day_counts = Counter(d["day_of_week"] for d in docs)
    hour_counts = Counter(d["hour_of_day"] for d in docs)

    return {
        "top_distortions": [{"distortion": k, "count": v} for k, v in distortion_counts.most_common()],
        "spiral_days": [{"day": k, "count": v} for k, v in day_counts.most_common()],
        "spiral_hours": [{"hour": k, "count": v} for k, v in hour_counts.most_common(3)],
    }