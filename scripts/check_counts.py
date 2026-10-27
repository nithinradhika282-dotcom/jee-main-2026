import sqlite3

conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()

c.execute('SELECT name, subject FROM chapters ORDER BY subject, name')
chapters = c.fetchall()

c.execute('''
    SELECT chapter, COUNT(*) as cnt, 
           SUM(CASE WHEN exam_name = 'JEE Main' THEN 1 ELSE 0 END) as jee_cnt
    FROM questions GROUP BY chapter
''')
counts = {row[0]: {'total': row[1], 'jee': row[2]} for row in c.fetchall()}

low = []
for name, subj in chapters:
    d = counts.get(name, {'total': 0, 'jee': 0})
    low.append({'name': name, 'subject': subj, 'total': d['total'], 'jee': d['jee']})

print(f"Total chapters: {len(chapters)}")
print(f"Total questions in DB: {sum(d['total'] for d in counts.values())}")

need_jee = [x for x in low if x['jee'] < 20]
need_total = [x for x in low if x['total'] < 50]

print(f"Chapters with < 20 JEE questions: {len(need_jee)}")
print(f"Chapters with < 50 Total questions: {len(need_total)}")

print("\n--- Chapters with low question count ---")
for item in low:
    if item['total'] < 50 or item['jee'] < 20:
        print(f"[{item['subject'][:4]}] {item['name']}: Total={item['total']}, JEE={item['jee']}")
