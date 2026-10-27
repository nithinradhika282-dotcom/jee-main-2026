import sqlite3, re

conn = sqlite3.connect(r'C:\Users\chary\.gemini\antigravity\scratch\jee-main-2026\prisma\dev.db')
c = conn.cursor()
c.execute('SELECT question_id, no_pen_trick FROM explanations WHERE no_pen_trick IS NOT NULL')
rows = c.fetchall()
print(f'Total explanations with no_pen_trick: {len(rows)}')
newline_math = 0
for qid, trick in rows:
    if not trick: continue
    for m in re.findall(r'\$([^\$]+)\$', trick):
        if '\n' in m:
            newline_math += 1
print(f'Matches with newline inside inline math: {newline_math}')

# Sample 5 no_pen_tricks
print("\nSample 5 no_pen_tricks:")
for qid, trick in rows[:5]:
    print(f"--- Q: {qid} ---")
    print(trick[:150] + "...")
