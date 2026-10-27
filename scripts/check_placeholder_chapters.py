import sqlite3
import json
from collections import Counter

# Let's see the chapters of all placeholder questions
conn = sqlite3.connect("prisma/dev.db")
c = conn.cursor()
c.execute("SELECT id, subject, chapter, question_text_latex, options_json FROM questions")
rows = c.fetchall()

placeholders = []
for r in rows:
    opts = json.loads(r[4]) if r[4] else []
    if not opts or any(o in ["Option A", "Option B", "Option C", "Option D", ""] for o in opts):
        placeholders.append(r)

print(f"Total placeholders: {len(placeholders)}")
ch_counts = Counter(r[2] for r in placeholders)
for ch, count in ch_counts.most_common():
    print(f"  {ch}: {count}")
