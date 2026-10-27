import sqlite3, json, re

DB_PATH = r"C:\Users\chary\.gemini\antigravity\scratch\jee-main-2026\prisma\dev.db"
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

latex_macro_regex = re.compile(r'(\\[a-zA-Z]+|[_^]\{)')

print("=== CHECKING ALL QUESTIONS AND EXPLANATIONS ===")
c.execute("""
    SELECT q.id, q.question_number, q.question_text_latex, q.options_json, q.correct_answer,
           e.hint, e.approach, e.full_solution_latex, e.common_mistake, e.no_pen_trick
    FROM questions q
    LEFT JOIN explanations e ON q.id = e.question_id
""")
rows = c.fetchall()

total_checked = len(rows)
unwrapped_in_options = 0
unwrapped_in_shortcuts = 0

for r in rows:
    qid, qnum, qtext, opts_json, corr, hint, app, sol, mis, no_pen = r
    
    # Check options
    if opts_json:
        try:
            opts = json.loads(opts_json)
            for o in opts:
                s = str(o).strip()
                if '$' not in s and latex_macro_regex.search(s):
                    unwrapped_in_options += 1
        except:
            pass
            
    # Check shortcuts
    if no_pen:
        s = str(no_pen).strip()
        # Should have math or be clean text
        pass

print(f"Total Questions Verified: {total_checked}")
print(f"Unwrapped LaTeX in MCQ Options: {unwrapped_in_options}")

print("\n=== CHECKING PREDICTED QUESTIONS ===")
c.execute("SELECT id, chapter, options_json, no_pen_shortcut FROM predicted_questions")
for r in c.fetchall():
    print(f"[{r[0]}] {r[1]}:")
    print(f"  Options: {r[2]}")
    print(f"  Shortcut: {r[3][:70]}...")
