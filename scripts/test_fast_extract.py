import urllib.request
import re
import json
import uuid
import os
import sqlite3

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "prisma", "dev.db")
BASE_URL = "https://questions.examside.com"

def clean_to_latex(text):
    if not text:
        return ""
    replacements = [
        ("\u03b1", r"\alpha"),
        ("\u03b2", r"\beta"),
        ("\u03b3", r"\gamma"),
        ("\u03b4", r"\delta"),
        ("\u03b5", r"\varepsilon"),
        ("\u03b8", r"\theta"),
        ("\u03bb", r"\lambda"),
        ("\u03bc", r"\mu"),
        ("\u03c0", r"\pi"),
        ("\u03c1", r"\rho"),
        ("\u03c3", r"\sigma"),
        ("\u03c4", r"\tau"),
        ("\u03c9", r"\omega"),
        ("\u03a9", r"\Omega"),
        ("\u221a", r"\sqrt"),
        ("\u2264", r"\le"),
        ("\u2265", r"\ge"),
        ("\u2260", r"\neq"),
        ("\u221e", r"\infty"),
        ("\u222b", r"\int"),
        ("\u00b1", r"\pm"),
        ("\u00d7", r"\times"),
        ("\u2192", r"\to"),
        ("\u00b0", r"^\circ")
    ]
    for old, new in replacements:
        text = text.replace(old, new)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def parse_shift(badge):
    y_m = re.search(r'202[3-6]', badge)
    year = int(y_m.group(0)) if y_m else 2026
    shift = 2 if "Evening" in badge or "Shift 2" in badge else 1
    session = 2 if "April" in badge or "Apr" in badge else 1

    d_m = re.search(r'(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)', badge)
    if d_m:
        day = int(d_m.group(1))
        m_name = d_m.group(2)[:3].lower()
        month = "04" if "apr" in m_name else "01"
        exam_date = f"{year}-{month}-{day:02d}"
    else:
        exam_date = f"{year}-01-21"

    return year, session, shift, exam_date

url = "https://questions.examside.com/past-years/jee/jee-main/physics/units-and-measurements"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
html = urllib.request.urlopen(req, timeout=10).read().decode("utf-8", errors="ignore")

pattern = r'<a class="preview-row" href="([^"]+)".*?<div class="preview-body">(.*?)</div>.*?<span class="badge badge-neutral">([^<]+)</span>'
matches = re.findall(pattern, html, re.DOTALL)

print(f"Total found in Units & Measurements: {len(matches)}")
for q_path, body, badge in matches[:5]:
    year, session, shift, exam_date = parse_shift(badge)
    clean_text = clean_to_latex(body)
    print(f"Year {year} | Shift {shift} | Date: {exam_date} | Text: {clean_text[:70]}...")
