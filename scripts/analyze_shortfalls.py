import sqlite3

conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()

c.execute('''
    SELECT c.subject, c.name,
           COUNT(q.id) as total_cnt,
           SUM(CASE WHEN q.exam_name = 'JEE Main' THEN 1 ELSE 0 END) as jee_cnt
    FROM chapters c
    LEFT JOIN questions q ON c.name = q.chapter
    GROUP BY c.id
    ORDER BY c.subject, c.class_level, c.name
''')
rows = c.fetchall()

print(f"{'Subject':<10} | {'Chapter Name':<45} | {'Total':<6} | {'JEE':<5} | Status")
print("-" * 85)

need_expansion = []
for subj, name, total, jee in rows:
    jee = jee or 0
    needed_total = max(0, 60 - total)
    needed_jee = max(0, 25 - jee)
    status = "OK" if total >= 50 and jee >= 20 else f"DEFICIT (add +{needed_total} tot, +{needed_jee} JEE)"
    print(f"{subj:<10} | {name:<45} | {total:<6} | {jee:<5} | {status}")
    if total < 50 or jee < 20:
        need_expansion.append((subj, name, total, jee, needed_total, needed_jee))

print("=" * 85)
print(f"Total chapters: {len(rows)}")
print(f"Chapters needing expansion: {len(need_expansion)}")
conn.close()
