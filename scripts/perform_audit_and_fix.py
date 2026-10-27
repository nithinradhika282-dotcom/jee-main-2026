import sqlite3
import pypdf
import json
import re
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "prisma", "dev.db")
PUBLIC_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public")

def normalize_text(text):
    # Remove header metadata like "JEE Main 2026 (Online) 8th April Evening Shift"
    t = re.sub(r"JEE Main \d{4}.*?Shift", "", text, flags=re.I)
    t = re.sub(r"[\$\\\{\}\_\^\s\(\)\,\.\:\;\-\+\=\/\*]", "", t.lower())
    return t

def extract_pdf_data(pdf_path):
    reader = pypdf.PdfReader(pdf_path)
    full_text = ""
    for page in reader.pages:
        full_text += page.extract_text() + "\n"
        
    ans_key_match = re.search(r"Answer Key.*?(MCQ.*?)(?=For numerical answers|$)", full_text, re.DOTALL)
    ans_dict = {}
    if ans_key_match:
        pairs = re.findall(r"(\d+)\.([A-D])", ans_key_match.group(1))
        for qnum, ans in pairs:
            ans_dict[int(qnum)] = ans
            
    q_blocks = re.split(r"(?:^|\n)Q(\d+)\.\s*", full_text)
    items = []
    for i in range(1, len(q_blocks), 2):
        qnum = int(q_blocks[i])
        content = q_blocks[i+1]
        sol_split = content.split("Open solution")[0]
        
        opt_match = re.search(r"\(A\)(.*?)\(B\)(.*?)\(C\)(.*?)\(D\)(.*)", sol_split, re.DOTALL)
        if opt_match:
            q_text = sol_split[:opt_match.start()].strip()
            optA = opt_match.group(1).strip()
            optB = opt_match.group(2).strip()
            optC = opt_match.group(3).strip()
            optD = opt_match.group(4).strip()
            optD = re.split(r"Keep practising|JEE Main Physics|Page \d+", optD)[0].strip()
            
            # Clean options
            clean_opts = [
                re.sub(r"\s+", " ", optA).strip(),
                re.sub(r"\s+", " ", optB).strip(),
                re.sub(r"\s+", " ", optC).strip(),
                re.sub(r"\s+", " ", optD).strip()
            ]
            
            items.append({
                "source_file": os.path.basename(pdf_path),
                "qnum": qnum,
                "text": q_text,
                "norm_text": normalize_text(q_text),
                "options": clean_opts,
                "correct_letter": ans_dict.get(qnum)
            })
    return items

def run_audit_and_fix():
    print("Loading source PDFs...")
    pdf1 = r"C:\Users\chary\Downloads\JEE Main Motion in a Straight Line Previous Year Questions with Answer Key.pdf"
    pdf2 = r"C:\Users\chary\Downloads\JEE Main Units & Measurements Previous Year Questions with Answer Key.pdf"
    
    source_items = []
    if os.path.exists(pdf1):
        source_items.extend(extract_pdf_data(pdf1))
    if os.path.exists(pdf2):
        source_items.extend(extract_pdf_data(pdf2))
        
    print(f"Extracted {len(source_items)} questions from source PDFs.")

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Ensure needs_review column exists
    c.execute("PRAGMA table_info(questions)")
    cols = [r[1] for r in c.fetchall()]
    if "needs_review" not in cols:
        c.execute("ALTER TABLE questions ADD COLUMN needs_review BOOLEAN DEFAULT 0")
        conn.commit()

    c.execute("""
        SELECT q.id, q.paper_id, q.subject, q.chapter, q.question_number, q.question_type,
               q.question_text_latex, q.options_json, q.correct_answer, q.image_url,
               p.year, p.exam_date, p.shift
        FROM questions q
        JOIN papers p ON q.paper_id = p.id
    """)
    all_db_questions = c.fetchall()
    
    total_checked = len(all_db_questions)
    placeholder_detected = []
    missing_figures = []
    fixed_questions = []
    still_needing_review = []

    figure_regex = re.compile(
        r"(shown in (?:the )?figure|as shown in figure|figure (?:below|above|shows)|given in the figure|"
        r"in the given circuit|shown in the diagram|as shown in the circuit|given in the circuit|"
        r"shown in graph|in the given graph|plot.*?shown in figure|graph.*?shown in figure|"
        r"versus.*?time.*?plot.*?shown)",
        re.I
    )

    for q in all_db_questions:
        qid, pid, subj, ch, qnum, qtype, text, opts_json, cur_ans, img, yr, dt, sh = q
        
        # 1. Figure check
        has_fig_ref = bool(figure_regex.search(text))
        img_missing = False
        if has_fig_ref:
            if not img:
                img_missing = True
            else:
                img_path = os.path.join(PUBLIC_DIR, img.lstrip("/"))
                if not os.path.exists(img_path):
                    img_missing = True
            if img_missing:
                missing_figures.append({
                    "id": qid,
                    "qnum": qnum,
                    "subject": subj,
                    "chapter": ch,
                    "year": yr,
                    "text": text[:90]
                })

        # 2. Options check for MCQ
        if qtype == "MCQ":
            opts = []
            if opts_json:
                try:
                    opts = json.loads(opts_json)
                except:
                    opts = []
            
            is_placeholder = False
            if not opts or len(opts) < 4:
                is_placeholder = True
            elif any(o in ["Option A", "Option B", "Option C", "Option D", "A", "B", "C", "D", ""] for o in opts):
                is_placeholder = True
            elif len(set(opts)) < len(opts):
                is_placeholder = True
                
            if is_placeholder:
                placeholder_detected.append({
                    "id": qid,
                    "qnum": qnum,
                    "subject": subj,
                    "chapter": ch,
                    "text": text,
                    "year": yr,
                    "shift": sh,
                    "date": dt,
                    "current_opts": opts,
                    "current_ans": cur_ans,
                    "img_missing": img_missing
                })

    print(f"Total questions audited: {total_checked}")
    print(f"MCQ with placeholder/empty options: {len(placeholder_detected)}")
    print(f"Questions referencing missing figures: {len(missing_figures)}")

    # 3. Match placeholder questions against source items
    for pq in placeholder_detected:
        db_norm = normalize_text(pq["text"])
        matched_source = None
        
        for s in source_items:
            s_norm = s["norm_text"]
            # Match condition: at least 20 chars overlap
            if len(db_norm) >= 15 and len(s_norm) >= 15:
                if db_norm in s_norm or s_norm in db_norm or db_norm[:30] == s_norm[:30]:
                    matched_source = s
                    break
                    
        # Verify matched source has valid non-empty options
        if matched_source and all(len(opt.strip()) > 0 for opt in matched_source["options"]):
            new_opts = matched_source["options"]
            official_letter = matched_source["correct_letter"] or pq["current_ans"]
            
            # Map correct answer to letter and option text
            letter_idx = {"A": 0, "B": 1, "C": 2, "D": 3}.get(official_letter, 0)
            target_option_text = new_opts[letter_idx]
            
            # Update database
            c.execute("""
                UPDATE questions
                SET options_json = ?,
                    correct_answer = ?,
                    needs_review = ?
                WHERE id = ?
            """, (
                json.dumps(new_opts),
                official_letter,
                1 if pq["img_missing"] else 0,
                pq["id"]
            ))
            
            fixed_questions.append({
                "id": pq["id"],
                "qnum": pq["qnum"],
                "subject": pq["subject"],
                "chapter": pq["chapter"],
                "year": pq["year"],
                "text": pq["text"][:70],
                "options": new_opts,
                "correct_letter": official_letter,
                "correct_option_text": target_option_text,
                "source": matched_source["source_file"]
            })
        else:
            # Original options not available in the provided sources
            c.execute("""
                UPDATE questions
                SET needs_review = 1
                WHERE id = ?
            """, (pq["id"],))
            
            still_needing_review.append({
                "id": pq["id"],
                "qnum": pq["qnum"],
                "subject": pq["subject"],
                "chapter": pq["chapter"],
                "year": pq["year"],
                "text": pq["text"][:80],
                "reason": "Missing original options in attached source files"
            })

    # Also mark all missing figure questions with needs_review = 1
    for mf in missing_figures:
        c.execute("UPDATE questions SET needs_review = 1 WHERE id = ?", (mf["id"],))

    conn.commit()
    conn.close()

    print(f"\n--- AUDIT & FIX SUMMARY ---")
    print(f"Total questions checked: {total_checked}")
    print(f"Number of questions fixed with authentic options: {len(fixed_questions)}")
    print(f"Number of questions still needing review: {len(still_needing_review)}")
    print(f"Number of questions with missing figures: {len(missing_figures)}")

    # Write audit log artifact
    audit_data = {
        "total_checked": total_checked,
        "number_fixed": len(fixed_questions),
        "number_needing_review": len(still_needing_review),
        "number_missing_figures": len(missing_figures),
        "fixed_questions": fixed_questions,
        "needing_review": still_needing_review,
        "missing_figures": missing_figures
    }

    with open("scripts/audit_report.json", "w", encoding="utf-8") as f:
        json.dump(audit_data, f, indent=2)
    print("Saved detailed report to scripts/audit_report.json")

if __name__ == "__main__":
    run_audit_and_fix()
