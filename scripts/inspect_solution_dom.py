with open("scripts/sample_question_detail.html", "r", encoding="utf-8") as f:
    html = f.read()

# Find 'explanation' or 'solution' or 'answer'
pos = html.find('class="solution')
if pos == -1:
    pos = html.find('class="answer')
if pos == -1:
    pos = html.find('class="q-solution')

print("Solution pos:", pos)
if pos != -1:
    print(html[pos:pos+1500])
else:
    # search for 'Correct Answer'
    pos2 = html.find('tag-correct')
    print("tag-correct pos:", pos2)
    if pos2 != -1:
        print(html[pos2-200:pos2+1000])
