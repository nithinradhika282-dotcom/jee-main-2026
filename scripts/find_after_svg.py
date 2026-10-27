with open("scripts/sample_question_detail.html", "r", encoding="utf-8") as f:
    html = f.read()

# Find the end of MJX-SVG-global-cache
pos = html.find('</svg><!-- HTML_TAG_END -->')
if pos != -1:
    snippet = html[pos:pos+4000]
    with open("scripts/after_svg.html", "w", encoding="utf-8") as out:
        out.write(snippet)
    print("Found after_svg! Saved 4000 chars.")
else:
    print("Not found end of svg")
