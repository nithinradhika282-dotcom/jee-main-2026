import urllib.request
import re

url = "https://questions.examside.com/past-years/jee/jee-main/physics/units-and-measurements"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})

with urllib.request.urlopen(req, timeout=10) as response:
    html = response.read().decode("utf-8", errors="ignore")

years = set(re.findall(r'202[0-6]', html))
print("All 2020-2026 occurrences in full HTML:", years)

# Look for titles or headings or links
jee_matches = re.findall(r'JEE\s+Main\s+202[0-6][^<]+', html, re.IGNORECASE)
print(f"JEE Main year mentions ({len(jee_matches)}):")
for m in jee_matches[:10]:
    print(" -", m.strip())

# Look for script tags or data
scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
print(f"Total script tags: {len(scripts)}")
for s in scripts:
    if "question" in s.lower() or "202" in s:
        print("Found relevant script! Length:", len(s))
        with open("scripts/relevant_script.txt", "w", encoding="utf-8") as f:
            f.write(s[:20000])
        break
