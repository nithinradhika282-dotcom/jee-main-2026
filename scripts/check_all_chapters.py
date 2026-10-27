import sqlite3

conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()
c.execute('''
    SELECT subject, chapter, COUNT(*) as cnt,
           SUM(CASE WHEN exam_name = 'JEE Main' THEN 1 ELSE 0 END) as jee_cnt
    FROM questions
    GROUP BY subject, chapter
    ORDER BY subject, chapter
''')
rows = c.fetchall()
print(f"Total chapters in DB: {len(rows)}")
for s, ch, cnt, jee in rows:
    status = "OK" if cnt >= 50 and jee >= 20 else "NEEDS_EXPANSION"
    print(f"[{s[:4]}] {ch:<50} total={cnt:<3} jee={jee:<3} -> {status}")
conn.close()
