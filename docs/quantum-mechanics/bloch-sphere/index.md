# Bloch Sphere

## Representing a single-qubit state as a point on a sphere

After removing the global phase, which has no effect on observations, every pure single-qubit
state can be written as

$$
|\psi\rangle
=
\cos\frac{\theta}{2}|0\rangle
+
e^{i\phi}\sin\frac{\theta}{2}|1\rangle
$$

The pair $(\theta,\phi)$ specifies a point on the unit sphere. Its Cartesian coordinates are given
by the expectation values of the Pauli operators,

$$
\mathbf r
=
(\langle X\rangle,\langle Y\rangle,\langle Z\rangle)
=
(\sin\theta\cos\phi,\sin\theta\sin\phi,\cos\theta)
$$

This unit sphere is called the Bloch sphere, and $\mathbf r$ is called the Bloch vector.

## Visualization

<iframe src="app/index.html?lang=en" title="Bloch sphere state, superposition, and quantum-gate explorer" data-auto-height scrolling="no" style="display: block; width: 100%; height: 2550px; min-height: 1000px; border: 0; overflow: hidden;" loading="eager"></iframe>

## Things to try

1. In the first panel, specify the same state in the $X$, $Y$, and $Z$ bases and compare its Bloch
   vector.

2. In the second panel, vary the relative phase $\delta$. Notice that the kets are superposed and
   then normalized; the Bloch vectors themselves are not added. Adding kets that are opposite,
   including their coefficients, can produce the zero vector.

3. In the third panel, apply the Pauli, Hadamard, $S$, and $T$ gates. Move the progress slider and
   observe how each unitary operation appears as a rotation on the Bloch sphere.

## What to notice

The Bloch vector of a pure state always lies on the unit sphere. The north and south poles
correspond to $|0\rangle$ and $|1\rangle$, respectively. Measuring an equatorial state in the
computational basis gives $0$ and $1$ with equal probability, but its relative phase varies with
the azimuthal angle on the sphere.

A unitary operation on one qubit preserves normalization and, after removing global phase, is
represented as a rotation on the Bloch sphere.

## Scope of this visualization

This visualization considers only pure single-qubit states. Kets that differ only by a global
phase describe the same physical state, so displayed kets use a fixed convention for global phase.

Mixed states are represented by points inside the Bloch sphere, but are not included in this
visualization.
