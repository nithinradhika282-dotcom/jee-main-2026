import re

with open("scripts/sample_page.html", "r", encoding="utf-8") as f:
    pass

import urllib.request
url = "https://questions.examside.com/past-years/jee/jee-main/physics/units-and-measurements"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
html = urllib.request.urlopen(req, timeout=10).read().decode("utf-8", errors="ignore")

# Find blocks where JEE Main is mentioned
blocks = re.findall(r'(<div[^>]*>.*?JEE Main 202[3-6].*?</div>)', html, re.DOTALL)
print(f"Total blocks matching: {len(blocks)}")
if blocks:
    print("Sample block 1 (first 1000 chars):")
    print(blocks[0][:1000])
