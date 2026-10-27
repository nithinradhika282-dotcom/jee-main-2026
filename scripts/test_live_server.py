import urllib.request
import json

req = urllib.request.Request('http://localhost:3000/api/chapters', headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        chapters = data.get('chapters', [])
        print(f"Total chapters returned by API: {len(chapters)}")
        under_50 = [c for c in chapters if c.get('question_count', 0) < 50]
        print(f"Chapters with < 50 questions: {len(under_50)}")
        print("\nAll 60 chapters question count status:")
        for c in chapters:
            print(f"[{c['subject'][:4]}] {c['name']:<48} count = {c['question_count']}")
except Exception as e:
    print(f"Error connecting to server: {e}")
