# Electric and Magnetic Response of Materials

<div class="center-material-tables"></div>

## How matter changes an applied field

An applied electric or magnetic field rearranges microscopic degrees of freedom in matter. The
response produces an additional field, so boundaries bend field lines and can concentrate or
exclude the field. This visualization solves a two-dimensional static boundary-value problem for
objects that you can move, resize, rotate, or make hollow.

## Conductors and dielectrics

Free electrons in a conductor move under an applied electric field. They accumulate on the
surface until their induced field cancels the field inside the conductor. In electrostatic
equilibrium the conductor is therefore equipotential and

$$
\mathbf E=\mathbf 0
$$

in its material interior. A neutral isolated conductor still develops positive and negative
surface regions, but their total free charge remains zero. A hollow conductor can consequently
shield its cavity from an external static electric field.

Charges in a dielectric are bound rather than free to cross the whole sample. The electron cloud
and nucleus of each atom can shift slightly relative to one another, and permanent molecular
dipoles can partially align. Their dipole moment per unit volume is the polarization
$\mathbf P$. For a linear isotropic material,

$$
\mathbf P=\epsilon_0\chi_e\mathbf E,
\qquad
\mathbf D=\epsilon_0\mathbf E+\mathbf P
=\epsilon_0\epsilon_r\mathbf E,
\qquad
\epsilon_r=1+\chi_e.
$$

Neighboring microscopic dipoles largely cancel in the bulk. At a surface that cancellation ends,
leaving bound surface charge

$$
\sigma_b=\mathbf P\cdot\hat{\mathbf n}.
$$

Its field usually opposes the applied field inside the dielectric. The visualization colors this
induced surface density; a conductor instead shows free surface charge.

Representative low-frequency, room-temperature values are listed below. They are approximate:
permittivity depends on frequency, temperature, composition, crystal direction, and moisture.

| Material | Typical $\epsilon_r$ |
|---|---:|
| Vacuum | $1$ |
| Dry air | $1.0006$ |
| PTFE | $2.0$–$2.1$ |
| Paper | $2$–$4$ |
| Common glass | $4$–$10$ |
| Silicon | $11.7$ |
| Liquid water near $25\,{}^\circ\mathrm C$ (low frequency) | about $78$ |

## Magnetization and permeability

Electron orbital motion and spin provide microscopic magnetic moments. An applied field induces a
small opposing moment in diamagnets, partially aligns pre-existing moments in paramagnets, and can
move domain walls or rotate domains in ferromagnets. Averaged over many atoms, the magnetic moment
per unit volume is the magnetization $\mathbf M$. In the linear isotropic approximation,

$$
\mathbf M=\chi_m\mathbf H,
\qquad
\mathbf B=\mu_0(\mathbf H+\mathbf M)
=\mu_0\mu_r\mathbf H,
\qquad
\mu_r=1+\chi_m.
$$

The normal component of $\mathbf M$ can be represented by an equivalent surface-pole density

$$
\sigma_m=\mathbf M\cdot\hat{\mathbf n}.
$$

This is a useful computational picture, not evidence for magnetic monopoles. Microscopically the
same magnetization can instead be represented by bound currents, including the surface current
$\mathbf K_b=\mathbf M\times\hat{\mathbf n}$. The visualization colors $\sigma_m$ to show where the
material response is induced at a boundary.

Typical weak-field values illustrate the scale, but ferromagnetic permeability is not a material
constant: it changes strongly with field strength, frequency, composition, heat treatment, and
magnetic history.

| Material or class | Typical $\mu_r$ |
|---|---:|
| Vacuum | $1$ |
| Bismuth (diamagnetic) | about $0.99983$ |
| Copper (diamagnetic) | about $0.99999$ |
| Aluminium (paramagnetic) | about $1.00002$ |
| Ferrites | roughly $10$–$10^4$ |
| Soft iron and high-permeability alloys | roughly $10^2$–$10^5$, strongly nonlinear |

## Visualization

<iframe src="app/index.html?lang=en" title="Electric and magnetic response of movable material objects" data-auto-height scrolling="no" style="display: block; width: 100%; height: 1180px; min-height: 780px; border: 0; overflow: hidden;" loading="eager"></iframe>

## Things to try

1. In **Electric field** mode, compare a neutral conductor with dielectrics of increasing
   $\epsilon_r$. Turn on **Induced field only** to separate the material response from the uniform
   applied field.
2. Make the conductor hollow. Compare the field in its cavity with that of a hollow dielectric.
3. Switch to **Magnetic field** mode. Try $\mu_r<1$, $\mu_r=1$, and $\mu_r\gg1$ and watch whether
   magnetic flux avoids or concentrates in the object.
4. Make a high-permeability object hollow and vary its wall thickness to examine magnetic
   shielding in this two-dimensional model.
5. Add two objects and move them close together. Observe how each induced surface distribution is
   changed by the field of the other.

## What to notice

- A conductor cancels the static electric field in its material by redistributing free surface
  charge; an ordinary dielectric only reduces and redirects the field through polarization.
- Surface response is strongest where the boundary normal is most nearly parallel to the local
  polarization or magnetization.
- A large $\mu_r$ draws magnetic flux into the material. A high-permeability shell diverts flux
  around its cavity rather than eliminating magnetic field by a conductor-like free-charge
  rearrangement.

## Model and limitations

For electric mode the application solves

$$
\nabla\cdot(\epsilon\nabla\phi)=0,
\qquad
\mathbf E=-\nabla\phi.
$$

Each perfect conductor is constrained to one unknown potential, with zero total outward electric
flux for a neutral isolated conductor. In magnetic mode, where there is no free current, it solves

$$
\nabla\cdot(\mu\nabla\psi)=0,
\qquad
\mathbf H=-\nabla\psi,
\qquad
\mathbf B=\mu\mathbf H.
$$

The numerical domain extends beyond the displayed window. On every outer edge, the potential is
fixed to that of the unperturbed uniform field. The induced component shown by the application is
the total solution minus that same uniform field, so the applied and induced components add to the
total field point by point. Moving the finite boundary outside the view reduces its influence and
approximates the decay of the material response in an unbounded domain.

The cross-section is taken to continue indefinitely perpendicular to the screen. The media are
static, linear, and isotropic. The model omits dielectric loss, dispersion, anisotropy, hysteresis,
saturation, eddy currents, and finite three-dimensional end effects. Surface densities are sampled
from a finite grid and are intended to show sign and distribution rather than precision values.

## References

- R. P. Feynman, R. B. Leighton, and M. Sands,
  [*The Feynman Lectures on Physics, Vol. II, Chapter 10: Dielectrics*](https://www.feynmanlectures.caltech.edu/II_10.html)
- C. G. Malmberg and A. A. Maryott,
  [*Dielectric Constant of Water from 0° to 100° C*](https://nvlpubs.nist.gov/nistpubs/jres/56/jresv56n1p1_a1b.pdf)
- D. J. Griffiths, *Introduction to Electrodynamics*, 4th ed., Chapters 4 and 6.
