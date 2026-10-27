import urllib.request
import re

url = "https://questions.examside.com/past-years/jee/jee-main/physics/units-and-measurements"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
html = urllib.request.urlopen(req, timeout=10).read().decode("utf-8", errors="ignore")

# Find index of '8th April Evening Shift'
pos = html.find("8th April Evening Shift")
if pos != -1:
    snippet = html[max(0, pos-400):min(len(html), pos+2000)]
    print("Found question snippet around '8th April Evening Shift':")
    print(snippet)
    with open("scripts/question_dom_sample.html", "w", encoding="utf-8") as f:
        f.write(snippet)
else:
    print("Not found directly")
