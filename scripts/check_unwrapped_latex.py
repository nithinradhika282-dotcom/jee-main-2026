import sqlite3, json, re

conn = sqlite3.connect(r'C:\Users\chary\.gemini\antigravity\scratch\jee-main-2026\prisma\dev.db')
c = conn.cursor()

c.execute('SELECT id, question_number, options_json FROM questions WHERE question_type = "MCQ"')
rows = c.fetchall()

latex_triggers = re.compile(r'(\\[a-zA-Z]+|[_^]\{|[a-zA-Z][_^][0-9a-zA-Z])')

unwrapped_count = 0
samples = []

for qid, qnum, opts_json in rows:
    if not opts_json: continue
    try:
        opts = json.loads(opts_json)
        for opt in opts:
            s = str(opt).strip()
            # If it contains LaTeX triggers but has NO dollar sign
            if '$' not in s and latex_triggers.search(s):
                unwrapped_count += 1
                if len(samples) < 15:
                    samples.append((qid, s))
    except Exception as e:
        pass

print(f"Total unwrapped LaTeX options without dollar delimiters: {unwrapped_count}")
print("\nSample unwrapped options:")
for qid, s in samples:
    print(f"  [{qid}]: {s}")
