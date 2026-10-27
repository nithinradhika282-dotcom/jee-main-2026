import sqlite3

DB_PATH = r"C:\Users\chary\.gemini\antigravity\scratch\jee-main-2026\prisma\dev.db"
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

# 1. Ensure no_pen_shortcut column exists in predicted_questions
c.execute("PRAGMA table_info(predicted_questions)")
cols = [r[1] for r in c.fetchall()]
if "no_pen_shortcut" not in cols:
    c.execute("ALTER TABLE predicted_questions ADD COLUMN no_pen_shortcut TEXT")
    conn.commit()

# 2. Update shortcuts with proper KaTeX formulas
shortcuts = {
    "7a3a142d-2451-4b56-a5ed-8150bf52d519": "Mental elimination: Since $I_g = 2\\,\\text{mA} \\ll I = 5\\,\\text{A}$, current branch ratio is $S \\approx \\frac{I_g G}{I} = \\frac{2 \\times 10^{-3} \\times 50}{5} = \\frac{0.10}{5} = 0.02\\,\\Omega$ in under 10 seconds without rough paper!",
    "ec80b17e-bfc7-4e31-bd4e-9d2019ea9e1c": "Mental trick: By Kohlrausch law, to find $\\text{CH}_3\\text{COOH}$, add the salt with acetate ($\\text{CH}_3\\text{COONa}$) + acid with $\\text{H}^+$ ($\\text{HCl}$) and subtract bystander ($\\text{NaCl}$). Direct elimination in 5 seconds!",
    "0779b3e7-cd64-48e3-933b-89aaedffc94a": "Mental symmetry: King's property removes $x$ to give $\\frac{\\pi}{2} \\int_0^\\pi \\frac{\\sin x}{1 + \\cos^2 x}\\,dx$. The standard integral $\\int_{-1}^1 \\frac{du}{1 + u^2} = \\frac{\\pi}{2}$. Multiply: $\\frac{\\pi}{2} \\times \\frac{\\pi}{2} = \\frac{\\pi^2}{4}$ directly!"
}

for qid, sc in shortcuts.items():
    c.execute("UPDATE predicted_questions SET no_pen_shortcut = ? WHERE id = ?", (sc, qid))

conn.commit()
print("Updated no_pen_shortcut in predicted_questions table successfully!")
