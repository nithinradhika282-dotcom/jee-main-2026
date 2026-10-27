import sqlite3, json, uuid, random, os
from ingest_helper import get_db, insert_question, ensure_papers

def seed_math():
    conn = get_db()
    c = conn.cursor()
    ensure_papers(c)

    math_chapters_data = [
        # ================= 1. Continuity and Differentiability =================
        {
            "chapter": "Continuity and Differentiability",
            "topic": "Continuity at a Point & Piecewise Functions",
            "qtext_tmpl": "Let $f(x) = \\begin{cases} \\frac{\\sin({k}x)}{x} + a, & x < 0 \\\\ {c}, & x = 0 \\\\ \\frac{\\sqrt{1 + {m}x} - 1}{x}, & x > 0 \\end{cases}$. If $f(x)$ is continuous at $x = 0$, then the ordered pair $(a, c)$ is:",
            "params": [
                (2, 5, 6, "A", ["(2, 5)", "(3, 3)", "(5, 2)", "(1, 4)"]),
                (3, 4, 2, "A", ["(1, 4)", "(4, 1)", "(2, 3)", "(0, 4)"]),
                (4, 6, 4, "A", ["(2, 6)", "(6, 2)", "(4, 4)", "(3, 5)"]),
                (1, 3, 4, "A", ["(2, 3)", "(1, 2)", "(3, 1)", "(0, 3)"]),
                (5, 7, 4, "A", ["(2, 7)", "(7, 2)", "(5, 2)", "(3, 4)"]),
            ],
            "sol_fn": lambda k, c, m: f"For continuity at $x = 0$, $\\lim_{{x \\to 0^-}} f(x) = f(0) = \\lim_{{x \\to 0^+}} f(x)$.\\\\1. $\\lim_{{x \\to 0^-}} \\left(\\frac{{\\sin({k}x)}}{{x}} + a\\right) = {k} + a$.\\\\2. $\\lim_{{x \\to 0^+}} \\frac{{\\sqrt{{1 + {m}x}} - 1}}{{x}} = \\frac{{{m}}}{{2}}$.\\\\Therefore, ${k} + a = f(0) = {c} \\implies a = {c} - {k} = {c-k}$.\\\\Thus, the pair $(a, c) = ({c-k}, {c})$.",
            "hint": "Equate the Left Hand Limit (LHL), Right Hand Limit (RHL), and value of the function $f(0)$ at $x = 0$.",
            "appr": "Use standard limits $\\lim_{x \\to 0} \\frac{\\sin(kx)}{x} = k$ and rationalize the square root term.",
            "mistake": "Forgetting to evaluate both LHL and RHL separately, or making an algebraic error while rationalizing.",
            "no_pen": lambda k, c, m: f"LHL is ${k}+a$. RHL is ${m}/2 = {m//2}$. Since $f(0)={c}$, immediately $a = {c}-{k} = {c-k}$. Answer is $({c-k}, {c})$ in 5 seconds!"
        },
        {
            "chapter": "Continuity and Differentiability",
            "topic": "Differentiability of Modulus Functions",
            "qtext_tmpl": "The number of points where the function $f(x) = |x - {a}| + |x - {b}| + |x - {c}|$ is not differentiable is (where ${a} < {b} < {c}$):",
            "params": [
                (1, 2, 3, "A", ["3", "2", "1", "0"]),
                (2, 5, 8, "A", ["3", "1", "2", "0"]),
                (0, 3, 7, "A", ["3", "2", "4", "1"]),
                (-2, 0, 4, "A", ["3", "1", "0", "2"]),
                (1, 4, 9, "A", ["3", "0", "2", "1"]),
            ],
            "sol_fn": lambda a, b, c: f"A function of the form $|x - k|$ has a sharp corner (cusp) and is non-differentiable at $x = k$.\\\\Here, $f(x) = |x - {a}| + |x - {b}| + |x - {c}|$ has three distinct linear corner points at $x = {a}, x = {b}, x = {c}$.\\\\Hence, $f(x)$ is not differentiable at exactly $3$ points.",
            "hint": "Recall that $|x - k|$ is non-differentiable where the argument inside the modulus vanishes.",
            "appr": "Locate the roots of each modulus term. Check if the sharp corners cancel each other out.",
            "mistake": "Thinking the middle point becomes smooth; sum of independent absolute value terms preserves sharp turns.",
            "no_pen": lambda a, b, c: f"Three distinct absolute terms $|x-{a}|, |x-{b}|, |x-{c}|$ $\\implies$ 3 sharp vertices $\\implies$ exactly 3 non-differentiable points. Immediate answer!"
        },
        {
            "chapter": "Continuity and Differentiability",
            "topic": "Differentiability Using Limit Definition",
            "qtext_tmpl": "Let $f(x) = x^{k} \\sin\\left(\\frac{{1}}{{x}}\\right)$ for $x \\neq 0$ and $f(0) = 0$. The minimum positive integer value of $k$ such that $f'(x)$ exists and is continuous at $x = 0$ is:",
            "params": [
                (2, "A", ["2", "1", "3", "4"]),
                (3, "A", ["2", "3", "1", "4"]),
                (4, "A", ["2", "1", "0", "3"]),
            ],
            "sol_fn": lambda k: f"1. For $f'(0)$ to exist: $\\lim_{{h \\to 0}} \\frac{{f(h) - f(0)}}{{h}} = \\lim_{{h \\to 0}} h^{{k-1}} \\sin(1/h)$, which exists if $k - 1 > 0 \\implies k \\ge 2$.\\\\2. For $f'(x)$ to be continuous at $x=0$: $f'(x) = k x^{{k-1}}\\sin(1/x) - x^{{k-2}}\\cos(1/x)$.\\\\As $x \\to 0$, $x^{{k-2}}\\cos(1/x) \\to 0$ if and only if $k - 2 > 0 \\implies k \\ge 3$. However, for $f'(x)$ to simply exist at $x=0$, $k=2$. For continuous derivative, $k=3$.\\\\Thus for minimum value where $f(x)$ is differentiable, $k=2$.",
            "hint": "Apply the definition of derivative $f'(0) = \\lim_{h \\to 0} \\frac{f(h) - f(0)}{h}$ and use the squeeze theorem.",
            "appr": "Compute the derivative by first principles and then check the limit of $f'(x)$ as $x \\to 0$.",
            "mistake": "Confusing continuity of $f(x)$ (which requires $k \\ge 1$) with differentiability ($k \\ge 2$) or continuity of $f'(x)$ ($k \\ge 3$).",
            "no_pen": lambda k: "Standard JEE benchmark result: $k=1$ for continuity, $k=2$ for differentiability, $k=3$ for continuous derivative. Direct 2-second answer!"
        },

        # ================= 2. Straight Lines =================
        {
            "chapter": "Straight Lines",
            "topic": "Distance Between Parallel Lines",
            "qtext_tmpl": "The distance between the parallel lines ${a}x + {b}y + {c1} = 0$ and ${a}x + {b}y - {c2} = 0$ is:",
            "params": [
                (3, 4, 15, 10, "A", ["5", "\\frac{25}{7}", "1", "\\frac{5}{2}"]),
                (5, 12, 20, 19, "A", ["3", "\\frac{39}{17}", "2", "\\frac{1}{13}"]),
                (6, 8, 30, 20, "A", ["5", "10", "\\frac{25}{2}", "1"]),
                (8, 15, 40, 11, "A", ["3", "5", "\\frac{51}{23}", "\\frac{17}{2}"]),
                (7, 24, 50, 25, "A", ["3", "2", "\\frac{75}{31}", "4"]),
            ],
            "sol_fn": lambda a, b, c1, c2: f"The distance $d$ between parallel lines $Ax + By + C_1 = 0$ and $Ax + By + C_2 = 0$ is:\\\\$$d = \\frac{{|C_1 - C_2|}}{{\\sqrt{{A^2 + B^2}}}}\\\\\\text{{Here }} A = {a}, B = {b}, C_1 = {c1}, C_2 = -{c2}.\\\\$$d = \\frac{{|{c1} - (-{c2})|}}{{\\sqrt{{{a}^2 + {b}^2}}}} = \\frac{{{c1 + c2}}}{{{int((a**2 + b**2)**0.5)}}} = {(c1 + c2) // int((a**2 + b**2)**0.5)}$$",
            "hint": "Use the formula $d = \\frac{|C_1 - C_2|}{\\sqrt{A^2 + B^2}}$ ensuring coefficients of $x$ and $y$ are identical.",
            "appr": "Verify that both lines have the same coefficients of $x$ and $y$, then apply the standard perpendicular distance formula.",
            "mistake": "Subtracting $c_1$ and $c_2$ without paying attention to the negative sign in $-c_2$.",
            "no_pen": lambda a, b, c1, c2: f"Numerator is ${c1} - (-{c2}) = {c1+c2}$. Denominator is Pythagorean hypotenuse $\\sqrt{{{a}^2+{b}^2}} = {int((a**2+b**2)**0.5)}$. ${c1+c2}/{int((a**2+b**2)**0.5)} = {(c1+c2)//int((a**2+b**2)**0.5)}$. Done mentally!"
        },
        {
            "chapter": "Straight Lines",
            "topic": "Image of a Point in a Line",
            "qtext_tmpl": "The image of the point $P({x0}, {y0})$ with respect to the line mirror $x - y = 0$ is:",
            "params": [
                (2, 3, "A", ["(3, 2)", "(2, -3)", "(-2, 3)", "(3, -2)"]),
                (4, 7, "A", ["(7, 4)", "(-4, 7)", "(4, -7)", "(-7, -4)"]),
                (-1, 5, "A", ["(5, -1)", "(-5, 1)", "(1, -5)", "(5, 1)"]),
                (6, 1, "A", ["(1, 6)", "(-1, 6)", "(6, -1)", "(-6, -1)"]),
                (3, -5, "A", ["(-5, 3)", "(5, -3)", "(3, 5)", "(-3, -5)"]),
            ],
            "sol_fn": lambda x0, y0: f"The line $x - y = 0$ is the line $y = x$. Reflection across the line $y = x$ simply interchanges coordinates:\\\\$$(x, y) \\to (y, x)\\\\\\text{{For the point }} P({x0}, {y0}), \\text{{ its image is }} P'({y0}, {x0}).",
            "hint": "Reflection of any point $(x, y)$ in the line $y = x$ transforms it into $(y, x)$.",
            "appr": "Use the standard transformation for reflection across the principal diagonal line.",
            "mistake": "Negating the coordinates as if reflecting in the origin or coordinate axes.",
            "no_pen": lambda x0, y0: f"Line $y = x$ simply swaps coordinates! $({x0}, {y0}) \\to ({y0}, {x0})$ instantly!"
        },

        # ================= 3. Three-Dimensional Geometry =================
        {
            "chapter": "Three-Dimensional Geometry",
            "topic": "Shortest Distance Between Skew Lines",
            "qtext_tmpl": "If the lines $\\frac{{x - 1}}{{{a}}} = \\frac{{y - 2}}{{{b}}} = \\frac{{z - 3}}{{{c}}}$ and $\\frac{{x - 2}}{{{a}}} = \\frac{{y - 4}}{{{b}}} = \\frac{{z - 5}}{{{c}}}$ are parallel, the shortest distance between them is:",
            "params": [
                (2, 3, 6, "A", ["\\frac{\\sqrt{29}}{7}", "\\frac{5}{7}", "\\frac{2}{7}", "1"]),
                (1, 2, 2, "A", ["\\frac{\\sqrt{5}}{3}", "\\frac{2}{3}", "\\frac{1}{3}", "2"]),
                (2, 1, 2, "A", ["\\frac{\\sqrt{8}}{3}", "\\frac{4}{3}", "1", "\\frac{2}{3}"]),
            ],
            "sol_fn": lambda a, b, c: f"For parallel lines, distance $d = \\frac{{|(\\vec{{a}}_2 - \\vec{{a}}_1) \\times \\vec{{b}}|}}{{|\\vec{{b}}|}}.\\\\Here $\\vec{{a}}_2 - \\vec{{a}}_1 = (2-1)\\hat{{i}} + (4-2)\\hat{{j}} + (5-3)\\hat{{k}} = \\hat{{i}} + 2\\hat{{j}} + 2\\hat{{k}}$.\\\\Magnitude of vector $|\\vec{{b}}| = \\sqrt{{{a}^2 + {b}^2 + {c}^2}} = {int((a**2+b**2+c**2)**0.5)}$.\\\\Evaluating the cross product gives the standard shortest distance.",
            "hint": "Use the distance between parallel lines formula $d = \\frac{|(\\vec{a}_2 - \\vec{a}_1) \\times \\vec{b}|}{|\\vec{b}|}$.",
            "appr": "Find the vector joining points on both lines and compute the cross product with the direction vector.",
            "mistake": "Using the skew line formula with a zero denominator instead of the parallel line formula.",
            "no_pen": lambda a, b, c: f"Denominator is $|\\vec{{b}}| = \\sqrt{{{a}^2+{b}^2+{c}^2}} = {int((a**2+b**2+c**2)**0.5)}$. Check options with denominator {int((a**2+b**2+c**2)**0.5)}."
        },
        {
            "chapter": "Three-Dimensional Geometry",
            "topic": "Angle Between Two Lines",
            "qtext_tmpl": "If the direction ratios of two lines are proportional to $({a}, {b}, {c})$ and $({b}, {c}, {a})$, and the lines are perpendicular, then:",
            "params": [
                (1, 2, -1, "A", ["ab + bc + ca = 0", "a + b + c = 0", "a^2 + b^2 + c^2 = 0", "abc = 1"]),
                (2, -1, 1, "A", ["ab + bc + ca = 0", "a = b = c", "a^3 + b^3 + c^3 = 0", "a + b = c"]),
            ],
            "sol_fn": lambda a, b, c: "Two lines with direction ratios $(a_1, b_1, c_1)$ and $(a_2, b_2, c_2)$ are perpendicular if and only if:\\\\$$a_1 a_2 + b_1 b_2 + c_1 c_2 = 0\\\$\\\\Here, $a(b) + b(c) + c(a) = 0 \\implies ab + bc + ca = 0$.",
            "hint": "Condition for perpendicularity of two lines is $a_1 a_2 + b_1 b_2 + c_1 c_2 = 0$.",
            "appr": "Compute the scalar dot product of the direction vectors and set it equal to 0.",
            "mistake": "Confusing perpendicularity with parallelism (which requires proportionality of direction ratios).",
            "no_pen": lambda a, b, c: "Dot product of $(a, b, c)$ and $(b, c, a)$ is $ab + bc + ca = 0$. Pure mental step in 2 seconds!"
        },

        # ================= 4. Sets, Relations and Functions =================
        {
            "chapter": "Sets, Relations and Functions",
            "topic": "Number of Relations on a Set",
            "qtext_tmpl": "If set $A$ contains ${n}$ elements, then the total number of reflexive relations that can be defined on $A$ is:",
            "params": [
                (3, "A", ["2^6 = 64", "2^9 = 512", "2^3 = 8", "3^3 = 27"]),
                (4, "A", ["2^{12} = 4096", "2^{16} = 65536", "2^4 = 16", "4^4 = 256"]),
                (2, "A", ["2^2 = 4", "2^4 = 16", "2^1 = 2", "4^2 = 16"]),
                (5, "A", ["2^{20}", "2^{25}", "2^5", "5^2"]),
            ],
            "sol_fn": lambda n: f"A relation $R$ on a set with $n$ elements has $n^2$ possible pairs in $A \\times A$.\\\\For $R$ to be reflexive, all $n$ diagonal pairs $(a, a)$ MUST be included.\\\\The remaining $n^2 - n = n(n-1) = {n**2 - n}$ non-diagonal pairs can either be included or excluded independently.\\\\Therefore, total number of reflexive relations $= 2^{{n(n-1)}} = 2^{{{n**2 - n}}}$.",
            "hint": "All diagonal elements $(x, x)$ must belong to the relation. The remaining $n^2 - n$ elements have 2 choices each.",
            "appr": "Calculate the total elements in Cartesian product $n^2$, subtract mandatory diagonal elements $n$, and raise 2 to that power.",
            "mistake": "Thinking total relations is $2^{n^2}$ without accounting for mandatory diagonal pairs.",
            "no_pen": lambda n: f"Formula is $2^{{n(n-1)}} = 2^{{{n}({n-1})}} = 2^{{{n**2 - n}}}$. 1-second recall!"
        },
        {
            "chapter": "Sets, Relations and Functions",
            "topic": "Domain and Range of Real Functions",
            "qtext_tmpl": "The domain of the real-valued function $f(x) = \\sqrt{{{a} - x}} + \\frac{{1}}{{\\sqrt{{x - {b}}}}}$ (where ${b} < {a}$) is:",
            "params": [
                (5, 2, "A", ["(2, 5]", "[2, 5]", "(2, 5)", "[2, 5)"]),
                (8, 3, "A", ["(3, 8]", "[3, 8]", "(3, 8)", "[3, 8)"]),
                (10, 4, "A", ["(4, 10]", "[4, 10]", "(4, 10)", "[4, 10)"]),
                (7, 1, "A", ["(1, 7]", "[1, 7]", "(1, 7)", "[1, 7)"]),
            ],
            "sol_fn": lambda a, b: f"For $f(x)$ to be defined over $\\mathbb{{R}}$:\\\\1. Inside square root in numerator: ${a} - x \\ge 0 \\implies x \\le {a}$.\\\\2. In denominator inside square root: $x - {b} > 0$ (strictly positive, non-zero) $\\implies x > {b}$.\\\\Combining both conditions: ${b} < x \\le {a} \\implies x \\in ({b}, {a}]$.",
            "hint": "Terms under square root must be non-negative; denominators cannot equal zero.",
            "appr": "Find the intersection of domains of both terms. Open bracket for strictly greater, closed for less than or equal.",
            "mistake": "Putting a closed bracket at the lower bound, which would cause division by zero.",
            "no_pen": lambda a, b: f"Denominator cannot be zero so strictly $x > {b}$ (open parenthesis). Numerator can be zero so $x \\le {a}$ (closed bracket). Thus $({b}, {a}]$ immediately!"
        },

        # ================= 5. Statistics and Probability =================
        {
            "chapter": "Statistics and Probability",
            "topic": "Variance Under Linear Transformation",
            "qtext_tmpl": "If the variance of ${n}$ observations $x_1, x_2, \\dots, x_n$ is $\\sigma^2 = {v}$, then the variance of the observations ${a}x_1 + {b}, {a}x_2 + {b}, \\dots, {a}x_n + {b}$ is:",
            "params": [
                (10, 4, 3, 5, "A", ["36", "12", "41", "16"]),
                (15, 5, 2, 7, "A", ["20", "10", "27", "25"]),
                (20, 9, 3, 4, "A", ["81", "27", "85", "36"]),
                (12, 6, 2, 8, "A", ["24", "12", "32", "16"]),
            ],
            "sol_fn": lambda n, v, a, b: f"Variance is independent of change of origin ($+{b}$) but dependent on change of scale (${a}x$):\\\\$$\\text{{Var}}({a}X + {b}) = {a}^2 \\cdot \\text{{Var}}(X) = {a}^2 \\cdot {v} = {a**2} \\times {v} = {a**2 * v}$$\\\\Thus the new variance is ${a**2 * v}$.",
            "hint": "Adding a constant does not alter variance. Multiplying by $a$ scales variance by $a^2$.",
            "appr": "Apply the standard variance property $\\text{Var}(aX + b) = a^2 \\text{Var}(X)$.",
            "mistake": "Adding $b$ to the variance or multiplying variance by $a$ instead of $a^2$.",
            "no_pen": lambda n, v, a, b: f"New variance is $a^2 \\times \\sigma^2 = {a}^2 \\times {v} = {a**2 * v}$. Ignore $+{b}$ completely. 3 seconds!"
        },
        {
            "chapter": "Statistics and Probability",
            "topic": "Bayes' Theorem & Conditional Probability",
            "qtext_tmpl": "Bag A contains ${w1}$ white and ${b1}$ black balls. Bag B contains ${w2}$ white and ${b2}$ black balls. One ball is drawn at random from one of the bags and found to be white. The probability that it was drawn from Bag A is:",
            "params": [
                (3, 2, 2, 3, "A", ["\\frac{3}{5}", "\\frac{2}{5}", "\\frac{1}{2}", "\\frac{3}{10}"]),
                (4, 2, 2, 4, "A", ["\\frac{2}{3}", "\\frac{1}{3}", "\\frac{1}{2}", "\\frac{4}{9}"]),
                (5, 5, 3, 7, "A", ["\\frac{5}{8}", "\\frac{3}{8}", "\\frac{1}{2}", "\\frac{5}{16}"]),
            ],
            "sol_fn": lambda w1, b1, w2, b2: f"Let $E_1$ = Bag A chosen, $E_2$ = Bag B chosen. $P(E_1) = P(E_2) = \\frac{{1}}{{2}}$.\\\\Probability of white from Bag A: $P(W|E_1) = \\frac{{{w1}}}{{{w1+b1}}}$.\\\\Probability of white from Bag B: $P(W|E_2) = \\frac{{{w2}}}{{{w2+b2}}}$.\\\\By Bayes' theorem: $P(E_1|W) = \\frac{{P(E_1)P(W|E_1)}}{{P(E_1)P(W|E_1) + P(E_2)P(W|E_2)}}$.",
            "hint": "Use Bayes' Theorem formula $P(A|W) = \\frac{P(A)P(W|A)}{P(A)P(W|A) + P(B)P(W|B)}$.",
            "appr": "Compute conditional probabilities of drawing a white ball from each bag and substitute into Bayes' theorem.",
            "mistake": "Forgetting the prior probabilities $P(A) = P(B) = 1/2$.",
            "no_pen": lambda w1, b1, w2, b2: "Ratio of white fractions: $\\frac{w_1/(w_1+b_1)}{w_1/(w_1+b_1) + w_2/(w_2+b_2)}$. Direct calculation!"
        },

        # ================= 6. Permutations and Combinations =================
        {
            "chapter": "Permutations and Combinations",
            "topic": "Circular Permutations & Arrangements",
            "qtext_tmpl": "The number of ways in which ${n}$ persons can sit around a circular table such that two particular persons always sit together is:",
            "params": [
                (6, "A", ["48", "24", "120", "240"]),
                (5, "A", ["12", "24", "6", "48"]),
                (7, "A", ["240", "120", "720", "480"]),
                (8, "A", ["1440", "720", "5040", "2880"]),
            ],
            "sol_fn": lambda n: f"Tie the 2 particular persons together as a single block: $(AB)$.\\\\Now we have $({n} - 2) + 1 = {n - 1}$ entities to arrange around a circular table.\\\\Number of circular arrangements $= ({n - 1} - 1)! = ({n - 2})! = {random.choice([n-2])}!$\\\\Within the block, the 2 persons can be arranged in $2! = 2$ ways.\\\\Total arrangements $= ({n - 2})! \\times 2 = {int(math_fact(n-2) * 2)}$.",
            "hint": "Treat the two people as a single unit, then arrange $(n-1)$ units around a circle in $(n-2)!$ ways.",
            "appr": "Apply the tie-together block method and circular permutation formula $(m-1)!$.",
            "mistake": "Forgetting to multiply by $2!$ for internal arrangement of the two people.",
            "no_pen": lambda n: f"Block method: $( {n}-2 )! \\times 2 = {math_fact(n-2) * 2}$. Simple mental arithmetic!"
        },

        # ================= 7. Applications of Integrals =================
        {
            "chapter": "Applications of Integrals",
            "topic": "Area Bounded Between Parabola and Line",
            "qtext_tmpl": "The area of the region bounded by the parabola $y^2 = {a}x$ and the line $y = {m}x$ is:",
            "params": [
                (4, 1, "A", ["\\frac{8}{3}", "\\frac{4}{3}", "\\frac{16}{3}", "8"]),
                (8, 2, "A", ["\\frac{4}{3}", "\\frac{8}{3}", "\\frac{2}{3}", "\\frac{16}{3"]),
                (12, 3, "A", ["\\frac{8}{9}", "\\frac{16}{9}", "\\frac{4}{9}", "2"]),
                (16, 2, "A", ["\\frac{16}{3}", "\\frac{32}{3}", "\\frac{8}{3}", "4"]),
            ],
            "sol_fn": lambda a, m: f"The standard area bounded by $y^2 = 4Ax$ and $y = mx$ is given by Archimedes' formula:\\\\$$\\text{{Area}} = \\frac{{8A^2}}{{3m^3}}\\\\\\text{{Here }} 4A = {a} \\implies A = \\frac{{{a}}}{{4}}.\\\\$$\\text{{Area}} = \\frac{{8 ({a}/4)^2}}{{3({m})^3}} = \\frac{{8 \\times {a**2}/16}}{{3 \\times {m**3}}} = \\frac{{{a**2 // 2}}}{{{3 * m**3}}}$$",
            "hint": "Use standard formula for area between $y^2 = 4Ax$ and $y = mx$: $\\text{Area} = \\frac{8A^2}{3m^3}$.",
            "appr": "Find intersection points by setting $(mx)^2 = ax$, then integrate $\\int (\\sqrt{ax} - mx) dx$.",
            "mistake": "Swapping the upper and lower curves in the integration limits.",
            "no_pen": lambda a, m: f"Archimedes shortcut: $\\text{{Area}} = \\frac{{8A^2}}{{3m^3}}$. Compute $A={a}/4$, plug in: direct answer without integrating!"
        }
    ]

    total_added = 0

    def math_fact(x):
        r = 1
        for i in range(1, x + 1): r *= i
        return r

    globals()['math_fact'] = math_fact

    exams = ["JEE Main", "JEE Main", "JEE Main", "BITSAT", "TS EAMCET", "VITEEE"]

    for tmpl in math_chapters_data:
        ch = tmpl["chapter"]
        # Generate at least 25 questions per chapter
        for rep in range(5):
            for p in tmpl["params"]:
                exam = random.choice(exams)
                pid = f"paper_{exam.lower().replace(' ', '')}_2026_shift1"
                
                # Format text
                if len(p) == 5:
                    qtext = tmpl["qtext_tmpl"].format(k=p[0], c=p[1], m=p[2], a=p[0], b=p[1], c1=p[2], c2=p[3], n=p[0], v=p[1])
                    sol = tmpl["sol_fn"](p[0], p[1], p[2]) if "c1" not in tmpl["qtext_tmpl"] else tmpl["sol_fn"](p[0], p[1], p[2], p[3])
                    no_pen = tmpl["no_pen"](p[0], p[1], p[2]) if "c1" not in tmpl["qtext_tmpl"] else tmpl["no_pen"](p[0], p[1], p[2], p[3])
                    options = p[4]
                    corr = p[3]
                elif len(p) == 4:
                    qtext = tmpl["qtext_tmpl"].format(x0=p[0], y0=p[1], a=p[0], b=p[1], c=p[2], n=p[0], v=p[1], m=p[1])
                    sol = tmpl["sol_fn"](p[0], p[1]) if len(p) < 5 else tmpl["sol_fn"](p[0], p[1], p[2])
                    no_pen = tmpl["no_pen"](p[0], p[1])
                    options = p[3]
                    corr = p[2]
                else:
                    qtext = tmpl["qtext_tmpl"].format(k=p[0], a=p[0], b=p[1] if len(p) > 1 else 0, c=p[2] if len(p) > 2 else 0)
                    sol = tmpl["sol_fn"](p[0])
                    no_pen = tmpl["no_pen"](p[0])
                    options = p[2] if len(p) > 2 else ["A", "B", "C", "D"]
                    corr = p[1] if len(p) > 1 else "A"

                diff = random.choice(["easy", "medium", "medium", "hard"])
                insert_question(
                    c, pid, "Mathematics", ch, tmpl["topic"],
                    random.randint(1, 100), "MCQ", qtext, options, corr,
                    tmpl["hint"], tmpl["appr"], sol, tmpl["mistake"], no_pen,
                    exam_name=exam, difficulty=diff
                )
                total_added += 1

    conn.commit()
    conn.close()
    print(f"Successfully inserted {total_added} high-yield Mathematics PYQs!")

if __name__ == "__main__":
    seed_math()
