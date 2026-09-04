# Electromagnetic Fields and Energy Flow in a Circuit

## Fields, not electrons, carry energy

It is misleading to picture circuit energy transfer as electrons traveling through a wire from
the source and carrying energy all the way to the load. Electrons in a conductor carry current and
exchange energy with the electromagnetic field, but **energy transfer from the source to the load
is itself described as a flow of electromagnetic-field energy**.

The flux density of that energy flow is the Poynting vector

$$
\mathbf S(\mathbf r,t)
=
\mathbf E(\mathbf r,t)\times\mathbf H(\mathbf r,t).
$$

Crucially, $\mathbf S$ exists not only inside a wire but also **in the space around the wires**. In
a DC circuit containing a resistor, for example, the Poynting flow formed by the surrounding
electric and magnetic fields points into the resistor, where electromagnetic-field energy is
converted into heat.

Thus, the circuit-level statement that a source supplies power to a load has the following local
field description:

> **The electromagnetic field transports energy through space and into the load.**

## Poynting's theorem

The local energy balance between the electromagnetic field and matter is given by Poynting's
theorem,

$$
\frac{\partial u_{\mathrm{em}}}{\partial t}
+
\nabla\cdot\mathbf S
=
-\mathbf J\cdot\mathbf E,
$$

$$
u_{\mathrm{em}}
=
\frac{1}{2}\epsilon_0|\mathbf E|^2
+
\frac{1}{2}\mu_0|\mathbf H|^2.
$$

Where $\mathbf J\cdot\mathbf E>0$, the electromagnetic field transfers energy to matter. In a
resistor, this energy is dissipated as Joule heat. It has been transported from the source through
the surrounding electromagnetic field and enters the resistor as Poynting flow.

In a DC circuit, the electric and magnetic fields are stationary, so $\mathbf S$ also points
steadily toward the load.

In a purely resistive AC circuit, voltage and current—and consequently $\mathbf E$ and
$\mathbf H$—reverse together every half-cycle. Therefore the direction of

$$
\mathbf E\times\mathbf H
$$

does not reverse, and the instantaneous power

$$
p_R(t)=v(t)i(t)=R\,i^2(t)
$$

is always nonnegative.

An ideal inductor or capacitor, in contrast, temporarily stores electromagnetic energy and later
returns it to the circuit. Its instantaneous power therefore changes sign, and the Poynting flow
reverses during part of the cycle. Ideally, the cycle average of this exchanged energy is zero.

## Visualization

<iframe src="app/index.html?lang=en" title="Electromagnetic energy flow around a DC or AC series circuit" data-auto-height scrolling="no" style="display: block; width: 100%; height: 1480px; min-height: 760px; border: 0; overflow: hidden;" loading="eager"></iframe>

## Things to try

1. Keep **DC** selected and vary the resistance or source voltage. Compare the Poynting vector with
   the resistor's terminal power. The energy can be seen entering the resistor from the surrounding
   electromagnetic field, rather than being carried along the wire by electrons.

2. Drag a white curve handle or a component to change the circuit shape. Changing the geometry
   invalidates the existing field, so press **Recompute fields** after settling on a new layout.

3. Keep a resistor connected, switch to **AC**, pause the animation, and move through one complete
   cycle. Although $\mathbf E$ and $\mathbf H$ each reverse, they reverse together, so the direction
   of $\mathbf E\times\mathbf H$ does not change and energy always enters the resistor.

4. Add an inductor or capacitor. Energy enters the element during some phases and returns from the
   element to the field or source during others. Compare the sign of instantaneous power with the
   Poynting-flow direction to see this exchange of energy in a reactive element.

5. Switch among potential, electric field, magnetic field, and electromagnetic energy density.

## Quasistatic circuit model

This visualization treats the circuit as a series connection of ideal lumped elements. In AC mode,
the voltage slider specifies the peak source voltage, and the element impedances are

$$
Z_R=R,
\qquad
Z_L=i\omega L,
\qquad
Z_C=\frac{1}{i\omega C}.
$$

The circuit current is obtained from

$$
\widetilde I
=
\frac{\widetilde V}{\sum_k Z_k}.
$$

The surrounding electric field is constructed from Laplace-equation basis solutions
$\Phi_n(\mathbf r)$ computed in advance for each conductor node. Given complex node voltages
$\widetilde V_n$,

$$
\widetilde\phi(\mathbf r)
=
\sum_n \widetilde V_n\Phi_n(\mathbf r),
$$

$$
\widetilde{\mathbf E}
=
-\nabla\widetilde\phi.
$$

The drawn current path is approximated as a thin wire, and its magnetic field is computed from a
softened Biot–Savart law. In this two-dimensional model, the magnetic field is principally normal
to the screen, so its cross product with the in-plane electric field gives an in-plane energy flow.

In AC mode, the visualization shows the **instantaneous Poynting vector**, not its time average. It
reconstructs the real electric and magnetic fields at the selected phase and evaluates

$$
\mathbf S(\mathbf r,t)
=
\operatorname{Re}
\left[
\widetilde{\mathbf E}(\mathbf r)e^{i\omega t}
\right]
\times
\operatorname{Re}
\left[
\widetilde{\mathbf H}(\mathbf r)e^{i\omega t}
\right].
$$

The reversal of energy flow around an inductor or capacitor therefore remains visible.

## What can be learned

- Energy transport in a circuit is not confined to the interior of its wires. Electromagnetic
  energy is also distributed around the wires and flows into a load as described by the Poynting
  vector.
- With a purely resistive load, energy is always transferred to the resistor in both DC and AC.
- In ideal inductors and capacitors, energy moves back and forth between the element and the
  electromagnetic field, periodically reversing the directions of power and Poynting flow.
- Circuit theory in terms of voltage and current, and field theory in terms of $\mathbf E$,
  $\mathbf H$, and $\mathbf S$, describe the same energy transfer at different levels rather than
  different physical processes.

Around each load, the application integrates the displayed two-dimensional Poynting flux and
compares its sign with the element's instantaneous power. This comparison checks consistency of
the energy-flow direction; it is not intended to establish precise agreement of absolute values.

## Model limitations

This is a low-frequency, two-dimensional, thin-wire, quasistatic concept model.

It does not include three-dimensional component geometry, finite propagation speed, radiation,
skin effect, dielectric structure, parasitic capacitance, or parasitic inductance. It treats $R$,
$L$, and $C$ as ideal lumped elements.

At exact resonance in a lossless series $LC$ circuit, the ideal circuit model predicts a divergent
current amplitude, so the field is left undefined.

## References

- R. P. Feynman, R. B. Leighton, and M. Sands,
  [*The Feynman Lectures on Physics, Vol. II, Chapter 27: Field Energy and Field Momentum*](https://www.feynmanlectures.caltech.edu/II_27.html)
- Veritasium, [*The Biggest Misconception About Electricity*](https://www.youtube.com/watch?v=bHIhgxav9LY)
- Veritasium, [*How Electricity Actually Works*](https://www.youtube.com/watch?v=oI_X2cMHNe0)
