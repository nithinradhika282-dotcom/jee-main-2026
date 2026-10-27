import sqlite3

conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()
c.execute('SELECT COUNT(*) FROM questions')
tot = c.fetchone()[0]
c.execute("SELECT COUNT(*) FROM questions WHERE exam_name = 'JEE Main'")
jee = c.fetchone()[0]
c.execute("SELECT COUNT(*) FROM explanations")
exp = c.fetchone()[0]
print(f"Total Questions in DB: {tot}")
print(f"Total JEE Main Questions in DB: {jee}")
print(f"Total Explanations in DB: {exp}")
conn.close()
