import re

with open("scripts/sample_question_detail.html", "r", encoding="utf-8") as f:
    html = f.read()

pos = html.find("Consider the equation")
if pos != -1:
    snippet = html[pos:pos+2500]
    with open("scripts/snippet_utf8.txt", "w", encoding="utf-8") as out:
        out.write(snippet)
    print("Saved snippet_utf8.txt successfully!")
