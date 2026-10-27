import sqlite3

conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()
c.execute("SELECT COUNT(*) FROM questions WHERE exam_name = 'BITSAT'")
bitsat_cnt = c.fetchone()[0]
print("Total BITSAT questions in DB:", bitsat_cnt)
conn.close()
