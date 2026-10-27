import sqlite3
import json

conn = sqlite3.connect("prisma/dev.db")
c = conn.cursor()

# 1. Total questions
c.execute("SELECT id, paper_id, subject, chapter, question_number, question_type, question_text_latex, options_json, correct_answer, image_url FROM questions")
all_questions = c.fetchall()

print(f"Total questions in database: {len(all_questions)}")

placeholder_questions = []
valid_mcq = []
numericals = []

for q in all_questions:
    qid, pid, subj, ch, qnum, qtype, text, opts_json, ans, img = q
    if qtype == "NUMERICAL":
        numericals.append(q)
        continue
    
    opts = []
    if opts_json:
        try:
            opts = json.loads(opts_json)
        except:
            pass
            
    is_placeholder = False
    if not opts or len(opts) == 0:
        is_placeholder = True
    elif any(o in ["Option A", "Option B", "Option C", "Option D", "A", "B", "C", "D", ""] for o in opts):
        is_placeholder = True
    elif len(set(opts)) < len(opts):
        is_placeholder = True
        
    if is_placeholder:
        placeholder_questions.append({
            "id": qid,
            "paper_id": pid,
            "subject": subj,
            "chapter": ch,
            "question_number": qnum,
            "text": text,
            "options": opts,
            "ans": ans,
            "image": img
        })
    else:
        valid_mcq.append(q)

print(f"Numerical questions: {len(numericals)}")
print(f"Valid MCQ questions: {len(valid_mcq)}")
print(f"Placeholder MCQ questions needing fix/review: {len(placeholder_questions)}")

# Check papers and sources for placeholder questions
paper_ids = set(q["paper_id"] for q in placeholder_questions)
print(f"Distinct papers affected: {len(paper_ids)}")

c.execute(f"SELECT id, source_url FROM papers WHERE id IN ({','.join(['?']*len(paper_ids))})", list(paper_ids))
paper_urls = dict(c.fetchall())
for pid in list(paper_ids)[:5]:
    print(f"  {pid} -> {paper_urls.get(pid)}")
