import sqlite3
import pypdf
import re
import json

# 1. Parse both PDFs
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
            
            items.append({
                "qnum": qnum,
                "text": q_text,
                "options": [optA, optB, optC, optD],
                "correct_letter": ans_dict.get(qnum)
            })
    return items

motion_items = extract_pdf_data(r"C:\Users\chary\Downloads\JEE Main Motion in a Straight Line Previous Year Questions with Answer Key.pdf")
units_items = extract_pdf_data(r"C:\Users\chary\Downloads\JEE Main Units & Measurements Previous Year Questions with Answer Key.pdf")

print(f"Motion items: {len(motion_items)}")
print(f"Units items: {len(units_items)}")

# 2. Match with DB questions
conn = sqlite3.connect("prisma/dev.db")
c = conn.cursor()
c.execute("SELECT id, question_number, subject, chapter, question_text_latex, options_json, correct_answer FROM questions")
db_questions = c.fetchall()

def normalize(text):
    text = re.sub(r"JEE Main \d{4}.*?Shift", "", text, flags=re.I)
    text = re.sub(r"[\$\\\{\}\_\^\s\(\)\,\.\:\;\-\+\=]", "", text.lower())
    return text[:60]

all_pdf_items = motion_items + units_items

matched = []
unmatched_db = []

for q in db_questions:
    qid, qnum, subj, ch, text, opts_json, ans = q
    opts = json.loads(opts_json) if opts_json else []
    
    # Only care if options are placeholder
    is_placeholder = (not opts or any(o in ["Option A", "Option B", "Option C", "Option D", ""] for o in opts))
    if not is_placeholder:
        continue
        
    db_norm = normalize(text)
    
    found = None
    for item in all_pdf_items:
        pdf_norm = normalize(item["text"])
        if len(db_norm) > 15 and (db_norm in pdf_norm or pdf_norm in db_norm or db_norm[:30] == pdf_norm[:30]):
            found = item
            break
            
    if found:
        # Check if PDF options are non-empty
        pdf_opts = found["options"]
        if any(len(o.strip()) > 0 for o in pdf_opts):
            matched.append((q, found))
        else:
            unmatched_db.append((q, "PDF options empty (SVG/vector)"))
    else:
        unmatched_db.append((q, "Not in source PDFs"))

print(f"Matched with non-empty options: {len(matched)}")
print(f"Unmatched / empty in PDF: {len(unmatched_db)}")

for q, found in matched[:5]:
    print(f"Matched DB {q[0]} ({q[3]})")
    print(f"  DB text: {q[4][:60]}")
    print(f"  PDF text: {found['text'][:60]}")
    print(f"  PDF options: {found['options']}")
    print(f"  PDF correct: {found['correct_letter']}")
