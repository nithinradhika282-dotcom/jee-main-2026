import sqlite3

conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()

c.execute("SELECT id, question_text_latex FROM questions WHERE chapter = 'Limits, Continuity and Differentiability'")
rows = c.fetchall()
print(f"Total found with 'Limits, Continuity and Differentiability': {len(rows)}")

c.execute("UPDATE questions SET chapter = 'Limits and Derivatives' WHERE chapter = 'Limits, Continuity and Differentiability'")
print(f"Updated {c.rowcount} questions to 'Limits and Derivatives'")

conn.commit()
conn.close()
