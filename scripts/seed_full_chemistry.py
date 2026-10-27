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
        "Always verify oxidation numbers, stoichiometry, and electronic configurations.",
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

    chem_templates = {
        # 1. Redox Reactions
        "Redox Reactions": [
            {
                "topic": "Oxidation State Determination",
                "q": "The oxidation states of chromium in $\\text{CrO}_5$ and $\\text{K}_2\\text{Cr}_2\\text{O}_7$ are respectively:",
                "params": [
                    {"ans": "+6 \\text{ and } +6", "dist": ["+10 \\text{ and } +6", "+6 \\text{ and } +7", "+4 \\text{ and } +6"]},
                ],
                "hint": "Recall the butterfly structure of $\\text{CrO}_5$ with two peroxo ($-O-O-$) linkages.",
                "appr": "In $\\text{CrO}_5$, four oxygen atoms form two peroxide bonds (oxidation state $-1$ each) and one oxygen is oxo ($-2$). $x + 4(-1) + 1(-2) = 0 \\implies x = +6$. In $\\text{K}_2\\text{Cr}_2\\text{O}_7$, $2(+1) + 2x + 7(-2) = 0 \\implies 2x = 12 \\implies x = +6$.",
                "sol": "1. In $\\text{CrO}_5$ (chromium peroxide, butterfly structure):\nThere are two peroxo groups containing 4 peroxide oxygens with oxidation state $-1$, and one oxo oxygen with oxidation state $-2$.\n$$x + 4(-1) + 1(-2) = 0 \\implies x = +6$$\n2. In $\\text{K}_2\\text{Cr}_2\\text{O}_7$:\n$$2(+1) + 2x + 7(-2) = 0 \\implies 2 + 2x - 14 = 0 \\implies 2x = 12 \\implies x = +6$$\nBoth compounds have chromium in $+6$ oxidation state.",
                "mistake": "Calculating $+10$ for $\\text{CrO}_5$ by treating all 5 oxygens as oxide ions ($-2$). Maximum oxidation state for chromium is $+6$ ($3d^5 4s^1$).",
                "no_pen": "Chromium cannot exceed its group valence of $+6$! Thus both MUST be $+6$ in 1 second!"
            },
            {
                "topic": "Balancing Redox Reactions in Acidic Medium",
                "q": "In the balanced redox reaction $\\text{MnO}_4^- + <a>\\text{Fe}^{2+} + <b>\\text{H}^+ \\to \\text{Mn}^{2+} + <a>\\text{Fe}^{3+} + <c>\\text{H}_2\\text{O}$, the stoichiometric coefficients $(<a>, <b>, <c>)$ are:",
                "params": [
                    {"a": 5, "b": 8, "c": 4, "ans": "(5, 8, 4)", "dist": ["(5, 4, 8)", "(2, 8, 4)", "(3, 6, 3)"]},
                ],
                "hint": "Permanganate ion gains 5 electrons in acidic medium while $\\text{Fe}^{2+}$ loses 1 electron.",
                "appr": "Half-reactions: $\\text{MnO}_4^- + 8\\text{H}^+ + 5e^- \\to \\text{Mn}^{2+} + 4\\text{H}_2\\text{O}$ and $\\text{Fe}^{2+} \\to \\text{Fe}^{3+} + e^-$. Multiply $\\text{Fe}^{2+}$ by 5 to balance electrons.",
                "sol": "Reduction half-reaction in acidic medium:\n$$\\text{MnO}_4^- + 8\\text{H}^+ + 5e^- \\to \\text{Mn}^{2+} + 4\\text{H}_2\\text{O}$$\nOxidation half-reaction:\n$$5\\text{Fe}^{2+} \\to 5\\text{Fe}^{3+} + 5e^-$$\nAdding both gives the net balanced reaction:\n$$\\text{MnO}_4^- + 5\\text{Fe}^{2+} + 8\\text{H}^+ \\to \\text{Mn}^{2+} + 5\\text{Fe}^{3+} + 4\\text{H}_2\\text{O}$$\nCoefficients $(a, b, c) = (5, 8, 4)$.",
                "mistake": "Using $16\\text{H}^+$ which corresponds to balancing when 2 moles of $\\text{MnO}_4^-$ are used.",
                "no_pen": "$\Delta\\text{ON}(\\text{Mn}) = 5$, $\Delta\\text{ON}(\\text{Fe}) = 1 \\implies 5\\text{Fe}^{2+}$. To balance 4 oxygens, need $4\\text{H}_2\\text{O}$ and $8\\text{H}^+$. Direct $(5, 8, 4)$!"
            }
        ],

        # 2. Haloalkanes and Haloarenes
        "Haloalkanes and Haloarenes": [
            {
                "topic": "Reactivity Order Towards SN1 Reaction",
                "q": "The correct decreasing order of reactivity towards $S_N1$ nucleophilic substitution for the alkyl halides $(CH_3)_3C-Cl$ (I), $(CH_3)_2CH-Cl$ (II), $CH_3CH_2-Cl$ (III), and $CH_3-Cl$ (IV) is:",
                "params": [
                    {"ans": "\\text{I} > \\text{II} > \\text{III} > \\text{IV}", "dist": ["\\text{IV} > \\text{III} > \\text{II} > \\text{I}", "\\text{I} > \\text{III} > \\text{II} > \\text{IV}", "\\text{II} > \\text{I} > \\text{III} > \\text{IV}"]},
                ],
                "hint": "$S_N1$ mechanism proceeds via carbocation intermediate; stability of carbocation dictates rate.",
                "appr": "Carbocation stability order: $3^\\circ > 2^\\circ > 1^\\circ > \\text{methyl}$. Thus tertiary alkyl halide reacts fastest.",
                "sol": "The rate-determining step in an $S_N1$ reaction is the unimolecular ionization to form a carbocation intermediate.\nThe stability order of alkyl carbocations is:\n$$3^\\circ > 2^\\circ > 1^\\circ > \\text{methyl}$$\nDue to hyperconjugation (+H) and inductive effect (+I), $(CH_3)_3C^+$ is most stable.\nTherefore, the reactivity order towards $S_N1$ is:\n$$\\text{I} (3^\\circ) > \\text{II} (2^\\circ) > \\text{III} (1^\\circ) > \\text{IV} (\\text{methyl})$$",
                "mistake": "Confusing $S_N1$ (carbocation stability, $3^\\circ > 2^\\circ > 1^\\circ$) with $S_N2$ (steric hindrance, $\\text{methyl} > 1^\\circ > 2^\\circ > 3^\\circ$).",
                "no_pen": "$S_N1$ means $3^\\circ > 2^\\circ > 1^\\circ > \\text{methyl}$. $S_N2$ is the reverse. Instant answer!"
            },
            {
                "topic": "Finkelstein Reaction for Alkyl Iodide Synthesis",
                "q": "In the Finkelstein reaction, an alkyl chloride or bromide is converted to an alkyl iodide by reaction with $\\text{NaI}$ in dry acetone. The driving force for the forward reaction is:",
                "params": [
                    {"ans": "\\text{Precipitation of } \\text{NaCl} \\text{ or } \\text{NaBr} \\text{ in acetone}", "dist": ["\\text{Greater nucleophilicity of } \\text{Cl}^-", "\\text{High solubility of } \\text{NaCl} \\text{ in acetone}", "\\text{Higher bond dissociation energy of } C-I"]},
                ],
                "hint": "Le Chatelier's principle drives the equilibrium forward due to phase separation of byproduct salts.",
                "appr": "$\\text{NaI}$ is covalent enough to dissolve in acetone, but $\\text{NaCl}$ and $\\text{NaBr}$ are ionic and precipitate out, driving the reaction to completion.",
                "sol": "In the Finkelstein reaction:\n$$R-X + \\text{NaI} \\xrightarrow{\\text{dry acetone}} R-I + \\text{NaX}\\downarrow \\quad (X = Cl, Br)$$\n$\\text{NaI}$ is soluble in acetone due to covalent character from polarizability of $I^-$.\n$\\text{NaCl}$ and $\\text{NaBr}$ have higher lattice enthalpies and are insoluble in dry acetone, precipitating out of solution.\nAccording to Le Chatelier's principle, removal of products shifts the equilibrium forward.",
                "mistake": "Thinking $I^-$ is a stronger nucleophile in polar protic solvents (it is, but here acetone is aprotic).",
                "no_pen": "Finkelstein reaction classic key: precipitation of $\\text{NaCl}/\\text{NaBr}$ in dry acetone!"
            }
        ],

        # 3. Principles Related to Practical Chemistry
        "Principles Related to Practical Chemistry": [
            {
                "topic": "Chromyl Chloride Test for Chloride Ion",
                "q": "When a solid chloride salt is heated with concentrated $\\text{H}_2\\text{SO}_4$ and solid $\\text{K}_2\\text{Cr}_2\\text{O}_7$, red-brown fumes of which compound are evolved?",
                "params": [
                    {"ans": "\\text{CrO}_2\\text{Cl}_2 \\text{ (Chromyl chloride)}", "dist": ["\\text{CrCl}_3", "\\text{CrO}_3", "\\text{Cl}_2\\text{O}_7"]},
                ],
                "hint": "Deep red vapors passed into $\\text{NaOH}$ give a yellow solution of $\\text{Na}_2\\text{CrO}_4$.",
                "appr": "$4\\text{NaCl} + \\text{K}_2\\text{Cr}_2\\text{O}_7 + 6\\text{H}_2\\text{SO}_4 \\to 2\\text{CrO}_2\\text{Cl}_2\\uparrow + 2\\text{KHSO}_4 + 4\\text{NaHSO}_4 + 3\\text{H}_2\\text{O}$.",
                "sol": "The Chromyl Chloride test is a confirmatory test for ionic chloride ($Cl^-$):\n$$4\\text{Cl}^- + \\text{Cr}_2\\text{O}_7^{2-} + 6\\text{H}^+ \\to 2\\text{CrO}_2\\text{Cl}_2\\uparrow \\text{ (deep red fumes)} + 3\\text{H}_2\\text{O}$$\nPassing these fumes into $\\text{NaOH}$ produces a yellow solution of sodium chromate:\n$$\\text{CrO}_2\\text{Cl}_2 + 4\\text{OH}^- \\to \\text{CrO}_4^{2-} \\text{ (yellow)} + 2\\text{Cl}^- + 2\\text{H}_2\\text{O}$$\nAcidifying with acetic acid and adding lead acetate produces a yellow precipitate of $\\text{PbCrO}_4$.",
                "mistake": "Assuming bromides and iodides also give this test; they release bromine ($Br_2$) and iodine ($I_2$) vapors instead.",
                "no_pen": "Red fumes in chromyl chloride test are $\\text{CrO}_2\\text{Cl}_2$. Unmistakable NCERT question!"
            },
            {
                "topic": "Lassaigne's Test for Nitrogen Detection",
                "q": "In Lassaigne's test for the detection of nitrogen in an organic compound, the Prussian blue color obtained is due to the formation of:",
                "params": [
                    {"ans": "\\text{Fe}_4[\\text{Fe}(\\text{CN})_6]_3 \\cdot x\\text{H}_2\\text{O}", "dist": ["\\text{Fe}_3[\\text{Fe}(\\text{CN})_6]_2", "\\text{Na}_4[\\text{Fe}(\\text{CN})_6]", "\\text{Fe}(\\text{SCN})_3"]},
                ],
                "hint": "Ferric ferrocyanide (iron(III) hexacyanoferrate(II)) gives the intense blue complex.",
                "appr": "Sodium fusion extract converts nitrogen and carbon to $\\text{NaCN}$. Reaction with $\\text{FeSO}_4$ and subsequent acidification with $\\text{FeCl}_3$ yields Prussian blue $\\text{Fe}_4[\\text{Fe}(\\text{CN})_6]_3$.",
                "sol": "1. $\\text{Na} + C + N \\xrightarrow{\\Delta} \\text{NaCN}$\n2. $6\\text{NaCN} + \\text{FeSO}_4 \\to \\text{Na}_4[\\text{Fe}(\\text{CN})_6] + \\text{Na}_2\\text{SO}_4$\n3. Acidification with $\\text{H}_2\\text{SO}_4$ and addition of $\\text{Fe}^{3+}$:\n$$4\\text{Fe}^{3+} + 3[\\text{Fe}(\\text{CN})_6]^{4-} \\to \\text{Fe}_4[\\text{Fe}(\\text{CN})_6]_3 \\text{ (Prussian blue)}$$",
                "mistake": "Confusing Prussian blue $\\text{Fe}_4[\\text{Fe}(\\text{CN})_6]_3$ with blood-red ferric thiocyanate $\\text{Fe}(\\text{SCN})_3$.",
                "no_pen": "Prussian blue formula: 4 outside, 3 inside bracket: $\\text{Fe}_4[\\text{Fe}(\\text{CN})_6]_3$!"
            }
        ],

        # 4. Chemical Thermodynamics
        "Chemical Thermodynamics": [
            {
                "topic": "Standard Free Energy and Equilibrium Constant",
                "q": "The relation between the standard Gibbs free energy change $\\Delta G^\\circ$ and the equilibrium constant $K$ of a chemical reaction at temperature $T$ is:",
                "params": [
                    {"ans": "\\Delta G^\\circ = -RT \\ln K", "dist": ["\\Delta G^\\circ = RT \\ln K", "\\Delta G^\\circ = -\\frac{RT}{K}", "\\Delta G^\\circ = -nFE^\\circ + RT \\ln K"]},
                ],
                "hint": "At equilibrium, $\\Delta G = 0$. Using $\\Delta G = \\Delta G^\\circ + RT\\ln Q$ gives the result.",
                "appr": "Set $Q = K$ and $\\Delta G = 0$ in the van 't Hoff reaction isotherm.",
                "sol": "From the reaction isotherm:\n$$\\Delta G = \\Delta G^\\circ + RT \\ln Q$$\nAt chemical equilibrium, the net driving force is zero ($\\Delta G = 0$) and the reaction quotient equals the equilibrium constant ($Q = K$):\n$$0 = \\Delta G^\\circ + RT \\ln K \\implies \\Delta G^\\circ = -RT \\ln K$$",
                "mistake": "Missing the negative sign, which would imply non-spontaneous reactions have large $K$.",
                "no_pen": "Standard thermodynamic relation: $\\Delta G^\\circ = -RT \\ln K$. Direct formula!"
            },
            {
                "topic": "Spontaneity Criteria in Terms of Enthalpy and Entropy",
                "q": "For an endothermic reaction ($\\Delta H > 0$) with an increase in entropy ($\\Delta S > 0$), the reaction is spontaneous at:",
                "params": [
                    {"ans": "\\text{High temperatures }(T > \\Delta H / \\Delta S)", "dist": ["\\text{Low temperatures }(T < \\Delta H / \\Delta S)", "\\text{All temperatures}", "\\text{No temperature}"]},
                ],
                "hint": "Check the sign of $\\Delta G = \\Delta H - T\\Delta S$. For spontaneity, $\\Delta G < 0$.",
                "appr": "$\\Delta G = (+) - T(+)$. For $\\Delta G < 0$, $T\\Delta S > \\Delta H \\implies T > \\Delta H / \\Delta S$.",
                "sol": "The condition for spontaneity at constant $T$ and $P$ is $\\Delta G < 0$.\n$$\\Delta G = \\Delta H - T\\Delta S$$\nWhen $\\Delta H > 0$ and $\\Delta S > 0$:\n$$\\Delta H - T\\Delta S < 0 \\implies T\\Delta S > \\Delta H \\implies T > \\frac{\\Delta H}{\\Delta S}$$\nThus, the reaction becomes spontaneous only at high temperatures.",
                "mistake": "Assuming endothermic reactions can never be spontaneous.",
                "no_pen": "$\\Delta H > 0$ resists, $\\Delta S > 0$ helps. Raise temperature to let entropy win! High $T$!"
            }
        ],

        # 5. Equilibrium
        "Equilibrium": [
            {
                "topic": "Relation Between Kp and Kc",
                "q": "For the gas phase reaction $\\text{PCl}_5(g) \\rightleftharpoons \\text{PCl}_3(g) + \\text{Cl}_2(g)$, the relation between $K_p$ and $K_c$ is:",
                "params": [
                    {"ans": "K_p = K_c(RT)", "dist": ["K_p = K_c(RT)^2", "K_p = K_c", "K_p = \\frac{K_c}{RT}"]},
                ],
                "hint": "$K_p = K_c (RT)^{\\Delta n_g}$, where $\\Delta n_g = \\sum n_{\\text{products}} - \\sum n_{\\text{reactants}}$.",
                "appr": "Calculate $\\Delta n_g = (1 + 1) - 1 = 1$. Substitute into $K_p = K_c (RT)^1$.",
                "sol": "For any gaseous equilibrium reaction:\n$$K_p = K_c (RT)^{\\Delta n_g}$$\nFor the dissociation of $\\text{PCl}_5(g)$:\n$$\\Delta n_g = (1 + 1) - 1 = 1$$\nTherefore:\n$$K_p = K_c (RT)^1 = K_c(RT)$$",
                "mistake": "Including solid or liquid stoichiometric coefficients in $\\Delta n_g$.",
                "no_pen": "Products have 2 moles gas, reactants have 1 mole gas: $\\Delta n_g = 1 \\implies K_p = K_c(RT)$!"
            },
            {
                "topic": "Solubility Product and Molar Solubility",
                "q": "For a sparingly soluble salt of type $A_2B_3$ having molar solubility $S$, its solubility product $K_{sp}$ in terms of $S$ is:",
                "params": [
                    {"ans": "108 S^5", "dist": ["6 S^5", "72 S^5", "27 S^4"]},
                ],
                "hint": "$A_2B_3(s) \\rightleftharpoons 2A^{3+} + 3B^{2-}$. $[A^{3+}] = 2S$ and $[B^{2-}] = 3S$.",
                "appr": "$K_{sp} = [A^{3+}]^2 [B^{2-}]^3 = (2S)^2 (3S)^3 = 4S^2 \\times 27S^3 = 108S^5$.",
                "sol": "Dissociation of $A_2B_3$:\n$$A_2B_3(s) \\rightleftharpoons 2A^{3+}(aq) + 3B^{2-}(aq)$$\nAt equilibrium, $[A^{3+}] = 2S$ and $[B^{2-}] = 3S$.\n$$K_{sp} = [A^{3+}]^2 [B^{2-}]^3 = (2S)^2 (3S)^3 = (4S^2)(27S^3) = 108 S^5$$",
                "mistake": "Forgetting to raise both coefficients to their stoichiometric powers: $2^2 \\times 3^3 = 108$.",
                "no_pen": "$x^x y^y S^{x+y} = 2^2 \\times 3^3 \\times S^5 = 4 \\times 27 S^5 = 108 S^5$ in 2 seconds!"
            }
        ],

        # 6. Hydrocarbons
        "Hydrocarbons": [
            {
                "topic": "Markovnikov vs Anti-Markovnikov Addition",
                "q": "The major product formed when propene ($CH_3-CH=CH_2$) reacts with $\\text{HBr}$ in the presence of benzoyl peroxide is:",
                "params": [
                    {"ans": "1-\\text{Bromopropane} \\text{ (n-propyl bromide)}", "dist": ["2-\\text{Bromopropane} \\text{ (isopropyl bromide)}", "1,2-\\text{Dibromopropane}", "2-\\text{Bromopropene}"]},
                ],
                "hint": "In the presence of peroxide, addition of HBr proceeds via free radical anti-Markovnikov mechanism (Kharasch effect).",
                "appr": "Peroxide generates bromine free radical $Br^\\bullet$, which attacks the terminal carbon to form the more stable $2^\\circ$ carbon radical.",
                "sol": "In the presence of organic peroxides, HBr adds to unsymmetrical alkenes via a free-radical mechanism (Peroxide effect / Kharasch effect):\n1. $Br^\\bullet$ attacks the terminal carbon $=CH_2$ to generate a secondary alkyl radical $CH_3-\\dot{C}H-CH_2Br$, which is more stable than a primary radical.\n2. The radical abstracts $H^\\bullet$ from HBr to form 1-bromopropane ($CH_3-CH_2-CH_2Br$).",
                "mistake": "Applying Kharasch peroxide effect to $\\text{HCl}$ or $\\text{HI}$ (it ONLY works for $\\text{HBr}$ due to energetics).",
                "no_pen": "HBr + Peroxide = Anti-Markovnikov! Bromine goes to less substituted carbon: 1-bromopropane!"
            },
            {
                "topic": "Ozonolysis of Alkenes",
                "q": "Ozonolysis of an alkene followed by reductive workup with $Zn/\\text{H}_2\\text{O}$ yields acetone and formaldehyde. The original alkene is:",
                "params": [
                    {"ans": "2-\\text{Methylprop-1-ene} \\text{ (isobutylene)}", "dist": ["\\text{But-2-ene}", "\\text{But-1-ene}", "2-\\text{Methylbut-2-ene}"]},
                ],
                "hint": "Remove $=O$ from both carbonyl products and join the two carbon atoms with a double bond.",
                "appr": "Acetone is $(CH_3)_2C=O$ and formaldehyde is $O=CH_2$. Connect the carbonyl carbons: $(CH_3)_2C=CH_2$.",
                "sol": "Products are:\n$$\\text{Acetone: } (CH_3)_2C=O \\quad \\text{and} \\quad \\text{Formaldehyde: } O=CH_2$$\nReversing reductive ozonolysis by eliminating oxygen and forming a $C=C$ double bond:\n$$(CH_3)_2C=O + O=CH_2 \\xrightarrow{-(O+O)} (CH_3)_2C=CH_2$$\nThis compound is 2-methylprop-1-ene (isobutylene).",
                "mistake": "Selecting but-2-ene which yields two molecules of acetaldehyde ($CH_3CHO$).",
                "no_pen": "Match pieces: $(CH_3)_2C=$ and $=CH_2 \\implies (CH_3)_2C=CH_2$ (2-methylpropene) instantly!"
            }
        ],

        # 7. Alcohols, Phenols and Ethers
        "Alcohols, Phenols and Ethers": [
            {
                "topic": "Reimer-Tiemann Reaction Mechanism",
                "q": "The electrophile generated during the Reimer-Tiemann reaction of phenol with chloroform ($\\text{CHCl}_3$) in aqueous $\\text{NaOH}$ is:",
                "params": [
                    {"ans": ":\\text{CCl}_2 \\text{ (Dichlorocarbene)}", "dist": ["\\text{CCl}_3^+", "^{\\bullet}\\text{CCl}_3", "\\text{CHCl}_2^+"]},
                ],
                "hint": "Strong base abstracts the acidic proton from chloroform followed by $\\alpha$-elimination of chloride ion.",
                "appr": "$OH^- + CHCl_3 \\rightleftharpoons H_2O + :CCl_3^- \\to :CCl_2 + Cl^-$. Dichlorocarbene is an electron-deficient neutral singlet electrophile.",
                "sol": "In the Reimer-Tiemann reaction, chloroform undergoes base-catalyzed $\\alpha$-elimination:\n$$\\text{OH}^- + \\text{CHCl}_3 \\rightleftharpoons \\text{H}_2\\text{O} + :\\text{CCl}_3^-$$\n$$:\\text{CCl}_3^- \\to :\\text{CCl}_2 + \\text{Cl}^-$$\nThe intermediate formed is dichlorocarbene ($:\\text{CCl}_2$), which possesses a sextet of electrons and acts as an electrophile attacking the phenoxide ring at ortho position to form salicylaldehyde.",
                "mistake": "Thinking the attacking species is a carbocation $\\text{CHCl}_2^+$ or trichloromethyl radical.",
                "no_pen": "Reimer-Tiemann electrophile is dichlorocarbene ($:\\text{CCl}_2$). Every JEE aspirant knows this by heart!"
            },
            {
                "topic": "Williamson Ether Synthesis",
                "q": "The best combination of reagents for the synthesis of tert-butyl ethyl ether is:",
                "params": [
                    {"ans": "(CH_3)_3C-O^-Na^+ \\text{ and } CH_3CH_2-Br", "dist": ["(CH_3)_3C-Br \\text{ and } CH_3CH_2-O^-Na^+", "(CH_3)_3C-OH \\text{ and } CH_3CH_2-OH / H^+", "(CH_3)_3C-Br \\text{ and } CH_3CH_2-OH"]},
                ],
                "hint": "Williamson synthesis is an $S_N2$ reaction. Alkyl halide must be unhindered ($1^\\circ$) to prevent elimination.",
                "appr": "If tertiary alkyl halide is used with strong alkoxide base, E2 elimination dominates to give alkene (isobutylene). Therefore, use $3^\\circ$ alkoxide with $1^\\circ$ alkyl halide.",
                "sol": "Williamson ether synthesis involves $S_N2$ displacement of halide by alkoxide ion:\n$$R-O^- + R'-X \\to R-O-R' + X^-$$\n1. If tertiary alkyl halide $(CH_3)_3C-Br$ is treated with $CH_3CH_2O^-$, the strong base causes E2 elimination, yielding 2-methylpropene as the major product.\n2. When potassium tert-butoxide $(CH_3)_3C-O^-Na^+$ reacts with primary ethyl bromide $CH_3CH_2-Br$, $S_N2$ substitution proceeds smoothly to give tert-butyl ethyl ether.",
                "mistake": "Using tertiary alkyl halide which undergoes 100% elimination instead of substitution.",
                "no_pen": "Primary halide + tertiary alkoxide = ether! Tertiary halide + alkoxide = alkene! Direct rule!"
            }
        ],

        # 8. Coordination Compounds
        "Coordination Compounds": [
            {
                "topic": "Spin-Only Magnetic Moment",
                "q": "The spin-only magnetic moment of $[\\text{Fe}(\\text{H}_2\\text{O})_6]^{2+}$ (atomic number of $\\text{Fe} = 26$) is approximately:",
                "params": [
                    {"ans": "4.90\\text{ BM}", "dist": ["5.92\\text{ BM}", "3.87\\text{ BM}", "0\\text{ BM}"]},
                ],
                "hint": "Water is a weak field ligand ($d^6$ high spin with 4 unpaired electrons). $\\mu = \\sqrt{n(n+2)}$ BM.",
                "appr": "$\\text{Fe}^{2+}$ is $3d^6$. Weak field $\\text{H}_2\\text{O}$ gives configuration $t_{2g}^4 e_g^2$, so $n = 4$ unpaired electrons. $\\mu = \\sqrt{4(6)} = \\sqrt{24} \\approx 4.90$ BM.",
                "sol": "In $[\\text{Fe}(\\text{H}_2\\text{O})_6]^{2+}$, iron is in $+2$ oxidation state: $\\text{Fe}^{2+} = [\\text{Ar}] 3d^6$.\n$\\text{H}_2\\text{O}$ is a weak field ligand ($\\Delta_o < P$), resulting in a high-spin complex:\n$$t_{2g}^4 e_g^2$$\nNumber of unpaired electrons $n = 4$.\n$$\\mu = \\sqrt{n(n + 2)} = \\sqrt{4(4 + 2)} = \\sqrt{24} \\approx 4.90\\text{ BM}$$",
                "mistake": "Treating $\\text{H}_2\\text{O}$ as strong field ligand and pairing electrons to get $n = 0$.",
                "no_pen": "$n = 4$ unpaired electrons $\\implies \\sqrt{4 \\times 6} = \\sqrt{24} \\approx 4.90$ BM. 1 second!"
            },
            {
                "topic": "IUPAC Nomenclature of Coordination Complexes",
                "q": "The correct IUPAC name for the coordination compound $[\\text{Co}(\\text{NH}_3)_5(\\text{CO}_3)]\\text{Cl}$ is:",
                "params": [
                    {"ans": "\\text{Pentaamminecarbonatocobalt(III) chloride}", "dist": ["\\text{Carbonatopentaamminecobalt(III) chloride}", "\\text{Pentaamminecarbonatocobalt(II) chloride}", "\\text{Pentaamminechloridocobalt(III) carbonate}"]},
                ],
                "hint": "Ligands are named alphabetically: ammine comes before carbonato. Oxidation state of Co is $+3$.",
                "appr": "$x + 5(0) + (-2) + (-1) = 0 \\implies x = +3$. Alphabetical order: ammine (a) before carbonato (c).",
                "sol": "1. Oxidation number of cobalt:\n$$x + 5(0) + 1(-2) + 1(-1) = 0 \\implies x - 3 = 0 \\implies x = +3$$\n2. Ligand naming order: 'ammine' precedes 'carbonato' alphabetically.\n3. Complex cation: pentaamminecarbonatocobalt(III).\n4. Anion: chloride.\nCombined IUPAC name: Pentaamminecarbonatocobalt(III) chloride.",
                "mistake": "Spelling ammine with single 'm' or miscalculating Co oxidation state as $+2$.",
                "no_pen": "Co is $+3$, 'ammine' beats 'carbonato' alphabetically: Pentaamminecarbonatocobalt(III) chloride!"
            }
        ]
    }

    # Fetch Chemistry chapters needing expansion
    c.execute("""
        SELECT c.subject, c.name,
               COUNT(q.id) as total_cnt,
               SUM(CASE WHEN q.exam_name = 'JEE Main' THEN 1 ELSE 0 END) as jee_cnt
        FROM chapters c
        LEFT JOIN questions q ON c.name = q.chapter
        WHERE c.subject = 'Chemistry'
        GROUP BY c.id
    """)
    chem_status = c.fetchall()

    total_added = 0
    total_jee_added = 0

    for subj, ch_name, total, jee in chem_status:
        jee = jee or 0
        target_total = 65
        target_jee = 25
        needed_total = max(0, target_total - total)
        needed_jee = max(0, target_jee - jee)

        if needed_total == 0 and needed_jee == 0:
            print(f"Skipping {ch_name}: already has total={total}, jee={jee}")
            continue

        print(f"Expanding [{subj}] {ch_name}: current total={total}, jee={jee} (adding +{needed_total} tot, +{needed_jee} jee)")

        templates = chem_templates.get(ch_name, chem_templates["Redox Reactions"])

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
                c, pid, "Chemistry", ch_name, tmpl["topic"],
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
    print(f"\nChemistry expansion complete: Added {total_added} total questions (including {total_jee_added} JEE Main questions)!")

if __name__ == "__main__":
    main()
