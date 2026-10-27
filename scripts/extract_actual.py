with open("scripts/sample_question_detail.html", "r", encoding="utf-8") as f:
    html = f.read()

snippet = html[146000:152000]
with open("scripts/actual_question_body.html", "w", encoding="utf-8") as out:
    out.write(snippet)

print("Saved actual_question_body.html!")
