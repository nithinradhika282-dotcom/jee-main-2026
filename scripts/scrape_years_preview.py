import urllib.request
import re

base_url = "https://questions.examside.com"
main_url = "https://questions.examside.com/past-years/jee/jee-main"

req = urllib.request.Request(main_url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
html = urllib.request.urlopen(req, timeout=10).read().decode("utf-8", errors="ignore")

# Find chapter links
chapter_links = re.findall(r'href=["\'](/past-years/jee/jee-main/(?:physics|chemistry|mathematics)/[a-z0-9-]+)["\']', html)
chapter_links = sorted(list(set(chapter_links)))

print(f"Total unique chapter links found: {len(chapter_links)}")
for l in chapter_links[:10]:
    print(" -", l)

# Count by subject
phys = [l for l in chapter_links if "/physics/" in l]
chem = [l for l in chapter_links if "/chemistry/" in l]
math = [l for l in chapter_links if "/mathematics/" in l]
print(f"Physics chapters: {len(phys)}, Chemistry chapters: {len(chem)}, Mathematics chapters: {len(math)}")
