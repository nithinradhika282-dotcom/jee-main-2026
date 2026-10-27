import urllib.request
import re

url = "https://questions.examside.com/past-years/jee/question/pthe-percentage-error-in-the-calculated-volume-of-a-sphere-jee-main-physics-units-and-measurements-5h9tltwlmgoaxcmz"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
html = urllib.request.urlopen(req, timeout=10).read().decode("utf-8", errors="ignore")

# Find options block
opt_matches = re.findall(r'<div class="option" data-option="(\d+)"[^>]*>(.*?)</div>\s*(?=<div class="option"|</div>\s*<div class="q-actions"|$)', html, re.DOTALL)
print("Option divs found:", len(opt_matches))

for idx, opt_html in opt_matches:
    badge_m = re.search(r'<span class="option-badge">([^<]+)</span>', opt_html)
    badge = badge_m.group(1) if badge_m else "?"
    is_correct = "tag-correct" in opt_html
    # clean content
    content_m = re.search(r'<div class="option-content[^"]*">(.*?)</div>', opt_html, re.DOTALL)
    clean_txt = re.sub(r'<[^>]+>', ' ', content_m.group(1)).strip() if content_m else ""
    clean_txt = re.sub(r'\s+', ' ', clean_txt)
    print(f"  Option {badge} ({'CORRECT' if is_correct else '       '}): {clean_txt}")
