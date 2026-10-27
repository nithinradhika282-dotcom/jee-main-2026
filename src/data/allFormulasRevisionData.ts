export interface RevisionChapterItem {
  id: string;
  subject: "Physics" | "Chemistry" | "Mathematics";
  chapter: string;
  class_level: 11 | 12;
  high_yield_weightage: "Very High" | "High" | "Medium";
  topic: string;
  formula_latex: string;
  description: string;
  common_trap: string;
  no_pen_trick: string;
  key_points: string[];
}

export const ALL_REVISION_DATA: RevisionChapterItem[] = [
  // =========================================================================
  // PHYSICS - CLASS 11 (10 CHAPTERS)
  // =========================================================================
  {
    id: "phy-11-01",
    subject: "Physics",
    chapter: "Units and Measurements",
    class_level: 11,
    high_yield_weightage: "High",
    topic: "Dimensional Analysis & Error Propagation",
    formula_latex: "\\frac{\\Delta Z}{Z} = a\\frac{\\Delta A}{A} + b\\frac{\\Delta B}{B} + c\\frac{\\Delta C}{C} \\quad \\text{for } Z = \\frac{A^a B^b}{C^c}",
    description: "Percentage errors always add up in worst-case analysis: $\\frac{\\Delta Z}{Z}\\times 100 = \\left(a\\frac{\\Delta A}{A} + b\\frac{\\Delta B}{B} + c\\frac{\\Delta C}{C}\\right)\\times 100$ percent.",
    common_trap: "Subtracting error for denominator terms like $C^c$. Fractional errors ALWAYS add!",
    no_pen_trick: "Multiply each fractional error directly by its power: exponent $a$ times %A error.",
    key_points: [
      "Vernier Caliper LC = $1\\text{ MSD} - 1\\text{ VSD} = \\frac{1\\text{ MSD}}{n}$.",
      "Screw Gauge LC = $\\frac{\\text{Pitch}}{\\text{Total circular divisions}}$.",
      "Constants with dimensions: $G$ ($[M^{-1}L^3T^{-2}]$), $h$ ($[ML^2T^{-1}]$), $\\mu_0, \\varepsilon_0$."
    ]
  },
  {
    id: "phy-11-02",
    subject: "Physics",
    chapter: "Kinematics",
    class_level: 11,
    high_yield_weightage: "Very High",
    topic: "Motion in 1D & Projectile Motion",
    formula_latex: "T = \\frac{2u\\sin\\theta}{g}, \\quad H_{\\max} = \\frac{u^2\\sin^2\\theta}{2g}, \\quad R = \\frac{u^2\\sin 2\\theta}{g}",
    description: "Trajectory equation: $y = x\\tan\\theta\\left(1 - \\frac{x}{R}\\right)$. Displacement in $n$-th sec: $s_n = u + \\frac{a}{2}(2n - 1)$.",
    common_trap: "Using $v^2 - u^2 = 2as$ when acceleration is variable (use $v\\frac{dv}{dx} = a$ instead).",
    no_pen_trick: "At maximum range $\\theta = 45^\\circ$, $R_{\\max} = 4 H_{\\max}$. Direct factor of 4!",
    key_points: [
      "Complementary angles $\\theta$ and $90^\\circ - \\theta$ produce identical horizontal range.",
      "Average speed for equal distance intervals: $v_{\\text{avg}} = \\frac{2v_1v_2}{v_1 + v_2}$ (harmonic mean).",
      "Area under $a-t$ curve gives $\\Delta v$; slope of $v-t$ curve gives instantaneous acceleration."
    ]
  },
  {
    id: "phy-11-03",
    subject: "Physics",
    chapter: "Laws of Motion",
    class_level: 11,
    high_yield_weightage: "Very High",
    topic: "Newton's Laws, Friction & Banking",
    formula_latex: "f_s \\le \\mu_s N, \\quad f_k = \\mu_k N, \\quad v_{\\max} = \\sqrt{rg\\left(\\frac{\\tan\\theta + \\mu}{1 - \\mu\\tan\\theta}\\right)}",
    description: "Ideal banking angle with zero friction requirement: $\\tan\\theta = \\frac{v^2}{rg}$. Impulsive force $J = \\int F dt = \\Delta p$.",
    common_trap: "Assuming static friction is always equal to $\\mu_s N$. Static friction is self-adjusting from $0$ to $\\mu_s N$!",
    no_pen_trick: "On frictionless incline, block acceleration is $g\\sin\\theta$, time of descent $t = \\sqrt{\\frac{2h}{g\\sin^2\\theta}}$.",
    key_points: [
      "Apparent weight in elevator: $N = m(g + a)$ (upward acceleration), $N = m(g - a)$ (downward).",
      "Pulley acceleration $a = \\frac{(m_1 - m_2)g}{m_1 + m_2}$, tension $T = \\frac{2m_1m_2g}{m_1 + m_2}$.",
      "Pseudo force $-m\\vec{a}_{frame}$ must be applied only in non-inertial reference frames."
    ]
  },
  {
    id: "phy-11-04",
    subject: "Physics",
    chapter: "Work, Energy and Power",
    class_level: 11,
    high_yield_weightage: "Very High",
    topic: "Work-Energy Theorem & Vertical Circular Motion",
    formula_latex: "W_{\\text{net}} = \\Delta K, \\quad P = \\vec{F}\\cdot\\vec{v}, \\quad v_{\\text{bottom}} \\ge \\sqrt{5gR}, \\quad v_{\\text{top}} \\ge \\sqrt{gR}",
    description: "Conservative force: $\\vec{F} = -\\vec{\\nabla} U = -\\frac{\\partial U}{\\partial x}\\hat{i} - \\frac{\\partial U}{\\partial y}\\hat{j} - \\frac{\\partial U}{\\partial z}\\hat{k}$. Stable equilibrium when $\\frac{d^2U}{dx^2} > 0$.",
    common_trap: "Applying conservation of mechanical energy when friction or drag does work (use $W_{nc} = \\Delta E$).",
    no_pen_trick: "Tension difference between bottom and top of vertical circle is ALWAYS $6mg$, independent of initial velocity!",
    key_points: [
      "Potential energy of compressed spring $U = \\frac{1}{2}kx^2$.",
      "Coefficient of restitution: $e = \\frac{v_2 - v_1}{u_1 - u_2}$. For elastic collision $e=1$; perfectly inelastic $e=0$.",
      "Fraction of kinetic energy retained in 1D head-on elastic collision with identical target is zero (velocities swap)."
    ]
  },
  {
    id: "phy-11-05",
    subject: "Physics",
    chapter: "Rotational Motion",
    class_level: 11,
    high_yield_weightage: "Very High",
    topic: "Moment of Inertia, Torque & Pure Rolling",
    formula_latex: "I = I_{cm} + Md^2, \\quad \\vec{\\tau} = \\frac{d\\vec{L}}{dt} = I\\vec{\\alpha}, \\quad a_{\\text{rolling}} = \\frac{g\\sin\\theta}{1 + \\frac{k^2}{R^2}}",
    description: "Kinetic energy of rolling body: $K = \\frac{1}{2}Mv_{cm}^2\\left(1 + \\frac{k^2}{R^2}\\right)$. Angular momentum $\\vec{L} = \\vec{r}\\times\\vec{p} + I_{cm}\\vec{\\omega}$.",
    common_trap: "Applying parallel axis theorem about any arbitrary axis instead of the centre of mass axis.",
    no_pen_trick: "Acceleration ranking down an incline: Solid Sphere ($k^2/R^2 = 2/5$) > Disc ($1/2$) > Solid Cylinder ($1/2$) > Hollow Sphere ($2/3$) > Ring ($1$).",
    key_points: [
      "Perpendicular axis theorem ($I_z = I_x + I_y$) is valid ONLY for planar (2D laminar) bodies.",
      "Pure rolling condition on stationary ground: $v_{cm} = R\\omega$, velocity of bottom contact point is zero.",
      "Torque about instantaneous centre of zero velocity (ICR) simplifies non-inertial rolling dynamics."
    ]
  },
  {
    id: "phy-11-06",
    subject: "Physics",
    chapter: "Gravitation",
    class_level: 11,
    high_yield_weightage: "High",
    topic: "Gravitational Potential, Escape & Orbital Velocity",
    formula_latex: "g_h = g\\left(1 - \\frac{2h}{R}\\right) \\; [h \\ll R], \\quad v_e = \\sqrt{2gR} \\approx 11.2\\text{ km/s}, \\quad v_o = \\sqrt{\\frac{GM}{r}} = \\frac{v_e}{\\sqrt{2}}",
    description: "Total energy of orbiting satellite: $E = -\\frac{GMm}{2r} = -K = \\frac{U}{2}$. Kepler's 3rd law: $T^2 = \\frac{4\\pi^2}{GM} r^3$.",
    common_trap: "Using $g_h = g(1 - 2h/R)$ when $h$ is large ($h \\sim R$). For large heights, use $g_h = \\frac{g}{(1 + h/R)^2}$.",
    no_pen_trick: "Binding energy of satellite is simply $+K = \\frac{GMm}{2r}$. To escape orbit, increase kinetic energy by factor of 2 (speed by $\\sqrt{2}$).",
    key_points: [
      "Depth variation: $g_d = g(1 - d/R)$ is linear everywhere inside a uniform density sphere.",
      "Geostationary satellite period is $24\\text{ hrs}$, height $\\approx 36,000\\text{ km}$ above equator, rotates West to East.",
      "Gravitational potential inside solid sphere at center: $V_{\\text{center}} = -\\frac{3GM}{2R} = 1.5 V_{\\text{surface}}$."
    ]
  },
  {
    id: "phy-11-07",
    subject: "Physics",
    chapter: "Properties of Solids and Liquids",
    class_level: 11,
    high_yield_weightage: "Very High",
    topic: "Elasticity, Viscosity, Surface Tension & Capillarity",
    formula_latex: "v_t = \\frac{2r^2(\\rho - \\sigma)g}{9\\eta}, \\quad \\Delta P = \\frac{2T}{R} \\; (\\text{drop}), \\quad \\Delta P = \\frac{4T}{R} \\; (\\text{bubble}), \\quad h = \\frac{2T\\cos\\theta}{r\\rho g}",
    description: "Young's modulus $Y = \\frac{F/A}{\\Delta L / L}$. Energy density of stretched wire $u = \\frac{1}{2}\\times\\text{stress}\\times\\text{strain} = \\frac{1}{2}Y(\\text{strain})^2$.",
    common_trap: "Forgetting that a soap bubble has TWO free surfaces, giving excess pressure $\\frac{4T}{R}$ instead of $\\frac{2T}{R}$.",
    no_pen_trick: "When $n$ small drops coalesce: volume $R = n^{1/3}r$, terminal velocity $v_t \\propto R^2 \\implies v_{\\text{new}} = n^{2/3}v_0$!",
    key_points: [
      "Bernoulli's Theorem: $P + \\frac{1}{2}\\rho v^2 + \\rho gh = \\text{constant}$ for incompressible non-viscous streamline flow.",
      "Torricelli's speed of efflux: $v = \\sqrt{2gh}$, range $R = 2\\sqrt{h(H - h)}$, maximum range $R_{\\max} = H$ at $h = H/2$.",
      "Poiseuille's formula for volume flow rate: $Q = \\frac{\\pi P r^4}{8\\eta L}$ ($Q \\propto r^4$)."
    ]
  },
  {
    id: "phy-11-08",
    subject: "Physics",
    chapter: "Thermodynamics",
    class_level: 11,
    high_yield_weightage: "Very High",
    topic: "First Law, Carnot Efficiency & Polytropic Work",
    formula_latex: "\\Delta Q = \\Delta U + W, \\quad \\Delta U = n C_v \\Delta T, \\quad W_{\\text{poly}} = \\frac{P_1V_1 - P_2V_2}{n - 1}, \\quad \\eta_{\\text{Carnot}} = 1 - \\frac{T_C}{T_H}",
    description: "For adiabatic process ($PV^\\gamma = \\text{const}$): $W = \\frac{nR(T_1 - T_2)}{\\gamma - 1}$. Heat capacity of polytropic process ($PV^n = \\text{const}$): $C = C_v + \\frac{R}{1 - n}$.",
    common_trap: "Substituting Celsius temperatures into Carnot efficiency equation. $T_H$ and $T_C$ MUST be in Kelvin!",
    no_pen_trick: "For cyclic process on $P-V$ diagram, $\\Delta U = 0$, so net heat absorbed equals area enclosed by the cycle!",
    key_points: [
      "Molar heat capacities: $C_p - C_v = R$ (Mayer's relation), $\\gamma = C_p/C_v = 1 + 2/f$.",
      "Isochoric process ($V = \\text{const}$): $W = 0, \\Delta Q = \\Delta U = n C_v \\Delta T$.",
      "Isothermal process ($T = \\text{const}$): $\\Delta U = 0, W = nRT\\ln(V_2/V_1) = nRT\\ln(P_1/P_2)$."
    ]
  },
  {
    id: "phy-11-09",
    subject: "Physics",
    chapter: "Kinetic Theory of Gases",
    class_level: 11,
    high_yield_weightage: "High",
    topic: "Gas Speeds, Degrees of Freedom & Mean Free Path",
    formula_latex: "v_{\\text{rms}} = \\sqrt{\\frac{3RT}{M}}, \\quad v_{\\text{avg}} = \\sqrt{\\frac{8RT}{\\pi M}}, \\quad v_{\\text{mp}} = \\sqrt{\\frac{2RT}{M}}, \\quad \\lambda = \\frac{1}{\\sqrt{2}\\pi n d^2}",
    description: "Order of molecular speeds: $v_{\\text{rms}} > v_{\\text{avg}} > v_{\\text{mp}}$ (ratio $\\sqrt{3} : \\sqrt{8/\\pi} : \\sqrt{2} \\approx 1.224 : 1.128 : 1$).",
    common_trap: "Using molar mass in grams instead of kg in $v = \\sqrt{3RT/M}$ (e.g. $O_2$ is $32\\times 10^{-3}\\text{ kg/mol}$).",
    no_pen_trick: "Average kinetic energy per molecule is $\\frac{3}{2}k_B T$, depends ONLY on temperature, identical for all gases!",
    key_points: [
      "Degrees of freedom: Monoatomic $f=3$ (He, Ar), Diatomic $f=5$ at room temp ($O_2, N_2$), Triatomic non-linear $f=6$ ($H_2O$).",
      "Law of equipartition of energy: Energy per degree of freedom per molecule $= \\frac{1}{2}k_B T$.",
      "Mean free path $\\lambda \\propto \\frac{T}{P}$ at constant volume."
    ]
  },
  {
    id: "phy-11-10",
    subject: "Physics",
    chapter: "Oscillations and Waves",
    class_level: 11,
    high_yield_weightage: "Very High",
    topic: "SHM Dynamics, Energy, Resonance & Doppler Effect",
    formula_latex: "T = 2\\pi\\sqrt{\\frac{m}{k}}, \\quad T = 2\\pi\\sqrt{\\frac{L}{g_{\\text{eff}}}}, \\quad f' = f\\left(\\frac{v \\pm v_o}{v \\mp v_s}\\right), \\quad v_{\\text{wave}} = \\sqrt{\\frac{T}{\\mu}} = \\sqrt{\\frac{\\gamma P}{\\rho}}",
    description: "Total energy in SHM: $E = \\frac{1}{2}kA^2 = \\frac{1}{2}m\\omega^2 A^2$. Kinetic equals potential energy at displacement $x = \\pm \\frac{A}{\\sqrt{2}}$.",
    common_trap: "Using $g$ instead of $g_{\\text{eff}} = g + a$ in an elevator accelerating upward.",
    no_pen_trick: "In closed organ pipe, only ODD harmonics exist ($f_n = (2n-1)\\frac{v}{4L}$). Open pipe has all harmonics ($f_n = n\\frac{v}{2L}$).",
    key_points: [
      "Spring combinations: Series $\\frac{1}{k_{\\text{eq}}} = \\frac{1}{k_1} + \\frac{1}{k_2}$; Parallel $k_{\\text{eq}} = k_1 + k_2$.",
      "Beats frequency $f_{\\text{beat}} = |f_1 - f_2|$. Waxing a fork decreases frequency; filing increases it.",
      "Stationary wave nodes have zero displacement and maximum pressure variation."
    ]
  },

  // =========================================================================
  // PHYSICS - CLASS 12 (10 CHAPTERS)
  // =========================================================================
  {
    id: "phy-12-01",
    subject: "Physics",
    chapter: "Electrostatics",
    class_level: 12,
    high_yield_weightage: "Very High",
    topic: "Gauss's Law, Dipoles, Potential & Capacitance",
    formula_latex: "\\oint \\vec{E}\\cdot d\\vec{A} = \\frac{q_{\\text{encl}}}{\\varepsilon_0}, \\quad V = \\frac{kp\\cos\\theta}{r^2}, \\quad C = \\frac{\\varepsilon_0 A}{d}, \\quad U = \\frac{1}{2}CV^2",
    description: "Field of dipole: Axial $E_{\\text{axial}} = \\frac{2kp}{r^3}$, Equatorial $E_{\\text{eq}} = \\frac{kp}{r^3}$. Torque on dipole $\\vec{\\tau} = \\vec{p}\\times\\vec{E}$, potential energy $U = -\\vec{p}\\cdot\\vec{E}$.",
    common_trap: "Confusing electric field of dipole ($E \\propto 1/r^3$) with point charge ($E \\propto 1/r^2$).",
    no_pen_trick: "Dielectric slab insertion: With battery CONNECTED, $V$ stays constant ($C \\to KC, Q \\to KQ, U \\to KU$). With battery DISCONNECTED, $Q$ is constant ($C \\to KC, V \\to V/K, U \\to U/K$).",
    key_points: [
      "Field outside conducting sphere $E = \\frac{kQ}{r^2}$; inside conductor $E = 0$ and potential $V = \\frac{kQ}{R}$ (equipotential).",
      "Energy density in electric field: $u_E = \\frac{1}{2}\\varepsilon_0 E^2$.",
      "Common potential on connecting two capacitors: $V_c = \\frac{C_1V_1 + C_2V_2}{C_1 + C_2}$, energy loss $\\Delta U = \\frac{C_1C_2(V_1 - V_2)^2}{2(C_1 + C_2)}$."
    ]
  },
  {
    id: "phy-12-02",
    subject: "Physics",
    chapter: "Current Electricity",
    class_level: 12,
    high_yield_weightage: "Very High",
    topic: "Drift Velocity, Kirchhoff's Laws & Potentiometer",
    formula_latex: "I = n e A v_d, \\quad v_d = \\frac{eE\\tau}{m}, \\quad R = \\rho\\frac{l}{A}, \\quad P = I^2R = \\frac{V^2}{R}, \\quad \\frac{E_1}{E_2} = \\frac{l_1}{l_2}",
    description: "Temperature coefficient: $R_T = R_0(1 + \\alpha\\Delta T)$. Internal resistance by potentiometer: $r = R\\left(\\frac{l_1}{l_2} - 1\\right)$.",
    common_trap: "Forgetting internal resistance in power delivery. Maximum power theorem states $P_{\\max} = \\frac{E^2}{4r}$ when external load $R = r$.",
    no_pen_trick: "Wheatstone Bridge balance condition: $\\frac{R_1}{R_2} = \\frac{R_3}{R_4} \\implies$ central galvanometer carries zero current and can be removed!",
    key_points: [
      "Kirchhoff's Junction Law ($\sum I = 0$) conserves charge; Loop Law ($\sum V = 0$) conserves energy.",
      "Cells in parallel: $E_{\\text{eq}} = \\frac{\\sum E_i/r_i}{\\sum 1/r_i}$, $r_{\\text{eq}} = \\left(\\sum \\frac{1}{r_i}\\right)^{-1}$.",
      "Color code mnemonic: B B ROY of Great Britain had Very Good Wife (0 to 9)."
    ]
  },
  {
    id: "phy-12-03",
    subject: "Physics",
    chapter: "Magnetic Effects of Current and Magnetism",
    class_level: 12,
    high_yield_weightage: "Very High",
    topic: "Biot-Savart Law, Ampere's Law, Solenoid & Torque",
    formula_latex: "d\\vec{B} = \\frac{\\mu_0}{4\\pi}\\frac{I(d\\vec{l}\\times\\hat{r})}{r^2}, \\quad B_{\\text{center}} = \\frac{\\mu_0 N I}{2R}, \\quad B_{\\text{solenoid}} = \\mu_0 n I, \\quad F = q(\\vec{v}\\times\\vec{B})",
    description: "Helical path of charged particle: radius $r = \\frac{mv\\sin\\theta}{qB}$, pitch $p = v\\cos\\theta \\times \\frac{2\\pi m}{qB}$. Cyclotron frequency $f = \\frac{qB}{2\\pi m}$ (independent of speed).",
    common_trap: "Thinking like current-carrying parallel wires repel. Current in SAME direction ATTRACTS ($\frac{F}{L} = \\frac{\\mu_0 I_1 I_2}{2\\pi d}$).",
    no_pen_trick: "Bending a wire of length $L$ into $n$ turns multiplies the magnetic field at the center by $n^2$! ($B_n = n^2 B_1$).",
    key_points: [
      "Magnetic dipole moment of current loop: $\\vec{M} = N I \\vec{A}$, torque $\\vec{\\tau} = \\vec{M}\\times\\vec{B}$.",
      "Moving coil galvanometer sensitivity: Current sensitivity $I_s = \\frac{\\theta}{I} = \\frac{NAB}{C}$.",
      "To convert galvanometer to ammeter: connect low shunt $S = \\frac{I_g R_g}{I - I_g}$ in parallel. For voltmeter: high series $R = \\frac{V}{I_g} - R_g$."
    ]
  },
  {
    id: "phy-12-04",
    subject: "Physics",
    chapter: "Electromagnetic Induction and Alternating Currents",
    class_level: 12,
    high_yield_weightage: "Very High",
    topic: "Faraday's Law, Motional EMF & LCR Series Resonance",
    formula_latex: "\\varepsilon = -\\frac{d\\Phi_B}{dt}, \\quad \\mathcal{E} = Bvl, \\quad \\omega_0 = \\frac{1}{\\sqrt{LC}}, \\quad Z = \\sqrt{R^2 + (X_L - X_C)^2}, \\quad Q = \\frac{\\omega_0 L}{R}",
    description: "Series LCR resonance: $X_L = X_C$, $Z = R$ (minimum), current amplitude $I_0 = V_0/R$ (maximum), power factor $\\cos\\phi = 1$.",
    common_trap: "Calculating average power as $V_{\\text{rms}} I_{\\text{rms}}$ without multiplying by power factor $\\cos\\phi = R/Z$.",
    no_pen_trick: "At resonance, voltage drops across $L$ and $C$ cancel completely ($V_L = V_C, 180^\\circ$ out of phase). The entire source voltage appears across $R$!",
    key_points: [
      "Lenz's Law reflects conservation of energy (induced current opposes the change in flux).",
      "Self-inductance of solenoid $L = \\mu_0 n^2 A l$. Energy stored in magnetic field $U_B = \\frac{1}{2}LI^2$.",
      "Transformer equations: $\\frac{V_s}{V_p} = \\frac{N_s}{N_p} = \\frac{I_p}{I_s}$. In step-up transformer ($N_s > N_p$), voltage rises, current falls."
    ]
  },
  {
    id: "phy-12-05",
    subject: "Physics",
    chapter: "Electromagnetic Waves",
    class_level: 12,
    high_yield_weightage: "High",
    topic: "Displacement Current, Maxwell's Equations & Wave Properties",
    formula_latex: "I_d = \\varepsilon_0 \\frac{d\\Phi_E}{dt}, \\quad c = \\frac{E_0}{B_0} = \\frac{1}{\\sqrt{\\mu_0 \\varepsilon_0}}, \\quad I = \\frac{1}{2}\\varepsilon_0 c E_0^2 = \\frac{B_0^2 c}{2\\mu_0}",
    description: "EM waves are transverse. Direction of propagation is along $\\vec{E}\\times\\vec{B}$. Average electric energy density equals average magnetic energy density ($u_E = u_B$).",
    common_trap: "Thinking electric field carries more energy because $E_0 = c B_0$. Energy densities $u_E$ and $u_B$ are EXACTLY EQUAL (1:1 ratio)!",
    no_pen_trick: "Radiation pressure on perfectly reflecting surface is $P_{\\text{rad}} = \\frac{2I}{c}$; on perfectly absorbing surface $P_{\\text{rad}} = \\frac{I}{c}$.",
    key_points: [
      "Electromagnetic spectrum order (increasing frequency): Radio < Micro < Infrared < Visible < UV < X-rays < Gamma.",
      "Greenhouse effect is caused by trapped Infrared radiation.",
      "Ozone layer in stratosphere absorbs harmful ultraviolet (UV) radiation."
    ]
  },
  {
    id: "phy-12-06",
    subject: "Physics",
    chapter: "Optics",
    class_level: 12,
    high_yield_weightage: "Very High",
    topic: "Lens Maker Formula, Prism & Wave Interference (YDSE)",
    formula_latex: "\\frac{1}{f} = (\\mu - 1)\\left(\\frac{1}{R_1} - \\frac{1}{R_2}\\right), \\quad \\mu = \\frac{\\sin\\left(\\frac{A + \\delta_m}{2}\\right)}{\\sin(A/2)}, \\quad \\beta = \\frac{\\lambda D}{d}",
    description: "YDSE intensity: $I = I_1 + I_2 + 2\\sqrt{I_1 I_2}\\cos\\phi = 4I_0\\cos^2(\\phi/2)$ for identical slits. Resolving power of telescope $\\text{RP} = \\frac{a}{1.22\\lambda}$.",
    common_trap: "Immersion in liquid: when lens of index $\\mu_g$ is put in liquid $\\mu_l$, focal length changes to $f_l = f_a \\frac{\\mu_g - 1}{\\mu_g/\\mu_l - 1}$. If $\\mu_l = 1.33$ and $\\mu_g = 1.5$, $f$ quadruples ($4f$)!",
    no_pen_trick: "In YDSE, shifting the central fringe by introducing a mica sheet of thickness $t$: path difference is $(\\mu - 1)t$, fringe shift $\\Delta y = \\frac{(\\mu - 1)t D}{d}$!",
    key_points: [
      "Total internal reflection requires light to travel from denser to rarer medium with incident angle $\\theta > \\theta_c = \\sin^{-1}(1/\\mu)$.",
      "Power of combination of two thin lenses in contact: $P = P_1 + P_2 \\implies \\frac{1}{F} = \\frac{1}{f_1} + \\frac{1}{f_2}$.",
      "Diffraction central maximum width is $2\\lambda D / a$ (double the width of secondary maxima)."
    ]
  },
  {
    id: "phy-12-07",
    subject: "Physics",
    chapter: "Dual Nature of Matter and Radiation",
    class_level: 12,
    high_yield_weightage: "Very High",
    topic: "Photoelectric Effect & de Broglie Wavelength",
    formula_latex: "K_{\\max} = h\\nu - \\phi_0 = e V_0, \\quad \\lambda = \\frac{h}{p} = \\frac{h}{\\sqrt{2m e V}} = \\frac{12.27}{\\sqrt{V}}\\text{ \\AA} \\; (\\text{electron})",
    description: "Stopping potential depends linearly on incident frequency ($e V_0 = h\\nu - \\phi_0$) and is strictly independent of light intensity.",
    common_trap: "Thinking photocurrent increases with light frequency. Photocurrent is proportional to INTENSITY (number of photons), NOT frequency!",
    no_pen_trick: "de Broglie shortcut for electron: $\\lambda = \\frac{12.27}{\\sqrt{V}}\\text{ \\AA}$. For proton: $\\lambda = \\frac{0.286}{\\sqrt{V}}\\text{ \\AA}$. For alpha particle: $\\lambda = \\frac{0.101}{\\sqrt{V}}\\text{ \\AA}$.",
    key_points: [
      "Threshold frequency $\\nu_0 = \\phi_0 / h$. No emission occurs if $\\nu < \\nu_0$, regardless of intensity.",
      "de Broglie wavelength of thermal neutron: $\\lambda = \\frac{h}{\\sqrt{3m k_B T}}$.",
      "Davisson-Germer experiment proved the wave nature of electrons through nickel crystal diffraction."
    ]
  },
  {
    id: "phy-12-08",
    subject: "Physics",
    chapter: "Atoms and Nuclei",
    class_level: 12,
    high_yield_weightage: "Very High",
    topic: "Bohr Model, Rydberg Formula & Radioactive Decay",
    formula_latex: "r_n = 0.529\\frac{n^2}{Z}\\text{ \\AA}, \\quad E_n = -13.6\\frac{Z^2}{n^2}\\text{ eV}, \\quad \\frac{1}{\\lambda} = R Z^2\\left(\\frac{1}{n_1^2} - \\frac{1}{n_2^2}\\right), \\quad N(t) = N_0 e^{-\\lambda t}",
    description: "Half-life $T_{1/2} = \\frac{\\ln 2}{\\lambda} = \\frac{0.693}{\\lambda}$. Mean life $\\tau = \\frac{1}{\\lambda} = 1.44 T_{1/2}$. Nuclear radius $R = R_0 A^{1/3}$ ($R_0 \\approx 1.2\\text{ fm}$).",
    common_trap: "Using $E_n = -13.6 n^2$ instead of dividing by $n^2$. Radius grows as $n^2$, binding energy diminishes as $1/n^2$!",
    no_pen_trick: "Hydrogen spectral lines: Lyman ($n_1=1$, UV), Balmer ($n_1=2$, Visible), Paschen ($n_1=3$, Infrared), Brackett ($n_1=4$, IR), Pfund ($n_1=5$, IR).",
    key_points: [
      "Nuclear density is CONSTANT for all nuclei ($\\approx 2.3\\times 10^{17}\\text{ kg/m}^3$), independent of mass number $A$.",
      "Mass defect $\\Delta m = [Z m_p + (A - Z) m_n] - M_{\\text{nucleus}}$, Binding energy $BE = \\Delta m c^2 = \\Delta m \\times 931.5\\text{ MeV}$.",
      "After $n$ half-lives, fraction remaining is $(1/2)^n$. Fraction decayed is $1 - (1/2)^n$."
    ]
  },
  {
    id: "phy-12-09",
    subject: "Physics",
    chapter: "Electronic Devices",
    class_level: 12,
    high_yield_weightage: "Very High",
    topic: "Semiconductors, p-n Junction, Zener & Logic Gates",
    formula_latex: "n_i^2 = n_e n_h, \\quad \\sigma = e(n_e \\mu_e + n_h \\mu_h), \\quad f_{\\text{ripple}} = 2f \\; (\\text{full-wave})",
    description: "Zener diode acts as a voltage regulator in REVERSE breakdown. Forward bias narrows depletion layer; reverse bias widens it.",
    common_trap: "Confusing ripple frequency: half-wave rectifier ripple frequency is $f$, full-wave rectifier ripple frequency is $2f$!",
    no_pen_trick: "Universal NAND gate: $(\\overline{A\\cdot B})$. Shorting inputs gives NOT. NAND followed by NAND gives AND. Inverted inputs give OR!",
    key_points: [
      "p-type: doped with trivalent impurities (B, Al, In); majority carriers are holes ($n_h \\gg n_e$).",
      "n-type: doped with pentavalent impurities (P, As, Sb); majority carriers are electrons ($n_e \\gg n_h$).",
      "LED is forward biased; Photodiode and Solar Cell are operated under reverse bias."
    ]
  },
  {
    id: "phy-12-10",
    subject: "Physics",
    chapter: "Experimental Skills",
    class_level: 12,
    high_yield_weightage: "High",
    topic: "Screw Gauge, Sonometer, Meter Bridge & Resonance Column",
    formula_latex: "\\text{LC} = \\frac{\\text{Pitch}}{\\text{Total circular divisions}}, \\quad \\frac{R}{S} = \\frac{l}{100 - l}, \\quad v = 2f(l_2 - l_1)",
    description: "End correction in resonance tube: $e = 0.6 r = \\frac{l_2 - 3l_1}{2}$. Speed of sound in air $v = 2f(l_2 - l_1)$ cancels end correction completely.",
    common_trap: "Zero error subtraction: Measured value = Reading - (Zero Error). A positive zero error is SUBTRACTED; negative zero error is ADDED!",
    no_pen_trick: "In resonance tube, $l_2 - l_1 = \\lambda/2$. The distance between consecutive resonance points is always half a wavelength, completely immune to end effects!",
    key_points: [
      "Meter bridge end resistance errors are minimized by adjusting balancing point near the center ($50\\text{ cm}$).",
      "Galvanometer figure of merit $k = \\frac{I}{\\theta}$ has units of $\\text{A/div}$.",
      "Sonometer fundamental frequency $f = \\frac{1}{2L}\\sqrt{\\frac{T}{\\mu}}$."
    ]
  },

  // =========================================================================
  // CHEMISTRY - CLASS 11 (9 CHAPTERS) + PRACTICAL
  // =========================================================================
  {
    id: "chm-11-01",
    subject: "Chemistry",
    chapter: "Some Basic Concepts in Chemistry",
    class_level: 11,
    high_yield_weightage: "Very High",
    topic: "Mole Concept, Stoichiometry & Concentration Terms",
    formula_latex: "n = \\frac{w}{M} = \\frac{N}{N_A} = \\frac{V_{\\text{STP}}}{22.7\\text{ L}}, \\quad M = \\frac{n_{\\text{solute}}}{V_{\\text{soln}}(\\text{L})}, \\quad m = \\frac{n_{\\text{solute}}}{w_{\\text{solvent}}(\\text{kg})}",
    description: "Dilution formula: $M_1 V_1 = M_2 V_2$. Molality $m$ and mole fraction $X$ are temperature-independent because they depend only on mass.",
    common_trap: "Using molarity for temperature-independent calculations. Molarity changes with temperature because volume expands!",
    no_pen_trick: "Relation between Molarity and Molality: $m = \\frac{1000 M}{1000 d - M M_{\\text{solute}}}$ where $d$ is solution density in g/mL.",
    key_points: [
      "Limiting reagent is the reactant that gives the smallest value of $\\frac{\\text{moles}}{\\text{stoichiometric coefficient}}$.",
      "Empirical formula gives simplest integer ratio; Molecular formula = $\\text{Empirical formula} \\times n$, where $n = \\frac{\\text{Molar mass}}{\\text{Empirical mass}}$.",
      "Law of chemical equivalence: Equivalents of all reactants and products in a balanced reaction are identical."
    ]
  },
  {
    id: "chm-11-02",
    subject: "Chemistry",
    chapter: "Structure of Atom",
    class_level: 11,
    high_yield_weightage: "Very High",
    topic: "Bohr Model, Quantum Numbers & Electronic Configuration",
    formula_latex: "\\lambda = \\frac{h}{p} = \\frac{h}{mv}, \\quad \\Delta x \\cdot \\Delta p \\ge \\frac{h}{4\\pi}, \\quad E = -\\frac{2.18\\times 10^{-18} Z^2}{n^2}\\text{ J}",
    description: "Quantum numbers: $n$ (shell), $l$ (subshell, $0$ to $n-1$), $m_l$ (orbital, $-l$ to $+l$), $m_s$ (spin, $\\pm 1/2$). Maximum electrons in shell $= 2n^2$.",
    common_trap: "Applying Aufbau rule to exceptions: Chromium ($Cr$: $[Ar] 3d^5 4s^1$) and Copper ($Cu$: $[Ar] 3d^{10} 4s^1$) have extra stability due to half-filled and fully-filled d-subshells.",
    no_pen_trick: "Total number of nodes $= n - 1$. Radial nodes $= n - l - 1$. Angular nodes $= l$. Sum of radial + angular is always $n - 1$!",
    key_points: [
      "Photoelectric effect: $h\\nu = h\\nu_0 + \\frac{1}{2}m v^2$.",
      "Hund's rule of maximum multiplicity: pairing does not occur until each degenerate orbital has one electron.",
      "Pauli exclusion principle: no two electrons in an atom can have all four quantum numbers identical."
    ]
  },
  {
    id: "chm-11-03",
    subject: "Chemistry",
    chapter: "Classification of Elements and Periodicity",
    class_level: 11,
    high_yield_weightage: "High",
    topic: "Ionization Enthalpy, Electron Gain & Electronegativity Trends",
    formula_latex: "\\text{IE}_1(\\text{Be}) > \\text{IE}_1(\\text{B}), \\quad \\text{IE}_1(\\text{N}) > \\text{IE}_1(\\text{O}), \\quad \\Delta_{\\text{eg}}H(\\text{Cl}) > \\Delta_{\\text{eg}}H(\\text{F})",
    description: "Be ($2s^2$) has higher ionization energy than B ($2s^2 2p^1$) due to stable fully filled s-subshell. N ($2p^3$) is higher than O ($2p^4$) due to half-filled p-subshell.",
    common_trap: "Assuming Fluorine has the highest negative electron gain enthalpy. Chlorine ($\text{Cl}$) has the highest negative $\\Delta_{\\text{eg}}H$ due to low interelectronic repulsion in larger $3p$ orbital!",
    no_pen_trick: "Isoelectronic ions ($O^{2-}, F^-, Na^+, Mg^{2+}, Al^{3+}$): Ionic radius decreases continuously with increasing atomic number $Z$! (Radius $\\propto 1/Z$).",
    key_points: [
      "Electronegativity order (Pauling scale): $F (4.0) > O (3.5) > N (3.0) \\approx Cl (3.0) > Br (2.8) > I (2.5) \\approx C (2.5) > H (2.1)$.",
      "Second electron gain enthalpy is ALWAYS positive (endothermic) for all elements due to strong electrostatic repulsion by the negative anion (e.g. $O^- + e^- \\to O^{2-}$).",
      "Diagonal relationships: $Li-Mg, Be-Al, B-Si$ share similar charge-to-radius ratios."
    ]
  },
  {
    id: "chm-11-04",
    subject: "Chemistry",
    chapter: "Chemical Bonding and Molecular Structure",
    class_level: 11,
    high_yield_weightage: "Very High",
    topic: "VSEPR Theory, Hybridization & Molecular Orbital Theory (MOT)",
    formula_latex: "\\text{Bond Order} = \\frac{N_b - N_a}{2}, \\quad \\mu = q\\times d, \\quad \\text{Steric No.} = \\frac{V + M - C + A}{2}",
    description: "MOT for $B_2, C_2, N_2$ ($\le 14 e^-$): $\\pi_{2p_x} = \\pi_{2p_y} < \\sigma_{2p_z}$. For $O_2, F_2$ ($> 14 e^-$): $\\sigma_{2p_z} < \\pi_{2p_x} = \\pi_{2p_y}$.",
    common_trap: "Thinking $O_2$ is diamagnetic from Lewis structure. By MOT, $O_2$ has 2 unpaired electrons in $\\pi^*_{2p}$ antibonding orbitals and is PARAMAGNETIC!",
    no_pen_trick: "Bond order shortcut for 14 to 20 electrons: $14 e^- \\to 3.0$. For every electron added or removed, bond order decreases by $0.5$! ($15 e^- \\to 2.5, 16 e^- \\to 2.0, 17 e^- \\to 1.5, 18 e^- \\to 1.0$).",
    key_points: [
      "Bent's rule: more electronegative substituents prefer orbitals with less s-character (axial in $sp^3d$). Lone pairs occupy equatorial positions in $sp^3d$ ($PCl_5$, $SF_4$, $ClF_3$).",
      "Dipole moment of $NH_3 > NF_3$ because lone pair and bond pair dipole moments reinforce in $NH_3$ but oppose in $NF_3$.",
      "Formal charge $= V - L - \\frac{1}{2}S$."
    ]
  },
  {
    id: "chm-11-05",
    subject: "Chemistry",
    chapter: "Chemical Thermodynamics",
    class_level: 11,
    high_yield_weightage: "Very High",
    topic: "Hess's Law, Enthalpies, Entropy & Gibbs Free Energy",
    formula_latex: "\\Delta H = \\Delta U + \\Delta n_g RT, \\quad \\Delta G^\\circ = \\Delta H^\\circ - T\\Delta S^\\circ = -RT\\ln K_{eq} = -nFE^\\circ",
    description: "For spontaneous process at constant $T, P$: $\\Delta G < 0$. If $\\Delta H < 0$ and $\\Delta S > 0$, reaction is spontaneous at all temperatures.",
    common_trap: "Using $\\Delta H = \\Delta U$ without checking $\\Delta n_g$. Only when $\\Delta n_g = 0$ is $\\Delta H = \\Delta U$.",
    no_pen_trick: "Spontaneity sign grid: $\\Delta H (-) / \\Delta S (+) \\implies$ always spontaneous. $\\Delta H (+) / \\Delta S (-) \\implies$ never spontaneous. $\\Delta H (-) / \\Delta S (-) \\implies$ low $T$. $\\Delta H (+) / \\Delta S (+) \\implies$ high $T$!",
    key_points: [
      "Standard enthalpy of formation of elements in standard reference state is zero ($O_2(g), C(\\text{graphite}), Br_2(l), I_2(s)$).",
      "Third Law of Thermodynamics: Entropy of a perfectly crystalline substance is zero at absolute zero ($0\\text{ K}$).",
      "Resonance energy = Observed heat of combustion - Calculated heat of combustion."
    ]
  },
  {
    id: "chm-11-06",
    subject: "Chemistry",
    chapter: "Equilibrium",
    class_level: 11,
    high_yield_weightage: "Very High",
    topic: "Le Chatelier's Principle, pH & Buffer Solutions",
    formula_latex: "K_p = K_c(RT)^{\\Delta n_g}, \\quad \\text{pH} = \\text{p}K_a + \\log\\frac{[\\text{Conjugate Base}]}{[\\text{Acid}]}, \\quad K_{sp} = x^x y^y S^{x+y}",
    description: "Acidic buffer: weak acid + conjugate salt ($CH_3COOH + CH_3COONa$). Basic buffer: weak base + salt ($NH_4OH + NH_4Cl$).",
    common_trap: "Assuming catalyst shifts equilibrium position. A catalyst speeds up forward and backward reactions equally without changing $K$ or equilibrium concentrations!",
    no_pen_trick: "Solubility product shortcut: $AB \\to S^2$; $AB_2 \\to 4S^3$; $AB_3 \\to 27S^4$; $A_2B_3 \\to 108S^5$. Directly calculate $S$ without writing full equilibrium!",
    key_points: [
      "Le Chatelier's principle: increasing pressure shifts equilibrium towards the side with fewer moles of gas.",
      "Hydrolysis of salts: Salt of WA + SB has $\\text{pH} = 7 + \\frac{1}{2}\\text{p}K_a + \\frac{1}{2}\\log C > 7$ (basic).",
      "Common ion effect suppresses the ionization of weak electrolytes."
    ]
  },
  {
    id: "chm-11-07",
    subject: "Chemistry",
    chapter: "Redox Reactions",
    class_level: 11,
    high_yield_weightage: "High",
    topic: "Oxidation Numbers, Balancing & Disproportionation",
    formula_latex: "\\text{Equivalent Weight} = \\frac{\\text{Molar Mass}}{n\\text{-factor}}, \\quad \\Delta\\text{ON} = n\\text{-factor}",
    description: "In acidic medium, $KMnO_4 \\to Mn^{2+}$ ($n = 5$). In neutral/faintly alkaline, $KMnO_4 \\to MnO_2$ ($n = 3$). In strongly alkaline, $KMnO_4 \\to MnO_4^{2-}$ ($n = 1$).",
    common_trap: "Calculating oxidation state of Cr in $CrO_5$ as $+10$. It has butterfly structure with two peroxo linkages ($-1$ each), so oxidation state is $+6$!",
    no_pen_trick: "$K_2Cr_2O_7$ in acidic medium ALWAYS changes $Cr_2O_7^{2-} \\to 2Cr^{3+}$, gaining 6 electrons ($n\\text{-factor} = 6$). Equivalent weight is $M/6$!",
    key_points: [
      "Disproportionation reaction: the same element is simultaneously oxidized and reduced (e.g. $Cl_2 + 2OH^- \\to Cl^- + ClO^- + H_2O$).",
      "Oxidation state of iron in brown ring complex $[Fe(H_2O)_5(NO)]SO_4$ is $+1$ ($NO$ is $NO^+$ with iron in $3d^7$).",
      "Oxidation state of sulfur in Caro's acid ($H_2SO_5$) and Marshall's acid ($H_2S_2O_8$) is $+6$ due to peroxo bonds."
    ]
  },
  {
    id: "chm-11-08",
    subject: "Chemistry",
    chapter: "Hydrocarbons",
    class_level: 11,
    high_yield_weightage: "Very High",
    topic: "Alkanes, Alkenes, Alkynes & Aromatic Electrophilic Substitution",
    formula_latex: "R-CH=CH_2 + \\text{HBr} \\xrightarrow{\\text{Peroxide}} R-CH_2-CH_2Br \\quad (\\text{Anti-Markovnikov})",
    description: "Ozonolysis ($O_3 / Zn-H_2O$) cleaves $C=C$ to carbonyls. Wurtz reaction: $2RX + 2Na \\xrightarrow{\\text{dry ether}} R-R + 2NaX$.",
    common_trap: "Applying peroxide effect to $HCl$ or $HI$. The Kharasch peroxide effect works ONLY for $HBr$ because both propagation steps are exothermic!",
    no_pen_trick: "Ozonolysis reverse shortcut: erase oxygen atoms from the two carbonyl products and fuse the two carbonyl carbons with a double bond! Instant structure!",
    key_points: [
      "Friedel-Crafts alkylation involves carbocation rearrangement; acylation ($RCOCl / AlCl_3$) does not rearrange.",
      "Acidity of alkynes: $HC\\equiv CH > CH_2=CH_2 > CH_3-CH_3$ due to high s-character (50%) in sp hybrid carbon.",
      "Lindlar's catalyst ($Pd/CaCO_3$ poisoned with quinoline) reduces alkynes to cis-alkenes; Birch reduction ($Na/\\text{liq. } NH_3$) gives trans-alkenes."
    ]
  },
  {
    id: "chm-11-09",
    subject: "Chemistry",
    chapter: "Organic Chemistry - Basic Principles and Techniques",
    class_level: 11,
    high_yield_weightage: "Very High",
    topic: "Electronic Effects (I, M, H), Hyperconjugation & Isomerism",
    formula_latex: "\\text{Carbocation stability: } 3^\\circ > 2^\\circ > 1^\\circ > \\text{methyl}, \\quad \\text{Carbanion: } \\text{methyl} > 1^\\circ > 2^\\circ > 3^\\circ",
    description: "Hyperconjugation ($\sigma-p$ conjugation): stability increases with number of $\\alpha$-hydrogens ($3\\alpha-H$ per methyl group). Resonance stabilization requires conjugated $\\pi$ systems.",
    common_trap: "Confusing inductive effect with resonance. Mesomeric/resonance effect (+M / -M) strongly dominates over inductive effect (+I / -I), EXCEPT for halogens where -I dominates!",
    no_pen_trick: "Acidic strength of carboxylic acids: $-M > -I > \\text{neutral} > +I > +M$. Electron withdrawing groups dramatically increase acidity!",
    key_points: [
      "Aromaticity (Hückel's Rule): Cyclic, planar, completely conjugated with $(4n + 2)\\pi$ electrons.",
      "Kjeldahl's method for nitrogen determination: %N = $\\frac{1.4\\times M\\times 2(V_1 - V_2/2)}{w}$. Does not work for nitro, azo, or ring nitrogen (pyridine).",
      "Lassaigne's test: Sodium fusion extract yields $NaCN$ for N, $Na_2S$ for S, $NaX$ for halogens."
    ]
  },

  // =========================================================================
  // CHEMISTRY - CLASS 12 (10 CHAPTERS)
  // =========================================================================
  {
    id: "chm-12-01",
    subject: "Chemistry",
    chapter: "Solutions",
    class_level: 12,
    high_yield_weightage: "Very High",
    topic: "Raoult's Law, Colligative Properties & Van 't Hoff Factor",
    formula_latex: "\\frac{P^\\circ - P_s}{P^\\circ} = i X_B, \\quad \\Delta T_b = i K_b m, \\quad \\Delta T_f = i K_f m, \\quad \\pi = iCRT",
    description: "Van 't Hoff factor $i = 1 + (n - 1)\\alpha$ for degree of dissociation $\\alpha$. For association ($n A \\rightleftharpoons A_n$): $i = 1 + \\left(\\frac{1}{n} - 1\\right)\\beta$.",
    common_trap: "Neglecting $i$ for ionic salts (e.g. $NaCl \\to i=2, CaCl_2 \\to i=3, Al_2(SO_4)_3 \\to i=5$). Colligative effects are scaled by $i$!",
    no_pen_trick: "Comparing depression in freezing point: Highest $\\Delta T_f$ means LOWEST freezing point. Compare the product $i\\times m$ directly!",
    key_points: [
      "Azeotropes: Minimum boiling azeotrope shows large positive deviation from Raoult's law (e.g. ethanol-water); Maximum boiling shows negative deviation ($HNO_3$-water).",
      "Henry's law: $p = K_H x$. Higher $K_H$ at a given pressure means lower solubility of gas in liquid.",
      "Osmotic pressure $\\pi = iCRT$ is the most reliable colligative method for measuring molecular weights of polymers and biomolecules."
    ]
  },
  {
    id: "chm-12-02",
    subject: "Chemistry",
    chapter: "Electrochemistry",
    class_level: 12,
    high_yield_weightage: "Very High",
    topic: "Nernst Equation, Kohlrausch's Law & Conductance",
    formula_latex: "E_{\\text{cell}} = E^\\circ_{\\text{cell}} - \\frac{0.0591}{n}\\log_{10} Q, \\quad \\Delta G^\\circ = -nFE^\\circ, \\quad \\Lambda_m = \\frac{\\kappa\\times 1000}{M}",
    description: "Kohlrausch's law: $\\Lambda_m^\\circ = \\nu_+ \\lambda_+^\\circ + \\nu_- \\lambda_-^\\circ$. Degree of dissociation $\\alpha = \\frac{\\Lambda_m}{\\Lambda_m^\\circ}$. Dissociation constant $K_a = \\frac{C\\alpha^2}{1 - \\alpha}$.",
    common_trap: "Multiplying $E^\\circ$ values when multiplying stoichiometric coefficients. Standard reduction potential $E^\\circ$ is an INTENSIVE property and NEVER changes when equation is multiplied!",
    no_pen_trick: "At equilibrium, cell potential $E_{\\text{cell}} = 0$, so $E^\\circ_{\\text{cell}} = \\frac{0.0591}{n}\\log_{10} K_{eq}$. Calculate equilibrium constant directly!",
    key_points: [
      "Faraday's First Law: $w = Z I t = \\frac{E I t}{96500}$, where $E = \\frac{\\text{Molar mass}}{\\text{valence factor}}$.",
      "Debye-Hückel-Onsager equation for strong electrolytes: $\\Lambda_m = \\Lambda_m^\\circ - A\\sqrt{C}$.",
      "Molar conductivity $\\Lambda_m$ increases with dilution for both strong and weak electrolytes, while specific conductance $\\kappa$ decreases."
    ]
  },
  {
    id: "chm-12-03",
    subject: "Chemistry",
    chapter: "Chemical Kinetics",
    class_level: 12,
    high_yield_weightage: "Very High",
    topic: "Order of Reaction, Integrated Rate Laws & Arrhenius Equation",
    formula_latex: "k = \\frac{2.303}{t}\\log\\left(\\frac{[A]_0}{[A]_t}\\right), \\quad t_{1/2} = \\frac{0.693}{k}, \\quad \\log\\left(\\frac{k_2}{k_1}\\right) = \\frac{E_a}{2.303R}\\left(\\frac{1}{T_1} - \\frac{1}{T_2}\\right)",
    description: "Zero order: $[A]_t = [A]_0 - kt, t_{1/2} = \\frac{[A]_0}{2k}$. Second order: $\\frac{1}{[A]_t} - \\frac{1}{[A]_0} = kt$. Half-life dependence: $t_{1/2} \\propto [A]_0^{1 - n}$.",
    common_trap: "Confusing molecularity with order. Molecularity is theoretical integer for elementary step ($1, 2, 3$); order is experimentally determined and can be fractional or zero.",
    no_pen_trick: "For first order reaction, time required for 99.9% completion is 10 half-lives ($t_{99.9} = 10 t_{1/2}$)! For 99%, $t_{99} = 2 t_{90}$.",
    key_points: [
      "Units of rate constant $k$: $(\\text{mol L}^{-1})^{1 - n}\\text{ s}^{-1}$ where $n$ is overall order of reaction.",
      "Activation energy $E_a$ is determined from the slope of $\\ln k$ vs $1/T$ plot: $\\text{slope} = -\\frac{E_a}{R}$.",
      "Radioactive decay strictly follows first order kinetics."
    ]
  },
  {
    id: "chm-12-04",
    subject: "Chemistry",
    chapter: "The d- and f-Block Elements",
    class_level: 12,
    high_yield_weightage: "High",
    topic: "Lanthanoid Contraction, Oxidation States & Transition Metal Properties",
    formula_latex: "\\mu = \\sqrt{n(n + 2)}\\text{ BM}, \\quad \\text{Lanthanoid contraction: } r(Zr) \\approx r(Hf), \\quad r(Nb) \\approx r(Ta)",
    description: "Imperfect shielding of $4f$ electrons causes steady decrease in atomic/ionic radii across lanthanoids, making 2nd and 3rd transition series identical in size.",
    common_trap: "Assuming $+8$ oxidation state does not exist in d-block. Ruthenium ($Ru$) and Osmium ($Os$) exhibit $+8$ oxidation state in $RuO_4$ and $OsO_4$!",
    no_pen_trick: "$Mn^{2+}$ has $3d^5$ configuration with 5 unpaired electrons, giving maximum spin-only magnetic moment $\\mu = \\sqrt{5(7)} = \\sqrt{35} \\approx 5.92\\text{ BM}$!",
    key_points: [
      "Potassium dichromate: $\\text{Cr}_2\\text{O}_7^{2-} + 2\\text{OH}^- \\rightleftharpoons 2\\text{CrO}_4^{2-} + \\text{H}_2\\text{O}$. Orange dichromate turns yellow chromate in alkali.",
      "Interstitial compounds are formed when small atoms ($H, C, N$) occupy crystal lattices; they have high melting points and retain metallic conductivity.",
      "Actinoid contraction is greater from element to element than lanthanoid contraction due to poorer shielding by $5f$ electrons."
    ]
  },
  {
    id: "chm-12-05",
    subject: "Chemistry",
    chapter: "Coordination Compounds",
    class_level: 12,
    high_yield_weightage: "Very High",
    topic: "CFT, Crystal Field Splitting, Isomerism & Werner's Theory",
    formula_latex: "\\text{CFSE}_{oct} = (-0.4 n_{t_{2g}} + 0.6 n_{e_g})\\Delta_o + m P, \\quad \\Delta_t = \\frac{4}{9}\\Delta_o",
    description: "Spectrochemical series: $I^- < Br^- < Cl^- < F^- < OH^- < H_2O < NH_3 < en < CN^- < CO$. Strong field ligands cause pairing when $\\Delta_o > P$.",
    common_trap: "Confusing linkage isomerism with coordination isomerism. Linkage isomerism occurs with ambidentate ligands like $NO_2^- / ONO^-$ and $SCN^- / NCS^-$.",
    no_pen_trick: "Tetrahedral complexes are ALWAYS high-spin because crystal field splitting is weak ($\Delta_t = \\frac{4}{9}\\Delta_o < P$); pairing never occurs first!",
    key_points: [
      "Primary valency is ionizable (equals oxidation state); secondary valency is non-ionizable (equals coordination number).",
      "Chelate effect: polydentate ligands (like EDTA, en) form stable ring structures with high formation constants due to positive entropy change.",
      "Synergic bonding in metal carbonyls involves $\sigma$-donation from $CO$ to metal and back $\pi$-bonding from metal d-orbitals to $\pi^*$ antibonding orbitals of $CO$."
    ]
  },
  {
    id: "chm-12-06",
    subject: "Chemistry",
    chapter: "Haloalkanes and Haloarenes",
    class_level: 12,
    high_yield_weightage: "Very High",
    topic: "SN1 vs SN2 Mechanisms, Elimination & Stereochemistry",
    formula_latex: "S_N1: 3^\\circ > 2^\\circ > 1^\\circ \\; (\\text{Racemization}), \\quad S_N2: 1^\\circ > 2^\\circ > 3^\\circ \\; (\\text{Walden Inversion})",
    description: "$S_N1$ involves carbocation intermediate with polar protic solvents. $S_N2$ is concerted single-step with polar aprotic solvents (DMF, DMSO, acetone).",
    common_trap: "Nucleophilic aromatic substitution: aryl halides are inert towards nucleophilic attack due to partial double bond character of $C-X$ bond unless strong $-NO_2$ groups are ortho/para!",
    no_pen_trick: "Finkelstein reaction: $R-Cl + NaI \\xrightarrow{\\text{acetone}} R-I + NaCl\\downarrow$. Driven forward by precipitation of $NaCl$ in dry acetone!",
    key_points: [
      "Saytzeff's rule: elimination of $\\beta-H$ yields the most substituted, most stable alkene as the major product.",
      "Grignard reagent ($RMgX$) behaves as strong carbanion nucleophile and strong base; reacts instantly with active hydrogen compounds ($H_2O, ROH$).",
      "Swarts reaction produces alkyl fluorides: $R-Br + AgF \\to R-F + AgBr\\downarrow$."
    ]
  },
  {
    id: "chm-12-07",
    subject: "Chemistry",
    chapter: "Alcohols, Phenols and Ethers",
    class_level: 12,
    high_yield_weightage: "Very High",
    topic: "Reimer-Tiemann, Kolbe Reaction & Williamson Synthesis",
    formula_latex: "\\text{Phenol} + \\text{CHCl}_3 + \\text{NaOH} \\to \\text{Salicylaldehyde} \\quad (:\\text{CCl}_2 \\text{ electrophile})",
    description: "Kolbe's reaction: Phenol $+ CO_2 + NaOH \\xrightarrow{\\Delta, P}$ Salicylic acid. Lucas test: $3^\\circ$ alcohol gives turbidity immediately, $2^\\circ$ in 5 minutes, $1^\\circ$ only on heating.",
    common_trap: "Williamson ether synthesis with $3^\\circ$ alkyl halide: gives 100% ALKENE via E2 elimination! To make tert-butyl ether, use $3^\\circ$ alkoxide with $1^\\circ$ alkyl halide.",
    no_pen_trick: "Acidic strength of substituted phenols: Picric acid ($2,4,6\\text{-trinitrophenol}$) has three strong $-M$ nitro groups and is more acidic than carboxylic acids ($pK_a \\approx 0.38$)!",
    key_points: [
      "Hydroboration-oxidation of alkenes ($B_2H_6 / H_2O_2, OH^-$) yields anti-Markovnikov alcohol without carbocation rearrangement.",
      "Cleavage of ethers with excess $HI$: alkyl group attached to oxygen forms alkyl iodide via $S_N2$ (or $S_N1$ if $3^\\circ$ carbocation can form).",
      "Aspirin synthesis: Salicylic acid $+ (CH_3CO)_2O \\xrightarrow{H^+}$ Acetylsalicylic acid (Aspirin)."
    ]
  },
  {
    id: "chm-12-08",
    subject: "Chemistry",
    chapter: "Aldehydes, Ketones and Carboxylic Acids",
    class_level: 12,
    high_yield_weightage: "Very High",
    topic: "Aldol Condensation, Cannizzaro & Carbonyl Tests",
    formula_latex: "2 CH_3CHO \\xrightarrow{\\text{dil. NaOH}} CH_3-CH(OH)-CH_2-CHO \\xrightarrow{\\Delta} CH_3-CH=CH-CHO + H_2O",
    description: "Cannizzaro reaction: Aldehydes without $\\alpha-H$ ($HCHO, C_6H_5CHO$) disproportionate with 50% KOH to alcohol and carboxylic acid salt.",
    common_trap: "Iodoform test requirement: requires a methyl carbonyl group ($CH_3-C=O$) or a secondary alcohol with $CH_3-CH(OH)-$ unit. Benzaldehyde DOES NOT give iodoform test!",
    no_pen_trick: "Crossed Aldol shortcut: if one aldehyde has NO $\\alpha-H$ (e.g. Benzaldehyde) and the other has $\\alpha-H$ (Acetophenone), only ONE major crossed condensation product forms!",
    key_points: [
      "Tollens' reagent ($[Ag(NH_3)_2]^+$) and Fehling's solution oxidize aliphatic aldehydes to give silver mirror and red $Cu_2O$ precipitate.",
      "Hell-Volhard-Zelinsky (HVZ) reaction: Carboxylic acids with $\\alpha-H$ react with $Br_2 / \\text{red } P$ to give $\\alpha\\text{-bromo}$ carboxylic acid.",
      "Wolff-Kishner reduction ($NH_2NH_2 / KOH, \\text{glycol}$) and Clemmensen reduction ($Zn-Hg / \\text{conc. } HCl$) reduce carbonyls to alkanes."
    ]
  },
  {
    id: "chm-12-09",
    subject: "Chemistry",
    chapter: "Amines",
    class_level: 12,
    high_yield_weightage: "Very High",
    topic: "Basicity of Amines, Hoffmann Bromamide & Diazonium Salts",
    formula_latex: "R-CONH_2 + Br_2 + 4NaOH \\to R-NH_2 + Na_2CO_3 + 2NaBr + 2H_2O",
    description: "Hoffmann bromamide degradation produces a primary amine with ONE LESS carbon atom than the starting amide. Carbylamine test: $R-NH_2 + CHCl_3 + 3KOH \\to R-NC + 3KCl + 3H_2O$ (foul smell).",
    common_trap: "Basicity order of aliphatic amines in aqueous medium: Methyl group order is $2^\\circ > 1^\\circ > 3^\\circ > NH_3$ ($213$), Ethyl group order is $2^\\circ > 3^\\circ > 1^\\circ > NH_3$ ($231$) due to solvation effect!",
    no_pen_trick: "Hinsberg reagent ($C_6H_5SO_2Cl$): $1^\\circ$ amine forms soluble sulfonamide in $KOH$; $2^\\circ$ amine forms insoluble precipitate; $3^\\circ$ amine does NOT react at all!",
    key_points: [
      "Gabriel phthalimide synthesis is exclusively used for preparing pure $1^\\circ$ aliphatic amines; aryl amines cannot be prepared because aryl halides do not undergo $S_N2$.",
      "Benzene diazonium chloride ($C_6H_5N_2^+ Cl^-$) synthesized by diazotization of aniline at $0-5^\\circ\\text{C}$ with $NaNO_2 + HCl$.",
      "Sandmeyer reaction replaces diazonium group with $Cl, Br, CN$ using $Cu_2Cl_2, Cu_2Br_2, CuCN$."
    ]
  },
  {
    id: "chm-12-10",
    subject: "Chemistry",
    chapter: "Biomolecules",
    class_level: 12,
    high_yield_weightage: "High",
    topic: "Carbohydrates, Amino Acids, Peptide Bonds & Nucleic Acids",
    formula_latex: "\\text{Glucose (open chain)} \\xrightarrow{\\text{HI, }\\Delta} n\\text{-hexane}, \\quad \\text{Peptide linkage: } -C(=O)-NH-",
    description: "Proteins are polymers of $\\alpha$-L-amino acids. Essential amino acids cannot be synthesized in human body (Val, Leu, Ile, Lys, Met, Phe, Trp, Thr).",
    common_trap: "Assuming sucrose is a reducing sugar. Sucrose is a NON-REDUCING sugar because both anomeric carbons of glucose and fructose are linked together in glycosidic bond!",
    no_pen_trick: "DNA bases: Adenine (A), Thymine (T), Guanine (G), Cytosine (C). $A=T$ (2 H-bonds) and $G\\equiv C$ (3 H-bonds). In RNA, Uracil (U) replaces Thymine (T)!",
    key_points: [
      "Zwitterion form of amino acids has net zero charge at the isoelectric point ($pI$).",
      "Denaturation destroys $2^\\circ, 3^\\circ, 4^\\circ$ structures of proteins but leaves the $1^\\circ$ primary peptide chain intact.",
      "Vitamins: Water-soluble are B and C; Fat-soluble are A, D, E, K."
    ]
  },
  {
    id: "chm-12-11",
    subject: "Chemistry",
    chapter: "Principles Related to Practical Chemistry",
    class_level: 12,
    high_yield_weightage: "High",
    topic: "Qualitative Cation & Anion Analysis, Flame & Group Reagents",
    formula_latex: "4\\text{Cl}^- + \\text{Cr}_2\\text{O}_7^{2-} + 6\\text{H}^+ \\to 2\\text{CrO}_2\\text{Cl}_2\\uparrow \\text{ (red-brown fumes)} + 3\\text{H}_2\\text{O}",
    description: "Group I cations ($Pb^{2+}, Ag^+, Hg_2^{2+}$) precipitate with dil. $HCl$. Group II ($Cu^{2+}, Pb^{2+}, Bi^{3+}, As^{3+}$) precipitate with $H_2S$ in acidic medium ($dil. HCl$).",
    common_trap: "Brown ring test for nitrate ($NO_3^-$): brown ring formula is $[Fe(H_2O)_5(NO)]SO_4$ where iron has oxidation state $+1$, NOT $+2$!",
    no_pen_trick: "Flame test colors: Sodium (Golden Yellow), Potassium (Lilac / Violet), Calcium (Brick Red), Strontium (Crimson), Barium (Apple Green), Copper (Green-Blue)!",
    key_points: [
      "Group III cations ($Fe^{3+}, Al^{3+}, Cr^{3+}$) precipitate as hydroxides using $NH_4OH$ in presence of $NH_4Cl$.",
      "Group IV ($Co^{2+}, Ni^{2+}, Mn^{2+}, Zn^{2+}$) precipitate with $H_2S$ in alkaline medium ($NH_4OH$).",
      "Borax bead test: Metaborates formed impart characteristic colors in oxidizing and reducing flame (e.g. Cobalt gives deep blue bead)."
    ]
  },

  // =========================================================================
  // MATHEMATICS - CLASS 11 (10 CHAPTERS)
  // =========================================================================
  {
    id: "mat-11-01",
    subject: "Mathematics",
    chapter: "Sets, Relations and Functions",
    class_level: 11,
    high_yield_weightage: "High",
    topic: "Venn Diagrams, Set Cardinality & Domain-Range",
    formula_latex: "n(A\\cup B\\cup C) = \\sum n(A) - \\sum n(A\\cap B) + n(A\\cap B\\cap C), \\quad N_{\\text{reflexive}} = 2^{n(n-1)}",
    description: "Number of relations from set $A$ ($n$ elements) to set $B$ ($m$ elements) is $2^{nm}$. Symmetric relations $= 2^{n(n+1)/2}$.",
    common_trap: "Confusing reflexive relations ($2^{n(n-1)}$) with total relations ($2^{n^2}$). Diagonal pairs $(a, a)$ are mandatory in reflexive relations!",
    no_pen_trick: "Domain of real function $\\sqrt{a - x} + \\frac{1}{\\sqrt{x - b}}$: numerator allows zero ($x \\le a$, closed bracket); denominator forbids zero ($x > b$, open parenthesis). Domain is strictly $(b, a]$!",
    key_points: [
      "De Morgan's Laws: $(A\\cup B)' = A'\\cap B'$ and $(A\\cap B)' = A'\\cup B'$.",
      "Power set of set with $n$ elements contains $2^n$ subsets.",
      "Greatest integer function properties: $[x + k] = [x] + k$ for integer $k$; $[x] + [-x] = 0$ if $x\\in\\mathbb{Z}$ and $-1$ if $x\\notin\\mathbb{Z}$."
    ]
  },
  {
    id: "mat-11-02",
    subject: "Mathematics",
    chapter: "Complex Numbers and Quadratic Equations",
    class_level: 11,
    high_yield_weightage: "Very High",
    topic: "Euler Form, Cube Roots of Unity & Quadratic Roots",
    formula_latex: "z = r e^{i\\theta}, \\quad 1 + \\omega + \\omega^2 = 0, \\quad \\omega^3 = 1, \\quad |z_1 + z_2|^2 + |z_1 - z_2|^2 = 2(|z_1|^2 + |z_2|^2)",
    description: "Roots of $ax^2 + bx + c = 0$: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$. Sum $\\alpha+\\beta = -b/a$, product $\\alpha\\beta = c/a$.",
    common_trap: "Assuming $\\sqrt{a}\\sqrt{b} = \\sqrt{ab}$ holds for negative reals. $\\sqrt{-a}\\sqrt{-b} = -\\sqrt{ab}$!",
    no_pen_trick: "Condition for quadratic equations $a_1 x^2 + b_1 x + c_1 = 0$ and $a_2 x^2 + b_2 x + c_2 = 0$ to have BOTH roots common is proportionality: $\\frac{a_1}{a_2} = \\frac{b_1}{b_2} = \\frac{c_1}{c_2}$!",
    key_points: [
      "Triangle inequality: ||z_1| - |z_2|| \\le |z_1 \\pm z_2| \\le |z_1| + |z_2|.",
      "Geometric loci: $|z - z_1| = |z - z_2|$ represents the perpendicular bisector of segment joining $z_1$ and $z_2$.",
      "Cube roots of unity form an equilateral triangle inscribed in unit circle centered at origin."
    ]
  },
  {
    id: "mat-11-03",
    subject: "Mathematics",
    chapter: "Permutations and Combinations",
    class_level: 11,
    high_yield_weightage: "Very High",
    topic: "Arrangements, Selection & Stars and Bars",
    formula_latex: "^n P_r = \\frac{n!}{(n-r)!}, \\quad ^n C_r = \\frac{n!}{r!(n-r)!}, \\quad ^n C_r + ^n C_{r-1} = ^{n+1} C_r, \\quad N_{\\text{non-negative}} = ^{n+r-1} C_{r-1}",
    description: "Circular permutations of $n$ distinct objects: $(n - 1)!$. If clockwise and anticlockwise are indistinguishable (necklaces, garlands): $\\frac{(n-1)!}{2}$.",
    common_trap: "Using $^{n-1}C_{r-1}$ for non-negative solutions. $^{n-1}C_{r-1}$ gives POSITIVE integer solutions; non-negative uses $^{n+r-1}C_{r-1}$!",
    no_pen_trick: "Derangement theorem: Number of ways to place $n$ letters into $n$ wrong envelopes is $D_n = n!\\left(1 - \\frac{1}{1!} + \\frac{1}{2!} - \\frac{1}{3!} + \\dots + \\frac{(-1)^n}{n!}\\right)$. $D_1=0, D_2=1, D_3=2, D_4=9, D_5=44$!",
    key_points: [
      "Tie-together method: To keep two items together, treat them as 1 block, then multiply by internal permutations $2!$.",
      "Gap method: To ensure no two items are together, arrange others first and place constrained items in available gaps.",
      "Number of divisors of $N = p_1^{a_1} p_2^{a_2} \\dots$ is $(a_1 + 1)(a_2 + 1)\\dots$."
    ]
  },
  {
    id: "mat-11-04",
    subject: "Mathematics",
    chapter: "Binomial Theorem",
    class_level: 11,
    high_yield_weightage: "Very High",
    topic: "General Term, Middle Term & Coefficient Sums",
    formula_latex: "T_{r+1} = ^n C_r a^{n-r} b^r, \\quad \\sum_{r=0}^n ^n C_r = 2^n, \\quad \\sum_{r=0}^n (-1)^r ^n C_r = 0, \\quad ^n C_0 + ^n C_2 + ^n C_4 + \\dots = 2^{n-1}",
    description: "Term independent of $x$ in $\\left(a x^p + \\frac{b}{x^q}\\right)^n$ has $r = \\frac{n p}{p + q}$. Number of terms in $(x + y)^n$ is $n + 1$.",
    common_trap: "Finding middle term: when $n$ is even, there is ONE middle term $T_{n/2 + 1}$. When $n$ is odd, there are TWO middle terms: $T_{(n+1)/2}$ and $T_{(n+3)/2}$!",
    no_pen_trick: "Sum of all coefficients in any polynomial expansion $(a x + b y)^n$ is obtained simply by setting $x = 1, y = 1 \\implies (a + b)^n$ in 1 second!",
    key_points: [
      "Ratio of consecutive terms: $\\frac{T_{r+1}}{T_r} = \\frac{n - r + 1}{r} \\frac{b}{a}$.",
      "Multinomial theorem: Number of terms in $(x_1 + x_2 + \\dots + x_k)^n$ is $^{n+k-1} C_{k-1}$.",
      "Binomial theorem for any index: $(1 + x)^n = 1 + n x + \\frac{n(n-1)}{2!} x^2 + \\dots$ is valid for $|x| < 1$."
    ]
  },
  {
    id: "mat-11-05",
    subject: "Mathematics",
    chapter: "Sequences and Series",
    class_level: 11,
    high_yield_weightage: "Very High",
    topic: "AP, GP, AGP & Special Summation Series",
    formula_latex: "S_n(\\text{AP}) = \\frac{n}{2}[2a + (n-1)d], \\quad S_\\infty(\\text{GP}) = \\frac{a}{1 - r} \\; [|r| < 1], \\quad \\sum_{n=1}^N n = \\frac{N(N+1)}{2}, \\quad \\sum n^2 = \\frac{N(N+1)(2N+1)}{6}",
    description: "Arithmetic Mean $\\ge$ Geometric Mean $\\ge$ Harmonic Mean ($AM \\ge GM \\ge HM$) for positive real numbers. Equality holds when all numbers are equal.",
    common_trap: "Applying $S_\\infty = \\frac{a}{1 - r}$ without checking $|r| < 1$. If $|r| \\ge 1$, the infinite series diverges!",
    no_pen_trick: "Standard AGP sum $1 + 2r + 3r^2 + 4r^3 + \\dots = \\frac{1}{(1 - r)^2}$ for $|r| < 1$. If $r = 1/2$, sum is $\\frac{1}{(1/2)^2} = 4$ in 2 seconds!",
    key_points: [
      "Sum of cubes: $\\sum n^3 = \\left[\\frac{N(N+1)}{2}\\right]^2 = (\\sum n)^2$.",
      "If $a, b, c$ are in AP, $2b = a + c$. If in GP, $b^2 = ac$. If in HP, $b = \\frac{2ac}{a + c}$.",
      "$AM\\times HM = GM^2$ for any two positive real numbers."
    ]
  },
  {
    id: "mat-11-06",
    subject: "Mathematics",
    chapter: "Straight Lines",
    class_level: 11,
    high_yield_weightage: "Very High",
    topic: "Distance, Reflection, Angle Bisectors & Pair of Lines",
    formula_latex: "d = \\frac{|Ax_1 + By_1 + C|}{\\sqrt{A^2 + B^2}}, \\quad d_{\\text{parallel}} = \\frac{|C_1 - C_2|}{\\sqrt{A^2 + B^2}}, \\quad \\frac{x - x_1}{a} = \\frac{y - y_1}{b} = -2\\frac{ax_1 + by_1 + c}{a^2 + b^2}",
    description: "Image formula gives reflection of point $(x_1, y_1)$ across line $ax + by + c = 0$. For foot of perpendicular, replace $-2$ by $-1$.",
    common_trap: "Using $d = \\frac{|C_1 - C_2|}{\\sqrt{A^2 + B^2}}$ when coefficients of $x$ and $y$ are not matched between the two equations. Always normalize them first!",
    no_pen_trick: "Reflection of point $(x_0, y_0)$ across the line $y = x$ simply swaps the coordinates: $(x_0, y_0) \\to (y_0, x_0)$ instantly!",
    key_points: [
      "Angle between two lines: $\\tan\\theta = \\left|\\frac{m_1 - m_2}{1 + m_1 m_2}\\right|$. Perpendicular when $m_1 m_2 = -1$; parallel when $m_1 = m_2$.",
      "Equation of pair of lines through origin: $a x^2 + 2h xy + b y^2 = 0$. Perpendicular when $a + b = 0$; coincident when $h^2 = ab$.",
      "Centroid of triangle divides median in $2 : 1$ ratio; incenter coordinates: $\\left(\\frac{ax_1+bx_2+cx_3}{a+b+c}, \\frac{ay_1+by_2+cy_3}{a+b+c}\\right)$."
    ]
  },
  {
    id: "mat-11-07",
    subject: "Mathematics",
    chapter: "Conic Sections",
    class_level: 11,
    high_yield_weightage: "Very High",
    topic: "Parabola, Ellipse, Hyperbola & Standard Tangents",
    formula_latex: "y^2 = 4ax \\implies e=1, \\quad \\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1 \\implies e = \\sqrt{1 - \\frac{b^2}{a^2}}, \\quad \\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1 \\implies e = \\sqrt{1 + \\frac{b^2}{a^2}}",
    description: "Condition of tangency: Parabola ($c = a/m$), Ellipse ($c^2 = a^2 m^2 + b^2$), Hyperbola ($c^2 = a^2 m^2 - b^2$). Latus rectum of ellipse/hyperbola $= \\frac{2b^2}{a}$.",
    common_trap: "Confusing conjugate hyperbola eccentricity relation: If $e_1, e_2$ are eccentricities of hyperbola and its conjugate, $\\frac{1}{e_1^2} + \\frac{1}{e_2^2} = 1$ ALWAYS!",
    no_pen_trick: "Director circle (locus of perpendicular tangents): Parabola directrix ($x = -a$); Ellipse ($x^2 + y^2 = a^2 + b^2$); Hyperbola ($x^2 + y^2 = a^2 - b^2$).",
    key_points: [
      "Rectangular hyperbola ($xy = c^2$ or $x^2 - y^2 = a^2$) has eccentricity $e = \\sqrt{2}$, asymptotes are perpendicular.",
      "Focal distance property: For ellipse, $SP + S'P = 2a$ (constant). For hyperbola, $|SP - S'P| = 2a$.",
      "Point of intersection of tangents at $t_1, t_2$ on parabola $y^2 = 4ax$ is $(a t_1 t_2, a(t_1 + t_2))$."
    ]
  },
  {
    id: "mat-11-08",
    subject: "Mathematics",
    chapter: "Introduction to Three-Dimensional Geometry",
    class_level: 11,
    high_yield_weightage: "Medium",
    topic: "Distance, Section Formula & Projections in 3D",
    formula_latex: "d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2 + (z_2 - z_1)^2}, \\quad P = \\left(\\frac{mx_2 + nx_1}{m+n}, \\frac{my_2 + ny_1}{m+n}, \\frac{mz_2 + nz_1}{m+n}\\right)",
    description: "Distance of point $P(x, y, z)$ from coordinate axes: from x-axis $\\sqrt{y^2 + z^2}$, from y-axis $\\sqrt{x^2 + z^2}$, from z-axis $\\sqrt{x^2 + y^2}$.",
    common_trap: "Including all three coordinates when finding distance from coordinate axes. Distance from z-axis drops $z$ coordinate completely!",
    no_pen_trick: "Centroid of a tetrahedron with vertices $(x_i, y_i, z_i)$ for $i=1..4$ is simply the arithmetic average $\\left(\\frac{\\sum x_i}{4}, \\frac{\\sum y_i}{4}, \\frac{\\sum z_i}{4}\\right)$!",
    key_points: [
      "Coordinate planes: $xy$-plane ($z=0$), $yz$-plane ($x=0$), $zx$-plane ($y=0$).",
      "Foot of perpendicular from $(x, y, z)$ on $xy$-plane is $(x, y, 0)$.",
      "Midpoint formula in 3D: $\\left(\\frac{x_1 + x_2}{2}, \\frac{y_1 + y_2}{2}, \\frac{z_1 + z_2}{2}\\right)$."
    ]
  },
  {
    id: "mat-11-09",
    subject: "Mathematics",
    chapter: "Limits and Derivatives",
    class_level: 11,
    high_yield_weightage: "Very High",
    topic: "Standard Limits, L'Hôpital's Rule & First Principle",
    formula_latex: "\\lim_{x\\to 0}\\frac{\\sin x}{x} = 1, \\quad \\lim_{x\\to 0}\\frac{e^x - 1}{x} = 1, \\quad \\lim_{x\\to 0}\\frac{\\ln(1 + x)}{x} = 1, \\quad \\lim_{x\\to a}\\frac{x^n - a^n}{x - a} = n a^{n-1}",
    description: "Exponential indeterminate form $1^\\infty$: $\\lim_{x\\to a} [f(x)]^{g(x)} = e^{\\lim_{x\\to a} g(x)[f(x) - 1]}$ when $f(x) \\to 1$ and $g(x) \\to \\infty$.",
    common_trap: "Applying L'Hôpital's Rule when form is NOT $\\frac{0}{0}$ or $\\frac{\\infty}{\\infty}$. Check indeterminate status first!",
    no_pen_trick: "$\\lim_{x\\to 0} \\frac{1 - \\cos(ax)}{x^2} = \\frac{a^2}{2}$. Square coefficient of $x$ and divide by 2! Instant 2-second answer!",
    key_points: [
      "Expansion of $\\sin x = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - \\dots$, $\\cos x = 1 - \\frac{x^2}{2!} + \\frac{x^4}{4!} - \\dots$.",
      "Expansion of $e^x = 1 + x + \\frac{x^2}{2!} + \\dots$, $\\ln(1 + x) = x - \\frac{x^2}{2} + \\frac{x^3}{3} - \\dots$.",
      "Derivative by first principle: $f'(x) = \\lim_{h\\to 0} \\frac{f(x + h) - f(x)}{h}$."
    ]
  },
  {
    id: "mat-11-10",
    subject: "Mathematics",
    chapter: "Statistics and Probability",
    class_level: 11,
    high_yield_weightage: "High",
    topic: "Variance, Standard Deviation & Linear Transformation",
    formula_latex: "\\sigma^2 = \\frac{\\sum x_i^2}{n} - (\\bar{x})^2, \\quad \\text{Var}(a X + b) = a^2 \\text{Var}(X), \\quad \\sigma_{\\text{first } n} = \\sqrt{\\frac{n^2 - 1}{12}}",
    description: "Variance is independent of change of origin ($+b$) but quadratic in change of scale ($a^2$). Mean deviation is minimum about the MEDIAN.",
    common_trap: "Adding $b$ to the variance when data is transformed to $a x_i + b$. Origin shift $b$ has ZERO effect on variance!",
    no_pen_trick: "Variance of first $n$ natural numbers is $\\sigma^2 = \\frac{n^2 - 1}{12}$. Direct memory formula asked repeatedly in JEE!",
    key_points: [
      "Coefficient of variation $\\text{CV} = \\frac{\\sigma}{\\bar{x}}\\times 100$ percent. Higher CV indicates greater variability / lower consistency.",
      "Mean deviation about mean: $MD(\\bar{x}) = \\frac{\\sum |x_i - \\bar{x}|}{n}$.",
      "Addition theorem of probability: $P(A\\cup B) = P(A) + P(B) - P(A\\cap B)$."
    ]
  },

  // =========================================================================
  // MATHEMATICS - CLASS 12 (10 CHAPTERS)
  // =========================================================================
  {
    id: "mat-12-01",
    subject: "Mathematics",
    chapter: "Relations and Functions",
    class_level: 12,
    high_yield_weightage: "High",
    topic: "Equivalence Relations, Bijective Functions & Inverses",
    formula_latex: "f(g(x)) = (f\\circ g)(x), \\quad f(x) = f(y) \\implies x = y \\; (\\text{One-One}), \\quad \\text{Range}(f) = \\text{Codomain} \\; (\\text{Onto})",
    description: "A relation is an Equivalence Relation if it is Reflexive, Symmetric, and Transitive. Inverse $f^{-1}$ exists if and only if $f$ is bijective.",
    common_trap: "Testing one-one by horizontal line test without restricting domain. $f(x) = x^2$ is not one-one on $\\mathbb{R}$, but IS one-one on $[0, \\infty)$!",
    no_pen_trick: "If $f: A\\to B$ where $|A| = |B| = n$, the number of bijective (one-one onto) functions is simply $n!$!",
    key_points: [
      "Strictly monotonic functions (strictly increasing or decreasing throughout domain) are always one-one.",
      "Odd-degree polynomial functions with domain $\\mathbb{R}$ have range $\\mathbb{R}$, hence are always onto.",
      "Equivalence classes partition the underlying set into mutually disjoint subsets."
    ]
  },
  {
    id: "mat-12-02",
    subject: "Mathematics",
    chapter: "Continuity and Differentiability",
    class_level: 12,
    high_yield_weightage: "Very High",
    topic: "Continuity Conditions, Sharp Corners & Mean Value Theorems",
    formula_latex: "\\lim_{x\\to c^-} f(x) = \\lim_{x\\to c^+} f(x) = f(c), \\quad f'(c) = \\frac{f(b) - f(a)}{b - a} \\quad (\\text{LMVT})",
    description: "Differentiability implies continuity, but continuity does NOT imply differentiability (e.g. $f(x) = |x|$ is continuous at $x=0$ but not differentiable).",
    common_trap: "Applying LMVT or Rolle's theorem to functions with sharp corners (like $|x|$) on $(a, b)$. Function MUST be differentiable on $(a, b)$!",
    no_pen_trick: "For $f(x) = |x - a_1| + |x - a_2| + \\dots + |x - a_n|$, non-differentiable points are EXACTLY the $n$ roots $a_1, a_2, \\dots, a_n$!",
    key_points: [
      "Rolle's theorem: If $f(a) = f(b)$ and conditions hold, there exists at least one $c\\in(a, b)$ where $f'(c) = 0$.",
      "Derivative of $|x|$ is $\\frac{x}{|x|} = \\text{sgn}(x)$ for $x\\ne 0$.",
      "Differentiability of $x^k \\sin(1/x)$ at $x=0$: $k \\ge 1$ for continuity; $k \\ge 2$ for differentiability; $k \\ge 3$ for continuous derivative."
    ]
  },
  {
    id: "mat-12-03",
    subject: "Mathematics",
    chapter: "Applications of Derivatives",
    class_level: 12,
    high_yield_weightage: "Very High",
    topic: "Rate Measure, Tangents, Monotonicity & Maxima-Minima",
    formula_latex: "m = \\left(\\frac{dy}{dx}\\right)_{(x_1, y_1)}, \\quad m_{\\text{normal}} = -\\frac{1}{m}, \\quad f''(c) < 0 \\implies \\text{Local Maxima}, \\quad f''(c) > 0 \\implies \\text{Local Minima}",
    description: "Function is strictly increasing if $f'(x) > 0$. Point of inflection occurs where $f''(x) = 0$ and $f''(x)$ changes sign across the point.",
    common_trap: "Confusing local maxima with absolute maxima. Absolute maxima on $[a, b]$ is $\\max\\{f(a), f(b), f(c_i)\\}$ where $c_i$ are critical points.",
    no_pen_trick: "Normal line to curve $y = x^2$ at $(a, a^2)$: Tangent slope is $2a$, normal slope is $-1/(2a)$ in 1 second!",
    key_points: [
      "Angle of intersection between two curves: $\\tan\\theta = \\left|\\frac{m_1 - m_2}{1 + m_1 m_2}\\right|$. Orthogonal when $m_1 m_2 = -1$.",
      "Subtangent length $= |y/m|$; Subnormal length $= |y\\cdot m|$.",
      "Shortest distance between two curves lies along their common normal."
    ]
  },
  {
    id: "mat-12-04",
    subject: "Mathematics",
    chapter: "Integrals",
    class_level: 12,
    high_yield_weightage: "Very High",
    topic: "Indefinite & Definite Integrals, King's Property & Leibniz Rule",
    formula_latex: "\\int_0^a f(x)dx = \\int_0^a f(a - x)dx, \\quad \\frac{d}{dx}\\int_{u(x)}^{v(x)} f(t)dt = f(v(x))v'(x) - f(u(x))u'(x)",
    description: "King's property simplifies $\\int_0^{\\pi/2} \\frac{\\sin^n x}{\\sin^n x + \\cos^n x} dx = \\frac{\\pi}{4}$. Integration by parts: $\\int u v dx = u\\int v dx - \\int(u'\\int v dx)dx$.",
    common_trap: "Forgetting to differentiate the upper and lower limits when applying Leibniz rule for differentiation under integral sign.",
    no_pen_trick: "$\\int e^x [f(x) + f'(x)] dx = e^x f(x) + C$. Identify $f(x)$ immediately to write down the answer without integrating!",
    key_points: [
      "$\\int_{-a}^a f(x)dx = 2\\int_0^a f(x)dx$ for even functions; $0$ for odd functions.",
      "Periodic function property: $\\int_0^{nT} f(x)dx = n\\int_0^T f(x)dx$ where $T$ is fundamental period.",
      "Wallis formula for $\\int_0^{\\pi/2} \\sin^m x \\cos^n x dx$ provides instantaneous evaluation."
    ]
  },
  {
    id: "mat-12-05",
    subject: "Mathematics",
    chapter: "Applications of Integrals",
    class_level: 12,
    high_yield_weightage: "Very High",
    topic: "Area Bounded by Parabolas, Lines & Standard Curves",
    formula_latex: "\\text{Area}(y^2 = 4Ax \\text{ and } y = mx) = \\frac{8 A^2}{3 m^3}, \\quad \\text{Area}(y^2 = 4ax \\text{ and } x^2 = 4by) = \\frac{16 a b}{3}",
    description: "Archimedes' formula: Area bounded between parabola and chord is $\\frac{2}{3}\\times\\text{base}\\times\\text{height}$.",
    common_trap: "Swapping upper and lower curves resulting in a negative area. Area must always be positive: $\\int [y_{\\text{upper}} - y_{\\text{lower}}] dx$.",
    no_pen_trick: "Area between $y^2 = ax$ and $x^2 = ay$ is simply $\\frac{a^2}{3}$! Square the coefficient and divide by 3. 2 seconds!",
    key_points: [
      "Area of ellipse $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1$ is $\\pi a b$.",
      "Area between $y = \\sin x$ and x-axis over one arch ($0$ to $\\pi$) is exactly $2\\text{ sq units}$.",
      "Symmetry about axes cuts integration range in half: multiply by 2 or 4."
    ]
  },
  {
    id: "mat-12-06",
    subject: "Mathematics",
    chapter: "Differential Equations",
    class_level: 12,
    high_yield_weightage: "Very High",
    topic: "Order, Degree, Linear Differential Equations & Variables Separable",
    formula_latex: "\\frac{dy}{dx} + P(x) y = Q(x) \\implies \\text{I.F.} = e^{\\int P(x) dx}, \\quad y\\cdot(\\text{I.F.}) = \\int Q(x)\\cdot(\\text{I.F.}) dx + C",
    description: "Homogeneous equation $\\frac{dy}{dx} = f(y/x)$ is solved by substituting $y = v x \\implies \\frac{dy}{dx} = v + x\\frac{dv}{dx}$.",
    common_trap: "Determining degree when derivatives are inside transcendent functions ($\\sin(dy/dx), e^{dy/dx}$). In such cases, degree is NOT DEFINED!",
    no_pen_trick: "If equation is $\\frac{dy}{dx} + a y = 0$ where $a$ is constant, solution is simply $y = C e^{-ax}$ immediately!",
    key_points: [
      "Order is the highest derivative present; Degree is the power of the highest derivative after clearing radicals and fractions.",
      "Bernoulli's equation $\\frac{dy}{dx} + P y = Q y^n$ reduces to linear form by substituting $z = y^{1-n}$.",
      "Exact differential: $d(xy) = x dy + y dx$, $d(y/x) = \\frac{x dy - y dx}{x^2}$, $d(\\tan^{-1}(y/x)) = \\frac{x dy - y dx}{x^2 + y^2}$."
    ]
  },
  {
    id: "mat-12-07",
    subject: "Mathematics",
    chapter: "Vector Algebra",
    class_level: 12,
    high_yield_weightage: "Very High",
    topic: "Dot Product, Cross Product, STP & Vector Triple Product",
    formula_latex: "\\vec{a}\\cdot\\vec{b} = |\\vec{a}||\\vec{b}|\\cos\\theta, \\quad \\vec{a}\\times\\vec{b} = |\\vec{a}||\\vec{b}|\\sin\\theta\\hat{n}, \\quad [\\vec{a}\\, \\vec{b}\\, \\vec{c}] = \\vec{a}\\cdot(\\vec{b}\\times\\vec{c})",
    description: "Vector triple product: $\\vec{a}\\times(\\vec{b}\\times\\vec{c}) = (\\vec{a}\\cdot\\vec{c})\\vec{b} - (\\vec{a}\\cdot\\vec{b})\\vec{c}$ (bac - cab rule).",
    common_trap: "Confusing coplanarity with collinearity. Three vectors are coplanar if their scalar triple product $[\\vec{a}\\, \\vec{b}\\, \\vec{c}] = 0$.",
    no_pen_trick: "Volume of parallelopiped formed by coterminous edges $\\vec{a}, \\vec{b}, \\vec{c}$ is the absolute value of determinant: $V = |[\\vec{a}\\, \\vec{b}\\, \\vec{c}]|$!",
    key_points: [
      "Projection of $\\vec{a}$ on $\\vec{b}$ is $\\frac{\\vec{a}\\cdot\\vec{b}}{|\\vec{b}|}$. Vector projection is $\\left(\\frac{\\vec{a}\\cdot\\vec{b}}{|\\vec{b}|^2}\\right)\\vec{b}$.",
      "Area of triangle with adjacent sides $\\vec{a}, \\vec{b}$ is $\\frac{1}{2}|\\vec{a}\\times\\vec{b}|$; parallelogram area is $|\\vec{a}\\times\\vec{b}|$.",
      "Lagrange's identity: $|\\vec{a}\\times\\vec{b}|^2 = |\\vec{a}|^2 |\\vec{b}|^2 - (\\vec{a}\\cdot\\vec{b})^2$."
    ]
  },
  {
    id: "mat-12-08",
    subject: "Mathematics",
    chapter: "Three-Dimensional Geometry",
    class_level: 12,
    high_yield_weightage: "Very High",
    topic: "Direction Cosines, Skew Lines Shortest Distance & Lines in 3D",
    formula_latex: "d = \\frac{|(\\vec{a}_2 - \\vec{a}_1)\\cdot(\\vec{b}_1\\times\\vec{b}_2)|}{|\\vec{b}_1\\times\\vec{b}_2|}, \\quad \\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = 1, \\quad \\sin^2\\alpha + \\sin^2\\beta + \\sin^2\\gamma = 2",
    description: "Equation of line through $\\vec{a}$ along $\\vec{b}$: $\\vec{r} = \\vec{a} + \\lambda\\vec{b}$. Distance between parallel lines: $d = \\frac{|(\\vec{a}_2 - \\vec{a}_1)\\times\\vec{b}|}{|\\vec{b}|}$.",
    common_trap: "Using skew lines formula when lines are parallel (where $\\vec{b}_1\\times\\vec{b}_2 = \\vec{0}$, causing division by zero). Use parallel lines formula!",
    no_pen_trick: "Perpendicularity of lines with direction ratios $(a_1, b_1, c_1)$ and $(a_2, b_2, c_2)$ is simply $a_1 a_2 + b_1 b_2 + c_1 c_2 = 0$!",
    key_points: [
      "Direction cosines $l, m, n$: $l = \\cos\\alpha, m = \\cos\\beta, n = \\cos\\gamma$ satisfying $l^2 + m^2 + n^2 = 1$.",
      "Angle between two lines: $\\cos\\theta = \\frac{a_1 a_2 + b_1 b_2 + c_1 c_2}{\\sqrt{a_1^2+b_1^2+c_1^2}\\sqrt{a_2^2+b_2^2+c_2^2}}$.",
      "Condition for two lines to intersect is shortest distance $d = 0 \\implies [(\\vec{a}_2 - \\vec{a}_1)\\, \\vec{b}_1\\, \\vec{b}_2] = 0$."
    ]
  },
  {
    id: "mat-12-09",
    subject: "Mathematics",
    chapter: "Matrices and Determinants",
    class_level: 12,
    high_yield_weightage: "Very High",
    topic: "Adjoint Properties, Inverses, Cramers Rule & Cayley-Hamilton",
    formula_latex: "A\\cdot\\text{adj}(A) = |A|I_n, \\quad |\\text{adj}(A)| = |A|^{n-1}, \\quad |\\text{adj}(\\text{adj}(A))| = |A|^{(n-1)^2}, \\quad A^{-1} = \\frac{\\text{adj}(A)}{|A|}",
    description: "Cramer's rule for system of linear equations: $x = \\Delta_x / \\Delta, y = \\Delta_y / \\Delta, z = \\Delta_z / \\Delta$. Unique solution when $\\Delta \\ne 0$.",
    common_trap: "Thinking $(AB)^{-1} = A^{-1} B^{-1}$. Inversion reverses order: $(AB)^{-1} = B^{-1} A^{-1}$!",
    no_pen_trick: "Determinant of scalar multiplication: $|k A| = k^n |A|$ where $n$ is order of square matrix! For $3\\times 3$, $|2A| = 2^3 |A| = 8|A|$!",
    key_points: [
      "Orthogonal matrix property: $A A^T = I \\implies |A| = \\pm 1$ and $A^{-1} = A^T$.",
      "Symmetric matrix ($A^T = A$) and Skew-symmetric ($A^T = -A$). Determinant of odd-order skew-symmetric matrix is ALWAYS zero.",
      "Cayley-Hamilton theorem: Every square matrix satisfies its own characteristic equation $|A - \\lambda I| = 0$."
    ]
  },
  {
    id: "mat-12-10",
    subject: "Mathematics",
    chapter: "Probability",
    class_level: 12,
    high_yield_weightage: "Very High",
    topic: "Conditional Probability, Bayes' Theorem & Binomial Distribution",
    formula_latex: "P(A|B) = \\frac{P(A\\cap B)}{P(B)}, \\quad P(E_i|A) = \\frac{P(E_i)P(A|E_i)}{\\sum P(E_j)P(A|E_j)}, \\quad P(X = r) = ^n C_r p^r q^{n-r}",
    description: "Binomial distribution parameters: Mean $\\mu = n p$, Variance $\\sigma^2 = n p q$ ($q = 1 - p$). Independent events: $P(A\\cap B) = P(A)\\cdot P(B)$.",
    common_trap: "Confusing mutually exclusive events with independent events. If $P(A) > 0, P(B) > 0$, mutually exclusive events ($P(A\\cap B) = 0$) CANNOT be independent!",
    no_pen_trick: "Variance is always less than mean in binomial distribution: $\\sigma^2 = n p q < n p = \\mu$ (since $q < 1$)!",
    key_points: [
      "Total Probability Theorem: $P(A) = \\sum_{i=1}^n P(E_i) P(A|E_i)$ where $E_i$ form a partition.",
      "Odds in favor of event $E$ with probability $p$ is $\\frac{p}{1 - p}$; odds against is $\\frac{1 - p}{p}$.",
      "Geometric distribution: Expected trials until first success is $E[X] = \\frac{1}{p}$."
    ]
  }
];

// Helper to get all formulas
export function getFormulasBySubject(subject?: string) {
  if (!subject || subject === "All") return ALL_REVISION_DATA;
  return ALL_REVISION_DATA.filter((item) => item.subject === subject);
}

// Helper to get distinct chapters list
export function getAllRevisionChapters(): { name: string; subject: string; class_level: number }[] {
  const seen = new Set<string>();
  const list: { name: string; subject: string; class_level: number }[] = [];

  for (const item of ALL_REVISION_DATA) {
    if (!seen.has(item.chapter)) {
      seen.add(item.chapter);
      list.push({
        name: item.chapter,
        subject: item.subject,
        class_level: item.class_level
      });
    }
  }
  return list;
}
