import json

with open("scripts/audit_report.json", "r", encoding="utf-8") as f:
    data = json.load(f)

print("Total checked:", data["total_checked"])
print("Number fixed:", data["number_fixed"])
print("Number needing review:", data["number_needing_review"])
print("Number missing figures:", data["number_missing_figures"])

print("\nSample Fixed Questions:")
for q in data["fixed_questions"][:5]:
    print(f"  Q.{q['qnum']} ({q['subject']} - {q['chapter']}) ID: {q['id']}")
    print(f"    Text: {q['text']}...")
    print(f"    Options: {q['options']}")
    print(f"    Correct: {q['correct_letter']} -> '{q['correct_option_text']}'")

print("\nMissing Figures Sample:")
for mf in data["missing_figures"][:5]:
    print(f"  Q.{mf['qnum']} ({mf['subject']} - {mf['chapter']}) ID: {mf['id']}")
    print(f"    Text: {mf['text']}...")
