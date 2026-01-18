import re
from pathlib import Path
from ics import Calendar
import pandas as pd

# -------------------------
# PATHS
# -------------------------
INPUT_DIR = Path("raw")
OUTPUT_DIR = Path("processed")
OUTPUT_DIR.mkdir(exist_ok=True)

# -------------------------
# LOAD ICS FILES
# -------------------------
events = []

for ics_file in INPUT_DIR.glob("*.ics"):
    with open(ics_file, "r", encoding="utf-8") as f:
        calendar = Calendar(f.read())

    event_type = (
        "holiday"
        if "holiday" in ics_file.name.lower() or "feiertag" in ics_file.name.lower()
        else "personal"
    )

    for event in calendar.events:
        events.append({
            "title": event.name,
            "start": event.begin.datetime if event.begin else None,
            "end": event.end.datetime if event.end else None,
            "event_type": event_type,
            "source_file": ics_file.name
        })

df = pd.DataFrame(events)

# -------------------------
# DATETIME NORMALIZATION
# -------------------------
df["start"] = pd.to_datetime(df["start"], utc=True, errors="coerce")
df["end"] = pd.to_datetime(df["end"], utc=True, errors="coerce")

# -------------------------
# DATE RANGE FILTER
# -------------------------
START = pd.Timestamp("2024-10-01", tz="UTC")
END = pd.Timestamp("2025-12-31", tz="UTC")

df = df[(df["start"] >= START) & (df["start"] <= END)]

# -------------------------
# CATEGORIZATION
# -------------------------
BAYERN_HOLIDAYS = [
    "neujahr",
    "heilige drei könige",
    "epiphanias",
    "karfreitag",
    "ostermontag",
    "tag der arbeit",
    "maifeiertag",
    "christi himmelfahrt",
    "pfingstmontag",
    "fronleichnam",
    "mariä himmelfahrt",
    "maria himmelfahrt",
    "tag der deutschen einheit",
    "allerheiligen",
    "1. weihnachtsfeiertag",
    "erster weihnachtstag",
    "2. weihnachtsfeiertag",
    "zweiter weihnachtstag",
]


def categorize(row):
    title = (row["title"] or "").lower()
    source = row["source_file"].lower()

    # birthdays → remove
    if "birthday" in title or "geburtstag" in title:
        return None

    # admin phone payments → remove
    if "เบอร์โทรศัพท์" in title or "ค่าบริการ" in title:
        return None

    # holidays (whitelist only)
    if row["event_type"] == "holiday":
        return "holiday" if any(h in title for h in BAYERN_HOLIDAYS) else None

    # explicit reminder
    if "prüfungsanmeldung" in title:
        return None

    # study: course codes (102:, 222:, etc.)
    if re.match(r"^\d{3}\s*:", title):
        return "study"

    # study keywords
    if any(x in title for x in [
        "prüfung", "übung", "abgabe", "präsentation",
        "hausarbeit", "referat", "zwischenpräsentation",
        "abschluss", "test", "plakat", "user journey"
    ]):
        return "study"

    # training
    if any(x in title for x in ["reformer", "gym", "training", "pilates"]):
        return "training"

    # health
    if any(x in title for x in [
        "therapie", "arzt", "psych", "dr.", "doktor",
        "lupus", "zahnarzt", "hausarzt", "psychiater",
        "ambulant", "klinik", "medizin", "lungen", "ทำฟัน"
    ]):
        return "health"

    # travel
    if any(x in title for x in ["กลับ", "flight", "reise", "trip", "flug", "hotel", "stay"]):
        return "travel"

    # fallback reminders
    if source == "reminders.ics":
        return "reminder"

    return None


df["event_category"] = df.apply(categorize, axis=1)
df = df[df["event_category"].notna()]

# -------------------------
# ALL-DAY EVENT DETECTION
# -------------------------
df["is_all_day"] = (
    (df["start"].dt.hour == 0) &
    (df["end"].dt.hour == 0) &
    ((df["end"] - df["start"]).dt.days >= 1)
)

# normalize Apple all-day end dates
df.loc[df["is_all_day"], "end"] -= pd.Timedelta(days=1)

# -------------------------
# EXPORT CLEAN DATA
# -------------------------
df_clean = df[
    ["title", "start", "end", "event_type",
        "event_category", "is_all_day", "source_file"]
]

df_clean.to_csv(
    OUTPUT_DIR / "calendar_2024_2025_clean.csv",
    index=False
)

# -------------------------
# EXPORT ALL-DAY EVENTS
# -------------------------
df_all_day = df_clean[df_clean["is_all_day"]]

df_all_day.to_csv(
    OUTPUT_DIR / "all_day_events.csv",
    index=False
)

print("✅ calendar_2024_2025_clean.csv created")
print(f"✅ {len(df_all_day)} all-day events exported to all_day_events.csv")
