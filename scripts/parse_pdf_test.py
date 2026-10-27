import pypdf
import re

def parse_pdf_questions(pdf_path):
    reader = pypdf.PdfReader(pdf_path)
    full_text = ""
    for page in reader.pages:
        full_text += page.extract_text() + "\n"
        
    print(f"Loaded {pdf_path}: length={len(full_text)}")
    # Find Answer Key
    ans_key_match = re.search(r"Answer Key.*?(MCQ.*?)(?=For numerical answers|$)", full_text, re.DOTALL)
    ans_dict = {}
    if ans_key_match:
        ans_text = ans_key_match.group(1)
        pairs = re.findall(r"(\d+)\.([A-D])", ans_text)
        for qnum, ans in pairs:
            ans_dict[int(qnum)] = ans
        print(f"Found {len(ans_dict)} MCQ answers in Answer Key!")
        
    # Split questions by Q\d+\.
    q_blocks = re.split(r"(?:^|\n)Q(\d+)\.\s*", full_text)
    print(f"Found {len(q_blocks)//2} potential question blocks!")
    
    questions = {}
    for i in range(1, len(q_blocks), 2):
        qnum = int(q_blocks[i])
        content = q_blocks[i+1]
        
        # Split off before "Open solution"
        sol_split = content.split("Open solution")[0]
        
        # Find options: (A)... (B)... (C)... (D)...
        # Note: some options might span lines
        opt_match = re.search(r"\(A\)(.*?)\(B\)(.*?)\(C\)(.*?)\(D\)(.*)", sol_split, re.DOTALL)
        if opt_match:
            q_text = sol_split[:opt_match.start()].strip()
            optA = opt_match.group(1).strip()
            optB = opt_match.group(2).strip()
            optC = opt_match.group(3).strip()
            optD = opt_match.group(4).strip()
            
            # Clean up option D if it has trailing headers
            optD = re.split(r"Keep practising|JEE Main Physics|Page \d+", optD)[0].strip()
            
            questions[qnum] = {
                "qnum": qnum,
                "text": q_text,
                "options": [optA, optB, optC, optD],
                "correct_answer": ans_dict.get(qnum)
            }
            
    print(f"Successfully extracted {len(questions)} complete questions with options from PDF!")
    return questions

# Test Motion in a Straight Line
motion_qs = parse_pdf_questions(r"C:\Users\chary\Downloads\JEE Main Motion in a Straight Line Previous Year Questions with Answer Key.pdf")
for i in [1, 2, 3, 4, 5]:
    if i in motion_qs:
        print(f"Q{i}: text: {motion_qs[i]['text'][:60]}...")
        print(f"   Opts: {motion_qs[i]['options']}")
        print(f"   Correct: {motion_qs[i]['correct_answer']}")


print("\n--- Testing Units & Measurements ---")
units_qs = parse_pdf_questions(r"C:\Users\chary\Downloads\JEE Main Units & Measurements Previous Year Questions with Answer Key.pdf")
for i in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]:
    if i in units_qs:
        print(f"Q{i}: text: {units_qs[i]['text'][:60]}...")
        print(f"   Opts: {units_qs[i]['options']}")
        print(f"   Correct: {units_qs[i]['correct_answer']}")
