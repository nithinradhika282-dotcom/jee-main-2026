with open("scripts/ingest_mega_bank.py", "r", encoding="utf-8") as f:
    code = f.read()

code = code.replace(r"\text{s}", r"\text{{s}}")
code = code.replace(r"\text{V}", r"\text{{V}}")

with open("scripts/ingest_mega_bank.py", "w", encoding="utf-8") as f:
    f.write(code)
print("Fixed all f-string braces!")
