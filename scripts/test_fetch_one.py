import urllib.request
import re

url = 'https://questions.examside.com/past-years/jee/question/pthe-dimensional-formula-of-latent-heat-is-p-jee-main-physics-motion-fqip5tyhnih04bub'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req, timeout=10).read().decode('utf-8', errors='ignore')

m = re.search(r'<div class="option" data-option="0"[^>]*>(.*?)</div>\s*<div class="option" data-option="1"', html, re.DOTALL)
if m:
    print("Full Option 0 HTML:")
    print(m.group(1))
