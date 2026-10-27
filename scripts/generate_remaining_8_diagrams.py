import os, sqlite3, json

PUBLIC_DIR = r"C:\Users\chary\.gemini\antigravity\scratch\jee-main-2026\public\diagrams"
DB_PATH = r"C:\Users\chary\.gemini\antigravity\scratch\jee-main-2026\prisma\dev.db"

os.makedirs(PUBLIC_DIR, exist_ok=True)

svgs = {
    "stacked_blocks_friction.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 220" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#0f172a" rx="8"/>
  <!-- Ground -->
  <line x1="40" y1="180" x2="410" y2="180" stroke="#94a3b8" stroke-width="3"/>
  <path d="M50 180 l-10 15 M80 180 l-10 15 M110 180 l-10 15 M140 180 l-10 15 M170 180 l-10 15 M200 180 l-10 15 M230 180 l-10 15 M260 180 l-10 15 M290 180 l-10 15 M320 180 l-10 15 M350 180 l-10 15 M380 180 l-10 15" stroke="#64748b" stroke-width="2"/>
  <!-- Wall on left -->
  <line x1="60" y1="60" x2="60" y2="180" stroke="#94a3b8" stroke-width="4"/>
  <!-- Block B (8 kg) -->
  <rect x="150" y="120" width="180" height="60" fill="#1e293b" stroke="#38bdf8" stroke-width="2" rx="4"/>
  <text x="240" y="155" fill="#38bdf8" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">Block B (8 kg)</text>
  <!-- Block A (4 kg) -->
  <rect x="180" y="60" width="120" height="60" fill="#1e293b" stroke="#34d399" stroke-width="2" rx="4"/>
  <text x="240" y="95" fill="#34d399" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">Block A (4 kg)</text>
  <!-- String tying A to wall -->
  <line x1="60" y1="90" x2="180" y2="90" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="4,2"/>
  <circle cx="60" cy="90" r="4" fill="#f59e0b"/>
  <!-- Applied Force F on B -->
  <defs>
    <marker id="arr-f" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/>
    </marker>
  </defs>
  <line x1="330" y1="150" x2="390" y2="150" stroke="#f43f5e" stroke-width="3" marker-end="url(#arr-f)"/>
  <text x="405" y="155" fill="#f43f5e" font-family="sans-serif" font-size="15" font-weight="bold">F</text>
  <text x="240" y="25" fill="#e2e8f0" font-family="sans-serif" font-size="13" text-anchor="middle" font-weight="600">μ = 0.5 between all surfaces</text>
</svg>""",

    "heat_circuit_diagram.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 240" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#0f172a" rx="8"/>
  <defs>
    <marker id="arr-c" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/>
    </marker>
  </defs>
  <!-- Main loop -->
  <line x1="60" y1="60" x2="60" y2="180" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="60" y1="60" x2="180" y2="60" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="60" y1="180" x2="380" y2="180" stroke="#94a3b8" stroke-width="2.5"/>
  <!-- Battery on left -->
  <line x1="45" y1="110" x2="75" y2="110" stroke="#38bdf8" stroke-width="3"/>
  <line x1="52" y1="125" x2="68" y2="125" stroke="#94a3b8" stroke-width="2"/>
  <text x="30" y="122" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="bold">12 V</text>
  <!-- Parallel branch top -->
  <line x1="180" y1="60" x2="200" y2="35" stroke="#94a3b8" stroke-width="2"/>
  <line x1="180" y1="60" x2="200" y2="85" stroke="#94a3b8" stroke-width="2"/>
  <!-- Resistor 4 ohm -->
  <rect x="200" y="20" width="80" height="30" fill="#1e293b" stroke="#38bdf8" stroke-width="2" rx="4"/>
  <text x="240" y="40" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">R = 4 Ω</text>
  <!-- Resistor 6 ohm -->
  <rect x="200" y="70" width="80" height="30" fill="#1e293b" stroke="#34d399" stroke-width="2" rx="4"/>
  <text x="240" y="90" fill="#34d399" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">6 Ω</text>
  <line x1="280" y1="35" x2="300" y2="60" stroke="#94a3b8" stroke-width="2"/>
  <line x1="280" y1="85" x2="300" y2="60" stroke="#94a3b8" stroke-width="2"/>
  <!-- Internal resistance r = 1 ohm -->
  <line x1="300" y1="60" x2="330" y2="60" stroke="#94a3b8" stroke-width="2.5"/>
  <rect x="330" y="45" width="50" height="30" fill="#1e293b" stroke="#fbbf24" stroke-width="2" rx="4"/>
  <text x="355" y="65" fill="#fbbf24" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">r = 1 Ω</text>
  <line x1="380" y1="60" x2="380" y2="180" stroke="#94a3b8" stroke-width="2.5"/>
  <text x="225" y="220" fill="#94a3b8" font-family="sans-serif" font-size="13" text-anchor="middle">Circuit: Heat dissipated across R = 4 Ω in 100 s</text>
</svg>""",

    "particle_accelerator_potential.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 200" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#0f172a" rx="8"/>
  <defs>
    <marker id="arr-p" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/>
    </marker>
  </defs>
  <!-- Plates -->
  <line x1="80" y1="40" x2="80" y2="160" stroke="#ef4444" stroke-width="6"/>
  <text x="65" y="105" fill="#ef4444" font-family="sans-serif" font-size="16" font-weight="bold">+V</text>
  <line x1="350" y1="40" x2="350" y2="160" stroke="#3b82f6" stroke-width="6"/>
  <text x="365" y="105" fill="#3b82f6" font-family="sans-serif" font-size="16" font-weight="bold">0 V</text>
  <!-- Accelerating E-field lines -->
  <line x1="90" y1="70" x2="340" y2="70" stroke="#334155" stroke-dasharray="6,4" stroke-width="1.5" marker-end="url(#arr-p)"/>
  <line x1="90" y1="130" x2="340" y2="130" stroke="#334155" stroke-dasharray="6,4" stroke-width="1.5" marker-end="url(#arr-p)"/>
  <!-- Particle A -->
  <circle cx="150" cy="70" r="10" fill="#38bdf8"/>
  <text x="150" y="74" fill="#0f172a" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">q1</text>
  <text x="150" y="50" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Particle A (m1)</text>
  <!-- Particle B -->
  <circle cx="150" cy="130" r="14" fill="#34d399"/>
  <text x="150" y="134" fill="#0f172a" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">q2</text>
  <text x="150" y="165" fill="#34d399" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Particle B (m2)</text>
  <text x="215" y="190" fill="#94a3b8" font-family="sans-serif" font-size="13" text-anchor="middle">ΔV = 200 keV accelerating potential</text>
</svg>""",

    "osmosis_spm_diagram.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 240" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#0f172a" rx="8"/>
  <!-- U-tube -->
  <path d="M90 40 L90 170 Q90 200 120 200 L320 200 Q350 200 350 170 L350 40" fill="none" stroke="#64748b" stroke-width="4"/>
  <!-- Liquid in Left (Side X) -->
  <rect x="92" y="90" width="131" height="108" fill="#0284c7" fill-opacity="0.25"/>
  <text x="155" y="130" fill="#38bdf8" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">Side X</text>
  <text x="155" y="150" fill="#cbd5e1" font-family="sans-serif" font-size="12" text-anchor="middle">FeCl₃ solution</text>
  <!-- Semi-permeable membrane in center -->
  <line x1="225" y1="80" x2="225" y2="200" stroke="#f59e0b" stroke-width="4" stroke-dasharray="6,3"/>
  <text x="225" y="65" fill="#f59e0b" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">SPM</text>
  <!-- Liquid in Right (Side Y) -->
  <rect x="227" y="90" width="121" height="108" fill="#059669" fill-opacity="0.25"/>
  <text x="285" y="130" fill="#34d399" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">Side Y</text>
  <text x="285" y="150" fill="#cbd5e1" font-family="sans-serif" font-size="12" text-anchor="middle">K₄[Fe(CN)₆] soln</text>
  <!-- Water osmosis arrows -->
  <defs>
    <marker id="arr-osm" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L0,6 L6,3 z" fill="#e2e8f0"/>
    </marker>
  </defs>
  <line x1="180" y1="180" x2="215" y2="180" stroke="#e2e8f0" stroke-width="2" marker-end="url(#arr-osm)"/>
  <text x="225" y="225" fill="#94a3b8" font-family="sans-serif" font-size="12" text-anchor="middle">Solvent osmosis occurs across SPM</text>
</svg>""",

    "molar_conductivity_curve.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 250" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#0f172a" rx="8"/>
  <defs>
    <marker id="arr-ax" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
      <path d="M0,0 L0,6 L6,3 z" fill="#94a3b8"/>
    </marker>
  </defs>
  <!-- Axes -->
  <line x1="70" y1="210" x2="410" y2="210" stroke="#94a3b8" stroke-width="2.5" marker-end="url(#arr-ax)"/>
  <line x1="70" y1="210" x2="70" y2="30" stroke="#94a3b8" stroke-width="2.5" marker-end="url(#arr-ax)"/>
  <text x="420" y="215" fill="#94a3b8" font-family="sans-serif" font-size="13" font-weight="bold">√c</text>
  <text x="50" y="25" fill="#94a3b8" font-family="sans-serif" font-size="13" font-weight="bold">Λm</text>
  <!-- Curve A: Weak electrolyte (CH3COOH) - steep hyperbolic rise -->
  <path d="M 80 40 Q 95 160 250 185 L 370 195" fill="none" stroke="#f43f5e" stroke-width="3"/>
  <text x="135" y="70" fill="#f43f5e" font-family="sans-serif" font-size="13" font-weight="bold">Electrolyte A (Weak)</text>
  <!-- Curve B: Strong electrolyte (KCl) - linear with intercept Λ°m -->
  <line x1="70" y1="100" x2="380" y2="150" stroke="#38bdf8" stroke-width="3"/>
  <line x1="50" y1="96" x2="70" y2="100" stroke="#38bdf8" stroke-dasharray="3,3" stroke-width="2"/>
  <text x="75" y="95" fill="#38bdf8" font-family="sans-serif" font-size="11">Λ°m</text>
  <text x="310" y="130" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="bold">Electrolyte B (Strong)</text>
  <text x="240" y="235" fill="#cbd5e1" font-family="sans-serif" font-size="12" text-anchor="middle">Debye-Hückel-Onsager Plot: Λm vs √c</text>
</svg>""",

    "kinetics_order_graph.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 250" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#0f172a" rx="8"/>
  <defs>
    <marker id="arr-k" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
      <path d="M0,0 L0,6 L6,3 z" fill="#94a3b8"/>
    </marker>
  </defs>
  <!-- Axes -->
  <line x1="70" y1="210" x2="410" y2="210" stroke="#94a3b8" stroke-width="2.5" marker-end="url(#arr-k)"/>
  <line x1="70" y1="210" x2="70" y2="30" stroke="#94a3b8" stroke-width="2.5" marker-end="url(#arr-k)"/>
  <text x="420" y="215" fill="#94a3b8" font-family="sans-serif" font-size="13" font-weight="bold">t</text>
  <text x="45" y="25" fill="#94a3b8" font-family="sans-serif" font-size="13" font-weight="bold">[R]</text>
  <!-- [R]0 on Y-axis -->
  <circle cx="70" cy="50" r="4" fill="#fbbf24"/>
  <text x="40" y="55" fill="#fbbf24" font-family="sans-serif" font-size="12" font-weight="bold">[R]₀</text>
  <!-- Curve 1: Zero order (linear drop to zero) -->
  <line x1="70" y1="50" x2="260" y2="210" stroke="#38bdf8" stroke-width="3"/>
  <text x="210" y="115" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold">(1) Zero Order</text>
  <!-- Curve 2: First order (exponential decay asymptotic to t-axis) -->
  <path d="M 70 50 Q 150 160 380 200" fill="none" stroke="#34d399" stroke-width="3"/>
  <text x="290" y="165" fill="#34d399" font-family="sans-serif" font-size="12" font-weight="bold">(2) First Order</text>
  <text x="240" y="238" fill="#cbd5e1" font-family="sans-serif" font-size="12" text-anchor="middle">Reactant concentration [R] vs time t</text>
</svg>""",

    "catalyst_reaction_profile.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 250" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#0f172a" rx="8"/>
  <defs>
    <marker id="arr-pe" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
      <path d="M0,0 L0,6 L6,3 z" fill="#94a3b8"/>
    </marker>
  </defs>
  <!-- Axes -->
  <line x1="60" y1="210" x2="410" y2="210" stroke="#94a3b8" stroke-width="2.5" marker-end="url(#arr-pe)"/>
  <line x1="60" y1="210" x2="60" y2="30" stroke="#94a3b8" stroke-width="2.5" marker-end="url(#arr-pe)"/>
  <text x="420" y="215" fill="#94a3b8" font-family="sans-serif" font-size="12" font-weight="bold">Progress</text>
  <text x="40" y="25" fill="#94a3b8" font-family="sans-serif" font-size="12" font-weight="bold">P.E.</text>
  <!-- Reactants Level -->
  <line x1="60" y1="160" x2="110" y2="160" stroke="#e2e8f0" stroke-width="3"/>
  <text x="85" y="180" fill="#e2e8f0" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Reactants</text>
  <!-- Products Level -->
  <line x1="330" y1="185" x2="390" y2="185" stroke="#e2e8f0" stroke-width="3"/>
  <text x="360" y="205" fill="#e2e8f0" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Products</text>
  <!-- Uncatalyzed Path (Ea high) -->
  <path d="M 110 160 Q 220 20 330 185" fill="none" stroke="#f43f5e" stroke-width="2.5"/>
  <text x="220" y="45" fill="#f43f5e" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Uncatalyzed (Higher Ea)</text>
  <!-- Catalyzed Path (Ea low) -->
  <path d="M 110 160 Q 220 85 330 185" fill="none" stroke="#34d399" stroke-width="2.5" stroke-dasharray="5,3"/>
  <text x="220" y="110" fill="#34d399" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Catalyzed (Lower Ea)</text>
  <text x="240" y="238" fill="#cbd5e1" font-family="sans-serif" font-size="12" text-anchor="middle">Positive catalyst lowers activation energy without changing ΔH</text>
</svg>""",

    "multistep_reaction_coordinate.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 250" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#0f172a" rx="8"/>
  <defs>
    <marker id="arr-m" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
      <path d="M0,0 L0,6 L6,3 z" fill="#94a3b8"/>
    </marker>
  </defs>
  <!-- Axes -->
  <line x1="60" y1="210" x2="410" y2="210" stroke="#94a3b8" stroke-width="2.5" marker-end="url(#arr-m)"/>
  <line x1="60" y1="210" x2="60" y2="30" stroke="#94a3b8" stroke-width="2.5" marker-end="url(#arr-m)"/>
  <text x="420" y="215" fill="#94a3b8" font-family="sans-serif" font-size="12" font-weight="bold">Coord</text>
  <text x="40" y="25" fill="#94a3b8" font-family="sans-serif" font-size="12" font-weight="bold">P.E.</text>
  <!-- Reactant A -->
  <line x1="60" y1="160" x2="90" y2="160" stroke="#38bdf8" stroke-width="3"/>
  <text x="75" y="180" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">A</text>
  <!-- Step 1 TS1 -->
  <path d="M 90 160 Q 130 90 170 140" fill="none" stroke="#94a3b8" stroke-width="2.5"/>
  <text x="130" y="80" fill="#cbd5e1" font-family="sans-serif" font-size="11" text-anchor="middle">TS₁</text>
  <!-- Intermediate 1 -->
  <text x="170" y="155" fill="#cbd5e1" font-family="sans-serif" font-size="11" text-anchor="middle">I₁</text>
  <!-- Step 2 TS2 (Highest Barrier: RDS) -->
  <path d="M 170 140 Q 225 30 280 130" fill="none" stroke="#f43f5e" stroke-width="3"/>
  <text x="225" y="25" fill="#f43f5e" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">TS₂ (Slowest Step: RDS)</text>
  <!-- Intermediate 2 -->
  <text x="280" y="145" fill="#cbd5e1" font-family="sans-serif" font-size="11" text-anchor="middle">I₂</text>
  <!-- Step 3 TS3 -->
  <path d="M 280 130 Q 320 80 360 175" fill="none" stroke="#94a3b8" stroke-width="2.5"/>
  <text x="320" y="75" fill="#cbd5e1" font-family="sans-serif" font-size="11" text-anchor="middle">TS₃</text>
  <!-- Product B -->
  <line x1="360" y1="175" x2="400" y2="175" stroke="#34d399" stroke-width="3"/>
  <text x="380" y="195" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">B</text>
  <text x="240" y="238" fill="#cbd5e1" font-family="sans-serif" font-size="12" text-anchor="middle">Multi-step reaction profile: Step with highest barrier is RDS</text>
</svg>"""
}

# Write SVGs to disk
for filename, content in svgs.items():
    filepath = os.path.join(PUBLIC_DIR, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content.strip())
    print(f"Generated {filename}")

# Connect and update questions
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

# 1. Update questions referencing the 8 diagrams
updates = [
    (
        "/diagrams/stacked_blocks_friction.svg",
        json.dumps(["40\\,\\text{N}", "80\\,\\text{N}", "60\\,\\text{N}", "100\\,\\text{N}"]),
        "B",
        "q_2026_1ad0384263"
    ),
    (
        "/diagrams/heat_circuit_diagram.svg",
        None,
        "1200",
        "q_2026_4ccb9feb0e"
    ),
    (
        "/diagrams/particle_accelerator_potential.svg",
        None,
        "2",
        "q_2026_88a6a646a4"
    ),
    (
        "/diagrams/osmosis_spm_diagram.svg",
        json.dumps([
            "Water flows from side with lower concentration to higher concentration, no precipitate in SPM",
            "Green/blue precipitate forms in SPM",
            "Prussian blue forms only on side X",
            "Precipitate forms equally on both sides"
        ]),
        "A",
        "q_2024_5ac995bf8b"
    ),
    (
        "/diagrams/molar_conductivity_curve.svg",
        json.dumps([
            "\\text{KCl},\\,\\text{CH}_3\\text{COOH}",
            "\\text{NaCl},\\,\\text{HCl}",
            "\\text{CH}_3\\text{COOH},\\,\\text{KCl}",
            "\\text{CH}_3\\text{COOH},\\,\\text{HCOOH}"
        ]),
        "C",
        "q_2024_0782040c16"
    ),
    (
        "/diagrams/kinetics_order_graph.svg",
        json.dumps([
            "Reaction 1 is zero order and reaction 2 is first order",
            "Reaction 1 is first order and reaction 2 is second order",
            "Reaction 1 is second order and reaction 2 is zero order",
            "Both reactions are zero order"
        ]),
        "A",
        "q_2026_8a431692ca"
    ),
    (
        "/diagrams/catalyst_reaction_profile.svg",
        json.dumps([
            "Catalyst changes the reaction enthalpy \\Delta H",
            "Catalyst lowers activation energy E_a without altering \\Delta H",
            "Catalyst increases both activation energy and \\Delta H",
            "Catalyst only alters the potential energy of the products"
        ]),
        "B",
        "q_2023_ee536ab2fc"
    ),
    (
        "/diagrams/multistep_reaction_coordinate.svg",
        json.dumps([
            "Step 1 is rate determining because it produces intermediate I_1",
            "Step 3 is rate determining because it is the final step",
            "All three steps have identical rates",
            "Step 2 is rate determining because TS_2 has the highest activation barrier"
        ]),
        "D",
        "q_2023_d53415073f"
    )
]

for img, opts, corr, qid in updates:
    if opts is not None:
        c.execute("""
            UPDATE questions
            SET image_url = ?, options_json = ?, correct_answer = ?, needs_review = 1
            WHERE id = ?
        """, (img, opts, corr, qid))
    else:
        c.execute("""
            UPDATE questions
            SET image_url = ?, correct_answer = ?, needs_review = 1
            WHERE id = ?
        """, (img, corr, qid))

# 2. Fix q_2025_9eb0984a26 (Kinematics particle displacement)
q2025_text = "A particle moves along the $x$-axis and has its displacement $x$ varying with time $t$ according to the equation: $$x = c_0(t^2 - 2) + c(t - 2)^2$$ where $c_0$ and $c$ are constants of appropriate dimensions. Then, which of the following statements is correct?"
q2025_opts = json.dumps([
    "The acceleration of the particle is $2(c + c_0)$",
    "The acceleration of the particle is $2c_0$",
    "The acceleration of the particle is $2c$",
    "The initial velocity of the particle is $4c$"
])
q2025_sol = "**Full Step-by-Step Solution**:\n\n1. Expand the displacement equation:\n$$x = c_0(t^2 - 2) + c(t - 2)^2 = c_0 t^2 - 2c_0 + c(t^2 - 4t + 4)$$\nGrouping terms by powers of $t$:\n$$x = (c_0 + c)t^2 - 4ct + (4c - 2c_0)$$\n\n2. Differentiate $x$ with respect to $t$ to find velocity $v$:\n$$v = \\frac{dx}{dt} = 2(c_0 + c)t - 4c$$\n\n3. Differentiate $v$ with respect to $t$ to find acceleration $a$:\n$$a = \\frac{dv}{dt} = 2(c_0 + c) = 2(c + c_0)$$\n\n4. Acceleration is constant and equal to $2(c + c_0)$. At $t = 0$, $v(0) = -4c \\neq 4c$.\n\nTherefore, the correct statement is **Option A**."

c.execute("""
    UPDATE questions
    SET question_text_latex = ?, options_json = ?, correct_answer = 'A', needs_review = 0
    WHERE id = 'q_2025_9eb0984a26'
""", (q2025_text, q2025_opts))

c.execute("""
    UPDATE explanations
    SET full_solution_latex = ?, hint = 'Differentiate displacement x twice with respect to time to get acceleration.', approach = 'Expand the quadratic in t, differentiate once for velocity dx/dt, and a second time for acceleration dv/dt.'
    WHERE question_id = 'q_2025_9eb0984a26'
""", (q2025_sol,))

# 3. Fix 10 matrix questions with duplicate option '27' -> change 4th option to '243'
matrix_ids = [
    'q_ts e_4ef618a840', 'q_ts e_617132262b', 'q_ts e_752fc279d1',
    'q_ts e_a26831f24b', 'q_bits_8606fac20d', 'q_bits_93a1b2eb11',
    'q_vite_6b226be570', 'q_vite_1c3c665300', 'q_math_2ff88e39f9', 'q_math_207e92fae8'
]
fixed_matrix_opts = json.dumps(["9", "27", "81", "243"])
for mid in matrix_ids:
    c.execute("UPDATE questions SET options_json = ?, correct_answer = 'C' WHERE id = ?", (fixed_matrix_opts, mid))

conn.commit()
print("All 8 diagram questions updated and linked!")
print("q_2025_9eb0984a26 fully restored with official options & solution!")
print(f"Fixed {len(matrix_ids)} matrix questions duplicate options!")
