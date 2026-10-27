import sqlite3, json, uuid, random, os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "prisma", "dev.db")

def get_db():
    return sqlite3.connect(DB_PATH)

def insert_question(c, paper_id, subject, chapter, topic, q_num, q_type, q_text, options, correct_ans, hint, appr, sol, mistake, no_pen, exam_name="JEE Main", difficulty="medium"):
    q_id = f"q_{exam_name.lower().replace(' ', '_')[:4]}_{uuid.uuid4().hex[:10]}"
    
    # Ensure options are wrapped properly with $ ... $ if they contain LaTeX
    formatted_options = []
    for opt in options:
        opt_str = str(opt).strip()
        if ("\\" in opt_str or any(c in opt_str for c in "^_{}")) and not opt_str.startswith("$"):
            formatted_options.append(f"${opt_str}$")
        else:
            formatted_options.append(opt_str)

    c.execute("""
        INSERT INTO questions (
            id, paper_id, subject, chapter, topic, question_number, question_type,
            question_text_latex, image_url, options_json, correct_answer, marks_correct,
            marks_negative, difficulty, source_page, needs_review, exam_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        q_id, paper_id, subject, chapter, topic, q_num, q_type,
        q_text, None, json.dumps(formatted_options), correct_ans,
        4 if "JEE" in exam_name else 1, 1 if "JEE" in exam_name else 0,
        difficulty, 1, 0, exam_name
    ))

    c.execute("""
        INSERT INTO explanations (
            id, question_id, hint, approach, full_solution_latex, concept_used,
            common_mistake, similar_concept_tip, verified_against_key, confidence,
            no_pen_trick
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        str(uuid.uuid4()), q_id, hint, appr, sol,
        f"{chapter} - {topic}", mistake,
        "Always verify boundary cases and dimensional consistency.",
        1, "high", no_pen
    ))

def ensure_papers(c):
    exams = [
        ("JEE Main", "paper_jeemain_2026_shift1", 2026, 300),
        ("JEE Main", "paper_jeemain_2025_shift1", 2025, 300),
        ("JEE Main", "paper_jeemain_2024_shift2", 2024, 300),
        ("TS EAMCET", "paper_tseamcet_2026_shift1", 2026, 160),
        ("BITSAT", "paper_bitsat_2026_shift1", 2026, 390),
        ("VITEEE", "paper_viteee_2026_shift1", 2026, 125),
    ]
    for exam, pid, year, marks in exams:
        c.execute("SELECT id FROM papers WHERE id = ?", (pid,))
        if not c.fetchone():
            c.execute("""
                INSERT INTO papers (id, year, session, exam_date, shift, source_url, total_marks, exam_name)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (pid, year, 1, f"{year}-01-24", 1, f"https://jeemain.nta.nic.in/archives/{year}", marks, exam))

print("Helper definitions loaded successfully.")
