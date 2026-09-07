# Hydrogen Wavefunction

The hydrogen atom is a canonical quantum-mechanical system whose wavefunctions can be found analytically. Its energy eigenstates exhibit radial and angular nodes as well as a complex phase that varies across space.

This visualization represents the local complex phase of the wavefunction by hue and its probability density by the placement and brightness of a point cloud. By superposing hydrogen eigenstates within the degenerate $n=2$ subspace, it can also construct linear combinations with the same shapes as the $sp$, $sp^2$, and $sp^3$ hybrid orbitals used in chemistry.

For time evolution, the visualization removes the unobservable common dynamical phase and displays only the relative phases between components. Thus, for a single energy eigenstate, both hue and probability density remain stationary. In a coherent superposition of states with different energies, however, the relative phases change with time, causing the interference pattern and the probability density itself to evolve.

## Visualization

<iframe src="app/index.html?lang=en" title="Three-dimensional hydrogen wavefunction time evolution and hybrid-orbital builder" data-auto-height scrolling="no" style="display: block; width: 100%; height: 2000px; min-height: 1200px; border: 0; overflow: hidden;" loading="eager"></iframe>


## Hydrogen energy eigenstates

The bound states of the nonrelativistic Coulomb Hamiltonian without external fields separate into radial and angular factors in spherical coordinates.

$$
\psi_{n\ell m}(r,\theta,\phi)
=
R_{n\ell}(r)Y_\ell^m(\theta,\phi),
\qquad
E_n=-\frac{E_{\mathrm h}}{2n^2}.
$$

Here $E_{\mathrm h}$ is the Hartree energy.

$$
\rho=\frac{2r}{na_0}
$$

Then the radial wavefunction is

$$
R_{n\ell}(r)
=
\left(\frac{2}{na_0}\right)^{3/2}
\sqrt{\frac{(n-\ell-1)!}{2n(n+\ell)!}}
e^{-\rho/2}\rho^\ell
L_{n-\ell-1}^{2\ell+1}(\rho)
$$

where $a_0$ is the Bohr radius and $L_k^\alpha$ is an associated Laguerre polynomial.

For the angular factor, we use complex spherical harmonics $Y_\ell^m$ with the Condon--Shortley phase convention, normalized so that

$$
\int |Y_\ell^m(\theta,\phi)|^2\,d\Omega=1
$$

The visualization consistently constructs states in the complex spherical-harmonic basis $Y_\ell^m$. The real-valued $p_x$ and $p_y$ orbitals convenient for representing hybrid orbitals are formed from the $m=\pm1$ states as

$$
|2p_x\rangle
=
\frac{1}{\sqrt2}
\left(
|2,1,1\rangle-|2,1,-1\rangle
\right),
$$

$$
|2p_y\rangle
=
-\frac{i}{\sqrt2}
\left(
|2,1,1\rangle+|2,1,-1\rangle
\right)
$$

The overall signs and phases in these expressions depend on convention, but they do not affect physical quantities such as the probability density.


## Coherent time evolution

Consider the normalized superposition

$$
\Psi(\mathbf r,0)
=
\sum_j c_j
\psi_{n_j\ell_jm_j}(\mathbf r),
\qquad
\sum_j |c_j|^2=1
$$

Under the field-free Coulomb Hamiltonian, each energy eigenstate evolves as

$$
\Psi(\mathbf r,t)
=
\sum_j
c_j
e^{-iE_{n_j}t/\hbar}
\psi_{n_j\ell_jm_j}(\mathbf r)
$$

with time. Adding the same constant to every energy only multiplies the entire wavefunction by a common time-dependent phase and cannot change any observable. The visualization therefore displays the physically equivalent representative

$$
\widetilde\Psi(\mathbf r,t)
=
\sum_j
c_j
e^{-i(E_{n_j}-E_{\mathrm{ref}})t/\hbar}
\psi_{n_j\ell_jm_j}(\mathbf r),
\qquad
E_{\mathrm{ref}}=\min_{j:\,c_j\ne0} E_{n_j},
$$

where the minimum is taken over components whose coefficient $c_j$ is nonzero. This convention fixes the dynamical phase of the lowest-energy component while preserving all relative phases and observables.

When every component has the same principal quantum number $n$, their energies are equal in the ideal Coulomb potential, so exact time evolution only multiplies the entire state by a common phase factor. Because the visualization removes this common phase, both the displayed phase pattern and the probability density are independent of time.

$$
|\widetilde\Psi(\mathbf r,t)|^2
=
|\Psi(\mathbf r,t)|^2.
$$

When components with different principal quantum numbers are superposed, their energy differences cause the relative phases to evolve. The interference terms, and consequently the probability density, then change with time.

For example, for an equal-amplitude superposition of $1s$ and $2s$,

$$
|E_2-E_1|
=
\frac{3}{8}E_{\mathrm h}
$$

and the period over which the relative phase advances by $2\pi$ is

$$
T_{12}
=
\frac{2\pi\hbar}{|E_2-E_1|}
=
\frac{16\pi}{3}\,t_{\mathrm a}
$$

where

$$
t_{\mathrm a}
=
\frac{\hbar}{E_{\mathrm h}}
$$

is the atomic unit of time.


## Hybrid orbitals

Each hybrid-orbital preset displays one representative normalized state from the corresponding family.

$$
\begin{aligned}
|sp\rangle
&=
\frac{1}{\sqrt2}
\left(
|2s\rangle+|2p_z\rangle
\right),
\\[4pt]
|sp^2\rangle
&=
\frac{1}{\sqrt3}|2s\rangle
+
\sqrt{\frac23}|2p_x\rangle,
\\[4pt]
|sp^3\rangle
&=
\frac12
\left(
|2s\rangle
+|2p_x\rangle
+|2p_y\rangle
+|2p_z\rangle
\right).
\end{aligned}
$$

The displayed state corresponds to one direction in each of the $sp$, $sp^2$, and $sp^3$ hybrid-orbital families. For $sp^3$, for example, choosing linear combinations with different signs produces equivalent states directed along the four directions of a regular tetrahedron.

The term hybrid orbital here does not introduce new energy levels into the hydrogen atom. In the ideal nonrelativistic Coulomb problem, all $n=2$ states, including $2s$ and $2p$, are degenerate. These hybrid orbitals can therefore be regarded as a new choice of basis within the degenerate $n=2$ subspace.

Hybrid orbitals in chemistry are expressed by analogous linear combinations, but real many-electron atoms and molecules also contain electron–electron interactions and surrounding nuclei, so their physical setting differs from the isolated hydrogenic Coulomb problem considered here.

Because every $n=2$ component has the same energy, the phase pattern and probability density of these hybrid orbitals are both stationary once the common dynamical phase is removed.


## Suggested explorations

1. **Stationarity of the $1s$ state**

   Select $1s$ and press **Play**. Confirm that both the spherical probability density and its phase color remain fixed. A single energy eigenstate has no relative dynamical phase to display.

2. **Shapes of hybrid orbitals**

   Compare the $sp$, $sp^2$, and $sp^3$ presets. Rotate the view and observe how interference between the $2s$ and $2p$ components forms a large lobe in one direction.

3. **The $1s+2s$ quantum beat**

   Select the $1s+2s$ beat. Observe the probability density changing periodically between inner and outer radial regions, and compare the three-dimensional point cloud with the radial probability distribution $P(r,t)$.

4. **Reversing a hybrid orbital with relative phase**

   Load the $sp$ preset and change the relative phase of its $2p_z$ component from $0^\circ$ to $180^\circ$. The sides on which $2s$ and $2p_z$ interfere constructively and destructively are exchanged, reversing the direction of the large lobe.

5. **Azimuthal phase of the $m=1$ state**

   Return to the default $2p$, $m=1$ state. Confirm that the hue changes once around the $z$ axis, revealing the winding of the azimuthal phase. This spatial phase structure remains visible and stationary after the common dynamical phase is removed.


## Phase and radial probability distribution

For a single isolated energy eigenstate, the overall phase produced by time evolution is not observable. Its rotation rate also depends on the arbitrary choice of energy zero. This visualization removes such a spatially uniform phase rotation.

By contrast, a state with a complex spherical harmonic and $m\neq0$ has a nontrivial phase structure in space itself. Unlike an overall phase, this azimuthal phase gradient is connected to probability current and orbital angular momentum.

The probability density changes with time when the relative phases of components with different energies evolve and thereby change their interference terms.

Define the angle-integrated radial probability density by

$$
P(r,t)
=
r^2
\int
|\Psi(r,\theta,\phi,t)|^2\,d\Omega
$$

Then the probability of finding the particle between radii $r$ and $r+dr$ is

$$
P(r,t)\,dr
$$

Interference terms between angular channels with different $(\ell,m)$ vanish after angular integration because of the orthogonality of the spherical harmonics. Interference terms between states with the same $(\ell,m)$ but different radial wavefunctions remain in $P(r,t)$.

This is why the superposition of $1s$ and $2s$, which share the same angular dependence $\ell=m=0$, produces a particularly clear time dependence in the radial probability distribution.


## Units and model

Distances are expressed in Bohr radii $a_0$, energies in Hartree energy $E_{\mathrm h}$, and times in the atomic unit

$$
t_{\mathrm a}
=
\frac{\hbar}{E_{\mathrm h}}
\simeq
24.19\,\mathrm{as}
$$

The complex-phase display uses the lowest energy among the selected components as its reference. Changing this reference multiplies the entire displayed wavefunction by a spatially uniform phase but leaves the probability density and relative phases between components unchanged.

The model uses a nonrelativistic Coulomb Hamiltonian without spin and treats the nucleus as a fixed point charge. It omits fine structure, the Lamb shift, external fields, interactions between the electron and its environment, and the reduced-mass correction due to the finite nuclear mass.

Introducing the reduced mass into a pure Coulomb interaction preserves the degeneracy with respect to quantum numbers other than $n$. Fine structure, the Lamb shift, and external fields, however, generally lift the ideal $n=2$ degeneracy.

The point cloud consists of numerical samples used to display the wavefunction; it does not represent a collection of many electrons. Point positions are sampled from a mixture of the probability densities of the basis components, while point brightness represents the probability density of the coherent superposition at that time.


<!-- ## References

- D. J. Griffiths and D. F. Schroeter, *Introduction to Quantum Mechanics*, 3rd ed., Chapter 4.
- C. Cohen-Tannoudji, B. Diu, and F. Laloë, *Quantum Mechanics*, Volume 1. -->
