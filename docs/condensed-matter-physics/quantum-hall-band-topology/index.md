# Chern Bands and Bulk–Edge Topology

The integer quantum Hall effect is unusual because a transport coefficient is fixed by a global
property of the occupied quantum states. Locally, a Bloch eigenvector changes smoothly with
crystal momentum. Globally, however, the family of occupied states over the Brillouin zone can be
twisted in a way that no smooth, periodic choice of phase can undo. The integer measuring that
twist is the first Chern number.

This article develops that statement in a two-band Chern-insulator model. Four focused
visualizations are placed where they are useful: the map from the Brillouin torus to the Bloch
sphere, the gap closings that permit a topological transition, the one-dimensional winding of the
SSH model, and the corresponding finite-chain edge states. The SSH model is used as a simpler
one-dimensional analogy; it is not the physical edge Hamiltonian of the two-dimensional model.

## From Bloch states to a map of spaces

Any traceless two-level Bloch Hamiltonian can be written as

$$
H(\mathbf k)=\sum_{a=x,y,z}d_a(\mathbf k)\sigma_a,
\qquad
E_\pm(\mathbf k)=\pm|\mathbf d(\mathbf k)|.
$$

Here $(\sigma_x,\sigma_y,\sigma_z)$ acts on two internal degrees of freedom,
such as orbitals or sublattices. Adding a term proportional to the identity shifts both energies
but does not change the eigenstates, so it is omitted. If $|\mathbf d|$ is nonzero everywhere,
the lower and upper bands are separated by a bulk gap and the occupied-band projector is

$$
P_-(\mathbf k)
=\frac{1-\sum_a\hat d_a(\mathbf k)\sigma_a}{2},
\qquad
\hat{\mathbf d}=\frac{\mathbf d}{|\mathbf d|}.
$$

Crystal momenta differing by a reciprocal-lattice vector are identical. A two-dimensional
Brillouin zone is therefore a torus $T^2$, even when drawn as a square with opposite edges
identified. The normalized vector defines a continuous map

$$
\hat{\mathbf d}:T^2\longrightarrow S^2.
$$

The topology belongs to the projector—or equivalently to the ray represented by the occupied
state—not to an arbitrary phase convention for one eigenvector. This distinction matters because
a nonzero Chern number is precisely the obstruction to choosing one smooth, periodic occupied
eigenvector over the entire torus.

## Berry curvature and the Chern number

In a local gauge, let $|u_-(\mathbf k)\rangle$ be the cell-periodic occupied eigenstate. Its Berry
connection and curvature are

$$
\mathcal A_i(\mathbf k)
=-i\langle u_-(\mathbf k)|\partial_{k_i}u_-(\mathbf k)\rangle,
\qquad
\Omega_-(\mathbf k)
=\partial_{k_x}\mathcal A_y-\partial_{k_y}\mathcal A_x.
$$

The connection changes when $|u_-\rangle$ is multiplied by a momentum-dependent phase, but the
curvature does not. For a two-band Hamiltonian the curvature has a gauge-free geometric form,

$$
\Omega_-(\mathbf k)
=-\frac12\hat{\mathbf d}\cdot
\left(\partial_{k_x}\hat{\mathbf d}\times\partial_{k_y}\hat{\mathbf d}\right).
$$

The scalar triple product is the oriented area density swept out on the Bloch sphere. Integrating
it over the Brillouin torus gives

$$
C=\frac{1}{2\pi}\int_{\mathrm{BZ}}\Omega_-(\mathbf k)\,d^2k
=-\frac{1}{4\pi}\int_{\mathrm{BZ}}
\hat{\mathbf d}\cdot
\left(\partial_{k_x}\hat{\mathbf d}\times\partial_{k_y}\hat{\mathbf d}\right)d^2k
\in\mathbb Z.
$$

Thus $C$ is the oriented covering number of the sphere. Covering the sphere once with opposite
orientation reverses its sign; visiting part of the sphere and retracing it gives zero net degree.
For a completely filled, isolated band of electrons with charge $-e$, the Berry-connection sign
convention above gives the transverse response

$$
\frac{j_y}{E_x}=-C\frac{e^2}{h}.
$$

Equivalently, defining $\sigma_{xy}$ by $j_x=\sigma_{xy}E_y$ gives
$\sigma_{xy}=C e^2/h$. Reversing the sign used to define the Berry connection reverses the
reported $C$ as well. Stating both conventions avoids a purely notational sign disagreement.

## A concrete Chern insulator

The two-dimensional panels use a Qi–Wu–Zhang-type lattice Hamiltonian

$$
H(\mathbf k)
=A\sin k_x\,\sigma_x
-\lambda\sin k_y\,\sigma_y
+(m+\cos k_x+\cos k_y)\sigma_z.
$$

Momenta and the lattice spacing are dimensionless, and the coefficient of each cosine is the
energy unit. The minus sign in $d_y$ fixes the orientation used throughout this page. Away from a
gap closing, the occupied-band Chern number is

$$
C=
\begin{cases}
0, & m<-2,\\
\operatorname{sgn}(A\lambda), & -2<m<0,\\
-\operatorname{sgn}(A\lambda), & 0<m<2,\\
0, & m>2.
\end{cases}
$$

The first visualization colors each point of the square Brillouin zone by the direction of
$\hat{\mathbf d}$. The same color is used for its image on the sphere. This is a visual encoding
of the map, not a color scale for Berry curvature; the local curvature is reported separately.

### Visualization: the Brillouin torus mapped to the sphere

<iframe src="app/index.html?panel=map&amp;lang=en" title="Brillouin torus mapped to the Bloch sphere for a two-band Chern insulator" data-auto-height scrolling="no" style="display: block; width: 100%; height: 880px; min-height: 680px; border: 0; overflow: hidden;" loading="eager"></iframe>

Move the pointer through the Brillouin zone and compare the selected point with the arrow on the
sphere. Then try $m=-2.6$, $-1$, $+1$, and $+2.6$. In the two topological intervals the point
cloud reaches the whole sphere; in the trivial intervals it does not carry a nonzero oriented
covering. Changing the sign of $\lambda$ reverses the orientation and hence the nonzero Chern
number without changing the energy spectrum.

At a critical parameter, $\mathbf d=0$ at one or more momenta. The unit vector and occupied-band
projector are then undefined there. The apparent hole or singular point in the sphere map is a
physical warning that the isolated-band topology is no longer defined.

## Why an integer can change only when the gap closes

As long as $\mathbf d(\mathbf k)$ stays nonzero, changing a Hamiltonian parameter merely deforms
the map $T^2\to S^2$ continuously. The degree of a continuous map cannot change continuously: an
integer cannot drift from $+1$ to $0$. A transition therefore requires

$$
\Delta=2\min_{\mathbf k}|\mathbf d(\mathbf k)|=0.
$$

For this model, $d_x=d_y=0$ at the four time-reversal-invariant momenta. Their mass terms are

$$
d_z(\Gamma)=m+2,
\qquad
d_z(X)=d_z(Y)=m,
\qquad
d_z(M)=m-2.
$$

Consequently the gap closes at $m=-2$ at $\Gamma=(0,0)$, at $m=0$ simultaneously at
$X=(\pi,0)$ and $Y=(0,\pi)$, and at $m=2$ at $M=(\pi,\pi)$. The double closing at $m=0$ is
essential: the Chern number changes from $+1$ to $-1$ when $A\lambda>0$, a jump of $-2$.

Near each closing point $\mathbf K_i$, the Hamiltonian becomes a massive Dirac Hamiltonian,

$$
H_i(\mathbf K_i+\mathbf q)
\simeq v_{x,i}q_x\sigma_x+v_{y,i}q_y\sigma_y+M_i\sigma_z.
$$

Each Dirac cone changes its half-integer continuum contribution when its mass changes sign. The
lattice supplies all cones together, so their sum is an integer. With
$s=\operatorname{sgn}(A\lambda)$, their combined result is

$$
C=\frac{s}{2}
\left[\operatorname{sgn}(m+2)-2\operatorname{sgn}(m)+\operatorname{sgn}(m-2)\right],
\qquad m\ne-2,0,2.
$$

### Visualization: band closing and phase sequence

<iframe src="app/index.html?panel=transition&amp;lang=en" title="QWZ band closings and occupied-band Chern-number transitions" data-auto-height scrolling="no" style="display: block; width: 100%; height: 770px; min-height: 620px; border: 0; overflow: hidden;" loading="eager"></iframe>

Drag $m$ slowly through each critical value, or use the phase and closing presets. At $m=0$,
look for two contacts on the displayed path, at X and Y. The plotted path alone is not a proof of
a two-dimensional bulk gap; the gap readout scans the full Brillouin zone and treats the analytic
critical points exactly. Notice also that the energies vary continuously while $C$ remains fixed
on every open interval between closings.

## A one-dimensional analogue: SSH winding

Before discussing boundaries, it helps to reduce the topology by one dimension. The
Su–Schrieffer–Heeger model has two sites $A,B$ in each unit cell, intracell hopping $t_1$, and
intercell hopping $t_2$. In the basis $(A,B)$,

$$
H_{\mathrm{SSH}}(k)
=\begin{pmatrix}
0&t_1+t_2e^{-ik}\\
t_1+t_2e^{ik}&0
\end{pmatrix}
=d_x(k)\sigma_x+d_y(k)\sigma_y,
$$

with $d_x=t_1+t_2\cos k$ and $d_y=t_2\sin k$. Because there is no $\sigma_z$ term,

$$
\{\sigma_z,H_{\mathrm{SSH}}(k)\}=0.
$$

This chiral symmetry forces the spectrum into $\pm E$ pairs. Defining
$q(k)=d_x+i d_y=t_1+t_2e^{ik}$, the bulk invariant is the winding of $q(k)$ about the origin,

$$
\nu=\frac{1}{2\pi i}\int_{-\pi}^{\pi}q^{-1}(k)\,\partial_kq(k)\,dk
=\frac{1}{2\pi}\int_{-\pi}^{\pi}\partial_k\arg q(k)\,dk.
$$

For real positive hoppings, $q(k)$ traces a circle of radius $t_2$ centered at $(t_1,0)$. It
encloses the origin when $t_1<t_2$, giving $\nu=1$, and misses it when $t_1>t_2$, giving
$\nu=0$. At $t_1=t_2$, the circle passes through the origin at $k=\pi$ and the band gap

$$
\Delta_{\mathrm{SSH}}=2|t_1-t_2|
$$

closes. In a compatible gauge, the occupied-band Zak phase satisfies
$\gamma=\pi\nu\pmod{2\pi}$.

### Visualization: band dispersion and winding circle

<iframe src="app/index.html?panel=winding&amp;lang=en" title="SSH band dispersion and winding of the Bloch Hamiltonian" data-auto-height scrolling="no" style="display: block; width: 100%; height: 800px; min-height: 640px; border: 0; overflow: hidden;" loading="eager"></iframe>

Set $t_1/t_2$ below, at, and above one. On the left, the bands meet only at the critical ratio.
On the right, the same event is the closed curve crossing the origin. Moving along $k$ on the
band plot identifies the corresponding point on the winding circle, making explicit that these
are two readings of one Bloch Hamiltonian.

## Bulk–edge correspondence in an open SSH chain

Now cut the one-dimensional crystal after an integer number of the unit cells used above. The
open-chain Hamiltonian is

$$
H_{\mathrm{open}}
=\sum_{n=1}^{N}t_1|n,A\rangle\langle n,B|
+\sum_{n=1}^{N-1}t_2|n+1,A\rangle\langle n,B|
+\mathrm{h.c.}
$$

In the topological regime $|t_1/t_2|<1$, the semi-infinite chain has a left-edge zero mode on
the $A$ sublattice and a right-edge zero mode on the $B$ sublattice. Their amplitudes decay as

$$
\psi_L(n,A)\propto\left(-\frac{t_1}{t_2}\right)^{n-1},
\qquad
\psi_R(n,B)\propto\left(-\frac{t_1}{t_2}\right)^{N-n},
\qquad
\xi^{-1}=\ln\left|\frac{t_2}{t_1}\right|.
$$

The localization length $\xi$ diverges on approaching the bulk transition. In a finite chain the
two exponentially decaying tails overlap, so the nominal zero modes hybridize into a chiral pair
at $\pm\varepsilon$. Their splitting scales exponentially with length rather than vanishing
exactly, except in the cut-dimer limit $t_1=0$ or as $N\to\infty$.

### Visualization: spectral flow and the two central states

<iframe src="app/index.html?panel=edge&amp;lang=en" title="Finite SSH chain spectral flow and edge-state probability profile" data-auto-height scrolling="no" style="display: block; width: 100%; height: 760px; min-height: 620px; border: 0; overflow: hidden;" loading="eager"></iframe>

Start at $t_1/t_2=0$. The two central levels are exactly at zero and their probability is entirely
on the end sites. Increase the ratio toward one: the two levels split, the edge weight decreases,
and the profile penetrates farther into the chain. Above one, the central levels merge into the
bulk spectrum. The profile averages the probability densities of the two central eigenstates;
this displays both ends symmetrically even when the finite-chain eigenvectors are symmetric and
antisymmetric combinations of left- and right-localized states.

## What these views establish—and what they do not

- The QWZ map shows how a two-dimensional occupied-band projector acquires a nonzero Chern
  number. The high-symmetry band plot shows the known closings of this model, but a generic model
  can close its gap away from high-symmetry lines.

- The SSH winding and edge panels demonstrate bulk–edge correspondence in a separate
  one-dimensional chiral model. They clarify the mechanism of a bulk invariant predicting
  boundary states, but they do not display the chiral dispersing edge band of a two-dimensional
  Chern insulator.

- SSH winding depends on the declared unit cell, and the visible edge modes depend on cutting the
  matching weak bond. Shifting the unit cell also shifts the termination, leaving physical
  predictions consistent.

- The calculations are clean, noninteracting, half-filled lattice models. Disorder, interactions,
  finite temperature, leads, and dynamical transport are absent. The Hall-response equation
  assumes an isolated filled band and an adiabatic linear-response regime.

## Suggested explorations

1. In the sphere map, keep $m=-1$ and reverse $\lambda$. Confirm that the energy gap is unchanged
   while $C$ changes sign.

2. In the transition panel, compare the single closing at $m=-2$ with the two simultaneous
   closings at $m=0$. Relate the number and orientation of the cones to the jumps in $C$.

3. In the SSH winding panel, approach $t_1/t_2=1$ from both sides and track the minimum band gap
   and the distance from the winding circle to the origin.

4. In the finite chain, compare $t_1/t_2=0.45$, $0.9$, and $1.45$. Relate the changing real-space
   localization to $\xi^{-1}=\ln|t_2/t_1|$ and to the spectral flow.

## References

- D. J. Thouless, M. Kohmoto, M. P. Nightingale, and M. den Nijs, “Quantized Hall Conductance in
  a Two-Dimensional Periodic Potential,” *Physical Review Letters* **49**, 405 (1982),
  [doi:10.1103/PhysRevLett.49.405](https://doi.org/10.1103/PhysRevLett.49.405).
- X.-L. Qi, Y.-S. Wu, and S.-C. Zhang, “Topological Quantization of the Spin Hall Effect in
  Two-Dimensional Paramagnetic Semiconductors,” *Physical Review B* **74**, 085308 (2006),
  [doi:10.1103/PhysRevB.74.085308](https://doi.org/10.1103/PhysRevB.74.085308).
- W. P. Su, J. R. Schrieffer, and A. J. Heeger, “Solitons in Polyacetylene,” *Physical Review
  Letters* **42**, 1698 (1979),
  [doi:10.1103/PhysRevLett.42.1698](https://doi.org/10.1103/PhysRevLett.42.1698).
