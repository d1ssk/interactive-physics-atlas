# Chern Insulators and Bulk–Edge Correspondence

<div class="center-material-tables"></div>

When the Fermi level of an insulator lies inside a band gap, there are no low-energy bulk
excitations. Even so, not all insulators are equivalent.

In the integer quantum Hall effect and in Chern insulators, the occupied bands have a global
structure characterized by an integer: the **Chern number**. Two insulators with different Chern
numbers cannot be continuously connected while keeping the band gap open. When regions with
different Chern numbers meet, states that cross the gap appear at their boundary.

This integer cannot be read directly from individual energy eigenvalues. We must instead ask how
the “orientation” of the occupied states is connected globally as momentum traverses its entire
periodic domain.

Using a two-band Chern insulator, this article explains in order

1. how the Brillouin zone maps to the Bloch sphere,
2. how that map produces the integer Chern number,
3. why the bulk gap must close when the Chern number changes, and
4. how bulk topology is reflected in boundary states.

For the last point we first use the one-dimensional SSH model to observe the correspondence
between winding and end states directly. The SSH model is not the edge Hamiltonian of the
two-dimensional Chern insulator; it is the simplest setting in which to see how a global bulk
property reappears at a boundary.

## Viewing a two-band Hamiltonian as a point on a sphere

At each crystal momentum \(\mathbf k\), a two-band Bloch Hamiltonian is a \(2\times2\) Hermitian
matrix. Every such matrix can be expanded in the identity and the three Pauli matrices:

$$
H(\mathbf k)
=
d_0(\mathbf k)\,\mathbf 1
+
d_x(\mathbf k)\sigma_x
+
d_y(\mathbf k)\sigma_y
+
d_z(\mathbf k)\sigma_z
$$

All four coefficients are real. The term proportional to the identity shifts both eigenvalues by
the same amount, without changing either the eigenstates or the interband gap. Because the Chern
number is determined by the eigenstate structure, we remove that common energy shift and write

$$
H(\mathbf k)
=
\sum_{a=x,y,z}
d_a(\mathbf k)\sigma_a
$$

The two energy bands are then

$$
E_\pm(\mathbf k)
=
\pm|\mathbf d(\mathbf k)|
$$

Thus the Hamiltonian at each \(\mathbf k\) is characterized by a vector in three-dimensional
space,

$$
\mathbf d(\mathbf k)
=
\bigl(
d_x(\mathbf k),
d_y(\mathbf k),
d_z(\mathbf k)
\bigr)
$$

Its length fixes the energy separation, while its **direction** fixes the eigenstates. The
essential object for band topology is therefore the unit vector

$$
\hat{\mathbf d}(\mathbf k)
=
\frac{\mathbf d(\mathbf k)}
{|\mathbf d(\mathbf k)|}
$$

As long as \(|\mathbf d(\mathbf k)|\neq0\), the bands do not touch and the lower-band projector is

$$
P_-(\mathbf k)
=
\frac{
1-\sum_{a=x,y,z}\hat d_a(\mathbf k)\sigma_a
}{2}
$$

The unit vector specifies a point on the sphere \(S^2\). Each crystal momentum can therefore be
associated with one point on the Bloch sphere.

In two dimensions both \(k_x\) and \(k_y\) are periodic. A Brillouin zone is often drawn as a
square, but its opposite edges represent the same points, so its topology is a torus

$$
T^2
$$

A gapped two-band system consequently defines the map

$$
\hat{\mathbf d}:T^2\longrightarrow S^2
$$

As \(\mathbf k\) ranges over the Brillouin zone, \(\hat{\mathbf d}(\mathbf k)\) traces an image on
the Bloch sphere. If the image only visits part of the sphere and retraces itself, the map can be
smoothly contracted. If it covers the whole sphere once or several times with a consistent
orientation, that wrapping cannot be removed by a small deformation. The Chern number counts
this difference as a topologically invariant integer.

The topology does not belong to one particular eigenvector \(|u_-(\mathbf k)\rangle\). A quantum
state is physically unchanged by

$$
|u_-(\mathbf k)\rangle
\rightarrow
e^{i\chi(\mathbf k)}
|u_-(\mathbf k)\rangle
$$

What has physical meaning is the state with its arbitrary phase removed—the ray—represented by
the projector

$$
P_-(\mathbf k)
=
|u_-(\mathbf k)\rangle
\langle u_-(\mathbf k)|
$$

For a two-band system this projector is in one-to-one correspondence with
\(\hat{\mathbf d}(\mathbf k)\). Looking at the Bloch-sphere map is therefore equivalent to looking
at how occupied-state rays fit together across the Brillouin zone.

When the Chern number is nonzero, this family of rays has a global twist. An eigenvector can be
chosen smoothly near any one momentum, but that choice cannot be extended over the whole
Brillouin torus while remaining both smooth and periodic. The projector itself remains smooth;
the obstruction appears only when we try to represent it globally by one phase convention. The
resulting unavoidable phase seam is what the integrated Berry curvature detects.

## Berry curvature measures area on the Bloch sphere

Choose a local occupied-band eigenstate \(|u_-(\mathbf k)\rangle\) and define the Berry connection
by

$$
\mathcal A_i(\mathbf k)
=
-i
\langle
u_-(\mathbf k)
|
\partial_{k_i}
u_-(\mathbf k)
\rangle
$$

The Berry curvature is

$$
\Omega_-(\mathbf k)
=
\partial_{k_x}\mathcal A_y
-
\partial_{k_y}\mathcal A_x
$$

Under the momentum-dependent phase change

$$
|u_-(\mathbf k)\rangle
\rightarrow
e^{i\chi(\mathbf k)}
|u_-(\mathbf k)\rangle
$$

the connection changes but the curvature does not. Thus \(\Omega_-\) is independent of the
eigenvector phase choice.

For a two-band Hamiltonian the curvature can be written directly, without eigenvectors:

$$
\Omega_-(\mathbf k)
=
-\frac12
\hat{\mathbf d}\cdot
\left(
\partial_{k_x}\hat{\mathbf d}
\times
\partial_{k_y}\hat{\mathbf d}
\right)
$$

The scalar triple product

$$
\hat{\mathbf d}\cdot
\left(
\partial_{k_x}\hat{\mathbf d}
\times
\partial_{k_y}\hat{\mathbf d}
\right)
$$

measures the **oriented area** on the Bloch sphere to which a small area element of the Brillouin
zone is mapped. Integrating the Berry curvature over the whole Brillouin zone gives

$$
C
=
\frac{1}{2\pi}
\int_{\mathrm{BZ}}
\Omega_-(\mathbf k)\,d^2k
$$

or equivalently

$$
C
=
-\frac{1}{4\pi}
\int_{\mathrm{BZ}}
\hat{\mathbf d}\cdot
\left(
\partial_{k_x}\hat{\mathbf d}
\times
\partial_{k_y}\hat{\mathbf d}
\right)
d^2k
\in\mathbb Z
$$

This is the first Chern number. Covering the sphere once gives \(|C|=1\); reversing the
orientation reverses its sign. Regions covered in opposite directions cancel as oriented area.
The result is integer-valued because it is the degree of the map \(T^2\to S^2\).

## The Chern number becomes the Hall conductivity

The Chern number is not only a geometric label. It appears directly in the transverse electrical
conductivity.

Apply a weak uniform electric field \(\mathbf E\) to a two-dimensional crystal. The electron
crystal momentum obeys

$$
\hbar\dot{\mathbf k}
=
-e\mathbf E
$$

where the electron charge is \(-e\). From the dispersion alone, the wave-packet velocity would be
the group velocity

$$
\mathbf v_{\mathrm{g}}
=
\frac{1}{\hbar}
\nabla_{\mathbf k}E_-(\mathbf k)
$$

Because the Bloch eigenstate itself varies with \(\mathbf k\), Berry curvature adds another
velocity. With the curvature convention used here,

$$
\dot{\mathbf r}
=
\frac{1}{\hbar}
\nabla_{\mathbf k}E_-(\mathbf k)
+
\frac{e}{\hbar}
\mathbf Ω_-(\mathbf k)\times\mathbf E
$$

This is the semiclassical wave-packet velocity.[^berry-curvature-real-space]

[^berry-curvature-real-space]:
    ### Why does Berry curvature appear in real-space velocity?

    Berry curvature is a momentum-space quantity, but its effect appears in the real-space motion
    of a wave packet.

    Consider a Bloch electron not as an eigenstate at a single $\mathbf k$, but as a wave packet
    formed by superposing nearby states. Where the wave packet is concentrated in real space is
    determined by the relative phases between its different $\mathbf k$ components.

    A Bloch state can be written as

    $$
    |\psi_{\mathbf k}\rangle
    =
    e^{i\mathbf k\cdot\mathbf r}
    |u_{\mathbf k}\rangle
    $$

    so the relative phase receives a contribution not only from the plane-wave part, but also from
    how the internal state $|u_{\mathbf k}\rangle$ varies with $\mathbf k$. The Berry connection
    describes this geometric contribution.

    Under an electric field,

    $$
    \hbar\dot{\mathbf k}=-e\mathbf E
    $$

    the center of the wave packet moves through momentum space. As $|u_{\mathbf k}\rangle$ changes,
    the relative phases between the $\mathbf k$ components forming the wave packet change as well.

    When this effect is incorporated into the equation of motion for the wave-packet center, the
    term arising from the Berry connection appears through its curl—that is, through the Berry
    curvature—and produces the transverse velocity

    $$
    \dot{\mathbf r}_{\mathrm{anom}}
    =
    \frac{e}{\hbar}
    \mathbf Ω_-(\mathbf k)\times\mathbf E
    $$

    This is why Berry curvature is often compared to a "magnetic field in momentum space." It is
    not a real-space Lorentz force, but rather **a geometric transverse shift of the wave-packet
    center arising from changes in the internal structure of the Bloch states across momentum
    space**.


$$
\mathbf Ω_-
=
\Omega_-(\mathbf k)\,\hat{\mathbf z}
$$

For a field

$$
\mathbf E=E_x\hat{\mathbf x}
$$

the Berry-curvature contribution is the transverse anomalous velocity

$$
v_y^{\mathrm{anom}}
=
\frac{eE_x}{\hbar}
\Omega_-(\mathbf k)
$$

Each Bloch state can therefore move across the applied field by an amount proportional to its
local Berry curvature.

### Summing the entire occupied band

In an insulator, every momentum state in a band below the Fermi level is occupied. The current
density per unit area is

$$
\mathbf j
=
-e
\int_{\mathrm{BZ}}
\frac{d^2k}{(2\pi)^2}
\,
\dot{\mathbf r}(\mathbf k)
$$

The group-velocity part vanishes:

$$
\int_{\mathrm{BZ}}
\frac{d^2k}{(2\pi)^2}
\nabla_{\mathbf k}E_-(\mathbf k)
=
0
$$

because \(E_-(\mathbf k)\) is periodic on the Brillouin zone. Contributions from different
momenta cancel in a completely filled band. What remains is the transverse anomalous velocity.
For an electric field along \(x\),

$$
j_y
=
-e
\int_{\mathrm{BZ}}
\frac{d^2k}{(2\pi)^2}
\,
\frac{eE_x}{\hbar}
\Omega_-(\mathbf k)
$$

and hence

$$
\frac{j_y}{E_x}
=
-\frac{e^2}{\hbar}
\int_{\mathrm{BZ}}
\frac{d^2k}{(2\pi)^2}
\Omega_-(\mathbf k).
$$

Using

$$
C
=
\frac{1}{2\pi}
\int_{\mathrm{BZ}}
\Omega_-(\mathbf k)\,d^2k
$$

gives

$$
\frac{j_y}{E_x}
=
-C\frac{e^2}{h}
$$

Summing a position-dependent Berry curvature over the entire Brillouin zone leaves only the
integer \(C\).

### Why the conductivity is quantized

Write the conductivity tensor as

$$
j_i
=
\sum_j\sigma_{ij}E_j
$$

and define the Hall conductivity through

$$
j_x=\sigma_{xy}E_y
$$

Using

$$
\sigma_{yx}=-\sigma_{xy}
$$

we obtain

$$
\sigma_{xy}
=
C\frac{e^2}{h}
$$

The conductivity is fixed not by a continuously variable microscopic parameter but by

$$
C\in\mathbb Z
$$

Changing hopping strengths or mass parameters may redistribute the local curvature

$$
\Omega_-(\mathbf k)
$$

over the Brillouin zone. But while the bulk gap stays open,

$$
\int_{\mathrm{BZ}}\Omega_-\,d^2k
=
2\pi C
$$

cannot change, and therefore neither can

$$
\sigma_{xy}
=
C\frac{e^2}{h}
$$

Quantum Hall quantization is fixed by the **global structure of the occupied states over the
whole Brillouin zone**, not by the local value of the Berry curvature. Within one gapped
topological phase, continuous changes of the Hamiltonian leave the quantized response unchanged.
To change

$$
C
$$

to another integer, the band gap must close at some crystal momentum. This leads directly to the
next question: why is a gap closing unavoidable at a topological transition?

## Concrete example: a Qi–Wu–Zhang-type Chern insulator

The two-dimensional panels below use the lattice Hamiltonian

$$
H(\mathbf k)
=
A\sin k_x\,\sigma_x
-\lambda\sin k_y\,\sigma_y
+
(m+\cos k_x+\cos k_y)\sigma_z
$$

of Qi–Wu–Zhang type. Momentum and lattice spacing are dimensionless, and the coefficient of the
cosine terms sets the energy unit. The minus sign in \(d_y\) fixes the Chern-number orientation
used throughout this article. The model has

$$
\mathbf d(\mathbf k)
=
\left(
A\sin k_x,\,
-\lambda\sin k_y,\,
m+\cos k_x+\cos k_y
\right).
$$

Changing \(m\) shifts the \(d_z\) component and changes how the image of the Brillouin torus
covers the Bloch sphere. Away from a gap closing, the occupied-band Chern number is

$$
C=
\begin{cases}
0,
& m<-2,
\\[4pt]
\operatorname{sgn}(A\lambda),
& -2<m<0,
\\[4pt]
-\operatorname{sgn}(A\lambda),
& 0<m<2,
\\[4pt]
0,
& m>2.
\end{cases}
$$

For \(A\lambda>0\), for example, the phases follow

$$
0
\;\longrightarrow\;
+1
\;\longrightarrow\;
-1
\;\longrightarrow\;
0
$$

### Visualization: from the Brillouin torus to the Bloch sphere

<iframe src="app/index.html?panel=map&amp;lang=en" title="Map from the Brillouin torus to the Bloch sphere in a two-band Chern insulator" data-auto-height scrolling="no" style="display: block; width: 100%; height: 1120px; min-height: 820px; border: 0; overflow: hidden;" loading="eager"></iframe>

Move the pointer over the square Brillouin zone. The marker on the three-dimensional torus is the
same momentum after opposite edges of the square have been identified, and both carry the color
of the corresponding direction \(\hat{\mathbf d}(\mathbf k)\). The marker on the Bloch sphere then
shows the image of that momentum. Drag either three-dimensional view to inspect it from another
direction.

Compare

$$
m=-2.5,\quad -1,\quad +1,\quad +2.5
$$

At \(m=-1\) and \(m=+1\), the image covers the entire Bloch sphere and has nonzero oriented
degree. At \(m=\pm2.5\), the map can be continuously contracted to a point and \(C=0\). The shared
colors on the square, torus, and sphere associate equal \(\hat{\mathbf d}\) directions; they do
not encode the Berry curvature itself.

Now reverse the sign of \(\lambda\). Because the energies depend only on

$$
E_\pm=\pm|\mathbf d|
$$

the spectrum is unchanged by \(\lambda\to-\lambda\). The orientation with which the Bloch sphere
is swept reverses, however, and therefore

$$
C\rightarrow-C
$$

Two Hamiltonians can thus have identical energy spectra but different topology.

## The instant at which the Chern number changes

The Chern number is an integer. Under a gradual change of the Hamiltonian, it cannot vary as

$$
C=1.0,\;0.9,\;0.8,\ldots
$$

As long as \(|\mathbf d(\mathbf k)|\) is nonzero at every momentum,

$$
\hat{\mathbf d}
=
\frac{\mathbf d}{|\mathbf d|}
$$

remains defined and the map \(T^2\to S^2\) is merely deformed continuously. Its degree cannot
change. Moving between distinct Chern phases therefore requires

$$
\mathbf d(\mathbf k)=0
$$

somewhere in the Brillouin zone. This is precisely a band touching. The bulk gap

$$
\Delta
=
2\min_{\mathbf k}
|\mathbf d(\mathbf k)|
$$

must satisfy

$$
\Delta=0
$$

at the transition.

In this model the gap can close at the high-symmetry points where \(d_x=d_y=0\):

$$
\Gamma=(0,0),\qquad
X=(\pi,0),\qquad
Y=(0,\pi),\qquad
M=(\pi,\pi)
$$

The corresponding \(d_z\) values are

$$
d_z(\Gamma)=m+2,
$$

$$
d_z(X)=d_z(Y)=m,
$$

$$
d_z(M)=m-2
$$

Thus the bands touch at \(\Gamma\) for \(m=-2\), at both \(X\) and \(Y\) for \(m=0\), and at \(M\)
for \(m=2\). The simultaneous pair at \(m=0\) is essential: when \(A\lambda>0\),

$$
C:+1\longrightarrow-1
$$

so the jump is \(-2\).

### Reading the change of Chern number from Dirac cones

Near a closing point \(\mathbf K_i\), write

$$
\mathbf k=\mathbf K_i+\mathbf q
$$

and expand at small \(\mathbf q\). The lattice Hamiltonian reduces to a two-dimensional massive
Dirac Hamiltonian,

$$
H_i(\mathbf q)
\simeq
v_{x,i}q_x\sigma_x
+
v_{y,i}q_y\sigma_y
+
M_i\sigma_z
$$

where \(M_i\) is the Dirac mass. At \(\mathbf q=0\),

$$
E_\pm(0)=\pm|M_i|
$$

so the local gap is

$$
2|M_i|
$$

At the transition,

$$
M_i=0
$$

and the cone becomes massless. Passing through the transition reverses the sign of the mass,

$$
M_i>0
\quad\longrightarrow\quad
M_i<0
$$

and also reverses the Berry-curvature contribution concentrated near that cone.

#### Contribution of one massive Dirac cone

For

$$
H(\mathbf q)
=
v_xq_x\sigma_x
+
v_yq_y\sigma_y
+
M\sigma_z
$$

the occupied-band curvature is

$$
\Omega_-(\mathbf q)
=
-\frac12
\frac{
M v_xv_y
}{
\left(
v_x^2q_x^2+v_y^2q_y^2+M^2
\right)^{3/2}
}
$$

It is concentrated near \(\mathbf q=0\), and its sign is controlled by

$$
Mv_xv_y
$$

Integrating this continuum model over the momentum plane gives

$$
\frac{1}{2\pi}
\int_{\mathbb R^2}
\Omega_-(\mathbf q)\,d^2q
=
-\frac12
\operatorname{sgn}(v_xv_yM)
$$

The factor \(1/2\) should not be interpreted as a standalone half-integer lattice Chern number:
the continuum Dirac model does not include the complete compact Brillouin zone. What matters is
that reversing the mass changes this contribution by an integer. If \(v_xv_y>0\), then

$$
M>0:
\qquad
-\frac12,
$$

whereas

$$
M<0:
\qquad
+\frac12
$$

and therefore

$$
\Delta C=+1
$$

For \(v_xv_y<0\), the direction of the change is reversed. To determine a transition, we need to
know both the direction in which \(M_i\) changes sign and the sign of \(v_{x,i}v_{y,i}\).

#### Contributions from the four QWZ Dirac points

For the Hamiltonian

$$
H(\mathbf k)
=
A\sin k_x\,\sigma_x
-\lambda\sin k_y\,\sigma_y
+
(m+\cos k_x+\cos k_y)\sigma_z
$$

the four possible closing points are

$$
\Gamma=(0,0),\qquad
X=(\pi,0),\qquad
Y=(0,\pi),\qquad
M=(\pi,\pi)
$$

Their Dirac masses are

$$
M_\Gamma=m+2,
\qquad
M_X=M_Y=m,
\qquad
M_M=m-2.
$$

The velocity signs also differ from point to point. With
\(s=\operatorname{sgn}(A\lambda)\), the contributions are

| Point | \(M_i\) | \(\operatorname{sgn}(v_{x,i}v_{y,i})\) | Dirac-cone contribution |
| --- | --- | --- | --- |
| \(\Gamma\) | \(m+2\) | \(-s\) | \(+\dfrac{s}{2}\operatorname{sgn}(m+2)\) |
| \(X\) | \(m\) | \(+s\) | \(-\dfrac{s}{2}\operatorname{sgn}(m)\) |
| \(Y\) | \(m\) | \(+s\) | \(-\dfrac{s}{2}\operatorname{sgn}(m)\) |
| \(M\) | \(m-2\) | \(-s\) | \(+\dfrac{s}{2}\operatorname{sgn}(m-2)\) |

Summing the four terms gives

$$
C
=
\frac{s}{2}
\left[
\operatorname{sgn}(m+2)
-
2\operatorname{sgn}(m)
+
\operatorname{sgn}(m-2)
\right],
\qquad
m\neq-2,0,2
$$

Each term has a direct origin:

$$
\operatorname{sgn}(m+2)
$$

comes from \(\Gamma\),

$$
-2\operatorname{sgn}(m)
$$

comes from \(X\) and \(Y\), and

$$
\operatorname{sgn}(m-2)
$$

comes from \(M\). At \(m=0\), **two Dirac masses reverse sign simultaneously**, so the Chern
number changes by two. For \(A\lambda>0\), or \(s=1\),

$$
m< -2:
\qquad C=0,
$$

$$
-2<m<0:
\qquad C=+1,
$$

$$
0<m<2:
\qquad C=-1,
$$

$$
m>2:
\qquad C=0.
$$

As \(m\) increases, the sequence is

$$
0
\overset{\Gamma}{\longrightarrow}
+1
\overset{X,Y}{\longrightarrow}
-1
\overset{M}{\longrightarrow}
0
$$

At \(m=-2\) and \(m=2\), one cone reverses its mass and \(C\) changes by one. At \(m=0\), two
cones reverse at once and \(C\) changes by two. The phase diagram is therefore a sum of local
mass inversions at the Dirac points of the Brillouin zone, not merely a formula to memorize.

### Visualization: gap closings and Chern phases

<iframe src="app/index.html?panel=transition&amp;lang=en" title="QWZ energy surfaces, band-gap closings, and occupied-band Chern transitions" data-auto-height scrolling="no" style="display: block; width: 100%; height: 880px; min-height: 700px; border: 0; overflow: hidden;" loading="eager"></iframe>

Move \(m\) through \(-2\), \(0\), and \(2\). The two energy eigenvalues change continuously, while
the Chern number remains constant on each gapped interval and jumps only when the bands touch.
The gap-closing points are where the upper and lower energy surfaces meet.

At \(m=0\), inspect the two simultaneous contacts at \(X\) and \(Y\). Drag the surface panel to
view the full Brillouin zone and compare them with the single contacts at \(\Gamma\) for \(m=-2\)
and at \(M\) for \(m=2\).

## The bulk integer appears at a boundary

So far we have considered only the bulk of an infinite crystal with periodic boundary conditions.
What happens when a crystal with nonzero Chern number is cut?

Consider an insulator of Chern number \(C\) next to vacuum with \(C=0\). Both bulks are gapped,
but their Chern numbers differ. If the complete system could connect them smoothly while
remaining gapped everywhere, that integer would somehow have to change without a gap closing.
The gap must therefore be filled near the interface.

In a two-dimensional Chern insulator this role is played by **chiral edge states**. If
\(k_\parallel\) denotes momentum along the boundary, their dispersion crosses the bulk gap and
connects the valence and conduction bands. For

$$
\Delta C=C_{\mathrm{left}}-C_{\mathrm{right}}
$$

the net chirality of the boundary modes is fixed by this difference. At an interface with
vacuum, the net number of chiral branches is \(|C|\).

This is bulk–edge correspondence in a two-dimensional Chern insulator. The mode is not an
accidental detail of the surface: changing a local boundary potential cannot remove its net
chirality unless the bulk gap closes or it annihilates with an oppositely moving mode.

We now turn to a one-dimensional model where the same logic can be seen more directly.

## Bulk–edge correspondence in one dimension: the SSH model

The Su–Schrieffer–Heeger model has two sites \(A,B\) in every unit cell, with alternating
intracell hopping \(t_1\) and intercell hopping \(t_2\). In the basis \((A,B)\),

$$
H_{\mathrm{SSH}}(k)
=
\begin{pmatrix}
0&t_1+t_2e^{-ik}
\\
t_1+t_2e^{ik}&0
\end{pmatrix}
$$

or

$$
H_{\mathrm{SSH}}(k)
=
d_x(k)\sigma_x+d_y(k)\sigma_y
$$

where

$$
d_x=t_1+t_2\cos k,
\qquad
d_y=t_2\sin k.
$$

Because there is no \(\sigma_z\) component, the Hamiltonian has chiral symmetry:

$$
\{
\sigma_z,
H_{\mathrm{SSH}}(k)
\}
=0
$$

Its energy eigenvalues therefore occur symmetrically as

$$
E_\pm(k)=\pm|q(k)|
$$

with

$$
q(k)
=
d_x+i d_y
=
t_1+t_2e^{ik}
$$

As \(k\) traverses the Brillouin zone, \(q(k)\) traces a closed curve in the complex plane. Its
winding about the origin is

$$
\nu
=
\frac{1}{2\pi i}
\int_{-\pi}^{\pi}
q^{-1}(k)\,
\partial_k q(k)\,dk
$$

or equivalently

$$
\nu
=
\frac{1}{2\pi}
\int_{-\pi}^{\pi}
\partial_k\arg q(k)\,dk
$$

This is the winding number. For real positive \(t_1,t_2\), the curve is a circle centered at
\((t_1,0)\) with radius \(t_2\). Hence, if

$$
t_1<t_2
$$

the circle encloses the origin and

$$
\nu=1,
$$

whereas if

$$
t_1>t_2
$$

it does not and

$$
\nu=0
$$

At the phase boundary

$$
t_1=t_2
$$

the circle passes through the origin. Then \(q(\pi)=0\), and the band gap

$$
\Delta_{\mathrm{SSH}}
=
2|t_1-t_2|
$$

closes. This is the same logic as for the Chern insulator: to change an integer winding, the
closed curve must pass through the point at which the Hamiltonian becomes gapless.

The winding is also related to the occupied-band Berry phase. In one dimension, integrating the
Berry connection around the Brillouin zone defines

$$
\gamma
=
\int_{-\pi}^{\pi}
\mathcal A(k)\,dk
\pmod{2\pi}
$$

In the SSH model, chiral symmetry gives

$$
\gamma
=
\pi\nu
\pmod{2\pi}
$$

Thus \(\gamma=0\) when \(\nu=0\), and \(\gamma=\pi\) when \(\nu=1\). The winding of \(q(k)\)
around the origin is also recorded in the geometric phase accumulated by the occupied state.

### Visualization: band dispersion and winding circle

<iframe src="app/index.html?panel=winding&amp;lang=en" title="SSH band dispersion and winding of the Bloch Hamiltonian" data-auto-height scrolling="no" style="display: block; width: 100%; height: 800px; min-height: 640px; border: 0; overflow: hidden;" loading="eager"></iframe>

Try ratios such as

$$
0.6,\qquad 1,\qquad 1.4
$$

On the left, the two bands touch only at \(t_1=t_2\). On the right, the same event is the winding
circle touching the origin. These are not separate phenomena. Since

$$
E_\pm(k)=\pm|q(k)|
$$

the curve passing through the origin and the energy gap closing are exactly the same condition.

## Cutting the crystal turns winding into end states

Remove periodic boundary conditions and consider a finite SSH chain of \(N\) unit cells:

$$
H_{\mathrm{open}}
=
\sum_{n=1}^{N}
t_1
|n,A\rangle
\langle n,B|
+
\sum_{n=1}^{N-1}
t_2
|n+1,A\rangle
\langle n,B|
+
\mathrm{h.c.}
$$

The structure is clearest in the limit

$$
t_1=0
$$

The \(t_2\) bonds pair sites into dimers in the interior, but the \(A\) site at the left end and
the \(B\) site at the right end remain unpaired. They form two exact zero-energy states.

Increasing \(t_1\) slightly does not remove them while \(|t_1/t_2|<1\); instead, their wave
functions penetrate exponentially into the chain. For a semi-infinite chain,

$$
\psi_L(n,A)
\propto
\left(
-\frac{t_1}{t_2}
\right)^{n-1},
$$

$$
\psi_R(n,B)
\propto
\left(
-\frac{t_1}{t_2}
\right)^{N-n}
$$

and the localization length is

$$
\xi^{-1}
=
\ln
\left|
\frac{t_2}{t_1}
\right|
$$

As \(t_1/t_2\to1\),

$$
\xi\to\infty
$$

The edge state spreads into the bulk and becomes indistinguishable from bulk states at the
transition.

In a finite chain, the exponential tails from opposite ends overlap slightly. The two end states
form symmetric and antisymmetric combinations, with a small energy splitting

$$
+\varepsilon,\qquad-\varepsilon
$$

The splitting decreases exponentially with chain length and approaches zero as

$$
N\rightarrow\infty
$$

### Visualization: edge states of the SSH chain

<iframe src="app/index.html?panel=edge&amp;lang=en" title="Finite SSH chain spectral flow and edge-state probability profile" data-auto-height scrolling="no" style="display: block; width: 100%; height: 760px; min-height: 620px; border: 0; overflow: hidden;" loading="eager"></iframe>

Begin at

$$
t_1/t_2=0
$$

The two central levels lie exactly at zero energy and their wave functions are confined to the
end sites. As the ratio increases, the states spread inward and their finite-size splitting
becomes visible. In the limit

$$
t_1/t_2\rightarrow1
$$

the localization length diverges and the edge states merge into the bulk. For

$$
t_1/t_2>1
$$

there are no independent end states for this choice of termination.

The profile shows the probability density averaged over the two central eigenstates. A finite
chain can return symmetric and antisymmetric combinations of states localized at opposite ends;
the average makes localization at both ends directly visible.

## What the Chern number and SSH winding have in common

The invariants of the two-dimensional Chern insulator and the one-dimensional SSH model are
different. In the Chern insulator,

$$
T^2\longrightarrow S^2
$$

and \(C\) counts the degree of the map. In the SSH model, the closed curve \(q(k)\) corresponds to

$$
S^1\longrightarrow S^1
$$

and \(\nu\) counts its winding. Their underlying logic is nevertheless the same:

- A gapped Hamiltonian can be deformed continuously.
- An integer topological invariant cannot change during such a deformation.
- Changing the integer requires a gap closing somewhere.
- Joining regions with distinct topology reveals their difference as boundary states.

This is the central idea of band topology and bulk–edge correspondence.

For the SSH model, the displayed winding depends on the choice of unit cell. Shifting the unit
cell by one site also shifts the termination of the finite chain. Physical predictions for the
end states remain consistent when the bulk convention and boundary condition are compared
consistently.

The Chern number of a two-dimensional Chern insulator does not depend on this kind of unit-cell
choice. At an interface with vacuum, chiral edge modes cross the bulk gap.

## Electrons in a magnetic field and the integer quantum Hall effect

We found that a completely occupied band with Chern number \(C\) produces

$$
\sigma_{xy}
=
C\frac{e^2}{h}
$$

What plays the role of a Chern band in the actual integer quantum Hall effect?

In a typical quantum Hall experiment, a strong perpendicular magnetic field is applied to an
approximately two-dimensional electron system formed, for example, at a semiconductor interface
or in graphene. Classically, the Lorentz force bends electron trajectories into circles.
Quantum mechanically, their orbital energies become discrete **Landau levels**. Ignoring spin
for an electron with parabolic dispersion,

$$
E_n
=
\hbar\omega_c
\left(
n+\frac12
\right),
\qquad
\omega_c=\frac{eB}{m^\ast},
\qquad
n=0,1,2,\ldots
$$

Each Landau level contains a macroscopic number of states. The number per unit area is

$$
\frac{eB}{h}
$$

so for electron density \(n_e\),

$$
\nu
=
\frac{n_e h}{eB}
$$

measures how many Landau levels are filled and is called the filling factor. When \(\nu\) Landau
levels are completely occupied and the Fermi level lies in the gap above them, the Hall
conductivity, up to orientation convention, is

$$
|\sigma_{xy}|
=
\nu\frac{e^2}{h}
$$

This has the same form as the Chern-band result.

### Landau levels also carry Chern numbers

Landau levels and the Bloch bands of the QWZ model look quite different. The QWZ model uses
crystal momentum in an ordinary Brillouin zone, whereas a uniform magnetic field changes how
translation symmetry is represented through the vector potential. The same topology is present,
however.

A completely occupied Landau level carries an appropriately defined Chern number

$$
C=\pm1
$$

whose sign depends on the magnetic-field and Hall-conductivity conventions. If \(\nu\) Landau
levels are occupied, their Chern numbers add:

$$
|C_{\mathrm{tot}}|=\nu
$$

Consequently,

$$
|\sigma_{xy}|
=
\nu\frac{e^2}{h}
$$

The observed integer \(\nu\) therefore counts not merely filled levels, but the sum of the
topological invariants carried by those occupied levels. A lattice Chern insulator such as the
QWZ model realizes this quantum Hall topology without requiring a uniform external magnetic field
or Landau levels.

### Why experiments show plateaus

In an experiment, Hall conductivity remains fixed over a finite range of magnetic field or
electron density, forming a **plateau** at

$$
\sigma_{xy}
=
\nu\frac{e^2}{h}
$$

Disorder plays an essential role in making that plateau broad. In an ideal clean system, Landau
levels are sharp. Real samples contain impurities and potential fluctuations, which broaden each
level into a finite energy interval. States in the tails are often spatially localized around
the disorder potential, while extended states remain near the center of the level.

As the Fermi level moves through localized states, newly occupied electrons remain confined and
do not contribute to transport across the sample. Thus

$$
\sigma_{xy}
=
\nu\frac{e^2}{h}
$$

persists over a finite range. When the Fermi level crosses the extended states near the center of
a Landau level, bulk transport reappears, \(\sigma_{xx}\) becomes finite, and the Hall
conductivity changes toward the next plateau:

$$
\nu\frac{e^2}{h}
\longrightarrow
(\nu+1)\frac{e^2}{h}
$$

Disorder does not create the quantum Hall topology: Chern numbers and quantized Hall
conductivity are defined in a clean system. But localization by disorder is crucial for the
exceptionally stable plateaus of finite width seen experimentally. Something that might appear
likely to spoil ideal quantization instead stabilizes it over a wider parameter range.

### At a boundary, Landau levels become edge channels

In a finite sample, the confining potential rises near the edge. Landau-level energies therefore
bend and cross the Fermi energy, producing chiral quantum Hall edge states.

Even when bulk states near the Fermi level are localized and longitudinal conduction is
suppressed, one-way propagating channels remain at the edge. If \(\nu\) Landau levels are
occupied, there are correspondingly \(\nu\) chiral edge channels. This is precisely

$$
C_{\mathrm{bulk}}
\longleftrightarrow
\text{net number of edge modes}
$$

the bulk–edge correspondence described above. In the integer quantum Hall effect, the four views

$$
\text{Landau levels}
\;\longleftrightarrow\;
\text{Chern number}
\;\longleftrightarrow\;
\text{quantized Hall conductivity}
\;\longleftrightarrow\;
\text{chiral edge channel}
$$

describe different aspects of the same phenomenon.
