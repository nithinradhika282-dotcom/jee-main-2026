import urllib.request
import re

url = "https://questions.examside.com/past-years/jee/jee-main/physics/units-and-measurements"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
html = urllib.request.urlopen(req, timeout=10).read().decode("utf-8", errors="ignore")

# Find all preview rows
# <a class="preview-row" href="(/past-years/jee/question/[^"]+)"
# <span class="badge badge-neutral">(JEE Main 202[3-6][^<]+)</span>
pattern = r'<a class="preview-row" href="([^"]+)".*?<div class="preview-body">(.*?)</div>.*?<span class="badge badge-neutral">([^<]+)</span>'
matches = re.findall(pattern, html, re.DOTALL)

print(f"Total question preview rows in Units & Measurements: {len(matches)}")
by_year = {}
for q_url, body, badge in matches:
    # check year
    y_match = re.search(r'202[3-6]', badge)
    if y_match:
        yr = y_match.group(0)
        by_year[yr] = by_year.get(yr, 0) + 1

print("Questions in Units & Measurements by Year (2023-2026):")
for yr, cnt in sorted(by_year.items(), reverse=True):
    print(f"  {yr}: {cnt} questions")

# Print first 3 matches
for q_url, body, badge in matches[:3]:
    clean_body = re.sub(r'<[^>]+>', ' ', body).strip()
    clean_body = re.sub(r'\s+', ' ', clean_body)
    print("\n---")
    print("Badge:", badge.strip())
    print("URL:", q_url)
    print("Text:", clean_body[:120])
