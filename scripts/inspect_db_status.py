import sqlite3

conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()

c.execute("SELECT topic, question_text_latex FROM questions WHERE chapter = 'Limits, Continuity and Differentiability' LIMIT 5")
rows = c.fetchall()
print("Sample questions with Limits, Continuity and Differentiability:")
for r in rows:
    print(f"Topic: {r[0]} | Text: {r[1][:60]}")

# Also check distinct chapters in questions table that are NOT in chapters table
c.execute("""
    SELECT DISTINCT q.chapter 
    FROM questions q 
    WHERE q.chapter NOT IN (SELECT name FROM chapters)
""")
missing_in_chapters_tbl = c.fetchall()
print("\nChapters in questions table that are NOT in chapters table:")
for r in missing_in_chapters_tbl:
    print(r[0])

# And chapters in chapters table that have 0 questions in questions table
c.execute("""
    SELECT c.name, c.subject 
    FROM chapters c 
    WHERE c.name NOT IN (SELECT DISTINCT chapter FROM questions)
""")
zero_q_chapters = c.fetchall()
print("\nChapters in chapters table with 0 questions in questions table:")
for r in zero_q_chapters:
    print(f"[{r[1]}] {r[0]}")

conn.close()
