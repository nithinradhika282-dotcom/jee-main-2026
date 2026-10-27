import sqlite3, json

DB_PATH = r"C:\Users\chary\.gemini\antigravity\scratch\jee-main-2026\prisma\dev.db"
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

data = [
    (
        json.dumps(["$0.02\\,\\Omega$", "$0.2\\,\\Omega$", "$0.05\\,\\Omega$", "$2.0\\,\\Omega$"]),
        "$0.02\\,\\Omega$",
        "Mental elimination: Since $I_g = 2\\,\\text{mA} \\ll I = 5\\,\\text{A}$, current branch ratio is $S \\approx \\frac{I_g G}{I} = \\frac{2 \\times 10^{-3} \\times 50}{5} = \\frac{0.10}{5} = 0.02\\,\\Omega$ in under 10 seconds without rough paper!",
        "7a3a142d-2451-4b56-a5ed-8150bf52d519"
    ),
    (
        json.dumps([
            "$\\text{CH}_3\\text{COONa},\\,\\text{HCl},\\,\\text{NaCl}$",
            "$\\text{CH}_3\\text{COOK},\\,\\text{NaOH},\\,\\text{KCl}$",
            "$\\text{CH}_3\\text{COONa},\\,\\text{NaOH},\\,\\text{HCl}$",
            "$\\text{CH}_3\\text{COOH},\\,\\text{NaCl},\\,\\text{HCl}$"
        ]),
        "$\\text{CH}_3\\text{COONa},\\,\\text{HCl},\\,\\text{NaCl}$",
        "Mental trick: By Kohlrausch law, to find $\\text{CH}_3\\text{COOH}$, add the salt with acetate ($\\text{CH}_3\\text{COONa}$) + acid with $\\text{H}^+$ ($\\text{HCl}$) and subtract bystander ($\\text{NaCl}$). Direct elimination in 5 seconds!",
        "ec80b17e-bfc7-4e31-bd4e-9d2019ea9e1c"
    ),
    (
        json.dumps(["$\\frac{\\pi^2}{4}$", "$\\frac{\\pi^2}{2}$", "$\\frac{\\pi}{4}$", "$\\pi^2$"]),
        "$\\frac{\\pi^2}{4}$",
        "Mental symmetry: King's property removes $x$ to give $\\frac{\\pi}{2} \\int_0^\\pi \\frac{\\sin x}{1 + \\cos^2 x}\\,dx$. The standard integral $\\int_{-1}^1 \\frac{du}{1 + u^2} = \\frac{\\pi}{2}$. Multiply: $\\frac{\\pi}{2} \\times \\frac{\\pi}{2} = \\frac{\\pi^2}{4}$ directly!",
        "0779b3e7-cd64-48e3-933b-89aaedffc94a"
    )
]

for opts, corr, sc, qid in data:
    c.execute("""
        UPDATE predicted_questions
        SET options_json = ?, correct_answer = ?, no_pen_shortcut = ?
        WHERE id = ?
    """, (opts, corr, sc, qid))

conn.commit()
print("Successfully restored predicted questions options and shortcuts!")
