import os
import sqlite3

PUBLIC_DIAGRAMS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "diagrams")
os.makedirs(PUBLIC_DIAGRAMS, exist_ok=True)

# 1. Generate 15 precise SVG diagrams
DIAGRAMS = {
    "vt_graph_40s.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 260" width="100%" height="100%" style="background:#090d16; border-radius:12px; font-family:sans-serif;">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
    </marker>
  </defs>
  <!-- Grid -->
  <line x1="60" y1="40" x2="400" y2="40" stroke="#1e293b" stroke-dasharray="3 3"/>
  <line x1="60" y1="120" x2="400" y2="120" stroke="#1e293b" stroke-dasharray="3 3"/>
  <line x1="60" y1="200" x2="400" y2="200" stroke="#1e293b" stroke-dasharray="3 3"/>
  <!-- Axes -->
  <line x1="60" y1="210" x2="60" y2="25" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>
  <line x1="50" y1="120" x2="420" y2="120" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>
  <!-- Axis Labels -->
  <text x="35" y="45" fill="#38bdf8" font-size="12" font-weight="bold">+5</text>
  <text x="45" y="124" fill="#94a3b8" font-size="12">0</text>
  <text x="35" y="205" fill="#f43f5e" font-size="12" font-weight="bold">-5</text>
  <text x="25" y="25" fill="#38bdf8" font-size="12" font-weight="bold">v (m/s)</text>
  <text x="410" y="140" fill="#94a3b8" font-size="12" font-weight="bold">t (s)</text>
  <!-- Time ticks -->
  <text x="140" y="138" fill="#cbd5e1" font-size="11">10</text>
  <text x="220" y="138" fill="#cbd5e1" font-size="11">20</text>
  <text x="300" y="138" fill="#cbd5e1" font-size="11">30</text>
  <text x="380" y="138" fill="#cbd5e1" font-size="11">40</text>
  <!-- v-t Plot Path -->
  <path d="M 60 120 L 140 40 L 220 120 L 300 200 L 380 120" fill="none" stroke="#38bdf8" stroke-width="3"/>
  <!-- Shaded areas -->
  <polygon points="60,120 140,40 220,120" fill="rgba(56, 189, 248, 0.15)"/>
  <polygon points="220,120 300,200 380,120" fill="rgba(244, 63, 94, 0.15)"/>
  <text x="120" y="95" fill="#38bdf8" font-size="11" font-weight="bold">+Area = 25m</text>
  <text x="280" y="165" fill="#f43f5e" font-size="11" font-weight="bold">-Area = 25m</text>
</svg>""",

    "vt_graph_linear.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 250" width="100%" height="100%" style="background:#090d16; border-radius:12px; font-family:sans-serif;">
  <line x1="50" y1="210" x2="50" y2="30" stroke="#94a3b8" stroke-width="2"/>
  <line x1="50" y1="210" x2="410" y2="210" stroke="#94a3b8" stroke-width="2"/>
  <text x="25" y="35" fill="#38bdf8" font-size="12" font-weight="bold">v (m/s)</text>
  <text x="400" y="230" fill="#94a3b8" font-size="12" font-weight="bold">t (s)</text>
  <!-- Path -->
  <line x1="50" y1="210" x2="150" y2="90" stroke="#38bdf8" stroke-width="3"/>
  <line x1="150" y1="90" x2="270" y2="90" stroke="#38bdf8" stroke-width="3"/>
  <line x1="270" y1="90" x2="370" y2="210" stroke="#38bdf8" stroke-width="3"/>
  <polygon points="50,210 150,90 270,90 370,210" fill="rgba(56, 189, 248, 0.12)"/>
  <text x="40" y="95" fill="#38bdf8" font-size="11">v0</text>
  <text x="145" y="225" fill="#cbd5e1" font-size="11">t1</text>
  <text x="265" y="225" fill="#cbd5e1" font-size="11">t2</text>
  <text x="365" y="225" fill="#cbd5e1" font-size="11">t3</text>
</svg>""",

    "two_blocks_pulley.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 250" width="100%" height="100%" style="background:#090d16; border-radius:12px; font-family:sans-serif;">
  <!-- Table surface -->
  <line x1="40" y1="120" x2="300" y2="120" stroke="#64748b" stroke-width="4"/>
  <line x1="300" y1="120" x2="300" y2="230" stroke="#64748b" stroke-width="4"/>
  <!-- Pulley -->
  <circle cx="300" cy="115" r="16" fill="#334155" stroke="#94a3b8" stroke-width="2"/>
  <!-- Block A on table -->
  <rect x="120" y="80" width="60" height="40" fill="#1e293b" stroke="#38bdf8" stroke-width="2" rx="4"/>
  <text x="135" y="105" fill="#38bdf8" font-size="13" font-weight="bold">2 kg</text>
  <!-- String -->
  <line x1="180" y1="100" x2="300" y2="100" stroke="#f59e0b" stroke-width="2"/>
  <line x1="316" y1="115" x2="316" y2="170" stroke="#f59e0b" stroke-width="2"/>
  <!-- Block B hanging -->
  <rect x="296" y="170" width="40" height="40" fill="#1e293b" stroke="#10b981" stroke-width="2" rx="4"/>
  <text x="303" y="195" fill="#10b981" font-size="12" font-weight="bold">1.5 kg</text>
  <!-- Tension markers -->
  <text x="230" y="93" fill="#f59e0b" font-size="11">T</text>
  <text x="323" y="150" fill="#f59e0b" font-size="11">T</text>
</svg>""",

    "three_blocks_rope.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 260" width="100%" height="100%" style="background:#090d16; border-radius:12px; font-family:sans-serif;">
  <line x1="100" y1="30" x2="350" y2="30" stroke="#64748b" stroke-width="4"/>
  <!-- Pulley -->
  <circle cx="225" cy="55" r="20" fill="#334155" stroke="#94a3b8" stroke-width="2"/>
  <line x1="225" y1="30" x2="225" y2="55" stroke="#94a3b8" stroke-width="3"/>
  <!-- Ropes -->
  <line x1="205" y1="55" x2="205" y2="100" stroke="#f59e0b" stroke-width="2"/>
  <line x1="245" y1="55" x2="245" y2="140" stroke="#f59e0b" stroke-width="2"/>
  <!-- Block 1 -->
  <rect x="180" y="100" width="50" height="35" fill="#1e293b" stroke="#38bdf8" stroke-width="2" rx="4"/>
  <text x="195" y="122" fill="#38bdf8" font-size="12" font-weight="bold">m1</text>
  <line x1="205" y1="135" x2="205" y2="175" stroke="#f59e0b" stroke-width="2"/>
  <!-- Block 2 -->
  <rect x="180" y="175" width="50" height="35" fill="#1e293b" stroke="#818cf8" stroke-width="2" rx="4"/>
  <text x="195" y="197" fill="#818cf8" font-size="12" font-weight="bold">m2</text>
  <!-- Block 3 -->
  <rect x="220" y="140" width="50" height="40" fill="#1e293b" stroke="#10b981" stroke-width="2" rx="4"/>
  <text x="235" y="165" fill="#10b981" font-size="12" font-weight="bold">m3</text>
</svg>""",

    "suspended_mass_force.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 250" width="100%" height="100%" style="background:#090d16; border-radius:12px; font-family:sans-serif;">
  <line x1="120" y1="30" x2="320" y2="30" stroke="#64748b" stroke-width="4"/>
  <!-- Vertical reference -->
  <line x1="220" y1="30" x2="220" y2="210" stroke="#475569" stroke-dasharray="3 3"/>
  <!-- Deflected rope -->
  <line x1="220" y1="30" x2="270" y2="110" stroke="#f59e0b" stroke-width="2"/>
  <line x1="270" y1="110" x2="270" y2="175" stroke="#f59e0b" stroke-width="2"/>
  <!-- Horizontal force F -->
  <line x1="270" y1="110" x2="360" y2="110" stroke="#f43f5e" stroke-width="3"/>
  <polygon points="360,110 350,105 350,115" fill="#f43f5e"/>
  <text x="365" y="115" fill="#f43f5e" font-size="13" font-weight="bold">F</text>
  <!-- Angle theta -->
  <path d="M 220 70 A 40 40 0 0 0 240 65" fill="none" stroke="#38bdf8" stroke-width="2"/>
  <text x="230" y="55" fill="#38bdf8" font-size="11">θ</text>
  <!-- Mass -->
  <rect x="250" y="175" width="40" height="40" fill="#1e293b" stroke="#10b981" stroke-width="2" rx="4"/>
  <text x="263" y="200" fill="#10b981" font-size="13" font-weight="bold">m</text>
</svg>""",

    "falling_mass_pulley.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 250" width="100%" height="100%" style="background:#090d16; border-radius:12px; font-family:sans-serif;">
  <line x1="50" y1="230" x2="400" y2="230" stroke="#475569" stroke-width="4"/>
  <text x="50" y="245" fill="#64748b" font-size="11">Ground</text>
  <circle cx="220" cy="50" r="18" fill="#334155" stroke="#94a3b8" stroke-width="2"/>
  <line x1="202" y1="50" x2="202" y2="130" stroke="#f59e0b" stroke-width="2"/>
  <!-- 6 kg mass -->
  <rect x="180" y="130" width="44" height="44" fill="#1e293b" stroke="#38bdf8" stroke-width="2" rx="4"/>
  <text x="188" y="157" fill="#38bdf8" font-size="13" font-weight="bold">6 kg</text>
  <!-- Height marker -->
  <line x1="250" y1="174" x2="250" y2="230" stroke="#10b981" stroke-width="2" stroke-dasharray="3 3"/>
  <text x="260" y="205" fill="#10b981" font-size="12" font-weight="bold">h = 6 m</text>
</svg>""",

    "inclined_plane_spring.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 250" width="100%" height="100%" style="background:#090d16; border-radius:12px; font-family:sans-serif;">
  <!-- Incline -->
  <polygon points="60,210 380,210 380,60" fill="rgba(30, 41, 59, 0.5)" stroke="#64748b" stroke-width="3"/>
  <text x="110" y="200" fill="#38bdf8" font-size="11">θ = 30°</text>
  <!-- Spring at bottom -->
  <path d="M 120 180 L 130 172 L 140 182 L 150 172 L 160 182 L 170 174" fill="none" stroke="#f59e0b" stroke-width="3"/>
  <!-- Block -->
  <rect x="300" y="70" width="36" height="30" transform="rotate(25 300 70)" fill="#1e293b" stroke="#10b981" stroke-width="2" rx="3"/>
  <text x="308" y="95" fill="#10b981" font-size="11" font-weight="bold">m</text>
</svg>""",

    "radius_of_gyration.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 240" width="100%" height="100%" style="background:#090d16; border-radius:12px; font-family:sans-serif;">
  <!-- Sphere -->
  <circle cx="130" cy="120" r="50" fill="none" stroke="#38bdf8" stroke-width="3"/>
  <ellipse cx="130" cy="120" rx="50" ry="15" fill="none" stroke="#38bdf8" stroke-dasharray="3 3"/>
  <line x1="130" y1="40" x2="130" y2="200" stroke="#f43f5e" stroke-width="2"/>
  <text x="80" y="220" fill="#38bdf8" font-size="12" font-weight="bold">Hollow Sphere</text>
  <!-- Cylinder -->
  <ellipse cx="320" cy="70" rx="40" ry="15" fill="none" stroke="#10b981" stroke-width="2"/>
  <ellipse cx="320" cy="170" rx="40" ry="15" fill="none" stroke="#10b981" stroke-width="2"/>
  <line x1="280" y1="70" x2="280" y2="170" stroke="#10b981" stroke-width="2"/>
  <line x1="360" y1="70" x2="360" y2="170" stroke="#10b981" stroke-width="2"/>
  <line x1="320" y1="40" x2="320" y2="200" stroke="#f43f5e" stroke-width="2"/>
  <text x="270" y="220" fill="#10b981" font-size="12" font-weight="bold">Solid Cylinder</text>
</svg>""",

    "rolling_disc.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 240" width="100%" height="100%" style="background:#090d16; border-radius:12px; font-family:sans-serif;">
  <line x1="40" y1="200" x2="400" y2="200" stroke="#64748b" stroke-width="3"/>
  <circle cx="220" cy="130" r="70" fill="rgba(30, 41, 59, 0.4)" stroke="#38bdf8" stroke-width="3"/>
  <circle cx="220" cy="130" r="4" fill="#38bdf8"/>
  <line x1="220" y1="130" x2="220" y2="60" stroke="#f59e0b" stroke-width="2"/>
  <!-- Top Point P -->
  <circle cx="220" cy="60" r="5" fill="#f43f5e"/>
  <text x="215" y="50" fill="#f43f5e" font-size="13" font-weight="bold">P</text>
  <text x="230" y="100" fill="#f59e0b" font-size="12">R</text>
  <!-- Velocity vectors -->
  <line x1="220" y1="60" x2="290" y2="60" stroke="#10b981" stroke-width="3"/>
  <polygon points="290,60 280,55 280,65" fill="#10b981"/>
  <text x="295" y="65" fill="#10b981" font-size="12" font-weight="bold">v = 2v_cm</text>
</svg>""",

    "pivoted_rod.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 240" width="100%" height="100%" style="background:#090d16; border-radius:12px; font-family:sans-serif;">
  <line x1="80" y1="40" x2="80" y2="210" stroke="#64748b" stroke-width="4"/>
  <!-- Pivot C -->
  <circle cx="80" cy="120" r="6" fill="#f59e0b"/>
  <text x="60" y="125" fill="#f59e0b" font-size="13" font-weight="bold">C</text>
  <!-- Horizontal Rod CD -->
  <rect x="80" y="115" width="260" height="10" fill="#334155" stroke="#38bdf8" stroke-width="2" rx="2"/>
  <text x="345" y="125" fill="#38bdf8" font-size="13" font-weight="bold">D</text>
  <!-- Hanging Mass 8kg -->
  <line x1="330" y1="125" x2="330" y2="165" stroke="#f59e0b" stroke-width="2"/>
  <rect x="310" y="165" width="40" height="40" fill="#1e293b" stroke="#10b981" stroke-width="2" rx="4"/>
  <text x="317" y="190" fill="#10b981" font-size="12" font-weight="bold">8 kg</text>
  <!-- Rod weight 2kg at center -->
  <line x1="210" y1="125" x2="210" y2="165" stroke="#f43f5e" stroke-width="2"/>
  <text x="195" y="180" fill="#f43f5e" font-size="11">2 kg (Rod)</text>
</svg>""",

    "iv_characteristic.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 240" width="100%" height="100%" style="background:#090d16; border-radius:12px; font-family:sans-serif;">
  <line x1="60" y1="200" x2="60" y2="40" stroke="#94a3b8" stroke-width="2"/>
  <line x1="60" y1="200" x2="400" y2="200" stroke="#94a3b8" stroke-width="2"/>
  <text x="30" y="45" fill="#38bdf8" font-size="12" font-weight="bold">I (A)</text>
  <text x="390" y="220" fill="#94a3b8" font-size="12" font-weight="bold">V (V)</text>
  <line x1="60" y1="200" x2="360" y2="70" stroke="#38bdf8" stroke-width="3"/>
  <text x="260" y="110" fill="#38bdf8" font-size="12" font-weight="bold">Slope = 1/R</text>
</svg>""",

    "wheatstone_bridge.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 250" width="100%" height="100%" style="background:#090d16; border-radius:12px; font-family:sans-serif;">
  <!-- Diamond bridge -->
  <polygon points="225,40 345,125 225,210 105,125" fill="none" stroke="#38bdf8" stroke-width="3"/>
  <!-- Resistor symbols & text -->
  <text x="145" y="75" fill="#f59e0b" font-size="12" font-weight="bold">R1 = 2Ω</text>
  <text x="275" y="75" fill="#f59e0b" font-size="12" font-weight="bold">R2 = 4Ω</text>
  <text x="145" y="180" fill="#f59e0b" font-size="12" font-weight="bold">R3 = 3Ω</text>
  <text x="275" y="180" fill="#f59e0b" font-size="12" font-weight="bold">R4 = 6Ω</text>
  <!-- Center voltmeter -->
  <line x1="225" y1="40" x2="225" y2="210" stroke="#10b981" stroke-width="2" stroke-dasharray="4 4"/>
  <circle cx="225" cy="125" r="16" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
  <text x="219" y="130" fill="#10b981" font-size="12" font-weight="bold">V</text>
</svg>""",

    "gaussian_flux.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 240" width="100%" height="100%" style="background:#090d16; border-radius:12px; font-family:sans-serif;">
  <!-- Gaussian closed contour -->
  <path d="M 120 70 C 180 30, 280 50, 310 110 C 340 170, 260 210, 180 200 C 100 190, 80 120, 120 70 Z" fill="rgba(56, 189, 248, 0.12)" stroke="#38bdf8" stroke-width="2" stroke-dasharray="5 5"/>
  <text x="150" y="45" fill="#38bdf8" font-size="11" font-weight="bold">Gaussian Surface S</text>
  <!-- Enclosed charges -->
  <circle cx="160" cy="110" r="12" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
  <text x="153" y="115" fill="#10b981" font-size="11" font-weight="bold">+q1</text>
  <circle cx="230" cy="130" r="12" fill="#1e293b" stroke="#f43f5e" stroke-width="2"/>
  <text x="225" y="135" fill="#f43f5e" font-size="11" font-weight="bold">-q2</text>
  <circle cx="200" cy="170" r="12" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
  <text x="193" y="175" fill="#10b981" font-size="11" font-weight="bold">+q3</text>
  <!-- Outside charges -->
  <circle cx="60" cy="80" r="12" fill="#1e293b" stroke="#f43f5e" stroke-width="2"/>
  <text x="54" y="85" fill="#f43f5e" font-size="11" font-weight="bold">-q4</text>
  <circle cx="360" cy="150" r="12" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
  <text x="353" y="155" fill="#10b981" font-size="11" font-weight="bold">+q5</text>
</svg>""",

    "cyclic_pv_diagram.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 250" width="100%" height="100%" style="background:#090d16; border-radius:12px; font-family:sans-serif;">
  <line x1="60" y1="210" x2="60" y2="30" stroke="#94a3b8" stroke-width="2"/>
  <line x1="60" y1="210" x2="410" y2="210" stroke="#94a3b8" stroke-width="2"/>
  <text x="25" y="35" fill="#38bdf8" font-size="12" font-weight="bold">P</text>
  <text x="400" y="230" fill="#94a3b8" font-size="12" font-weight="bold">V</text>
  <!-- Cyclic loop A->B->C->D->A -->
  <polygon points="120,80 300,80 300,170 120,170" fill="rgba(56, 189, 248, 0.12)" stroke="#38bdf8" stroke-width="3"/>
  <circle cx="120" cy="80" r="5" fill="#f59e0b"/>
  <circle cx="300" cy="80" r="5" fill="#f59e0b"/>
  <circle cx="300" cy="170" r="5" fill="#f59e0b"/>
  <circle cx="120" cy="170" r="5" fill="#f59e0b"/>
  <text x="105" y="75" fill="#f59e0b" font-size="12" font-weight="bold">A</text>
  <text x="310" y="75" fill="#f59e0b" font-size="12" font-weight="bold">B</text>
  <text x="310" y="180" fill="#f59e0b" font-size="12" font-weight="bold">C</text>
  <text x="105" y="180" fill="#f59e0b" font-size="12" font-weight="bold">D</text>
</svg>""",

    "bohr_energy_levels.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 250" width="100%" height="100%" style="background:#090d16; border-radius:12px; font-family:sans-serif;">
  <line x1="80" y1="210" x2="370" y2="210" stroke="#94a3b8" stroke-width="2"/>
  <text x="385" y="215" fill="#94a3b8" font-size="12">n = 1 (-13.6 eV)</text>
  <line x1="80" y1="140" x2="370" y2="140" stroke="#94a3b8" stroke-width="2"/>
  <text x="385" y="145" fill="#94a3b8" font-size="12">n = 2 (-3.4 eV)</text>
  <line x1="80" y1="90" x2="370" y2="90" stroke="#94a3b8" stroke-width="2"/>
  <text x="385" y="95" fill="#94a3b8" font-size="12">n = 3 (-1.51 eV)</text>
  <line x1="80" y1="50" x2="370" y2="50" stroke="#94a3b8" stroke-width="2"/>
  <text x="385" y="55" fill="#94a3b8" font-size="12">n = 4 (-0.85 eV)</text>
  <!-- Transition arrow -->
  <line x1="200" y1="210" x2="200" y2="95" stroke="#f43f5e" stroke-width="3"/>
  <polygon points="200,90 194,102 206,102" fill="#f43f5e"/>
  <text x="215" y="160" fill="#f43f5e" font-size="12" font-weight="bold">hν = E3 - E1</text>
</svg>"""
}

for filename, content in DIAGRAMS.items():
    path = os.path.join(PUBLIC_DIAGRAMS, filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content.strip())
    print(f"Generated {filename}")

# 2. Update database image_url mapping for the 15 questions
MAPPING = {
    "q_2026_3a71dc1ab3": "/diagrams/vt_graph_40s.svg",
    "q_2025_86965ab3b3": "/diagrams/vt_graph_linear.svg",
    "q_2026_dc61b70f68": "/diagrams/two_blocks_pulley.svg",
    "q_2024_ef80da67f4": "/diagrams/three_blocks_rope.svg",
    "q_2024_d7855bb538": "/diagrams/suspended_mass_force.svg",
    "q_2026_8cdb32782d": "/diagrams/falling_mass_pulley.svg",
    "q_2024_7ace5f7544": "/diagrams/inclined_plane_spring.svg",
    "q_2024_be5cc504d8": "/diagrams/radius_of_gyration.svg",
    "q_2023_0d56b18e06": "/diagrams/rolling_disc.svg",
    "q_2023_1528905524": "/diagrams/pivoted_rod.svg",
    "q_2024_8a16ab76e6": "/diagrams/iv_characteristic.svg",
    "q_2023_061af5595c": "/diagrams/wheatstone_bridge.svg",
    "q_2024_93f9c5293f": "/diagrams/gaussian_flux.svg",
    "q_2024_355ac4a0aa": "/diagrams/cyclic_pv_diagram.svg",
    "q_2023_11360df04f": "/diagrams/bohr_energy_levels.svg"
}

conn = sqlite3.connect(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "prisma", "dev.db"))
c = conn.cursor()

for qid, img_url in MAPPING.items():
    c.execute("UPDATE questions SET image_url = ? WHERE id = ?", (img_url, qid))

conn.commit()
conn.close()
print(f"Updated image_url for {len(MAPPING)} questions in database!")
