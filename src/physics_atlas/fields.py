"""Canonical physics-field definitions used across the atlas."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class FieldDefinition:
    """Display and routing information for one atlas field."""

    slug: str
    label: str
    summary: str
    image: str | None = None


FIELDS = (
    FieldDefinition(
        "classical-mechanics",
        "Classical Mechanics",
        "Motion, variational principles, and Hamiltonian dynamics.",
    ),
    FieldDefinition(
        "electromagnetism",
        "Electromagnetism",
        "Fields, potentials, radiation, and electromagnetic waves.",
    ),
    FieldDefinition(
        "quantum-mechanics",
        "Quantum Mechanics",
        "Quantum states, observables, dynamics, and measurement.",
    ),
    FieldDefinition(
        "thermodynamics",
        "Thermodynamics",
        "Equilibrium, heat, work, entropy, and thermodynamic potentials.",
    ),
    FieldDefinition(
        "statistical-physics",
        "Statistical Physics",
        "Ensembles, fluctuations, transport, and emergent behavior.",
    ),
    FieldDefinition(
        "condensed-matter-physics",
        "Condensed Matter Physics",
        "Collective phenomena, materials, phases, and excitations.",
    ),
    FieldDefinition(
        "fluid-mechanics",
        "Fluid Mechanics",
        "Continuum flows, waves, instabilities, and turbulence.",
    ),
    FieldDefinition(
        "relativity",
        "Relativity",
        "Spacetime geometry, motion, gravitation, and causal structure.",
    ),
    FieldDefinition(
        "cosmology",
        "Cosmology",
        "Expansion, thermal history, structure formation, and the early universe.",
    ),
    FieldDefinition(
        "quantum-field-theory",
        "Quantum Field Theory",
        "Fields, particles, symmetries, and quantum interactions.",
    ),
    FieldDefinition(
        "particle-physics",
        "Particle Physics",
        "Elementary particles, fundamental forces, and the Standard Model.",
    ),
    FieldDefinition(
        "supersymmetry",
        "Supersymmetry",
        "Supersymmetric quantum systems, fields, dynamics, and dualities.",
    ),
    FieldDefinition(
        "string-theory",
        "String Theory",
        "Strings, branes, dualities, and higher-dimensional geometry.",
    ),
    FieldDefinition(
        "mathematics-for-physics",
        "Mathematics for Physics",
        "Mathematical structures and methods used throughout physics.",
        "assets/images/mathematics-for-physics.png",
    ),
)

FIELD_BY_SLUG = {field.slug: field for field in FIELDS}
CANONICAL_FIELDS = tuple(FIELD_BY_SLUG)
