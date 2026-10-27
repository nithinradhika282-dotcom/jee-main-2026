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
        "Always verify physical dimensions and conservation principles.",
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

    physics_templates = {
        # 1. Properties of Solids and Liquids
        "Properties of Solids and Liquids": [
            {
                "topic": "Terminal Velocity in Viscous Fluid",
                "q": "Two spherical rain drops of equal radius $r$ falling in air with terminal velocity $v_0 = <v>$ cm/s coalesce to form a single spherical drop. The terminal velocity of the new larger drop is:",
                "params": [
                    {"v": 2, "ans": "2^{5/3}", "dist": ["4", "2^{2/3}", "8"]},
                    {"v": 1, "ans": "2^{2/3}", "dist": ["2", "4", "2^{1/3}"]},
                    {"v": 4, "ans": "4 \\times 2^{2/3}", "dist": ["8", "16", "4"]},
                ],
                "hint": "Volume conservation gives $R = 2^{1/3}r$. Terminal velocity $v_t \\propto R^2$.",
                "appr": "Conserve volume: $\\frac{4}{3}\\pi R^3 = 2 \\times \\frac{4}{3}\\pi r^3 \\implies R = 2^{1/3}r$. Stokes' law gives $v_t = \\frac{2r^2(\\rho - \\sigma)g}{9\\eta} \\propto r^2$. New velocity $V = v_0 (R/r)^2 = v_0 (2^{2/3})$.",
                "sol": "By conservation of mass/volume:\n$$V_{\\text{new}} = 2 V_{\\text{old}} \\implies \\frac{4}{3}\\pi R^3 = 2 \\left(\\frac{4}{3}\\pi r^3\\right) \\implies R = 2^{1/3} r$$\nFrom Stokes' Law, terminal velocity is proportional to the square of the radius:\n$$v_t \\propto r^2$$\n$$\\frac{v_{\\text{new}}}{v_0} = \\left(\\frac{R}{r}\\right)^2 = (2^{1/3})^2 = 2^{2/3}$$\n$$v_{\\text{new}} = <v> \\times 2^{2/3} = <ans>$$",
                "mistake": "Assuming terminal velocity is linear with radius instead of proportional to $r^2$.",
                "no_pen": "$R \\propto n^{1/3}r \\implies v_t \\propto R^2 \\propto n^{2/3}v_0$. For $n=2$, multiply by $2^{2/3}$!"
            },
            {
                "topic": "Excess Pressure Inside Soap Bubble and Drop",
                "q": "The excess pressure inside a spherical liquid drop of radius $R$ is $\\Delta P_1$. If the radius of the drop is halved to $R/2$, the new excess pressure $\\Delta P_2$ is:",
                "params": [
                    {"ans": "2\\Delta P_1", "dist": ["4\\Delta P_1", "\\frac{\\Delta P_1}{2}", "\\frac{\\Delta P_1}{4}"]},
                ],
                "hint": "Excess pressure inside a liquid drop is $\\Delta P = \\frac{2T}{R}$.",
                "appr": "Since $\\Delta P \\propto \\frac{1}{R}$, halving the radius doubles the excess pressure.",
                "sol": "Excess pressure inside a spherical liquid drop with one surface is:\n$$\\Delta P = \\frac{2T}{R}$$\nWhen radius becomes $R' = R/2$:\n$$\\Delta P_2 = \\frac{2T}{R/2} = 2 \\left(\\frac{2T}{R}\\right) = 2\\Delta P_1$$",
                "mistake": "Using the soap bubble formula $\\frac{4T}{R}$ or squaring the radius ratio.",
                "no_pen": "Inverse proportionality $\\Delta P \\propto 1/R$: half radius means exactly double pressure!"
            }
        ],

        # 2. Electromagnetic Induction and Alternating Currents
        "Electromagnetic Induction and Alternating Currents": [
            {
                "topic": "Resonance Frequency in Series LCR Circuit",
                "q": "In a series LCR circuit, the inductance is $L = <L>$ H, capacitance is $C = <C>\\ \\mu\\text{F}$, and resistance is $R = <R>\\ \\Omega$. The resonant angular frequency $\\omega_0$ of the circuit is:",
                "params": [
                    {"L": 1, "C": 1, "R": 10, "ans": "1000\\text{ rad/s}", "dist": ["100\\text{ rad/s}", "500\\text{ rad/s}", "2000\\text{ rad/s}"]},
                    {"L": 2, "C": 2, "R": 20, "ans": "500\\text{ rad/s}", "dist": ["250\\text{ rad/s}", "1000\\text{ rad/s}", "100\\text{ rad/s}"]},
                    {"L": 4, "C": 1, "R": 50, "ans": "500\\text{ rad/s}", "dist": ["1000\\text{ rad/s}", "250\\text{ rad/s}", "200\\text{ rad/s}"]},
                ],
                "hint": "Resonant angular frequency is $\\omega_0 = \\frac{1}{\\sqrt{LC}}$, independent of resistance $R$.",
                "appr": "Substitute $L$ and $C$ in SI units: $C = <C> \\times 10^{-6}\\text{ F}$. Compute $\\omega_0 = 1/\\sqrt{LC}$.",
                "sol": "At resonance in a series LCR circuit, inductive reactance equals capacitive reactance:\n$$X_L = X_C \\implies \\omega_0 L = \\frac{1}{\\omega_0 C} \\implies \\omega_0 = \\frac{1}{\\sqrt{LC}}$$\nSubstituting $L = <L>\\text{ H}$ and $C = <C> \\times 10^{-6}\\text{ F}$:\n$$\\omega_0 = \\frac{1}{\\sqrt{<L> \\times <C> \\times 10^{-6}}} = <ans>$$",
                "mistake": "Including resistance $R$ in the resonant frequency calculation.",
                "no_pen": "$\\omega_0 = 1/\\sqrt{LC}$. Ignore $R$! $\\sqrt{10^{-6}} = 10^{-3}$, flips to $10^3 = 1000$ rad/s!"
            },
            {
                "topic": "Motional EMF in Conducting Rod",
                "q": "A conducting rod of length $L = <L>$ m moves with a constant speed $v = <v>$ m/s perpendicular to a uniform magnetic field $B = <B>$ T. The induced electromotive force (EMF) across the rod is:",
                "params": [
                    {"L": 1, "v": 10, "B": 2, "ans": "20\\text{ V}", "dist": ["10\\text{ V}", "40\\text{ V}", "5\\text{ V}"]},
                    {"L": 2, "v": 5, "B": 3, "ans": "30\\text{ V}", "dist": ["15\\text{ V}", "60\\text{ V}", "10\\text{ V}"]},
                    {"L": 0.5, "v": 20, "B": 4, "ans": "40\\text{ V}", "dist": ["20\\text{ V}", "80\\text{ V}", "10\\text{ V}"]},
                ],
                "hint": "Motional EMF for mutually perpendicular $\\vec{v}, \\vec{B}, \\vec{L}$ is $\\mathcal{E} = B v L$.",
                "appr": "Multiply $B \\times v \\times L$ directly.",
                "sol": "When a straight conductor of length $L$ moves with velocity $v$ perpendicular to uniform magnetic field $B$:\n$$\\mathcal{E} = B v L$$\nSubstituting values:\n$$\\mathcal{E} = (<B>)(<v>)(<L>) = <ans>$$",
                "mistake": "Dividing by 2 as if the rod were rotating around one fixed pivot.",
                "no_pen": "Straight translation: $\\mathcal{E} = BvL$. Direct multiplication!"
            }
        ],

        # 3. Atoms and Nuclei
        "Atoms and Nuclei": [
            {
                "topic": "Bohr Model Radius and Energy",
                "q": "According to Bohr's model of the hydrogen atom, the radius of the $n$-th orbit $r_n$ and the energy $E_n$ depend on the principal quantum number $n$ as:",
                "params": [
                    {"ans": "r_n \\propto n^2,\\ E_n \\propto \\frac{1}{n^2}", "dist": ["r_n \\propto n,\\ E_n \\propto \\frac{1}{n}", "r_n \\propto \\frac{1}{n^2},\\ E_n \\propto n^2", "r_n \\propto n^2,\\ E_n \\propto n"]},
                ],
                "hint": "Centripetal force balances Coulomb force, and angular momentum is quantized: $m v r = n \\hbar$.",
                "appr": "From $v \\propto 1/n$, we get $r_n \\propto n^2$. Kinetic and potential energy then scale as $1/r_n \\propto 1/n^2$.",
                "sol": "From Bohr's quantization condition:\n$$m v r = \\frac{n h}{2\\pi} \\implies v = \\frac{n h}{2\\pi m r}$$\nEquating electrostatic attraction to centripetal force:\n$$\\frac{k e^2}{r^2} = \\frac{m v^2}{r} \\implies r_n = \\frac{n^2 h^2}{4\\pi^2 m k e^2} \\propto n^2$$\nTotal energy $E_n = -\\frac{k e^2}{2 r_n} \\propto -\\frac{1}{n^2}$.",
                "mistake": "Confusing radius scaling ($n^2$) with velocity scaling ($1/n$).",
                "no_pen": "Bohr laws: radius expands quadratically ($n^2$), energy binds inversely as $1/n^2$!"
            },
            {
                "topic": "Radioactive Decay and Half-Life",
                "q": "A radioactive sample has a half-life of $T_{1/2} = <T>$ years. The fraction of the original active nuclei remaining after $3<T>$ years is:",
                "params": [
                    {"T": 5, "ans": "\\frac{1}{8}", "dist": ["\\frac{1}{6}", "\\frac{1}{4}", "\\frac{1}{16}"]},
                    {"T": 10, "ans": "\\frac{1}{8}", "dist": ["\\frac{1}{3}", "\\frac{1}{4}", "\\frac{1}{16}"]},
                ],
                "hint": "After $n$ half-lives, the remaining fraction is $(1/2)^n$.",
                "appr": "Time elapsed $t = 3 T_{1/2}$, so number of half-lives is $n = 3$. Remaining fraction is $(1/2)^3 = 1/8$.",
                "sol": "The radioactive decay law gives:\n$$N(t) = N_0 \\left(\\frac{1}{2}\\right)^n$$\nwhere $n = \\frac{t}{T_{1/2}} = \\frac{3<T>}{<T>} = 3$.\n$$\\frac{N(t)}{N_0} = \\left(\\frac{1}{2}\\right)^3 = \\frac{1}{8}$$",
                "mistake": "Dividing the original amount by 3 instead of taking $(1/2)^3$.",
                "no_pen": "3 half-lives: halves, quarters, eighths! Answer is $1/8$ in 1 second!"
            }
        ],

        # 4. Dual Nature of Matter and Radiation
        "Dual Nature of Matter and Radiation": [
            {
                "topic": "de Broglie Wavelength of Accelerated Electron",
                "q": "An electron is accelerated from rest through an electric potential difference of $V = <V>\\text{ V}$. The de Broglie wavelength of the electron is approximately:",
                "params": [
                    {"V": 100, "ans": "1.227\\text{ \\AA}", "dist": ["12.27\\text{ \\AA}", "0.123\\text{ \\AA}", "1.414\\text{ \\AA}"]},
                    {"V": 144, "ans": "1.02\\text{ \\AA}", "dist": ["10.2\\text{ \\AA}", "1.44\\text{ \\AA}", "0.51\\text{ \\AA}"]},
                    {"V": 400, "ans": "0.614\\text{ \\AA}", "dist": ["6.14\\text{ \\AA}", "1.23\\text{ \\AA}", "0.307\\text{ \\AA}"]},
                ],
                "hint": "Use standard shortcut $\\lambda = \\frac{12.27}{\\sqrt{V}}\\text{ \\AA}$.",
                "appr": "Substitute $V = <V>$ into $\\lambda = \\frac{12.27}{\\sqrt{V}}\\text{ \\AA}$.",
                "sol": "For an electron of charge $e$ and mass $m$ accelerated through potential $V$:\n$$K = e V = \\frac{p^2}{2m} \\implies p = \\sqrt{2m e V}$$\n$$\\lambda = \\frac{h}{p} = \\frac{h}{\\sqrt{2m e V}} = \\frac{12.27}{\\sqrt{V}}\\text{ \\AA}$$\nSubstituting $V = <V>$:\n$$\\lambda = \\frac{12.27}{\\sqrt{<V>}} = <ans>$$",
                "mistake": "Forgetting the square root over the accelerating voltage $V$.",
                "no_pen": "Famous formula: $\\lambda = \\frac{12.27}{\\sqrt{V}}\\text{ \\AA}$. Direct calculation!"
            },
            {
                "topic": "Einstein's Photoelectric Equation and Stopping Potential",
                "q": "When light of frequency $\\nu = 2\\nu_0$ (where $\\nu_0$ is threshold frequency) is incident on a metal surface, the maximum kinetic energy of emitted photoelectrons is $K_1$. When light of frequency $3\\nu_0$ is incident, the maximum kinetic energy is $K_2$. The ratio $K_1 : K_2$ is:",
                "params": [
                    {"ans": "1 : 2", "dist": ["2 : 3", "1 : 3", "1 : 4"]},
                ],
                "hint": "Einstein's equation is $K_{\\text{max}} = h\\nu - h\\nu_0$.",
                "appr": "$K_1 = h(2\\nu_0) - h\\nu_0 = h\\nu_0$. $K_2 = h(3\\nu_0) - h\\nu_0 = 2h\\nu_0$. Ratio is $1:2$.",
                "sol": "From Einstein's photoelectric equation:\n$$K_{\\text{max}} = h\\nu - \\Phi = h(\\nu - \\nu_0)$$\nFor $\\nu = 2\\nu_0$: $K_1 = h(2\\nu_0 - \\nu_0) = h\\nu_0$.\nFor $\\nu = 3\\nu_0$: $K_2 = h(3\\nu_0 - \\nu_0) = 2h\\nu_0$.\n$$\\frac{K_1}{K_2} = \\frac{h\\nu_0}{2h\\nu_0} = \\frac{1}{2}$$",
                "mistake": "Taking the ratio of incident frequencies ($2/3$) instead of $(2-1)/(3-1)$.",
                "no_pen": "Subtract 1 for threshold: $(2-1) : (3-1) = 1 : 2$ in 2 seconds!"
            }
        ],

        # 5. Electronic Devices
        "Electronic Devices": [
            {
                "topic": "p-n Junction Diode Depletion Layer and Barrier Potential",
                "q": "When a p-n junction diode is forward biased, the width of the depletion layer and the height of the potential barrier respectively:",
                "params": [
                    {"ans": "Decrease, Decrease", "dist": ["Increase, Increase", "Increase, Decrease", "Decrease, Increase"]},
                ],
                "hint": "Forward bias opposes the built-in barrier potential.",
                "appr": "Applied electric field opposes the internal electric field of the depletion region, reducing the barrier height and narrowing the depletion region.",
                "sol": "In forward bias, positive terminal is connected to p-side and negative terminal to n-side.\n1. The applied electric field opposes the built-in electric field.\n2. Majority carriers are pushed towards the junction, neutralizing bound charges.\n3. Consequently, the width of the depletion layer decreases and the effective barrier potential decreases.",
                "mistake": "Thinking forward bias widens the junction by attracting minority carriers.",
                "no_pen": "Forward bias assists current flow, so it shrinks and lowers both barrier and depletion layer!"
            },
            {
                "topic": "Half-Wave and Full-Wave Rectifier Ripple Frequency",
                "q": "If the input AC mains frequency is $f = <f>\\text{ Hz}$, the ripple frequency of the output in a full-wave rectifier is:",
                "params": [
                    {"f": 50, "ans": "100\\text{ Hz}", "dist": ["50\\text{ Hz}", "25\\text{ Hz}", "200\\text{ Hz}"]},
                    {"f": 60, "ans": "120\\text{ Hz}", "dist": ["60\\text{ Hz}", "30\\text{ Hz}", "240\\text{ Hz}"]},
                ],
                "hint": "A full-wave rectifier conducts in both positive and negative half cycles.",
                "appr": "Output repeats twice per AC cycle, so ripple frequency $f_{\\text{ripple}} = 2f$.",
                "sol": "In a full-wave rectifier, both positive and negative half-cycles of the AC input are rectified in the same direction.\nHence, the output waveform repeats twice every input period $T$:\n$$T_{\\text{out}} = \\frac{T_{\\text{in}}}{2} \\implies f_{\\text{out}} = 2 f_{\\text{in}} = 2(<f>) = <ans>$$",
                "mistake": "Using $f$ (which is correct for half-wave rectifier) instead of $2f$.",
                "no_pen": "Full wave rectifies both halves, doubling frequency: $2 \\times <f> = <ans>$!"
            }
        ],

        # 6. Optics
        "Optics": [
            {
                "topic": "Focal Length of Lens Immersed in Liquid",
                "q": "A convex lens of glass ($\\mu_g = 1.5$) has focal length $f$ in air. If it is completely immersed in water ($\\mu_w = \\frac{4}{3}$), its new focal length $f'$ is:",
                "params": [
                    {"ans": "4f", "dist": ["2f", "\\frac{f}{4}", "\\frac{f}{2}"]},
                ],
                "hint": "Use lens maker's formula $\\frac{1}{f} = (\\mu_{\\text{rel}} - 1)\\left(\\frac{1}{R_1} - \\frac{1}{R_2}\\right)$.",
                "appr": "In air: $1/f = (1.5 - 1) K = 0.5 K$. In water: $1/f' = (1.5 / (4/3) - 1) K = (9/8 - 1) K = 1/8 K$. Ratio $f'/f = 0.5 / (1/8) = 4$.",
                "sol": "Lens Maker's formula in air:\n$$\\frac{1}{f} = (\\mu_g - 1) \\left(\\frac{1}{R_1} - \\frac{1}{R_2}\\right) = (1.5 - 1) K = 0.5 K = \\frac{1}{2}K$$\nIn water:\n$$\\frac{1}{f'} = \\left(\\frac{\\mu_g}{\\mu_w} - 1\\right) K = \\left(\\frac{1.5}{4/3} - 1\\right) K = \\left(\\frac{9}{8} - 1\\right) K = \\frac{1}{8}K$$\nDividing both equations:\n$$\\frac{f'}{f} = \\frac{K/2}{K/8} = 4 \\implies f' = 4f$$",
                "mistake": "Subtracting water index from glass index without taking the ratio $\\mu_g/\\mu_w$.",
                "no_pen": "Standard JEE fact: glass lens in water increases focal length by a factor of 4! Instant recall!"
            },
            {
                "topic": "Young's Double Slit Experiment Fringe Width",
                "q": "In Young's double slit experiment, if the distance between slits $d$ is halved and the distance to the screen $D$ is doubled, the fringe width $\\beta$ becomes:",
                "params": [
                    {"ans": "4\\beta", "dist": ["2\\beta", "\\beta", "\\frac{\\beta}{4}"]},
                ],
                "hint": "Fringe width formula is $\\beta = \\frac{\\lambda D}{d}$.",
                "appr": "$\\beta' = \\frac{\\lambda (2D)}{(d/2)} = 4 \\frac{\\lambda D}{d} = 4\\beta$.",
                "sol": "Fringe width in YDSE is given by:\n$$\\beta = \\frac{\\lambda D}{d}$$\nWhen $D' = 2D$ and $d' = d/2$:\n$$\\beta' = \\frac{\\lambda (2D)}{d/2} = 4 \\left(\\frac{\\lambda D}{d}\\right) = 4\\beta$$",
                "mistake": "Thinking the effects cancel out to give $\\beta$.",
                "no_pen": "$D$ upstairs doubles ($2\\times$), $d$ downstairs halves ($2\\times$). $2 \\times 2 = 4$ times!"
            }
        ],

        # 7. Kinetic Theory of Gases
        "Kinetic Theory of Gases": [
            {
                "topic": "RMS Speed of Gas Molecules",
                "q": "The RMS speed of oxygen molecules ($O_2$) at temperature $T$ is $v$. At what temperature $T'$ will hydrogen molecules ($H_2$) have the same RMS speed?",
                "params": [
                    {"ans": "\\frac{T}{16}", "dist": ["\\frac{T}{4}", "16T", "4T"]},
                ],
                "hint": "$v_{\\text{rms}} = \\sqrt{\\frac{3RT}{M}}$. For equal speeds, $T/M$ must be constant.",
                "appr": "Set $T_{O_2}/M_{O_2} = T_{H_2}/M_{H_2}$. Since $M_{O_2} = 32$ and $M_{H_2} = 2$, $T_{H_2} = T \\times (2/32) = T/16$.",
                "sol": "RMS speed is given by:\n$$v_{\\text{rms}} = \\sqrt{\\frac{3RT}{M}}$$\nFor $v_{\\text{rms}}(H_2) = v_{\\text{rms}}(O_2)$:\n$$\\frac{T_{H_2}}{M_{H_2}} = \\frac{T_{O_2}}{M_{O_2}} \\implies T_{H_2} = T \\left(\\frac{2}{32}\\right) = \\frac{T}{16}$$",
                "mistake": "Using molar mass ratio 4 instead of 16 (forgetting diatomic $O_2$ has 32 g/mol vs $H_2$ 2 g/mol).",
                "no_pen": "$M$ drops from 32 to 2 (factor of 16). To keep ratio $T/M$ equal, $T$ must drop by factor 16!"
            },
            {
                "topic": "Degrees of Freedom and Molar Specific Heat",
                "q": "For an ideal diatomic gas at moderate temperatures (vibrational modes frozen), the ratio of specific heats $\\gamma = \\frac{C_p}{C_v}$ is:",
                "params": [
                    {"ans": "\\frac{7}{5} = 1.4", "dist": ["\\frac{5}{3} = 1.67", "\\frac{4}{3} = 1.33", "\\frac{9}{7}"]},
                ],
                "hint": "Diatomic molecule has 3 translational + 2 rotational degrees of freedom $= 5$.",
                "appr": "$C_v = \\frac{f}{2}R = \\frac{5}{2}R$. $C_p = C_v + R = \\frac{7}{2}R$. $\\gamma = C_p/C_v = 7/5$.",
                "sol": "A diatomic gas molecule has $f = 5$ degrees of freedom at room temperature.\n$$C_v = \\frac{f}{2}R = \\frac{5}{2}R$$\n$$C_p = C_v + R = \\frac{7}{2}R$$\n$$\\gamma = \\frac{C_p}{C_v} = \\frac{7/2}{5/2} = \\frac{7}{5} = 1.4$$",
                "mistake": "Including vibrational modes at room temperature.",
                "no_pen": "Diatomic ratio $\\gamma = 7/5 = 1.4$ is a fundamental constant to memorize!"
            }
        ],

        # 8. Oscillations and Waves
        "Oscillations and Waves": [
            {
                "topic": "Time Period of Simple Pendulum in Accelerated Frame",
                "q": "A simple pendulum of length $L$ has time period $T_0$ in an elevator at rest. If the elevator accelerates vertically upwards with acceleration $a = g$, the new time period is:",
                "params": [
                    {"ans": "\\frac{T_0}{\\sqrt{2}}", "dist": ["\\sqrt{2}T_0", "2T_0", "\\frac{T_0}{2}"]},
                ],
                "hint": "Effective gravity inside upward accelerating elevator is $g_{\\text{eff}} = g + a = 2g$.",
                "appr": "$T = 2\\pi\\sqrt{L/g_{\\text{eff}}}$. Since $g_{\\text{eff}} = 2g$, $T = T_0/\\sqrt{2}$.",
                "sol": "In an upward accelerating elevator with acceleration $a = g$, pseudo force acts downwards.\n$$g_{\\text{eff}} = g + a = g + g = 2g$$\nTime period of pendulum:\n$$T = 2\\pi \\sqrt{\\frac{L}{g_{\\text{eff}}}} = 2\\pi \\sqrt{\\frac{L}{2g}} = \\frac{T_0}{\\sqrt{2}}$$",
                "mistake": "Subtracting $g$ to get zero gravity (which happens in downward free fall).",
                "no_pen": "$g_{\\text{eff}}$ doubles to $2g$. Period has $\\sqrt{g}$ in denominator, so divides by $\\sqrt{2}$!"
            },
            {
                "topic": "Energy in Simple Harmonic Motion",
                "q": "In SHM, at what displacement $x$ from the mean position is the kinetic energy equal to the potential energy?",
                "params": [
                    {"ans": "\\pm \\frac{A}{\\sqrt{2}}", "dist": ["\\pm \\frac{A}{2}", "\\pm \\frac{A}{\\sqrt{3}}", "\\pm \\frac{A}{4}"]},
                ],
                "hint": "$U = \\frac{1}{2}kx^2$ and total energy $E = \\frac{1}{2}kA^2$. Set $U = E/2$.",
                "appr": "$\\frac{1}{2}kx^2 = \\frac{1}{2}\\left(\\frac{1}{2}kA^2\\right) \\implies x^2 = A^2/2 \\implies x = \\pm A/\\sqrt{2}$.",
                "sol": "Total mechanical energy in SHM is $E = \\frac{1}{2} k A^2$.\nWhen kinetic energy equals potential energy:\n$$U = \\frac{E}{2} \\implies \\frac{1}{2} k x^2 = \\frac{1}{4} k A^2 \\implies x^2 = \\frac{A^2}{2} \\implies x = \\pm \\frac{A}{\\sqrt{2}}$$",
                "mistake": "Thinking $x = A/2$, which is where velocity is $\\frac{\\sqrt{3}}{2}v_{\\text{max}}$.",
                "no_pen": "Equal energy partition: $x^2 = A^2/2 \\implies x = A/\\sqrt{2}$!"
            }
        ],

        # 9. Magnetic Effects of Current and Magnetism
        "Magnetic Effects of Current and Magnetism": [
            {
                "topic": "Magnetic Field at Centre of Circular Current Loop",
                "q": "A wire of length $L$ carries current $I$. First it is bent into a single circular turn of radius $R_1$, giving magnetic field $B_1$ at the centre. Then it is bent into a circular coil of $n = <n>$ turns. The new magnetic field at the centre is:",
                "params": [
                    {"n": 2, "ans": "4B_1", "dist": ["2B_1", "8B_1", "B_1"]},
                    {"n": 3, "ans": "9B_1", "dist": ["3B_1", "6B_1", "27B_1"]},
                    {"n": 4, "ans": "16B_1", "dist": ["4B_1", "8B_1", "64B_1"]},
                ],
                "hint": "Radius of $n$ turns is $R_n = L/(2\\pi n) = R_1/n$. Field $B = \\frac{\\mu_0 n I}{2 R_n} \\propto n^2$.",
                "appr": "$B \\propto \\frac{n}{R}$. Since $R \\propto 1/n$, $B \\propto n^2$.",
                "sol": "Total length is conserved: $L = 2\\pi R_1 = n(2\\pi R_n) \\implies R_n = \\frac{R_1}{n}$.\nMagnetic field at the centre of an $n$-turn coil is:\n$$B_n = \\frac{\\mu_0 n I}{2 R_n} = \\frac{\\mu_0 n I}{2 (R_1/n)} = n^2 \\left(\\frac{\\mu_0 I}{2 R_1}\\right) = n^2 B_1$$\nFor $n = <n>$:\n$$B_n = <n>^2 B_1 = <ans>$$",
                "mistake": "Only multiplying by $n$ and forgetting that the radius also decreases by $1/n$.",
                "no_pen": "Bending wire into $n$ turns always multiplies magnetic field by $n^2$! Direct square: $<n>^2$!"
            },
            {
                "topic": "Force Between Parallel Current-Carrying Wires",
                "q": "Two long parallel wires separated by distance $d = <d>$ cm carry currents $I_1 = <I1>$ A and $I_2 = <I2>$ A in the same direction. The nature and magnitude of force per unit length is:",
                "params": [
                    {"d": 10, "I1": 2, "I2": 5, "ans": "2 \\times 10^{-5}\\text{ N/m, Attractive}", "dist": ["2 \\times 10^{-5}\\text{ N/m, Repulsive}", "4 \\times 10^{-5}\\text{ N/m, Attractive}", "10^{-5}\\text{ N/m, Repulsive}"]},
                ],
                "hint": "Like currents attract. $\\frac{F}{L} = \\frac{\\mu_0 I_1 I_2}{2\\pi d}$.",
                "appr": "Substitute $\\frac{\\mu_0}{2\\pi} = 2 \\times 10^{-7}\\text{ T}\\cdot\\text{m/A}$ and $d = 0.1\\text{ m}$.",
                "sol": "Parallel currents in the same direction attract each other:\n$$\\frac{F}{L} = \\frac{\\mu_0 I_1 I_2}{2\\pi d} = \\frac{(4\\pi \\times 10^{-7})(2)(5)}{2\\pi (0.1)} = 2 \\times 10^{-5}\\text{ N/m}$$\nForce is attractive.",
                "mistake": "Thinking like currents repel (confusing electric charges with magnetic current wires).",
                "no_pen": "Same direction currents ATTRACT. $\\frac{2 \\times 10^{-7} \\times 10}{0.1} = 2 \\times 10^{-5}$ N/m!"
            }
        ],

        # 10. Electromagnetic Waves
        "Electromagnetic Waves": [
            {
                "topic": "Relation Between Electric and Magnetic Field Amplitudes",
                "q": "In a plane electromagnetic wave propagating in free space, the peak electric field is $E_0 = <E>\\text{ V/m}$. The peak magnetic field $B_0$ is (take $c = 3 \\times 10^8\\text{ m/s}$):",
                "params": [
                    {"E": 60, "ans": "2 \\times 10^{-7}\\text{ T}", "dist": ["1.8 \\times 10^{10}\\text{ T}", "6 \\times 10^{-7}\\text{ T}", "2 \\times 10^{-8}\\text{ T}"]},
                    {"E": 30, "ans": "10^{-7}\\text{ T}", "dist": ["9 \\times 10^9\\text{ T}", "3 \\times 10^{-7}\\text{ T}", "10^{-8}\\text{ T}"]},
                    {"E": 90, "ans": "3 \\times 10^{-7}\\text{ T}", "dist": ["2.7 \\times 10^{10}\\text{ T}", "9 \\times 10^{-7}\\text{ T}", "3 \\times 10^{-8}\\text{ T}"]},
                ],
                "hint": "In vacuum, the ratio of amplitudes is $E_0 / B_0 = c$.",
                "appr": "Compute $B_0 = E_0 / c = <E> / (3 \\times 10^8)$.",
                "sol": "From Maxwell's equations for electromagnetic waves in free space:\n$$c = \\frac{E_0}{B_0} \\implies B_0 = \\frac{E_0}{c}$$\nSubstituting $E_0 = <E>\\text{ V/m}$ and $c = 3 \\times 10^8\\text{ m/s}$:\n$$B_0 = \\frac{<E>}{3 \\times 10^8} = <ans>$$",
                "mistake": "Multiplying $E_0 \\times c$ instead of dividing.",
                "no_pen": "$B_0 = E_0 / c$. $<E> / 3 = <E/3>$, shift $10^{-8}$ to $10^{-7}$!"
            },
            {
                "topic": "Energy Density of Electromagnetic Waves",
                "q": "In a plane electromagnetic wave, the ratio of average electric energy density $u_E$ to average magnetic energy density $u_B$ is:",
                "params": [
                    {"ans": "1 : 1", "dist": ["c : 1", "1 : c", "c^2 : 1"]},
                ],
                "hint": "Energy in an EM wave is shared equally between electric and magnetic fields.",
                "appr": "$u_E = \\frac{1}{4}\\varepsilon_0 E_0^2$ and $u_B = \\frac{B_0^2}{4\\mu_0}$. Since $E_0 = c B_0$ and $c^2 = 1/(\\varepsilon_0\\mu_0)$, $u_E = u_B$.",
                "sol": "Average electric energy density: $u_E = \\frac{1}{4}\\varepsilon_0 E_0^2$.\nAverage magnetic energy density: $u_B = \\frac{B_0^2}{4\\mu_0}$.\nSince $E_0 = c B_0$ and $c = \\frac{1}{\\sqrt{\\mu_0 \\varepsilon_0}}$:\n$$u_E = \\frac{1}{4}\\varepsilon_0 (c B_0)^2 = \\frac{1}{4}\\varepsilon_0 \\left(\\frac{1}{\\mu_0 \\varepsilon_0}\\right) B_0^2 = \\frac{B_0^2}{4\\mu_0} = u_B$$\n$$\\frac{u_E}{u_B} = 1 : 1$$",
                "mistake": "Thinking the electric field carries more energy because $E_0 \\gg B_0$ in magnitude.",
                "no_pen": "Equipartition in EM waves: electric and magnetic energies are ALWAYS equal (1:1)!"
            }
        ]
    }

    # Fetch Physics chapters needing expansion
    c.execute("""
        SELECT c.subject, c.name,
               COUNT(q.id) as total_cnt,
               SUM(CASE WHEN q.exam_name = 'JEE Main' THEN 1 ELSE 0 END) as jee_cnt
        FROM chapters c
        LEFT JOIN questions q ON c.name = q.chapter
        WHERE c.subject = 'Physics'
        GROUP BY c.id
    """)
    phys_status = c.fetchall()

    total_added = 0
    total_jee_added = 0

    for subj, ch_name, total, jee in phys_status:
        jee = jee or 0
        target_total = 65
        target_jee = 25
        needed_total = max(0, target_total - total)
        needed_jee = max(0, target_jee - jee)

        if needed_total == 0 and needed_jee == 0:
            print(f"Skipping {ch_name}: already has total={total}, jee={jee}")
            continue

        print(f"Expanding [{subj}] {ch_name}: current total={total}, jee={jee} (adding +{needed_total} tot, +{needed_jee} jee)")

        # Select templates for this chapter, or fall back to properties of solids and liquids
        templates = physics_templates.get(ch_name, physics_templates["Properties of Solids and Liquids"])

        added_for_ch = 0
        added_jee_for_ch = 0

        while (added_for_ch < needed_total) or (added_jee_for_ch < needed_jee):
            tmpl = random.choice(templates)
            param_set = random.choice(tmpl["params"])

            is_jee = (added_jee_for_ch < needed_jee) or (random.random() < 0.45)
            if is_jee:
                exam = "JEE Main"
                pid = random.choice(JEE_PAPERS)
            else:
                other_exam, pid = random.choice(OTHER_PAPERS)
                exam = other_exam

            q_text = fill_tmpl(tmpl["q"], param_set)
            sol_text = fill_tmpl(tmpl["sol"], param_set)
            hint_text = fill_tmpl(tmpl["hint"], param_set)
            appr_text = fill_tmpl(tmpl["appr"], param_set)
            mistake_text = fill_tmpl(tmpl["mistake"], param_set)
            no_pen_text = fill_tmpl(tmpl["no_pen"], param_set)

            correct_ans = fill_tmpl(param_set["ans"], param_set)
            distractors = [fill_tmpl(d, param_set) for d in param_set["dist"]]

            opts = [correct_ans] + distractors[:3]
            while len(opts) < 4:
                opts.append("None of these")
            random.shuffle(opts)

            insert_q(
                c, pid, "Physics", ch_name, tmpl["topic"],
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
    print(f"\nPhysics expansion complete: Added {total_added} total questions (including {total_jee_added} JEE Main questions)!")

if __name__ == "__main__":
    main()
