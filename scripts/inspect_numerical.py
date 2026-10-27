import urllib.request
import re

url = "https://questions.examside.com/past-years/jee/jee-main/physics/units-and-measurements/integer"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
html = urllib.request.urlopen(req, timeout=10).read().decode("utf-8", errors="ignore")

pattern = r'<a class="preview-row" href="([^"]+)".*?<div class="preview-body">(.*?)</div>.*?<span class="badge badge-neutral">([^<]+)</span>'
matches = re.findall(pattern, html, re.DOTALL)

print(f"Total numerical preview rows in Units & Measurements: {len(matches)}")
for q_url, body, badge in matches[:5]:
    clean_body = re.sub(r'<[^>]+>', ' ', body).strip()
    clean_body = re.sub(r'\s+', ' ', clean_body)
    print(" - Badge:", badge.strip())
    print("   URL:", q_url)
    print("   Snippet:", clean_body[:80])
