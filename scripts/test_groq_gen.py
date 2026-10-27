import urllib.request, json, os

groq_key = os.getenv('GROQ_API_KEY', '')
payload = {
    'model': 'qwen/qwen3.8-27b',
    'messages': [{
        'role': 'user', 
        'content': 'Output a JSON object with key "questions", containing 2 authentic JEE Main PYQs for Continuity and Differentiability with question_text_latex, options (array of 4 LaTeX strings), correct_answer (A/B/C/D), hint, approach, full_solution_latex, common_mistake, no_pen_trick.'
    }],
    'response_format': {'type': 'json_object'},
    'temperature': 0.3
}

req = urllib.request.Request(
    'https://api.groq.com/openai/v1/chat/completions',
    headers={'Authorization': f'Bearer {groq_key}', 'Content-Type': 'application/json'},
    data=json.dumps(payload).encode('utf-8')
)

try:
    with urllib.request.urlopen(req) as resp:
        print('Limit requests:', resp.headers.get('x-ratelimit-limit-requests'))
        print('Remaining requests:', resp.headers.get('x-ratelimit-remaining-requests'))
        print('Limit tokens:', resp.headers.get('x-ratelimit-limit-tokens'))
        print('Remaining tokens:', resp.headers.get('x-ratelimit-remaining-tokens'))
        data = json.loads(resp.read().decode('utf-8'))
        content = json.loads(data['choices'][0]['message']['content'])
        print(f"Generated {len(content.get('questions', []))} questions successfully!")
        print("Sample Q1 text:", content['questions'][0]['question_text_latex'])
except Exception as e:
    print('Error:', e)
