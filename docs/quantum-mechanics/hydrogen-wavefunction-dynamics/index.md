# Hydrogen Wavefunction

## Interactive visualization

<iframe src="app/index.html?lang=en" title="Three-dimensional hydrogen wavefunction time evolution and hybrid-orbital builder" data-auto-height scrolling="no" style="display: block; width: 100%; height: 2000px; min-height: 1200px; border: 0; overflow: hidden;" loading="eager"></iframe>

## Physical idea

Hydrogen provides exact three-dimensional wavefunctions whose radial nodes, angular nodes,
probability density, and complex phase can be inspected directly. This visualization uses hue for
the local phase of the wavefunction, while point placement and brightness show probability
density. It also lets you combine basis states and construct the familiar $sp$, $sp^2$, and $sp^3$
hybrids within the degenerate $n=2$ hydrogen subspace.

Time evolution provides a second view of the same wavefunctions. An energy eigenstate has
stationary probability density even though its complex phase evolves. In a coherent
superposition, components with different energies accumulate different phases, so their
interference pattern can change in time.

## Hydrogen basis states

For the nonrelativistic Coulomb Hamiltonian without external fields, the bound-state
wavefunctions separate in spherical coordinates:

$$
\psi_{n\ell m}(r,\theta,\phi)
=R_{n\ell}(r)Y_\ell^m(\theta,\phi),
\qquad
E_n=-\frac{E_{\mathrm h}}{2n^2}.
$$

Here $E_{\mathrm h}$ is the Hartree energy. With $ho=2r/(na_0)$, the radial convention used in
the application is

$$
R_{n\ell}(r)
=\left(\frac{2}{na_0}\right)^{3/2}
\sqrt{\frac{(n-\ell-1)!}{2n(n+\ell)!}}
e^{-\rho/2}\rho^\ell
L_{n-\ell-1}^{2\ell+1}(\rho).
$$

The complex spherical harmonics include the Condon--Shortley phase and obey

$$
\int |Y_\ell^m(\theta,\phi)|^2\,d\Omega=1.
$$

The state builder uses the complex $Y_\ell^m$ basis throughout. Directional $p_x$ and $p_y$
orbitals used by the hybrid presets are assembled as

$$
|2p_x\rangle=\frac{1}{\sqrt2}
\left(|2,1,1\rangle-|2,1,-1\rangle\right),
\qquad
|2p_y\rangle=-\frac{i}{\sqrt2}
\left(|2,1,1\rangle+|2,1,-1\rangle\right).
$$

## Coherent time evolution

The state builder forms a normalized superposition

$$
\Psi(\mathbf r,0)=\sum_j c_j\psi_{n_j\ell_jm_j}(\mathbf r),
\qquad
\sum_j|c_j|^2=1,
$$

and evolves each component exactly under the field-free Hamiltonian:

$$
\Psi(\mathbf r,t)
=\sum_j c_j e^{-iE_{n_j}t/\hbar}
\psi_{n_j\ell_jm_j}(\mathbf r).
$$

If every component has the same principal quantum number, every term has the same energy. The
whole state then acquires only one global phase, and $|\Psi(\mathbf r,t)|^2$ remains fixed. If
different principal quantum numbers are present, relative phases evolve and the density can move.

For the equal $1s+2s$ superposition, the energy gap and beat period in atomic units are

$$
|E_2-E_1|=\frac{3}{8}E_{\mathrm h},
\qquad
T_{12}=\frac{2\pi\hbar}{|E_2-E_1|}
=\frac{16\pi}{3}\,t_{\mathrm a}.
$$

## Hybrid orbitals

The hybrid presets show one representative normalized orbital from each familiar family:

$$
\begin{aligned}
|sp\rangle&=\frac{1}{\sqrt2}\left(|2s\rangle+|2p_z\rangle\right),\\
|sp^2\rangle&=\frac{1}{\sqrt3}|2s\rangle+\sqrt{\frac23}|2p_x\rangle,\\
|sp^3\rangle&=\frac12\left(|2s\rangle+|2p_x\rangle+|2p_y\rangle+|2p_z\rangle\right).
\end{aligned}
$$

These are not additional eigenstates of hydrogen. They are basis choices within the $n=2$
subspace. In the ideal Coulomb problem that subspace is degenerate, so these hybrid densities are
stationary even though their displayed phase color changes.

## Suggested explorations

1. Select $1s$ and press **Play**. The spherical density remains fixed while its phase color cycles.
2. Compare the $sp$, $sp^2$, and $sp^3$ presets. Rotate the view and identify the enhanced lobe
   produced by constructive interference between $2s$ and $2p$ components.
3. Select the $1s+2s$ beat. Watch probability move between inner and outer radial regions, and
   compare the three-dimensional cloud with the radial probability $P(r,t)$.
4. Load the $sp$ preset and change the relative phase of the $2p_z$ component from $0^\circ$ to
   $180^\circ$. The enhanced lobe reverses direction as constructive and destructive interference
   exchange sides.
5. Return to the default $2p$, $m=1$ state. Its azimuthal phase winding is visible as a cycle of
   hue around the $z$ axis; pressing **Play** advances its common phase without changing density.

## What to notice

The phase of one isolated eigenstate is not visible in its probability density. The color cycle
therefore does not mean that the orbital shape is rotating. Observable density motion requires
relative phase evolution between components that can interfere.

The angle-integrated radial probability is

$$
P(r,t)=r^2\int |\Psi(r,\theta,\phi,t)|^2\,d\Omega.
$$

Interference between different angular channels vanishes in this angular integral, whereas states
with the same angular dependence but different radial functions can produce a time-dependent
$P(r,t)$. This is why the $1s+2s$ preset changes the radial chart particularly clearly.

## Conventions and limitations

Distances are measured in Bohr radii $a_0$, energies in Hartree, and time in atomic units
$t_{\mathrm a}=\hbar/E_{\mathrm h}\simeq24.19\,\mathrm{as}$. The model includes only the
nonrelativistic, spinless Coulomb Hamiltonian. It omits fine structure, the Lamb shift, external
fields, nuclear motion, and environmental interactions; those effects can remove the degeneracy
used by the hybrid presets.

The point cloud is a numerical representation, not a collection of electrons. Positions are drawn
from a mixture of component densities and brightness is corrected by the instantaneous coherent
density divided by that proposal density. A finite point count and finite radial cutoff introduce
sampling noise and omit exponentially small tails. Hue represents phase only where the amplitude
is nonzero; phase at a node is undefined.

## References

- D. J. Griffiths and D. F. Schroeter, *Introduction to Quantum Mechanics*, 3rd ed., Chapter 4.
- C. Cohen-Tannoudji, B. Diu, and F. Laloë, *Quantum Mechanics*, Volume 1.
