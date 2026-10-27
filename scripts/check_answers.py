import sqlite3
conn = sqlite3.connect(r'C:\Users\chary\.gemini\antigravity\scratch\jee-main-2026\prisma\dev.db')
c = conn.cursor()
c.execute("SELECT question_type, correct_answer FROM questions")
rows = c.fetchall()

mcq_answers = {}
num_answers = {}
for qtype, ans in rows:
    ans_str = str(ans).strip()
    if qtype == 'MCQ':
        mcq_answers[ans_str] = mcq_answers.get(ans_str, 0) + 1
    else:
        num_answers[ans_str] = num_answers.get(ans_str, 0) + 1

print("MCQ Answers distribution (top 20):")
for k, v in sorted(mcq_answers.items(), key=lambda x: x[1], reverse=True)[:20]:
    print(f"  '{k}': {v}")

print(f"\nTotal distinct MCQ correct_answer formats: {len(mcq_answers)}")
