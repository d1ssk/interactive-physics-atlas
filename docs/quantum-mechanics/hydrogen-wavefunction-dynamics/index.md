# Hydrogen Wavefunction

## Visualization

<iframe src="app/index.html?lang=en" title="Three-dimensional hydrogen wavefunction time evolution and hybrid-orbital builder" data-auto-height scrolling="no" style="display: block; width: 100%; height: 2000px; min-height: 1200px; border: 0; overflow: hidden;" loading="eager"></iframe>


The hydrogen atom is a canonical quantum-mechanical system whose wavefunctions can be obtained analytically. Its energy eigenstates exhibit radial and angular nodes as well as a complex phase that varies across space.

This visualization represents the local complex phase of the wavefunction by hue, and its probability density by the distribution and brightness of points. By superposing hydrogen eigenstates, it can also construct states corresponding to the $sp$, $sp^2$, and $sp^3$ hybrid orbitals commonly used in chemistry within the degenerate $n=2$ subspace.

Following the time evolution makes the distinction between a changing wavefunction phase and a changing probability density visible. For an energy eigenstate, the overall complex phase advances in time while the probability density remains unchanged. By contrast, when states with different energies are coherently superposed, their relative phases change with time, so the interference pattern and the probability density itself can evolve.


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

With this definition, the radial wavefunction used here is

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

The visualization consistently uses the complex spherical harmonics $Y_\ell^m$ as its state basis. The real-valued $p_x$ and $p_y$ orbitals useful for constructing hybrid orbitals are assembled from linear combinations of the $m=\pm1$ states:

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

The overall signs and phases in these expressions depend on convention, but they do not affect the physical probability density.


## Coherent time evolution

The state builder forms the normalized superposition

$$
\Psi(\mathbf r,0)
=
\sum_j c_j
\psi_{n_j\ell_jm_j}(\mathbf r),
\qquad
\sum_j |c_j|^2=1
$$

and evolves each component exactly under the field-free Coulomb Hamiltonian:

$$
\Psi(\mathbf r,t)
=
\sum_j
c_j
e^{-iE_{n_j}t/\hbar}
\psi_{n_j\ell_jm_j}(\mathbf r).
$$

When every component has the same principal quantum number $n$, their energies are equal in the ideal Coulomb potential, and time evolution multiplies the entire state by one common phase factor. Consequently, the following probability density

$$
|\Psi(\mathbf r,t)|^2
$$

is independent of time.

When components with different principal quantum numbers are superposed, their energy differences instead cause the relative phases to evolve. The interference terms can then change, allowing the probability density to vary with time.

For example, for a $1s+2s$ superposition with equal amplitudes, the energy difference is

$$
|E_2-E_1|
=
\frac{3}{8}E_{\mathrm h}
$$

and the period over which the relative phase makes one complete cycle is

$$
T_{12}
=
\frac{2\pi\hbar}{|E_2-E_1|}
=
\frac{16\pi}{3}\,t_{\mathrm a}
$$

where

$$
t_{\mathrm a}=\frac{\hbar}{E_{\mathrm h}}
$$

is the atomic unit of time.


## Hybrid orbitals

Each hybrid preset displays one normalized state representing its corresponding family of hybrid orbitals.

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

The displayed state represents one direction in each of the $sp$, $sp^2$, and $sp^3$ hybrid-orbital families. For $sp^3$, for example, choosing other linear combinations produces four equivalent hybrid orbitals directed toward the vertices of a regular tetrahedron.

These combinations do not introduce new energy eigenstates of hydrogen. In the ideal Coulomb problem, all $n=2$ states, including $2s$ and $2p$, are degenerate, so the hybrid orbitals can be regarded as a different choice of basis within this degenerate subspace.

Their common phase color therefore changes under time evolution, while the probability density of each hybrid orbital remains stationary.


## Suggested explorations

1. **Time evolution of the $1s$ state**

    Select $1s$ and press **Play**. Confirm that the spherical probability density remains fixed while only the color representing phase cycles with time.

2. **Shapes of hybrid orbitals**

    Compare the $sp$, $sp^2$, and $sp^3$ presets. Rotate the view and look for the large lobe formed by constructive interference between the $2s$ and $2p$ components.

3. **The $1s+2s$ quantum beat**

    Select the $1s+2s$ beat. Observe the probability density changing periodically between inner and outer radial regions, and compare the three-dimensional point cloud with the radial probability distribution $P(r,t)$.

4. **Reversing a hybrid orbital with relative phase**

    Load the $sp$ preset and change the relative phase of its $2p_z$ component from $0^\circ$ to $180^\circ$. The regions of constructive and destructive interference exchange sides, reversing the direction of the large lobe.

5. **Azimuthal phase of the $m=1$ state**

    Return to the default $2p$, $m=1$ state. The change in hue on going once around the $z$ axis reveals the winding of its azimuthal phase. Pressing **Play** advances the common phase of the entire wavefunction without changing its probability density.


## What to notice

For a single isolated energy eigenstate, the overall phase of the wavefunction does not appear in its probability density. A phase color that cycles with time therefore does not mean that the orbital itself is rotating in space.

For the probability density to exhibit actual time dependence, relative phases must generally evolve between interfering components with different energies.

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

Interference terms between angular channels with different $(\ell,m)$ vanish after angular integration because of the orthogonality of the spherical harmonics. Interference between states with the same $(\ell,m)$ but different radial wavefunctions can, however, remain in $P(r,t)$.

This is why the superposition of $1s$ and $2s$, which share the same angular dependence $\ell=m=0$, produces a particularly clear time dependence in the radial probability distribution.


## Conventions and model limitations

Distances are expressed in Bohr radii $a_0$, energies in Hartree energy $E_{\mathrm h}$, and times in the atomic unit

$$
t_{\mathrm a}
=
\frac{\hbar}{E_{\mathrm h}}
\simeq
24.19\,\mathrm{as}
$$

The model uses the nonrelativistic Coulomb Hamiltonian without spin. It omits fine structure, the Lamb shift, external fields, nuclear motion due to finite nuclear mass, and interactions with the environment. Including these effects can lift the ideal $n=2$ degeneracy used here to construct the hybrid orbitals.

The point cloud is a numerical sampling of the wavefunction, not a collection of many electrons. Point positions are sampled from a mixture of the probability densities of the basis components, while point brightness represents the probability density of the coherent superposition at that time.


<!-- ## References

- D. J. Griffiths and D. F. Schroeter, *Introduction to Quantum Mechanics*, 3rd ed., Chapter 4.
- C. Cohen-Tannoudji, B. Diu, and F. Laloë, *Quantum Mechanics*, Volume 1. -->
