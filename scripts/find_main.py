with open("scripts/sample_question_detail.html", "r", encoding="utf-8") as f:
    html = f.read()

# Find the body content for question
body_pos = html.find('<main')
if body_pos != -1:
    main_snippet = html[body_pos:body_pos+8000]
    with open("scripts/main_snippet.html", "w", encoding="utf-8") as out:
        out.write(main_snippet)
    print("Saved main_snippet.html! Length:", len(main_snippet))
else:
    print("No <main> found")
