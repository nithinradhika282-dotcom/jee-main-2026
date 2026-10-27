import sqlite3, json

conn = sqlite3.connect(r'C:\Users\chary\.gemini\antigravity\scratch\jee-main-2026\prisma\dev.db')
c = conn.cursor()

duplicate_ids = [
    'q_2025_9eb0984a26', 'q_ts e_4ef618a840', 'q_ts e_617132262b', 'q_ts e_752fc279d1',
    'q_ts e_a26831f24b', 'q_bits_8606fac20d', 'q_bits_93a1b2eb11', 'q_vite_6b226be570',
    'q_vite_1c3c665300', 'q_math_2ff88e39f9', 'q_math_207e92fae8'
]

print("=== INSPECTING DUPLICATE OPTION QUESTIONS ===")
for qid in duplicate_ids:
    c.execute("""
        SELECT q.id, q.question_number, q.question_text_latex, q.options_json, q.correct_answer,
               e.full_solution_latex, e.approach
        FROM questions q
        LEFT JOIN explanations e ON q.id = e.question_id
        WHERE q.id = ?
    """, (qid,))
    row = c.fetchone()
    if row:
        print(f"\nID: {row[0]} | QNum: {row[1]} | Correct: {row[4]}")
        print(f"Text: {row[2][:120]}...")
        print(f"Options: {row[3]}")
        print(f"Solution: {(row[5] or '')[:120]}...")
