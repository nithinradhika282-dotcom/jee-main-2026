import re

with open("scripts/sample_question_detail.html", "r", encoding="utf-8") as f:
    html = f.read()

# Search for the question text "Consider the equation" in the body (not in the head meta tag)
matches = [m.start() for m in re.finditer("Consider the equation", html)]
print("Matches found at indices:", matches)

if len(matches) > 1:
    second_pos = matches[1]
    snippet = html[second_pos-100:second_pos+1500]
    with open("scripts/second_occurrence.html", "w", encoding="utf-8") as out:
        out.write(snippet)
    print("Saved second_occurrence.html!")
