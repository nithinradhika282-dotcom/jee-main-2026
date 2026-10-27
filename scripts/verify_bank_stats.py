import sqlite3
import json

conn = sqlite3.connect("prisma/dev.db")
c = conn.cursor()

c.execute("SELECT count(*) FROM questions")
total_q = c.fetchone()[0]
print(f"Total questions in database: {total_q}")

print("\n--- Exam Distribution ---")
c.execute("SELECT exam_name, count(*) FROM questions GROUP BY exam_name ORDER BY count(*) DESC")
for exam, count in c.fetchall():
    print(f"  {exam}: {count}")

print("\n--- Subject Distribution ---")
c.execute("SELECT subject, count(*) FROM questions GROUP BY subject ORDER BY count(*) DESC")
for subj, count in c.fetchall():
    print(f"  {subj}: {count}")

print("\n--- Placeholder Check ---")
c.execute("SELECT count(*) FROM questions WHERE options_json LIKE '%Option A%'")
placeholder_count = c.fetchone()[0]
print(f"Questions with placeholder 'Option A': {placeholder_count}")

print("\n--- Missing Figures Check ---")
c.execute("""
    SELECT count(*) FROM questions 
    WHERE (question_text_latex LIKE '%shown in figure%' OR question_text_latex LIKE '%in the figure%')
      AND image_url IS NULL
""")
missing_fig_count = c.fetchone()[0]
print(f"Questions referencing figures with image_url IS NULL: {missing_fig_count}")

c.execute("SELECT count(*) FROM questions WHERE image_url IS NOT NULL")
has_img_count = c.fetchone()[0]
print(f"Total questions with active diagrams linked: {has_img_count}")

conn.close()
