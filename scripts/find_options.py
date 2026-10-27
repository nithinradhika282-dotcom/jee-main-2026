with open("scripts/sample_question_detail.html", "r", encoding="utf-8") as f:
    html = f.read()

pos = html.find('class="options"')
if pos == -1:
    pos = html.find('class="q-options')
if pos == -1:
    pos = html.find('Correct Answer')

print("Found pos:", pos)
if pos != -1:
    snippet = html[pos:pos+3000]
    with open("scripts/options_snippet.html", "w", encoding="utf-8") as out:
        out.write(snippet)
    print("Saved options_snippet.html!")
