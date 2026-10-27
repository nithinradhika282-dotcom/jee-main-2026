import urllib.request
import re

url = "https://questions.examside.com/past-years/jee/jee-main/physics/units-and-measurements"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})

try:
    with urllib.request.urlopen(req, timeout=10) as response:
        html = response.read().decode("utf-8", errors="ignore")
        print("Page fetched! Length:", len(html))
        
        # Check Next.js __NEXT_DATA__ or embedded JSON
        next_data = re.search(r'<script id="__NEXT_DATA__" type="application/json">({.*?})</script>', html)
        if next_data:
            print("Found __NEXT_DATA__!")
            data = next_data.group(1)
            print("NEXT_DATA length:", len(data))
            # save snippet to inspect
            with open("scripts/sample_next_data.json", "w", encoding="utf-8") as f:
                f.write(data)
        else:
            print("No __NEXT_DATA__ found, checking HTML structure...")
            snippets = re.findall(r'<div class="[^"]*question[^"]*".*?</div>', html, re.DOTALL)
            print("Question div count:", len(snippets))
            with open("scripts/sample_page.html", "w", encoding="utf-8") as f:
                f.write(html[:50000])

except Exception as e:
    print("Error:", e)
