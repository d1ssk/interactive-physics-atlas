# Electromagnetic Energy Flow Around a Circuit

## Physical idea

Circuit diagrams describe energy transfer through voltages, currents, and element powers. The
corresponding field description is local: electromagnetic energy crosses the space around the
wires and enters a load. Its flux density is the Poynting vector

$$
\mathbf S(\mathbf r,t)=\mathbf E(\mathbf r,t)\times\mathbf H(\mathbf r,t).
$$

For a DC resistor, both fields are stationary and $\mathbf S$ continuously points into the
resistor. In AC circuits, electric and magnetic fields vary with phase. Ideal inductors and
capacitors can return previously stored energy, so the instantaneous flow can reverse even when
the cycle-averaged real power remains nonnegative.

The local balance law is Poynting's theorem,

$$
\frac{\partial u_{\mathrm{em}}}{\partial t}
+\nabla\!\cdot\!\mathbf S
=-\mathbf J\!\cdot\!\mathbf E,
\qquad
u_{\mathrm{em}}=\frac{1}{2}\epsilon_0|\mathbf E|^2
+\frac{1}{2}\mu_0|\mathbf H|^2.
$$

A positive inward flux at a load is therefore consistent with positive instantaneous power
delivered to that element.

## Quasistatic circuit model

The load elements are ideal and connected in series. In AC mode the voltage slider specifies the
peak source voltage, with

$$
Z_R=R,
\qquad
Z_L=i\omega L,
\qquad
Z_C=\frac{1}{i\omega C},
\qquad
\widetilde I=\frac{\widetilde V}{\sum_k Z_k}.
$$

For each conductor node, the application first solves a unit-potential Laplace basis field
$\Phi_n(\mathbf r)$. Complex node voltages then give

$$
\widetilde\phi(\mathbf r)=\sum_n\widetilde V_n\Phi_n(\mathbf r),
\qquad
\widetilde{\mathbf E}=-\nabla\widetilde\phi.
$$

The out-of-plane magnetic field is computed from a softened thin-wire Biot–Savart sum along the
drawn current path. The displayed instantaneous vector is formed only after reconstructing both
real fields at the selected phase:

$$
\mathbf S(\mathbf r,t)
=\operatorname{Re}\!\left[\widetilde{\mathbf E}(\mathbf r)e^{i\omega t}\right]
\times
\operatorname{Re}\!\left[\widetilde{\mathbf H}(\mathbf r)e^{i\omega t}\right].
$$

This is not the complex time-averaged Poynting vector; it retains the within-cycle reversal of
reactive energy flow.

## Visualization

<iframe src="app/index.html?lang=en" title="Electromagnetic energy flow around a DC or AC series circuit" data-auto-height scrolling="no" style="display: block; width: 100%; height: 1480px; min-height: 760px; border: 0; overflow: hidden;" loading="eager"></iframe>

## Things to try

1. Keep **DC** selected and vary the resistance and voltage. Compare the field arrows with the
   terminal power. The flow should enter the resistor from the surrounding field.
2. Drag a white curve handle or a component. The old field is deliberately invalidated; press
   **Recompute fields** after finishing the new geometry.
3. Select **AC** with a resistor, pause the animation, and move through a full cycle. Voltage and
   current reverse together, so the instantaneous Poynting flow into the resistor does not reverse.
4. Add an inductor or capacitor. Watch for phases in which a reactive element's instantaneous
   power and local inward flux become negative, indicating energy returned to the field or source.
5. Compare potential, electric-field, magnetic-field, and energy-density layers. These are
   different views of the same circuit state, not independent solutions.

## What to notice

- Energy delivery is not represented as energy drifting only inside the wire. The Poynting vector
  generally occupies the space around the circuit and converges on a dissipative element.
- With a purely resistive AC load, reversing both $\mathbf E$ and $\mathbf H$ leaves
  $\mathbf E\times\mathbf H$ directed into the resistor.
- For ideal reactive elements, instantaneous element power changes sign while its cycle average is
  zero. A resistor's instantaneous power remains nonnegative.
- The field audit compares only signs: it integrates the displayed two-dimensional Poynting flux
  around each load and checks it against the sign of that element's instantaneous power.

## Conventions and limitations

This is a low-frequency, two-dimensional, thin-wire, quasistatic concept model. Coordinates and
field magnitudes are normalized, so the displayed flux is not an absolute measurement in
$\mathrm{W\,m^{-2}}$. The finite computational boundary, softened wire field, and coarse numerical
grid affect local details.

The model does not include three-dimensional component geometry, propagation delay, radiation,
skin effect, dielectric structure, or geometry-dependent parasitic impedance. It treats $R$, $L$,
and $C$ as ideal lumped elements. At exact undamped series $LC$ resonance, the ideal model predicts
unbounded current and the field is therefore left undefined.

## References

- D. J. Griffiths, *Introduction to Electrodynamics*, sections on electromagnetic energy and
  Poynting's theorem.
- R. P. Feynman, R. B. Leighton, and M. Sands, *The Feynman Lectures on Physics*, Vol. II,
  chapters 27 and 28.
