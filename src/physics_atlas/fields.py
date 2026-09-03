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
        "Motion, rigid bodies, and variational principles.",
        "古典力学",
        "運動、剛体、変分原理",
    ),
    FieldDefinition(
        "electromagnetism",
        "Electromagnetism",
        "Fields, potentials, and electromagnetic waves.",
        "電磁気学",
        "場、ポテンシャル、電磁波",
    ),
    FieldDefinition(
        "quantum-mechanics",
        "Quantum Mechanics",
        "Quantum states, time evolution, and measurement.",
        "量子力学",
        "量子状態、時間発展、測定",
        "assets/images/quantum-mechanics.png",
    ),
    FieldDefinition(
        "thermodynamics",
        "Thermodynamics",
        "Equilibrium, heat, work, entropy, and thermodynamic potentials.",
        "熱力学",
        "平衡、熱、仕事、エントロピー、熱力学ポテンシャル",
    ),
    FieldDefinition(
        "statistical-physics",
        "Statistical Physics",
        "Fluctuations, emergent phenomena, and universality.",
        "統計物理学",
        "ゆらぎ、創発現象、普遍性",
        "assets/images/statistical-physics.png",
    ),
    FieldDefinition(
        "condensed-matter-physics",
        "Condensed Matter Physics",
        "Many-body systems, matter, and phases.",
        "物性物理学",
        "多体系、物質、相",
    ),
    FieldDefinition(
        "fluid-mechanics",
        "Fluid Mechanics",
        "Continuum flows, waves, instabilities, and turbulence.",
        "流体力学",
        "連続体の流れ、波、不安定性、乱流",
    ),
    FieldDefinition(
        "relativity",
        "Relativity",
        "Spacetime geometry, motion, gravitation, and causal structure.",
        "相対論",
        "時空の幾何、運動、重力、因果構造",
        "assets/images/relativity.png",
    ),
    FieldDefinition(
        "quantum-field-theory",
        "Quantum Field Theory",
        "Symmetries, fields, particles, interactions, and renormalization.",
        "場の量子論",
        "対称性、場、粒子、相互作用、繰り込み",
    ),
    FieldDefinition(
        "particle-physics",
        "Particle Physics",
        "Elementary particles, gauge fields, the Standard Model, and BSM physics.",
        "素粒子物理学",
        "素粒子、ゲージ場、標準模型、BSM",
    ),
    FieldDefinition(
        "cosmology",
        "Cosmology",
        "Thermal history, structure formation, and the early universe.",
        "宇宙論",
        "熱史、構造形成、初期宇宙",
        "assets/images/cosmology.png",
    ),
    FieldDefinition(
        "supersymmetry",
        "Supersymmetry",
        "Supersymmetry, supersymmetric quantum field theory, and supersymmetric quantum mechanics.",
        "超対称性",
        "超対称性、超対称場の量子論、超対称量子力学",
    ),
    FieldDefinition(
        "string-theory",
        "String Theory",
        "CFT, strings, branes, dualities, and higher-dimensional geometry.",
        "弦理論",
        "CFT、弦、ブレーン、双対性、高次元幾何",
        "assets/images/string-theory.png",
    ),
    FieldDefinition(
        "mathematics-for-physics",
        "Mathematics for Physics",
        "Mathematical methods and structures used in physics.",
        "物理数学",
        "物理学で用いられる数学的手法、構造",
        "assets/images/mathematics-for-physics.png",
    ),
)

FIELD_BY_SLUG = {field.slug: field for field in FIELDS}
CANONICAL_FIELDS = tuple(FIELD_BY_SLUG)
