import sqlite3, json, re

DB_PATH = r"C:\Users\chary\.gemini\antigravity\scratch\jee-main-2026\prisma\dev.db"
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

c.execute("SELECT id, options_json, correct_answer FROM questions WHERE options_json IS NOT NULL")
rows = c.fetchall()

latex_triggers = re.compile(r'(\\[a-zA-Z]+|[_^]\{?[0-9a-zA-Z]|\\times|\\pm|\\leq|\\geq|\\neq|\\approx)')

updated_q_count = 0
updated_opts_count = 0

for qid, opts_json, corr_ans in rows:
    try:
        opts = json.loads(opts_json)
        if not isinstance(opts, list):
            continue
            
        modified = False
        new_opts = []
        for opt in opts:
            s = str(opt).strip()
            # If it has LaTeX commands and does NOT have $
            if '$' not in s and latex_triggers.search(s):
                wrapped = f"${s}$"
                new_opts.append(wrapped)
                modified = True
                updated_opts_count += 1
            else:
                new_opts.append(opt)
                
        if modified:
            # Also check if correct_answer matches an old option without $
            new_corr = corr_ans
            old_str = str(corr_ans).strip()
            if '$' not in old_str and latex_triggers.search(old_str):
                new_corr = f"${old_str}$"
                
            c.execute(
                "UPDATE questions SET options_json = ?, correct_answer = ? WHERE id = ?",
                (json.dumps(new_opts), new_corr, qid)
            )
            updated_q_count += 1
    except Exception as e:
        pass

conn.commit()
print(f"Successfully wrapped {updated_opts_count} options across {updated_q_count} questions in standard math delimiters ($...$)!")
