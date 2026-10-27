import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "prisma", "dev.db")
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

# Check and add exam_name to papers
c.execute("PRAGMA table_info(papers)")
p_cols = [r[1] for r in c.fetchall()]
if "exam_name" not in p_cols:
    c.execute("ALTER TABLE papers ADD COLUMN exam_name TEXT DEFAULT 'JEE Main'")
    print("Added 'exam_name' to papers table!")
else:
    print("'exam_name' already exists in papers table.")

# Check and add exam_name to questions
c.execute("PRAGMA table_info(questions)")
q_cols = [r[1] for r in c.fetchall()]
if "exam_name" not in q_cols:
    c.execute("ALTER TABLE questions ADD COLUMN exam_name TEXT DEFAULT 'JEE Main'")
    print("Added 'exam_name' to questions table!")
else:
    print("'exam_name' already exists in questions table.")

# Add indexes
c.execute("CREATE INDEX IF NOT EXISTS idx_questions_exam ON questions(exam_name)")
c.execute("CREATE INDEX IF NOT EXISTS idx_papers_exam ON papers(exam_name)")

conn.commit()
conn.close()
print("Schema updated successfully for multi-exam support!")
