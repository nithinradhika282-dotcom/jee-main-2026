import urllib.request
import re

url = "https://questions.examside.com/past-years/jee/jee-main/physics/units-and-measurements"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
html = urllib.request.urlopen(req, timeout=10).read().decode("utf-8", errors="ignore")

# Find all script contents
scripts = re.findall(r'<script([^>]*)>(.*?)</script>', html, re.DOTALL)
for attrs, content in scripts:
    print("Script attrs:", attrs[:50], "Length:", len(content))
    if len(content) > 500:
        print("Preview:", content[:300])
        with open("scripts/big_script.txt", "w", encoding="utf-8") as f:
            f.write(content)
