"""Canonical physics-field definitions used across the atlas."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class FieldDefinition:
    """Display and routing information for one atlas field."""

    slug: str
    label: str
    summary: str
    label_ja: str
    summary_ja: str
    image: str | None = None

    def localized_label(self, locale: str) -> str:
        """Return the field label for a supported publication locale."""

        return self.label_ja if locale == "ja" else self.label

    def localized_summary(self, locale: str) -> str:
        """Return the field summary for a supported publication locale."""

        return self.summary_ja if locale == "ja" else self.summary


FIELDS = (
    FieldDefinition(
        "classical-mechanics",
        "Classical Mechanics",
        "Motion, variational principles, and Hamiltonian dynamics.",
        "古典力学",
        "運動、変分原理、ハミルトン力学。",
    ),
    FieldDefinition(
        "electromagnetism",
        "Electromagnetism",
        "Fields, potentials, radiation, and electromagnetic waves.",
        "電磁気学",
        "場、ポテンシャル、放射、電磁波。",
    ),
    FieldDefinition(
        "quantum-mechanics",
        "Quantum Mechanics",
        "Quantum states, observables, dynamics, and measurement.",
        "量子力学",
        "量子状態、観測量、時間発展、測定。",
    ),
    FieldDefinition(
        "thermodynamics",
        "Thermodynamics",
        "Equilibrium, heat, work, entropy, and thermodynamic potentials.",
        "熱力学",
        "平衡、熱、仕事、エントロピー、熱力学ポテンシャル。",
    ),
    FieldDefinition(
        "statistical-physics",
        "Statistical Physics",
        "Ensembles, fluctuations, transport, and emergent behavior.",
        "統計物理学",
        "アンサンブル、ゆらぎ、輸送、創発現象。",
    ),
    FieldDefinition(
        "condensed-matter-physics",
        "Condensed Matter Physics",
        "Collective phenomena, materials, phases, and excitations.",
        "物性物理学",
        "集団現象、物質、相、励起。",
    ),
    FieldDefinition(
        "fluid-mechanics",
        "Fluid Mechanics",
        "Continuum flows, waves, instabilities, and turbulence.",
        "流体力学",
        "連続体の流れ、波、不安定性、乱流。",
    ),
    FieldDefinition(
        "relativity",
        "Relativity",
        "Spacetime geometry, motion, gravitation, and causal structure.",
        "相対論",
        "時空の幾何、運動、重力、因果構造。",
    ),
    FieldDefinition(
        "cosmology",
        "Cosmology",
        "Expansion, thermal history, structure formation, and the early universe.",
        "宇宙論",
        "宇宙膨張、熱史、構造形成、初期宇宙。",
    ),
    FieldDefinition(
        "quantum-field-theory",
        "Quantum Field Theory",
        "Fields, particles, symmetries, and quantum interactions.",
        "場の量子論",
        "場、粒子、対称性、量子的相互作用。",
    ),
    FieldDefinition(
        "particle-physics",
        "Particle Physics",
        "Elementary particles, fundamental forces, and the Standard Model.",
        "素粒子物理学",
        "素粒子、基本相互作用、標準模型。",
    ),
    FieldDefinition(
        "supersymmetry",
        "Supersymmetry",
        "Supersymmetric quantum systems, fields, dynamics, and dualities.",
        "超対称性",
        "超対称な量子系、場、ダイナミクス、双対性。",
    ),
    FieldDefinition(
        "string-theory",
        "String Theory",
        "Strings, branes, dualities, and higher-dimensional geometry.",
        "弦理論",
        "弦、ブレーン、双対性、高次元幾何。",
    ),
    FieldDefinition(
        "mathematics-for-physics",
        "Mathematics for Physics",
        "Mathematical structures and methods used throughout physics.",
        "物理数学",
        "物理学で用いられる数学的構造と手法。",
        "assets/images/mathematics-for-physics.png",
    ),
)

FIELD_BY_SLUG = {field.slug: field for field in FIELDS}
CANONICAL_FIELDS = tuple(FIELD_BY_SLUG)
