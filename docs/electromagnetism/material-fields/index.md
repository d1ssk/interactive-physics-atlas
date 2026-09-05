# Electric and Magnetic Response of Materials

<div class="center-material-tables"></div>

## How materials respond to external fields

Applying an external electric or magnetic field rearranges microscopic degrees of freedom within
a material. The resulting response also changes the surrounding field distribution. At material
boundaries, the direction and strength of the electric or magnetic field change, causing the field
to concentrate in or be excluded from the material.

This visualization solves a static two-dimensional boundary-value problem for objects whose
position, size, orientation, and hollow structure can be changed, and displays how the materials
alter the electric or magnetic field.

## Conductors and dielectrics

Free charges in a conductor move in response to an external electric field. They redistribute so
as to cancel the field inside the conductor. In electrostatic equilibrium, the entire conductor is
therefore equipotential and

$$
\mathbf E = \mathbf 0
$$

holds within it.

Positive and negative surface charges are induced even on a neutral isolated conductor, while its
total free charge remains zero. If a cavity contains no charge, a hollow conductor also shields its
interior from an external electrostatic field.

Charges in a dielectric, by contrast, are bound and cannot move freely through the material. In
an atom, the electron cloud and nucleus can instead shift slightly relative to one another; in a
molecule with a permanent dipole, the dipoles can partially align. The electric dipole moment per
unit volume is called the polarization $\mathbf P$.

For a linear isotropic medium,

$$
\mathbf P = \epsilon_0 \chi_e \mathbf E,
\qquad
\mathbf D = \epsilon_0 \mathbf E + \mathbf P
= \epsilon_0 \epsilon_r \mathbf E,
\qquad
\epsilon_r = 1 + \chi_e.
$$

Within a uniform medium, the contributions from neighboring microscopic dipoles cancel one
another. At the material surface, however, polarization produces the surface charge

$$
\sigma_b = \mathbf P \cdot \hat{\mathbf n}
$$

known as bound surface charge, or polarization surface charge. The electric field produced by
this charge usually acts to reduce the field inside the dielectric.

For a dielectric, the visualization uses color to show this bound surface-charge density. For a
conductor, it instead shows the free surface-charge density.

Representative room-temperature, low-frequency relative permittivities are listed below. These
values are approximate because permittivity depends on frequency, temperature, composition,
crystal orientation, moisture, and other factors.

| Material | Typical $\epsilon_r$ |
|---|---:|
| Vacuum | $1$ |
| Dry air | $1.0006$ |
| PTFE | $2.0$–$2.1$ |
| Paper | $2$–$4$ |
| Common glass | $4$–$10$ |
| Silicon | $11.7$ |
| Liquid water near $25\,{}^\circ\mathrm{C}$ (low frequency) | about $78$ |

## Magnetization and permeability

Electron orbital motion and spin give rise to microscopic magnetic moments. In response to an
external magnetic field, a moment opposite to the applied field is induced in a diamagnet, while
pre-existing moments partially align in a paramagnet. A ferromagnet contains domains with
spontaneous magnetization; an external field can move domain walls and rotate their magnetization.

The magnetic moment per unit volume, averaged over many atoms, is called the magnetization
$\mathbf M$. In the linear isotropic approximation,

$$
\mathbf M = \chi_m \mathbf H,
\qquad
\mathbf B = \mu_0(\mathbf H + \mathbf M)
= \mu_0 \mu_r \mathbf H,
\qquad
\mu_r = 1 + \chi_m.
$$

The effect of magnetization can be represented using the surface-pole density

$$
\sigma_m = \mathbf M \cdot \hat{\mathbf n}
$$

This is a convenient mathematical representation of the magnetic field produced by
magnetization; it does not imply that magnetic monopoles exist.

The same magnetization can equivalently be represented by the bound current flowing over the
material surface,

$$
\mathbf K_b = \mathbf M \times \hat{\mathbf n}
$$

The visualization colors $\sigma_m$ to indicate where the material has a strong magnetic
response.

Representative weak-field relative permeabilities are listed below. In particular, the
permeability of a ferromagnet is not a fixed material constant: it can vary greatly with field
strength, frequency, composition, heat treatment, magnetic history, and other factors.

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

1. In **Electric field** mode, compare a neutral conductor with dielectrics having larger
   $\epsilon_r$. Turn on **Induced field only** to view the uniform external field separately from
   the field induced by the material.

2. Make the conductor hollow and compare the electric field in its cavity with that of a hollow
   dielectric.

3. Switch to **Magnetic field** mode and compare $\mu_r<1$, $\mu_r=1$, and $\mu_r\gg1$. Observe
   whether magnetic flux avoids the object or concentrates inside it.

4. Make a high-permeability object hollow and vary its wall thickness to examine magnetic
   shielding in this two-dimensional model.

5. Place two objects close together and observe how the field produced by each changes the charge
   or magnetization induced on their surfaces.

## What to notice

- A conductor redistributes free surface charge to cancel the electrostatic field inside it. In an
  ordinary dielectric, polarization weakens and changes the direction of the internal field but
  generally does not cancel it completely.

- The surface response is largest where the boundary normal is closely aligned with the local
  polarization $\mathbf P$ or magnetization $\mathbf M$.

- A material with large $\mu_r$ concentrates magnetic flux within itself. Magnetic shielding by a
  high-permeability shell differs from electrostatic shielding, in which a conductor cancels the
  internal electric field by redistributing free charge: the shell weakens the field in its cavity
  by guiding magnetic flux around it.

## Computational model and assumptions

In electric mode, the application solves for the electric potential $\phi$ using

$$
\nabla\cdot(\epsilon\nabla\phi)=0,
\qquad
\mathbf E=-\nabla\phi
$$

The interior of each perfect conductor is constrained to one unknown constant potential. For a
neutral isolated conductor, the total electric flux through its surface is constrained to zero.

In magnetic mode without free current, the application uses a magnetic scalar potential $\psi$
and solves

$$
\nabla\cdot(\mu\nabla\psi)=0,
\qquad
\mathbf H=-\nabla\psi,
\qquad
\mathbf B=\mu\mathbf H
$$

The numerical domain extends beyond the displayed region. On its outer boundary, the application
sets the potential corresponding to the uniform field that would be present without any objects.
The visualization's **Induced field only** quantity subtracts this uniform external field from the
calculated total field. Consequently, at every point,

$$
\text{全場}=\text{外場}+\text{誘導された場}
$$

The object cross-sections are assumed to continue indefinitely perpendicular to the screen, and
the media are assumed to be static, linear, and isotropic. The model does not include dielectric
loss, dispersion, anisotropy, magnetic hysteresis, saturation, eddy currents, or the end effects
of finite three-dimensional objects.

The displayed surface densities are estimated from a numerical solution on a finite grid. They
are intended primarily to show sign and spatial distribution rather than precise quantitative
values.
