import sqlite3
import json
import uuid
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "prisma", "dev.db")
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")

    # 1. Papers table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS papers (
        id TEXT PRIMARY KEY,
        year INTEGER NOT NULL DEFAULT 2026,
        session INTEGER NOT NULL,
        exam_date TEXT NOT NULL,
        shift INTEGER NOT NULL,
        source_url TEXT NOT NULL,
        total_marks INTEGER NOT NULL DEFAULT 300
    );
    """)

    # 2. Questions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        paper_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        chapter TEXT NOT NULL,
        topic TEXT,
        question_number INTEGER NOT NULL,
        question_type TEXT NOT NULL,
        question_text_latex TEXT NOT NULL,
        image_url TEXT,
        options_json TEXT,
        correct_answer TEXT NOT NULL,
        marks_correct INTEGER NOT NULL DEFAULT 4,
        marks_negative INTEGER NOT NULL DEFAULT 1,
        difficulty TEXT NOT NULL DEFAULT 'medium',
        source_page INTEGER,
        FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
    );
    """)

    # 3. Explanations table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS explanations (
        id TEXT PRIMARY KEY,
        question_id TEXT NOT NULL UNIQUE,
        hint TEXT NOT NULL,
        approach TEXT NOT NULL,
        full_solution_latex TEXT NOT NULL,
        concept_used TEXT NOT NULL,
        common_mistake TEXT,
        similar_concept_tip TEXT,
        verified_against_key INTEGER NOT NULL DEFAULT 1,
        confidence TEXT NOT NULL DEFAULT 'high',
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    );
    """)

    # 4. Chapters table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chapters (
        id TEXT PRIMARY KEY,
        subject TEXT NOT NULL,
        name TEXT NOT NULL,
        class_level INTEGER NOT NULL,
        jee_weightage_notes TEXT
    );
    """)

    # 5. Pattern info table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS pattern_info (
        id TEXT PRIMARY KEY,
        year INTEGER NOT NULL DEFAULT 2026,
        section TEXT NOT NULL,
        question_type TEXT NOT NULL,
        count INTEGER NOT NULL,
        marks_correct INTEGER NOT NULL DEFAULT 4,
        marks_negative INTEGER NOT NULL DEFAULT 1,
        duration_minutes INTEGER NOT NULL DEFAULT 180,
        notes TEXT
    );
    """)

    # 6. Attempts table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS attempts (
        id TEXT PRIMARY KEY,
        question_id TEXT NOT NULL,
        selected_answer TEXT,
        is_correct INTEGER,
        time_taken_sec INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        bookmarked INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    );
    """)

    # Indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_questions_chapter ON questions(chapter);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_chapters_subject ON chapters(subject);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_attempts_question ON attempts(question_id);")

    # Seed Chapters if empty
    cursor.execute("SELECT COUNT(*) FROM chapters")
    if cursor.fetchone()[0] == 0:
        print("Seeding official JEE syllabus chapters...")
        chapters_data = [
            # Physics Class 11
            ("Physics", "Units and Measurements", 11, "High frequency fundamental topic; dimensional analysis questions appear regularly."),
            ("Physics", "Kinematics", 11, "1-2 questions per shift on 1D/2D motion, projectile trajectories, and relative velocity."),
            ("Physics", "Laws of Motion", 11, "Friction, pulley constraints, and equilibrium problems."),
            ("Physics", "Work, Energy and Power", 11, "Work-energy theorem, potential energy curves, and spring systems."),
            ("Physics", "Rotational Motion", 11, "Moment of inertia, rolling without slipping, and angular momentum conservation."),
            ("Physics", "Gravitation", 11, "Escape velocity, orbital mechanics, and variation of g with height/depth."),
            ("Physics", "Properties of Solids and Liquids", 11, "Viscosity, Bernoulli equation, surface tension, and Hooke's law."),
            ("Physics", "Thermodynamics", 11, "First law, Carnot cycle, isobaric/isochoric/adiabatic processes."),
            ("Physics", "Kinetic Theory of Gases", 11, "RMS speed, degrees of freedom, and specific heat capacities."),
            ("Physics", "Oscillations and Waves", 11, "SHM equations, spring-mass systems, Doppler effect, and resonance pipes."),
            
            # Physics Class 12
            ("Physics", "Electrostatics", 12, "Gauss's law, electric potential, dipole moments, and spherical shell conductors."),
            ("Physics", "Current Electricity", 12, "Kirchhoff's laws, potentiometer/meter bridge, temperature dependence of resistance."),
            ("Physics", "Magnetic Effects of Current and Magnetism", 12, "Biot-Savart law, Ampere's loop, Lorentz force, and galvanometer conversions."),
            ("Physics", "Electromagnetic Induction and Alternating Currents", 12, "Faraday-Lenz law, self/mutual inductance, LCR series resonance, and Q-factor."),
            ("Physics", "Electromagnetic Waves", 12, "Displacement current, Maxwell equations, and EM spectrum wavelengths."),
            ("Physics", "Optics", 12, "Snell's law, lens-maker formula, prism deviation, Young's double slit interference."),
            ("Physics", "Dual Nature of Matter and Radiation", 12, "Photoelectric effect, stopping potential, and de Broglie wavelength."),
            ("Physics", "Atoms and Nuclei", 12, "Bohr model transitions, mass defect, binding energy, and radioactive decay rates."),
            ("Physics", "Electronic Devices", 12, "p-n junction diodes, Zener voltage regulators, and logic gates."),
            ("Physics", "Experimental Skills", 12, "Vernier caliper, screw gauge, galvanometer to ammeter/voltmeter calibration."),

            # Chemistry Class 11
            ("Chemistry", "Some Basic Concepts in Chemistry", 11, "Mole concept, stoichiometry, molarity/molality, and limiting reagent calculations."),
            ("Chemistry", "Structure of Atom", 11, "Quantum numbers, de Broglie relation, Heisenberg uncertainty, and Bohr radii."),
            ("Chemistry", "Classification of Elements and Periodicity", 11, "Ionization enthalpy, electron gain enthalpy, and electronegativity trends."),
            ("Chemistry", "Chemical Bonding and Molecular Structure", 11, "VSEPR theory, hybridization, dipole moment, and MO theory bond orders."),
            ("Chemistry", "Chemical Thermodynamics", 11, "Enthalpy, entropy, Gibbs free energy criterion, and Hess's law."),
            ("Chemistry", "Equilibrium", 11, "Le Chatelier principle, pH of buffer solutions, and solubility product (Ksp)."),
            ("Chemistry", "Redox Reactions", 11, "Oxidation state calculation and balancing redox reactions."),
            ("Chemistry", "Organic Chemistry - Basic Principles and Techniques", 11, "IUPAC nomenclature, carbocation/carbanion stability, hyperconjugation, and resonance."),
            ("Chemistry", "Hydrocarbons", 11, "Markovnikov addition, ozonolysis, Friedel-Crafts alkylation/acylation, and acidity of alkynes."),

            # Chemistry Class 12
            ("Chemistry", "Solutions", 12, "Raoult's law, colligative properties, van 't Hoff factor (i), and Henry's law."),
            ("Chemistry", "Electrochemistry", 12, "Nernst equation, Kohlrausch law, Faraday's laws of electrolysis, and molar conductivity."),
            ("Chemistry", "Chemical Kinetics", 12, "Order and molecularity, integrated rate equations, Arrhenius equation, and half-life."),
            ("Chemistry", "The d- and f-Block Elements", 12, "Electronic configurations, variable oxidation states, lanthanoid contraction, and KMnO4/K2Cr2O7 reactions."),
            ("Chemistry", "Coordination Compounds", 12, "Werner's theory, crystal field splitting (CFSE), magnetic moments, and isomerism."),
            ("Chemistry", "Haloalkanes and Haloarenes", 12, "SN1 and SN2 mechanisms, stereochemical inversion, and Grignard reagent reactions."),
            ("Chemistry", "Alcohols, Phenols and Ethers", 12, "Reimer-Tiemann reaction, Kolbe reaction, Lucas test, and Williamson ether synthesis."),
            ("Chemistry", "Aldehydes, Ketones and Carboxylic Acids", 12, "Aldol condensation, Cannizzaro reaction, Tollens/Fehling test, and Hell-Volhard-Zelinsky reaction."),
            ("Chemistry", "Amines", 12, "Hoffmann bromamide degradation, Gabriel phthalimide synthesis, and Hinsberg reagent test."),
            ("Chemistry", "Biomolecules", 12, "Carbohydrate structures (glucose, fructose), peptide bonds, denaturation of proteins, and nucleic acids."),
            ("Chemistry", "Principles Related to Practical Chemistry", 12, "Qualitative salt analysis, cation/anion detection tests, and volumetric titrations."),

            # Mathematics Class 11
            ("Mathematics", "Sets, Relations and Functions", 11, "Domain and range of functions, composite functions, and equivalence relations."),
            ("Mathematics", "Complex Numbers and Quadratic Equations", 11, "Modulus, argument, cube roots of unity, and roots of quadratic equations."),
            ("Mathematics", "Permutations and Combinations", 11, "Fundamental counting principle, circular permutations, and selection with repetition."),
            ("Mathematics", "Binomial Theorem", 11, "General term, middle term, and properties of binomial coefficients."),
            ("Mathematics", "Sequences and Series", 11, "AP, GP, arithmetic-geometric progression (AGP), and summation of special series."),
            ("Mathematics", "Straight Lines", 11, "Slope-intercept form, angle between lines, distance of a point from a line, and concurrent lines."),
            ("Mathematics", "Conic Sections", 11, "Standard equations of parabola, ellipse, hyperbola, eccentricities, and tangents."),
            ("Mathematics", "Introduction to Three-Dimensional Geometry", 11, "Distance between two points, section formula, and direction cosines in 3D."),
            ("Mathematics", "Limits and Derivatives", 11, "Standard limits evaluation, L'Hopital rule, and first principle derivatives."),
            ("Mathematics", "Statistics and Probability", 11, "Mean deviation, variance, standard deviation, and basic probability events."),

            # Mathematics Class 12
            ("Mathematics", "Relations and Functions", 12, "One-one, onto functions, invertible functions, and principal value branches of inverse trigonometric functions."),
            ("Mathematics", "Matrices and Determinants", 12, "Properties of determinants, adjoint, matrix inverse, and system of linear equations (Cramer's rule)."),
            ("Mathematics", "Continuity and Differentiability", 12, "Differentiability test, chain rule, logarithmic differentiation, and Mean Value Theorems."),
            ("Mathematics", "Applications of Derivatives", 12, "Rate of change, tangents and normals, increasing/decreasing functions, and maxima/minima."),
            ("Mathematics", "Integrals", 12, "Standard integration formulas, integration by parts, substitution, and definite integral properties."),
            ("Mathematics", "Applications of Integrals", 12, "Area bounded by standard curves, parabolas, circles, and straight lines."),
            ("Mathematics", "Differential Equations", 12, "Variable separable form, homogeneous differential equations, and linear first-order differential equations."),
            ("Mathematics", "Vector Algebra", 12, "Dot product, cross product, scalar triple product, and projection of vectors."),
            ("Mathematics", "Three-Dimensional Geometry", 12, "Equation of lines in 3D, shortest distance between skew lines, and coplanarity."),
            ("Mathematics", "Probability", 12, "Conditional probability, multiplication theorem, Bayes' theorem, and independent events.")
        ]
        
        for subj, name, lvl, notes in chapters_data:
            cursor.execute("""
            INSERT INTO chapters (id, subject, name, class_level, jee_weightage_notes)
            VALUES (?, ?, ?, ?, ?)
            """, (str(uuid.uuid4()), subj, name, lvl, notes))

    # Seed Pattern Info if empty
    cursor.execute("SELECT COUNT(*) FROM pattern_info")
    if cursor.fetchone()[0] == 0:
        print("Seeding official JEE Main 2026 exam pattern info...")
        patterns = [
            (2026, "Section A - Physics", "MCQ", 20, 4, 1, 180, "20 compulsory multiple choice questions with single correct option."),
            (2026, "Section B - Physics", "NUMERICAL", 5, 4, 1, 180, "5 numerical value questions. Enter integer or decimal answer."),
            (2026, "Section A - Chemistry", "MCQ", 20, 4, 1, 180, "20 compulsory multiple choice questions with single correct option."),
            (2026, "Section B - Chemistry", "NUMERICAL", 5, 4, 1, 180, "5 numerical value questions. Enter integer or decimal answer."),
            (2026, "Section A - Mathematics", "MCQ", 20, 4, 1, 180, "20 compulsory multiple choice questions with single correct option."),
            (2026, "Section B - Mathematics", "NUMERICAL", 5, 4, 1, 180, "5 numerical value questions. Enter integer or decimal answer.")
        ]
        for yr, sec, qtype, cnt, m_pos, m_neg, dur, notes in patterns:
            cursor.execute("""
            INSERT INTO pattern_info (id, year, section, question_type, count, marks_correct, marks_negative, duration_minutes, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (str(uuid.uuid4()), yr, sec, qtype, cnt, m_pos, m_neg, dur, notes))

    conn.commit()
    conn.close()
    print("Database initialized successfully at:", DB_PATH)

if __name__ == "__main__":
    init_db()
