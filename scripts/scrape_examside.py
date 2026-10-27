import urllib.request
import re
import json

url = "https://questions.examside.com/past-years/jee/jee-main"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})

try:
    with urllib.request.urlopen(req, timeout=10) as response:
        html = response.read().decode("utf-8", errors="ignore")
        print("Page fetched! Length:", len(html))
        
        # Look for links
        links = re.findall(r'href=["\'](/past-years/jee/jee-main/[^"\']+)["\']', html)
        print("Found links count:", len(links))
        for l in links[:15]:
            print(" -", l)

        # Look for years mentioned
        years = set(re.findall(r'202[3-6]', html))
        print("Years found in HTML:", sorted(list(years)))

except Exception as e:
    print("Error:", e)
