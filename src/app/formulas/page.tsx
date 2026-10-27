"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import LatexRenderer from "@/components/LatexRenderer";
import ReviseSubNav from "@/components/ReviseSubNav";
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
    chapter: "Thermodynamics",
    topic: "First Law, Heat Capacities & Carnot Cycle",
    formula_latex: "\\Delta Q = \\Delta U + \\Delta W, \\quad C_p - C_v = R, \\quad \\eta_{\\text{Carnot}} = 1 - \\frac{T_L}{T_H} = \\frac{W}{Q_H}",
    description: "Work done in isothermal expansion: $W = nRT\\ln(V_f/V_i)$. Adiabatic: $PV^\\gamma = \\text{const}, W = \\frac{P_i V_i - P_f V_f}{\\gamma - 1}$.",
    tip: "In cyclic process: $\\Delta U_{\\text{cycle}} = 0 \\implies Q_{\\text{net}} = W_{\\text{net}}$."
  },
  {
    id: "p7",
    subject: "Physics",
    chapter: "Electrostatics",
    topic: "Gauss Law, Potential & Capacitance",
    formula_latex: "\\oint \\vec{E}\\cdot d\\vec{A} = \\frac{q_{\\text{in}}}{\\varepsilon_0}, \\quad V = \\frac{kq}{r}, \\quad C = \\frac{\\kappa \\varepsilon_0 A}{d}, \\quad U = \\frac{1}{2}CV^2",
    description: "Electric field outside spherical shell: $E = \\frac{kq}{r^2}$; inside shell: $E = 0, V = \\frac{kq}{R} = \\text{const}$.",
    tip: "When dielectric slab is inserted with battery connected: $V$ constant, $Q$ increases ($kQ$), $C$ increases ($kC$)."
  },
  {
    id: "p8",
    subject: "Physics",
    chapter: "Current Electricity",
    topic: "Drift Velocity, Ohm's Law & Potentiometer",
    formula_latex: "v_d = \\frac{eE\\tau}{m}, \\quad I = n e A v_d, \\quad R = \\rho\\frac{l}{A}, \\quad \\frac{E_1}{E_2} = \\frac{l_1}{l_2}, \\quad r = R\\left(\\frac{l_1}{l_2} - 1\\right)",
    description: "Temperature coefficient of resistance: $R_T = R_0(1 + \\alpha \\Delta T)$.",
    tip: "Kirchhoff's Current Law (junction rule) conserves charge; Kirchhoff's Voltage Law (loop rule) conserves energy."
  },
  // ================= CHEMISTRY =================
  {
    id: "c1",
    subject: "Chemistry",
    chapter: "Atomic Structure",
    topic: "Bohr Model & Quantum Numbers",
    formula_latex: "r_n = 0.529\\frac{n^2}{Z}\\,\\text{\\AA}, \\quad E_n = -13.6\\frac{Z^2}{n^2}\\,\\text{eV}, \\quad \\bar{\\nu} = R_H Z^2\\left(\\frac{1}{n_1^2} - \\frac{1}{n_2^2}\\right)",
    description: "De Broglie wavelength: $\\lambda = \\frac{h}{p} = \\frac{h}{\\sqrt{2m(KE)}}$. Heisenberg uncertainty: $\\Delta x \\cdot \\Delta p \\ge \\frac{h}{4\\pi}$.",
    tip: "Lyman series falls in UV region ($n_1=1$), Balmer series falls in visible region ($n_1=2$)."
  },
  {
    id: "c2",
    subject: "Chemistry",
    chapter: "Chemical Thermodynamics",
    topic: "Enthalpy, Entropy & Gibbs Free Energy",
    formula_latex: "\\Delta G = \\Delta H - T\\Delta S, \\quad \\Delta G^\\circ = -RT\\ln K, \\quad \\Delta H = \\Delta U + \\Delta n_g RT",
    description: "Spontaneity criterion: $\\Delta G < 0$ at constant temperature and pressure.",
    tip: "If $\\Delta H > 0$ and $\\Delta S > 0$, reaction becomes spontaneous only at HIGH temperatures ($T > \\Delta H / \\Delta S$)."
  },
  {
    id: "c3",
    subject: "Chemistry",
    chapter: "Chemical Equilibrium",
    topic: "Equilibrium Constant & Le Chatelier's Principle",
    formula_latex: "K_p = K_c(RT)^{\\Delta n_g}, \\quad \\ln\\left(\\frac{K_2}{K_1}\\right) = \\frac{\\Delta H^\\circ}{R}\\left(\\frac{1}{T_1} - \\frac{1}{T_2}\\right)",
    description: "Van 't Hoff equation: Endothermic reactions ($\\Delta H > 0$) have $K$ increasing as $T$ increases.",
    tip: "Adding an inert gas at constant volume has NO effect on equilibrium composition."
  },
  {
    id: "c4",
    subject: "Chemistry",
    chapter: "Electrochemistry",
    topic: "Nernst Equation & Kohlrausch's Law",
    formula_latex: "E_{\\text{cell}} = E^\\circ_{\\text{cell}} - \\frac{0.0591}{n}\\log_{10} Q, \\quad \\Delta G^\\circ = -nFE^\\circ_{\\text{cell}}, \\quad \\Lambda_m^\\circ = \\nu_+ \\lambda_+^\\circ + \\nu_- \\lambda_-^\\circ",
    description: "Standard electrode potential is an intensive property; doubling stoichiometry does NOT change $E^\\circ$.",
    tip: "At equilibrium: $E_{\\text{cell}} = 0$, so $E^\\circ_{\\text{cell}} = \\frac{0.0591}{n}\\log_{10} K_{\\text{eq}}$ at 298 K."
  },
  {
    id: "c5",
    subject: "Chemistry",
    chapter: "Solutions",
    topic: "Colligative Properties & Van 't Hoff Factor",
    formula_latex: "\\frac{\\Delta P}{P_A^\\circ} = i X_B, \\quad \\Delta T_b = i K_b m, \\quad \\Delta T_f = i K_f m, \\quad \\Pi = iCRT",
    description: "Van 't Hoff factor $i = 1 + (n-1)\\alpha$ for dissociation, and $i = 1 - (1 - 1/n)\\beta$ for association.",
    tip: "For 0.1 M NaCl ($i \\approx 2$), depression in freezing point is nearly twice that of 0.1 M glucose ($i = 1$)."
  },
  // ================= MATHEMATICS =================
  {
    id: "m1",
    subject: "Mathematics",
    chapter: "Calculus",
    topic: "Limits, Continuity & L'Hôpital's Rule",
    formula_latex: "\\lim_{x\\to 0}\\frac{\\sin x}{x} = 1, \\quad \\lim_{x\\to 0}\\frac{e^x-1}{x} = 1, \\quad \\lim_{x\\to 0}(1+x)^{1/x} = e",
    description: "Form $1^\\infty$: $\\lim_{x\\to a} [f(x)]^{g(x)} = e^{\\lim_{x\\to a} g(x)[f(x) - 1]}$ when $\\lim f(x)=1$ and $\\lim g(x)=\\infty$.",
    tip: "L'Hôpital's rule applies strictly to indeterminate forms $\\frac{0}{0}$ and $\\frac{\\infty}{\\infty}$."
  },
  {
    id: "m2",
    subject: "Mathematics",
    chapter: "Calculus",
    topic: "Standard Derivatives & Chain Rule",
    formula_latex: "\\frac{d}{dx}[\\tan^{-1} x] = \\frac{1}{1+x^2}, \\quad \\frac{d}{dx}[a^x] = a^x\\ln a, \\quad \\frac{d}{dx}[u \\cdot v] = u'v + uv'",
    description: "Rolle's Theorem: If $f$ is continuous on $[a,b]$ and differentiable on $(a,b)$ with $f(a)=f(b)$, then $\\exists c \\in (a,b)$ where $f'(c) = 0$.",
    tip: "Lagrange's MVT: $f'(c) = \\frac{f(b)-f(a)}{b-a}$."
  },
  {
    id: "m3",
    subject: "Mathematics",
    chapter: "Calculus",
    topic: "Definite Integrals & King's Property",
    formula_latex: "\\int_a^b f(x)dx = \\int_a^b f(a+b-x)dx, \\quad \\int_0^{2a} f(x)dx = 2\\int_0^a f(x)dx \\;\\text{if } f(2a-x)=f(x)",
    description: "Leibniz Integral Rule: $\\frac{d}{dx}\\left[\\int_{u(x)}^{v(x)} f(t)dt\\right] = f(v(x))v'(x) - f(u(x))u'(x)$.",
    tip: "King's property $\\int_a^b f(x)dx = \\int_a^b f(a+b-x)dx$ solves 80% of tricky trigonometric definite integrals."
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

const PAGE_SIZE = 12;

export default function FormulasPage() {
  const [selectedSubject, setSelectedSubject] = useState<"All" | "Physics" | "Chemistry" | "Mathematics">("All");
  const [rawSearch, setRawSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Debounce search by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(rawSearch.trim().toLowerCase());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [rawSearch]);

  const filteredFormulas = useMemo(() => {
    return COMBINED_FORMULAS.filter((item) => {
      const matchSubject = selectedSubject === "All" || item.subject === selectedSubject;
      const matchSearch =
        !searchQuery ||
        item.topic.toLowerCase().includes(searchQuery) ||
        item.chapter.toLowerCase().includes(searchQuery) ||
        item.description.toLowerCase().includes(searchQuery) ||
        item.formula_latex.toLowerCase().includes(searchQuery);
      return matchSubject && matchSearch;
    });
  }, [selectedSubject, searchQuery]);

  // Paginated formulas: only 12 in the DOM
  const totalPages = Math.ceil(filteredFormulas.length / PAGE_SIZE);
  const paginatedFormulas = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredFormulas.slice(start, start + PAGE_SIZE);
  }, [filteredFormulas, currentPage]);

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
    <div className="space-y-4 max-w-md mx-auto pb-8">
      {/* 1. Sub-Tabs Header */}
      <ReviseSubNav />

      {/* 2. Search & Subject Filter Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
          <input
            type="text"
            placeholder="Search formulas (e.g. Carnot, King's Rule)..."
            value={rawSearch}
            onChange={(e) => setRawSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
          {rawSearch && (
            <button
              onClick={() => setRawSearch("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
              aria-label="Clear formula search"
            >
              ✕
            </button>
          )}
        </div>

        {/* 4 Subject Chips */}
        <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-xs">
          {(["All", "Physics", "Chemistry", "Mathematics"] as const).map((sub) => {
            const active = selectedSubject === sub;
            return (
              <button
                key={sub}
                onClick={() => {
                  setSelectedSubject(sub);
                  setCurrentPage(1);
                  playSound("click");
                }}
                className={`py-1.5 text-center font-semibold rounded-md transition-colors ${
                  active
                    ? "bg-sky-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {sub === "Mathematics" ? "Maths" : sub}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Formula Cards (Paginated) */}
      <div className="space-y-3">
        {filteredFormulas.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400">
            No formulas match your search.
          </div>
        ) : (
          paginatedFormulas.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2.5"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                      {item.subject}
                    </span>
                    <span className="text-slate-400 font-medium">
                      {item.chapter}
                    </span>
                  </div>
                  <h3 className="font-bold text-xs text-white mt-1">{item.topic}</h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleSpeak(item)}
                    className={`p-1.5 rounded-lg border text-xs transition-colors ${
                      speakingId === item.id
                        ? "bg-sky-600 text-white border-sky-500"
                        : "bg-slate-950 text-slate-400 hover:text-white border-slate-800"
                    }`}
                    title={speakingId === item.id ? "Stop" : "Listen to formula"}
                    aria-label="Audio narration"
                  >
                    {speakingId === item.id ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  </button>

                  <button
                    onClick={() => handleCopy(item.id, item.formula_latex)}
                    className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs transition-colors"
                    title="Copy LaTeX"
                    aria-label="Copy formula"
                  >
                    {copiedId === item.id ? (
                      <Check size={13} className="text-emerald-400" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                </div>
              </div>

              {/* Formula Display Box */}
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 overflow-x-auto text-xs text-center text-sky-200">
                <LatexRenderer content={`$$${item.formula_latex}$$`} />
              </div>

              {/* Description & Exam Warning */}
              <div className="text-xs text-slate-300 leading-relaxed space-y-1">
                <LatexRenderer content={item.description} />
                {item.tip && (
                  <div className="text-[11px] text-amber-300/90 bg-amber-950/20 border border-amber-900/30 p-2 rounded-lg mt-1">
                    <LatexRenderer content={`💡 ${item.tip}`} />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 disabled:opacity-40 disabled:pointer-events-none min-h-[40px]"
          >
            Previous
          </button>
          <span className="font-semibold text-slate-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 disabled:opacity-40 disabled:pointer-events-none min-h-[40px]"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
