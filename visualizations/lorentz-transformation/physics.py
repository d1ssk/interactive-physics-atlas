"""Lorentz transformations and invariant geometric constructions in 1+1 dimensions.

Coordinates are ``(x, ct)`` in units with ``c = 1``.  The metric signature is ``(+,-)``, so
the squared interval is ``(ct)^2 - x^2``.  A positive boost parameter means that the primed
frame moves along the positive spatial direction of the unprimed frame.
"""

from __future__ import annotations

import math
from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class Event:
    """An event with spatial coordinate ``x`` and time coordinate ``ct``."""

    x: float
    ct: float


@dataclass(frozen=True, slots=True)
class CoordinateGuides:
    """Axis intersections used to read both coordinates of an event."""

    x_foot: Event
    ct_foot: Event


@dataclass(frozen=True, slots=True)
class TimeDilationConstruction:
    """Events used in the geometric time-dilation construction."""

    reference_end: Event
    simultaneous_intersection: Event
    moving_clock_end: Event
    coordinate_time: float


@dataclass(frozen=True, slots=True)
class LengthContractionConstruction:
    """Events used in the geometric length-contraction construction."""

    reference_end: Event
    moving_rest_end: Event
    simultaneous_endpoint: Event
    coordinate_length: float


def _validate_beta(beta: float) -> None:
    if not math.isfinite(beta) or abs(beta) >= 1:
        raise ValueError("beta must be finite and satisfy |beta| < 1")


def _validate_positive(value: float, name: str) -> None:
    if not math.isfinite(value) or value <= 0:
        raise ValueError(f"{name} must be finite and positive")


def gamma(beta: float) -> float:
    """Return the Lorentz factor for a dimensionless speed ``beta``."""

    _validate_beta(beta)
    return 1 / math.sqrt(1 - beta**2)


def rapidity(beta: float) -> float:
    """Return the rapidity associated with ``beta``."""

    _validate_beta(beta)
    return math.atanh(beta)


def boost(event: Event, beta: float) -> Event:
    """Transform an event from the unprimed frame into the primed frame."""

    factor = gamma(beta)
    return Event(
        x=factor * (event.x - beta * event.ct),
        ct=factor * (event.ct - beta * event.x),
    )


def inverse_boost(event: Event, beta: float) -> Event:
    """Transform an event from the primed frame into the unprimed frame."""

    return boost(event, -beta)


def interval(event: Event) -> float:
    """Return the squared Minkowski interval from the origin to ``event``."""

    return event.ct**2 - event.x**2


def coordinate_guides(event: Event, beta: float) -> dict[str, CoordinateGuides]:
    """Return physical events where coordinate projections meet each frame's axes."""

    primed = boost(event, beta)
    return {
        "base": CoordinateGuides(
            x_foot=Event(event.x, 0),
            ct_foot=Event(0, event.ct),
        ),
        "prime": CoordinateGuides(
            x_foot=inverse_boost(Event(primed.x, 0), beta),
            ct_foot=inverse_boost(Event(0, primed.ct), beta),
        ),
    }


def hyperbolic_timelike_point(
    proper_time: float,
    beta: float,
    progress: float = 1,
) -> Event:
    """Rotate a timelike interval through a fraction of the boost rapidity."""

    _validate_positive(proper_time, "proper_time")
    if not math.isfinite(progress) or not 0 <= progress <= 1:
        raise ValueError("progress must satisfy 0 <= progress <= 1")
    angle = rapidity(beta) * progress
    return Event(
        x=proper_time * math.sinh(angle),
        ct=proper_time * math.cosh(angle),
    )


def hyperbolic_spacelike_point(
    proper_length: float,
    beta: float,
    progress: float = 1,
) -> Event:
    """Rotate a spacelike interval through a fraction of the boost rapidity."""

    _validate_positive(proper_length, "proper_length")
    if not math.isfinite(progress) or not 0 <= progress <= 1:
        raise ValueError("progress must satisfy 0 <= progress <= 1")
    angle = rapidity(beta) * progress
    return Event(
        x=proper_length * math.cosh(angle),
        ct=proper_length * math.sinh(angle),
    )


def time_dilation_construction(
    beta: float,
    proper_time: float,
) -> TimeDilationConstruction:
    """Return the endpoints needed to compare proper time with coordinate time."""

    _validate_positive(proper_time, "proper_time")
    factor = gamma(beta)
    return TimeDilationConstruction(
        reference_end=Event(0, proper_time),
        simultaneous_intersection=Event(beta * proper_time, proper_time),
        moving_clock_end=Event(
            factor * beta * proper_time,
            factor * proper_time,
        ),
        coordinate_time=factor * proper_time,
    )


def length_contraction_construction(
    beta: float,
    proper_length: float,
) -> LengthContractionConstruction:
    """Return the endpoints needed to compare proper length with coordinate length."""

    _validate_positive(proper_length, "proper_length")
    factor = gamma(beta)
    return LengthContractionConstruction(
        reference_end=Event(proper_length, 0),
        moving_rest_end=Event(
            factor * proper_length,
            factor * beta * proper_length,
        ),
        simultaneous_endpoint=Event(proper_length / factor, 0),
        coordinate_length=proper_length / factor,
    )
