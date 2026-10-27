import os
import sqlite3

PUBLIC_DIAGRAMS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "diagrams")

svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 250" width="100%" height="100%" style="background:#090d16; border-radius:12px; font-family:sans-serif;">
  <!-- Main loop -->
  <line x1="60" y1="125" x2="130" y2="125" stroke="#94a3b8" stroke-width="3"/>
  <!-- Resistor R -->
  <rect x="130" y="115" width="60" height="20" fill="#1e293b" stroke="#38bdf8" stroke-width="2" rx="3"/>
  <text x="145" y="130" fill="#38bdf8" font-size="12" font-weight="bold">R</text>
  <!-- Wire to Ammeter -->
  <line x1="190" y1="125" x2="250" y2="125" stroke="#94a3b8" stroke-width="3"/>
  <!-- Ammeter Branch (Top) -->
  <line x1="250" y1="125" x2="250" y2="80" stroke="#94a3b8" stroke-width="2"/>
  <line x1="250" y1="80" x2="290" y2="80" stroke="#94a3b8" stroke-width="2"/>
  <circle cx="310" cy="80" r="18" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
  <text x="303" y="86" fill="#10b981" font-size="14" font-weight="bold">A</text>
  <line x1="328" y1="80" x2="370" y2="80" stroke="#94a3b8" stroke-width="2"/>
  <line x1="370" y1="80" x2="370" y2="125" stroke="#94a3b8" stroke-width="2"/>
  <!-- Shunt Branch (Bottom) -->
  <line x1="250" y1="125" x2="250" y2="170" stroke="#94a3b8" stroke-width="2"/>
  <line x1="250" y1="170" x2="280" y2="170" stroke="#94a3b8" stroke-width="2"/>
  <rect x="280" y="160" width="60" height="20" fill="#1e293b" stroke="#f59e0b" stroke-width="2" rx="3"/>
  <text x="290" y="175" fill="#f59e0b" font-size="12" font-weight="bold">S (Shunt)</text>
  <line x1="340" y1="170" x2="370" y2="170" stroke="#94a3b8" stroke-width="2"/>
  <!-- Exit wire -->
  <line x1="370" y1="125" x2="410" y2="125" stroke="#94a3b8" stroke-width="3"/>
</svg>"""

with open(os.path.join(PUBLIC_DIAGRAMS, "ammeter_shunt.svg"), "w", encoding="utf-8") as f:
    f.write(svg_content)

conn = sqlite3.connect(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "prisma", "dev.db"))
c = conn.cursor()
c.execute("UPDATE questions SET image_url = '/diagrams/ammeter_shunt.svg' WHERE id = 'q_2025_16515bf910'")
conn.commit()
conn.close()
print("Linked ammeter_shunt.svg to q_2025_16515bf910!")
