import sqlite3, json, os, re

conn = sqlite3.connect(r'C:\Users\chary\.gemini\antigravity\scratch\jee-main-2026\prisma\dev.db')
c = conn.cursor()

c.execute("""
    SELECT q.id, q.question_number, q.question_type, q.question_text_latex, q.options_json,
           q.correct_answer, q.image_url, q.needs_review, e.no_pen_trick, e.full_solution_latex
    FROM questions q
    LEFT JOIN explanations e ON q.id = e.question_id
""")
rows = c.fetchall()

total_checked = len(rows)
placeholder_questions = []
empty_option_questions = []
duplicate_option_questions = []
missing_figure_questions = []
invalid_answer_pointer = []
needs_review_count = 0

pub_dir = r'C:\Users\chary\.gemini\antigravity\scratch\jee-main-2026\public'

placeholder_regex = re.compile(r'^(option\s*[a-d1-4]|placeholder|none|n/a)$', re.IGNORECASE)

for row in rows:
    qid, qnum, qtype, qtext, opts_json, corr_ans, img_url, needs_rev, no_pen, sol = row
    
    if needs_rev:
        needs_review_count += 1
        
    # Check Diagram Reference
    fig_keywords = ['figure', 'diagram', 'as shown', 'circuit diagram', 'given graph', 'v-t graph', 'p-v diagram']
    qtext_lower = (qtext or '').lower()
    references_figure = any(k in qtext_lower for k in fig_keywords)
    
    if references_figure:
        if not img_url:
            missing_figure_questions.append((qid, qnum, "References figure but image_url is NULL", qtext[:80]))
        else:
            local_path = os.path.join(pub_dir, img_url.lstrip('/'))
            if not os.path.exists(local_path):
                missing_figure_questions.append((qid, qnum, f"File {img_url} missing on disk", qtext[:80]))

    if qtype == 'MCQ':
        if not opts_json:
            empty_option_questions.append((qid, qnum, "options_json is null/empty"))
            continue
        try:
            opts = json.loads(opts_json)
        except Exception as e:
            empty_option_questions.append((qid, qnum, f"JSON parse error: {e}"))
            continue
            
        if not isinstance(opts, list) or len(opts) < 2:
            empty_option_questions.append((qid, qnum, f"Invalid options length: {len(opts) if isinstance(opts, list) else 'not a list'}"))
            continue
            
        # Check placeholder
        for idx, opt in enumerate(opts):
            opt_clean = str(opt).strip()
            if not opt_clean:
                empty_option_questions.append((qid, qnum, f"Option {idx} is empty string"))
            elif placeholder_regex.match(opt_clean):
                placeholder_questions.append((qid, qnum, f"Option {idx} is placeholder: '{opt_clean}'"))
                
        # Check duplicate
        cleaned_opts = [str(o).strip().lower() for o in opts]
        if len(set(cleaned_opts)) < len(cleaned_opts):
            duplicate_option_questions.append((qid, qnum, f"Duplicate options found: {opts}"))
            
        # Check correct answer validity
        corr = str(corr_ans).strip()
        corr_lower = corr.lower()
        letter_map = {'a': 0, 'b': 1, 'c': 2, 'd': 3, '1': 0, '2': 1, '3': 2, '4': 3}
        
        matches_letter = corr_lower in letter_map and letter_map[corr_lower] < len(opts)
        matches_text = any(o.strip().lower() == corr_lower for o in opts)
        
        if not (matches_letter or matches_text):
            invalid_answer_pointer.append((qid, qnum, f"Correct answer '{corr}' does not match any option or letter A-D"))

print("=== AUDIT RESULTS ===")
print(f"Total Questions Checked: {total_checked}")
print(f"Placeholder Options: {len(placeholder_questions)}")
print(f"Empty/Corrupt Options: {len(empty_option_questions)}")
print(f"Duplicate Options: {len(duplicate_option_questions)}")
print(f"Missing Figures: {len(missing_figure_questions)}")
print(f"Invalid Correct Answer Pointers: {len(invalid_answer_pointer)}")
print(f"Questions Flagged Needs Review: {needs_review_count}")

if placeholder_questions:
    print("\n--- Placeholder Details (first 10) ---")
    for p in placeholder_questions[:10]:
        print(p)

if missing_figure_questions:
    print("\n--- Missing Figure Details ---")
    for m in missing_figure_questions:
        print(m)

if duplicate_option_questions:
    print("\n--- Duplicate Option Details ---")
    for d in duplicate_option_questions:
        print(d)

if invalid_answer_pointer:
    print("\n--- Invalid Answer Pointers (first 10) ---")
    for inv in invalid_answer_pointer[:10]:
        print(inv)
