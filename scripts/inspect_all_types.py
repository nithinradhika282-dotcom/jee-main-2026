import urllib.request
import re

url = "https://questions.examside.com/past-years/jee/jee-main/physics/units-and-measurements"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
html = urllib.request.urlopen(req, timeout=10).read().decode("utf-8", errors="ignore")

pattern = r'<a class="preview-row" href="([^"]+)".*?<div class="preview-body">(.*?)</div>.*?<span class="badge badge-neutral">([^<]+)</span>'
matches = re.findall(pattern, html, re.DOTALL)

years = {}
for q_url, body, badge in matches:
    y_match = re.search(r'202[3-6]', badge)
    if y_match:
        yr = y_match.group(0)
        years.setdefault(yr, []).append((q_url, badge.strip()))

for yr in sorted(years.keys(), reverse=True):
    print(f"Year {yr}: {len(years[yr])} questions found. Samples:")
    for q_url, badge in years[yr][:2]:
        print(f"   [{badge}] {q_url}")
