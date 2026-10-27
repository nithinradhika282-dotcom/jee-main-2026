import urllib.request
import re

url = "https://questions.examside.com/past-years/jee/question/pconsider-the-equation-hfracxp-epsilonq-erts-jee-main-physics-units-and-measurements-wmjpngtr8yy9iy5v"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
html = urllib.request.urlopen(req, timeout=10).read().decode("utf-8", errors="ignore")

with open("scripts/sample_question_detail.html", "w", encoding="utf-8") as f:
    f.write(html)

print("Fetched question detail! Length:", len(html))

# Look for math, options, answers
answers = re.findall(r'(Option [A-D]|Correct Answer|Answer key|Key)[^<]*', html, re.I)
print("Answers found:", answers)

# Check for JSON data or LD+JSON
ld = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.DOTALL)
print("LD+JSON count:", len(ld))
if ld:
    print("LD+JSON content:")
    print(ld[0][:500])
