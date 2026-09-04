# Bloch Sphere

## One qubit as a direction

After removing an unobservable global phase, every pure qubit state can be written

$$
|\psi\rangle
=
\cos\frac{\theta}{2}|0\rangle
+e^{i\phi}\sin\frac{\theta}{2}|1\rangle.
$$

The pair $(\theta,\phi)$ specifies a point on the unit sphere. Its Cartesian coordinates are the
expectation values of the Pauli operators,

$$
\mathbf r
=
(\langle X\rangle,\langle Y\rangle,\langle Z\rangle)
=
(\sin\theta\cos\phi,\sin\theta\sin\phi,\cos\theta).
$$

## Visualization

<iframe src="app/index.html?lang=en" title="Bloch sphere state, superposition, and quantum-gate explorer" data-auto-height scrolling="no" style="display: block; width: 100%; height: 2550px; min-height: 1000px; border: 0; overflow: hidden;" loading="eager"></iframe>

## Things to try

1. In the first panel, select the same state through the $X$, $Y$, and $Z$ bases and compare its
   Bloch vector.
2. In the second panel, vary the relative phase $\delta$. Notice that kets—not Bloch vectors—are
   added before normalization. Opposite kets can cancel to the zero vector.
3. In the third panel, apply the Pauli, Hadamard, $S$, and $T$ gates. Drag the progress slider to
   see each unitary operation as a rotation.

## What to notice

Pure states always remain on the unit sphere. The north and south poles are $|0\rangle$ and
$|1\rangle$; equatorial states have equal computational-basis probabilities and differ by relative
phase. A single-qubit unitary preserves normalization and acts as a rotation of the Bloch vector.

## Conventions and limitations

The visualization shows pure single-qubit states only. Global phase is fixed when displaying a
ket, because states that differ only by a global phase represent the same physical state. Mixed
states, which lie inside the Bloch ball, are not included.

## Reference

- M. A. Nielsen and I. L. Chuang, *Quantum Computation and Quantum Information*, 10th anniversary
  ed., Section 1.2.
