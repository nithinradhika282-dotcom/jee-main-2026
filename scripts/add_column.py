import sqlite3

conn = sqlite3.connect("prisma/dev.db")
c = conn.cursor()

# Check table structure
c.execute("PRAGMA table_info(questions)")
cols = [r[1] for r in c.fetchall()]
if "needs_review" not in cols:
    c.execute("ALTER TABLE questions ADD COLUMN needs_review BOOLEAN DEFAULT 0")
    conn.commit()
    print("Added 'needs_review' column to questions table!")
else:
    print("'needs_review' column already exists.")

conn.close()
