import sqlite3
from datetime import datetime

DB_PATH = "journal.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            text TEXT NOT NULL,
            distortion TEXT,
            intensity_score INTEGER,
            created_at TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS fingerprint (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            distortion TEXT NOT NULL,
            day_of_week TEXT,
            hour_of_day INTEGER,
            entry_length INTEGER,
            created_at TEXT
        )
    """)

    # Add title column if it doesn't exist yet (for existing databases)
    try:
        cursor.execute("ALTER TABLE entries ADD COLUMN title TEXT")
    except:
        pass

    conn.commit()
    conn.close()

def save_entry(title, text, distortion=None, intensity_score=0):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    now = datetime.now().isoformat()

    cursor.execute("""
        INSERT INTO entries (title, text, distortion, intensity_score, created_at)
        VALUES (?, ?, ?, ?, ?)
    """, (title, text, distortion, intensity_score, now))

    if distortion:
        day = datetime.now().strftime("%A")
        hour = datetime.now().hour
        length = len(text)
        cursor.execute("""
            INSERT INTO fingerprint (distortion, day_of_week, hour_of_day, entry_length, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (distortion, day, hour, length, now))

    conn.commit()
    conn.close()

def delete_entry(entry_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM entries WHERE id = ?", (entry_id,))
    conn.commit()
    conn.close()

def get_all_entries():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, text, distortion, intensity_score, created_at FROM entries ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "id": r[0],
            "title": r[1] or "Untitled",
            "text": r[2],
            "distortion": r[3],
            "intensity_score": r[4],
            "created_at": r[5],
        }
        for r in rows
    ]

def get_fingerprint():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT distortion, COUNT(*) as count
        FROM fingerprint
        GROUP BY distortion
        ORDER BY count DESC
    """)
    distortions = [{"distortion": r[0], "count": r[1]} for r in cursor.fetchall()]

    cursor.execute("""
        SELECT day_of_week, COUNT(*) as count
        FROM fingerprint
        GROUP BY day_of_week
        ORDER BY count DESC
    """)
    days = [{"day": r[0], "count": r[1]} for r in cursor.fetchall()]

    cursor.execute("""
        SELECT hour_of_day, COUNT(*) as count
        FROM fingerprint
        GROUP BY hour_of_day
        ORDER BY count DESC
        LIMIT 3
    """)
    hours = [{"hour": r[0], "count": r[1]} for r in cursor.fetchall()]

    conn.close()
    return {
        "top_distortions": distortions,
        "spiral_days": days,
        "spiral_hours": hours,
    }