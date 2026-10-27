"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  Copy,
  Check,
  Volume2,
  VolumeX,
  ExternalLink,
  Sparkles,
  Zap,
  Filter,
  ArrowRight,
  Bookmark,
  Share2
} from "lucide-react";
import LatexRenderer from "@/components/LatexRenderer";
import { SpeechSpeaker } from "@/lib/speech";
import { playSound } from "@/lib/audio";
import { ALL_REVISION_DATA } from "@/data/allFormulasRevisionData";

interface FormulaItem {
  id: string;
  subject: "Physics" | "Chemistry" | "Mathematics";
  chapter: string;
  topic: string;
  formula_latex: string;
  description: string;
  tip?: string;
}

const FORMULAS_DATA: FormulaItem[] = [
  // ================= PHYSICS =================
  {
    id: "p1",
    subject: "Physics",
    chapter: "Kinematics",
    topic: "Equations of Uniformly Accelerated Motion",
    formula_latex: "v = u + at, \\quad s = ut + \\frac{1}{2}at^2, \\quad v^2 - u^2 = 2as, \\quad s_n = u + \\frac{a}{2}(2n-1)",
    description: "Valid ONLY for constant acceleration $a$. $s_n$ is the displacement in the $n$-th second.",
    tip: "Always choose a clear coordinate sign convention (e.g. upward = +ve) before substituting values."
  },
  {
    id: "p2",
    subject: "Physics",
    chapter: "Kinematics",
    topic: "Projectile Motion Formulas",
    formula_latex: "T = \\frac{2u\\sin\\theta}{g}, \\quad H_{\\max} = \\frac{u^2\\sin^2\\theta}{2g}, \\quad R = \\frac{u^2\\sin 2\\theta}{g}",
    description: "Trajectory equation: $y = x\\tan\\theta - \\frac{g x^2}{2u^2\\cos^2\\theta} = x\\tan\\theta\\left(1 - \\frac{x}{R}\\right)$.",
    tip: "Complementary angles $\\theta$ and $(90^\\circ - \\theta)$ yield identical horizontal range $R$."
  },
  {
    id: "p3",
    subject: "Physics",
    chapter: "Laws of Motion",
    topic: "Friction & Banking of Roads",
    formula_latex: "f_s \\le \\mu_s N, \\quad f_k = \\mu_k N, \\quad v_{\\max} = \\sqrt{rg\\left(\\frac{\\tan\\theta + \\mu}{1 - \\mu\\tan\\theta}\\right)}",
    description: "For zero friction on a banked curved track: ideal speed is $v_0 = \\sqrt{rg\\tan\\theta}$.",
    tip: "Static friction is a self-adjusting force; its value matches applied shear force until $\\mu_s N$ is exceeded."
  },
  {
    id: "p4",
    subject: "Physics",
    chapter: "Work, Energy and Power",
    topic: "Work-Energy Theorem & Power",
    formula_latex: "W_{\\text{total}} = \\Delta K = K_f - K_i, \\quad P = \\frac{dW}{dt} = \\vec{F} \\cdot \\vec{v}, \\quad W_{\\text{ext}} = \\Delta U + \\Delta K",
    description: "Work done by all forces (conservative, non-conservative, pseudo) equals the change in kinetic energy.",
    tip: "Conservative force relation: $\\vec{F} = -\\vec{\\nabla} U = -\\left(\\frac{\\partial U}{\\partial x}\\hat{i} + \\frac{\\partial U}{\\partial y}\\hat{j} + \\frac{\\partial U}{\\partial z}\\hat{k}\\right)$."
  },
  {
    id: "p5",
    subject: "Physics",
    chapter: "Rotational Motion",
    topic: "Moment of Inertia & Rolling Motion",
    formula_latex: "I = \\sum m_i r_i^2 = \\int r^2 dm, \\quad I = I_{cm} + Md^2, \\quad K_{\\text{rolling}} = \\frac{1}{2}Mv_{cm}^2\\left(1 + \\frac{k^2}{R^2}\\right)",
    description: "Parallel axis theorem applies only when $I_{cm}$ is about the center of mass.",
    tip: "Acceleration down an incline of angle $\\theta$: $a = \\frac{g\\sin\\theta}{1 + k^2/R^2}$."
  },
  {
    id: "p6",
    subject: "Physics",
    chapter: "Gravitation",
    topic: "Gravitational Potential & Escape Velocity",
    formula_latex: "g_h = g\\left(1 - \\frac{2h}{R}\\right) \\; [h \\ll R], \\quad V(r) = -\\frac{GM}{r}, \\quad v_e = \\sqrt{\\frac{2GM}{R}} = \\sqrt{2gR} \\approx 11.2\\text{ km/s}",
    description: "Orbital speed at surface: $v_o = \\sqrt{gR} = \\frac{v_e}{\\sqrt{2}}$. Total energy of satellite is $E = -\\frac{GMm}{2r}$.",
    tip: "Binding energy of a satellite in orbit of radius $r$ is $+ \\frac{GMm}{2r}$."
  },
  {
    id: "p7",
    subject: "Physics",
    chapter: "Thermodynamics",
    topic: "First & Second Law, Heat Engines",
    formula_latex: "\\Delta Q = \\Delta U + \\Delta W, \\quad \\Delta U = n C_v \\Delta T, \\quad \\eta_{\\text{Carnot}} = 1 - \\frac{T_L}{T_H} = \\frac{W}{Q_H}",
    description: "For adiabatic process: $P V^\\gamma = \\text{const}$, work done $W = \\frac{P_1V_1 - P_2V_2}{\\gamma - 1} = \\frac{nR(T_1 - T_2)}{\\gamma - 1}$.",
    tip: "Always convert temperatures to Kelvin ($T = \\text{deg C} + 273.15$) before computing efficiency."
  },
  {
    id: "p8",
    subject: "Physics",
    chapter: "Electrostatics",
    topic: "Coulomb's Law, Field & Capacitance",
    formula_latex: "E = \\frac{kQ}{r^2}, \\quad V = \\frac{kQ}{r}, \\quad C = \\frac{\\varepsilon_0 A}{d}, \\quad U = \\frac{1}{2}CV^2 = \\frac{Q^2}{2C}",
    description: "Electric field of dipole on axial line: $E_{\\text{ax}} = \\frac{2kp}{r^3}$; equatorial line: $E_{\\text{eq}} = \\frac{kp}{r^3}$.",
    tip: "Inserting dielectric with battery connected: $V$ constant, $C \\to K C$, $Q \\to K Q$. With battery disconnected: $Q$ constant, $V \\to V/K$."
  },
  {
    id: "p9",
    subject: "Physics",
    chapter: "Current Electricity",
    topic: "Ohm's Law, Drift Velocity & Kirchhoff's Rules",
    formula_latex: "I = n e A v_d, \\quad v_d = \\frac{eE\\tau}{m}, \\quad R = \\rho\\frac{l}{A}, \\quad P = I^2R = \\frac{V^2}{R}",
    description: "Potentiometer principle: potential gradient $k = \\frac{V}{L}$. EMF comparison: $\\frac{E_1}{E_2} = \\frac{l_1}{l_2}$.",
    tip: "Wheatstone bridge is balanced when $\\frac{R_1}{R_2} = \\frac{R_3}{R_4}$, then current through galvanometer is zero."
  },
  {
    id: "p10",
    subject: "Physics",
    chapter: "Electromagnetic Induction",
    topic: "Faraday's Law, Inductance & AC Resonance",
    formula_latex: "\\varepsilon = -\\frac{d\\Phi_B}{dt} = -L\\frac{dI}{dt}, \\quad \\omega_0 = \\frac{1}{\\sqrt{LC}}, \\quad Z = \\sqrt{R^2 + (X_L - X_C)^2}",
    description: "Resonance in series LCR: $X_L = X_C$, $Z = R$ (minimum), current amplitude is maximum $I_0 = V_0/R$.",
    tip: "Power factor $\\cos\\phi = \\frac{R}{Z}$. At resonance, $\\cos\\phi = 1$ and average power dissipation is maximum."
  },
  {
    id: "p11",
    subject: "Physics",
    chapter: "Ray Optics",
    topic: "Lens Maker Formula & Prism Deviation",
    formula_latex: "\\frac{1}{f} = (\\mu - 1)\\left(\\frac{1}{R_1} - \\frac{1}{R_2}\\right), \\quad \\frac{1}{v} - \\frac{1}{u} = \\frac{1}{f}, \\quad \\mu = \\frac{\\sin\\left(\\frac{A + \\delta_m}{2}\\right)}{\\sin(A/2)}",
    description: "For thin prism: minimum deviation $\\delta = (\\mu - 1)A$. Power of lens: $P = \\frac{1}{f(\\text{m})}$ Dioptres.",
    tip: "When lens is immersed in liquid of index $\\mu_l$: $f_{\\text{liq}} = f_{\\text{air}} \\frac{\\mu_g - 1}{\\frac{\\mu_g}{\\mu_l} - 1}$."
  },
  {
    id: "p12",
    subject: "Physics",
    chapter: "Modern Physics",
    topic: "Photoelectric Effect & Bohr Atom",
    formula_latex: "K_{\\max} = h\\nu - \\phi_0 = e V_0, \\quad r_n = 0.529\\frac{n^2}{Z}\\,\\text{Å}, \\quad E_n = -13.6\\frac{Z^2}{n^2}\\,\\text{eV}",
    description: "de Broglie wavelength: $\\lambda = \\frac{h}{p} = \\frac{h}{\\sqrt{2mK}} = \\frac{12.27}{\\sqrt{V}}\\,\\text{Å}$ (for electron).",
    tip: "Radioactive decay law: $N(t) = N_0 e^{-\\lambda t}$, half-life $T_{1/2} = \\frac{\\ln 2}{\\lambda} \\approx \\frac{0.693}{\\lambda}$."
  },

  // ================= CHEMISTRY =================
  {
    id: "c1",
    subject: "Chemistry",
    chapter: "Thermodynamics",
    topic: "Gibbs Free Energy & Spontaneity",
    formula_latex: "\\Delta G = \\Delta H - T\\Delta S, \\quad \\Delta G^\\circ = -RT\\ln K_{eq} = -2.303 RT\\log_{10} K_{eq}",
    description: "Criterion for spontaneity: $\\Delta G < 0$ (at constant $T$ and $P$). At equilibrium, $\\Delta G = 0$.",
    tip: "If $\\Delta H < 0$ and $\\Delta S > 0$, reaction is spontaneous at ALL temperatures."
  },
  {
    id: "c2",
    subject: "Chemistry",
    chapter: "Chemical Equilibrium",
    topic: "Equilibrium Constants Relation",
    formula_latex: "K_p = K_c (RT)^{\\Delta n_g}, \\quad \\ln\\left(\\frac{K_2}{K_1}\\right) = \\frac{\\Delta H^\\circ}{R}\\left(\\frac{1}{T_1} - \\frac{1}{T_2}\\right)",
    description: "$\\Delta n_g = \\sum n_{\\text{gaseous products}} - \\sum n_{\\text{gaseous reactants}}$. $R = 0.0821\\text{ L atm/mol K}$.",
    tip: "Catalysts accelerate forward and reverse rates equally; they DO NOT alter the numerical value of $K_{eq}$."
  },
  {
    id: "c3",
    subject: "Chemistry",
    chapter: "Ionic Equilibrium",
    topic: "pH Calculation & Henderson Equation",
    formula_latex: "\\text{pH} = -\\log[H^+], \\quad \\text{pH} = \\text{p}K_a + \\log\\frac{[\\text{Salt}]}{[\\text{Acid}]}, \\quad \\text{pOH} = \\text{p}K_b + \\log\\frac{[\\text{Salt}]}{[\\text{Base}]}",
    description: "Buffer capacity is maximum when $[\\text{Salt}] = [\\text{Acid}]$, i.e. when $\\text{pH} = \\text{p}K_a$.",
    tip: "For sparingly soluble salt $A_x B_y$: $K_{sp} = x^x y^y S^{x+y}$ where $S$ is molar solubility in mol/L."
  },
  {
    id: "c4",
    subject: "Chemistry",
    chapter: "Electrochemistry",
    topic: "Nernst Equation & Cell Potential",
    formula_latex: "E_{\\text{cell}} = E^\\circ_{\\text{cell}} - \\frac{0.0591}{n}\\log_{10} Q, \\quad \\Delta G^\\circ = -nFE^\\circ_{\\text{cell}}",
    description: "At $298\\text{ K}$, $E^\\circ_{\\text{cell}} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}}$ (both standard reduction potentials).",
    tip: "Faraday's constant $F \\approx 96500\\text{ C/mol } e^-$. Amount of substance deposited: $w = \\frac{E I t}{96500}$."
  },
  {
    id: "c5",
    subject: "Chemistry",
    chapter: "Chemical Kinetics",
    topic: "First Order Kinetics & Arrhenius Equation",
    formula_latex: "k = \\frac{2.303}{t}\\log\\left(\\frac{[A]_0}{[A]_t}\\right), \\quad t_{1/2} = \\frac{0.693}{k}, \\quad k = A e^{-E_a/RT}",
    description: "For first order reaction, half-life $t_{1/2}$ is independent of initial concentration $[A]_0$.",
    tip: "Arrhenius plot of $\\ln k$ vs $1/T$ gives a straight line with slope $= -\\frac{E_a}{R}$ and intercept $\\ln A$."
  },
  {
    id: "c6",
    subject: "Chemistry",
    chapter: "Solutions",
    topic: "Colligative Properties & Van 't Hoff Factor",
    formula_latex: "\\frac{P^\\circ - P_s}{P^\\circ} = i X_B, \\quad \\Delta T_b = i K_b m, \\quad \\Delta T_f = i K_f m, \\quad \\pi = i C R T",
    description: "Van 't Hoff factor $i = 1 + (n-1)\\alpha$ for dissociation; $i = 1 + \\left(\\frac{1}{n}-1\\right)\\beta$ for association.",
    tip: "Colligative properties depend solely on the NUMBER of solute particles, not their chemical identity."
  },
  {
    id: "c7",
    subject: "Chemistry",
    chapter: "Coordination Compounds",
    topic: "Magnetic Moment & Crystal Field Splitting",
    formula_latex: "\\mu_{\\text{spin}} = \\sqrt{n(n+2)}\\text{ BM}, \\quad \\Delta_t = \\frac{4}{9}\\Delta_o",
    description: "Here $n$ is the number of unpaired d-electrons. Spectrochemical series determines strong field vs weak field.",
    tip: "Strong field ligands (e.g. $\\text{CN}^-$, $\\text{CO}$) cause pairing of electrons if $\\Delta_o > P$ (pairing energy)."
  },
  {
    id: "c8",
    subject: "Chemistry",
    chapter: "Organic Chemistry",
    topic: "Key Named Reactions & Reagents",
    formula_latex: "\\text{Aldol: } 2\\text{RCHO} \\xrightarrow{\\text{dil. NaOH}} \\beta\\text{-hydroxyaldehyde} \\xrightarrow{\\Delta} \\alpha,\\beta\\text{-unsaturated aldehyde}",
    description: "Cannizzaro reaction: Aldehydes without $\\alpha$-H undergo disproportionation with conc. $\\text{KOH}$ to alcohol + acid salt.",
    tip: "Lucas test reagent ($\text{anhydrous } \\text{ZnCl}_2 + \\text{conc. } \\text{HCl}$): $3^\\circ$ alcohol gives instant turbidity, $2^\\circ$ in 5 min, $1^\\circ$ not at room temp."
  },

  // ================= MATHEMATICS =================
  {
    id: "m1",
    subject: "Mathematics",
    chapter: "Calculus",
    topic: "Limits & L'Hôpital's Rule",
    formula_latex: "\\lim_{x\\to 0}\\frac{\\sin x}{x} = 1, \\quad \\lim_{x\\to 0}\\frac{e^x - 1}{x} = 1, \\quad \\lim_{x\\to 0}\\frac{\\ln(1+x)}{x} = 1",
    description: "For indeterminate forms $\\frac{0}{0}$ or $\\frac{\\infty}{\\infty}$: $\\lim_{x\\to a}\\frac{f(x)}{g(x)} = \\lim_{x\\to a}\\frac{f'(x)}{g'(x)}$.",
    tip: "Standard limit form: $\\lim_{x\\to a}[f(x)]^{g(x)} = e^{\\lim_{x\\to a} g(x)[f(x) - 1]}$ when $f(x)\\to 1$ and $g(x)\\to \\infty$."
  },
  {
    id: "m2",
    subject: "Mathematics",
    chapter: "Calculus",
    topic: "Standard Definite Integral Properties",
    formula_latex: "\\int_a^b f(x)dx = \\int_a^b f(a+b-x)dx, \\quad \\int_{-a}^a f(x)dx = \\begin{cases} 2\\int_0^a f(x)dx, & f(-x) = f(x) \\\\ 0, & f(-x) = -f(x) \\end{cases}",
    description: "King's property $\\int_0^a f(x)dx = \\int_0^a f(a-x)dx$ simplifies $80\\%$ of JEE trigonometric integration problems.",
    tip: "Leibniz Rule for differentiation under integral sign: $\\frac{d}{dx}\\int_{u(x)}^{v(x)} f(t)dt = f(v(x))v'(x) - f(u(x))u'(x)$."
  },
  {
    id: "m3",
    subject: "Mathematics",
    chapter: "Calculus",
    topic: "Standard Indefinite Integrals",
    formula_latex: "\\int \\frac{dx}{x^2+a^2} = \\frac{1}{a}\\tan^{-1}\\left(\\frac{x}{a}\\right) + C, \\quad \\int \\frac{dx}{\\sqrt{a^2-x^2}} = \\sin^{-1}\\left(\\frac{x}{a}\\right) + C",
    description: "Integration by parts: $\\int u v dx = u\\int v dx - \\int (u'\\int v dx)dx$. Use ILATE rule for choosing $u$.",
    tip: "Euler exponential form: $\\int e^x [f(x) + f'(x)]dx = e^x f(x) + C$."
  },
  {
    id: "m4",
    subject: "Mathematics",
    chapter: "Coordinate Geometry",
    topic: "Conic Sections: Parabola, Ellipse & Hyperbola",
    formula_latex: "y^2 = 4ax \\implies e=1, \\quad \\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1 \\implies e = \\sqrt{1 - \\frac{b^2}{a^2}}, \\quad \\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1 \\implies e = \\sqrt{1 + \\frac{b^2}{a^2}}",
    description: "Tangent in slope form: Parabola $y = mx + \\frac{a}{m}$; Ellipse $y = mx \\pm \\sqrt{a^2m^2 + b^2}$; Hyperbola $y = mx \\pm \\sqrt{a^2m^2 - b^2}$.",
    tip: "Foci coordinates for standard ellipse/hyperbola are always $(\\pm ae, 0)$."
  },
  {
    id: "m5",
    subject: "Mathematics",
    chapter: "Vectors and 3D Geometry",
    topic: "Dot Product, Cross Product & Distance",
    formula_latex: "\\vec{a}\\cdot\\vec{b} = |\\vec{a}||\\vec{b}|\\cos\\theta, \\quad |\\vec{a}\\times\\vec{b}| = |\\vec{a}||\\vec{b}|\\sin\\theta, \\quad d = \\frac{|(\\vec{a}_2 - \\vec{a}_1)\\cdot(\\vec{b}_1\\times\\vec{b}_2)|}{|\\vec{b}_1\\times\\vec{b}_2|}",
    description: "Shortest distance between skew lines $\\vec{r} = \\vec{a}_1 + \\lambda\\vec{b}_1$ and $\\vec{r} = \\vec{a}_2 + \\mu\\vec{b}_2$. If $d = 0$, the lines intersect.",
    tip: "Coplanarity condition for vectors $\\vec{a}, \\vec{b}, \\vec{c}$ is scalar triple product $[\\vec{a}\\, \\vec{b}\\, \\vec{c}] = 0$."
  },
  {
    id: "m6",
    subject: "Mathematics",
    chapter: "Algebra",
    topic: "Complex Numbers & De Moivre's Theorem",
    formula_latex: "z = r(\\cos\\theta + i\\sin\\theta) = r e^{i\\theta}, \\quad (\\cos\\theta + i\\sin\\theta)^n = \\cos(n\\theta) + i\\sin(n\\theta)",
    description: "Cube roots of unity: $1, \\omega = -\\frac{1}{2}+i\\frac{\\sqrt{3}}{2}, \\omega^2 = -\\frac{1}{2}-i\\frac{\\sqrt{3}}{2}$. Properties: $1+\\omega+\\omega^2 = 0$ and $\\omega^3 = 1$.",
    tip: "$|z_1 + z_2| \\le |z_1| + |z_2|$ (Triangle inequality) and $|z_1 - z_2| \\ge ||z_1| - |z_2||$."
  },
  {
    id: "m7",
    subject: "Mathematics",
    chapter: "Algebra",
    topic: "Matrices & Determinants",
    formula_latex: "|AB| = |A||B|, \\quad A^{-1} = \\frac{\\text{adj}(A)}{|A|}, \\quad |\\text{adj}(A)| = |A|^{n-1}, \\quad A \\cdot \\text{adj}(A) = |A|I_n",
    description: "For system of linear equations $AX = B$: Unique solution if $|A| \\ne 0$; Inconsistent (no solution) if $|A| = 0$ and $(\\text{adj} A)B \\ne 0$.",
    tip: "If $|A| = 0$ and $(\\text{adj} A)B = 0$, system typically has infinitely many solutions (or inconsistent if planes are parallel)."
  },
  {
    id: "m8",
    subject: "Mathematics",
    chapter: "Algebra",
    topic: "Probability & Bayes' Theorem",
    formula_latex: "P(E_i|A) = \\frac{P(E_i)P(A|E_i)}{\\sum_{j=1}^n P(E_j)P(A|E_j)}, \\quad P(A\\cup B) = P(A) + P(B) - P(A\\cap B)",
    description: "Independent events: $P(A\\cap B) = P(A) \\cdot P(B)$ and $P(A|B) = P(A)$.",
    tip: "Binomial distribution: $P(X = r) = {}^n C_r p^r q^{n-r}$ with mean $\\mu = np$ and variance $\\sigma^2 = npq$ ($q = 1-p$)."
  }
];

const COMBINED_FORMULAS: FormulaItem[] = [
  ...FORMULAS_DATA,
  ...ALL_REVISION_DATA.map((item) => ({
    id: `rev-${item.id}`,
    subject: item.subject,
    chapter: item.chapter,
    topic: item.topic,
    formula_latex: item.formula_latex,
    description: item.description,
    tip: `${item.no_pen_trick} | Exam warning: ${item.common_trap}`,
  })),
];

export default function FormulasPage() {
  const [selectedSubject, setSelectedSubject] = useState<"All" | "Physics" | "Chemistry" | "Mathematics">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Filter formulas based on subject and search query
  const filteredFormulas = useMemo(() => {
    return COMBINED_FORMULAS.filter((item) => {
      const matchSubject = selectedSubject === "All" || item.subject === selectedSubject;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.topic.toLowerCase().includes(q) ||
        item.chapter.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.formula_latex.toLowerCase().includes(q);
      return matchSubject && matchSearch;
    });
  }, [selectedSubject, searchQuery]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    playSound("click");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (item: FormulaItem) => {
    if (speakingId === item.id) {
      SpeechSpeaker.stop();
      setSpeakingId(null);
    } else {
      const speechScript = `${item.topic}. Formula: ${item.formula_latex}. Explanation: ${item.description}. Exam tip: ${item.tip || ""}`;
      SpeechSpeaker.speak(speechScript, () => {
        setSpeakingId(null);
      });
      setSpeakingId(item.id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Top Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-4 sticky top-12 z-20 backdrop-blur-md bg-slate-900/90">
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                <BookOpen size={16} />
              </div>
              <div>
                <h1 className="font-bold text-base text-white flex items-center gap-1.5">
                  Formula & Revision Hub
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full border border-indigo-500/30 font-bold">
                    KaTeX
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400">All 60 JEE Main chapters • Physics • Chemistry • Math</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Link
                href="/flashcards"
                className="text-xs text-amber-300 hover:text-amber-200 font-medium flex items-center gap-1 py-1 px-2 rounded-lg bg-amber-950/40 border border-amber-800/50 transition-colors"
              >
                Cards
              </Link>
              <Link
                href="/revision"
                className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 py-1 px-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700/80 transition-colors"
              >
                Revision
              </Link>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={15} />
            <input
              type="text"
              placeholder="Search formula (e.g. Carnot, Projectile, Nernst, King's Rule)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Subject Switcher Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            {(["All", "Physics", "Chemistry", "Mathematics"] as const).map((sub) => {
              const active = selectedSubject === sub;
              return (
                <button
                  key={sub}
                  onClick={() => {
                    setSelectedSubject(sub);
                    playSound("click");
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    active
                      ? sub === "Physics"
                        ? "bg-sky-500 text-white shadow-md shadow-sky-500/30"
                        : sub === "Chemistry"
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                        : sub === "Mathematics"
                        ? "bg-amber-500 text-white shadow-md shadow-amber-500/30"
                        : "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60"
                  }`}
                >
                  {sub}
                  <span className="text-[10px] opacity-75 font-normal">
                    {sub === "All"
                      ? FORMULAS_DATA.length
                      : FORMULAS_DATA.filter((f) => f.subject === sub).length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Formula List */}
      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {filteredFormulas.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
            <Zap className="mx-auto text-amber-400" size={28} />
            <h3 className="font-bold text-sm text-white">No formulas found</h3>
            <p className="text-xs text-slate-400">
              Try searching with another keyword or select a different subject tab.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedSubject("All");
              }}
              className="text-xs text-indigo-400 font-bold hover:underline pt-2 block"
            >
              Reset filters
            </button>
          </div>
        ) : (
          filteredFormulas.map((item) => {
            const isPhysics = item.subject === "Physics";
            const isChemistry = item.subject === "Chemistry";
            const isMath = item.subject === "Mathematics";

            const badgeColor = isPhysics
              ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
              : isChemistry
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-amber-500/10 text-amber-400 border-amber-500/30";

            return (
              <div
                key={item.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 shadow-sm space-y-3 transition-all"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                        {item.subject}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/60">
                        {item.chapter}
                      </span>
                    </div>
                    <h2 className="font-bold text-sm text-white mt-1.5">{item.topic}</h2>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Speak Button */}
                    <button
                      onClick={() => handleSpeak(item)}
                      className={`p-1.5 rounded-lg border text-xs transition-colors ${
                        speakingId === item.id
                          ? "bg-indigo-600 text-white border-indigo-500 animate-pulse"
                          : "bg-slate-800 text-slate-400 hover:text-white border-slate-700"
                      }`}
                      title={speakingId === item.id ? "Stop voice" : "Listen to formula & tips"}
                    >
                      {speakingId === item.id ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>

                    {/* Copy LaTeX Button */}
                    <button
                      onClick={() => handleCopy(item.id, item.formula_latex)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white text-xs transition-colors"
                      title="Copy LaTeX formula"
                    >
                      {copiedId === item.id ? (
                        <Check size={14} className="text-emerald-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>

                {/* KaTeX Math Box */}
                <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-3 text-center overflow-x-auto text-sky-200 shadow-inner">
                  <LatexRenderer latex={`$$${item.formula_latex}$$`} />
                </div>

                {/* Description & Constraints */}
                <div className="text-xs text-slate-300 leading-relaxed">
                  <LatexRenderer latex={item.description} />
                </div>

                {/* Exam Tip */}
                {item.tip && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-2">
                    <Sparkles size={14} className="text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[11px] text-amber-300 uppercase tracking-wider block">
                        Rank Booster Tip:
                      </span>
                      <LatexRenderer latex={item.tip} />
                    </div>
                  </div>
                )}

                {/* Practice Questions CTA Link */}
                <div className="pt-1 flex items-center justify-between border-t border-slate-800/80 text-[11px]">
                  <span className="text-slate-500">Need practice with this formula?</span>
                  <Link
                    href={`/?chapter=${encodeURIComponent(item.chapter)}`}
                    className="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1"
                  >
                    Practice Qs <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
