import sqlite3

conn = sqlite3.connect(r'C:\Users\chary\.gemini\antigravity\scratch\jee-main-2026\prisma\dev.db')
c = conn.cursor()

fig_ids = [
    'q_2026_1ad0384263', 'q_2026_4ccb9feb0e', 'q_2026_88a6a646a4', 'q_2024_5ac995bf8b',
    'q_2024_0782040c16', 'q_2026_8a431692ca', 'q_2023_ee536ab2fc', 'q_2023_d53415073f'
]

print("=== INSPECTING 8 QUESTIONS REFERENCING MISSING FIGURES ===")
for qid in fig_ids:
    c.execute("""
        SELECT q.id, q.question_number, q.subject, q.chapter, q.question_text_latex, q.options_json,
               q.correct_answer, e.full_solution_latex, e.approach
        FROM questions q
        LEFT JOIN explanations e ON q.id = e.question_id
        WHERE q.id = ?
    """, (qid,))
    row = c.fetchone()
    if row:
        print(f"\n--- {row[0]} | {row[2]} - {row[3]} | Ans: {row[6]} ---")
        print("Text:", row[4])
        print("Options:", row[5])
        print("Solution:", row[7][:200] if row[7] else "None")
