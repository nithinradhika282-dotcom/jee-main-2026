import sqlite3

conn = sqlite3.connect("prisma/dev.db")
c = conn.cursor()

c.execute("SELECT id, question_text_latex, options_json FROM questions")
rows = c.fetchall()

fixed_q = 0
for qid, text, opts_json in rows:
    new_text = text.replace("µ", r"\mu ")
    new_opts_json = opts_json.replace("µ", r"\mu ") if opts_json else opts_json
    if new_text != text or new_opts_json != opts_json:
        c.execute("UPDATE questions SET question_text_latex = ?, options_json = ? WHERE id = ?", (new_text, new_opts_json, qid))
        fixed_q += 1

c.execute("SELECT id, hint, approach, full_solution_latex, no_pen_trick FROM explanations")
exp_rows = c.fetchall()
fixed_e = 0
for eid, hint, appr, sol, trick in exp_rows:
    new_hint = hint.replace("µ", r"\mu ") if hint else hint
    new_appr = appr.replace("µ", r"\mu ") if appr else appr
    new_sol = sol.replace("µ", r"\mu ") if sol else sol
    new_trick = trick.replace("µ", r"\mu ") if trick else trick
    if new_hint != hint or new_appr != appr or new_sol != sol or new_trick != trick:
        c.execute("""
            UPDATE explanations 
            SET hint = ?, approach = ?, full_solution_latex = ?, no_pen_trick = ?
            WHERE id = ?
        """, (new_hint, new_appr, new_sol, new_trick, eid))
        fixed_e += 1

conn.commit()
conn.close()
print(f"Replaced raw µ with \\mu in {fixed_q} questions and {fixed_e} explanations!")
