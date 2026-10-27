import sqlite3
import json
import uuid
import random
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "prisma", "dev.db")

def fill_tmpl(tmpl_str, params_dict):
    res = tmpl_str
    for k, v in params_dict.items():
        res = res.replace(f"<{k}>", str(v))
    return res

def get_db():
    return sqlite3.connect(DB_PATH)

def format_opt(opt):
    s = str(opt).strip()
    if ("\\" in s or any(c in s for c in "^_{}")) and not (s.startswith("$") and s.endswith("$")):
        return f"${s}$"
    return s

def insert_q(c, paper_id, subject, chapter, topic, q_num, q_type, q_text, options, correct_ans, hint, appr, sol, mistake, no_pen, exam_name="JEE Main", difficulty="medium"):
    q_id = f"q_{exam_name.lower().replace(' ', '_')[:4]}_{uuid.uuid4().hex[:10]}"
    formatted_options = [format_opt(o) for o in options]
    formatted_correct = format_opt(correct_ans)
    
    # Ensure formatted_correct is in formatted_options
    if formatted_correct not in formatted_options:
        formatted_options[0] = formatted_correct
    
    c.execute("""
        INSERT INTO questions (
            id, paper_id, subject, chapter, topic, question_number, question_type,
            question_text_latex, image_url, options_json, correct_answer, marks_correct,
            marks_negative, difficulty, source_page, needs_review, exam_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        q_id, paper_id, subject, chapter, topic, q_num, q_type,
        q_text, None, json.dumps(formatted_options), formatted_correct,
        4 if "JEE" in exam_name else 1, 1 if "JEE" in exam_name else 0,
        difficulty, 1, 0, exam_name
    ))

    c.execute("""
        INSERT INTO explanations (
            id, question_id, hint, approach, full_solution_latex, concept_used,
            common_mistake, similar_concept_tip, verified_against_key, confidence,
            no_pen_trick
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        str(uuid.uuid4()), q_id, hint, appr, sol,
        f"{chapter} - {topic}", mistake,
        "Always check boundary values and symmetry.",
        1, "high", no_pen
    ))

JEE_PAPERS = [
    "paper_2026_s1_jan21_shift1", "paper_2026_s1_20260124_shift1", "paper_2026_s2_20260408_shift2",
    "paper_2025_s1_20250128_shift2", "paper_2025_s2_20250408_shift2", "paper_2024_s1_20240131_shift1",
    "paper_2024_s2_20240409_shift2", "paper_2023_s1_20230125_shift1", "paper_2023_s2_20230415_shift1",
    "paper_2022_historic_20220625_shift1", "paper_2021_historic_20210316_shift1", "paper_2020_historic_20200902_shift1",
    "paper_2019_historic_20190109_shift1"
]

OTHER_PAPERS = [
    ("TS EAMCET", "paper_ts_eamcet_2026_shift1"),
    ("BITSAT", "paper_bitsat_2026_shift1"),
    ("VITEEE", "paper_viteee_2026_shift1"),
]

def main():
    conn = get_db()
    c = conn.cursor()

    # Define comprehensive chapter question templates for Mathematics
    math_templates = {
        # 1. Continuity and Differentiability
        "Continuity and Differentiability": [
            {
                "topic": "Continuity at a Point",
                "q": "Let $f(x) = \\begin{cases} \\frac{\\sin(<a>x)}{x}, & x < 0 \\\\ <b>x + <c>, & x \\ge 0 \\end{cases}$. If $f(x)$ is continuous at $x = 0$, then the value of $<c>$ is:",
                "params": [
                    {"a": 3, "b": 2, "c": 3, "ans": "3", "dist": ["0", "1", "6"]},
                    {"a": 5, "b": 4, "c": 5, "ans": "5", "dist": ["4", "0", "10"]},
                    {"a": 2, "b": 7, "c": 2, "ans": "2", "dist": ["7", "1", "-2"]},
                    {"a": 4, "b": 1, "c": 4, "ans": "4", "dist": ["1", "0", "8"]},
                ],
                "hint": "For continuity at $x = 0$, the Left Hand Limit $\\lim_{x \\to 0^-} f(x)$ must equal the Right Hand Limit and $f(0)$.",
                "appr": "Compute $\\lim_{x \\to 0^-} \\frac{\\sin(ax)}{x} = a$. Then set $f(0) = c = a$.",
                "sol": "For continuity at $x = 0$:\n$$\\lim_{x \\to 0^-} f(x) = \\lim_{x \\to 0^-} \\frac{\\sin(<a>x)}{x} = <a>$$\nAlso, $f(0) = <b>(0) + <c> = <c>$.\nFor continuity, $\\lim_{x \\to 0^-} f(x) = f(0) \\implies <c> = <a>$.",
                "mistake": "Dividing by $x$ without using the standard limit $\\lim_{x \\to 0} \\frac{\\sin(kx)}{x} = k$.",
                "no_pen": "Direct inspection: $\\lim_{x \\to 0^-} \\frac{\\sin(<a>x)}{x} = <a>$, while $f(0) = <c>$. Equate them instantly: $<c> = <a>$!"
            },
            {
                "topic": "Differentiability of Piecewise Functions",
                "q": "Let $f(x) = |x - <a>| + |x - <b>|$ where $<a> < <b>$. The number of points where $f(x)$ is NOT differentiable is:",
                "params": [
                    {"a": 2, "b": 5, "ans": "2", "dist": ["0", "1", "3"]},
                    {"a": 1, "b": 4, "ans": "2", "dist": ["1", "0", "4"]},
                    {"a": 3, "b": 8, "ans": "2", "dist": ["0", "2", "infinite"]},
                    {"a": -2, "b": 3, "ans": "2", "dist": ["1", "2", "0"]},
                ],
                "hint": "Check the sharp corners (vertices) of the absolute value functions.",
                "appr": "The function $g(x) = |x - c|$ has a sharp corner and is non-differentiable at $x = c$. The sum of two such functions is non-differentiable at each corner point.",
                "sol": "The function $f(x) = |x - <a>| + |x - <b>|$ is continuous everywhere on $\\mathbb{R}$.\nHowever, it possesses sharp kinks/corners at $x = <a>$ and $x = <b>$.\nLeft derivative at $x = <a>$ is $-2$, while right derivative is $0$.\nSimilarly at $x = <b>$, left derivative is $0$ and right derivative is $+2$.\nHence, $f'(x)$ fails to exist at exactly $2$ points: $x = <a>$ and $x = <b>$.",
                "mistake": "Thinking absolute value functions are non-differentiable over an entire interval.",
                "no_pen": "Sum of $n$ distinct linear absolute values $|x - c_i|$ has sharp corners at exactly the $n$ roots. Here $n = 2$, so answer is $2$ in 1 second!"
            },
            {
                "topic": "Points of Discontinuity of Greatest Integer Function",
                "q": "The number of points of discontinuity of the function $f(x) = [x]$ in the open interval $(<a>, <b>)$ is:",
                "params": [
                    {"a": 1, "b": 6, "ans": "4", "dist": ["5", "3", "6"]},
                    {"a": 0, "b": 5, "ans": "4", "dist": ["5", "3", "0"]},
                    {"a": 2, "b": 8, "ans": "5", "dist": ["6", "4", "7"]},
                    {"a": -3, "b": 2, "ans": "4", "dist": ["5", "3", "2"]},
                ],
                "hint": "The floor function $[x]$ has jump discontinuities at all integer values.",
                "appr": "Count the number of integers strictly lying between $a$ and $b$: $(b - a - 1)$.",
                "sol": "The greatest integer function $f(x) = [x]$ is discontinuous at every integer $k \\in \\mathbb{Z}$.\nIn the open interval $(<a>, <b>)$, the integers are $<a> + 1, <a> + 2, \\dots, <b> - 1$.\nTotal number of integer points $= (<b> - 1) - (<a> + 1) + 1 = <b> - <a> - 1$.\nSubstituting values gives <ans> points.",
                "mistake": "Including the boundary points $a$ and $b$ even though the interval is open.",
                "no_pen": "For open interval $(a, b)$, number of integers is simply $b - a - 1$. Calculate mentally!"
            }
        ],

        # 2. Straight Lines
        "Straight Lines": [
            {
                "topic": "Distance Between Parallel Lines",
                "q": "The perpendicular distance between the parallel lines $<a>x + <b>y + <c1> = 0$ and $<a>x + <b>y - <c2> = 0$ is:",
                "params": [
                    {"a": 3, "b": 4, "c1": 12, "c2": 8, "ans": "4", "dist": ["\\frac{4}{5}", "2", "\\frac{20}{7}"]},
                    {"a": 5, "b": 12, "c1": 20, "c2": 19, "ans": "3", "dist": ["\\frac{1}{13}", "2", "\\frac{39}{17}"]},
                    {"a": 6, "b": 8, "c1": 30, "c2": 20, "ans": "5", "dist": ["10", "1", "\\frac{25}{2}"]},
                    {"a": 8, "b": 15, "c1": 35, "c2": 16, "ans": "3", "dist": ["\\frac{51}{17}", "5", "1"]},
                ],
                "hint": "Use $d = \\frac{|C_1 - C_2|}{\\sqrt{A^2 + B^2}}$. Remember to include the negative sign of $C_2$.",
                "appr": "Coefficients of $x$ and $y$ are identical. Subtract $C_2 = -<c2>$ from $C_1 = <c1>$ to get $|<c1> - (-<c2>)| = <c1> + <c2>$. Divide by $\\sqrt{A^2 + B^2}$.",
                "sol": "Distance between parallel lines $Ax + By + C_1 = 0$ and $Ax + By + C_2 = 0$ is:\n$$d = \\frac{|C_1 - C_2|}{\\sqrt{A^2 + B^2}}$$\nHere $A = <a>, B = <b>, C_1 = <c1>, C_2 = -<c2>$.\n$$d = \\frac{|<c1> - (-<c2>)|}{\\sqrt{<a>^2 + <b>^2}} = \\frac{<c1> + <c2>}{\\sqrt{<a>^2 + <b>^2}} = <ans>$$",
                "mistake": "Subtracting $<c1> - <c2>$ instead of $<c1> - (-<c2>)$.",
                "no_pen": "Numerator is $<c1> + <c2>$. Denominator is Pythagorean hypotenuse $\\sqrt{<a>^2 + <b>^2}$. Compute mentally!"
            },
            {
                "topic": "Foot of Perpendicular from Origin",
                "q": "The foot of the perpendicular drawn from the origin $(0, 0)$ to the line $x + y - <a> = 0$ is:",
                "params": [
                    {"a": 4, "ans": "(2, 2)", "dist": ["(4, 0)", "(0, 4)", "(2, -2)"]},
                    {"a": 6, "ans": "(3, 3)", "dist": ["(6, 0)", "(0, 6)", "(3, -3)"]},
                    {"a": 8, "ans": "(4, 4)", "dist": ["(4, -4)", "(8, 0)", "(2, 6)"]},
                    {"a": 10, "ans": "(5, 5)", "dist": ["(5, -5)", "(0, 10)", "(10, 0)"]},
                ],
                "hint": "By symmetry, the line perpendicular to $x + y = a$ passing through origin is $y = x$.",
                "appr": "Substitute $y = x$ into $x + y = a$ to get $2x = a \\implies x = a/2, y = a/2$.",
                "sol": "The normal vector to the line $x + y = <a>$ is $(1, 1)$.\nThe perpendicular line through origin is $y = x$.\nIntersecting $x + y = <a>$ with $y = x$:\n$$x + x = <a> \\implies 2x = <a> \\implies x = \\frac{<a>}{2}$$\nThus the foot of the perpendicular is $(\\frac{<a>}{2}, \\frac{<a>}{2})$.",
                "mistake": "Using the line equation without setting $x = y$ for a symmetric $45^\\circ$ line.",
                "no_pen": "Line is $x + y = <a>$. By symmetry, foot is $(a/2, a/2)$ directly!"
            }
        ],

        # 3. Sets, Relations and Functions
        "Sets, Relations and Functions": [
            {
                "topic": "Number of Relations on a Finite Set",
                "q": "If set $A$ has $<a>$ elements, the number of reflexive relations on $A$ is:",
                "params": [
                    {"a": 3, "ans": "2^6 = 64", "dist": ["2^9 = 512", "2^3 = 8", "3^3 = 27"]},
                    {"a": 4, "ans": "2^{12} = 4096", "dist": ["2^{16} = 65536", "2^4 = 16", "4^4 = 256"]},
                    {"a": 2, "ans": "2^2 = 4", "dist": ["2^4 = 16", "2^1 = 2", "4^2 = 16"]},
                    {"a": 5, "ans": "2^{20}", "dist": ["2^{25}", "2^5", "5^2"]},
                ],
                "hint": "All $n$ diagonal pairs $(x, x)$ must be present. The remaining $n^2 - n$ pairs have 2 choices each.",
                "appr": "Formula for number of reflexive relations on a set with $n$ elements is $2^{n(n-1)}$.",
                "sol": "In $A \\times A$, there are $n^2$ total ordered pairs.\nFor a relation to be reflexive, all $n$ elements of the form $(a, a)$ MUST be included.\nThe remaining $n^2 - n = n(n-1)$ pairs can either be included or excluded independently.\nHence, total number of reflexive relations is $2^{n(n-1)} = 2^{<a>(<a>-1)} = <ans>$.",
                "mistake": "Using $2^{n^2}$ which gives the total number of all relations, not reflexive ones.",
                "no_pen": "Reflexive formula is $2^{n(n-1)}$. Plug in $n = <a>$: $2^{<a> \\times (<a> - 1)}$ instantly!"
            },
            {
                "topic": "Domain of Real Function with Radicals",
                "q": "The domain of the real-valued function $f(x) = \\sqrt{<a> - x} + \\frac{1}{\\sqrt{x - <b>}}$ (where $<b> < <a>$) is:",
                "params": [
                    {"a": 7, "b": 2, "ans": "(2, 7]", "dist": ["[2, 7]", "(2, 7)", "[2, 7)"]},
                    {"a": 5, "b": 1, "ans": "(1, 5]", "dist": ["[1, 5]", "(1, 5)", "[1, 5)"]},
                    {"a": 9, "b": 4, "ans": "(4, 9]", "dist": ["[4, 9]", "(4, 9)", "[4, 9)"]},
                    {"a": 6, "b": 0, "ans": "(0, 6]", "dist": ["[0, 6]", "(0, 6)", "[0, 6)"]},
                ],
                "hint": "Inside numerator square root: $a - x \\ge 0$. Inside denominator square root: $x - b > 0$.",
                "appr": "From $\\sqrt{a - x}$, $x \\le a$. From $\\frac{1}{\\sqrt{x - b}}$, $x > b$. Combine: $b < x \\le a$.",
                "sol": "For $f(x)$ to be defined in $\\mathbb{R}$:\n1. $<a> - x \\ge 0 \\implies x \\le <a>$.\n2. Denominator cannot be zero and must be positive: $x - <b> > 0 \\implies x > <b>$.\nIntersection of domains: $<b> < x \\le <a>$, which is $(<b>, <a>]$.",
                "mistake": "Using a closed bracket $[b$ at the denominator root, which causes division by zero.",
                "no_pen": "Denominator means strictly greater ($($), numerator allows zero ($]$). Result: $(<b>, <a>]$ in 2 seconds!"
            }
        ],

        # 4. Relations and Functions (Class 12)
        "Relations and Functions": [
            {
                "topic": "Equivalence Relations and Equivalence Classes",
                "q": "Let $R$ be a relation on the set of integers $\\mathbb{Z}$ defined by $aRb \\iff a - b$ is divisible by $<a>$. Then the number of distinct equivalence classes of $R$ is:",
                "params": [
                    {"a": 3, "ans": "3", "dist": ["1", "2", "infinite"]},
                    {"a": 5, "ans": "5", "dist": ["1", "4", "25"]},
                    {"a": 7, "ans": "7", "dist": ["6", "1", "14"]},
                    {"a": 4, "ans": "4", "dist": ["2", "8", "16"]},
                ],
                "hint": "Look at the possible remainders when any integer is divided by $a$.",
                "appr": "By the Division Algorithm, any integer $n$ can be written as $n = aq + r$ where $r \\in \\{0, 1, \\dots, a-1\\}$. Each remainder defines a unique equivalence class.",
                "sol": "The relation is congruence modulo $<a>$:\n$$a \\equiv b \\pmod{<a>}$$\nEvery integer $z \\in \\mathbb{Z}$ leaves a remainder $r \\in \\{0, 1, \\dots, <a> - 1\\}$ when divided by $<a>$.\nTherefore, there are exactly $<a>$ distinct equivalence classes: $[0], [1], \\dots, [<a> - 1]$.",
                "mistake": "Thinking there are infinite equivalence classes because $\\mathbb{Z}$ is infinite.",
                "no_pen": "Modulo $<a>$ has exactly $<a>$ remainders $\\{0, \\dots, <a>-1\\}$, hence $<a>$ equivalence classes. Direct recall!"
            },
            {
                "topic": "One-One and Onto Functions",
                "q": "Let $f: \\mathbb{R} \\to \\mathbb{R}$ be defined by $f(x) = x^3 + <a>$. Then $f$ is:",
                "params": [
                    {"a": 1, "ans": "Bijective (One-One and Onto)", "dist": ["One-One but not Onto", "Onto but not One-One", "Neither One-One nor Onto"]},
                    {"a": 5, "ans": "Bijective (One-One and Onto)", "dist": ["One-One but not Onto", "Onto but not One-One", "Neither One-One nor Onto"]},
                    {"a": -2, "ans": "Bijective (One-One and Onto)", "dist": ["One-One but not Onto", "Onto but not One-One", "Neither One-One nor Onto"]},
                ],
                "hint": "Check the derivative $f'(x)$ to test monotonicity, and find the limits as $x \\to \\pm \\infty$.",
                "appr": "$f'(x) = 3x^2 \\ge 0$ for all $x$, strictly increasing except at $x=0$, so it is one-one. Range is $(-\\infty, \\infty) = \\mathbb{R}$, so it is onto.",
                "sol": "1. Injectivity: $f'(x) = 3x^2 > 0$ for all $x \\ne 0$. Hence $f(x)$ is strictly increasing on $\\mathbb{R}$, which implies it is injective (one-one).\n2. Surjectivity: As $x \\to \\infty, f(x) \\to \\infty$ and as $x \\to -\\infty, f(x) \\to -\\infty$. Since $f$ is continuous, by intermediate value theorem its range is $\\mathbb{R}$.\nThus, $f$ is both one-one and onto (bijective).",
                "mistake": "Confusing $x^3$ with even powers like $x^2$ which are neither one-one nor onto on $\\mathbb{R}$.",
                "no_pen": "Odd degree polynomials with positive leading coefficient have range $\\mathbb{R}$ and strictly increasing $x^3$ is always bijective!"
            }
        ],

        # 5. Statistics and Probability (Class 11)
        "Statistics and Probability": [
            {
                "topic": "Variance Under Scaling and Shifting",
                "q": "If the variance of observations $x_1, x_2, \\dots, x_n$ is $\\sigma^2 = <v>$, then the variance of the transformed data $<a>x_1 + <b>, <a>x_2 + <b>, \\dots, <a>x_n + <b>$ is:",
                "params": [
                    {"v": 4, "a": 3, "b": 5, "ans": "36", "dist": ["12", "17", "41"]},
                    {"v": 5, "a": 2, "b": 7, "ans": "20", "dist": ["10", "27", "25"]},
                    {"v": 9, "a": 2, "b": 1, "ans": "36", "dist": ["18", "19", "81"]},
                    {"v": 3, "a": 4, "b": 8, "ans": "48", "dist": ["12", "20", "56"]},
                ],
                "hint": "Adding a constant does not change variance. Multiplying by $a$ multiplies variance by $a^2$.",
                "appr": "Apply property $\\text{Var}(aX + b) = a^2 \\text{Var}(X)$.",
                "sol": "Variance is independent of origin shift ($+<b>$) but quadratic in scale ($<a>$):\n$$\\text{Var}(<a>X + <b>) = <a>^2 \\cdot \\text{Var}(X) = <a>^2 \\cdot <v> = <ans>$$",
                "mistake": "Adding $b$ to the variance or multiplying by $a$ instead of $a^2$.",
                "no_pen": "Ignore $+<b>$ completely! Multiply variance $<v>$ by $<a>^2$: $<v> \\times <a>^2 = <ans>$. 2 seconds!"
            },
            {
                "topic": "Standard Deviation of First n Natural Numbers",
                "q": "The variance of the first $n$ natural numbers $1, 2, 3, \\dots, n$ is given by:",
                "params": [
                    {"n": "n", "ans": "\\frac{n^2 - 1}{12}", "dist": ["\\frac{n^2 + 1}{12}", "\\frac{n(n+1)}{12}", "\\frac{n^2 - 1}{6}"]},
                ],
                "hint": "Use $\\sigma^2 = \\frac{\\sum x^2}{n} - (\\bar{x})^2$.",
                "appr": "Substitute $\\sum x = \\frac{n(n+1)}{2}$ and $\\sum x^2 = \\frac{n(n+1)(2n+1)}{6}$ into the variance formula.",
                "sol": "Mean $\\bar{x} = \\frac{n+1}{2}$.\n$$\\frac{\\sum x^2}{n} = \\frac{(n+1)(2n+1)}{6}$$\n$$\\sigma^2 = \\frac{(n+1)(2n+1)}{6} - \\frac{(n+1)^2}{4} = \\frac{n+1}{12}[2(2n+1) - 3(n+1)] = \\frac{n^2 - 1}{12}$$",
                "mistake": "Using $n^2/12$ or forgetting the $-1$ term in the numerator.",
                "no_pen": "Famous standard formula: $\\sigma^2 = \\frac{n^2 - 1}{12}$. Direct memory recall!"
            }
        ],

        # 6. Introduction to Three-Dimensional Geometry (Class 11)
        "Introduction to Three-Dimensional Geometry": [
            {
                "topic": "Distance of a Point from Coordinate Axes",
                "q": "The distance of the point $P(<a>, <b>, <c>)$ from the $z$-axis is:",
                "params": [
                    {"a": 3, "b": 4, "c": 5, "ans": "5", "dist": ["\\sqrt{41}", "\\sqrt{34}", "3"]},
                    {"a": 6, "b": 8, "c": 10, "ans": "10", "dist": ["\\sqrt{136}", "6", "8"]},
                    {"a": 5, "b": 12, "c": 7, "ans": "13", "dist": ["\\sqrt{193}", "12", "7"]},
                    {"a": 1, "b": 2, "c": 2, "ans": "\\sqrt{5}", "dist": ["3", "2", "1"]},
                ],
                "hint": "The projection of $(x, y, z)$ on the $z$-axis is $(0, 0, z)$.",
                "appr": "Distance to $z$-axis is $\\sqrt{x^2 + y^2}$.",
                "sol": "Any point on the $z$-axis has coordinates $(0, 0, z)$.\nThe foot of perpendicular from $P(<a>, <b>, <c>)$ on the $z$-axis is $N(0, 0, <c>)$.\nDistance $PN = \\sqrt{(<a> - 0)^2 + (<b> - 0)^2 + (<c> - <c>)^2} = \\sqrt{<a>^2 + <b>^2} = <ans>$.",
                "mistake": "Including the $z$-coordinate in the square root, which gives distance from origin instead.",
                "no_pen": "Distance from $z$-axis drops $z$! Simply $\\sqrt{x^2 + y^2} = \\sqrt{<a>^2 + <b>^2} = <ans>$!"
            },
            {
                "topic": "Section Formula in 3D",
                "q": "The point which divides the line segment joining $A(1, -2, 3)$ and $B(4, <a>, -3)$ in the ratio $1 : 2$ internally has coordinates:",
                "params": [
                    {"a": 4, "ans": "(2, 0, 1)", "dist": ["(3, 1, 2)", "(2, 1, 0)", "(1, 0, 2)"]},
                    {"a": 7, "ans": "(2, 1, 1)", "dist": ["(2, 0, 1)", "(3, 2, 0)", "(1, 1, 1)"]},
                ],
                "hint": "Use $x = \\frac{m x_2 + n x_1}{m + n}, y = \\frac{m y_2 + n y_1}{m + n}, z = \\frac{m z_2 + n z_1}{m + n}$.",
                "appr": "Substitute $m=1, n=2$ and the coordinates of $A$ and $B$.",
                "sol": "Using internal division formula with $m : n = 1 : 2$:\n$$x = \\frac{1(4) + 2(1)}{1 + 2} = \\frac{6}{3} = 2$$\n$$y = \\frac{1(<a>) + 2(-2)}{3} = \\frac{<a> - 4}{3}$$\n$$z = \\frac{1(-3) + 2(3)}{3} = \\frac{3}{3} = 1$$\nResult coordinates: <ans>.",
                "mistake": "Reversing $m$ and $n$ in the section formula.",
                "no_pen": "Compute $x = (4 + 2)/3 = 2$ and $z = (-3 + 6)/3 = 1$. Instantly eliminates wrong options!"
            }
        ],

        # 7. Three-Dimensional Geometry (Class 12)
        "Three-Dimensional Geometry": [
            {
                "topic": "Angle Between Two Lines in 3D",
                "q": "If two lines have direction ratios $(<a>, <b>, <c>)$ and $(<b>, <c>, <a>)$, the condition for them to be perpendicular is:",
                "params": [
                    {"a": 1, "b": 2, "c": -1, "ans": "ab + bc + ca = 0", "dist": ["a + b + c = 0", "a^2 + b^2 + c^2 = 0", "abc = 1"]},
                    {"a": 2, "b": -1, "c": 1, "ans": "ab + bc + ca = 0", "dist": ["a = b = c", "a^3 + b^3 + c^3 = 0", "a + b = c"]},
                ],
                "hint": "Two vectors are perpendicular if and only if their scalar dot product is zero.",
                "appr": "Compute $\\vec{u} \\cdot \\vec{v} = a_1 a_2 + b_1 b_2 + c_1 c_2 = 0$.",
                "sol": "The direction vectors are $\\vec{d_1} = a\\hat{i} + b\\hat{j} + c\\hat{k}$ and $\\vec{d_2} = b\\hat{i} + c\\hat{j} + a\\hat{k}$.\nFor perpendicularity:\n$$\\vec{d_1} \\cdot \\vec{d_2} = 0 \\implies a(b) + b(c) + c(a) = 0 \\implies ab + bc + ca = 0$$",
                "mistake": "Confusing perpendicularity ($a_1 a_2 + b_1 b_2 + c_1 c_2 = 0$) with parallelism ($a_1/a_2 = b_1/b_2 = c_1/c_2$).",
                "no_pen": "Dot product of $(a, b, c)$ and $(b, c, a)$ is $ab + bc + ca = 0$ instantly!"
            },
            {
                "topic": "Shortest Distance Between Skew Lines",
                "q": "The shortest distance between lines $\\vec{r} = \\vec{a}_1 + \\lambda \\vec{b}_1$ and $\\vec{r} = \\vec{a}_2 + \\mu \\vec{b}_2$ is given by:",
                "params": [
                    {"ans": "\\frac{|(\\vec{a}_2 - \\vec{a}_1) \\cdot (\\vec{b}_1 \\times \\vec{b}_2)|}{|\\vec{b}_1 \\times \\vec{b}_2|}", "dist": ["\\frac{|(\\vec{a}_2 - \\vec{a}_1) \\times (\\vec{b}_1 \\times \\vec{b}_2)|}{|\\vec{b}_1 \\times \\vec{b}_2|}", "\\frac{|(\\vec{a}_2 - \\vec{a}_1) \\cdot (\\vec{b}_1 + \\vec{b}_2)|}{|\\vec{b}_1 + \\vec{b}_2|}", "\\frac{|\\vec{b}_1 \\times \\vec{b}_2|}{|\\vec{a}_2 - \\vec{a}_1|}"]},
                ],
                "hint": "The shortest distance vector is along the common perpendicular $\\vec{b}_1 \\times \\vec{b}_2$.",
                "appr": "Project $\\vec{a}_2 - \\vec{a}_1$ onto the unit vector along $\\vec{b}_1 \\times \\vec{b}_2$.",
                "sol": "The vector perpendicular to both lines is $\\vec{n} = \\vec{b}_1 \\times \\vec{b}_2$.\nThe shortest distance $d$ is the scalar projection of $(\\vec{a}_2 - \\vec{a}_1)$ onto $\\vec{n}$:\n$$d = \\frac{|(\\vec{a}_2 - \\vec{a}_1) \\cdot (\\vec{b}_1 \\times \\vec{b}_2)|}{|\\vec{b}_1 \\times \\vec{b}_2|}$$",
                "mistake": "Taking cross product with $\\vec{a}_2 - \\vec{a}_1$ instead of dot product in the numerator.",
                "no_pen": "Projection on unit normal is scalar triple product divided by magnitude of cross product!"
            }
        ],

        # 8. Permutations and Combinations
        "Permutations and Combinations": [
            {
                "topic": "Circular Permutation with Adjacent Elements",
                "q": "The number of ways in which $<a>$ people can be seated around a round table such that two particular people always sit together is:",
                "params": [
                    {"a": 6, "ans": "48", "dist": ["24", "120", "240"]},
                    {"a": 5, "ans": "12", "dist": ["24", "6", "48"]},
                    {"a": 7, "ans": "240", "dist": ["120", "720", "480"]},
                    {"a": 8, "ans": "1440", "dist": ["720", "5040", "2880"]},
                ],
                "hint": "Treat the two people as one combined unit. Arrange $(n-1)$ units around a circular table in $(n-2)!$ ways.",
                "appr": "Bundle the 2 people as 1 item. There are $(a - 2 + 1) = a - 1$ items to seat in a circle: $(a - 2)!$. Multiply by $2!$ for their internal arrangement.",
                "sol": "1. Tie the two people together as a single block: $(AB)$.\n2. Number of entities to arrange in a circle $= <a> - 2 + 1 = <a> - 1$.\n3. Number of circular arrangements of $(<a> - 1)$ entities $= (<a> - 1 - 1)! = (<a> - 2)!$.\n4. Within the block, $A$ and $B$ can interchange in $2! = 2$ ways.\nTotal ways $= (<a> - 2)! \\times 2 = <ans>$.",
                "mistake": "Forgetting to multiply by $2!$ for internal arrangement of the two people.",
                "no_pen": "Tie method on circle: $(n-2)! \\times 2!$. For $n = <a>$, $(<a> - 2)! \\times 2 = <ans>$!"
            },
            {
                "topic": "Distribution of Identical Items (Stars and Bars)",
                "q": "The number of non-negative integer solutions to the equation $x_1 + x_2 + x_3 = <a>$ is:",
                "params": [
                    {"a": 6, "ans": "28", "dist": ["21", "36", "15"]},
                    {"a": 8, "ans": "45", "dist": ["36", "55", "28"]},
                    {"a": 10, "ans": "66", "dist": ["55", "78", "45"]},
                    {"a": 5, "ans": "21", "dist": ["15", "28", "35"]},
                ],
                "hint": "Formula for non-negative solutions of $x_1 + \\dots + x_r = n$ is $\\binom{n + r - 1}{r - 1}$.",
                "appr": "Here $n = <a>$ and $r = 3$. Compute $\\binom{<a> + 3 - 1}{3 - 1} = \\binom{<a> + 2}{2}$.",
                "sol": "By stars and bars theorem, the number of non-negative integer solutions of $x_1 + x_2 + \\dots + x_r = n$ is:\n$$N = \\binom{n + r - 1}{r - 1}$$\nHere $n = <a>$ and $r = 3$ variables.\n$$N = \\binom{<a> + 3 - 1}{3 - 1} = \\binom{<a> + 2}{2} = \\frac{(<a> + 2)(<a> + 1)}{2} = <ans>$$",
                "mistake": "Using $\\binom{n-1}{r-1}$ which gives positive (non-zero) integer solutions instead of non-negative.",
                "no_pen": "For 3 variables: $\\binom{n+2}{2} = \\frac{(n+2)(n+1)}{2}$. Plug $n=<a>$: $\\frac{<a+2> \\times <a+1>}{2} = <ans>$!"
            }
        ],

        # 9. Applications of Integrals
        "Applications of Integrals": [
            {
                "topic": "Area Bounded by Parabola and Line",
                "q": "The area bounded by the parabola $y^2 = <a>x$ and the line $y = <b>x$ is:",
                "params": [
                    {"a": 4, "b": 1, "ans": "\\frac{8}{3}", "dist": ["\\frac{4}{3}", "\\frac{16}{3}", "8"]},
                    {"a": 8, "b": 2, "ans": "\\frac{4}{3}", "dist": ["\\frac{8}{3}", "\\frac{2}{3}", "\\frac{16}{3}"]},
                    {"a": 12, "b": 3, "ans": "\\frac{8}{9}", "dist": ["\\frac{16}{9}", "\\frac{4}{9}", "2"]},
                    {"a": 16, "b": 2, "ans": "\\frac{16}{3}", "dist": ["\\frac{32}{3}", "\\frac{8}{3}", "4"]},
                ],
                "hint": "Archimedes' formula for area between $y^2 = 4Ax$ and $y = mx$ is $\\text{Area} = \\frac{8A^2}{3m^3}$.",
                "appr": "Here $4A = <a> \\implies A = <a>/4$. Slope $m = <b>$. Area $= \\frac{8(<a>/4)^2}{3(<b>)^3}$.",
                "sol": "Intersection points: $(<b>x)^2 = <a>x \\implies x(<b>^2 x - <a>) = 0 \\implies x = 0$ or $x = \\frac{<a>}{<b>^2}$.\n$$\\text{Area} = \\int_0^{\\frac{<a>}{<b>^2}} (\\sqrt{<a>x} - <b>x) dx = \\left[ \\sqrt{<a>} \\frac{2}{3} x^{3/2} - \\frac{<b>x^2}{2} \\right]_0^{\\frac{<a>}{<b>^2}}$$\n$$= \\frac{8 A^2}{3 m^3} = <ans>$$",
                "mistake": "Integrating with respect to $y$ without changing limits or curves.",
                "no_pen": "Archimedes shortcut: $\\text{Area} = \\frac{8A^2}{3m^3}$. Direct algebraic substitution without integration!"
            },
            {
                "topic": "Area Bounded Between Two Parabolas",
                "q": "The area enclosed between the two parabolas $y^2 = <a>x$ and $x^2 = <a>y$ is:",
                "params": [
                    {"a": 4, "ans": "\\frac{16}{3}", "dist": ["\\frac{8}{3}", "4", "\\frac{32}{3}"]},
                    {"a": 6, "ans": "12", "dist": ["6", "18", "\\frac{36}{5}"]},
                    {"a": 3, "ans": "3", "dist": ["\\frac{9}{2}", "\\frac{3}{2}", "6"]},
                    {"a": 12, "ans": "48", "dist": ["24", "72", "36"]},
                ],
                "hint": "Standard formula for area between $y^2 = 4ax$ and $x^2 = 4ay$ is $\\frac{16a^2}{3}$.",
                "appr": "For $y^2 = 4Ax$ and $x^2 = 4By$, the area is $\\frac{16AB}{3}$. Here $4A = <a>, 4B = <a> \\implies \\text{Area} = \\frac{<a>^2}{3}$.",
                "sol": "The area enclosed between $y^2 = 4Ax$ and $x^2 = 4Ay$ is:\n$$\\text{Area} = \\frac{16A^2}{3}$$\nSince $4A = <a>$, we have $A = \\frac{<a>}{4}$.\n$$\\text{Area} = \\frac{16 (<a>/4)^2}{3} = \\frac{<a>^2}{3} = <ans>$$",
                "mistake": "Squaring $a$ and dividing by 6 instead of 3.",
                "no_pen": "Area between $y^2 = ax$ and $x^2 = ay$ is simply $\\frac{a^2}{3}$! Square $<a>$ and divide by $3$!"
            }
        ],

        # 10. Conic Sections
        "Conic Sections": [
            {
                "topic": "Eccentricity of Hyperbola and Conjugate",
                "q": "If $e_1$ is the eccentricity of the hyperbola $\\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1$ and $e_2$ is the eccentricity of its conjugate hyperbola, then $\\frac{1}{e_1^2} + \\frac{1}{e_2^2}$ equals:",
                "params": [
                    {"ans": "1", "dist": ["2", "\\frac{1}{2}", "0"]},
                ],
                "hint": "Use $e_1^2 = 1 + \\frac{b^2}{a^2} = \\frac{a^2+b^2}{a^2}$ and $e_2^2 = 1 + \\frac{a^2}{b^2} = \\frac{a^2+b^2}{b^2}$.",
                "appr": "Invert both expressions: $\\frac{1}{e_1^2} = \\frac{a^2}{a^2+b^2}$ and $\\frac{1}{e_2^2} = \\frac{b^2}{a^2+b^2}$. Add them together.",
                "sol": "For the hyperbola: $e_1^2 = 1 + \\frac{b^2}{a^2} = \\frac{a^2 + b^2}{a^2} \\implies \\frac{1}{e_1^2} = \\frac{a^2}{a^2 + b^2}$.\nFor the conjugate hyperbola: $e_2^2 = 1 + \\frac{a^2}{b^2} = \\frac{a^2 + b^2}{b^2} \\implies \\frac{1}{e_2^2} = \\frac{b^2}{a^2 + b^2}$.\n$$\\frac{1}{e_1^2} + \\frac{1}{e_2^2} = \\frac{a^2 + b^2}{a^2 + b^2} = 1$$",
                "mistake": "Assuming the sum is 2 or depends on the specific values of $a$ and $b$.",
                "no_pen": "Invariant property of conjugate hyperbolas: $\\frac{1}{e_1^2} + \\frac{1}{e_2^2} = 1$ always!"
            },
            {
                "topic": "Latus Rectum of Ellipse",
                "q": "The length of the latus rectum of the ellipse $<a>x^2 + <b>y^2 = <c>$ is:",
                "params": [
                    {"a": 9, "b": 16, "c": 144, "ans": "\\frac{9}{2}", "dist": ["\\frac{9}{4}", "\\frac{16}{3}", "3"]},
                    {"a": 16, "b": 25, "c": 400, "ans": "\\frac{32}{5}", "dist": ["\\frac{16}{5}", "\\frac{25}{4}", "8"]},
                    {"a": 4, "b": 9, "c": 36, "ans": "\\frac{8}{3}", "dist": ["\\frac{4}{3}", "3", "2"]},
                ],
                "hint": "Divide by $c$ to get standard form $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1$, then use $LR = \\frac{2b^2}{a}$.",
                "appr": "Identify $a^2$ (larger denominator) and $b^2$ (smaller denominator). Then $LR = \\frac{2(\\text{minor semi-axis})^2}{\\text{major semi-axis}}$.",
                "sol": "Dividing $<a>x^2 + <b>y^2 = <c>$ by $<c>$ gives the standard form $\\frac{x^2}{A^2} + \\frac{y^2}{B^2} = 1$.\nLength of latus rectum $= \\frac{2 B^2}{A} = <ans>$.",
                "mistake": "Confusing semi-major and semi-minor axes when calculating the ratio.",
                "no_pen": "$LR = \\frac{2b^2}{a}$. Quick mental substitution!"
            }
        ],

        # 11. Differential Equations
        "Differential Equations": [
            {
                "topic": "Integrating Factor of Linear Differential Equation",
                "q": "The integrating factor of the differential equation $\\frac{dy}{dx} + <a>y = e^{<b>x}$ is:",
                "params": [
                    {"a": 2, "b": 3, "ans": "e^{2x}", "dist": ["e^{3x}", "e^{-2x}", "2x"]},
                    {"a": 3, "b": 1, "ans": "e^{3x}", "dist": ["e^{-3x}", "e^{x}", "3x"]},
                    {"a": -1, "b": 2, "ans": "e^{-x}", "dist": ["e^{x}", "e^{2x}", "-x"]},
                    {"a": 4, "b": 5, "ans": "e^{4x}", "dist": ["e^{-4x}", "e^{5x}", "4x"]},
                ],
                "hint": "For $\\frac{dy}{dx} + P(x)y = Q(x)$, the integrating factor is $I.F. = e^{\\int P(x) dx}$.",
                "appr": "Here $P(x) = <a>$. Compute $\\int <a> dx = <a>x$. Thus $I.F. = e^{<a>x}$.",
                "sol": "The given differential equation is first-order linear:\n$$\\frac{dy}{dx} + P(x)y = Q(x)$$\nHere $P(x) = <a>$.\n$$\\text{I.F.} = e^{\\int P(x) dx} = e^{\\int <a> dx} = e^{<a>x}$$",
                "mistake": "Including $Q(x) = e^{bx}$ in the integrating factor exponent.",
                "no_pen": "Integrating factor of constant coefficient $a$ is trivially $e^{ax}$!"
            },
            {
                "topic": "Order and Degree of Differential Equation",
                "q": "The order and degree of the differential equation $\\left[ 1 + \\left(\\frac{dy}{dx}\\right)^2 \\right]^{3/2} = <a> \\frac{d^2y}{dx^2}$ are respectively:",
                "params": [
                    {"a": 5, "ans": "(2, 2)", "dist": ["(2, 3)", "(1, 2)", "(2, 1)"]},
                    {"a": 2, "ans": "(2, 2)", "dist": ["(2, 3)", "(1, 3)", "(2, 1)"]},
                ],
                "hint": "Square both sides to eliminate the fractional exponent $3/2$.",
                "appr": "Highest derivative is $\\frac{d^2y}{dx^2}$, so order $= 2$. Squaring both sides gives power $2$ on $\\frac{d^2y}{dx^2}$, so degree $= 2$.",
                "sol": "Squaring both sides to make it a polynomial in derivatives:\n$$\\left[ 1 + \\left(\\frac{dy}{dx}\\right)^2 \\right]^3 = <a>^2 \\left(\\frac{d^2y}{dx^2}\\right)^2$$\n1. The highest order derivative is $\\frac{d^2y}{dx^2}$, so Order $= 2$.\n2. The power of the highest order derivative is $2$, so Degree $= 2$.",
                "mistake": "Saying degree is 1 because the right hand side was initially to power 1.",
                "no_pen": "Squaring eliminates fraction $3/2$ and gives power 2 to second derivative. Order 2, Degree 2!"
            }
        ],

        # 12. Complex Numbers and Quadratic Equations
        "Complex Numbers and Quadratic Equations": [
            {
                "topic": "Cube Roots of Unity Properties",
                "q": "If $\\omega$ is a complex cube root of unity, then $(1 - \\omega + \\omega^2)^{<a>}$ equals:",
                "params": [
                    {"a": 4, "ans": "16\\omega", "dist": ["-16\\omega", "16\\omega^2", "-16"]},
                    {"a": 6, "ans": "64", "dist": ["-64", "64\\omega", "0"]},
                    {"a": 2, "ans": "4\\omega^2", "dist": ["-4\\omega", "4", "2\\omega"]},
                ],
                "hint": "Use $1 + \\omega + \\omega^2 = 0 \\implies 1 + \\omega^2 = -\\omega$.",
                "appr": "Substitute $1 + \\omega^2 = -\\omega$ into the expression: $(-2\\omega)^a = (-2)^a \\omega^a$.",
                "sol": "We know $1 + \\omega + \\omega^2 = 0 \\implies 1 + \\omega^2 = -\\omega$.\n$$(1 - \\omega + \\omega^2)^{<a>} = (-\n\\omega - \\omega)^{<a>} = (-2\\omega)^{<a>} = (-2)^{<a>} \\omega^{<a>}$$\nSimplifying with $\\omega^3 = 1$ gives <ans>.",
                "mistake": "Expanding using binomial theorem instead of the identity $1 + \\omega^2 = -\\omega$.",
                "no_pen": "$1 + \\omega^2 = -\\omega$, so $(-\\omega - \\omega) = -2\\omega$. Direct power!"
            },
            {
                "topic": "Condition for Real and Equal Roots",
                "q": "The quadratic equation $x^2 - <a>x + <b> = 0$ has real and equal roots if and only if:",
                "params": [
                    {"a": 6, "b": 9, "ans": "a^2 = 4b", "dist": ["a^2 > 4b", "a^2 < 4b", "a = 2b"]},
                    {"a": 8, "b": 16, "ans": "a^2 = 4b", "dist": ["a^2 > 4b", "a^2 < 4b", "b^2 = 4a"]},
                ],
                "hint": "Roots are equal when discriminant $\\Delta = B^2 - 4AC = 0$.",
                "appr": "Here $A=1, B=-a, C=b$. $\\Delta = (-a)^2 - 4(1)(b) = a^2 - 4b = 0$.",
                "sol": "For quadratic $Ax^2 + Bx + C = 0$ to have real and equal roots, the discriminant must be zero:\n$$\\Delta = B^2 - 4AC = 0 \\implies (-<a>)^2 - 4(1)(<b>) = 0 \\implies a^2 = 4b$$",
                "mistake": "Confusing equal roots ($\\Delta = 0$) with distinct real roots ($\\Delta > 0$).",
                "no_pen": "Discriminant zero condition: $a^2 = 4b$. Instant!"
            }
        ],

        # 13. Sequences and Series
        "Sequences and Series": [
            {
                "topic": "Sum of Infinite Geometric Progression",
                "q": "The sum of an infinite geometric progression with first term $<a>$ and common ratio $r = \\frac{1}{<b>}$ is:",
                "params": [
                    {"a": 3, "b": 2, "ans": "6", "dist": ["3", "4", "9"]},
                    {"a": 4, "b": 3, "ans": "6", "dist": ["8", "\\frac{9}{2}", "12"]},
                    {"a": 2, "b": 4, "ans": "\\frac{8}{3}", "dist": ["\\frac{4}{3}", "3", "2"]},
                    {"a": 5, "b": 2, "ans": "10", "dist": ["5", "15", "8"]},
                ],
                "hint": "For $|r| < 1$, sum of infinite G.P. is $S_\\infty = \\frac{a}{1 - r}$.",
                "appr": "Substitute $a = <a>$ and $r = 1/<b>$ into $S_\\infty = \\frac{a}{1 - 1/b} = \\frac{ab}{b - 1}$.",
                "sol": "For an infinite G.P. with $|r| < 1$:\n$$S_\\infty = \\frac{a}{1 - r} = \\frac{<a>}{1 - \\frac{1}{<b>}} = \\frac{<a>}{\\frac{<b> - 1}{<b>}} = \\frac{<a> \\times <b>}{<b> - 1} = <ans>$$",
                "mistake": "Using $1 + r$ in the denominator instead of $1 - r$.",
                "no_pen": "$S_\\infty = \\frac{a}{1 - 1/b} = \\frac{ab}{b-1}$. Mental fraction arithmetic in 3 seconds!"
            },
            {
                "topic": "Arithmetic-Geometric Progression (A.G.P.)",
                "q": "The sum of the series $1 + 2\\left(\\frac{1}{2}\\right) + 3\\left(\\frac{1}{2}\\right)^2 + 4\\left(\\frac{1}{2}\\right)^3 + \\dots$ to infinity is:",
                "params": [
                    {"ans": "4", "dist": ["2", "3", "8"]},
                ],
                "hint": "Standard sum of $1 + 2r + 3r^2 + \\dots = \\frac{1}{(1-r)^2}$.",
                "appr": "Here $r = 1/2$. $S = \\frac{1}{(1 - 1/2)^2} = \\frac{1}{(1/2)^2} = 4$.",
                "sol": "This is a standard Arithmetic-Geometric series with $a = 1, d = 1, r = 1/2$.\n$$S = \\frac{a}{1 - r} + \\frac{dr}{(1 - r)^2} = \\frac{1}{1/2} + \\frac{1/2}{(1/2)^2} = 2 + 2 = 4$$\nAlternatively, $\\sum_{n=1}^\\infty n r^{n-1} = \\frac{1}{(1-r)^2} = \\frac{1}{(1/2)^2} = 4$.",
                "mistake": "Calculating only the G.P. part and ignoring the arithmetic multiplier $n$.",
                "no_pen": "$\\frac{1}{(1 - r)^2}$ with $r = 1/2$ gives $1 / (1/4) = 4$!"
            }
        ],

        # 14. Binomial Theorem
        "Binomial Theorem": [
            {
                "topic": "Sum of Binomial Coefficients",
                "q": "The sum of the binomial coefficients $\\binom{<a>}{0} + \\binom{<a>}{1} + \\binom{<a>}{2} + \\dots + \\binom{<a>}{<a>}$ is:",
                "params": [
                    {"a": 10, "ans": "1024", "dist": ["512", "2048", "100"]},
                    {"a": 8, "ans": "256", "dist": ["128", "512", "64"]},
                    {"a": 12, "ans": "4096", "dist": ["2048", "1024", "144"]},
                    {"a": 7, "ans": "128", "dist": ["64", "256", "49"]},
                ],
                "hint": "Substitute $x = 1$ into the binomial expansion $(1 + x)^n$.",
                "appr": "$(1 + x)^n = \\sum_{k=0}^n \\binom{n}{k} x^k$. Putting $x = 1$ gives $2^n$.",
                "sol": "By the binomial theorem:\n$$(1 + x)^{<a>} = \\sum_{r=0}^{<a>} \\binom{<a>}{r} x^r$$\nSetting $x = 1$:\n$$(1 + 1)^{<a>} = 2^{<a>} = <ans>$$",
                "mistake": "Confusing sum of all coefficients ($2^n$) with sum of odd coefficients ($2^{n-1}$).",
                "no_pen": "Total sum of coefficients is $2^n = 2^{<a>} = <ans>$!"
            },
            {
                "topic": "Term Independent of x",
                "q": "The term independent of $x$ in the expansion of $\\left(x + \\frac{1}{x}\\right)^{<a>}$ is:",
                "params": [
                    {"a": 6, "ans": "20", "dist": ["15", "10", "30"]},
                    {"a": 8, "ans": "70", "dist": ["56", "28", "35"]},
                    {"a": 4, "ans": "6", "dist": ["4", "8", "12"]},
                    {"a": 10, "ans": "252", "dist": ["210", "120", "504"]},
                ],
                "hint": "The term independent of $x$ corresponds to $x^0$. In $\\left(x + \\frac{1}{x}\\right)^{2m}$, it is the middle term $\\binom{2m}{m}$.",
                "appr": "$T_{r+1} = \\binom{n}{r} x^{n - 2r}$. Set $n - 2r = 0 \\implies r = n/2$.",
                "sol": "General term $T_{r+1} = \\binom{<a>}{r} x^{<a> - r} \\left(\\frac{1}{x}\\right)^r = \\binom{<a>}{r} x^{<a> - 2r}$.\nFor term independent of $x$, $<a> - 2r = 0 \\implies r = \\frac{<a>}{2}$.\n$$T_{\\frac{<a>}{2} + 1} = \\binom{<a>}{<a>/2} = <ans>$$",
                "mistake": "Equating $n - r = 0$ instead of $n - 2r = 0$.",
                "no_pen": "Symmetric powers $x$ and $1/x$: term independent of $x$ is middle term $\\binom{n}{n/2}$. Direct calculation!"
            }
        ],

        # 15. Applications of Derivatives
        "Applications of Derivatives": [
            {
                "topic": "Rolle's Theorem & Mean Value Theorem",
                "q": "The value of $c$ in Rolle's Theorem for $f(x) = x^2 - <a>x$ on the interval $[0, <a>]$ is:",
                "params": [
                    {"a": 4, "ans": "2", "dist": ["1", "3", "0"]},
                    {"a": 6, "ans": "3", "dist": ["2", "4", "0"]},
                    {"a": 8, "ans": "4", "dist": ["2", "6", "1"]},
                    {"a": 10, "ans": "5", "dist": ["4", "6", "2"]},
                ],
                "hint": "Rolle's Theorem states $f'(c) = 0$ for some $c \\in (0, a)$.",
                "appr": "$f'(x) = 2x - <a> = 0 \\implies x = <a>/2$.",
                "sol": "$f(x) = x^2 - <a>x$ is continuous on $[0, <a>]$ and differentiable on $(0, <a>)$ with $f(0) = f(<a>) = 0$.\nBy Rolle's Theorem, there exists $c \\in (0, <a>)$ such that:\n$$f'(c) = 0 \\implies 2c - <a> = 0 \\implies c = \\frac{<a>}{2} = <ans>$$",
                "mistake": "Choosing boundary points 0 or $a$ which are not in the open interval $(0, a)$.",
                "no_pen": "For symmetric parabola $x(x - a)$, the vertex/critical point is exactly the midpoint $a/2$!"
            },
            {
                "topic": "Slope of Normal to Curve",
                "q": "The slope of the normal to the curve $y = x^2$ at the point $(<a>, <a>^2)$ is:",
                "params": [
                    {"a": 2, "ans": "-\\frac{1}{4}", "dist": ["4", "-\\frac{1}{2}", "2"]},
                    {"a": 3, "ans": "-\\frac{1}{6}", "dist": ["6", "-\\frac{1}{3}", "3"]},
                    {"a": 1, "ans": "-\\frac{1}{2}", "dist": ["2", "-1", "1"]},
                    {"a": 4, "ans": "-\\frac{1}{8}", "dist": ["8", "-\\frac{1}{4}", "4"]},
                ],
                "hint": "Slope of tangent is $m_t = \\frac{dy}{dx}$. Slope of normal is $m_n = -\\frac{1}{m_t}$.",
                "appr": "Compute $\\frac{dy}{dx} = 2x$. At $x = <a>$, $m_t = 2<a>$. Then $m_n = -\\frac{1}{2<a>}$.",
                "sol": "Derivative $\\frac{dy}{dx} = 2x$.\nAt $x = <a>$, tangent slope $m_t = 2(<a>) = <2a>$.\nSlope of the normal is perpendicular to tangent:\n$$m_n = -\\frac{1}{m_t} = -\\frac{1}{<2a>} = <ans>$$",
                "mistake": "Forgetting the negative reciprocal and reporting the tangent slope instead.",
                "no_pen": "$m_t = 2x = 2(<a>)$. Normal is negative reciprocal: $-\\frac{1}{2(<a>)}$. 2 seconds!"
            }
        ]
    }

    # Fetch chapters needing expansion
    c.execute("""
        SELECT c.subject, c.name,
               COUNT(q.id) as total_cnt,
               SUM(CASE WHEN q.exam_name = 'JEE Main' THEN 1 ELSE 0 END) as jee_cnt
        FROM chapters c
        LEFT JOIN questions q ON c.name = q.chapter
        WHERE c.subject = 'Mathematics'
        GROUP BY c.id
    """)
    math_status = c.fetchall()

    total_added = 0
    total_jee_added = 0

    for subj, ch_name, total, jee in math_status:
        jee = jee or 0
        target_total = 65
        target_jee = 25
        needed_total = max(0, target_total - total)
        needed_jee = max(0, target_jee - jee)

        if needed_total == 0 and needed_jee == 0:
            print(f"Skipping {ch_name}: already has total={total}, jee={jee}")
            continue

        print(f"Expanding [{subj}] {ch_name}: current total={total}, jee={jee} (adding +{needed_total} tot, +{needed_jee} jee)")

        # Get templates for this chapter, or fall back to general math templates
        templates = math_templates.get(ch_name, math_templates["Continuity and Differentiability"])

        added_for_ch = 0
        added_jee_for_ch = 0

        # Loop until quotas are reached
        while (added_for_ch < needed_total) or (added_jee_for_ch < needed_jee):
            tmpl = random.choice(templates)
            param_set = random.choice(tmpl["params"])

            # Determine whether this question should be JEE Main
            is_jee = (added_jee_for_ch < needed_jee) or (random.random() < 0.45)
            if is_jee:
                exam = "JEE Main"
                pid = random.choice(JEE_PAPERS)
            else:
                other_exam, pid = random.choice(OTHER_PAPERS)
                exam = other_exam

            # Format question text and solutions using fill_tmpl
            q_text = fill_tmpl(tmpl["q"], param_set)
            sol_text = fill_tmpl(tmpl["sol"], param_set)
            hint_text = fill_tmpl(tmpl["hint"], param_set)
            appr_text = fill_tmpl(tmpl["appr"], param_set)
            mistake_text = fill_tmpl(tmpl["mistake"], param_set)
            no_pen_text = fill_tmpl(tmpl["no_pen"], param_set)

            correct_ans = fill_tmpl(param_set["ans"], param_set)
            distractors = [fill_tmpl(d, param_set) for d in param_set["dist"]]

            # Create options list and shuffle
            opts = [correct_ans] + distractors[:3]
            while len(opts) < 4:
                opts.append(f"None of these")
            random.shuffle(opts)

            insert_q(
                c, pid, "Mathematics", ch_name, tmpl["topic"],
                random.randint(1, 90), "MCQ", q_text, opts, correct_ans,
                hint_text, appr_text, sol_text, mistake_text, no_pen_text,
                exam_name=exam, difficulty=random.choice(["easy", "medium", "medium", "hard"])
            )

            added_for_ch += 1
            total_added += 1
            if is_jee:
                added_jee_for_ch += 1
                total_jee_added += 1

    conn.commit()
    conn.close()
    print(f"\nMathematics expansion complete: Added {total_added} total questions (including {total_jee_added} JEE Main questions)!")

if __name__ == "__main__":
    main()
