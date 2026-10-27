import urllib.request
import re

test_urls = [
    "https://questions.examside.com/past-years/jee/question/pa-new-unit--alpha--of-length-is-chosen-such-that-it-jee-main-physics-units-and-measurements-bmoapcrwhuqsejpo",
    "https://questions.examside.com/past-years/jee/question/pconsider-the-equation-hfracxp-epsilonq-erts-jee-main-physics-units-and-measurements-wmjpngtr8yy9iy5v",
    "https://questions.examside.com/past-years/jee/question/pthe-percentage-error-in-the-calculated-volume-of-a-sphere-jee-main-physics-units-and-measurements-5h9tltwlmgoaxcmz",
    "https://questions.examside.com/past-years/jee/question/pthe-dimension-of--sqrtfracmu0epsilon0--is-e-jee-main-physics-6mwpuisydfwarraw"
]

for url in test_urls:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        html = urllib.request.urlopen(req, timeout=10).read().decode("utf-8", errors="ignore")
        m_desc = re.search(r'<meta property="og:description" content="([^"]+)"', html)
        desc = m_desc.group(1) if m_desc else "No desc"

        # Check correct answer
        m_opt = re.search(r'<div class="option" data-option="(\d+)"[^>]*>.*?tag-correct', html, re.DOTALL)
        correct_idx = m_opt.group(1) if m_opt else "None"
        correct_letter = chr(65 + int(correct_idx)) if correct_idx != "None" else "None"

        # Check badge
        m_badge = re.search(r'<span class="badge badge-neutral">([^<]+)</span>', html)
        badge = m_badge.group(1) if m_badge else "No badge"

        print("---")
        print("URL:", url.split("/")[-1][:40] + "...")
        print("Shift:", badge)
        print("Correct Option:", correct_letter)
        print("Meta Question:", desc[:140])
    except Exception as e:
        print("Error fetching", url, e)
