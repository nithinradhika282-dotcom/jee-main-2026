import re

with open("scripts/sample_question_detail.html", "r", encoding="utf-8") as f:
    html = f.read()

# Check for data-mathml or annotation or alt
pos = html.find('<mjx-container')
if pos != -1:
    snippet = html[pos:pos+1500]
    print("Found mjx-container snippet:")
    print(snippet[:600])

# Check if there are data-tex or aria-label or title attributes
tex_attrs = re.findall(r'(data-tex="[^"]*"|aria-label="[^"]*"|alt="[^"]*")', html)
print("Math attributes found:", tex_attrs[:10])
