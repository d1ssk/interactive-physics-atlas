# Ising Model Phase Transition

## Physical background

The ferromagnetic Ising model is one of the simplest lattice models describing the competition
between an **interaction that tends to align neighboring spins** and **thermal fluctuations that
produce disorder**.

Place a two-valued spin

$$
s_i\in\{-1,+1\}
$$

at every lattice site $i$. With zero external field, the Hamiltonian is

$$
H=-J\sum_{\langle i,j\rangle}s_i s_j
$$

where $\langle i,j\rangle$ denotes a pair of nearest-neighbor lattice sites.

We set

$$
J=k_B=1
$$

and consider a $d$-dimensional hypercubic lattice with periodic boundary conditions.

In the thermodynamic limit, the existence of a phase transition depends strongly on dimension.

* **One dimension**: There is no phase transition at finite temperature $T>0$.
* **Two-dimensional square lattice**: A continuous phase transition occurs at finite temperature,
  with exact critical temperature

    $$
    T_c=\frac{2}{\log(1+\sqrt{2})}
    \simeq 2.269185
    $$

    This is the exact critical temperature.

* **Three-dimensional cubic lattice**: A continuous phase transition occurs at finite temperature,
  with numerically estimated critical temperature

    $$
    T_c\simeq 4.511524
    $$

    This is the numerical estimate.

Because the lattices used in this visualization are finite, thermodynamic quantities do not become
truly singular at $T_c$. Near the critical temperature, however, one can observe characteristic
finite-size effects such as large spatial fluctuations and long relaxation times.

---

## Simulation

### Metropolis dynamics

When the spin at a lattice site $i$ is flipped according to

$$
s_i\rightarrow -s_i
$$

the energy change is

$$
\Delta E
=
2s_i\sum_{j\in\operatorname{nn}(i)}s_j
$$

where $\operatorname{nn}(i)$ denotes the nearest neighbors of $i$.

In random-sequential single-spin-flip Metropolis dynamics, the proposed flip is accepted with
probability

$$
P_{\mathrm{acc}}
=
\min\!\left(1,e^{-\Delta E/T}\right)
$$

This update rule satisfies detailed balance and, after sufficiently long evolution, samples the
Boltzmann distribution

$$
P(\{s_i\})\propto e^{-H/T}
$$

as its stationary distribution.

### Definition of a sweep

Let the number of lattice sites be

$$
N=L^d
$$

Here, **one sweep** is defined as $N$ spin-flip attempts at independently and randomly selected
lattice sites. The same site may be selected more than once during one sweep, while another site
may not be selected at all.

### Displayed observables

The visualization displays the magnetization density and energy density,

$$
m=\frac{1}{N}\sum_i s_i,
\qquad
e=\frac{H}{N}
$$

In a finite system with zero external field, the magnetization can switch between positive and
negative states over a sufficiently long time scale. When examining the magnitude of order, it is
therefore important to consider $|m|$ as well as $m$.

---

## Exact solutions in the thermodynamic limit

For comparison with the simulation, the visualization shows equilibrium thermodynamic quantities
for the one- and two-dimensional Ising models, where exact solutions are known.

### One-dimensional Ising model

For the infinite one-dimensional chain at $T>0$, the free energy, internal energy, and heat
capacity per spin are, respectively,

$$
f(T)
=
-T\log\!\left[2\cosh(1/T)\right],
$$

$$
e(T)
=
-\tanh(1/T),
$$

$$
c(T)
=
\frac{\operatorname{sech}^2(1/T)}{T^2}
$$

The spontaneous magnetization at every finite temperature is

$$
m(T)=0
\qquad (T>0)
$$

Thus, although very large domains can form at low temperature in one dimension, no true
long-range ferromagnetic order exists at finite temperature.

### Two-dimensional Ising model

For the infinite two-dimensional square lattice, define

$$
\beta=\frac{1}{T},
\qquad
\kappa
=
\frac{2\sinh(2\beta)}
{\cosh^2(2\beta)}
$$

The zero-field spontaneous magnetization is

$$
m(T)=
\begin{cases}
\left[1-\sinh^{-4}(2/T)\right]^{1/8},
& T<T_c,\\[6pt]
0,
& T\ge T_c,
\end{cases}
$$

The internal energy per spin is

$$
e(T)
=
-\coth(2\beta)
\left[
1+
\frac{2}{\pi}
\left(
2\tanh^2(2\beta)-1
\right)
K(\kappa)
\right],
$$

where $K(\kappa)$ is the complete elliptic integral of the first kind.

The heat capacity is

$$
c(T)=\frac{de}{dT}
$$

and diverges logarithmically at $T=T_c$ in the thermodynamic limit.

This visualization plots the heat capacity by finite-differencing the exact internal energy
$e(T)$, so the displayed peak is finite. Its height and shape also depend on numerical plotting
conditions such as the temperature step.

### Three-dimensional Ising model

No closed-form exact thermodynamic solution corresponding to those in one and two dimensions is
known for the three-dimensional cubic-lattice Ising model.

The visualization therefore does not show a thermodynamic curve that purports to be exact in three
dimensions.

---

## Visualization

<iframe src="app/index.html?lang=en" title="Ising model simulation in one, two, and three dimensions" data-auto-height scrolling="no" style="display: block; width: 100%; height: 2450px; min-height: 1500px; border: 0; overflow: hidden;" loading="eager"></iframe>

---

## Exploration examples

### 1. Destruction of order as temperature rises

Set $T=1.5$ in 2D and evolve the system until sufficiently large ferromagnetic domains form.

Then raise the temperature to $T=4$ and observe how thermal fluctuations destroy the domain
structure and bring the magnetization toward zero.

### 2. Fluctuations and critical slowing down near the critical point

In 2D or 3D, first select $T=T_c$, followed, for example, by

$$
T=1.01T_c
$$

Near the critical point, domains of many different sizes coexist and large structures change
slowly. Compare this behavior with the shorter correlation length and faster relaxation at a
temperature well away from the critical point.

With local Metropolis updates, the relaxation time grows markedly near the critical point, a
phenomenon known as **critical slowing down**.

### 3. Observe the absence of a finite-temperature transition in one dimension

Switch to 1D and evolve the system for a sufficiently long time at a low positive temperature.

Although very large regions of equal-sign spins form at low temperature, thermally excited domain
walls do not disappear completely at finite temperature. This is consistent with the absence of
true long-range ferromagnetic order in the one-dimensional Ising model at $T>0$.

### 4. Compare a cross-section with global quantities in three dimensions

Switch to 3D and move the displayed $z$ cross-section.

The image represents only one particular two-dimensional cross-section, so its domain structure
varies from slice to slice. In contrast,

$$
m,\qquad e
$$

are always calculated from all $L^3$ spins.

This makes it possible to distinguish the local cross-sectional structure from the thermodynamic
state of the complete system.

### 5. Reproduce a trajectory with pseudorandom numbers

Reproducing the same initial state, random seed, temperature, lattice size, and sequence of
operations produces the same Monte Carlo trajectory through the explicit pseudorandom-number
generator.

The same random seed alone is not sufficient: if operations performed along the way or the order
in which they consume random numbers differ, the subsequent trajectories generally do not match.

---

## Points to observe

### Ordered and disordered phases

In 2D or 3D, large domains of equal-sign spins form sufficiently far below the critical
temperature, and

$$
|m|
$$

becomes large.

Sufficiently far above the critical temperature, thermal fluctuations dominate, and the
magnetization of a sufficiently large equilibrated system fluctuates around zero.

### Critical fluctuations

Near $T_c$, the correlation length grows and fluctuations occur across many length scales rather
than being described by one characteristic domain size.

On a finite lattice, the correlation length cannot exceed the lattice size $L$, so the divergence
of the infinite system is rounded. Even so, large collective fluctuations can be observed clearly
near the critical point.

### Equilibrium thermodynamic quantities and instantaneous states

The thermodynamic curves and the live display represent different kinds of quantities.

Where exact solutions exist, the thermodynamic curves represent **equilibrium ensemble averages
of the infinite system**.

By contrast, the displayed lattice, magnetization $m$, and energy $e$ correspond to **one
microscopic state** occupied at that instant by a finite-size Markov chain.

To estimate an equilibrium thermal average from a Monte Carlo simulation, one must

1. discard the equilibration interval in which the effect of the initial condition remains,
2. evaluate the autocorrelation time of the observable,
3. obtain samples from a sufficiently long trajectory, and
4. estimate the mean and statistical error while accounting for correlations.

An instantaneous value in the live display is therefore not expected to coincide with an exact
thermodynamic curve.

---

## Simulation conventions and limitations

The following conventions are shared by the 1D, 2D, and 3D modes.

* Periodic boundary conditions
* Random-sequential single-spin flips
* Metropolis acceptance rule
* $1$ sweep $=N=L^d$ random flip attempts

To reduce rendering cost and data transfer from the Worker in 3D, the canvas shows only the
selected 2D cross-section rather than the complete lattice. The magnetization and energy are still
calculated from the entire three-dimensional lattice.

The simulation uses local single-spin Metropolis updates rather than a cluster algorithm such as
the Wolff or Swendsen–Wang method.

Consequently, autocorrelation times become long near the critical point, and the simulation is not
expected to generate independent equilibrium configurations efficiently. This behavior itself is
one subject for observing critical slowing down in local dynamics.
