import sqlite3
import os
import re

conn = sqlite3.connect("prisma/dev.db")
c = conn.cursor()

c.execute("SELECT id, question_number, paper_id, subject, chapter, question_text_latex, image_url FROM questions")
rows = c.fetchall()

figure_keywords = [
    r"shown in (?:the )?figure",
    r"as shown in figure",
    r"figure (?:below|above|shows)",
    r"given in the figure",
    r"in the given circuit",
    r"shown in the diagram",
    r"as shown in the circuit",
    r"given in the circuit",
    r"shown in graph",
    r"in the given graph",
    r"plot.*?shown in figure",
    r"graph.*?shown in figure",
    r"velocity.*?versus.*?time.*?plot.*?shown"
]

missing_figures = []
has_valid_figure = []

for q in rows:
    qid, qnum, pid, subj, ch, text, img = q
    text_lower = text.lower()
    
    references_fig = False
    matched_kw = []
    for kw in figure_keywords:
        if re.search(kw, text_lower):
            references_fig = True
            matched_kw.append(kw)
            
    if references_fig:
        # Check if img exists and file is on disk
        img_exists = False
        if img:
            # Check public folder
            local_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", img.lstrip("/"))
            if os.path.exists(local_path):
                img_exists = True
                
        if not img or not img_exists:
            missing_figures.append({
                "id": qid,
                "qnum": qnum,
                "paper_id": pid,
                "subject": subj,
                "chapter": ch,
                "text": text[:120],
                "image_url": img,
                "keywords": matched_kw
            })
        else:
            has_valid_figure.append({
                "id": qid,
                "qnum": qnum,
                "image_url": img
            })

print(f"Total questions referencing figures: {len(missing_figures) + len(has_valid_figure)}")
print(f"With existing, valid image file: {len(has_valid_figure)}")
print(f"Missing image file or no link: {len(missing_figures)}")

for mf in missing_figures:
    print(f"  Q.{mf['qnum']} ({mf['subject']} - {mf['chapter']}) ID: {mf['id']}")
    print(f"    Text: {mf['text']}...")
    print(f"    image_url: {mf['image_url']}")
